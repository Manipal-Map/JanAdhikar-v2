import { useState } from 'react'
import { motion } from 'framer-motion'
import { Copy, Download, CheckCheck, FileText, Printer } from 'lucide-react'

export default function DraftViewer({ title = 'Generated Document', draft, caseId }) {
  const [copied, setCopied] = useState(false)

  if (!draft) return null

  const handleCopy = () => {
    navigator.clipboard.writeText(draft)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    const blob = new Blob([draft], { type: 'text/plain' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `${caseId || 'draft'}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handlePrint = () => {
    const win = window.open('', '_blank')
    win.document.write(`
      <html><head>
        <title>${title}</title>
        <style>
          body { font-family: 'Courier New', monospace; font-size: 13px; line-height: 1.7;
                 padding: 40px; max-width: 800px; margin: 0 auto; color: #1e293b; }
          pre  { white-space: pre-wrap; word-wrap: break-word; }
        </style>
      </head><body>
        <pre>${draft.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
      </body></html>
    `)
    win.document.close()
    win.print()
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
          <button onClick={handleDownload} className="btn-ghost text-xs py-1.5 px-3 gap-1.5 bg-white border border-slate-200">
            <Download size={13} /> Download
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
