'use client';
import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Bot, User, ArrowRight, ShieldCheck, CheckCircle2, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import useCaseStore from '@/store/caseStore';
import { intakeChat, classifyCase } from '@/lib/api';

export default function IntakeChatView() {
  const router = useRouter();
  const { userProblem, caseId, language, setClassifyResult, setFormData, setStage } = useCaseStore();
  
  const [messages, setMessages] = useState<Array<{ role: 'assistant' | 'user'; content: string }>>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [extractedData, setExtractedData] = useState<any>({});
  const [classifying, setClassifying] = useState(false);
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const initialTriggered = useRef(false);

  useEffect(() => {
    if (initialTriggered.current) return;
    initialTriggered.current = true;

    const startIntake = async () => {
      const initialProblem = userProblem || "I have a civic / administrative issue.";
      const greetingHistory = [
        { role: 'user' as const, content: initialProblem }
      ];
      setMessages(greetingHistory);
      setLoading(true);

      try {
        const data = await intakeChat({
          message: initialProblem,
          history: [],
          current_extracted_data: {}
        });

        setMessages([
          { role: 'user', content: initialProblem },
          { role: 'assistant', content: data.assistant_reply }
        ]);
        setIsReady(!!data.is_ready_to_proceed);
        setExtractedData(data.extracted_data || {});
      } catch (err) {
        setMessages([
          { role: 'user', content: initialProblem },
          { role: 'assistant', content: "Namaste! I have received your initial issue description. Could you please specify:\n1. Your city or district\n2. The specific office, company, or authority involved?" }
        ]);
      } finally {
        setLoading(false);
      }
    };

    startIntake();
  }, [userProblem]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (e?: React.FormEvent | React.KeyboardEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || loading) return;

    const userText = input.trim();
    setInput('');
    const newHistory = [...messages, { role: 'user' as const, content: userText }];
    setMessages(newHistory);
    setLoading(true);

    try {
      const data = await intakeChat({
        message: userText,
        history: newHistory.map(m => ({ role: m.role, content: m.content })),
        current_extracted_data: extractedData
      });

      setMessages(prev => [...prev, { role: 'assistant', content: data.assistant_reply }]);
      setIsReady(!!data.is_ready_to_proceed);
      setExtractedData(data.extracted_data || {});
      
    } catch (err) {
      console.error("Chat Error:", err);
      setMessages(prev => [...prev, { role: 'assistant', content: "Network error occurred. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault(); 
      handleSend(e);      
    }
  };

  const handleProceedToClassification = async () => {
    setClassifying(true);
    try {
      const fullProblemDescription = extractedData.problem_summary || userProblem || messages.map(m => m.content).join(' ');
      
      const classification = await classifyCase(caseId || '', fullProblemDescription, language || 'English');
      
      setClassifyResult(classification);
      
      setFormData({
        applicant_city: extractedData.applicant_city || '',
        applicant_name: extractedData.applicant_name || '',
        applicant_contact: extractedData.applicant_contact || '',
        user_problem: fullProblemDescription,
      });

      setStage('CLASSIFIED_CONFIRM');
      router.push('/dashboard');
    } catch (err) {
      const fallbackRoute = extractedData.route_guess === 'RTI' ? 'RTI' : 'Rights/Grievance';
      setClassifyResult({
        route: fallbackRoute,
        sub_category: extractedData.problem_summary || 'Civic Issue',
        confidence: 0.92,
        reasoning: extractedData.additional_notes || 'Classified based on intake facts.',
        form_schema: []
      });
      setStage('CLASSIFIED_CONFIRM');
      router.push('/dashboard');
    } finally {
      setClassifying(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-between p-4 sm:p-6 bg-cover bg-center bg-no-repeat relative text-slate-200 font-sans"
      style={{ backgroundImage: "url('/bg.image.png')" }}
    >
      <div className="w-full max-w-3xl mx-auto flex items-center justify-between py-3 border-b border-slate-700/60 mb-4 bg-[#0F172A]/85 backdrop-blur-md px-4 rounded-2xl shadow-xl relative z-10">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => router.push('/dashboard')}
            className="p-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-700 transition shadow-sm cursor-pointer"
            title="Back to Overview"
          >
            <ArrowLeft size={16} />
          </button>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#1E293B] border border-slate-700 flex items-center justify-center text-white shadow-sm">
              <ShieldCheck size={20} className="text-[#FF9933]" />
            </div>
            <div>
              <h1 className="text-base font-extrabold text-white tracking-tight">JanAdhikar Legal Intake</h1>
              <p className="text-xs text-slate-400 font-medium">Step 2: Fact &amp; Information Gathering</p>
            </div>
          </div>
        </div>
        {caseId && (
          <span className="text-xs font-mono font-bold text-slate-300 bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700 shadow-sm">
            #{caseId}
          </span>
        )}
      </div>

      <div className="w-full max-w-3xl flex-1 overflow-y-auto space-y-5 pr-1 mb-4 relative z-10">
        {messages.map((msg, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm border ${
              msg.role === 'user' ? 'bg-[#A32A02] text-white border-[#A32A02]/50' : 'bg-[#1E293B] text-slate-300 border-slate-700'
            }`}>
              {msg.role === 'user' ? <User size={15} /> : <Bot size={15} />}
            </div>
            <div className={`p-4 rounded-2xl max-w-[80%] text-sm leading-relaxed shadow-md whitespace-pre-line text-left border ${
              msg.role === 'user' 
                ? 'bg-[#A32A02] text-white rounded-tr-none border-transparent font-medium tracking-tight' 
                : 'bg-[#1E293B]/80 backdrop-blur-md text-slate-200 border-slate-700 rounded-tl-none font-medium'
            }`}>
              {msg.content}
            </div>
          </motion.div>
        ))}

        {loading && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#1E293B] text-slate-300 border border-slate-700 flex items-center justify-center shadow-sm">
              <Bot size={15} />
            </div>
            <div className="p-4 bg-[#1E293B]/80 backdrop-blur-md border border-slate-700 rounded-2xl rounded-tl-none text-slate-400 text-sm flex items-center gap-2 shadow-sm font-medium">
              <span className="w-2 h-2 rounded-full bg-slate-500 animate-bounce" />
              <span className="w-2 h-2 rounded-full bg-slate-500 animate-bounce [animation-delay:0.2s]" />
              <span className="w-2 h-2 rounded-full bg-slate-500 animate-bounce [animation-delay:0.4s]" />
              <span className="ml-1 text-xs text-slate-400 font-medium tracking-tight">AI is reviewing your case facts...</span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      <div className="w-full max-w-3xl mx-auto space-y-3 relative z-10">
        {isReady && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-4 bg-[#1E293B]/80 backdrop-blur-md border border-slate-700 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md"
          >
            <div className="flex items-center gap-2.5 text-xs sm:text-sm text-white font-bold text-left tracking-tight">
              <CheckCircle2 size={20} className="text-[#FF9933] shrink-0" />
              <span>Information gathered. Ready to analyze legal classification.</span>
            </div>
            <button
              onClick={handleProceedToClassification}
              disabled={classifying}
              className="btn-primary cursor-pointer text-xs sm:text-sm py-2.5 px-5 bg-[#A32A02] hover:bg-[#138808] transition-colors text-white font-bold flex items-center justify-center gap-2 shadow-md rounded-xl"
            >
              <span>{classifying ? "Classifying..." : "View Legal Classification"}</span>
              <ArrowRight size={15} />
            </button>
          </motion.div>
        )}

        <form onSubmit={handleSend} className="p-2 flex items-end gap-2 shadow-xl bg-[#0F172A]/90 backdrop-blur-md rounded-2xl border border-slate-600 focus-within:border-[#FF9933] focus-within:ring-1 focus-within:ring-[#FF9933] transition-all">
          <textarea
            rows={2}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your reply... (Shift + Enter for new line)"
            className="flex-1 px-4 py-3 text-sm bg-transparent border-none focus:outline-none text-white font-medium placeholder-slate-500 resize-none leading-relaxed"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="btn-primary cursor-pointer p-3 rounded-xl disabled:opacity-50 bg-[#A32A02] text-white hover:bg-[#138808] transition-colors mb-0.5 shadow-md"
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}
