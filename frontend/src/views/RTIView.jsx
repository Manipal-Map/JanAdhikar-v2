import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileSearch, Zap, Loader2, AlertCircle, Sparkles, CheckCircle2, ArrowRight,
} from 'lucide-react'
import useCaseStore from '../store/caseStore'
import { chatContinue, rtiGenerate, rtiPredict, rtiImprove } from '../api'
import CaseIdBadge from '../components/CaseIdBadge'
import PipelineTracker from '../components/PipelineTracker'
import ChatInterface from '../components/ChatInterface'
import FactChecklist from '../components/FactChecklist'
import RiskMeter from '../components/RiskMeter'
import RiskCard from '../components/RiskCard'
import DraftViewer from '../components/DraftViewer'

// ── Form field component ───────────────────────────────────────────────────
function FormField({ field, value, onChange, disabled }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">
        {field.label}
        {field.required && <span className="text-red-400 ml-1">*</span>}
      </label>
      <input
        type="text"
        value={value || ''}
        onChange={(e) => onChange(field.key, e.target.value)}
        placeholder={field.placeholder || ''}
        disabled={disabled}
        className="input-field text-sm"
      />
    </div>
  )
}

// ── Improvement suggestion pill ────────────────────────────────────────────
function SuggestionPill({ text, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.08 }}
      className="flex items-start gap-2.5 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl"
    >
      <CheckCircle2 size={14} className="text-emerald-400 mt-0.5 flex-shrink-0" />
      <p className="text-sm text-slate-300 leading-relaxed">{text}</p>
    </motion.div>
  )
}

export default function RTIView() {
  const {
    caseId, classifyResult, stage, setStage,
    chatMessages, addChatMessage, setChatMessages,
    extractedFacts, setExtractedFacts,
    formData, setFormData,
    formSubmitted, setFormSubmitted,
    rtiPrediction, setRtiPrediction,
    rtiDraft, setRtiDraft,
    setError,
  } = useCaseStore()

  const [chatLoading, setChatLoading]     = useState(false)
  const [predictLoading, setPredictLoading] = useState(false)
  const [improveLoading, setImproveLoading] = useState(false)
  const [formMode, setFormMode]           = useState(true) // true = form, false = chat
  const [localError, setLocalError]       = useState(null)

  const schema = classifyResult?.form_schema || []
  const route  = classifyResult?.route || 'RTI'

  // Kick off prediction automatically once form is submitted
  useEffect(() => {
    if (formSubmitted && !rtiPrediction && stage === 'PREDICTING') {
      runPredict()
    }
  }, [formSubmitted, stage])

  // ── Submit form data → generate initial RTI draft → predict ──────────────
  const handleFormSubmit = async () => {
    const missing = schema.filter((f) => f.required && !formData[f.key]?.trim())
    if (missing.length > 0) {
      setLocalError(`Please fill: ${missing.map((f) => f.label).join(', ')}`)
      return
    }
    setLocalError(null)
    setFormSubmitted(true)

    try {
      // Step 1 — generate initial RTI draft (stores it server-side for predict)
      setStage('PREDICTING')
      await rtiGenerate(caseId, formData)
      // Step 2 — predict + improve run automatically via useEffect below
    } catch (e) {
      setLocalError(e?.response?.data?.detail || e.message)
      setFormSubmitted(false)
      setStage('RTI_GATHERING')
    }
  }

  // ── Chat turn ────────────────────────────────────────────────────────────
  const handleChatSend = async (message) => {
    addChatMessage({ role: 'user', content: message })
    setChatLoading(true)
    try {
      const res = await chatContinue(caseId, message)
      const reply = res.ai_response || "Got it. Any other details to add?"
      addChatMessage({ role: 'assistant', content: reply })
      const merged = res.updated_facts || res.new_facts_extracted
      if (merged && Object.keys(merged).length > 0) {
        setExtractedFacts({ ...extractedFacts, ...merged })
      }
      if (res.is_complete) {
        setFormSubmitted(true)
        setStage('PREDICTING')
      }
    } catch (e) {
      setLocalError(e?.response?.data?.detail || e.message)
    } finally {
      setChatLoading(false)
    }
  }

  // ── RTI Predict ──────────────────────────────────────────────────────────
  const runPredict = async () => {
    setPredictLoading(true)
    try {
      const res = await rtiPredict(caseId)
      setRtiPrediction(res)
      setStage('IMPROVING')
      await runImprove()
    } catch (e) {
      setLocalError(e?.response?.data?.detail || e.message)
      setError(e?.response?.data?.detail || e.message)
    } finally {
      setPredictLoading(false)
    }
  }

  // ── RTI Improve ──────────────────────────────────────────────────────────
  const runImprove = async () => {
    setImproveLoading(true)
    try {
      const res = await rtiImprove(caseId)
      setRtiDraft(res.improved_draft || res.draft || res.rti_draft || JSON.stringify(res))
      setStage('COMPLETE')
    } catch (e) {
      setLocalError(e?.response?.data?.detail || e.message)
    } finally {
      setImproveLoading(false)
    }
  }

  const isProcessing = predictLoading || improveLoading

  return (
    <div className="gradient-bg min-h-screen flex flex-col">
      {/* ── Top bar ── */}
      <header className="px-6 py-4 border-b border-white/5 flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex items-center gap-3 flex-1">
          <div className="w-8 h-8 rounded-xl bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
            <FileSearch size={15} className="text-blue-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white">RTI Workflow</span>
              <span className="badge-rti">{classifyResult?.sub_category}</span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">{classifyResult?.reasoning}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <CaseIdBadge caseId={caseId} />
          <PipelineTracker stage={stage} route={route} />
        </div>
      </header>

      {/* ── Main 3-column layout ── */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 p-4 overflow-auto">

        {/* ── LEFT: Form / Chat ── */}
        <div className="glass-card flex flex-col p-5 gap-4 min-h-[500px]">
          {/* Mode toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFormMode(true)}
              className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${
                formMode
                  ? 'bg-brand-blue/20 text-blue-400 border border-brand-blue/30'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              📋 Form
            </button>
            <button
              onClick={() => setFormMode(false)}
              className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${
                !formMode
                  ? 'bg-brand-blue/20 text-blue-400 border border-brand-blue/30'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              💬 Chat
            </button>
          </div>

          {formMode ? (
            /* ── Form panel ── */
            <div className="flex flex-col gap-3 flex-1">
              <p className="text-xs text-slate-500">Fill in required details for your RTI application.</p>
              <div className="space-y-3 flex-1">
                {schema.map((field) => (
                  <FormField
                    key={field.key}
                    field={field}
                    value={formData[field.key]}
                    onChange={(key, val) => setFormData({ ...formData, [key]: val })}
                    disabled={formSubmitted}
                  />
                ))}
              </div>

              {localError && (
                <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/25 rounded-xl text-sm text-red-400">
                  <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
                  {localError}
                </div>
              )}

              {!formSubmitted ? (
                <button onClick={handleFormSubmit} className="btn-primary justify-center">
                  <Zap size={15} /> Run Risk Analysis
                </button>
              ) : (
                <div className="flex items-center gap-2 text-sm text-emerald-400 py-2">
                  <CheckCircle2 size={15} />
                  Form submitted — analysis running…
                </div>
              )}
            </div>
          ) : (
            /* ── Chat panel ── */
            <div className="flex-1 min-h-0">
              <ChatInterface
                messages={chatMessages}
                onSend={handleChatSend}
                isLoading={chatLoading}
                placeholder="Ask CivicRoute AI to help gather RTI details…"
              />
            </div>
          )}
        </div>

        {/* ── CENTER: Risk Analysis ── */}
        <div className="glass-card flex flex-col p-5 gap-4">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles size={15} className="text-amber-400" />
            <h2 className="text-sm font-bold text-white">RTI-Bench Risk Analysis</h2>
          </div>

          {isProcessing && !rtiPrediction && (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 text-slate-500">
              <Loader2 size={28} className="animate-spin text-brand-blue" />
              <p className="text-sm text-center">
                {predictLoading ? 'Running risk prediction…' : 'Remolding your RTI draft…'}
              </p>
            </div>
          )}

          {!isProcessing && !rtiPrediction && !formSubmitted && (
            <div className="flex-1 flex flex-col items-center justify-center gap-2 text-slate-600">
              <FileSearch size={32} />
              <p className="text-sm text-center">Submit the form to see risk analysis</p>
            </div>
          )}

          {rtiPrediction && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-5"
            >
              <RiskMeter
                prediction={rtiPrediction.prediction}
                probabilities={rtiPrediction.probabilities}
              />

              {/* Detected risks */}
              {rtiPrediction.detected_risks?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
                    Detected Risks
                  </p>
                  <div className="space-y-2">
                    {rtiPrediction.detected_risks.map((risk, i) => (
                      <RiskCard key={i} risk={risk} index={i} />
                    ))}
                  </div>
                </div>
              )}

              {/* Suggestions */}
              {rtiPrediction.improvement_suggestions?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
                    Improvement Suggestions
                  </p>
                  <div className="space-y-2">
                    {rtiPrediction.improvement_suggestions.map((s, i) => (
                      <SuggestionPill key={i} text={s} index={i} />
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Extracted facts checklist */}
          <div className="mt-auto pt-4 border-t border-white/5">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
              Extracted Facts
            </p>
            <FactChecklist
              facts={{ ...formData, ...extractedFacts }}
              schema={schema}
            />
          </div>
        </div>

        {/* ── RIGHT: Draft Viewer ── */}
        <div className="flex flex-col gap-4">
          <div className="glass-card p-5">
            <div className="flex items-center gap-2 mb-1">
              <ArrowRight size={15} className="text-brand-blue" />
              <h2 className="text-sm font-bold text-white">Remolded RTI Draft</h2>
              {improveLoading && <Loader2 size={13} className="animate-spin text-brand-blue ml-auto" />}
              {stage === 'COMPLETE' && <CheckCircle2 size={13} className="text-emerald-400 ml-auto" />}
            </div>
            <p className="text-xs text-slate-500 mb-4">
              AI-remolded draft optimised to avoid exemptions and increase disclosure probability.
            </p>

            {!rtiDraft && !improveLoading && (
              <div className="flex flex-col items-center justify-center py-10 text-slate-600 gap-2">
                <FileSearch size={28} />
                <p className="text-sm text-center">Draft will appear after risk analysis</p>
              </div>
            )}

            {improveLoading && (
              <div className="flex flex-col items-center justify-center py-10 gap-3 text-slate-500">
                <Loader2 size={24} className="animate-spin text-brand-blue" />
                <p className="text-sm">Remolding your RTI application…</p>
              </div>
            )}
          </div>

          {rtiDraft && (
            <DraftViewer
              title="Remolded RTI Application"
              draft={rtiDraft}
              caseId={caseId}
            />
          )}
        </div>
      </div>
    </div>
  )
}
