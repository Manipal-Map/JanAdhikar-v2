import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileSearch, Zap, Loader2, AlertCircle, Sparkles, CheckCircle2, ArrowRight,
} from 'lucide-react'
import useCaseStore from '../store/caseStore'
import { chatContinue, rtiGenerate, rtiPredict, rtiImprove, resolveDepartment, downloadRtiPdf } from '../api'
import CaseIdBadge from '../components/CaseIdBadge'
import PipelineTracker from '../components/PipelineTracker'
import ChatInterface from '../components/ChatInterface'
import FactChecklist from '../components/FactChecklist'
import RiskMeter from '../components/RiskMeter'
import RiskCard from '../components/RiskCard'
import DraftViewer from '../components/DraftViewer'
import RTIConfirmationCard from '../components/RTIConfirmationCard'

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
    chatMessages, addChatMessage,
    extractedFacts, setExtractedFacts,
    formData, setFormData,
    formSubmitted, setFormSubmitted,
    departmentInfo, setDepartmentInfo,
    departmentConfirmed, setDepartmentConfirmed,
    rtiPrediction, setRtiPrediction,
    rtiDraft, setRtiDraft,
    setError,
  } = useCaseStore()

  const [chatLoading, setChatLoading] = useState(false)
  const [predictLoading, setPredictLoading] = useState(false)
  const [improveLoading, setImproveLoading] = useState(false)
  const [formMode, setFormMode] = useState(true)
  const [localError, setLocalError] = useState(null)

  const schema = classifyResult?.form_schema || []
  const route = classifyResult?.route || 'RTI'

  const handleFormSubmit = async () => {
    const missing = schema.filter((f) => f.required && !formData[f.key]?.trim())
    if (missing.length > 0) {
      setLocalError(`Please fill: ${missing.map((f) => f.label).join(', ')}`)
      return
    }
    setLocalError(null)
    setFormSubmitted(true)

    try {
      // 1. Generate RTI, then resolve department
      await rtiGenerate(caseId, formData)
      const dept = await resolveDepartment(caseId)
      setDepartmentInfo(dept)
      setStage('PREDICTING')
    } catch (e) {
      setLocalError(e?.response?.data?.detail || e.message)
      setFormSubmitted(false)
    }
  }

  const handleConfirmDepartment = async () => {
    setDepartmentConfirmed(true)
    runPredict()
  }

  const handleChatSend = async (message) => {
    addChatMessage({ role: 'user', content: message })
    setChatLoading(true)
    try {
      const res = await chatContinue(caseId, message)
      const reply = res.ai_response || "Got it."
      addChatMessage({ role: 'assistant', content: reply })
      const merged = res.updated_facts || res.new_facts_extracted
      if (merged && Object.keys(merged).length > 0) {
        setExtractedFacts({ ...extractedFacts, ...merged })
      }
      if (res.is_complete) {
        setFormSubmitted(true)
        // Auto-run form logic for chat completions
        const dept = await resolveDepartment(caseId)
        setDepartmentInfo(dept)
        setStage('PREDICTING')
      }
    } catch (e) {
      setLocalError(e?.response?.data?.detail || e.message)
    } finally {
      setChatLoading(false)
    }
  }

  const runPredict = async () => {
    setPredictLoading(true)
    try {
      const res = await rtiPredict(caseId)
      setRtiPrediction(res)
      setStage('IMPROVING')
      await runImprove()
    } catch (e) {
      setLocalError(e?.response?.data?.detail || e.message)
    } finally {
      setPredictLoading(false)
    }
  }

  const runImprove = async () => {
    setImproveLoading(true)
    try {
      const res = await rtiImprove(caseId)
      setRtiDraft(res.improved_draft)
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
          </div>
        </div>
        <div className="flex items-center gap-3">
          <CaseIdBadge caseId={caseId} />
          <PipelineTracker stage={stage} route={route} />
        </div>
      </header>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 p-4 overflow-auto">
        <div className="glass-card flex flex-col p-5 gap-4 min-h-[500px]">
          {formMode ? (
            <div className="flex flex-col gap-3 flex-1">
              <p className="text-xs text-slate-500">Fill in required details.</p>
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
              {!formSubmitted && (
                <button onClick={handleFormSubmit} className="btn-primary justify-center">
                  <Zap size={15} /> Resolve Jurisdiction
                </button>
              )}
            </div>
          ) : (
            <ChatInterface
              messages={chatMessages}
              onSend={handleChatSend}
              isLoading={chatLoading}
              placeholder="Ask CivicRoute AI to help gather RTI details…"
            />
          )}
        </div>

        <div className="glass-card flex flex-col p-5 gap-4">
          {!departmentConfirmed && departmentInfo ? (
            <RTIConfirmationCard departmentInfo={departmentInfo} onConfirm={handleConfirmDepartment} />
          ) : (
            <>
              {rtiPrediction && (
                <RiskMeter prediction={rtiPrediction.prediction} probabilities={rtiPrediction.probabilities} />
              )}
            </>
          )}
        </div>

        <div className="flex flex-col gap-4">
          {rtiDraft && (
            <DraftViewer title="Remolded RTI Application" draft={rtiDraft} caseId={caseId} />
          )}
        </div>
      </div>
    </div>
  )
}
