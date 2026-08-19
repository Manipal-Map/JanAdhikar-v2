import json
import base64
from typing import Dict, Any
from classifier import classifier

class GrievanceResolver:
    def __init__(self):
        # Ensure your Groq/OpenAI key is attached to a vision-capable model
        self.vision_model = "llama-3.2-11b-vision-preview" # or gpt-4o / claude-3-haiku
        self.text_model = "openai/gpt-oss-120b"

    def _get_client(self):
        return classifier.client

    def analyze_proof_and_rights(self, user_problem: str, location: str, file_bytes: bytes, mime_type: str) -> Dict[str, Any]:
        client = self._get_client()
        if not client:
            return self._fallback()

        encoded_image = base64.b64encode(file_bytes).decode('utf-8') if file_bytes else None

        system_prompt = """You are an Expert Indian Legal Analyst.
        Analyze the citizen's grievance, their location, and the provided evidence (if any).
        1. Identify the specific Indian laws/rights violated (e.g., Consumer Protection Act 2019, RERA, Payment of Wages Act).
        2. Determine the exact authority/portal for filing (e.g., e-Daakhil, CPGRAMS, State Labour Commission).
        3. Extract key facts from the evidence to strengthen the case.
        
        Return ONLY valid JSON:
        {
          "violated_rights": ["Right 1", "Right 2"],
          "legal_explanation": "A deep analysis of how their rights were violated based on the facts and evidence.",
          "target_portal_name": "e.g., e-Daakhil / CPGRAMS",
          "target_portal_url": "e.g., https://edaakhil.nic.in",
          "evidence_analysis": "What the proof shows (or 'No proof provided')"
        }"""

        messages = [
            {"role": "system", "content": system_prompt},
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": f"Issue: {user_problem}\nLocation: {location}"}
                ]
            }
        ]

        if encoded_image:
            messages[1]["content"].append({
                "type": "image_url",
                "image_url": {"url": f"data:{mime_type};base64,{encoded_image}"}
            })

        try:
            resp = client.chat.completions.create(
                model=self.vision_model if encoded_image else self.text_model,
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
            "violated_rights": ["General Consumer / Civic Rights"],
            "legal_explanation": "Unable to run deep AI analysis. Basic administrative dispute detected.",
            "target_portal_name": "National Consumer Helpline / CPGRAMS",
            "target_portal_url": "https://consumerhelpline.gov.in",
            "evidence_analysis": "Fallback mode: Proof not analyzed."
        }

grievance_resolver = GrievanceResolver()
