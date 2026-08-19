import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, ArrowRight, Shield, Scale, FileSearch, Loader2, AlertCircle, CheckCircle2, RotateCcw, HelpCircle } from 'lucide-react'
import useCaseStore from '../store/caseStore'
import { initCase, classifyCase } from '../api'
import CaseIdBadge from '../components/CaseIdBadge'

const ROUTE_DESCRIPTIONS = {
  RTI: {
    title: 'Right to Information (RTI) Application',
    badge: 'Statutory RTI Filing',
    color: 'blue',
    icon: FileSearch,
    description: 'You are requesting official government records, tender documents, inspection reports, sanction orders, or file movements under the Right to Information Act, 2005.',
    actionText: 'Confirm & Proceed to RTI Application',
  },
  'Rights/Grievance': {
    title: 'Consumer / Administrative Grievance',
    badge: 'Legal Dispute / Relief',
    color: 'amber',
    icon: Scale,
    description: 'You are seeking dispute resolution, refunds, compensation, or action against service deficiency (e.g. tenant deposit withheld, defective product, unpaid salary, or municipal complaint).',
    actionText: 'Confirm & Generate Legal Demand Notice',
  },
  Other: {
    title: 'General or Out of Scope Query',
    badge: 'Outside Platform Scope',
    color: 'slate',
    icon: HelpCircle,
    description: 'This problem falls outside statutory RTI and administrative consumer grievance frameworks.',
    actionText: 'View Guidance & Resources',
  }
}

export default function GatewayView() {
  const [text, setText] = useState('')
  const [localErr, setLocalErr] = useState(null)

  const {
    stage, setStage, caseId, setCaseId,
    classifyResult, setClassifyResult,
    setUserProblem,
    reset
  } = useCaseStore()

  const isClassifying = stage === 'INITIALIZING' || stage === 'CLASSIFYING'
  const isClassified = stage === 'CLASSIFIED_CONFIRM' && classifyResult

  const handleClassify = async () => {
    if (!text.trim() || isClassifying) return
    setLocalErr(null)

    try {
      setStage('INITIALIZING')
      const { case_id } = await initCase()
      setCaseId(case_id)
      setUserProblem(text.trim())

      setStage('CLASSIFYING')
      const result = await classifyCase(case_id, text.trim())
      setClassifyResult(result)

      // Hold at confirmation gate
      setStage('CLASSIFIED_CONFIRM')
    } catch (err) {
      const msg = err?.response?.data?.detail || err.message || 'Something went wrong.'
      setLocalErr(msg)
      setStage('IDLE')
    }
  }

  const handleConfirmRoute = () => {
    if (!classifyResult) return
    if (classifyResult.route === 'RTI') {
      setStage('RTI_GATHERING')
    } else if (classifyResult.route === 'Rights/Grievance') {
      setStage('GRIEVANCE_GATHERING')
    } else {
      setStage('OUT_OF_SCOPE')
    }
  }

  const currentRouteMeta = classifyResult ? (ROUTE_DESCRIPTIONS[classifyResult.route] || ROUTE_DESCRIPTIONS.Other) : null
  const RouteIcon = currentRouteMeta?.icon || FileSearch

  return (
    <div className="gradient-bg min-h-screen flex flex-col">
      {/* Header */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shadow-sm">
            <Scale size={18} />
          </div>
          <div>
            <span className="font-bold text-slate-900 text-lg tracking-tight">CivicRoute</span>
            <span className="ml-2 text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
              AI Legal Intelligence
            </span>
          </div>
        </div>
        {caseId && <CaseIdBadge caseId={caseId} />}
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-2xl mx-auto">
          
          <AnimatePresence mode="wait">
            {!isClassified ? (
              /* ── Step 1: Input Screen ── */
              <motion.div
                key="input-screen"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-center"
              >
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-blue-50 border border-blue-200 rounded-full text-xs font-semibold text-blue-700 mb-6 shadow-sm">
                  <Sparkles size={14} />
                  <span>Free Citizen Assistance · Indian Legal & RTI Frameworks</span>
                </div>

                <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 leading-tight mb-4">
                  Describe your civic or legal problem.
                  <br />
                  <span className="text-blue-600">AI finds the department & drafts the filing.</span>
                </h1>

                <p className="text-slate-600 text-base mb-8 max-w-xl mx-auto leading-relaxed">
                  You don't need to know government department names, PIO addresses, or complex legal clauses. Tell us what happened in plain words.
                </p>

                <div className="glass-card p-6 text-left shadow-md">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    What issue or record do you need help with?
                  </label>
                  <textarea
                    rows={5}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    disabled={isClassifying}
                    placeholder="e.g., The road in Ward 8 of Jaipur was constructed 2 months ago for ₹35 Lakhs but already has huge potholes. I want the certified tender documents, contractor details, and inspection reports..."
                    className="input-field resize-none text-sm leading-relaxed mb-4"
                  />

                  {localErr && (
                    <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl mb-4 text-sm text-red-700">
                      <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                      <span>{localErr}</span>
                    </div>
                  )}

                  <button
                    onClick={handleClassify}
                    disabled={!text.trim() || isClassifying}
                    className="btn-primary w-full justify-center text-sm py-3"
                  >
                    {isClassifying ? (
                      <><Loader2 size={16} className="animate-spin" /> Analyzing your issue with Legal AI…</>
                    ) : (
                      <>Analyze & Identify Legal Route <ArrowRight size={16} /></>
                    )}
                  </button>
                </div>
              </motion.div>
            ) : (
              /* ── Step 2: Triage Confirmation Gate ── */
              <motion.div
                key="confirm-screen"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-card p-8 shadow-xl border border-slate-200"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center flex-shrink-0">
                    <RouteIcon size={24} />
                  </div>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                      {currentRouteMeta?.badge}
                    </span>
                    <h2 className="text-xl font-extrabold text-slate-900 mt-1">
                      {currentRouteMeta?.title}
                    </h2>
                  </div>
                </div>

                <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 mb-6 space-y-3">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Why this route?</h4>
                    <p className="text-sm text-slate-800 mt-1 font-medium leading-relaxed">
                      {classifyResult.reasoning}
                    </p>
                  </div>
                  <div className="pt-2 border-t border-slate-200">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">What will happen next?</h4>
                    <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                      {currentRouteMeta?.description}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={handleConfirmRoute}
                    className="btn-primary flex-1 justify-center py-3"
                  >
                    <CheckCircle2 size={16} />
                    {currentRouteMeta?.actionText}
                  </button>
                  <button
                    onClick={() => setStage('IDLE')}
                    className="btn-ghost flex-initial justify-center py-3 border border-slate-200"
                  >
                    <RotateCcw size={15} />
                    Rephrase Problem
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </main>
    </div>
  )
}
