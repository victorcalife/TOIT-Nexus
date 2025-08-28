/**
 * SISTEMA DE CHECKBOX COMPLETO - TOIT NEXUS
 * Sistema profissional de checkboxes com todas as funcionalidades
 * 100% JavaScript - SEM TYPESCRIPT
 * 
 * FUNCIONALIDADES INCLUÍDAS:
 * - Checkbox básico com estados
 * - Checkbox com label integrado
 * - Checkbox indeterminado
 * - Checkbox com ícones customizados
 * - Checkbox group (múltipla seleção)
 * - Checkbox com validação
 * - Diferentes tamanhos e estilos
 * - Estados de loading e disabled
 * - Checkbox switch/toggle
 * - Acessibilidade completa
 */

import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { cva } from "class-variance-authority"
import { Check, Minus, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * VARIANTES DO CHECKBOX
 */
const checkboxVariants = cva(
  "peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
  {
    variants: {
      variant: {
        default: "border-primary",
        outline: "border-input bg-background",
        success: "border-green-500 data-[state=checked]:bg-green-500",
        error: "border-red-500 data-[state=checked]:bg-red-500",
        warning: "border-yellow-500 data-[state=checked]:bg-yellow-500"
      },
      size: {
        sm: "h-3 w-3",
        default: "h-4 w-4",
        lg: "h-5 w-5",
        xl: "h-6 w-6"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
)

/**
 * CHECKBOX PRINCIPAL
 */
const Checkbox = React.forwardRef(({ 
  className, 
  variant,
  size,
  loading = false,
  indeterminate = false,
  icon: CustomIcon,
  ...props 
}, ref) => {
  const IconComponent = loading ? Loader2 : (indeterminate ? Minus : (CustomIcon || Check))
  
  return (
    <CheckboxPrimitive.Root
      ref={ref}
      className={cn(checkboxVariants({ variant, size }), className)}
      {...props}
    >
      <CheckboxPrimitive.Indicator className={cn("flex items-center justify-center text-current")}>
        <IconComponent 
          className={cn(
            size === "sm" && "h-2.5 w-2.5",
            size === "default" && "h-3 w-3",
            size === "lg" && "h-3.5 w-3.5",
            size === "xl" && "h-4 w-4",
            loading && "animate-spin"
          )} 
        />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
})
Checkbox.displayName = CheckboxPrimitive.Root.displayName

/**
 * CHECKBOX COM LABEL
 */
const CheckboxWithLabel = React.forwardRef(({ 
  id,
  label,
  description,
  required = false,
  error,
  className,
  labelClassName,
  ...props 
}, ref) => {
  const checkboxId = id || `checkbox-${Math.random().toString(36).substr(2, 9)}`
  
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center space-x-2">
        <Checkbox
          ref={ref}
          id={checkboxId}
          variant={error ? "error" : "default"}
          {...props}
        />
        <label
          htmlFor={checkboxId}
          className={cn(
            "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
            error && "text-red-600 dark:text-red-400",
            labelClassName
          )}
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      </div>
      {description && (
        <p className="text-xs text-muted-foreground ml-6">
          {description}
        </p>
      )}
      {error && (
        <p className="text-xs text-red-600 dark:text-red-400 ml-6">
          {error}
        </p>
      )}
    </div>
  )
})
CheckboxWithLabel.displayName = "CheckboxWithLabel"

/**
 * CHECKBOX GROUP
 */
const CheckboxGroup = React.forwardRef(({ 
  options = [],
  value = [],
  onChange,
  name,
  label,
  description,
  error,
  required = false,
  disabled = false,
  variant = "default",
  size = "default",
  orientation = "vertical",
  className,
  ...props 
}, ref) => {
  const handleChange = (optionValue, checked) => {
    if (checked) {
      onChange?.([...value, optionValue])
    } else {
      onChange?.(value.filter(v => v !== optionValue))
    }
  }

  return (
    <div className={cn("space-y-3", className)} {...props}>
      {label && (
        <label className="text-sm font-medium leading-none">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      {description && (
        <p className="text-xs text-muted-foreground">
          {description}
        </p>
      )}
      <div className={cn(
        "space-y-2",
        orientation === "horizontal" && "flex flex-wrap gap-4 space-y-0"
      )}>
        {options.map((option) => (
          <CheckboxWithLabel
            key={option.value}
            ref={ref}
            id={`${name}-${option.value}`}
            label={option.label}
            description={option.description}
            checked={value.includes(option.value)}
            onCheckedChange={(checked) => handleChange(option.value, checked)}
            disabled={disabled || option.disabled}
            variant={error ? "error" : variant}
            size={size}
          />
        ))}
      </div>
      {error && (
        <p className="text-xs text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  )
})
CheckboxGroup.displayName = "CheckboxGroup"

/**
 * CHECKBOX SWITCH/TOGGLE
 */
const CheckboxSwitch = React.forwardRef(({ 
  label,
  description,
  size = "default",
  className,
  ...props 
}, ref) => {
  const sizeClasses = {
    sm: "h-4 w-7",
    default: "h-5 w-9",
    lg: "h-6 w-11"
  }

  const thumbSizeClasses = {
    sm: "h-3 w-3 data-[state=checked]:translate-x-3",
    default: "h-4 w-4 data-[state=checked]:translate-x-4", 
    lg: "h-5 w-5 data-[state=checked]:translate-x-5"
  }

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <CheckboxPrimitive.Root
        ref={ref}
        className={cn(
          "peer inline-flex shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input",
          sizeClasses[size]
        )}
        {...props}
      >
        <CheckboxPrimitive.Indicator
          className={cn(
            "pointer-events-none block rounded-full bg-background shadow-lg ring-0 transition-transform",
            thumbSizeClasses[size]
          )}
        />
      </CheckboxPrimitive.Root>
      {label && (
        <div className="grid gap-1.5 leading-none">
          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            {label}
          </label>
          {description && (
            <p className="text-xs text-muted-foreground">
              {description}
            </p>
          )}
        </div>
      )}
    </div>
  )
})
CheckboxSwitch.displayName = "CheckboxSwitch"

/**
 * CHECKBOX CARD (SELECIONÁVEL)
 */
const CheckboxCard = React.forwardRef(({ 
  title,
  description,
  icon: Icon,
  checked,
  onCheckedChange,
  disabled = false,
  className,
  ...props 
}, ref) => {
  return (
    <div
      className={cn(
        "relative rounded-lg border p-4 cursor-pointer transition-colors",
        checked ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
      onClick={() => !disabled && onCheckedChange?.(!checked)}
    >
      <div className="flex items-start space-x-3">
        <Checkbox
          ref={ref}
          checked={checked}
          onCheckedChange={onCheckedChange}
          disabled={disabled}
          className="mt-0.5"
          {...props}
        />
        <div className="flex-1 space-y-1">
          <div className="flex items-center space-x-2">
            {Icon && <Icon className="h-4 w-4" />}
            <h4 className="text-sm font-medium">{title}</h4>
          </div>
          {description && (
            <p className="text-xs text-muted-foreground">
              {description}
            </p>
          )}
        </div>
      </div>
    </div>
  )
})
CheckboxCard.displayName = "CheckboxCard"

/**
 * HOOK PARA GERENCIAR CHECKBOX GROUP
 */
export const useCheckboxGroup = (initialValues = []) => {
  const [values, setValues] = React.useState(initialValues)

  const toggle = (value) => {
    setValues(prev => 
      prev.includes(value) 
        ? prev.filter(v => v !== value)
        : [...prev, value]
    )
  }

  const selectAll = (allValues) => {
    setValues(allValues)
  }

  const selectNone = () => {
    setValues([])
  }

  const isSelected = (value) => values.includes(value)
  const isAllSelected = (allValues) => allValues.every(value => values.includes(value))
  const isNoneSelected = values.length === 0
  const selectedCount = values.length

  return {
    values,
    setValues,
    toggle,
    selectAll,
    selectNone,
    isSelected,
    isAllSelected,
    isNoneSelected,
    selectedCount
  }
}

/**
 * HOOK PARA CHECKBOX INDETERMINADO
 */
export const useIndeterminateCheckbox = (items = []) => {
  const [checkedItems, setCheckedItems] = React.useState([])

  const allChecked = checkedItems.length === items.length
  const isIndeterminate = checkedItems.length > 0 && checkedItems.length < items.length

  const toggleAll = () => {
    setCheckedItems(allChecked ? [] : items)
  }

  const toggleItem = (item) => {
    setCheckedItems(prev =>
      prev.includes(item)
        ? prev.filter(i => i !== item)
        : [...prev, item]
    )
  }

  return {
    checkedItems,
    setCheckedItems,
    allChecked,
    isIndeterminate,
    toggleAll,
    toggleItem
  }
}

export {
  Checkbox,
  CheckboxWithLabel,
  CheckboxGroup,
  CheckboxSwitch,
  CheckboxCard,
  checkboxVariants
}
`