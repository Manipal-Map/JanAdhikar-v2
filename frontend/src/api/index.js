import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  timeout: 60000,
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

// ── RTI Generate ───────────────────────────────────────────────────────────
export const rtiGenerate = (case_id, form_data) =>
  api.post('/api/rti/generate', { case_id, form_data }).then((r) => r.data)

// ── RTI Department/Jurisdiction Resolve ─────────────────────────────────────
export const resolveDepartment = (case_id, location = null) =>
  api.post('/api/rti/resolve-department', { case_id, location }).then((r) => r.data)

// ── RTI PDF download (returns a blob) ───────────────────────────────────────
export const downloadRtiPdf = (case_id) =>
  api.get(`/api/rti/pdf/${case_id}`, { responseType: 'blob' })
     .then((r) => r.data)

// ── RTI Risk Predict ───────────────────────────────────────────────────────
export const rtiPredict = (case_id, draft_text = null) =>
  api.post('/api/rti/predict', { case_id, draft_text }).then((r) => r.data)

// ── RTI Improve (remold) ───────────────────────────────────────────────────
export const rtiImprove = (case_id) =>
  api.post('/api/rti/improve', { case_id }).then((r) => r.data)

// ── Grievance Generate (Handles Image Upload) ──────────────────────────────
export const grievanceGenerate = (payload) =>
  api.post('/api/grievance/generate', payload, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }).then((r) => r.data)

// ── Get full case state ────────────────────────────────────────────────────
export const getCase = (case_id) =>
  api.get(`/api/case/${case_id}`).then((r) => r.data)

export default api
