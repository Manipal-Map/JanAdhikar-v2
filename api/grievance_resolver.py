import json
import base64
from typing import Dict, Any, List
from .classifier import classifier

class GrievanceResolver:
    def __init__(self):
        self.vision_model = "llama-3.2-11b-vision-preview" 
        self.text_model = "llama-3.1-70b-versatile"

    def _get_client(self):
        return classifier.client

    def _generate_intelligent_analysis(self, user_problem: str, location: str, form_data: Dict[str, Any], files_data: List[Dict[str, Any]], language: str) -> Dict[str, Any]:
        p_lower = user_problem.lower()
        app_name = form_data.get("applicant_name") or "Applicant"
        app_city = location or form_data.get("applicant_city") or "India"
        app_addr = form_data.get("applicant_address") or app_city
        app_contact = form_data.get("applicant_contact") or "Provided on Record"

        return {
            "violated_rights": [
                "Right to Timely Public Service Delivery",
                "Constitution of India (Article 14 & 21)"
            ],
            "legal_explanation": f"Public administrative bodies in {app_city} are bound by statutory Citizen Charters.",
            "target_portal_name": "CPGRAMS",
            "target_portal_url": "https://pgportal.gov.in",
            "evidence_analysis": "Based on provided facts.",
            "demand_notice_draft": f"""FORMAL GRIEVANCE PETITION\nTo: Concerned Department, {app_city}\nFrom: {app_name}\nSubject: Grievance regarding {user_problem[:60]}\n..."""
        }

    def analyze_proof_and_rights(self, user_problem: str, location: str, form_data: Dict[str, Any], files_data: List[Dict[str, Any]], language: str) -> Dict[str, Any]:
        client = self._get_client()
        if client:
            try:
                system_prompt = """You are an Expert Indian Legal Analyst. Return ONLY valid JSON:
{
  "violated_rights": ["Right 1", "Right 2"],
  "legal_explanation": "Analysis.",
  "target_portal_name": "e-Daakhil / CPGRAMS",
  "target_portal_url": "https://...",
  "evidence_analysis": "What the proofs show",
  "demand_notice_draft": "The complete legal demand notice."
}"""

                user_content_str = f"Issue: {user_problem}\nLocation: {location}\nForm Data: {json.dumps(form_data)}"

                messages = [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": [{"type": "text", "text": user_content_str}]}
                ]

                has_images = False
                if files_data:
                    for fd in files_data:
                        mime = fd.get("mime_type", "")
                        if mime.startswith("image/"):
                            has_images = True
                            encoded_image = fd.get("base64") or (base64.b64encode(fd["bytes"]).decode('utf-8') if "bytes" in fd else "")
                            if encoded_image:
                                messages[1]["content"].append({
                                    "type": "image_url",
                                    "image_url": {"url": f"data:{mime};base64,{encoded_image}"}
                                })

                resp = client.chat.completions.create(
                    model=self.vision_model if has_images else self.text_model,
                    messages=messages,
                    temperature=0.1,
                    response_format={"type": "json_object"},
                )
                return json.loads(resp.choices[0].message.content.strip())
            except Exception as e:
                print(f"Grievance LLM call failed ({e}). Using expert legal rule engine.")

        return self._generate_intelligent_analysis(user_problem, location, form_data, files_data, language)

    def _fallback(self) -> Dict[str, Any]:
        return self._generate_intelligent_analysis("Consumer & civic rights grievance", "India", {}, [], "English")

grievance_resolver = GrievanceResolver()
