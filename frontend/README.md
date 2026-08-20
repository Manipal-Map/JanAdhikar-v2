# CivicRoute — Frontend Dashboard

A React + Vite dashboard that connects to the [CivicRoute FastAPI backend](https://github.com/anmolsrivastava073/civicroute).

## Stack

| Layer     | Tech                                              |
|-----------|---------------------------------------------------|
| Framework | React 18 + Vite 5                                 |
| Styling   | Tailwind CSS 3 + custom utility classes           |
| Animation | Framer Motion                                     |
| Charts    | Recharts (radial bar for RTI risk meter)          |
| State     | Zustand (global case state machine)               |
| HTTP      | Axios (proxy → FastAPI on :8000)                  |

## Project Structure

```
src/
├── api/
│   └── index.js          ← All API calls (init, classify, chat, predict, improve, grievance)
├── store/
│   └── caseStore.js      ← Zustand state machine
├── components/
│   ├── CaseIdBadge.jsx
│   ├── ChatInterface.jsx
│   ├── DraftViewer.jsx   ← Copy / Download / Print
│   ├── FactChecklist.jsx
│   ├── PipelineTracker.jsx
│   ├── RiskCard.jsx
│   └── RiskMeter.jsx     ← Recharts radial gauge
└── views/
    ├── GatewayView.jsx    ← Landing / init + classify
    ├── RTIView.jsx        ← 3-panel RTI dashboard
    ├── GrievanceView.jsx  ← Grievance chat + demand pack
    └── OutOfScopeView.jsx ← Graceful out-of-scope page
```

## Setup

### 1. Start the Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn backend.app:app --reload --port 8000
```

### 2. Start the Frontend

```bash
cd civicroute-frontend
npm install
npm run dev
```

Open **http://localhost:5173** — requests to `/api/*` are proxied to `http://localhost:8000`.

## Pipeline Flow

```
User types problem
      ↓
POST /api/case/init         → case_id
POST /api/case/classify     → route (RTI | Rights/Grievance | Other)
      ↓
  ┌─ RTI ──────────────────────────────────────────────────────────┐
  │  Fill form / chat → POST /api/chat/continue (multi-turn)       │
  │  POST /api/rti/predict  → risk probabilities + detected risks  │
  │  POST /api/rti/improve  → remolded RTI draft                   │
  └────────────────────────────────────────────────────────────────┘
  ┌─ Rights/Grievance ─────────────────────────────────────────────┐
  │  Chat → POST /api/chat/continue (info gathering)               │
  │  POST /api/grievance/analyze → legal analysis + demand notice  │
  └────────────────────────────────────────────────────────────────┘
  └─ Other → Out-of-scope notice (no further API calls)
```
