"use client";

import React, { useState, useEffect } from "react";
import { Scale, Sparkles, Compass, Activity, Layers, ChevronRight, Menu, X, FileText } from "lucide-react";

interface NavbarProps {
  onOpenCaseModal: (initialPrompt?: string) => void;
}

// -- Tokens -----------------------------------------------------------
const SAFFRON = "#FF6B00";       // action accent
const FLAG_SAFFRON = "#FF9933";  // true tricolor saffron, hairline only
const FLAG_GREEN = "#138808";
const INDIGO = "#1A237E";
const INK = "#211F1C";
const PAPER = "#FBF7EE";

const NAV_LINKS = [
  { href: "#how-it-works", label: "How It Works" },
  { href: "#map-section", label: "India Civic Grid", icon: <Compass className="w-3.5 h-3.5" style={{ color: SAFFRON }} /> },
  { href: "#outcome-bench", label: "RTI-Bench ML", icon: <Activity className="w-3.5 h-3.5" style={{ color: FLAG_GREEN }} /> },
  { href: "#sources", label: "Official Sources" },
  { href: "/dashboard", label: "Workspace", icon: <Layers className="w-3.5 h-3.5" style={{ color: "#B8860B" }} />, accent: true },
];

export default function Navbar({ onOpenCaseModal }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,500;0,9..144,600;1,9..144,500&family=IBM+Plex+Mono:wght@500;600&display=swap');

        .jn-serif { font-family: 'Fraunces', Georgia, serif; }
        .jn-mono  { font-family: 'IBM Plex Mono', ui-monospace, monospace; }

        .jn-underline {
          position: relative;
        }
        .jn-underline::after {
          content: "";
          position: absolute;
          left: 0.75rem;
          right: 0.75rem;
          bottom: 4px;
          height: 1.5px;
          background: currentColor;
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.25s ease;
          opacity: 0.65;
        }
        .jn-underline:hover::after { transform: scaleX(1); }

        .jn-stub {
          position: relative;
          border-left: 1.5px dashed rgba(255,255,255,0.55);
        }
        .jn-stub::before,
        .jn-stub::after {
          content: "";
          position: absolute;
          left: -5px;
          width: 9px;
          height: 9px;
          border-radius: 9999px;
          background: rgba(0,0,0,0.16);
          box-shadow: inset 0 1px 1px rgba(255,255,255,0.35);
        }
        .jn-stub::before { top: -4.5px; }
        .jn-stub::after { bottom: -4.5px; }

        .jn-seal {
          transform: rotate(-6deg);
        }
      `}</style>

      {/* Tricolor hairline — constant, not just decorative chrome */}
      <div className="fixed top-0 left-0 right-0 z-[60] flex h-[3px]">
        <span className="flex-1" style={{ background: FLAG_SAFFRON }} />
        <span className="flex-1" style={{ background: "#FFFFFF" }} />
        <span className="flex-1" style={{ background: FLAG_GREEN }} />
      </div>

      <nav
        className={`fixed top-[3px] left-0 right-0 z-50 transition-all duration-400 ${
          scrolled ? "backdrop-blur-2xl border-b shadow-sm py-3" : "py-5"
        }`}
        style={{
          background: scrolled ? "rgba(251,247,238,0.92)" : "transparent",
          borderColor: scrolled ? "rgba(33,31,28,0.10)" : "transparent",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">

            {/* Brand */}
            <a href="#" className="flex items-center gap-3 group">
              <div
                className="jn-seal flex items-center justify-center w-10 h-10 rounded-full border-[1.5px] border-dashed group-hover:rotate-0 transition-transform duration-300"
                style={{ borderColor: INDIGO, color: INDIGO }}
              >
                <Scale className="w-4.5 h-4.5" strokeWidth={2} />
              </div>
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="jn-serif text-xl font-medium tracking-tight" style={{ color: INK }}>
                    Jan<em className="not-italic font-medium" style={{ color: SAFFRON, fontStyle: "italic" }}>adhikar</em>
                  </span>
                  <span
                    className="jn-mono text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded border border-dashed"
                    style={{ color: INDIGO, borderColor: "rgba(26,35,126,0.35)" }}
                  >
                    RTI Act · 2005
                  </span>
                </div>
                <p className="jn-mono text-[10px] uppercase tracking-wide flex items-center gap-1.5 mt-0.5" style={{ color: "#8A8578" }}>
                  <span
                    className="w-1.5 h-1.5 rounded-full inline-block animate-pulse"
                    style={{ background: FLAG_GREEN }}
                  />
                  Civic Intelligence &amp; Legal Copilot
                </p>
              </div>
            </a>

            {/* Desktop Nav — gazette-index style, hairline dividers, underline reveal */}
            <div className="hidden lg:flex items-center divide-x" style={{ borderColor: "rgba(33,31,28,0.10)" }}>
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="jn-underline text-[13px] font-medium px-3.5 py-1.5 flex items-center gap-1.5"
                  style={{ color: link.accent ? "#B8860B" : INK }}
                >
                  {link.icon}
                  <span>{link.label}</span>
                </a>
              ))}
            </div>

            {/* CTA Row */}
            <div className="hidden md:flex items-center gap-3">
              <a
                href="/dashboard"
                className="jn-mono px-3 py-2 text-[11px] font-semibold uppercase tracking-wide rounded-md transition-all flex items-center gap-1.5"
                style={{ color: INK, border: `1px dashed rgba(33,31,28,0.3)` }}
              >
                <FileText className="w-3.5 h-3.5" style={{ color: INDIGO }} />
                Track Cases
              </a>
              <button
                onClick={() => onOpenCaseModal()}
                className="flex items-stretch overflow-hidden rounded-xl text-white cursor-pointer group"
                style={{ boxShadow: "0 4px 18px rgba(255,107,0,0.32)" }}
              >
                <span
                  className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold"
                  style={{ background: `linear-gradient(135deg, ${SAFFRON}, #FF9933)` }}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  File New Case
                </span>
                <span
                  className="jn-stub flex items-center gap-1 px-3.5 py-2.5 text-xs font-bold"
                  style={{ background: INDIGO }}
                >
                  Predict
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </button>
            </div>

            {/* Mobile */}
            <div className="flex md:hidden items-center gap-2">
              <button
                onClick={() => onOpenCaseModal()}
                className="px-3 py-1.5 rounded-lg text-xs font-bold text-white cursor-pointer"
                style={{ background: `linear-gradient(135deg, ${SAFFRON}, #FF9933)` }}
              >
                Start Case
              </button>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg cursor-pointer border border-dashed"
                style={{ borderColor: "rgba(33,31,28,0.3)", color: INK }}
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Dropdown */}
          {mobileMenuOpen && (
            <div
              className="lg:hidden mt-3 p-4 rounded-2xl divide-y"
              style={{
                background: "rgba(251,247,238,0.97)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(33,31,28,0.10)",
                boxShadow: "0 8px 32px rgba(33,31,28,0.12)",
              }}
            >
              {[
                { label: "How It Works", dot: "#8A8578" },
                { label: "India Civic Grid", dot: SAFFRON },
                { label: "RTI-Bench ML", dot: FLAG_GREEN },
                { label: "Official Sources", dot: "#8A8578" },
                { label: "Open Workspace", dot: "#B8860B" },
              ].map((item, i) => (
                <a
                  key={i}
                  href={["#how-it-works", "#map-section", "#outcome-bench", "#sources", "/dashboard"][i]}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 text-sm font-medium py-2.5"
                  style={{ color: i === 4 ? SAFFRON : INK }}
                >
                  <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: item.dot }} />
                  {item.label}
                </a>
              ))}
              <div className="pt-3">
                <button
                  onClick={() => { setMobileMenuOpen(false); onOpenCaseModal(); }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-white font-bold text-sm cursor-pointer"
                  style={{ background: `linear-gradient(135deg, ${SAFFRON}, #FF9933)` }}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  File New Case &amp; Predict Outcome
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>
    </>
  );
}