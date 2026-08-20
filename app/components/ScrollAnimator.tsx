"use client";

import React, { useEffect, useRef } from "react";

interface ScrollAnimatorProps {
  children: React.ReactNode;
  className?: string;
  animate?: "fade-up" | "slide-left" | "slide-right" | "scale-in";
  stagger?: boolean;
  delay?: number;
  threshold?: number;
}

export default function ScrollAnimator({
  children,
  className = "",
  animate = "fade-up",
  stagger = false,
  delay = 0,
  threshold = 0.15,
}: ScrollAnimatorProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (delay) {
      el.style.transitionDelay = `${delay}ms`;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("visible");
          observer.unobserve(el);
        }
      },
      { threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [delay, threshold]);

  const attrKey = stagger ? "data-stagger" : "data-animate";
  const attrVal = stagger ? "" : animate;

  return (
    <div
      ref={ref}
      className={className}
      {...{ [attrKey]: attrVal }}
    >
      {children}
    </div>
  );
}
