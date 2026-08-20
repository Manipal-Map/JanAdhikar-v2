import { useState } from 'react'
import { motion } from 'framer-motion'
import { Copy, Download, CheckCheck, FileText, Printer, Loader2 } from 'lucide-react'
import { downloadRtiPdf } from '../api/index.js'

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
      // Fetch the PDF from your backend
      const blob = await downloadRtiPdf(caseId)
      
      // THE BULLETPROOF BYPASS: Using a Data String instead of a File Blob.
      // This stops Android Chrome from scanning for PDF Viewer apps.
      const reader = new FileReader()
      reader.onloadend = () => {
        if (!reader.result) return;
        
        const base64Data = reader.result.toString().replace(
          /^data:(.*?);/,
          'data:application/octet-stream;'
        )

        const link = document.createElement('a')
        link.href = base64Data
        link.download = `${caseId || 'Legal_Document'}.pdf`
        
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        
        setDownloading(false)
      }

      reader.readAsDataURL(blob)

    } catch (err) {
      console.error('Failed to download PDF:', err)
      alert('Failed to generate PDF. Please try again.')
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
      className="bg-white rounded-xl overflow-hidden border border-slate-200 shadow-sm"
    >
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-slate-50">
        <div className="flex items-center gap-2.5">
          <FileText size={16} className="text-blue-600" />
          <h3 className="text-sm font-bold text-slate-900">{title}</h3>
          {caseId && <span className="text-xs font-mono text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">#{caseId}</span>}
        </div>
        <div className="flex items-center gap-1.5">
          <button onClick={handleCopy} className="text-xs py-1.5 px-3 flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-50">
            {copied ? <><CheckCheck size={13} className="text-emerald-600" /> Copied!</> : <><Copy size={13} /> Copy</>}
          </button>
          <button onClick={handleDownloadPdf} disabled={downloading} className="text-xs py-1.5 px-3 flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-50">
            {downloading ? <><Loader2 size={13} className="animate-spin" /> Generating...</> : <><Download size={13} /> Download</>}
          </button>
          <button onClick={handlePrint} className="text-xs py-1.5 px-3 flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-50">
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
