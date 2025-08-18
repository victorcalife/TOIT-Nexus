/**
 * PÁGINA DE SUPORTE E MANUTENÇÃO
 * Sistema completo de suporte ao usuário e manutenção contínua
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
  Headphones,
  MessageSquare,
  Phone,
  Mail,
  HelpCircle,
  FileText,
  Video,
  Book,
  Search,
  Settings,
  Wrench,
  Activity,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Users,
  BarChart3,
  TrendingUp,
  Calendar,
  Download,
  Upload,
  RefreshCw,
  Play,
  Pause,
  Square,
  Eye,
  Edit,
  Trash2,
  Plus,
  Filter,
  Star,
  ThumbsUp,
  ThumbsDown,
  Send,
  Paperclip
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/use-toast';

const TICKET_STATUS = {
  OPEN: 'open',
  IN_PROGRESS: 'in_progress',
  WAITING_CUSTOMER: 'waiting_customer',
  RESOLVED: 'resolved',
  CLOSED: 'closed'
};

const TICKET_PRIORITY = {
  LOW: 'low',
  NORMAL: 'normal',
  HIGH: 'high',
  URGENT: 'urgent'
};

const STATUS_COLORS = {
  open: 'bg-red-100 text-red-800',
  in_progress: 'bg-blue-100 text-blue-800',
  waiting_customer: 'bg-yellow-100 text-yellow-800',
  resolved: 'bg-green-100 text-green-800',
  closed: 'bg-gray-100 text-gray-800'
};

const PRIORITY_COLORS = {
  low: 'bg-gray-100 text-gray-800',
  normal: 'bg-blue-100 text-blue-800',
  high: 'bg-orange-100 text-orange-800',
  urgent: 'bg-red-100 text-red-800'
};

const SUPPORT_CHANNELS = [
  {
    id: 'chat',
    name: 'Chat ao Vivo',
    icon: MessageSquare,
    description: 'Suporte instantâneo via chat',
    availability: '24/7',
    responseTime: '< 2 min',
    active: true
  },
  {
    id: 'email',
    name: 'Email',
    icon: Mail,
    description: 'Suporte via email',
    availability: '24/7',
    responseTime: '< 4 horas',
    active: true
  },
  {
    id: 'phone',
    name: 'Telefone',
    icon: Phone,
    description: 'Suporte telefônico',
    availability: '8h-18h',
    responseTime: 'Imediato',
    active: true
  },
  {
    id: 'video',
    name: 'Videochamada',
    icon: Video,
    description: 'Suporte via videochamada',
    availability: '8h-18h',
    responseTime: 'Agendado',
    active: true
  }
];

const KNOWLEDGE_BASE = [
  {
    id: 'getting_started',
    title: 'Primeiros Passos',
    description: 'Como começar a usar o TOIT Nexus',
    category: 'Básico',
    views: 1250,
    rating: 4.8,
    lastUpdated: '2025-01-18'
  },
  {
    id: 'quantum_guide',
    title: 'Guia do Sistema Quântico',
    description: 'Como usar os algoritmos quânticos',
    category: 'Avançado',
    views: 890,
    rating: 4.9,
    lastUpdated: '2025-01-17'
  },
  {
    id: 'integrations',
    title: 'Configurando Integrações',
    description: 'Como conectar ferramentas externas',
    category: 'Configuração',
    views: 650,
    rating: 4.7,
    lastUpdated: '2025-01-16'
  },
  {
    id: 'troubleshooting',
    title: 'Solução de Problemas',
    description: 'Problemas comuns e soluções',
    category: 'Suporte',
    views: 2100,
    rating: 4.6,
    lastUpdated: '2025-01-15'
  }
];

export default function SupportMaintenancePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [newTicketForm, setNewTicketForm] = useState({
    title: '',
    description: '',
    priority: 'normal',
    category: 'general'
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [chatMessage, setChatMessage] = useState('');

  // Query para tickets de suporte
  const { data: ticketsData, isLoading } = useQuery({
    queryKey: ['support-tickets'],
    queryFn: async () => {
      const response = await fetch('/api/support/tickets', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao carregar tickets de suporte');
      }

      return response.json();
    },
    enabled: !!user
  });

  // Query para estatísticas de suporte
  const { data: supportStatsData } = useQuery({
    queryKey: ['support-stats'],
    queryFn: async () => {
      const response = await fetch('/api/support/stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao carregar estatísticas de suporte');
      }

      return response.json();
    },
    enabled: !!user
  });

  // Query para status de manutenção
  const { data: maintenanceData } = useQuery({
    queryKey: ['maintenance-status'],
    queryFn: async () => {
      const response = await fetch('/api/maintenance/status', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao carregar status de manutenção');
      }

      return response.json();
    },
    enabled: !!user,
    refetchInterval: 60000
  });

  // Mutation para criar ticket
  const createTicketMutation = useMutation({
    mutationFn: async (ticketData) => {
      const response = await fetch('/api/support/tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify(ticketData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao criar ticket');
      }

      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: 'Ticket criado',
        description: `Ticket #${data.ticketId} criado com sucesso.`
      });
      setNewTicketForm({ title: '', description: '', priority: 'normal', category: 'general' });
      queryClient.invalidateQueries(['support-tickets']);
    },
    onError: (error) => {
      toast({
        title: 'Erro ao criar ticket',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  // Mutation para iniciar chat
  const startChatMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/support/chat/start', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao iniciar chat');
      }

      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: 'Chat iniciado',
        description: 'Conectando com um agente de suporte...'
      });
    }
  });

  const tickets = ticketsData?.data?.tickets || [];
  const supportStats = supportStatsData?.data || {};
  const maintenanceStatus = maintenanceData?.data || {};

  const getStatusIcon = (status) => {
    switch (status) {
      case 'open': return <XCircle className="w-4 h-4 text-red-600" />;
      case 'in_progress': return <RefreshCw className="w-4 h-4 text-blue-600" />;
      case 'waiting_customer': return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'resolved': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'closed': return <CheckCircle className="w-4 h-4 text-gray-600" />;
      default: return <HelpCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  const filteredKnowledgeBase = KNOWLEDGE_BASE.filter(article =>
    article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    article.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            <Headphones className="w-8 h-8 mr-3 text-blue-600" />
            Suporte & Manutenção
          </h1>
          <p className="text-gray-600">
            Central de suporte e sistema de manutenção contínua
          </p>
        </div>
        
        <div className="flex space-x-2">
          <Button
            onClick={() => startChatMutation.mutate()}
            disabled={startChatMutation.isLoading}
            className="flex items-center space-x-2"
          >
            {startChatMutation.isLoading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <MessageSquare className="w-4 h-4" />
            )}
            <span>Chat ao Vivo</span>
          </Button>
          
          <Button variant="outline" className="flex items-center space-x-2">
            <Phone className="w-4 h-4" />
            <span>Ligar</span>
          </Button>
        </div>
      </div>

      {/* Support Channels */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {SUPPORT_CHANNELS.map(channel => {
          const Icon = channel.icon;
          
          return (
            <Card key={channel.id} className="cursor-pointer transition-all hover:shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <Icon className="w-8 h-8 text-blue-600" />
                  <Badge className={channel.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                    {channel.active ? 'Disponível' : 'Indisponível'}
                  </Badge>
                </div>
                
                <h3 className="font-semibold text-lg mb-2">{channel.name}</h3>
                <p className="text-sm text-gray-600 mb-4">{channel.description}</p>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Disponibilidade:</span>
                    <span className="font-medium">{channel.availability}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tempo de Resposta:</span>
                    <span className="font-medium">{channel.responseTime}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* System Status */}
      <Card className={`mb-8 border-2 ${
        maintenanceStatus.status === 'operational' ? 'border-green-200 bg-green-50' :
        maintenanceStatus.status === 'maintenance' ? 'border-yellow-200 bg-yellow-50' :
        'border-red-200 bg-red-50'
      }`}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={`p-4 rounded-full ${
                maintenanceStatus.status === 'operational' ? 'bg-green-100' :
                maintenanceStatus.status === 'maintenance' ? 'bg-yellow-100' : 'bg-red-100'
              }`}>
                <Activity className={`w-8 h-8 ${
                  maintenanceStatus.status === 'operational' ? 'text-green-600' :
                  maintenanceStatus.status === 'maintenance' ? 'text-yellow-600' : 'text-red-600'
                }`} />
              </div>
              <div>
                <h3 className="text-2xl font-bold">
                  Status do Sistema: {
                    maintenanceStatus.status === 'operational' ? 'Operacional' :
                    maintenanceStatus.status === 'maintenance' ? 'Manutenção' : 'Problema'
                  }
                </h3>
                <p className={`${
                  maintenanceStatus.status === 'operational' ? 'text-green-700' :
                  maintenanceStatus.status === 'maintenance' ? 'text-yellow-700' : 'text-red-700'
                }`}>
                  {maintenanceStatus.message || 'Todos os sistemas funcionando normalmente'}
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-sm text-gray-600">Uptime</p>
                <p className="text-lg font-bold text-green-600">
                  {((maintenanceStatus.uptime || 0.999) * 100).toFixed(2)}%
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Tickets Abertos</p>
                <p className="text-lg font-bold text-blue-600">
                  {supportStats.openTickets || 0}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Tempo Médio</p>
                <p className="text-lg font-bold text-purple-600">
                  {supportStats.avgResponseTime || '2h'}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="tickets">Tickets</TabsTrigger>
          <TabsTrigger value="knowledge">Base de Conhecimento</TabsTrigger>
          <TabsTrigger value="maintenance">Manutenção</TabsTrigger>
          <TabsTrigger value="feedback">Feedback</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Estatísticas de Suporte</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Tickets Hoje</span>
                    <span className="font-medium">{supportStats.ticketsToday || 12}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Tickets Esta Semana</span>
                    <span className="font-medium">{supportStats.ticketsThisWeek || 85}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Taxa de Resolução</span>
                    <span className="font-medium">{supportStats.resolutionRate || 94}%</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Satisfação do Cliente</span>
                    <span className="font-medium">{supportStats.customerSatisfaction || 4.8}/5</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Tempo Médio de Resposta</span>
                    <span className="font-medium">{supportStats.avgResponseTime || '2h 15m'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Artigos Mais Acessados</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {KNOWLEDGE_BASE.slice(0, 4).map(article => (
                    <div key={article.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium">{article.title}</h4>
                        <p className="text-sm text-gray-600">{article.views} visualizações</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center">
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          <span className="text-sm ml-1">{article.rating}</span>
                        </div>
                        <Button size="sm" variant="outline">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tickets" className="mt-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold">Meus Tickets</h3>
            <Button className="flex items-center space-x-2">
              <Plus className="w-4 h-4" />
              <span>Novo Ticket</span>
            </Button>
          </div>

          {/* New Ticket Form */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Criar Novo Ticket</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Título</label>
                    <Input
                      value={newTicketForm.title}
                      onChange={(e) => setNewTicketForm(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Descreva brevemente o problema"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Prioridade</label>
                    <select
                      value={newTicketForm.priority}
                      onChange={(e) => setNewTicketForm(prev => ({ ...prev, priority: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="low">Baixa</option>
                      <option value="normal">Normal</option>
                      <option value="high">Alta</option>
                      <option value="urgent">Urgente</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Descrição</label>
                  <textarea
                    value={newTicketForm.description}
                    onChange={(e) => setNewTicketForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Descreva o problema em detalhes..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md h-32"
                  />
                </div>
                
                <Button
                  onClick={() => createTicketMutation.mutate(newTicketForm)}
                  disabled={createTicketMutation.isLoading || !newTicketForm.title || !newTicketForm.description}
                  className="flex items-center space-x-2"
                >
                  {createTicketMutation.isLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  <span>Criar Ticket</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Tickets List */}
          <div className="space-y-4">
            {tickets.map(ticket => (
              <Card key={ticket.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        {getStatusIcon(ticket.status)}
                        <h4 className="font-semibold">#{ticket.id} - {ticket.title}</h4>
                        <Badge className={PRIORITY_COLORS[ticket.priority]}>
                          {ticket.priority}
                        </Badge>
                      </div>
                      
                      <p className="text-gray-600 mb-3">{ticket.description}</p>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>Criado: {new Date(ticket.created_at).toLocaleDateString('pt-BR')}</span>
                        <span>Categoria: {ticket.category}</span>
                        {ticket.assigned_to && (
                          <span>Responsável: {ticket.assigned_to}</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Badge className={STATUS_COLORS[ticket.status]}>
                        {ticket.status.replace('_', ' ')}
                      </Badge>
                      
                      <Button size="sm" variant="outline">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {tickets.length === 0 && (
              <Card>
                <CardContent className="text-center py-12">
                  <Headphones className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Nenhum ticket encontrado
                  </h3>
                  <p className="text-gray-600">
                    Você não possui tickets de suporte no momento
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="knowledge" className="mt-6">
          <div className="flex justify-between items-center mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar na base de conhecimento..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-96"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredKnowledgeBase.map(article => (
              <Card key={article.id} className="cursor-pointer transition-all hover:shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-2">{article.title}</h3>
                      <p className="text-gray-600 mb-3">{article.description}</p>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>Categoria: {article.category}</span>
                        <span>{article.views} visualizações</span>
                        <span>Atualizado: {new Date(article.lastUpdated).toLocaleDateString('pt-BR')}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span className="text-sm ml-1">{article.rating}</span>
                      </div>
                      <Button size="sm" variant="outline">
                        <Book className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="maintenance" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Status dos Serviços</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="font-medium">API Principal</span>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Operacional</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="font-medium">Banco de Dados</span>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Operacional</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="font-medium">Sistema Quântico</span>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Operacional</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="font-medium">Chat e Notificações</span>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Operacional</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Próximas Manutenções</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 border rounded-lg">
                    <h4 className="font-medium">Atualização de Segurança</h4>
                    <p className="text-sm text-gray-600">Patches de segurança e melhorias</p>
                    <p className="text-sm text-blue-600 mt-1">Agendado: 20/01/2025, 02:00-04:00</p>
                  </div>
                  
                  <div className="p-3 border rounded-lg">
                    <h4 className="font-medium">Otimização do Banco</h4>
                    <p className="text-sm text-gray-600">Manutenção preventiva do banco de dados</p>
                    <p className="text-sm text-blue-600 mt-1">Agendado: 25/01/2025, 01:00-03:00</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="feedback" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Enviar Feedback</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Tipo de Feedback</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md">
                    <option>Sugestão de Melhoria</option>
                    <option>Reportar Bug</option>
                    <option>Elogio</option>
                    <option>Reclamação</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Sua Mensagem</label>
                  <textarea
                    placeholder="Compartilhe sua experiência conosco..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md h-32"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Avaliação Geral</label>
                  <div className="flex space-x-2">
                    {[1, 2, 3, 4, 5].map(rating => (
                      <Star key={rating} className="w-6 h-6 text-yellow-500 cursor-pointer hover:fill-current" />
                    ))}
                  </div>
                </div>
                
                <Button className="flex items-center space-x-2">
                  <Send className="w-4 h-4" />
                  <span>Enviar Feedback</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
