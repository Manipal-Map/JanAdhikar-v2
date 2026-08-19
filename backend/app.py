from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional

from .case_manager import case_manager
from .classifier import classifier
from .outcome_predictor import outcome_engine

app = FastAPI(title="CivicRoute AI API", version="1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Pydantic Schemas ---
class CaseInitResponse(BaseModel):
    case_id: str
    message: str

class ClassifyRequest(BaseModel):
    case_id: str
    problem_text: str

class ClassifyResponse(BaseModel):
    case_id: str
    route: str
    sub_category: str
    confidence: float
    reasoning: str
    form_schema: List[Dict[str, Any]]


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

# --- Endpoints ---

@app.get("/")
def health_check():
    return {"status": "ok", "system": "CivicRoute Backend Active"}

@app.post("/api/case/init", response_model=CaseInitResponse)
def init_case():
    new_case_id = case_manager.create_case()
    return CaseInitResponse(case_id=new_case_id, message="Save this ID safely.")

@app.post("/api/case/classify", response_model=ClassifyResponse)
def classify_problem(payload: ClassifyRequest):
    case = case_manager.get_case(payload.case_id)
    if not case:
        raise HTTPException(status_code=404, detail="Case ID not found.")

    result = classifier.classify(payload.problem_text)
    case_manager.update_case(payload.case_id, {
        "status": "classified",
        "route": result["route"],
        "sub_category": result["sub_category"],
        "user_problem": payload.problem_text,
        "form_schema": result["form_schema"]
    })

    return ClassifyResponse(
        case_id=payload.case_id,
        route=result["route"],
        sub_category=result["sub_category"],
        confidence=result["confidence"],
        reasoning=result["reasoning"],
        form_schema=result["form_schema"]
    )


@app.post("/api/chat/continue")
def chat_continue(payload: ChatMessageRequest):
    case = case_manager.get_case(payload.case_id)
    if not case:
        raise HTTPException(status_code=404, detail="Case ID not found.")
    
    route = case.get("route")
    
    if route == "Other":
        return {
            "case_id": payload.case_id,
            "updated_facts": {},
            "ai_response": "This inquiry falls outside statutory RTI and administrative grievance frameworks. Please handle this matter independently through direct personal communication or appropriate civil channels.",
            "is_complete": True
        }
    schema = case.get("form_schema", [])
    current_facts = case.get("extracted_facts", {})
    
    # Run the chat engine
    result = outcome_engine.process_chat_turn(route, schema, current_facts, payload.message)
    
    # Merge new facts into the current state
    if result.get("new_facts_extracted"):
        current_facts.update(result["new_facts_extracted"])
    
    # Save back to database / memory
    case_manager.update_case(payload.case_id, {
        "extracted_facts": current_facts
    })
    
    return {
        "case_id": payload.case_id,
        "updated_facts": current_facts,
        "ai_response": result.get("ai_response"),
        "is_complete": result.get("is_complete")
    }

# --- RTI Pipeline Endpoints ---

@app.post("/api/rti/generate")
def generate_rti(payload: FormSubmitRequest):
    """Generates initial RTI Draft from user problem and filled Guided Form."""
    case = case_manager.get_case(payload.case_id)
    if not case:
        raise HTTPException(status_code=404, detail="Case ID not found.")

    user_problem = case.get("user_problem", "")
    draft = outcome_engine.generate_initial_rti(payload.form_data, user_problem)

    case_manager.update_case(payload.case_id, {
        "status": "rti_drafted",
        "form_data": payload.form_data,
        "initial_draft": draft
    })

    return {"case_id": payload.case_id, "initial_draft": draft}

@app.post("/api/rti/predict")
def predict_rti(payload: RTIPredictRequest):
    """RTI-Bench ML Outcome Prediction + Risk Detection + Improvement Suggestions."""
    case = case_manager.get_case(payload.case_id)
    if not case:
        raise HTTPException(status_code=404, detail="Case ID not found.")

    draft_text = payload.draft_text or case.get("initial_draft")
    if not draft_text:
        raise HTTPException(status_code=400, detail="No RTI draft found to analyze.")

    prediction_result = outcome_engine.predict_rti_outcome(draft_text)

    case_manager.update_case(payload.case_id, {
        "status": "rti_predicted",
        "prediction_result": prediction_result
    })

    return {"case_id": payload.case_id, **prediction_result}

@app.post("/api/rti/improve")
def improve_rti(payload: RTIImproveRequest):
    """Generates the final improved high-success RTI Draft and filing instructions."""
    case = case_manager.get_case(payload.case_id)
    if not case:
        raise HTTPException(status_code=404, detail="Case ID not found.")

    initial_draft = case.get("initial_draft", "")
    pred = case.get("prediction_result", {})
    risks = pred.get("detected_risks", [])
    suggestions = pred.get("improvement_suggestions", [])

    improved_result = outcome_engine.generate_improved_rti(initial_draft, risks, suggestions)

    case_manager.update_case(payload.case_id, {
        "status": "rti_completed",
        "improved_draft": improved_result.get("improved_draft"),
        "filing_instructions": improved_result.get("filing_instructions")
    })

    return {"case_id": payload.case_id, **improved_result}

# --- Rights / Grievance Pipeline Endpoint ---

@app.post("/api/grievance/generate")
def generate_grievance(payload: FormSubmitRequest):
    """Generates Rights Analysis, Legal Demand Notice, and CPGRAMS/NCH Filing Guide."""
    case = case_manager.get_case(payload.case_id)
    if not case:
        raise HTTPException(status_code=404, detail="Case ID not found.")

    user_problem = case.get("user_problem", "")
    pack = outcome_engine.generate_grievance_pack(payload.form_data, user_problem)

    case_manager.update_case(payload.case_id, {
        "status": "grievance_completed",
        "form_data": payload.form_data,
        "grievance_pack": pack
    })

    return {"case_id": payload.case_id, **pack}

@app.get("/api/case/{case_id}")
def get_case_state(case_id: str):
    case_data = case_manager.get_case(case_id)
    if not case_data:
        raise HTTPException(status_code=404, detail="Case ID not found.")
    return {"case_id": case_id, "data": case_data}
