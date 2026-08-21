import os
import json
from typing import Dict, Any
from groq import Groq
from .prompts import CLASSIFIER_SYSTEM_PROMPT, DYNAMIC_FORM_SCHEMAS

class RouteClassifier:
    def __init__(self):
        api_key = os.environ.get("GROQ_API_KEY")
        if api_key and api_key.startswith("gsk_"):
            try:
                self.client = Groq(api_key=api_key)
            except Exception:
                self.client = None
        else:
            self.client = None

    def _rule_based_fallback(self, text: str) -> Dict[str, Any]:
        lower = text.strip().lower()
        
        if len(lower) < 4 or not any(char.isalnum() for char in lower):
            return {
                "route": "Other",
                "sub_category": "Irrelevant",
                "confidence": 0.95,
                "reasoning": "The provided input is too short or unstructured to accurately classify legally.",
                "specific_advice": "We could not automatically process this request. Please describe your problem in more detail, or consult a local legal aid clinic for specific guidance.",
                "form_schema": [],
                "extracted_data": {}
            }

        rti_terms = ["rti", "tender", "inspection", "records", "sanction order", "copy of", "budget"]
        grievance_terms = ["pension", "delayed", "withheld", "refund", "deposit", "tenant", "defective"]
        
        rti_score = sum(1 for term in rti_terms if term in lower)
        grievance_score = sum(1 for term in grievance_terms if term in lower)

        if rti_score == 0 and grievance_score == 0:
            return {"route": "Other", "sub_category": "General Query", "confidence": 0.80, "reasoning": "No civic or consumer keywords detected.", "specific_advice": "This matter appears to fall outside our standard RTI and Grievance workflows. Please seek appropriate legal counsel or try rephrasing your issue.", "form_schema": [], "extracted_data": {}}

        if rti_score >= grievance_score:
            return {"route": "RTI", "sub_category": "Public Records", "confidence": 0.88, "reasoning": "User is seeking official records from a public authority.", "specific_advice": "", "form_schema": DYNAMIC_FORM_SCHEMAS.get("RTI", []), "extracted_data": {}}
        else:
            return {"route": "Rights/Grievance", "sub_category": "Grievance", "confidence": 0.85, "reasoning": "User is seeking dispute resolution or service remedy.", "specific_advice": "", "form_schema": DYNAMIC_FORM_SCHEMAS.get("Rights/Grievance", []), "extracted_data": {}}

    def classify(self, user_text: str, language: str = "English") -> Dict[str, Any]:
        if not user_text or not user_text.strip():
            return {"route": "Other", "sub_category": "Empty", "confidence": 1.0, "reasoning": "No text provided.", "specific_advice": "Please provide a valid problem statement.", "form_schema": [], "extracted_data": {}}

        if self.client:
            try:
                system_msg = (
                    f"{CLASSIFIER_SYSTEM_PROMPT}\n\n"
                    f"CRITICAL LANGUAGE INSTRUCTION:\n"
                    f"The user has selected '{language}'. ALL text values in your JSON MUST be written in {language}.\n"
                    f"If '{language}' is 'Hinglish', write conversational Hindi using the English alphabet. "
                )
                
                response = self.client.chat.completions.create(
                    model="openai/gpt-oss-120b",
                    messages=[
                        {"role": "system", "content": system_msg},
                        {"role": "user", "content": user_text}
                    ],
                    temperature=0.0,
                    response_format={"type": "json_object"}
                )

                content = response.choices[0].message.content.strip()
                result = json.loads(content)

                route = result.get("route", "Other")
                if route not in ["RTI", "Rights/Grievance", "Other"]: route = "Other"
                result["route"] = route
                result["form_schema"] = DYNAMIC_FORM_SCHEMAS.get(route, [])
                result["extracted_data"] = result.get("extracted_data", {})
                return result
            except Exception as e:
                print(f"[Classifier Fallback] API failed ({e}).")

        return self._rule_based_fallback(user_text)

classifier = RouteClassifier()
