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
  
  // Passkey Screen States
  const [showPasskeyScreen, setShowPasskeyScreen] = useState(false)
  const [copied, setCopied] = useState(false)

  const { stage, setStage, caseId, setCaseId, classifyResult, setClassifyResult, setUserProblem, language, setLanguage, hydrateState } = useCaseStore()

  const isProcessing = stage === 'INITIALIZING' || stage === 'CLASSIFYING' || showPasskeyScreen
  const isClassified = stage === 'CLASSIFIED_CONFIRM' && classifyResult

  const handleStartCase = async () => {
    if (!text.trim() || isProcessing) return
    setLocalErr(null)
    try {
      setStage('INITIALIZING')
      const { case_id } = await initCase()
      setCaseId(case_id)
      setUserProblem(text.trim())
      // Show the dedicated Passkey screen matching your mockup
      setShowPasskeyScreen(true)
    } catch (err) {
      setLocalErr(err?.response?.data?.detail || err.message || 'Something went wrong.')
      setStage('IDLE')
    }
  }

  const handleProceedToAI = async () => {
    setShowPasskeyScreen(false)
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
      hydrateState(res.case_id, res.data)
    } catch (err) {
      setLocalErr('Invalid Case ID. Please check and try again.')
      setStage('IDLE')
    }
  }

  return (
    <div className="gradient-bg min-h-screen flex flex-col items-center justify-center p-4 relative">
      <AnimatePresence mode="wait">
        
        {/* --- PASSKEY REGISTRATION SCREEN (MOCKUP MATCH WITH MAROON THEME) --- */}
        {showPasskeyScreen ? (
          <motion.div key="passkey-screen" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} className="w-full max-w-xl text-center">
            
            {/* Top Local Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-semibold mb-5 shadow-sm">
              <KeyRound size={13} />
              <span>Case Registered Locally</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-ashoka-navy mb-2 tracking-tight">
              Save Your Private Case ID
            </h1>
            <p className="text-sm text-slate-500 mb-8 max-w-md mx-auto">
              Save this 10-character code before we identify your route. You will need it to reopen your case anytime without an account.
            </p>

            {/* Central Passkey Container Box */}
            <div className="bg-white border border-[#b8c2cc]/60 rounded-3xl p-8 shadow-sm mb-6 relative overflow-hidden">
              <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
                YOUR PRIVATE ACCESS IDENTIFIER
              </span>
              
              <div className="text-3xl sm:text-4xl font-mono font-black text-ashoka-navy tracking-widest mb-8">
                {caseId}
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <button 
                  onClick={handleCopyId}
                  className="w-full sm:w-auto flex-1 bg-court-maroon hover:bg-[#701A75] text-white font-semibold py-3 px-5 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 text-sm"
                >
                  {copied ? <Check size={16} className="text-emerald-300" /> : <Copy size={16} />}
                  {copied ? 'Copied!' : 'Copy Case ID'}
                </button>

                <button 
                  onClick={handleDownloadTxt}
                  className="w-full sm:w-auto flex-1 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-semibold py-3 px-5 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 text-sm"
                >
                  <Download size={16} className="text-slate-500" />
                  <span>Download .txt Key</span>
                </button>
              </div>
            </div>

            {/* Zero-Account Privacy Footer Note */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 text-left flex items-start gap-3 shadow-sm mb-6">
              <div className="mt-0.5 text-emerald-600 flex-shrink-0">
                <Lock size={16} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide mb-1">Zero-Account Privacy:</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Take a quick screenshot or write it down. Your case is encrypted in this browser and never linked to your phone number or email.
                </p>
              </div>
            </div>

            <button 
              onClick={handleProceedToAI} 
              className="btn-primary w-full justify-center text-base py-3.5"
            >
              <span>Continue to AI Classification</span>
              <ArrowRight size={18} />
            </button>

          </motion.div>
        ) : !resumeMode ? (
          
          /* --- MAIN INPUT SCREEN --- */
          <motion.div key="main" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="w-full max-w-2xl text-center">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-ashoka-navy mb-3 tracking-tight">What is your problem?</h1>
            <p className="text-lg text-slate-500 mb-8">Write it in your own words. Our AI will figure out the rest.</p>
            
            <div className="bg-white border border-[#b8c2cc] rounded-3xl shadow-sm mb-6 text-left">
              <textarea
                rows={6}
                value={text}
                onChange={(e) => setText(e.target.value)}
                disabled={isProcessing}
                placeholder="e.g. My pension has not come for 3 months. My landlord refuses to return my deposit..."
                className="w-full bg-transparent p-6 text-lg text-ashoka-navy placeholder-slate-400 focus:outline-none resize-none rounded-t-3xl"
              />
              <div className="flex items-center justify-between px-6 pb-5">
                <AudioRecorder language={language} onTranscription={(t) => setText(prev => prev + (prev ? " " : "") + t)} />
                <span className="text-sm text-slate-400 font-medium">{text.length} chars</span>
              </div>
            </div>

            {localErr && <div className="p-3 bg-red-50 text-red-700 text-sm rounded-xl mb-4 text-left">{localErr}</div>}

            <button onClick={handleStartCase} disabled={!text.trim() || isProcessing} className="btn-primary w-full justify-center text-lg py-4">
              {isProcessing ? <Loader2 className="animate-spin" /> : <>Analyse my problem <ArrowRight size={20} /></>}
            </button>

            <div className="mt-8 flex items-center justify-between px-2">
              <button onClick={() => setResumeMode(true)} className="text-court-maroon font-semibold text-sm hover:underline">Resume your case</button>
              <button onClick={() => window.location.reload()} className="text-slate-500 flex items-center gap-1.5 text-sm font-medium hover:text-ashoka-navy"><RefreshCw size={14}/> Reset Demos</button>
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
            
            <button onClick={handleResume} disabled={!passkey.trim() || isProcessing} className="btn-primary w-full justify-center text-lg py-4 mb-8 shadow-lg">
              {isProcessing ? <Loader2 className="animate-spin" /> : <>Open case <ArrowRight size={20} /></>}
            </button>
            
            <div className="flex items-center justify-between border-t border-slate-100 pt-6">
              <button onClick={() => setResumeMode(false)} className="text-court-maroon font-semibold text-sm hover:underline">Start a new case instead</button>
              <button onClick={() => window.location.reload()} className="text-slate-500 flex items-center gap-1.5 text-sm font-medium hover:text-ashoka-navy"><RefreshCw size={14}/> Reset Demos</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
