"use client";

import React from "react";
import {
  Search,
  Wrench,
  CheckSquare,
  Scale,
  FileText,
  Compass,
  ArrowRight,
  Layers,
} from "lucide-react";
import ScrollAnimator from "./ScrollAnimator";

interface FeatureGridProps {
  onOpenModalWithCategory: (category: string) => void;
}

const PATHWAYS = [
  {
    num: "01",
    icon: <Search className="w-6 h-6" />,
    title: '"I Need to Find Something Out"',
    desc: "Want tender logs, official road inspection reports, exam answer keys, or fund sanction records?",
    badge: "Auto-Routes to Section 6(1) RTI Application",
    badgeIcon: <FileText className="w-3.5 h-3.5 shrink-0" />,
    cta: "Draft Information Request",
    prompt: "I want official documents and inspection records for a government work",
    accentColor: "#138808",
    palePrimary: "#E8F5E9",
    hoverBorder: "rgba(19,136,8,0.35)",
  },
  {
    num: "02",
    icon: <Wrench className="w-6 h-6" />,
    title: '"I Want Someone to Fix a Problem"',
    desc: "Pension delayed, water pipeline broken, streetlights not working, or bank unauthorized deductions?",
    badge: "Auto-Routes to CPGRAMS / Ombudsman Petition",
    badgeIcon: <Scale className="w-3.5 h-3.5 shrink-0" />,
    cta: "Draft Grievance Petition",
    prompt: "My government benefit/pension/service has not been disbursed or acted upon",
    accentColor: "#FF6B00",
    palePrimary: "#FFF0E0",
    hoverBorder: "rgba(255,107,0,0.35)",
  },
  {
    num: "03",
    icon: <CheckSquare className="w-6 h-6" />,
    title: '"Figure Out What I Need to Do"',
    desc: "Need to complete a municipal name transfer, update Aadhaar, or resolve landlord deposit dispute?",
    badge: "Provides Guided Citizen Action Pack",
    badgeIcon: <Compass className="w-3.5 h-3.5 shrink-0" />,
    cta: "View Action Checklist",
    prompt: "I need a step-by-step checklist to complete a government citizen process",
    accentColor: "#1a237e",
    palePrimary: "#E8EAF6",
    hoverBorder: "rgba(26,35,126,0.35)",
  },
];

const STEPS = [
  {
    n: 1,
    title: "Explain Problem",
    desc: "Describe in everyday words, voice, or Hinglish. No legal codes, no department jargon required.",
    color: "#138808",
  },
  {
    n: 2,
    title: "Understand & Route",
    desc: "Authority mapping connects your issue to the correct CPIO, Ministry, or Redressal Cell.",
    color: "#FF6B00",
  },
  {
    n: 3,
    title: "Act & Predict",
    desc: "Generate Section 6(1) compliant draft, scan for rejection traps with RTI-Bench, and file in 3 minutes.",
    color: "#1a237e",
  },
  {
    n: 4,
    title: "Follow Up & Appeal",
    desc: "Upload government replies to automatically audit answered vs evasive queries and draft Section 19(1) First Appeals.",
    color: "#B8860B",
  },
];

export default function FeatureGrid({ onOpenModalWithCategory }: FeatureGridProps) {
  return (
    <section
      id="how-it-works"
      className="relative py-24 px-4 sm:px-6 lg:px-8"
      style={{ background: "#FFF8E7" }}
    >
      <div className="max-w-7xl mx-auto relative z-10">

        {/* Section Header */}
        <ScrollAnimator animate="fade-up">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <div
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider mb-4"
              style={{
                background: "#E8EAF6",
                color: "#1a237e",
                border: "1px solid rgba(26,35,126,0.20)",
              }}
            >
              <Layers className="w-3.5 h-3.5" style={{ color: "#FF6B00" }} />
              <span>Closed-Loop Civic Architecture</span>
            </div>
            <h2
              className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight"
              style={{ color: "#2D3142" }}
            >
              How JanAdhikar Solves Your Government Issues
            </h2>
            <p className="mt-4 text-base sm:text-lg" style={{ color: "#6B7280" }}>
              From the moment you describe a problem in plain language to the day you receive and interpret an official
              response — we handle the entire legal procedure.
            </p>
          </div>
        </ScrollAnimator>

        {/* 3 Pathways */}
        <ScrollAnimator stagger className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
          {PATHWAYS.map((p) => (
            <PathwayCard key={p.num} p={p} onOpenModalWithCategory={onOpenModalWithCategory} />
          ))}
        </ScrollAnimator>

        {/* 4-Step Timeline */}
        <ScrollAnimator animate="scale-in">
          <div
            className="rounded-3xl p-8 sm:p-12"
            style={{
              background: "rgba(255,255,255,0.85)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255,255,255,0.95)",
              boxShadow: "0 4px 32px rgba(45,49,66,0.07)",
            }}
          >
            <div className="max-w-2xl mb-12">
              <span
                className="text-xs font-bold uppercase tracking-wider"
                style={{ color: "#138808" }}
              >
                End-to-End Resolution Loop
              </span>
              <h3
                className="text-2xl sm:text-3xl font-extrabold mt-1"
                style={{ color: "#2D3142" }}
              >
                Never Left Stranded: The 4-Stage Civic Cycle
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
              {/* Connector line (desktop) */}
              <div
                className="hidden md:block absolute top-6 left-[calc(12.5%+16px)] right-[calc(12.5%-16px)] h-px"
                style={{ background: "linear-gradient(90deg, #138808, #FF6B00, #1a237e, #B8860B)" }}
              />
              {STEPS.map((step) => (
                <div
                  key={step.n}
                  className="rounded-2xl p-6 relative"
                  style={{
                    background: "#FFFDF7",
                    border: "1px solid rgba(45,49,66,0.08)",
                    boxShadow: "0 2px 8px rgba(45,49,66,0.04)",
                  }}
                >
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center font-black text-sm mb-4 text-white relative z-10"
                    style={{
                      background: step.color,
                      boxShadow: `0 4px 16px ${step.color}55`,
                    }}
                  >
                    {step.n}
                  </div>
                  <h4 className="text-base font-bold mb-1.5" style={{ color: "#2D3142" }}>
                    {step.title}
                  </h4>
                  <p className="text-xs leading-relaxed" style={{ color: "#6B7280" }}>
                    {step.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </ScrollAnimator>
      </div>
    </section>
  );
}

function PathwayCard({
  p,
  onOpenModalWithCategory,
}: {
  p: (typeof PATHWAYS)[0];
  onOpenModalWithCategory: (s: string) => void;
}) {
  const [hovered, setHovered] = React.useState(false);

  return (
    <div
      onClick={() => onOpenModalWithCategory(p.prompt)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative rounded-3xl p-8 flex flex-col justify-between cursor-pointer transition-all duration-300"
      style={{
        background: hovered ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.78)",
        backdropFilter: "blur(16px)",
        border: `1.5px solid ${hovered ? p.hoverBorder : "rgba(255,255,255,0.90)"}`,
        boxShadow: hovered
          ? `0 8px 40px rgba(45,49,66,0.12), 0 0 0 1px ${p.hoverBorder}`
          : "0 2px 16px rgba(45,49,66,0.06)",
        transform: hovered ? "translateY(-3px)" : "translateY(0)",
      }}
    >
      {/* Accent bar top */}
      <div
        className="absolute top-0 left-8 right-8 h-0.5 rounded-b-full"
        style={{ background: p.accentColor, opacity: hovered ? 1 : 0.4, transition: "opacity 0.3s" }}
      />
      <div>
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6 transition-transform duration-300"
          style={{
            background: p.palePrimary,
            color: p.accentColor,
            border: `1px solid ${p.accentColor}30`,
            transform: hovered ? "scale(1.1)" : "scale(1)",
          }}
        >
          {p.icon}
        </div>
        <span
          className="text-[11px] font-bold uppercase tracking-wider"
          style={{ color: p.accentColor }}
        >
          Path {p.num}
        </span>
        <h3 className="text-lg font-bold mt-1 mb-3" style={{ color: "#2D3142" }}>
          {p.title}
        </h3>
        <p className="text-xs sm:text-sm leading-relaxed mb-4" style={{ color: "#6B7280" }}>
          {p.desc}
        </p>
        <div
          className="p-3 rounded-xl flex items-center gap-2 text-xs"
          style={{
            background: p.palePrimary,
            color: p.accentColor,
            border: `1px solid ${p.accentColor}20`,
          }}
        >
          {p.badgeIcon}
          <span className="font-medium">{p.badge}</span>
        </div>
      </div>
      <div
        className="mt-6 pt-4 flex items-center justify-between text-xs font-bold transition-colors"
        style={{
          borderTop: `1px solid ${p.accentColor}15`,
          color: p.accentColor,
        }}
      >
        <span>{p.cta}</span>
        <ArrowRight
          className="w-4 h-4 transition-transform duration-200"
          style={{ transform: hovered ? "translateX(4px)" : "translateX(0)" }}
        />
      </div>
    </div>
  );
}
