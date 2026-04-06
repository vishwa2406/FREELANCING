export default function Select({ label, error, options = [], className = '', ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-medium text-surface-300">{label}</label>}
      <select
        className={[
          'w-full bg-surface-900 border border-surface-700 hover:border-surface-600 focus:border-brand-500 rounded-xl text-sm text-surface-50 px-3.5 py-2.5 focus-ring transition-all duration-150 cursor-pointer',
          error ? 'border-danger-500/60' : '',
          className,
        ].join(' ')}
        {...props}
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value} className="bg-surface-900">
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-danger-400">{error}</p>}
    </div>
  )
}