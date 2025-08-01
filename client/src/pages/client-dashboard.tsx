import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  BarChart3, 
  Users, 
  Workflow, 
  Settings, 
  Plus, 
  Activity,
  TrendingUp,
  FileText,
  Calendar,
  Bell,
  Lock,
  Package,
  Crown
} from 'lucide-react';
import { StandardHeader } from '@/components/standard-header';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export default function ClientDashboard() {
  const [selectedTenant, setSelectedTenant] = useState<any>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch tenant modules (to determine available functionality)
  const { data: tenantModules = [], isLoading: loadingModules } = useQuery({
    queryKey: ['/api/modules/tenant'],
  });

  // Fetch tenant dashboard data
  const { data: dashboardData, isLoading: loadingDashboard } = useQuery({
    queryKey: ['/api/dashboard/client-data'],
  });

  useEffect(() => {
    const tenant = localStorage.getItem('selectedTenant');
    if (tenant) {
      setSelectedTenant(JSON.parse(tenant));
    } else {
      // Redirect to tenant selection if no tenant is selected
      window.location.href = '/select-tenant';
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('selectedTenant');
    window.location.href = '/api/logout';
  };

  const handleBackToSelection = () => {
    localStorage.removeItem('selectedTenant');
    window.location.href = '/select-tenant';
  };

  // Check if a module is available and active for this tenant
  const isModuleActive = (moduleCode: string) => {
    return tenantModules.some((module: any) => 
      module.moduleCode === moduleCode && 
      module.isEnabled && 
      module.status === 'active'
    );
  };

  // Get user's available tabs based on role and active modules
  const getAvailableTabs = () => {
    const baseTabs = ['overview'];
    
    // Add tabs based on active modules and user permissions
    if (isModuleActive('workflows') && (user?.role === 'tenant_admin' || user?.role === 'manager')) {
      baseTabs.push('workflows');
    }
    
    if (isModuleActive('clients') && user?.role !== 'employee') {
      baseTabs.push('clients');
    }
    
    if (isModuleActive('reports')) {
      baseTabs.push('reports');
    }
    
    // Settings available for admins and managers
    if (user?.role === 'tenant_admin' || user?.role === 'manager') {
      baseTabs.push('settings');
    }
    
    return baseTabs;
  };

  const availableTabs = getAvailableTabs();

  if (!selectedTenant || loadingModules || loadingDashboard) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  const activeModulesCount = tenantModules.filter((m: any) => m.isEnabled && m.status === 'active').length;

  return (
    <div className="min-h-screen bg-gray-50">
      <StandardHeader 
        showUserActions={true}
        user={user}
        onLogout={handleLogout}
      />
      
      <div className="px-6 py-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {selectedTenant.name}
            </h1>
            <p className="text-gray-600">
              Portal do Cliente - Funcionalidades baseadas no seu plano
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" onClick={handleBackToSelection}>
              Trocar Empresa
            </Button>
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              <Package className="w-3 h-3 mr-1" />
              {activeModulesCount} módulos ativos
            </Badge>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              {user?.role === 'tenant_admin' ? 'Administrador' : 
               user?.role === 'manager' ? 'Gerente' : 'Funcionário'}
            </Badge>
          </div>
        </div>

        {/* Alert about module limitations */}
        {activeModulesCount === 0 && (
          <Alert className="mb-6">
            <Lock className="h-4 w-4" />
            <AlertDescription>
              Nenhum módulo está ativo para sua empresa. Entre em contato com a equipe TOIT para ativar funcionalidades.
            </AlertDescription>
          </Alert>
        )}

        {/* Dashboard Cards - Show based on available modules */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Módulos Ativos</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeModulesCount}</div>
              <p className="text-xs text-muted-foreground">
                {tenantModules.length - activeModulesCount} disponíveis
              </p>
            </CardContent>
          </Card>
          
          {isModuleActive('workflows') && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Workflows</CardTitle>
                <Workflow className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardData?.workflowCount || 0}</div>
                <p className="text-xs text-muted-foreground">+2 este mês</p>
              </CardContent>
            </Card>
          )}
          
          {isModuleActive('users') && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Usuários</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardData?.userCount || 0}</div>
                <p className="text-xs text-muted-foreground">5 novos esta semana</p>
              </CardContent>
            </Card>
          )}
          
          {isModuleActive('reports') && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Relatórios</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardData?.reportCount || 0}</div>
                <p className="text-xs text-muted-foreground">3 pendentes</p>
              </CardContent>
            </Card>
          )}
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${availableTabs.length}, 1fr)` }}>
            {availableTabs.includes('overview') && <TabsTrigger value="overview">Visão Geral</TabsTrigger>}
            {availableTabs.includes('workflows') && <TabsTrigger value="workflows">Workflows</TabsTrigger>}
            {availableTabs.includes('clients') && <TabsTrigger value="clients">Clientes</TabsTrigger>}
            {availableTabs.includes('reports') && <TabsTrigger value="reports">Relatórios</TabsTrigger>}
            {availableTabs.includes('settings') && <TabsTrigger value="settings">Configurações</TabsTrigger>}
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Atividade Recente</CardTitle>
                  <CardDescription>Últimas ações na sua empresa</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {dashboardData?.recentActivity?.length > 0 ? (
                      dashboardData.recentActivity.map((activity: any, index: number) => (
                        <div key={index} className="flex items-center space-x-4">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <div>
                            <p className="text-sm font-medium">{activity.description}</p>
                            <p className="text-xs text-muted-foreground">{activity.timestamp}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">Nenhuma atividade recente</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Ações Rápidas</CardTitle>
                  <CardDescription>Funcionalidades disponíveis para você</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {isModuleActive('workflows') && (user?.role === 'tenant_admin' || user?.role === 'manager') && (
                    <Button className="w-full justify-start">
                      <Plus className="h-4 w-4 mr-2" />
                      Criar Novo Workflow
                    </Button>
                  )}
                  
                  {isModuleActive('clients') && user?.role !== 'employee' && (
                    <Button variant="outline" className="w-full justify-start">
                      <Users className="h-4 w-4 mr-2" />
                      Gerenciar Clientes
                    </Button>
                  )}
                  
                  {isModuleActive('reports') && (
                    <Button variant="outline" className="w-full justify-start">
                      <FileText className="h-4 w-4 mr-2" />
                      Gerar Relatório
                    </Button>
                  )}
                  
                  {(user?.role === 'tenant_admin' || user?.role === 'manager') && (
                    <Button variant="outline" className="w-full justify-start">
                      <Settings className="h-4 w-4 mr-2" />
                      Configurações
                    </Button>
                  )}

                  {/* Upgrade button if limited functionality */}
                  {activeModulesCount < 3 && (
                    <Button variant="outline" className="w-full justify-start border-dashed border-orange-300 text-orange-600 hover:bg-orange-50">
                      <Crown className="h-4 w-4 mr-2" />
                      Solicitar Mais Módulos
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {availableTabs.includes('workflows') && (
            <TabsContent value="workflows" className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Workflows da Empresa</h2>
                {(user?.role === 'tenant_admin' || user?.role === 'manager') && (
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Workflow
                  </Button>
                )}
              </div>
              <Card>
                <CardContent className="p-6">
                  <p className="text-center text-muted-foreground">
                    Interface de workflows limitada baseada no seu plano.
                    <br />
                    Funcionalidades disponíveis conforme módulos ativos.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {availableTabs.includes('clients') && (
            <TabsContent value="clients" className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Gestão de Clientes</h2>
                {user?.role !== 'employee' && (
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Cliente
                  </Button>
                )}
              </div>
              <Card>
                <CardContent className="p-6">
                  <p className="text-center text-muted-foreground">
                    Gestão de clientes baseada nas suas permissões.
                    <br />
                    {user?.role === 'employee' ? 'Visualização limitada.' : 'Acesso completo ao módulo.'}
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {availableTabs.includes('reports') && (
            <TabsContent value="reports" className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Relatórios</h2>
                <Button>
                  <FileText className="h-4 w-4 mr-2" />
                  Novo Relatório
                </Button>
              </div>
              <Card>
                <CardContent className="p-6">
                  <p className="text-center text-muted-foreground">
                    Relatórios personalizados baseados nos seus módulos ativos.
                    <br />
                    Dados filtrados conforme suas permissões.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {availableTabs.includes('settings') && (
            <TabsContent value="settings" className="space-y-4">
              <h2 className="text-xl font-semibold">Configurações</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Informações da Empresa</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p><strong>Nome:</strong> {selectedTenant.name}</p>
                      <p><strong>Plano:</strong> {selectedTenant.plan || 'Personalizado'}</p>
                      <p><strong>Módulos Ativos:</strong> {activeModulesCount}</p>
                      <p><strong>Sua Função:</strong> {
                        user?.role === 'tenant_admin' ? 'Administrador' : 
                        user?.role === 'manager' ? 'Gerente' : 'Funcionário'
                      }</p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Módulos Disponíveis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {tenantModules.map((module: any) => (
                        <div key={module.id} className="flex items-center justify-between">
                          <span className="text-sm">{module.displayName}</span>
                          <Badge variant={module.isEnabled ? "default" : "secondary"}>
                            {module.isEnabled ? "Ativo" : "Inativo"}
                          </Badge>
                        </div>
                      ))}
                      {tenantModules.length === 0 && (
                        <p className="text-sm text-muted-foreground">
                          Nenhum módulo configurado para sua empresa.
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}