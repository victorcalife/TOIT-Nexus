/**
 * SISTEMA DE BOTÕES COMPLETO - TOIT NEXUS
 * Sistema profissional de botões com todas as funcionalidades
 * 100% JavaScript - SEM TYPESCRIPT
 * 
 * FUNCIONALIDADES INCLUÍDAS:
 * - Múltiplas variantes (primary, secondary, outline, ghost, etc)
 * - Diferentes tamanhos (sm, default, lg, xl)
 * - Estados (loading, disabled, active)
 * - Botões com ícones
 * - Botões de ação (success, error, warning)
 * - Botões flutuantes (FAB)
 * - Grupos de botões
 * - Botões de toggle
 * - Acessibilidade completa
 */

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * VARIANTES DO BOTÃO
 */
const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        success: "bg-green-600 text-white hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800",
        warning: "bg-yellow-600 text-white hover:bg-yellow-700 dark:bg-yellow-700 dark:hover:bg-yellow-800",
        error: "bg-red-600 text-white hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800",
        info: "bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800",
        gradient: "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground hover:from-primary/90 hover:to-primary/70"
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        xl: "h-12 rounded-md px-10 text-base",
        icon: "h-10 w-10",
        "icon-sm": "h-8 w-8",
        "icon-lg": "h-12 w-12"
      },
      fullWidth: {
        true: "w-full",
        false: ""
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      fullWidth: false
    },
  }
)

/**
 * BOTÃO PRINCIPAL
 */
const Button = React.forwardRef(({ 
  className, 
  variant, 
  size, 
  fullWidth,
  asChild = false,
  loading = false,
  loadingText = "Carregando...",
  leftIcon,
  rightIcon,
  children,
  disabled,
  ...props 
}, ref) => {
  const Comp = asChild ? Slot : "button"
  
  return (
    <Comp
      className={cn(buttonVariants({ variant, size, fullWidth, className }))}
      ref={ref}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {loadingText}
        </>
      ) : (
        <>
          {leftIcon && <span className="mr-2">{leftIcon}</span>}
          {children}
          {rightIcon && <span className="ml-2">{rightIcon}</span>}
        </>
      )}
    </Comp>
  )
})
Button.displayName = "Button"

/**
 * BOTÃO COM ÍCONE
 */
const IconButton = React.forwardRef(({ 
  icon: Icon, 
  size = "icon",
  variant = "ghost",
  tooltip,
  className,
  ...props 
}, ref) => (
  <Button
    ref={ref}
    variant={variant}
    size={size}
    className={cn("shrink-0", className)}
    title={tooltip}
    {...props}
  >
    {Icon && <Icon className="h-4 w-4" />}
  </Button>
))
IconButton.displayName = "IconButton"

/**
 * BOTÃO FLUTUANTE (FAB)
 */
const FloatingButton = React.forwardRef(({ 
  icon: Icon,
  position = "bottom-right",
  size = "lg",
  variant = "default",
  className,
  ...props 
}, ref) => {
  const positionClasses = {
    "bottom-right": "fixed bottom-6 right-6",
    "bottom-left": "fixed bottom-6 left-6",
    "top-right": "fixed top-6 right-6",
    "top-left": "fixed top-6 left-6"
  }

  return (
    <Button
      ref={ref}
      variant={variant}
      size={size}
      className={cn(
        "rounded-full shadow-lg hover:shadow-xl transition-shadow z-50",
        positionClasses[position],
        className
      )}
      {...props}
    >
      {Icon && <Icon className="h-5 w-5" />}
    </Button>
  )
})
FloatingButton.displayName = "FloatingButton"

/**
 * GRUPO DE BOTÕES
 */
const ButtonGroup = React.forwardRef(({ 
  orientation = "horizontal",
  variant = "outline",
  size = "default",
  className,
  children,
  ...props 
}, ref) => {
  const orientationClasses = {
    horizontal: "flex-row",
    vertical: "flex-col"
  }

  return (
    <div
      ref={ref}
      className={cn(
        "inline-flex",
        orientationClasses[orientation],
        "[&>button]:rounded-none [&>button:first-child]:rounded-l-md [&>button:last-child]:rounded-r-md",
        orientation === "vertical" && "[&>button:first-child]:rounded-t-md [&>button:first-child]:rounded-l-md [&>button:last-child]:rounded-b-md [&>button:last-child]:rounded-r-md",
        "[&>button:not(:first-child)]:border-l-0",
        orientation === "vertical" && "[&>button:not(:first-child)]:border-l [&>button:not(:first-child)]:border-t-0",
        className
      )}
      {...props}
    >
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child) && child.type === Button) {
          return React.cloneElement(child, {
            variant: child.props.variant || variant,
            size: child.props.size || size
          })
        }
        return child
      })}
    </div>
  )
})
ButtonGroup.displayName = "ButtonGroup"

/**
 * BOTÃO DE TOGGLE
 */
const ToggleButton = React.forwardRef(({ 
  pressed = false,
  onPressedChange,
  variant = "outline",
  activeVariant = "default",
  className,
  children,
  ...props 
}, ref) => {
  const [isPressed, setIsPressed] = React.useState(pressed)

  React.useEffect(() => {
    setIsPressed(pressed)
  }, [pressed])

  const handleClick = (e) => {
    const newPressed = !isPressed
    setIsPressed(newPressed)
    onPressedChange?.(newPressed)
    props.onClick?.(e)
  }

  return (
    <Button
      ref={ref}
      variant={isPressed ? activeVariant : variant}
      className={cn(
        isPressed && "bg-accent text-accent-foreground",
        className
      )}
      onClick={handleClick}
      {...props}
    >
      {children}
    </Button>
  )
})
ToggleButton.displayName = "ToggleButton"

/**
 * BOTÃO DE AÇÃO RÁPIDA
 */
const ActionButton = React.forwardRef(({ 
  action = "save",
  loading = false,
  className,
  children,
  ...props 
}, ref) => {
  const actionConfig = {
    save: {
      variant: "default",
      loadingText: "Salvando..."
    },
    delete: {
      variant: "destructive", 
      loadingText: "Excluindo..."
    },
    cancel: {
      variant: "outline",
      loadingText: "Cancelando..."
    },
    submit: {
      variant: "default",
      loadingText: "Enviando..."
    },
    create: {
      variant: "success",
      loadingText: "Criando..."
    },
    update: {
      variant: "default",
      loadingText: "Atualizando..."
    }
  }

  const config = actionConfig[action] || actionConfig.save

  return (
    <Button
      ref={ref}
      variant={config.variant}
      loading={loading}
      loadingText={config.loadingText}
      className={className}
      {...props}
    >
      {children}
    </Button>
  )
})
ActionButton.displayName = "ActionButton"

/**
 * BOTÃO COM CONFIRMAÇÃO
 */
const ConfirmButton = React.forwardRef(({ 
  onConfirm,
  confirmText = "Tem certeza?",
  confirmVariant = "destructive",
  cancelText = "Cancelar",
  confirmButtonText = "Confirmar",
  showConfirm = false,
  className,
  children,
  ...props 
}, ref) => {
  const [isConfirming, setIsConfirming] = React.useState(showConfirm)

  const handleClick = () => {
    if (isConfirming) {
      onConfirm?.()
      setIsConfirming(false)
    } else {
      setIsConfirming(true)
    }
  }

  const handleCancel = () => {
    setIsConfirming(false)
  }

  if (isConfirming) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">{confirmText}</span>
        <Button
          ref={ref}
          variant={confirmVariant}
          size="sm"
          onClick={handleClick}
          className={className}
        >
          {confirmButtonText}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleCancel}
        >
          {cancelText}
        </Button>
      </div>
    )
  }

  return (
    <Button
      ref={ref}
      onClick={handleClick}
      className={className}
      {...props}
    >
      {children}
    </Button>
  )
})
ConfirmButton.displayName = "ConfirmButton"

/**
 * BOTÃO DE CÓPIA
 */
const CopyButton = React.forwardRef(({ 
  text,
  successText = "Copiado!",
  className,
  children,
  ...props 
}, ref) => {
  const [copied, setCopied] = React.useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Erro ao copiar:', err)
    }
  }

  return (
    <Button
      ref={ref}
      variant="outline"
      size="sm"
      onClick={handleCopy}
      className={className}
      {...props}
    >
      {copied ? successText : children}
    </Button>
  )
})
CopyButton.displayName = "CopyButton"

export {








  Button,
  IconButton,
  FloatingButton,
  ButtonGroup,
  ToggleButton,
  ActionButton,
  ConfirmButton,
  CopyButton,
  buttonVariants
}
