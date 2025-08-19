/**
 * SISTEMA DE INTEGRAÇÕES API - TOIT NEXUS
 * Sistema completo de integração com APIs externas
 * 100% JavaScript - SEM TYPESCRIPT
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
  Zap, 
  Plus, 
  Edit,
  Trash2,
  Play,
  Pause,
  Settings,
  Eye,
  Code,
  Database,
  Globe,
  Key,
  Shield,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Download,
  Upload,
  Link,
  Webhook,
  Server,
  Cloud,
  Activity,
  BarChart3,
  TrendingUp,
  Filter,
  Search,
  MoreHorizontal
} from 'lucide-react';

const APIIntegrations = () => {
  const [integrations, setIntegrations] = useState([]);
  const [activeIntegration, setActiveIntegration] = useState(null);
  const [apiKeys, setApiKeys] = useState([]);
  const [webhooks, setWebhooks] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [testResults, setTestResults] = useState({});
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showTestModal, setShowTestModal] = useState(false);
  
  const { toast } = useToast();

  // Formulário de integração
  const [integrationForm, setIntegrationForm] = useState({
    name: '',
    type: 'rest',
    baseUrl: '',
    authentication: 'none',
    apiKey: '',
    headers: {},
    timeout: 30000,
    retryAttempts: 3,
    rateLimit: 100,
    isActive: true,
    description: ''
  });

  // Tipos de integração disponíveis
  const integrationTypes = [
    {
      id: 'rest',
      name: 'REST API',
      description: 'Integração com APIs REST padrão',
      icon: <Globe className="h-5 w-5" />,
      color: 'bg-blue-500'
    },
    {
      id: 'graphql',
      name: 'GraphQL',
      description: 'Integração com APIs GraphQL',
      icon: <Code className="h-5 w-5" />,
      color: 'bg-purple-500'
    },
    {
      id: 'webhook',
      name: 'Webhook',
      description: 'Receber dados via webhooks',
      icon: <Webhook className="h-5 w-5" />,
      color: 'bg-green-500'
    },
    {
      id: 'database',
      name: 'Database',
      description: 'Conexão direta com banco de dados',
      icon: <Database className="h-5 w-5" />,
      color: 'bg-orange-500'
    },
    {
      id: 'cloud',
      name: 'Cloud Service',
      description: 'Integração com serviços em nuvem',
      icon: <Cloud className="h-5 w-5" />,
      color: 'bg-indigo-500'
    }
  ];

  /**
   * CARREGAR INTEGRAÇÕES
   */
  const loadIntegrations = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/integrations', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao carregar integrações');
      }

      const data = await response.json();
      setIntegrations(data.integrations || []);
    } catch (error) {
      console.error('Erro ao carregar integrações:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as integrações",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * CRIAR INTEGRAÇÃO
   */
  const createIntegration = async () => {
    try {
      const response = await fetch('/api/integrations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...integrationForm,
          createdAt: new Date().toISOString()
        })
      });

      if (!response.ok) {
        throw new Error('Erro ao criar integração');
      }

      const data = await response.json();
      setIntegrations(prev => [...prev, data.integration]);
      setShowCreateModal(false);
      resetForm();
      
      toast({
        title: "Integração criada",
        description: "Integração criada com sucesso",
      });
    } catch (error) {
      console.error('Erro ao criar integração:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar a integração",
        variant: "destructive"
      });
    }
  };

  /**
   * TESTAR INTEGRAÇÃO
   */
  const testIntegration = async (integrationId) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/integrations/${integrationId}/test`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao testar integração');
      }

      const data = await response.json();
      setTestResults(prev => ({
        ...prev,
        [integrationId]: data.result
      }));
      
      toast({
        title: "Teste concluído",
        description: `Integração testada: ${data.result.success ? 'Sucesso' : 'Falha'}`,
        variant: data.result.success ? "default" : "destructive"
      });
    } catch (error) {
      console.error('Erro ao testar integração:', error);
      toast({
        title: "Erro",
        description: "Não foi possível testar a integração",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * ATIVAR/DESATIVAR INTEGRAÇÃO
   */
  const toggleIntegration = async (integrationId, isActive) => {
    try {
      const response = await fetch(`/api/integrations/${integrationId}/toggle`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isActive: !isActive })
      });

      if (!response.ok) {
        throw new Error('Erro ao alterar status da integração');
      }

      setIntegrations(prev => prev.map(integration => 
        integration.id === integrationId 
          ? { ...integration, isActive: !isActive }
          : integration
      ));
      
      toast({
        title: "Status alterado",
        description: `Integração ${!isActive ? 'ativada' : 'desativada'} com sucesso`,
      });
    } catch (error) {
      console.error('Erro ao alterar status:', error);
      toast({
        title: "Erro",
        description: "Não foi possível alterar o status da integração",
        variant: "destructive"
      });
    }
  };

  /**
   * CARREGAR LOGS DE INTEGRAÇÃO
   */
  const loadIntegrationLogs = async (integrationId) => {
    try {
      const response = await fetch(`/api/integrations/${integrationId}/logs`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao carregar logs');
      }

      const data = await response.json();
      setLogs(data.logs || []);
    } catch (error) {
      console.error('Erro ao carregar logs:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os logs",
        variant: "destructive"
      });
    }
  };

  /**
   * EXECUTAR INTEGRAÇÃO MANUAL
   */
  const executeIntegration = async (integrationId, payload = {}) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/integrations/${integrationId}/execute`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ payload })
      });

      if (!response.ok) {
        throw new Error('Erro ao executar integração');
      }

      const data = await response.json();
      
      toast({
        title: "Integração executada",
        description: "Integração executada com sucesso",
      });

      // Recarregar logs
      loadIntegrationLogs(integrationId);
    } catch (error) {
      console.error('Erro ao executar integração:', error);
      toast({
        title: "Erro",
        description: "Não foi possível executar a integração",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * RESETAR FORMULÁRIO
   */
  const resetForm = () => {
    setIntegrationForm({
      name: '',
      type: 'rest',
      baseUrl: '',
      authentication: 'none',
      apiKey: '',
      headers: {},
      timeout: 30000,
      retryAttempts: 3,
      rateLimit: 100,
      isActive: true,
      description: ''
    });
  };

  /**
   * OBTER STATUS COLOR
   */
  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'inactive': return 'text-gray-600 bg-gray-100';
      case 'error': return 'text-red-600 bg-red-100';
      case 'testing': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  /**
   * RENDERIZAR CARD DE INTEGRAÇÃO
   */
  const renderIntegrationCard = (integration) => {
    const integrationType = integrationTypes.find(type => type.id === integration.type);
    const testResult = testResults[integration.id];
    
    return (
      <Card key={integration.id} className="hover:shadow-md transition-shadow">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded ${integrationType?.color || 'bg-gray-500'} text-white`}>
                {integrationType?.icon || <Globe className="h-5 w-5" />}
              </div>
              <div>
                <CardTitle className="text-lg">{integration.name}</CardTitle>
                <p className="text-sm text-gray-500">{integration.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={getStatusColor(integration.isActive ? 'active' : 'inactive')}>
                {integration.isActive ? 'Ativo' : 'Inativo'}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveIntegration(integration)}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Informações básicas */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Tipo:</span>
                <span className="ml-2 font-medium">{integrationType?.name}</span>
              </div>
              <div>
                <span className="text-gray-600">URL Base:</span>
                <span className="ml-2 font-medium truncate">{integration.baseUrl}</span>
              </div>
              <div>
                <span className="text-gray-600">Autenticação:</span>
                <span className="ml-2 font-medium">{integration.authentication}</span>
              </div>
              <div>
                <span className="text-gray-600">Rate Limit:</span>
                <span className="ml-2 font-medium">{integration.rateLimit}/min</span>
              </div>
            </div>

            {/* Resultado do último teste */}
            {testResult && (
              <div className={`p-3 rounded-lg ${
                testResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  {testResult.success ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-600" />
                  )}
                  <span className={`text-sm font-medium ${
                    testResult.success ? 'text-green-800' : 'text-red-800'
                  }`}>
                    Último teste: {testResult.success ? 'Sucesso' : 'Falha'}
                  </span>
                </div>
                <div className="text-xs text-gray-600">
                  <div>Tempo de resposta: {testResult.responseTime}ms</div>
                  <div>Status: {testResult.statusCode}</div>
                  {testResult.error && (
                    <div className="text-red-600 mt-1">Erro: {testResult.error}</div>
                  )}
                </div>
              </div>
            )}

            {/* Estatísticas */}
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-2 bg-gray-50 rounded">
                <div className="text-lg font-bold text-blue-600">
                  {integration.stats?.totalRequests || 0}
                </div>
                <div className="text-xs text-gray-600">Requisições</div>
              </div>
              <div className="p-2 bg-gray-50 rounded">
                <div className="text-lg font-bold text-green-600">
                  {integration.stats?.successRate || 0}%
                </div>
                <div className="text-xs text-gray-600">Taxa de Sucesso</div>
              </div>
              <div className="p-2 bg-gray-50 rounded">
                <div className="text-lg font-bold text-orange-600">
                  {integration.stats?.avgResponseTime || 0}ms
                </div>
                <div className="text-xs text-gray-600">Tempo Médio</div>
              </div>
            </div>

            {/* Ações */}
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => testIntegration(integration.id)}
                disabled={loading}
              >
                <Play className="h-3 w-3 mr-1" />
                Testar
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => executeIntegration(integration.id)}
                disabled={loading || !integration.isActive}
              >
                <Zap className="h-3 w-3 mr-1" />
                Executar
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => loadIntegrationLogs(integration.id)}
              >
                <Eye className="h-3 w-3 mr-1" />
                Logs
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => toggleIntegration(integration.id, integration.isActive)}
              >
                {integration.isActive ? (
                  <>
                    <Pause className="h-3 w-3 mr-1" />
                    Desativar
                  </>
                ) : (
                  <>
                    <Play className="h-3 w-3 mr-1" />
                    Ativar
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  /**
   * RENDERIZAR LOGS
   */
  const renderLogs = () => {
    if (logs.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          <Activity className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>Nenhum log disponível</p>
        </div>
      );
    }

    return (
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {logs.map((log) => (
          <div
            key={log.id}
            className={`p-3 rounded-lg border ${
              log.level === 'error' ? 'bg-red-50 border-red-200' :
              log.level === 'warning' ? 'bg-yellow-50 border-yellow-200' :
              'bg-gray-50 border-gray-200'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                {log.level === 'error' && <XCircle className="h-4 w-4 text-red-600" />}
                {log.level === 'warning' && <AlertTriangle className="h-4 w-4 text-yellow-600" />}
                {log.level === 'info' && <CheckCircle className="h-4 w-4 text-green-600" />}
                <span className="font-medium text-sm">{log.method} {log.endpoint}</span>
                <Badge variant="outline" className="text-xs">
                  {log.statusCode}
                </Badge>
              </div>
              <span className="text-xs text-gray-500">
                {new Date(log.timestamp).toLocaleString('pt-BR')}
              </span>
            </div>
            <div className="text-sm text-gray-600">
              <div>Tempo de resposta: {log.responseTime}ms</div>
              {log.error && (
                <div className="text-red-600 mt-1">Erro: {log.error}</div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  /**
   * CARREGAR DADOS AO MONTAR COMPONENTE
   */
  useEffect(() => {
    loadIntegrations();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Link className="h-8 w-8 text-blue-600" />
                Integrações API
              </h1>
              <p className="text-gray-600 mt-2">
                Gerencie integrações com APIs externas e serviços
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={loadIntegrations}
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Atualizar
              </Button>
              <Button
                onClick={() => setShowCreateModal(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nova Integração
              </Button>
            </div>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total de Integrações</p>
                  <p className="text-2xl font-bold text-gray-900">{integrations.length}</p>
                </div>
                <Link className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Ativas</p>
                  <p className="text-2xl font-bold text-green-600">
                    {integrations.filter(i => i.isActive).length}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Com Erro</p>
                  <p className="text-2xl font-bold text-red-600">
                    {integrations.filter(i => i.status === 'error').length}
                  </p>
                </div>
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Requisições Hoje</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {integrations.reduce((acc, i) => acc + (i.stats?.todayRequests || 0), 0)}
                  </p>
                </div>
                <BarChart3 className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="integrations" className="space-y-6">
          <TabsList>
            <TabsTrigger value="integrations">Integrações</TabsTrigger>
            <TabsTrigger value="logs">Logs</TabsTrigger>
            <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
            <TabsTrigger value="keys">API Keys</TabsTrigger>
          </TabsList>

          <TabsContent value="integrations">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2">Carregando integrações...</span>
              </div>
            ) : integrations.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Link className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Nenhuma integração configurada
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Crie sua primeira integração para conectar com APIs externas
                  </p>
                  <Button onClick={() => setShowCreateModal(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Criar Integração
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {integrations.map(renderIntegrationCard)}
              </div>
            )}
          </TabsContent>

          <TabsContent value="logs">
            <Card>
              <CardHeader>
                <CardTitle>Logs de Integração</CardTitle>
              </CardHeader>
              <CardContent>
                {renderLogs()}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="webhooks">
            <Card>
              <CardContent className="p-12 text-center">
                <Webhook className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Webhooks
                </h3>
                <p className="text-gray-500">
                  Configuração de webhooks será implementada aqui
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="keys">
            <Card>
              <CardContent className="p-12 text-center">
                <Key className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  API Keys
                </h3>
                <p className="text-gray-500">
                  Gerenciamento de chaves API será implementado aqui
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modal de Criação - Será implementado na próxima parte */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Criar Nova Integração</h2>
            {/* Formulário será implementado na próxima parte */}
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                Cancelar
              </Button>
              <Button onClick={createIntegration} disabled={loading}>
                {loading ? 'Criando...' : 'Criar Integração'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default APIIntegrations;
