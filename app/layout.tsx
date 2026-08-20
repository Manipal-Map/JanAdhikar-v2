import React, { Suspense } from "react";

export const dynamic = "force-dynamic";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#FAF8F5]">
          <div className="text-sm font-mono text-slate-500 animate-pulse">
            Loading Workspace...
          </div>
        </div>
      }
    >
      {children}
    </Suspense>
  );
}
