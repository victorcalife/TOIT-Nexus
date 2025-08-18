/**
 * PÁGINA DE TESTES DE PERFORMANCE E CARGA
 * Sistema completo de validação de performance e otimização de gargalos
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
  Gauge,
  Zap,
  Activity,
  TrendingUp,
  TrendingDown,
  Clock,
  Database,
  Server,
  Cpu,
  HardDrive,
  Wifi,
  Users,
  BarChart3,
  LineChart,
  PieChart,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Play,
  Pause,
  Square,
  Settings,
  Download,
  Upload,
  Target,
  Flame,
  Shield,
  Globe,
  Monitor,
  MemoryStick
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/use-toast';

const PERFORMANCE_METRICS = {
  RESPONSE_TIME: 'response_time',
  THROUGHPUT: 'throughput',
  CPU_USAGE: 'cpu_usage',
  MEMORY_USAGE: 'memory_usage',
  DISK_IO: 'disk_io',
  NETWORK_IO: 'network_io',
  DATABASE_QUERIES: 'database_queries',
  ERROR_RATE: 'error_rate'
};

const LOAD_TEST_TYPES = {
  SMOKE: 'smoke',
  LOAD: 'load',
  STRESS: 'stress',
  SPIKE: 'spike',
  VOLUME: 'volume',
  ENDURANCE: 'endurance'
};

const TEST_STATUS = {
  IDLE: 'idle',
  RUNNING: 'running',
  COMPLETED: 'completed',
  FAILED: 'failed',
  STOPPED: 'stopped'
};

const PERFORMANCE_SCENARIOS = [
  {
    id: 'login_load',
    name: 'Login sob Carga',
    description: 'Teste de login com múltiplos usuários simultâneos',
    type: LOAD_TEST_TYPES.LOAD,
    endpoint: '/api/auth/login',
    maxUsers: 1000,
    duration: 300,
    rampUp: 60
  },
  {
    id: 'dashboard_stress',
    name: 'Dashboard Stress Test',
    description: 'Carregamento do dashboard com alta carga',
    type: LOAD_TEST_TYPES.STRESS,
    endpoint: '/api/dashboard/data',
    maxUsers: 2000,
    duration: 600,
    rampUp: 120
  },
  {
    id: 'api_throughput',
    name: 'API Throughput',
    description: 'Teste de throughput das APIs principais',
    type: LOAD_TEST_TYPES.LOAD,
    endpoint: '/api/tasks',
    maxUsers: 500,
    duration: 180,
    rampUp: 30
  },
  {
    id: 'database_volume',
    name: 'Volume de Dados',
    description: 'Teste com grande volume de dados',
    type: LOAD_TEST_TYPES.VOLUME,
    endpoint: '/api/reports/generate',
    maxUsers: 100,
    duration: 900,
    rampUp: 180
  },
  {
    id: 'quantum_spike',
    name: 'Quantum Spike Test',
    description: 'Picos de carga no sistema quântico',
    type: LOAD_TEST_TYPES.SPIKE,
    endpoint: '/api/quantum/process',
    maxUsers: 50,
    duration: 120,
    rampUp: 10
  }
];

export default function PerformanceTestsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [testStatus, setTestStatus] = useState(TEST_STATUS.IDLE);
  const [currentMetrics, setCurrentMetrics] = useState({});
  const [testConfig, setTestConfig] = useState({
    users: 100,
    duration: 300,
    rampUp: 60
  });

  // Query para métricas de performance
  const { data: metricsData, isLoading } = useQuery({
    queryKey: ['performance-metrics'],
    queryFn: async () => {
      const response = await fetch('/api/performance/metrics', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao carregar métricas de performance');
      }

      return response.json();
    },
    enabled: !!user,
    refetchInterval: testStatus === TEST_STATUS.RUNNING ? 5000 : false
  });

  // Query para histórico de testes
  const { data: testHistoryData } = useQuery({
    queryKey: ['performance-history'],
    queryFn: async () => {
      const response = await fetch('/api/performance/history?limit=20', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao carregar histórico');
      }

      return response.json();
    },
    enabled: !!user
  });

  // Query para status do sistema
  const { data: systemStatusData } = useQuery({
    queryKey: ['system-status'],
    queryFn: async () => {
      const response = await fetch('/api/system/status', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao carregar status do sistema');
      }

      return response.json();
    },
    enabled: !!user,
    refetchInterval: 10000
  });

  // Mutation para iniciar teste de carga
  const startLoadTestMutation = useMutation({
    mutationFn: async (config) => {
      const response = await fetch('/api/performance/start-load-test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify(config)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao iniciar teste de carga');
      }

      return response.json();
    },
    onSuccess: (data) => {
      setTestStatus(TEST_STATUS.RUNNING);
      toast({
        title: 'Teste iniciado',
        description: `Teste de carga ${data.testId} iniciado com sucesso.`
      });
      queryClient.invalidateQueries(['performance-metrics']);
    },
    onError: (error) => {
      toast({
        title: 'Erro no teste',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  // Mutation para parar teste
  const stopTestMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/performance/stop-test', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao parar teste');
      }

      return response.json();
    },
    onSuccess: () => {
      setTestStatus(TEST_STATUS.STOPPED);
      toast({
        title: 'Teste parado',
        description: 'Teste de carga foi interrompido.'
      });
      queryClient.invalidateQueries(['performance-metrics']);
      queryClient.invalidateQueries(['performance-history']);
    }
  });

  const metrics = metricsData?.data || {};
  const testHistory = testHistoryData?.data?.tests || [];
  const systemStatus = systemStatusData?.data || {};

  const startLoadTest = (scenario) => {
    const config = {
      scenarioId: scenario.id,
      users: testConfig.users,
      duration: testConfig.duration,
      rampUp: testConfig.rampUp,
      endpoint: scenario.endpoint
    };
    
    setSelectedScenario(scenario);
    startLoadTestMutation.mutate(config);
  };

  const stopTest = () => {
    stopTestMutation.mutate();
  };

  const getMetricColor = (value, thresholds) => {
    if (value >= thresholds.critical) return 'text-red-600';
    if (value >= thresholds.warning) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case TEST_STATUS.RUNNING: return <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />;
      case TEST_STATUS.COMPLETED: return <CheckCircle className="w-4 h-4 text-green-600" />;
      case TEST_STATUS.FAILED: return <XCircle className="w-4 h-4 text-red-600" />;
      case TEST_STATUS.STOPPED: return <Square className="w-4 h-4 text-yellow-600" />;
      default: return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

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
            <Gauge className="w-8 h-8 mr-3 text-blue-600" />
            Testes de Performance
          </h1>
          <p className="text-gray-600">
            Validação de performance e otimização de gargalos
          </p>
        </div>
        
        <div className="flex space-x-2">
          {testStatus === TEST_STATUS.RUNNING ? (
            <Button
              variant="destructive"
              onClick={stopTest}
              disabled={stopTestMutation.isLoading}
              className="flex items-center space-x-2"
            >
              <Square className="w-4 h-4" />
              <span>Parar Teste</span>
            </Button>
          ) : (
            <Button variant="outline" className="flex items-center space-x-2">
              <Settings className="w-4 h-4" />
              <span>Configurações</span>
            </Button>
          )}
          
          <Button variant="outline" className="flex items-center space-x-2">
            <Download className="w-4 h-4" />
            <span>Relatório</span>
          </Button>
        </div>
      </div>

      {/* System Status */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">CPU</p>
                <p className={`text-2xl font-bold ${getMetricColor(systemStatus.cpu || 0, { warning: 70, critical: 90 })}`}>
                  {(systemStatus.cpu || 0).toFixed(1)}%
                </p>
              </div>
              <Cpu className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Memória</p>
                <p className={`text-2xl font-bold ${getMetricColor(systemStatus.memory || 0, { warning: 80, critical: 95 })}`}>
                  {(systemStatus.memory || 0).toFixed(1)}%
                </p>
              </div>
              <MemoryStick className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Disco</p>
                <p className={`text-2xl font-bold ${getMetricColor(systemStatus.disk || 0, { warning: 85, critical: 95 })}`}>
                  {(systemStatus.disk || 0).toFixed(1)}%
                </p>
              </div>
              <HardDrive className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Rede</p>
                <p className="text-2xl font-bold text-orange-600">
                  {(systemStatus.networkMbps || 0).toFixed(1)} Mbps
                </p>
              </div>
              <Wifi className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Usuários Ativos</p>
                <p className="text-2xl font-bold text-indigo-600">
                  {systemStatus.activeUsers || 0}
                </p>
              </div>
              <Users className="w-8 h-8 text-indigo-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Resp. Time</p>
                <p className={`text-2xl font-bold ${getMetricColor(systemStatus.avgResponseTime || 0, { warning: 500, critical: 1000 })}`}>
                  {(systemStatus.avgResponseTime || 0).toFixed(0)}ms
                </p>
              </div>
              <Clock className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Test Status */}
      {testStatus === TEST_STATUS.RUNNING && selectedScenario && (
        <Card className="mb-8 border-blue-200 bg-blue-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <RefreshCw className="w-6 h-6 text-blue-600 animate-spin" />
                <div>
                  <h3 className="font-semibold text-blue-900">
                    Executando: {selectedScenario.name}
                  </h3>
                  <p className="text-blue-700">
                    {testConfig.users} usuários • {testConfig.duration}s duração
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-sm text-blue-600">RPS Atual</p>
                  <p className="text-lg font-bold text-blue-900">
                    {metrics.currentRps || 0}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-blue-600">Usuários Ativos</p>
                  <p className="text-lg font-bold text-blue-900">
                    {metrics.activeUsers || 0}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-blue-600">Tempo Médio</p>
                  <p className="text-lg font-bold text-blue-900">
                    {metrics.avgResponseTime || 0}ms
                  </p>
                </div>
                <div>
                  <p className="text-sm text-blue-600">Taxa de Erro</p>
                  <p className="text-lg font-bold text-blue-900">
                    {((metrics.errorRate || 0) * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="scenarios">Cenários</TabsTrigger>
          <TabsTrigger value="metrics">Métricas</TabsTrigger>
          <TabsTrigger value="history">Histórico</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Atual</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Throughput</span>
                    <span className="font-medium">{metrics.throughput || 0} req/s</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Latência P95</span>
                    <span className="font-medium">{metrics.p95Latency || 0}ms</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Taxa de Erro</span>
                    <span className="font-medium">{((metrics.errorRate || 0) * 100).toFixed(2)}%</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Conexões Ativas</span>
                    <span className="font-medium">{metrics.activeConnections || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recursos do Sistema</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">CPU</span>
                      <span className="text-sm">{(systemStatus.cpu || 0).toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${systemStatus.cpu || 0}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Memória</span>
                      <span className="text-sm">{(systemStatus.memory || 0).toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full" 
                        style={{ width: `${systemStatus.memory || 0}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Disco</span>
                      <span className="text-sm">{(systemStatus.disk || 0).toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-purple-600 h-2 rounded-full" 
                        style={{ width: `${systemStatus.disk || 0}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="scenarios" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <Card>
              <CardHeader>
                <CardTitle>Configuração do Teste</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Número de Usuários
                    </label>
                    <Input
                      type="number"
                      value={testConfig.users}
                      onChange={(e) => setTestConfig(prev => ({ ...prev, users: parseInt(e.target.value) }))}
                      min="1"
                      max="10000"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Duração (segundos)
                    </label>
                    <Input
                      type="number"
                      value={testConfig.duration}
                      onChange={(e) => setTestConfig(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                      min="10"
                      max="3600"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ramp-up (segundos)
                    </label>
                    <Input
                      type="number"
                      value={testConfig.rampUp}
                      onChange={(e) => setTestConfig(prev => ({ ...prev, rampUp: parseInt(e.target.value) }))}
                      min="1"
                      max="600"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tipos de Teste</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(LOAD_TEST_TYPES).map(([key, type]) => (
                    <div key={key} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <span className="font-medium capitalize">{type.replace('_', ' ')}</span>
                        <p className="text-sm text-gray-600">
                          {type === 'smoke' && 'Teste básico de funcionalidade'}
                          {type === 'load' && 'Carga normal esperada'}
                          {type === 'stress' && 'Além da capacidade normal'}
                          {type === 'spike' && 'Picos súbitos de carga'}
                          {type === 'volume' && 'Grande volume de dados'}
                          {type === 'endurance' && 'Teste de longa duração'}
                        </p>
                      </div>
                      <Badge variant="outline">{type}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            {PERFORMANCE_SCENARIOS.map(scenario => (
              <Card key={scenario.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-semibold">{scenario.name}</h3>
                        <Badge variant="outline">{scenario.type}</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{scenario.description}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>Max: {scenario.maxUsers} usuários</span>
                        <span>Duração: {scenario.duration}s</span>
                        <span>Endpoint: {scenario.endpoint}</span>
                      </div>
                    </div>
                    
                    <Button
                      onClick={() => startLoadTest(scenario)}
                      disabled={testStatus === TEST_STATUS.RUNNING || startLoadTestMutation.isLoading}
                      className="ml-4"
                    >
                      {startLoadTestMutation.isLoading ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <Play className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="metrics" className="mt-6">
          <Card>
            <CardContent className="text-center py-12">
              <LineChart className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Métricas Detalhadas
              </h3>
              <p className="text-gray-600">
                Gráficos de performance em tempo real em desenvolvimento
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Testes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {testHistory.map(test => (
                  <div key={test.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      {getStatusIcon(test.status)}
                      <div>
                        <p className="font-medium">{test.scenario_name}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(test.created_at).toLocaleString('pt-BR')}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-6 text-sm">
                      <div className="text-center">
                        <p className="text-gray-600">Usuários</p>
                        <p className="font-medium">{test.max_users}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-gray-600">Duração</p>
                        <p className="font-medium">{test.duration}s</p>
                      </div>
                      <div className="text-center">
                        <p className="text-gray-600">RPS Médio</p>
                        <p className="font-medium">{test.avg_rps || 0}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-gray-600">Latência P95</p>
                        <p className="font-medium">{test.p95_latency || 0}ms</p>
                      </div>
                      <Badge className={test.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                        {test.status}
                      </Badge>
                    </div>
                  </div>
                ))}
                
                {testHistory.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p>Nenhum teste executado ainda</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
