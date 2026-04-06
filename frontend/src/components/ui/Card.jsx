import { motion } from 'framer-motion'

export default function Card({ children, className = '', hover = false, onClick, padding = 'p-5' }) {
  return (
    <motion.div
      whileHover={hover ? { y: -2 } : {}}
      onClick={onClick}
      className={[
        'glass-dark rounded-2xl',
        padding,
        onClick ? 'cursor-pointer' : '',
        className,
      ].join(' ')}
    >
      {children}
    </motion.div>
  )
}

export function StatCard({ label, value, icon, change, color = 'brand' }) {
  const colors = {
    brand:   'from-brand-500/20 to-brand-600/5 text-brand-400',
    success: 'from-success-500/20 to-success-600/5 text-success-400',
    warning: 'from-warning-500/20 to-warning-600/5 text-warning-400',
    danger:  'from-danger-500/20 to-danger-600/5 text-danger-400',
  }
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      className="glass-dark rounded-2xl p-5 flex items-start gap-4">
      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${colors[color]} flex items-center justify-center shrink-0`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-surface-400 font-medium uppercase tracking-wider mb-1">{label}</p>
        <p className="text-2xl font-bold text-white">{value}</p>
        {change != null && (
          <p className={`text-xs mt-1 ${change >= 0 ? 'text-success-400' : 'text-danger-400'}`}>
            {change >= 0 ? '↑' : '↓'} {Math.abs(change)}% this month
          </p>
        )}
      </div>
    </motion.div>
  )
}