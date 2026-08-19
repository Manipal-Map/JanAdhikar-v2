import axios from 'axios'

const api = axios.create({
  baseURL: '',
  timeout: 60000,
  headers: { 'Content-Type': 'application/json' },
})

// ── Case Init ──────────────────────────────────────────────────────────────
export const initCase = () =>
  api.post('/api/case/init').then((r) => r.data)

// ── Case Classify ──────────────────────────────────────────────────────────
export const classifyCase = (case_id, problem_text) =>
  api.post('/api/case/classify', { case_id, problem_text }).then((r) => r.data)

// ── Chat Continue (info gathering) ─────────────────────────────────────────
export const chatContinue = (case_id, message) =>
  api.post('/api/chat/continue', { case_id, message }).then((r) => r.data)

// ── RTI Generate  (form submit → creates initial_draft on server) ──────────
// Backend: POST /api/rti/generate  { case_id, form_data }
// Returns: { case_id, initial_draft }
export const rtiGenerate = (case_id, form_data) =>
  api.post('/api/rti/generate', { case_id, form_data }).then((r) => r.data)

// ── RTI Risk Predict ───────────────────────────────────────────────────────
// Backend reads initial_draft from the case; draft_text is optional override
export const rtiPredict = (case_id, draft_text = null) =>
  api.post('/api/rti/predict', { case_id, draft_text }).then((r) => r.data)

// ── RTI Improve (remold) ───────────────────────────────────────────────────
export const rtiImprove = (case_id) =>
  api.post('/api/rti/improve', { case_id }).then((r) => r.data)

// ── Grievance Generate (form/chat → demand notice + filing guide) ──────────
// Backend: POST /api/grievance/generate  { case_id, form_data }
// Returns: { case_id, legal_analysis, demand_notice_draft, filing_portal_guide }
export const grievanceGenerate = (case_id, form_data = {}) =>
  api.post('/api/grievance/generate', { case_id, form_data }).then((r) => r.data)

// ── Get full case state ────────────────────────────────────────────────────
export const getCase = (case_id) =>
  api.get(`/api/case/${case_id}`).then((r) => r.data)

export default api
