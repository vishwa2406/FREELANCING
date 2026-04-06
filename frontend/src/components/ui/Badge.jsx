const variants = {
  default:  'bg-surface-800 text-surface-300 border border-surface-700',
  brand:    'bg-brand-500/15 text-brand-400 border border-brand-500/30',
  success:  'bg-success-500/15 text-success-400 border border-success-500/30',
  warning:  'bg-warning-500/15 text-warning-400 border border-warning-500/30',
  danger:   'bg-danger-500/15 text-danger-400 border border-danger-500/30',
  beginner: 'bg-success-500/15 text-success-400 border border-success-500/30',
  intermediate: 'bg-warning-500/15 text-warning-400 border border-warning-500/30',
  advanced: 'bg-danger-500/15 text-danger-400 border border-danger-500/30',
}

export default function Badge({ children, variant = 'default', className = '' }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${variants[variant] ?? variants.default} ${className}`}>
      {children}
    </span>
  )
}