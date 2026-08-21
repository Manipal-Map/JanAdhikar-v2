'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Loader2, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  ShieldCheck, 
  Wand2, 
  Edit3, 
  User, 
  Building2, 
  FileCheck2, 
  MapPin, 
  Phone, 
  Calendar,
  Sparkles
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
        <h2 className="text-xl font-bold text-ashoka-navy">Analyzing Your Problem Statement...</h2>
        <p className="text-slate-500 mt-2 text-sm">Identifying jurisdiction, authority, and drafting legal queries.</p>
      </div>
    );
  }

  const isRTI = classifyResult?.route === 'RTI';

  return (
    <div className="gradient-bg min-h-screen p-4 sm:p-6 lg:p-8 flex items-center justify-center font-sans">
      <div className="w-full max-w-3xl space-y-6">
        
        {/* Step Progression Bar */}
        <div className="bg-white border border-slate-300 rounded-2xl p-4 shadow-sm flex items-center justify-between">
          {[
            { num: 1, label: '1. Applicant Details', icon: User },
            { num: 2, label: isRTI ? '2. RTI Queries & Authority' : '2. Grievance & Relief', icon: Building2 },
            { num: 3, label: '3. Final Review', icon: FileCheck2 },
          ].map((s) => {
            const Icon = s.icon;
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

        {/* Case Info Header */}
        <div className="flex items-center justify-between px-2">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-court-maroon bg-rose-50 border border-rose-200 px-3 py-1 rounded-full">
              Route: {isRTI ? 'Right to Information (RTI Act 2005)' : 'Consumer / Administrative Grievance'}
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-ashoka-navy mt-2">
              {currentStep === 1 && 'Step 1: Who is filing this application?'}
              {currentStep === 2 && (isRTI ? 'Step 2: RTI Authority & Specific Records' : 'Step 2: Opposing Party & Desired Relief')}
              {currentStep === 3 && 'Step 3: Review & Lock All Details'}
            </h2>
          </div>
          {caseId && (
            <span className="text-xs font-mono font-bold text-slate-600 bg-white border border-slate-300 px-3 py-1.5 rounded-xl shadow-xs">
              #{caseId}
            </span>
          )}
        </div>

        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-300 shadow-sm text-left">
          
          {/* STEP 1: APPLICANT DETAILS */}
          {currentStep === 1 && (
            <form onSubmit={handleNextStep} className="space-y-5">
              <p className="text-xs text-slate-500 leading-relaxed mb-4 font-medium">
                Under Indian administrative law, official statutory applications require the physical correspondence identity of the citizen.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-ashoka-navy uppercase tracking-wide">Your Full Name *</label>
                  <input
                    type="text"
                    required
                    value={localForm.applicant_name || ''}
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
                    value={localForm.applicant_contact || ''}
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
                    value={localForm.applicant_city || ''}
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
                    value={localForm.applicant_state || ''}
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
                    value={localForm.applicant_address || ''}
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
                    value={localForm.applicant_pincode || ''}
                    onChange={e => handleChange('applicant_pincode', e.target.value)}
                    placeholder="e.g. 302001"
                    className="input-field"
                  />
                </div>
              </div>

              <div className="pt-6 border-t border-slate-200 flex justify-end">
                <button type="submit" className="btn-primary py-3.5 px-8 flex items-center gap-2 bg-court-maroon hover:bg-[#701A75] text-white rounded-xl shadow-md cursor-pointer font-bold">
                  Next: {isRTI ? 'RTI Authority & Queries' : 'Grievance Specifics'} <ArrowRight size={18} />
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: AUTHORITY & SPECIFIC QUERIES (AI AUTO-FILLED) */}
          {currentStep === 2 && (
            <form onSubmit={handleNextStep} className="space-y-5">
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3 shadow-xs">
                <Sparkles size={18} className="text-amber-700 mt-0.5 shrink-0" />
                <p className="text-xs text-amber-950 font-medium leading-relaxed">
                  <strong>AI Auto-Generated Clauses:</strong> The technical department name and clauses below were synthesized from your description. You can freely edit them before finalizing.
                </p>
              </div>

              {isRTI ? (
                <div className="space-y-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-ashoka-navy uppercase tracking-wide">Target Public Authority / Department *</label>
                    <input
                      type="text"
                      required
                      value={localForm.target_department || ''}
                      onChange={e => handleChange('target_department', e.target.value)}
                      placeholder="e.g., Public Works Department (PWD) / Municipal Corporation"
                      className="input-field font-semibold"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-ashoka-navy uppercase tracking-wide">Certified Documents / Records Requested *</label>
                    <textarea
                      rows={4}
                      required
                      value={localForm.specific_records || ''}
                      onChange={e => handleChange('specific_records', e.target.value)}
                      placeholder="e.g. Certified copy of tender execution contract, daily muster roll, and bituminous inspection reports"
                      className="input-field resize-none leading-relaxed"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-ashoka-navy uppercase tracking-wide">Time Period / Financial Year *</label>
                      <input
                        type="text"
                        required
                        value={localForm.time_period || ''}
                        onChange={e => handleChange('time_period', e.target.value)}
                        placeholder="e.g., 2023 - 2024"
                        className="input-field"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-ashoka-navy uppercase tracking-wide">Work Order / Application Ref No (Optional)</label>
                      <input
                        type="text"
                        value={localForm.file_or_work_no || ''}
                        onChange={e => handleChange('file_or_work_no', e.target.value)}
                        placeholder="e.g., WO/8892/2023"
                        className="input-field"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-ashoka-navy uppercase tracking-wide">Opposing Party / Company / Department *</label>
                    <input
                      type="text"
                      required
                      value={localForm.target_department || ''}
                      onChange={e => handleChange('target_department', e.target.value)}
                      placeholder="e.g., Landlord Name / Company / Electricity Board"
                      className="input-field font-semibold"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-ashoka-navy uppercase tracking-wide">Date of Dispute / Default *</label>
                      <input
                        type="text"
                        required
                        value={localForm.incident_date || ''}
                        onChange={e => handleChange('incident_date', e.target.value)}
                        placeholder="e.g., 15th January 2024"
                        className="input-field"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-ashoka-navy uppercase tracking-wide">Amount Involved / Claim (₹)</label>
                      <input
                        type="text"
                        value={localForm.financial_loss || ''}
                        onChange={e => handleChange('financial_loss', e.target.value)}
                        placeholder="e.g., 45000"
                        className="input-field"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-ashoka-navy uppercase tracking-wide">Specific Remedy / Relief Demanded *</label>
                    <textarea
                      rows={3}
                      required
                      value={localForm.desired_relief || ''}
                      onChange={e => handleChange('desired_relief', e.target.value)}
                      placeholder="e.g. Immediate 100% refund of security deposit with 18% p.a. penal interest"
                      className="input-field resize-none leading-relaxed"
                    />
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
            <div className="space-y-6">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-3">
                <ShieldCheck size={20} className="text-emerald-700 mt-0.5 shrink-0" />
                <p className="text-xs text-emerald-950 leading-relaxed font-medium">
                  <strong>Verification Check:</strong> Please inspect all details. Clicking confirm will lock these facts, perform exemption risk audits, and generate your statutory documents.
                </p>
              </div>

              {/* Summary Sections */}
              <div className="space-y-4">
                <div className="bg-[#FAF8F5] p-5 rounded-2xl border border-slate-200">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200/80 mb-3">
                    <h4 className="text-xs font-bold text-court-maroon uppercase tracking-wider flex items-center gap-1.5">
                      <User size={14} /> Applicant Credentials
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

                <div className="bg-[#FAF8F5] p-5 rounded-2xl border border-slate-200">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200/80 mb-3">
                    <h4 className="text-xs font-bold text-court-maroon uppercase tracking-wider flex items-center gap-1.5">
                      <Building2 size={14} /> Case & Authority Details
                    </h4>
                    <button onClick={() => setCurrentStep(2)} className="text-xs font-bold text-slate-500 hover:text-ashoka-navy flex items-center gap-1">
                      <Edit3 size={12} /> Edit
                    </button>
                  </div>
                  <div className="space-y-3 text-xs">
                    <div>
                      <span className="text-slate-400 font-bold block">{isRTI ? 'PUBLIC AUTHORITY:' : 'OPPOSING PARTY:'}</span>
                      <span className="font-semibold text-slate-900 text-sm">{localForm.target_department}</span>
                    </div>
                    {isRTI ? (
                      <>
                        <div>
                          <span className="text-slate-400 font-bold block">RECORDS SOUGHT:</span>
                          <p className="font-medium text-slate-800 whitespace-pre-wrap leading-relaxed">{localForm.specific_records}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-2 pt-1">
                          <div>
                            <span className="text-slate-400 font-bold block">PERIOD:</span>
                            <span className="font-semibold text-slate-800">{localForm.time_period}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 font-bold block">FILE/WORK NO:</span>
                            <span className="font-semibold text-slate-800">{localForm.file_or_work_no || 'N/A'}</span>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <span className="text-slate-400 font-bold block">REMEDY DEMANDED:</span>
                          <p className="font-medium text-slate-800 leading-relaxed">{localForm.desired_relief}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-2 pt-1">
                          <div>
                            <span className="text-slate-400 font-bold block">INCIDENT DATE:</span>
                            <span className="font-semibold text-slate-800">{localForm.incident_date}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 font-bold block">CLAIM AMOUNT:</span>
                            <span className="font-semibold text-slate-800">₹{localForm.financial_loss || '0'}</span>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  disabled={generating}
                  className="btn-ghost py-3 px-5 border border-slate-300 cursor-pointer w-full sm:w-auto justify-center"
                >
                  <ArrowLeft size={16} /> Back to Queries
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
