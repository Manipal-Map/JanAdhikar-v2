import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Scale, FileSearch, Loader2, AlertCircle, CheckCircle2, RotateCcw, HelpCircle, Globe, KeyRound, Copy, Lock, ArrowRight } from 'lucide-react'
import useCaseStore from '../store/caseStore'
import { initCase, classifyCase, getCase } from '../api'
import CaseIdBadge from '../components/CaseIdBadge'
import AudioRecorder from '../components/AudioRecorder'

const ROUTE_DESCRIPTIONS = {
  RTI: {
    title: 'Right to Information (RTI) Application',
    badge: 'Statutory RTI Filing',
    icon: FileSearch,
    description: 'You are requesting official government records, tender documents, inspection reports, or file movements under the RTI Act, 2005.',
    actionText: 'Confirm & Proceed to RTI',
  },
  'Rights/Grievance': {
    title: 'Consumer / Administrative Grievance',
    badge: 'Legal Dispute / Relief',
    icon: Scale,
    description: 'You are seeking dispute resolution, refunds, compensation, or action against service deficiency.',
    actionText: 'Confirm & Generate Legal Notice',
  },
  Other: {
    title: 'General or Out of Scope Query',
    badge: 'Outside Platform Scope',
    icon: HelpCircle,
    description: 'This problem falls outside statutory RTI and administrative consumer grievance frameworks.',
    actionText: 'View Guidance & Resources',
  }
}

export default function GatewayView() {
  const [text, setText] = useState('')
  const [passkey, setPasskey] = useState('')
  const [resumeMode, setResumeMode] = useState(false)
  const [localErr, setLocalErr] = useState(null)
  
  const [showPasskeyModal, setShowPasskeyModal] = useState(false)
  const [passkeyCopied, setPasskeyCopied] = useState(false)

  const {
    stage, setStage, caseId, setCaseId,
    classifyResult, setClassifyResult,
    setUserProblem, language, setLanguage,
    hydrateState
  } = useCaseStore()

  const isProcessing = stage === 'INITIALIZING' || stage === 'CLASSIFYING' || showPasskeyModal
  const isClassified = stage === 'CLASSIFIED_CONFIRM' && classifyResult

  const handleStartCase = async () => {
    if (!text.trim() || isProcessing) return
    setLocalErr(null)

    try {
      setStage('INITIALIZING')
      const { case_id } = await initCase()
      setCaseId(case_id)
      setUserProblem(text.trim())
      setShowPasskeyModal(true)
    } catch (err) {
      setLocalErr(err?.response?.data?.detail || err.message || 'Something went wrong.')
      setStage('IDLE')
    }
  }

  const handleProceedToAI = async () => {
    setShowPasskeyModal(false)
    try {
      setStage('CLASSIFYING')
      const result = await classifyCase(caseId, text.trim(), language)
      setClassifyResult(result)
      setStage('CLASSIFIED_CONFIRM')
    } catch (err) {
      setLocalErr(err?.response?.data?.detail || err.message || 'Something went wrong.')
      setStage('IDLE')
    }
  }

  const handleResume = async () => {
    if (!passkey.trim() || isProcessing) return
    setLocalErr(null)
    setStage('INITIALIZING')

    try {
      const res = await getCase(passkey.trim().toUpperCase())
      hydrateState(res.case_id, res.data)
    } catch (err) {
      setLocalErr('Passkey not found or expired. Please check and try again.')
      setStage('IDLE')
    }
  }

  const handleConfirmRoute = () => {
    if (!classifyResult) return
    if (classifyResult.route === 'RTI') setStage('RTI_GATHERING')
    else if (classifyResult.route === 'Rights/Grievance') setStage('GRIEVANCE_GATHERING')
    else setStage('OUT_OF_SCOPE')
  }

  const currentRouteMeta = classifyResult ? (ROUTE_DESCRIPTIONS[classifyResult.route] || ROUTE_DESCRIPTIONS.Other) : null
  const RouteIcon = currentRouteMeta?.icon || FileSearch

  return (
    <div className="gradient-bg min-h-screen flex flex-col relative">
      
      {/* ── PASSKEY MODAL OVERLAY ── */}
      <AnimatePresence>
        {showPasskeyModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-ashoka-navy/60 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-7 border border-slate-200 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1.5 bg-court-maroon"></div>
              
              <div className="w-14 h-14 bg-rose-50 text-court-maroon rounded-xl flex items-center justify-center mb-5 border border-rose-100">
                <KeyRound size={28} />
              </div>
              
              <h2 className="text-2xl font-bold text-ashoka-navy mb-2 tracking-tight">Save Your Passkey</h2>
              <p className="text-sm text-slate-600 leading-relaxed mb-6">
                To protect your privacy, we do not require user accounts. This passkey is your <strong>only way</strong> to access this case in the future.
              </p>

              <div 
                onClick={() => {
                  navigator.clipboard.writeText(caseId)
                  setPasskeyCopied(true)
                  setTimeout(() => setPasskeyCopied(false), 2000)
                }}
                className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl mb-6 cursor-pointer hover:bg-slate-100 hover:border-court-maroon/30 transition-all group"
                title="Click to copy"
              >
                <span className="font-mono font-bold text-xl text-ashoka-navy tracking-widest">{caseId}</span>
                <div className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg transition-colors ${passkeyCopied ? 'bg-statutory-green/10 text-statutory-green' : 'bg-court-maroon/10 text-court-maroon group-hover:bg-court-maroon/20'}`}>
                  {passkeyCopied ? <CheckCircle2 size={15} /> : <Copy size={15} />}
                  {passkeyCopied ? 'Copied!' : 'Copy Key'}
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
                <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-2">How to use it later:</h4>
                <ol className="text-sm text-amber-900 space-y-1.5 list-decimal list-inside font-medium">
                  <li>Keep this key safe (paste it in your notes).</li>
                  <li>If you leave the site, click "Resume Existing Case".</li>
                  <li>Enter the key to restore your drafts & PDFs instantly.</li>
                </ol>
              </div>

              <button 
                onClick={handleProceedToAI}
                className="btn-primary w-full justify-center py-3.5 text-base"
              >
                I have saved it, Continue <ArrowRight size={18} />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* ─────────────────────────── */}

      <header className="px-6 py-4 flex items-center justify-between border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-court-maroon/10 border border-court-maroon/20 flex items-center justify-center text-court-maroon shadow-sm">
            <Scale size={18} />
          </div>
          <div>
            <span className="font-bold text-ashoka-navy text-lg tracking-tight">JanAdhikar</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 shadow-sm">
            <Globe size={14} />
            <select value={language} onChange={(e) => setLanguage(e.target.value)} className="bg-transparent border-none outline-none cursor-pointer">
              <option value="English">English</option>
              <option value="Hinglish">Hinglish (Hindi in English Script)</option>
            </select>
          </div>
          {caseId && !showPasskeyModal && <CaseIdBadge caseId={caseId} />}
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-3xl mx-auto">
          <AnimatePresence mode="wait">
            {!isClassified ? (
              <motion.div key="input-screen" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                
                {!resumeMode ? (
                  // --- NEW CASE MODE (MATCHES MOCKUP EXACTLY) ---
                  <div className="text-center">
                    <h1 className="text-4xl sm:text-5xl font-extrabold text-[#1a233a] mb-3 tracking-tight">
                      What is your problem?
                    </h1>
                    <p className="text-lg text-slate-500 mb-8">
                      Write it in your own words. Our AI will figure out the rest.
                    </p>

                    <div className="relative bg-white border border-[#b8c2cc] rounded-3xl shadow-sm mb-6 transition-all focus-within:border-saffron-deep focus-within:ring-4 focus-within:ring-saffron-deep/10 text-left">
                      <textarea
                        rows={6}
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        disabled={isProcessing}
                        placeholder="e.g. My pension has not come for 3 months. My landlord refuses to return my deposit..."
                        className="w-full bg-transparent p-6 text-lg text-ashoka-navy placeholder-slate-400 focus:outline-none resize-none rounded-t-3xl"
                      />
                      <div className="flex items-center justify-between px-6 pb-5">
                        <AudioRecorder 
                          language={language} 
                          onTranscription={(t) => setText(prev => prev + (prev ? " " : "") + t)} 
                        />
                        <span className="text-sm text-slate-400 font-medium">
                          {text.length} chars
                        </span>
                      </div>
                    </div>

                    {localErr && (
                      <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl mb-6 text-sm text-red-700 text-left">
                        <AlertCircle size={16} className="mt-0.5 flex-shrink-0" /><span>{localErr}</span>
                      </div>
                    )}

                    <button 
                      onClick={handleStartCase} 
                      disabled={!text.trim() || isProcessing} 
                      className="w-full bg-[#EA580C] hover:bg-[#C2410C] disabled:bg-[#EA580C]/60 disabled:cursor-not-allowed text-white text-lg font-bold py-4 rounded-2xl transition-all shadow-md flex items-center justify-center gap-2"
                    >
                      {stage === 'INITIALIZING' ? <><Loader2 size={20} className="animate-spin" /> Generating Secure Passkey…</> 
                        : stage === 'CLASSIFYING' ? <><Loader2 size={20} className="animate-spin" /> Analyzing Legal Route…</> 
                        : <>Analyse my problem <ArrowRight size={20} /></>}
                    </button>

                    <div className="flex items-center justify-center gap-1.5 mt-5 text-sm text-slate-500">
                      <Lock size={14} className="text-emerald-600" />
                      <span>No account needed. Private & stays on your device.</span>
                    </div>
                    
                    {/* Resume Toggle */}
                    <div className="mt-8 text-center">
                      <button onClick={() => { setResumeMode(true); setLocalErr(null); }} className="text-sm font-medium text-slate-400 hover:text-court-maroon underline underline-offset-4 decoration-slate-300 hover:decoration-court-maroon transition-colors">
                        Already have an Issue Passkey? Resume here.
                      </button>
                    </div>
                  </div>
                ) : (
                  // --- RESUME MODE ---
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card p-8 text-left shadow-xl">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 bg-court-maroon/10 rounded-xl flex items-center justify-center text-court-maroon">
                        <KeyRound size={24} />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-ashoka-navy">Resume Case</h2>
                        <p className="text-sm text-slate-500">Enter your secure passkey to retrieve your data.</p>
                      </div>
                    </div>
                    
                    <input 
                      type="text"
                      value={passkey}
                      onChange={(e) => setPasskey(e.target.value.toUpperCase())}
                      disabled={isProcessing}
                      placeholder="e.g. CR-ABCD-1234"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-4 text-ashoka-navy placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-court-maroon/30 focus:border-court-maroon transition-all text-lg font-mono tracking-widest uppercase mb-6"
                    />
                    
                    {localErr && (
                      <div className="flex items-start gap-2 p-4 bg-red-50 border border-red-200 rounded-xl mb-6 text-sm text-red-700">
                        <AlertCircle size={16} className="mt-0.5 flex-shrink-0" /><span>{localErr}</span>
                      </div>
                    )}

                    <div className="flex gap-4">
                      <button onClick={() => { setResumeMode(false); setLocalErr(null); }} disabled={isProcessing} className="btn-ghost flex-1 justify-center py-3.5 text-base">
                        Back
                      </button>
                      <button onClick={handleResume} disabled={!passkey.trim() || isProcessing} className="btn-primary flex-1 justify-center py-3.5 text-base">
                        {isProcessing ? <Loader2 size={20} className="animate-spin" /> : 'Retrieve Case Data'}
                      </button>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ) : (
              <motion.div key="confirm-screen" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="glass-card p-8 shadow-xl border border-slate-200">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-court-maroon/10 text-court-maroon flex items-center justify-center flex-shrink-0">
                    <RouteIcon size={24} />
                  </div>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-court-maroon bg-court-maroon/10 px-2.5 py-0.5 rounded-full border border-court-maroon/20">{currentRouteMeta?.badge}</span>
                    <h2 className="text-xl font-extrabold text-ashoka-navy mt-1">{currentRouteMeta?.title}</h2>
                  </div>
                </div>
                <div className="bg-[#FAF8F5] p-5 rounded-xl border border-slate-200 mb-6 space-y-3">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Why this route?</h4>
                    <p className="text-sm text-ashoka-navy mt-1 font-medium leading-relaxed">{classifyResult.reasoning}</p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button onClick={handleConfirmRoute} className="btn-primary flex-1 justify-center py-3">
                    <CheckCircle2 size={16} />{currentRouteMeta?.actionText}
                  </button>
                  <button onClick={() => setStage('IDLE')} className="btn-ghost flex-initial justify-center py-3 border border-slate-200">
                    <RotateCcw size={15} /> Rephrase Problem
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
