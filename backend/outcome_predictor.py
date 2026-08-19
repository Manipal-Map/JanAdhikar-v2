import json
from typing import Dict, Any, List
from groq import Groq
from prompts import (
    RTI_DRAFT_SYSTEM_PROMPT,
    RTI_PREDICTOR_SYSTEM_PROMPT,
    RTI_IMPROVE_SYSTEM_PROMPT,
    GRIEVANCE_PACK_SYSTEM_PROMPT,
    INFO_GATHERING_PROMPT
)
from classifier import classifier

class OutcomeEngine:
    def __init__(self):
        self.model = "openai/gpt-oss-120b"

    def _get_client(self) -> Groq:
        return classifier.client

    def _get_lang_rule(self, language: str) -> str:
        return f"\n\nCRITICAL LANGUAGE INSTRUCTION:\nThe user has selected '{language}'. ALL text output MUST be written in {language}.\nIf '{language}' is 'Hinglish', you MUST write conversational Hindi strictly using the English alphabet. ABSOLUTELY NO Devanagari or regional scripts are allowed. Use English alphabet ONLY."

    def process_chat_turn(self, route: str, schema: List[Dict[str, Any]], current_facts: Dict[str, Any], user_message: str) -> Dict[str, Any]:
        return {} # Removed as per user request to abandon chat interface for grievances. Kept to avoid import errors.

    def generate_initial_rti(self, form_data: Dict[str, Any], user_problem: str, language: str) -> str:
        client = self._get_client()
        if not client:
            return f"Offline Draft for: {user_problem}"

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

    def predict_rti_outcome(self, draft_text: str, language: str) -> Dict[str, Any]:
        client = self._get_client()
        if not client:
            return {"prediction": "PARTIAL", "probabilities": {}, "detected_risks": [], "improvement_suggestions": []}

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

    def generate_improved_rti(self, original_draft: str, risks: List[Dict[str, Any]], suggestions: List[str], language: str) -> Dict[str, Any]:
        client = self._get_client()
        if not client:
            return {"improved_draft": original_draft, "filing_instructions": []}

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

outcome_engine = OutcomeEngine()
