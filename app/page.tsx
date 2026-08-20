"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";

import {
  Scale,
  FileText,
  Shield,
  ArrowRight,
  ChevronRight,
  Landmark,
  Gavel,
  HardDrive,
  FileCheck,
  AlertTriangle,
  XCircle,
  Copy,
  Check,
  BookOpen,
  Bot,
  Clock,
  ShieldCheck,
  Terminal,
  Activity,
  X,
  Printer,
  Download,
  CheckCircle2,
} from "lucide-react";

interface ConsolePreset {
  id: string;
  tag: string;
  category: string;
  citizenInput: string;
  authority: string;
  targetAct: string;
  sectionClause: string;
  statutoryClock: string;
  penaltyLiability: string;
  successOdds: number;
  rejectionReason: string;
  legalDraftSnippet: string[];
}

const CONSOLE_PRESETS: ConsolePreset[] = [
  {
    id: "road",
    tag: "PWD Road Repair Delay",
    category: "Public Works / Municipal PWD",
    citizenInput:
      "Ward 12 road carpeting delayed 7 months despite budget sanction and tender award.",
    authority:
      "Public Information Officer, PWD Executive Division / Municipal Corporation",
    targetAct: "Right to Information Act, 2005",
    sectionClause:
      "Sec. 6(1) read with Sec. 2(j)(i) [Certified Physical Inspection]",
    statutoryClock: "30 Calendar Days (Sec. 7(1))",
    penaltyLiability:
      "₹250/day up to ₹25,000 personal fine on CPIO under Sec. 20(1)",
    successOdds: 96,
    rejectionReason:
      "Avoid asking 'Why'. Demanding certified copies of the Measurement Book (MB) and delay penalty ledger eliminates Section 2(f) rejection.",
    legalDraftSnippet: [
      "1. Certified copy of the sanctioned work order, tender agreement, and execution milestone schedule for Ward 12 road carpeting.",
      "2. Certified copy of the Measurement Book (MB) entries and bituminous test logs submitted by inspecting engineers.",
      "3. Details of total funds disbursed to contractor till date and certified copies of delay penalty notices issued under contract terms.",
    ],
  },
  {
    id: "epfo",
    tag: "EPFO Pension Claim Hold",
    category: "Social Security / EPFO",
    citizenInput:
      "Pension EPS-95 claim rejected without issuing any formal deficiency memo or reason.",
    authority:
      "Central Public Information Officer, Regional EPFO Commissioner",
    targetAct: "Right to Information Act, 2005 (Social Security)",
    sectionClause: "Sec. 6(1) [File Movement & Deficiency Audit]",
    statutoryClock: "30 Calendar Days (Sec. 7(1))",
    penaltyLiability: "Disciplinary recommendation under Sec. 20(2)",
    successOdds: 94,
    rejectionReason:
      "Raw complaints get lost. Demanding the daily file movement sheet and Accounts Officer file notes forces immediate administrative review.",
    legalDraftSnippet: [
      "1. Daily file movement sheet from the date of submission of Pension Claim ID #PPO-884912 to the present date.",
      "2. Certified extract of the deficiency memo or objections recorded in file by the dealing Accounts Officer.",
      "3. Name and designation of the dealing official holding the file beyond the 20-day citizen charter limit.",
    ],
  },
  {
    id: "consumer",
    tag: "E-Commerce Refund Refusal",
    category: "Consumer Disputes / E-Commerce",
    citizenInput:
      "E-commerce platform delivered a defective electronic item and denied refund within return window.",
    authority:
      "District Consumer Disputes Redressal Commission / National Consumer Helpline",
    targetAct: "Consumer Protection Act, 2019",
    sectionClause:
      "Sec. 2(47) [Unfair Trade Practice] & Sec. 35 [Statutory Notice]",
    statutoryClock: "21 Days Statutory Notice for Deficiency of Service",
    penaltyLiability:
      "Replacement, refund with 18% interest & litigation damages under Sec. 39",
    successOdds: 98,
    rejectionReason:
      "Customer care chats are easily ignored. A structured statutory notice under CPA 2019 triggers the legal compliance cell.",
    legalDraftSnippet: [
      "1. Formal statutory notice for deficiency of service and unfair trade practice under CPA 2019.",
      "2. Claim for 100% refund of transaction amount with 18% p.a. statutory interest.",
      "3. Claim for damages for harassment and litigation expenses.",
    ],
  },
  {
    id: "ration",
    tag: "Fair Price Shop PDS Denial",
    category: "Food & Civil Supplies / PDS",
    citizenInput:
      "Fair price shop owner refusing to disburse monthly subsidized grain quota to BPL cardholders.",
    authority:
      "District Food & Civil Supplies Officer / Vigilance Cell",
    targetAct: "National Food Security Act, 2013 & RTI Act, 2005",
    sectionClause:
      "Sec. 6(1) read with Sec. 4(1)(b) Proactive PDS Disclosure",
    statutoryClock:
      "48 Hours (Life & Liberty Clause, Sec. 7(1) proviso)",
    penaltyLiability:
      "Suspension of Fair Price Shop license and criminal liability under Essential Commodities Act",
    successOdds: 97,
    rejectionReason:
      "Demanding e-POS transaction logs and monthly allotment registers leaves no room for local diversion.",
    legalDraftSnippet: [
      "1. Certified copy of monthly grain quota allocation and distribution register for Fair Price Shop #418.",
      "2. Electronic POS machine transaction logs and biometric verification receipts for current cycle.",
      "3. Inspection logs of the Food and Civil Supplies Inspector for the preceding three months.",
    ],
  },
];

export default function Home() {
  const [selectedPresetId, setSelectedPresetId] = useState<string>("road");
  const [inputText, setInputText] = useState<string>(
    CONSOLE_PRESETS[0].citizenInput
  );
  const [copied, setCopied] = useState<boolean>(false);
  const [modalOpen, setModalOpen] = useState<boolean>(false);

  const preset =
    CONSOLE_PRESETS.find((p) => p.id === selectedPresetId) ||
    CONSOLE_PRESETS[0];

  const handleSelectPreset = (p: ConsolePreset) => {
    setSelectedPresetId(p.id);
    setInputText(p.citizenInput);
  };

  const getFullPetitionText = () => {
    return `APPLICATION UNDER SECTION 6(1) OF THE RIGHT TO INFORMATION ACT, 2005

To:
${preset.authority}

1. Full Name of the Applicant: [Citizen Name]
2. Address for Correspondence: [Citizen Residential Address]
3. Citizenship: Indian Citizen

4. PARTICULARS OF INFORMATION SOUGHT:
Subject Matter: ${preset.tag}
Statutory Reference: ${preset.sectionClause}

PRAYER POINTS:
${preset.legalDraftSnippet.join("\n")}

5. STATUTORY TIME LIMIT:
As per Section 7(1) of the RTI Act, 2005, the requested information must be furnished within ${preset.statutoryClock}.

6. STATUTORY PENALTY CLAUSE:
Take notice that deliberate delay, mala fide denial, or misleading information attracts personal penal proceedings under Section 20(1) (₹250/day up to ₹25,000) and recommendation for disciplinary proceedings under Section 20(2) of the RTI Act, 2005.

7. APPLICATION FEE:
RTI application fee of ₹10/- attached via Postal Order / Court Fee Stamp / Online Portal Reference.

Date: ${new Date().toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })}
Place: India

__________________________
[Signature of Applicant]`;
  };

  const handleCopyDraft = () => {
    navigator.clipboard.writeText(getFullPetitionText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-slate-900 font-sans selection:bg-[#881337] selection:text-white relative">
      {/* ─────────────────────────────────────────────────────────────── */}
      {/* BACKGROUND ASHOKA CHAKRA */}
      {/* ─────────────────────────────────────────────────────────────── */}

      <div className="fixed inset-0 pointer-events-none z-0 flex items-center justify-center overflow-hidden">
        <svg
          className="w-[950px] h-[950px] opacity-[0.022] text-[#881337] select-none -translate-y-12"
          viewBox="0 0 200 200"
          fill="none"
          stroke="currentColor"
        >
          <circle cx="100" cy="100" r="95" strokeWidth="2.5" />
          <circle cx="100" cy="100" r="82" strokeWidth="1.5" />
          <circle cx="100" cy="100" r="20" strokeWidth="2.5" />
          <circle cx="100" cy="100" r="6" fill="currentColor" />

          {Array.from({ length: 24 }).map((_, i) => {
            const angle = (i * 360) / 24;

            return (
              <line
                key={i}
                x1="100"
                y1="100"
                x2="100"
                y2="18"
                strokeWidth="1.5"
                transform={`rotate(${angle} 100 100)`}
              />
            );
          })}
        </svg>
      </div>

      {/* ─────────────────────────────────────────────────────────────── */}
      {/* GLOBAL STYLES */}
      {/* ─────────────────────────────────────────────────────────────── */}

      <style jsx global>{`
        @keyframes jn-chakra-spin {
          from {
            transform: rotate(0deg);
          }

          to {
            transform: rotate(360deg);
          }
        }

        .jn-seal-ring {
          animation: jn-chakra-spin 22s linear infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .jn-seal-ring {
            animation: none;
          }
        }

        .jn-nav-link {
          position: relative;
        }

        .jn-nav-link::after {
          content: "";
          position: absolute;
          left: 0;
          right: 0;
          bottom: -4px;
          height: 1.5px;
          background: #881337;
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.2s ease;
        }

        .jn-nav-link:hover::after {
          transform: scaleX(1);
        }
      `}</style>

      {/* ─────────────────────────────────────────────────────────────── */}
      {/* NAVBAR */}
      {/* ─────────────────────────────────────────────────────────────── */}

      <header className="fixed top-5 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-4xl">
        <nav className="glass-panel rounded-2xl px-6 sm:px-8 py-3 flex items-center justify-between transition-all border border-slate-300 shadow-xs relative">

          {/* Logo */}
          <a href="#" className="flex items-center gap-3 group">
            <Image
              src="/janadhikar-logo-v2.png"
              alt="Jan Adhikar"
              width={120}
              height={36}
              className="object-contain"
              priority
            />
          </a>

          {/* Navigation */}
          <div className="hidden md:flex items-center gap-7 text-xs font-semibold text-slate-700">

            <a
              href="#transmuter-console"
              className="jn-nav-link hover:text-slate-900 transition-colors"
            >
              Analyze Problem
            </a>

            <a
              href="#comparison"
              className="jn-nav-link hover:text-slate-900 transition-colors"
            >
              How It Works
            </a>

            <a
              href="#the-law"
              className="jn-nav-link hover:text-slate-900 transition-colors"
            >
              Legal Framework
            </a>

          </div>

          {/* CTA */}
          <Link
            href="/dashboard"
            className="btn-maroon-solid inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold tracking-tight shadow-xs cursor-pointer"
          >
            <Gavel className="w-3.5 h-3.5 text-amber-200" />

            <span>Start a Case</span>

            <ChevronRight className="w-3.5 h-3.5 text-slate-200" />
          </Link>

          <div className="absolute left-6 right-6 -bottom-2 flex flex-col gap-[3px] pointer-events-none">
            <div className="h-[1.5px] bg-[#881337]/25 rounded-full" />
            <div className="h-px bg-slate-300/60 rounded-full" />
          </div>

        </nav>
      </header>

      {/* ─────────────────────────────────────────────────────────────── */}
      {/* MAIN */}
      {/* ─────────────────────────────────────────────────────────────── */}

      <main className="relative z-10 pt-28 sm:pt-36">
        {/* ─────────────────────────────────────────────────────────────── */}
        {/* HERO */}
        {/* ─────────────────────────────────────────────────────────────── */}

        <section className="relative px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto min-h-[calc(100vh-10rem)] flex items-center justify-center">
          <div className="hidden xl:block absolute right-4 2xl:right-12 top-1/2 -translate-y-1/2 pointer-events-none select-none z-20">
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "radial-gradient(ellipse 50% 50% at 50% 50%, rgba(180,118,42,0.18) 0%, transparent 80%)",
                filter: "blur(25px)",
              }}
            />

            <img
              src="/lady justice.png"
              alt="Indian Lady of Justice"
              className="h-[460px] 2xl:h-[520px] w-auto object-contain opacity-95 transition-transform duration-500 hover:scale-[1.02]"
              style={{
                filter:
                  "drop-shadow(0 12px 24px rgba(140,90,20,0.22))",
              }}
            />
          </div>

          <div className="relative z-10 w-full max-w-4xl mx-auto text-center flex flex-col items-center">
            <h1 className="text-5xl sm:text-6xl xl:text-7xl font-extrabold tracking-tight text-slate-900 leading-[1.08] max-w-3xl">
              Claim Your Civic Rights.{" "}
              <span className="relative inline-block text-[#881337]">
                Zero Bureaucracy.

                <svg
                  className="absolute -bottom-2 left-0 w-full h-[16px] sm:h-[20px] pointer-events-none overflow-visible"
                  viewBox="0 0 320 22"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M 3,13 C 65,5 145,16 220,9 C 265,5 295,14 317,8"
                    stroke="#C2410C"
                    strokeWidth="3.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  <path
                    d="M 14,18 C 85,14 185,20 295,14"
                    stroke="#9A3412"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity="0.85"
                  />
                </svg>
              </span>
            </h1>

            <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-2xl leading-relaxed">
              An autonomous, local-first legal engine that helps turn everyday
              civic problems into structured RTI applications, grievance
              routes, and statutory appeals. No legal jargon required.
            </p>

            <div className="mt-8 flex justify-center">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-3 px-8 py-4 rounded-xl btn-maroon-solid font-bold text-base tracking-tight shadow-md group cursor-pointer"
              >
                <Gavel className="w-5 h-5 text-amber-200 shrink-0" />

                <span>Launch Legal AI Copilot</span>

                <ChevronRight className="w-5 h-5 text-slate-200 group-hover:translate-x-0.5 transition-transform shrink-0" />
              </Link>
            </div>

            <div className="mt-8 w-full flex items-center justify-center gap-2.5 flex-nowrap overflow-x-auto pb-2 scrollbar-none">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white border border-slate-200 rounded-full text-xs font-semibold text-slate-700 shadow-2xs whitespace-nowrap shrink-0">
                <Landmark className="w-3.5 h-3.5 text-[#881337] shrink-0" />
                48+ Ministries
              </span>

              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white border border-slate-200 rounded-full text-xs font-semibold text-slate-700 shadow-2xs whitespace-nowrap shrink-0">
                <BookOpen className="w-3.5 h-3.5 text-[#065F46] shrink-0" />
                45,000+ CIC Precedents
              </span>

              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white border border-slate-200 rounded-full text-xs font-semibold text-slate-700 shadow-2xs whitespace-nowrap shrink-0">
                <Clock className="w-3.5 h-3.5 text-[#C2410C] shrink-0" />
                30-Day Mandate
              </span>

              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white border border-slate-200 rounded-full text-xs font-semibold text-slate-700 shadow-2xs whitespace-nowrap shrink-0">
                <HardDrive className="w-3.5 h-3.5 text-slate-700 shrink-0" />
                100% Local-First
              </span>
            </div>
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────────── */}
        {/* CIVIC ACCESS GAP */}
        {/* ─────────────────────────────────────────────────────────────── */}

        <section
          id="transmuter-console"
          className="py-16 sm:py-24 bg-white border-y border-slate-300 scroll-mt-24"
        >
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mb-12 text-left">
              <span className="text-xs font-bold uppercase tracking-widest text-[#881337] bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
                The Civic Access Gap
              </span>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 mt-4 leading-tight">
                Millions can file a complaint.
                <br />
                <span className="text-[#881337]">
                  Far fewer know what to file.
                </span>
              </h2>

              <p className="mt-4 text-slate-600 text-sm sm:text-base leading-relaxed max-w-2xl">
                RTI and grievance systems give citizens a legal route — but the
                difficult part is understanding the route. What information
                can be demanded? Which authority is responsible? Which law
                applies? And what happens when a right has actually been
                violated?
              </p>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
              <div className="bg-[#FAF8F5] border border-slate-300 rounded-2xl p-5 shadow-2xs">
                <div className="flex items-start justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">
                    RTI Requests
                  </span>

                  <FileText className="w-4 h-4 text-[#881337]" />
                </div>

                <div className="mt-3 text-3xl font-extrabold text-slate-900">
                  1.75M+
                </div>

                <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                  RTI requests received by public authorities in 2023–24.
                </p>

                <div className="mt-3 pt-3 border-t border-slate-200 text-[10px] font-mono text-slate-400">
                  CIC Annual Report · 2023–24
                </div>
              </div>

              <div className="bg-[#FAF8F5] border border-slate-300 rounded-2xl p-5 shadow-2xs">
                <div className="flex items-start justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">
                    RTI Rejections
                  </span>

                  <XCircle className="w-4 h-4 text-red-500" />
                </div>

                <div className="mt-3 text-3xl font-extrabold text-slate-900">
                  67,615
                </div>

                <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                  RTI requests rejected during the same reporting year.
                </p>

                <div className="mt-3 pt-3 border-t border-slate-200 text-[10px] font-mono text-slate-400">
                  CIC Annual Report · 2023–24
                </div>
              </div>

              <div className="bg-[#FAF8F5] border border-slate-300 rounded-2xl p-5 shadow-2xs">
                <div className="flex items-start justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">
                    The Real Problem
                  </span>

                  <Scale className="w-4 h-4 text-[#065F46]" />
                </div>

                <div className="mt-3 text-3xl font-extrabold text-slate-900">
                  4 questions
                </div>

                <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                  What happened? Who is responsible? Which law applies? What
                  can I demand?
                </p>

                <div className="mt-3 pt-3 border-t border-slate-200 text-[10px] font-mono text-slate-400">
                  The civic access gap
                </div>
              </div>
            </div>

            {/* Legal problem categories */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-12">
              {[
                {
                  icon: Shield,
                  title: "Right denied",
                  text: "A public authority may have failed a statutory obligation.",
                },
                {
                  icon: FileText,
                  title: "Information withheld",
                  text: "Records may exist but the citizen doesn't know what to request.",
                },
                {
                  icon: Landmark,
                  title: "Wrong authority",
                  text: "The complaint or RTI may be directed to the wrong public body.",
                },
                {
                  icon: Scale,
                  title: "Wrong legal route",
                  text: "An issue may require RTI, grievance redressal, appeal, or another remedy.",
                },
              ].map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.title}
                    className="bg-[#FAF8F5] border border-slate-300 rounded-xl p-4"
                  >
                    <Icon className="w-4 h-4 text-[#881337] mb-3" />

                    <h3 className="text-xs font-bold text-slate-900">
                      {item.title}
                    </h3>

                    <p className="mt-1.5 text-[11px] leading-relaxed text-slate-500">
                      {item.text}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Analysis heading */}
            <div className="mb-5">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
                From grievance → legal understanding
              </span>

              <p className="text-sm text-slate-600 max-w-2xl">
                Describe what happened in your own words. Jan Adhikar
                identifies the likely authority, relevant legal framework,
                information that can be requested, and the appropriate next
                step.
              </p>
            </div>

            {/* Interactive console */}
            <div className="mb-6">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
                Try a civic problem
              </span>

              <div className="flex flex-wrap gap-2">
                {CONSOLE_PRESETS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => handleSelectPreset(p)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${selectedPresetId === p.id
                        ? "bg-[#881337] text-white border-[#881337] shadow-sm"
                        : "bg-[#FAF8F5] hover:bg-slate-100 text-slate-700 border-slate-300"
                      }`}
                  >
                    {p.tag}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              {/* Input */}
              <div className="lg:col-span-5 bg-[#FAF8F5] border border-slate-300 rounded-2xl p-5 sm:p-6 flex flex-col justify-between shadow-2xs">
                <div>
                  <div className="flex items-center justify-between mb-3 text-xs font-bold text-slate-800">
                    <span className="flex items-center gap-1.5">
                      <Terminal className="w-4 h-4 text-[#881337]" />
                      <span>What happened?</span>
                    </span>

                    <span className="text-[10px] font-mono text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-300">
                      Your own words
                    </span>
                  </div>

                  <textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    rows={5}
                    className="w-full bg-white border border-slate-300 rounded-xl p-3.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-[#881337] focus:ring-1 focus:ring-[#881337] transition-all font-sans leading-relaxed resize-none shadow-2xs"
                    placeholder="Describe your issue in plain everyday words..."
                  />

                  <div className="mt-4 p-3.5 bg-white rounded-xl border border-slate-300 text-xs text-slate-700 space-y-1.5 shadow-2xs">
                    <div className="font-bold text-slate-900 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-[#065F46]" />
                      <span>Potential legal issue</span>
                    </div>

                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      {preset.rejectionReason}
                    </p>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-300 flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-500">
                    Likely authority:
                  </span>

                  <span className="text-[#065F46] font-mono font-bold text-right">
                    {preset.category}
                  </span>
                </div>
              </div>

              {/* Analysis */}
              <div className="lg:col-span-7 bg-[#0F172A] text-slate-100 rounded-2xl p-5 sm:p-6 flex flex-col justify-between shadow-md border border-slate-800">
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-700 pb-3 mb-4 text-xs">
                    <div className="flex items-center gap-1.5 text-emerald-400 font-mono font-bold">
                      <FileCheck className="w-4 h-4" />

                      <span>LEGAL ANALYSIS</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="bg-emerald-950 text-emerald-300 px-2.5 py-0.5 rounded border border-emerald-700 font-mono text-[11px] font-bold">
                        {preset.successOdds}% Confidence
                      </span>

                      <span className="bg-slate-800 text-slate-300 px-2.5 py-0.5 rounded border border-slate-700 font-mono text-[11px]">
                        ⏱️ {preset.statutoryClock}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2.5 font-mono text-xs text-slate-200">
                    <p className="text-slate-400 text-[11px]">
                      <strong className="text-slate-300">
                        Relevant authority:
                      </strong>{" "}
                      {preset.authority}
                    </p>

                    <p className="text-slate-400 text-[11px]">
                      <strong className="text-slate-300">
                        Legal framework:
                      </strong>{" "}
                      {preset.targetAct}
                    </p>

                    <p className="font-bold text-amber-300 pt-1">
                      What the system identifies:
                    </p>

                    <div className="space-y-1.5 pl-2 border-l-2 border-emerald-500/60 my-2">
                      {preset.legalDraftSnippet.map((point, idx) => (
                        <p key={idx} className="leading-relaxed">
                          {point}
                        </p>
                      ))}
                    </div>

                    <p className="text-[11px] text-red-300 pt-2 border-t border-slate-800 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0" />

                      <span>
                        <strong>Potential statutory consequence:</strong>{" "}
                        {preset.penaltyLiability}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <button
                    onClick={handleCopyDraft}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    {copied ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}

                    <span>
                      {copied ? "Copied Application" : "Copy Formatted Draft"}
                    </span>
                  </button>

                  <button
                    onClick={() => setModalOpen(true)}
                    className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-[#881337] hover:bg-[#701A75] text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <span>View &amp; Generate Full Application</span>

                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────────── */}
        {/* COMPARISON */}
        {/* ─────────────────────────────────────────────────────────────── */}

        <section
          id="comparison"
          className="py-20 bg-[#FAF8F5] border-b border-slate-300 scroll-mt-24"
        >
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mb-12 text-left">
              <span className="text-xs font-bold uppercase tracking-widest text-[#881337] bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
                Architectural Distinction
              </span>

              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 mt-3">
                General LLMs vs. Dedicated Legal Engine
              </h2>

              <p className="mt-2 text-slate-600 text-sm sm:text-base leading-relaxed">
                Generic AI chatbots generate natural-language responses. Jan
                Adhikar is designed around statutory rules, authority mapping,
                document structure, and legal workflow.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
              {/* Generic AI */}
              <div className="bg-white border border-slate-300 rounded-2xl p-6 sm:p-8 flex flex-col justify-between shadow-2xs">
                <div>
                  <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-6">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600">
                        <Bot className="w-4 h-4" />
                      </div>

                      <h3 className="font-bold text-base text-slate-900">
                        Standard AI Chatbots
                      </h3>
                    </div>

                    <span className="text-[10px] font-mono bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded font-bold">
                      Probabilistic
                    </span>
                  </div>

                  <ul className="space-y-4 text-xs text-slate-600">
                    <li className="flex items-start gap-2.5">
                      <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />

                      <span>
                        <strong>Asks "Why" or "How":</strong> May generate
                        subjective questions that don't correspond to
                        information actually held by an authority.
                      </span>
                    </li>

                    <li className="flex items-start gap-2.5">
                      <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />

                      <span>
                        <strong>Vague Authorities:</strong> Can direct letters
                        to generic departments without identifying the
                        appropriate authority.
                      </span>
                    </li>

                    <li className="flex items-start gap-2.5">
                      <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />

                      <span>
                        <strong>Missing Workflow:</strong> Often stops at
                        generating text rather than guiding the citizen through
                        the next statutory step.
                      </span>
                    </li>

                    <li className="flex items-start gap-2.5">
                      <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />

                      <span>
                        <strong>Legal Uncertainty:</strong> Responses require
                        verification against the actual statute and applicable
                        authority.
                      </span>
                    </li>
                  </ul>
                </div>

                <div className="mt-8 pt-4 border-t border-slate-200 text-[11px] font-mono text-slate-500 text-center">
                  Result: General-purpose assistance
                </div>
              </div>

              {/* Jan Adhikar */}
              <div className="bg-[#0F172A] text-slate-100 border border-slate-800 rounded-2xl p-6 sm:p-8 flex flex-col justify-between shadow-md relative overflow-hidden">
                <div>
                  <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
                    <div className="flex items-center gap-2.5">
                      <Image
                        src="/janadhikar-logo-v2.png"
                        alt="Jan Adhikar"
                        width={110}
                        height={32}
                        className="object-contain brightness-0 invert"
                      />
                    </div>

                    <span className="text-[10px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-700 px-2 py-0.5 rounded font-bold">
                      Structured
                    </span>
                  </div>

                  <ul className="space-y-4 text-xs text-slate-300">
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />

                      <span>
                        <strong>Grievance Extraction:</strong> Converts
                        everyday descriptions into structured legal facts and
                        possible causes of action.
                      </span>
                    </li>

                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />

                      <span>
                        <strong>Authority Mapping:</strong> Identifies the
                        likely public authority responsible for the matter.
                      </span>
                    </li>

                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />

                      <span>
                        <strong>Legal Route:</strong> Helps distinguish
                        information requests, grievances, appeals, and other
                        available routes.
                      </span>
                    </li>

                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />

                      <span>
                        <strong>Structured Drafting:</strong> Produces
                        documents around identified facts, authorities,
                        statutory provisions, and procedural requirements.
                      </span>
                    </li>
                  </ul>
                </div>

                <div className="mt-8 pt-4 border-t border-slate-800 text-[11px] font-mono text-emerald-400 text-center font-bold">
                  Result: Guided civic action
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────────── */}
        {/* PDF / WORKFLOW */}
        {/* ─────────────────────────────────────────────────────────────── */}

        <section className="py-20 bg-white border-b border-slate-300">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mb-12 text-left">
              <span className="text-xs font-bold uppercase tracking-widest text-[#065F46] bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                Automated Export Pipeline
              </span>

              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 mt-3">
                From Legal Understanding to Action
              </h2>

              <p className="mt-2 text-slate-600 text-sm sm:text-base leading-relaxed">
                Once the relevant route is identified, the system structures
                the information into a clear, usable statutory document.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
              <div className="lg:col-span-7 bg-[#FAF8F5] border border-slate-300 rounded-2xl p-6 sm:p-8 shadow-md relative flex flex-col justify-between">
                <div>
                  <div className="border-b-2 border-slate-900 pb-4 mb-5 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-[#881337] tracking-widest uppercase block">
                        Government of India · RTI Act 2005
                      </span>

                      <h3 className="text-lg font-extrabold text-slate-900 font-mono uppercase">
                        Form 'A' Statutory RTI Petition
                      </h3>
                    </div>

                    <div className="text-right font-mono text-[11px] text-slate-500">
                      <div>Ref: RTI/2026/08/941</div>

                      <div className="text-emerald-700 font-bold">
                        STATUS: VALIDATED
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 font-mono text-xs text-slate-800 leading-relaxed">
                    <div>
                      <span className="text-slate-400 font-bold">
                        TO PUBLIC INFORMATION OFFICER:
                      </span>

                      <p className="font-semibold text-slate-900">
                        {preset.authority}
                      </p>
                    </div>

                    <div className="p-3 bg-white rounded-lg border border-slate-200">
                      <span className="text-slate-400 text-[11px] font-bold block mb-1">
                        SUBJECT / PRAYER CLAUSES UNDER SEC. 6(1):
                      </span>

                      <ul className="space-y-1 text-[11px]">
                        {preset.legalDraftSnippet.map((line, idx) => (
                          <li key={idx}>{line}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-3.5 bg-rose-50/70 border border-rose-200 rounded-xl text-[11px] space-y-1">
                      <div className="font-bold text-[#881337] flex items-center gap-1.5">
                        <Shield className="w-3.5 h-3.5" />

                        <span>STATUTORY OBLIGATION &amp; PENAL NOTICE:</span>
                      </div>

                      <p className="text-slate-700 leading-tight">
                        Under Section 7(1), reply is mandated within{" "}
                        <strong>30 days</strong>. Failure or deliberate refusal
                        attracts personal fine on CPIO under Section 20(1) at{" "}
                        <strong>₹250/day up to ₹25,000</strong>.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-200 flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-500 text-[11px]">
                    Format: PDF / A-4 Ready
                  </span>

                  <button
                    onClick={() => setModalOpen(true)}
                    className="inline-flex items-center gap-1.5 text-[#881337] font-bold hover:underline cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />

                    <span>Download Full RTI PDF</span>
                  </button>
                </div>
              </div>

              <div className="lg:col-span-5 bg-[#0F172A] text-white rounded-2xl p-6 sm:p-8 flex flex-col justify-between shadow-md border border-slate-800">
                <div>
                  <h3 className="text-base font-bold text-amber-200 mb-1 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-emerald-400" />

                    <span>Legal Workflow</span>
                  </h3>

                  <p className="text-xs text-slate-400 mb-6">
                    Structured checks before a petition is generated.
                  </p>

                  <div className="space-y-4">
                    {[
                      [
                        "Cause of Action Extracted",
                        "Parsed the civic grievance into actionable legal facts.",
                      ],
                      [
                        "Information Request Structured",
                        "Converted the issue into records and information that can be requested.",
                      ],
                      [
                        "Authority Identified",
                        "Mapped the issue to the relevant public authority.",
                      ],
                      [
                        "Document Generated",
                        "Structured the identified route into a usable statutory draft.",
                      ],
                    ].map(([title, description]) => (
                      <div
                        key={title}
                        className="flex items-start gap-3"
                      >
                        <div className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center shrink-0 mt-0.5">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </div>

                        <div>
                          <span className="text-xs font-bold text-slate-200 block">
                            {title}
                          </span>

                          <p className="text-[11px] text-slate-400 leading-snug">
                            {description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-8 pt-4 border-t border-slate-800 text-[11px] font-mono text-emerald-400">
                  ✓ Ready for citizen review
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────────── */}
        {/* LEGAL FOUNDATION */}
        {/* ─────────────────────────────────────────────────────────────── */}

        <section
          id="the-law"
          className="py-20 sm:py-28 bg-[#FAF8F5]"
        >
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mb-14 text-left">
              <span className="text-xs font-bold uppercase tracking-widest text-[#065F46] bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                Statutory Jurisdiction
              </span>

              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 mt-3">
                The Legal Basis of the Platform
              </h2>

              <p className="mt-3 text-slate-600 text-base leading-relaxed">
                The platform is built around Indian administrative,
                transparency, grievance redressal, and consumer-protection
                frameworks.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white border border-slate-300 rounded-2xl p-6 sm:p-8 flex flex-col justify-between shadow-2xs">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-[#881337] text-white flex items-center justify-center mb-5">
                    <Landmark className="w-5 h-5 text-amber-200" />
                  </div>

                  <h3 className="text-lg font-bold tracking-tight text-slate-900 mb-2.5">
                    The Right to Information Act, 2005
                  </h3>

                  <p className="text-sm text-slate-600 leading-relaxed">
                    The system maps civic information problems to relevant RTI
                    provisions and structures requests around records held by
                    public authorities.
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-200 text-xs font-mono text-slate-500">
                  Ref: RTI Act, 2005 Sec. 6(1)
                </div>
              </div>

              <div className="bg-white border border-slate-300 rounded-2xl p-6 sm:p-8 flex flex-col justify-between shadow-2xs">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-[#0F172A] text-white flex items-center justify-center mb-5">
                    <Gavel className="w-5 h-5 text-emerald-400" />
                  </div>

                  <h3 className="text-lg font-bold tracking-tight text-slate-900 mb-2.5">
                    Statutory Appeals
                  </h3>

                  <p className="text-sm text-slate-600 leading-relaxed">
                    Where an RTI request is denied or improperly handled, the
                    platform can structure the relevant appeal pathway and
                    supporting grounds.
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-200 text-xs font-mono text-slate-500">
                  Ref: RTI Act, 2005 Sec. 19 &amp; 20
                </div>
              </div>

              <div className="bg-white border border-slate-300 rounded-2xl p-6 sm:p-8 flex flex-col justify-between shadow-2xs">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-[#065F46] text-white flex items-center justify-center mb-5">
                    <FileCheck className="w-5 h-5 text-white" />
                  </div>

                  <h3 className="text-lg font-bold tracking-tight text-slate-900 mb-2.5">
                    Grievance Redressal
                  </h3>

                  <p className="text-sm text-slate-600 leading-relaxed">
                    Civic issues can involve different authorities and legal
                    routes. The platform is designed to help identify the
                    appropriate route before drafting action.
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-200 text-xs font-mono text-slate-500">
                  Ref: DARPG CPGRAMS &amp; CPA 2019
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ─────────────────────────────────────────────────────────────── */}
      {/* MODAL */}
      {/* ─────────────────────────────────────────────────────────────── */}

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-300 animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-[#FAF8F5] rounded-t-2xl">
              <div className="flex items-center gap-2">
                <Gavel className="w-5 h-5 text-[#881337]" />

                <h3 className="font-bold text-base text-slate-900">
                  Certified RTI Statutory Petition Preview
                </h3>
              </div>

              <button
                onClick={() => setModalOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-200 flex items-center justify-center text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto font-mono text-xs text-slate-800 leading-relaxed space-y-4 bg-white">
              <div className="text-center font-bold text-sm text-[#881337] border-b pb-2 border-slate-200">
                FORM 'A' - APPLICATION UNDER SECTION 6(1) OF THE RTI ACT, 2005
              </div>

              <div>
                <p>
                  <strong>TO:</strong>
                </p>

                <p className="pl-4">{preset.authority}</p>
              </div>

              <div className="space-y-1">
                <p>
                  <strong>1. Full Name of Applicant:</strong> [Citizen Name]
                </p>

                <p>
                  <strong>2. Address:</strong> [Citizen Residential Address /
                  Ward Zone]
                </p>

                <p>
                  <strong>3. Citizen Status:</strong> Citizen of India (Art.
                  19(1)(a))
                </p>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-slate-200">
                <p className="font-bold text-slate-900">
                  4. PARTICULARS OF INFORMATION SOUGHT:
                </p>

                <p className="text-slate-600">
                  <em>Subject Matter: {preset.tag}</em>
                </p>

                <div className="pl-4 space-y-2 text-slate-800">
                  {preset.legalDraftSnippet.map((point, idx) => (
                    <p key={idx}>{point}</p>
                  ))}
                </div>
              </div>

              <div className="space-y-1 pt-2 border-t border-slate-200 text-[11px] text-slate-600">
                <p>
                  <strong>5. Statutory Time Limit:</strong> Mandated reply
                  within {preset.statutoryClock} under Section 7(1).
                </p>

                <p>
                  <strong>6. Statutory Penalty Notice:</strong> Deliberate
                  refusal or delay attracts penalty under Section 20(1)
                  (₹250/day up to ₹25,000) on the Public Information Officer.
                </p>

                <p>
                  <strong>7. RTI Fee:</strong> ₹10/- prescribed fee remitted
                  via Postal Order / Court Fee Stamp.
                </p>
              </div>

              <div className="pt-4 flex justify-between text-slate-500 text-[11px]">
                <p>Date: {new Date().toLocaleDateString("en-IN")}</p>

                <p>Signature of Applicant</p>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-200 bg-[#FAF8F5] rounded-b-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-xs text-slate-500 font-medium">
                ✓ Ready to print and dispatch
              </span>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={handleCopyDraft}
                  className="flex-1 sm:flex-none px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {copied ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}

                  <span>{copied ? "Copied" : "Copy All"}</span>
                </button>

                <button
                  onClick={handlePrint}
                  className="flex-1 sm:flex-none px-4 py-2 rounded-lg btn-maroon-solid text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />

                  <span>Print Form</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────── */}
      {/* FOOTER */}
      {/* ─────────────────────────────────────────────────────────────── */}

      <footer className="border-t border-slate-300 bg-[#0F172A] text-slate-300">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-14 grid grid-cols-1 md:grid-cols-12 gap-10">
            {/* Brand */}
            <div className="md:col-span-6">
              <Image
                src="/janadhikar-logo-v2.png"
                alt="Jan Adhikar"
                width={120}
                height={36}
                className="object-contain brightness-0 invert"
              />

              <p className="mt-5 max-w-md text-sm leading-relaxed text-slate-400">
                A civic technology platform designed to help citizens
                understand their rights, identify the appropriate legal route,
                and turn everyday grievances into structured action.
              </p>

              <div className="mt-6 inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-700 bg-slate-800/60">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />

                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                  Built for Indian citizens
                </span>
              </div>
            </div>

            {/* Navigation */}
            <div className="md:col-span-3">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                Platform
              </h4>

              <div className="mt-4 flex flex-col gap-3 text-sm">
                <a
                  href="#comparison"
                  className="hover:text-white transition-colors"
                >
                  Why Jan Adhikar
                </a>

                <a
                  href="#transmuter-console"
                  className="hover:text-white transition-colors"
                >
                  Legal Analysis
                </a>

                <a
                  href="#the-law"
                  className="hover:text-white transition-colors"
                >
                  Legal Foundation
                </a>
              </div>
            </div>

            {/* Built around */}
            <div className="md:col-span-3">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                Built Around
              </h4>

              <div className="mt-4 space-y-3 text-sm text-slate-400">
                <div className="flex items-center gap-2">
                  <Shield className="w-3.5 h-3.5 text-emerald-400" />
                  <span>RTI Act, 2005</span>
                </div>

                <div className="flex items-center gap-2">
                  <Gavel className="w-3.5 h-3.5 text-amber-300" />
                  <span>Statutory Appeals</span>
                </div>

                <div className="flex items-center gap-2">
                  <Landmark className="w-3.5 h-3.5 text-slate-400" />
                  <span>Public Grievance Systems</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom */}
          <div className="border-t border-slate-800 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="text-[10px] font-mono text-slate-500">
              JAN ADHIKAR · CIVIC TECHNOLOGY
            </span>

            <div className="flex items-center gap-4 text-[10px] font-mono text-slate-500">
              <span>OPEN SOURCE</span>

              <span className="text-slate-700">•</span>

              <span>INDIA</span>

              <span className="text-slate-700">•</span>

              <span>2026</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}