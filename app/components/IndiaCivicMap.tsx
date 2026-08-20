"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  MapPin,
  Building2,
  TrendingUp,
  Clock,
  ShieldCheck,
  Zap,
  ArrowRight,
  Sparkles,
  ExternalLink,
  Filter,
} from "lucide-react";
import ScrollAnimator from "./ScrollAnimator";

// ─── Data ────────────────────────────────────────────────────────────────────
interface PinData {
  id: string;
  city: string;
  state: string;
  authority: string;
  shortName: string;
  category: "RTI" | "Grievance" | "Consumer" | "Labor";
  // SVG coords for viewBox="0 0 520 620"
  svgX: number;
  svgY: number;
  disclosureRate: number;
  avgDays: number;
  activeCases: number;
  description: string;
  topTopics: string[];
  portalUrl: string;
  color: string;
}

const CIVIC_HUBS: PinData[] = [
  {
    id: "delhi",
    city: "New Delhi",
    state: "National Capital Region",
    authority: "Central Information Commission (CIC) & DoPT",
    shortName: "CIC / DoPT HQ",
    category: "RTI",
    svgX: 225, svgY: 155,
    disclosureRate: 91.4, avgDays: 24, activeCases: 14280,
    description: "Appellate authority for all Union Ministries, armed forces, public sector banks, and autonomous central institutions.",
    topTopics: ["Public Tender Records", "Civil Services Inquiries", "Highway Audit Logs"],
    portalUrl: "https://rtionline.gov.in",
    color: "#138808",
  },
  {
    id: "chandigarh",
    city: "Chandigarh",
    state: "Punjab & Haryana",
    authority: "Northern Highway Authority & PWD Oversight",
    shortName: "North PWD & NHAI",
    category: "RTI",
    svgX: 200, svgY: 118,
    disclosureRate: 90.1, avgDays: 22, activeCases: 3740,
    description: "State-highway cross-border toll transparency, agricultural procurement records, and rural road PMGSY funds.",
    topTopics: ["PMGSY Road Inspections", "Mandi Procurement Slips", "Canal Water Allocation Logs"],
    portalUrl: "https://rtionline.gov.in",
    color: "#1a237e",
  },
  {
    id: "mumbai",
    city: "Mumbai",
    state: "Maharashtra",
    authority: "RBI Banking Ombudsman & SEBI Enforcement",
    shortName: "RBI & SEBI West",
    category: "Grievance",
    svgX: 155, svgY: 328,
    disclosureRate: 88.7, avgDays: 18, activeCases: 8930,
    description: "Centralized redressing authority for unauthorized transactions, banking delays, and mutual fund fraud complaints.",
    topTopics: ["Uncredited Refunds", "UPI Chargeback Disputes", "Unauthorized Insurance Debits"],
    portalUrl: "https://pgportal.gov.in",
    color: "#FF6B00",
  },
  {
    id: "hyderabad",
    city: "Hyderabad",
    state: "Telangana",
    authority: "South Central Railway & CPGRAMS Zone",
    shortName: "SCR & Civic Cell",
    category: "Grievance",
    svgX: 240, svgY: 390,
    disclosureRate: 87.5, avgDays: 21, activeCases: 5410,
    description: "Public grievances regarding railway amenities, passenger compensation, and postal insurance delays.",
    topTopics: ["Train Cancellation Refunds", "Tatkal Billing Glitches", "Postal Parcel Tracking"],
    portalUrl: "https://pgportal.gov.in",
    color: "#FF6B00",
  },
  {
    id: "bengaluru",
    city: "Bengaluru",
    state: "Karnataka",
    authority: "Ministry of Electronics & IT (MeitY) & NCH Tech",
    shortName: "MeitY & Digital Cell",
    category: "Consumer",
    svgX: 215, svgY: 458,
    disclosureRate: 94.2, avgDays: 14, activeCases: 7650,
    description: "Nodal point for tech e-commerce disputes, telecom service defaults, and IT rule 3(2) grievance officers.",
    topTopics: ["E-Commerce Defect Claims", "Dark Pattern Subscriptions", "Data Privacy Takedowns"],
    portalUrl: "https://consumerhelpline.gov.in",
    color: "#B8860B",
  },
  {
    id: "chennai",
    city: "Chennai",
    state: "Tamil Nadu",
    authority: "NHAI Southern Zone & Port Trust Authority",
    shortName: "NHAI & Port Trust",
    category: "RTI",
    svgX: 252, svgY: 496,
    disclosureRate: 92.8, avgDays: 19, activeCases: 4890,
    description: "Toll plaza concessionaire agreements, highway safety audit reports, and municipal drainage fund status.",
    topTopics: ["FASTag Double Toll Overcharges", "Flyover Structural Audits", "Port Clearance Timelines"],
    portalUrl: "https://rtionline.gov.in",
    color: "#138808",
  },
  {
    id: "kolkata",
    city: "Kolkata",
    state: "West Bengal",
    authority: "National Green Tribunal (East) & Coal India PIO",
    shortName: "NGT East & Ministry of Coal",
    category: "RTI",
    svgX: 375, svgY: 278,
    disclosureRate: 86.9, avgDays: 28, activeCases: 6120,
    description: "Environmental compliance disclosures, river rejuvenation funds, and public sector employment recruitment data.",
    topTopics: ["Mining EIA Clearances", "Pollution Control Logs", "EPFO Pension Passbooks"],
    portalUrl: "https://rtionline.gov.in",
    color: "#1a237e",
  },
  {
    id: "guwahati",
    city: "Guwahati",
    state: "Assam",
    authority: "North Eastern Council & Telecom Circle",
    shortName: "NEC & DoT North-East",
    category: "Grievance",
    svgX: 435, svgY: 185,
    disclosureRate: 89.6, avgDays: 26, activeCases: 3150,
    description: "Broadband connectivity rollouts, rural banking correspondence complaints, and border infrastructure projects.",
    topTopics: ["BharatNet Fiber Dead Zones", "Disaster Relief Disbursal", "Border Road Maintenance"],
    portalUrl: "https://pgportal.gov.in",
    color: "#FF6B00",
  },
];

const CATEGORY_COLORS: Record<string, string> = {
  RTI: "#138808",
  Grievance: "#FF6B00",
  Consumer: "#B8860B",
  Labor: "#1a237e",
};

// Real simplified India SVG path (public domain topography)
// viewBox: 0 0 520 620
const INDIA_PATH = `
  M 190,18
  C 195,14 202,16 208,20
  C 218,12 232,18 238,28
  C 248,22 262,30 265,42
  C 278,36 292,44 295,56
  C 308,50 324,60 322,74
  C 334,68 348,80 342,94
  L 355,110
  C 365,106 380,118 374,132
  C 386,128 400,142 392,156
  C 402,154 414,164 412,178
  C 422,176 432,188 428,202
  C 436,202 444,214 438,228
  C 446,230 452,244 444,258
  C 450,262 454,276 446,290
  C 450,296 452,310 442,322
  C 444,330 444,344 432,354
  C 432,362 430,376 416,384
  C 414,392 408,404 394,410
  C 390,420 382,430 366,434
  C 360,444 350,452 332,454
  C 322,462 308,468 288,468
  C 276,474 258,476 240,472
  C 224,474 204,472 192,464
  C 178,462 162,456 150,446
  C 138,442 124,432 116,420
  C 106,414 96,402 90,390
  C 82,380 76,366 74,352
  C 68,340 66,326 68,312
  C 64,300 64,286 70,274
  C 68,262 70,248 78,238
  C 78,226 84,212 94,204
  C 96,192 106,180 118,174
  C 120,162 132,152 146,148
  C 148,136 162,128 176,126
  C 176,114 190,108 200,108
  C 200,96 212,92 218,94
  C 216,82 226,78 232,80
  C 230,68 240,64 246,66
  C 244,54 254,52 260,56
  C 260,44 268,42 270,46
  C 268,34 276,30 282,34
  C 280,22 286,18 290,22
  C 288,12 294,8 298,12
  L 300,6
  C 296,4 294,8 290,8
  C 288,4 282,2 278,6
  C 274,2 268,2 266,8
  C 260,4 256,6 254,12
  C 248,8 242,12 242,18
  C 236,14 228,18 228,26
  C 220,20 212,22 210,30
  C 202,24 194,26 192,34
  C 186,28 180,30 180,38
  C 174,32 168,36 168,44
  C 162,38 156,44 158,52
  C 152,46 146,52 148,60
  C 142,56 138,62 140,70 Z
  M 292,470 L 280,498 C 278,510 274,520 268,528
  C 262,536 256,540 250,542
  C 246,544 242,542 240,538
  C 238,534 238,528 240,524
  L 248,500 L 256,478 Z
`;

// Andaman islands (small indicator)
const ANDAMAN_PATH = `M 462,440 L 458,460 L 454,456 Z`;

interface IndiaCivicMapProps {
  onSelectHubPrompt: (prompt: string) => void;
}

export default function IndiaCivicMap({ onSelectHubPrompt }: IndiaCivicMapProps) {
  const [selectedHub, setSelectedHub] = useState<PinData>(CIVIC_HUBS[0]);
  const [filterCategory, setFilterCategory] = useState<string>("ALL");
  const [pinsVisible, setPinsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  const filteredHubs =
    filterCategory === "ALL" ? CIVIC_HUBS : CIVIC_HUBS.filter((h) => h.category === filterCategory);

  // Trigger pin drop animation when section enters view
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setPinsVisible(true), 300);
          observer.unobserve(el);
        }
      },
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="map-section"
      ref={sectionRef}
      className="relative py-24 px-4 sm:px-6 lg:px-8"
      style={{ background: "#FFFDF7" }}
    >
      <div className="max-w-7xl mx-auto relative z-10">

        {/* Header */}
        <ScrollAnimator animate="fade-up">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <div
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider mb-4"
              style={{
                background: "#E8F5E9",
                color: "#138808",
                border: "1px solid rgba(19,136,8,0.25)",
              }}
            >
              <MapPin className="w-3.5 h-3.5" style={{ color: "#FF6B00" }} />
              <span>Interactive National Civic Grid</span>
            </div>
            <h2
              className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight"
              style={{ color: "#2D3142" }}
            >
              Connected to Every Public Authority{" "}
              <span
                className="bg-clip-text text-transparent"
                style={{ backgroundImage: "linear-gradient(135deg, #FF6B00, #FF9933)" }}
              >
                Across Bharat
              </span>
            </h2>
            <p className="mt-4 text-base sm:text-lg" style={{ color: "#6B7280" }}>
              Direct statutory routing to 48+ Union Ministries, 1,200+ Central PSUs, and state consumer commissions.
              Click any pin to explore.
            </p>

            {/* Filter pills */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-8">
              {[
                { id: "ALL", label: "All Central Hubs" },
                { id: "RTI", label: "RTI & CIC" },
                { id: "Grievance", label: "CPGRAMS & Ombudsman" },
                { id: "Consumer", label: "Consumer Commissions" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFilterCategory(tab.id)}
                  className="px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer"
                  style={
                    filterCategory === tab.id
                      ? {
                          background: "#2D3142",
                          color: "#FFFDF7",
                          border: "1px solid #2D3142",
                          boxShadow: "0 2px 10px rgba(45,49,66,0.25)",
                        }
                      : {
                          background: "#F5F0E8",
                          color: "#6B7280",
                          border: "1px solid rgba(45,49,66,0.12)",
                        }
                  }
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </ScrollAnimator>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* SVG Map — 7 cols */}
          <ScrollAnimator animate="slide-left" className="lg:col-span-7">
            <div
              className="relative rounded-3xl p-4 sm:p-6 overflow-hidden"
              style={{
                background: "rgba(255,255,255,0.88)",
                backdropFilter: "blur(24px)",
                border: "1px solid rgba(255,255,255,0.95)",
                boxShadow: "0 8px 48px rgba(45,49,66,0.10)",
              }}
            >
              {/* Parchment texture overlay */}
              <div
                className="absolute inset-0 rounded-3xl pointer-events-none"
                style={{
                  background: "radial-gradient(ellipse 60% 40% at 30% 30%, rgba(255,248,231,0.5), transparent)",
                }}
              />

              {/* Live status chip */}
              <div className="flex items-center justify-between mb-4 relative z-10">
                <div
                  className="flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-semibold"
                  style={{
                    background: "#E8F5E9",
                    color: "#138808",
                    border: "1px solid rgba(19,136,8,0.20)",
                  }}
                >
                  <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#138808" }} />
                  48 Ministries Live
                </div>
                <div className="flex items-center gap-3 text-[11px]" style={{ color: "#9CA3AF" }}>
                  <span>⚡ &lt;1.2s avg</span>
                  <span>🔒 Local-First</span>
                </div>
              </div>

              {/* SVG India Map */}
              <div className="relative w-full" style={{ maxWidth: "520px", margin: "0 auto" }}>
                <svg
                  viewBox="0 0 520 620"
                  className="w-full h-auto select-none"
                  style={{ filter: "drop-shadow(0 4px 24px rgba(45,49,66,0.08))" }}
                >
                  <defs>
                    <linearGradient id="indiaFill" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#FFF8E7" />
                      <stop offset="50%" stopColor="#FFF0E0" />
                      <stop offset="100%" stopColor="#E8EAF6" />
                    </linearGradient>
                    <filter id="mapShadow" x="-5%" y="-5%" width="110%" height="110%">
                      <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#2D3142" floodOpacity="0.08" />
                    </filter>
                  </defs>

                  {/* India outline */}
                  <path
                    d={INDIA_PATH}
                    fill="url(#indiaFill)"
                    stroke="#D4A017"
                    strokeWidth="1.5"
                    filter="url(#mapShadow)"
                  />
                  {/* Andaman */}
                  <path d={ANDAMAN_PATH} fill="#FFF0E0" stroke="#D4A017" strokeWidth="1" />

                  {/* Subtle internal latitude lines */}
                  <line x1="80" y1="200" x2="460" y2="200" stroke="#E5E7EB" strokeWidth="0.8" strokeDasharray="4 4" />
                  <line x1="80" y1="300" x2="440" y2="300" stroke="#E5E7EB" strokeWidth="0.8" strokeDasharray="4 4" />
                  <line x1="80" y1="400" x2="380" y2="400" stroke="#E5E7EB" strokeWidth="0.8" strokeDasharray="4 4" />
                  <line x1="200" y1="60" x2="200" y2="530" stroke="#E5E7EB" strokeWidth="0.8" strokeDasharray="4 4" />
                  <line x1="280" y1="60" x2="280" y2="520" stroke="#E5E7EB" strokeWidth="0.8" strokeDasharray="4 4" />
                  <line x1="350" y1="100" x2="350" y2="450" stroke="#E5E7EB" strokeWidth="0.8" strokeDasharray="4 4" />

                  {/* Tropic of Cancer label */}
                  <text x="88" y="198" fontSize="7" fill="#B8860B" opacity="0.6" fontFamily="monospace">
                    Tropic of Cancer
                  </text>

                  {/* City Pins */}
                  {filteredHubs.map((hub, idx) => {
                    const isSelected = selectedHub.id === hub.id;
                    const delay = idx * 80;
                    return (
                      <g
                        key={hub.id}
                        transform={`translate(${hub.svgX}, ${hub.svgY})`}
                        className={pinsVisible ? "pin-animate" : ""}
                        style={{
                          animationDelay: `${delay}ms`,
                          cursor: "pointer",
                          opacity: pinsVisible ? undefined : 0,
                        }}
                        onClick={() => setSelectedHub(hub)}
                      >
                        {/* Ping ring */}
                        {isSelected && (
                          <>
                            <circle r="18" fill="none" stroke={hub.color} strokeWidth="1.5" opacity="0.25" className="pin-ping" />
                            <circle r="12" fill="none" stroke={hub.color} strokeWidth="1" opacity="0.4" />
                          </>
                        )}
                        {/* Pin shadow */}
                        <ellipse cx="0" cy="9" rx="5" ry="2" fill="rgba(45,49,66,0.15)" />
                        {/* Pin circle */}
                        <circle
                          r={isSelected ? 10 : 7}
                          fill={isSelected ? hub.color : "white"}
                          stroke={hub.color}
                          strokeWidth={isSelected ? 0 : 2}
                          style={{
                            filter: isSelected ? `drop-shadow(0 0 8px ${hub.color}80)` : "drop-shadow(0 1px 3px rgba(45,49,66,0.2))",
                            transition: "all 0.3s ease",
                          }}
                        />
                        {/* Center dot */}
                        <circle r="3" fill={isSelected ? "white" : hub.color} />
                        {/* Label */}
                        <text
                          x="0"
                          y={isSelected ? -14 : -11}
                          textAnchor="middle"
                          fontSize={isSelected ? "9" : "8"}
                          fontWeight={isSelected ? "700" : "600"}
                          fill={isSelected ? hub.color : "#2D3142"}
                          style={{ pointerEvents: "none", fontFamily: "system-ui, sans-serif" }}
                        >
                          {hub.city}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>
            </div>
          </ScrollAnimator>

          {/* Details panel — 5 cols */}
          <ScrollAnimator animate="slide-right" className="lg:col-span-5">
            <div
              className="rounded-3xl overflow-hidden"
              style={{
                background: "rgba(255,255,255,0.90)",
                backdropFilter: "blur(24px)",
                border: "1px solid rgba(255,255,255,0.95)",
                boxShadow: "0 8px 40px rgba(45,49,66,0.10)",
              }}
            >
              {/* Top color bar */}
              <div
                className="h-1"
                style={{ background: `linear-gradient(90deg, ${selectedHub.color}, ${selectedHub.color}88)` }}
              />

              <div className="p-6 sm:p-8">
                {/* Badge + state */}
                <div className="flex items-center justify-between gap-2 mb-4">
                  <span
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
                    style={{
                      background: `${selectedHub.color}15`,
                      color: selectedHub.color,
                      border: `1px solid ${selectedHub.color}30`,
                    }}
                  >
                    <Building2 className="w-3.5 h-3.5" />
                    {selectedHub.category} Authority
                  </span>
                  <span className="text-xs font-mono" style={{ color: "#9CA3AF" }}>
                    {selectedHub.state}
                  </span>
                </div>

                {/* City & authority */}
                <h3 className="text-2xl font-bold mb-0.5" style={{ color: "#2D3142" }}>
                  {selectedHub.city}
                </h3>
                <p className="text-sm font-medium mb-4" style={{ color: selectedHub.color }}>
                  {selectedHub.authority}
                </p>

                {/* Description */}
                <p
                  className="text-xs sm:text-sm leading-relaxed mb-6 p-3.5 rounded-xl"
                  style={{
                    color: "#6B7280",
                    background: "#F5F0E8",
                    border: "1px solid rgba(45,49,66,0.07)",
                  }}
                >
                  {selectedHub.description}
                </p>

                {/* Metrics */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                  {[
                    { label: "Disclosure", value: `${selectedHub.disclosureRate}%`, icon: <TrendingUp className="w-3 h-3" />, color: "#138808" },
                    { label: "Avg Turnaround", value: `${selectedHub.avgDays}d`, icon: <Clock className="w-3 h-3" />, color: "#FF6B00" },
                    { label: "Indexed Cases", value: selectedHub.activeCases.toLocaleString(), icon: <ShieldCheck className="w-3 h-3" />, color: "#1a237e" },
                  ].map((m) => (
                    <div
                      key={m.label}
                      className="p-3 rounded-xl"
                      style={{
                        background: "#F5F0E8",
                        border: "1px solid rgba(45,49,66,0.07)",
                      }}
                    >
                      <div className="flex items-center gap-1 text-[11px] mb-0.5" style={{ color: m.color }}>
                        {m.icon}
                        <span>{m.label}</span>
                      </div>
                      <div className="text-base sm:text-lg font-bold" style={{ color: "#2D3142" }}>
                        {m.value}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Topics */}
                <div className="mb-6">
                  <h4
                    className="text-xs uppercase tracking-wider font-semibold mb-2 flex items-center gap-1.5"
                    style={{ color: "#9CA3AF" }}
                  >
                    <Zap className="w-3.5 h-3.5" style={{ color: "#FF6B00" }} />
                    Frequent Citizen Petitions
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedHub.topTopics.map((topic, i) => (
                      <button
                        key={i}
                        onClick={() =>
                          onSelectHubPrompt(`I want to draft a case regarding ${topic} under ${selectedHub.authority}`)
                        }
                        className="group/pill text-xs px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all cursor-pointer"
                        style={{
                          background: "#F5F0E8",
                          color: "#2D3142",
                          border: "1px solid rgba(45,49,66,0.10)",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = `${selectedHub.color}12`;
                          e.currentTarget.style.borderColor = `${selectedHub.color}40`;
                          e.currentTarget.style.color = selectedHub.color;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "#F5F0E8";
                          e.currentTarget.style.borderColor = "rgba(45,49,66,0.10)";
                          e.currentTarget.style.color = "#2D3142";
                        }}
                      >
                        <span>{topic}</span>
                        <ArrowRight className="w-2.5 h-2.5 opacity-0 group-hover/pill:opacity-100 transition-opacity" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                  <button
                    onClick={() =>
                      onSelectHubPrompt(`File inquiry with ${selectedHub.authority} in ${selectedHub.city}`)
                    }
                    className="w-full sm:flex-1 py-3 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 text-white transition-all cursor-pointer"
                    style={{
                      background: `linear-gradient(135deg, ${selectedHub.color}, ${selectedHub.color}cc)`,
                      boxShadow: `0 4px 16px ${selectedHub.color}40`,
                    }}
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Draft Case for this Authority</span>
                  </button>
                  <a
                    href={selectedHub.portalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto p-3 rounded-xl flex items-center justify-center transition-all"
                    style={{
                      background: "#F5F0E8",
                      border: "1px solid rgba(45,49,66,0.12)",
                      color: "#6B7280",
                    }}
                    title="Visit Official Government Portal"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          </ScrollAnimator>
        </div>
      </div>
    </section>
  );
}
