import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useNavigate, useLocation } from 'react-router-dom';
import {  
  Building2, 
  Users, 
  Crown, 
  Shield, 
  ArrowRight,
  LogOut,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const SelectTenantPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Simular dados de tenants do usuário
  const [userTenants] = useState([
    {
      id: '1',
      name: 'TOIT Tecnologia',
      slug: 'toit-tech',
      description: 'Empresa principal de tecnologia',
      role: 'super_admin',
      status: 'active',
      memberCount: 25,
      plan: 'enterprise',
      lastAccess: '2024-01-15T10:30:00Z'
    },
    {
      id: '2', 
      name: 'Cliente Demo Corp',
      slug: 'demo-corp',
      description: 'Organização de demonstração',
      role: 'admin',
      status: 'active',
      memberCount: 12,
      plan: 'professional',
      lastAccess: '2024-01-14T15:45:00Z'
    },
    {
      id: '3',
      name: 'Startup Inovadora',
      slug: 'startup-inov',
      description: 'Empresa em crescimento',
      role: 'manager',
      status: 'trial',
      memberCount: 5,
      plan: 'starter',
      lastAccess: '2024-01-10T09:15:00Z'
    }
  ]);

  useEffect(() => {
    // Se o usuário não estiver logado, redirecionar para login
    if (!user) {
      navigate('/login', { 
        state: { from: location.pathname }
      });
      return;
    }

    // Se o usuário já tem um tenant selecionado, redirecionar
    if (user.selectedTenant) {
      const redirectTo = location.state?.from || '/dashboard';
      navigate(redirectTo);
    }
  }, [user, navigate, location]);

  const getRoleIcon = (role) => {
    switch (role) {
      case 'super_admin':
        return <Crown className="h-4 w-4 text-yellow-600" />;
      case 'admin':
        return <Shield className="h-4 w-4 text-blue-600" />;
      case 'manager':
        return <Users className="h-4 w-4 text-green-600" />;
      default:
        return <Users className="h-4 w-4 text-gray-600" />;
    }
  };

  const getRoleName = (role) => {
    switch (role) {
      case 'super_admin':
        return 'Super Admin';
      case 'admin':
        return 'Administrador';
      case 'manager':
        return 'Gerente';
      case 'user':
        return 'Usuário';
      default:
        return 'Membro';
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return (
          <Badge variant="default" className="bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Ativo
          </Badge>
        );
      case 'trial':
        return (
          <Badge variant="secondary" className="bg-orange-100 text-orange-800">
            <Clock className="h-3 w-3 mr-1" />
            Trial
          </Badge>
        );
      case 'suspended':
        return (
          <Badge variant="destructive">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Suspenso
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            {status}
          </Badge>
        );
    }
  };

  const getPlanName = (plan) => {
    switch (plan) {
      case 'enterprise':
        return 'Enterprise';
      case 'professional':
        return 'Professional';
      case 'starter':
        return 'Starter';
      default:
        return 'Básico';
    }
  };

  const handleSelectTenant = async (tenant) => {
    if (tenant.status === 'suspended') {
      setError('Esta organização está suspensa e não pode ser acessada.');
      return;
    }

    setIsLoading(true);
    setError('');
    setSelectedTenant(tenant);

    try {
      // Simular chamada para API para selecionar tenant
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Aqui seria feita a chamada real para a API
      // await selectTenant(tenant.id);
      
      // Redirecionar baseado no role
      const redirectTo = location.state?.from || 
        (tenant.role === 'super_admin' || tenant.role === 'admin' ? '/admin' : '/dashboard');
      
      navigate(redirectTo);
    } catch (error) {
      console.error('Erro ao selecionar organização:', error);
      setError('Erro ao acessar a organização. Tente novamente.');
    } finally {
      setIsLoading(false);
      setSelectedTenant(null);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  const formatLastAccess = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 p-3 bg-blue-100 rounded-full w-fit">
            <Building2 className="h-12 w-12 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Selecionar Organização
          </h1>
          <p className="text-lg text-gray-600">
            Olá, <strong>{user.name}</strong>! Escolha a organização que deseja acessar.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Tenants Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
          {userTenants.map((tenant) => (
            <Card 
              key={tenant.id} 
              className={`cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 ${
                selectedTenant?.id === tenant.id ? 'ring-2 ring-blue-500' : ''
              } ${
                tenant.status === 'suspended' ? 'opacity-60' : ''
              }`}
              onClick={() => !isLoading && handleSelectTenant(tenant)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    <Building2 className="h-5 w-5 text-gray-600" />
                    <CardTitle className="text-lg">{tenant.name}</CardTitle>
                  </div>
                  {getStatusBadge(tenant.status)}
                </div>
                <CardDescription className="text-sm">
                  {tenant.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Role and Plan */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {getRoleIcon(tenant.role)}
                    <span className="text-sm font-medium">
                      {getRoleName(tenant.role)}
                    </span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {getPlanName(tenant.plan)}
                  </Badge>
                </div>

                {/* Members Count */}
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Users className="h-4 w-4" />
                  <span>{tenant.memberCount} membros</span>
                </div>

                {/* Last Access */}
                <div className="text-xs text-gray-500">
                  Último acesso: {formatLastAccess(tenant.lastAccess)}
                </div>

                {/* Action Button */}
                <Button 
                  className="w-full mt-4" 
                  disabled={isLoading || tenant.status === 'suspended'}
                  variant={tenant.status === 'suspended' ? 'outline' : 'default'}
                >
                  {isLoading && selectedTenant?.id === tenant.id ? (
                    <LoadingSpinner size="sm" className="mr-2" />
                  ) : (
                    <ArrowRight className="h-4 w-4 mr-2" />
                  )}
                  {tenant.status === 'suspended' ? 'Suspenso' : 'Acessar'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* No Tenants Message */}
        {userTenants.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Nenhuma organização encontrada
              </h3>
              <p className="text-gray-600 mb-6">
                Você não está associado a nenhuma organização no momento.
              </p>
              <Button variant="outline">
                Solicitar Acesso
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button 
            variant="outline" 
            onClick={handleLogout}
            className="flex items-center"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sair da Conta
          </Button>
          
          <div className="text-sm text-gray-500 text-center">
            Problemas para acessar? <br />
            <a href="/support" className="text-blue-600 hover:underline">
              Entre em contato com o suporte
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>© 2024 TOIT Nexus. Todos os direitos reservados.</p>
        </div>
      </div>
    </div>
  );
};

export default SelectTenantPage;
