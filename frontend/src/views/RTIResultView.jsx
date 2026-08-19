import { useState } from 'react'
import { motion } from 'framer-motion'
import { FileSearch, ArrowRight, ArrowLeft, AlertTriangle, CheckCircle2, ShieldCheck, Loader2 } from 'lucide-react'
import useCaseStore from '../store/caseStore'
import { rtiPredict, rtiImprove } from '../api'
import DraftViewer from '../components/DraftViewer'

export default function RTIResultView() {
  const { caseId, rtiDraft, setRtiDraft, setStage } = useCaseStore()
  const [subStep, setSubStep] = useState(1) // Step 1: Risk Analysis | Step 2: Improved RTI Draft
  const [prediction, setPrediction] = useState(null)
  const [loadingPred, setLoadingPred] = useState(false)
  const [loadingImprove, setLoadingImprove] = useState(false)
  const [improvedDraft, setImprovedDraft] = useState(null)

  // Fetch prediction on load if not present
  useState(() => {
    const fetchPred = async () => {
      if (!rtiDraft) return
      setLoadingPred(true)
      try {
        const res = await rtiPredict(caseId, rtiDraft)
        setPrediction(res)
      } catch (e) {
        console.error("Prediction error", e)
      } finally {
        setLoadingPred(false)
      }
    }
    fetchPred()
  }, [])

  const handleGenerateImproved = async () => {
    setLoadingImprove(true)
    try {
      const res = await rtiImprove(caseId)
      setImprovedDraft(res.improved_draft)
      setRtiDraft(res.improved_draft)
      setSubStep(2)
    } catch (e) {
      alert("Failed to improve RTI draft.")
    } finally {
      setLoadingImprove(false)
    }
  }

  return (
    <div className="gradient-bg min-h-screen flex flex-col items-center justify-center p-4 py-12">
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-3xl">
        
        {subStep === 1 ? (
          // --- PAGE 1: RTI RISK FACTORS & OUTCOME PREDICTION ---
          <div>
            <div className="mb-3">
              <span className="text-xs font-bold uppercase tracking-widest text-court-maroon bg-court-maroon/10 px-3 py-1 rounded-full border border-court-maroon/20">
                STEP 3 · RTI Risk Analysis & Predictor
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-ashoka-navy mb-2 tracking-tight">
              RTI Rejection Risk Factors
            </h1>
            <p className="text-slate-500 mb-8">
              Our AI evaluates your RTI draft against Section 8/9 exemptions to predict approval likelihood and highlight potential risks.
            </p>

            <div className="bg-white border border-[#b8c2cc] rounded-3xl p-8 shadow-sm space-y-6 text-left">
              {loadingPred ? (
                <div className="py-12 text-center space-y-3">
                  <Loader2 size={32} className="animate-spin text-court-maroon mx-auto" />
                  <p className="text-sm font-medium text-slate-500">Analyzing RTI exemption risks and predictability...</p>
                </div>
              ) : prediction ? (
                <>
                  <div className="flex items-center justify-between bg-slate-50 p-4 rounded-2xl border border-slate-200">
                    <div>
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Predicted Success Outlook</h4>
                      <p className="text-lg font-black text-ashoka-navy mt-0.5">{prediction.prediction || 'HIGH LIKELIHOOD'}</p>
                    </div>
                    <span className="px-3 py-1 bg-statutory-green/10 text-statutory-green font-bold text-xs rounded-full border border-statutory-green/20">
                      Optimized
                    </span>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Detected Risks & Pitfalls</h4>
                    {prediction.detected_risks && prediction.detected_risks.length > 0 ? (
                      <div className="space-y-2">
                        {prediction.detected_risks.map((risk, idx) => (
                          <div key={idx} className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 font-medium flex items-start gap-2">
                            <AlertTriangle size={15} className="text-amber-600 flex-shrink-0 mt-0.5" />
                            <span>{risk.description || risk}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500 italic">No major Section 8/9 exemption risks detected.</p>
                    )}
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">AI Improvement Suggestions</h4>
                    <ul className="space-y-2 text-xs text-slate-700 list-disc list-inside font-medium bg-[#FAF8F5] p-4 rounded-xl border border-slate-200">
                      {prediction.improvement_suggestions?.map((sug, idx) => (
                        <li key={idx} className="leading-relaxed">{sug}</li>
                      ))}
                    </ul>
                  </div>
                </>
              ) : (
                <p className="text-sm text-slate-500">Draft ready for optimization.</p>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <button onClick={() => setStage('RTI_GATHERING')} className="btn-ghost text-sm">
                  <ArrowLeft size={16} /> Edit Applicant Form
                </button>
                <button onClick={handleGenerateImproved} disabled={loadingImprove} className="btn-primary text-base py-3 px-8 cursor-pointer">
                  {loadingImprove ? <><Loader2 size={18} className="animate-spin" /> Optimizing...</> : <>Generate Final RTI Draft <ArrowRight size={18} /></>}
                </button>
              </div>
            </div>
          </div>
        ) : (
          // --- PAGE 2: IMPROVED RTI DRAFT & PDF DOWNLOAD ---
          <div>
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-widest text-court-maroon bg-court-maroon/10 px-3 py-1 rounded-full border border-court-maroon/20">
                STEP 4 · Final RTI Application (Form A)
              </span>
              <span className="text-xs font-mono font-bold text-slate-500">Case ID: {caseId}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-ashoka-navy mb-2 tracking-tight">
              Statutory RTI Application Ready
            </h1>
            <p className="text-slate-500 mb-8">
              Your application has been polished to withstand statutory rejections. Download the official PDF or copy the text.
            </p>

            <div className="space-y-6">
              <DraftViewer title="RTI Application (Section 6(1))" draft={improvedDraft || rtiDraft} caseId={caseId} />

              <div className="flex items-center justify-between pt-2">
                <button onClick={() => setSubStep(1)} className="btn-ghost text-sm">
                  <ArrowLeft size={16} /> Back to Risk Analysis
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
