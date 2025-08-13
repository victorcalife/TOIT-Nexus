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

= useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query para buscar todos os tenants com dados de controle
  const { data, isLoading, { search, status, plan,
    queryFn) => {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (planFilter !== 'all') params.append('plan', planFilter);
      
      const response = await apiRequest('GET', `/api/admin/tenant-control?${params}`);
      return response.json();
    }
  });

  // Query para analytics de uso
  const { data, { period,
    queryFn) => {
      const response = await apiRequest('GET', `/api/admin/tenant-control/analytics?period=${periodFilter}`);
      return response.json();
    }
  });

  // Query para dados de billing consolidado
  const { data,
    queryFn) => {
      const response = await apiRequest('GET', '/api/admin/tenant-control/billing');
      return response.json();
    }
  });

  // Mutation para suspender/ativar tenant
  const toggleTenantMutation = useMutation({
    mutationFn, active }: { tenantId) => {
      const response = await apiRequest('PUT', `/api/admin/tenant-control/${tenantId}/status`, {
        isActive,
        reason);
      return response.json();
    },
    onSuccess) => {
      queryClient.invalidateQueries({ queryKey);
      toast({ title, description);
    },
    onError) => {
      toast({ 
        title, 
        description,
        variant);
    }
  });

  // Mutation para alterar plano do tenant
  const changePlanMutation = useMutation({
    mutationFn, accessProfileId }: { tenantId) => {
      const response = await apiRequest('PUT', `/api/admin/tenant-control/${tenantId}/plan`, {
        accessProfileId
      });
      return response.json();
    },
    onSuccess) => {
      queryClient.invalidateQueries({ queryKey);
      setShowTenantModal(false);
      toast({ title, description);
    },
    onError) => {
      toast({ 
        title, 
        description,
        variant);
    }
  });

  const handleToggleTenant = (tenant) => {
    toggleTenantMutation.mutate({
      tenantId,
      active);
  };

  const handleViewTenant = (tenant) => {
    setSelectedTenant(tenant);
    setShowTenantModal(true);
  };

  const getStatusColor = (status, isActive) => {
    if (!isActive) return 'bg-red-100 text-red-800 border-red-200';
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'overdue': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'suspended': return 'bg-red-100 text-red-800 border-red-200';
      default) => {
    const colors, string> = {
      'basico': 'bg-blue-100 text-blue-800',
      'standard': 'bg-green-100 text-green-800',
      'premium': 'bg-purple-100 text-purple-800',
      'enterprise': 'bg-yellow-100 text-yellow-800'
    };
    return colors[plan] || 'bg-gray-100 text-gray-800';
  };

  const formatCurrency = (value) => 
    new Intl.NumberFormat('pt-BR', { style, currency).format(value);

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
                className="bg-green-600 hover)}
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
                    {tenants.reduce((sum, t) => sum + t.activeUsers, 0)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    de {tenants.reduce((sum, t) => sum + t.totalUsers, 0)} total
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
                    {tenants.reduce((sum, t) => sum + t.activeModules, 0)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Adoção, t) => sum + t.activeModules, 0) / (tenants.length * 15)) * 100)}%
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Gráficos e Resumos */}
            <div className="grid grid-cols-1 lg, 'standard', 'premium', 'enterprise'].map(plan => {
                      const count = tenants.filter((t) => t.plan === plan).length;
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
                      const count = tenants.filter((t) => t.billingInfo?.paymentStatus === status).length;
                      const icons = { active, overdue, suspended, overdue, suspended);
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
                  
                  <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value)}>
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
                  
                  <Select value={planFilter} onValueChange={(value) => setPlanFilter(value)}>
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
              {tenants.map((tenant) => (
                <Card key={tenant.id} className="hover, tenant.isActive)}>
                          {tenant.isActive 
                            ? (tenant.billingInfo?.paymentStatus || 'active').toUpperCase() {getPlanColor(tenant.plan)}>
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
                    <div className="grid grid-cols-2 md)}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Storage)}
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Último Login).toLocaleDateString('pt-BR') {() => handleViewTenant(tenant)}
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
                          ) {/* Modal de Detalhes do Tenant */}
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
                      <div><strong>Domínio).toLocaleDateString('pt-BR')}</div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Faturamento</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div><strong>Receita Mensal)}</div>
                      <div><strong>Total Gasto)}</div>
                      <div><strong>Próximo Pgto).toLocaleDateString('pt-BR') {selectedTenant.billingInfo?.paymentStatus?.toUpperCase() || 'ATIVO'}</Badge></div>
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
                            style={{ width) * 100}%` }}
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
                            style={{ width) * 100}%` }}
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
                            style={{ width) * 100}%` }}
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