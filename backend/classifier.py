import json
import re
from typing import Dict, Any
from groq import Groq
from .prompts import CLASSIFIER_SYSTEM_PROMPT, FEW_SHOT_EXAMPLES, DYNAMIC_FORM_SCHEMAS

class RouteClassifier:
    def __init__(self):
        # --- PASTE YOUR REAL KEY BETWEEN THESE QUOTES ---
        api_key = "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"
        
        # The fixed logic condition
        if api_key.startswith("gsk_"):
            self.client = Groq(api_key=api_key)
        else:
            print("[Warning] No valid Groq API key found. Defaulting to offline rules.")
            self.client = None

        self.rti_patterns = [
            r"\b(rti|right to information|pio|tender|inspection report|certified copy|fund allocation|official record|file movement|sanction order|minutes of meeting|status of application)\b",
            r"\b(public authority|govt spending|budget breakdown|audit report)\b"
        ]
        self.grievance_patterns = [
            r"\b(landlord|deposit|tenant|eviction|rent|refund|defective|consumer court|shopkeeper)\b",
            r"\b(pension not credited|salary unpaid|harassment|cpgrams|complaint|warranty|broken road|pothole|potholes|municipal|illegal deduction)\b"
        ]

    def _rule_based_fallback(self, text: str) -> Dict[str, Any]:
        text_lower = text.lower()

        for pattern in self.rti_patterns:
            if re.search(pattern, text_lower):
                return {
                    "route": "RTI",
                    "sub_category": "General RTI Request",
                    "confidence": 0.80,
                    "reasoning": "Keyword match: Detected request for official records.",
                    "form_schema": DYNAMIC_FORM_SCHEMAS["RTI"]
                }

        for pattern in self.grievance_patterns:
            if re.search(pattern, text_lower):
                return {
                    "route": "Rights/Grievance",
                    "sub_category": "Grievance / Dispute",
                    "confidence": 0.80,
                    "reasoning": "Keyword match: Detected consumer, tenancy, or administrative grievance.",
                    "form_schema": DYNAMIC_FORM_SCHEMAS["Rights/Grievance"]
                }

        return {
            "route": "Other",
            "sub_category": "General",
            "confidence": 0.65,
            "reasoning": "Input does not match standard RTI or civic grievance patterns.",
            "form_schema": DYNAMIC_FORM_SCHEMAS["Other"]
        }

    def classify(self, user_text: str) -> Dict[str, Any]:
        if not user_text or not user_text.strip():
            return {
                "route": "Other",
                "sub_category": "Empty",
                "confidence": 1.0,
                "reasoning": "No text provided.",
                "form_schema": []
            }

        if self.client:
            try:
                prompt_messages = [{"role": "system", "content": CLASSIFIER_SYSTEM_PROMPT}]
                for ex in FEW_SHOT_EXAMPLES:
                    prompt_messages.append({"role": "user", "content": ex["input"]})
                    prompt_messages.append({"role": "assistant", "content": json.dumps(ex["output"])})
                
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
                print(f"[Classifier Fallback] Groq API call failed ({e}). Running rule-based classifier.")

        return self._rule_based_fallback(user_text)

classifier = RouteClassifier()
