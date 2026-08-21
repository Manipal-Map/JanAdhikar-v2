import axios from 'axios'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || '', 
  timeout: 60000,
});

export const initCase = () => api.post('/api/case/init').then(r => r.data)
export const classifyCase = (case_id: string, problem_text: string, language: string) => api.post('/api/case/classify', { case_id, problem_text, language }).then(r => r.data)
export const rtiGenerate = (case_id: string, form_data: any) => api.post('/api/rti/generate', { case_id, form_data }).then(r => r.data)
export const resolveDepartment = (case_id: string, location: string | null = null) => api.post('/api/rti/resolve-department', { case_id, location }).then(r => r.data)
export const downloadRtiPdf = (case_id: string) => api.get(`/api/rti/pdf/${case_id}`, { responseType: 'blob' }).then(r => r.data)
export const rtiPredict = (case_id: string, draft_text: string | null = null) => api.post('/api/rti/predict', { case_id, draft_text }).then(r => r.data)
export const rtiImprove = (case_id: string) => api.post('/api/rti/improve', { case_id }).then(r => r.data)

export const transcribeAudio = (audioBlob: Blob, language: string) => {
  const formData = new FormData()
  formData.append('audio_file', audioBlob, 'recording.webm')
  formData.append('language', language)
  return api.post('/api/transcribe', formData).then(r => r.data)
}
export const downloadGenericPdf = (title: string, content: string) => {
  return api.post('/api/generate-pdf', { title, content }, { responseType: 'blob' })
    .then(r => r.data)
}

export const grievanceGenerate = (payload: any) => {
  return api.post('/api/grievance/generate', payload).then(r => r.data)
}

export const getCase = (case_id: string) => api.get(`/api/case/${case_id}`).then(r => r.data)

export const intakeChat = (payload: any) => api.post('/api/intake/chat', payload).then(r => r.data)

export default api
