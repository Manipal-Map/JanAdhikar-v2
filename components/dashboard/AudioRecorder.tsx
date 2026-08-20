'use client';
import { useState, useRef } from 'react'
import { Mic, Square, Loader2 } from 'lucide-react'

// Adjust this import if your API function is located elsewhere
import { transcribeAudio } from '@/lib/api' 

export default function AudioRecorder({ onTranscription, language = "English" }) {
  const [isRecording, setIsRecording] = useState(false)
  const [isTranscribing, setIsTranscribing] = useState(false)
  const mediaRecorderRef = useRef(null)
  const chunksRef = useRef([])
  const streamRef = useRef(null)

  const startRecording = async () => {
    // FIX: We completely removed the Web Speech API. 
    // This forces the browser to ONLY use MediaRecorder, 
    // permanently eliminating the "Apps on device" permission warning.
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' })
        chunksRef.current = []
        setIsTranscribing(true)
        try {
          const res = await transcribeAudio(audioBlob, language)
          const resultText = res.text || res.transcription || ''
          if (resultText && onTranscription) onTranscription(resultText)
        } catch (error) {
          console.error("Transcription failed", error)
        } finally {
          setIsTranscribing(false)
          if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop())
          }
        }
      }

      mediaRecorder.start()
      setIsRecording(true)
    } catch (err) {
      alert("Microphone permission was denied or is not supported by your browser.")
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      try {
        mediaRecorderRef.current.stop()
      } catch (e) {}
    }
    setIsRecording(false)
  }

  if (isTranscribing) {
    return (
      <button disabled className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-500 rounded-full border border-slate-200 text-sm font-semibold cursor-not-allowed">
        <Loader2 size={16} className="animate-spin" />
        <span>Processing Audio...</span>
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={isRecording ? stopRecording : startRecording}
      className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-semibold transition-all cursor-pointer ${
        isRecording 
          ? 'bg-red-50 border-red-200 text-red-600 animate-pulse' 
          : 'bg-[#FAF8F5] border-[#E2E8F0] text-ashoka-navy hover:bg-slate-100'
      }`}
      title={isRecording ? "Stop Dictation" : "Start Voice Input"}
    >
      {isRecording ? <Square size={16} /> : <Mic size={16} />}
      <span>{isRecording ? 'Listening (Stop)' : 'Voice Input'}</span>
    </button>
  )
}
