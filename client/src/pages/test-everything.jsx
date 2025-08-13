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
    clientName,
    clientEmail,
    investment,
    companyName,
    userEmail,
    workflowName,
    tenantId);

  // ========== MUTATIONS PARA TESTES ==========
  
  const testClientMutation = useMutation({
    mutationFn) => {
      return await apiRequest('/api/admin/clients', 'POST', {
        name,
        email,
        currentInvestment) || 10000,
        riskProfile,
        tenantId);
    },
    onSuccess) => {
      setTestResults(prev => ({ ...prev, client));
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

  const testCompanyMutation = useMutation({
    mutationFn) => {
      return await apiRequest('/api/admin/tenants', 'POST', {
        name,
        subscriptionPlan,
        subscriptionExpiresAt) + 365 * 24 * 60 * 60 * 1000)
      });
    },
    onSuccess) => {
      setTestResults(prev => ({ ...prev, company));
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

  const testUserMutation = useMutation({
    mutationFn) => {
      return await apiRequest('/api/admin/users', 'POST', {
        email,
        firstName,
        lastName,
        role,
        isActive,
        tenantId);
    },
    onSuccess) => {
      setTestResults(prev => ({ ...prev, user));
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

  const testWorkflowMutation = useMutation({
    mutationFn) => {
      return await apiRequest('/api/complete-workflows', 'POST', {
        name,
        description,
        trigger,
        steps,
            type,
            name,
            config,
        tenantId);
    },
    onSuccess) => {
      setTestResults(prev => ({ ...prev, workflow));
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

  const testAdaptiveMutation = useMutation({
    mutationFn) => {
      const tenantId = testData.tenantId || 'tenant-test';
      return await apiRequest(`/api/adaptive/analyze/${tenantId}`, 'GET');
    },
    onSuccess) => {
      setTestResults(prev => ({ ...prev, adaptive));
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

  const testTaskMutation = useMutation({
    mutationFn) => {
      // Primeiro criar um template
      const template = await apiRequest('/api/task-management/templates', 'POST', {
        title,
        description,
        priority,
        estimatedHours);
      
      // Depois executar o template
      return await apiRequest(`/api/task-management/templates/${template.id}/execute`, 'POST', {
        assignedToId,
        dueDate) + 24 * 60 * 60 * 1000).toISOString(),
        customData);
    },
    onSuccess) => {
      setTestResults(prev => ({ ...prev, task));
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

  // ========== QUERIES PARA DADOS ==========
  
  const { data,
    refetchInterval);

  const { data);

  const { data);

  // ========== RENDER ==========

  const testSections = [
    { id, name, icon,
    { id, name, icon,
    { id, name, icon,
    { id, name, icon,
    { id, name, icon,
    { id, name, icon,
    { id, name, icon,
    { id, name, icon) => window.location.href = '/api/logout'}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <LogOut className="h-4 w-4" />
              <span>Sair</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm) => (
              <button
                key={section.id}
                onClick={() => setActiveTest(section.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                  activeTest === section.id 
                    ? 'bg-blue-100 text-blue-700 border-l-4 border-blue-500' 
                    : 'text-gray-600 hover))}
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
                    <div className="grid grid-cols-1 md) para Testes</Label>
                      <Input
                        id="tenantId"
                        value={testData.tenantId}
                        onChange={(e) => setTestData(prev => ({ ...prev, tenantId))}
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
                  <div className="grid grid-cols-1 md) => setTestData(prev => ({ ...prev, clientName))}
                        placeholder="João Silva"
                      />
                    </div>
                    <div>
                      <Label htmlFor="clientEmail">Email do Cliente</Label>
                      <Input
                        id="clientEmail"
                        type="email"
                        value={testData.clientEmail}
                        onChange={(e) => setTestData(prev => ({ ...prev, clientEmail))}
                        placeholder="joao@exemplo.com"
                      />
                    </div>
                    <div>
                      <Label htmlFor="investment">Valor do Investimento</Label>
                      <Input
                        id="investment"
                        type="number"
                        value={testData.investment}
                        onChange={(e) => setTestData(prev => ({ ...prev, investment))}
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
                      <h4 className="font-semibold text-green-800">✅ Cliente Criado, null, 2)}
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
                      onChange={(e) => setTestData(prev => ({ ...prev, companyName))}
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
                      <h4 className="font-semibold text-green-800">✅ Empresa Criada, null, 2)}
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
                      onChange={(e) => setTestData(prev => ({ ...prev, userEmail))}
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
                      <h4 className="font-semibold text-green-800">✅ Usuário Criado, null, 2)}
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
                      onChange={(e) => setTestData(prev => ({ ...prev, workflowName))}
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
                      <h4 className="font-semibold text-green-800">✅ Workflow Criado, null, 2)}
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
                      <h4 className="font-semibold text-green-800">✅ Tarefa Criada, null, 2)}
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
                      <h4 className="font-semibold text-green-800">✅ Análise Executada, null, 2)}
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
                  <div className="grid grid-cols-1 md).map(([key, result]) => (
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