import { motion } from 'framer-motion'
import { Hash } from 'lucide-react'

export default function CaseIdBadge({ caseId }) {
  if (!caseId) return null
  return (
    <motion.div
      initial={{ scale: 0.7, opacity: 0, y: -10 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-full shadow-sm"
    >
      <Hash size={13} className="text-slate-400" />
      <span className="text-xs font-mono font-bold text-slate-700 tracking-widest">{caseId}</span>
    </motion.div>
  )
}
