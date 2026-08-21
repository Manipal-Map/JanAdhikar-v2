import os
import json
from typing import Dict, Any, List
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from groq import Groq

router = APIRouter()

class IntakeMessage(BaseModel):
    message: str
    history: List[Dict[str, str]] = []
    current_extracted_data: Dict[str, Any] = {}

INTAKE_SYSTEM_PROMPT = """You are JanAdhikar's Expert Legal & KYC Intake Assistant. Your job is to converse empathetically with citizens in India who are facing civic, consumer, labor, or pension issues.

Your objectives:
1. Understand the user's core problem completely.
2. Politely ask for missing essential details needed for a legal petition/RTI (e.g., Department name, location/city, timeline/dates, specific amounts or reference numbers if applicable).
3. If the user doesn't know specific technical details or office addresses, you must intelligently infer or auto-fill them based on the context of their city and problem.
4. Evaluate when you have gathered enough information to proceed.

You must respond in strict JSON format matching this exact schema:
{
  "assistant_reply": "Your conversational response guiding the user or asking the next question.",
  "is_ready_to_proceed": boolean (true if you have enough facts to draft the RTI/Grievance, false if more info is needed),
  "extracted_data": {
    "problem_summary": "Concise summary of the grievance",
    "route_guess": "RTI" or "Rights/Grievance" or "Other",
    "applicant_city": "Inferred or stated city (e.g., Jaipur)",
    "department_name": "Inferred target department",
    "applicant_name": "Name if provided or null",
    "applicant_contact": "Phone/Email if provided or null",
    "additional_notes": "Any other helpful context"
  }
}
"""

@router.post("/api/intake/chat")
def intake_chat(payload: IntakeMessage):
    api_key = os.environ.get("GROQ_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="Groq API key not configured.")

    client = Groq(api_key=api_key)
    
    messages = [{"role": "system", "content": INTAKE_SYSTEM_PROMPT}]
    for h in payload.history:
        messages.append({"role": h.get("role", "user"), "content": h.get("content", "")})
    
    messages.append({"role": "user", "content": payload.message})

    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=messages,
            temperature=0.2,
            response_format={"type": "json_object"}
        )
        result = json.loads(response.choices[0].message.content.strip())
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
