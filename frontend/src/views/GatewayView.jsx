import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, ArrowRight, Scale, FileSearch, Loader2, AlertCircle, CheckCircle2, RotateCcw, HelpCircle, Globe, KeyRound, Copy, Download, Lock, RefreshCw, FolderOpen, Check } from 'lucide-react'
import useCaseStore from '../store/caseStore'
import { initCase, classifyCase, getCase } from '../api'
import CaseIdBadge from '../components/CaseIdBadge'
import AudioRecorder from '../components/AudioRecorder'

export default function GatewayView() {
  const [text, setText] = useState('')
  const [passkey, setPasskey] = useState('')
  const [resumeMode, setResumeMode] = useState(false)
  const [localErr, setLocalErr] = useState(null)
  
  // Modal State
  const [showPasskeyModal, setShowPasskeyModal] = useState(false)
  const [copied, setCopied] = useState(false)

  const { stage, setStage, caseId, setCaseId, classifyResult, setClassifyResult, setUserProblem, language, setLanguage, hydrateState } = useCaseStore()

  const isProcessing = stage === 'INITIALIZING' || stage === 'CLASSIFYING' || showPasskeyModal
  const isClassified = stage === 'CLASSIFIED_CONFIRM' && classifyResult

  // STEP 1: Initialize case and trigger the pop-up modal
  const handleStartCase = async () => {
    if (!text.trim() || isProcessing) return
    setLocalErr(null)
    try {
      setStage('INITIALIZING')
      const { case_id } = await initCase()
      setCaseId(case_id)
      setUserProblem(text.trim())
      setStage('IDLE')
      setShowPasskeyModal(true)
    } catch (err) {
      setLocalErr(err?.response?.data?.detail || err.message || 'Something went wrong.')
      setStage('IDLE')
    }
  }

  // STEP 2: Triggered when user clicks "Continue to AI Classification" inside the modal
  const handleProceedToAI = async () => {
    setShowPasskeyModal(false)
    setLocalErr(null)
    try {
      setStage('CLASSIFYING')
      const result = await classifyCase(caseId, text.trim(), language)
      setClassifyResult(result)
      setStage('CLASSIFIED_CONFIRM')
    } catch (err) {
      setLocalErr(err?.response?.data?.detail || err.message || 'Something went wrong during classification.')
      setStage('IDLE')
      setShowPasskeyModal(true)
    }
  }

  const handleCopyId = () => {
    navigator.clipboard.writeText(caseId)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownloadTxt = () => {
    const element = document.createElement("a")
    const file = new Blob([`JanAdhikar Private Case ID: ${caseId}\nKeep this key safe to resume your case anytime.`], {type: 'text/plain'})
    element.href = URL.createObjectURL(file)
    element.download = `${caseId}-Passkey.txt`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  const handleResume = async () => {
    if (!passkey.trim() || isProcessing) return
    setLocalErr(null)
    setStage('INITIALIZING')
    try {
      const res = await getCase(passkey.trim().toUpperCase())
      if (!res) throw new Error("Case not found.")
      hydrateState(res.case_id, res.data)
    } catch (err) {
      setLocalErr('Invalid Case ID or expired session. Please check and try again.')
      setStage('IDLE')
    }
  }

  return (
    <div className="gradient-bg min-h-screen flex flex-col items-center justify-center p-4 relative">
      
      {/* ── PASSKEY POP-UP MODAL OVERLAY ── */}
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
              className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-8 border border-slate-200 relative overflow-hidden text-center"
            >
              <div className="absolute top-0 left-0 w-full h-1.5 bg-court-maroon"></div>
              
              {/* Top Local Badge */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-semibold mb-4 shadow-sm">
                <KeyRound size={13} />
                <span>Case Registered Locally</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-ashoka-navy mb-2 tracking-tight">
                Save Your Private Case ID
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mb-6 max-w-sm mx-auto">
                Save this 10-character code before we identify your route. You will need it to reopen your case anytime without an account.
              </p>

              {/* Central Passkey Container Box */}
              <div className="bg-slate-50/70 border border-[#b8c2cc]/60 rounded-2xl p-6 shadow-inner mb-6">
                <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">
                  YOUR PRIVATE ACCESS IDENTIFIER
                </span>
                
                <div className="text-2xl sm:text-3xl font-mono font-black text-ashoka-navy tracking-widest mb-6">
                  {caseId}
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5">
                  <button 
                    onClick={handleCopyId}
                    className="w-full sm:w-auto flex-1 bg-court-maroon hover:bg-[#701A75] text-white font-semibold py-2.5 px-4 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 text-xs cursor-pointer"
                  >
                    {copied ? <Check size={15} className="text-emerald-300" /> : <Copy size={15} />}
                    {copied ? 'Copied!' : 'Copy Case ID'}
                  </button>

                  <button 
                    onClick={handleDownloadTxt}
                    className="w-full sm:w-auto flex-1 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-semibold py-2.5 px-4 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 text-xs cursor-pointer"
                  >
                    <Download size={15} className="text-slate-500" />
                    <span>Download .txt Key</span>
                  </button>
                </div>
              </div>

              {/* Zero-Account Privacy Footer Note */}
              <div className="bg-white border border-slate-200 rounded-2xl p-3.5 text-left flex items-start gap-3 shadow-sm mb-6">
                <div className="mt-0.5 text-emerald-600 flex-shrink-0">
                  <Lock size={15} />
                </div>
                <div>
                  <h4 className="text-[11px] font-bold text-slate-900 uppercase tracking-wide mb-0.5">Zero-Account Privacy:</h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Take a quick screenshot or write it down. Your case is encrypted in this browser and never linked to your phone number or email.
                  </p>
                </div>
              </div>

              {localErr && <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl mb-4 text-left">{localErr}</div>}

              <button 
                onClick={handleProceedToAI} 
                disabled={stage === 'CLASSIFYING'}
                className="btn-primary w-full justify-center text-sm py-3 cursor-pointer"
              >
                {stage === 'CLASSIFYING' ? <><Loader2 size={16} className="animate-spin" /> Analyzing Legal Route...</> : <><span>Continue to AI Classification</span><ArrowRight size={16} /></>}
              </button>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* ──────────────────────────────────── */}

      <AnimatePresence mode="wait">
        {!resumeMode ? (
          
          /* --- MAIN INPUT SCREEN --- */
          <motion.div key="main" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="w-full max-w-2xl text-center">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-ashoka-navy mb-3 tracking-tight">What is your problem?</h1>
            <p className="text-lg text-slate-500 mb-8">Write it in your own words. Our AI will figure out the rest.</p>
            
            <div className="bg-white border border-[#b8c2cc] rounded-3xl shadow-sm mb-6 text-left">
              <textarea
                rows={6}
                value={text}
                onChange={(e) => setText(e.target.value)}
                disabled={stage === 'INITIALIZING'}
                placeholder="e.g. My pension has not come for 3 months. My landlord refuses to return my deposit..."
                className="w-full bg-transparent p-6 text-lg text-ashoka-navy placeholder-slate-400 focus:outline-none resize-none rounded-t-3xl"
              />
              <div className="flex items-center justify-between px-6 pb-5">
                <AudioRecorder language={language} onTranscription={(t) => setText(prev => prev + (prev ? " " : "") + t)} />
                <span className="text-sm text-slate-400 font-medium">{text.length} chars</span>
              </div>
            </div>

            {localErr && <div className="p-3 bg-red-50 text-red-700 text-sm rounded-xl mb-4 text-left">{localErr}</div>}

            <button onClick={handleStartCase} disabled={!text.trim() || stage === 'INITIALIZING'} className="btn-primary w-full justify-center text-lg py-4 cursor-pointer">
              {stage === 'INITIALIZING' ? <><Loader2 className="animate-spin" /> Generating Passkey...</> : <>Analyse my problem <ArrowRight size={20} /></>}
            </button>

            <div className="mt-8 flex items-center justify-between px-2">
              <button onClick={() => setResumeMode(true)} className="text-court-maroon font-semibold text-sm hover:underline cursor-pointer">Resume your case</button>
              <button onClick={() => window.location.reload()} className="text-slate-500 flex items-center gap-1.5 text-sm font-medium hover:text-ashoka-navy cursor-pointer"><RefreshCw size={14}/> Reset Demos</button>
            </div>
          </motion.div>
        ) : (
          
          /* --- RESUME CASE SCREEN --- */
          <motion.div key="resume" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} className="w-full max-w-lg bg-white p-8 rounded-3xl shadow-xl border border-slate-100 text-center">
            <div className="w-14 h-14 bg-rose-50 text-court-maroon rounded-2xl flex items-center justify-center mx-auto mb-6 border border-rose-100">
              <FolderOpen size={28} />
            </div>
            <h2 className="text-3xl font-extrabold text-ashoka-navy mb-3">Resume your case</h2>
            <p className="text-slate-500 mb-8">Enter your 10-character Case ID to pick up where you left off.</p>
            
            <input 
              type="text" 
              value={passkey} 
              onChange={(e) => setPasskey(e.target.value.toUpperCase())}
              placeholder="E.G. JA-26-8F4K2"
              className="w-full text-center bg-slate-50 border border-slate-200 rounded-xl p-4 text-lg font-mono tracking-widest uppercase mb-6 placeholder:text-slate-300 focus:ring-2 focus:ring-court-maroon/20 focus:border-court-maroon"
            />
            
            {localErr && <div className="p-3 bg-red-50 text-red-700 text-sm rounded-xl mb-4 text-left">{localErr}</div>}

            <button onClick={handleResume} disabled={!passkey.trim() || stage === 'INITIALIZING'} className="btn-primary w-full justify-center text-lg py-4 mb-8 shadow-lg cursor-pointer">
              {stage === 'INITIALIZING' ? <Loader2 className="animate-spin" /> : <>Open case <ArrowRight size={20} /></>}
            </button>
            
            <div className="flex items-center justify-between border-t border-slate-100 pt-6">
              <button onClick={() => setResumeMode(false)} className="text-court-maroon font-semibold text-sm hover:underline cursor-pointer">Start a new case instead</button>
              <button onClick={() => window.location.reload()} className="text-slate-500 flex items-center gap-1.5 text-sm font-medium hover:text-ashoka-navy cursor-pointer"><RefreshCw size={14}/> Reset Demos</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
