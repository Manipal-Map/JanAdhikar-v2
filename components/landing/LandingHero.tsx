'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Sparkles, ShieldCheck, Clock } from 'lucide-react';
import GuidedCaseModal from './GuidedCaseModal';
import ScrollAnimator from './ScrollAnimator';

const STATS = [
  { value: '30 Days', label: 'RTI Act Statutory Response Window' },
  { value: '₹10', label: 'Standard Filing Fee (Free for BPL)' },
  { value: '2 min', label: 'Average Draft Generation Time' },
];

export default function LandingHero() {
  const [modalOpen, setModalOpen] = useState(false);
  const router = useRouter();

  return (
    <>
      <section
        className="relative min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 pt-24 pb-16"
        style={{ background: 'linear-gradient(135deg, #FFFDF7 0%, #FFF8E7 40%, #F0F4FF 100%)' }}
      >
        {/* Subtle dot grid */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(45,49,66,0.04) 1px, transparent 0)',
            backgroundSize: '32px 32px',
          }}
        />

        <div className="relative z-10 max-w-5xl mx-auto text-center">
          {/* Badge */}
          <ScrollAnimator animate="fade-up">
            <div className="flex justify-center mb-8">
              <div
                className="flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold"
                style={{ background: 'rgba(255,107,0,0.10)', border: '1px solid rgba(255,107,0,0.25)', color: '#FF6B00' }}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                Privacy-First · RTI Act 2005 · CPGRAMS · Consumer Forum
              </div>
            </div>
          </ScrollAnimator>

          {/* Heading */}
          <ScrollAnimator animate="fade-up" delay={80}>
            <h1
              className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-tight mb-6"
              style={{ color: '#2D3142' }}
            >
              Your Government{' '}
              <span
                style={{
                  background: 'linear-gradient(135deg, #FF6B00, #FF9933)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Owes You
              </span>{' '}
              Answers.
            </h1>
          </ScrollAnimator>

          <ScrollAnimator animate="fade-up" delay={140}>
            <p className="text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed" style={{ color: '#6B7280' }}>
              JanAdhikar turns your plain-language civic problem into a legally precise RTI application or
              grievance notice — addressed to the right authority, in under 2 minutes.
            </p>
          </ScrollAnimator>

          {/* CTA buttons */}
          <ScrollAnimator animate="fade-up" delay={200}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14">
              <button
                onClick={() => setModalOpen(true)}
                className="flex items-center gap-2.5 px-8 py-4 rounded-2xl text-base font-bold text-white transition-all hover:-translate-y-0.5"
                style={{ background: 'linear-gradient(135deg, #FF6B00 0%, #FF9933 100%)', boxShadow: '0 4px 24px rgba(255,107,0,0.35)' }}
              >
                <Sparkles className="w-5 h-5" />
                Start Your Case Free
              </button>
              <button
                onClick={() => router.push('/dashboard')}
                className="flex items-center gap-2.5 px-8 py-4 rounded-2xl text-base font-bold transition-all hover:-translate-y-0.5"
                style={{ background: 'rgba(255,255,255,0.90)', border: '1.5px solid rgba(45,49,66,0.12)', color: '#2D3142', boxShadow: '0 2px 12px rgba(45,49,66,0.06)' }}
              >
                Open Dashboard
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </ScrollAnimator>

          {/* Stats row */}
          <ScrollAnimator animate="fade-up" delay={260}>
            <div className="flex flex-wrap items-center justify-center gap-4">
              {STATS.map((stat, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 px-5 py-3 rounded-2xl"
                  style={{ background: 'rgba(255,255,255,0.85)', border: '1px solid rgba(45,49,66,0.08)', boxShadow: '0 2px 8px rgba(45,49,66,0.04)' }}
                >
                  <Clock className="w-4 h-4" style={{ color: '#FF6B00' }} />
                  <div className="text-left">
                    <p className="text-base font-black" style={{ color: '#2D3142' }}>{stat.value}</p>
                    <p className="text-[11px]" style={{ color: '#9CA3AF' }}>{stat.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollAnimator>
        </div>
      </section>

      <GuidedCaseModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
