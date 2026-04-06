import { forwardRef, useState } from 'react'

const Input = forwardRef(({ label, error, hint, icon, type = 'text', className = '', ...props }, ref) => {
  const [show, setShow] = useState(false)
  const isPw = type === 'password'
  const iType = isPw ? (show ? 'text' : 'password') : type

  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-medium text-surface-300">{label}</label>}
      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-500 pointer-events-none">
            {icon}
          </span>
        )}
        <input
          ref={ref} type={iType}
          className={[
            'w-full bg-surface-900 border rounded-xl text-sm text-surface-50 placeholder-surface-500 transition-all duration-150 focus-ring py-2.5',
            icon ? 'pl-10' : 'pl-3.5',
            isPw ? 'pr-10' : 'pr-3.5',
            error
              ? 'border-danger-500/60 focus:border-danger-500'
              : 'border-surface-700 hover:border-surface-600 focus:border-brand-500',
            className,
          ].join(' ')}
          {...props}
        />
        {isPw && (
          <button type="button" onClick={() => setShow(v => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-200 transition-colors">
            {show
              ? <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
              : <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
            }
          </button>
        )}
      </div>
      {error && <p className="text-xs text-danger-400">{error}</p>}
      {hint && !error && <p className="text-xs text-surface-500">{hint}</p>}
    </div>
  )
})

Input.displayName = 'Input'
export default Input