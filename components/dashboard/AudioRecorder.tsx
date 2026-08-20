'use client';
import { useState, useRef, useEffect } from 'react'
import { Mic, Square, Loader2 } from 'lucide-react'
import { transcribeAudio } from '@/lib/api'

export default function AudioRecorder({ onTranscription, language = "English" }) {
  const [isRecording, setIsRecording] = useState(false)
  const [isTranscribing, setIsTranscribing] = useState(false)
  const recognitionRef = useRef(null)
  const mediaRecorderRef = useRef(null)
  const chunksRef = useRef([])
  const streamRef = useRef(null)

  useEffect(() => {
    // Check for native browser Web Speech Recognition API
    const SpeechRecognition = typeof window !== 'undefined' ? (window.SpeechRecognition || window.webkitSpeechRecognition) : null
    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition()
        recognition.continuous = true
        recognition.interimResults = false
        recognition.lang = language === 'Hindi' ? 'hi-IN' : (language === 'Hinglish' ? 'hi-IN' : 'en-IN')

        recognition.onresult = (event) => {
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              const text = event.results[i][0].transcript.trim()
              if (text && onTranscription) {
                onTranscription(text)
              }
            }
          }
        }

        recognition.onerror = (e) => {
          console.warn("Web Speech API error, falling back to audio recording", e)
        }

        recognition.onend = () => {
          setIsRecording(false)
        }

        recognitionRef.current = recognition
      } catch (e) {
        console.warn("Web Speech initialization error", e)
      }
    }
  }, [language, onTranscription])

  const startRecording = async () => {
    // Priority 1: Use native browser SpeechRecognition if available
    if (recognitionRef.current) {
      try {
        recognitionRef.current.lang = language === 'Hindi' ? 'hi-IN' : (language === 'Hinglish' ? 'hi-IN' : 'en-IN')
        recognitionRef.current.start()
        setIsRecording(true)
        return
      } catch (e) {
        console.warn("SpeechRecognition start failed, trying MediaRecorder fallback", e)
      }
    }

    // Priority 2: Use MediaRecorder + API
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
    if (recognitionRef.current && isRecording) {
      try {
        recognitionRef.current.stop()
      } catch (e) {}
    }
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
