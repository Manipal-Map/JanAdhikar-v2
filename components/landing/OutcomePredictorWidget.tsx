"use client";

import React, { useState } from "react";
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Zap,
  ShieldCheck,
  Copy,
  Check,
} from "lucide-react";
import ScrollAnimator from "./ScrollAnimator";

interface TestScenario {
  id: string;
  label: string;
  badText: string;
  goodText: string;
  badProb: { full: number; partial: number; reject: number };
  goodProb: { full: number; partial: number; reject: number };
  riskFactors: string[];
  department: string;
  improvements: string[];
}

const PRESET_SCENARIOS: TestScenario[] = [
  {
    id: "road",
    label: "Road Repair Delay",
    badText:
      "Why is the road in Sector 14 not repaired yet? Who is responsible for this terrible delay and what are officials doing?",
    goodText:
      "Under Section 6(1) of RTI Act 2005, please provide: 1. Certified copy of the work order and sanctioned timeline for Sector 14 road carpeting. 2. Daily progress log register and penalty notices issued to contractor XYZ Infra. 3. Total funds disbursed vs remaining balance.",
    badProb: { full: 24, partial: 32, reject: 44 },
    goodProb: { full: 92, partial: 6, reject: 2 },
    riskFactors: [
      "Section 2(f) Risk: 'Why' seeks opinion/explanation rather than defined material record.",
      "Vague Subject: Lacks specific tender ID, sanction year, or designated contract milestones.",
    ],
    department: "Ministry of Road Transport / Municipal Public Works",
    improvements: [
      "Converted subjective 'Why' into request for certified inspection reports & measurement books.",
      "Demanded contractor penalty logs under Section 4(1)(b) proactive disclosure norms.",
    ],
  },
  {
    id: "pension",
    label: "EPFO Pension Hold",
    badText:
      "I want to know when my grandfather will get his pension money and why your office is harassing senior citizens with repeated visits.",
    goodText:
      "Regarding EPS-95 Pension Claim ID #PPO-884912, please provide: 1. Daily file movement register from date of claim receipt. 2. Specific deficiency note or memo recorded by the Accounts Officer. 3. Name and designation of the dealing assistant holding the file beyond standard 20-day charter.",
    badProb: { full: 31, partial: 28, reject: 41 },
    goodProb: { full: 89, partial: 8, reject: 3 },
    riskFactors: [
      "Emotional Grievance wording: RTI is strictly for record inspection, not venting grievance.",
      "Missing Identifiers: Lacks PPO number, regional office code, and date of submission.",
    ],
    department: "Employees' Provident Fund Organisation (EPFO)",
    improvements: [
      "Added exact PPO reference and citizen tracking ID.",
      "Requested dealing assistant movement sheet as per Citizen Charter timelines.",
    ],
  },
  {
    id: "tender",
    label: "Govt Hospital Equipment",
    badText:
      "Is it true that the local hospital MRI scanner is broken because doctors are taking commissions from private labs?",
    goodText:
      "Under Section 6(1) of RTI Act 2005, regarding MRI Facility at District Hospital: 1. Certified copy of the Annual Maintenance Contract (AMC) in force. 2. Breakdown logbook showing dates the machine was non-operational since Jan 2026. 3. Total maintenance funds allocated and utilized in FY 2025-26.",
    badProb: { full: 12, partial: 18, reject: 70 },
    goodProb: { full: 94, partial: 4, reject: 2 },
    riskFactors: [
      "Defamatory / Speculative accusation: RTI Officers will outright reject under Sec 8 or non-material grounds.",
      "Hypothetical question ('Is it true that...'): Excluded from Section 2(f) definition of 'information'.",
    ],
    department: "Ministry of Health & Family Welfare / Directorate of Health Services",
    improvements: [
      "Removed unverified allegations and replaced with objective AMC contract verification.",
      "Requested downtime logs and maintenance vendor financial audit receipts.",
    ],
  },
];

export default function OutcomePredictorWidget() {
  const [activeScenario, setActiveScenario] = useState<TestScenario>(PRESET_SCENARIOS[0]);
  const [isOptimized, setIsOptimized] = useState(false);
  const [copied, setCopied] = useState(false);

  const currentProb = isOptimized ? activeScenario.goodProb : activeScenario.badProb;
  const currentText = isOptimized ? activeScenario.goodText : activeScenario.badText;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const scoreColor = isOptimized ? "#138808" : "#FF6B00";
  const bgAccentPale = isOptimized ? "#E8F5E9" : "#FFF0E0";
  const borderAccent = isOptimized ? "rgba(19,136,8,0.25)" : "rgba(255,107,0,0.25)";

  return (
    <section
      id="outcome-bench"
      className="relative py-24 px-4 sm:px-6 lg:px-8"
      style={{ background: "#F5F0E8" }}
    >
      <div className="max-w-7xl mx-auto relative z-10">

        {/* Header */}
        <ScrollAnimator animate="fade-up">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <div
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider mb-4"
              style={{
                background: "#E8EAF6",
                color: "#1a237e",
                border: "1px solid rgba(26,35,126,0.20)",
              }}
            >
              <Zap className="w-3.5 h-3.5" style={{ color: "#FF6B00" }} />
              <span>Trained on 45,000+ Indian CIC Decisions</span>
            </div>
            <h2
              className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight"
              style={{ color: "#2D3142" }}
            >
              RTI-Bench™ Outcome &amp; Risk Intelligence
            </h2>
            <p className="mt-4 text-base sm:text-lg" style={{ color: "#6B7280" }}>
              We don't just draft RTIs — our fine-tuned legal transformer predicts approval odds before you file,
              flags Section 2(f) rejections, and rewrites them into bulletproof statutory requests.
            </p>

            {/* Scenario pills */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-8">
              {PRESET_SCENARIOS.map((sc) => (
                <button
                  key={sc.id}
                  onClick={() => {
                    setActiveScenario(sc);
                    setIsOptimized(false);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  style={
                    activeScenario.id === sc.id
                      ? {
                          background: "#2D3142",
                          color: "#FFFDF7",
                          border: "1.5px solid #2D3142",
                          boxShadow: "0 2px 10px rgba(45,49,66,0.25)",
                        }
                      : {
                          background: "rgba(255,255,255,0.7)",
                          color: "#6B7280",
                          border: "1px solid rgba(45,49,66,0.12)",
                        }
                  }
                >
                  {sc.label}
                </button>
              ))}
            </div>
          </div>
        </ScrollAnimator>

        {/* Workspace */}
        <ScrollAnimator animate="scale-in">
          <div
            className="rounded-3xl p-6 sm:p-10"
            style={{
              background: "rgba(255,255,255,0.88)",
              backdropFilter: "blur(24px)",
              border: "1px solid rgba(255,255,255,0.95)",
              boxShadow: "0 8px 48px rgba(45,49,66,0.10)",
            }}
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

              {/* Left: Draft + insights (7 cols) */}
              <div className="lg:col-span-7 space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider" style={{ color: "#9CA3AF" }}>
                      Authority Target
                    </span>
                    <p className="text-sm font-semibold" style={{ color: "#2D3142" }}>
                      {activeScenario.department}
                    </p>
                  </div>
                  <button
                    onClick={() => setIsOptimized(!isOptimized)}
                    className="relative px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer text-white"
                    style={{
                      background: isOptimized
                        ? "linear-gradient(135deg, #138808, #1a7a2e)"
                        : "linear-gradient(135deg, #FF6B00, #FF9933)",
                      boxShadow: isOptimized
                        ? "0 4px 16px rgba(19,136,8,0.35)"
                        : "0 4px 16px rgba(255,107,0,0.35)",
                    }}
                  >
                    {isOptimized ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Optimized Draft (Sec 6(1) Tight)</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Click to Auto-Fix &amp; Boost Success</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Draft box */}
                <div
                  className="p-4 rounded-2xl font-mono text-xs sm:text-sm leading-relaxed transition-all duration-500"
                  style={{
                    background: bgAccentPale,
                    border: `1.5px solid ${borderAccent}`,
                    color: "#2D3142",
                  }}
                >
                  <div
                    className="flex items-center justify-between text-[11px] font-bold pb-2 mb-2"
                    style={{ borderBottom: `1px solid ${borderAccent}` }}
                  >
                    <span style={{ color: scoreColor }}>
                      {isOptimized ? "✓ Section 6(1) Statutory Rephrase" : "⚠️ Raw Citizen Problem Draft"}
                    </span>
                    <button
                      onClick={handleCopy}
                      className="flex items-center gap-1 px-2 py-0.5 rounded cursor-pointer transition-all"
                      style={{
                        background: "rgba(255,255,255,0.70)",
                        color: "#6B7280",
                        border: "1px solid rgba(45,49,66,0.10)",
                      }}
                    >
                      {copied ? <Check className="w-3 h-3" style={{ color: "#138808" }} /> : <Copy className="w-3 h-3" />}
                      <span>{copied ? "Copied" : "Copy"}</span>
                    </button>
                  </div>
                  <p className="whitespace-pre-wrap">{currentText}</p>
                </div>

                {/* Risk / improvements */}
                <div
                  className="rounded-2xl p-4"
                  style={{
                    background: bgAccentPale,
                    border: `1px solid ${borderAccent}`,
                  }}
                >
                  <h4
                    className="text-xs font-bold uppercase tracking-wider mb-2.5 flex items-center gap-1.5"
                    style={{ color: "#2D3142" }}
                  >
                    {isOptimized ? (
                      <ShieldCheck className="w-4 h-4" style={{ color: "#138808" }} />
                    ) : (
                      <AlertTriangle className="w-4 h-4" style={{ color: "#FF6B00" }} />
                    )}
                    <span>
                      {isOptimized ? "Statutory Enhancements Applied" : "CIC Rejection Risk Factors Detected"}
                    </span>
                  </h4>
                  <ul className="space-y-2 text-xs">
                    {(isOptimized ? activeScenario.improvements : activeScenario.riskFactors).map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2" style={{ color: scoreColor }}>
                        {isOptimized ? (
                          <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        ) : (
                          <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        )}
                        <span style={{ color: "#6B7280" }}>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Right: Outcome gauge (5 cols) */}
              <div
                className="lg:col-span-5 rounded-2xl p-6 flex flex-col justify-between"
                style={{
                  background: "#F5F0E8",
                  border: "1px solid rgba(45,49,66,0.09)",
                }}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold uppercase tracking-wider" style={{ color: "#9CA3AF" }}>
                      ML Outcome Confidence
                    </span>
                    <span
                      className="text-xs font-bold px-2.5 py-0.5 rounded-full"
                      style={{
                        background: isOptimized ? "#E8F5E9" : "#FFF0E0",
                        color: isOptimized ? "#138808" : "#FF6B00",
                        border: `1px solid ${isOptimized ? "rgba(19,136,8,0.25)" : "rgba(255,107,0,0.25)"}`,
                      }}
                    >
                      {isOptimized ? "High Success Probability" : "High Rejection Risk"}
                    </span>
                  </div>

                  {/* Big score */}
                  <div className="text-center py-6">
                    <div
                      className="text-6xl sm:text-7xl font-black tracking-tight transition-all duration-700"
                      style={{
                        color: scoreColor,
                        filter: `drop-shadow(0 0 20px ${scoreColor}55)`,
                      }}
                    >
                      {currentProb.full}%
                    </div>
                    <p className="text-xs font-semibold uppercase tracking-widest mt-1" style={{ color: "#9CA3AF" }}>
                      Chance of Full Disclosure
                    </p>
                  </div>

                  {/* Bars */}
                  <div className="space-y-4 my-4">
                    {[
                      { label: "Full Disclosure", val: currentProb.full, color: "#138808", icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
                      { label: "Partial / Defective", val: currentProb.partial, color: "#FF6B00", icon: <AlertTriangle className="w-3.5 h-3.5" /> },
                      { label: "Rejection / Appeal Required", val: currentProb.reject, color: "#DC2626", icon: <XCircle className="w-3.5 h-3.5" /> },
                    ].map((bar) => (
                      <div key={bar.label}>
                        <div className="flex justify-between text-xs font-semibold mb-1.5">
                          <span className="flex items-center gap-1.5" style={{ color: bar.color }}>
                            {bar.icon}
                            <span>{bar.label}</span>
                          </span>
                          <span style={{ color: "#2D3142" }}>{bar.val}%</span>
                        </div>
                        <div
                          className="w-full rounded-full h-2.5 overflow-hidden"
                          style={{ background: "rgba(45,49,66,0.10)" }}
                        >
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{
                              width: `${bar.val}%`,
                              background: bar.color,
                              boxShadow: `0 0 8px ${bar.color}80`,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div
                  className="pt-4 text-[11px] flex items-center justify-between"
                  style={{
                    borderTop: "1px solid rgba(45,49,66,0.09)",
                    fontFamily: "monospace",
                    color: "#9CA3AF",
                  }}
                >
                  <span>Model: fine-tuned IndicBERT v2</span>
                  <span style={{ color: "#138808", fontWeight: 600 }}>Validation Accuracy: 94.8%</span>
                </div>
              </div>
            </div>
          </div>
        </ScrollAnimator>
      </div>
    </section>
  );
}
