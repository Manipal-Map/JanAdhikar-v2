'use client';
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FileSearch, ArrowRight, Loader2, ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import useCaseStore from '@/store/caseStore'
import { rtiGenerate, resolveDepartment } from '@/lib/api'

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
    <div 
      className="min-h-screen flex flex-col items-center justify-center p-4 py-12 bg-cover bg-center bg-no-repeat relative text-slate-200 font-sans"
      style={{ backgroundImage: "url('/bg.image.png')" }}
    >
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-2xl relative z-10">
        
        <div className="mb-3">
          <span className="text-xs font-bold uppercase font-sans tracking-tight text-[#FF9933] bg-[#A32A02]/20 px-3 py-1 rounded-full border border-[#A32A02]/30">
            STEP 2 · Applicant Details
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-2 tracking-tight drop-shadow-md">
          Who is filing this RTI?
        </h1>
        <p className="text-blue-100 mb-8 font-medium drop-shadow-sm">
          Enter your contact details below. Our AI will automatically construct the RTI questions and statutory application clauses.
        </p>

        <form onSubmit={handleSubmit} className="bg-[#0F172A]/85 backdrop-blur-md border border-white/10 rounded-3xl p-8 shadow-2xl space-y-6">
          {INTAKE_FIELDS.map((field) => (
            <div key={field.key} className="space-y-2 text-left">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                {field.label}
              </label>
              <input
                type="text"
                required
                value={localForm[field.key] || ''}
                onChange={(e) => handleChange(field.key, e.target.value)}
                placeholder={field.placeholder}
                className="w-full bg-[#1E293B]/60 border border-slate-600 rounded-xl px-4 py-3.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#FF9933] focus:border-[#FF9933] transition-all text-sm font-medium"
              />
            </div>
          ))}

          {resolvingDept && (
            <div className="flex items-center gap-2 text-xs text-slate-300 bg-[#1E293B]/60 p-3 rounded-xl border border-slate-700 font-medium">
              <Loader2 size={14} className="animate-spin text-[#FF9933]" />
              <span>AI is auto-filling jurisdictional details for your RTI...</span>
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t border-slate-700/60">
            <button type="button" onClick={() => { setStage('IDLE'); router.push('/dashboard'); }} className="btn-ghost text-sm cursor-pointer bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700">
              <ArrowLeft size={16} /> Back
            </button>
            <button type="submit" disabled={loading || resolvingDept} className="btn-primary text-base py-3 px-8 cursor-pointer bg-[#A32A02] hover:bg-[#138808] transition-colors text-white font-bold rounded-xl shadow-md">
              {loading ? <><Loader2 size={18} className="animate-spin" /> Drafting...</> : <>Generate Application <ArrowRight size={18} /></>}
            </button>
          </div>
        </form>

      </motion.div>
    </div>
  )
}
