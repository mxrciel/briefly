'use client'

import * as React from 'react'
import { cn } from '~/lib/utils'
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'

interface ToastProps {
  id: string
  message: string
  variant?: 'success' | 'error' | 'info' | 'warning'
  onDismiss: (id: string) => void
}

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
  warning: AlertTriangle,
}

const Toast: React.FC<ToastProps> = ({ id, message, variant = 'info', onDismiss }) => {
  const Icon = icons[variant]

  const variants = {
    success: 'border-green-500/30 bg-green-500/10',
    error: 'border-red-500/30 bg-red-500/10',
    info: 'border-blue-500/30 bg-blue-500/10',
    warning: 'border-yellow-500/30 bg-yellow-500/10',
  }

  const iconColors = {
    success: 'text-green-400',
    error: 'text-red-400',
    info: 'text-blue-400',
    warning: 'text-yellow-400',
  }

  React.useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(id)
    }, 4000)
    return () => clearTimeout(timer)
  }, [id, onDismiss])

  return (
    <div
      className={cn(
        'pointer-events-auto flex w-80 items-center gap-3 rounded-lg border p-4 shadow-lg',
        'animate-slide-up bg-surface border-border'
      )}
    >
      <Icon className={cn('h-5 w-5 flex-shrink-0', iconColors[variant])} />
      <p className="flex-1 text-sm text-cream">{message}</p>
      <button
        onClick={() => onDismiss(id)}
        className="text-grey hover:text-cream transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}

interface ToastContextValue {
  addToast: (message: string, variant?: 'success' | 'error' | 'info' | 'warning') => void
}

const ToastContext = React.createContext<ToastContextValue | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Array<{ id: string; message: string; variant: 'success' | 'error' | 'info' | 'warning' }>>([])

  const addToast = React.useCallback((message: string, variant: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    const id = Math.random().toString(36).substring(7)
    setToasts((prev) => [...prev, { id, message, variant }])
  }, [])

  const dismissToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((toast) => (
          <Toast key={toast.id} {...toast} onDismiss={dismissToast} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = React.useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}
