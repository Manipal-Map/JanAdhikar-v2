import { useState, useRef } from 'react'
import { Mic, Square, Loader2 } from 'lucide-react'
import { transcribeAudio } from '../api'

export default function AudioRecorder({ onTranscription, language = "English" }) {
  const [isRecording, setIsRecording] = useState(false)
  const [isTranscribing, setIsTranscribing] = useState(false)
  const mediaRecorderRef = useRef(null)
  const chunksRef = useRef([])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaRecorderRef.current = new MediaRecorder(stream)
      
      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' })
        chunksRef.current = []
        setIsTranscribing(true)
        try {
          const res = await transcribeAudio(audioBlob, language)
          if (res.text) onTranscription(res.text)
        } catch (error) {
          console.error("Transcription failed", error)
        } finally {
          setIsTranscribing(false)
          stream.getTracks().forEach(track => track.stop())
        }
      }

      mediaRecorderRef.current.start()
      setIsRecording(true)
    } catch (err) {
      alert("Microphone access denied.")
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  if (isTranscribing) {
    return (
      <button disabled className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-500 rounded-full border border-slate-200 text-sm font-semibold cursor-not-allowed">
        <Loader2 size={16} className="animate-spin" />
        <span>Processing...</span>
      </button>
    )
  }

  return (
    <button
      onClick={isRecording ? stopRecording : startRecording}
      className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-semibold transition-all ${
        isRecording 
          ? 'bg-red-50 border-red-200 text-red-600 animate-pulse' 
          : 'bg-[#FAF8F5] border-[#E2E8F0] text-ashoka-navy hover:bg-slate-100'
      }`}
      title={isRecording ? "Stop Dictation" : "Start Voice Input"}
    >
      {isRecording ? <Square size={16} /> : <Mic size={16} />}
      <span>{isRecording ? 'Stop' : 'Voice'}</span>
    </button>
  )
}
