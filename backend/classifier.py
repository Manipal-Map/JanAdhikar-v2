import json
import re
from typing import Dict, Any
from groq import Groq
from prompts import CLASSIFIER_SYSTEM_PROMPT, FEW_SHOT_EXAMPLES, DYNAMIC_FORM_SCHEMAS

class RouteClassifier:
    def __init__(self):
        api_key = "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"
        if api_key.startswith("gsk_"):
            self.client = Groq(api_key=api_key)
        else:
            self.client = None
        self.rti_patterns = [r"\b(rti|right to information|pio|tender|inspection report)\b"]
        self.grievance_patterns = [r"\b(landlord|deposit|tenant|eviction|rent|defective|consumer)\b"]

    def _rule_based_fallback(self, text: str) -> Dict[str, Any]:
        return {
            "route": "Other",
            "sub_category": "General",
            "confidence": 0.65,
            "reasoning": "Input does not match standard RTI or civic grievance patterns.",
            "form_schema": DYNAMIC_FORM_SCHEMAS["Other"]
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
                    model="openai/gpt-oss-120b",
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
                print(f"[Classifier Fallback] Groq API call failed ({e}).")

        return self._rule_based_fallback(user_text)

classifier = RouteClassifier()
