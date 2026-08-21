import os
import json
import re
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

You must respond ONLY in valid JSON format matching this exact schema:
{
  "assistant_reply": "Your conversational response guiding the user or asking the next question.",
  "is_ready_to_persist": false,
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

def extract_json_from_text(text: str) -> dict:
    """Safely extracts JSON from a string even if it's wrapped in markdown or conversational text."""
    try:
        # First try direct parse
        return json.loads(text)
    except json.JSONDecodeError:
        # Try to find JSON block wrapped in triple backticks
        json_match = re.search(r'```(?:json)?\s*(\{.*?\})\s*```', text, re.DOTALL)
        if json_match:
            try:
                return json.loads(json_match.group(1))
            except json.JSONDecodeError:
                pass
        
        # Try to find anything that looks like a JSON object
        json_match = re.search(r'(\{.*\})', text, re.DOTALL)
        if json_match:
            try:
                return json.loads(json_match.group(1))
            except json.JSONDecodeError:
                pass
                
        # Ultimate fallback if everything fails
        return {
            "assistant_reply": "I am processing your details, but encountered a formatting hiccup. Could you please clarify your city and the main issue again?",
            "is_ready_to_proceed": False,
            "extracted_data": {}
        }

@router.post("/api/intake/chat")
def intake_chat(payload: IntakeMessage):
    api_key = os.environ.get("GROQ_API_KEY")
    if not api_key:
        print("CRITICAL ERROR: GROQ_API_KEY is missing from environment variables.")
        raise HTTPException(status_code=500, detail="Groq API key not configured on server.")

    try:
        client = Groq(api_key=api_key)
        
        messages = [{"role": "system", "content": INTAKE_SYSTEM_PROMPT}]
        for h in payload.history:
            messages.append({"role": h.get("role", "user"), "content": h.get("content", "")})
        
        messages.append({"role": "user", "content": payload.message})

        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=messages,
            temperature=0.2,
            response_format={"type": "json_object"}
        )
        
        raw_content = response.choices[0].message.content.strip()
        result = extract_json_from_text(raw_content)
        
        # Ensure we don't lose previously extracted data
        if payload.current_extracted_data:
            merged_data = {**payload.current_extracted_data, **result.get("extracted_data", {})}
            result["extracted_data"] = merged_data

        return result
        
    except Exception as e:
        print(f"Intake Chat Exception: {str(e)}")
        # Instead of crashing with 500, return a graceful fallback response
        return {
            "assistant_reply": "I apologize, our secure legal network experienced a slight delay. Please continue telling me about your problem.",
            "is_ready_to_proceed": False,
            "extracted_data": payload.current_extracted_data
        }
