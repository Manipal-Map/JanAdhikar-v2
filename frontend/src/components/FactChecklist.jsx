import { motion } from 'framer-motion'
import { CheckCircle2, Circle } from 'lucide-react'

export default function FactChecklist({ facts = {}, schema = [] }) {
  const allKeys = schema.length > 0 ? schema.map((f) => f.key) : Object.keys(facts)

  return (
    <div className="space-y-2">
      {allKeys.map((key, i) => {
        const label = schema.find((s) => s.key === key)?.label || key
        const value = facts[key]
        const filled = value !== undefined && value !== null && value !== ''

        return (
          <motion.div
            key={key}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.07 }}
            className={`flex items-start gap-3 p-3 rounded-xl border transition-all duration-300 ${
              filled
                ? 'bg-emerald-500/10 border-emerald-500/25'
                : 'bg-navy-700/60 border-white/5'
            }`}
          >
            <div className="mt-0.5 flex-shrink-0">
              {filled ? (
                <CheckCircle2 size={16} className="text-emerald-400" />
              ) : (
                <Circle size={16} className="text-slate-600" />
              )}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                {label}
              </p>
              {filled && (
                <p className="text-sm text-white mt-0.5 break-words">{value}</p>
              )}
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}
