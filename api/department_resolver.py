import json
import httpx
from typing import Dict, Any
from .classifier import classifier

class SmartDepartmentResolver:
    def __init__(self):
        self.model = "openai/gpt-oss-120b"

    def _get_client(self):
        return classifier.client

    def _search_web_context(self, query: str, is_tender: bool = False) -> str:
        try:
            if is_tender: query = f"{query} active tender portal eprocurement"
            else: query = f"{query} central public information officer CIC"
                
            search_url = f"https://en.wikipedia.org/w/api.php?action=opensearch&search={query}&limit=3&format=json"
            headers = {"User-Agent": "CivicRoute/1.0"}
            
            with httpx.Client(timeout=5.0, headers=headers) as client:
                response = client.get(search_url)
                data = response.json()
                if len(data) > 2 and data[2]:
                    return "\n".join([f"- {desc}" for desc in data[2] if desc])
        except Exception as e:
            pass
        return "Proceed using internal legal knowledge."

    def resolve(self, route: str, user_problem: str, location: str, extracted_facts: Dict[str, Any], language: str) -> Dict[str, Any]:
        client = self._get_client()
        if not client: return self._fallback(location)

        safe_location = location or "India"
        is_tender = "tender" in user_problem.lower()
        search_query = f"{safe_location} municipal government or state administration"
        web_context = self._search_web_context(search_query, is_tender)

        system_prompt = f"""You are an expert Indian RTI Jurisdiction Resolver. 
        Return ONLY valid JSON matching this schema:
        {{
          "public_authority_name": "Specific Dept Name",
          "jurisdiction_level": "Central or State or Municipal",
          "pio_designation": "e.g., The PIO",
          "suggested_address_template": "Full address",
          "address_confidence": "HIGH" or "LOW",
          "reasoning": "Explanation"
        }}"""

        user_content = f"Issue: {user_problem}\nLocation: {location}\nExtracted Facts: {json.dumps(extracted_facts)}\nContext:\n{web_context}"

        try:
            resp = client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_content},
                ],
                temperature=0.1,
                response_format={"type": "json_object"},
            )
            return json.loads(resp.choices[0].message.content.strip())
        except Exception as e:
            print(f"Resolver LLM error: {e}")
            return self._fallback(location)

    def _fallback(self, location: str) -> Dict[str, Any]:
        return {
            "public_authority_name": "Concerned Department",
            "jurisdiction_level": "Unknown",
            "pio_designation": "Public Information Officer",
            "address_confidence": "LOW",
            "suggested_address_template": f"Office of the PIO, {location}",
            "reasoning": "Fallback activated."
        }

department_resolver = SmartDepartmentResolver()
