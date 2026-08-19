import { motion } from 'framer-motion'
import { MapPin, Building, CheckCircle2 } from 'lucide-react'

export default function RTIConfirmationCard({ departmentInfo, onConfirm }) {
  if (!departmentInfo) return null
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-5 border border-brand-blue/30 bg-navy-800/80"
    >
      <div className="flex items-start gap-3 mb-4">
        <MapPin className="text-brand-blue flex-shrink-0 mt-1" size={18} />
        <div>
          <h3 className="font-semibold text-white">Jurisdiction Verified</h3>
          <p className="text-sm text-slate-300">
            Based on your location, this RTI application should be filed with:
          </p>
        </div>
      </div>
      <div className="bg-navy-900/60 p-4 rounded-lg mb-4 border border-white/5">
        <div className="flex items-center gap-2 mb-2">
          <Building size={16} className="text-brand-blue" />
          <span className="font-medium text-white">{departmentInfo.department_name}</span>
        </div>
        <p className="text-sm text-slate-400">{departmentInfo.address || 'Address not specified'}</p>
      </div>
      <button
        onClick={onConfirm}
        className="btn-primary w-full justify-center py-2"
      >
        <CheckCircle2 size={16} /> Confirm & Generate Draft
      </button>
    </motion.div>
  )
}
