'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Loader2, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  ShieldCheck, 
  Sparkles, 
  Edit3, 
  User, 
  Building2, 
  FileCheck2,
  Clock,
  Banknote
} from 'lucide-react';
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
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [localForm, setLocalForm] = useState<Record<string, any>>({});

  useEffect(() => {
    const analyzeAndPreFill = async () => {
      if (!userProblem) {
        router.push('/');
        return;
      }
      try {
        setLoading(true);
        const res = await classifyCase(caseId || '', userProblem, language || 'English');
        setClassifyResult(res);

        if (res.route === 'Other') {
          setStage('OUT_OF_SCOPE');
          router.push('/dashboard/out-of-scope');
          return;
        }

        const aiExtracted = res.extracted_data || {};
        setLocalForm({
          applicant_name: formData.applicant_name || aiExtracted.applicant_name || '',
          applicant_contact: formData.applicant_contact || aiExtracted.applicant_contact || '',
          applicant_city: formData.applicant_city || aiExtracted.applicant_city || '',
          applicant_state: formData.applicant_state || aiExtracted.applicant_state || '',
          applicant_address: formData.applicant_address || aiExtracted.applicant_address || '',
          applicant_pincode: formData.applicant_pincode || aiExtracted.applicant_pincode || '',
          
          target_department: formData.target_department || aiExtracted.target_department || '',
          specific_records: formData.specific_records || aiExtracted.specific_records || '',
          time_period: formData.time_period || aiExtracted.time_period || '',
          file_or_work_no: formData.file_or_work_no || aiExtracted.file_or_work_no || '',
          incident_date: formData.incident_date || aiExtracted.incident_date || '',
          financial_loss: formData.financial_loss || aiExtracted.financial_loss || '',
          desired_relief: formData.desired_relief || aiExtracted.desired_relief || '',
          statutory_fee: formData.statutory_fee || aiExtracted.statutory_fee || '',
          response_time: formData.response_time || aiExtracted.response_time || '',
        });
      } catch (err) {
        console.error(err);
        alert('Failed to analyze case. Please try again.');
        router.push('/');
      } finally {
        setLoading(false);
      }
    };

    if (!classifyResult) {
      analyzeAndPreFill();
    } else {
      setLocalForm(formData);
      setLoading(false);
    }
  }, [userProblem, caseId, language, classifyResult, formData, router, setClassifyResult, setStage]);

  const handleChange = (key: string, value: string) => {
    setLocalForm(prev => ({ ...prev, [key]: value }));
  };

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    setFormData(localForm);
    if (currentStep === 1) setCurrentStep(2);
    else if (currentStep === 2) setCurrentStep(3);
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
          form_data: localForm,
        };
        const res = await grievanceGenerate(payload);
        setGrievanceResult(res);
        setStage('GRIEVANCE_COMPLETED');
        router.push('/dashboard/grievance/result');
      }
    } catch (err) {
      console.error(err);
      alert('Generation failed. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAF8F5]">
        <Loader2 size={40} className="animate-spin text-court-maroon mb-4" />
        <h2 className="text-xl font-bold text-ashoka-navy">Analyzing Legal Merits...</h2>
        <p className="text-slate-500 mt-2 text-sm">Drafting statutory clauses, identifying jurisdiction, and computing fees.</p>
      </div>
    );
  }

  const isRTI = classifyResult?.route === 'RTI';

  return (
    <div className="gradient-bg min-h-screen p-4 sm:p-6 lg:p-8 flex items-center justify-center font-sans">
      <div className="w-full max-w-3xl space-y-6">
        
        <div className="bg-white border border-slate-300 rounded-2xl p-4 shadow-sm flex items-center justify-between">
          {[
            { num: 1, label: 'Applicant Details', icon: User },
            { num: 2, label: 'AI Strategy Review', icon: Sparkles },
            { num: 3, label: 'Final Confirmation', icon: FileCheck2 },
          ].map((s) => {
            const active = currentStep === s.num;
            const done = currentStep > s.num;
            return (
              <div 
                key={s.num} 
                className={`flex items-center gap-2 text-xs sm:text-sm font-bold transition-all ${
                  active ? 'text-court-maroon' : done ? 'text-statutory-green' : 'text-slate-400'
                }`}
              >
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                  active 
                    ? 'bg-court-maroon text-white shadow-sm' 
                    : done 
                    ? 'bg-emerald-100 text-emerald-800' 
                    : 'bg-slate-100 text-slate-400'
                }`}>
                  {done ? '✓' : s.num}
                </div>
                <span className="hidden sm:inline">{s.label}</span>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between px-2">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-court-maroon bg-rose-50 border border-rose-200 px-3 py-1 rounded-full">
              Legal Route: {isRTI ? 'Right to Information (RTI)' : 'Administrative Grievance'}
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-ashoka-navy mt-2">
              {currentStep === 1 && 'Step 1: Your Contact Information'}
              {currentStep === 2 && 'Step 2: Review AI Legal Strategy'}
              {currentStep === 3 && 'Step 3: Generate Statutory Document'}
            </h2>
          </div>
          {caseId && (
            <span className="text-xs font-mono font-bold text-slate-600 bg-white border border-slate-300 px-3 py-1.5 rounded-xl shadow-xs">
              #{caseId}
            </span>
          )}
        </div>

        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-300 shadow-sm text-left">
          
          {currentStep === 1 && (
            <form onSubmit={handleNextStep} className="space-y-5">
              <p className="text-xs text-slate-500 leading-relaxed mb-4 font-medium">
                Official applications require the physical correspondence identity of the citizen. The AI will handle the technical legal details in the next step.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-ashoka-navy uppercase tracking-wide">Your Full Name *</label>
                  <input
                    type="text"
                    required
                    value={localForm.applicant_name}
                    onChange={e => handleChange('applicant_name', e.target.value)}
                    placeholder="e.g. Rohan Sharma"
                    className="input-field"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-ashoka-navy uppercase tracking-wide">Phone / Contact Email *</label>
                  <input
                    type="text"
                    required
                    value={localForm.applicant_contact}
                    onChange={e => handleChange('applicant_contact', e.target.value)}
                    placeholder="e.g. 9876543210 / rohan@email.com"
                    className="input-field"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-ashoka-navy uppercase tracking-wide">City / District *</label>
                  <input
                    type="text"
                    required
                    value={localForm.applicant_city}
                    onChange={e => handleChange('applicant_city', e.target.value)}
                    placeholder="e.g. Jaipur"
                    className="input-field"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-ashoka-navy uppercase tracking-wide">State / Union Territory *</label>
                  <input
                    type="text"
                    required
                    value={localForm.applicant_state}
                    onChange={e => handleChange('applicant_state', e.target.value)}
                    placeholder="e.g. Rajasthan"
                    className="input-field"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-bold text-ashoka-navy uppercase tracking-wide">Postal Address for Response *</label>
                  <input
                    type="text"
                    required
                    value={localForm.applicant_address}
                    onChange={e => handleChange('applicant_address', e.target.value)}
                    placeholder="e.g. House No. 42, Sector 3, Main Road"
                    className="input-field"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-ashoka-navy uppercase tracking-wide">PIN Code *</label>
                  <input
                    type="text"
                    required
                    value={localForm.applicant_pincode}
                    onChange={e => handleChange('applicant_pincode', e.target.value)}
                    placeholder="e.g. 302001"
                    className="input-field"
                  />
                </div>
              </div>

              <div className="pt-6 border-t border-slate-200 flex justify-end">
                <button type="submit" className="btn-primary py-3.5 px-8 flex items-center gap-2 bg-court-maroon hover:bg-[#701A75] text-white rounded-xl shadow-md cursor-pointer font-bold">
                  Next: Review AI Legal Strategy <ArrowRight size={18} />
                </button>
              </div>
            </form>
          )}

          {currentStep === 2 && (
            <form onSubmit={handleNextStep} className="space-y-6">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl flex items-start gap-3 shadow-xs">
                <Sparkles size={18} className="text-blue-700 mt-0.5 shrink-0" />
                <p className="text-xs text-blue-950 font-medium leading-relaxed">
                  <strong>AI Strategy Engine:</strong> We have automatically structured the technical legal clauses and target authority based on your problem. <br/><br/>
                  <span className="font-bold">Note: All fields below are optional.</span> If you are unsure about any specifics, leave them as they are or blank—the Legal Engine will use standard statutory defaults.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#FAF8F5] p-3 rounded-xl border border-slate-200 flex items-center gap-3">
                  <Banknote size={16} className="text-slate-400" />
                  <div>
                    <span className="block text-[10px] font-bold text-slate-400 uppercase">Statutory Fee</span>
                    <span className="text-sm font-bold text-ashoka-navy">{localForm.statutory_fee || (isRTI ? '₹10' : 'N/A')}</span>
                  </div>
                </div>
                <div className="bg-[#FAF8F5] p-3 rounded-xl border border-slate-200 flex items-center gap-3">
                  <Clock size={16} className="text-slate-400" />
                  <div>
                    <span className="block text-[10px] font-bold text-slate-400 uppercase">Mandated Response Time</span>
                    <span className="text-sm font-bold text-ashoka-navy">{localForm.response_time || (isRTI ? '30 Days' : '15 Days')}</span>
                  </div>
                </div>
              </div>

              {isRTI ? (
                <div className="space-y-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-ashoka-navy uppercase tracking-wide">Target Public Authority / Department</label>
                    <input
                      type="text"
                      value={localForm.target_department}
                      onChange={e => handleChange('target_department', e.target.value)}
                      placeholder="e.g., Public Works Department / Unsure"
                      className="input-field font-semibold text-court-maroon bg-white"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-ashoka-navy uppercase tracking-wide">Certified Legal Queries Generated by AI</label>
                    <textarea
                      rows={4}
                      value={localForm.specific_records}
                      onChange={e => handleChange('specific_records', e.target.value)}
                      placeholder="Leave blank to let AI formulate the exact records requested."
                      className="input-field resize-none leading-relaxed text-sm bg-white"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-ashoka-navy uppercase tracking-wide">Time Period</label>
                      <input
                        type="text"
                        value={localForm.time_period}
                        onChange={e => handleChange('time_period', e.target.value)}
                        placeholder="Leave blank if unsure"
                        className="input-field bg-white"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-ashoka-navy uppercase tracking-wide">Application / File Ref (If Known)</label>
                      <input
                        type="text"
                        value={localForm.file_or_work_no}
                        onChange={e => handleChange('file_or_work_no', e.target.value)}
                        placeholder="Leave blank if none"
                        className="input-field bg-white"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-ashoka-navy uppercase tracking-wide">Opposing Party / Authority</label>
                    <input
                      type="text"
                      value={localForm.target_department}
                      onChange={e => handleChange('target_department', e.target.value)}
                      placeholder="e.g., Landlord Name / Company / Unsure"
                      className="input-field font-semibold text-court-maroon bg-white"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-ashoka-navy uppercase tracking-wide">Statutory Relief Demanded</label>
                    <textarea
                      rows={3}
                      value={localForm.desired_relief}
                      onChange={e => handleChange('desired_relief', e.target.value)}
                      placeholder="Leave blank to let AI formulate standard relief based on law."
                      className="input-field resize-none leading-relaxed text-sm bg-white"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-ashoka-navy uppercase tracking-wide">Date of Incident</label>
                      <input
                        type="text"
                        value={localForm.incident_date}
                        onChange={e => handleChange('incident_date', e.target.value)}
                        placeholder="Leave blank if ongoing"
                        className="input-field bg-white"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-ashoka-navy uppercase tracking-wide">Financial Claim (₹)</label>
                      <input
                        type="text"
                        value={localForm.financial_loss}
                        onChange={e => handleChange('financial_loss', e.target.value)}
                        placeholder="Leave blank if not applicable"
                        className="input-field bg-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-6 border-t border-slate-200 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="btn-ghost py-3 px-5 border border-slate-300 cursor-pointer"
                >
                  <ArrowLeft size={16} /> Back
                </button>
                <button
                  type="submit"
                  className="btn-primary py-3.5 px-8 flex items-center gap-2 bg-court-maroon hover:bg-[#701A75] text-white rounded-xl shadow-md cursor-pointer font-bold"
                >
                  Proceed to Final Review <ArrowRight size={18} />
                </button>
              </div>
            </form>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-3">
                <ShieldCheck size={20} className="text-emerald-700 mt-0.5 shrink-0" />
                <p className="text-xs text-emerald-950 leading-relaxed font-medium">
                  <strong>Ready for Document Generation:</strong> We have mapped the required provisions. Confirming this will generate the legally binding court-ready format.
                </p>
              </div>

              <div className="space-y-4">
                <div className="bg-[#FAF8F5] p-5 rounded-2xl border border-slate-200 shadow-inner">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200/80 mb-3">
                    <h4 className="text-xs font-bold text-court-maroon uppercase tracking-wider flex items-center gap-1.5">
                      <User size={14} /> Identity Record
                    </h4>
                    <button onClick={() => setCurrentStep(1)} className="text-xs font-bold text-slate-500 hover:text-ashoka-navy flex items-center gap-1">
                      <Edit3 size={12} /> Edit
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-slate-400 font-bold block">NAME:</span>
                      <span className="font-semibold text-slate-800">{localForm.applicant_name}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-bold block">CONTACT:</span>
                      <span className="font-semibold text-slate-800">{localForm.applicant_contact}</span>
                    </div>
                    <div className="sm:col-span-2">
                      <span className="text-slate-400 font-bold block">POSTAL ADDRESS:</span>
                      <span className="font-semibold text-slate-800">{localForm.applicant_address}, {localForm.applicant_city}, {localForm.applicant_state} - {localForm.applicant_pincode}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-[#FAF8F5] p-5 rounded-2xl border border-slate-200 shadow-inner">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200/80 mb-3">
                    <h4 className="text-xs font-bold text-court-maroon uppercase tracking-wider flex items-center gap-1.5">
                      <Building2 size={14} /> Legal Specifications
                    </h4>
                    <button onClick={() => setCurrentStep(2)} className="text-xs font-bold text-slate-500 hover:text-ashoka-navy flex items-center gap-1">
                      <Edit3 size={12} /> Edit
                    </button>
                  </div>
                  <div className="space-y-3 text-xs">
                    <div>
                      <span className="text-slate-400 font-bold block">{isRTI ? 'PUBLIC AUTHORITY:' : 'OPPOSING PARTY:'}</span>
                      <span className="font-semibold text-slate-900 text-sm">{localForm.target_department || 'Standard Default / As determined by Law'}</span>
                    </div>
                    {isRTI ? (
                      <>
                        <div>
                          <span className="text-slate-400 font-bold block">RECORDS SOUGHT:</span>
                          <p className="font-medium text-slate-800 whitespace-pre-wrap leading-relaxed mt-1">{localForm.specific_records || 'Standard certified records mapping to query'}</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <span className="text-slate-400 font-bold block">REMEDY DEMANDED:</span>
                          <p className="font-medium text-slate-800 leading-relaxed mt-1">{localForm.desired_relief || 'Standard statutory relief with interest'}</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  disabled={generating}
                  className="btn-ghost py-3 px-5 border border-slate-300 cursor-pointer w-full sm:w-auto justify-center"
                >
                  <ArrowLeft size={16} /> Back
                </button>
                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={generating}
                  className="btn-primary py-4 px-10 flex items-center justify-center gap-2 bg-court-maroon hover:bg-[#701A75] text-white rounded-xl shadow-md cursor-pointer font-bold w-full sm:w-auto"
                >
                  {generating ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      <span>Drafting Statutory Petition...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={18} />
                      <span>Confirm & Generate Legal Draft</span>
                    </>
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
