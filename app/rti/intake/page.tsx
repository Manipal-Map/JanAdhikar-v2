'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Mic, Send, FileText } from 'lucide-react';
import { initCase, classifyCase, rtiGenerate, transcribeAudio } from '@/lib/api';

export default function RTIIntakePage() {
  const router = useRouter();
  const [problemText, setProblemText] = useState('');
  const [language, setLanguage] = useState('en');
  const [loading, setLoading] = useState(false);
  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);

  const handleSubmit = async (textToSubmit: string) => {
    if (!textToSubmit.trim()) return;

    setLoading(true);
    try {
      const initRes = await initCase();
      const caseId = initRes.case_id;

      await classifyCase(caseId, textToSubmit, language);
      await rtiGenerate(caseId, { problem_text: textToSubmit });

      router.push(`/rti/result?case_id=${caseId}`);
    } catch (err) {
      console.error('Failed to initialize or generate RTI:', err);
      alert('An error occurred. Please check your connection and try again.');
      setLoading(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];

      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: 'audio/webm' });
        setLoading(true);
        try {
          const transcriptionRes = await transcribeAudio(audioBlob, language);
          const transcribedText = transcriptionRes.text || transcriptionRes.transcription;
          if (transcribedText) {
            setProblemText(transcribedText);
            await handleSubmit(transcribedText);
          } else {
            setLoading(false);
            alert('Could not transcribe audio. Please type your issue.');
          }
        } catch (err) {
          console.error('Transcription failed:', err);
          setLoading(false);
          alert('Audio transcription failed.');
        }
      };

      recorder.start();
      setMediaRecorder(recorder);
      setRecording(true);
    } catch (err) {
      console.error('Microphone access denied:', err);
      alert('Microphone permission is required for voice intake.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setRecording(false);
    }
  };

  return (
    <main 
      className="min-h-screen py-12 px-4 sm:px-6 flex items-center justify-center bg-cover bg-center bg-no-repeat relative text-slate-200"
      style={{ backgroundImage: "url('/bg.image.png')" }}
    >
      <div className="max-w-2xl w-full space-y-6 relative z-10">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center p-3 bg-slate-800 text-white rounded-2xl mb-2 shadow-sm border border-slate-700">
            <FileText size={24} />
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight drop-shadow-md">File an RTI Application</h1>
          <p className="text-xs text-blue-100 font-medium drop-shadow-sm">
            Describe your grievance or information request below, or use voice input.
          </p>
        </div>

        <div className="bg-[#0F172A]/85 backdrop-blur-md border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Select Language
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full p-3 text-xs bg-[#1E293B]/60 border border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF9933] text-white font-medium"
            >
              <option value="en">English</option>
              <option value="hi">Hindi (हिन्दी)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Describe Your Issue / Information Request
            </label>
            <textarea
              value={problemText}
              onChange={(e) => setProblemText(e.target.value)}
              placeholder="E.G., I applied for my passport 3 months ago at the regional office, but haven't received any updates..."
              rows={6}
              className="w-full p-4 text-xs font-mono bg-[#1E293B]/60 border border-slate-600 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#FF9933] leading-relaxed text-white placeholder-slate-500"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={() => handleSubmit(problemText)}
              disabled={loading || !problemText.trim()}
              type="button"
              className="flex-1 flex items-center justify-center gap-2 py-3 text-xs font-bold text-white bg-[#A32A02] hover:bg-[#138808] transition-colors rounded-xl shadow-sm disabled:opacity-50 cursor-pointer"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              {loading ? 'Processing Application...' : 'Generate RTI Application'}
            </button>

            <button
              onClick={recording ? stopRecording : startRecording}
              disabled={loading}
              type="button"
              className={`flex items-center justify-center px-4 py-3 text-xs font-semibold rounded-xl border transition-colors cursor-pointer ${
                recording
                  ? 'bg-rose-950/30 text-rose-400 border-rose-900/50 animate-pulse'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
            >
              <Mic size={16} />
              <span className="ml-1.5">{recording ? 'Stop' : 'Voice'}</span>
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
