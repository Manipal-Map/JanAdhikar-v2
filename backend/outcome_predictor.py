import json
from typing import Dict, Any, List
from groq import Groq
from .prompts import (
    RTI_DRAFT_SYSTEM_PROMPT,
    RTI_PREDICTOR_SYSTEM_PROMPT,
    RTI_IMPROVE_SYSTEM_PROMPT,
    GRIEVANCE_PACK_SYSTEM_PROMPT,
    INFO_GATHERING_PROMPT
)
from .classifier import classifier

class OutcomeEngine:
    def __init__(self):
        self.model = "openai/gpt-oss-120b"

    def _get_client(self) -> Groq:
        return classifier.client

    def process_chat_turn(self, route: str, schema: List[Dict[str, Any]], current_facts: Dict[str, Any], user_message: str) -> Dict[str, Any]:
        client = self._get_client()
        if not client:
            return {
                "new_facts_extracted": {},
                "ai_response": "Offline mode: Please provide all details at once.",
                "is_complete": False
            }

        schema_str = json.dumps([{"key": f["key"], "description": f["label"]} for f in schema])
        system_content = INFO_GATHERING_PROMPT.format(
            route=route, 
            schema=schema_str, 
            current_facts=json.dumps(current_facts)
        )

        response = client.chat.completions.create(
            model=self.model,
            messages=[
                {"role": "system", "content": system_content},
                {"role": "user", "content": user_message}
            ],
            temperature=0.1,
            response_format={"type": "json_object"}
        )
        return json.loads(response.choices[0].message.content.strip())

    def generate_initial_rti(self, form_data: Dict[str, Any], user_problem: str) -> str:
        client = self._get_client()
        if not client:
            return f"Offline Draft for: {user_problem}"

        prompt = f"User Problem: {user_problem}\nForm Details:\n{json.dumps(form_data, indent=2)}"
        response = client.chat.completions.create(
            model=self.model,
            messages=[
                {"role": "system", "content": RTI_DRAFT_SYSTEM_PROMPT},
                {"role": "user", "content": prompt}
            ],
            temperature=0.2
        )
        return response.choices[0].message.content.strip()

    def predict_rti_outcome(self, draft_text: str) -> Dict[str, Any]:
        client = self._get_client()
        if not client:
            return {"prediction": "PARTIAL", "probabilities": {}, "detected_risks": [], "improvement_suggestions": []}

        response = client.chat.completions.create(
            model=self.model,
            messages=[
                {"role": "system", "content": RTI_PREDICTOR_SYSTEM_PROMPT},
                {"role": "user", "content": f"Analyze this RTI Draft:\n\n{draft_text}"}
            ],
            temperature=0.0,
            response_format={"type": "json_object"}
        )
        return json.loads(response.choices[0].message.content.strip())

    def generate_improved_rti(self, original_draft: str, risks: List[Dict[str, Any]], suggestions: List[str]) -> Dict[str, Any]:
        client = self._get_client()
        if not client:
            return {"improved_draft": original_draft, "filing_instructions": []}

        user_content = f"Original Draft:\n{original_draft}\n\nIdentified Risks:\n{json.dumps(risks)}\n\nSuggestions:\n{json.dumps(suggestions)}"
        response = client.chat.completions.create(
            model=self.model,
            messages=[
                {"role": "system", "content": RTI_IMPROVE_SYSTEM_PROMPT},
                {"role": "user", "content": user_content}
            ],
            temperature=0.2,
            response_format={"type": "json_object"}
        )
        return json.loads(response.choices[0].message.content.strip())

    def generate_grievance_pack(self, form_data: Dict[str, Any], user_problem: str) -> Dict[str, Any]:
        client = self._get_client()
        if not client:
            return {"legal_analysis": "", "demand_notice_draft": "", "filing_portal_guide": []}

        user_content = f"Problem: {user_problem}\nDetails:\n{json.dumps(form_data, indent=2)}"
        response = client.chat.completions.create(
            model=self.model,
            messages=[
                {"role": "system", "content": GRIEVANCE_PACK_SYSTEM_PROMPT},
                {"role": "user", "content": user_content}
            ],
            temperature=0.2,
            response_format={"type": "json_object"}
        )
        return json.loads(response.choices[0].message.content.strip())

outcome_engine = OutcomeEngine()
