'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Loader2, ShieldAlert } from 'lucide-react';
import { getCase } from '@/lib/api';
import DraftViewer from '@/components/dashboard/DraftViewer';

function FirstAppealContent() {
  const searchParams = useSearchParams();
  const caseId = searchParams.get('case_id');

  const [loading, setLoading] = useState(true);
  const [caseData, setCaseData] = useState<any>(null);
  const [appealDraft, setAppealDraft] = useState<string>('');

  useEffect(() => {
    if (!caseId) {
      setLoading(false);
      return;
    }

    const fetchCaseDetails = async () => {
      try {
        const data = await getCase(caseId);
        setCaseData(data);
        if (data?.first_appeal_draft) {
          setAppealDraft(data.first_appeal_draft);
        }
      } catch (err) {
        console.error('Failed to load case for appeal:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCaseDetails();
  }, [caseId]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-rose-600" />
        <p className="text-xs text-slate-500 font-mono">Loading First Appeal appellate data...</p>
      </div>
    );
  }

  if (!caseId || !caseData) {
    return (
      <div className="max-w-md mx-auto my-12 p-6 bg-white border border-slate-200 rounded-3xl text-center space-y-3 shadow-sm">
        <ShieldAlert className="w-8 h-8 text-rose-500 mx-auto" />
        <h3 className="text-sm font-bold text-slate-900">Case Not Found</h3>
        <p className="text-xs text-slate-500">
          Please provide a valid <code className="text-slate-700">case_id</code> parameter to generate a First Appeal.
        </p>
      </div>
    );
  }

  return (
    <main className="max-w-4xl mx-auto py-10 px-4 space-y-6">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <span className="text-xs font-mono font-bold text-rose-600 uppercase tracking-widest">
            Section 19(1) Appellate Studio
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 mt-0.5">
            First Appeal Generation
          </h1>
        </div>
        <span className="text-xs font-mono bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-xl text-slate-700">
          Case ID: {caseId}
        </span>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
        <p className="text-xs text-slate-600 leading-relaxed">
          Since the PIO has failed to provide satisfactory information or has invoked an invalid exemption clause, you are statutorily entitled to file a First Appeal before the First Appellate Authority (FAA) within 30 days.
        </p>

        {appealDraft ? (
          <DraftViewer
            title="First Appeal Application (Sec 19(1))"
            draft={appealDraft}
            caseId={caseId}
          />
        ) : (
          <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300 space-y-3">
            <p className="text-xs text-slate-500">No appeal draft generated for this case yet.</p>
            <button
              onClick={() => setAppealDraft(`BEFORE THE FIRST APPELLATE AUTHORITY\nCase ID: ${caseId}\n\n1. Appellant Details...\n2. Grievance Summary...\n3. Prayer for Relief...`)}
              type="button"
              className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition cursor-pointer"
            >
              Generate Draft Template
            </button>
          </div>
        )}
      </div>
    </main>
  );
}

export default function FirstAppealPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-rose-600" />
          <p className="text-xs text-slate-500 font-mono">Loading First Appeal appellate data...</p>
        </div>
      }
    >
      <FirstAppealContent />
    </Suspense>
  );
}
