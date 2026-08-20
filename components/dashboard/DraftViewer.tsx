'use client';
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Copy, Download, CheckCheck, FileText, Printer, Loader2 } from 'lucide-react'
import { downloadGenericPdf } from '@/lib/api'

export default function DraftViewer({ title = 'Generated Document', draft, caseId }) {
  const [copied, setCopied] = useState(false)
  const [downloading, setDownloading] = useState(false)

  if (!draft) return null

  const handleCopy = () => {
    navigator.clipboard.writeText(draft)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownloadPdf = async () => {
    setDownloading(true)
    try {
      const blob = await downloadGenericPdf(title, draft)
      
      // BYPASS TRICK: Changing 'application/pdf' to 'application/octet-stream'
      // forces a silent background download. Chrome won't try to open it in a 
      // PDF viewer, meaning it NEVER asks for the "Apps on device" permission.
      const fileBlob = new Blob([blob], { type: 'application/octet-stream' })
      const url = URL.createObjectURL(fileBlob)
      
      const link = document.createElement('a')
      link.href = url
      link.download = `${caseId || 'Legal_Notice'}.pdf`
      document.body.appendChild(link)
      link.click()
      
      // DELAY FIX: Waiting 5 seconds before deleting the file from memory
      // gives mobile browsers time to save the file, preventing the "Network error".
      setTimeout(() => {
        if (link.parentNode) link.parentNode.removeChild(link)
        URL.revokeObjectURL(url)
      }, 5000)

    } catch (err) {
      console.error('Failed to download PDF:', err)
      alert('Failed to generate PDF. Please try again.')
    } finally {
      setDownloading(false)
    }
  }

  // Uses an invisible Iframe to print, entirely bypassing browser Pop-Up Blockers
  const handlePrint = () => {
    const iframe = document.createElement('iframe')
    iframe.style.position = 'fixed'
    iframe.style.right = '0'
    iframe.style.bottom = '0'
    iframe.style.width = '0'
    iframe.style.height = '0'
    iframe.style.border = '0'
    document.body.appendChild(iframe)
    
    const content = `
      <html>
        <head>
          <title>${title}</title>
          <style>
            body { font-family: Arial, sans-serif; font-size: 14px; line-height: 1.6; padding: 40px; color: #000; }
            pre { white-space: pre-wrap; font-family: inherit; margin: 0; }
          </style>
        </head>
        <body>
          <h2>${title}</h2>
          <pre>${draft.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
        </body>
      </html>
    `
    
    if (iframe.contentWindow) {
      iframe.contentWindow.document.open()
      iframe.contentWindow.document.write(content)
      iframe.contentWindow.document.close()
      
      iframe.contentWindow.focus()
      setTimeout(() => {
        if (iframe.contentWindow) {
          iframe.contentWindow.print()
        }
        setTimeout(() => {
          if (document.body.contains(iframe)) {
            document.body.removeChild(iframe)
          }
        }, 1000)
      }, 250)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card overflow-hidden"
    >
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-slate-50">
        <div className="flex items-center gap-2.5">
          <FileText size={16} className="text-blue-600" />
          <h3 className="text-sm font-bold text-slate-900">{title}</h3>
          {caseId && <span className="text-xs font-mono text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">#{caseId}</span>}
        </div>
        <div className="flex items-center gap-1.5">
          <button onClick={handleCopy} className="btn-ghost text-xs py-1.5 px-3 gap-1.5 bg-white border border-slate-200">
            {copied ? <><CheckCheck size={13} className="text-emerald-600" /> Copied!</> : <><Copy size={13} /> Copy</>}
          </button>
          <button onClick={handleDownloadPdf} disabled={downloading} className="btn-ghost text-xs py-1.5 px-3 gap-1.5 bg-white border border-slate-200">
            {downloading ? <><Loader2 size={13} className="animate-spin" /> Generating...</> : <><Download size={13} /> Download (PDF)</>}
          </button>
          <button onClick={handlePrint} className="btn-ghost text-xs py-1.5 px-3 gap-1.5 bg-white border border-slate-200">
            <Printer size={13} /> Print
          </button>
        </div>
      </div>
      <div className="p-5 max-h-[500px] overflow-y-auto bg-white">
        <pre className="text-sm text-slate-800 font-mono leading-relaxed whitespace-pre-wrap break-words">
          {draft}
        </pre>
      </div>
    </motion.div>
  )
}
