import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import {
  Building2,
  Users,
  Activity,
  TrendingUp,
  Settings,
  Plus,
  Edit,
  Trash2,
  Shield,
  Database,
  Workflow,
  BarChart3,
  UserCheck,
  Key,
  Monitor,
  Crown,
  FileText,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  Download,
  Upload,
  Search,
  Filter
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { StandardHeader } from '@/components/standard-header';
import { useAuth } from '@/hooks/useAuth';
import { SalesMetricsDashboard } from '@/components/sales-metrics-dashboard';
import { SubscriptionReportsDashboard } from '@/components/subscription-reports-dashboard';
import ModuleManager from './module-manager';
import TenantControlDashboard from './tenant-control-dashboard';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Fetch real data from API
  const { data: tenants, isLoading: tenantsLoading } = useQuery({
    queryKey: ['admin-tenants'],
    queryFn: () => fetch('/api/admin/tenants').then(res => res.json())
  });

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => fetch('/api/admin/stats').then(res => res.json())
  });

  const createTenantMutation = useMutation({
    mutationFn: (data) => fetch('/api/admin/tenants', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-tenants']);
      toast({ 
        title: 'Sucesso', 
        description: 'Empresa criada com sucesso!' 
      });
    }
  });

  const handleCreateTenant = async (data) => {
    createTenantMutation.mutate(data);
  };

  const handleLogout = () => {
    window.location.href = '/api/logout';
  };

  const filteredTenants = (tenants || []).filter((tenant) =>
    tenant.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tenant.domain?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Mock data for demonstration
  const mockStats = {
    totalTenants: 12,
    totalUsers: 245,
    totalRevenue: 45000,
    activeSubscriptions: 8
  };

  const mockTenants = [
    {
      id: 1,
      name: 'Empresa Alpha',
      domain: 'alpha',
      isActive: true,
      plan: 'Premium',
      users: 25,
      createdAt: new Date('2024-01-15')
    },
    {
      id: 2,
      name: 'Beta Solutions',
      domain: 'beta',
      isActive: true,
      plan: 'Standard',
      users: 15,
      createdAt: new Date('2024-02-10')
    }
  ];

  const displayStats = stats || mockStats;
  const displayTenants = tenants || mockTenants;

  return (
    <div className="min-h-screen bg-gray-50">
      <StandardHeader 
        showUserActions={true}
        user={user}
        onLogout={handleLogout}
      />
      
      <div className="px-6 py-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Button variant="outline" onClick={() => window.location.href = '/select-tenant'}>
              Acessar Como Cliente
            </Button>
            <Button variant="outline" onClick={() => window.location.href = '/'}>
              Ver Site Público
            </Button>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <CheckCircle className="w-3 h-3 mr-1" />
              Sistema Online
            </Badge>
            <Badge variant="outline">
              {displayStats?.totalTenants || 0} Empresas Ativas
            </Badge>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-11">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="tenants">Empresas</TabsTrigger>
            <TabsTrigger value="tenant-control">Controle Total</TabsTrigger>
            <TabsTrigger value="modules">Módulos</TabsTrigger>
            <TabsTrigger value="users">Usuários</TabsTrigger>
            <TabsTrigger value="departments">Departamentos</TabsTrigger>
            <TabsTrigger value="permissions">Permissões</TabsTrigger>
            <TabsTrigger value="profiles">Perfis de Acesso</TabsTrigger>
            <TabsTrigger value="sales">Vendas</TabsTrigger>
            <TabsTrigger value="subscriptions">Assinaturas</TabsTrigger>
            <TabsTrigger value="monitoring">Monitoramento</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total de Empresas</CardTitle>
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{displayStats.totalTenants}</div>
                  <p className="text-xs text-muted-foreground">+2 novas este mês</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Usuários Ativos</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{displayStats.totalUsers}</div>
                  <p className="text-xs text-muted-foreground">+12% vs mês anterior</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">R$ {displayStats.totalRevenue?.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">+8% vs mês anterior</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Assinaturas Ativas</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{displayStats.activeSubscriptions}</div>
                  <p className="text-xs text-muted-foreground">+1 nova esta semana</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Ações Rápidas</CardTitle>
                  <CardDescription>Acesso rápido às principais funcionalidades</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" className="w-full justify-start" onClick={() => setActiveTab('tenants')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Criar Nova Empresa
                  </Button>
                  <Button variant="outline" className="w-full justify-start" onClick={() => setActiveTab('users')}>
                    <UserCheck className="h-4 w-4 mr-2" />
                    Gerenciar Usuários
                  </Button>
                  <Button variant="outline" className="w-full justify-start" onClick={() => setActiveTab('permissions')}>
                    <Key className="h-4 w-4 mr-2" />
                    Configurar Permissões
                  </Button>
                  <Button variant="outline" className="w-full justify-start" onClick={() => setActiveTab('monitoring')}>
                    <Monitor className="h-4 w-4 mr-2" />
                    Monitorar Sistema
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Atividade Recente do Sistema</CardTitle>
                  <CardDescription>Últimas atividades em todas as empresas</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <p className="font-medium">Nova empresa criada</p>
                        <p className="text-sm text-muted-foreground">Beta Solutions - há 2 horas</p>
                      </div>
                      <Badge variant="outline">Novo</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <p className="font-medium">Usuário adicionado</p>
                        <p className="text-sm text-muted-foreground">João Silva - Alpha - há 4 horas</p>
                      </div>
                      <Badge variant="outline">Usuário</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <p className="font-medium">Módulo ativado</p>
                        <p className="text-sm text-muted-foreground">CRM - Gamma Corp - há 1 dia</p>
                      </div>
                      <Badge variant="outline">Módulo</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="tenants" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Gestão de Empresas</h2>
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar empresas..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Button onClick={handleCreateTenant}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Empresa
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTenants.map((tenant) => (
                <Card key={tenant.id} className="relative">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      {tenant.name}
                      <Badge variant={tenant.isActive ? "default" : "secondary"}>
                        {tenant.isActive ? "Ativo" : "Inativo"}
                      </Badge>
                    </CardTitle>
                    <CardDescription>{tenant.domain}.toitflow.com</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Plano:</span>
                        <div className="font-medium">{tenant.plan}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Usuários:</span>
                        <div className="font-medium">{tenant.users}</div>
                      </div>
                      <div className="col-span-2">
                        <span className="text-muted-foreground">Criado em:</span>
                        <div className="font-medium">{tenant.createdAt?.toLocaleDateString('pt-BR')}</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4 mr-1" />
                        Configurar
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-1" />
                        Editar
                      </Button>

                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <Button variant="outline" size="sm" onClick={() => window.open(`/tenant/${tenant.domain}`, '_blank')}>
                        <Eye className="h-4 w-4 mr-1" />
                        Visualizar
                      </Button>
                      <Button variant="destructive" size="sm">
                        <Trash2 className="h-4 w-4 mr-1" />
                        Excluir
                      </Button>

                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="modules" className="space-y-4">
            <ModuleManager />
          </TabsContent>

          <TabsContent value="tenant-control" className="space-y-4">
            <TenantControlDashboard />
          </TabsContent>

          <TabsContent value="users" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Gestão Global de Usuários</h2>
              <div className="flex gap-2">
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar Lista
                </Button>
                <Button variant="outline">
                  <Upload className="h-4 w-4 mr-2" />
                  Importar Usuários
                </Button>
              </div>
            </div>
            <Card>
              <CardContent className="p-6">
                <p className="text-center text-muted-foreground">
                  Funcionalidade de gestão de usuários será implementada aqui.
                  <br />
                  Permitirá visualizar, editar e gerenciar todos os usuários do sistema.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="departments" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Departamentos por Empresa</h2>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Filtrar por Empresa
              </Button>
            </div>
            <Card>
              <CardContent className="p-6">
                <p className="text-center text-muted-foreground">
                  Funcionalidade de gestão de departamentos será implementada aqui.
                  <br />
                  Permitirá visualizar e gerenciar departamentos de todas as empresas.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="permissions" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Sistema de Permissões</h2>
              <Button variant="outline">
                <Shield className="h-4 w-4 mr-2" />
                Nova Permissão
              </Button>
            </div>
            <Card>
              <CardContent className="p-6">
                <p className="text-center text-muted-foreground">
                  Sistema de permissões será implementado aqui.
                  <br />
                  Permitirá configurar permissões granulares para usuários e perfis.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profiles" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Perfis de Acesso</h2>
              <Button variant="outline">
                <Crown className="h-4 w-4 mr-2" />
                Novo Perfil
              </Button>
            </div>
            <Card>
              <CardContent className="p-6">
                <p className="text-center text-muted-foreground">
                  Gestão de perfis de acesso será implementada aqui.
                  <br />
                  Permitirá criar e gerenciar perfis com diferentes níveis de acesso.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sales" className="space-y-4">
            <SalesMetricsDashboard />
          </TabsContent>

          <TabsContent value="subscriptions" className="space-y-4">
            <SubscriptionReportsDashboard />
          </TabsContent>

          <TabsContent value="monitoring" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Monitoramento do Sistema</h2>
              <div className="flex gap-2">
                <Button variant="outline">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Relatórios
                </Button>
                <Button variant="outline">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Alertas
                </Button>

              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Database className="h-5 w-5 mr-2" />
                    Status do Banco
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span>Conexões Ativas</span>
                      <Badge variant="outline" className="bg-green-50 text-green-700">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Normal
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Status</span>
                      <Badge variant="outline" className="bg-green-50 text-green-700">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Saudável
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Activity className="h-5 w-5 mr-2" />
                    Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span>Tempo de Resposta</span>
                    <Badge variant="outline" className="bg-green-50 text-green-700">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Ótimo
                    </Badge>
                  </div>
                  <div className="mt-2 text-sm text-muted-foreground">
                    Média: 120ms
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shield className="h-5 w-5 mr-2" />
                    Segurança
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span>Tentativas de Login</span>
                    <Badge variant="outline" className="bg-green-50 text-green-700">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Normal
                    </Badge>
                  </div>
                  <div className="mt-2 text-sm text-muted-foreground">
                    0 tentativas suspeitas hoje
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
        
      </div>
    </div>
  );
}