/**
 * SISTEMA CRM COMPLETO - TOIT NEXUS
 * Sistema completo de gestão de relacionamento com clientes
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
  Users, 
  UserPlus,
  Building,
  Phone,
  Mail,
  MapPin,
  Calendar,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Target,
  Activity,
  Clock,
  Star,
  Heart,
  MessageSquare,
  FileText,
  Briefcase,
  ShoppingCart,
  CreditCard,
  PieChart,
  BarChart3,
  LineChart,
  Filter,
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  Download,
  Upload,
  RefreshCw,
  Settings,
  Bell,
  Tag,
  Zap,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  MoreHorizontal,
  ArrowRight,
  ArrowUp,
  ArrowDown }
} from 'lucide-react';

const CRMSystem = () => {
  const [customers, setCustomers] = useState([]);
  const [leads, setLeads] = useState([]);
  const [deals, setDeals] = useState([]);
  const [activities, setActivities] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [showDealModal, setShowDealModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    source: 'all',
    assignee: 'all',
    dateRange: 'all'
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('customers');
  
  const { toast } = useToast();

  // Status dos leads
  const leadStatuses = {
    new: { name: 'Novo', color: 'text-blue-600 bg-blue-100', icon: <Plus className="h-3 w-3" /> },
    contacted: { name: 'Contatado', color: 'text-yellow-600 bg-yellow-100', icon: <Phone className="h-3 w-3" /> },
    qualified: { name: 'Qualificado', color: 'text-green-600 bg-green-100', icon: <CheckCircle className="h-3 w-3" /> },
    proposal: { name: 'Proposta', color: 'text-purple-600 bg-purple-100', icon: <FileText className="h-3 w-3" /> },
    negotiation: { name: 'Negociação', color: 'text-orange-600 bg-orange-100', icon: <Target className="h-3 w-3" /> },
    closed_won: { name: 'Fechado - Ganho', color: 'text-green-600 bg-green-100', icon: <CheckCircle className="h-3 w-3" /> },
    closed_lost: { name: 'Fechado - Perdido', color: 'text-red-600 bg-red-100', icon: <XCircle className="h-3 w-3" /> }
  };

  // Fontes de leads
  const leadSources = {
    website: 'Website',
    social_media: 'Redes Sociais',
    referral: 'Indicação',
    cold_call: 'Cold Call',
    email_marketing: 'Email Marketing',
    event: 'Evento',
    advertisement: 'Publicidade',
    other: 'Outros'
  };

  /**
   * CARREGAR DADOS DO CRM
   */
  const loadCRMData = async () => {
    setLoading(true);
    try {
      const [customersRes, leadsRes, dealsRes, activitiesRes] = await Promise.all([
        fetch('/api/crm/customers', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('/api/crm/leads', {`
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('/api/crm/deals', {`
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('/api/crm/activities', {`
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        })
      ]);

      if (customersRes.ok) {
        const customersData = await customersRes.json();
        setCustomers(customersData.customers || []);
      }

      if (leadsRes.ok) {
        const leadsData = await leadsRes.json();
        setLeads(leadsData.leads || []);
      }

      if (dealsRes.ok) {
        const dealsData = await dealsRes.json();
        setDeals(dealsData.deals || []);
      }

      if (activitiesRes.ok) {
        const activitiesData = await activitiesRes.json();
        setActivities(activitiesData.activities || []);
      }

    } catch (error) {
      console.error('Erro ao carregar dados do CRM:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados do CRM",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * CRIAR CLIENTE
   */
  const createCustomer = async (customerData) => {
    try {
      const response = await fetch('/api/crm/customers', {
        method: 'POST',
        headers: {`
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...customerData,
          createdAt: new Date().toISOString()
        })
      });

      if (!response.ok) {
        throw new Error('Erro ao criar cliente');
      }

      const data = await response.json();
      setCustomers(prev => [data.customer, ...prev]);
      setShowCustomerModal(false);
      
      toast({
        title: "Cliente criado",
        description: "Cliente criado com sucesso",
      });
    } catch (error) {
      console.error('Erro ao criar cliente:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar o cliente",
        variant: "destructive"
      });
    }
  };

  /**
   * CRIAR LEAD
   */
  const createLead = async (leadData) => {
    try {
      const response = await fetch('/api/crm/leads', {
        method: 'POST',
        headers: {`
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...leadData,
          status: 'new',
          createdAt: new Date().toISOString()
        })
      });

      if (!response.ok) {
        throw new Error('Erro ao criar lead');
      }

      const data = await response.json();
      setLeads(prev => [data.lead, ...prev]);
      setShowLeadModal(false);
      
      toast({
        title: "Lead criado",
        description: "Lead criado com sucesso",
      });
    } catch (error) {
      console.error('Erro ao criar lead:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar o lead",
        variant: "destructive"
      });
    }
  };

  /**
   * ATUALIZAR STATUS DO LEAD
   */
  const updateLeadStatus = async (leadId, newStatus) => {
    try {`
      const response = await fetch(`/api/crm/leads/${leadId}/status`, {
        method: 'PATCH',
        headers: {`
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        throw new Error('Erro ao atualizar status');
      }

      setLeads(prev => prev.map(lead => 
        lead.id === leadId 
          ? { ...lead, status: newStatus, updatedAt: new Date().toISOString() }
          : lead
      ));
      
      toast({
        title: "Status atualizado",
        description: "Status do lead atualizado com sucesso",
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
   * CONVERTER LEAD EM CLIENTE
   */
  const convertLeadToCustomer = async (leadId) => {
    try {`
      const response = await fetch(`/api/crm/leads/${leadId}/convert`, {
        method: 'POST',
        headers: {`
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao converter lead');
      }

      const data = await response.json();
      
      // Adicionar novo cliente
      setCustomers(prev => [data.customer, ...prev]);
      
      // Atualizar status do lead
      setLeads(prev => prev.map(lead => 
        lead.id === leadId 
          ? { ...lead, status: 'converted', convertedAt: new Date().toISOString() }
          : lead
      ));
      
      toast({
        title: "Lead convertido",
        description: "Lead convertido em cliente com sucesso",
      });
    } catch (error) {
      console.error('Erro ao converter lead:', error);
      toast({
        title: "Erro",
        description: "Não foi possível converter o lead",
        variant: "destructive"
      });
    }
  };

  /**
   * ADICIONAR ATIVIDADE
   */
  const addActivity = async (activityData) => {
    try {
      const response = await fetch('/api/crm/activities', {
        method: 'POST',
        headers: {`
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...activityData,
          createdAt: new Date().toISOString()
        })
      });

      if (!response.ok) {
        throw new Error('Erro ao adicionar atividade');
      }

      const data = await response.json();
      setActivities(prev => [data.activity, ...prev]);
      
      toast({
        title: "Atividade adicionada",
        description: "Atividade registrada com sucesso",
      });
    } catch (error) {
      console.error('Erro ao adicionar atividade:', error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar a atividade",
        variant: "destructive"
      });
    }
  };

  /**
   * RENDERIZAR CARD DE CLIENTE
   */
  const renderCustomerCard = (customer) => ({ const totalDeals = deals.filter(deal => deal.customerId === customer.id);
    const totalValue = totalDeals.reduce((sum, deal }) => sum + (deal.value || 0), 0);
    
    return (
      <Card key={customer.id} className="hover:shadow-md transition-shadow cursor-pointer">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-bold text-lg">
                  {customer.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h3 className="font-semibold text-lg">{customer.name}</h3>
                <p className="text-gray-600 text-sm">{customer.company}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                {customer.segment || 'Padrão'}
              </Badge>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Mail className="h-4 w-4" />
              {customer.email}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Phone className="h-4 w-4" />
              {customer.phone}
            </div>
            {customer.address && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="h-4 w-4" />
                {customer.address}
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center p-2 bg-gray-50 rounded">
              <div className="text-lg font-bold text-blue-600">{totalDeals.length}</div>
              <div className="text-xs text-gray-600">Negócios</div>
            </div>
            <div className="text-center p-2 bg-gray-50 rounded">
              <div className="text-lg font-bold text-green-600">
                R$ {totalValue.toLocaleString()}
              </div>
              <div className="text-xs text-gray-600">Valor Total</div>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick=({ ( }) => setSelectedCustomer(customer)}
            >
              <Eye className="h-3 w-3 mr-1" />
              Ver Detalhes
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick=({ ( }) => {
                // Implementar edição
              }}
            >
              <Edit className="h-3 w-3 mr-1" />

          </div>
        </CardContent>
      </Card>
    );
  };

  /**
   * RENDERIZAR CARD DE LEAD
   */
  const renderLeadCard = (lead) => {
    const status = leadStatuses[lead.status] || leadStatuses.new;
    const source = leadSources[lead.source] || 'Desconhecido';
    
    return (
      <Card key={lead.id} className="hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="font-semibold text-lg">{lead.name}</h3>
              <p className="text-gray-600 text-sm">{lead.company}</p>
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
              <Mail className="h-4 w-4" />
              {lead.email}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Phone className="h-4 w-4" />
              {lead.phone}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Tag className="h-4 w-4" />
              Fonte: {source}
            </div>
          </div>
          
          {lead.estimatedValue && (
            <div className="mb-4">
              <div className="text-sm text-gray-600">Valor Estimado</div>
              <div className="text-lg font-bold text-green-600">
                R$ {lead.estimatedValue.toLocaleString()}
              </div>
            </div>
          )}
          
          <div className="flex gap-2">
            <select
              value={lead.status}
              onChange=({ (e }) => updateLeadStatus(lead.id, e.target.value)}
              className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
            >
              ({ Object.entries(leadStatuses).map(([key, status] }) => (
                <option key={key} value={key}>{status.name}</option>
              ))}
            </select>
            
            ({ lead.status === 'qualified' && (
              <Button
                variant="default"
                size="sm"
                onClick={( }) => convertLeadToCustomer(lead.id)}
              >
                <ArrowRight className="h-3 w-3 mr-1" />

            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  /**
   * RENDERIZAR ATIVIDADE
   */
  const renderActivity = (activity) => ({ const getActivityIcon = (type }) => {
      switch (type) {
        case 'call': return <Phone className="h-4 w-4" />;
        case 'email': return <Mail className="h-4 w-4" />;
        case 'meeting': return <Calendar className="h-4 w-4" />;
        case 'note': return <FileText className="h-4 w-4" />;
        default: return <Activity className="h-4 w-4" />;
      }
    };

    const getActivityColor = (type) => {
      switch (type) {
        case 'call': return 'text-blue-600 bg-blue-100';
        case 'email': return 'text-green-600 bg-green-100';
        case 'meeting': return 'text-purple-600 bg-purple-100';
        case 'note': return 'text-gray-600 bg-gray-100';
        default: return 'text-gray-600 bg-gray-100';
      }
    };

    return (
      <div key={activity.id} className="flex items-start gap-3 p-4 border-b border-gray-100">`
        <div className={`p-2 rounded-full ${getActivityColor(activity.type)}`}>
          {getActivityIcon(activity.type)}
        </div>
        
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <h4 className="font-medium">{activity.title}</h4>
            <span className="text-xs text-gray-500">
              {new Date(activity.createdAt).toLocaleString('pt-BR')}
            </span>
          </div>
          
          <p className="text-sm text-gray-600 mb-2">{activity.description}</p>
          
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span>Por: {activity.createdBy}</span>
            {activity.customerId && (
              <span>Cliente: {customers.find(c => c.id === activity.customerId)?.name}</span>
            )}
            {activity.leadId && (
              <span>Lead: {leads.find(l => l.id === activity.leadId)?.name}</span>
            )}
          </div>
        </div>
      </div>
    );
  };

  /**
   * OBTER ESTATÍSTICAS
   */
  const getStats = () => ({ const totalCustomers = customers.length;
    const totalLeads = leads.length;
    const activeLeads = leads.filter(lead => !['closed_won', 'closed_lost', 'converted'].includes(lead.status)).length;
    const conversionRate = totalLeads > 0 ? ((leads.filter(l => l.status === 'converted').length / totalLeads) * 100).toFixed(1) : 0;
    const totalDealsValue = deals.reduce((sum, deal }) => sum + (deal.value || 0), 0);
    
    return { totalCustomers, totalLeads, activeLeads, conversionRate, totalDealsValue };
  };

  const stats = getStats();

  /**
   * CARREGAR DADOS AO MONTAR COMPONENTE
   */
  useEffect(() => {
    loadCRMData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Users className="h-8 w-8 text-blue-600" />
                Sistema CRM
              </h1>
              <p className="text-gray-600 mt-2">
                Gestão completa de relacionamento com clientes
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={loadCRMData}
                disabled={loading}
              >`
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />

              <Button
                variant="outline"
                onClick=({ ( }) => setShowLeadModal(true)}
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Novo Lead
              </Button>
              <Button
                onClick=({ ( }) => setShowCustomerModal(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Novo Cliente
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
                  <p className="text-sm font-medium text-gray-600">Clientes</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalCustomers}</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Leads Totais</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalLeads}</p>
                </div>
                <Target className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Leads Ativos</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.activeLeads}</p>
                </div>
                <Activity className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Taxa Conversão</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.conversionRate}%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Valor Total</p>
                  <p className="text-2xl font-bold text-green-600">
                    R$ {stats.totalDealsValue.toLocaleString()}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs do CRM */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="customers">Clientes</TabsTrigger>
            <TabsTrigger value="leads">Leads</TabsTrigger>
            <TabsTrigger value="deals">Negócios</TabsTrigger>
            <TabsTrigger value="activities">Atividades</TabsTrigger>
          </TabsList>

          <TabsContent value="customers" className="space-y-6">
            {/* Filtros */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Buscar clientes..."
                        value={searchTerm}
                        onChange=({ (e }) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <select
                      value={filters.status}
                      onChange=({ (e }) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">Todos os Status</option>
                      <option value="active">Ativo</option>
                      <option value="inactive">Inativo</option>
                    </select>

                    <select
                      value={filters.assignee}
                      onChange=({ (e }) => setFilters(prev => ({ ...prev, assignee: e.target.value }))}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">Todos os Responsáveis</option>
                      <option value="me">Meus Clientes</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Lista de Clientes */}
            ({ loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2">Carregando clientes...</span>
              </div>
            ) : customers.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Nenhum cliente encontrado
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Comece adicionando seu primeiro cliente
                  </p>
                  <Button onClick={( }) => setShowCustomerModal(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Cliente
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {customers
                  .filter(customer => 
                    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    customer.company?.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map(renderCustomerCard)}
              </div>
            )}
          </TabsContent>

          <TabsContent value="leads" className="space-y-6">
            {/* Lista de Leads */}
            ({ loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2">Carregando leads...</span>
              </div>
            ) : leads.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Target className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Nenhum lead encontrado
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Comece adicionando seu primeiro lead
                  </p>
                  <Button onClick={( }) => setShowLeadModal(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Lead
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {leads.map(renderLeadCard)}
              </div>
            )}
          </TabsContent>

          <TabsContent value="deals">
            <Card>
              <CardContent className="p-12 text-center">
                <Briefcase className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Pipeline de Negócios
                </h3>
                <p className="text-gray-500">
                  Gestão de negócios será implementada aqui
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activities">
            <Card>
              <CardHeader>
                <CardTitle>Atividades Recentes</CardTitle>
              </CardHeader>
              <CardContent>
                {activities.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Activity className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Nenhuma atividade registrada</p>
                  </div>
                ) : (
                  <div className="max-h-96 overflow-y-auto">
                    {activities.map(renderActivity)}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Modais serão implementados na próxima parte */}
        {showCustomerModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">Novo Cliente</h2>
              {/* Formulário será implementado */}
              <div className="flex justify-end gap-3 mt-6">
                <Button variant="outline" onClick=({ ( }) => setShowCustomerModal(false)}>

                <Button disabled={loading}>
                  {loading ? 'Criando...' : 'Criar Cliente'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CRMSystem;
`