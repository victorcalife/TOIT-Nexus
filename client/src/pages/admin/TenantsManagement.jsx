/**
 * Página de Gerenciamento de Tenants - Administração
 * Sistema TOIT Nexus - Módulo Administrador
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import {  
  Building, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff,
  Users,
  Settings,
  Shield,
  ShieldCheck,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Globe,
  Crown,
  MoreVertical,
  Download,
  Upload,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  Ban,
  Database,
  Server,
  HardDrive,
  Activity,
  TrendingUp,
  DollarSign,
      Package,
  Zap
} from 'lucide-react';
import { toast } from 'sonner';

const TenantsManagement = () => {
  const [tenants, setTenants] = useState([
    {
      id: 1,
      name: 'Empresa ABC Ltda',
      domain: 'empresa-abc.com',
      subdomain: 'abc',
      email: 'admin@empresa-abc.com',
      phone: '(11) 3333-3333',
      address: 'Rua das Flores, 123 - São Paulo/SP',
      status: 'active',
      plan: 'enterprise',
      usersCount: 150,
      maxUsers: 200,
      storageUsed: 45.2, // GB
      storageLimit: 100, // GB
      createdAt: '2023-01-15',
      lastActivity: '2024-01-15 14:30',
      modules: ['crm', 'tasks', 'reports', 'ml', 'chat'],
      billing: {
        status: 'paid',
        nextPayment: '2024-02-15',
        amount: 2500.00
      }
    },
    {
      id: 2,
      name: 'Tech Solutions XYZ',
      domain: 'techsolutions.com.br',
      subdomain: 'techxyz',
      email: 'contato@techsolutions.com.br',
      phone: '(11) 4444-4444',
      address: 'Av. Paulista, 1000 - São Paulo/SP',
      status: 'active',
      plan: 'professional',
      usersCount: 75,
      maxUsers: 100,
      storageUsed: 28.7,
      storageLimit: 50,
      createdAt: '2023-03-20',
      lastActivity: '2024-01-15 10:15',
      modules: ['crm', 'tasks', 'reports'],
      billing: {
        status: 'paid',
        nextPayment: '2024-02-20',
        amount: 1200.00
      }
    },
    {
      id: 3,
      name: 'StartUp Inovadora',
      domain: 'startup-inova.com',
      subdomain: 'startup',
      email: 'admin@startup-inova.com',
      phone: '(11) 5555-5555',
      address: 'Rua da Inovação, 456 - São Paulo/SP',
      status: 'trial',
      plan: 'basic',
      usersCount: 15,
      maxUsers: 25,
      storageUsed: 5.3,
      storageLimit: 10,
      createdAt: '2024-01-10',
      lastActivity: '2024-01-14 16:45',
      modules: ['crm', 'tasks'],
      billing: {
        status: 'trial',
        nextPayment: '2024-02-10',
        amount: 0.00
      }
    },
    {
      id: 4,
      name: 'Corporação Global',
      domain: 'corp-global.com',
      subdomain: 'global',
      email: 'ti@corp-global.com',
      phone: '(11) 6666-6666',
      address: 'Centro Empresarial, Torre A - São Paulo/SP',
      status: 'suspended',
      plan: 'enterprise',
      usersCount: 300,
      maxUsers: 500,
      storageUsed: 180.5,
      storageLimit: 250,
      createdAt: '2022-08-05',
      lastActivity: '2024-01-12 09:20',
      modules: ['crm', 'tasks', 'reports', 'ml', 'chat', 'analytics'],
      billing: {
        status: 'overdue',
        nextPayment: '2024-01-05',
        amount: 5000.00
      }
    }
  ]);

  const [filteredTenants, setFilteredTenants] = useState(tenants);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedPlan, setSelectedPlan] = useState('all');
  const [showTenantModal, setShowTenantModal] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Filtros únicos
  const plans = [...new Set(tenants.map(tenant => tenant.plan))];
  const statuses = [...new Set(tenants.map(tenant => tenant.status))];

  useEffect(() => {
    let filtered = tenants;

    // Filtro por termo de busca
    if (searchTerm) {
      filtered = filtered.filter(tenant => 
        tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tenant.domain.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tenant.subdomain.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro por status
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(tenant => tenant.status === selectedStatus);
    }

    // Filtro por plano
    if (selectedPlan !== 'all') {
      filtered = filtered.filter(tenant => tenant.plan === selectedPlan);
    }

    setFilteredTenants(filtered);
  }, [searchTerm, selectedStatus, selectedPlan, tenants]);

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { label: 'Ativo', className: 'bg-green-100 text-green-800' },
      trial: { label: 'Trial', className: 'bg-blue-100 text-blue-800' },
      suspended: { label: 'Suspenso', className: 'bg-red-100 text-red-800' },
      inactive: { label: 'Inativo', className: 'bg-gray-100 text-gray-800' }
    };
    
    const config = statusConfig[status] || statusConfig.inactive;
    return (
      <Badge className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const getPlanBadge = (plan) => {
    const planConfig = {
      basic: { label: 'Básico', className: 'bg-gray-100 text-gray-800', icon: Package },
      professional: { label: 'Profissional', className: 'bg-blue-100 text-blue-800', icon: Shield },
      enterprise: { label: 'Enterprise', className: 'bg-purple-100 text-purple-800', icon: Crown }
    };
    
    const config = planConfig[plan] || planConfig.basic;
    const Icon = config.icon;
    
    return (
      <Badge className={config.className}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const getBillingStatusBadge = (status) => {
    const statusConfig = {
      paid: { label: 'Pago', className: 'bg-green-100 text-green-800' },
      trial: { label: 'Trial', className: 'bg-blue-100 text-blue-800' },
      overdue: { label: 'Vencido', className: 'bg-red-100 text-red-800' },
      pending: { label: 'Pendente', className: 'bg-yellow-100 text-yellow-800' }
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    return (
      <Badge className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const handleTenantAction = (action, tenant) => {
    setIsLoading(true);
    
    setTimeout(() => {
      switch (action) {
        case 'activate':
          setTenants(prev => prev.map(t => 
            t.id === tenant.id ? { ...t, status: 'active' } : t
          ));
          toast.success(`Tenant ${tenant.name} ativado com sucesso!`);
          break;
        case 'suspend':
          setTenants(prev => prev.map(t => 
            t.id === tenant.id ? { ...t, status: 'suspended' } : t
          ));
          toast.success(`Tenant ${tenant.name} suspenso com sucesso!`);
          break;
        case 'delete':
          if (window.confirm(`Tem certeza que deseja excluir o tenant ${tenant.name}?`)) {
            setTenants(prev => prev.filter(t => t.id !== tenant.id));
            toast.success(`Tenant ${tenant.name} excluído com sucesso!`);
          }
          break;
        case 'upgrade':
          toast.success(`Solicitação de upgrade enviada para ${tenant.name}`);
          break;
        case 'reset-data':
          if (window.confirm(`Tem certeza que deseja resetar os dados do tenant ${tenant.name}?`)) {
            toast.success(`Dados do tenant ${tenant.name} resetados com sucesso!`);
          }
          break;
        default:
          break;
      }
      setIsLoading(false);
    }, 1000);
  };

  const handleCreateTenant = () => {
    setSelectedTenant(null);
    setShowTenantModal(true);
  };

  const handleEditTenant = (tenant) => {
    setSelectedTenant(tenant);
    setShowTenantModal(true);
  };

  const handleExportTenants = () => {
    const dataStr = JSON.stringify(filteredTenants, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'tenants-toit-nexus.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    toast.success('Lista de tenants exportada com sucesso!');
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getStoragePercentage = (used, limit) => {
    return Math.round((used / limit) * 100);
  };

  const getUsersPercentage = (current, max) => {
    return Math.round((current / max) * 100);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gerenciamento de Tenants</h1>
          <p className="text-gray-600">Gerencie organizações, planos e recursos do sistema</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportTenants}>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button onClick={handleCreateTenant}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Tenant
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Tenants</p>
                <p className="text-2xl font-bold text-gray-900">{tenants.length}</p>
              </div>
              <Building className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tenants Ativos</p>
                <p className="text-2xl font-bold text-green-600">
                  {tenants.filter(t => t.status === 'active').length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Receita Mensal</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(tenants.reduce((sum, t) => sum + t.billing.amount, 0))}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Usuários</p>
                <p className="text-2xl font-bold text-blue-600">
                  {tenants.reduce((sum, t) => sum + t.usersCount, 0)}
                </p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar por nome, domínio ou subdomínio..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="all">Todos os Status</option>
              <option value="active">Ativo</option>
              <option value="trial">Trial</option>
              <option value="suspended">Suspenso</option>
              <option value="inactive">Inativo</option>
            </select>
            
            <select
              value={selectedPlan}
              onChange={(e) => setSelectedPlan(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="all">Todos os Planos</option>
              <option value="basic">Básico</option>
              <option value="professional">Profissional</option>
              <option value="enterprise">Enterprise</option>
            </select>
            
            <Button variant="outline" onClick={() => {
              setSearchTerm('');
              setSelectedStatus('all');
              setSelectedPlan('all');
            }}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Limpar Filtros
            </Button>

          </div>
        </CardContent>
      </Card>

      {/* Tenants Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredTenants.map((tenant) => (
          <Card key={tenant.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Building className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{tenant.name}</CardTitle>
                    <CardDescription>{tenant.domain}</CardDescription>
                  </div>
                </div>
                <div className="flex gap-2">
                  {getStatusBadge(tenant.status)}
                  {getPlanBadge(tenant.plan)}
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Informações básicas */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Subdomínio</p>
                  <p className="font-medium">{tenant.subdomain}.toit-nexus.com</p>
                </div>
                <div>
                  <p className="text-gray-600">Usuários</p>
                  <p className="font-medium">{tenant.usersCount}/{tenant.maxUsers}</p>
                </div>
              </div>
              
              {/* Progresso de usuários */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Uso de Usuários</span>
                  <span className="font-medium">{getUsersPercentage(tenant.usersCount, tenant.maxUsers)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full"
                    style={{width: `${getUsersPercentage(tenant.usersCount, tenant.maxUsers)}%`}}
                  ></div>
                </div>
              </div>
              
              {/* Progresso de armazenamento */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Armazenamento</span>
                  <span className="font-medium">{tenant.storageUsed}GB / {tenant.storageLimit}GB</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      getStoragePercentage(tenant.storageUsed, tenant.storageLimit) > 80 
                        ? 'bg-red-600' 
                        : getStoragePercentage(tenant.storageUsed, tenant.storageLimit) > 60 
                        ? 'bg-yellow-600' 
                        : 'bg-green-600'
                    }`}
                    style={{ width: `${getStoragePercentage(tenant.storageUsed, tenant.storageLimit)}%` }}
                  ></div>
                </div>
              </div>
              
              {/* Módulos ativos */}
              <div>
                <p className="text-sm text-gray-600 mb-2">Módulos Ativos</p>
                <div className="flex flex-wrap gap-1">
                  {tenant.modules.map((module) => (
                    <Badge key={module} variant="outline" className="text-xs">
                      {module.toUpperCase()}
                    </Badge>
                  ))}
                </div>
              </div>
              
              {/* Informações de cobrança */}
              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Status de Cobrança</span>
                  {getBillingStatusBadge(tenant.billing.status)}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Valor Mensal</span>
                  <span className="font-medium">{formatCurrency(tenant.billing.amount)}</span>
                </div>
              </div>
              
              {/* Ações */}
              <div className="flex gap-2 pt-4 border-t">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEditTenant(tenant)}
                  className="flex-1"
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Editar
                </Button>

                {tenant.status === 'active' ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleTenantAction('suspend', tenant)}
                    disabled={isLoading}
                  >
                    <Ban className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleTenantAction('activate', tenant)}
                    disabled={isLoading}
                  >
                    <CheckCircle className="h-4 w-4" />
                  </Button>
                )}
                
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleTenantAction('upgrade', tenant)}
                  disabled={isLoading}
                >
                  <TrendingUp className="h-4 w-4" />
                </Button>
                
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleTenantAction('delete', tenant)}
                  disabled={isLoading}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {filteredTenants.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Nenhum tenant encontrado com os filtros aplicados</p>
          </CardContent>
        </Card>
      )}

      {/* Tenant Modal - Placeholder */}
      {showTenantModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {selectedTenant ? 'Editar Tenant' : 'Novo Tenant'}
            </h2>
            <p className="text-gray-600 mb-4">
              Modal de criação/edição de tenant - Em desenvolvimento
            </p>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowTenantModal(false)}>
                Cancelar
              </Button>
              <Button onClick={() => {
                setShowTenantModal(false);
                toast.success(selectedTenant ? 'Tenant atualizado!' : 'Tenant criado!');
              }}>
                {selectedTenant ? 'Atualizar' : 'Criar'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TenantsManagement;