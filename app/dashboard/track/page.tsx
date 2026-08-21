'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getCase, analyzePio } from '@/lib/api';
import { ArrowLeft } from 'lucide-react';

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

  // PIO Response State
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
      // Refresh case metrics
      await fetchCaseDetails(currentCaseId);
    } catch (err) {
      console.error('PIO Analysis Error:', err);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="gradient-bg min-h-screen font-sans p-4 sm:p-6 lg:p-8 selection:bg-court-maroon selection:text-white pb-20">
      {/* Header & Case Lookup Bar */}
      <div className="max-w-6xl mx-auto space-y-8 pt-4">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-300 pb-6">
          <div className="flex items-start sm:items-center gap-4">
            <button 
              onClick={() => router.push('/dashboard')}
              className="p-2.5 rounded-xl bg-white border border-slate-300 text-slate-600 hover:text-ashoka-navy hover:bg-slate-50 transition shadow-sm cursor-pointer shrink-0 mt-1 sm:mt-0"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-ashoka-navy flex items-center gap-3">
                <span className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse hidden sm:block" />
                SLA & Appellate Tracker
              </h1>
              <p className="text-slate-500 text-sm mt-1 font-medium">
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
              className="bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-ashoka-navy font-bold focus:outline-none focus:border-court-maroon focus:ring-1 focus:ring-court-maroon w-full sm:w-56 uppercase tracking-widest shadow-sm placeholder:text-slate-400 placeholder:font-medium placeholder:tracking-normal placeholder:normal-case"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-ashoka-navy hover:bg-slate-800 text-white font-bold text-sm px-6 py-2.5 rounded-xl transition cursor-pointer disabled:opacity-50 shadow-sm shrink-0"
            >
              {loading ? '...' : 'Track'}
            </button>
          </form>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl text-sm font-medium shadow-sm">
            ⚠️ {error}. Please verify the Case ID and try again.
          </div>
        )}

        {caseData && (
          <div className="animate-in fade-in zoom-in-95 duration-300 space-y-8">
            {/* Top Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Status Card */}
              <div className="bg-white border border-slate-300 rounded-3xl p-6 sm:p-8 shadow-sm space-y-2">
                <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">
                  Current Case Status
                </span>
                <div className="text-2xl font-black text-emerald-600">
                  {caseData.computed_status?.replace(/_/g, ' ') || 'Active'}
                </div>
                <p className="text-xs text-slate-500 font-medium">
                  Filed on: {caseData.filing_date ? new Date(caseData.filing_date).toLocaleDateString() : 'N/A'}
                </p>
              </div>

              {/* Countdown / SLA Clock */}
              <div className="bg-white border border-slate-300 rounded-3xl p-6 sm:p-8 shadow-sm space-y-2">
                <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">
                  30-Day SLA Deadline
                </span>
                <div className="text-2xl font-black text-ashoka-navy">
                  {caseData.is_overdue ? (
                    <span className="text-court-maroon">Overdue by {caseData.days_overdue} Day(s)</span>
                  ) : (
                    <span className="text-amber-600">
                      Due: {caseData.response_due_date ? new Date(caseData.response_due_date).toLocaleDateString() : 'N/A'}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 font-medium">Section 7(1) Statutory Response Window</p>
              </div>

              {/* Section 20 Penalty Box */}
              <div
                className={`border rounded-3xl p-6 sm:p-8 space-y-2 shadow-sm transition-colors ${
                  (caseData.section_20_penalty_inr || 0) > 0
                    ? 'bg-rose-50 border-rose-200'
                    : 'bg-white border-slate-300'
                }`}
              >
                <span className={`text-xs font-bold uppercase tracking-wider flex items-center justify-between ${
                   (caseData.section_20_penalty_inr || 0) > 0 ? 'text-court-maroon' : 'text-slate-400'
                }`}>
                  Section 20 Penalty Accrued
                  {(caseData.section_20_penalty_inr || 0) > 0 && (
                    <span className="text-[10px] bg-court-maroon text-white px-2.5 py-0.5 rounded-full shadow-sm">
                      ₹250 / Day
                    </span>
                  )}
                </span>
                <div className={`text-3xl font-black ${(caseData.section_20_penalty_inr || 0) > 0 ? 'text-court-maroon' : 'text-ashoka-navy'}`}>
                  ₹{(caseData.section_20_penalty_inr || 0).toLocaleString('en-IN')}
                </div>
                <p className="text-xs text-slate-500 font-medium">
                  Personal statutory liability owed by the PIO
                </p>
              </div>
            </div>

            {/* PIO Reply Analysis Engine */}
            <div className="bg-white border border-slate-300 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-slate-200 pb-5">
                <div>
                  <h2 className="text-xl font-extrabold text-ashoka-navy tracking-tight">Public Information Officer (PIO) Reply</h2>
                  <p className="text-sm text-slate-500 font-medium mt-1">
                    Paste the government response text here, or flag a deemed refusal for zero-response cases.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setPioInputText('');
                    handleAnalyzePIO('');
                  }}
                  className="bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-700 font-bold text-xs px-4 py-2.5 rounded-xl transition self-start sm:self-auto cursor-pointer shadow-sm"
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
                  className="w-full bg-[#FAF8F5] border border-slate-300 rounded-2xl p-5 text-sm text-ashoka-navy font-medium focus:outline-none focus:border-court-maroon focus:ring-1 focus:ring-court-maroon resize-none leading-relaxed"
                />

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => handleAnalyzePIO()}
                    disabled={analyzing}
                    className="btn-primary py-3.5 px-8 cursor-pointer bg-court-maroon hover:bg-[#701A75] text-white flex items-center gap-2 shadow-md rounded-xl font-bold disabled:opacity-50"
                  >
                    {analyzing ? 'Analyzing with AI...' : '🔍 Analyze PIO Reply'}
                  </button>
                </div>
              </div>

              {/* Analysis Result Box */}
              {analysisResult && (
                <div className="mt-8 bg-[#FAF8F5] border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-5 shadow-inner">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
                    <span className="text-xs uppercase text-slate-500 font-bold tracking-wider">
                      Extracted Exemption Clause
                    </span>
                    <span className="bg-court-maroon/10 text-court-maroon border border-court-maroon/20 px-4 py-1.5 rounded-full text-xs font-bold shadow-sm self-start sm:self-auto">
                      Section {analysisResult.exemption_cited}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-extrabold text-ashoka-navy mb-2">
                      {analysisResult.precedent_title}
                    </h3>
                    <p className="text-sm text-slate-700 bg-white border border-slate-300 p-5 rounded-2xl leading-relaxed font-medium shadow-sm">
                      {analysisResult.legal_counter}
                    </p>
                  </div>

                  <div className="pt-4 flex justify-end">
                    <Link
                      href={`/rti/appeal?case_id=${caseData.case_id}&mode=appeal`}
                      className="bg-ashoka-navy hover:bg-slate-800 text-white font-bold text-sm px-8 py-3.5 rounded-xl transition shadow-md flex items-center gap-2"
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
        <div className="min-h-screen gradient-bg flex flex-col items-center justify-center p-6 text-sm font-bold text-ashoka-navy tracking-wide">
          <div className="w-8 h-8 border-4 border-court-maroon border-t-transparent rounded-full animate-spin mb-4" />
          Loading Tracker Environment...
        </div>
      }
    >
      <TrackPageContent />
    </Suspense>
  );
}
