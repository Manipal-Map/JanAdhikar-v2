'use client';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Sparkles, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import useCaseStore from '@/store/caseStore';

export default function IntakeChatView() {
  const router = useRouter();
  const { setClassifyResult, setFormData, setCaseId } = useCaseStore();
  
  const [messages, setMessages] = useState<Array<{ role: 'assistant' | 'user'; content: string }>>([
    {
      role: 'assistant',
      content: "Namaste! I am your JanAdhikar Legal Intake Assistant. Please tell me about the problem you are facing (e.g., pension delayed, corrupted public road, service refund refusal). I'll listen, help organize the facts, and fill in the details for you!"
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [extractedData, setExtractedData] = useState<any>({});
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userText = input.trim();
    setInput('');
    const newHistory = [...messages, { role: 'user' as const, content: userText }];
    setMessages(newHistory);
    setLoading(true);

    try {
      const res = await fetch('https://jan-adhikar-backend.vercel.app/api/intake/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userText,
          history: newHistory.map(m => ({ role: m.role, content: m.content })),
          current_extracted_data: extractedData
        })
      });

      const data = await res.json();
      if (res.ok) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.assistant_reply }]);
        setIsReady(data.is_ready_to_proceed);
        setExtractedData(data.extracted_data || {});
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: "I encountered a minor connection glitch. Please tell me more about your situation." }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: "Network error occurred. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleProceedToForm = () => {
    // Save extracted AI facts into store state so the next form page auto-fills them
    setClassifyResult({
      route: extractedData.route_guess || 'Rights/Grievance',
      sub_category: extractedData.problem_summary || 'Civic Grievance',
      confidence: 0.95,
      reasoning: extractedData.additional_notes || 'Intake pre-screened by AI.',
      form_schema: []
    });

    setFormData({
      applicant_city: extractedData.applicant_city || 'Jaipur',
      applicant_name: extractedData.applicant_name || '',
      applicant_contact: extractedData.applicant_contact || '',
      user_problem: extractedData.problem_summary || ''
    });

    // Generate temporary case ID & transition to details/form view
    setCaseId(`JA-${Math.floor(100000 + Math.random() * 900000)}`);
    router.push('/dashboard/form'); 
  };

  return (
    <div className="gradient-bg min-h-screen flex flex-col items-center justify-between p-4 sm:p-6">
      {/* Top Header */}
      <div className="w-full max-w-3xl mx-auto flex items-center justify-between py-3 border-b border-slate-200/80 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-ashoka-navy flex items-center justify-center text-white shadow-sm">
            <ShieldCheck size={20} />
          </div>
          <div>
            <h1 className="text-base font-bold text-ashoka-navy">JanAdhikar AI Intake & KYC</h1>
            <p className="text-xs text-slate-500">Conversational Pre-Screening & Case Setup</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-amber-50 border border-amber-200 rounded-full text-xs font-medium text-amber-800">
          <Sparkles size={13} className="text-amber-600 animate-pulse" /> AI Active
        </div>
      </div>

      {/* Chat Messages Container */}
      <div className="w-full max-w-3xl flex-1 overflow-y-auto space-y-4 pr-1 mb-4">
        {messages.map((msg, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
              msg.role === 'user' ? 'bg-court-maroon text-white' : 'bg-ashoka-navy text-white'
            }`}>
              {msg.role === 'user' ? <User size={15} /> : <Bot size={15} />}
            </div>
            <div className={`p-4 rounded-2xl max-w-[80%] text-sm leading-relaxed shadow-2xs ${
              msg.role === 'user' 
                ? 'bg-court-maroon text-white rounded-tr-none' 
                : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none'
            }`}>
              {msg.content}
            </div>
          </motion.div>
        ))}

        {loading && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-ashoka-navy text-white flex items-center justify-center">
              <Bot size={15} />
            </div>
            <div className="p-4 bg-white border border-slate-200 rounded-2xl rounded-tl-none text-slate-500 text-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-court-maroon animate-bounce" />
              <span className="w-2 h-2 rounded-full bg-court-maroon animate-bounce [animation-delay:0.2s]" />
              <span className="w-2 h-2 rounded-full bg-court-maroon animate-bounce [animation-delay:0.4s]" />
              <span className="ml-1 text-xs text-slate-400">AI is analyzing your facts...</span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Footer / Action Box */}
      <div className="w-full max-w-3xl mx-auto space-y-3">
        {isReady && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between shadow-sm"
          >
            <div className="flex items-center gap-2.5 text-xs sm:text-sm text-emerald-900 font-medium">
              <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
              <span>AI has successfully gathered all required facts & auto-filled your KYC!</span>
            </div>
            <button
              onClick={handleProceedToForm}
              className="btn-primary cursor-pointer text-xs sm:text-sm py-2 px-4 bg-emerald-700 hover:bg-emerald-800 text-white flex items-center gap-1.5 shadow-sm"
            >
              Proceed to Draft <ArrowRight size={15} />
            </button>
          </motion.div>
        )}

        <form onSubmit={handleSend} className="glass-card p-2 flex items-center gap-2 shadow-sm">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Type your reply or explain your problem..."
            className="flex-1 px-4 py-2.5 text-sm bg-transparent border-none focus:outline-none text-slate-800 placeholder:text-slate-400"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="btn-primary cursor-pointer p-2.5 rounded-xl disabled:opacity-50"
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  )
}
