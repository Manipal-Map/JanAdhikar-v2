'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, TrendingUp, AlertCircle, RefreshCw, ArrowRight, Loader2, Activity, ArrowLeft } from 'lucide-react';
import DraftViewer from '@/components/dashboard/DraftViewer';
import { rtiPredict, rtiImprove } from '@/lib/api';
import { useRouter, useSearchParams } from 'next/navigation';
import useCaseStore from '@/store/caseStore';

interface RTIResultViewProps {
  caseId?: string;
  initialDraft?: string;
  initialDepartment?: string;
}

export default function RTIResultView({ initialDepartment }: RTIResultViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const {
    caseId: storeCaseId,
    rtiDraft,
    setRtiDraft,
    setStage,
  } = useCaseStore();

  const caseId = storeCaseId || searchParams.get('case_id') || '';

  const [subStep, setSubStep] = useState<1 | 2>(1); 
  const [prediction, setPrediction] = useState<any>(null);
  const [loadingPred, setLoadingPred] = useState(false);
  const [loadingImprove, setLoadingImprove] = useState(false);
  const [improvedDraft, setImprovedDraft] = useState<string | null>(null);

  useEffect(() => {
    const fetchPred = async () => {
      if (!rtiDraft || !caseId) return;
      setLoadingPred(true);
      try {
        const res = await rtiPredict(caseId, rtiDraft);
        setPrediction(res);
      } catch (err) {
        console.error('Prediction failed:', err);
      } finally {
        setLoadingPred(false);
      }
    };

    fetchPred();
  }, [caseId, rtiDraft]);

  const handleImprove = async () => {
    if (!caseId) return;
    setLoadingImprove(true);
    try {
      const res = await rtiImprove(caseId);
      if (res?.improved_draft || res?.draft_text) {
        setImprovedDraft(res.improved_draft || res.draft_text);
        setRtiDraft(res.improved_draft || res.draft_text);
      }
      setSubStep(2);
    } catch (err) {
      console.error('Improvement failed:', err);
    } finally {
      setLoadingImprove(false);
    }
  };

  const detectedRisks = Array.isArray(prediction?.detected_risks) ? prediction.detected_risks : [];
  const improvementSuggestions = Array.isArray(prediction?.improvement_suggestions) ? prediction.improvement_suggestions : [];

  if (!rtiDraft && !loadingPred) {
    return (
      <div 
        className="min-h-screen flex flex-col items-center justify-center p-4 bg-cover bg-center bg-no-repeat relative text-slate-200"
        style={{ backgroundImage: "url('/bg.image.png')" }}
      >
        <div className="bg-[#0F172A]/85 backdrop-blur-md border border-white/10 rounded-3xl p-8 max-w-md text-center space-y-4 shadow-2xl relative z-10">
          <AlertCircle size={36} className="text-amber-500 mx-auto" />
          <h2 className="text-xl font-extrabold text-white tracking-tight">No Draft Found</h2>
          <p className="text-xs text-slate-400 font-medium">
            We couldn't locate an active RTI draft for analysis. Please start or select an existing case.
          </p>
          <button
            onClick={() => {
              setStage('RTI_GATHERING');
              router.push('/dashboard/rti');
            }}
            className="btn-primary text-xs py-2.5 px-6 mx-auto cursor-pointer bg-[#A32A02] hover:bg-[#138808] transition-colors text-white font-bold"
          >
            Go to RTI Form
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-center p-4 py-12 bg-cover bg-center bg-no-repeat relative text-slate-200 font-sans"
      style={{ backgroundImage: "url('/bg.image.png')" }}
    >
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-4xl relative z-10"
      >
        {subStep === 1 ? (
          <div>
            <div className="mb-3">
              <span className="text-xs font-bold uppercase font-sans tracking-tight text-[#FF9933] bg-[#A32A02]/20 px-3 py-1 rounded-full border border-[#A32A02]/30">
                STEP 3 · RTI Risk Analysis & Predictor
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-2 tracking-tight drop-shadow-md">
              RTI Rejection Risk Factors
            </h1>
            <p className="text-blue-100 mb-8 font-medium drop-shadow-sm">
              Our AI evaluates your RTI draft against Section 8/9 exemptions to predict approval likelihood and highlight potential risks.
            </p>

            <div className="bg-[#0F172A]/85 backdrop-blur-md border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-left">
              {loadingPred ? (
                <div className="py-12 text-center space-y-3">
                  <Loader2 size={32} className="animate-spin text-[#FF9933] mx-auto" />
                  <p className="text-sm font-medium text-slate-400">
                    Analyzing RTI exemption risks and predictability...
                  </p>
                </div>
              ) : prediction ? (
                <>
                  <div className="flex items-center justify-between bg-[#1E293B]/60 p-4 rounded-2xl border border-slate-700">
                    <div>
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                        Predicted Success Outlook
                      </h4>
                      <p className="text-lg font-black text-white mt-0.5 tracking-tight">
                        {prediction.prediction || prediction.status || 'HIGH LIKELIHOOD'}
                      </p>
                    </div>
                    <span className="px-3 py-1 bg-emerald-900/40 text-emerald-400 font-bold text-xs rounded-full border border-emerald-700/50">
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
                            className="p-3 bg-amber-950/30 border border-amber-900/50 rounded-xl text-xs text-amber-200 font-medium flex items-start gap-2"
                          >
                            <AlertTriangle size={15} className="text-amber-500 flex-shrink-0 mt-0.5" />
                            <span>{typeof risk === 'string' ? risk : risk.description || risk.risk}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 italic">
                        No major Section 8/9 exemption risks detected.
                      </p>
                    )}
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                      AI Improvement Suggestions
                    </h4>
                    {improvementSuggestions.length > 0 ? (
                      <ul className="space-y-2 text-xs text-slate-300 list-disc list-inside font-medium bg-[#1E293B]/60 p-4 rounded-xl border border-slate-700">
                        {improvementSuggestions.map((sug: string, idx: number) => (
                          <li key={idx} className="leading-relaxed">
                            {sug}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-slate-400 italic bg-[#1E293B]/60 p-4 rounded-xl border border-slate-700">
                        Draft is clear and well-structured for filing.
                      </p>
                    )}
                  </div>
                </>
              ) : (
                <p className="text-sm text-slate-500">Draft ready for optimization.</p>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-slate-700/60">
                <button
                  onClick={() => {
                    setStage('RTI_GATHERING');
                    router.push('/dashboard/rti');
                  }}
                  className="btn-ghost text-sm cursor-pointer bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700"
                >
                  <ArrowLeft size={16} /> Edit Applicant Form
                </button>
                <button
                  onClick={handleImprove}
                  disabled={loadingImprove}
                  className="btn-primary text-base py-3.5 px-8 cursor-pointer flex items-center gap-2 bg-[#A32A02] hover:bg-[#138808] transition-colors text-white font-bold tracking-tight shadow-md rounded-xl"
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
          <div>
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-bold uppercase font-sans tracking-tight text-[#FF9933] bg-[#A32A02]/20 px-3 py-1 rounded-full border border-[#A32A02]/30">
                STEP 4 · Final RTI Application (Form A)
              </span>
              <span className="text-xs font-mono font-bold text-slate-300 bg-[#0F172A]/80 backdrop-blur-md px-3 py-1 rounded-xl border border-slate-700/60 shadow-xs">
                Case ID: #{caseId}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-2 tracking-tight drop-shadow-md">
              Statutory RTI Application Ready
            </h1>
            <p className="text-blue-100 mb-8 font-medium drop-shadow-sm">
              Your application has been polished to withstand statutory rejections. Download the official PDF or copy the text.
            </p>

            <div className="space-y-6">
              <DraftViewer
                title="RTI Application (Section 6(1))"
                draft={improvedDraft || rtiDraft || ''}
                caseId={caseId}
              />

              <div className="bg-amber-950/30 border border-amber-900/50 rounded-2xl p-4 flex items-start gap-3 shadow-sm text-left">
                <div className="mt-0.5 text-amber-500 flex-shrink-0">
                  <AlertCircle size={18} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wide mb-1">
                    Important Disclaimer
                  </h4>
                  <p className="text-xs text-amber-200 leading-relaxed font-medium">
                    This is an AI generated document, read well before submission. Please verify all facts, dates, and claims thoroughly before sending it to the concerned authority or court.
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between pt-6 border-t border-slate-700/60 mt-6 gap-3">
                <button
                  onClick={() => setSubStep(1)}
                  className="btn-ghost text-sm cursor-pointer w-full sm:w-auto justify-center bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700"
                >
                  <ArrowLeft size={16} /> Back to Risk Analysis
                </button>
                <button
                  onClick={() => router.push(`/track?case_id=${caseId}`)}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white font-bold text-sm transition-all shadow-md cursor-pointer w-full sm:w-auto"
                >
                  <Activity size={16} className="text-emerald-400" />
                  <span>Track SLA & Appeals</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
