"use client";

import React, { useState } from "react";
import {
  ChevronDown,
  Scale,
  HelpCircle,
  Sparkles,
} from "lucide-react";
import ScrollAnimator from "./ScrollAnimator";

const FAQS = [
  {
    q: "Do I need to pay anything to use JanAdhikar / CivicRoute AI?",
    a: "JanAdhikar is free to draft, classify, and predict outcomes for your civic cases. When you submit your finalized RTI application on the official Government of India portal (rtionline.gov.in), the standard statutory government fee is only ₹10 (free for BPL card holders). CPGRAMS grievances are completely free.",
  },
  {
    q: "How does the RTI-Bench Outcome Intelligence work?",
    a: "Our machine learning model is fine-tuned on thousands of Central Information Commission (CIC) appeal orders. It identifies common reasons PIOs reject applications—such as asking for 'opinions/reasons' (which violates Section 2(f)) rather than certified records—and suggests exact statutory rephrasings to maximize full disclosure probability.",
  },
  {
    q: "What is the difference between an RTI and a Grievance?",
    a: "An RTI (Right to Information) is used to obtain existing official records, files, logs, and sanctioned budgets from a public authority. A Grievance (via CPGRAMS or Consumer Forum) is used to demand action, rectify an administrative failure, or claim compensation for delayed service disbursal.",
  },
  {
    q: "What happens if the government department does not respond in 30 days?",
    a: "Under Section 7(1) of the RTI Act 2005, public authorities are mandated by law to respond within 30 days (48 hours for matters of life and liberty). If they fail or reject without valid statutory exemptions, our system helps you automatically draft a Section 19(1) First Appeal to the designated First Appellate Authority.",
  },
  {
    q: "Is my personal data safe and private?",
    a: "Yes. JanAdhikar follows a strict local-first architecture. Your problem description, drafts, and uploaded receipts are kept in your browser's private offline storage. We never sell citizen data, and our pipeline adheres to the Digital Personal Data Protection (DPDP) Act 2023.",
  },
];

const FOOTER_LINKS = [
  { label: "How It Works", href: "#how-it-works" },
  { label: "India Civic Grid", href: "#map-section" },
  { label: "RTI-Bench ML", href: "#outcome-bench" },
  { label: "Statutory Laws", href: "#sources" },
  { label: "Workspace", href: "/dashboard", accent: true },
];

interface FaqAndFooterProps {
  onOpenCaseModal: () => void;
}

export default function FaqAndFooter({ onOpenCaseModal }: FaqAndFooterProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <footer
      className="relative"
      style={{
        background: "#FFFDF7",
        borderTop: "1px solid rgba(45,49,66,0.08)",
        color: "#6B7280",
      }}
    >
      {/* FAQ Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <ScrollAnimator animate="fade-up">
          <div className="text-center mb-12">
            <div
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-3"
              style={{
                background: "#E8EAF6",
                color: "#1a237e",
                border: "1px solid rgba(26,35,126,0.20)",
              }}
            >
              <HelpCircle className="w-3.5 h-3.5" style={{ color: "#FF6B00" }} />
              <span>Frequently Asked Questions</span>
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight" style={{ color: "#2D3142" }}>
              Everything You Need to Know About Citizen Rights
            </h2>
          </div>
        </ScrollAnimator>

        <div className="space-y-3">
          {FAQS.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <ScrollAnimator key={idx} animate="fade-up" delay={idx * 60}>
                <div
                  className="rounded-2xl overflow-hidden transition-all duration-200"
                  style={{
                    background: isOpen ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.75)",
                    backdropFilter: "blur(12px)",
                    border: isOpen ? "1.5px solid rgba(255,107,0,0.25)" : "1px solid rgba(45,49,66,0.08)",
                    boxShadow: isOpen ? "0 4px 20px rgba(255,107,0,0.08)" : "0 1px 4px rgba(45,49,66,0.04)",
                  }}
                >
                  <button
                    onClick={() => setOpenIndex(isOpen ? null : idx)}
                    className="w-full text-left p-5 sm:p-6 flex items-center justify-between gap-4 cursor-pointer"
                  >
                    <span className="text-sm sm:text-base font-bold" style={{ color: "#2D3142" }}>
                      {faq.q}
                    </span>
                    <ChevronDown
                      className={`w-5 h-5 shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                      style={{ color: "#FF6B00" }}
                    />
                  </button>
                  {isOpen && (
                    <div
                      className="px-5 sm:px-6 pb-6 pt-1 text-xs sm:text-sm leading-relaxed animate-in fade-in duration-200"
                      style={{
                        borderTop: "1px solid rgba(45,49,66,0.07)",
                        color: "#6B7280",
                      }}
                    >
                      {faq.a}
                    </div>
                  )}
                </div>
              </ScrollAnimator>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <ScrollAnimator animate="scale-in">
          <div
            className="mt-16 rounded-3xl p-8 sm:p-10 text-center relative overflow-hidden"
            style={{
              background: "linear-gradient(135deg, #FF6B00 0%, #FF9933 50%, #B8860B 100%)",
              boxShadow: "0 8px 40px rgba(255,107,0,0.30)",
            }}
          >
            {/* Subtle pattern overlay */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: "radial-gradient(ellipse 60% 50% at 70% 30%, rgba(255,255,255,0.15), transparent)",
              }}
            />
            <div className="relative z-10 max-w-xl mx-auto">
              <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-2">
                Ready to Claim What Is Rightfully Yours?
              </h3>
              <p className="text-sm text-orange-100 mb-6">
                Generate a legally compliant Section 6(1) RTI application or statutory grievance pack in under 2 minutes.
              </p>
              <button
                onClick={onOpenCaseModal}
                className="px-8 py-3.5 rounded-xl bg-white font-bold text-sm shadow-lg hover:shadow-xl transition-all cursor-pointer inline-flex items-center gap-2"
                style={{ color: "#FF6B00" }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.04)")}
                onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
              >
                <Sparkles className="w-4 h-4" />
                Start Case &amp; Predict Outcome Now
              </button>
            </div>
          </div>
        </ScrollAnimator>
      </div>

      {/* Footer bottom */}
      <div
        className="py-10 px-4 sm:px-6 lg:px-8"
        style={{ borderTop: "1px solid rgba(45,49,66,0.07)" }}
      >
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, #FFF0E0, #E8EAF6)",
                border: "1px solid rgba(255,107,0,0.20)",
              }}
            >
              <Scale className="w-5 h-5" style={{ color: "#FF6B00" }} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-black tracking-tight" style={{ color: "#2D3142" }}>
                  JAN<span style={{ color: "#FF6B00" }}>ADHIKAR</span>
                </span>
                <span
                  className="text-[10px] px-2 py-0.5 rounded-full"
                  style={{
                    background: "#E8EAF6",
                    color: "#1a237e",
                    border: "1px solid rgba(26,35,126,0.15)",
                  }}
                >
                  CivicRoute AI
                </span>
              </div>
              <p className="text-xs" style={{ color: "#9CA3AF" }}>
                Autonomous Legal Copilot for the Citizens of India
              </p>
            </div>
          </div>

          <div className="flex items-center gap-5 text-xs">
            {FOOTER_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="transition-colors font-medium"
                style={{ color: link.accent ? "#FF6B00" : "#9CA3AF" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = link.accent ? "#FF9933" : "#2D3142")}
                onMouseLeave={(e) => (e.currentTarget.style.color = link.accent ? "#FF6B00" : "#9CA3AF")}
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="text-xs text-right" style={{ color: "#9CA3AF" }}>
            <p>Non-commercial public service civic technology.</p>
            <p className="mt-0.5 text-[11px]" style={{ color: "#C4B89A" }}>
              Not legal counsel. Grounded in RTI Act 2005 &amp; CIC decisions.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
