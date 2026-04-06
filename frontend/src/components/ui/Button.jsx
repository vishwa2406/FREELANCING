import { motion } from 'framer-motion'
import { forwardRef } from 'react'

const variants = {
  primary:   'bg-brand-500 hover:bg-brand-600 text-white shadow-sm',
  secondary: 'bg-surface-800 hover:bg-surface-700 text-surface-100 border border-surface-700 hover:border-surface-600',
  ghost:     'hover:bg-surface-800 text-surface-300 hover:text-white',
  danger:    'bg-danger-600 hover:bg-danger-700 text-white',
  outline:   'border border-brand-500/50 hover:border-brand-400 text-brand-400 hover:bg-brand-500/10',
  success:   'bg-success-600 hover:bg-success-700 text-white',
}

const sizes = {
  xs: 'px-2.5 py-1 text-xs rounded-lg gap-1.5',
  sm: 'px-3 py-1.5 text-sm rounded-lg gap-1.5',
  md: 'px-4 py-2 text-sm rounded-xl gap-2',
  lg: 'px-5 py-2.5 text-base rounded-xl gap-2',
  xl: 'px-6 py-3 text-base rounded-2xl gap-2.5',
}

const Loader = () => (
  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
  </svg>
)

const Button = forwardRef(({
  children, variant = 'primary', size = 'md',
  loading = false, disabled = false,
  icon, iconRight, full = false, className = '', ...props
}, ref) => {
  const off = disabled || loading
  return (
    <motion.button
      ref={ref}
      whileTap={!off ? { scale: 0.97 } : {}}
      disabled={off}
      className={[
        'inline-flex items-center justify-center font-medium transition-all duration-150 select-none focus-ring',
        variants[variant] ?? variants.primary,
        sizes[size] ?? sizes.md,
        full ? 'w-full' : '',
        off ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
        className,
      ].join(' ')}
      {...props}
    >
      {loading ? <Loader /> : icon && <span className="shrink-0">{icon}</span>}
      {children}
      {iconRight && !loading && <span className="shrink-0">{iconRight}</span>}
    </motion.button>
  )
})

Button.displayName = 'Button'
export default Button