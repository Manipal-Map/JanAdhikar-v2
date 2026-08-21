import json
from typing import Dict, Any, List
from groq import Groq
from .prompts import (
    RTI_DRAFT_SYSTEM_PROMPT,
    RTI_PREDICTOR_SYSTEM_PROMPT,
    RTI_IMPROVE_SYSTEM_PROMPT
)
from .classifier import classifier

class OutcomeEngine:
    def __init__(self):
        self.model = "openai/gpt-oss-120b"

    def _get_client(self) -> Groq:
        return classifier.client

    def _get_lang_rule(self, language: str) -> str:
        return f"\n\nCRITICAL LANGUAGE INSTRUCTION:\nThe user has selected '{language}'. ALL text output MUST be written in {language}."

    def generate_initial_rti(self, form_data: Dict[str, Any], user_problem: str, language: str) -> str:
        client = self._get_client()
        if client:
            try:
                prompt = f"User Problem: {user_problem}\nForm Details:\n{json.dumps(form_data, indent=2)}"
                sys_prompt = RTI_DRAFT_SYSTEM_PROMPT + self._get_lang_rule(language)
                
                response = client.chat.completions.create(
                    model=self.model,
                    messages=[
                        {"role": "system", "content": sys_prompt},
                        {"role": "user", "content": prompt}
                    ],
                    temperature=0.2
                )
                return response.choices[0].message.content.strip()
            except Exception as e:
                print(f"[OutcomeEngine] Initial RTI generation failed: {e}")

        app_name = form_data.get("applicant_name", "Applicant")
        app_city = form_data.get("applicant_city", "Local Jurisdiction")
        return f"""APPLICATION UNDER SECTION 6(1) OF THE RIGHT TO INFORMATION ACT, 2005\n\nTo,\nThe CPIO,\n{app_city}\n\nSubject: RTI request regarding {user_problem[:60]}"""

    def predict_rti_outcome(self, draft_text: str, language: str) -> Dict[str, Any]:
        client = self._get_client()
        if client:
            try:
                sys_prompt = RTI_PREDICTOR_SYSTEM_PROMPT + self._get_lang_rule(language)
                response = client.chat.completions.create(
                    model=self.model,
                    messages=[
                        {"role": "system", "content": sys_prompt},
                        {"role": "user", "content": f"Analyze this RTI Draft:\n\n{draft_text}"}
                    ],
                    temperature=0.0,
                    response_format={"type": "json_object"}
                )
                return json.loads(response.choices[0].message.content.strip())
            except Exception as e:
                print(f"[OutcomeEngine] RTI prediction failed: {e}")

        return {
            "prediction": "APPROVED",
            "probabilities": {"approved": 0.88, "partial": 0.09, "rejected": 0.03},
            "detected_risks": [{"risk_code": "INFO", "description": "Fallback response used.", "severity": "LOW"}],
            "improvement_suggestions": []
        }

    def generate_improved_rti(self, original_draft: str, risks: List[Dict[str, Any]], suggestions: List[str], language: str) -> Dict[str, Any]:
        client = self._get_client()
        if client:
            try:
                user_content = f"Original Draft:\n{original_draft}\n\nIdentified Risks:\n{json.dumps(risks)}\n\nSuggestions:\n{json.dumps(suggestions)}"
                sys_prompt = RTI_IMPROVE_SYSTEM_PROMPT + self._get_lang_rule(language)
                
                response = client.chat.completions.create(
                    model=self.model,
                    messages=[
                        {"role": "system", "content": sys_prompt},
                        {"role": "user", "content": user_content}
                    ],
                    temperature=0.2,
                    response_format={"type": "json_object"}
                )
                return json.loads(response.choices[0].message.content.strip())
            except Exception as e:
                print(f"[OutcomeEngine] RTI improvement failed: {e}")

        return {
            "improved_draft": original_draft,
            "filing_instructions": ["Print 2 copies.", "Submit by Speed Post."]
        }

outcome_engine = OutcomeEngine()
