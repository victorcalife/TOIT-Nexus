/**
 * MODULE MANAGER - Interface administrativa para equipe TOIT
 * Gerenciar módulos de todos os tenants, ativar/desativar, configurar
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
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Settings, 
  Search,
  Filter,
  Plus, 
  Edit, 
  Trash2, 
  Power,
  Users,
  Building2,
  Package,
  BarChart3,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Crown,
  Zap,
  TrendingUp,
  Download,
  Upload,
  RefreshCw
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { StandardHeader } from '@/components/standard-header';
import { useAuth } from '@/hooks/useAuth';

interface Tenant {
  id: string;
  name: string;
  domain: string;
  plan: string;
  isActive: boolean;
  activeModules: number;
  totalUsers: number;
  modules: Module[];
  createdAt: string;
}

interface Module {
  id: string;
  name: string;
  description: string;
  category: string;
  isActive: boolean;
  config?: {
    plan: string;
    maxUsers: number;
    usageLimits: any;
    trialEndsAt: string | null;
    currentUsers: number;
    totalUsage: number;
  };
}

interface ModuleConfig {
  plan: 'trial' | 'basic' | 'premium' | 'enterprise';
  maxUsers: number;
  usageLimits: any;
  trialDays?: number;
}

export default function ModuleManager() {
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [planFilter, setPlanFilter] = useState<'all' | 'trial' | 'basic' | 'premium' | 'enterprise'>('all');
  const [configModule, setConfigModule] = useState<Module | null>(null);
  const [moduleConfig, setModuleConfig] = useState<ModuleConfig>({
    plan: 'trial',
    maxUsers: 10,
    usageLimits: {},
    trialDays: 7
  });
  const [bulkSelection, setBulkSelection] = useState<{
    tenants: string[];
    modules: string[];
  }>({ tenants: [], modules: [] });
  const [showBulkModal, setShowBulkModal] = useState(false);

  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query para buscar todos os tenants com módulos
  const { data: tenantsData, isLoading: loadingTenants, error: tenantsError } = useQuery({
    queryKey: ['/api/admin/tenants-modules', { search: searchTerm, status: statusFilter, plan: planFilter }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (planFilter !== 'all') params.append('plan', planFilter);
      
      const response = await apiRequest('GET', `/api/admin/tenants-modules?${params}`);
      return response.json();
    }
  });

  // Query para analytics de uso
  const { data: analyticsData } = useQuery({
    queryKey: ['/api/admin/modules/usage-analytics'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/admin/modules/usage-analytics');
      return response.json();
    }
  });

  // Mutation para ativar/desativar módulo
  const toggleModuleMutation = useMutation({
    mutationFn: async ({ tenantId, moduleId, enabled }: { tenantId: string; moduleId: string; enabled: boolean }) => {
      const response = await apiRequest('PUT', `/api/admin/tenant/${tenantId}/modules/${moduleId}/toggle`, {
        enabled
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/tenants-modules'] });
      toast({ title: "Módulo atualizado", description: "Status alterado com sucesso" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Erro", 
        description: error.message || "Falha ao alterar status do módulo",
        variant: "destructive" 
      });
    }
  });

  // Mutation para configurar módulo
  const configModuleMutation = useMutation({
    mutationFn: async ({ tenantId, moduleId, config }: { tenantId: string; moduleId: string; config: ModuleConfig }) => {
      const response = await apiRequest('PUT', `/api/admin/tenant/${tenantId}/modules/${moduleId}/config`, config);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/tenants-modules'] });
      setConfigModule(null);
      toast({ title: "Configuração salva", description: "Módulo configurado com sucesso" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Erro", 
        description: error.message || "Falha ao configurar módulo",
        variant: "destructive" 
      });
    }
  });

  // Mutation para ativar módulo
  const activateModuleMutation = useMutation({
    mutationFn: async ({ tenantId, moduleId, config }: { tenantId: string; moduleId: string; config: ModuleConfig }) => {
      const response = await apiRequest('POST', `/api/admin/tenant/${tenantId}/modules/${moduleId}/activate`, config);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/tenants-modules'] });
      toast({ title: "Módulo ativado", description: "Módulo ativado com sucesso" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Erro", 
        description: error.message || "Falha ao ativar módulo",
        variant: "destructive" 
      });
    }
  });

  // Mutation para ativação em lote
  const bulkActivateMutation = useMutation({
    mutationFn: async ({ tenantIds, moduleIds, config }: { tenantIds: string[]; moduleIds: string[]; config: ModuleConfig }) => {
      const response = await apiRequest('POST', '/api/admin/modules/bulk-activate', {
        tenantIds,
        moduleIds,
        config
      });
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/tenants-modules'] });
      setShowBulkModal(false);
      setBulkSelection({ tenants: [], modules: [] });
      toast({ 
        title: "Ativação em lote concluída", 
        description: `${data.data.successful} módulos ativados com sucesso` 
      });
    },
    onError: (error: any) => {
      toast({ 
        title: "Erro", 
        description: error.message || "Falha na ativação em lote",
        variant: "destructive" 
      });
    }
  });

  const handleToggleModule = (tenant: Tenant, module: Module) => {
    toggleModuleMutation.mutate({
      tenantId: tenant.id,
      moduleId: module.id,
      enabled: !module.isActive
    });
  };

  const handleConfigureModule = (tenant: Tenant, module: Module) => {
    setSelectedTenant(tenant);
    setConfigModule(module);
    if (module.config) {
      setModuleConfig({
        plan: module.config.plan as any,
        maxUsers: module.config.maxUsers,
        usageLimits: module.config.usageLimits,
        trialDays: 7
      });
    }
  };

  const handleSaveConfig = () => {
    if (!selectedTenant || !configModule) return;
    
    if (configModule.isActive) {
      configModuleMutation.mutate({
        tenantId: selectedTenant.id,
        moduleId: configModule.id,
        config: moduleConfig
      });
    } else {
      activateModuleMutation.mutate({
        tenantId: selectedTenant.id,
        moduleId: configModule.id,
        config: moduleConfig
      });
    }
  };

  const handleBulkActivate = () => {
    if (bulkSelection.tenants.length === 0 || bulkSelection.modules.length === 0) {
      toast({
        title: "Seleção incompleta",
        description: "Selecione pelo menos um tenant e um módulo",
        variant: "destructive"
      });
      return;
    }

    bulkActivateMutation.mutate({
      tenantIds: bulkSelection.tenants,
      moduleIds: bulkSelection.modules,
      config: moduleConfig
    });
  };

  const getStatusColor = (status: string, isActive: boolean) => {
    if (!isActive) return 'gray';
    switch (status) {
      case 'trial': return 'blue';
      case 'basic': return 'green';
      case 'premium': return 'purple';
      case 'enterprise': return 'yellow';
      default: return 'gray';
    }
  };

  const getModuleIcon = (category: string) => {
    const icons: Record<string, any> = {
      'Conectividade': Zap,
      'Produtividade': CheckCircle,
      'Empresarial': Building2,
      'Análise': BarChart3,
      'Automação': Settings
    };
    return icons[category] || Package;
  };

  if (loadingTenants) {
    return (
      <div className="min-h-screen bg-gray-50">
        <StandardHeader showUserActions={true} user={user} />
        <div className="flex items-center justify-center pt-20">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-500" />
            <p className="text-gray-600">Carregando gestão de módulos...</p>
          </div>
        </div>
      </div>
    );
  }

  const tenants = tenantsData?.data || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <StandardHeader showUserActions={true} user={user} />
      
      <div className="max-w-7xl mx-auto px-4 pt-20 pb-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Settings className="h-8 w-8 mr-3 text-blue-600" />
                Gestão de Módulos
              </h1>
              <p className="text-gray-600 mt-2">
                Configure e controle módulos para todos os tenants
              </p>
            </div>
            
            <div className="flex space-x-3">
              <Button
                onClick={() => setShowBulkModal(true)}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Ativação em Lote
              </Button>
            </div>
          </div>
        </div>

        {/* Analytics Cards */}
        {analyticsData?.data && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Módulos</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analyticsData.data.summary.totalModules}</div>
                <p className="text-xs text-muted-foreground">Disponíveis no sistema</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Módulos Ativos</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analyticsData.data.summary.activeModules}</div>
                <p className="text-xs text-muted-foreground">Em uso pelos tenants</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tenants Ativos</CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{tenants.length}</div>
                <p className="text-xs text-muted-foreground">Empresas cadastradas</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Taxa Adoção</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Math.round((analyticsData.data.summary.activeModules / analyticsData.data.summary.totalModules) * 100)}%
                </div>
                <p className="text-xs text-muted-foreground">Módulos utilizados</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filtros */}
        <Card className="mb-6">
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
                </SelectContent>
              </Select>
              
              <Select value={planFilter} onValueChange={(value: any) => setPlanFilter(value)}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Plano" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="trial">Trial</SelectItem>
                  <SelectItem value="basic">Básico</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                  <SelectItem value="enterprise">Enterprise</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Tenants */}
        <div className="space-y-4">
          {tenants.map((tenant: Tenant) => (
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
                    <Badge variant={tenant.isActive ? "default" : "secondary"}>
                      {tenant.isActive ? 'Ativo' : 'Inativo'}
                    </Badge>
                    <Badge variant="outline">
                      <Crown className="w-3 h-3 mr-1" />
                      {tenant.plan.toUpperCase()}
                    </Badge>
                    <Badge variant="outline">
                      <Users className="w-3 h-3 mr-1" />
                      {tenant.totalUsers} usuários
                    </Badge>
                    <Badge variant="outline">
                      <Package className="w-3 h-3 mr-1" />
                      {tenant.activeModules} módulos
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {tenant.modules.map((module: Module) => {
                    const IconComponent = getModuleIcon(module.category);
                    return (
                      <div
                        key={module.id}
                        className={`p-3 rounded-lg border ${
                          module.isActive 
                            ? 'border-green-200 bg-green-50' 
                            : 'border-gray-200 bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <IconComponent className="h-4 w-4" />
                            <span className="font-medium text-sm">{module.name}</span>
                          </div>
                          <Switch
                            checked={module.isActive}
                            onCheckedChange={() => handleToggleModule(tenant, module)}
                            disabled={toggleModuleMutation.isPending}
                          />
                        </div>
                        
                        {module.isActive && module.config && (
                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <Badge 
                                variant="outline" 
                                className={`text-xs bg-${getStatusColor(module.config.plan, true)}-100`}
                              >
                                {module.config.plan.toUpperCase()}
                              </Badge>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleConfigureModule(tenant, module)}
                                className="h-6 px-2"
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                            </div>
                            
                            <div className="text-xs text-gray-600">
                              <div>Usuários: {module.config.currentUsers}/{module.config.maxUsers === -1 ? '∞' : module.config.maxUsers}</div>
                              <div>Uso: {module.config.totalUsage}</div>
                              {module.config.trialEndsAt && (
                                <div className="text-orange-600">
                                  Trial: {new Date(module.config.trialEndsAt).toLocaleDateString()}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                        
                        {!module.isActive && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleConfigureModule(tenant, module)}
                            className="w-full mt-2 h-7 text-xs"
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            Ativar
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Modal de Configuração */}
        <Dialog open={!!configModule} onOpenChange={() => setConfigModule(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {configModule?.isActive ? 'Configurar' : 'Ativar'} Módulo: {configModule?.name}
              </DialogTitle>
              <DialogDescription>
                Empresa: {selectedTenant?.name}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="plan">Plano</Label>
                  <Select value={moduleConfig.plan} onValueChange={(value: any) => setModuleConfig(prev => ({ ...prev, plan: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="trial">Trial</SelectItem>
                      <SelectItem value="basic">Básico</SelectItem>
                      <SelectItem value="premium">Premium</SelectItem>
                      <SelectItem value="enterprise">Enterprise</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="maxUsers">Máximo de Usuários</Label>
                  <Input
                    id="maxUsers"
                    type="number"
                    value={moduleConfig.maxUsers === -1 ? '' : moduleConfig.maxUsers}
                    onChange={(e) => setModuleConfig(prev => ({ 
                      ...prev, 
                      maxUsers: e.target.value === '' ? -1 : parseInt(e.target.value)
                    }))}
                    placeholder="Ilimitado"
                  />
                </div>
              </div>
              
              {moduleConfig.plan === 'trial' && (
                <div>
                  <Label htmlFor="trialDays">Dias de Trial</Label>
                  <Input
                    id="trialDays"
                    type="number"
                    value={moduleConfig.trialDays}
                    onChange={(e) => setModuleConfig(prev => ({ 
                      ...prev, 
                      trialDays: parseInt(e.target.value)
                    }))}
                    min="1"
                    max="90"
                  />
                </div>
              )}
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setConfigModule(null)}>
                Cancelar
              </Button>
              <Button 
                onClick={handleSaveConfig}
                disabled={configModuleMutation.isPending || activateModuleMutation.isPending}
              >
                {configModuleMutation.isPending || activateModuleMutation.isPending ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {configModule?.isActive ? 'Salvar' : 'Ativar'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Modal de Ativação em Lote */}
        <Dialog open={showBulkModal} onOpenChange={setShowBulkModal}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Ativação em Lote de Módulos</DialogTitle>
              <DialogDescription>
                Selecione os tenants e módulos para ativar em lote
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid grid-cols-2 gap-6">
              {/* Seleção de Tenants */}
              <div>
                <h3 className="font-medium mb-3">Selecionar Empresas ({bulkSelection.tenants.length})</h3>
                <div className="max-h-64 overflow-y-auto space-y-2 border rounded p-3">
                  {tenants.map((tenant: Tenant) => (
                    <div key={tenant.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`tenant-${tenant.id}`}
                        checked={bulkSelection.tenants.includes(tenant.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setBulkSelection(prev => ({
                              ...prev,
                              tenants: [...prev.tenants, tenant.id]
                            }));
                          } else {
                            setBulkSelection(prev => ({
                              ...prev,
                              tenants: prev.tenants.filter(id => id !== tenant.id)
                            }));
                          }
                        }}
                      />
                      <label htmlFor={`tenant-${tenant.id}`} className="text-sm">
                        {tenant.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Seleção de Módulos */}
              <div>
                <h3 className="font-medium mb-3">Selecionar Módulos ({bulkSelection.modules.length})</h3>
                <div className="max-h-64 overflow-y-auto space-y-2 border rounded p-3">
                  {tenants[0]?.modules.map((module: Module) => (
                    <div key={module.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`module-${module.id}`}
                        checked={bulkSelection.modules.includes(module.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setBulkSelection(prev => ({
                              ...prev,
                              modules: [...prev.modules, module.id]
                            }));
                          } else {
                            setBulkSelection(prev => ({
                              ...prev,
                              modules: prev.modules.filter(id => id !== module.id)
                            }));
                          }
                        }}
                      />
                      <label htmlFor={`module-${module.id}`} className="text-sm">
                        {module.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Configuração Padrão */}
            <div className="border-t pt-4">
              <h3 className="font-medium mb-3">Configuração Padrão</h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Plano</Label>
                  <Select value={moduleConfig.plan} onValueChange={(value: any) => setModuleConfig(prev => ({ ...prev, plan: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="trial">Trial</SelectItem>
                      <SelectItem value="basic">Básico</SelectItem>
                      <SelectItem value="premium">Premium</SelectItem>
                      <SelectItem value="enterprise">Enterprise</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Máx. Usuários</Label>
                  <Input
                    type="number"
                    value={moduleConfig.maxUsers === -1 ? '' : moduleConfig.maxUsers}
                    onChange={(e) => setModuleConfig(prev => ({ 
                      ...prev, 
                      maxUsers: e.target.value === '' ? -1 : parseInt(e.target.value)
                    }))}
                    placeholder="Ilimitado"
                  />
                </div>
                
                {moduleConfig.plan === 'trial' && (
                  <div>
                    <Label>Dias Trial</Label>
                    <Input
                      type="number"
                      value={moduleConfig.trialDays}
                      onChange={(e) => setModuleConfig(prev => ({ 
                        ...prev, 
                        trialDays: parseInt(e.target.value)
                      }))}
                      min="1"
                      max="90"
                    />
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setShowBulkModal(false)}>
                Cancelar
              </Button>
              <Button 
                onClick={handleBulkActivate}
                disabled={bulkActivateMutation.isPending}
              >
                {bulkActivateMutation.isPending ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Zap className="h-4 w-4 mr-2" />
                )}
                Ativar em Lote
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}