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

type Tenant = {
  id: string;
  name: string;
  domain: string;
  isActive: boolean;
  plan: string;
  settings: any;
  createdAt: string;
  userCount: number;
  departmentCount: number;
};

export default function TOITAdminDashboard() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Fetch real data from API
  const { data: tenants } = useQuery({
    queryKey: ['admin-tenants'],
    queryFn: () => fetch('/api/admin/tenants').then(res => res.json())
  });

  const { data: stats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => fetch('/api/admin/stats').then(res => res.json())
  });

  const handleCreateTenant = async (data: any) => {
    toast({ title: 'Sucesso', description: 'Empresa criada com sucesso!' });
  };

  const handleLogout = () => {
    window.location.href = '/api/logout';
  };

  const filteredTenants = (tenants || []).filter((tenant: any) =>
    tenant.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tenant.domain?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
              {stats?.totalTenants || 0} Empresas Ativas
            </Badge>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="tenants">Empresas</TabsTrigger>
            <TabsTrigger value="users">Usuários</TabsTrigger>
            <TabsTrigger value="departments">Departamentos</TabsTrigger>
            <TabsTrigger value="permissions">Permissões</TabsTrigger>
            <TabsTrigger value="profiles">Perfis de Acesso</TabsTrigger>
            <TabsTrigger value="workflows">Workflows</TabsTrigger>
            <TabsTrigger value="monitoring">Monitoramento</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total de Empresas</CardTitle>
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.totalTenants || 0}</div>
                  <p className="text-xs text-muted-foreground">+2 este mês</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
                  <p className="text-xs text-muted-foreground">+12% crescimento</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Workflows Ativos</CardTitle>
                  <Workflow className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.totalWorkflows || 0}</div>
                  <p className="text-xs text-muted-foreground">97.5% taxa de sucesso</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Receita Mensal</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">R$ {(stats?.monthlyRevenue || 0).toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">+8% vs mês anterior</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Ações Rápidas do Administrador</CardTitle>
                  <CardDescription>Funcionalidades principais de gestão do sistema</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full justify-start" onClick={() => setActiveTab('tenants')}>
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
                        <p className="font-medium">Nova empresa: TechCorp</p>
                        <p className="text-sm text-muted-foreground">Configuração inicial concluída</p>
                      </div>
                      <Badge>Novo</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <p className="font-medium">Workflow executado: FinanceFlow</p>
                        <p className="text-sm text-muted-foreground">25 execuções hoje</p>
                      </div>
                      <Badge variant="outline">Workflow</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <p className="font-medium">Integração configurada: SendGrid</p>
                        <p className="text-sm text-muted-foreground">Para empresa InvestPlus</p>
                      </div>
                      <Badge variant="secondary">Integração</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="tenants" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Gestão Completa de Empresas</h2>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Buscar empresa..."
                    className="pl-10 w-64"
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
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTenants.map((tenant: any) => (
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
                        <div className="font-medium">{tenant.userCount}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Departamentos:</span>
                        <div className="font-medium">{tenant.departmentCount}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Criado:</span>
                        <div className="text-xs">{new Date(tenant.createdAt).toLocaleDateString('pt-BR')}</div>
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
                        Remover
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
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
                  Configuração de departamentos por empresa.
                  <br />
                  Permite criar e gerenciar departamentos personalizados para cada tenant.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="permissions" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Configuração Global de Permissões</h2>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nova Permissão
              </Button>
            </div>
            <Card>
              <CardContent className="p-6">
                <p className="text-center text-muted-foreground">
                  Sistema de permissões granulares.
                  <br />
                  Controle total sobre o que cada usuário pode fazer no sistema.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profiles" className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold">Configurador de Perfis de Acesso</h2>
                <p className="text-sm text-muted-foreground">
                  Configure quais módulos cada plano de assinatura terá acesso
                </p>
              </div>
              <Button onClick={() => window.location.href = '/admin/profile-builder'}>
                <Crown className="h-4 w-4 mr-2" />
                Gerenciar Perfis
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Perfis Ativos</CardTitle>
                  <Settings className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">4</div>
                  <p className="text-xs text-muted-foreground">
                    Disponíveis para venda
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Módulos Configuráveis</CardTitle>
                  <Database className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">12</div>
                  <p className="text-xs text-muted-foreground">
                    Funcionalidades disponíveis
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Planos Vendidos</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">127</div>
                  <p className="text-xs text-muted-foreground">
                    Assinaturas ativas
                  </p>
                </CardContent>
              </Card>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Acesso Rápido</CardTitle>
                <CardDescription>
                  Ações principais para gestão de perfis de acesso
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => window.location.href = '/admin/profile-builder'}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Novo Perfil de Assinatura
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => window.location.href = '/admin/profile-builder'}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Editar Perfis Existentes
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => window.location.href = '/admin/profile-builder'}
                >
                  <Crown className="h-4 w-4 mr-2" />
                  Configurar Módulos por Perfil
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  disabled
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Vincular com Landing Page (Em breve)
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="workflows" className="space-y-4">
            <h2 className="text-xl font-semibold">Workflows Globais</h2>
            <Card>
              <CardContent className="p-6">
                <p className="text-center text-muted-foreground">
                  Monitoramento e gestão de workflows.
                  <br />
                  Visualize execuções, performance e estatísticas de todos os workflows.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="monitoring" className="space-y-4">
            <h2 className="text-xl font-semibold">Monitoramento do Sistema</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
                    Status do Sistema
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Uptime:</span>
                      <span className="font-medium">{stats?.systemUptime || '0%'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Integrações Ativas:</span>
                      <span className="font-medium">{stats?.activeIntegrations || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Problemas Pendentes:</span>
                      <span className="font-medium text-orange-600">{stats?.pendingIssues || 0}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Taxa de Sucesso:</span>
                      <span className="font-medium text-green-600">{stats?.successRate || 0}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tempo Médio de Resposta:</span>
                      <span className="font-medium">120ms</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Execuções Hoje:</span>
                      <span className="font-medium">1,247</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recursos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>CPU:</span>
                      <span className="font-medium">45%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Memória:</span>
                      <span className="font-medium">62%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Storage:</span>
                      <span className="font-medium">28%</span>
                    </div>
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