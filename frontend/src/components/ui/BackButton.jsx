import { useNavigate } from 'react'

export default function BackButton({ onClick, fallbackPath = '/dashboard', label = 'Back' }) {
  const navigate = useNavigate()

  const handleBack = () => {
    if (onClick) {
      onClick()
      return
    }
    // If window.history has more than 1 entry (current page), go back
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1)
    } else {
      navigate(fallbackPath, { replace: true })
    }
  }

  return (
    <button
      onClick={handleBack}
      className="flex items-center gap-2 text-surface-400 hover:text-white text-sm mb-6 transition-colors group"
    >
      <svg 
        className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" 
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
      </svg>
      {label}
    </button>
  )
}
