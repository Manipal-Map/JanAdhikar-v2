'use client';

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Copy, Download, CheckCheck, FileText, Printer, Loader2 } from 'lucide-react'
import { downloadGenericPdf, downloadRtiPdf } from '@/lib/api'

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
      let blob;
      if (caseId) {
        blob = await downloadRtiPdf(caseId)
      } else {
        blob = await downloadGenericPdf(title, draft)
      }
      
      const fileBlob = new Blob([blob], { type: 'application/octet-stream' })
      const url = URL.createObjectURL(fileBlob)
      
      const link = document.createElement('a')
      link.href = url
      link.download = `${caseId ? `RTI_Application_${caseId}` : 'Legal_Notice'}.pdf`
      document.body.appendChild(link)
      link.click()
      
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
      className="bg-white/95 backdrop-blur-sm border border-slate-300 rounded-3xl overflow-hidden shadow-xl"
    >
      <div className="flex flex-col sm:flex-row items-center justify-between px-5 py-4 border-b border-slate-200 bg-[#FAF8F5] gap-3">
        <div className="flex items-center gap-2.5">
          <FileText size={16} className="text-[#FF9933]" />
          <h3 className="text-sm font-extrabold text-ashoka-navy tracking-tight font-sans">{title}</h3>
          {caseId && <span className="text-xs font-mono text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">#{caseId}</span>}
        </div>
        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          <button onClick={handleCopy} className="btn-ghost flex-1 sm:flex-none text-xs py-1.5 px-3 gap-1.5 bg-white border border-slate-200 text-slate-600 hover:text-ashoka-navy hover:bg-slate-50">
            {copied ? <><CheckCheck size={13} className="text-emerald-500" /> Copied!</> : <><Copy size={13} /> Copy</>}
          </button>
          <button onClick={handleDownloadPdf} disabled={downloading} className="btn-ghost flex-1 sm:flex-none text-xs py-1.5 px-3 gap-1.5 bg-white border border-slate-200 text-slate-600 hover:text-ashoka-navy hover:bg-slate-50">
            {downloading ? <><Loader2 size={13} className="animate-spin" /> Gen...</> : <><Download size={13} /> PDF</>}
          </button>
          <button onClick={handlePrint} className="btn-ghost flex-1 sm:flex-none text-xs py-1.5 px-3 gap-1.5 bg-white border border-slate-200 text-slate-600 hover:text-ashoka-navy hover:bg-slate-50">
            <Printer size={13} /> Print
          </button>
        </div>
      </div>
      <div className="p-5 sm:p-6">
        <div className="bg-[#FAF8F5] border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-inner max-h-[500px] overflow-y-auto">
          <pre className="text-sm text-ashoka-navy font-sans font-medium leading-relaxed whitespace-pre-wrap break-words">
            {draft}
          </pre>
        </div>
      </div>
    </motion.div>
  )
}
