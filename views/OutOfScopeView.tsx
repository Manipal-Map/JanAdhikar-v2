'use client';
import { motion } from 'framer-motion'
import { ShieldOff, RotateCcw, BookOpen, MessageSquare, ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import useCaseStore from '@/store/caseStore'
import CaseIdBadge from '@/components/dashboard/CaseIdBadge'

const SCOPE_ITEMS = [
  { icon: '📄', label: 'RTI Applications', desc: 'Requesting official government documents, tender records, inspection reports, audit files.' },
  { icon: '⚖️', label: 'Consumer Grievances', desc: 'Defective products, service deficiency, refunds, warranty disputes under Consumer Protection Act.' },
  { icon: '🏠', label: 'Tenancy Disputes', desc: 'Security deposit disputes, illegal eviction, rent authority complaints.' },
  { icon: '💼', label: 'Employment Rights', desc: 'Unpaid salary, illegal termination, PF/ESI disputes.' },
  { icon: '🏛️', label: 'Civic Complaints', desc: 'CPGRAMS, pension delays, broken infrastructure, municipal grievances.' },
]

export default function OutOfScopeView() {
  const router = useRouter()
  const { classifyResult, caseId, reset } = useCaseStore()

  const handleReset = () => {
    reset()
    router.push('/dashboard')
  }

  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-cover bg-center bg-no-repeat relative"
      style={{ backgroundImage: "url('/bg.image.png')" }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl mx-auto relative z-10"
      >
        {/* Header card */}
        <div className="bg-white/95 backdrop-blur-xs p-8 text-center mb-6 rounded-3xl border border-slate-300 shadow-md">
          <div className="w-16 h-16 rounded-2xl bg-court-maroon/10 border border-court-maroon/20 flex items-center justify-center mx-auto mb-5">
            <ShieldOff size={28} className="text-court-maroon" />
          </div>
          <h1 className="text-2xl font-bold text-ashoka-navy mb-3">Outside Platform Scope</h1>
          <p className="text-slate-600 leading-relaxed mb-4 text-sm sm:text-base font-medium">
            Your query doesn't fall within our supported legal domains. JanAdhikar specialises
            in RTI applications, consumer rights, tenancy disputes, and civic grievances under
            Indian law.
          </p>

          {caseId && (
            <div className="flex justify-center mb-4">
              <CaseIdBadge caseId={caseId} />
            </div>
          )}

          {classifyResult?.reasoning && (
            <div className="p-4 bg-white rounded-xl border border-slate-300 text-sm text-slate-700 text-left mb-5 shadow-2xs">
              <span className="font-bold text-ashoka-navy">AI Reasoning: </span>
              {classifyResult.reasoning}
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={handleReset}
              className="btn-primary cursor-pointer w-full sm:w-auto justify-center bg-[#A32A02] hover:bg-[#138808] transition-colors"
            >
              <RotateCcw size={15} /> Start a New Case
            </button>
            <button
              onClick={() => { reset(); router.push('/'); }}
              className="btn-ghost cursor-pointer w-full sm:w-auto justify-center border border-slate-300 bg-white"
            >
              <ArrowLeft size={15} /> Back to Landing
            </button>
          </div>
        </div>

        {/* What we support */}
        <div className="bg-white/95 backdrop-blur-xs p-6 rounded-3xl border border-slate-300 shadow-md">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen size={16} className="text-court-maroon" />
            <h2 className="text-sm font-bold text-ashoka-navy uppercase tracking-wider">What JanAdhikar Handles</h2>
          </div>
          <div className="space-y-3">
            {SCOPE_ITEMS.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.07 }}
                className="flex items-start gap-3 p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs"
              >
                <span className="text-lg leading-none mt-0.5">{item.icon}</span>
                <div className="text-left">
                  <p className="text-sm font-bold text-ashoka-navy mb-0.5">{item.label}</p>
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
          <div className="mt-4 p-3.5 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-2.5 text-left">
            <MessageSquare size={16} className="text-blue-700 mt-0.5 shrink-0" />
            <p className="text-xs text-slate-700 leading-relaxed font-medium">
              <span className="font-bold text-blue-900">Tip: </span>
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
