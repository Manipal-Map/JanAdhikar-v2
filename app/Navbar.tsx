"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Gavel, Menu, X } from "lucide-react";
import Link from "next/link";

export default function Navbar() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: "Architecture", href: "/#comparison" },
    { name: "Workflow", href: "/#export-pipeline" },
    { name: "Jurisdiction", href: "/#the-law" },
    { name: "Track Case", href: "/dashboard/track" },
  ];

  const handleLaunch = () => {
    router.push("/dashboard");
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-4 pt-6 sm:pt-8 font-sans">
      <nav className="max-w-4xl mx-auto bg-white/95 backdrop-blur-md border border-slate-300 rounded-full shadow-sm">
        <div className="px-5 sm:px-7">
          <div className="flex items-center justify-between h-14">
            
            {/* Logo */}
            <Link href="/" className="flex items-center shrink-0 py-1">
              <Image
                src="/janadhikar-logo-v2.png"
                alt="Jan Adhikar"
                width={220}
                height={180}
                className="object-contain h-10 sm:h-11 w-auto"
                priority
              />
            </Link>

            {/* Links */}
            <div className="hidden md:flex items-center gap-7 text-xs font-bold tracking-wide text-slate-700 uppercase">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="hover:text-[#FF9933] transition-colors"
                >
                  {link.name}
                </Link>
              ))}
            </div>

            {/* Action CTA & Mobile Toggle */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleLaunch}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#A32A02] hover:bg-[#138808] text-white text-[11px] font-bold uppercase tracking-wider transition-colors shrink-0 cursor-pointer shadow-sm"
              >
                <Gavel className="w-3.5 h-3.5 text-amber-100 shrink-0" />
                <span>Janअधिकार</span>
              </button>

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-1.5 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                aria-label="Toggle Navigation"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 px-4 pt-2 pb-4 space-y-1 bg-white rounded-b-2xl mt-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-semibold text-slate-800 hover:bg-slate-50 hover:text-[#FF9933] transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </div>
        )}
      </nav>
    </header>
  );
}
