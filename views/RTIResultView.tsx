'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FileSearch,
  ArrowRight,
  ArrowLeft,
  AlertTriangle,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import useCaseStore from '@/store/caseStore';
import { rtiPredict, rtiImprove } from '@/lib/api';
import DraftViewer from '@/components/dashboard/DraftViewer';

export default function RTIResultView() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get store values and setters
  const {
    caseId: storeCaseId,
    rtiDraft,
    setRtiDraft,
    setStage,
  } = useCaseStore();

  // Fallback to searchParams if store state is cleared on page refresh
  const caseId = storeCaseId || searchParams.get('case_id') || '';

  const [subStep, setSubStep] = useState<1 | 2>(1); // Step 1: Risk Analysis | Step 2: Improved Draft
  const [prediction, setPrediction] = useState<any>(null);
  const [loadingPred, setLoadingPred] = useState(false);
  const [loadingImprove, setLoadingImprove] = useState(false);
  const [improvedDraft, setImprovedDraft] = useState<string | null>(null);

  // Fetch prediction on load if draft is available
  useEffect(() => {
    const fetchPred = async () => {
      if (!rtiDraft || !caseId) return;
      setLoadingPred(true);
      try {
        const res = await rtiPredict(caseId, rtiDraft);
        setPrediction(res);
      } catch (e) {
        console.error('Prediction error:', e);
      } finally {
        setLoadingPred(false);
      }
    };

    fetchPred();
  }, [caseId, rtiDraft]);

  const handleGenerateImproved = async () => {
    if (!caseId) {
      alert('Case ID is missing.');
      return;
    }
    setLoadingImprove(true);
    try {
      const res = await rtiImprove(caseId);
      const newDraft = res.improved_draft || res.draft || res;
      setImprovedDraft(newDraft);
      setRtiDraft(newDraft);
      setSubStep(2);
    } catch (e) {
      console.error('Improvement error:', e);
      alert('Failed to improve RTI draft. Please try again.');
    } finally {
      setLoadingImprove(false);
    }
  };

  // Safe extractors for risks & suggestions
  const detectedRisks = Array.isArray(prediction?.detected_risks)
    ? prediction.detected_risks
    : [];
  const improvementSuggestions = Array.isArray(
    prediction?.improvement_suggestions
  )
    ? prediction.improvement_suggestions
    : [];

  // Fallback view if no draft or case ID is available
  if (!rtiDraft && !loadingPred) {
    return (
      <div className="gradient-bg min-h-screen flex flex-col items-center justify-center p-4">
        <div className="bg-white border border-[#b8c2cc] rounded-3xl p-8 max-w-md text-center space-y-4 shadow-sm">
          <AlertCircle size={36} className="text-amber-500 mx-auto" />
          <h2 className="text-xl font-bold text-ashoka-navy">No Draft Found</h2>
          <p className="text-xs text-slate-500">
            We couldn't locate an active RTI draft for analysis. Please start or select an existing case.
          </p>
          <button
            onClick={() => {
              setStage('RTI_GATHERING');
              router.push('/dashboard/rti');
            }}
            className="btn-primary text-xs py-2.5 px-6 mx-auto cursor-pointer"
          >
            Go to RTI Form
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="gradient-bg min-h-screen flex flex-col items-center justify-center p-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-3xl"
      >
        {subStep === 1 ? (
          /* --- PAGE 1: RTI RISK FACTORS & OUTCOME PREDICTION --- */
          <div>
            <div className="mb-3">
              <span className="text-xs font-bold uppercase tracking-widest text-court-maroon bg-court-maroon/10 px-3 py-1 rounded-full border border-court-maroon/20">
                STEP 3 · RTI Risk Analysis & Predictor
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-ashoka-navy mb-2 tracking-tight">
              RTI Rejection Risk Factors
            </h1>
            <p className="text-slate-500 mb-8">
              Our AI evaluates your RTI draft against Section 8/9 exemptions to predict approval likelihood and highlight potential risks.
            </p>

            <div className="bg-white border border-[#b8c2cc] rounded-3xl p-8 shadow-sm space-y-6 text-left">
              {loadingPred ? (
                <div className="py-12 text-center space-y-3">
                  <Loader2 size={32} className="animate-spin text-court-maroon mx-auto" />
                  <p className="text-sm font-medium text-slate-500">
                    Analyzing RTI exemption risks and predictability...
                  </p>
                </div>
              ) : prediction ? (
                <>
                  <div className="flex items-center justify-between bg-slate-50 p-4 rounded-2xl border border-slate-200">
                    <div>
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                        Predicted Success Outlook
                      </h4>
                      <p className="text-lg font-black text-ashoka-navy mt-0.5">
                        {prediction.prediction || prediction.status || 'HIGH LIKELIHOOD'}
                      </p>
                    </div>
                    <span className="px-3 py-1 bg-statutory-green/10 text-statutory-green font-bold text-xs rounded-full border border-statutory-green/20">
                      Optimized
                    </span>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                      Detected Risks & Pitfalls
                    </h4>
                    {detectedRisks.length > 0 ? (
                      <div className="space-y-2">
                        {detectedRisks.map((risk: any, idx: number) => (
                          <div
                            key={idx}
                            className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 font-medium flex items-start gap-2"
                          >
                            <AlertTriangle size={15} className="text-amber-600 flex-shrink-0 mt-0.5" />
                            <span>{typeof risk === 'string' ? risk : risk.description || risk.risk}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500 italic">
                        No major Section 8/9 exemption risks detected.
                      </p>
                    )}
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                      AI Improvement Suggestions
                    </h4>
                    {improvementSuggestions.length > 0 ? (
                      <ul className="space-y-2 text-xs text-slate-700 list-disc list-inside font-medium bg-[#FAF8F5] p-4 rounded-xl border border-slate-200">
                        {improvementSuggestions.map((sug: string, idx: number) => (
                          <li key={idx} className="leading-relaxed">
                            {sug}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-slate-500 italic bg-[#FAF8F5] p-4 rounded-xl border border-slate-200">
                        Draft is clear and well-structured for filing.
                      </p>
                    )}
                  </div>
                </>
              ) : (
                <p className="text-sm text-slate-500">Draft ready for optimization.</p>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <button
                  onClick={() => {
                    setStage('RTI_GATHERING');
                    router.push('/dashboard/rti');
                  }}
                  className="btn-ghost text-sm cursor-pointer"
                >
                  <ArrowLeft size={16} /> Edit Applicant Form
                </button>
                <button
                  onClick={handleGenerateImproved}
                  disabled={loadingImprove}
                  className="btn-primary text-base py-3 px-8 cursor-pointer flex items-center gap-2"
                >
                  {loadingImprove ? (
                    <>
                      <Loader2 size={18} className="animate-spin" /> Optimizing...
                    </>
                  ) : (
                    <>
                      Generate Final RTI Draft <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* --- PAGE 2: IMPROVED RTI DRAFT & PDF DOWNLOAD --- */
          <div>
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-widest text-court-maroon bg-court-maroon/10 px-3 py-1 rounded-full border border-court-maroon/20">
                STEP 4 · Final RTI Application (Form A)
              </span>
              <span className="text-xs font-mono font-bold text-slate-500">
                Case ID: {caseId}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-ashoka-navy mb-2 tracking-tight">
              Statutory RTI Application Ready
            </h1>
            <p className="text-slate-500 mb-8">
              Your application has been polished to withstand statutory rejections. Download the official PDF or copy the text.
            </p>

            <div className="space-y-6">
              <DraftViewer
                title="RTI Application (Section 6(1))"
                draft={improvedDraft || rtiDraft || ''}
                caseId={caseId}
              />

              {/* AI Disclaimer Notice Box */}
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3 shadow-sm text-left">
                <div className="mt-0.5 text-amber-600 flex-shrink-0">
                  <AlertCircle size={18} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wide mb-1">
                    Important Disclaimer
                  </h4>
                  <p className="text-xs text-amber-800 leading-relaxed font-medium">
                    This is an AI generated document, read well before submission. Please verify all facts, dates, and claims thoroughly before sending it to the concerned authority or court.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => setSubStep(1)}
                  className="btn-ghost text-sm cursor-pointer"
                >
                  <ArrowLeft size={16} /> Back to Risk Analysis
                </button>
                <button
                  onClick={() => {
                    setStage('IDLE');
                    router.push('/');
                  }}
                  className="btn-ghost text-sm border-slate-300 cursor-pointer"
                >
                  Start New Case (Home)
                </button>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
