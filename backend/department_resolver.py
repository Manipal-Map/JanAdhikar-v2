import json
from typing import Dict, Any
from duckduckgo_search import DDGS
from classifier import classifier

class SmartDepartmentResolver:
    def __init__(self):
        self.model = "openai/gpt-oss-120b"
        self.ddgs = DDGS()

    def _get_client(self):
        return classifier.client

    def _search_web(self, query: str) -> str:
        """Pulls live web snippets to feed the LLM."""
        try:
            results = self.ddgs.text(query, max_results=4)
            return "\n".join([f"- {r['title']}: {r['body']}" for r in results])
        except Exception:
            return "Web search failed. Rely on internal knowledge."

    def resolve(self, route: str, user_problem: str, location: str, extracted_facts: Dict[str, Any]) -> Dict[str, Any]:
        client = self._get_client()
        if not client:
            return self._fallback(location)

        # Step 1: Formulate search query based on problem & location
        search_query = f"Public Information Officer PIO address {location} {user_problem.split()[0:3]}"
        web_context = self._search_web(search_query)

        system_prompt = """You are an expert Indian RTI Jurisdiction Resolver. 
        Use the provided Live Web Context to find the EXACT Public Authority, PIO Designation, and Address.
        Return ONLY valid JSON:
        {
          "public_authority_name": "Specific Dept Name",
          "jurisdiction_level": "Central or State or Municipal",
          "pio_designation": "e.g., The Public Information Officer, Ward 12",
          "suggested_address_template": "Full physical address with PIN",
          "address_confidence": "HIGH" or "LOW",
          "reasoning": "Brief explanation"
        }"""

        user_content = f"Issue: {user_problem}\nLocation: {location}\n\nLive Web Context:\n{web_context}"

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
        except Exception:
            return self._fallback(location)

    def _fallback(self, location: str) -> Dict[str, Any]:
        return {
            "public_authority_name": "Concerned Department",
            "jurisdiction_level": "Unknown",
            "pio_designation": "Public Information Officer",
            "address_confidence": "LOW",
            "suggested_address_template": f"Office of the PIO, [Department], {location} - [PIN]",
        }

department_resolver = SmartDepartmentResolver()
