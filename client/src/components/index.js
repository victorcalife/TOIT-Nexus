// Componentes de Navegação
export { 
  StandardNavigation,
  StandardBreadcrumbs,
  StandardContextMenu,
  StandardPagination
} from './navigation';

// Componentes de Formulários
export {
  StandardForm,
  StandardStepForm,
  FormField,
  StandardInput,
  StandardTextarea,
  StandardSelect,
  StandardCheckbox,
  StandardRadioGroup,
  StandardSwitch,
  StandardFileUpload
} from './forms';

// Componentes de Tabelas
export {
  StandardTable,
  useTableState
} from './tables';

// Componentes de Modais
export {
  StandardModal,
  ConfirmationModal,
  FormModal,
  ViewModal,
  SideModal,
  UploadModal,
  useModal,
  useModals
} from './modals';

// Componentes de Notificações
export {
  StandardAlert,
  NotificationItem,
  NotificationList,
  NotificationDropdown,
  NotificationProvider,
  useNotifications,
  useRealtimeNotifications
} from './notifications';

// Componentes de Loading
export {
  Spinner,
  LoadingWithText,
  ContextualLoading,
  PageLoading,
  SectionLoading,
  InlineLoading,
  ButtonLoading,
  ProgressLoading,
  CardSkeleton,
  TableSkeleton,
  ListSkeleton,
  DashboardSkeleton,
  LoadingOverlay,
  useLoading,
  useLoadingWithTimeout
} from './loading';

// Componentes de Filtros
export {
  StandardFilters,
  useFilters,
  FILTER_TYPES
} from './filters';

// Componentes de Dashboard
export {
  StandardDashboard,
  MetricCard,
  ProgressCard,
  ActivityCard,
  QuickStatsCard,
  ChartCard,
  DashboardGrid,
  useDashboard
} from './dashboard';

// Componentes de Layout
export {
  StandardLayout,
  AuthLayout,
  ErrorLayout,
  DashboardLayout,
  FormLayout,
  useLayout
} from './layout';

// Componentes de UI (re-export dos componentes shadcn/ui)
export {
  Button,
  Input,
  Label,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Badge,
  Avatar,
  AvatarImage,
  AvatarFallback,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Checkbox,
  RadioGroup,
  RadioGroupItem,
  Switch,
  Textarea,
  Progress,
  Separator,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Toast,
  ToastAction,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
  Toaster,
  useToast,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Calendar,
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut
} from './ui';