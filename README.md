<div align="center">

# ⚖️ Janअधिकार 

### *जन अधिकार — The People's Right*

**An autonomous, local-first legal engine empowering Indian citizens to draft RTI applications, administrative grievances, and statutory appeals — privately, instantly, and with zero bureaucracy.**

![Status](https://img.shields.io/badge/Status-Active_Development-881337?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-0F172A?style=for-the-badge)
![Tech Stack](https://img.shields.io/badge/Tech-Next.js_|_FastAPI_|_Groq-065F46?style=for-the-badge)
![Made for](https://img.shields.io/badge/Made_For-Indian_Citizens-FF9933?style=for-the-badge)

<br/>
<p align="center">
  <a href="#what-is-janadhikar">Overview</a> •
  <a href="#core-features">Features</a> •
  <a href="#architecture--workflow">Architecture</a> •
  <a href="#the-passkey-privacy-model">Privacy Model</a> •
  <a href="#local-setup">Setup</a>
</p>

</div>

---

## 🏛️ What is JanAdhikar?

Filing an RTI or a formal grievance in India today usually requires paying an agent, copy-pasting vague templates from the internet, or giving up due to bureaucratic friction.

**JanAdhikar** changes this. It takes a plain-language description of a civic problem (e.g., *"My road hasn't been repaired for 7 months despite the tender passing"*) and transforms it into a **legally structured, statute-aware document**. 

Built on the principle of absolute privacy, the system requires **no user accounts, no phone numbers, and no tracking**. Your case is yours alone.

---

## ✨ Core Features

| Feature | Description |
| :--- | :--- |
| 🛡️ **Zero-Account Privacy** | Cases are bound to a generated, localized 12-character **Passkey**. The server stores no profiles, phone numbers, or email addresses. |
| 🧠 **AI Legal Triage** | Powered by Groq (`llama-3.3-70b`), the engine automatically classifies your issue into the correct legal route (RTI vs. Consumer Grievance). |
| 🎙️ **Voice Intake (Hinglish Support)** | Describe your issue naturally via microphone. The system transcribes English, Hindi, and Hinglish using Whisper. |
| 🏢 **Auto-Jurisdiction Mapping** | Automatically resolves the correct Public Information Officer (PIO) or Government Department based on your location and issue. |
| ⚖️ **RTI Risk Predictor** | Analyzes drafted RTIs against Section 8/9 exemptions of the RTI Act to predict the likelihood of rejection, offering auto-improvements. |
| ⏱️ **SLA & Penalty Tracker** | A dedicated Post-Filing dashboard to monitor the statutory 30-day mandate and calculate daily Section 20(1) financial penalties on defaulting PIOs[cite: 1]. |
| 📜 **Auto-Appellate Studio** | Automatically parses evasive PIO replies and generates watertight Section 19(1) First Appeal documents citing relevant CIC precedents[cite: 1]. |

---

## ⚙️ Architecture & Workflow

JanAdhikar guides citizens through a strict, deterministic legal pipeline. Every output is structurally verified for legal admissibility.

```mermaid
graph TD
    %% Styling
    classDef user input fill:#0F172A,stroke:#FF9933,color:#fff,stroke-width:2px;
    classDef engine fill:#881337,stroke:#0F172A,color:#fff,stroke-width:2px;
    classDef track fill:#065F46,stroke:#0F172A,color:#fff,stroke-width:2px;

    A[🗣️ Voice / Text Problem Intake] ::: user --> B{🧭 AI Legal Triage Engine} ::: engine
    B -->|RTI Route| C[🔑 Secure Passkey Generated] ::: user
    B -->|Grievance Route| C
    
    C --> D[⚖️ Exemption Risk Analysis] ::: engine
    D --> E[📄 Auto-Draft Statutory Document] ::: engine
    E --> F[⬇️ Export Court-Ready PDF] ::: user
    
    F --> G{⏱️ 30-Day SLA Tracker} ::: track
    G -->|No Reply / Denied| H[📜 Auto-Draft Sec 19 1 First Appeal] ::: engine
    G -->|Resolved| I[✅ Case Closed] ::: track
