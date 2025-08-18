/**
 * AUTOMATION BUILDER
 * Interface visual para criação de automações inteligentes
 * 100% JavaScript - SEM TYPESCRIPT
 */

import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  Zap,
  Plus,
  Trash2,
  Settings,
  Clock,
  Database,
  Mail,
  Users,
  Webhook,
  FileText,
  MessageSquare,
  Sparkles,
  Brain,
  Target,
  GitBranch,
  Layers,
  CheckCircle,
  AlertTriangle,
  Play,
  Save
} from 'lucide-react';

const TRIGGER_TYPES = {
  SCHEDULE: {
    id: 'schedule',
    name: 'Agendamento',
    icon: Clock,
    description: 'Executar em horários específicos',
    config: {
      schedule: '0 9 * * 1-5', // Cron expression
      timezone: 'America/Sao_Paulo'
    }
  },
  WEBHOOK: {
    id: 'webhook',
    name: 'Webhook',
    icon: Webhook,
    description: 'Executar via chamada HTTP',
    config: {
      method: 'POST',
      authentication: 'bearer'
    }
  },
  DATA_CHANGE: {
    id: 'data_change',
    name: 'Mudança de Dados',
    icon: Database,
    description: 'Executar quando dados mudarem',
    config: {
      table: '',
      operation: 'INSERT',
      conditions: []
    }
  },
  USER_ACTION: {
    id: 'user_action',
    name: 'Ação do Usuário',
    icon: Users,
    description: 'Executar quando usuário realizar ação',
    config: {
      action: 'login',
      conditions: []
    }
  },
  EMAIL_RECEIVED: {
    id: 'email_received',
    name: 'Email Recebido',
    icon: Mail,
    description: 'Executar quando email for recebido',
    config: {
      from: '',
      subject_contains: '',
      conditions: []
    }
  }
};

const CONDITION_OPERATORS = {
  EQUALS: '=',
  NOT_EQUALS: '!=',
  GREATER: '>',
  LESS: '<',
  CONTAINS: 'contains',
  STARTS_WITH: 'starts_with',
  ENDS_WITH: 'ends_with',
  IN: 'in',
  NOT_IN: 'not_in'
};

const ACTION_TYPES = {
  SEND_EMAIL: {
    id: 'send_email',
    name: 'Enviar Email',
    icon: Mail,
    description: 'Enviar email para destinatários',
    config: {
      to: '',
      subject: '',
      template: '',
      variables: {}
    }
  },
  CREATE_TASK: {
    id: 'create_task',
    name: 'Criar Tarefa',
    icon: CheckCircle,
    description: 'Criar nova tarefa no sistema',
    config: {
      title: '',
      description: '',
      assignee: '',
      priority: 'medium',
      due_date: ''
    }
  },
  UPDATE_DATA: {
    id: 'update_data',
    name: 'Atualizar Dados',
    icon: Database,
    description: 'Atualizar dados no banco',
    config: {
      table: '',
      data: {},
      conditions: []
    }
  },
  SEND_NOTIFICATION: {
    id: 'send_notification',
    name: 'Enviar Notificação',
    icon: AlertTriangle,
    description: 'Enviar notificação push',
    config: {
      title: '',
      message: '',
      users: [],
      channels: ['web', 'email']
    }
  },
  QUANTUM_PROCESS: {
    id: 'quantum_process',
    name: 'Processamento Quântico',
    icon: Sparkles,
    description: 'Executar algoritmo quântico',
    config: {
      algorithm: 'grover',
      parameters: {},
      optimization: true
    }
  }
};

export default function AutomationBuilder({ automation = null, onSave, onCancel }) {
  const [automationData, setAutomationData] = useState({
    name: automation?.name || '',
    description: automation?.description || '',
    trigger: automation?.trigger || null,
    conditions: automation?.conditions || [],
    actions: automation?.actions || [],
    quantum_enhanced: automation?.quantum_enhanced || false,
    mila_assisted: automation?.mila_assisted || false
  });

  const [activeStep, setActiveStep] = useState('trigger');

  // Adicionar trigger
  const addTrigger = (triggerType) => {
    setAutomationData(prev => ({
      ...prev,
      trigger: {
        type: triggerType.id,
        name: triggerType.name,
        config: { ...triggerType.config }
      }
    }));
    setActiveStep('conditions');
  };

  // Adicionar condição
  const addCondition = () => {
    setAutomationData(prev => ({
      ...prev,
      conditions: [
        ...prev.conditions,
        {
          id: Date.now(),
          field: '',
          operator: CONDITION_OPERATORS.EQUALS,
          value: '',
          type: 'simple'
        }
      ]
    }));
  };

  // Remover condição
  const removeCondition = (conditionId) => {
    setAutomationData(prev => ({
      ...prev,
      conditions: prev.conditions.filter(c => c.id !== conditionId)
    }));
  };

  // Atualizar condição
  const updateCondition = (conditionId, field, value) => {
    setAutomationData(prev => ({
      ...prev,
      conditions: prev.conditions.map(c =>
        c.id === conditionId ? { ...c, [field]: value } : c
      )
    }));
  };

  // Adicionar ação
  const addAction = (actionType) => {
    setAutomationData(prev => ({
      ...prev,
      actions: [
        ...prev.actions,
        {
          id: Date.now(),
          type: actionType.id,
          name: actionType.name,
          config: { ...actionType.config }
        }
      ]
    }));
  };

  // Remover ação
  const removeAction = (actionId) => {
    setAutomationData(prev => ({
      ...prev,
      actions: prev.actions.filter(a => a.id !== actionId)
    }));
  };

  // Atualizar ação
  const updateAction = (actionId, field, value) => {
    setAutomationData(prev => ({
      ...prev,
      actions: prev.actions.map(a =>
        a.id === actionId 
          ? { ...a, config: { ...a.config, [field]: value } }
          : a
      )
    }));
  };

  // Salvar automação
  const handleSave = () => {
    if (!automationData.name || !automationData.trigger || automationData.actions.length === 0) {
      alert('Preencha nome, trigger e pelo menos uma ação');
      return;
    }

    onSave(automationData);
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {automation ? 'Editar Automação' : 'Nova Automação'}
          </h1>
          <p className="text-gray-600">
            Configure triggers, condições e ações para sua automação
          </p>
        </div>
        
        <div className="flex space-x-2">
          <Button variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" />
            Salvar
          </Button>
        </div>
      </div>

      {/* Basic Info */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Informações Básicas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nome da Automação
            </label>
            <Input
              value={automationData.name}
              onChange={(e) => setAutomationData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Ex: Notificar vendas importantes"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descrição
            </label>
            <Input
              value={automationData.description}
              onChange={(e) => setAutomationData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Descreva o que esta automação faz"
            />
          </div>
          
          <div className="flex space-x-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={automationData.quantum_enhanced}
                onChange={(e) => setAutomationData(prev => ({ ...prev, quantum_enhanced: e.target.checked }))}
              />
              <span className="text-sm">Otimização Quântica</span>
              <Sparkles className="w-4 h-4 text-purple-600" />
            </label>
            
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={automationData.mila_assisted}
                onChange={(e) => setAutomationData(prev => ({ ...prev, mila_assisted: e.target.checked }))}
              />
              <span className="text-sm">Assistência MILA</span>
              <Brain className="w-4 h-4 text-blue-600" />
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Steps */}
      <Tabs value={activeStep} onValueChange={setActiveStep} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="trigger">1. Trigger</TabsTrigger>
          <TabsTrigger value="conditions">2. Condições</TabsTrigger>
          <TabsTrigger value="actions">3. Ações</TabsTrigger>
          <TabsTrigger value="review">4. Revisão</TabsTrigger>
        </TabsList>

        {/* Step 1: Trigger */}
        <TabsContent value="trigger" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Selecionar Trigger</CardTitle>
              <p className="text-sm text-gray-600">
                Escolha o evento que irá disparar esta automação
              </p>
            </CardHeader>
            <CardContent>
              {automationData.trigger ? (
                <div className="p-4 border rounded-lg bg-blue-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {React.createElement(TRIGGER_TYPES[automationData.trigger.type.toUpperCase()]?.icon || Zap, {
                        className: "w-5 h-5 text-blue-600"
                      })}
                      <span className="font-medium">{automationData.trigger.name}</span>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setAutomationData(prev => ({ ...prev, trigger: null }))}
                    >
                      Alterar
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.values(TRIGGER_TYPES).map((trigger) => {
                    const IconComponent = trigger.icon;
                    
                    return (
                      <div
                        key={trigger.id}
                        onClick={() => addTrigger(trigger)}
                        className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center space-x-3 mb-2">
                          <IconComponent className="w-5 h-5 text-blue-600" />
                          <span className="font-medium">{trigger.name}</span>
                        </div>
                        <p className="text-sm text-gray-600">{trigger.description}</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Step 2: Conditions */}
        <TabsContent value="conditions" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Condições</CardTitle>
                  <p className="text-sm text-gray-600">
                    Defina quando a automação deve ser executada (opcional)
                  </p>
                </div>
                <Button onClick={addCondition}>
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Condição
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {automationData.conditions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Target className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p>Nenhuma condição definida</p>
                  <p className="text-sm">A automação será executada sempre que o trigger for ativado</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {automationData.conditions.map((condition, index) => (
                    <div key={condition.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                      {index > 0 && (
                        <span className="text-sm font-medium text-gray-500">E</span>
                      )}
                      
                      <Input
                        placeholder="Campo"
                        value={condition.field}
                        onChange={(e) => updateCondition(condition.id, 'field', e.target.value)}
                        className="flex-1"
                      />
                      
                      <select
                        value={condition.operator}
                        onChange={(e) => updateCondition(condition.id, 'operator', e.target.value)}
                        className="px-3 py-2 border rounded-md"
                      >
                        {Object.entries(CONDITION_OPERATORS).map(([key, value]) => (
                          <option key={key} value={value}>{value}</option>
                        ))}
                      </select>
                      
                      <Input
                        placeholder="Valor"
                        value={condition.value}
                        onChange={(e) => updateCondition(condition.id, 'value', e.target.value)}
                        className="flex-1"
                      />
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => removeCondition(condition.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Step 3: Actions */}
        <TabsContent value="actions" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Ações</CardTitle>
                  <p className="text-sm text-gray-600">
                    Defina o que acontece quando a automação é executada
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Actions List */}
              {automationData.actions.length > 0 && (
                <div className="space-y-4 mb-6">
                  {automationData.actions.map((action, index) => {
                    const actionType = Object.values(ACTION_TYPES).find(a => a.id === action.type);
                    const IconComponent = actionType?.icon || Zap;
                    
                    return (
                      <div key={action.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                            <IconComponent className="w-5 h-5 text-blue-600" />
                            <span className="font-medium">{action.name}</span>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => removeAction(action.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        
                        {/* Action Config */}
                        <div className="grid grid-cols-2 gap-4">
                          {Object.entries(action.config).map(([key, value]) => (
                            <div key={key}>
                              <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                                {key.replace('_', ' ')}
                              </label>
                              <Input
                                value={value}
                                onChange={(e) => updateAction(action.id, key, e.target.value)}
                                placeholder={`Digite ${key.replace('_', ' ')}`}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              
              {/* Add Action */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.values(ACTION_TYPES).map((actionType) => {
                  const IconComponent = actionType.icon;
                  
                  return (
                    <div
                      key={actionType.id}
                      onClick={() => addAction(actionType)}
                      className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center space-x-3 mb-2">
                        <IconComponent className="w-5 h-5 text-green-600" />
                        <span className="font-medium">{actionType.name}</span>
                      </div>
                      <p className="text-sm text-gray-600">{actionType.description}</p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Step 4: Review */}
        <TabsContent value="review" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Revisão da Automação</CardTitle>
              <p className="text-sm text-gray-600">
                Revise sua automação antes de salvar
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Basic Info */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Informações Básicas</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p><strong>Nome:</strong> {automationData.name}</p>
                    <p><strong>Descrição:</strong> {automationData.description}</p>
                    <div className="flex space-x-4 mt-2">
                      {automationData.quantum_enhanced && (
                        <Badge variant="secondary">
                          <Sparkles className="w-3 h-3 mr-1" />
                          Quântico
                        </Badge>
                      )}
                      {automationData.mila_assisted && (
                        <Badge variant="secondary">
                          <Brain className="w-3 h-3 mr-1" />
                          MILA
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                {/* Trigger */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Trigger</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    {automationData.trigger ? (
                      <p>{automationData.trigger.name}</p>
                    ) : (
                      <p className="text-red-600">Nenhum trigger selecionado</p>
                    )}
                  </div>
                </div>

                {/* Conditions */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Condições</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    {automationData.conditions.length === 0 ? (
                      <p>Nenhuma condição definida</p>
                    ) : (
                      <ul className="space-y-1">
                        {automationData.conditions.map((condition, index) => (
                          <li key={condition.id}>
                            {index > 0 && 'E '}
                            {condition.field} {condition.operator} {condition.value}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Ações</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    {automationData.actions.length === 0 ? (
                      <p className="text-red-600">Nenhuma ação definida</p>
                    ) : (
                      <ol className="space-y-1">
                        {automationData.actions.map((action, index) => (
                          <li key={action.id}>
                            {index + 1}. {action.name}
                          </li>
                        ))}
                      </ol>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
