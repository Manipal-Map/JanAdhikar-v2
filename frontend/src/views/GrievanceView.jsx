import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Scale, Zap, Loader2, AlertCircle, Sparkles, CheckCircle2, ArrowRight, UploadCloud, Link as LinkIcon
} from 'lucide-react'
import useCaseStore from '../store/caseStore'
import { grievanceGenerate } from '../api' // Note: Ensure API sends FormData
import CaseIdBadge from '../components/CaseIdBadge'
import PipelineTracker from '../components/PipelineTracker'
import DraftViewer from '../components/DraftViewer'

export default function GrievanceView() {
  const {
    caseId, classifyResult, stage, setStage,
    userProblem, formData, setFormData,
    grievanceResult, setGrievanceResult,
  } = useCaseStore()

  const [loadingStep, setLoadingStep] = useState(null)
  const [localError, setLocalError] = useState(null)
  const [proofFile, setProofFile] = useState(null)

  useEffect(() => {
    if (!formData.applicant_name) {
      setFormData({
        applicant_name: '', applicant_city: '', applicant_state: '',
        opponent_name: '', opponent_address: '', ...formData
      })
    }
  }, [])

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setProofFile(e.target.files[0])
    }
  }

  const handleAnalyzeGrievance = async () => {
    if (!formData.applicant_name || !formData.applicant_city || !formData.opponent_name) {
      setLocalError('Please fill in your details and the opposing party details.')
      return
    }
    setLocalError(null)
    setLoadingStep('ANALYZING')

    try {
      // Create FormData to handle the image upload
      const payload = new FormData()
      payload.append('case_id', caseId)
      payload.append('form_data', JSON.stringify(formData))
      payload.append('user_problem', userProblem)
      if (proofFile) {
        payload.append('proof_file', proofFile)
      }

      // Ensure your API function in index.js uses standard fetch or configures axios for multipart/form-data
      const res = await grievanceGenerate(payload) 
      setGrievanceResult(res)
      setStage('COMPLETE')
    } catch (e) {
      setLocalError(e?.response?.data?.detail || e.message)
    } finally {
      setLoadingStep(null)
    }
  }

  return (
    <div className="gradient-bg min-h-screen flex flex-col">
      <header className="px-6 py-4 bg-white border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
            <Scale size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 text-base">Grievance Workspace</span>
              <span className="badge-grievance">{classifyResult?.sub_category || 'Legal Dispute'}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <CaseIdBadge caseId={caseId} />
          <PipelineTracker stage={stage} route="Rights/Grievance" />
        </div>
      </header>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-5 p-5 max-w-7xl mx-auto w-full">
        {/* COLUMN 1: Form & Proof Upload */}
        <div className="flex flex-col gap-4">
          <div className="glass-card p-5">
            <h2 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Sparkles size={16} className="text-amber-600" /> Intake Form
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Your Details</label>
                <input type="text" placeholder="Full Name" value={formData.applicant_name} onChange={e => setFormData({...formData, applicant_name: e.target.value})} className="input-field text-sm mb-2" />
                <div className="grid grid-cols-2 gap-2">
                  <input type="text" placeholder="City" value={formData.applicant_city} onChange={e => setFormData({...formData, applicant_city: e.target.value})} className="input-field text-sm" />
                  <input type="text" placeholder="State" value={formData.applicant_state} onChange={e => setFormData({...formData, applicant_state: e.target.value})} className="input-field text-sm" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Opposing Party Details</label>
                <input type="text" placeholder="Name of Person/Company/Govt Dept" value={formData.opponent_name} onChange={e => setFormData({...formData, opponent_name: e.target.value})} className="input-field text-sm mb-2" />
                <input type="text" placeholder="Their Address or Location" value={formData.opponent_address} onChange={e => setFormData({...formData, opponent_address: e.target.value})} className="input-field text-sm" />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Upload Proof (Receipts, Photos, Documents)</label>
                <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 transition-colors">
                  <UploadCloud size={24} className="text-slate-400 mb-2" />
                  <input type="file" onChange={handleFileChange} className="text-xs text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100" />
                </div>
              </div>
            </div>

            {localError && <div className="mt-4 p-3 bg-red-50 text-red-700 text-xs rounded-xl flex items-start gap-2"><AlertCircle size={14} />{localError}</div>}

            {!grievanceResult && (
              <button onClick={handleAnalyzeGrievance} disabled={Boolean(loadingStep)} className="btn-primary w-full justify-center mt-5 py-3 bg-amber-600 hover:bg-amber-700">
                {loadingStep ? <><Loader2 size={16} className="animate-spin" /> Deep AI Analysis…</> : <><Scale size={16} /> Analyze Rights & Generate Notice</>}
              </button>
            )}
          </div>
        </div>

        {/* COLUMN 2 & 3: Rights Analysis & Demand Notice */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {grievanceResult ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} className="glass-card p-5 border-l-4 border-l-amber-500">
                  <h3 className="text-sm font-bold text-slate-900 mb-3">AI Rights Analysis</h3>
                  <div className="space-y-2 mb-4">
                    {grievanceResult.violated_rights?.map((right, i) => (
                      <div key={i} className="text-xs font-bold bg-amber-50 text-amber-800 px-3 py-1.5 rounded-lg">{right}</div>
                    ))}
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed">{grievanceResult.legal_explanation}</p>
                  {grievanceResult.evidence_analysis && (
                    <div className="mt-3 pt-3 border-t border-slate-200">
                      <span className="text-xs font-bold text-slate-500 uppercase">Proof Assessment:</span>
                      <p className="text-sm text-slate-700 mt-1">{grievanceResult.evidence_analysis}</p>
                    </div>
                  )}
                </motion.div>

                <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} transition={{delay: 0.1}} className="glass-card p-5 border-l-4 border-l-blue-500">
                  <h3 className="text-sm font-bold text-slate-900 mb-3">Filing Direction</h3>
                  <p className="text-sm text-slate-700 mb-4">Based on your location and opponent, file your grievance here:</p>
                  <a href={grievanceResult.target_portal_url} target="_blank" rel="noreferrer" className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl hover:border-blue-300 transition-colors">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600"><LinkIcon size={18} /></div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{grievanceResult.target_portal_name}</p>
                      <p className="text-xs text-slate-500">{grievanceResult.target_portal_url}</p>
                    </div>
                  </a>
                </motion.div>
              </div>

              <DraftViewer title="Legal Demand Notice" draft={grievanceResult.demand_notice_draft} caseId={caseId} />
            </>
          ) : (
            <div className="glass-card p-10 flex-1 flex flex-col items-center justify-center text-slate-400 gap-3 border-2 border-dashed border-slate-200">
              {loadingStep ? <Loader2 size={32} className="animate-spin text-amber-500" /> : <Scale size={32} />}
              <p className="text-sm text-center">{loadingStep ? 'Vision AI is analyzing proofs and Indian statutory frameworks...' : "Fill the form and attach proof to build your legal case."}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
