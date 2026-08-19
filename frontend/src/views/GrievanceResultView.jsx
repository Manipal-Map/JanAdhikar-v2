import { useState } from 'react'
import { motion } from 'framer-motion'
import { Scale, ArrowRight, ArrowLeft, ShieldAlert, CheckCircle2, Globe, ExternalLink } from 'lucide-react'
import useCaseStore from '../store/caseStore'
import DraftViewer from '../components/DraftViewer'

export default function GrievanceResultView() {
  const { caseId, grievanceResult, setStage } = useCaseStore()
  const [subStep, setSubStep] = useState(1) // Step 1: Rights Violated | Step 2: Legal Notice Draft

  if (!grievanceResult) {
    return (
      <div className="gradient-bg min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-slate-600 mb-4">No grievance data found.</p>
          <button onClick={() => setStage('IDLE')} className="btn-primary">Start Over</button>
        </div>
      </div>
    )
  }

  const { violated_rights = [], legal_explanation = '', target_portal_name = '', target_portal_url = '', evidence_analysis = '', demand_notice_draft = '' } = grievanceResult

  return (
    <div className="gradient-bg min-h-screen flex flex-col items-center justify-center p-4 py-12">
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-3xl">
        
        {subStep === 1 ? (
          // --- PAGE 1: RIGHTS VIOLATED & LEGAL ANALYSIS ---
          <div>
            <div className="mb-3">
              <span className="text-xs font-bold uppercase tracking-widest text-court-maroon bg-court-maroon/10 px-3 py-1 rounded-full border border-court-maroon/20">
                STEP 3 · Legal Analysis & Rights Violated
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-ashoka-navy mb-2 tracking-tight">
              Identified Rights & Legal Violations
            </h1>
            <p className="text-slate-500 mb-8">
              Based on your statement and evidence, our AI has analyzed the specific Indian statutory provisions and consumer rights violated.
            </p>

            <div className="bg-white border border-[#b8c2cc] rounded-3xl p-8 shadow-sm space-y-6 text-left">
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Violated Laws & Rights</h4>
                <div className="flex flex-wrap gap-2">
                  {violated_rights.map((right, idx) => (
                    <span key={idx} className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-rose-50 text-court-maroon border border-rose-200 rounded-xl text-xs font-bold">
                      <ShieldAlert size={14} /> {right}
                    </span>
                  ))}
                </div>
              </div>

              <div className="border-t border-slate-100 pt-5">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Legal Explanation</h4>
                <p className="text-sm text-ashoka-navy leading-relaxed font-medium bg-[#FAF8F5] p-4 rounded-xl border border-slate-200">
                  {legal_explanation}
                </p>
              </div>

              <div className="border-t border-slate-100 pt-5">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Evidence Analysis</h4>
                <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200">
                  {evidence_analysis}
                </p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <button onClick={() => setStage('GRIEVANCE_GATHERING')} className="btn-ghost text-sm">
                  <ArrowLeft size={16} /> Edit Details
                </button>
                <button onClick={() => setSubStep(2)} className="btn-primary text-base py-3 px-8 cursor-pointer">
                  View Legal Demand Notice <ArrowRight size={18} />
                </button>
              </div>
            </div>
          </div>
        ) : (
          // --- PAGE 2: LEGAL DEMAND NOTICE DRAFT & PORTAL ---
          <div>
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-widest text-court-maroon bg-court-maroon/10 px-3 py-1 rounded-full border border-court-maroon/20">
                STEP 4 · Formal Legal Demand Notice
              </span>
              <span className="text-xs font-mono font-bold text-slate-500">Case ID: {caseId}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-ashoka-navy mb-2 tracking-tight">
              Ready-to-File Notice & Authority
            </h1>
            <p className="text-slate-500 mb-8">
              Your formal legal demand notice is generated below. You can download it as a clean PDF or copy the text.
            </p>

            <div className="space-y-6">
              {/* Target Portal Card */}
              {target_portal_name && (
                <div className="bg-white border border-[#b8c2cc] rounded-2xl p-5 shadow-sm flex items-center justify-between text-left">
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Recommended Filing Authority</h4>
                    <p className="text-base font-bold text-ashoka-navy">{target_portal_name}</p>
                  </div>
                  {target_portal_url && (
                    <a href={target_portal_url} target="_blank" rel="noreferrer" className="btn-ghost text-xs py-2 px-4 gap-1.5">
                      <Globe size={14} /> Open Portal <ExternalLink size={12} />
                    </a>
                  )}
                </div>
              )}

              {/* Draft Viewer */}
              <DraftViewer title="Formal Legal Demand Notice" draft={demand_notice_draft} caseId={caseId} />

              <div className="flex items-center justify-between pt-2">
                <button onClick={() => setSubStep(1)} className="btn-ghost text-sm">
                  <ArrowLeft size={16} /> Back to Rights Analysis
                </button>
                <button onClick={() => setStage('IDLE')} className="btn-ghost text-sm border-slate-300">
                  Start New Case
                </button>
              </div>
            </div>
          </div>
        )}

      </motion.div>
    </div>
  )
}
