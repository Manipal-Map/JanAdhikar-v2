"use client";

import React, { useState, useEffect } from "react";
import { 
  X, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Scale, 
  Copy, 
  Check, 
  ShieldCheck, 
  Building2, 
  ExternalLink,
  ChevronLeft,
  Paperclip,
  Clock
} from "lucide-react";

interface GuidedCaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPrompt?: string;
}

export default function GuidedCaseModal({ isOpen, onClose, initialPrompt = "" }: GuidedCaseModalProps) {
  const [step, setStep] = useState<number>(1);
  const [problemText, setProblemText] = useState(initialPrompt);
  const [citizenName, setCitizenName] = useState("Rajesh Kumar");
  const [citizenCity, setCitizenCity] = useState("New Delhi");
  const [selectedRoute, setSelectedRoute] = useState<"RTI" | "GRIEVANCE" | "ACTION">("RTI");
  
  const [checklist, setChecklist] = useState({
    specificPeriod: true,
    exactLocation: true,
    previousComplaintRef: false,
    proofOfFeeExemption: false,
  });

  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialPrompt) {
      setProblemText(initialPrompt);
    }
  }, [initialPrompt]);

  if (!isOpen) return null;

  const handleNextToAnalyze = () => {
    if (!problemText.trim()) return;
    setLoading(true);
    setTimeout(() => {
      const lower = problemText.toLowerCase();
      if (lower.includes("refund") || lower.includes("deposit") || lower.includes("salary") || lower.includes("pension not received")) {
        setSelectedRoute("GRIEVANCE");
      } else {
        setSelectedRoute("RTI");
      }
      setLoading(false);
      setStep(2);
    }, 600);
  };

  const handleFinishCase = async () => {
    setStep(4);
    if (typeof window !== "undefined") {
      try {
        const confettiModule = await import("canvas-confetti");
        const confetti = confettiModule.default || confettiModule;
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {
        // Safe fallback if canvas is not initialized
      }
    }
  };

  const handleCopyDraft = () => {
    const draft = generateDraftText();
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(draft);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const generateDraftText = () => {
    if (selectedRoute === "RTI") {
      return `APPLICATION UNDER SECTION 6(1) OF THE RIGHT TO INFORMATION ACT, 2005

To:
The Central Public Information Officer (CPIO)
Ministry / Designated Public Authority
Government of India, ${citizenCity}

1. Applicant Details:
   Name: ${citizenName}
   Location / State: ${citizenCity}
   Citizenship: Citizen of India

2. Particulars of Information Required:
   Subject: ${problemText.slice(0, 80)}...

   (a) Certified copies of the sanctioned sanction note, work tender, and official progress register regarding: "${problemText}".
   (b) Daily movement file notings with signatures of concerned inspecting engineers/officers.
   (c) Reasons recorded in writing for any non-compliance with the citizen charter timelines.
   (d) Details of total funds allocated, released, and unspent under this budgetary head.

3. Period to which Information Relates: 2024 to Present Date.
4. Statutory Fee: ₹10 (Ten Rupees Only) paid via Online RTI Portal / IPO.

Declaration:
I hereby state that the information requested is within the definition of Section 2(f) and does not fall within exemptions under Section 8 or 9 of RTI Act 2005.

Date: ${new Date().toLocaleDateString("en-IN")}
Signature: ${citizenName}`;
    } else {
      return `FORMAL STATUTORY GRIEVANCE PETITION UNDER CPGRAMS / CITIZEN CHARTER

To:
The Appellate Grievance Redressal Officer
Concerned Ministry / Regulatory Authority, ${citizenCity}

Subject: Urgent Redressal Request Regarding: ${problemText.slice(0, 70)}

Complainant: ${citizenName}
Location: ${citizenCity}

Statement of Grievance:
"${problemText}"

Relief & Action Sought:
1. Immediate review of the delayed action as per Citizen Charter standards.
2. Written communication specifying the timeframe for resolution and direct point of contact.
3. Waiver of unlawful deductions or release of withheld entitlement.

Enclosures: Identity verification and supporting communication references.

Date: ${new Date().toLocaleDateString("en-IN")}
Petitioner: ${citizenName}`;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/85 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-white/15 rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-emerald-400 p-1.5 flex items-center justify-center shadow-md">
              <Scale className="w-4 h-4 text-slate-950" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                <span>Citizen Case Intake & Outcome Check</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono">
                  Step {step} of 4
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">Section 6(1) RTI & CPGRAMS Autonomous Legal Engine</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Step Content */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1 space-y-6">
          {step === 1 && (
            <div className="space-y-5 animate-in slide-in-from-right-4 duration-300">
              <div>
                <h4 className="text-xl font-bold text-white mb-1">
                  What issue are you facing with a public body or service?
                </h4>
                <p className="text-xs sm:text-sm text-slate-400">
                  Explain in your own words. You do not need to know legal provisions or department names.
                </p>
              </div>

              <div>
                <textarea
                  rows={4}
                  value={problemText}
                  onChange={(e) => setProblemText(e.target.value)}
                  placeholder="e.g. My EPF withdrawal request has been pending for over 3 months with no status update from the regional provident fund office..."
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-2xl p-4 text-sm text-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none resize-none placeholder-slate-500 leading-relaxed shadow-inner"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Applicant Name</label>
                  <input
                    type="text"
                    value={citizenName}
                    onChange={(e) => setCitizenName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">City / State</label>
                  <input
                    type="text"
                    value={citizenCity}
                    onChange={(e) => setCitizenCity(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <span className="text-[11px] font-semibold uppercase text-slate-400 tracking-wider">
                  Or select a common citizen issue:
                </span>
                <div className="flex flex-wrap gap-2 mt-2">
                  {[
                    "Road repair sanctioned in Ward 12 but no work started for 6 months",
                    "EPFO claim rejected without giving specific deficiency reasons",
                    "Consumer refund denied by airline for cancelled flight",
                    "District Hospital MRI scanner non-functional since 4 months"
                  ].map((preset, idx) => (
                    <button
                      key={idx}
                      onClick={() => setProblemText(preset)}
                      className="text-xs bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white px-3 py-1.5 rounded-xl border border-slate-800 transition cursor-pointer text-left"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                  AI Statutory Analysis
                </span>
                <h4 className="text-xl font-bold text-white mt-0.5">
                  Recommended Action Route for Your Case
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div
                  onClick={() => setSelectedRoute("RTI")}
                  className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                    selectedRoute === "RTI"
                      ? "bg-emerald-950/30 border-emerald-500 ring-2 ring-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.2)]"
                      : "bg-slate-950/60 border-slate-800 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
                      Information & Records
                    </span>
                    {selectedRoute === "RTI" && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                  </div>
                  <h5 className="text-base font-bold text-white mb-1">Right to Information (RTI)</h5>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Request official government documents, inspection logs, budget tenders, or reasons recorded on files under RTI Act 2005.
                  </p>
                  <div className="mt-3 pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                    <span>Fee: ₹10 standard</span>
                    <span className="text-emerald-400 font-semibold">30-Day Mandate</span>
                  </div>
                </div>

                <div
                  onClick={() => setSelectedRoute("GRIEVANCE")}
                  className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                    selectedRoute === "GRIEVANCE"
                      ? "bg-amber-950/30 border-amber-500 ring-2 ring-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.2)]"
                      : "bg-slate-950/60 border-slate-800 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300">
                      Action & Redressal
                    </span>
                    {selectedRoute === "GRIEVANCE" && <CheckCircle2 className="w-4 h-4 text-amber-400" />}
                  </div>
                  <h5 className="text-base font-bold text-white mb-1">Grievance Petition (CPGRAMS)</h5>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Demand administrative action, fix delayed service disbursal, or dispute wrongful claim rejection.
                  </p>
                  <div className="mt-3 pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                    <span>Fee: Free (Nil)</span>
                    <span className="text-amber-400 font-semibold">Senior Officer Escalation</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl flex items-center gap-3.5">
                <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 shrink-0">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                    Target Public Authority Identified
                  </div>
                  <div className="text-sm font-bold text-white">
                    {selectedRoute === "RTI" 
                      ? "Central Public Information Officer (CPIO) / Regional Municipal Zone" 
                      : "Nodal Grievance Redressal Cell / CPGRAMS Central"}
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                    Procedural Integrity Check
                  </span>
                  <h4 className="text-xl font-bold text-white mt-0.5">
                    Green-Tick Evidence & Completeness
                  </h4>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400">Case Readiness</span>
                  <div className="text-lg font-black text-emerald-400">95% (Ready)</div>
                </div>
              </div>

              <div className="space-y-3">
                <label className="flex items-start gap-3 p-3.5 bg-slate-950 border border-slate-800 rounded-xl cursor-pointer hover:border-slate-700 transition">
                  <input
                    type="checkbox"
                    checked={checklist.specificPeriod}
                    onChange={(e) => setChecklist({ ...checklist, specificPeriod: e.target.checked })}
                    className="mt-1 w-4 h-4 rounded text-emerald-500 focus:ring-0"
                  />
                  <div>
                    <div className="text-xs font-bold text-white">Specific Timeframe & Financial Year Provided</div>
                    <div className="text-[11px] text-slate-400">Required under Section 6(1) to prevent rejection under broad scope.</div>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3.5 bg-slate-950 border border-slate-800 rounded-xl cursor-pointer hover:border-slate-700 transition">
                  <input
                    type="checkbox"
                    checked={checklist.exactLocation}
                    onChange={(e) => setChecklist({ ...checklist, exactLocation: e.target.checked })}
                    className="mt-1 w-4 h-4 rounded text-emerald-500 focus:ring-0"
                  />
                  <div>
                    <div className="text-xs font-bold text-white">Jurisdiction & Ward / Office Name Specified</div>
                    <div className="text-[11px] text-slate-400">Ensures accurate PIO mapping without Section 6(3) transfer delays.</div>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3.5 bg-slate-950 border border-slate-800 rounded-xl cursor-pointer hover:border-slate-700 transition">
                  <input
                    type="checkbox"
                    checked={checklist.previousComplaintRef}
                    onChange={(e) => setChecklist({ ...checklist, previousComplaintRef: e.target.checked })}
                    className="mt-1 w-4 h-4 rounded text-emerald-500 focus:ring-0"
                  />
                  <div>
                    <div className="text-xs font-bold text-white">Prior Complaint or Reference Number Attached (Optional)</div>
                    <div className="text-[11px] text-slate-400">Accelerates file retrieval by linking existing departmental tracking IDs.</div>
                  </div>
                </label>
              </div>

              <div className="border-2 border-dashed border-slate-800 hover:border-emerald-500/50 rounded-2xl p-4 text-center cursor-pointer transition">
                <Paperclip className="w-5 h-5 text-slate-400 mx-auto mb-1.5" />
                <div className="text-xs font-semibold text-slate-300">
                  Drag & Drop Supporting Proof or Speed Post Receipt
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">PDF, PNG, JPG up to 10MB • Encrypted on Local Device</div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-950 border border-emerald-500/30 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                      <span>RTI-Bench™ Predicted Approval:</span>
                      <span className="text-sm font-black text-emerald-400">92%</span>
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Section 2(f) verified • Formatted for instant submission on rtionline.gov.in
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleCopyDraft}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 cursor-pointer shadow-sm"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? "Copied" : "Copy Draft"}</span>
                </button>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-1.5">
                  <span>Generated Statutory Application</span>
                  <span className="font-mono text-[11px]">Ready for Submission</span>
                </div>
                <pre className="p-4 bg-slate-950 border border-slate-800 rounded-2xl text-xs font-mono text-slate-300 whitespace-pre-wrap max-h-60 overflow-y-auto leading-relaxed shadow-inner">
                  {generateDraftText()}
                </pre>
              </div>

              <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-2">
                <h5 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>How to File This in 3 Minutes:</span>
                </h5>
                <ol className="list-decimal list-inside text-xs text-slate-300 space-y-1">
                  <li>Visit official portal <a href="https://rtionline.gov.in" target="_blank" rel="noreferrer" className="text-emerald-400 underline inline-flex items-center gap-0.5">rtionline.gov.in <ExternalLink className="w-2.5 h-2.5" /></a> (or CPGRAMS for grievance).</li>
                  <li>Select designated Ministry and paste the generated draft text above.</li>
                  <li>Pay statutory ₹10 fee via UPI / Debit Card and note the Registration Number.</li>
                </ol>
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Actions */}
        <div className="px-6 py-4 border-t border-white/10 bg-slate-950 flex items-center justify-between">
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          {step === 1 && (
            <button
              onClick={handleNextToAnalyze}
              disabled={loading || !problemText.trim()}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-emerald-400 text-slate-950 text-xs sm:text-sm font-bold flex items-center gap-2 shadow-lg hover:shadow-emerald-500/20 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <span>Analyzing Statutory Route...</span>
              ) : (
                <>
                  <span>Analyze Problem & Route</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          )}

          {step === 2 && (
            <button
              onClick={() => setStep(3)}
              className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs sm:text-sm font-bold flex items-center gap-2 shadow-lg cursor-pointer"
            >
              <span>Continue to Evidence Checklist</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          {step === 3 && (
            <button
              onClick={handleFinishCase}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-emerald-400 to-teal-300 text-slate-950 text-xs sm:text-sm font-bold flex items-center gap-2 shadow-lg cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Generate Legal Draft & Outcome Prediction</span>
            </button>
          )}

          {step === 4 && (
            <div className="flex items-center gap-2.5">
              <a
                href="/dashboard"
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-bold"
              >
                Track in Workspace →
              </a>
              <button
                onClick={onClose}
                className="px-5 py-2 rounded-xl bg-emerald-500 text-slate-950 text-xs font-bold cursor-pointer"
              >
                Done
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
