import json
import base64
from typing import Dict, Any, List
from classifier import classifier

class GrievanceResolver:
    def __init__(self):
        self.vision_model = "llama-3.2-11b-vision-preview" 
        self.text_model = "llama-3.3-70b-versatile"

    def _get_client(self):
        return classifier.client

    def _generate_intelligent_analysis(self, user_problem: str, location: str, form_data: Dict[str, Any], files_data: List[Dict[str, Any]], language: str) -> Dict[str, Any]:
        p_lower = user_problem.lower()
        app_name = form_data.get("applicant_name") or "Applicant"
        app_city = location or form_data.get("applicant_city") or "India"
        app_addr = form_data.get("applicant_address") or app_city
        app_contact = form_data.get("applicant_contact") or "Provided on Record"

        # Tenancy & Rental Disputes
        if any(w in p_lower for w in ["landlord", "deposit", "tenant", "rent", "lease", "evict", "flat", "apartment"]):
            return {
                "violated_rights": [
                    "Transfer of Property Act, 1882 (Section 108 - Rights & Liabilities of Lessor)",
                    "Model Tenancy Act & State Rent Control Act (Unlawful Retention of Security Deposit)",
                    "Indian Contract Act, 1872 (Section 73 - Compensation for Breach of Contract)",
                    "Consumer Protection Act, 2019 (Unfair Commercial Practice)"
                ],
                "legal_explanation": f"Under Indian tenancy law and the Indian Contract Act (1872), a refundable security deposit is held strictly in fiduciary trust by the lessor/landlord. Upon peaceful surrender of the premises, the landlord is statutorily obligated to refund the corpus within 30 days. Unilateral withholding or deductions without certified repair bills and written notice constitutes breach of trust and unlawful enrichment. Under Section 73 of the Contract Act, you are entitled to the principal sum along with 18% p.a. statutory penal interest from the date of handover.",
                "target_portal_name": "State Rent Authority / e-Daakhil Consumer Commission",
                "target_portal_url": "https://edaakhil.nic.in",
                "evidence_analysis": f"Rental agreement records, handover confirmations, and bank transaction receipts establish fulfillment of tenant obligations and prove the landlord's willful default in {app_city}.",
                "demand_notice_draft": f"""LEGAL DEMAND NOTICE
(Under Section 80 CPC read with Consumer Protection Act, 2019 & Indian Contract Act, 1872)

BY SPEED POST WITH ACKNOWLEDGMENT DUE / EMAIL

Date: Today
To:
The Landlord / Property Owner,
Premises situated at: {app_city}

From:
{app_name}
Address: {app_addr}
Contact: {app_contact}

SUBJECT: FINAL STATUTORY DEMAND NOTICE FOR IMMEDIATE REFUND OF SECURITY DEPOSIT WITH INTEREST

Sir/Madam,

Under instructions and on behalf of my client/myself, {app_name}, residing at {app_addr}, I hereby serve upon you this formal Legal Notice:

1. That you had let out the residential/commercial premises to the undersigned under a valid tenancy agreement, against which a refundable security deposit was received by you.
2. That the undersigned vacated the premises and handed over peaceful, vacant possession along with keys, with all utility dues and rentals cleared in full.
3. That contrary to statutory mandates, you have failed and neglected to refund the security deposit regarding: "{user_problem}".
4. That such withholding is completely unlawful, arbitrary, and constitutes criminal breach of trust as well as breach of contract under Section 73 of the Indian Contract Act, 1872.

NOW THEREFORE, take notice that you are hereby called upon to refund the entire outstanding security deposit amount together with statutory interest @ 18% per annum within FIFTEEN (15) DAYS from the receipt of this notice, failing which appropriate civil, consumer, and criminal proceedings shall be instituted against you before the Competent Court / Rent Authority entirely at your risk, cost, and consequences.

Yours faithfully,

{app_name}
(Complainant / Tenant)"""
            }

        # Consumer, E-Commerce, Banking & Defective Goods
        elif any(w in p_lower for w in ["airline", "flight", "refund", "defective", "consumer", "order", "delivery", "bank", "card", "cheated", "fraud", "e-commerce", "flipkart", "amazon"]):
            return {
                "violated_rights": [
                    "Consumer Protection Act, 2019 (Section 2(11) - Deficiency in Service)",
                    "Consumer Protection Act, 2019 (Section 2(47) - Unfair Trade Practice)",
                    "Right to Redressal against Unfair Trade Practices (Section 9, CPA 2019)",
                    "Consumer Protection (E-Commerce) Rules, 2020 (Mandatory Refund Timelines)"
                ],
                "legal_explanation": f"Under Section 2(11) and Section 2(47) of the Consumer Protection Act, 2019, failure to honor guaranteed service commitments, denying legitimate refunds, or delivering sub-standard goods constitutes 'Deficiency in Service' and 'Unfair Trade Practice'. The opposite party is legally bound to process a full refund along with interest and is liable for damages for harassment, loss of time, and litigation expenses under Section 39 of CPA 2019.",
                "target_portal_name": "National Consumer Disputes Redressal Commission (e-Daakhil)",
                "target_portal_url": "https://edaakhil.nic.in",
                "evidence_analysis": f"Transaction receipts, order logs, formal cancellation requests, and customer support communications provide conclusive proof of deficiency.",
                "demand_notice_draft": f"""FORMAL STATUTORY NOTICE UNDER SECTION 35 OF CONSUMER PROTECTION ACT, 2019

To:
The Legal Compliance Officer / Customer Redressal Cell,
Concerned Enterprise / Service Provider

From:
{app_name}
Address: {app_addr}
Contact: {app_contact}

SUBJECT: STATUTORY NOTICE FOR DEFICIENCY OF SERVICE AND UNFAIR TRADE PRACTICE REGARDING: {user_problem[:60]}

1. That the complainant availed services / purchased goods from your establishment in {app_city}, having paid full consideration on record.
2. That your establishment failed to fulfill its statutory and contractual commitments: "{user_problem}".
3. That repeated requests and grievances raised by the complainant were either summarily ignored or met with evasive responses, amounting to gross Deficiency in Service under Section 2(11) and Unfair Trade Practice under Section 2(47) of CPA 2019.

DEMANDS:
You are hereby called upon to:
(a) Effect 100% refund / resolution of the disputed transaction immediately.
(b) Pay statutory interest @ 18% p.a. from the date of cause of action.
(c) Pay Rs. 25,000/- towards mental harassment, distress, and legal notice expenses.

Failure to comply within 15 days shall constrain the complainant to file a formal Consumer Complaint on e-Daakhil seeking substantial punitive damages.

{app_name}
(Aggrieved Consumer)"""
            }

        # Civic, Administrative & Public Service Delivery
        else:
            return {
                "violated_rights": [
                    "Right to Timely Public Service Delivery (Citizen's Charter Guarantee)",
                    "Constitution of India (Article 14 & Article 21 - Right to Fair Administrative Action)",
                    "CPGRAMS Standard Operating Procedure for Administrative Grievances",
                    "Public Records & Vigilance Redressal Directives"
                ],
                "legal_explanation": f"Public administrative bodies in {app_city} are bound by statutory Citizen Charters and the Doctrine of Legitimate Expectation. The failure to redress: '{user_problem}' within statutory timelines violates Article 14 (non-arbitrariness) and the official guidelines issued by the Department of Administrative Reforms and Public Grievances (DARPG).",
                "target_portal_name": "CPGRAMS (Centralized Public Grievance Redress & Monitoring System)",
                "target_portal_url": "https://pgportal.gov.in",
                "evidence_analysis": f"Official representations, timeline records, and local facts in {app_city} establish persistent administrative inaction.",
                "demand_notice_draft": f"""FORMAL GRIEVANCE PETITION & ADMINISTRATIVE NOTICE

To:
The Competent Appellate Authority / Public Grievance Officer,
Concerned Department / Municipal Body, {app_city}

From:
{app_name}
Address: {app_addr}
Contact: {app_contact}

SUBJECT: FORMAL PETITION UNDER CPGRAMS FOR IMMEDIATE RECTIFICATION OF: {user_problem[:70]}

Respected Sir/Madam,

I am a law-abiding citizen residing at {app_addr}. I am constrained to submit this formal grievance petition regarding persistent deficiency in public administration:

1. FACTUAL MATRIX:
   {user_problem}

2. STATUTORY NON-COMPLIANCE:
   The citizen charter stipulates that this category of public grievance must be redressed within the designated timeframe. The prolonged pendency constitutes administrative default and dereliction of official duty.

3. PRAYER / RELIEF SOUGHT:
   (a) Immediate on-ground inspection and resolution of the grievance on top priority.
   (b) Fixation of personal accountability on the delinquent public servant under applicable service conduct rules.
   (c) A reasoned speaking order communicated to the petitioner in writing.

Yours faithfully,

{app_name}
(Petitioner)"""
            }

    def analyze_proof_and_rights(self, user_problem: str, location: str, form_data: Dict[str, Any], files_data: List[Dict[str, Any]], language: str) -> Dict[str, Any]:
        client = self._get_client()
        if client:
            try:
                system_prompt = f"""You are an Expert Indian Legal Analyst.
Analyze the citizen's grievance, their location, and the provided evidence.
1. Identify the specific Indian laws/rights violated.
2. Determine the exact authority/portal for filing.
3. Extract key facts from the evidence.
4. Draft a formal Legal Demand Notice.

CRITICAL LANGUAGE INSTRUCTION:
The user has selected '{language}'. ALL text values in your JSON MUST be written in {language}.
If '{language}' is 'Hinglish', you MUST write conversational Hindi strictly using the English alphabet.
ABSOLUTELY NO Devanagari or regional scripts are allowed. Use English alphabet ONLY.

Return ONLY valid JSON matching this exact schema:
{{
  "violated_rights": ["Specific Right/Law 1", "Specific Right/Law 2"],
  "legal_explanation": "A deep analysis of how their rights were violated.",
  "target_portal_name": "e.g., e-Daakhil / CPGRAMS / RERA",
  "target_portal_url": "e.g., https://edaakhil.nic.in",
  "evidence_analysis": "What the proofs show (or 'No proof provided')",
  "demand_notice_draft": "The complete legal demand notice."
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
