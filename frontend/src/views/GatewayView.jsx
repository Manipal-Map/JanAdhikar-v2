import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, ArrowRight, Scale, FileSearch, Loader2, AlertCircle, CheckCircle2, RotateCcw, HelpCircle, Globe, FolderOpen, RefreshCw } from 'lucide-react'
import useCaseStore from '../store/caseStore'
import { initCase, classifyCase, getCase } from '../api'
import CaseIdBadge from '../components/CaseIdBadge'
import AudioRecorder from '../components/AudioRecorder'

export default function GatewayView() {
  const [text, setText] = useState('')
  const [passkey, setPasskey] = useState('')
  const [resumeMode, setResumeMode] = useState(false)
  const [localErr, setLocalErr] = useState(null)
  
  const { stage, setStage, caseId, setCaseId, classifyResult, setClassifyResult, setUserProblem, language, setLanguage, hydrateState } = useCaseStore()

  const isProcessing = stage === 'INITIALIZING' || stage === 'CLASSIFYING'
  const isClassified = stage === 'CLASSIFIED_CONFIRM' && classifyResult

  const handleStartCase = async () => {
    if (!text.trim() || isProcessing) return
    setLocalErr(null)
    try {
      setStage('INITIALIZING')
      const { case_id } = await initCase()
      setCaseId(case_id)
      setUserProblem(text.trim())
      setStage('CLASSIFYING')
      const result = await classifyCase(case_id, text.trim(), language)
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
      setLocalErr('Invalid Case ID. Please check and try again.')
      setStage('IDLE')
    }
  }

  return (
    <div className="gradient-bg min-h-screen flex flex-col items-center justify-center p-4">
      <AnimatePresence mode="wait">
        {!resumeMode ? (
          /* --- MAIN INPUT SCREEN --- */
          <motion.div key="main" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="w-full max-w-2xl text-center">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-[#1a233a] mb-3 tracking-tight">What is your problem?</h1>
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

            {localErr && <div className="p-3 bg-red-50 text-red-700 text-sm rounded-xl mb-4">{localErr}</div>}

            <button onClick={handleStartCase} disabled={!text.trim() || isProcessing} className="w-full bg-[#EA580C] hover:bg-[#C2410C] text-white text-lg font-bold py-4 rounded-2xl transition-all shadow-md flex items-center justify-center gap-2">
              {isProcessing ? <Loader2 className="animate-spin" /> : <>Analyse my problem <ArrowRight size={20} /></>}
            </button>

            <div className="mt-8 flex items-center justify-between px-2">
              <button onClick={() => setResumeMode(true)} className="text-[#C2410C] font-semibold text-sm hover:underline">Start a new case instead</button>
              <button className="text-slate-500 flex items-center gap-1.5 text-sm font-medium hover:text-ashoka-navy"><RefreshCw size={14}/> Reset Demos</button>
            </div>
          </motion.div>
        ) : (
          /* --- RESUME CASE SCREEN (MATCHES YOUR IMAGE) --- */
          <motion.div key="resume" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} className="w-full max-w-lg bg-white p-8 rounded-3xl shadow-xl border border-slate-100 text-center">
            <div className="w-14 h-14 bg-indigo-50 text-[#1a233a] rounded-2xl flex items-center justify-center mx-auto mb-6">
              <FolderOpen size={28} />
            </div>
            <h2 className="text-3xl font-extrabold text-[#1a233a] mb-3">Resume your case</h2>
            <p className="text-slate-500 mb-8">Enter your 10-character Case ID to pick up where you left off.</p>
            
            <input 
              type="text" 
              value={passkey} 
              onChange={(e) => setPasskey(e.target.value.toUpperCase())}
              placeholder="E.G. JA-26-8F4K2"
              className="w-full text-center bg-slate-50 border border-slate-200 rounded-xl p-4 text-lg font-mono tracking-widest uppercase mb-6 placeholder:text-slate-300 focus:ring-2 focus:ring-[#1a233a]/20 focus:border-[#1a233a]"
            />
            
            <button onClick={handleResume} disabled={!passkey.trim() || isProcessing} className="w-full bg-[#1a233a] hover:bg-[#0f172a] text-white text-lg font-bold py-4 rounded-xl transition-all mb-8 shadow-lg flex items-center justify-center gap-2">
              {isProcessing ? <Loader2 className="animate-spin" /> : <>Open case <ArrowRight size={20} /></>}
            </button>
            
            <div className="flex items-center justify-between border-t border-slate-100 pt-6">
              <button onClick={() => setResumeMode(false)} className="text-[#C2410C] font-semibold text-sm hover:underline">Start a new case instead</button>
              <button onClick={() => window.location.reload()} className="text-slate-500 flex items-center gap-1.5 text-sm font-medium hover:text-ashoka-navy"><RefreshCw size={14}/> Reset Demos</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
