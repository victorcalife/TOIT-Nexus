/**
 * SISTEMA DE ALERTS COMPLETO - TOIT NEXUS
 * Sistema profissional de alertas com todas as funcionalidades
 */

import * as React from "react"
import { cva } from "class-variance-authority"
import { AlertCircle, CheckCircle, AlertTriangle, Info, X } from "lucide-react"
import { cn } from "@/lib/utils"

const alertVariants = cva(
  "relative w-full rounded-lg border p-4 transition-all duration-200 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground border-border",
        destructive: "border-red-200 bg-red-50 text-red-900 dark:border-red-800 dark:bg-red-900/20 dark:text-red-100 [&>svg]:text-red-600",
        success: "border-green-200 bg-green-50 text-green-900 dark:border-green-800 dark:bg-green-900/20 dark:text-green-100 [&>svg]:text-green-600",
        warning: "border-yellow-200 bg-yellow-50 text-yellow-900 dark:border-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-100 [&>svg]:text-yellow-600",
        info: "border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-100 [&>svg]:text-blue-600"
      },
      size: {
        sm: "p-3 text-sm",
        default: "p-4",
        lg: "p-6 text-base"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
)

const Alert = React.forwardRef(({
  className,
  variant,
  size,
  dismissible = false,
  onDismiss,
  autoHide = false,
  autoHideDelay = 5000,
  showIcon = true,
  children,
  ...props
}, ref) => {
  const [isVisible, setIsVisible] = React.useState(true)

  // Auto-hide functionality
  React.useEffect(() => {
    if (autoHide && autoHideDelay > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false)
        onDismiss?.()
      }, autoHideDelay)

      return () => clearTimeout(timer)
    }
  }, [autoHide, autoHideDelay, onDismiss])

  // Get icon based on variant
  const getIcon = () => {
    if (!showIcon) return null

    switch (variant) {
      case 'success':
        return <CheckCircle className="h-4 w-4" />
      case 'destructive':
        return <AlertCircle className="h-4 w-4" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4" />
      case 'info':
        return <Info className="h-4 w-4" />
      default:
        return <AlertCircle className="h-4 w-4" />
    }
  }

  if (!isVisible) return null

  return (
    <div
      ref={ref}
      role="alert"
      className={cn(alertVariants({ variant, size }), className)}
      {...props}
    >
      {getIcon()}
      <div className="flex-1">
        {children}
      </div>
      {dismissible && (
        <button
          onClick={() => {
            setIsVisible(false)
            onDismiss?.()
          }}
          className="absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  )
})
Alert.displayName = "Alert"

const AlertTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn("mb-1 font-medium leading-none tracking-tight", className)}
    {...props}
  />
))
AlertTitle.displayName = "AlertTitle"

const AlertDescription = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm [&_p]:leading-relaxed", className)}
    {...props}
  />
))
AlertDescription.displayName = "AlertDescription"

/**
 * HOOK PARA GERENCIAR ALERTS
 */
export const useAlerts = () => {
  const [alerts, setAlerts] = React.useState([])

  const addAlert = (alert) => {
    const id = Date.now()
    setAlerts(prev => [...prev, { ...alert, id }])

    if (alert.autoHide !== false) {
      setTimeout(() => {
        removeAlert(id)
      }, alert.duration || 5000)
    }

    return id
  }

  const removeAlert = (id) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id))
  }

  const clearAlerts = () => {
    setAlerts([])
  }

  const success = (message, options = {}) =>
    addAlert({ variant: 'success', message, ...options })

  const error = (message, options = {}) =>
    addAlert({ variant: 'destructive', message, ...options })

  const warning = (message, options = {}) =>
    addAlert({ variant: 'warning', message, ...options })

  const info = (message, options = {}) =>
    addAlert({ variant: 'info', message, ...options })

  return {
    alerts,
    addAlert,
    removeAlert,
    clearAlerts,
    success,
    error,
    warning,
    info
  }
}

export { Alert, AlertDescription, AlertTitle, alertVariants }