import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Scale, Loader2, CheckCircle2, AlertCircle,
  ChevronDown, ChevronUp, ExternalLink, Gavel,
} from 'lucide-react'
import useCaseStore from '../store/caseStore'
import { chatContinue, grievanceGenerate } from '../api'
import CaseIdBadge from '../components/CaseIdBadge'
import PipelineTracker from '../components/PipelineTracker'
import ChatInterface from '../components/ChatInterface'
import FactChecklist from '../components/FactChecklist'
import DraftViewer from '../components/DraftViewer'

// ── Accordion step for filing guide ────────────────────────────────────────
function FilingStep({ step, index }) {
  const [open, setOpen] = useState(index === 0)
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className="border border-white/8 rounded-xl overflow-hidden"
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 text-left bg-navy-700/60 hover:bg-navy-700 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <span className="w-5 h-5 rounded-full bg-brand-blue/20 border border-brand-blue/30 flex items-center justify-center text-xs font-bold text-blue-400">
            {index + 1}
          </span>
          <span className="text-sm font-medium text-slate-300">{step.split(':')[0]}</span>
        </div>
        {open ? <ChevronUp size={15} className="text-slate-500" /> : <ChevronDown size={15} className="text-slate-500" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="px-4 py-3 text-sm text-slate-400 leading-relaxed border-t border-white/5 bg-navy-800/40"
          >
            {step.includes(':') ? step.split(':').slice(1).join(':').trim() : step}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default function GrievanceView() {
  const {
    caseId, classifyResult, stage, setStage,
    chatMessages, addChatMessage,
    extractedFacts, setExtractedFacts,
    grievanceResult, setGrievanceResult,
    setError,
  } = useCaseStore()

  const [chatLoading, setChatLoading]       = useState(false)
  const [analyzeLoading, setAnalyzeLoading] = useState(false)
  const [localError, setLocalError]         = useState(null)
  const [autoTriggered, setAutoTriggered]   = useState(false)

  const schema  = classifyResult?.form_schema || []
  const route   = classifyResult?.route || 'Rights/Grievance'

  // Greet the user on mount
  useEffect(() => {
    if (chatMessages.length === 0) {
      addChatMessage({
        role: 'assistant',
        content:
          `I've classified your case as: **${classifyResult?.sub_category}** — ${classifyResult?.reasoning}\n\nTo prepare your Legal Demand Action Pack, please tell me more about the situation. Who is the opposing party, when did the incident occur, and what is the amount involved?`,
      })
    }
  }, [])

  // ── Chat turn ─────────────────────────────────────────────────────────────
  const handleChatSend = async (message) => {
    addChatMessage({ role: 'user', content: message })
    setChatLoading(true)
    try {
      const res = await chatContinue(caseId, message)

      // Add AI reply (guard against null)
      const reply = res.ai_response || "I've noted that. Can you share any additional details?"
      addChatMessage({ role: 'assistant', content: reply })

      // Merge extracted facts — prefer updated_facts (full server state) over new_facts_extracted
      const merged = res.updated_facts || res.new_facts_extracted
      if (merged && Object.keys(merged).length > 0) {
        setExtractedFacts({ ...extractedFacts, ...merged })
      }

      // Auto-trigger analysis when AI signals completion
      if (res.is_complete && !autoTriggered) {
        setAutoTriggered(true)
        await runAnalysis()
      }
    } catch (e) {
      setLocalError(e?.response?.data?.detail || e.message)
      addChatMessage({
        role: 'assistant',
        content: 'Sorry, I had trouble processing that. Please try again or click **Generate Legal Demand Pack** when ready.',
      })
    } finally {
      setChatLoading(false)
    }
  }

  // ── Manually trigger analysis ─────────────────────────────────────────────
  const runAnalysis = async () => {
    setAnalyzeLoading(true)
    setStage('GRIEVANCE_ANALYZING')
    try {
      // Pass extracted facts + schema data as form_data to the backend
      const res = await grievanceGenerate(caseId, extractedFacts)
      setGrievanceResult(res)
      setStage('COMPLETE')
    } catch (e) {
      setLocalError(e?.response?.data?.detail || e.message)
      setError(e?.response?.data?.detail || e.message)
    } finally {
      setAnalyzeLoading(false)
    }
  }

  return (
    <div className="gradient-bg min-h-screen flex flex-col">
      {/* ── Top bar ── */}
      <header className="px-6 py-4 border-b border-white/5 flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex items-center gap-3 flex-1">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 flex items-center justify-center border border-amber-500/30">
            <Scale size={15} className="text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white">Grievance Workflow</span>
              <span className="badge-grievance">{classifyResult?.sub_category}</span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">{classifyResult?.reasoning}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <CaseIdBadge caseId={caseId} />
          <PipelineTracker stage={stage} route={route} />
        </div>
      </header>

      {/* ── Legal Analysis Banner ── */}
      {grievanceResult && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-4 mt-4 p-4 bg-amber-500/10 border border-amber-500/25 rounded-2xl flex items-start gap-3"
        >
          <Gavel size={18} className="text-amber-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-amber-300 mb-1">Legal Analysis</p>
            <p className="text-sm text-slate-300 leading-relaxed">
              {grievanceResult.legal_analysis}
            </p>
          </div>
        </motion.div>
      )}

      {/* ── 2-column layout ── */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 p-4 overflow-auto">

        {/* ── LEFT: Chat + facts ── */}
        <div className="flex flex-col gap-4">
          {/* Case Strategy Compliance Box */}
          <div className="glass-card p-5">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 size={15} className="text-emerald-400" />
              <h2 className="text-sm font-bold text-white">Case Strategy & Compliance</h2>
              <span className="ml-auto text-xs text-slate-500">
                Confidence: {((classifyResult?.confidence || 0) * 100).toFixed(0)}%
              </span>
            </div>
            <div className="space-y-2 mb-4">
              {[
                'Consumer Protection Act, 2019 — Applicable',
                'CPGRAMS Filing — Available for govt. services',
                'e-Daakhil Portal — Consumer court online filing',
                'Legal demand notice — Required before filing',
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <CheckCircle2 size={13} className="text-emerald-400 flex-shrink-0" />
                  <span className="text-slate-300">{item}</span>
                </div>
              ))}
            </div>
            {/* Extracted facts */}
            {Object.keys(extractedFacts).length > 0 && (
              <div className="pt-3 border-t border-white/5">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
                  Collected Details
                </p>
                <FactChecklist facts={extractedFacts} schema={schema} />
              </div>
            )}
          </div>

          {/* Chat */}
          <div className="glass-card p-5 flex flex-col" style={{ minHeight: '400px' }}>
            <h2 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              💬 <span>Information Gathering</span>
            </h2>
            <div className="flex-1 min-h-0">
              <ChatInterface
                messages={chatMessages}
                onSend={handleChatSend}
                isLoading={chatLoading}
                placeholder="Describe what happened, who is responsible, and any financial details…"
              />
            </div>
          </div>

          {localError && (
            <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/25 rounded-xl text-sm text-red-400">
              <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
              {localError}
            </div>
          )}

          {/* Manual trigger button */}
          {!grievanceResult && stage !== 'COMPLETE' && (
            <button
              onClick={runAnalysis}
              disabled={analyzeLoading}
              className="btn-primary justify-center py-3"
            >
              {analyzeLoading ? (
                <><Loader2 size={15} className="animate-spin" /> Generating Legal Pack…</>
              ) : (
                <><Gavel size={15} /> Generate Legal Demand Pack</>
              )}
            </button>
          )}
        </div>

        {/* ── RIGHT: Demand notice + filing guide ── */}
        <div className="flex flex-col gap-4">
          {analyzeLoading && !grievanceResult && (
            <div className="glass-card p-10 flex flex-col items-center gap-3 text-slate-500">
              <Loader2 size={28} className="animate-spin text-amber-400" />
              <p className="text-sm text-center">Generating your Legal Demand Action Pack…</p>
            </div>
          )}

          {!grievanceResult && !analyzeLoading && (
            <div className="glass-card p-10 flex flex-col items-center gap-3 text-slate-600">
              <Scale size={32} />
              <p className="text-sm text-center">
                Provide case details in the chat, then click Generate to create your Legal Demand Pack.
              </p>
            </div>
          )}

          {grievanceResult && (
            <>
              {/* Demand notice */}
              <DraftViewer
                title="Legal Demand Notice"
                draft={grievanceResult.demand_notice_draft}
                caseId={caseId}
              />

              {/* Filing guide */}
              {grievanceResult.filing_portal_guide?.length > 0 && (
                <div className="glass-card p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <ExternalLink size={15} className="text-blue-400" />
                    <h3 className="text-sm font-bold text-white">Filing Portal Guide</h3>
                  </div>
                  <div className="space-y-2">
                    {grievanceResult.filing_portal_guide.map((step, i) => (
                      <FilingStep key={i} step={step} index={i} />
                    ))}
                  </div>
                  <div className="mt-4 flex gap-2">
                    <a
                      href="https://edaakhil.nic.in"
                      target="_blank"
                      rel="noreferrer"
                      className="btn-primary text-xs py-2 px-4"
                    >
                      <ExternalLink size={12} /> e-Daakhil Portal
                    </a>
                    <a
                      href="https://consumerhelpline.gov.in"
                      target="_blank"
                      rel="noreferrer"
                      className="btn-ghost text-xs py-2 px-4 border border-white/10"
                    >
                      <ExternalLink size={12} /> NCH Helpline
                    </a>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
