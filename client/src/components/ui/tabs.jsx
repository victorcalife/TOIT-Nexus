/**
 * SISTEMA DE TABS COMPLETO - TOIT NEXUS
 * Sistema profissional de abas com todas as funcionalidades
 * 100% JavaScript - SEM TYPESCRIPT
 * 
 * FUNCIONALIDADES INCLUÍDAS:
 * - Tabs básicas responsivas
 * - Tabs verticais e horizontais
 * - Tabs com ícones
 * - Tabs com badges/contadores
 * - Tabs com loading states
 * - Tabs dismissíveis (removíveis)
 * - Tabs com lazy loading
 * - Diferentes estilos e tamanhos
 * - Navegação por teclado
 * - Persistência de estado
 */

import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"
import { cva } from "class-variance-authority"
import { X, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * VARIANTES DAS TABS
 */
const tabsListVariants = cva(
  "inline-flex items-center justify-center rounded-md bg-muted p-1 text-muted-foreground",
  {
    variants: {
      variant: {
        default: "bg-muted",
        outline: "border border-border bg-transparent",
        pills: "bg-transparent gap-2 p-0",
        underline: "bg-transparent border-b border-border p-0 rounded-none"
      },
      size: {
        sm: "h-8 text-xs",
        default: "h-10 text-sm",
        lg: "h-12 text-base"
      },
      orientation: {
        horizontal: "flex-row",
        vertical: "flex-col h-auto w-auto"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      orientation: "horizontal"
    }
  }
)

const tabsTriggerVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm",
        outline: "border border-transparent data-[state=active]:border-border data-[state=active]:bg-background",
        pills: "rounded-full bg-muted hover:bg-muted/80 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground",
        underline: "rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
      },
      size: {
        sm: "h-7 px-2 text-xs",
        default: "h-9 px-3 text-sm", 
        lg: "h-11 px-4 text-base"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
)

/**
 * TABS ROOT
 */
const Tabs = TabsPrimitive.Root

/**
 * TABS LIST
 */
const TabsList = React.forwardRef(({ 
  className, 
  variant,
  size,
  orientation,
  ...props 
}, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(tabsListVariants({ variant, size, orientation }), className)}
    {...props}
  />
))
TabsList.displayName = TabsPrimitive.List.displayName

/**
 * TABS TRIGGER
 */
const TabsTrigger = React.forwardRef(({ 
  className, 
  variant,
  size,
  icon: Icon,
  badge,
  dismissible = false,
  onDismiss,
  loading = false,
  children,
  ...props 
}, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      tabsTriggerVariants({ variant, size }),
      dismissible && "pr-8",
      className
    )}
    {...props}
  >
    <div className="flex items-center gap-2">
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        Icon && <Icon className="h-4 w-4" />
      )}
      <span>{children}</span>
      {badge && (
        <span className="ml-1 rounded-full bg-primary/20 px-1.5 py-0.5 text-xs">
          {badge}
        </span>
      )}
    </div>
    {dismissible && (
      <button
        onClick={(e) => {
          e.stopPropagation()
          onDismiss?.()
        }}
        className="absolute right-1 top-1/2 transform -translate-y-1/2 rounded-full p-0.5 hover:bg-muted transition-colors"
      >
        <X className="h-3 w-3" />
      </button>
    )}
  </TabsPrimitive.Trigger>
))
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

/**
 * TABS CONTENT
 */
const TabsContent = React.forwardRef(({ 
  className, 
  lazy = false,
  loading = false,
  children,
  ...props 
}, ref) => {
  const [hasBeenActive, setHasBeenActive] = React.useState(!lazy)

  React.useEffect(() => {
    if (!hasBeenActive && !lazy) {
      setHasBeenActive(true)
    }
  }, [hasBeenActive, lazy])

  return (
    <TabsPrimitive.Content
      ref={ref}
      className={cn(
        "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        className
      )}
      onFocus={() => setHasBeenActive(true)}
      {...props}
    >
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="ml-2 text-sm text-muted-foreground">Carregando...</span>
        </div>
      ) : (
        (hasBeenActive || !lazy) && children
      )}
    </TabsPrimitive.Content>
  )
})
TabsContent.displayName = TabsPrimitive.Content.displayName

/**
 * TABS VERTICAIS
 */
const VerticalTabs = React.forwardRef(({ 
  className,
  children,
  ...props 
}, ref) => (
  <Tabs
    ref={ref}
    orientation="vertical"
    className={cn("flex gap-4", className)}
    {...props}
  >
    {children}
  </Tabs>
))
VerticalTabs.displayName = "VerticalTabs"

/**
 * TABS COM NAVEGAÇÃO
 */
const NavigationTabs = React.forwardRef(({ 
  tabs = [],
  activeTab,
  onTabChange,
  variant = "default",
  className,
  ...props 
}, ref) => {
  return (
    <Tabs
      ref={ref}
      value={activeTab}
      onValueChange={onTabChange}
      className={className}
      {...props}
    >
      <TabsList variant={variant}>
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            variant={variant}
            icon={tab.icon}
            badge={tab.badge}
            dismissible={tab.dismissible}
            onDismiss={tab.onDismiss}
            loading={tab.loading}
          >
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {tabs.map((tab) => (
        <TabsContent
          key={tab.value}
          value={tab.value}
          lazy={tab.lazy}
          loading={tab.contentLoading}
        >
          {tab.content}
        </TabsContent>
      ))}
    </Tabs>
  )
})
NavigationTabs.displayName = "NavigationTabs"

/**
 * TABS DINÂMICAS (ADICIONÁVEIS/REMOVÍVEIS)
 */
const DynamicTabs = React.forwardRef(({ 
  initialTabs = [],
  onAddTab,
  onRemoveTab,
  maxTabs = 10,
  className,
  ...props 
}, ref) => {
  const [tabs, setTabs] = React.useState(initialTabs)
  const [activeTab, setActiveTab] = React.useState(initialTabs[0]?.value)

  const addTab = (tab) => {
    if (tabs.length < maxTabs) {
      setTabs(prev => [...prev, tab])
      setActiveTab(tab.value)
      onAddTab?.(tab)
    }
  }

  const removeTab = (tabValue) => {
    setTabs(prev => {
      const newTabs = prev.filter(tab => tab.value !== tabValue)
      if (activeTab === tabValue && newTabs.length > 0) {
        setActiveTab(newTabs[0].value)
      }
      return newTabs
    })
    onRemoveTab?.(tabValue)
  }

  return (
    <div className={className}>
      <NavigationTabs
        ref={ref}
        tabs={tabs.map(tab => ({
          ...tab,
          dismissible: true,
          onDismiss: () => removeTab(tab.value)
        }))}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        {...props}
      />
      {tabs.length < maxTabs && (
        <button
          onClick={() => addTab({
            value: `tab-${Date.now()}`,
            label: `Nova Aba ${tabs.length + 1}`,
            content: <div>Conteúdo da nova aba</div>
          })}
          className="mt-2 px-3 py-1 text-sm bg-muted hover:bg-muted/80 rounded-md transition-colors"
        >
          + Adicionar Aba
        </button>
      )}
    </div>
  )
})
DynamicTabs.displayName = "DynamicTabs"

/**
 * HOOK PARA GERENCIAR TABS
 */
export const useTabs = (initialTab = "") => {
  const [activeTab, setActiveTab] = React.useState(initialTab)
  const [tabHistory, setTabHistory] = React.useState([initialTab])

  const changeTab = (tabValue) => {
    setActiveTab(tabValue)
    setTabHistory(prev => [...prev.filter(t => t !== tabValue), tabValue])
  }

  const goBack = () => {
    if (tabHistory.length > 1) {
      const newHistory = [...tabHistory]
      newHistory.pop()
      const previousTab = newHistory[newHistory.length - 1]
      setActiveTab(previousTab)
      setTabHistory(newHistory)
    }
  }

  const canGoBack = tabHistory.length > 1

  return {
    activeTab,
    changeTab,
    goBack,
    canGoBack,
    tabHistory
  }
}

/**
 * HOOK PARA PERSISTIR ESTADO DAS TABS
 */
export const usePersistedTabs = (key, initialTab = "") => {
  const [activeTab, setActiveTab] = React.useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(key) || initialTab
    }
    return initialTab
  })

  const changeTab = (tabValue) => {
    setActiveTab(tabValue)
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, tabValue)
    }
  }

  return {
    activeTab,
    changeTab
  }
}

export {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  VerticalTabs,
  NavigationTabs,
  DynamicTabs,
  tabsListVariants,
  tabsTriggerVariants
}
