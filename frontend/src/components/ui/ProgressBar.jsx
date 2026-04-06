import { motion } from 'framer-motion'

export default function ProgressBar({ value = 0, max = 100, color = 'brand', size = 'md', showLabel = false, label }) {
  const pct = Math.min(100, Math.round((value / max) * 100))
  const colors = {
    brand:   'bg-brand-500',
    success: 'bg-success-500',
    warning: 'bg-warning-500',
    danger:  'bg-danger-500',
  }
  const heights = { xs: 'h-1', sm: 'h-1.5', md: 'h-2', lg: 'h-3' }

  return (
    <div className="w-full">
      {(showLabel || label) && (
        <div className="flex justify-between items-center mb-1.5">
          {label && <span className="text-xs text-surface-400">{label}</span>}
          {showLabel && <span className="text-xs font-medium text-surface-300">{pct}%</span>}
        </div>
      )}
      <div className={`w-full bg-surface-800 rounded-full overflow-hidden ${heights[size]}`}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: .8, ease: [.22, 1, .36, 1] }}
          className={`${heights[size]} ${colors[color]} rounded-full`}
        />
      </div>
    </div>
  )
}