'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, ArrowRight, CheckCircle2, ShieldCheck, Wand2, Edit3, FileText } from 'lucide-react';
import useCaseStore from '@/store/caseStore';
import { classifyCase, rtiGenerate, grievanceGenerate } from '@/lib/api';

export default function IntakeFormView() {
  const router = useRouter();
  const { 
    caseId, 
    userProblem, 
    language, 
    setClassifyResult, 
    classifyResult, 
    formData, 
    setFormData, 
    setStage, 
    setRtiDraft, 
    setGrievanceResult 
  } = useCaseStore();

  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [step, setStep] = useState<'FORM' | 'REVIEW'>('FORM');
  const [localForm, setLocalForm] = useState<Record<string, any>>({});

  useEffect(() => {
    const analyzeCase = async () => {
      if (!userProblem) {
        router.push('/');
        return;
      }
      try {
        setLoading(true);
        const res = await classifyCase(caseId || '', userProblem, language || 'English');
        setClassifyResult(res);

        // Immediate off-ramp for irrelevant queries
        if (res.route === 'Other') {
            setStage('OUT_OF_SCOPE');
            router.push('/dashboard/out-of-scope');
            return;
        }

        const aiExtracted = res.extracted_data || {};
        setLocalForm(prev => ({ ...prev, ...formData, ...aiExtracted }));
      } catch (err) {
        console.error(err);
        alert("Failed to analyze case. Please check your connection and try again.");
        router.push('/');
      } finally {
        setLoading(false);
      }
    };

    if (!classifyResult) {
      analyzeCase();
    } else {
      setLocalForm(formData);
      setLoading(false);
    }
  }, [userProblem, caseId, language, classifyResult, formData, router, setClassifyResult, setStage]);

  const handleFieldChange = (key: string, value: string) => {
    setLocalForm(prev => ({ ...prev, [key]: value }));
  };

  const handleReview = (e: React.FormEvent) => {
    e.preventDefault();
    setFormData(localForm);
    setStep('REVIEW');
  };

  const handleGenerate = async () => {
    if (!classifyResult) return;
    setGenerating(true);
    try {
      if (classifyResult.route === 'RTI') {
        const res = await rtiGenerate(caseId || '', localForm);
        setRtiDraft(res.initial_draft);
        setStage('PREDICTING');
        router.push('/dashboard/rti/result');
      } else if (classifyResult.route === 'Rights/Grievance') {
        const payload = {
          case_id: caseId,
          problem_text: userProblem,
          language: language || 'English',
          form_data: localForm
        };
        const res = await grievanceGenerate(payload);
        setGrievanceResult(res);
        setStage('GRIEVANCE_COMPLETED');
        router.push('/dashboard/grievance/result');
      }
    } catch (err) {
      console.error(err);
      alert("Generation failed. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAF8F5]">
        <Loader2 size={40} className="animate-spin text-court-maroon mb-4" />
        <h2 className="text-xl font-bold text-ashoka-navy">AI is structuring your case...</h2>
        <p className="text-slate-500 mt-2">Extracting details and pre-filling the legal forms.</p>
      </div>
    );
  }

  const schema = classifyResult?.form_schema || [];

  return (
    <div className="gradient-bg min-h-screen p-4 sm:p-6 lg:p-8 flex items-center justify-center">
      <div className="w-full max-w-3xl space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-court-maroon text-white rounded-2xl flex items-center justify-center shadow-sm">
            <FileText size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-ashoka-navy">
              {step === 'FORM' ? 'Complete Your Case Details' : 'Final Review'}
            </h1>
            <p className="text-sm text-slate-500">
              {step === 'FORM' 
                ? 'AI has automatically filled the details it could extract. Please provide the missing information.' 
                : 'Please verify these details carefully before we lock them in and generate your official legal documents.'}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-300 shadow-sm">
          {step === 'FORM' ? (
            <form onSubmit={handleReview} className="space-y-6">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3 mb-6 shadow-sm">
                <Wand2 className="text-emerald-600 shrink-0 mt-0.5" size={18} />
                <div>
                  <p className="text-sm text-emerald-900 font-medium">
                    <strong>AI Auto-Fill Applied:</strong> Relevant variables were extracted directly from your initial problem description.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {schema.map((field: any) => {
                  const isLongField = field.key.includes('address') || field.key.includes('records') || field.key.includes('relief');
                  const val = localForm[field.key] || '';
                  
                  return (
                    <div key={field.key} className={`space-y-2 text-left ${isLongField ? 'sm:col-span-2' : ''}`}>
                      <label className="text-xs font-bold text-ashoka-navy uppercase tracking-wide flex items-center gap-2">
                        {field.label}
                        {val && <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-mono border border-blue-200">Filled</span>}
                      </label>
                      {isLongField ? (
                        <textarea
                          required={field.required}
                          value={val}
                          onChange={(e) => handleFieldChange(field.key, e.target.value)}
                          placeholder={field.placeholder}
                          rows={3}
                          className="w-full bg-[#FAF8F5] border border-slate-300 rounded-xl p-3.5 text-sm text-ashoka-navy font-medium placeholder:text-slate-400 focus:outline-none focus:border-court-maroon focus:ring-1 focus:ring-court-maroon transition-all resize-none shadow-inner"
                        />
                      ) : (
                        <input
                          type="text"
                          required={field.required}
                          value={val}
                          onChange={(e) => handleFieldChange(field.key, e.target.value)}
                          placeholder={field.placeholder}
                          className="w-full bg-[#FAF8F5] border border-slate-300 rounded-xl p-3.5 text-sm text-ashoka-navy font-medium placeholder:text-slate-400 focus:outline-none focus:border-court-maroon focus:ring-1 focus:ring-court-maroon transition-all shadow-inner"
                        />
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="pt-6 border-t border-slate-200 mt-6 flex justify-end">
                <button type="submit" className="btn-primary py-3.5 px-8 flex items-center gap-2 bg-court-maroon hover:bg-[#701A75] text-white rounded-xl shadow-md cursor-pointer transition-colors">
                  Review Form Details <ArrowRight size={18} />
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                {schema.map((field: any) => {
                   const isLongField = field.key.includes('address') || field.key.includes('records') || field.key.includes('relief');
                   const val = localForm[field.key] || '';
                   return (
                     <div key={field.key} className={`bg-slate-50 p-4 rounded-xl border border-slate-200 ${isLongField ? 'sm:col-span-2' : ''}`}>
                       <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                         {field.label}
                       </span>
                       <p className="text-sm font-semibold text-ashoka-navy whitespace-pre-wrap">
                         {val || <span className="text-slate-400 italic">Not provided</span>}
                       </p>
                     </div>
                   );
                })}
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-3 shadow-sm">
                <ShieldCheck className="text-blue-600 shrink-0 mt-0.5" size={20} />
                <div>
                  <p className="text-sm text-blue-900 font-medium">
                    <strong>Ready for Classification & Generation.</strong> We will securely map these details against the appropriate statutes and instantly draft your formal outcome.
                  </p>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                <button onClick={() => setStep('FORM')} disabled={generating} className="btn-ghost py-3.5 px-5 flex w-full sm:w-auto justify-center items-center gap-2 border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-xl cursor-pointer">
                  <Edit3 size={16} /> Edit Form
                </button>
                <button onClick={handleGenerate} disabled={generating} className="btn-primary py-3.5 px-8 flex w-full sm:w-auto justify-center items-center gap-2 bg-court-maroon hover:bg-[#701A75] text-white rounded-xl shadow-md cursor-pointer transition-all disabled:opacity-75">
                  {generating ? (
                    <><Loader2 size={18} className="animate-spin" /> Classifying & Processing...</>
                  ) : (
                    <><CheckCircle2 size={18} /> Confirm & Generate Forms</>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
