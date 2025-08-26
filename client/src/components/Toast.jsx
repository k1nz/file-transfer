import React, { createContext, useContext, useState } from 'react'
import { CheckCircle, AlertCircle, X } from 'lucide-react'

const ToastContext = createContext()

export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([])

  const showToast = ({ title, description, type = 'info', duration = 5000 }) => {
    const id = Math.random().toString(36).substr(2, 9)
    const toast = { id, title, description, type }
    
    setToasts(prev => [...prev, toast])

    // 自动移除 toast
    setTimeout(() => {
      removeToast(id)
    }, duration)
  }

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }

  const getToastIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />
      default:
        return <AlertCircle className="h-5 w-5 text-blue-500" />
    }
  }

  const getToastStyles = (type) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200'
      case 'error':
        return 'bg-red-50 border-red-200'
      default:
        return 'bg-blue-50 border-blue-200'
    }
  }

  return (
    <ToastContext.Provider value={{ showToast, removeToast }}>
      {children}
      
      {/* Toast 容器 */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`
              max-w-md w-full bg-white rounded-lg border shadow-lg p-4
              transform transition-all duration-300 ease-in-out
              ${getToastStyles(toast.type)}
            `}
          >
            <div className="flex items-start">
              <div className="flex-shrink-0">
                {getToastIcon(toast.type)}
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-800">
                  {toast.title}
                </p>
                {toast.description && (
                  <p className="text-sm text-gray-600 mt-1">
                    {toast.description}
                  </p>
                )}
              </div>
              <div className="ml-4 flex-shrink-0">
                <button
                  onClick={() => removeToast(toast.id)}
                  className="inline-flex text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
