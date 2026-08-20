import os
import json
from typing import Dict, Any
from groq import Groq
from .prompts import CLASSIFIER_SYSTEM_PROMPT, FEW_SHOT_EXAMPLES, DYNAMIC_FORM_SCHEMAS

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
        lower = text.lower()
        rti_terms = ["rti", "tender", "inspection", "records", "sanction", "fund", "allocated", "status", "pending", "delay", "pension", "epfo", "officer", "road", "pds", "ration", "exam", "answer key"]
        grievance_terms = ["landlord", "deposit", "tenant", "eviction", "refund", "airline", "flight", "defective", "consumer", "service", "salary", "termination", "hospital", "cheated", "fraud", "bill", "overcharged"]

        rti_score = sum(1 for term in rti_terms if term in lower)
        grievance_score = sum(1 for term in grievance_terms if term in lower)

        if rti_score >= grievance_score and rti_score > 0:
            return {
                "route": "RTI",
                "sub_category": "Municipal / Public Records",
                "confidence": 0.88,
                "reasoning": "You are seeking official administrative records, inspection sheets, or fund disbursement logs under the Right to Information Act, 2005.",
                "form_schema": DYNAMIC_FORM_SCHEMAS.get("RTI", [])
            }
        elif grievance_score > 0:
            return {
                "route": "Rights/Grievance",
                "sub_category": "Consumer / Statutory Grievance",
                "confidence": 0.85,
                "reasoning": "You are seeking dispute resolution, statutory refund, compensation, or action against deficiency of public/commercial service.",
                "form_schema": DYNAMIC_FORM_SCHEMAS.get("Rights/Grievance", [])
            }
        else:
            return {
                "route": "RTI",
                "sub_category": "Civic Rights Query",
                "confidence": 0.78,
                "reasoning": "Your issue involves a public authority or government service and is eligible for Section 6(1) RTI inquiry.",
                "form_schema": DYNAMIC_FORM_SCHEMAS.get("RTI", [])
            }

    def classify(self, user_text: str, language: str = "English") -> Dict[str, Any]:
        if not user_text or not user_text.strip():
            return {"route": "Other", "sub_category": "Empty", "confidence": 1.0, "reasoning": "No text provided.", "form_schema": []}

        if self.client:
            try:
                system_msg = f"{CLASSIFIER_SYSTEM_PROMPT}\n\nCRITICAL LANGUAGE INSTRUCTION:\nThe user has selected '{language}'. ALL text values in your JSON MUST be written in {language}.\nIf '{language}' is 'Hinglish', you MUST write conversational Hindi strictly using the English alphabet. ABSOLUTELY NO Devanagari or regional scripts are allowed. Use English alphabet ONLY."
                
                prompt_messages = [{"role": "system", "content": system_msg}]
                prompt_messages.append({"role": "user", "content": user_text})

                response = self.client.chat.completions.create(
                    model="llama-3.3-70b-versatile",
                    messages=prompt_messages,
                    temperature=0.0,
                    response_format={"type": "json_object"}
                )

                content = response.choices[0].message.content.strip()
                result = json.loads(content)

                route = result.get("route", "Other")
                if route not in ["RTI", "Rights/Grievance", "Other"]:
                    route = "Other"

                result["route"] = route
                result["form_schema"] = DYNAMIC_FORM_SCHEMAS.get(route, [])
                return result
            except Exception as e:
                print(f"[Classifier Fallback] Groq API call failed ({e}). Using intelligent rule fallback.")

        return self._rule_based_fallback(user_text)

classifier = RouteClassifier()
