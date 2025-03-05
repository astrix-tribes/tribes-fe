import React, { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react'
import { cn } from '../utils/cn'

export type NotificationType = 'success' | 'error' | 'info' | 'warning'

interface NotificationToastProps {
  message: string
  type: NotificationType
  isVisible: boolean
  onClose: () => void
  duration?: number
}

const getIcon = (type: NotificationType) => {
  switch (type) {
    case 'success':
      return <CheckCircle className="w-5 h-5" />
    case 'error':
      return <AlertCircle className="w-5 h-5" />
    case 'warning':
      return <AlertTriangle className="w-5 h-5" />
    case 'info':
      return <Info className="w-5 h-5" />
  }
}

const toastVariants = {
  success: 'bg-success-main/20 text-success-main border-success-main/20',
  error: 'bg-destructive/20 text-destructive border-destructive/20',
  warning: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/20',
  info: 'bg-blue-500/20 text-blue-500 border-blue-500/20',
}

export const NotificationToast: React.FC<NotificationToastProps> = ({
  message,
  type,
  isVisible,
  onClose,
  duration = 3000
}) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose()
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [isVisible, duration, onClose])

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-4 right-4 z-50"
        >
          <div
            className={cn(
              'flex items-center space-x-3 px-4 py-3 rounded-lg border backdrop-blur-sm shadow-lg',
              toastVariants[type]
            )}
          >
            {getIcon(type)}
            <span className="text-sm font-medium">{message}</span>
            <button
              onClick={onClose}
              className="ml-2 hover:opacity-70 transition-opacity"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
} 