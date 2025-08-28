import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import {  
  Workflow, 
  Plus, 
  Search, 
  Filter,
  Play,
  Pause,
  Square,
  Edit,
  Trash2,
  Copy,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  BarChart3,
  Settings,
  Eye,
  Download,
  Upload
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const WorkflowsPage = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [workflows, setWorkflows] = useState([]);

  // Simular dados de workflows
  useEffect(() => {
    const mockWorkflows = [
      {
        id: '1',
        name: 'Processamento de Pedidos',
        description: 'Workflow automatizado para processar novos pedidos',
        status: 'active',
        lastRun: '2024-01-15T10:30:00Z',
        nextRun: '2024-01-15T11:00:00Z',
        executions: 1247,
        successRate: 98.5,
        avgDuration: '2m 15s',
        triggers: ['webhook', 'schedule'],
        category: 'vendas',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-14T15:30:00Z'
      },
      {
        id: '2',
        name: 'Relatório Diário de Vendas',
        description: 'Gera e envia relatório diário de vendas por email',
        status: 'active',
        lastRun: '2024-01-15T08:00:00Z',
        nextRun: '2024-01-16T08:00:00Z',
        executions: 45,
        successRate: 100,
        avgDuration: '45s',
        triggers: ['schedule'],
        category: 'relatórios',
        createdAt: '2024-01-05T00:00:00Z',
        updatedAt: '2024-01-10T12:00:00Z'
      },
      {
        id: '3',
        name: 'Backup de Dados',
        description: 'Backup automático dos dados críticos do sistema',
        status: 'paused',
        lastRun: '2024-01-14T02:00:00Z',
        nextRun: null,
        executions: 30,
        successRate: 96.7,
        avgDuration: '15m 30s',
        triggers: ['schedule'],
        category: 'manutenção',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-14T02:00:00Z'
      },
      {
        id: '4',
        name: 'Notificação de Estoque Baixo',
        description: 'Monitora estoque e envia alertas quando necessário',
        status: 'error',
        lastRun: '2024-01-15T09:45:00Z',
        nextRun: '2024-01-15T10:45:00Z',
        executions: 156,
        successRate: 89.1,
        avgDuration: '30s',
        triggers: ['webhook', 'schedule'],
        category: 'estoque',
        createdAt: '2024-01-03T00:00:00Z',
        updatedAt: '2024-01-15T09:45:00Z'
      }
    ];
    setWorkflows(mockWorkflows);
  }, []);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'paused':
        return <Pause className="h-4 w-4 text-yellow-600" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'draft':
        return <Clock className="h-4 w-4 text-gray-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Ativo</Badge>;
      case 'paused':
        return <Badge className="bg-yellow-100 text-yellow-800">Pausado</Badge>;
      case 'error':
        return <Badge variant="destructive">Erro</Badge>;
      case 'draft':
        return <Badge variant="outline">Rascunho</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredWorkflows = workflows.filter(workflow => {
    const matchesSearch = workflow.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         workflow.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || workflow.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const handleRunWorkflow = async (workflowId) => {
    setIsLoading(true);
    try {
      // Simular execução do workflow
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('Executando workflow:', workflowId);
      // Aqui seria feita a chamada real para a API
    } catch (error) {
      console.error('Erro ao executar workflow:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePauseWorkflow = async (workflowId) => {
    try {
      // Simular pausa do workflow
      console.log('Pausando workflow:', workflowId);
      // Aqui seria feita a chamada real para a API
    } catch (error) {
      console.error('Erro ao pausar workflow:', error);
    }
  };

  const handleStopWorkflow = async (workflowId) => {
    try {
      // Simular parada do workflow
      console.log('Parando workflow:', workflowId);
      // Aqui seria feita a chamada real para a API
    } catch (error) {
      console.error('Erro ao parar workflow:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Workflows</h1>
          <p className="text-gray-600 mt-1">
            Gerencie e monitore seus workflows automatizados
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />

          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Novo Workflow
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Workflows</p>
                <p className="text-2xl font-bold text-gray-900">{workflows.length}</p>
              </div>
              <Workflow className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ativos</p>
                <p className="text-2xl font-bold text-green-600">
                  {workflows.filter(w => w.status === 'active').length}
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
                  {workflows.filter(w => w.status === 'error').length}
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
                <p className="text-sm font-medium text-gray-600">Taxa de Sucesso</p>
                <p className="text-2xl font-bold text-blue-600">
                  {workflows.length > 0 ? 
                    Math.round(workflows.reduce((acc, w) => acc + w.successRate, 0) / workflows.length) 
                    : 0}%
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Buscar workflows</Label>
              <div className="relative mt-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Digite o nome ou descrição..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="all">Todos</option>
                <option value="active">Ativo</option>
                <option value="paused">Pausado</option>
                <option value="error">Erro</option>
                <option value="draft">Rascunho</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Workflows List */}
      <div className="grid gap-6">
        {filteredWorkflows.map((workflow) => (
          <Card key={workflow.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  {getStatusIcon(workflow.status)}
                  <div>
                    <CardTitle className="text-lg">{workflow.name}</CardTitle>
                    <CardDescription className="mt-1">
                      {workflow.description}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusBadge(workflow.status)}
                  <Badge variant="outline" className="text-xs">
                    {workflow.category}
                  </Badge>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Workflow Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Execuções</p>
                  <p className="font-semibold">{workflow.executions.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-600">Taxa de Sucesso</p>
                  <p className="font-semibold text-green-600">{workflow.successRate}%</p>
                </div>
                <div>
                  <p className="text-gray-600">Duração Média</p>
                  <p className="font-semibold">{workflow.avgDuration}</p>
                </div>
                <div>
                  <p className="text-gray-600">Triggers</p>
                  <div className="flex flex-wrap gap-1">
                    {workflow.triggers.map((trigger, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {trigger}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              {/* Execution Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm border-t pt-4">
                <div>
                  <p className="text-gray-600">Última Execução</p>
                  <p className="font-medium">{formatDate(workflow.lastRun)}</p>
                </div>
                <div>
                  <p className="text-gray-600">Próxima Execução</p>
                  <p className="font-medium">
                    {workflow.nextRun ? formatDate(workflow.nextRun) : 'N/A'}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2 pt-4 border-t">
                <Button 
                  size="sm" 
                  onClick={() => handleRunWorkflow(workflow.id)}
                  disabled={isLoading}
                >
                  <Play className="h-4 w-4 mr-1" />

                {workflow.status === 'active' && (
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handlePauseWorkflow(workflow.id)}
                  >
                    <Pause className="h-4 w-4 mr-1" />

                )}
                
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleStopWorkflow(workflow.id)}
                >
                  <Square className="h-4 w-4 mr-1" />

                <Button size="sm" variant="outline">
                  <Eye className="h-4 w-4 mr-1" />

                <Button size="sm" variant="outline">
                  <Edit className="h-4 w-4 mr-1" />

                <Button size="sm" variant="outline">
                  <Copy className="h-4 w-4 mr-1" />

                <Button size="sm" variant="outline">
                  <BarChart3 className="h-4 w-4 mr-1" />
                  Métricas
                </Button>
                
                <Button size="sm" variant="outline">
                  <Settings className="h-4 w-4 mr-1" />

                <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                  <Trash2 className="h-4 w-4 mr-1" />

              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredWorkflows.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Workflow className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {searchTerm || selectedStatus !== 'all' ? 
                'Nenhum workflow encontrado' : 
                'Nenhum workflow criado'
              }
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || selectedStatus !== 'all' ? 
                'Tente ajustar os filtros de busca.' : 
                'Comece criando seu primeiro workflow automatizado.'
              }
            </p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Criar Primeiro Workflow
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex items-center space-x-3">
            <LoadingSpinner size="sm" />
            <span>Executando workflow...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkflowsPage;