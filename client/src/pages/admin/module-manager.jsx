/**
 * MODULE MANAGER - from 'react';
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

= useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query para buscar todos os tenants com módulos
  const { data, isLoading, error, { search, status, plan,
    queryFn) => {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (planFilter !== 'all') params.append('plan', planFilter);
      
      const response = await apiRequest('GET', `/api/admin/tenants-modules?${params}`);
      return response.json();
    }
  });

  // Query para analytics de uso
  const { data,
    queryFn) => {
      const response = await apiRequest('GET', '/api/admin/modules/usage-analytics');
      return response.json();
    }
  });

  // Mutation para ativar/desativar módulo
  const toggleModuleMutation = useMutation({
    mutationFn, moduleId, enabled }: { tenantId) => {
      const response = await apiRequest('PUT', `/api/admin/tenant/${tenantId}/modules/${moduleId}/toggle`, {
        enabled
      });
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

  // Mutation para configurar módulo
  const configModuleMutation = useMutation({
    mutationFn, moduleId, config }: { tenantId) => {
      const response = await apiRequest('PUT', `/api/admin/tenant/${tenantId}/modules/${moduleId}/config`, config);
      return response.json();
    },
    onSuccess) => {
      queryClient.invalidateQueries({ queryKey);
      setConfigModule(null);
      toast({ title, description);
    },
    onError) => {
      toast({ 
        title, 
        description,
        variant);
    }
  });

  // Mutation para ativar módulo
  const activateModuleMutation = useMutation({
    mutationFn, moduleId, config }: { tenantId) => {
      const response = await apiRequest('POST', `/api/admin/tenant/${tenantId}/modules/${moduleId}/activate`, config);
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

  // Mutation para ativação em lote
  const bulkActivateMutation = useMutation({
    mutationFn, moduleIds, config }: { tenantIds) => {
      const response = await apiRequest('POST', '/api/admin/modules/bulk-activate', {
        tenantIds,
        moduleIds,
        config
      });
      return response.json();
    },
    onSuccess) => {
      queryClient.invalidateQueries({ queryKey);
      setShowBulkModal(false);
      setBulkSelection({ tenants, modules);
      toast({ 
        title, 
        description);
    },
    onError) => {
      toast({ 
        title, 
        description,
        variant);
    }
  });

  const handleToggleModule = (tenant, module) => {
    toggleModuleMutation.mutate({
      tenantId,
      moduleId,
      enabled);
  };

  const handleConfigureModule = (tenant, module) => {
    setSelectedTenant(tenant);
    setConfigModule(module);
    if (module.config) {
      setModuleConfig({
        plan,
        maxUsers,
        usageLimits,
        trialDays);
    }
  };

  const handleSaveConfig = () => {
    if (!selectedTenant || !configModule) return;
    
    if (configModule.isActive) {
      configModuleMutation.mutate({
        tenantId,
        moduleId,
        config);
    } else {
      activateModuleMutation.mutate({
        tenantId,
        moduleId,
        config);
    }
  };

  const handleBulkActivate = () => {
    if (bulkSelection.tenants.length === 0 || bulkSelection.modules.length === 0) {
      toast({
        title,
        description,
        variant);
      return;
    }

    bulkActivateMutation.mutate({
      tenantIds,
      moduleIds,
      config);
  };

  const getStatusColor = (status, isActive) => {
    if (!isActive) return 'gray';
    switch (status) {
      case 'trial': return 'blue';
      case 'basic': return 'green';
      case 'premium': return 'purple';
      case 'enterprise': return 'yellow';
      default) => {
    const icons, any> = {
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
                className="bg-purple-600 hover) * 100)}%
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
              
              <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value)}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="active">Ativos</SelectItem>
                  <SelectItem value="inactive">Inativos</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={planFilter} onValueChange={(value) => setPlanFilter(value)}>
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
          {tenants.map((tenant) => (
            <Card key={tenant.id} className="hover)}
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
                <div className="grid grid-cols-1 md) => {
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
                              <div>Usuários).toLocaleDateString()}
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
                {configModule?.isActive ? 'Configurar' : 'Ativar'} Módulo) => setModuleConfig(prev => ({ ...prev, plan))}>
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
                      maxUsers)
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
                      trialDays)
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
                ) {configModule?.isActive ? 'Salvar' : 'Ativar'}
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
                  {tenants.map((tenant) => (
                    <div key={tenant.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`tenant-${tenant.id}`}
                        checked={bulkSelection.tenants.includes(tenant.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setBulkSelection(prev => ({
                              ...prev,
                              tenants, tenant.id]
                            }));
                          } else {
                            setBulkSelection(prev => ({
                              ...prev,
                              tenants)
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
                  {tenants[0]?.modules.map((module) => (
                    <div key={module.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`module-${module.id}`}
                        checked={bulkSelection.modules.includes(module.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setBulkSelection(prev => ({
                              ...prev,
                              modules, module.id]
                            }));
                          } else {
                            setBulkSelection(prev => ({
                              ...prev,
                              modules)
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
                  <Select value={moduleConfig.plan} onValueChange={(value) => setModuleConfig(prev => ({ ...prev, plan))}>
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
                      maxUsers)
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
                        trialDays)
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