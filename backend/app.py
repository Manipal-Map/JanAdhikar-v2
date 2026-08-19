import io
import json
from fastapi import FastAPI, HTTPException, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, Dict, Any, Optional

from case_manager import case_manager
from classifier import classifier
from outcome_predictor import outcome_engine
from department_resolver import department_resolver
from rti_pdf_generator import generate_rti_pdf
from grievance_resolver import grievance_resolver

app = FastAPI(title="CivicRoute AI API", version="1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r".*", 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
class GeneratePDFRequest(BaseModel):
    title: str
    content: str

class CaseInitResponse(BaseModel):
    case_id: str
    message: str

class ClassifyRequest(BaseModel):
    case_id: str
    problem_text: str
    language: str = "English"

class ChatMessageRequest(BaseModel):
    case_id: str
    message: str

class FormSubmitRequest(BaseModel):
    case_id: str
    form_data: Dict[str, Any]

class RTIPredictRequest(BaseModel):
    case_id: str
    draft_text: Optional[str] = None

class RTIImproveRequest(BaseModel):
    case_id: str

class DepartmentResolveRequest(BaseModel):
    case_id: str
    location: Optional[str] = None

@app.get("/")
def health_check():
    return {"status": "ok", "system": "CivicRoute Backend Active"}

@app.post("/api/case/init", response_model=CaseInitResponse)
def init_case():
    new_case_id = case_manager.create_case()
    return CaseInitResponse(case_id=new_case_id, message="Save this ID safely.")

@app.post("/api/transcribe")
async def transcribe_audio(
    audio_file: UploadFile = File(...),
    language: str = Form("English")
):
    try:
        file_bytes = await audio_file.read()
        client = classifier.client
        if not client:
            raise HTTPException(status_code=503, detail="Groq client not initialized")
            
        # FORCE ENGLISH: Use Whisper's native translation to English
        if language == "English":
            transcription = client.audio.translations.create(
                file=(audio_file.filename, file_bytes),
                model="whisper-large-v3",
                response_format="json"
            )
            text = transcription.text
            
        # FORCE HINGLISH: Transcribe original, then forcefully translate to English-Alphabet Hindi
        else:
            transcription = client.audio.transcriptions.create(
                file=(audio_file.filename, file_bytes),
                model="whisper-large-v3",
                response_format="json"
            )
            raw_text = transcription.text
            
            resp = client.chat.completions.create(
                model="openai/gpt-oss-120b",
                messages=[
                    {"role": "system", "content": "You are a translator. Translate the following text into 'Hinglish' (conversational Hindi written using ONLY the English alphabet). Under NO circumstances should you use Devanagari script. Do not add commentary."},
                    {"role": "user", "content": raw_text}
                ],
                temperature=0.0
            )
            text = resp.choices[0].message.content.strip()

        return {"text": text}
    except Exception as e:
        print(f"Transcription error: {e}")
        raise HTTPException(status_code=500, detail="Failed to transcribe audio.")

@app.post("/api/case/classify")
def classify_problem(payload: ClassifyRequest):
    case = case_manager.get_case(payload.case_id)
    if not case:
        raise HTTPException(status_code=404, detail="Case ID not found.")

    result = classifier.classify(payload.problem_text, payload.language)
    
    case_manager.update_case(payload.case_id, {
        "status": "classified",
        "route": result["route"],
        "sub_category": result["sub_category"],
        "user_problem": payload.problem_text,
        "form_schema": result["form_schema"],
        "language": payload.language
    })

    return {**result, "case_id": payload.case_id}

@app.post("/api/rti/generate")
def generate_rti(payload: FormSubmitRequest):
    case = case_manager.get_case(payload.case_id)
    if not case:
        raise HTTPException(status_code=404, detail="Case ID not found.")

    user_problem = case.get("user_problem", "")
    language = case.get("language", "English")
    draft = outcome_engine.generate_initial_rti(payload.form_data, user_problem, language)

    case_manager.update_case(payload.case_id, {
        "status": "rti_drafted",
        "form_data": payload.form_data,
        "initial_draft": draft
    })
    return {"case_id": payload.case_id, "initial_draft": draft}

@app.post("/api/rti/predict")
def predict_rti(payload: RTIPredictRequest):
    case = case_manager.get_case(payload.case_id)
    if not case:
        raise HTTPException(status_code=404, detail="Case ID not found.")

    draft_text = payload.draft_text or case.get("initial_draft")
    if not draft_text:
        raise HTTPException(status_code=400, detail="No RTI draft found to analyze.")

    language = case.get("language", "English")
    prediction_result = outcome_engine.predict_rti_outcome(draft_text, language)
    case_manager.update_case(payload.case_id, {
        "status": "rti_predicted",
        "prediction_result": prediction_result
    })
    return {"case_id": payload.case_id, **prediction_result}

@app.post("/api/rti/improve")
def improve_rti(payload: RTIImproveRequest):
    case = case_manager.get_case(payload.case_id)
    if not case:
        raise HTTPException(status_code=404, detail="Case ID not found.")

    initial_draft = case.get("initial_draft", "")
    pred = case.get("prediction_result", {})
    risks = pred.get("detected_risks", [])
    suggestions = pred.get("improvement_suggestions", [])
    language = case.get("language", "English")

    improved_result = outcome_engine.generate_improved_rti(initial_draft, risks, suggestions, language)
    case_manager.update_case(payload.case_id, {
        "status": "rti_completed",
        "improved_draft": improved_result.get("improved_draft"),
        "filing_instructions": improved_result.get("filing_instructions")
    })
    return {"case_id": payload.case_id, **improved_result}

@app.post("/api/rti/resolve-department")
def resolve_department(payload: DepartmentResolveRequest):
    case = case_manager.get_case(payload.case_id)
    if not case:
        raise HTTPException(status_code=404, detail="Case ID not found.")

    user_problem = case.get("user_problem", "")
    extracted_facts = {**case.get("form_data", {}), **case.get("extracted_facts", {})}
    location = payload.location or extracted_facts.get("applicant_city") or extracted_facts.get("applicant_state", "")
    language = case.get("language", "English")

    dept_info = department_resolver.resolve("RTI", user_problem, location, extracted_facts, language)
    case_manager.update_case(payload.case_id, {"department_info": dept_info})
    return {"case_id": payload.case_id, **dept_info}

@app.get("/api/rti/pdf/{case_id}")
def download_rti_pdf(case_id: str):
    case = case_manager.get_case(case_id)
    if not case:
        raise HTTPException(status_code=404, detail="Case ID not found.")

    draft_text = case.get("improved_draft") or case.get("initial_draft", "")
    dept_info = case.get("department_info") or {}
    form_data = case.get("form_data", {})
    applicant_details = {
        "name": form_data.get("applicant_name", "[Applicant Name]"),
        "address": form_data.get("applicant_address", ""),
        "contact": form_data.get("applicant_contact", ""),
        "place": form_data.get("applicant_city", ""),
        "date": "",
    }

    pdf_bytes = generate_rti_pdf(applicant_details, dept_info, draft_text)
    return StreamingResponse(
        io.BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={case_id}_RTI.pdf"}
    )

@app.post("/api/grievance/generate")
async def generate_grievance(
    case_id: str = Form(...),
    form_data: str = Form(...),
    user_problem: str = Form(...),
    language: str = Form("English"),
    proof_files: Optional[List[UploadFile]] = File(None)
):
    case = case_manager.get_case(case_id)
    if not case:
        raise HTTPException(status_code=404, detail="Case ID not found.")

    parsed_form_data = json.loads(form_data)
    location = parsed_form_data.get("applicant_city", "")

    files_data = []
    if proof_files:
        for pf in proof_files:
            bytes_data = await pf.read()
            if bytes_data:
                files_data.append({"bytes": bytes_data, "mime_type": pf.content_type})

    pack = grievance_resolver.analyze_proof_and_rights(
        user_problem=user_problem,
        location=location,
        form_data=parsed_form_data,
        files_data=files_data,
        language=language
    )

    case_manager.update_case(case_id, {
        "status": "grievance_completed",
        "form_data": parsed_form_data,
        "grievance_pack": pack
    })

    return {"case_id": case_id, **pack}

@app.post("/api/generate-pdf")
def generate_generic_pdf_endpoint(payload: GeneratePDFRequest):
    # Import the new generic pdf generator
    from rti_pdf_generator import generate_generic_pdf
    
    pdf_bytes = generate_generic_pdf(payload.title, payload.content)
    return StreamingResponse(
        io.BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=Document.pdf"}
    )

@app.get("/api/case/{case_id}")
def get_case_state(case_id: str):
    case_data = case_manager.get_case(case_id)
    if not case_data:
        raise HTTPException(status_code=404, detail="Case ID not found.")
    return {"case_id": case_id, "data": case_data}
