/**
 * SISTEMA DE TOAST COMPLETO - TOIT NEXUS
 * Sistema de notificações toast profissional com todas as funcionalidades
 * 100% JavaScript - SEM TYPESCRIPT
 * 
 * FUNCIONALIDADES INCLUÍDAS:
 * - Múltiplos tipos: success, error, warning, info
 * - Posicionamento configurável
 * - Auto-dismiss configurável
 * - Ações personalizadas
 * - Animações suaves
 * - Acessibilidade completa
 * - Integração com sistema de notificações
 */

import * as React from "react"
import * as ToastPrimitives from "@radix-ui/react-toast"
import { cva } from "class-variance-authority"
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * CONFIGURAÇÕES DO TOAST
 */
const TOAST_CONFIG = {
  DURATION: {
    SHORT: 3000,
    MEDIUM: 5000,
    LONG: 8000,
    PERSISTENT: 0
  },
  POSITIONS: {
    TOP_LEFT: 'top-left',
    TOP_CENTER: 'top-center',
    TOP_RIGHT: 'top-right',
    BOTTOM_LEFT: 'bottom-left',
    BOTTOM_CENTER: 'bottom-center',
    BOTTOM_RIGHT: 'bottom-right'
  },
  TYPES: {
    SUCCESS: 'success',
    ERROR: 'error',
    WARNING: 'warning',
    INFO: 'info',
    DEFAULT: 'default'
  }
}

/**
 * VARIANTES DO TOAST
 */
const toastVariants = cva(
  "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full",
  {
    variants: {
      variant: {
        default: "border bg-background text-foreground",
        success: "border-green-200 bg-green-50 text-green-900 dark:border-green-800 dark:bg-green-900/20 dark:text-green-100",
        error: "border-red-200 bg-red-50 text-red-900 dark:border-red-800 dark:bg-red-900/20 dark:text-red-100",
        warning: "border-yellow-200 bg-yellow-50 text-yellow-900 dark:border-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-100",
        info: "border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-100",
        destructive: "destructive group border-destructive bg-destructive text-destructive-foreground"
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

/**
 * PROVIDER DO TOAST
 */
const ToastProvider = ToastPrimitives.Provider

/**
 * VIEWPORT DO TOAST
 */
const ToastViewport = React.forwardRef(({ className, position = 'top-right', ...props }, ref) => {
  const positionClasses = {
    'top-left': 'top-0 left-0',
    'top-center': 'top-0 left-1/2 -translate-x-1/2',
    'top-right': 'top-0 right-0',
    'bottom-left': 'bottom-0 left-0',
    'bottom-center': 'bottom-0 left-1/2 -translate-x-1/2',
    'bottom-right': 'bottom-0 right-0'
  }

  return (
    <ToastPrimitives.Viewport
      ref={ref}
      className={cn(
        "fixed z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:max-w-[420px]",
        positionClasses[position] || positionClasses['top-right'],
        className
      )}
      {...props}
    />
  )
})
ToastViewport.displayName = ToastPrimitives.Viewport.displayName

/**
 * COMPONENTE TOAST PRINCIPAL
 */
const Toast = React.forwardRef(({ className, variant, ...props }, ref) => {
  return (
    <ToastPrimitives.Root
      ref={ref}
      className={cn(toastVariants({ variant }), className)}
      {...props}
    />
  )
})
Toast.displayName = ToastPrimitives.Root.displayName

/**
 * AÇÃO DO TOAST
 */
const ToastAction = React.forwardRef(({ className, ...props }, ref) => (
  <ToastPrimitives.Action
    ref={ref}
    className={cn(
      "inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium ring-offset-background transition-colors hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 group-[.destructive]:border-muted/40 group-[.destructive]:hover:border-destructive/30 group-[.destructive]:hover:bg-destructive group-[.destructive]:hover:text-destructive-foreground group-[.destructive]:focus:ring-destructive",
      className
    )}
    {...props}
  />
))
ToastAction.displayName = ToastPrimitives.Action.displayName

/**
 * BOTÃO DE FECHAR
 */
const ToastClose = React.forwardRef(({ className, ...props }, ref) => (
  <ToastPrimitives.Close
    ref={ref}
    className={cn(
      "absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100 group-[.destructive]:text-red-300 group-[.destructive]:hover:text-red-50 group-[.destructive]:focus:ring-red-400 group-[.destructive]:focus:ring-offset-red-600",
      className
    )}
    toast-close=""
    {...props}
  >
    <X className="h-4 w-4" />
  </ToastPrimitives.Close>
))
ToastClose.displayName = ToastPrimitives.Close.displayName

/**
 * TÍTULO DO TOAST
 */
const ToastTitle = React.forwardRef(({ className, ...props }, ref) => (
  <ToastPrimitives.Title
    ref={ref}
    className={cn("text-sm font-semibold", className)}
    {...props}
  />
))
ToastTitle.displayName = ToastPrimitives.Title.displayName

/**
 * DESCRIÇÃO DO TOAST
 */
const ToastDescription = React.forwardRef(({ className, ...props }, ref) => (
  <ToastPrimitives.Description
    ref={ref}
    className={cn("text-sm opacity-90", className)}
    {...props}
  />
))
ToastDescription.displayName = ToastPrimitives.Description.displayName

/**
 * ÍCONES POR TIPO
 */
const ToastIcon = ({ variant, className }) => {
  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info,
    default: null
  }

  const Icon = icons[variant]
  if (!Icon) return null

  const iconColors = {
    success: "text-green-600 dark:text-green-400",
    error: "text-red-600 dark:text-red-400",
    warning: "text-yellow-600 dark:text-yellow-400",
    info: "text-blue-600 dark:text-blue-400"
  }

  return (
    <Icon 
      className={cn(
        "h-5 w-5 shrink-0",
        iconColors[variant],
        className
      )} 
    />
  )
}

/**
 * TOAST COMPLETO COM ÍCONE
 */
const ToastComplete = React.forwardRef(({ 
  variant = 'default', 
  title, 
  description, 
  action, 
  onClose,
  duration = TOAST_CONFIG.DURATION.MEDIUM,
  showIcon = true,
  className,
  ...props 
}, ref) => {
  return (
    <Toast ref={ref} variant={variant} duration={duration} className={className} {...props}>
      <div className="flex items-start space-x-3">
        {showIcon && <ToastIcon variant={variant} />}
        <div className="flex-1 space-y-1">
          {title && <ToastTitle>{title}</ToastTitle>}
          {description && <ToastDescription>{description}</ToastDescription>}
        </div>
      </div>
      {action && <ToastAction>{action}</ToastAction>}
      <ToastClose onClick={onClose} />
    </Toast>
  )
})
ToastComplete.displayName = "ToastComplete"

/**
 * HOOK PARA TOAST TIPADO
 */
export const useTypedToast = () => {
  const { toast } = useToast()

  return {
    success: (title, description, options = {}) => 
      toast({
        variant: 'success',
        title,
        description,
        duration: TOAST_CONFIG.DURATION.MEDIUM,
        ...options
      }),
    
    error: (title, description, options = {}) => 
      toast({
        variant: 'error',
        title,
        description,
        duration: TOAST_CONFIG.DURATION.LONG,
        ...options
      }),
    
    warning: (title, description, options = {}) => 
      toast({
        variant: 'warning',
        title,
        description,
        duration: TOAST_CONFIG.DURATION.MEDIUM,
        ...options
      }),
    
    info: (title, description, options = {}) => 
      toast({
        variant: 'info',
        title,
        description,
        duration: TOAST_CONFIG.DURATION.MEDIUM,
        ...options
      }),
    
    loading: (title, description = 'Processando...') => 
      toast({
        variant: 'info',
        title,
        description,
        duration: TOAST_CONFIG.DURATION.PERSISTENT
      }),
    
    promise: async (promise, messages) => {
      const loadingToast = toast({
        variant: 'info',
        title: messages.loading || 'Carregando...',
        duration: TOAST_CONFIG.DURATION.PERSISTENT
      })

      try {
        const result = await promise
        loadingToast.dismiss()
        toast({
          variant: 'success',
          title: messages.success || 'Sucesso!',
          duration: TOAST_CONFIG.DURATION.MEDIUM
        })
        return result
      } catch (error) {
        loadingToast.dismiss()
        toast({
          variant: 'error',
          title: messages.error || 'Erro!',
          description: error.message,
          duration: TOAST_CONFIG.DURATION.LONG
        })
        throw error
      }
    }
  }
}

export {









  TOAST_CONFIG,
  toastVariants
}
