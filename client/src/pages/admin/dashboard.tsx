import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
import { apiRequest } from '@/lib/queryClient';
import toitWorkflowLogo from '@/assets/SELOtoit-workflow-logo.svg';

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
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');

  // Queries for all data needed by TOIT admin
  const { data: tenants = [], isLoading: loadingTenants } = useQuery({
    queryKey: ['/api/admin/tenants'],
    retry: false,
  });

  const { data: systemStats, isLoading: loadingStats } = useQuery({
    queryKey: ['/api/admin/stats'],
    retry: false,
  });

  const { data: globalUsers = [], isLoading: loadingUsers } = useQuery({
    queryKey: ['/api/admin/users'],
    retry: false,
  });

  const { data: globalDepartments = [], isLoading: loadingDepartments } = useQuery({
    queryKey: ['/api/admin/departments'],
    retry: false,
  });

  const { data: globalPermissions = [], isLoading: loadingPermissions } = useQuery({
    queryKey: ['/api/admin/permissions'],
    retry: false,
  });

  const { data: globalWorkflows = [], isLoading: loadingWorkflows } = useQuery({
    queryKey: ['/api/admin/workflows'],
    retry: false,
  });

  const { data: globalIntegrations = [], isLoading: loadingIntegrations } = useQuery({
    queryKey: ['/api/admin/integrations'],
    retry: false,
  });

  const { data: systemHealth = [], isLoading: loadingHealth } = useQuery({
    queryKey: ['/api/admin/health'],
    retry: false,
  });

  const { data: systemLogs = [], isLoading: loadingLogs } = useQuery({
    queryKey: ['/api/admin/logs'],
    retry: false,
  });

  // Mutations for TOIT admin actions
  const createTenant = useMutation({
    mutationFn: (data: any) => apiRequest('/api/admin/tenants', { method: 'POST', body: data }),
    onSuccess: () => {
      toast({ title: 'Sucesso', description: 'Empresa criada com sucesso!' });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/tenants'] });
    },
    onError: () => {
      toast({ title: 'Erro', description: 'Falha ao criar empresa', variant: 'destructive' });
    },
  });

  const updateTenant = useMutation({
    mutationFn: ({ id, ...data }: any) => apiRequest(`/api/admin/tenants/${id}`, { method: 'PUT', body: data }),
    onSuccess: () => {
      toast({ title: 'Sucesso', description: 'Empresa atualizada!' });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/tenants'] });
    },
  });

  const deleteTenant = useMutation({
    mutationFn: (id: string) => apiRequest(`/api/admin/tenants/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      toast({ title: 'Sucesso', description: 'Empresa removida!' });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/tenants'] });
    },
  });

  const setupTenantDefaults = useMutation({
    mutationFn: (tenantId: string) => apiRequest(`/api/admin/tenants/${tenantId}/setup-defaults`, { method: 'POST' }),
    onSuccess: () => {
      toast({ title: 'Sucesso', description: 'Estrutura padrão configurada!' });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/departments'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/permissions'] });
    },
  });

  const createGlobalPermission = useMutation({
    mutationFn: (data: any) => apiRequest('/api/admin/permissions', { method: 'POST', body: data }),
    onSuccess: () => {
      toast({ title: 'Sucesso', description: 'Permissão global criada!' });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/permissions'] });
    },
  });

  const assignUserToTenant = useMutation({
    mutationFn: ({ userId, tenantId, role }: any) => 
      apiRequest(`/api/admin/users/${userId}/assign-tenant`, { method: 'POST', body: { tenantId, role } }),
    onSuccess: () => {
      toast({ title: 'Sucesso', description: 'Usuário atribuído à empresa!' });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
    },
  });

  const filteredTenants = tenants.filter((tenant: Tenant) =>
    tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tenant.domain.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const mockStats = {
    totalTenants: tenants.length || 5,
    totalUsers: globalUsers.length || 42,
    totalWorkflows: globalWorkflows.length || 28,
    systemUptime: '99.9%',
    monthlyRevenue: 125000,
    activeIntegrations: globalIntegrations.filter((i: any) => i.status === 'active').length || 15,
    pendingIssues: 3,
    successRate: 97.5
  };

  if (loadingStats && loadingTenants) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>Carregando painel administrativo TOIT...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* TOIT Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <img 
              src={toitWorkflowLogo} 
              alt="TOIT Workflow" 
              className="h-16 w-16"
            />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">TOIT - Controle Central</h1>
              <p className="text-sm text-gray-600">
                Gestão completa do sistema InvestFlow para todas as empresas
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" onClick={() => window.location.href = '/select-tenant'}>
              Acessar Como Cliente
            </Button>
            <TenantDialog onSubmit={createTenant.mutate} />
          </div>
        </div>
      </header>

      <div className="p-6 space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-8">
            <TabsTrigger value="overview">
              <BarChart3 className="h-4 w-4 mr-2" />
              Visão Geral
            </TabsTrigger>
            <TabsTrigger value="tenants">
              <Building2 className="h-4 w-4 mr-2" />
              Empresas
            </TabsTrigger>
            <TabsTrigger value="users">
              <Users className="h-4 w-4 mr-2" />
              Usuários Globais
            </TabsTrigger>
            <TabsTrigger value="departments">
              <Shield className="h-4 w-4 mr-2" />
              Departamentos
            </TabsTrigger>
            <TabsTrigger value="permissions">
              <Key className="h-4 w-4 mr-2" />
              Permissões
            </TabsTrigger>
            <TabsTrigger value="workflows">
              <Workflow className="h-4 w-4 mr-2" />
              Workflows
            </TabsTrigger>
            <TabsTrigger value="integrations">
              <Database className="h-4 w-4 mr-2" />
              Integrações
            </TabsTrigger>
            <TabsTrigger value="monitoring">
              <Monitor className="h-4 w-4 mr-2" />
              Monitoramento
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Global System Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total de Empresas</CardTitle>
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{mockStats.totalTenants}</div>
                  <p className="text-xs text-muted-foreground">
                    +2 este mês
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Usuários Ativos</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{mockStats.totalUsers}</div>
                  <p className="text-xs text-muted-foreground">
                    {Math.floor(mockStats.totalUsers * 0.7)} online hoje
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Receita Mensal</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">R$ {mockStats.monthlyRevenue.toLocaleString('pt-BR')}</div>
                  <p className="text-xs text-muted-foreground">
                    +12% vs. mês passado
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Uptime do Sistema</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{mockStats.systemUptime}</div>
                  <p className="text-xs text-muted-foreground">
                    {mockStats.pendingIssues} problemas pendentes
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions and Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Ações Rápidas TOIT</CardTitle>
                  <CardDescription>Principais tarefas administrativas</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full justify-start" onClick={() => setActiveTab('tenants')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Criar Nova Empresa
                  </Button>
                  <Button variant="outline" className="w-full justify-start" onClick={() => setActiveTab('users')}>
                    <UserCheck className="h-4 w-4 mr-2" />
                    Gerenciar Usuários Globalmente
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
                <TenantDialog onSubmit={createTenant.mutate} />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTenants.map((tenant: Tenant) => (
                <Card key={tenant.id} className="relative">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      {tenant.name}
                      <Badge variant={tenant.isActive ? 'default' : 'secondary'}>
                        {tenant.isActive ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </CardTitle>
                    <CardDescription>{tenant.domain}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Usuários:</span>
                        <div className="font-semibold">{tenant.userCount || 0}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Departamentos:</span>
                        <div className="font-semibold">{tenant.departmentCount || 0}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Plano:</span>
                        <Badge variant="outline" className="text-xs">{tenant.plan || 'Basic'}</Badge>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Criado:</span>
                        <div className="text-xs">{new Date(tenant.createdAt || Date.now()).toLocaleDateString('pt-BR')}</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setupTenantDefaults.mutate(tenant.id)}
                        disabled={setupTenantDefaults.isPending}
                      >
                        <Settings className="h-4 w-4 mr-1" />
                        Configurar
                      </Button>
                      <TenantEditDialog 
                        tenant={tenant} 
                        onSubmit={(data) => updateTenant.mutate({ id: tenant.id, ...data })} 
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <Button variant="outline" size="sm" onClick={() => window.open(`/tenant/${tenant.domain}`, '_blank')}>
                        <Eye className="h-4 w-4 mr-1" />
                        Visualizar
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          if (confirm('Tem certeza que deseja remover esta empresa?')) {
                            deleteTenant.mutate(tenant.id);
                          }
                        }}
                      >
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
            <GlobalUsersTable users={globalUsers} tenants={tenants} onAssign={assignUserToTenant.mutate} />
          </TabsContent>

          <TabsContent value="departments" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Departamentos por Empresa</h2>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Filtrar por Empresa
              </Button>
            </div>
            <GlobalDepartmentsTable departments={globalDepartments} tenants={tenants} />
          </TabsContent>

          <TabsContent value="permissions" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Configuração Global de Permissões</h2>
              <GlobalPermissionDialog onSubmit={createGlobalPermission.mutate} />
            </div>
            <GlobalPermissionsTable permissions={globalPermissions} tenants={tenants} />
          </TabsContent>

          <TabsContent value="workflows" className="space-y-4">
            <h2 className="text-xl font-semibold">Workflows Globais</h2>
            <GlobalWorkflowsTable workflows={globalWorkflows} tenants={tenants} />
          </TabsContent>

          <TabsContent value="integrations" className="space-y-4">
            <h2 className="text-xl font-semibold">Integrações do Sistema</h2>
            <GlobalIntegrationsTable integrations={globalIntegrations} tenants={tenants} />
          </TabsContent>

          <TabsContent value="monitoring" className="space-y-4">
            <h2 className="text-xl font-semibold">Monitoramento do Sistema</h2>
            <SystemMonitoring health={systemHealth} logs={systemLogs} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// Components for dialogs and tables
function TenantDialog({ onSubmit }: { onSubmit: (data: any) => void }) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    domain: '',
    plan: 'basic',
    description: '',
    adminEmail: '',
    adminName: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    setOpen(false);
    setFormData({ name: '', domain: '', plan: 'basic', description: '', adminEmail: '', adminName: '' });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nova Empresa
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Criar Nova Empresa</DialogTitle>
          <DialogDescription>
            Configure uma nova empresa no sistema InvestFlow
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Nome da Empresa</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ex: TechCorp Investimentos"
              required
            />
          </div>
          <div>
            <Label htmlFor="domain">Domínio</Label>
            <Input
              id="domain"
              value={formData.domain}
              onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
              placeholder="Ex: techcorp.com"
              required
            />
          </div>
          <div>
            <Label htmlFor="adminName">Nome do Admin</Label>
            <Input
              id="adminName"
              value={formData.adminName}
              onChange={(e) => setFormData({ ...formData, adminName: e.target.value })}
              placeholder="Ex: João Silva"
              required
            />
          </div>
          <div>
            <Label htmlFor="adminEmail">Email do Admin</Label>
            <Input
              id="adminEmail"
              type="email"
              value={formData.adminEmail}
              onChange={(e) => setFormData({ ...formData, adminEmail: e.target.value })}
              placeholder="Ex: admin@techcorp.com"
              required
            />
          </div>
          <div>
            <Label htmlFor="plan">Plano</Label>
            <Select value={formData.plan} onValueChange={(value) => setFormData({ ...formData, plan: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="basic">Basic - R$ 199/mês</SelectItem>
                <SelectItem value="professional">Professional - R$ 499/mês</SelectItem>
                <SelectItem value="enterprise">Enterprise - R$ 999/mês</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="description">Descrição (Opcional)</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descrição da empresa..."
            />
          </div>
          <Button type="submit" className="w-full">
            Criar Empresa
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function TenantEditDialog({ tenant, onSubmit }: { tenant: Tenant; onSubmit: (data: any) => void }) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: tenant.name,
    domain: tenant.domain,
    plan: tenant.plan,
    isActive: tenant.isActive,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Edit className="h-4 w-4 mr-1" />
          Editar
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Empresa</DialogTitle>
          <DialogDescription>
            Atualize as informações da empresa
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Nome da Empresa</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="domain">Domínio</Label>
            <Input
              id="domain"
              value={formData.domain}
              onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="plan">Plano</Label>
            <Select value={formData.plan} onValueChange={(value) => setFormData({ ...formData, plan: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="basic">Basic</SelectItem>
                <SelectItem value="professional">Professional</SelectItem>
                <SelectItem value="enterprise">Enterprise</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" className="w-full">
            Atualizar Empresa
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function GlobalPermissionDialog({ onSubmit }: { onSubmit: (data: any) => void }) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    resource: '',
    action: '',
    description: '',
    isGlobal: true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    setOpen(false);
    setFormData({ name: '', resource: '', action: '', description: '', isGlobal: true });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nova Permissão Global
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Criar Permissão Global</DialogTitle>
          <DialogDescription>
            Defina uma permissão que pode ser usada por todas as empresas
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ex: Gerenciar Clientes"
              required
            />
          </div>
          <div>
            <Label htmlFor="resource">Recurso</Label>
            <Select value={formData.resource} onValueChange={(value) => setFormData({ ...formData, resource: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o recurso" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="clients">Clientes</SelectItem>
                <SelectItem value="reports">Relatórios</SelectItem>
                <SelectItem value="workflows">Workflows</SelectItem>
                <SelectItem value="integrations">Integrações</SelectItem>
                <SelectItem value="users">Usuários</SelectItem>
                <SelectItem value="admin">Administração</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="action">Ação</Label>
            <Select value={formData.action} onValueChange={(value) => setFormData({ ...formData, action: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a ação" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="read">Ler</SelectItem>
                <SelectItem value="write">Escrever</SelectItem>
                <SelectItem value="delete">Deletar</SelectItem>
                <SelectItem value="admin">Administrar</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descreva o que esta permissão permite"
            />
          </div>
          <Button type="submit" className="w-full">
            Criar Permissão Global
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function GlobalUsersTable({ users, tenants, onAssign }: { users: any[]; tenants: any[]; onAssign: (data: any) => void }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Todos os Usuários do Sistema ({users.length})</CardTitle>
        <CardDescription>Visualização e gestão global de todos os usuários cadastrados</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300 dark:border-gray-600">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800">
                <th className="border border-gray-300 dark:border-gray-600 p-2 text-left">Nome</th>
                <th className="border border-gray-300 dark:border-gray-600 p-2 text-left">Email</th>
                <th className="border border-gray-300 dark:border-gray-600 p-2 text-left">Empresa</th>
                <th className="border border-gray-300 dark:border-gray-600 p-2 text-left">Função</th>
                <th className="border border-gray-300 dark:border-gray-600 p-2 text-left">Status</th>
                <th className="border border-gray-300 dark:border-gray-600 p-2 text-left">Último Acesso</th>
                <th className="border border-gray-300 dark:border-gray-600 p-2 text-left">Ações TOIT</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user: any) => (
                <tr key={user.id}>
                  <td className="border border-gray-300 dark:border-gray-600 p-2">
                    {user.firstName} {user.lastName}
                  </td>
                  <td className="border border-gray-300 dark:border-gray-600 p-2">{user.email}</td>
                  <td className="border border-gray-300 dark:border-gray-600 p-2">{user.tenantName || 'Sem empresa'}</td>
                  <td className="border border-gray-300 dark:border-gray-600 p-2">
                    <Badge variant="outline">{user.role}</Badge>
                  </td>
                  <td className="border border-gray-300 dark:border-gray-600 p-2">
                    <Badge variant={user.isActive ? 'default' : 'secondary'}>
                      {user.isActive ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </td>
                  <td className="border border-gray-300 dark:border-gray-600 p-2 text-xs">
                    {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString('pt-BR') : 'Nunca'}
                  </td>
                  <td className="border border-gray-300 dark:border-gray-600 p-2">
                    <div className="flex gap-1">
                      <Button variant="outline" size="sm">
                        <UserCheck className="h-3 w-3 mr-1" />
                        Editar
                      </Button>
                      <Button variant="outline" size="sm">
                        <Shield className="h-3 w-3 mr-1" />
                        Permissões
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

function GlobalDepartmentsTable({ departments, tenants }: { departments: any[]; tenants: any[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Departamentos por Empresa</CardTitle>
        <CardDescription>Visualização de todos os departamentos configurados no sistema</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {tenants.map((tenant: any) => (
            <div key={tenant.id} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg">{tenant.name}</h3>
                <Badge variant="outline">{tenant.domain}</Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {departments
                  .filter((dept: any) => dept.tenantId === tenant.id)
                  .map((dept: any) => (
                    <div key={dept.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded">
                      <div>
                        <span className="font-medium">{dept.name}</span>
                        <p className="text-xs text-muted-foreground">{dept.description}</p>
                      </div>
                      <Badge variant="outline" className="text-xs">{dept.type}</Badge>
                    </div>
                  ))}
              </div>
              {departments.filter((dept: any) => dept.tenantId === tenant.id).length === 0 && (
                <p className="text-sm text-muted-foreground italic">Nenhum departamento configurado</p>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function GlobalPermissionsTable({ permissions, tenants }: { permissions: any[]; tenants: any[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Permissões Globais ({permissions.length})</CardTitle>
        <CardDescription>Todas as permissões configuradas no sistema</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300 dark:border-gray-600">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800">
                <th className="border border-gray-300 dark:border-gray-600 p-2 text-left">Nome</th>
                <th className="border border-gray-300 dark:border-gray-600 p-2 text-left">Recurso</th>
                <th className="border border-gray-300 dark:border-gray-600 p-2 text-left">Ação</th>
                <th className="border border-gray-300 dark:border-gray-600 p-2 text-left">Empresa</th>
                <th className="border border-gray-300 dark:border-gray-600 p-2 text-left">Tipo</th>
                <th className="border border-gray-300 dark:border-gray-600 p-2 text-left">Descrição</th>
                <th className="border border-gray-300 dark:border-gray-600 p-2 text-left">Ações</th>
              </tr>
            </thead>
            <tbody>
              {permissions.map((permission: any) => (
                <tr key={permission.id}>
                  <td className="border border-gray-300 dark:border-gray-600 p-2 font-medium">
                    {permission.name}
                  </td>
                  <td className="border border-gray-300 dark:border-gray-600 p-2">
                    <Badge variant="outline">{permission.resource}</Badge>
                  </td>
                  <td className="border border-gray-300 dark:border-gray-600 p-2">
                    <Badge variant="outline">{permission.action}</Badge>
                  </td>
                  <td className="border border-gray-300 dark:border-gray-600 p-2">
                    {permission.tenantName || (
                      <Badge variant="default" className="bg-purple-100 text-purple-800">Global</Badge>
                    )}
                  </td>
                  <td className="border border-gray-300 dark:border-gray-600 p-2">
                    <Badge variant={permission.isGlobal ? 'default' : 'secondary'}>
                      {permission.isGlobal ? 'Global' : 'Específica'}
                    </Badge>
                  </td>
                  <td className="border border-gray-300 dark:border-gray-600 p-2 text-sm text-muted-foreground">
                    {permission.description}
                  </td>
                  <td className="border border-gray-300 dark:border-gray-600 p-2">
                    <div className="flex gap-1">
                      <Button variant="outline" size="sm">
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

function GlobalWorkflowsTable({ workflows, tenants }: { workflows: any[]; tenants: any[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Workflows Globais ({workflows.length})</CardTitle>
        <CardDescription>Todos os workflows configurados no sistema</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {tenants.map((tenant: any) => (
            <div key={tenant.id} className="border rounded-lg p-4">
              <h3 className="font-semibold mb-3">{tenant.name}</h3>
              <div className="space-y-2">
                {workflows
                  .filter((workflow: any) => workflow.tenantId === tenant.id)
                  .map((workflow: any) => (
                    <div key={workflow.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded">
                      <div>
                        <span className="font-medium">{workflow.name}</span>
                        <p className="text-xs text-muted-foreground">{workflow.description}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={workflow.status === 'active' ? 'default' : 'secondary'}>
                          {workflow.status}
                        </Badge>
                        <Button variant="outline" size="sm">
                          <Eye className="h-3 w-3 mr-1" />
                          Ver
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
              {workflows.filter((workflow: any) => workflow.tenantId === tenant.id).length === 0 && (
                <p className="text-sm text-muted-foreground italic">Nenhum workflow configurado</p>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function GlobalIntegrationsTable({ integrations, tenants }: { integrations: any[]; tenants: any[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Integrações do Sistema ({integrations.length})</CardTitle>
        <CardDescription>Todas as integrações configuradas no sistema</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {tenants.map((tenant: any) => (
            <div key={tenant.id} className="border rounded-lg p-4">
              <h3 className="font-semibold mb-3">{tenant.name}</h3>
              <div className="space-y-2">
                {integrations
                  .filter((integration: any) => integration.tenantId === tenant.id)
                  .map((integration: any) => (
                    <div key={integration.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded">
                      <div>
                        <span className="font-medium">{integration.name}</span>
                        <p className="text-xs text-muted-foreground">{integration.type}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={integration.status === 'active' ? 'default' : 'destructive'}>
                          {integration.status}
                        </Badge>
                        <Button variant="outline" size="sm">
                          <Settings className="h-3 w-3 mr-1" />
                          Configurar
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
              {integrations.filter((integration: any) => integration.tenantId === tenant.id).length === 0 && (
                <p className="text-sm text-muted-foreground italic">Nenhuma integração configurada</p>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function SystemMonitoring({ health, logs }: { health: any[]; logs: any[] }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Status dos Serviços</CardTitle>
          <CardDescription>Monitoramento em tempo real dos componentes do sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span>Database PostgreSQL</span>
              <Badge variant="default" className="bg-green-100 text-green-800">
                <CheckCircle className="h-3 w-3 mr-1" />
                Online
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>API Server</span>
              <Badge variant="default" className="bg-green-100 text-green-800">
                <CheckCircle className="h-3 w-3 mr-1" />
                Online
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Email Service (SendGrid)</span>
              <Badge variant="default" className="bg-green-100 text-green-800">
                <CheckCircle className="h-3 w-3 mr-1" />
                Online
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Workflow Engine</span>
              <Badge variant="default" className="bg-green-100 text-green-800">
                <CheckCircle className="h-3 w-3 mr-1" />
                Online
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>File Storage</span>
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Aviso
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Métricas de Performance</CardTitle>
          <CardDescription>Indicadores chave de performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span>Tempo de Resposta Médio</span>
              <span className="font-semibold">145ms</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Uptime</span>
              <span className="font-semibold text-green-600">99.94%</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Requests/minuto</span>
              <span className="font-semibold">1,847</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Taxa de Erro</span>
              <span className="font-semibold text-red-600">0.06%</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Usuários Simultâneos</span>
              <span className="font-semibold">127</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Uso de CPU</span>
              <span className="font-semibold">23%</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Uso de Memória</span>
              <span className="font-semibold">67%</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Logs do Sistema</CardTitle>
          <CardDescription>Últimas atividades registradas no sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-100 dark:bg-gray-900 p-4 rounded font-mono text-sm space-y-1 max-h-80 overflow-y-auto">
            <div className="text-green-600">[2025-01-30 21:05:30] INFO: New tenant onboarded: TechCorp</div>
            <div className="text-blue-600">[2025-01-30 21:05:15] INFO: User authentication successful: admin@techcorp.com</div>
            <div className="text-purple-600">[2025-01-30 21:05:00] INFO: Workflow executed successfully: sales-automation</div>
            <div className="text-green-600">[2025-01-30 21:04:45] INFO: Email notification sent via SendGrid</div>
            <div className="text-blue-600">[2025-01-30 21:04:30] INFO: Database backup completed successfully</div>
            <div className="text-gray-600">[2025-01-30 21:04:15] INFO: Permission check passed for user: manager123</div>
            <div className="text-orange-600">[2025-01-30 21:04:00] WARN: Rate limit approaching for tenant: investplus</div>
            <div className="text-green-600">[2025-01-30 21:03:45] INFO: New integration configured: webhook-crm</div>
            <div className="text-blue-600">[2025-01-30 21:03:30] INFO: Department assignment completed: user456 → Sales</div>
            <div className="text-gray-600">[2025-01-30 21:03:15] INFO: System health check: All services operational</div>
            <div className="text-red-600">[2025-01-30 21:03:00] ERROR: Failed to send email: Invalid recipient</div>
            <div className="text-green-600">[2025-01-30 21:02:45] INFO: Client category auto-assignment: prospect → premium</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}