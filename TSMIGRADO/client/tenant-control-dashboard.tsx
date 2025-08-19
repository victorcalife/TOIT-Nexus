/**
 * TENANT CONTROL DASHBOARD - Dashboard completo para equipe TOIT controlar tenants
 * Visualizar e controlar funcionalidades, billing e logs de uso por empresa
 */

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Building2,
  Search,
  Filter,
  DollarSign,
  Activity,
  Users,
  Package,
  Settings,
  BarChart3,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Crown,
  Zap,
  TrendingUp,
  TrendingDown,
  Download,
  Eye,
  Edit,
  Ban,
  Play,
  Pause,
  RefreshCw,
  Calendar,
  FileText,
  PieChart,
  Target,
  Save
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { StandardHeader } from '@/components/standard-header';
import { useAuth } from '@/hooks/useAuth';

interface TenantControlData {
  id: string;
  name: string;
  domain: string;
  plan: string;
  isActive: boolean;
  accessProfileId: string;
  accessProfileName: string;
  totalUsers: number;
  activeUsers: number;
  activeModules: number;
  totalModules: number;
  monthlyRevenue: number;
  currentUsage: {
    storage: number;
    apiCalls: number;
    workflows: number;
    reports: number;
  };
  limits: {
    users: number;
    storage: number;
    apiCalls: number;
  };
  billingInfo: {
    lastPayment: string;
    nextBilling: string;
    paymentStatus: 'active' | 'overdue' | 'suspended';
    totalSpent: number;
  };
  recentActivity: Array<{
    type: string;
    description: string;
    timestamp: string;
    user: string;
  }>;
  createdAt: string;
  lastLoginAt: string;
}

interface UsageAnalytics {
  period: string;
  tenantUsage: Array<{
    tenantId: string;
    tenantName: string;
    totalUsers: number;
    activeUsers: number;
    modulesUsed: number;
    apiCalls: number;
    storageUsed: number;
    revenue: number;
    lastActivity: string;
  }>;
  summary: {
    totalTenants: number;
    activeTenants: number;
    totalRevenue: number;
    avgUsagePerTenant: number;
    topModules: Array<{
      moduleId: string;
      moduleName: string;
      tenantCount: number;
      usage: number;
    }>;
  };
}

export default function TenantControlDashboard() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'overdue'>('all');
  const [planFilter, setPlanFilter] = useState<'all' | 'basico' | 'standard' | 'premium' | 'enterprise'>('all');
  const [selectedTenant, setSelectedTenant] = useState<TenantControlData | null>(null);
  const [showTenantModal, setShowTenantModal] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [periodFilter, setPeriodFilter] = useState('30d');

  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query para buscar todos os tenants com dados de controle
  const { data: tenantsData, isLoading: loadingTenants } = useQuery({
    queryKey: ['/api/admin/tenant-control', { search: searchTerm, status: statusFilter, plan: planFilter }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (planFilter !== 'all') params.append('plan', planFilter);
      
      const response = await apiRequest('GET', `/api/admin/tenant-control?${params}`);
      return response.json();
    }
  });

  // Query para analytics de uso
  const { data: analyticsData } = useQuery({
    queryKey: ['/api/admin/tenant-control/analytics', { period: periodFilter }],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/admin/tenant-control/analytics?period=${periodFilter}`);
      return response.json();
    }
  });

  // Query para dados de billing consolidado
  const { data: billingData } = useQuery({
    queryKey: ['/api/admin/tenant-control/billing'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/admin/tenant-control/billing');
      return response.json();
    }
  });

  // Mutation para suspender/ativar tenant
  const toggleTenantMutation = useMutation({
    mutationFn: async ({ tenantId, active }: { tenantId: string; active: boolean }) => {
      const response = await apiRequest('PUT', `/api/admin/tenant-control/${tenantId}/status`, {
        isActive: active,
        reason: active ? 'Reativado pela equipe TOIT' : 'Suspenso pela equipe TOIT'
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/tenant-control'] });
      toast({ title: "Status atualizado", description: "Status do tenant alterado com sucesso" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Erro", 
        description: error.message || "Falha ao alterar status do tenant",
        variant: "destructive" 
      });
    }
  });

  // Mutation para alterar plano do tenant
  const changePlanMutation = useMutation({
    mutationFn: async ({ tenantId, accessProfileId }: { tenantId: string; accessProfileId: string }) => {
      const response = await apiRequest('PUT', `/api/admin/tenant-control/${tenantId}/plan`, {
        accessProfileId
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/tenant-control'] });
      setShowTenantModal(false);
      toast({ title: "Plan alterado", description: "Plano do tenant alterado com sucesso" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Erro", 
        description: error.message || "Falha ao alterar plano do tenant",
        variant: "destructive" 
      });
    }
  });

  const handleToggleTenant = (tenant: TenantControlData) => {
    toggleTenantMutation.mutate({
      tenantId: tenant.id,
      active: !tenant.isActive
    });
  };

  const handleViewTenant = (tenant: TenantControlData) => {
    setSelectedTenant(tenant);
    setShowTenantModal(true);
  };

  const getStatusColor = (status: string, isActive: boolean) => {
    if (!isActive) return 'bg-red-100 text-red-800 border-red-200';
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'overdue': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'suspended': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPlanColor = (plan: string) => {
    const colors: Record<string, string> = {
      'basico': 'bg-blue-100 text-blue-800',
      'standard': 'bg-green-100 text-green-800',
      'premium': 'bg-purple-100 text-purple-800',
      'enterprise': 'bg-yellow-100 text-yellow-800'
    };
    return colors[plan] || 'bg-gray-100 text-gray-800';
  };

  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  if (loadingTenants) {
    return (
      <div className="min-h-screen bg-gray-50">
        <StandardHeader showUserActions={true} user={user} />
        <div className="flex items-center justify-center pt-20">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-500" />
            <p className="text-gray-600">Carregando dashboard de controle...</p>
          </div>
        </div>
      </div>
    );
  }

  const tenants = tenantsData?.data || [];
  const analytics = analyticsData?.data || null;
  const billing = billingData?.data || null;

  return (
    <div className="min-h-screen bg-gray-50">
      <StandardHeader showUserActions={true} user={user} />
      
      <div className="max-w-7xl mx-auto px-4 pt-20 pb-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Building2 className="h-8 w-8 mr-3 text-blue-600" />
                Controle de Tenants
              </h1>
              <p className="text-gray-600 mt-2">
                Dashboard executivo para controle total de empresas e funcionalidades
              </p>
            </div>
            
            <div className="flex space-x-3">
              <Button
                onClick={() => queryClient.invalidateQueries()}
                variant="outline"
                className="flex items-center"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Atualizar
              </Button>
              <Button
                onClick={() => {/* Implementar export */}}
                className="bg-green-600 hover:bg-green-700"
              >
                <Download className="h-4 w-4 mr-2" />
                Exportar Relatório
              </Button>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="tenants">Empresas</TabsTrigger>
            <TabsTrigger value="billing">Faturamento</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="reports">Relatórios</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Cards de Métricas Executivas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Empresas</CardTitle>
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics?.summary?.totalTenants || tenants.length}</div>
                  <p className="text-xs text-muted-foreground">
                    {analytics?.summary?.activeTenants || 0} ativas
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Receita Mensal</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatCurrency(analytics?.summary?.totalRevenue || 0)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    +12% vs mês anterior
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Usuários Ativos</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {tenants.reduce((sum: number, t: TenantControlData) => sum + t.activeUsers, 0)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    de {tenants.reduce((sum: number, t: TenantControlData) => sum + t.totalUsers, 0)} total
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Módulos em Uso</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {tenants.reduce((sum: number, t: TenantControlData) => sum + t.activeModules, 0)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Adoção: {Math.round((tenants.reduce((sum: number, t: TenantControlData) => sum + t.activeModules, 0) / (tenants.length * 15)) * 100)}%
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Gráficos e Resumos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Distribuição por Planos</CardTitle>
                  <CardDescription>Empresas por tipo de assinatura</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {['basico', 'standard', 'premium', 'enterprise'].map(plan => {
                      const count = tenants.filter((t: TenantControlData) => t.plan === plan).length;
                      const percentage = tenants.length > 0 ? (count / tenants.length) * 100 : 0;
                      return (
                        <div key={plan} className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Badge className={getPlanColor(plan)}>
                              {plan.toUpperCase()}
                            </Badge>
                            <span className="text-sm">{count} empresas</span>
                          </div>
                          <span className="text-sm font-medium">{percentage.toFixed(1)}%</span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Status de Pagamentos</CardTitle>
                  <CardDescription>Situação de faturamento das empresas</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {['active', 'overdue', 'suspended'].map(status => {
                      const count = tenants.filter((t: TenantControlData) => t.billingInfo?.paymentStatus === status).length;
                      const icons = { active: CheckCircle, overdue: AlertTriangle, suspended: XCircle };
                      const colors = { active: 'text-green-600', overdue: 'text-orange-600', suspended: 'text-red-600' };
                      const Icon = icons[status as keyof typeof icons];
                      return (
                        <div key={status} className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Icon className={`h-4 w-4 ${colors[status as keyof typeof colors]}`} />
                            <span className="text-sm capitalize">{status}</span>
                          </div>
                          <span className="text-sm font-medium">{count} empresas</span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="tenants" className="space-y-4">
            {/* Filtros */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-wrap gap-4">
                  <div className="flex-1 min-w-64">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Buscar por nome ou domínio..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="active">Ativos</SelectItem>
                      <SelectItem value="inactive">Inativos</SelectItem>
                      <SelectItem value="overdue">Em Atraso</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={planFilter} onValueChange={(value: any) => setPlanFilter(value)}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Plano" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="basico">Básico</SelectItem>
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="premium">Premium</SelectItem>
                      <SelectItem value="enterprise">Enterprise</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Lista de Tenants */}
            <div className="space-y-4">
              {tenants.map((tenant: TenantControlData) => (
                <Card key={tenant.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Building2 className="h-6 w-6 text-blue-600" />
                        <div>
                          <CardTitle className="text-lg">{tenant.name}</CardTitle>
                          <CardDescription>{tenant.domain}</CardDescription>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(tenant.billingInfo?.paymentStatus || 'active', tenant.isActive)}>
                          {tenant.isActive 
                            ? (tenant.billingInfo?.paymentStatus || 'active').toUpperCase()
                            : 'INATIVO'
                          }
                        </Badge>
                        <Badge className={getPlanColor(tenant.plan)}>
                          <Crown className="w-3 h-3 mr-1" />
                          {tenant.accessProfileName || tenant.plan.toUpperCase()}
                        </Badge>
                        <Badge variant="outline">
                          <Users className="w-3 h-3 mr-1" />
                          {tenant.activeUsers}/{tenant.totalUsers}
                        </Badge>
                        <Badge variant="outline">
                          <Package className="w-3 h-3 mr-1" />
                          {tenant.activeModules}/{tenant.totalModules}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Receita Mensal:</span>
                        <div className="font-medium">{formatCurrency(tenant.monthlyRevenue)}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Storage:</span>
                        <div className="font-medium">
                          {tenant.currentUsage.storage}GB / {tenant.limits.storage}GB
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">API Calls:</span>
                        <div className="font-medium">
                          {tenant.currentUsage.apiCalls.toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Último Login:</span>
                        <div className="text-xs">
                          {tenant.lastLoginAt ? new Date(tenant.lastLoginAt).toLocaleDateString('pt-BR') : 'Nunca'}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center pt-2">
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewTenant(tenant)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Detalhes
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(`/tenant/${tenant.domain}`, '_blank')}
                        >
                          <Settings className="h-4 w-4 mr-1" />
                          Acessar
                        </Button>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Switch
                          checked={tenant.isActive}
                          onCheckedChange={() => handleToggleTenant(tenant)}
                          disabled={toggleTenantMutation.isPending}
                        />
                        <Button
                          variant={tenant.isActive ? "destructive" : "default"}
                          size="sm"
                          onClick={() => handleToggleTenant(tenant)}
                          disabled={toggleTenantMutation.isPending}
                        >
                          {tenant.isActive ? (
                            <>
                              <Pause className="h-4 w-4 mr-1" />
                              Suspender
                            </>
                          ) : (
                            <>
                              <Play className="h-4 w-4 mr-1" />
                              Ativar
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="billing" className="space-y-4">
            <h2 className="text-xl font-semibold">Controle de Faturamento</h2>
            <Card>
              <CardContent className="p-6">
                <p className="text-center text-muted-foreground">
                  Dashboard de faturamento em desenvolvimento.
                  <br />
                  Incluirá controle de pagamentos, inadimplência e receita por tenant.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <h2 className="text-xl font-semibold">Analytics Avançadas</h2>
            <Card>
              <CardContent className="p-6">
                <p className="text-center text-muted-foreground">
                  Analytics avançadas em desenvolvimento.
                  <br />
                  Incluirá métricas de uso, performance e crescimento por tenant.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-4">
            <h2 className="text-xl font-semibold">Relatórios Executivos</h2>
            <Card>
              <CardContent className="p-6">
                <p className="text-center text-muted-foreground">
                  Sistema de relatórios em desenvolvimento.
                  <br />
                  Incluirá relatórios customizáveis e export automático.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Modal de Detalhes do Tenant */}
        <Dialog open={showTenantModal} onOpenChange={setShowTenantModal}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center">
                <Building2 className="h-5 w-5 mr-2" />
                {selectedTenant?.name}
              </DialogTitle>
              <DialogDescription>
                Controle completo de funcionalidades e configurações
              </DialogDescription>
            </DialogHeader>
            
            {selectedTenant && (
              <div className="space-y-6">
                {/* Informações Básicas */}
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Informações Gerais</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div><strong>Domínio:</strong> {selectedTenant.domain}</div>
                      <div><strong>Plano:</strong> {selectedTenant.accessProfileName}</div>
                      <div><strong>Usuários:</strong> {selectedTenant.activeUsers}/{selectedTenant.totalUsers}</div>
                      <div><strong>Criado em:</strong> {new Date(selectedTenant.createdAt).toLocaleDateString('pt-BR')}</div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Faturamento</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div><strong>Receita Mensal:</strong> {formatCurrency(selectedTenant.monthlyRevenue)}</div>
                      <div><strong>Total Gasto:</strong> {formatCurrency(selectedTenant.billingInfo?.totalSpent || 0)}</div>
                      <div><strong>Próximo Pgto:</strong> {selectedTenant.billingInfo?.nextBilling ? new Date(selectedTenant.billingInfo.nextBilling).toLocaleDateString('pt-BR') : 'N/A'}</div>
                      <div><strong>Status:</strong> <Badge className={getStatusColor(selectedTenant.billingInfo?.paymentStatus || 'active', true)}>{selectedTenant.billingInfo?.paymentStatus?.toUpperCase() || 'ATIVO'}</Badge></div>
                    </CardContent>
                  </Card>
                </div>

                {/* Uso Atual vs Limites */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Uso vs Limites</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label className="text-xs">Storage</Label>
                        <div className="text-sm font-medium">
                          {selectedTenant.currentUsage.storage}GB / {selectedTenant.limits.storage}GB
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${(selectedTenant.currentUsage.storage / selectedTenant.limits.storage) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs">API Calls</Label>
                        <div className="text-sm font-medium">
                          {selectedTenant.currentUsage.apiCalls.toLocaleString()} / {selectedTenant.limits.apiCalls.toLocaleString()}
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                          <div 
                            className="bg-green-600 h-2 rounded-full" 
                            style={{ width: `${(selectedTenant.currentUsage.apiCalls / selectedTenant.limits.apiCalls) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs">Usuários</Label>
                        <div className="text-sm font-medium">
                          {selectedTenant.activeUsers} / {selectedTenant.limits.users}
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                          <div 
                            className="bg-purple-600 h-2 rounded-full" 
                            style={{ width: `${(selectedTenant.activeUsers / selectedTenant.limits.users) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Atividade Recente */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Atividade Recente</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 max-h-40 overflow-y-auto">
                      {selectedTenant.recentActivity?.slice(0, 5).map((activity, index) => (
                        <div key={index} className="flex items-center justify-between text-sm p-2 border rounded">
                          <div>
                            <div className="font-medium">{activity.description}</div>
                            <div className="text-xs text-muted-foreground">por {activity.user}</div>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(activity.timestamp).toLocaleString('pt-BR')}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}