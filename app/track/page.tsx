'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getCase, analyzePio } from '@/lib/api';
import { ArrowLeft, Search, Clock, Scale, FileText } from 'lucide-react';

interface CaseMetrics {
  case_id: string;
  computed_status: string;
  is_overdue: boolean;
  days_overdue: number;
  section_20_penalty_inr: number;
  filing_date: string;
  response_due_date: string;
  first_appeal_due_date: string;
  time_remaining_seconds: number;
  pio_response_text?: string;
  exemption_cited?: string;
  legal_counter?: string;
  precedent_title?: string;
}

function TrackPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const caseIdParam = searchParams.get('case_id') || '';

  const [inputCaseId, setInputCaseId] = useState(caseIdParam);
  const [caseData, setCaseData] = useState<CaseMetrics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [pioInputText, setPioInputText] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  const fetchCaseDetails = async (id: string) => {
    if (!id.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getCase(id);
      if (!data) throw new Error('Case not found');
      setCaseData(data);
      if (data.pio_response_text) {
        setPioInputText(data.pio_response_text);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch case details');
      setCaseData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (caseIdParam) {
      fetchCaseDetails(caseIdParam);
    }
  }, [caseIdParam]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCaseDetails(inputCaseId);
  };

  const handleAnalyzePIO = async (overrideText?: string) => {
    const textToAnalyze = overrideText !== undefined ? overrideText : pioInputText;
    const currentCaseId = caseData?.case_id || inputCaseId;
    if (!currentCaseId) return;

    setAnalyzing(true);
    try {
      const data = await analyzePio(currentCaseId, textToAnalyze);
      setAnalysisResult(data);
      await fetchCaseDetails(currentCaseId);
    } catch (err) {
      console.error('PIO Analysis Error:', err);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div 
      className="min-h-screen font-sans p-4 sm:p-6 lg:p-8 selection:bg-court-maroon selection:text-white pb-20 bg-cover bg-center bg-no-repeat relative text-slate-200"
      style={{ backgroundImage: "url('/bg.image.png')" }}
    >
      <div className="max-w-6xl mx-auto space-y-8 pt-4 relative z-10">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 backdrop-blur-md bg-[#0F172A]/85 border border-white/10 p-4 rounded-2xl shadow-2xl">
          <div className="flex items-start sm:items-center gap-4">
            <button 
              onClick={() => router.push('/')}
              className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-700 transition shadow-sm cursor-pointer shrink-0 mt-1 sm:mt-0"
              title="Back to Landing Page"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3 drop-shadow-md">
                <span className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse hidden sm:block" />
                SLA & Appellate Tracker
              </h1>
              <p className="text-blue-100 text-sm mt-1 font-medium drop-shadow-sm">
                Deterministic SLA enforcer & Section 20 penalty engine
              </p>
            </div>
          </div>

          <form onSubmit={handleSearchSubmit} className="flex gap-2 w-full md:w-auto pl-12 sm:pl-0">
            <input
              type="text"
              placeholder="Enter Case ID (CR-...)"
              value={inputCaseId}
              onChange={(e) => setInputCaseId(e.target.value.toUpperCase())}
              className="bg-[#1E293B]/60 border border-slate-600 rounded-xl px-4 py-2.5 text-sm text-white font-bold focus:outline-none focus:border-[#FF9933] focus:ring-1 focus:ring-[#FF9933] w-full sm:w-56 uppercase tracking-widest shadow-sm placeholder:text-slate-500 placeholder:font-medium placeholder:tracking-normal placeholder:normal-case"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-[#A32A02] hover:bg-[#138808] transition-colors text-white font-bold text-sm px-6 py-2.5 rounded-xl cursor-pointer disabled:opacity-50 shadow-sm shrink-0"
            >
              {loading ? '...' : 'Track'}
            </button>
          </form>
        </div>

        {error && (
          <div className="bg-red-950/30 border border-red-900/50 text-red-400 p-4 rounded-2xl text-sm font-medium shadow-sm backdrop-blur-sm">
            ⚠️ {error}. Please verify the Case ID and try again.
          </div>
        )}

        {!caseData && !loading && !error && (
          <div className="mt-12 flex flex-col items-center justify-center text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="w-20 h-20 bg-[#0F172A]/80 border border-slate-700/60 rounded-full flex items-center justify-center mb-6 shadow-sm backdrop-blur-md">
              <Search className="w-10 h-10 text-slate-400" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-3 tracking-tight drop-shadow-md">
              Track Your Legal Petition
            </h2>
            <p className="text-blue-100 max-w-lg mb-12 font-medium leading-relaxed text-sm sm:text-base drop-shadow-sm">
              Enter your 12-character Case ID above to monitor your statutory RTI timeline, calculate Section 20 penalties, and automatically draft First Appeals.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full text-left">
              <div className="bg-[#0F172A]/85 backdrop-blur-md border border-white/10 p-6 sm:p-8 rounded-3xl shadow-2xl">
                <div className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center mb-5 border border-slate-700">
                  <Clock className="w-6 h-6 text-amber-500" />
                </div>
                <h3 className="font-extrabold text-white mb-2 text-base tracking-tight">30-Day Statutory Limit</h3>
                <p className="text-sm text-slate-300 leading-relaxed font-medium">
                  Under Section 7(1) of the RTI Act, 2005, the Public Information Officer (PIO) is legally bound to provide the requested information within 30 days of receipt.
                </p>
              </div>
              
              <div className="bg-[#0F172A]/85 backdrop-blur-md border border-white/10 p-6 sm:p-8 rounded-3xl shadow-2xl">
                <div className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center mb-5 border border-slate-700">
                  <Scale className="w-6 h-6 text-rose-500" />
                </div>
                <h3 className="font-extrabold text-white mb-2 text-base tracking-tight">Section 20 Penalties</h3>
                <p className="text-sm text-slate-300 leading-relaxed font-medium">
                  Unjustified delays attract a personal penalty on the PIO of ₹250 per day, up to a maximum of ₹25,000. Our engine tracks this liability automatically.
                </p>
              </div>
              
              <div className="bg-[#0F172A]/85 backdrop-blur-md border border-white/10 p-6 sm:p-8 rounded-3xl shadow-2xl">
                <div className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center mb-5 border border-slate-700">
                  <FileText className="w-6 h-6 text-emerald-500" />
                </div>
                <h3 className="font-extrabold text-white mb-2 text-base tracking-tight">First Appellate Route</h3>
                <p className="text-sm text-slate-300 leading-relaxed font-medium">
                  If the PIO denies information or fails to reply entirely, you are entitled to file a First Appeal under Section 19(1). We generate this court-ready draft for you.
                </p>
              </div>
            </div>
          </div>
        )}

        {caseData && (
          <div className="animate-in fade-in zoom-in-95 duration-300 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              <div className="bg-[#0F172A]/85 backdrop-blur-md border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-2">
                <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">
                  Current Case Status
                </span>
                <div className="text-2xl font-black text-emerald-400">
                  {caseData.computed_status?.replace(/_/g, ' ') || 'Active'}
                </div>
                <p className="text-xs text-slate-300 font-medium">
                  Filed on: {caseData.filing_date ? new Date(caseData.filing_date).toLocaleDateString() : 'N/A'}
                </p>
              </div>

              <div className="bg-[#0F172A]/85 backdrop-blur-md border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-2">
                <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">
                  30-Day SLA Deadline
                </span>
                <div className="text-2xl font-black text-white">
                  {caseData.is_overdue ? (
                    <span className="text-rose-400">Overdue by {caseData.days_overdue} Day(s)</span>
                  ) : (
                    <span className="text-amber-400">
                      Due: {caseData.response_due_date ? new Date(caseData.response_due_date).toLocaleDateString() : 'N/A'}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-300 font-medium">Section 7(1) Statutory Response Window</p>
              </div>

              <div
                className={`border rounded-3xl p-6 sm:p-8 space-y-2 shadow-2xl transition-colors backdrop-blur-md ${
                  (caseData.section_20_penalty_inr || 0) > 0
                    ? 'bg-rose-950/30 border-rose-900/50'
                    : 'bg-[#0F172A]/85 border-white/10'
                }`}
              >
                <span className={`text-xs font-bold uppercase tracking-wider flex items-center justify-between ${
                   (caseData.section_20_penalty_inr || 0) > 0 ? 'text-rose-400' : 'text-slate-400'
                }`}>
                  Section 20 Penalty Accrued
                  {(caseData.section_20_penalty_inr || 0) > 0 && (
                    <span className="text-[10px] bg-rose-600 text-white px-2.5 py-0.5 rounded-full shadow-sm">
                      ₹250 / Day
                    </span>
                  )}
                </span>
                <div className={`text-3xl font-black ${(caseData.section_20_penalty_inr || 0) > 0 ? 'text-rose-400' : 'text-white'}`}>
                  ₹{(caseData.section_20_penalty_inr || 0).toLocaleString('en-IN')}
                </div>
                <p className="text-xs text-slate-300 font-medium">
                  Personal statutory liability owed by the PIO
                </p>
              </div>
            </div>

            <div className="bg-[#0F172A]/85 backdrop-blur-md border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-slate-700/60 pb-5">
                <div>
                  <h2 className="text-xl font-extrabold text-white tracking-tight">Public Information Officer (PIO) Reply</h2>
                  <p className="text-sm text-slate-300 font-medium mt-1">
                    Paste the government response text here, or flag a deemed refusal for zero-response cases.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setPioInputText('');
                    handleAnalyzePIO('');
                  }}
                  className="bg-amber-950/30 hover:bg-amber-900/50 border border-amber-900/50 text-amber-400 font-bold text-xs px-4 py-2.5 rounded-xl transition self-start sm:self-auto cursor-pointer shadow-sm"
                >
                  ⚡ Mark Deemed Refusal (No Reply)
                </button>
              </div>

              <div className="space-y-4">
                <textarea
                  rows={5}
                  value={pioInputText}
                  onChange={(e) => setPioInputText(e.target.value)}
                  placeholder="Paste response letter text or email received from the PIO here..."
                  className="w-full bg-[#1E293B]/60 border border-slate-600 rounded-2xl p-5 text-sm text-white font-medium focus:outline-none focus:border-[#FF9933] focus:ring-1 focus:ring-[#FF9933] resize-none leading-relaxed placeholder-slate-500"
                />

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => handleAnalyzePIO()}
                    disabled={analyzing}
                    className="bg-[#A32A02] hover:bg-[#138808] transition-colors py-3.5 px-8 cursor-pointer text-white flex items-center gap-2 shadow-md rounded-xl font-bold disabled:opacity-50"
                  >
                    {analyzing ? 'Analyzing with AI...' : '🔍 Analyze PIO Reply'}
                  </button>
                </div>
              </div>

              {analysisResult && (
                <div className="mt-8 bg-[#1E293B]/60 border border-slate-700/50 rounded-3xl p-6 sm:p-8 space-y-5 shadow-inner">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-700/60 pb-4">
                    <span className="text-xs uppercase text-slate-400 font-bold tracking-wider">
                      Extracted Exemption Clause
                    </span>
                    <span className="bg-rose-950/30 text-rose-400 border border-rose-900/50 px-4 py-1.5 rounded-full text-xs font-bold shadow-sm self-start sm:self-auto">
                      Section {analysisResult.exemption_cited}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-extrabold text-white mb-2 tracking-tight">
                      {analysisResult.precedent_title}
                    </h3>
                    <p className="text-sm text-slate-200 bg-[#0F172A]/60 border border-slate-700 p-5 rounded-2xl leading-relaxed font-medium shadow-sm">
                      {analysisResult.legal_counter}
                    </p>
                  </div>

                  <div className="pt-4 flex justify-end">
                    <Link
                      href={`/rti/appeal?case_id=${caseData.case_id}&mode=appeal`}
                      className="bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white font-bold text-sm px-8 py-3.5 rounded-xl transition shadow-md flex items-center gap-2"
                    >
                      📄 Generate First Appeal Document (Sec 19(1))
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function TrackPage() {
  return (
    <Suspense 
      fallback={
        <div className="min-h-screen flex flex-col items-center justify-center p-6 text-sm font-bold text-white tracking-wide bg-cover bg-center" style={{ backgroundImage: "url('/bg.image.png')" }}>
          <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin mb-4" />
          Loading Tracker Environment...
        </div>
      }
    >
      <TrackPageContent />
    </Suspense>
  );
}
