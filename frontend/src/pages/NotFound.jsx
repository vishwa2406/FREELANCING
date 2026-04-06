import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-surface-950 flex items-center justify-center p-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="text-center">
        <div className="text-8xl font-bold gradient-text mb-4 select-none">404</div>
        <h1 className="text-2xl font-bold text-white mb-2">Page not found</h1>
        <p className="text-surface-400 text-sm mb-8">The page you're looking for doesn't exist.</p>
        <Link to="/dashboard"
          className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-medium px-5 py-2.5 rounded-xl transition-all">
          ← Back to Dashboard
        </Link>
      </motion.div>
    </div>
  )
}
