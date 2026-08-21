'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { getCase, analyzePio } from '@/lib/api';

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

// FIX: Extracted inner content to isolate useSearchParams
function TrackPageContent() {
  const searchParams = useSearchParams();
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
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-12 font-mono">
      {/* Header & Case Lookup Bar */}
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
              <span className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
              Post-RTI Lifecycle & Appellate Tracker
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Deterministic SLA enforcer & Section 20 penalty engine
            </p>
          </div>

          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <input
              type="text"
              placeholder="Enter Case ID (e.g. CR-8921-A)"
              value={inputCaseId}
              onChange={(e) => setInputCaseId(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 w-64"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm px-4 py-2 rounded-lg transition cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Fetching...' : 'Track'}
            </button>
          </form>
        </div>

        {error && (
          <div className="bg-rose-950/50 border border-rose-800 text-rose-300 p-4 rounded-xl text-sm">
            ⚠️ {error}. Please verify the Case ID and try again.
          </div>
        )}

        {caseData && (
          <>
            {/* Top Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Status Card */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-2">
                <span className="text-xs font-semibold uppercase text-slate-400 tracking-wider">
                  Current Case Status
                </span>
                <div className="text-xl font-bold text-emerald-400">
                  {caseData.computed_status?.replace(/_/g, ' ') || 'Active'}
                </div>
                <p className="text-xs text-slate-400">
                  Filed on: {caseData.filing_date ? new Date(caseData.filing_date).toLocaleDateString() : 'N/A'}
                </p>
              </div>

              {/* Countdown / SLA Clock */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-2">
                <span className="text-xs font-semibold uppercase text-slate-400 tracking-wider">
                  30-Day SLA Deadline
                </span>
                <div className="text-xl font-bold text-slate-100">
                  {caseData.is_overdue ? (
                    <span className="text-rose-400">Overdue by {caseData.days_overdue} Day(s)</span>
                  ) : (
                    <span className="text-amber-400">
                      Due: {caseData.response_due_date ? new Date(caseData.response_due_date).toLocaleDateString() : 'N/A'}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400">Section 7(1) Statutory Response Window</p>
              </div>

              {/* Section 20 Penalty Box */}
              <div
                className={`border rounded-xl p-5 space-y-2 ${
                  (caseData.section_20_penalty_inr || 0) > 0
                    ? 'bg-rose-950/30 border-rose-800/80'
                    : 'bg-slate-900/80 border-slate-800'
                }`}
              >
                <span className="text-xs font-semibold uppercase text-rose-400 tracking-wider flex items-center justify-between">
                  Section 20 Penalty Accrued
                  {(caseData.section_20_penalty_inr || 0) > 0 && (
                    <span className="text-[10px] bg-rose-900/80 text-rose-200 px-2 py-0.5 rounded-full">
                      ₹250 / Day
                    </span>
                  )}
                </span>
                <div className="text-2xl font-black text-rose-300">
                  ₹{(caseData.section_20_penalty_inr || 0).toLocaleString('en-IN')}
                </div>
                <p className="text-xs text-slate-400">
                  Personal statutory liability owed by the PIO
                </p>
              </div>
            </div>

            {/* PIO Reply Analysis Engine */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-slate-800 pb-4">
                <div>
                  <h2 className="text-lg font-bold text-white">Public Information Officer (PIO) Reply</h2>
                  <p className="text-xs text-slate-400">
                    Paste government response text or flag deemed refusal for zero-response cases.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setPioInputText('');
                    handleAnalyzePIO('');
                  }}
                  className="bg-amber-900/40 hover:bg-amber-900/60 border border-amber-700/50 text-amber-300 text-xs px-3 py-2 rounded-lg transition self-start sm:self-auto cursor-pointer"
                >
                  ⚡ Mark Deemed Refusal (No Reply)
                </button>
              </div>

              <div className="space-y-4">
                <textarea
                  rows={4}
                  value={pioInputText}
                  onChange={(e) => setPioInputText(e.target.value)}
                  placeholder="Paste response letter text or email received from the PIO here..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
                />

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => handleAnalyzePIO()}
                    disabled={analyzing}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm px-6 py-2.5 rounded-xl transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {analyzing ? 'Analyzing with AI...' : '🔍 Analyze PIO Reply'}
                  </button>
                </div>
              </div>

              {/* Analysis Result Box */}
              {analysisResult && (
                <div className="mt-6 bg-slate-950 border border-slate-800 rounded-xl p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <span className="text-xs uppercase text-slate-400 font-bold">
                      Extracted Exemption Clause:
                    </span>
                    <span className="bg-rose-900/50 text-rose-200 border border-rose-800 px-3 py-1 rounded-full text-xs font-bold">
                      Section {analysisResult.exemption_cited}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-slate-200 mb-1">
                      {analysisResult.precedent_title}
                    </h3>
                    <p className="text-xs text-slate-300 bg-slate-900 border border-slate-800 p-3 rounded-lg leading-relaxed">
                      {analysisResult.legal_counter}
                    </p>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <Link
                      href={`/rti/appeal?case_id=${caseData.case_id}&mode=appeal`}
                      className="bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs px-5 py-2.5 rounded-lg transition"
                    >
                      📄 Generate First Appeal Document (Sec 19(1))
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// FIX: Wrap the track page component in a Suspense boundary to satisfy Next.js build requirement
export default function TrackPage() {
  return (
    <Suspense 
      fallback={
        <div className="min-h-screen bg-slate-950 text-slate-400 flex items-center justify-center p-6 font-mono text-sm">
          Loading tracker environment...
        </div>
      }
    >
      <TrackPageContent />
    </Suspense>
  );
}
