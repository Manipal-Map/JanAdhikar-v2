import { motion } from 'framer-motion'
import { Hash } from 'lucide-react'

export default function CaseIdBadge({ caseId }) {
  if (!caseId) return null
  return (
    <motion.div
      initial={{ scale: 0.7, opacity: 0, y: -10 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="inline-flex items-center gap-2 px-3 py-1.5 bg-navy-700 border border-brand-blue/30 rounded-full"
    >
      <Hash size={13} className="text-brand-blue" />
      <span className="text-xs font-mono text-slate-300 tracking-widest">{caseId}</span>
    </motion.div>
  )
}
