import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { AlertTriangle, Info, CheckCircle, X } from 'lucide-react'
import useStore from '../store/useStore'

const ICONS = {
  warning: AlertTriangle,
  info: Info,
  success: CheckCircle,
}

const COLORS = {
  warning: 'border-yellow-500/40 text-yellow-400',
  info: 'border-cyan-bright/40 text-cyan-neon',
  success: 'border-lime-neon/40 text-lime-neon',
}

const Notifications = () => {
  const { notifications, removeNotification } = useStore()

  return (
    <div className="absolute top-20 right-4 z-50 flex flex-col gap-2 w-72">
      <AnimatePresence>
        {notifications.map((n) => (
          <Notification key={n.id} notification={n} onRemove={removeNotification} />
        ))}
      </AnimatePresence>
    </div>
  )
}

const Notification = ({ notification, onRemove }) => {
  const { id, type = 'info', title, message, duration = 4000 } = notification
  const Icon = ICONS[type] || Info
  const colorClass = COLORS[type] || COLORS.info

  useEffect(() => {
    const timer = setTimeout(() => onRemove(id), duration)
    return () => clearTimeout(timer)
  }, [id, duration, onRemove])

  return (
    <motion.div
      initial={{ opacity: 0, x: 60 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 60 }}
      className={`glass-panel p-3 flex items-start gap-3 border ${colorClass}`}
    >
      <Icon className="w-4 h-4 mt-0.5 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        {title && <div className="text-xs font-bold tracking-wider mb-0.5">{title}</div>}
        {message && <div className="text-[11px] opacity-80">{message}</div>}
      </div>
      <button onClick={() => onRemove(id)} className="flex-shrink-0 opacity-50 hover:opacity-100 transition-opacity">
        <X className="w-3 h-3" />
      </button>
    </motion.div>
  )
}

export default Notifications
