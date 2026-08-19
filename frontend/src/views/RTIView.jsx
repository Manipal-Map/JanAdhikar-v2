import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FileSearch, ArrowRight, Loader2, ArrowLeft, Building2, MapPin } from 'lucide-react'
import useCaseStore from '../store/caseStore'
import { rtiGenerate, resolveDepartment } from '../api'

export default function RTIView() {
  const { caseId, classifyResult, formData, setFormData, setRtiDraft, setDepartmentInfo, setStage } = useCaseStore()
  const [localForm, setLocalForm] = useState({})
  const [loading, setLoading] = useState(false)
  const [resolvingDept, setResolvingDept] = useState(true)

  const schema = classifyResult?.form_schema || [
    { key: 'applicant_name', label: 'Full Name', placeholder: 'Enter your full name' },
    { key: 'applicant_address', label: 'Permanent Address', placeholder: 'Enter your complete address' },
    { key: 'applicant_city', label: 'City / District', placeholder: 'e.g. Jaipur' },
    { key: 'applicant_state', label: 'State', placeholder: 'e.g. Rajasthan' },
    { key: 'applicant_contact', label: 'Phone Number / Email', placeholder: 'Enter contact details' }
  ]

  useEffect(() => {
    // Auto-resolve department info in background
    const initDept = async () => {
      try {
        const dept = await resolveDepartment(caseId)
        setDepartmentInfo(dept)
      } catch (e) {
        console.error("Dept resolve error", e)
      } finally {
        setResolvingDept(false)
      }
    }
    initDept()
  }, [caseId])

  const handleChange = (key, val) => {
    setLocalForm(prev => ({ ...prev, [key]: val }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      setFormData(localForm)
      const res = await rtiGenerate(caseId, localForm)
      setRtiDraft(res.initial_draft)
      setStage('PREDICTING')
    } catch (err) {
      alert(err?.response?.data?.detail || "Failed to generate RTI draft.")
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
          Applicant Information
        </h1>
        <p className="text-slate-500 mb-8">
          Provide your details so the AI can format a legally binding RTI Application under Section 6(1).
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
                placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
                className="w-full bg-[#FAF8F5] border border-slate-300 rounded-xl px-4 py-3.5 text-ashoka-navy placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-court-maroon/30 focus:border-court-maroon transition-all text-sm font-medium"
              />
            </div>
          ))}

          {resolvingDept && (
            <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <Loader2 size={14} className="animate-spin text-court-maroon" />
              <span>AI is resolving the target public authority jurisdiction in the background...</span>
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button type="button" onClick={() => setStage('IDLE')} className="btn-ghost text-sm">
              <ArrowLeft size={16} /> Back
            </button>
            <button type="submit" disabled={loading} className="btn-primary text-base py-3 px-8 cursor-pointer">
              {loading ? <><Loader2 size={18} className="animate-spin" /> Drafting RTI...</> : <>Generate RTI Application <ArrowRight size={18} /></>}
            </button>
          </div>
        </form>

      </motion.div>
    </div>
  )
}
