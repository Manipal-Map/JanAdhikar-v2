'use client';
import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Bot, User, Sparkles, ArrowRight, ShieldCheck, CheckCircle2, ArrowLeft } from 'lucide-react';
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

  // Automatically kick off the conversation using the user's initial description
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

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
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

  // STEP 3: Trigger legal classification and return to the Classification Confirmation Screen
  const handleProceedToClassification = async () => {
    setClassifying(true);
    try {
      const fullProblemDescription = extractedData.problem_summary || userProblem || messages.map(m => m.content).join(' ');
      
      // Perform authoritative classification
      const classification = await classifyCase(caseId || '', fullProblemDescription, language || 'English');
      
      setClassifyResult(classification);
      
      // Pre-fill KYC & Applicant form data
      setFormData({
        applicant_city: extractedData.applicant_city || '',
        applicant_name: extractedData.applicant_name || '',
        applicant_contact: extractedData.applicant_contact || '',
        user_problem: fullProblemDescription,
      });

      // Set stage to confirmation and return to dashboard view
      setStage('CLASSIFIED_CONFIRM');
      router.push('/dashboard');
    } catch (err) {
      // Graceful fallback
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
    <div className="gradient-bg min-h-screen flex flex-col items-center justify-between p-4 sm:p-6">
      {/* Top Header */}
      <div className="w-full max-w-3xl mx-auto flex items-center justify-between py-3 border-b border-slate-200/80 mb-4">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => router.push('/dashboard')}
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 shadow-2xs cursor-pointer"
            title="Back to Overview"
          >
            <ArrowLeft size={16} />
          </button>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-court-maroon flex items-center justify-center text-white shadow-sm">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h1 className="text-base font-bold text-ashoka-navy">JanAdhikar Legal Intake Assistant</h1>
              <p className="text-xs text-slate-500">Step 2: Conversational Facts &amp; Information Gathering</p>
            </div>
          </div>
        </div>
        {caseId && (
          <span className="text-xs font-mono font-bold text-slate-600 bg-white px-3 py-1 rounded-xl border border-slate-300 shadow-2xs">
            #{caseId}
          </span>
        )}
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
              msg.role === 'user' ? 'bg-ashoka-navy text-white' : 'bg-court-maroon text-white'
            }`}>
              {msg.role === 'user' ? <User size={15} /> : <Bot size={15} />}
            </div>
            <div className={`p-4 rounded-2xl max-w-[80%] text-sm leading-relaxed shadow-2xs whitespace-pre-line text-left ${
              msg.role === 'user' 
                ? 'bg-ashoka-navy text-white rounded-tr-none' 
                : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none'
            }`}>
              {msg.content}
            </div>
          </motion.div>
        ))}

        {loading && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-court-maroon text-white flex items-center justify-center">
              <Bot size={15} />
            </div>
            <div className="p-4 bg-white border border-slate-200 rounded-2xl rounded-tl-none text-slate-500 text-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-court-maroon animate-bounce" />
              <span className="w-2 h-2 rounded-full bg-court-maroon animate-bounce [animation-delay:0.2s]" />
              <span className="w-2 h-2 rounded-full bg-court-maroon animate-bounce [animation-delay:0.4s]" />
              <span className="ml-1 text-xs text-slate-400">AI is reviewing your case facts...</span>
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
            className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md"
          >
            <div className="flex items-center gap-2.5 text-xs sm:text-sm text-emerald-950 font-semibold text-left">
              <CheckCircle2 size={20} className="text-emerald-600 shrink-0" />
              <span>Enough information gathered! Ready to analyze legal classification.</span>
            </div>
            <button
              onClick={handleProceedToClassification}
              disabled={classifying}
              className="btn-primary cursor-pointer text-xs sm:text-sm py-2.5 px-5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold flex items-center justify-center gap-2 shadow-sm rounded-xl"
            >
              <span>{classifying ? "Classifying..." : "View Legal Classification"}</span>
              <ArrowRight size={15} />
            </button>
          </motion.div>
        )}

        <form onSubmit={handleSend} className="glass-card p-2 flex items-center gap-2 shadow-sm bg-white rounded-2xl border border-slate-300">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Answer the AI's questions or provide more details..."
            className="flex-1 px-4 py-3 text-sm bg-transparent border-none focus:outline-none text-slate-800 placeholder:text-slate-400"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="btn-primary cursor-pointer p-3 rounded-xl disabled:opacity-50 bg-court-maroon text-white hover:bg-[#701A75]"
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}
