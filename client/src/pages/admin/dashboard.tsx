import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { 
  Building2, 
  Users, 
  TrendingUp, 
  AlertTriangle,
  Plus,
  Search,
  Settings,
  Crown,
  Activity,
  DollarSign
} from "lucide-react";
import { Input } from "@/components/ui/input";

export default function AdminDashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/admin/stats'],
    retry: false,
  });

  const { data: tenants, isLoading: tenantsLoading } = useQuery({
    queryKey: ['/api/admin/tenants'],
    retry: false,
  });

  const { data: recentActivities, isLoading: activitiesLoading } = useQuery({
    queryKey: ['/api/admin/activities'],
    retry: false,
  });

  const suspendTenantMutation = useMutation({
    mutationFn: async (tenantId: string) => {
      await apiRequest('POST', `/api/admin/tenants/${tenantId}/suspend`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/tenants'] });
      toast({
        title: "Sucesso",
        description: "Empresa suspensa com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Falha ao suspender empresa.",
        variant: "destructive",
      });
    },
  });

  const activateTenantMutation = useMutation({
    mutationFn: async (tenantId: string) => {
      await apiRequest('POST', `/api/admin/tenants/${tenantId}/activate`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/tenants'] });
      toast({
        title: "Sucesso",
        description: "Empresa ativada com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Falha ao ativar empresa.",
        variant: "destructive",
      });
    },
  });

  const filteredTenants = (tenants || []).filter((tenant: any) =>
    tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tenant.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'suspended':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Ativo';
      case 'inactive':
        return 'Inativo';
      case 'suspended':
        return 'Suspenso';
      default:
        return status;
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Crown className="w-8 h-8 text-purple-600 mr-3" />
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Painel Administrativo TOIT</h1>
              <p className="text-sm text-gray-600 mt-1">
                Gestão central de todos os clientes e sistema
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" onClick={() => window.location.href = '/'}>
              Voltar ao Sistema
            </Button>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nova Empresa
            </Button>
          </div>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="p-6 border-b bg-gray-50">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statsLoading ? (
            [...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-6 w-32 mb-2" />
                  <Skeleton className="h-8 w-16" />
                </CardContent>
              </Card>
            ))
          ) : (
            <>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total de Empresas</p>
                      <p className="text-2xl font-bold text-gray-900">{stats?.totalTenants || 0}</p>
                    </div>
                    <Building2 className="w-8 h-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Usuários Ativos</p>
                      <p className="text-2xl font-bold text-gray-900">{stats?.totalUsers || 0}</p>
                    </div>
                    <Users className="w-8 h-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Receita Mensal</p>
                      <p className="text-2xl font-bold text-gray-900">
                        R$ {(stats?.monthlyRevenue || 0).toLocaleString('pt-BR')}
                      </p>
                    </div>
                    <DollarSign className="w-8 h-8 text-yellow-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Problemas</p>
                      <p className="text-2xl font-bold text-gray-900">{stats?.issues || 0}</p>
                    </div>
                    <AlertTriangle className="w-8 h-8 text-red-600" />
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {/* Tenants Management */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Gestão de Empresas</h2>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar empresa..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {tenantsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-4">
                      <Skeleton className="h-6 w-32 mb-2" />
                      <Skeleton className="h-4 w-full mb-4" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-8 w-full" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredTenants.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTenants.map((tenant: any) => (
                  <Card key={tenant.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          {tenant.logo ? (
                            <img 
                              src={tenant.logo} 
                              alt={tenant.name}
                              className="w-10 h-10 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                              <Building2 className="w-5 h-5 text-blue-600" />
                            </div>
                          )}
                          <div>
                            <CardTitle className="text-sm">{tenant.name}</CardTitle>
                            <p className="text-xs text-gray-500">@{tenant.slug}</p>
                          </div>
                        </div>
                        <Badge className={getStatusColor(tenant.status)}>
                          {getStatusLabel(tenant.status)}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-500">Plano:</span>
                          <Badge variant="outline" className="text-xs">{tenant.subscriptionPlan}</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-500">Usuários:</span>
                          <span className="font-medium">{tenant.userCount || 0}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-500">Criado:</span>
                          <span className="font-medium">
                            {new Date(tenant.createdAt).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <Button size="sm" variant="outline" className="flex-1">
                          <Settings className="w-3 h-3 mr-1" />
                          Editar
                        </Button>
                        {tenant.status === 'active' ? (
                          <Button 
                            size="sm" 
                            variant="destructive" 
                            className="flex-1"
                            onClick={() => suspendTenantMutation.mutate(tenant.id)}
                            disabled={suspendTenantMutation.isPending}
                          >
                            Suspender
                          </Button>
                        ) : (
                          <Button 
                            size="sm" 
                            className="flex-1"
                            onClick={() => activateTenantMutation.mutate(tenant.id)}
                            disabled={activateTenantMutation.isPending}
                          >
                            Ativar
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma empresa encontrada</h3>
                <p className="text-gray-500">
                  {searchTerm ? 'Nenhuma empresa corresponde aos critérios de busca.' : 'Ainda não há empresas cadastradas.'}
                </p>
              </div>
            )}
          </div>
        </main>

        {/* Recent Activities Sidebar */}
        <aside className="w-80 bg-gray-50 border-l border-gray-200 p-6 overflow-y-auto">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Atividades Recentes</h3>
          
          {activitiesLoading ? (
            <div className="space-y-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-24" />
                </div>
              ))}
            </div>
          ) : recentActivities && recentActivities.length > 0 ? (
            <div className="space-y-4">
              {recentActivities.map((activity: any) => (
                <div key={activity.id} className="bg-white rounded-lg p-3 shadow-sm">
                  <div className="flex items-start space-x-2">
                    <Activity className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 mb-1">
                        {activity.description}
                      </p>
                      <div className="flex items-center text-xs text-gray-500 space-x-2">
                        <span>{activity.tenantName}</span>
                        <span>•</span>
                        <span>{new Date(activity.createdAt).toLocaleDateString('pt-BR')}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Activity className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">Nenhuma atividade recente</p>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}