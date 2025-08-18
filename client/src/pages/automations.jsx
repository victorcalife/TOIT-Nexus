/**
 * PÁGINA DE AUTOMAÇÕES INTELIGENTES
 * Sistema completo de automações baseadas em triggers e condições
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
  Zap,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  Play,
  Pause,
  Square,
  Clock,
  Brain,
  Target,
  Activity,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Settings,
  Copy,
  Download,
  Upload,
  BarChart3,
  TrendingUp,
  Users,
  Calendar,
  Database,
  Mail,
  MessageSquare,
  FileText,
  Webhook,
  GitBranch,
  Layers,
  Cpu,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/use-toast';

const AUTOMATION_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  RUNNING: 'running',
  ERROR: 'error',
  PAUSED: 'paused'
};

const TRIGGER_TYPES = {
  SCHEDULE: 'schedule',
  WEBHOOK: 'webhook',
  DATA_CHANGE: 'data_change',
  USER_ACTION: 'user_action',
  EMAIL_RECEIVED: 'email_received',
  FILE_UPLOAD: 'file_upload',
  FORM_SUBMIT: 'form_submit',
  QUANTUM_EVENT: 'quantum_event'
};

const ACTION_TYPES = {
  SEND_EMAIL: 'send_email',
  CREATE_TASK: 'create_task',
  UPDATE_DATA: 'update_data',
  SEND_NOTIFICATION: 'send_notification',
  GENERATE_REPORT: 'generate_report',
  EXECUTE_QUERY: 'execute_query',
  CALL_WEBHOOK: 'call_webhook',
  QUANTUM_PROCESS: 'quantum_process'
};

export default function AutomationsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [selectedAutomation, setSelectedAutomation] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [activeTab, setActiveTab] = useState('automations');

  // Query para listar automações
  const { data: automationsData, isLoading } = useQuery({
    queryKey: ['automations', searchTerm, filterType, filterStatus],
    queryFn: async () => {
      const params = new URLSearchParams({
        ...(searchTerm && { search: searchTerm }),
        ...(filterType !== 'all' && { type: filterType }),
        ...(filterStatus !== 'all' && { status: filterStatus }),
        limit: 50
      });

      const response = await fetch(`/api/automations?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao carregar automações');
      }

      return response.json();
    },
    enabled: !!user
  });

  // Query para triggers disponíveis
  const { data: triggersData } = useQuery({
    queryKey: ['automation-triggers'],
    queryFn: async () => {
      const response = await fetch('/api/automations/triggers', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao carregar triggers');
      }

      return response.json();
    },
    enabled: !!user
  });

  // Query para execuções
  const { data: executionsData } = useQuery({
    queryKey: ['automation-executions'],
    queryFn: async () => {
      const response = await fetch('/api/automations/executions', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao carregar execuções');
      }

      return response.json();
    },
    enabled: !!user
  });

  // Mutation para executar automação
  const executeAutomationMutation = useMutation({
    mutationFn: async ({ automationId, parameters = {} }) => {
      const response = await fetch(`/api/automations/${automationId}/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({ parameters })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao executar automação');
      }

      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: 'Automação executada',
        description: 'Execução iniciada com sucesso.'
      });
      queryClient.invalidateQueries(['automation-executions']);
      queryClient.invalidateQueries(['automations']);
    },
    onError: (error) => {
      toast({
        title: 'Erro ao executar automação',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  // Mutation para toggle status
  const toggleStatusMutation = useMutation({
    mutationFn: async ({ automationId, status }) => {
      const response = await fetch(`/api/automations/${automationId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({ status })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao alterar status');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['automations']);
    },
    onError: (error) => {
      toast({
        title: 'Erro ao alterar status',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  // Mutation para deletar automação
  const deleteAutomationMutation = useMutation({
    mutationFn: async (automationId) => {
      const response = await fetch(`/api/automations/${automationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao deletar automação');
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Automação deletada',
        description: 'Automação foi removida com sucesso.'
      });
      queryClient.invalidateQueries(['automations']);
      setSelectedAutomation(null);
    },
    onError: (error) => {
      toast({
        title: 'Erro ao deletar automação',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  const automations = automationsData?.data?.automations || [];
  const triggers = triggersData?.data?.triggers || [];
  const executions = executionsData?.data?.executions || [];

  const handleExecuteAutomation = (automationId) => {
    executeAutomationMutation.mutate({ automationId });
  };

  const handleToggleStatus = (automationId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    toggleStatusMutation.mutate({ automationId, status: newStatus });
  };

  const handleDeleteAutomation = (automationId) => {
    if (window.confirm('Tem certeza que deseja deletar esta automação?')) {
      deleteAutomationMutation.mutate(automationId);
    }
  };

  const getTriggerIcon = (type) => {
    const icons = {
      schedule: Clock,
      webhook: Webhook,
      data_change: Database,
      user_action: Users,
      email_received: Mail,
      file_upload: FileText,
      form_submit: MessageSquare,
      quantum_event: Sparkles
    };
    return icons[type] || Zap;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case AUTOMATION_STATUS.ACTIVE: return 'text-green-600 bg-green-100';
      case AUTOMATION_STATUS.INACTIVE: return 'text-gray-600 bg-gray-100';
      case AUTOMATION_STATUS.RUNNING: return 'text-blue-600 bg-blue-100';
      case AUTOMATION_STATUS.ERROR: return 'text-red-600 bg-red-100';
      case AUTOMATION_STATUS.PAUSED: return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case AUTOMATION_STATUS.ACTIVE: return CheckCircle;
      case AUTOMATION_STATUS.INACTIVE: return XCircle;
      case AUTOMATION_STATUS.RUNNING: return Activity;
      case AUTOMATION_STATUS.ERROR: return AlertTriangle;
      case AUTOMATION_STATUS.PAUSED: return Pause;
      default: return XCircle;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
          <h1 className="text-3xl font-bold text-gray-900">
            Automações Inteligentes
          </h1>
          <p className="text-gray-600">
            Automatize processos com triggers, condições e ações configuráveis
          </p>
        </div>
        
        <div className="flex space-x-2">
          <Button variant="outline" className="flex items-center space-x-2">
            <Brain className="w-4 h-4" />
            <span>MILA Insights</span>
          </Button>
          
          <Button onClick={() => setShowCreateModal(true)} className="flex items-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>Nova Automação</span>
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Automações</p>
                <p className="text-2xl font-bold text-gray-900">{automations.length}</p>
              </div>
              <Zap className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ativas</p>
                <p className="text-2xl font-bold text-green-600">
                  {automations.filter(a => a.status === 'active').length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Execuções Hoje</p>
                <p className="text-2xl font-bold text-purple-600">
                  {executions.filter(e => 
                    new Date(e.created_at).toDateString() === new Date().toDateString()
                  ).length}
                </p>
              </div>
              <Activity className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Quânticas</p>
                <p className="text-2xl font-bold text-orange-600">
                  {automations.filter(a => a.quantum_enhanced).length}
                </p>
              </div>
              <Sparkles className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex space-x-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar automações..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md"
        >
          <option value="all">Todos os tipos</option>
          <option value="schedule">Agendamento</option>
          <option value="webhook">Webhook</option>
          <option value="data_change">Mudança de Dados</option>
          <option value="user_action">Ação do Usuário</option>
          <option value="email_received">Email Recebido</option>
          <option value="quantum_event">Evento Quântico</option>
        </select>
        
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md"
        >
          <option value="all">Todos os status</option>
          <option value="active">Ativo</option>
          <option value="inactive">Inativo</option>
          <option value="running">Executando</option>
          <option value="error">Erro</option>
          <option value="paused">Pausado</option>
        </select>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="automations">Automações</TabsTrigger>
          <TabsTrigger value="triggers">Triggers</TabsTrigger>
          <TabsTrigger value="executions">Execuções</TabsTrigger>
          <TabsTrigger value="insights">MILA Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="automations" className="space-y-4">
          {automations.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Zap className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Nenhuma automação encontrada
                </h3>
                <p className="text-gray-600 mb-4">
                  Crie sua primeira automação inteligente
                </p>
                <Button onClick={() => setShowCreateModal(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Automação
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {automations.map((automation) => {
                const TriggerIcon = getTriggerIcon(automation.trigger_type);
                const StatusIcon = getStatusIcon(automation.status);
                const statusColor = getStatusColor(automation.status);
                
                return (
                  <Card key={automation.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-2">
                          <TriggerIcon className="w-5 h-5 text-blue-600" />
                          <CardTitle className="text-lg">{automation.name}</CardTitle>
                        </div>
                        
                        <div className="flex items-center space-x-1">
                          <div className={`p-1 rounded-full ${statusColor}`}>
                            <StatusIcon className="w-3 h-3" />
                          </div>
                          
                          {automation.quantum_enhanced && (
                            <Badge variant="secondary" className="text-xs">
                              <Sparkles className="w-3 h-3 mr-1" />
                              Quântico
                            </Badge>
                          )}
                          
                          {automation.mila_assisted && (
                            <Badge variant="secondary" className="text-xs">
                              <Brain className="w-3 h-3 mr-1" />
                              MILA
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        {automation.description || 'Sem descrição'}
                      </p>
                      
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                        <span>Criado em {formatDate(automation.created_at)}</span>
                        <span>{automation.execution_count || 0} execuções</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex space-x-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleExecuteAutomation(automation.id)}
                            disabled={executeAutomationMutation.isLoading}
                            className="p-2"
                          >
                            <Play className="w-3 h-3" />
                          </Button>
                          
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleToggleStatus(automation.id, automation.status)}
                            className="p-2"
                          >
                            {automation.status === 'active' ? (
                              <Pause className="w-3 h-3" />
                            ) : (
                              <Play className="w-3 h-3" />
                            )}
                          </Button>
                          
                          <Button size="sm" variant="outline" className="p-2">
                            <Eye className="w-3 h-3" />
                          </Button>
                        </div>
                        
                        <div className="flex space-x-1">
                          <Button size="sm" variant="outline" className="p-2">
                            <Edit className="w-3 h-3" />
                          </Button>
                          
                          <Button size="sm" variant="outline" className="p-2">
                            <Copy className="w-3 h-3" />
                          </Button>
                          
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="p-2 text-red-600 hover:text-red-700"
                            onClick={() => handleDeleteAutomation(automation.id)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="triggers" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.values(TRIGGER_TYPES).map((triggerType) => {
              const TriggerIcon = getTriggerIcon(triggerType);
              
              return (
                <Card key={triggerType} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex items-center space-x-2">
                      <TriggerIcon className="w-5 h-5 text-green-600" />
                      <CardTitle className="text-lg capitalize">{triggerType.replace('_', ' ')}</CardTitle>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4">
                      Trigger baseado em {triggerType.replace('_', ' ')}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">{triggerType}</Badge>
                      <Button size="sm">
                        Usar Trigger
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="executions" className="space-y-4">
          <Card>
            <CardContent className="text-center py-12">
              <Activity className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Execuções de Automações
              </h3>
              <p className="text-gray-600">
                Histórico de execuções e logs detalhados
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <Card>
            <CardContent className="text-center py-12">
              <Brain className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                MILA AI Insights
              </h3>
              <p className="text-gray-600">
                Insights inteligentes e sugestões de automação
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
