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
  Crown,
  Database,
  Webhook,
  Mail,
  Search,
  Layout,
  Zap,
  Link,
  Save,
  CheckSquare
} from 'lucide-react';
import { StandardHeader } from '@/components/standard-header';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

// Import existing functional pages
import TaskManagement from './task-management';
import QueryBuilderPage from './query-builder';
import Workflows from './workflows';
import DataConnectionsPage from './data-connections';
import Reports from './reports';

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

  // Get user's available tabs based on active modules (FUNCTIONAL TOOLS ONLY)
  const getAvailableTabs = () => {
    const functionalTabs = ['workspace'];
    
    // FERRAMENTAS FUNCIONAIS baseadas em módulos ativos
    if (isModuleActive('task_management')) {
      functionalTabs.push('tasks');
    }
    
    if (isModuleActive('calendar_email')) {
      functionalTabs.push('calendar');
    }
    
    if (isModuleActive('query_builder')) {
      functionalTabs.push('queries');
    }
    
    if (isModuleActive('reports')) {
      functionalTabs.push('reports');
    }
    
    if (isModuleActive('dashboard_builder')) {
      functionalTabs.push('dashboards');
    }
    
    if (isModuleActive('workflow_builder')) {
      functionalTabs.push('workflows');
    }
    
    if (isModuleActive('notifications')) {
      functionalTabs.push('notifications');
    }
    
    if (isModuleActive('api_connections')) {
      functionalTabs.push('api_connections');
    }
    
    if (isModuleActive('database_connections')) {
      functionalTabs.push('db_connections');
    }
    
    if (isModuleActive('webhooks')) {
      functionalTabs.push('webhooks');
    }
    
    return functionalTabs;
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

        {/* FUNCTIONAL MODULES OVERVIEW - SEM DADOS ADMINISTRATIVOS */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ferramentas</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeModulesCount}</div>
              <p className="text-xs text-muted-foreground">Módulos ativos</p>
            </CardContent>
          </Card>
          
          {isModuleActive('task_management') && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tarefas</CardTitle>
                <CheckSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">•</div>
                <p className="text-xs text-muted-foreground">Disponível</p>
              </CardContent>
            </Card>
          )}
          
          {isModuleActive('workflow_builder') && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Workflows</CardTitle>
                <Workflow className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">•</div>
                <p className="text-xs text-muted-foreground">Builder ativo</p>
              </CardContent>
            </Card>
          )}
          
          {isModuleActive('query_builder') && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Queries</CardTitle>
                <Search className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">•</div>
                <p className="text-xs text-muted-foreground">Builder ativo</p>
              </CardContent>
            </Card>
          )}
          
          {isModuleActive('dashboard_builder') && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Dashboards</CardTitle>
                <Layout className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">•</div>
                <p className="text-xs text-muted-foreground">Builder ativo</p>
              </CardContent>
            </Card>
          )}
        </div>

        <Tabs defaultValue="workspace" className="w-full">
          <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${Math.min(availableTabs.length, 8)}, 1fr)` }}>
            {availableTabs.includes('workspace') && <TabsTrigger value="workspace">Workspace</TabsTrigger>}
            {availableTabs.includes('tasks') && <TabsTrigger value="tasks">Tarefas</TabsTrigger>}
            {availableTabs.includes('calendar') && <TabsTrigger value="calendar">Agenda</TabsTrigger>}
            {availableTabs.includes('queries') && <TabsTrigger value="queries">Consultas</TabsTrigger>}
            {availableTabs.includes('reports') && <TabsTrigger value="reports">Relatórios</TabsTrigger>}
            {availableTabs.includes('dashboards') && <TabsTrigger value="dashboards">Dashboards</TabsTrigger>}
            {availableTabs.includes('workflows') && <TabsTrigger value="workflows">Workflows</TabsTrigger>}
            {availableTabs.includes('notifications') && <TabsTrigger value="notifications">Notificações</TabsTrigger>}
          </TabsList>
          
          {/* Segunda linha de tabs se necessário */}
          {availableTabs.length > 8 && (
            <TabsList className="grid w-full mt-2" style={{ gridTemplateColumns: `repeat(${availableTabs.length - 8}, 1fr)` }}>
              {availableTabs.includes('api_connections') && <TabsTrigger value="api_connections">APIs</TabsTrigger>}
              {availableTabs.includes('db_connections') && <TabsTrigger value="db_connections">Bancos</TabsTrigger>}
              {availableTabs.includes('webhooks') && <TabsTrigger value="webhooks">Webhooks</TabsTrigger>}
            </TabsList>
          )}

          <TabsContent value="workspace" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>
                    <Save className="h-5 w-5 mr-2 inline" />
                    Meu Workspace
                  </CardTitle>
                  <CardDescription>Suas ferramentas e dados salvos</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center text-muted-foreground py-8">
                      <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p className="mb-2">Workspace do Cliente</p>
                      <p className="text-sm">
                        Suas consultas, relatórios e dashboards ficam salvos aqui.
                        <br />
                        Acesso restrito apenas aos seus dados.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Ferramentas Disponíveis</CardTitle>
                  <CardDescription>Módulos ativos para sua empresa</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {isModuleActive('task_management') && (
                    <Button variant="outline" className="w-full justify-start" onClick={() => window.location.hash = 'tasks'}>
                      <CheckSquare className="h-4 w-4 mr-2" />
                      Gestão de Tarefas
                    </Button>
                  )}
                  
                  {isModuleActive('query_builder') && (
                    <Button variant="outline" className="w-full justify-start" onClick={() => window.location.hash = 'queries'}>
                      <Search className="h-4 w-4 mr-2" />
                      Construtor de Consultas
                    </Button>
                  )}
                  
                  {isModuleActive('workflow_builder') && (
                    <Button variant="outline" className="w-full justify-start" onClick={() => window.location.hash = 'workflows'}>
                      <Workflow className="h-4 w-4 mr-2" />
                      Builder de Workflows
                    </Button>
                  )}
                  
                  {isModuleActive('reports') && (
                    <Button variant="outline" className="w-full justify-start" onClick={() => window.location.hash = 'reports'}>
                      <FileText className="h-4 w-4 mr-2" />
                      Relatórios Personalizados
                    </Button>
                  )}

                  {isModuleActive('database_connections') && (
                    <Button variant="outline" className="w-full justify-start" onClick={() => window.location.hash = 'db_connections'}>
                      <Database className="h-4 w-4 mr-2" />
                      Conexões de Dados
                    </Button>
                  )}

                  {/* Upgrade button if limited functionality */}
                  {activeModulesCount < 5 && (
                    <Button variant="outline" className="w-full justify-start border-dashed border-orange-300 text-orange-600 hover:bg-orange-50">
                      <Crown className="h-4 w-4 mr-2" />
                      Solicitar Mais Módulos
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* PÁGINAS FUNCIONAIS REAIS INTEGRADAS */}
          
          {availableTabs.includes('tasks') && (
            <TabsContent value="tasks" className="space-y-4">
              <TaskManagement />
            </TabsContent>
          )}

          {availableTabs.includes('calendar') && (
            <TabsContent value="calendar" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>
                    <Calendar className="h-5 w-5 mr-2 inline" />
                    Agenda e E-mail
                  </CardTitle>
                  <CardDescription>Módulo de agenda integrada com e-mail</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="text-center text-muted-foreground py-8">
                    <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="mb-2">Módulo Agenda/E-mail</p>
                    <p className="text-sm">
                      Sistema de agenda integrada com notificações por e-mail.
                      <br />
                      <strong>Em desenvolvimento</strong> - Disponível em breve.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {availableTabs.includes('queries') && (
            <TabsContent value="queries" className="space-y-4">
              <QueryBuilderPage />
            </TabsContent>
          )}

          {availableTabs.includes('reports') && (
            <TabsContent value="reports" className="space-y-4">
              <Reports />
            </TabsContent>
          )}

          {availableTabs.includes('dashboards') && (
            <TabsContent value="dashboards" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>
                    <Layout className="h-5 w-5 mr-2 inline" />
                    Dashboard Builder
                  </CardTitle>
                  <CardDescription>Construtor de dashboards personalizados</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="text-center text-muted-foreground py-8">
                    <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="mb-2">Dashboard Builder</p>
                    <p className="text-sm">
                      Crie dashboards personalizados com seus dados.
                      <br />
                      <strong>Em desenvolvimento</strong> - Disponível em breve.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {availableTabs.includes('workflows') && (
            <TabsContent value="workflows" className="space-y-4">
              <Workflows />
            </TabsContent>
          )}

          {availableTabs.includes('notifications') && (
            <TabsContent value="notifications" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>
                    <Bell className="h-5 w-5 mr-2 inline" />
                    Central de Notificações
                  </CardTitle>
                  <CardDescription>Gestão de notificações e alertas</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="text-center text-muted-foreground py-8">
                    <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="mb-2">Sistema de Notificações</p>
                    <p className="text-sm">
                      Central de notificações push, e-mail e SMS.
                      <br />
                      <strong>Em desenvolvimento</strong> - Disponível em breve.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {availableTabs.includes('api_connections') && (
            <TabsContent value="api_connections" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>
                    <Zap className="h-5 w-5 mr-2 inline" />
                    Conexões API
                  </CardTitle>
                  <CardDescription>Integração com APIs externas</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="text-center text-muted-foreground py-8">
                    <Link className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="mb-2">Conexões API</p>
                    <p className="text-sm">
                      Conecte-se com APIs de terceiros para integração de dados.
                      <br />
                      <strong>Em desenvolvimento</strong> - Disponível em breve.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {availableTabs.includes('db_connections') && (
            <TabsContent value="db_connections" className="space-y-4">
              <DataConnectionsPage />
            </TabsContent>
          )}

          {availableTabs.includes('webhooks') && (
            <TabsContent value="webhooks" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>
                    <Webhook className="h-5 w-5 mr-2 inline" />
                    Webhooks
                  </CardTitle>
                  <CardDescription>Configuração de webhooks e callbacks</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="text-center text-muted-foreground py-8">
                    <Webhook className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="mb-2">Sistema de Webhooks</p>
                    <p className="text-sm">
                      Configure webhooks para receber notificações em tempo real.
                      <br />
                      <strong>Em desenvolvimento</strong> - Disponível em breve.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}