import { forwardRef } from 'react'

const Textarea = forwardRef(({ label, error, hint, rows = 4, className = '', ...props }, ref) => (
  <div className="flex flex-col gap-1.5">
    {label && <label className="text-sm font-medium text-surface-300">{label}</label>}
    <textarea
      ref={ref} rows={rows}
      className={[
        'w-full bg-surface-900 border rounded-xl text-sm text-surface-50 placeholder-surface-500 px-3.5 py-2.5 resize-none focus-ring transition-all duration-150',
        error
          ? 'border-danger-500/60 focus:border-danger-500'
          : 'border-surface-700 hover:border-surface-600 focus:border-brand-500',
        className,
      ].join(' ')}
      {...props}
    />
    {error && <p className="text-xs text-danger-400">{error}</p>}
    {hint && !error && <p className="text-xs text-surface-500">{hint}</p>}
  </div>
))

Textarea.displayName = 'Textarea'
export default Textarea