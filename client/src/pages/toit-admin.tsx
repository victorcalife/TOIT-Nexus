import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { 
  Building2, Users, Activity, TrendingUp, Settings, Plus, Edit, Trash2, Shield, Database,
  Workflow, BarChart3, UserCheck, Key, Monitor, Crown, FileText, AlertTriangle, CheckCircle, XCircle,
  Eye, Download, Upload, Search, Filter, LogOut, Save, Play
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

export default function ToitAdmin() {
  const [activeSection, setActiveSection] = useState<'dashboard' | 'companies' | 'users' | 'workflows' | 'analytics'>('dashboard');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Form states
  const [companyForm, setCompanyForm] = useState({
    name: '',
    domain: '',
    plan: 'standard'
  });

  const [userForm, setUserForm] = useState({
    email: '',
    firstName: '',
    lastName: '',
    role: 'employee',
    tenantId: ''
  });

  const [workflowForm, setWorkflowForm] = useState({
    name: '',
    description: '',
    tenantId: ''
  });

  // Queries
  const { data: systemStats } = useQuery({
    queryKey: ['/api/admin/system-stats']
  });

  const { data: companies } = useQuery({
    queryKey: ['/api/admin/tenants']
  });

  const { data: users } = useQuery({
    queryKey: ['/api/admin/users']
  });

  // Mutations
  const createCompanyMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest('/api/admin/tenants', 'POST', data);
    },
    onSuccess: () => {
      toast({ title: 'Empresa criada com sucesso!' });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/tenants'] });
      setCompanyForm({ name: '', domain: '', plan: 'standard' });
    },
    onError: (error) => {
      toast({ title: 'Erro ao criar empresa', description: error.message, variant: 'destructive' });
    }
  });

  const createUserMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest('/api/admin/users', 'POST', data);
    },
    onSuccess: () => {
      toast({ title: 'Usuário criado com sucesso!' });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      setUserForm({ email: '', firstName: '', lastName: '', role: 'employee', tenantId: '' });
    },
    onError: (error) => {
      toast({ title: 'Erro ao criar usuário', description: error.message, variant: 'destructive' });
    }
  });

  const createWorkflowMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest('/api/complete-workflows', 'POST', {
        ...data,
        trigger: 'manual',
        steps: [
          {
            id: 'step1',
            type: 'action',
            name: 'Processar dados',
            config: { action: 'process_data' }
          }
        ]
      });
    },
    onSuccess: () => {
      toast({ title: 'Workflow criado com sucesso!' });
      setWorkflowForm({ name: '', description: '', tenantId: '' });
    },
    onError: (error) => {
      toast({ title: 'Erro ao criar workflow', description: error.message, variant: 'destructive' });
    }
  });

  const executeAdaptiveAnalysis = useMutation({
    mutationFn: async (tenantId: string) => {
      return await apiRequest(`/api/adaptive/analyze/${tenantId}`, 'GET');
    },
    onSuccess: (data) => {
      toast({ title: 'Análise adaptativa executada!', description: `${data.insights?.length || 0} insights encontrados` });
    },
    onError: (error) => {
      toast({ title: 'Erro na análise', description: error.message, variant: 'destructive' });
    }
  });

  const sections = [
    { id: 'dashboard', name: 'Dashboard', icon: Monitor },
    { id: 'companies', name: 'Empresas', icon: Building2 },
    { id: 'users', name: 'Usuários', icon: Users },
    { id: 'workflows', name: 'Workflows', icon: Workflow },
    { id: 'analytics', name: 'Analytics', icon: BarChart3 }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <Crown className="h-8 w-8 text-purple-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">TOIT NEXUS Admin</h1>
                <p className="text-sm text-gray-500">Painel Administrativo Completo</p>
              </div>
            </div>
            <Button
              onClick={() => window.location.href = '/api/logout'}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <LogOut className="h-4 w-4" />
              <span>Sair</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <div className="w-64 space-y-2">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id as any)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                  activeSection === section.id 
                    ? 'bg-purple-100 text-purple-700 border-l-4 border-purple-500' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <section.icon className="h-5 w-5" />
                <span className="font-medium">{section.name}</span>
              </button>
            ))}
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Dashboard */}
            {activeSection === 'dashboard' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center">
                        <Building2 className="h-8 w-8 text-blue-600" />
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-500">Empresas</p>
                          <p className="text-2xl font-bold text-gray-900">{systemStats?.totalTenants || companies?.length || 0}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center">
                        <Users className="h-8 w-8 text-green-600" />
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-500">Usuários</p>
                          <p className="text-2xl font-bold text-gray-900">{systemStats?.totalUsers || users?.length || 0}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center">
                        <Workflow className="h-8 w-8 text-purple-600" />
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-500">Workflows</p>
                          <p className="text-2xl font-bold text-gray-900">{systemStats?.totalWorkflows || 0}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center">
                        <Activity className="h-8 w-8 text-orange-600" />
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-500">Uptime</p>
                          <p className="text-2xl font-bold text-gray-900">99.9%</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Empresas Recentes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {companies?.slice(0, 5).map((company: any) => (
                        <div key={company.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <h4 className="font-medium">{company.name}</h4>
                            <p className="text-sm text-gray-500">{company.subscriptionPlan || 'Standard'}</p>
                          </div>
                          <Badge variant={company.isActive ? 'default' : 'secondary'}>
                            {company.isActive ? 'Ativa' : 'Inativa'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Empresas */}
            {activeSection === 'companies' && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Criar Nova Empresa</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="companyName">Nome da Empresa</Label>
                        <Input
                          id="companyName"
                          value={companyForm.name}
                          onChange={(e) => setCompanyForm(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Ex: TechCorp Ltda"
                        />
                      </div>
                      <div>
                        <Label htmlFor="companyDomain">Domínio</Label>
                        <Input
                          id="companyDomain"
                          value={companyForm.domain}
                          onChange={(e) => setCompanyForm(prev => ({ ...prev, domain: e.target.value }))}
                          placeholder="Ex: techcorp"
                        />
                      </div>
                      <div>
                        <Label htmlFor="companyPlan">Plano</Label>
                        <Select value={companyForm.plan} onValueChange={(value) => setCompanyForm(prev => ({ ...prev, plan: value }))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="basic">Básico</SelectItem>
                            <SelectItem value="standard">Padrão</SelectItem>
                            <SelectItem value="premium">Premium</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <Button 
                      onClick={() => createCompanyMutation.mutate(companyForm)}
                      disabled={createCompanyMutation.isPending || !companyForm.name}
                      className="w-full"
                    >
                      {createCompanyMutation.isPending ? 'Criando...' : 'Criar Empresa'}
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Empresas Cadastradas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {companies?.map((company: any) => (
                        <div key={company.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <h4 className="font-medium">{company.name}</h4>
                            <p className="text-sm text-gray-500">Plano: {company.subscriptionPlan || 'Standard'}</p>
                            <p className="text-xs text-gray-400">ID: {company.id}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant={company.isActive !== false ? 'default' : 'secondary'}>
                              {company.isActive !== false ? 'Ativa' : 'Inativa'}
                            </Badge>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => executeAdaptiveAnalysis.mutate(company.id)}
                              disabled={executeAdaptiveAnalysis.isPending}
                            >
                              <Play className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Usuários */}
            {activeSection === 'users' && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Criar Novo Usuário</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="userEmail">Email</Label>
                        <Input
                          id="userEmail"
                          type="email"
                          value={userForm.email}
                          onChange={(e) => setUserForm(prev => ({ ...prev, email: e.target.value }))}
                          placeholder="usuario@empresa.com"
                        />
                      </div>
                      <div>
                        <Label htmlFor="userFirstName">Nome</Label>
                        <Input
                          id="userFirstName"
                          value={userForm.firstName}
                          onChange={(e) => setUserForm(prev => ({ ...prev, firstName: e.target.value }))}
                          placeholder="João"
                        />
                      </div>
                      <div>
                        <Label htmlFor="userLastName">Sobrenome</Label>
                        <Input
                          id="userLastName"
                          value={userForm.lastName}
                          onChange={(e) => setUserForm(prev => ({ ...prev, lastName: e.target.value }))}
                          placeholder="Silva"
                        />
                      </div>
                      <div>
                        <Label htmlFor="userRole">Função</Label>
                        <Select value={userForm.role} onValueChange={(value) => setUserForm(prev => ({ ...prev, role: value }))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="employee">Funcionário</SelectItem>
                            <SelectItem value="manager">Gerente</SelectItem>
                            <SelectItem value="tenant_admin">Admin Empresa</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="userTenant">Empresa</Label>
                        <Select value={userForm.tenantId} onValueChange={(value) => setUserForm(prev => ({ ...prev, tenantId: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione uma empresa" />
                          </SelectTrigger>
                          <SelectContent>
                            {companies?.map((company: any) => (
                              <SelectItem key={company.id} value={company.id}>{company.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <Button 
                      onClick={() => createUserMutation.mutate(userForm)}
                      disabled={createUserMutation.isPending || !userForm.email || !userForm.firstName}
                      className="w-full"
                    >
                      {createUserMutation.isPending ? 'Criando...' : 'Criar Usuário'}
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Usuários Cadastrados</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {users?.map((user: any) => (
                        <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <h4 className="font-medium">{user.firstName} {user.lastName}</h4>
                            <p className="text-sm text-gray-500">{user.email}</p>
                            <p className="text-xs text-gray-400">Função: {user.role}</p>
                          </div>
                          <Badge variant={user.isActive ? 'default' : 'secondary'}>
                            {user.isActive ? 'Ativo' : 'Inativo'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Workflows */}
            {activeSection === 'workflows' && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Criar Novo Workflow</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <Label htmlFor="workflowName">Nome do Workflow</Label>
                        <Input
                          id="workflowName"
                          value={workflowForm.name}
                          onChange={(e) => setWorkflowForm(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Ex: Processamento de Clientes"
                        />
                      </div>
                      <div>
                        <Label htmlFor="workflowDescription">Descrição</Label>
                        <Textarea
                          id="workflowDescription"
                          value={workflowForm.description}
                          onChange={(e) => setWorkflowForm(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Descreva o que este workflow faz..."
                        />
                      </div>
                      <div>
                        <Label htmlFor="workflowTenant">Empresa</Label>
                        <Select value={workflowForm.tenantId} onValueChange={(value) => setWorkflowForm(prev => ({ ...prev, tenantId: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione uma empresa" />
                          </SelectTrigger>
                          <SelectContent>
                            {companies?.map((company: any) => (
                              <SelectItem key={company.id} value={company.id}>{company.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <Button 
                      onClick={() => createWorkflowMutation.mutate(workflowForm)}
                      disabled={createWorkflowMutation.isPending || !workflowForm.name}
                      className="w-full"
                    >
                      {createWorkflowMutation.isPending ? 'Criando...' : 'Criar Workflow'}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Analytics */}
            {activeSection === 'analytics' && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Análise Adaptativa</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">
                      Execute análises adaptativas para empresas específicas e veja insights em tempo real.
                    </p>
                    <div className="space-y-3">
                      {companies?.map((company: any) => (
                        <div key={company.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <h4 className="font-medium">{company.name}</h4>
                            <p className="text-sm text-gray-500">Análise de padrões e insights</p>
                          </div>
                          <Button 
                            onClick={() => executeAdaptiveAnalysis.mutate(company.id)}
                            disabled={executeAdaptiveAnalysis.isPending}
                            size="sm"
                          >
                            {executeAdaptiveAnalysis.isPending ? 'Analisando...' : 'Executar Análise'}
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}