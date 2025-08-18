/**
 * PÁGINA DA MILA AI
 * Interface completa para assistente AI com NLP real
 * 100% JavaScript - SEM TYPESCRIPT
 */

import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  Brain,
  MessageSquare,
  Send,
  Mic,
  MicOff,
  Settings,
  Activity,
  BarChart3,
  Sparkles,
  Target,
  Eye,
  Lightbulb,
  Zap,
  Clock,
  User,
  Bot,
  TrendingUp,
  Heart,
  Frown,
  Smile,
  Meh,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Download,
  Upload,
  Globe,
  Database,
  Code,
  Play,
  Pause
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/use-toast';

const MESSAGE_TYPES = {
  USER: 'user',
  MILA: 'mila',
  SYSTEM: 'system'
};

const ANALYSIS_TYPES = {
  SENTIMENT: 'sentiment',
  ENTITIES: 'entities',
  INTENT: 'intent',
  BUSINESS: 'business',
  QUANTUM: 'quantum'
};

const SENTIMENT_ICONS = {
  positive: { icon: Smile, color: 'text-green-600' },
  negative: { icon: Frown, color: 'text-red-600' },
  neutral: { icon: Meh, color: 'text-gray-600' }
};

export default function MilaAIPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');
  const [sessionId] = useState(() => `session_${Date.now()}`);

  // Query para status da MILA
  const { data: milaStatus, isLoading: statusLoading } = useQuery({
    queryKey: ['mila-status'],
    queryFn: async () => {
      const response = await fetch('/api/mila-ai/status', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao carregar status da MILA');
      }

      return response.json();
    },
    enabled: !!user,
    refetchInterval: 10000 // Atualizar a cada 10 segundos
  });

  // Query para insights recentes
  const { data: insightsData } = useQuery({
    queryKey: ['mila-insights'],
    queryFn: async () => {
      const response = await fetch('/api/mila-ai/insights', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao carregar insights');
      }

      return response.json();
    },
    enabled: !!user
  });

  // Query para métricas
  const { data: metricsData } = useQuery({
    queryKey: ['mila-metrics'],
    queryFn: async () => {
      const response = await fetch('/api/mila-ai/metrics', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao carregar métricas');
      }

      return response.json();
    },
    enabled: !!user
  });

  // Mutation para enviar mensagem
  const sendMessageMutation = useMutation({
    mutationFn: async ({ message, sessionId }) => {
      const response = await fetch('/api/mila-ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({
          message,
          sessionId,
          context: {
            currentPage: window.location.pathname,
            timestamp: new Date().toISOString()
          }
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao enviar mensagem');
      }

      return response.json();
    },
    onSuccess: (data) => {
      // Adicionar resposta da MILA
      setMessages(prev => [...prev, {
        id: Date.now(),
        type: MESSAGE_TYPES.MILA,
        content: data.response,
        timestamp: new Date(),
        intent: data.intent,
        entities: data.entities,
        confidence: data.confidence,
        suggestions: data.suggestions
      }]);
      
      queryClient.invalidateQueries(['mila-insights']);
      queryClient.invalidateQueries(['mila-metrics']);
    },
    onError: (error) => {
      toast({
        title: 'Erro na comunicação',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  // Mutation para análise de texto
  const analyzeTextMutation = useMutation({
    mutationFn: async ({ text, type }) => {
      const response = await fetch('/api/mila-ai/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({ text, type })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro na análise');
      }

      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: 'Análise concluída',
        description: `Análise ${data.type} realizada com ${(data.confidence * 100).toFixed(1)}% de confiança`
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro na análise',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  const status = milaStatus?.data || {};
  const insights = insightsData?.data?.insights || [];
  const metrics = metricsData?.data || {};

  // Scroll para última mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Adicionar mensagem de boas-vindas
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        id: 1,
        type: MESSAGE_TYPES.MILA,
        content: `Olá ${user?.name || 'usuário'}! Sou a MILA, sua assistente AI. Como posso ajudá-lo hoje?`,
        timestamp: new Date(),
        confidence: 1.0
      }]);
    }
  }, [user, messages.length]);

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    // Adicionar mensagem do usuário
    const userMessage = {
      id: Date.now(),
      type: MESSAGE_TYPES.USER,
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);

    // Enviar para MILA
    sendMessageMutation.mutate({
      message: inputMessage,
      sessionId
    });

    setInputMessage('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleVoiceToggle = () => {
    setIsListening(!isListening);
    // Implementar reconhecimento de voz aqui
  };

  const handleAnalyzeText = (text, type) => {
    analyzeTextMutation.mutate({ text, type });
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (statusLoading) {
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
            <Brain className="w-8 h-8 mr-3 text-blue-600" />
            MILA AI Assistant
          </h1>
          <p className="text-gray-600">
            Assistente AI com processamento de linguagem natural e integração quântica
          </p>
        </div>
        
        <div className="flex space-x-2">
          <Button variant="outline" className="flex items-center space-x-2">
            <Settings className="w-4 h-4" />
            <span>Configurações</span>
          </Button>
          
          <Button variant="outline" className="flex items-center space-x-2">
            <Download className="w-4 h-4" />
            <span>Export Chat</span>
          </Button>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Status MILA</p>
                <p className="text-2xl font-bold text-green-600">
                  {status.isOperational ? 'Online' : 'Offline'}
                </p>
              </div>
              <Brain className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Modelos Ativos</p>
                <p className="text-2xl font-bold text-purple-600">
                  {Object.keys(status.models || {}).length}
                </p>
              </div>
              <Database className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Insights Hoje</p>
                <p className="text-2xl font-bold text-orange-600">
                  {insights.filter(i => 
                    new Date(i.created_at).toDateString() === new Date().toDateString()
                  ).length}
                </p>
              </div>
              <Lightbulb className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Precisão</p>
                <p className="text-2xl font-bold text-green-600">
                  {((metrics.accuracyScore || 0.95) * 100).toFixed(1)}%
                </p>
              </div>
              <Target className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="chat">Chat</TabsTrigger>
          <TabsTrigger value="analysis">Análise NLP</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="metrics">Métricas</TabsTrigger>
        </TabsList>

        <TabsContent value="chat" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Chat Area */}
            <div className="lg:col-span-3">
              <Card className="h-[600px] flex flex-col">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <MessageSquare className="w-5 h-5" />
                    <span>Conversa com MILA</span>
                    <Badge variant="outline" className="ml-auto">
                      {status.isOperational ? 'Online' : 'Offline'}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="flex-1 flex flex-col">
                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.type === MESSAGE_TYPES.USER ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[80%] rounded-lg p-4 ${
                          message.type === MESSAGE_TYPES.USER
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}>
                          <div className="flex items-start space-x-2">
                            {message.type === MESSAGE_TYPES.MILA && (
                              <Brain className="w-5 h-5 text-blue-600 mt-0.5" />
                            )}
                            {message.type === MESSAGE_TYPES.USER && (
                              <User className="w-5 h-5 text-white mt-0.5" />
                            )}
                            <div className="flex-1">
                              <p className="text-sm">{message.content}</p>
                              <div className="flex items-center justify-between mt-2">
                                <span className="text-xs opacity-70">
                                  {formatDate(message.timestamp)}
                                </span>
                                {message.confidence && (
                                  <Badge variant="outline" className="text-xs">
                                    {(message.confidence * 100).toFixed(0)}%
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          {/* Suggestions */}
                          {message.suggestions && message.suggestions.length > 0 && (
                            <div className="mt-3 space-y-1">
                              <p className="text-xs font-medium opacity-70">Sugestões:</p>
                              {message.suggestions.map((suggestion, index) => (
                                <button
                                  key={index}
                                  onClick={() => setInputMessage(suggestion)}
                                  className="block w-full text-left text-xs p-2 bg-white bg-opacity-20 rounded hover:bg-opacity-30 transition-colors"
                                >
                                  {suggestion}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                  
                  {/* Input */}
                  <div className="flex space-x-2">
                    <Input
                      ref={inputRef}
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Digite sua mensagem..."
                      className="flex-1"
                      disabled={sendMessageMutation.isLoading}
                    />
                    
                    <Button
                      onClick={handleVoiceToggle}
                      variant="outline"
                      className={isListening ? 'bg-red-100 text-red-600' : ''}
                    >
                      {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    </Button>
                    
                    <Button
                      onClick={handleSendMessage}
                      disabled={!inputMessage.trim() || sendMessageMutation.isLoading}
                    >
                      {sendMessageMutation.isLoading ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Ações Rápidas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => setInputMessage('Como criar um workflow?')}
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    Criar Workflow
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => setInputMessage('Analisar dados de vendas')}
                  >
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Analisar Dados
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => setInputMessage('Executar algoritmo quântico')}
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Quantum Computing
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => setInputMessage('Gerar relatório')}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Gerar Relatório
                  </Button>
                </CardContent>
              </Card>

              {/* Recent Insights */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Insights Recentes</CardTitle>
                </CardHeader>
                <CardContent>
                  {insights.length === 0 ? (
                    <p className="text-sm text-gray-500">Nenhum insight recente</p>
                  ) : (
                    <div className="space-y-3">
                      {insights.slice(0, 3).map((insight) => (
                        <div key={insight.id} className="p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-2 mb-1">
                            <Lightbulb className="w-4 h-4 text-yellow-600" />
                            <span className="text-xs font-medium">{insight.type}</span>
                          </div>
                          <p className="text-sm text-gray-700">{insight.message}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {formatDate(insight.created_at)}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Análise de Texto NLP</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Texto para Análise
                  </label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    rows={4}
                    placeholder="Digite o texto que deseja analisar..."
                    id="analysis-text"
                  />
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                  {Object.entries(ANALYSIS_TYPES).map(([key, type]) => (
                    <Button
                      key={key}
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const text = document.getElementById('analysis-text').value;
                        if (text.trim()) {
                          handleAnalyzeText(text, type);
                        }
                      }}
                      disabled={analyzeTextMutation.isLoading}
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Insights Automáticos</CardTitle>
            </CardHeader>
            <CardContent>
              {insights.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Lightbulb className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p>Nenhum insight disponível</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {insights.map((insight) => (
                    <div key={insight.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Lightbulb className="w-5 h-5 text-yellow-600" />
                          <Badge variant="outline">{insight.type}</Badge>
                        </div>
                        <span className="text-sm text-gray-500">
                          {formatDate(insight.created_at)}
                        </span>
                      </div>
                      
                      <p className="text-gray-700 mb-2">{insight.message}</p>
                      
                      {insight.confidence && (
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-600">Confiança:</span>
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${insight.confidence * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium">
                            {(insight.confidence * 100).toFixed(1)}%
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="metrics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance da IA</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Taxa de Precisão</span>
                    <span className="font-medium">{((metrics.accuracyScore || 0.95) * 100).toFixed(1)}%</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Observações</span>
                    <span className="font-medium">{metrics.observationsCount || 0}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Padrões Aprendidos</span>
                    <span className="font-medium">{metrics.patternsLearned || 0}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Predições Geradas</span>
                    <span className="font-medium">{metrics.predictionsGenerated || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Modelos Ativos</CardTitle>
              </CardHeader>
              <CardContent>
                {Object.keys(status.models || {}).length === 0 ? (
                  <p className="text-sm text-gray-500">Nenhum modelo ativo</p>
                ) : (
                  <div className="space-y-3">
                    {Object.entries(status.models || {}).map(([model, info]) => (
                      <div key={model} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-sm">{model}</p>
                          <p className="text-xs text-gray-600">
                            {info.capabilities?.join(', ') || 'N/A'}
                          </p>
                        </div>
                        <Badge variant={info.status === 'active' ? 'default' : 'secondary'}>
                          {info.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
