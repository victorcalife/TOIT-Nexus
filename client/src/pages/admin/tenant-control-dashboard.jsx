import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Building2,
  Users,
  DollarSign,
  Activity,
  Search,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Plus,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const TenantControlDashboard = () => {
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/tenants-dashboard');
      if (response.ok) {
        const data = await response.json();
        setDashboardData(data);
      } else {
        // Usar dados mock em caso de erro
        setDashboardData(mockData);
      }
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
      setDashboardData(mockData);
    } finally {
      setLoading(false);
    }
  };

  const handleTenantAction = async (tenantId, action) => {
    try {
      const response = await fetch(`/api/admin/tenants/${tenantId}/${action}`, {
        method: 'POST'
      });
      if (response.ok) {
        fetchDashboardData();
      }
    } catch (error) {
      console.error(`Erro ao ${action} tenant:`, error);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  // Mock data
  const mockData = {
    analytics: {
      totalTenants: 156,
      activeTenants: 142,
      totalUsers: 3420,
      totalRevenue: 125000
    },
    tenants: [
      {
        id: 1,
        name: 'Empresa Alpha',
        domain: 'alpha.toit.com.br',
        status: 'active',
        plan: 'Enterprise',
        users: 45,
        createdAt: '2024-01-15',
        billing: { amount: 2500, status: 'paid' }
      },
      {
        id: 2,
        name: 'Beta Solutions',
        domain: 'beta.toit.com.br',
        status: 'active',
        plan: 'Professional',
        users: 23,
        createdAt: '2024-02-01',
        billing: { amount: 1200, status: 'pending' }
      },
      {
        id: 3,
        name: 'Gamma Corp',
        domain: 'gamma.toit.com.br',
        status: 'suspended',
        plan: 'Basic',
        users: 8,
        createdAt: '2024-01-20',
        billing: { amount: 400, status: 'overdue' }
      }
    ]
  };

  const data = dashboardData || mockData;
  const { analytics, tenants } = data;

  const filteredTenants = tenants.filter(tenant => {
    const matchesSearch = tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tenant.domain.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || tenant.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    const variants = {
      active: 'default',
      suspended: 'destructive',
      pending: 'secondary'
    };
    return <Badge variant={variants[status] || 'secondary'}>{status}</Badge>;
  };

  const getBillingStatusBadge = (status) => {
    const variants = {
      paid: 'default',
      pending: 'secondary',
      overdue: 'destructive'
    };
    const labels = {
      paid: 'Pago',
      pending: 'Pendente',
      overdue: 'Vencido'
    };
    return <Badge variant={variants[status] || 'secondary'}>{labels[status] || status}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Controle de Tenants</h1>
          <p className="text-muted-foreground">
            Gerencie todos os tenants da plataforma TOIT Nexus
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Novo Tenant
        </Button>
      </div>

      {/* Analytics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Tenants</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalTenants}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600 flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />
                +12% vs mês anterior
              </span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tenants Ativos</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.activeTenants}</div>
            <p className="text-xs text-muted-foreground">
              {((analytics.activeTenants / analytics.totalTenants) * 100).toFixed(1)}% do total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Média de {Math.round(analytics.totalUsers / analytics.totalTenants)} por tenant
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(analytics.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600 flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />
                +8.2% vs mês anterior
              </span>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome ou domínio..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <div className="flex gap-2">
              {['all', 'active', 'suspended', 'pending'].map((status) => (
                <Button
                  key={status}
                  variant={statusFilter === status ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter(status)}
                >
                  {status === 'all' && 'Todos'}
                  {status === 'active' && 'Ativos'}
                  {status === 'suspended' && 'Suspensos'}
                  {status === 'pending' && 'Pendentes'}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tenants Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Tenants</CardTitle>
          <CardDescription>
            {filteredTenants.length} de {tenants.length} tenants
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredTenants.map((tenant) => (
              <div key={tenant.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Building2 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{tenant.name}</h3>
                      {getStatusBadge(tenant.status)}
                    </div>
                    <p className="text-sm text-muted-foreground">{tenant.domain}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                      <span>{tenant.users} usuários</span>
                      <span>Plano: {tenant.plan}</span>
                      <span>Criado em: {formatDate(tenant.createdAt)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="font-semibold">{formatCurrency(tenant.billing.amount)}</div>
                    {getBillingStatusBadge(tenant.billing.status)}
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Ações</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => handleTenantAction(tenant.id, 'view')}>
                        <Eye className="mr-2 h-4 w-4" />
                        Visualizar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleTenantAction(tenant.id, 'edit')}>
                        <Edit className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      {tenant.status === 'active' ? (
                        <DropdownMenuItem 
                          onClick={() => handleTenantAction(tenant.id, 'suspend')}
                          className="text-orange-600"
                        >
                          <AlertTriangle className="mr-2 h-4 w-4" />
                          Suspender
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem 
                          onClick={() => handleTenantAction(tenant.id, 'activate')}
                          className="text-green-600"
                        >
                          <Activity className="mr-2 h-4 w-4" />
                          Ativar
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem 
                        onClick={() => handleTenantAction(tenant.id, 'delete')}
                        className="text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TenantControlDashboard;
