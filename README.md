# JanAdhikar

JanAdhikar is a local-first legal engine designed for Indian citizens to generate RTI applications and administrative grievance notices. The platform prioritizes privacy—no user accounts, no tracking—using private browser-based sessions secured by a local Passkey.

---

## Architecture Flow

The system follows a linear path to ensure that users are guided from a raw description of their problem to a legally viable document.

```mermaid
graph TD
    A[Raw Problem Description] --> B{Classification Engine}
    B -->|RTI| C[Passkey Generation]
    B -->|Grievance| C
    C --> D[Personal Info Intake]
    D --> E[Legal Analysis & Risk Factors]
    E --> F[Document Drafting]
    F --> G[PDF Download / Portal Filing]
    Core Features
1. Privacy-By-Design
We do not store user profiles on a server.

Passkey System: Every case is secured locally in your browser. If you navigate away, your case ID is your only key to retrieve the session.

Encryption: Data is handled client-side or transiently on the server; it is never mapped to PII (Personally Identifiable Information) like phone numbers or email addresses.

2. Legal Intelligence
Auto-Resolution: The backend automatically identifies the relevant government department or authority based on the user's issue and jurisdiction.

Risk Predictor: For RTI applications, the AI runs a risk assessment against Section 8/9 exemptions of the RTI Act to predict approval likelihood.

Contextual Drafting: Instead of using static templates, the system synthesizes official statutory language and relevant consumer rights specific to the user's grievance.

Project Structure
/frontend: React application using Tailwind CSS.

Theme: Court Maroon (#881337) and Ashoka Navy (#0F172A).

/backend: FastAPI service.

Handles LLM integration.

Performs internet parsing to resolve department addresses.

Manages persistent case storage via Supabase.

Local Setup
Prerequisites
Python 3.10+

Node.js 18+

Supabase Account (for persistence)

Serper.dev API Key (for address resolution)

Quick Start
Clone the repo:

Bash
git clone [https://github.com/yourusername/janadhikar.git](https://github.com/yourusername/janadhikar.git)
cd janadhikar
Setup Backend:

Bash
cd backend
pip install -r requirements.txt
# Create a .env file with your API keys
uvicorn main:app --reload
Setup Frontend:

Bash
cd frontend
npm install
npm run dev
Important Disclaimer
This is a legal drafting tool, not a law firm.
JanAdhikar generates documents using AI models. While we use official standards for RTI and Grievance notices, users must:

Verify all facts, dates, and names before submission.

Ensure the generated application is addressed to the correct PIO/Office.

Consult a legal professional for complex disputes.

This is an AI-generated document; verify thoroughly before submission.

Built for the Indian Citizen.
