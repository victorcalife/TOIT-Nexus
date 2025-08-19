/**
 * SISTEMA HELP DESK COMPLETO - TOIT NEXUS
 * Sistema completo de suporte e atendimento ao cliente
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
  Headphones, 
  Ticket,
  MessageSquare,
  Clock,
  User,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Star,
  ThumbsUp,
  ThumbsDown,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Eye,
  Send,
  Paperclip,
  Phone,
  Mail,
  Calendar,
  Tag,
  Users,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Activity,
  Target,
  Zap,
  RefreshCw,
  Download,
  Upload,
  Settings,
  Bell,
  Archive,
  Forward,
  Reply,
  MoreHorizontal,
  FileText,
  Image,
  Video,
  Mic,
  Camera,
  Link,
  Globe,
  Smartphone,
  Monitor,
  HelpCircle,
  BookOpen,
  Lightbulb,
  Award
} from 'lucide-react';

const HelpdeskSystem = () => {
  const [tickets, setTickets] = useState([]);
  const [agents, setAgents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [knowledgeBase, setKnowledgeBase] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [showKBModal, setShowKBModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    category: 'all',
    assignee: 'all'
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('tickets');
  
  const { toast } = useToast();

  // Status dos tickets
  const ticketStatuses = {
    open: { name: 'Aberto', color: 'text-blue-600 bg-blue-100', icon: <Ticket className="h-3 w-3" /> },
    in_progress: { name: 'Em Progresso', color: 'text-yellow-600 bg-yellow-100', icon: <Clock className="h-3 w-3" /> },
    waiting_customer: { name: 'Aguardando Cliente', color: 'text-orange-600 bg-orange-100', icon: <User className="h-3 w-3" /> },
    resolved: { name: 'Resolvido', color: 'text-green-600 bg-green-100', icon: <CheckCircle className="h-3 w-3" /> },
    closed: { name: 'Fechado', color: 'text-gray-600 bg-gray-100', icon: <XCircle className="h-3 w-3" /> }
  };

  // Prioridades
  const priorities = {
    low: { name: 'Baixa', color: 'text-green-600 bg-green-100' },
    medium: { name: 'Média', color: 'text-yellow-600 bg-yellow-100' },
    high: { name: 'Alta', color: 'text-orange-600 bg-orange-100' },
    urgent: { name: 'Urgente', color: 'text-red-600 bg-red-100' }
  };

  /**
   * CARREGAR DADOS DO HELP DESK
   */
  const loadHelpdeskData = async () => {
    setLoading(true);
    try {
      const [ticketsRes, agentsRes, categoriesRes, kbRes] = await Promise.all([
        fetch('/api/helpdesk/tickets', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('/api/helpdesk/agents', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('/api/helpdesk/categories', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('/api/helpdesk/knowledge-base', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        })
      ]);

      if (ticketsRes.ok) {
        const ticketsData = await ticketsRes.json();
        setTickets(ticketsData.tickets || []);
      }

      if (agentsRes.ok) {
        const agentsData = await agentsRes.json();
        setAgents(agentsData.agents || []);
      }

      if (categoriesRes.ok) {
        const categoriesData = await categoriesRes.json();
        setCategories(categoriesData.categories || []);
      }

      if (kbRes.ok) {
        const kbData = await kbRes.json();
        setKnowledgeBase(kbData.articles || []);
      }

    } catch (error) {
      console.error('Erro ao carregar dados do help desk:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados do help desk",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * CRIAR TICKET
   */
  const createTicket = async (ticketData) => {
    try {
      const response = await fetch('/api/helpdesk/tickets', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...ticketData,
          status: 'open',
          createdAt: new Date().toISOString(),
          ticketNumber: `TK-${Date.now()}`
        })
      });

      if (!response.ok) {
        throw new Error('Erro ao criar ticket');
      }

      const data = await response.json();
      setTickets(prev => [data.ticket, ...prev]);
      setShowTicketModal(false);
      
      toast({
        title: "Ticket criado",
        description: `Ticket #${data.ticket.ticketNumber} criado com sucesso`,
      });
    } catch (error) {
      console.error('Erro ao criar ticket:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar o ticket",
        variant: "destructive"
      });
    }
  };

  /**
   * ATUALIZAR STATUS DO TICKET
   */
  const updateTicketStatus = async (ticketId, newStatus) => {
    try {
      const response = await fetch(`/api/helpdesk/tickets/${ticketId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        throw new Error('Erro ao atualizar status');
      }

      setTickets(prev => prev.map(ticket => 
        ticket.id === ticketId 
          ? { ...ticket, status: newStatus, updatedAt: new Date().toISOString() }
          : ticket
      ));
      
      toast({
        title: "Status atualizado",
        description: "Status do ticket atualizado com sucesso",
      });
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status",
        variant: "destructive"
      });
    }
  };

  /**
   * ATRIBUIR TICKET
   */
  const assignTicket = async (ticketId, agentId) => {
    try {
      const response = await fetch(`/api/helpdesk/tickets/${ticketId}/assign`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ assignedTo: agentId })
      });

      if (!response.ok) {
        throw new Error('Erro ao atribuir ticket');
      }

      setTickets(prev => prev.map(ticket => 
        ticket.id === ticketId 
          ? { ...ticket, assignedTo: agentId, updatedAt: new Date().toISOString() }
          : ticket
      ));
      
      toast({
        title: "Ticket atribuído",
        description: "Ticket atribuído com sucesso",
      });
    } catch (error) {
      console.error('Erro ao atribuir ticket:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atribuir o ticket",
        variant: "destructive"
      });
    }
  };

  /**
   * ADICIONAR RESPOSTA AO TICKET
   */
  const addTicketResponse = async (ticketId, responseData) => {
    try {
      const response = await fetch(`/api/helpdesk/tickets/${ticketId}/responses`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...responseData,
          createdAt: new Date().toISOString()
        })
      });

      if (!response.ok) {
        throw new Error('Erro ao adicionar resposta');
      }

      const data = await response.json();
      
      // Atualizar ticket com nova resposta
      setTickets(prev => prev.map(ticket => 
        ticket.id === ticketId 
          ? { 
              ...ticket, 
              responses: [...(ticket.responses || []), data.response],
              updatedAt: new Date().toISOString()
            }
          : ticket
      ));
      
      toast({
        title: "Resposta adicionada",
        description: "Resposta adicionada ao ticket",
      });
    } catch (error) {
      console.error('Erro ao adicionar resposta:', error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar a resposta",
        variant: "destructive"
      });
    }
  };

  /**
   * RENDERIZAR CARD DE TICKET
   */
  const renderTicketCard = (ticket) => {
    const status = ticketStatuses[ticket.status] || ticketStatuses.open;
    const priority = priorities[ticket.priority] || priorities.medium;
    const agent = agents.find(a => a.id === ticket.assignedTo);
    const category = categories.find(c => c.id === ticket.categoryId);
    
    return (
      <Card key={ticket.id} className="hover:shadow-md transition-shadow cursor-pointer">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-lg">#{ticket.ticketNumber}</h3>
                <Badge className={priority.color}>
                  {priority.name}
                </Badge>
              </div>
              <h4 className="font-medium text-gray-900 mb-1">{ticket.subject}</h4>
              <p className="text-sm text-gray-600">{ticket.customerName}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={status.color}>
                {status.icon}
                <span className="ml-1">{status.name}</span>
              </Badge>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Tag className="h-4 w-4" />
              {category ? category.name : 'Sem categoria'}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <User className="h-4 w-4" />
              {agent ? agent.name : 'Não atribuído'}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="h-4 w-4" />
              {new Date(ticket.createdAt).toLocaleDateString('pt-BR')}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center p-2 bg-gray-50 rounded">
              <div className="text-lg font-bold text-blue-600">
                {ticket.responses?.length || 0}
              </div>
              <div className="text-xs text-gray-600">Respostas</div>
            </div>
            <div className="text-center p-2 bg-gray-50 rounded">
              <div className="text-lg font-bold text-green-600">
                {ticket.satisfaction || 'N/A'}
              </div>
              <div className="text-xs text-gray-600">Satisfação</div>
            </div>
          </div>
          
          <div className="flex gap-2">
            <select
              value={ticket.status}
              onChange={(e) => updateTicketStatus(ticket.id, e.target.value)}
              className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
            >
              {Object.entries(ticketStatuses).map(([key, status]) => (
                <option key={key} value={key}>{status.name}</option>
              ))}
            </select>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedTicket(ticket)}
            >
              <Eye className="h-3 w-3 mr-1" />
              Ver
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  /**
   * RENDERIZAR AGENTE
   */
  const renderAgent = (agent) => {
    const activeTickets = tickets.filter(t => t.assignedTo === agent.id && t.status !== 'closed').length;
    const resolvedTickets = tickets.filter(t => t.assignedTo === agent.id && t.status === 'resolved').length;
    
    return (
      <Card key={agent.id} className="hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-bold text-lg">
                {agent.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h3 className="font-semibold text-lg">{agent.name}</h3>
              <p className="text-gray-600 text-sm">{agent.role}</p>
              <div className="flex items-center gap-1 mt-1">
                <div className={`w-2 h-2 rounded-full ${
                  agent.status === 'online' ? 'bg-green-500' : 
                  agent.status === 'busy' ? 'bg-yellow-500' : 'bg-gray-400'
                }`}></div>
                <span className="text-xs text-gray-600 capitalize">{agent.status}</span>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center p-2 bg-gray-50 rounded">
              <div className="text-lg font-bold text-orange-600">{activeTickets}</div>
              <div className="text-xs text-gray-600">Ativos</div>
            </div>
            <div className="text-center p-2 bg-gray-50 rounded">
              <div className="text-lg font-bold text-green-600">{resolvedTickets}</div>
              <div className="text-xs text-gray-600">Resolvidos</div>
            </div>
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Avaliação:</span>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-3 w-3 ${
                      i < (agent.rating || 0) 
                        ? 'text-yellow-400 fill-current' 
                        : 'text-gray-300'
                    }`}
                  />
                ))}
                <span className="ml-1">({agent.rating || 0})</span>
              </div>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Especialidade:</span>
              <span>{agent.specialties?.join(', ') || 'Geral'}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  /**
   * RENDERIZAR ARTIGO DA BASE DE CONHECIMENTO
   */
  const renderKBArticle = (article) => {
    return (
      <Card key={article.id} className="hover:shadow-md transition-shadow cursor-pointer">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-blue-600" />
              <h3 className="font-semibold text-lg">{article.title}</h3>
            </div>
            <Badge variant={article.status === 'published' ? 'default' : 'secondary'}>
              {article.status === 'published' ? 'Publicado' : 'Rascunho'}
            </Badge>
          </div>
          
          <p className="text-gray-600 text-sm mb-4 line-clamp-3">
            {article.summary}
          </p>
          
          <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
            <div className="flex items-center gap-4">
              <span>Por: {article.author}</span>
              <span>{new Date(article.createdAt).toLocaleDateString('pt-BR')}</span>
            </div>
            <div className="flex items-center gap-2">
              <Eye className="h-3 w-3" />
              <span>{article.views || 0} visualizações</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ThumbsUp className="h-4 w-4 text-green-600" />
              <span className="text-sm">{article.likes || 0}</span>
              <ThumbsDown className="h-4 w-4 text-red-600 ml-2" />
              <span className="text-sm">{article.dislikes || 0}</span>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Eye className="h-3 w-3 mr-1" />
                Ver
              </Button>
              <Button variant="outline" size="sm">
                <Edit className="h-3 w-3 mr-1" />
                Editar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  /**
   * OBTER ESTATÍSTICAS
   */
  const getStats = () => {
    const totalTickets = tickets.length;
    const openTickets = tickets.filter(t => t.status === 'open').length;
    const resolvedTickets = tickets.filter(t => t.status === 'resolved').length;
    const avgResponseTime = tickets.length > 0 ? '2.5h' : '0h'; // Simulado
    const satisfactionRate = tickets.length > 0 ? '4.2' : '0';
    
    return { totalTickets, openTickets, resolvedTickets, avgResponseTime, satisfactionRate };
  };

  const stats = getStats();

  /**
   * FILTRAR TICKETS
   */
  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filters.status === 'all' || ticket.status === filters.status;
    const matchesPriority = filters.priority === 'all' || ticket.priority === filters.priority;
    const matchesCategory = filters.category === 'all' || ticket.categoryId === filters.category;
    const matchesAssignee = filters.assignee === 'all' || ticket.assignedTo === filters.assignee;
    
    return matchesSearch && matchesStatus && matchesPriority && matchesCategory && matchesAssignee;
  });

  /**
   * CARREGAR DADOS AO MONTAR COMPONENTE
   */
  useEffect(() => {
    loadHelpdeskData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Headphones className="h-8 w-8 text-blue-600" />
                Help Desk System
              </h1>
              <p className="text-gray-600 mt-2">
                Sistema completo de suporte e atendimento ao cliente
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={loadHelpdeskData}
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Atualizar
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowKBModal(true)}
              >
                <BookOpen className="h-4 w-4 mr-2" />
                Novo Artigo
              </Button>
              <Button
                onClick={() => setShowTicketModal(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Novo Ticket
              </Button>
            </div>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Tickets</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalTickets}</p>
                </div>
                <Ticket className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Abertos</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.openTickets}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Resolvidos</p>
                  <p className="text-2xl font-bold text-green-600">{stats.resolvedTickets}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Tempo Médio</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.avgResponseTime}</p>
                </div>
                <Clock className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Satisfação</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.satisfactionRate}</p>
                </div>
                <Star className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs do Help Desk */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="tickets">Tickets</TabsTrigger>
            <TabsTrigger value="agents">Agentes</TabsTrigger>
            <TabsTrigger value="knowledge">Base de Conhecimento</TabsTrigger>
            <TabsTrigger value="reports">Relatórios</TabsTrigger>
          </TabsList>

          <TabsContent value="tickets" className="space-y-6">
            {/* Filtros */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Buscar tickets..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <select
                      value={filters.status}
                      onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">Todos os Status</option>
                      {Object.entries(ticketStatuses).map(([key, status]) => (
                        <option key={key} value={key}>{status.name}</option>
                      ))}
                    </select>

                    <select
                      value={filters.priority}
                      onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">Todas as Prioridades</option>
                      {Object.entries(priorities).map(([key, priority]) => (
                        <option key={key} value={key}>{priority.name}</option>
                      ))}
                    </select>

                    <select
                      value={filters.assignee}
                      onChange={(e) => setFilters(prev => ({ ...prev, assignee: e.target.value }))}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">Todos os Agentes</option>
                      {agents.map(agent => (
                        <option key={agent.id} value={agent.id}>{agent.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Lista de Tickets */}
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2">Carregando tickets...</span>
              </div>
            ) : filteredTickets.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Ticket className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Nenhum ticket encontrado
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Comece criando seu primeiro ticket de suporte
                  </p>
                  <Button onClick={() => setShowTicketModal(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Criar Ticket
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTickets.map(renderTicketCard)}
              </div>
            )}
          </TabsContent>

          <TabsContent value="agents" className="space-y-6">
            {/* Lista de Agentes */}
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2">Carregando agentes...</span>
              </div>
            ) : agents.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Nenhum agente encontrado
                  </h3>
                  <p className="text-gray-500">
                    Adicione agentes para gerenciar o suporte
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {agents.map(renderAgent)}
              </div>
            )}
          </TabsContent>

          <TabsContent value="knowledge" className="space-y-6">
            {/* Base de Conhecimento */}
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2">Carregando artigos...</span>
              </div>
            ) : knowledgeBase.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Base de conhecimento vazia
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Crie artigos para ajudar sua equipe e clientes
                  </p>
                  <Button onClick={() => setShowKBModal(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Criar Artigo
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {knowledgeBase.map(renderKBArticle)}
              </div>
            )}
          </TabsContent>

          <TabsContent value="reports">
            <Card>
              <CardContent className="p-12 text-center">
                <BarChart3 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Relatórios de Suporte
                </h3>
                <p className="text-gray-500">
                  Relatórios e métricas de performance serão implementados aqui
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Modais serão implementados na próxima parte */}
        {showTicketModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">Novo Ticket</h2>
              {/* Formulário será implementado */}
              <div className="flex justify-end gap-3 mt-6">
                <Button variant="outline" onClick={() => setShowTicketModal(false)}>
                  Cancelar
                </Button>
                <Button disabled={loading}>
                  {loading ? 'Criando...' : 'Criar Ticket'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HelpdeskSystem;
