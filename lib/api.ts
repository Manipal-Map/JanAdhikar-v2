import axios from 'axios'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || '', 
  timeout: 60000,
});

export const initCase = () => api.post('/api/case/init').then(r => r.data)
export const classifyCase = (case_id, problem_text, language) => api.post('/api/case/classify', { case_id, problem_text, language }).then(r => r.data)
export const rtiGenerate = (case_id, form_data) => api.post('/api/rti/generate', { case_id, form_data }).then(r => r.data)
export const resolveDepartment = (case_id, location = null) => api.post('/api/rti/resolve-department', { case_id, location }).then(r => r.data)
export const downloadRtiPdf = (case_id) => api.get(`/api/rti/pdf/${case_id}`, { responseType: 'blob' }).then(r => r.data)
export const rtiPredict = (case_id, draft_text = null) => api.post('/api/rti/predict', { case_id, draft_text }).then(r => r.data)
export const rtiImprove = (case_id) => api.post('/api/rti/improve', { case_id }).then(r => r.data)

// Pass the language down to the audio transcriber so it knows to output Hinglish!
export const transcribeAudio = (audioBlob, language) => {
  const formData = new FormData()
  formData.append('audio_file', audioBlob, 'recording.webm')
  formData.append('language', language)
  return api.post('/api/transcribe', formData).then(r => r.data)
}
export const downloadGenericPdf = (title, content) => {
  return api.post('/api/generate-pdf', { title, content }, { responseType: 'blob' })
    .then(r => r.data)
}

export const grievanceGenerate = (payload) => {
  return api.post('/api/grievance/generate', payload).then(r => r.data)
}

export const getCase = (case_id) => api.get(`/api/case/${case_id}`).then(r => r.data)

export default api
