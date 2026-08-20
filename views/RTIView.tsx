'use client';
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FileSearch, ArrowRight, Loader2, ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import useCaseStore from '@/store/caseStore'
import { rtiGenerate, resolveDepartment } from '@/lib/api'

// We define a strict, clean schema. 
// The AI backend will now infer all technical legal questions/clauses automatically.
const INTAKE_FIELDS = [
  { key: 'applicant_name', label: 'Full Name', placeholder: 'Enter your full name' },
  { key: 'applicant_address', label: 'Permanent Address', placeholder: 'Enter your complete address' },
  { key: 'applicant_city', label: 'City / District', placeholder: 'e.g. Jaipur' },
  { key: 'applicant_state', label: 'State', placeholder: 'e.g. Rajasthan' },
  { key: 'applicant_pincode', label: 'Pincode', placeholder: 'e.g. 302001' },
  { key: 'applicant_contact', label: 'Phone Number', placeholder: 'Enter your contact number' }
]

export default function RTIView() {
  const router = useRouter()
  const { caseId, setFormData, setRtiDraft, setDepartmentInfo, setStage } = useCaseStore()
  const [localForm, setLocalForm] = useState({})
  const [loading, setLoading] = useState(false)
  const [resolvingDept, setResolvingDept] = useState(true)

  useEffect(() => {
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
  }, [caseId, setDepartmentInfo])

  const handleChange = (key, val) => {
    setLocalForm(prev => ({ ...prev, [key]: val }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      setFormData(localForm)
      // The AI will generate the RTI questions/clauses based on the 'user_problem' 
      // already stored in the backend from the GatewayView.
      const res = await rtiGenerate(caseId, localForm)
      setRtiDraft(res.initial_draft)
      setStage('PREDICTING')
      router.push('/dashboard/rti/result')
    } catch (err) {
      alert(err?.response?.data?.detail || "Failed to generate RTI draft.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="gradient-bg min-h-screen flex flex-col items-center justify-center p-4 py-12">
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-2xl">
        
        <div className="mb-3">
          <span className="text-xs font-bold uppercase tracking-widest text-court-maroon bg-court-maroon/10 px-3 py-1 rounded-full border border-court-maroon/20">
            STEP 2 · Applicant Details
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-ashoka-navy mb-2 tracking-tight">
          Who is filing this RTI?
        </h1>
        <p className="text-slate-500 mb-8">
          Enter your contact details below. Our AI will automatically construct the RTI questions and statutory application clauses.
        </p>

        <form onSubmit={handleSubmit} className="bg-white border border-[#b8c2cc] rounded-3xl p-8 shadow-sm space-y-6">
          {INTAKE_FIELDS.map((field) => (
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

          {resolvingDept && (
            <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <Loader2 size={14} className="animate-spin text-court-maroon" />
              <span>AI is auto-filling jurisdictional details for your RTI...</span>
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button type="button" onClick={() => { setStage('IDLE'); router.push('/dashboard'); }} className="btn-ghost text-sm cursor-pointer">
              <ArrowLeft size={16} /> Back
            </button>
            <button type="submit" disabled={loading || resolvingDept} className="btn-primary text-base py-3 px-8 cursor-pointer">
              {loading ? <><Loader2 size={18} className="animate-spin" /> Drafting...</> : <>Generate Application <ArrowRight size={18} /></>}
            </button>
          </div>
        </form>

      </motion.div>
    </div>
  )
}
