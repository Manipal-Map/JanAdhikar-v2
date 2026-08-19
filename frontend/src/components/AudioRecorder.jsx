import { useState, useRef } from 'react'
import { Mic, Square, Loader2 } from 'lucide-react'
import { transcribeAudio } from '../api'

export default function AudioRecorder({ onTranscription }) {
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
          const res = await transcribeAudio(audioBlob)
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
      <button disabled className="p-3 bg-slate-100 text-slate-500 rounded-xl border border-slate-200 shadow-sm flex items-center justify-center">
        <Loader2 size={18} className="animate-spin" />
      </button>
    )
  }

  return (
    <button
      onClick={isRecording ? stopRecording : startRecording}
      className={`p-3 rounded-xl border shadow-sm flex items-center justify-center transition-all ${
        isRecording 
          ? 'bg-red-50 border-red-200 text-red-600 animate-pulse' 
          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
      }`}
      title={isRecording ? "Stop" : "Dictate Audio"}
    >
      {isRecording ? <Square size={18} /> : <Mic size={18} />}
    </button>
  )
}
