import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Building2, Users, Settings, Crown, Search } from "lucide-react";

export default function TenantSelection() {
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  const { data: tenants, isLoading } = useQuery({
    queryKey: ['/api/admin/tenants'],
    retry: false,
  });

  const selectTenantMutation = useMutation({
    mutationFn: async (tenantId: string) => {
      await apiRequest('POST', '/api/auth/select-tenant', { tenantId });
    },
    onSuccess: () => {
      window.location.href = '/';
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Falha ao selecionar empresa.",
        variant: "destructive",
      });
    },
  });

  const loginAsToitAdmin = () => {
    window.location.href = '/admin';
  };

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Building2 className="w-12 h-12 text-blue-600 mr-3" />
            <div>
              <h1 className="text-4xl font-bold text-gray-900">InvestFlow</h1>
              <p className="text-lg text-gray-600">Plataforma de Automação para Investimentos</p>
            </div>
          </div>
        </div>

        {/* TOIT Admin Access */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Crown className="w-6 h-6 text-purple-600 mr-3" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Acesso Administrativo TOIT-Nexus</h3>
                <p className="text-sm text-gray-600">
                  Área de gestão da TOIT-Nexus para administração de clientes e sistema
                </p>
              </div>
            </div>
            <Button 
              onClick={loginAsToitAdmin}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Settings className="w-4 h-4 mr-2" />
              Acessar Painel TOIT-Nexus
            </Button>
          </div>
        </div>

        {/* Client Selection */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">Selecione sua Empresa</h2>
              <p className="text-gray-600 mt-1">
                Escolha a empresa que deseja acessar para continuar
              </p>
            </div>
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

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTenants.map((tenant: any) => (
                <Card key={tenant.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        {tenant.logo ? (
                          <img 
                            src={tenant.logo} 
                            alt={tenant.name}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Building2 className="w-6 h-6 text-blue-600" />
                          </div>
                        )}
                        <div>
                          <CardTitle className="text-lg">{tenant.name}</CardTitle>
                          <p className="text-sm text-gray-500">@{tenant.slug}</p>
                        </div>
                      </div>
                      <Badge className={getStatusColor(tenant.status)}>
                        {getStatusLabel(tenant.status)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Plano:</span>
                        <Badge variant="outline">{tenant.subscriptionPlan}</Badge>
                      </div>
                      
                      {tenant.domain && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500">Domínio:</span>
                          <span className="text-sm font-medium">{tenant.domain}</span>
                        </div>
                      )}
                      
                      <div className="pt-3 border-t">
                        <Button 
                          className="w-full"
                          onClick={() => selectTenantMutation.mutate(tenant.id)}
                          disabled={selectTenantMutation.isPending || tenant.status !== 'active'}
                        >
                          {selectTenantMutation.isPending ? (
                            "Conectando..."
                          ) : tenant.status !== 'active' ? (
                            "Indisponível"
                          ) : (
                            <>
                              <Users className="w-4 h-4 mr-2" />
                              Acessar {tenant.name}
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma empresa encontrada</h3>
              <p className="text-gray-500 mb-4">
                {searchTerm ? 'Nenhuma empresa corresponde aos critérios de busca.' : 'Você não tem acesso a nenhuma empresa no momento.'}
              </p>
              <p className="text-sm text-gray-400">
                Entre em contato com a TOIT para solicitar acesso a uma empresa.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            © 2024 TOIT - Tecnologia e Inovação. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </div>
  );
}