import { useState } from 'react'
import { motion } from 'framer-motion'
import { Scale, ArrowRight, Loader2, ArrowLeft, Upload, FileText } from 'lucide-react'
import useCaseStore from '../store/caseStore'
import { grievanceGenerate } from '../api'

export default function GrievanceView() {
  const { caseId, userProblem, setFormData, setGrievanceResult, setStage, language } = useCaseStore()
  const [localForm, setLocalForm] = useState({})
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(false)

  const schema = [
    { key: 'applicant_name', label: 'Full Name', placeholder: 'Enter your full name' },
    { key: 'applicant_address', label: 'Residential Address', placeholder: 'Enter your address' },
    { key: 'applicant_city', label: 'City / District', placeholder: 'e.g. Jaipur' },
    { key: 'applicant_state', label: 'State', placeholder: 'e.g. Rajasthan' },
    { key: 'applicant_contact', label: 'Phone Number / Email', placeholder: 'Enter contact information' }
  ]

  const handleChange = (key, val) => {
    setLocalForm(prev => ({ ...prev, [key]: val }))
  }

  const handleFileChange = (e) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      setFormData(localForm)
      const formDataObj = new FormData()
      formDataObj.append('case_id', caseId)
      formDataObj.append('form_data', JSON.stringify(localForm))
      formDataObj.append('user_problem', userProblem)
      formDataObj.append('language', language)

      files.forEach(f => {
        formDataObj.append('proof_files', f)
      })

      const res = await grievanceGenerate(formDataObj)
      setGrievanceResult(res)
      setStage('COMPLETE')
    } catch (err) {
      alert(err?.response?.data?.detail || "Failed to generate legal notice.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="gradient-bg min-h-screen flex flex-col items-center justify-center p-4 py-12">
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-2xl">
        
        {/* Step Badge */}
        <div className="mb-3">
          <span className="text-xs font-bold uppercase tracking-widest text-court-maroon bg-court-maroon/10 px-3 py-1 rounded-full border border-court-maroon/20">
            STEP 2
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-ashoka-navy mb-2 tracking-tight">
          Complainant Details & Evidence
        </h1>
        <p className="text-slate-500 mb-8">
          Provide your contact details and attach any supporting photos, bills, or notices to empower the legal notice.
        </p>

        <form onSubmit={handleSubmit} className="bg-white border border-[#b8c2cc] rounded-3xl p-8 shadow-sm space-y-6">
          {schema.map((field) => (
            <div key={field.key} className="space-y-2 text-left">
              <label className="block text-xs font-bold text-ashoka-navy uppercase tracking-wider">
                {field.label}
              </label>
              <input
                type="text"
                required
                value={localForm[field.key] || ''}
                onChange={(e) => handleChange(field.key, e.target.value)}
                placeholder={field.placeholder}
                className="w-full bg-[#FAF8F5] border border-slate-300 rounded-xl px-4 py-3.5 text-ashoka-navy placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-court-maroon/30 focus:border-court-maroon transition-all text-sm font-medium"
              />
            </div>
          ))}

          {/* File Upload Box */}
          <div className="space-y-2 text-left pt-2">
            <label className="block text-xs font-bold text-ashoka-navy uppercase tracking-wider">
              Upload Proof / Evidence (Optional)
            </label>
            <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center hover:border-court-maroon transition-colors bg-[#FAF8F5]">
              <input
                type="file"
                multiple
                accept="image/*,.pdf"
                onChange={handleFileChange}
                className="hidden"
                id="proof-upload"
              />
              <label htmlFor="proof-upload" className="cursor-pointer flex flex-col items-center justify-center gap-2">
                <Upload size={24} className="text-court-maroon" />
                <span className="text-sm font-semibold text-ashoka-navy">Click to upload photos or PDFs</span>
                <span className="text-xs text-slate-400">AI Vision will analyze your receipts, bills, or damage photos</span>
              </label>
              {files.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2 justify-center">
                  {files.map((f, i) => (
                    <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-200 text-xs font-medium text-slate-700 rounded-lg shadow-sm">
                      <FileText size={13} className="text-court-maroon" /> {f.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button type="button" onClick={() => setStage('IDLE')} className="btn-ghost text-sm">
              <ArrowLeft size={16} /> Back
            </button>
            <button type="submit" disabled={loading} className="btn-primary text-base py-3 px-8 cursor-pointer">
              {loading ? <><Loader2 size={18} className="animate-spin" /> Analyzing Evidence & Drafting...</> : <>Generate Legal Notice <ArrowRight size={18} /></>}
            </button>
          </div>
        </form>

      </motion.div>
    </div>
  )
}
