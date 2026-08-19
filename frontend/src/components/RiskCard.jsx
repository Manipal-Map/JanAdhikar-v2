import { motion } from 'framer-motion'
import { AlertTriangle, AlertCircle, Info } from 'lucide-react'

const SEVERITY = {
  HIGH:   { bg: 'bg-red-500/10',    border: 'border-red-500/25',   text: 'text-red-400',   icon: AlertTriangle, label: 'HIGH' },
  MEDIUM: { bg: 'bg-amber-500/10',  border: 'border-amber-500/25', text: 'text-amber-400', icon: AlertCircle,   label: 'MEDIUM' },
  LOW:    { bg: 'bg-blue-500/10',   border: 'border-blue-500/25',  text: 'text-blue-400',  icon: Info,          label: 'LOW' },
}

export default function RiskCard({ risk, index = 0 }) {
  const s = SEVERITY[risk.severity] || SEVERITY.MEDIUM
  const Icon = s.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`p-4 rounded-xl border ${s.bg} ${s.border}`}
    >
      <div className="flex items-start gap-3">
        <Icon size={16} className={`${s.text} mt-0.5 flex-shrink-0`} />
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-xs font-bold uppercase tracking-wider ${s.text}`}>
              {s.label}
            </span>
            <span className="text-xs text-slate-500 font-mono">
              {risk.risk_code}
            </span>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed">{risk.description}</p>
        </div>
      </div>
    </motion.div>
  )
}
