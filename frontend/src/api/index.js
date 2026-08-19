import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  timeout: 60000,
})

export const initCase = () => api.post('/api/case/init').then(r => r.data)
export const classifyCase = (case_id, problem_text, language) => api.post('/api/case/classify', { case_id, problem_text, language }).then(r => r.data)
export const rtiGenerate = (case_id, form_data) => api.post('/api/rti/generate', { case_id, form_data }).then(r => r.data)
export const resolveDepartment = (case_id, location = null) => api.post('/api/rti/resolve-department', { case_id, location }).then(r => r.data)
export const downloadRtiPdf = (case_id) => api.get(`/api/rti/pdf/${case_id}`, { responseType: 'blob' }).then(r => r.data)
export const rtiPredict = (case_id, draft_text = null) => api.post('/api/rti/predict', { case_id, draft_text }).then(r => r.data)
export const rtiImprove = (case_id) => api.post('/api/rti/improve', { case_id }).then(r => r.data)

export const transcribeAudio = (audioBlob) => {
  const formData = new FormData()
  formData.append('audio_file', audioBlob, 'recording.webm')
  return api.post('/api/transcribe', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }).then(r => r.data)
}

export const grievanceGenerate = (payload) =>
  api.post('/api/grievance/generate', payload, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }).then((r) => r.data)

export default api
