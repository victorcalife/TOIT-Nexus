/**
 * SISTEMA DE BADGES COMPLETO - TOIT NEXUS
 * Sistema profissional de badges/etiquetas com todas as funcionalidades
 * 100% JavaScript - SEM TYPESCRIPT
 * 
 * FUNCIONALIDADES INCLUÍDAS:
 * - Múltiplas variantes (default, secondary, destructive, outline)
 * - Badges de status (success, error, warning, info, pending)
 * - Badges interativos (clicáveis, removíveis)
 * - Badges com ícones
 * - Badges de contagem/número
 * - Badges de progresso
 * - Diferentes tamanhos
 * - Badges animados
 * - Sistema de cores personalizadas
 */

import * as React from "react"
import { cva } from "class-variance-authority"
import { X, Check, AlertCircle, AlertTriangle, Info, Clock } from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * VARIANTES DO BADGE
 */
const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground border-border",
        success: "border-transparent bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
        error: "border-transparent bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100",
        warning: "border-transparent bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100",
        info: "border-transparent bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100",
        pending: "border-transparent bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100",
        gradient: "border-transparent bg-gradient-to-r from-primary to-primary/80 text-primary-foreground"
      },
      size: {
        sm: "px-2 py-0.5 text-xs",
        default: "px-2.5 py-0.5 text-xs",
        lg: "px-3 py-1 text-sm",
        xl: "px-4 py-1.5 text-base"
      },
      interactive: {
        true: "cursor-pointer hover:scale-105 active:scale-95 transition-transform",
        false: ""
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      interactive: false
    },
  }
)

/**
 * BADGE PRINCIPAL
 */
const Badge = React.forwardRef(({ 
  className, 
  variant, 
  size,
  interactive,
  onClick,
  children,
  ...props 
}, ref) => (
  <div
    ref={ref}
    className={cn(
      badgeVariants({ variant, size, interactive: !!onClick || interactive }),
      className
    )}
    onClick={onClick}
    {...props}
  >
    {children}
  </div>
))
Badge.displayName = "Badge"

/**
 * BADGE COM ÍCONE
 */
const IconBadge = React.forwardRef(({ 
  icon: Icon,
  variant = "default",
  size = "default",
  className,
  children,
  ...props 
}, ref) => (
  <Badge
    ref={ref}
    variant={variant}
    size={size}
    className={cn("gap-1", className)}
    {...props}
  >
    {Icon && <Icon className="h-3 w-3" />}
    {children}
  </Badge>
))
IconBadge.displayName = "IconBadge"

/**
 * BADGE DE STATUS
 */
const StatusBadge = React.forwardRef(({ 
  status = "default",
  showIcon = true,
  className,
  children,
  ...props 
}, ref) => {
  const statusConfig = {
    success: {
      variant: "success",
      icon: Check,
      text: children || "Sucesso"
    },
    error: {
      variant: "error", 
      icon: AlertCircle,
      text: children || "Erro"
    },
    warning: {
      variant: "warning",
      icon: AlertTriangle,
      text: children || "Atenção"
    },
    info: {
      variant: "info",
      icon: Info,
      text: children || "Info"
    },
    pending: {
      variant: "pending",
      icon: Clock,
      text: children || "Pendente"
    },
    default: {
      variant: "default",
      icon: null,
      text: children || "Status"
    }
  }

  const config = statusConfig[status] || statusConfig.default
  const Icon = config.icon

  return (
    <Badge
      ref={ref}
      variant={config.variant}
      className={cn("gap-1", className)}
      {...props}
    >
      {showIcon && Icon && <Icon className="h-3 w-3" />}
      {config.text}
    </Badge>
  )
})
StatusBadge.displayName = "StatusBadge"

/**
 * BADGE REMOVÍVEL
 */
const RemovableBadge = React.forwardRef(({ 
  onRemove,
  variant = "secondary",
  className,
  children,
  ...props 
}, ref) => (
  <Badge
    ref={ref}
    variant={variant}
    className={cn("pr-1 gap-1", className)}
    {...props}
  >
    <span>{children}</span>
    {onRemove && (
      <button
        onClick={(e) => {
          e.stopPropagation()
          onRemove()
        }}
        className="ml-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10 p-0.5 transition-colors"
      >
        <X className="h-3 w-3" />
      </button>
    )}
  </Badge>
))
RemovableBadge.displayName = "RemovableBadge"

/**
 * BADGE DE CONTAGEM
 */
const CountBadge = React.forwardRef(({ 
  count = 0,
  max = 99,
  showZero = false,
  variant = "destructive",
  size = "sm",
  className,
  ...props 
}, ref) => {
  if (count === 0 && !showZero) return null

  const displayCount = count > max ? `${max}+` : count.toString()

  return (
    <Badge
      ref={ref}
      variant={variant}
      size={size}
      className={cn(
        "min-w-[1.25rem] h-5 px-1 justify-center rounded-full",
        className
      )}
      {...props}
    >
      {displayCount}
    </Badge>
  )
})
CountBadge.displayName = "CountBadge"

/**
 * BADGE DE PROGRESSO
 */
const ProgressBadge = React.forwardRef(({ 
  progress = 0,
  showPercentage = true,
  variant = "default",
  className,
  ...props 
}, ref) => {
  const percentage = Math.min(Math.max(progress, 0), 100)
  
  return (
    <Badge
      ref={ref}
      variant={variant}
      className={cn("relative overflow-hidden", className)}
      {...props}
    >
      <div 
        className="absolute inset-0 bg-white/20 transition-all duration-300"
        style={{ width: `${percentage}%` }}
      />
      <span className="relative z-10">
        {showPercentage ? `${Math.round(percentage)}%` : `${progress}`}
      </span>
    </Badge>
  )
})
ProgressBadge.displayName = "ProgressBadge"

/**
 * BADGE ANIMADO
 */
const AnimatedBadge = React.forwardRef(({ 
  animation = "pulse",
  variant = "default",
  className,
  children,
  ...props 
}, ref) => {
  const animationClasses = {
    pulse: "animate-pulse",
    bounce: "animate-bounce",
    ping: "animate-ping",
    spin: "animate-spin",
    wiggle: "animate-bounce"
  }

  return (
    <Badge
      ref={ref}
      variant={variant}
      className={cn(animationClasses[animation], className)}
      {...props}
    >
      {children}
    </Badge>
  )
})
AnimatedBadge.displayName = "AnimatedBadge"

/**
 * BADGE DOT (INDICADOR)
 */
const DotBadge = React.forwardRef(({ 
  variant = "destructive",
  size = "sm",
  className,
  ...props 
}, ref) => (
  <Badge
    ref={ref}
    variant={variant}
    size={size}
    className={cn(
      "w-2 h-2 p-0 rounded-full min-w-0",
      className
    )}
    {...props}
  />
))
DotBadge.displayName = "DotBadge"

/**
 * GRUPO DE BADGES
 */
const BadgeGroup = React.forwardRef(({ 
  spacing = "sm",
  wrap = true,
  className,
  children,
  ...props 
}, ref) => {
  const spacingClasses = {
    xs: "gap-1",
    sm: "gap-2", 
    md: "gap-3",
    lg: "gap-4"
  }

  return (
    <div
      ref={ref}
      className={cn(
        "flex items-center",
        spacingClasses[spacing],
        wrap && "flex-wrap",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
})
BadgeGroup.displayName = "BadgeGroup"

/**
 * BADGE PERSONALIZADO COM COR
 */
const ColorBadge = React.forwardRef(({ 
  color = "#3b82f6",
  textColor = "white",
  className,
  children,
  ...props 
}, ref) => (
  <Badge
    ref={ref}
    className={cn("border-transparent", className)}
    style={{
      backgroundColor: color,
      color: textColor
    }}
    {...props}
  >
    {children}
  </Badge>
))
ColorBadge.displayName = "ColorBadge"

/**
 * HOOK PARA GERENCIAR BADGES
 */
export const useBadges = (initialBadges = []) => {
  const [badges, setBadges] = React.useState(initialBadges)

  const addBadge = (badge) => {
    setBadges(prev => [...prev, { ...badge, id: Date.now() }])
  }

  const removeBadge = (id) => {
    setBadges(prev => prev.filter(badge => badge.id !== id))
  }

  const clearBadges = () => {
    setBadges([])
  }

  const updateBadge = (id, updates) => {
    setBadges(prev => prev.map(badge => 
      badge.id === id ? { ...badge, ...updates } : badge
    ))
  }

  return {
    badges,
    addBadge,
    removeBadge,
    clearBadges,
    updateBadge
  }
}

export {
  Badge,
  IconBadge,
  StatusBadge,
  RemovableBadge,
  CountBadge,
  ProgressBadge,
  AnimatedBadge,
  DotBadge,
  BadgeGroup,
  ColorBadge,
  badgeVariants
}
