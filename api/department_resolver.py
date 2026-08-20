import json
import httpx
from typing import Dict, Any
from classifier import classifier

class SmartDepartmentResolver:
    def __init__(self):
        self.model = "llama-3.3-70b-versatile"

    def _get_client(self):
        return classifier.client

    def _search_web_context(self, query: str, is_tender: bool = False) -> str:
        try:
            if is_tender:
                query = f"{query} active tender portal eprocurement"
            else:
                query = f"{query} central public information officer CIC"
                
            search_url = f"https://en.wikipedia.org/w/api.php?action=opensearch&search={query}&limit=3&format=json"
            headers = {"User-Agent": "CivicRoute/1.0 (https://jan-adhikar.vercel.app)"}
            
            with httpx.Client(timeout=5.0, headers=headers) as client:
                response = client.get(search_url)
                data = response.json()
                if len(data) > 2 and data[2]:
                    return "\n".join([f"- {desc}" for desc in data[2] if desc])
        except Exception as e:
            print(f"Context search failed: {e}")
        return "No live context available. Proceed using internal legal and civic knowledge."

    def resolve(self, route: str, user_problem: str, location: str, extracted_facts: Dict[str, Any], language: str) -> Dict[str, Any]:
        client = self._get_client()
        if not client:
            return self._fallback(location)

        safe_location = location or "India"
        is_tender = "tender" in user_problem.lower() or "contract" in user_problem.lower()
        search_query = f"{safe_location} municipal government or state administration"
        
        web_context = self._search_web_context(search_query, is_tender)

        system_prompt = f"""You are an expert Indian RTI Jurisdiction Resolver. 
        Analyze the citizen's issue and location. Use your knowledge of the Indian bureaucratic system to find the EXACT Public Authority, PIO Designation, and Address.
        
        CRITICAL LANGUAGE INSTRUCTION:
        The user has selected '{language}'. ALL text values in your JSON MUST be written in {language}.
        If '{language}' is 'Hinglish', you MUST write conversational Hindi strictly using the English alphabet.
        ABSOLUTELY NO Devanagari or regional scripts are allowed. Use English alphabet ONLY.
        
        Return ONLY valid JSON matching this exact schema:
        {{
          "public_authority_name": "Specific Dept Name",
          "jurisdiction_level": "Central or State or Municipal",
          "pio_designation": "e.g., The Public Information Officer, Engineering Department",
          "suggested_address_template": "Full physical address with PIN (or placeholder [PIN] if uncertain)",
          "address_confidence": "HIGH" or "LOW",
          "reasoning": "Brief explanation why this authority holds the records"
        }}"""

        user_content = f"Citizen Issue: {user_problem}\nLocation: {location}\nExtracted Facts: {json.dumps(extracted_facts)}\n\nLocation Context:\n{web_context}"

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
            "suggested_address_template": f"Office of the PIO, [Department], {location} - [PIN]",
            "reasoning": "Fallback activated due to server error."
        }

department_resolver = SmartDepartmentResolver()
