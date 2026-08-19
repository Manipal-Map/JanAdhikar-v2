import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer, Cell,
} from 'recharts'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

const COLORS = {
  full_disclosure:     '#10b981', // emerald
  partial_disclosure:  '#f59e0b', // amber
  rejection:           '#ef4444', // red
}

const LABELS = {
  full_disclosure:    'Full Disclosure',
  partial_disclosure: 'Partial Disclosure',
  rejection:          'Rejection',
}

function AnimatedNumber({ value }) {
  const [display, setDisplay] = useState(0)
  useEffect(() => {
    let start = 0
    const target = Math.round(value * 100)
    const step = Math.ceil(target / 40)
    const timer = setInterval(() => {
      start = Math.min(start + step, target)
      setDisplay(start)
      if (start >= target) clearInterval(timer)
    }, 25)
    return () => clearInterval(timer)
  }, [value])
  return <>{display}</>
}

export default function RiskMeter({ prediction, probabilities }) {
  if (!probabilities) return null

  const data = Object.entries(probabilities).map(([key, val]) => ({
    key,
    name: LABELS[key] || key,
    value: Math.round(val * 100),
    fill: COLORS[key] || '#6366f1',
  }))

  const dominant = Object.entries(probabilities).reduce((a, b) =>
    b[1] > a[1] ? b : a
  )
  const dominantColor = COLORS[dominant[0]] || '#6366f1'

  const PREDICTION_ICON = {
    FULL:    TrendingUp,
    PARTIAL: Minus,
    REJECTION: TrendingDown,
  }
  const PredIcon = PREDICTION_ICON[prediction] || Minus

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-4"
    >
      {/* Prediction badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <PredIcon size={18} style={{ color: dominantColor }} />
          <span className="text-sm font-semibold" style={{ color: dominantColor }}>
            {prediction} LIKELY
          </span>
        </div>
        <span className="text-xs text-slate-500">RTI-Bench Analysis</span>
      </div>

      {/* Radial bar chart */}
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            cx="50%"
            cy="50%"
            innerRadius="35%"
            outerRadius="85%"
            data={data}
            startAngle={90}
            endAngle={-270}
          >
            <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
            <RadialBar
              dataKey="value"
              cornerRadius={6}
              background={{ fill: '#161f3d' }}
              label={false}
            >
              {data.map((entry) => (
                <Cell key={entry.key} fill={entry.fill} />
              ))}
            </RadialBar>
          </RadialBarChart>
        </ResponsiveContainer>
      </div>

      {/* Probability breakdown */}
      <div className="space-y-2">
        {data.map((item) => (
          <div key={item.key} className="flex items-center gap-3">
            <div
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ background: item.fill }}
            />
            <span className="text-sm text-slate-400 flex-1">{item.name}</span>
            <div className="flex items-center gap-2">
              <div className="w-24 h-1.5 bg-navy-700 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${item.value}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
                  className="h-full rounded-full"
                  style={{ background: item.fill }}
                />
              </div>
              <span className="text-sm font-bold w-10 text-right" style={{ color: item.fill }}>
                <AnimatedNumber value={probabilities[item.key]} />%
              </span>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  )
}
