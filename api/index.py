import io
import json
import email
from fastapi import FastAPI, HTTPException, File, UploadFile, Form
from starlette.requests import Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, Dict, Any, Optional

from .case_manager import case_manager
from .classifier import classifier
from .outcome_predictor import outcome_engine
from .department_resolver import department_resolver
from .rti_pdf_generator import generate_rti_pdf, generate_generic_pdf
from .grievance_resolver import grievance_resolver
from .intake_chat import router as intake_router  # AI Intake & KYC router

app = FastAPI(title="CivicRoute AI API", version="2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include the AI Intake chat router for conversational pre-screening & KYC
app.include_router(intake_router)

class GeneratePDFRequest(BaseModel):
    title: Optional[str] = "Document"
    content: Optional[str] = ""

class CaseInitResponse(BaseModel):
    case_id: str
    message: str

class ClassifyRequest(BaseModel):
    case_id: Optional[str] = None
    problem_text: Optional[str] = ""
    language: Optional[str] = "English"

class FormSubmitRequest(BaseModel):
    case_id: Optional[str] = None
    form_data: Optional[Dict[str, Any]] = None

class RTIPredictRequest(BaseModel):
    case_id: Optional[str] = None
    draft_text: Optional[str] = None

class RTIImproveRequest(BaseModel):
    case_id: Optional[str] = None

class DepartmentResolveRequest(BaseModel):
    case_id: Optional[str] = None
    location: Optional[str] = None

class GrievanceGenerateRequest(BaseModel):
    case_id: Optional[str] = None
    form_data: Optional[Any] = None
    user_problem: Optional[str] = ""
    language: Optional[str] = "English"
    files: Optional[List[Dict[str, Any]]] = None

@app.get("/")
def health_check():
    return {
        "status": "ok", 
        "system": "CivicRoute Backend Active",
        "database_connected": getattr(case_manager, "is_connected", True)
    }

@app.post("/api/case/init", response_model=CaseInitResponse)
def init_case():
    new_case_id = case_manager.create_case()
    return CaseInitResponse(case_id=new_case_id, message="Save this ID safely.")

async def parse_request_data(request: Request):
    content_type = request.headers.get("content-type", "")
    body_bytes = await request.body()
    
    if "application/json" in content_type:
        try:
            data = json.loads(body_bytes.decode())
            return data, []
        except Exception:
            return {}, []
            
    msg = email.message_from_bytes(b"Content-Type: " + content_type.encode() + b"\r\n\r\n" + body_bytes)
    fields = {}
    files = []
    if msg.is_multipart():
        for part in msg.get_payload():
            cd = part.get("Content-Disposition", "")
            name = None
            filename = None
            for p in cd.split(";"):
                p = p.strip()
                if p.startswith("name="):
                    name = p.split("name=")[1].strip(' "')
                elif p.startswith("filename="):
                    filename = p.split("filename=")[1].strip(' "')
            payload = part.get_payload(decode=True)
            if payload is None:
                raw_p = part.get_payload()
                payload = raw_p.encode() if isinstance(raw_p, str) else b""
            if filename:
                files.append({"filename": filename, "bytes": payload, "mime_type": part.get_content_type()})
            elif name:
                fields[name] = payload.decode(errors="ignore")
    return fields, files

@app.post("/api/transcribe")
async def transcribe_audio(request: Request):
    try:
        fields, files = await parse_request_data(request)
        language = fields.get("language", "English")
        
        file_bytes = files[0]["bytes"] if files else b""
        filename = files[0]["filename"] if files else "recording.webm"
        
        if not file_bytes:
            return {"text": "", "transcription": ""}
            
        client = classifier.client
        if not client:
            return {"text": "Voice input received. Please review your text.", "transcription": "Voice input received."}
            
        if language == "English":
            text = client.audio.translations.create(
                file=(filename, file_bytes),
                model="whisper-large-v3",
                response_format="json"
            ).text
        else:
            raw_text = client.audio.transcriptions.create(
                file=(filename, file_bytes),
                model="whisper-large-v3",
                prompt="The user is speaking Hinglish or an Indian language. Transcribe accurately.",
                response_format="json"
            ).text
            
            resp = client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[
                    {"role": "system", "content": "You are a translator. Translate the following text into 'Hinglish' (conversational Hindi written using ONLY the English alphabet). Under NO circumstances should you use Devanagari script. Do not add commentary."},
                    {"role": "user", "content": raw_text}
                ],
                temperature=0.0
            )
            text = resp.choices[0].message.content.strip()

        return {"text": text, "transcription": text}
    except Exception as e:
        print(f"Transcription error: {e}")
        return {"text": "Voice recorded. You may continue editing your statement.", "transcription": "Voice recorded."}

@app.post("/api/case/classify")
def classify_problem(payload: ClassifyRequest):
    case_id = payload.case_id or case_manager.create_case()
    case = case_manager.get_case(case_id) or {}

    problem_text = payload.problem_text or case.get("user_problem", "")
    language = payload.language or case.get("language", "English")

    result = classifier.classify(problem_text, language)
    
    case_manager.update_case(case_id, {
        "status": "classified",
        "route": result["route"],
        "sub_category": result["sub_category"],
        "user_problem": problem_text,
        "form_schema": result["form_schema"],
        "language": language
    })

    return {**result, "case_id": case_id}

@app.post("/api/rti/generate")
def generate_rti(payload: FormSubmitRequest):
    case_id = payload.case_id or case_manager.create_case()
    case = case_manager.get_case(case_id) or {}

    user_problem = case.get("user_problem", "Public Records & Inspection Inquiry")
    language = case.get("language", "English")
    form_data = payload.form_data or case.get("form_data", {})
    
    draft = outcome_engine.generate_initial_rti(form_data, user_problem, language)

    case_manager.update_case(case_id, {
        "status": "rti_drafted",
        "form_data": form_data,
        "initial_draft": draft
    })
    return {"case_id": case_id, "initial_draft": draft}

@app.post("/api/rti/predict")
def predict_rti(payload: RTIPredictRequest):
    case_id = payload.case_id or case_manager.create_case()
    case = case_manager.get_case(case_id) or {}

    draft_text = payload.draft_text or case.get("initial_draft") or "Application under Section 6(1) of RTI Act 2005"
    language = case.get("language", "English")
    
    prediction_result = outcome_engine.predict_rti_outcome(draft_text, language)
    case_manager.update_case(case_id, {
        "status": "rti_predicted",
        "prediction_result": prediction_result
    })
    return {"case_id": case_id, **prediction_result}

@app.post("/api/rti/improve")
def improve_rti(payload: RTIImproveRequest):
    case_id = payload.case_id or case_manager.create_case()
    case = case_manager.get_case(case_id) or {}

    initial_draft = case.get("initial_draft", "Application under Section 6(1) of RTI Act 2005")
    pred = case.get("prediction_result", {})
    risks = pred.get("detected_risks", [])
    suggestions = pred.get("improvement_suggestions", [])
    language = case.get("language", "English")

    improved_result = outcome_engine.generate_improved_rti(initial_draft, risks, suggestions, language)
    case_manager.update_case(case_id, {
        "status": "rti_completed",
        "improved_draft": improved_result.get("improved_draft"),
        "filing_instructions": improved_result.get("filing_instructions")
    })
    return {"case_id": case_id, **improved_result}

@app.post("/api/rti/resolve-department")
def resolve_department(payload: DepartmentResolveRequest):
    case_id = payload.case_id or case_manager.create_case()
    case = case_manager.get_case(case_id) or {}

    user_problem = case.get("user_problem", "Public Authority Records Request")
    extracted_facts = {**case.get("form_data", {}), **case.get("extracted_facts", {})}
    location = payload.location or extracted_facts.get("applicant_city") or extracted_facts.get("applicant_state", "")
    language = case.get("language", "English")

    dept_info = department_resolver.resolve("RTI", user_problem, location, extracted_facts, language)
    case_manager.update_case(case_id, {"department_info": dept_info})
    return {"case_id": case_id, **dept_info}

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
def generate_grievance(payload: GrievanceGenerateRequest):
    case_id = payload.case_id or case_manager.create_case()
    case = case_manager.get_case(case_id) or {}

    form_data = payload.form_data or case.get("form_data", {})
    if isinstance(form_data, str):
        try:
            parsed_form_data = json.loads(form_data)
        except Exception:
            parsed_form_data = {}
    else:
        parsed_form_data = form_data or {}

    user_problem = payload.user_problem or case.get("user_problem", "Citizen Grievance & Deficiency of Service")
    language = payload.language or case.get("language", "English")
    location = parsed_form_data.get("applicant_city", "")
    files_data = payload.files or []

    try:
        pack = grievance_resolver.analyze_proof_and_rights(
            user_problem=user_problem,
            location=location,
            form_data=parsed_form_data,
            files_data=files_data,
            language=language
        )
    except Exception as e:
        print(f"Grievance resolution fallback: {e}")
        pack = grievance_resolver._fallback()

    case_manager.update_case(case_id, {
        "status": "grievance_completed",
        "form_data": parsed_form_data,
        "grievance_pack": pack
    })

    return {"case_id": case_id, **pack}

@app.post("/api/generate-pdf")
def generate_generic_pdf_endpoint(payload: GeneratePDFRequest):
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
