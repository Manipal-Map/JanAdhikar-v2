import json
import base64
from typing import Dict, Any, List
from classifier import classifier

class GrievanceResolver:
    def __init__(self):
        self.vision_model = "llama-3.2-11b-vision-preview" 
        self.text_model = "openai/gpt-oss-120b"

    def _get_client(self):
        return classifier.client

    def analyze_proof_and_rights(self, user_problem: str, location: str, form_data: Dict[str, Any], files_data: List[Dict[str, Any]], language: str) -> Dict[str, Any]:
        client = self._get_client()
        if not client:
            return self._fallback()

        system_prompt = f"""You are an Expert Indian Legal Analyst.
        Analyze the citizen's grievance, their location, and the provided evidence.
        1. Identify the specific Indian laws/rights violated.
        2. Determine the exact authority/portal for filing.
        3. Extract key facts from the evidence.
        4. Draft a formal Legal Demand Notice.
        
        CRITICAL: ALL text values in your JSON response MUST be written in {language}. 
        If {language} is 'Hinglish', write in conversational Hindi using the English alphabet (e.g., 'Aapka consumer right violate hua hai...').
        
        Return ONLY valid JSON matching this exact schema:
        {{
          "violated_rights": ["Specific Right/Law 1", "Specific Right/Law 2"],
          "legal_explanation": "A deep analysis of how their rights were violated.",
          "target_portal_name": "e.g., e-Daakhil / CPGRAMS / RERA",
          "target_portal_url": "e.g., https://edaakhil.nic.in",
          "evidence_analysis": "What the proofs show (or 'No proof provided')",
          "demand_notice_draft": "The complete legal demand notice in {language}."
        }}"""

        user_content_str = f"Issue: {user_problem}\nLocation: {location}\nForm Data: {json.dumps(form_data)}"

        messages = [
            {"role": "system", "content": system_prompt},
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": user_content_str}
                ]
            }
        ]

        has_images = False
        if files_data:
            for fd in files_data:
                if fd["mime_type"].startswith("image/"):
                    has_images = True
                    encoded_image = base64.b64encode(fd["bytes"]).decode('utf-8')
                    messages[1]["content"].append({
                        "type": "image_url",
                        "image_url": {"url": f"data:{fd['mime_type']};base64,{encoded_image}"}
                    })

        try:
            resp = client.chat.completions.create(
                model=self.vision_model if has_images else self.text_model,
                messages=messages,
                temperature=0.1,
                response_format={"type": "json_object"},
            )
            return json.loads(resp.choices[0].message.content.strip())
        except Exception as e:
            print(f"Grievance Vision LLM error: {e}")
            return self._fallback()

    def _fallback(self) -> Dict[str, Any]:
        return {
            "violated_rights": ["Consumer / Civic Rights"],
            "legal_explanation": "Unable to run deep AI analysis.",
            "target_portal_name": "National Consumer Helpline",
            "target_portal_url": "https://consumerhelpline.gov.in",
            "evidence_analysis": "Fallback mode: Proofs not analyzed.",
            "demand_notice_draft": "SUBJECT: Legal Demand Notice\n\nPlease resolve the pending dispute immediately."
        }

grievance_resolver = GrievanceResolver()
