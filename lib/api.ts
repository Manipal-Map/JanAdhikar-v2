'use client';

import { useState } from 'react';
import { Copy, Check, Download, Loader2 } from 'lucide-react';
import { downloadRtiPdf, downloadGenericPdf } from '@/lib/api';

interface DraftViewerProps {
  title: string;
  draft: string;
  caseId: string;
}

export default function DraftViewer({ title, draft, caseId }: DraftViewerProps) {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(draft);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const handleDownloadPdf = async () => {
    setDownloading(true);
    try {
      let blobData: Blob;

      // Use case-specific endpoint if caseId exists, otherwise fallback to generic endpoint
      if (caseId) {
        blobData = await downloadRtiPdf(caseId);
      } else {
        blobData = await downloadGenericPdf(title, draft);
      }

      const blob = new Blob([blobData], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `RTI_Application_${caseId || 'draft'}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('PDF Download failed:', err);
      alert('Failed to generate PDF. Please try again or copy the text directly.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="bg-white border border-[#b8c2cc] rounded-3xl p-6 shadow-sm text-left">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
        <h3 className="text-sm font-bold text-ashoka-navy uppercase tracking-wider">{title}</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
            {copied ? 'Copied' : 'Copy'}
          </button>

          <button
            onClick={handleDownloadPdf}
            disabled={downloading}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-ashoka-navy hover:bg-ashoka-navy/90 disabled:opacity-50 rounded-lg transition-colors cursor-pointer"
          >
            {downloading ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
            {downloading ? 'Downloading...' : 'Download PDF'}
          </button>
        </div>
      </div>

      <pre className="font-mono text-xs text-slate-800 whitespace-pre-wrap leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200 max-h-[450px] overflow-y-auto">
        {draft || 'No draft content available.'}
      </pre>
    </div>
  );
}
