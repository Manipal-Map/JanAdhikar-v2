"use client";

import React from "react";
import {
  ShieldCheck,
  ExternalLink,
  HardDrive,
  Lock,
} from "lucide-react";
import ScrollAnimator from "./ScrollAnimator";

const OFFICIAL_SOURCES = [
  {
    name: "RTI Online (DoPT)",
    url: "https://rtionline.gov.in",
    authority: "Department of Personnel & Training",
    category: "Central RTI Portal",
    statute: "Right to Information Act, 2005",
    desc: "Single window portal for filing RTI applications and First Appeals across 48+ Union Ministries.",
    accent: "#138808",
  },
  {
    name: "CPGRAMS Portal",
    url: "https://pgportal.gov.in",
    authority: "Department of Administrative Reforms (DARPG)",
    category: "Public Grievance",
    statute: "Citizen Charter & Grievance Norms",
    desc: "National grievance redressal engine monitoring citizen petitions directly through ministry nodal officers.",
    accent: "#FF6B00",
  },
  {
    name: "India Code Legislative Repository",
    url: "https://www.indiacode.nic.in",
    authority: "Ministry of Law & Justice",
    category: "Statutory Law",
    statute: "Constitution & Central Acts",
    desc: "Official digital database of all unrepealed Central and State acts, gazetted notifications, and rules.",
    accent: "#1a237e",
  },
  {
    name: "National Consumer Helpline (NCH)",
    url: "https://consumerhelpline.gov.in",
    authority: "Ministry of Consumer Affairs",
    category: "Consumer Rights",
    statute: "Consumer Protection Act, 2019",
    desc: "Statutory platform for defective goods, deficiency of service, dark patterns, and e-commerce disputes.",
    accent: "#B8860B",
  },
  {
    name: "Central Information Commission (CIC)",
    url: "https://cic.gov.in",
    authority: "Central Information Commission",
    category: "Appellate Decisions",
    statute: "Section 19(3) Second Appeals",
    desc: "Apex judicial authority enforcing penalties on non-compliant CPIOs under Section 20 of the RTI Act.",
    accent: "#138808",
  },
  {
    name: "NALSA Legal Aid",
    url: "https://nalsa.gov.in",
    authority: "National Legal Services Authority",
    category: "Free Legal Aid",
    statute: "Legal Services Authorities Act, 1987",
    desc: "Provides free legal assistance and lok adalat representations to marginalized citizen categories.",
    accent: "#1a237e",
  },
];

export default function TrustAndSources() {
  return (
    <section
      id="sources"
      className="relative py-24 px-4 sm:px-6 lg:px-8"
      style={{
        background: "#FFF8E7",
        borderTop: "1px solid rgba(45,49,66,0.07)",
      }}
    >
      <div className="max-w-7xl mx-auto relative z-10">

        {/* Header */}
        <ScrollAnimator animate="fade-up">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider mb-4"
              style={{
                background: "#E8F5E9",
                color: "#138808",
                border: "1px solid rgba(19,136,8,0.20)",
              }}
            >
              <ShieldCheck className="w-3.5 h-3.5" style={{ color: "#FF6B00" }} />
              <span>Zero Synthetic Hallucinations</span>
            </div>
            <h2
              className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight"
              style={{ color: "#2D3142" }}
            >
              100% Grounded in Official Indian Law &amp; Gazettes
            </h2>
            <p className="mt-4 text-base sm:text-lg" style={{ color: "#6B7280" }}>
              LLMs understand the problem. Official databases determine the authority. Our architecture
              prevents hallucinated legal provisions by verifying every draft against official portals.
            </p>
          </div>
        </ScrollAnimator>

        {/* Privacy Banner */}
        <ScrollAnimator animate="scale-in">
          <div
            className="rounded-3xl p-6 sm:p-8 mb-16 flex flex-col md:flex-row items-center justify-between gap-6"
            style={{
              background: "rgba(255,255,255,0.88)",
              backdropFilter: "blur(20px)",
              border: "1.5px solid rgba(19,136,8,0.25)",
              boxShadow: "0 4px 32px rgba(19,136,8,0.07)",
            }}
          >
            <div className="flex items-center gap-4">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
                style={{
                  background: "#E8F5E9",
                  border: "1px solid rgba(19,136,8,0.20)",
                }}
              >
                <HardDrive className="w-7 h-7" style={{ color: "#138808" }} />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg font-bold" style={{ color: "#2D3142" }}>
                    Local-First Architecture &amp; DPDP Act 2023 Compliant
                  </h3>
                  <span
                    className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                    style={{
                      background: "#E8F5E9",
                      color: "#138808",
                    }}
                  >
                    Zero Telemetry
                  </span>
                </div>
                <p className="text-xs sm:text-sm" style={{ color: "#6B7280" }}>
                  Your draft grievance and personal identity details remain stored in your browser's private offline storage.
                  We never sell, log, or train on your personal citizen cases.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              {[
                { label: "Storage", value: "Client-Side IndexedDB", color: "#138808" },
                { label: "Encryption", value: "AES-256 Offline", color: "#FF6B00" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="px-4 py-2.5 rounded-xl text-center min-w-[120px]"
                  style={{
                    background: "#F5F0E8",
                    border: "1px solid rgba(45,49,66,0.10)",
                  }}
                >
                  <span className="block text-xs font-mono mb-0.5" style={{ color: "#9CA3AF" }}>
                    {item.label}
                  </span>
                  <span className="text-xs font-bold" style={{ color: item.color }}>
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </ScrollAnimator>

        {/* Sources Grid */}
        <ScrollAnimator stagger className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {OFFICIAL_SOURCES.map((source, index) => (
            <SourceCard key={index} source={source} />
          ))}
        </ScrollAnimator>
      </div>
    </section>
  );
}

function SourceCard({ source }: { source: (typeof OFFICIAL_SOURCES)[0] }) {
  const [hovered, setHovered] = React.useState(false);

  return (
    <div
      className="rounded-2xl flex flex-col justify-between transition-all duration-300 overflow-hidden"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.78)",
        backdropFilter: "blur(16px)",
        border: hovered
          ? `1.5px solid ${source.accent}30`
          : "1px solid rgba(255,255,255,0.90)",
        boxShadow: hovered
          ? `0 8px 32px rgba(45,49,66,0.10), 0 0 0 1px ${source.accent}15`
          : "0 2px 12px rgba(45,49,66,0.05)",
        transform: hovered ? "translateY(-2px)" : "translateY(0)",
      }}
    >
      {/* Accent stripe */}
      <div className="h-0.5 w-full" style={{ background: source.accent, opacity: hovered ? 1 : 0.4, transition: "opacity 0.3s" }} />

      <div className="p-6">
        {/* Top row */}
        <div className="flex items-center justify-between mb-3">
          <span
            className="text-[11px] font-bold px-2.5 py-0.5 rounded-full"
            style={{
              background: `${source.accent}12`,
              color: source.accent,
              border: `1px solid ${source.accent}25`,
            }}
          >
            {source.category}
          </span>
          <a
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            className="transition"
            title={`Visit ${source.name}`}
            style={{ color: hovered ? source.accent : "#9CA3AF" }}
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>

        <h4
          className="text-base font-bold mb-1 transition-colors"
          style={{ color: hovered ? source.accent : "#2D3142" }}
        >
          {source.name}
        </h4>
        <p className="text-xs font-medium mb-3" style={{ color: "#FF6B00" }}>
          {source.authority}
        </p>
        <p className="text-xs leading-relaxed" style={{ color: "#6B7280" }}>
          {source.desc}
        </p>
      </div>

      <div
        className="px-6 py-3 flex items-center justify-between text-[11px]"
        style={{
          borderTop: "1px solid rgba(45,49,66,0.07)",
          fontFamily: "monospace",
          color: "#9CA3AF",
        }}
      >
        <span>{source.statute}</span>
        <span className="font-semibold" style={{ color: "#138808" }}>✓ Verified</span>
      </div>
    </div>
  );
}
