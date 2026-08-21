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
  Banknote,
  Scale,
  Info,
  AlertCircle
} from 'lucide-react';
import useCaseStore from '@/store/caseStore';
import { classifyCase, rtiGenerate, grievanceGenerate } from '@/lib/api';

// --- UTILITY FUNCTION TO FIX MESSY AI TEXT ---
const formatAIText = (text?: string) => {
  if (!text) return null;
  return text.split('\n').map((line, i) => {
    if (!line.trim()) return <div key={i} className="h-3" />;
    
    const parts = line.split(/(\*\*.*?\*\*)/g);
    return (
      <div key={i} className="mb-2 last:mb-0">
        {parts.map((part, j) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return (
              <strong key={j} className="font-extrabold text-slate-900">
                {part.slice(2, -2)}
              </strong>
            );
          }
          return <span key={j}>{part}</span>;
        })}
      </div>
    );
  });
};

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
    setGrievanceResult,
    reset // Pulling in reset to clear state on new case
  } = useCaseStore();

  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  
  const [currentStep, setCurrentStep] = useState<0 | 1 | 2 | 3>(0);
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

  const handleNextStep = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setFormData(localForm);
    if (currentStep === 0) setCurrentStep(1);
    else if (currentStep === 1) setCurrentStep(2);
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
  const isOther = classifyResult?.route === 'Other';

  return (
    <div className="gradient-bg min-h-screen p-4 sm:p-6 lg:p-8 flex items-center justify-center font-sans">
      <div className="w-full max-w-3xl space-y-6">
        
        {!isOther && (
          <div className="bg-white border border-slate-300 rounded-2xl p-4 shadow-sm flex items-center justify-between overflow-x-auto gap-2">
            {[
              { num: 0, label: 'Assessment', icon: Scale },
              { num: 1, label: 'Applicant', icon: User },
              { num: 2, label: 'AI Strategy', icon: Sparkles },
              { num: 3, label: 'Confirm', icon: FileCheck2 },
            ].map((s) => {
              const active = currentStep === s.num;
              const done = currentStep > s.num;
              return (
                <div 
                  key={s.num} 
                  className={`flex items-center gap-2 text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                    active ? 'text-court-maroon' : done ? 'text-statutory-green' : 'text-slate-400'
                  }`}
                >
                  <div className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-bold shrink-0 ${
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
        )}

        <div className="flex items-center justify-between px-2">
          <div>
            <span className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${isOther ? 'bg-slate-100 text-slate-600 border-slate-200' : 'text-court-maroon bg-rose-50 border-rose-200'}`}>
              Route: {isOther ? 'Out of Platform Scope' : (isRTI ? 'Right to Information (RTI)' : 'Administrative Grievance')}
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-ashoka-navy mt-2">
              {currentStep === 0 && 'Legal Route & Case Assessment'}
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
          
          {/* STEP 0: LEGAL ASSESSMENT (No Extracted Facts Box) */}
          {currentStep === 0 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="p-6 bg-[#FAF8F5] border border-slate-200 rounded-3xl flex flex-col gap-4 shadow-inner text-left">
                
                <div className="flex flex-col gap-1 border-b border-slate-200 pb-5">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">
                    AI Classification Result
                  </span>
                  <h3 className={`font-black text-3xl sm:text-4xl tracking-tight ${isOther ? 'text-slate-700' : isRTI ? 'text-blue-700' : 'text-emerald-700'}`}>
                    {isOther ? 'Out of Scope / Other' : isRTI ? 'Right to Information (RTI)' : 'Formal Legal Grievance'}
                  </h3>
                  <div className="mt-2">
                    <span className="text-sm font-bold text-court-maroon bg-court-maroon/10 px-3 py-1.5 rounded-lg inline-block border border-court-maroon/20">
                      Category: {classifyResult.sub_category}
                    </span>
                  </div>
                </div>

                <div className="pt-2">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Detailed Legal Analysis</h4>
                  <div className="text-sm font-medium text-slate-700 leading-relaxed">
                    {formatAIText(classifyResult.reasoning)}
                  </div>
                </div>
              </div>

              {/* ACTION PLAN IF OUT OF SCOPE */}
              {isOther && (
                <div className="p-6 bg-blue-50 border border-blue-200 rounded-3xl text-left shadow-sm">
                  <h4 className="text-base font-bold text-blue-900 flex items-center gap-2 mb-4 pb-2 border-b border-blue-200/60">
                    <Info size={20} className="text-blue-700"/> Recommended Action Plan For Your Case
                  </h4>
                  <div className="text-sm text-blue-900 leading-relaxed font-medium">
                    {formatAIText(classifyResult.specific_advice || 'This case falls outside RTI or Consumer/Administrative grievance jurisdictions. Please consult a local legal professional or the relevant authority for this specific issue.')}
                  </div>
                </div>
              )}

              <div className="pt-6 border-t border-slate-200 flex items-center justify-between">
                <button onClick={() => { reset(); router.push('/'); }} className="btn-ghost py-3 px-5 border border-slate-300 cursor-pointer">
                  <ArrowLeft size={16} /> Start New Case
                </button>
                {!isOther && (
                  <button onClick={() => handleNextStep()} className="btn-primary py-3.5 px-8 flex items-center gap-2 bg-court-maroon hover:bg-[#701A75] text-white rounded-xl shadow-md cursor-pointer font-bold">
                    Proceed to Form Fill <ArrowRight size={18} />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* STEP 1: APPLICANT DETAILS */}
          {currentStep === 1 && (
            <form onSubmit={handleNextStep} className="space-y-5 animate-in fade-in duration-300">
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

              <div className="pt-6 border-t border-slate-200 flex items-center justify-between">
                <button type="button" onClick={() => setCurrentStep(0)} className="btn-ghost py-3 px-5 border border-slate-300 cursor-pointer">
                  <ArrowLeft size={16} /> Back
                </button>
                <button type="submit" className="btn-primary py-3.5 px-8 flex items-center gap-2 bg-court-maroon hover:bg-[#701A75] text-white rounded-xl shadow-md cursor-pointer font-bold">
                  Next: AI Legal Strategy <ArrowRight size={18} />
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: REVIEW AI LEGAL STRATEGY */}
          {currentStep === 2 && (
            <form onSubmit={handleNextStep} className="space-y-6 animate-in fade-in duration-300">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl flex items-start gap-3 shadow-xs">
                <Sparkles size={18} className="text-blue-700 mt-0.5 shrink-0" />
                <p className="text-xs text-blue-950 font-medium leading-relaxed">
                  <strong>AI Strategy Engine:</strong> We have automatically structured the technical legal clauses and target authority based on your problem. <br/><br/>
                  <span className="font-bold">Note: All fields below are optional.</span> If you are unsure about any specifics, leave them blank—the Legal Engine will automatically handle defaults.
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

          {/* STEP 3: FINAL REVIEW & CONFIRMATION */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              
              <div className="p-5 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-4 shadow-sm">
                <div className="p-2 bg-amber-100 rounded-full shrink-0 mt-0.5">
                  <AlertCircle size={20} className="text-amber-700" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-amber-900 uppercase tracking-wide mb-1">Important Legal Disclaimer</h4>
                  <p className="text-xs sm:text-sm text-amber-800 leading-relaxed font-medium">
                    JanAdhikar is an AI-assisted legal drafting tool, <strong>not a law firm</strong>. 
                    By clicking confirm, the AI will generate your formal document based on the facts provided above. 
                    <strong> You must personally verify all names, dates, amounts, and claims before officially filing or mailing this document.</strong>
                  </p>
                </div>
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
