/**
 * SISTEMA DE CARDS COMPLETO - TOIT NEXUS
 * Componentes de card profissionais com todas as funcionalidades
 * 100% JavaScript - SEM TYPESCRIPT
 * 
 * FUNCIONALIDADES INCLUÍDAS:
 * - Card básico responsivo
 * - Card com header, content, footer
 * - Card com ações
 * - Card com loading state
 * - Card com status (success, error, warning)
 * - Card interativo (hover, click)
 * - Card com imagem
 * - Card estatístico (KPIs)
 * - Card de notificação
 * - Variações de tamanho e estilo
 */

import * as React from "react"
import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"

/**
 * VARIANTES DO CARD
 */
const cardVariants = cva(
  "rounded-lg border bg-card text-card-foreground shadow-sm transition-all duration-200",
  {
    variants: {
      variant: {
        default: "border-border",
        outlined: "border-2 border-border",
        elevated: "shadow-md hover:shadow-lg",
        flat: "shadow-none border-0 bg-muted/50",
        success: "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20",
        error: "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20",
        warning: "border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20",
        info: "border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20"
      },
      size: {
        sm: "p-3",
        default: "p-6",
        lg: "p-8",
        xl: "p-10"
      },
      interactive: {
        true: "cursor-pointer hover:shadow-md hover:scale-[1.02] active:scale-[0.98]",
        false: ""
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      interactive: false
    }
  }
)

/**
 * CARD PRINCIPAL
 */
const Card = React.forwardRef(({ 
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
      cardVariants({ variant, size, interactive: !!onClick || interactive }),
      className
    )}
    onClick={onClick}
    {...props}
  >
    {children}
  </div>
))
Card.displayName = "Card"

/**
 * HEADER DO CARD
 */
const CardHeader = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

/**
 * TÍTULO DO CARD
 */
const CardTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

/**
 * DESCRIÇÃO DO CARD
 */
const CardDescription = React.forwardRef(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

/**
 * CONTEÚDO DO CARD
 */
const CardContent = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

/**
 * FOOTER DO CARD
 */
const CardFooter = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

/**
 * CARD COM LOADING
 */
const CardLoading = React.forwardRef(({ className, ...props }, ref) => (
  <Card ref={ref} className={cn("animate-pulse", className)} {...props}>
    <CardHeader>
      <div className="h-4 bg-muted rounded w-3/4"></div>
      <div className="h-3 bg-muted rounded w-1/2"></div>
    </CardHeader>
    <CardContent>
      <div className="space-y-2">
        <div className="h-3 bg-muted rounded"></div>
        <div className="h-3 bg-muted rounded w-5/6"></div>
        <div className="h-3 bg-muted rounded w-4/6"></div>
      </div>
    </CardContent>
  </Card>
))
CardLoading.displayName = "CardLoading"

/**
 * CARD ESTATÍSTICO (KPI)
 */
const CardStats = React.forwardRef(({ 
  title, 
  value, 
  description, 
  trend, 
  trendValue,
  icon: Icon,
  className,
  ...props 
}, ref) => (
  <Card ref={ref} variant="elevated" className={cn("relative overflow-hidden", className)} {...props}>
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold">{value}</p>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
          {trend && trendValue && (
            <div className={cn(
              "flex items-center text-sm font-medium",
              trend === 'up' ? "text-green-600" : trend === 'down' ? "text-red-600" : "text-muted-foreground"
            )}>
              <span>{trendValue}</span>
              <span className="ml-1">
                {trend === 'up' ? '↗' : trend === 'down' ? '↘' : '→'}
              </span>
            </div>
          )}
        </div>
        {Icon && (
          <div className="p-3 bg-primary/10 rounded-full">
            <Icon className="h-6 w-6 text-primary" />
          </div>
        )}
      </div>
    </CardContent>
  </Card>
))
CardStats.displayName = "CardStats"

/**
 * CARD COM IMAGEM
 */
const CardImage = React.forwardRef(({ 
  src, 
  alt, 
  title, 
  description, 
  actions,
  className,
  ...props 
}, ref) => (
  <Card ref={ref} className={cn("overflow-hidden", className)} {...props}>
    {src && (
      <div className="aspect-video relative overflow-hidden">
        <img 
          src={src} 
          alt={alt} 
          className="object-cover w-full h-full transition-transform hover:scale-105"
        />
      </div>
    )}
    <CardHeader>
      {title && <CardTitle className="text-lg">{title}</CardTitle>}
      {description && <CardDescription>{description}</CardDescription>}
    </CardHeader>
    {actions && (
      <CardFooter className="gap-2">
        {actions}
      </CardFooter>
    )}
  </Card>
))
CardImage.displayName = "CardImage"

/**
 * CARD DE NOTIFICAÇÃO
 */
const CardNotification = React.forwardRef(({ 
  variant = 'info',
  title, 
  message, 
  timestamp,
  onDismiss,
  actions,
  className,
  ...props 
}, ref) => (
  <Card ref={ref} variant={variant} className={cn("relative", className)} {...props}>
    <CardHeader className="pb-3">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          {title && <CardTitle className="text-base">{title}</CardTitle>}
          {timestamp && (
            <p className="text-xs text-muted-foreground">{timestamp}</p>
          )}
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            ×
          </button>
        )}
      </div>
    </CardHeader>
    {message && (
      <CardContent className="pt-0">
        <p className="text-sm">{message}</p>
      </CardContent>
    )}
    {actions && (
      <CardFooter className="pt-3 gap-2">
        {actions}
      </CardFooter>
    )}
  </Card>
))
CardNotification.displayName = "CardNotification"

/**
 * GRID DE CARDS RESPONSIVO
 */
const CardGrid = React.forwardRef(({ 
  columns = { sm: 1, md: 2, lg: 3 },
  gap = 6,
  className,
  children,
  ...props 
}, ref) => {
  const gridClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-2', 
    3: 'grid-cols-3',
    4: 'grid-cols-4',
    5: 'grid-cols-5',
    6: 'grid-cols-6'
  }

  const gapClasses = {
    2: 'gap-2',
    4: 'gap-4',
    6: 'gap-6',
    8: 'gap-8'
  }

  return (
    <div
      ref={ref}
      className={cn(
        "grid",
        `sm:${gridClasses[columns.sm] || 'grid-cols-1'}`,
        `md:${gridClasses[columns.md] || 'grid-cols-2'}`,
        `lg:${gridClasses[columns.lg] || 'grid-cols-3'}`,
        gapClasses[gap] || 'gap-6',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
})
CardGrid.displayName = "CardGrid"

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
  CardLoading,
  CardStats,
  CardImage,
  CardNotification,
  CardGrid,
  cardVariants
}
