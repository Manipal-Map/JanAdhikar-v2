import { motion } from 'framer-motion'
import { ShieldOff, RotateCcw, BookOpen, MessageSquare } from 'lucide-react'
import useCaseStore from '../store/caseStore'
import CaseIdBadge from '../components/CaseIdBadge'

const SCOPE_ITEMS = [
  { icon: '📄', label: 'RTI Applications',        desc: 'Requesting official government documents, tender records, inspection reports, audit files.' },
  { icon: '⚖️',  label: 'Consumer Grievances',     desc: 'Defective products, service deficiency, refunds, warranty disputes under Consumer Protection Act.' },
  { icon: '🏠',  label: 'Tenancy Disputes',        desc: 'Security deposit disputes, illegal eviction, rent authority complaints.' },
  { icon: '💼',  label: 'Employment Rights',       desc: 'Unpaid salary, illegal termination, PF/ESI disputes.' },
  { icon: '🏛️',  label: 'Civic Complaints',        desc: 'CPGRAMS, pension delays, broken infrastructure, municipal grievances.' },
]

export default function OutOfScopeView() {
  const { classifyResult, caseId, reset } = useCaseStore()

  return (
    <div className="gradient-bg min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl mx-auto"
      >
        {/* Header card */}
        <div className="glass-card p-8 text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-slate-500/20 border border-slate-500/30 flex items-center justify-center mx-auto mb-5">
            <ShieldOff size={28} className="text-slate-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-3">Outside Platform Scope</h1>
          <p className="text-slate-400 leading-relaxed mb-4">
            Your query doesn't fall within our supported legal domains. CivicRoute specialises
            in RTI applications, consumer rights, tenancy disputes, and civic grievances under
            Indian law.
          </p>

          {caseId && (
            <div className="flex justify-center mb-4">
              <CaseIdBadge caseId={caseId} />
            </div>
          )}

          {classifyResult?.reasoning && (
            <div className="p-4 bg-navy-700 rounded-xl border border-white/5 text-sm text-slate-400 text-left mb-5">
              <span className="font-semibold text-slate-300">AI Reasoning: </span>
              {classifyResult.reasoning}
            </div>
          )}

          <button
            onClick={reset}
            className="btn-primary mx-auto"
          >
            <RotateCcw size={15} /> Start a New Case
          </button>
        </div>

        {/* What we support */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen size={16} className="text-brand-blue" />
            <h2 className="text-sm font-bold text-white">What CivicRoute Handles</h2>
          </div>
          <div className="space-y-3">
            {SCOPE_ITEMS.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.07 }}
                className="flex items-start gap-3 p-3 bg-navy-700/60 rounded-xl border border-white/5"
              >
                <span className="text-lg leading-none mt-0.5">{item.icon}</span>
                <div>
                  <p className="text-sm font-semibold text-white mb-0.5">{item.label}</p>
                  <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
          <div className="mt-4 p-3 bg-brand-blue/10 border border-brand-blue/20 rounded-xl flex items-start gap-2">
            <MessageSquare size={14} className="text-blue-400 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-slate-400">
              <span className="text-blue-400 font-semibold">Tip: </span>
              Try rephrasing your query to describe a specific legal issue — e.g.
              "I want to know the status of my RTI application filed with PWD" or
              "My landlord refused to return my security deposit."
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
