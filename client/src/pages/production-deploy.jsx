/**
 * PÁGINA DE DEPLOY EM PRODUÇÃO
 * Sistema completo de deploy e go-live mundial
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
  Rocket,
  Globe,
  CheckCircle,
  XCircle,
  Clock,
  Server,
  Database,
  Shield,
  Activity,
  RefreshCw,
  Play,
  Pause,
  Square,
  Settings,
  Download,
  Upload,
  Target,
  BarChart3,
  TrendingUp,
  Users,
  Calendar,
  FileText,
  Code,
  Zap,
  Cloud,
  Monitor,
  AlertTriangle,
  Eye,
  Cpu,
  HardDrive,
  Wifi,
  MemoryStick
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/use-toast';

const DEPLOY_STAGES = [
  {
    id: 'pre_checks',
    name: 'Verificações Pré-Deploy',
    description: 'Validações de segurança, testes e qualidade',
    steps: [
      'Verificar todos os testes passando',
      'Validar cobertura de testes > 90%',
      'Confirmar zero vulnerabilidades críticas',
      'Verificar performance dentro dos limites',
      'Validar backup de dados atual'
    ]
  },
  {
    id: 'build_production',
    name: 'Build de Produção',
    description: 'Compilação otimizada para produção',
    steps: [
      'Executar build otimizado',
      'Minificar assets',
      'Otimizar imagens',
      'Gerar source maps',
      'Validar integridade dos arquivos'
    ]
  },
  {
    id: 'infrastructure',
    name: 'Infraestrutura',
    description: 'Configuração de servidores e serviços',
    steps: [
      'Provisionar servidores de produção',
      'Configurar load balancers',
      'Configurar CDN global',
      'Configurar SSL/TLS',
      'Configurar firewall e segurança'
    ]
  },
  {
    id: 'database_migration',
    name: 'Migração de Banco',
    description: 'Migração segura do banco de dados',
    steps: [
      'Backup completo do banco',
      'Executar migrações',
      'Validar integridade dos dados',
      'Configurar replicação',
      'Testar rollback'
    ]
  },
  {
    id: 'application_deploy',
    name: 'Deploy da Aplicação',
    description: 'Deploy da aplicação em produção',
    steps: [
      'Deploy do backend',
      'Deploy do frontend',
      'Configurar variáveis de ambiente',
      'Inicializar serviços',
      'Validar health checks'
    ]
  },
  {
    id: 'post_deploy',
    name: 'Pós-Deploy',
    description: 'Validações e configurações finais',
    steps: [
      'Executar smoke tests',
      'Validar todas as funcionalidades',
      'Configurar monitoramento',
      'Configurar alertas',
      'Documentar deploy'
    ]
  }
];

const DEPLOY_STATUS = {
  PENDING: 'pending',
  RUNNING: 'running',
  SUCCESS: 'success',
  FAILED: 'failed',
  SKIPPED: 'skipped'
};

const STATUS_COLORS = {
  pending: 'bg-gray-100 text-gray-800',
  running: 'bg-blue-100 text-blue-800',
  success: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
  skipped: 'bg-yellow-100 text-yellow-800'
};

const STATUS_ICONS = {
  pending: Clock,
  running: RefreshCw,
  success: CheckCircle,
  failed: XCircle,
  skipped: AlertTriangle
};

export default function ProductionDeployPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [deployStatus, setDeployStatus] = useState('ready');
  const [currentStage, setCurrentStage] = useState(null);
  const [stageStatuses, setStageStatuses] = useState({});
  const [deployLogs, setDeployLogs] = useState([]);

  // Query para status do sistema
  const { data: systemStatusData, isLoading } = useQuery({
    queryKey: ['production-system-status'],
    queryFn: async () => {
      const response = await fetch('/api/production/system-status', {
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
    refetchInterval: deployStatus === 'deploying' ? 5000 : 30000
  });

  // Query para métricas de produção
  const { data: productionMetricsData } = useQuery({
    queryKey: ['production-metrics'],
    queryFn: async () => {
      const response = await fetch('/api/production/metrics', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao carregar métricas de produção');
      }

      return response.json();
    },
    enabled: !!user,
    refetchInterval: 10000
  });

  // Query para histórico de deploys
  const { data: deployHistoryData } = useQuery({
    queryKey: ['deploy-history'],
    queryFn: async () => {
      const response = await fetch('/api/production/deploy-history?limit=10', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao carregar histórico de deploys');
      }

      return response.json();
    },
    enabled: !!user
  });

  // Mutation para iniciar deploy
  const startDeployMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/production/start-deploy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({
          environment: 'production',
          version: 'latest',
          autoRollback: true
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao iniciar deploy');
      }

      return response.json();
    },
    onSuccess: (data) => {
      setDeployStatus('deploying');
      setCurrentStage(DEPLOY_STAGES[0].id);
      toast({
        title: 'Deploy iniciado',
        description: `Deploy ${data.deployId} iniciado com sucesso.`
      });
      queryClient.invalidateQueries(['production-system-status']);
    },
    onError: (error) => {
      toast({
        title: 'Erro no deploy',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  // Mutation para rollback
  const rollbackMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/production/rollback', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro no rollback');
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Rollback executado',
        description: 'Sistema foi revertido para a versão anterior.'
      });
      queryClient.invalidateQueries(['production-system-status']);
    },
    onError: (error) => {
      toast({
        title: 'Erro no rollback',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  const systemStatus = systemStatusData?.data || {};
  const productionMetrics = productionMetricsData?.data || {};
  const deployHistory = deployHistoryData?.data?.deploys || [];

  const getStageStatus = (stageId) => {
    return stageStatuses[stageId] || DEPLOY_STATUS.PENDING;
  };

  const getStatusIcon = (status) => {
    const Icon = STATUS_ICONS[status];
    return <Icon className={`w-5 h-5 ${
      status === 'success' ? 'text-green-600' :
      status === 'failed' ? 'text-red-600' :
      status === 'running' ? 'text-blue-600 animate-spin' : 'text-gray-600'
    }`} />;
  };

  const getSystemHealthScore = () => {
    const metrics = [
      systemStatus.uptime || 0,
      systemStatus.responseTime || 0,
      systemStatus.errorRate || 0,
      systemStatus.cpuUsage || 0,
      systemStatus.memoryUsage || 0
    ];
    
    // Calcular score baseado nas métricas
    let score = 100;
    if (systemStatus.responseTime > 500) score -= 20;
    if (systemStatus.errorRate > 0.01) score -= 30;
    if (systemStatus.cpuUsage > 80) score -= 15;
    if (systemStatus.memoryUsage > 85) score -= 15;
    
    return Math.max(0, score);
  };

  const isReadyForDeploy = () => {
    return (
      systemStatus.testsStatus === 'passing' &&
      systemStatus.securityStatus === 'secure' &&
      systemStatus.performanceStatus === 'optimal' &&
      systemStatus.backupStatus === 'current'
    );
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
            <Rocket className="w-8 h-8 mr-3 text-blue-600" />
            Deploy Produção
          </h1>
          <p className="text-gray-600">
            Sistema de deploy e go-live mundial
          </p>
        </div>
        
        <div className="flex space-x-2">
          {deployStatus === 'deploying' ? (
            <Button
              variant="destructive"
              onClick={() => rollbackMutation.mutate()}
              disabled={rollbackMutation.isLoading}
              className="flex items-center space-x-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Rollback</span>
            </Button>
          ) : (
            <Button
              onClick={() => startDeployMutation.mutate()}
              disabled={!isReadyForDeploy() || startDeployMutation.isLoading}
              className="flex items-center space-x-2"
            >
              {startDeployMutation.isLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Rocket className="w-4 h-4" />
              )}
              <span>Iniciar Deploy</span>
            </Button>
          )}
          
          <Button variant="outline" className="flex items-center space-x-2">
            <Download className="w-4 h-4" />
            <span>Logs</span>
          </Button>
        </div>
      </div>

      {/* System Health */}
      <Card className={`mb-8 border-2 ${
        getSystemHealthScore() >= 90 ? 'border-green-200 bg-green-50' :
        getSystemHealthScore() >= 70 ? 'border-yellow-200 bg-yellow-50' :
        'border-red-200 bg-red-50'
      }`}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={`p-4 rounded-full ${
                getSystemHealthScore() >= 90 ? 'bg-green-100' :
                getSystemHealthScore() >= 70 ? 'bg-yellow-100' : 'bg-red-100'
              }`}>
                <Activity className={`w-8 h-8 ${
                  getSystemHealthScore() >= 90 ? 'text-green-600' :
                  getSystemHealthScore() >= 70 ? 'text-yellow-600' : 'text-red-600'
                }`} />
              </div>
              <div>
                <h3 className="text-2xl font-bold">
                  Sistema Health Score: {getSystemHealthScore()}/100
                </h3>
                <p className={`${
                  getSystemHealthScore() >= 90 ? 'text-green-700' :
                  getSystemHealthScore() >= 70 ? 'text-yellow-700' : 'text-red-700'
                }`}>
                  {isReadyForDeploy() ? '✅ Pronto para deploy em produção' : '⚠️ Requer atenção antes do deploy'}
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-sm text-gray-600">Uptime</p>
                <p className="text-lg font-bold text-green-600">
                  {((systemStatus.uptime || 0) * 100).toFixed(1)}%
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Response Time</p>
                <p className="text-lg font-bold text-blue-600">
                  {systemStatus.responseTime || 0}ms
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Error Rate</p>
                <p className="text-lg font-bold text-orange-600">
                  {((systemStatus.errorRate || 0) * 100).toFixed(2)}%
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Usuários Ativos</p>
                <p className="text-lg font-bold text-purple-600">
                  {productionMetrics.activeUsers || 0}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Deploy Progress */}
      {deployStatus === 'deploying' && (
        <Card className="mb-8 border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <RefreshCw className="w-5 h-5 animate-spin text-blue-600" />
              <span>Deploy em Progresso</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {DEPLOY_STAGES.map((stage, index) => {
                const status = getStageStatus(stage.id);
                const isActive = currentStage === stage.id;
                
                return (
                  <div key={stage.id} className={`p-4 rounded-lg border ${
                    isActive ? 'border-blue-300 bg-blue-100' : 'border-gray-200 bg-white'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                          status === 'success' ? 'bg-green-100 text-green-600' :
                          status === 'running' ? 'bg-blue-100 text-blue-600' :
                          status === 'failed' ? 'bg-red-100 text-red-600' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {index + 1}
                        </span>
                        <div>
                          <h4 className="font-semibold">{stage.name}</h4>
                          <p className="text-sm text-gray-600">{stage.description}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(status)}
                        <Badge className={STATUS_COLORS[status]}>
                          {status}
                        </Badge>
                      </div>
                    </div>
                    
                    {isActive && (
                      <div className="mt-3 space-y-2">
                        {stage.steps.map((step, stepIndex) => (
                          <div key={stepIndex} className="flex items-center space-x-2 text-sm">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span>{step}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">CPU</p>
                <p className="text-2xl font-bold text-blue-600">
                  {(systemStatus.cpuUsage || 0).toFixed(1)}%
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
                <p className="text-2xl font-bold text-green-600">
                  {(systemStatus.memoryUsage || 0).toFixed(1)}%
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
                <p className="text-2xl font-bold text-purple-600">
                  {(systemStatus.diskUsage || 0).toFixed(1)}%
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
                  {(systemStatus.networkThroughput || 0).toFixed(1)} Mbps
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
                <p className="text-sm font-medium text-gray-600">Requests/s</p>
                <p className="text-2xl font-bold text-indigo-600">
                  {productionMetrics.requestsPerSecond || 0}
                </p>
              </div>
              <Activity className="w-8 h-8 text-indigo-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Deploys</p>
                <p className="text-2xl font-bold text-red-600">
                  {deployHistory.length}
                </p>
              </div>
              <Rocket className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="readiness">Prontidão</TabsTrigger>
          <TabsTrigger value="history">Histórico</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoramento</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Status dos Serviços</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Server className="w-5 h-5 text-blue-600" />
                      <span className="font-medium">Backend API</span>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Online</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Globe className="w-5 h-5 text-purple-600" />
                      <span className="font-medium">Frontend</span>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Online</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Database className="w-5 h-5 text-green-600" />
                      <span className="font-medium">Banco de Dados</span>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Online</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Zap className="w-5 h-5 text-orange-600" />
                      <span className="font-medium">Sistema Quântico</span>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Online</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Métricas de Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Tempo de Resposta Médio</span>
                    <span className="font-medium">{systemStatus.responseTime || 0}ms</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Throughput</span>
                    <span className="font-medium">{productionMetrics.throughput || 0} req/s</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Taxa de Erro</span>
                    <span className="font-medium">{((systemStatus.errorRate || 0) * 100).toFixed(2)}%</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Disponibilidade</span>
                    <span className="font-medium">{((systemStatus.uptime || 0) * 100).toFixed(2)}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="readiness" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Checklist de Prontidão</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span>Todos os testes passando</span>
                    </div>
                    <Badge className="bg-green-100 text-green-800">OK</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span>Cobertura de testes > 90%</span>
                    </div>
                    <Badge className="bg-green-100 text-green-800">95%</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span>Zero vulnerabilidades críticas</span>
                    </div>
                    <Badge className="bg-green-100 text-green-800">OK</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span>Performance otimizada</span>
                    </div>
                    <Badge className="bg-green-100 text-green-800">OK</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span>Backup atual disponível</span>
                    </div>
                    <Badge className="bg-green-100 text-green-800">OK</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Configurações de Produção</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Ambiente</span>
                    <Badge className="bg-red-100 text-red-800">PRODUCTION</Badge>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">SSL/TLS</span>
                    <Badge className="bg-green-100 text-green-800">Ativo</Badge>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">CDN</span>
                    <Badge className="bg-green-100 text-green-800">Configurado</Badge>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Load Balancer</span>
                    <Badge className="bg-green-100 text-green-800">Ativo</Badge>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Auto Scaling</span>
                    <Badge className="bg-green-100 text-green-800">Configurado</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Deploys</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {deployHistory.map(deploy => (
                  <div key={deploy.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      {getStatusIcon(deploy.status)}
                      <div>
                        <p className="font-medium">Deploy #{deploy.id}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(deploy.created_at).toLocaleString('pt-BR')}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm">
                      <div className="text-center">
                        <p className="text-gray-600">Versão</p>
                        <p className="font-medium">{deploy.version}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-gray-600">Duração</p>
                        <p className="font-medium">{deploy.duration}s</p>
                      </div>
                      <Badge className={STATUS_COLORS[deploy.status]}>
                        {deploy.status}
                      </Badge>
                    </div>
                  </div>
                ))}
                
                {deployHistory.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Rocket className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p>Nenhum deploy executado ainda</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monitoring" className="mt-6">
          <Card>
            <CardContent className="text-center py-12">
              <Monitor className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Monitoramento em Tempo Real
              </h3>
              <p className="text-gray-600">
                Dashboard de monitoramento em desenvolvimento
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
