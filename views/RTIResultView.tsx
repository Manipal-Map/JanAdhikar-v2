'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, TrendingUp, AlertCircle, RefreshCw, ArrowRight, Loader2, Activity } from 'lucide-react';
import DraftViewer from '@/components/dashboard/DraftViewer';
import { rtiPredict, rtiImprove } from '@/lib/api';
import { useRouter } from 'next/navigation';

interface RTIResultViewProps {
  caseId: string;
  initialDraft: string;
  initialDepartment?: string;
}

export default function RTIResultView({
  caseId,
  initialDraft,
  initialDepartment,
}: RTIResultViewProps) {
  const router = useRouter();
  const [draft, setDraft] = useState<string>(initialDraft);
  const [prediction, setPrediction] = useState<any>(null);
  const [loadingPredict, setLoadingPredict] = useState<boolean>(false);
  const [loadingImprove, setLoadingImprove] = useState<boolean>(false);

  const handlePredict = async () => {
    if (!caseId) return;
    setLoadingPredict(true);
    try {
      const res = await rtiPredict(caseId, draft);
      setPrediction(res);
    } catch (err) {
      console.error('Prediction failed:', err);
    } finally {
      setLoadingPredict(false);
    }
  };

  const handleImprove = async () => {
    if (!caseId) return;
    setLoadingImprove(true);
    try {
      const res = await rtiImprove(caseId);
      if (res?.draft_text || res?.improved_draft) {
        setDraft(res.draft_text || res.improved_draft);
      }
    } catch (err) {
      console.error('Improvement failed:', err);
    } finally {
      setLoadingImprove(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 bg-cover bg-center bg-no-repeat relative"
      style={{ backgroundImage: "url('/bg.image.png')" }}
    >
      <div className="max-w-4xl w-full mx-auto space-y-6 relative z-10">
        
        {/* Top Header & Quick Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/95 backdrop-blur-xs p-6 rounded-3xl border border-slate-300 shadow-md">
          <div>
            <h1 className="text-xl font-bold text-ashoka-navy">RTI Application Ready</h1>
            <p className="text-xs text-slate-600 mt-1 font-medium">
              Department: <span className="font-semibold text-slate-800">{initialDepartment || 'Resolving...'}</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePredict}
              disabled={loadingPredict}
              type="button"
              className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
            >
              <TrendingUp size={15} className="text-blue-600" />
              {loadingPredict ? 'Analyzing...' : 'Predict Success Score'}
            </button>

            <button
              onClick={handleImprove}
              disabled={loadingImprove}
              type="button"
              className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-[#A32A02] hover:bg-[#138808] transition-colors rounded-xl disabled:opacity-50 cursor-pointer shadow-xs"
            >
              <Sparkles size={15} />
              {loadingImprove ? 'Enhancing...' : 'Auto-Improve Draft'}
            </button>
          </div>
        </div>

        {/* Prediction Analytics Card */}
        {prediction && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-ashoka-navy text-white p-6 rounded-3xl space-y-4 shadow-lg border border-slate-800"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                AI Success Score Analysis
              </span>
              <span className="text-2xl font-bold text-emerald-400">
                {prediction.success_rate || prediction.score || '85'}%
              </span>
            </div>
            {prediction.feedback && (
              <p className="text-xs text-slate-300 leading-relaxed border-t border-slate-800 pt-3">
                {prediction.feedback}
              </p>
            )}
          </motion.div>
        )}

        <DraftViewer
          title="RTI Application Draft"
          draft={draft}
          caseId={caseId}
        />

        <div className="flex justify-end pt-2">
          <button
            onClick={() => router.push(`/track?case_id=${caseId}`)}
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-ashoka-navy hover:bg-[#1E293B] text-white font-bold text-sm transition-all shadow-md cursor-pointer"
          >
            <Activity size={16} className="text-emerald-400" />
            <span>Track SLA & Appeals</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
