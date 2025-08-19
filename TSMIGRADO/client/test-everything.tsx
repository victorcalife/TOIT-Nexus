import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useMutation, useQuery } from '@tanstack/react-query';
import { 
  TestTube, Database, Workflow, Users, Building2, Settings, 
  Play, CheckSquare, Target, Upload, FileText, BarChart3,
  Zap, Activity, Bell, Eye, LogOut
} from 'lucide-react';

export default function TestEverything() {
  const [activeTest, setActiveTest] = useState<string>('overview');
  const [testResults, setTestResults] = useState<Record<string, any>>({});
  const { toast } = useToast();

  // Estados para forms de teste
  const [testData, setTestData] = useState({
    clientName: '',
    clientEmail: '',
    investment: '',
    companyName: '',
    userEmail: '',
    workflowName: '',
    tenantId: ''
  });

  // ========== MUTATIONS PARA TESTES ==========
  
  const testClientMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('/api/admin/clients', 'POST', {
        name: testData.clientName,
        email: testData.clientEmail,
        currentInvestment: parseFloat(testData.investment) || 10000,
        riskProfile: 'moderate',
        tenantId: testData.tenantId || 'tenant-test'
      });
    },
    onSuccess: (data) => {
      setTestResults(prev => ({ ...prev, client: data }));
      toast({
        title: "✅ Cliente Criado",
        description: `Cliente ${data.name} criado com sucesso!`
      });
    },
    onError: (error) => {
      toast({
        title: "❌ Erro no Cliente",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const testCompanyMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('/api/admin/tenants', 'POST', {
        name: testData.companyName,
        subscriptionPlan: 'premium',
        subscriptionExpiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      });
    },
    onSuccess: (data) => {
      setTestResults(prev => ({ ...prev, company: data }));
      toast({
        title: "✅ Empresa Criada",
        description: `Empresa ${data.name} criada com sucesso!`
      });
    },
    onError: (error) => {
      toast({
        title: "❌ Erro na Empresa",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const testUserMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('/api/admin/users', 'POST', {
        email: testData.userEmail,
        firstName: 'Usuário',
        lastName: 'Teste',
        role: 'employee',
        isActive: true,
        tenantId: testData.tenantId || 'tenant-test'
      });
    },
    onSuccess: (data) => {
      setTestResults(prev => ({ ...prev, user: data }));
      toast({
        title: "✅ Usuário Criado",
        description: `Usuário ${data.email} criado com sucesso!`
      });
    },
    onError: (error) => {
      toast({
        title: "❌ Erro no Usuário",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const testWorkflowMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('/api/complete-workflows', 'POST', {
        name: testData.workflowName,
        description: 'Workflow de teste criado pela interface',
        trigger: 'manual',
        steps: [
          {
            id: 'step1',
            type: 'action',
            name: 'Processar Cliente',
            config: { action: 'process_client' }
          }
        ],
        tenantId: testData.tenantId || 'tenant-test'
      });
    },
    onSuccess: (data) => {
      setTestResults(prev => ({ ...prev, workflow: data }));
      toast({
        title: "✅ Workflow Criado",
        description: `Workflow ${data.name} criado com sucesso!`
      });
    },
    onError: (error) => {
      toast({
        title: "❌ Erro no Workflow",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const testAdaptiveMutation = useMutation({
    mutationFn: async () => {
      const tenantId = testData.tenantId || 'tenant-test';
      return await apiRequest(`/api/adaptive/analyze/${tenantId}`, 'GET');
    },
    onSuccess: (data) => {
      setTestResults(prev => ({ ...prev, adaptive: data }));
      toast({
        title: "✅ Análise Adaptativa",
        description: "Análise de padrões executada com sucesso!"
      });
    },
    onError: (error) => {
      toast({
        title: "❌ Erro na Análise",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const testTaskMutation = useMutation({
    mutationFn: async () => {
      // Primeiro criar um template
      const template = await apiRequest('/api/task-management/templates', 'POST', {
        title: 'Tarefa de Teste',
        description: 'Tarefa criada para teste da interface',
        priority: 'medium',
        estimatedHours: 2
      });
      
      // Depois executar o template
      return await apiRequest(`/api/task-management/templates/${template.id}/execute`, 'POST', {
        assignedToId: 'user-test',
        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        customData: { teste: true }
      });
    },
    onSuccess: (data) => {
      setTestResults(prev => ({ ...prev, task: data }));
      toast({
        title: "✅ Tarefa Criada",
        description: "Template e tarefa criados com sucesso!"
      });
    },
    onError: (error) => {
      toast({
        title: "❌ Erro na Tarefa",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // ========== QUERIES PARA DADOS ==========
  
  const { data: systemStats } = useQuery({
    queryKey: ['/api/admin/system-stats'],
    refetchInterval: 5000
  });

  const { data: allUsers } = useQuery({
    queryKey: ['/api/admin/users']
  });

  const { data: allTenants } = useQuery({
    queryKey: ['/api/admin/tenants']
  });

  // ========== RENDER ==========

  const testSections = [
    { id: 'overview', name: 'Visão Geral', icon: Eye },
    { id: 'clients', name: 'Teste Clientes', icon: Users },
    { id: 'companies', name: 'Teste Empresas', icon: Building2 },
    { id: 'users', name: 'Teste Usuários', icon: Users },
    { id: 'workflows', name: 'Teste Workflows', icon: Workflow },
    { id: 'tasks', name: 'Teste Tarefas', icon: CheckSquare },
    { id: 'adaptive', name: 'Teste IA Adaptativa', icon: Zap },
    { id: 'results', name: 'Resultados', icon: BarChart3 }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <TestTube className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Centro de Testes TOIT NEXUS</h1>
                <p className="text-sm text-gray-500">Teste todas as funcionalidades do sistema</p>
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
          {/* Sidebar de navegação */}
          <div className="w-64 space-y-2">
            {testSections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveTest(section.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                  activeTest === section.id 
                    ? 'bg-blue-100 text-blue-700 border-l-4 border-blue-500' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <section.icon className="h-5 w-5" />
                <span className="font-medium">{section.name}</span>
              </button>
            ))}
          </div>

          {/* Conteúdo principal */}
          <div className="flex-1">
            {/* Overview */}
            {activeTest === 'overview' && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Activity className="h-5 w-5" />
                      <span>Status do Sistema</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {systemStats?.totalTenants || 0}
                        </div>
                        <div className="text-sm text-gray-600">Empresas</div>
                      </div>
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          {systemStats?.totalUsers || 0}
                        </div>
                        <div className="text-sm text-gray-600">Usuários</div>
                      </div>
                      <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">
                          {systemStats?.totalWorkflows || 0}
                        </div>
                        <div className="text-sm text-gray-600">Workflows</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Configuração de Testes</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="tenantId">ID do Tenant (Empresa) para Testes</Label>
                      <Input
                        id="tenantId"
                        value={testData.tenantId}
                        onChange={(e) => setTestData(prev => ({ ...prev, tenantId: e.target.value }))}
                        placeholder="tenant-test"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Teste de Clientes */}
            {activeTest === 'clients' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="h-5 w-5" />
                    <span>Teste de Criação de Clientes</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="clientName">Nome do Cliente</Label>
                      <Input
                        id="clientName"
                        value={testData.clientName}
                        onChange={(e) => setTestData(prev => ({ ...prev, clientName: e.target.value }))}
                        placeholder="João Silva"
                      />
                    </div>
                    <div>
                      <Label htmlFor="clientEmail">Email do Cliente</Label>
                      <Input
                        id="clientEmail"
                        type="email"
                        value={testData.clientEmail}
                        onChange={(e) => setTestData(prev => ({ ...prev, clientEmail: e.target.value }))}
                        placeholder="joao@exemplo.com"
                      />
                    </div>
                    <div>
                      <Label htmlFor="investment">Valor do Investimento</Label>
                      <Input
                        id="investment"
                        type="number"
                        value={testData.investment}
                        onChange={(e) => setTestData(prev => ({ ...prev, investment: e.target.value }))}
                        placeholder="50000"
                      />
                    </div>
                  </div>
                  <Button 
                    onClick={() => testClientMutation.mutate()}
                    disabled={testClientMutation.isPending}
                    className="w-full"
                  >
                    {testClientMutation.isPending ? 'Criando...' : 'Criar Cliente de Teste'}
                  </Button>
                  
                  {testResults.client && (
                    <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                      <h4 className="font-semibold text-green-800">✅ Cliente Criado:</h4>
                      <pre className="text-sm text-green-700 mt-2">
                        {JSON.stringify(testResults.client, null, 2)}
                      </pre>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Teste de Empresas */}
            {activeTest === 'companies' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Building2 className="h-5 w-5" />
                    <span>Teste de Criação de Empresas</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="companyName">Nome da Empresa</Label>
                    <Input
                      id="companyName"
                      value={testData.companyName}
                      onChange={(e) => setTestData(prev => ({ ...prev, companyName: e.target.value }))}
                      placeholder="Empresa Teste Ltda"
                    />
                  </div>
                  <Button 
                    onClick={() => testCompanyMutation.mutate()}
                    disabled={testCompanyMutation.isPending}
                    className="w-full"
                  >
                    {testCompanyMutation.isPending ? 'Criando...' : 'Criar Empresa de Teste'}
                  </Button>
                  
                  {testResults.company && (
                    <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                      <h4 className="font-semibold text-green-800">✅ Empresa Criada:</h4>
                      <pre className="text-sm text-green-700 mt-2">
                        {JSON.stringify(testResults.company, null, 2)}
                      </pre>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Teste de Usuários */}
            {activeTest === 'users' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="h-5 w-5" />
                    <span>Teste de Criação de Usuários</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="userEmail">Email do Usuário</Label>
                    <Input
                      id="userEmail"
                      type="email"
                      value={testData.userEmail}
                      onChange={(e) => setTestData(prev => ({ ...prev, userEmail: e.target.value }))}
                      placeholder="usuario@teste.com"
                    />
                  </div>
                  <Button 
                    onClick={() => testUserMutation.mutate()}
                    disabled={testUserMutation.isPending}
                    className="w-full"
                  >
                    {testUserMutation.isPending ? 'Criando...' : 'Criar Usuário de Teste'}
                  </Button>
                  
                  {testResults.user && (
                    <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                      <h4 className="font-semibold text-green-800">✅ Usuário Criado:</h4>
                      <pre className="text-sm text-green-700 mt-2">
                        {JSON.stringify(testResults.user, null, 2)}
                      </pre>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Teste de Workflows */}
            {activeTest === 'workflows' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Workflow className="h-5 w-5" />
                    <span>Teste de Criação de Workflows</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="workflowName">Nome do Workflow</Label>
                    <Input
                      id="workflowName"
                      value={testData.workflowName}
                      onChange={(e) => setTestData(prev => ({ ...prev, workflowName: e.target.value }))}
                      placeholder="Workflow de Teste"
                    />
                  </div>
                  <Button 
                    onClick={() => testWorkflowMutation.mutate()}
                    disabled={testWorkflowMutation.isPending}
                    className="w-full"
                  >
                    {testWorkflowMutation.isPending ? 'Criando...' : 'Criar Workflow de Teste'}
                  </Button>
                  
                  {testResults.workflow && (
                    <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                      <h4 className="font-semibold text-green-800">✅ Workflow Criado:</h4>
                      <pre className="text-sm text-green-700 mt-2">
                        {JSON.stringify(testResults.workflow, null, 2)}
                      </pre>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Teste de Tarefas */}
            {activeTest === 'tasks' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <CheckSquare className="h-5 w-5" />
                    <span>Teste de Task Management</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-600">
                    Este teste criará um template de tarefa e depois executará ele.
                  </p>
                  <Button 
                    onClick={() => testTaskMutation.mutate()}
                    disabled={testTaskMutation.isPending}
                    className="w-full"
                  >
                    {testTaskMutation.isPending ? 'Criando...' : 'Criar Template e Tarefa de Teste'}
                  </Button>
                  
                  {testResults.task && (
                    <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                      <h4 className="font-semibold text-green-800">✅ Tarefa Criada:</h4>
                      <pre className="text-sm text-green-700 mt-2">
                        {JSON.stringify(testResults.task, null, 2)}
                      </pre>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Teste de IA Adaptativa */}
            {activeTest === 'adaptive' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Zap className="h-5 w-5" />
                    <span>Teste de IA Adaptativa</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-600">
                    Este teste executará a análise de padrões adaptativos no sistema.
                  </p>
                  <Button 
                    onClick={() => testAdaptiveMutation.mutate()}
                    disabled={testAdaptiveMutation.isPending}
                    className="w-full"
                  >
                    {testAdaptiveMutation.isPending ? 'Analisando...' : 'Executar Análise Adaptativa'}
                  </Button>
                  
                  {testResults.adaptive && (
                    <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                      <h4 className="font-semibold text-green-800">✅ Análise Executada:</h4>
                      <pre className="text-sm text-green-700 mt-2">
                        {JSON.stringify(testResults.adaptive, null, 2)}
                      </pre>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Resultados */}
            {activeTest === 'results' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5" />
                    <span>Resultados dos Testes</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(testResults).map(([key, result]) => (
                      <div key={key} className="p-4 border rounded-lg">
                        <h4 className="font-semibold capitalize">{key}</h4>
                        <Badge variant="outline" className="mt-2">
                          {result ? 'Sucesso' : 'Pendente'}
                        </Badge>
                        {result && (
                          <pre className="text-xs mt-2 p-2 bg-gray-50 rounded overflow-auto max-h-32">
                            {JSON.stringify(result, null, 2)}
                          </pre>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}