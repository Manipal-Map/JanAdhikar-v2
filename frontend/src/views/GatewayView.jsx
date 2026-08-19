import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, ArrowRight, Shield, Scale, FileSearch, Loader2, AlertCircle } from 'lucide-react'
import useCaseStore from '../store/caseStore'
import { initCase, classifyCase } from '../api'
import CaseIdBadge from '../components/CaseIdBadge'

const FEATURES = [
  { icon: FileSearch, label: 'RTI Filing',      desc: 'Predict outcomes & remold your RTI application.' },
  { icon: Scale,      label: 'Legal Grievance', desc: 'Generate demand notices & filing guidance.' },
  { icon: Shield,     label: 'AI Risk Analysis', desc: 'Know your chances before you file.' },
]

export default function GatewayView() {
  const [text, setText]     = useState('')
  const [localErr, setLocalErr] = useState(null)

  const {
    stage, setStage, caseId, setCaseId,
    setClassifyResult, isLoading, setIsLoading, setError,
  } = useCaseStore()

  const isSubmitting = stage === 'INITIALIZING' || stage === 'CLASSIFYING'

  const handleSubmit = async () => {
    if (!text.trim() || isSubmitting) return
    setLocalErr(null)
    setError(null)

    try {
      // 1. Init case
      setStage('INITIALIZING')
      const { case_id } = await initCase()
      setCaseId(case_id)

      // 2. Classify
      setStage('CLASSIFYING')
      const result = await classifyCase(case_id, text.trim())
      setClassifyResult(result)

      // 3. Branch
      if (result.route === 'RTI')                setStage('RTI_GATHERING')
      else if (result.route === 'Rights/Grievance') setStage('GRIEVANCE_GATHERING')
      else                                        setStage('OUT_OF_SCOPE')
    } catch (err) {
      const msg = err?.response?.data?.detail || err.message || 'Something went wrong.'
      setLocalErr(msg)
      setError(msg)
      setStage('IDLE')
    }
  }

  return (
    <div className="gradient-bg min-h-screen flex flex-col">
      {/* Nav */}
      <header className="px-6 py-5 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-brand-blue/20 flex items-center justify-center border border-brand-blue/30">
            <Scale size={16} className="text-brand-blue" />
          </div>
          <span className="font-bold text-white tracking-tight">CivicRoute</span>
          <span className="text-xs text-slate-500 bg-navy-700 px-2 py-0.5 rounded-full">AI Beta</span>
        </div>
        <a
          href="https://github.com/anmolsrivastava073/civicroute"
          target="_blank"
          rel="noreferrer"
          className="btn-ghost text-xs"
        >
          GitHub ↗
        </a>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-2xl mx-auto text-center"
        >
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand-blue/10 border border-brand-blue/20 rounded-full text-sm text-blue-400 font-medium mb-8">
            <Sparkles size={14} />
            <span>AI-Powered Civic Legal Intelligence</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight mb-5">
            Describe your problem.
            <br />
            <span className="text-brand-blue">We'll handle the legal route.</span>
          </h1>

          <p className="text-slate-400 text-lg mb-10 leading-relaxed">
            File RTI applications, resolve consumer grievances, or enforce civic rights — 
            powered by AI trained on Indian legal frameworks.
          </p>

          {/* Case ID badge */}
          <AnimatePresence>
            {caseId && (
              <div className="mb-4 flex justify-center">
                <CaseIdBadge caseId={caseId} />
              </div>
            )}
          </AnimatePresence>

          {/* Input card */}
          <div className="glass-card p-6 text-left">
            <label className="block text-sm font-semibold text-slate-300 mb-3">
              Describe your problem or grievance
            </label>
            <textarea
              rows={5}
              value={text}
              onChange={(e) => setText(e.target.value)}
              disabled={isSubmitting}
              placeholder="e.g. I want certified copies of the tender inspection reports for road construction in Ward 12. The contractor was awarded ₹40 Lakh but the road is already broken after 3 months..."
              className="input-field resize-none text-sm leading-relaxed mb-4"
            />

            {/* Error */}
            <AnimatePresence>
              {localErr && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/25 rounded-xl mb-4 text-sm text-red-400"
                >
                  <AlertCircle size={15} className="mt-0.5 flex-shrink-0" />
                  <span>{localErr}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Stage label during processing */}
            {isSubmitting && (
              <div className="flex items-center gap-2 text-sm text-slate-400 mb-4">
                <Loader2 size={14} className="animate-spin text-brand-blue" />
                <span>
                  {stage === 'INITIALIZING' ? 'Creating case…' : 'Classifying your problem with AI…'}
                </span>
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={!text.trim() || isSubmitting}
              className="btn-primary w-full justify-center text-base py-3"
            >
              {isSubmitting ? (
                <><Loader2 size={16} className="animate-spin" /> Processing…</>
              ) : (
                <>Analyze My Case <ArrowRight size={16} /></>
              )}
            </button>
          </div>

          {/* Feature pills */}
          <div className="grid grid-cols-3 gap-3 mt-8">
            {FEATURES.map(({ icon: Icon, label, desc }) => (
              <div key={label} className="glass-card p-4 text-left">
                <Icon size={18} className="text-brand-blue mb-2" />
                <p className="text-xs font-semibold text-white mb-1">{label}</p>
                <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </main>
    </div>
  )
}
