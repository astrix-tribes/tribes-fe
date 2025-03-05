import React, { createContext, useContext, useState, useCallback } from 'react'
import { NotificationToast, NotificationType } from '../components/NotificationToast'

interface NotificationContextType {
  showNotification: (message: string, type: NotificationType) => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export const useNotification = () => {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider')
  }
  return context
}

interface NotificationProviderProps {
  children: React.ReactNode
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notification, setNotification] = useState<{
    message: string
    type: NotificationType
    isVisible: boolean
  }>({
    message: '',
    type: 'info',
    isVisible: false
  })

  const showNotification = useCallback((message: string, type: NotificationType) => {
    setNotification({
      message,
      type,
      isVisible: true
    })
  }, [])

  const hideNotification = useCallback(() => {
    setNotification(prev => ({
      ...prev,
      isVisible: false
    }))
  }, [])

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      <NotificationToast
        message={notification.message}
        type={notification.type}
        isVisible={notification.isVisible}
        onClose={hideNotification}
      />
    </NotificationContext.Provider>
  )
} 