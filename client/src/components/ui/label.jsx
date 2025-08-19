/**
 * SISTEMA DE LABELS COMPLETO - TOIT NEXUS
 * Sistema profissional de labels/rótulos com todas as funcionalidades
 * 100% JavaScript - SEM TYPESCRIPT
 * 
 * FUNCIONALIDADES INCLUÍDAS:
 * - Labels básicos com acessibilidade
 * - Labels obrigatórios (com asterisco)
 * - Labels com tooltip/ajuda
 * - Labels com ícones
 * - Labels de diferentes tamanhos
 * - Labels com status (error, success, warning)
 * - Labels interativos
 * - Labels para formulários complexos
 * - Integração completa com form controls
 */

import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"
import { cva } from "class-variance-authority"
import { HelpCircle, AlertCircle, CheckCircle, AlertTriangle, Info } from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * VARIANTES DO LABEL
 */
const labelVariants = cva(
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
  {
    variants: {
      variant: {
        default: "text-foreground",
        muted: "text-muted-foreground",
        success: "text-green-700 dark:text-green-400",
        error: "text-red-700 dark:text-red-400",
        warning: "text-yellow-700 dark:text-yellow-400",
        info: "text-blue-700 dark:text-blue-400"
      },
      size: {
        sm: "text-xs",
        default: "text-sm",
        lg: "text-base",
        xl: "text-lg"
      },
      weight: {
        normal: "font-normal",
        medium: "font-medium",
        semibold: "font-semibold",
        bold: "font-bold"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      weight: "medium"
    }
  }
)

/**
 * LABEL PRINCIPAL
 */
const Label = React.forwardRef(({ 
  className, 
  variant,
  size,
  weight,
  required = false,
  optional = false,
  children,
  ...props 
}, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(labelVariants({ variant, size, weight }), className)}
    {...props}
  >
    {children}
    {required && <span className="text-red-500 ml-1">*</span>}
    {optional && <span className="text-muted-foreground ml-1 font-normal">(opcional)</span>}
  </LabelPrimitive.Root>
))
Label.displayName = LabelPrimitive.Root.displayName

/**
 * LABEL COM ÍCONE
 */
const IconLabel = React.forwardRef(({ 
  icon: Icon,
  iconPosition = "left",
  className,
  children,
  ...props 
}, ref) => (
  <Label
    ref={ref}
    className={cn("flex items-center gap-2", className)}
    {...props}
  >
    {iconPosition === "left" && Icon && <Icon className="h-4 w-4" />}
    {children}
    {iconPosition === "right" && Icon && <Icon className="h-4 w-4" />}
  </Label>
))
IconLabel.displayName = "IconLabel"

/**
 * LABEL COM TOOLTIP/AJUDA
 */
const HelpLabel = React.forwardRef(({ 
  help,
  helpPosition = "right",
  className,
  children,
  ...props 
}, ref) => (
  <div className="flex items-center gap-2">
    <Label
      ref={ref}
      className={className}
      {...props}
    >
      {children}
    </Label>
    {help && (
      <div className="group relative">
        <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-popover text-popover-foreground text-xs rounded-md shadow-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
          {help}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-popover"></div>
        </div>
      </div>
    )}
  </div>
))
HelpLabel.displayName = "HelpLabel"

/**
 * LABEL DE STATUS
 */
const StatusLabel = React.forwardRef(({ 
  status = "default",
  showIcon = true,
  message,
  className,
  children,
  ...props 
}, ref) => {
  const statusConfig = {
    success: {
      variant: "success",
      icon: CheckCircle,
      iconColor: "text-green-500"
    },
    error: {
      variant: "error",
      icon: AlertCircle,
      iconColor: "text-red-500"
    },
    warning: {
      variant: "warning",
      icon: AlertTriangle,
      iconColor: "text-yellow-500"
    },
    info: {
      variant: "info",
      icon: Info,
      iconColor: "text-blue-500"
    },
    default: {
      variant: "default",
      icon: null,
      iconColor: ""
    }
  }

  const config = statusConfig[status] || statusConfig.default
  const Icon = config.icon

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <Label
          ref={ref}
          variant={config.variant}
          className={className}
          {...props}
        >
          {children}
        </Label>
        {showIcon && Icon && (
          <Icon className={cn("h-4 w-4", config.iconColor)} />
        )}
      </div>
      {message && (
        <p className={cn(
          "text-xs",
          config.variant === "error" && "text-red-600 dark:text-red-400",
          config.variant === "success" && "text-green-600 dark:text-green-400",
          config.variant === "warning" && "text-yellow-600 dark:text-yellow-400",
          config.variant === "info" && "text-blue-600 dark:text-blue-400",
          config.variant === "default" && "text-muted-foreground"
        )}>
          {message}
        </p>
      )}
    </div>
  )
})
StatusLabel.displayName = "StatusLabel"

/**
 * LABEL DE FORMULÁRIO COMPLETO
 */
const FormLabel = React.forwardRef(({ 
  label,
  description,
  required = false,
  optional = false,
  error,
  success,
  warning,
  info,
  help,
  className,
  children,
  ...props 
}, ref) => {
  // Determinar status baseado nas props
  let status = "default"
  let message = ""
  
  if (error) {
    status = "error"
    message = error
  } else if (success) {
    status = "success" 
    message = success
  } else if (warning) {
    status = "warning"
    message = warning
  } else if (info) {
    status = "info"
    message = info
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <StatusLabel
            ref={ref}
            status={status}
            showIcon={false}
            required={required}
            optional={optional}
            className={className}
            {...props}
          >
            {label || children}
          </StatusLabel>
          {help && (
            <div className="group relative">
              <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-popover text-popover-foreground text-xs rounded-md shadow-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 max-w-xs">
                {help}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-popover"></div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {description && (
        <p className="text-xs text-muted-foreground">
          {description}
        </p>
      )}
      
      {message && (
        <p className={cn(
          "text-xs",
          status === "error" && "text-red-600 dark:text-red-400",
          status === "success" && "text-green-600 dark:text-green-400", 
          status === "warning" && "text-yellow-600 dark:text-yellow-400",
          status === "info" && "text-blue-600 dark:text-blue-400"
        )}>
          {message}
        </p>
      )}
    </div>
  )
})
FormLabel.displayName = "FormLabel"

/**
 * LABEL FLUTUANTE (FLOATING LABEL)
 */
const FloatingLabel = React.forwardRef(({ 
  label,
  focused = false,
  hasValue = false,
  className,
  ...props 
}, ref) => (
  <Label
    ref={ref}
    className={cn(
      "absolute left-3 transition-all duration-200 pointer-events-none",
      (focused || hasValue) 
        ? "top-2 text-xs text-primary" 
        : "top-1/2 -translate-y-1/2 text-sm text-muted-foreground",
      className
    )}
    {...props}
  >
    {label}
  </Label>
))
FloatingLabel.displayName = "FloatingLabel"

/**
 * GRUPO DE LABELS (FIELDSET)
 */
const LabelGroup = React.forwardRef(({ 
  legend,
  description,
  required = false,
  className,
  children,
  ...props 
}, ref) => (
  <fieldset
    ref={ref}
    className={cn("space-y-4", className)}
    {...props}
  >
    {legend && (
      <legend className="text-base font-semibold">
        {legend}
        {required && <span className="text-red-500 ml-1">*</span>}
      </legend>
    )}
    {description && (
      <p className="text-sm text-muted-foreground -mt-2">
        {description}
      </p>
    )}
    <div className="space-y-3">
      {children}
    </div>
  </fieldset>
))
LabelGroup.displayName = "LabelGroup"

/**
 * HOOK PARA GERENCIAR ESTADO DE LABELS
 */
export const useLabel = (initialState = {}) => {
  const [labelState, setLabelState] = React.useState({
    focused: false,
    hasValue: false,
    error: null,
    success: null,
    ...initialState
  })

  const setFocused = (focused) => {
    setLabelState(prev => ({ ...prev, focused }))
  }

  const setHasValue = (hasValue) => {
    setLabelState(prev => ({ ...prev, hasValue }))
  }

  const setError = (error) => {
    setLabelState(prev => ({ ...prev, error, success: null }))
  }

  const setSuccess = (success) => {
    setLabelState(prev => ({ ...prev, success, error: null }))
  }

  const clearStatus = () => {
    setLabelState(prev => ({ ...prev, error: null, success: null }))
  }

  return {
    ...labelState,
    setFocused,
    setHasValue,
    setError,
    setSuccess,
    clearStatus
  }
}

export {
  Label,
  IconLabel,
  HelpLabel,
  StatusLabel,
  FormLabel,
  FloatingLabel,
  LabelGroup,
  labelVariants
}
