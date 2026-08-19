import json
from typing import Dict, Any
from .classifier import classifier
from .prompts import JURISDICTION_RESOLVER_PROMPT
from .data.jurisdiction_knowledge import JURISDICTION_KB


class DepartmentResolver:
    def __init__(self):
        self.model = "openai/gpt-oss-120b"

    def _get_client(self):
        return classifier.client

    def resolve(self, route: str, user_problem: str, location: str, extracted_facts: Dict[str, Any]) -> Dict[str, Any]:
        client = self._get_client()
        if not client:
            return self._fallback(location)

        kb_context = json.dumps(JURISDICTION_KB, indent=2)
        user_content = (
            f"Citizen's issue: {user_problem}\n"
            f"Location provided: {location or 'Not specified'}\n"
            f"Facts collected so far: {json.dumps(extracted_facts, indent=2)}"
        )

        try:
            resp = client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": JURISDICTION_RESOLVER_PROMPT.format(kb=kb_context)},
                    {"role": "user", "content": user_content},
                ],
                temperature=0.0,
                response_format={"type": "json_object"},
            )
            result = json.loads(resp.choices[0].message.content.strip())
            result["verify_links"] = self._build_verify_links(result)
            return result
        except Exception as e:
            print(f"[DepartmentResolver] Falling back due to: {e}")
            return self._fallback(location)

    def _build_verify_links(self, result: Dict[str, Any]) -> list:
        dept = (result.get("public_authority_name") or "").strip()
        level = result.get("jurisdiction_level", "State")
        q = dept.replace(" ", "+")
        links = []
        if level == "Central":
            links.append({
                "label": "RTI Online — Central PIO Directory",
                "url": f"https://rtionline.gov.in/request/request.php?search={q}"
            })
        links.append({
            "label": f"Verify '{dept or 'department'}' address online",
            "url": f"https://www.google.com/search?q={q}+PIO+address+RTI+official"
        })
        return links

    def _fallback(self, location: str) -> Dict[str, Any]:
        return {
            "public_authority_name": "Not identified — manual lookup required",
            "jurisdiction_level": "Unknown",
            "pio_designation": "Public Information Officer",
            "address_confidence": "LOW",
            "suggested_address_template": f"Office of the Public Information Officer, [Department Name], {location or '[City, District, State]'} - [PIN]",
            "reasoning": "Automatic resolution unavailable right now. Please confirm the correct department using the verification link before filing.",
            "supporting_rti_section": "",
            "verify_links": [
                {"label": "Search RTI PIO Directory", "url": "https://rtionline.gov.in/request/request.php"}
            ],
        }


department_resolver = DepartmentResolver()
