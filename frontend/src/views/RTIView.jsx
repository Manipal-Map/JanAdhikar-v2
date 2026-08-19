import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  FileSearch, Zap, Loader2, AlertCircle, Sparkles, CheckCircle2, ArrowRight,
  Download, Building, MapPin, Edit3, HelpCircle
} from 'lucide-react'
import useCaseStore from '../store/caseStore'
import { rtiGenerate, rtiPredict, rtiImprove, resolveDepartment, downloadRtiPdf } from '../api'
import CaseIdBadge from '../components/CaseIdBadge'
import PipelineTracker from '../components/PipelineTracker'
import RiskMeter from '../components/RiskMeter'
import RiskCard from '../components/RiskCard'
import DraftViewer from '../components/DraftViewer'

export default function RTIView() {
  const {
    caseId, classifyResult, stage, setStage,
    userProblem,
    formData, setFormData,
    departmentInfo, setDepartmentInfo,
    departmentConfirmed, setDepartmentConfirmed,
    rtiPrediction, setRtiPrediction,
    rtiDraft, setRtiDraft,
  } = useCaseStore()

  const [loadingStep, setLoadingStep] = useState(null)
  const [localError, setLocalError] = useState(null)
  const [pdfDownloading, setPdfDownloading] = useState(false)

  // Default initial fields to clean citizen-only info
  useEffect(() => {
    if (!formData.applicant_name) {
      setFormData({
        applicant_name: '',
        applicant_city: '',
        applicant_state: '',
        applicant_address: '',
        applicant_contact: '',
        ...formData
      })
    }
  }, [])

  // ── Step 1: AI Auto-Resolve Authority & Inferred Questions ──
  const handleAutoResolve = async () => {
    if (!formData.applicant_name?.trim() || !formData.applicant_city?.trim()) {
      setLocalError('Please provide at least your Name and City/District so AI can map the right jurisdiction.')
      return
    }
    setLocalError(null)
    setLoadingStep('RESOLVING')

    try {
      // 1. Resolve exact Public Authority & Address using AI
      const dept = await resolveDepartment(caseId, formData.applicant_city)
      setDepartmentInfo(dept)

      // 2. Generate Initial RTI Draft with Inferred Tangible Records
      const enrichedFormData = {
        ...formData,
        public_authority: dept.public_authority_name,
        pio_designation: dept.pio_designation,
        suggested_address: dept.suggested_address_template,
      }
      setFormData(enrichedFormData)

      await rtiGenerate(caseId, enrichedFormData)
      setDepartmentConfirmed(true)
      setLoadingStep(null)

      // 3. Immediately trigger ML risk analysis & remolding
      await runPredictionAndImprovement()
    } catch (e) {
      setLocalError(e?.response?.data?.detail || e.message)
      setLoadingStep(null)
    }
  }

  // ── Step 2: RTI-Bench Risk Predict + Legal Remolding ──
  const runPredictionAndImprovement = async () => {
    setLoadingStep('PREDICTING')
    setStage('PREDICTING')
    try {
      const pred = await rtiPredict(caseId)
      setRtiPrediction(pred)

      setLoadingStep('IMPROVING')
      setStage('IMPROVING')
      const improved = await rtiImprove(caseId)
      setRtiDraft(improved.improved_draft)
      setStage('COMPLETE')
    } catch (e) {
      setLocalError(e?.response?.data?.detail || e.message)
    } finally {
      setLoadingStep(null)
    }
  }

  // ── Step 3: Statutory Form-A PDF Download ──
  const handleDownloadPDF = async () => {
    setPdfDownloading(true)
    try {
      const blob = await downloadRtiPdf(caseId)
      const url = window.URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `${caseId}_RTI_Form_A.pdf`)
      document.body.appendChild(link)
      link.click()
      link.parentNode.removeChild(link)
    } catch (e) {
      setLocalError('Failed to download PDF. Please try again.')
    } finally {
      setPdfDownloading(false)
    }
  }

  return (
    <div className="gradient-bg min-h-screen flex flex-col">
      {/* Top Navigation */}
      <header className="px-6 py-4 bg-white border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
            <FileSearch size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 text-base">RTI Filing Workspace</span>
              <span className="badge-rti">{classifyResult?.sub_category || 'Infrastructure & Civic'}</span>
            </div>
            <p className="text-xs text-slate-500 truncate max-w-md">Problem: {userProblem}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <CaseIdBadge caseId={caseId} />
          <PipelineTracker stage={stage} route="RTI" />
        </div>
      </header>

      {/* 3-Column Workspace */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-5 p-5 overflow-auto max-w-7xl mx-auto w-full">

        {/* ── COLUMN 1: Citizen Details & AI Authority Resolver ── */}
        <div className="flex flex-col gap-4">
          <div className="glass-card p-5">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={16} className="text-blue-600" />
              <h2 className="text-sm font-bold text-slate-900">Your Basic Details</h2>
            </div>
            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              We only need your basic contact details. Our legal AI will automatically figure out the Public Authority and PIO address.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Ramesh Kumar"
                  value={formData.applicant_name || ''}
                  onChange={(e) => setFormData({ ...formData, applicant_name: e.target.value })}
                  disabled={Boolean(rtiDraft)}
                  className="input-field text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1">
                    City / District <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Jaipur"
                    value={formData.applicant_city || ''}
                    onChange={(e) => setFormData({ ...formData, applicant_city: e.target.value })}
                    disabled={Boolean(rtiDraft)}
                    className="input-field text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Rajasthan"
                    value={formData.applicant_state || ''}
                    onChange={(e) => setFormData({ ...formData, applicant_state: e.target.value })}
                    disabled={Boolean(rtiDraft)}
                    className="input-field text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1">
                  Postal Address (For reply)
                </label>
                <input
                  type="text"
                  placeholder="e.g. House 42, Sector 3, Vaishali Nagar"
                  value={formData.applicant_address || ''}
                  onChange={(e) => setFormData({ ...formData, applicant_address: e.target.value })}
                  disabled={Boolean(rtiDraft)}
                  className="input-field text-sm"
                />
              </div>
            </div>

            {localError && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2">
                <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
                <span>{localError}</span>
              </div>
            )}

            {!departmentConfirmed && (
              <button
                onClick={handleAutoResolve}
                disabled={Boolean(loadingStep)}
                className="btn-primary w-full justify-center mt-5 py-3"
              >
                {loadingStep === 'RESOLVING' ? (
                  <><Loader2 size={16} className="animate-spin" /> Resolving Jurisdiction & PIO…</>
                ) : (
                  <><Sparkles size={16} /> Auto-Resolve Authority & Draft RTI</>
                )}
              </button>
            )}
          </div>

          {/* AI Inferred Authority Card */}
          {departmentInfo && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-5 border-l-4 border-l-blue-600"
            >
              <div className="flex items-center gap-2 mb-2">
                <Building size={16} className="text-blue-600" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Inferred Public Authority
                </h3>
              </div>
              <p className="text-sm font-bold text-slate-800 mb-1">
                {departmentInfo.public_authority_name}
              </p>
              <p className="text-xs text-slate-600 mb-2">
                <strong>Addressed To:</strong> {departmentInfo.pio_designation}
              </p>
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600 flex items-start gap-2">
                <MapPin size={13} className="text-slate-400 mt-0.5 flex-shrink-0" />
                <span>{departmentInfo.suggested_address_template}</span>
              </div>
            </motion.div>
          )}
        </div>

        {/* ── COLUMN 2: RTI-Bench Outcome Predictor ── */}
        <div className="flex flex-col gap-4">
          <div className="glass-card p-5 flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Zap size={16} className="text-amber-500" />
                <h2 className="text-sm font-bold text-slate-900">RTI-Bench Outcome Predictor</h2>
              </div>
              <span className="text-xs text-slate-400 font-mono">CIC 100k Model</span>
            </div>

            {loadingStep === 'PREDICTING' && (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-slate-500 gap-3">
                <Loader2 size={24} className="animate-spin text-blue-600" />
                <p className="text-xs font-medium">Analyzing rejection risks under RTI Act Section 8 & 9…</p>
              </div>
            )}

            {!rtiPrediction && !loadingStep && (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-slate-400 gap-2 border-2 border-dashed border-slate-200 rounded-xl">
                <HelpCircle size={28} className="text-slate-300" />
                <p className="text-xs text-center">Click 'Auto-Resolve' to see outcome probabilities & risk detection.</p>
              </div>
            )}

            {rtiPrediction && (
              <div className="space-y-4">
                <RiskMeter
                  prediction={rtiPrediction.prediction}
                  probabilities={rtiPrediction.probabilities}
                />

                {rtiPrediction.detected_risks?.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-slate-200">
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Detected Risks Addressed:
                    </h4>
                    {rtiPrediction.detected_risks.map((risk, i) => (
                      <RiskCard key={i} risk={risk} index={i} />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── COLUMN 3: High-Success Remolded Draft & Form-A PDF ── */}
        <div className="flex flex-col gap-4">
          <div className="glass-card p-5 flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-600" />
                <h2 className="text-sm font-bold text-slate-900">Final Remolded RTI Application</h2>
              </div>
            </div>

            {loadingStep === 'IMPROVING' && (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-slate-500 gap-3">
                <Loader2 size={24} className="animate-spin text-emerald-600" />
                <p className="text-xs font-medium">Re-writing draft to cite Section 4(1)(b) proactive disclosure…</p>
              </div>
            )}

            {!rtiDraft && !loadingStep && (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-slate-400 gap-2 border-2 border-dashed border-slate-200 rounded-xl">
                <FileSearch size={28} className="text-slate-300" />
                <p className="text-xs text-center">Final statutory draft will appear here ready to file.</p>
              </div>
            )}

            {rtiDraft && (
              <div className="space-y-4 flex-1 flex flex-col">
                <DraftViewer
                  title="Form-A RTI Application"
                  draft={rtiDraft}
                  caseId={caseId}
                />

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl mt-auto space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-blue-900">Statutory Form-A PDF</p>
                      <p className="text-xs text-blue-700">Standardized Central/State RTI format ready to sign.</p>
                    </div>
                  </div>
                  <button
                    onClick={handleDownloadPDF}
                    disabled={pdfDownloading}
                    className="btn-primary w-full justify-center text-xs py-2.5 bg-blue-700 hover:bg-blue-800"
                  >
                    {pdfDownloading ? (
                      <><Loader2 size={14} className="animate-spin" /> Generating PDF…</>
                    ) : (
                      <><Download size={14} /> Download Official Form-A (PDF)</>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
