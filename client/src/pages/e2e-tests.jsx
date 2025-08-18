/**
 * PÁGINA DE TESTES END-TO-END
 * Sistema completo de validação de fluxos de usuário do início ao fim
 * 100% JavaScript - SEM TYPESCRIPT
 */

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  Route,
  Play,
  Pause,
  Square,
  CheckCircle,
  XCircle,
  Clock,
  Users,
  FileText,
  Calendar,
  MessageSquare,
  Settings,
  BarChart3,
  Activity,
  RefreshCw,
  Eye,
  Bug,
  Target,
  Workflow,
  ArrowRight,
  CheckSquare,
  AlertTriangle,
  Download,
  Upload,
  Search,
  Filter,
  TrendingUp,
  Zap,
  Globe,
  Database,
  Shield
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/use-toast';

const E2E_FLOWS = [
  {
    id: 'user_registration_flow',
    name: 'Fluxo de Registro de Usuário',
    description: 'Registro completo desde cadastro até primeiro login',
    category: 'authentication',
    steps: [
      'Acessar página de registro',
      'Preencher formulário de cadastro',
      'Validar email',
      'Confirmar conta',
      'Realizar primeiro login',
      'Configurar perfil inicial'
    ],
    critical: true,
    estimatedTime: 180
  },
  {
    id: 'project_creation_flow',
    name: 'Criação Completa de Projeto',
    description: 'Criar projeto, adicionar tarefas e membros',
    category: 'project_management',
    steps: [
      'Login no sistema',
      'Navegar para projetos',
      'Criar novo projeto',
      'Configurar detalhes do projeto',
      'Adicionar membros da equipe',
      'Criar tarefas iniciais',
      'Configurar cronograma'
    ],
    critical: true,
    estimatedTime: 300
  },
  {
    id: 'task_lifecycle_flow',
    name: 'Ciclo de Vida de Tarefa',
    description: 'Criar, atribuir, executar e finalizar tarefa',
    category: 'task_management',
    steps: [
      'Criar nova tarefa',
      'Atribuir responsável',
      'Definir prazo e prioridade',
      'Iniciar execução',
      'Atualizar progresso',
      'Adicionar comentários',
      'Marcar como concluída'
    ],
    critical: true,
    estimatedTime: 240
  },
  {
    id: 'chat_communication_flow',
    name: 'Comunicação via Chat',
    description: 'Enviar mensagens, arquivos e fazer videochamada',
    category: 'communication',
    steps: [
      'Acessar chat',
      'Enviar mensagem de texto',
      'Compartilhar arquivo',
      'Criar grupo de conversa',
      'Iniciar videochamada',
      'Compartilhar tela',
      'Finalizar chamada'
    ],
    critical: false,
    estimatedTime: 200
  },
  {
    id: 'report_generation_flow',
    name: 'Geração de Relatórios',
    description: 'Criar, configurar e exportar relatório',
    category: 'business_intelligence',
    steps: [
      'Acessar módulo de relatórios',
      'Selecionar tipo de relatório',
      'Configurar filtros',
      'Definir período',
      'Gerar visualização',
      'Exportar em PDF',
      'Enviar por email'
    ],
    critical: false,
    estimatedTime: 180
  },
  {
    id: 'workflow_automation_flow',
    name: 'Criação de Workflow',
    description: 'Criar e ativar workflow automatizado',
    category: 'automation',
    steps: [
      'Acessar workflow builder',
      'Criar novo workflow',
      'Definir trigger inicial',
      'Adicionar condições',
      'Configurar ações',
      'Testar workflow',
      'Ativar automação'
    ],
    critical: false,
    estimatedTime: 360
  },
  {
    id: 'quantum_analysis_flow',
    name: 'Análise Quântica',
    description: 'Executar análise com algoritmos quânticos',
    category: 'quantum',
    steps: [
      'Acessar módulo quântico',
      'Selecionar algoritmo',
      'Configurar parâmetros',
      'Executar processamento',
      'Analisar resultados',
      'Gerar insights',
      'Aplicar otimizações'
    ],
    critical: false,
    estimatedTime: 420
  },
  {
    id: 'integration_sync_flow',
    name: 'Sincronização de Integrações',
    description: 'Conectar e sincronizar ferramenta externa',
    category: 'integrations',
    steps: [
      'Acessar integrações',
      'Selecionar ferramenta',
      'Configurar credenciais',
      'Testar conexão',
      'Configurar sincronização',
      'Executar sync inicial',
      'Validar dados importados'
    ],
    critical: false,
    estimatedTime: 300
  }
];

const FLOW_STATUS = {
  PENDING: 'pending',
  RUNNING: 'running',
  PASSED: 'passed',
  FAILED: 'failed',
  SKIPPED: 'skipped'
};

const STATUS_COLORS = {
  pending: 'bg-gray-100 text-gray-800',
  running: 'bg-blue-100 text-blue-800',
  passed: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
  skipped: 'bg-yellow-100 text-yellow-800'
};

const STATUS_ICONS = {
  pending: Clock,
  running: RefreshCw,
  passed: CheckCircle,
  failed: XCircle,
  skipped: AlertTriangle
};

export default function E2ETestsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedFlow, setSelectedFlow] = useState(null);
  const [runningFlows, setRunningFlows] = useState(new Set());
  const [flowResults, setFlowResults] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // Query para resultados de testes E2E
  const { data: e2eResultsData, isLoading } = useQuery({
    queryKey: ['e2e-results'],
    queryFn: async () => {
      const response = await fetch('/api/e2e-tests/results', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao carregar resultados E2E');
      }

      return response.json();
    },
    enabled: !!user
  });

  // Query para execuções em andamento
  const { data: runningTestsData } = useQuery({
    queryKey: ['running-e2e-tests'],
    queryFn: async () => {
      const response = await fetch('/api/e2e-tests/running', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao carregar testes em execução');
      }

      return response.json();
    },
    enabled: !!user,
    refetchInterval: 5000
  });

  // Mutation para executar fluxo E2E
  const runE2EFlowMutation = useMutation({
    mutationFn: async (flowId) => {
      const response = await fetch('/api/e2e-tests/run-flow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({ flowId })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao executar fluxo E2E');
      }

      return response.json();
    },
    onSuccess: (data, flowId) => {
      setRunningFlows(prev => new Set(prev).add(flowId));
      toast({
        title: 'Teste E2E iniciado',
        description: `Fluxo ${data.flowName} iniciado com sucesso.`
      });
      queryClient.invalidateQueries(['running-e2e-tests']);
    },
    onError: (error) => {
      toast({
        title: 'Erro no teste E2E',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  // Mutation para executar todos os fluxos críticos
  const runCriticalFlowsMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/e2e-tests/run-critical', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao executar fluxos críticos');
      }

      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: 'Testes críticos iniciados',
        description: `${data.flowsStarted} fluxos críticos iniciados.`
      });
      queryClient.invalidateQueries(['running-e2e-tests']);
      queryClient.invalidateQueries(['e2e-results']);
    },
    onError: (error) => {
      toast({
        title: 'Erro nos testes críticos',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  const results = e2eResultsData?.data?.results || {};
  const runningTests = runningTestsData?.data?.running || [];

  const getFlowStatus = (flowId) => {
    if (runningFlows.has(flowId) || runningTests.some(t => t.flowId === flowId)) {
      return FLOW_STATUS.RUNNING;
    }
    if (results[flowId]) {
      return results[flowId].status || FLOW_STATUS.PENDING;
    }
    return FLOW_STATUS.PENDING;
  };

  const getOverallStats = () => {
    const totalFlows = E2E_FLOWS.length;
    const passedFlows = E2E_FLOWS.filter(flow => getFlowStatus(flow.id) === FLOW_STATUS.PASSED).length;
    const failedFlows = E2E_FLOWS.filter(flow => getFlowStatus(flow.id) === FLOW_STATUS.FAILED).length;
    const runningFlows = E2E_FLOWS.filter(flow => getFlowStatus(flow.id) === FLOW_STATUS.RUNNING).length;
    const criticalFlows = E2E_FLOWS.filter(flow => flow.critical).length;
    const criticalPassed = E2E_FLOWS.filter(flow => flow.critical && getFlowStatus(flow.id) === FLOW_STATUS.PASSED).length;
    
    return {
      total: totalFlows,
      passed: passedFlows,
      failed: failedFlows,
      running: runningFlows,
      critical: criticalFlows,
      criticalPassed: criticalPassed,
      coverage: totalFlows > 0 ? Math.round(((passedFlows + failedFlows) / totalFlows) * 100) : 0,
      successRate: (passedFlows + failedFlows) > 0 ? Math.round((passedFlows / (passedFlows + failedFlows)) * 100) : 0
    };
  };

  const filteredFlows = E2E_FLOWS.filter(flow => {
    const matchesSearch = flow.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      flow.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || flow.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || getFlowStatus(flow.id) === filterStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const stats = getOverallStats();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Route className="w-8 h-8 mr-3 text-blue-600" />
            Testes End-to-End
          </h1>
          <p className="text-gray-600">
            Validação completa de fluxos de usuário do início ao fim
          </p>
        </div>
        
        <div className="flex space-x-2">
          <Button
            onClick={() => runCriticalFlowsMutation.mutate()}
            disabled={runCriticalFlowsMutation.isLoading}
            className="flex items-center space-x-2"
          >
            {runCriticalFlowsMutation.isLoading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Target className="w-4 h-4" />
            )}
            <span>Executar Críticos</span>
          </Button>
          
          <Button variant="outline" className="flex items-center space-x-2">
            <Download className="w-4 h-4" />
            <span>Relatório</span>
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Fluxos</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <Route className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Aprovados</p>
                <p className="text-2xl font-bold text-green-600">{stats.passed}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Falharam</p>
                <p className="text-2xl font-bold text-red-600">{stats.failed}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Executando</p>
                <p className="text-2xl font-bold text-blue-600">{stats.running}</p>
              </div>
              <RefreshCw className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Críticos OK</p>
                <p className="text-2xl font-bold text-purple-600">
                  {stats.criticalPassed}/{stats.critical}
                </p>
              </div>
              <Target className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Taxa de Sucesso</p>
                <p className="text-2xl font-bold text-orange-600">{stats.successRate}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Running Tests */}
      {runningTests.length > 0 && (
        <Card className="mb-8 border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <RefreshCw className="w-5 h-5 animate-spin text-blue-600" />
              <span>Testes em Execução</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {runningTests.map(test => (
                <div key={test.id} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                  <div className="flex items-center space-x-3">
                    <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
                    <div>
                      <p className="font-medium">{test.flowName}</p>
                      <p className="text-sm text-gray-600">
                        Etapa {test.currentStep}/{test.totalSteps}: {test.currentStepName}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${(test.currentStep / test.totalSteps) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600">
                      {Math.round((test.currentStep / test.totalSteps) * 100)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="flows">Fluxos</TabsTrigger>
          <TabsTrigger value="results">Resultados</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Status por Categoria</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {['authentication', 'project_management', 'task_management', 'communication', 'business_intelligence', 'automation', 'quantum', 'integrations'].map(category => {
                    const categoryFlows = E2E_FLOWS.filter(flow => flow.category === category);
                    const passed = categoryFlows.filter(flow => getFlowStatus(flow.id) === FLOW_STATUS.PASSED).length;
                    const total = categoryFlows.length;
                    const percentage = total > 0 ? (passed / total) * 100 : 0;
                    
                    return (
                      <div key={category} className="flex items-center justify-between">
                        <span className="font-medium capitalize">{category.replace('_', ' ')}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-green-600 h-2 rounded-full" 
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-600">
                            {passed}/{total}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Fluxos Críticos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {E2E_FLOWS.filter(flow => flow.critical).map(flow => {
                    const status = getFlowStatus(flow.id);
                    const StatusIcon = STATUS_ICONS[status];
                    
                    return (
                      <div key={flow.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <StatusIcon className={`w-5 h-5 ${
                            status === 'passed' ? 'text-green-600' :
                            status === 'failed' ? 'text-red-600' :
                            status === 'running' ? 'text-blue-600 animate-spin' : 'text-gray-600'
                          }`} />
                          <div>
                            <span className="font-medium">{flow.name}</span>
                            <p className="text-sm text-gray-600">{flow.description}</p>
                          </div>
                        </div>
                        <Badge className={STATUS_COLORS[status]}>
                          {status}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="flows" className="mt-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar fluxos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="all">Todas as categorias</option>
                <option value="authentication">Autenticação</option>
                <option value="project_management">Gestão de Projetos</option>
                <option value="task_management">Gestão de Tarefas</option>
                <option value="communication">Comunicação</option>
                <option value="business_intelligence">Business Intelligence</option>
                <option value="automation">Automação</option>
                <option value="quantum">Sistema Quântico</option>
                <option value="integrations">Integrações</option>
              </select>
              
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="all">Todos os status</option>
                <option value="pending">Pendente</option>
                <option value="running">Executando</option>
                <option value="passed">Aprovado</option>
                <option value="failed">Falhado</option>
              </select>
            </div>
          </div>

          <div className="space-y-4">
            {filteredFlows.map(flow => {
              const status = getFlowStatus(flow.id);
              const StatusIcon = STATUS_ICONS[status];
              
              return (
                <Card key={flow.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <h3 className="font-semibold text-lg">{flow.name}</h3>
                          {flow.critical && (
                            <Badge variant="destructive" className="text-xs">
                              Crítico
                            </Badge>
                          )}
                          <Badge variant="outline" className="text-xs">
                            {flow.category.replace('_', ' ')}
                          </Badge>
                        </div>
                        
                        <p className="text-gray-600 mb-4">{flow.description}</p>
                        
                        <div className="space-y-2">
                          <h4 className="font-medium text-sm">Etapas do Fluxo:</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {flow.steps.map((step, index) => (
                              <div key={index} className="flex items-center space-x-2 text-sm">
                                <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">
                                  {index + 1}
                                </span>
                                <span>{step}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-4 mt-4 text-sm text-gray-500">
                          <span>Tempo estimado: {Math.round(flow.estimatedTime / 60)} min</span>
                          <span>Etapas: {flow.steps.length}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3 ml-6">
                        <div className="text-center">
                          <StatusIcon className={`w-6 h-6 mx-auto mb-1 ${
                            status === 'passed' ? 'text-green-600' :
                            status === 'failed' ? 'text-red-600' :
                            status === 'running' ? 'text-blue-600 animate-spin' : 'text-gray-600'
                          }`} />
                          <Badge className={STATUS_COLORS[status]}>
                            {status}
                          </Badge>
                        </div>
                        
                        <Button
                          onClick={() => runE2EFlowMutation.mutate(flow.id)}
                          disabled={status === 'running' || runE2EFlowMutation.isLoading}
                          size="sm"
                        >
                          {status === 'running' ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                          ) : (
                            <Play className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="results" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Execuções</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p>Histórico detalhado de execuções</p>
                <p className="text-sm">Em desenvolvimento</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
