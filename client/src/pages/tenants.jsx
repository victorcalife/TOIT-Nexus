/**
 * PÁGINA DE GERENCIAMENTO DE TENANTS
 * Interface para super_admin gerenciar organizações
 * 100% JavaScript - SEM TYPESCRIPT
 */

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import
{
  Building,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  Users,
  Briefcase,
  Globe,
  Settings,
  Crown,
  Calendar,
  DollarSign,
  Database,
  Shield
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/use-toast';
import TenantModal from '../components/tenants/TenantModal';

export default function TenantsPage()
{
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [ searchTerm, setSearchTerm ] = useState( '' );
  const [ selectedStatus, setSelectedStatus ] = useState( '' );
  const [ selectedPlan, setSelectedPlan ] = useState( '' );
  const [ currentPage, setCurrentPage ] = useState( 1 );
  const [ selectedTenant, setSelectedTenant ] = useState( null );
  const [ showTenantModal, setShowTenantModal ] = useState( false );
  const [ modalMode, setModalMode ] = useState( 'view' ); // view, create, edit

  // Verificar se é super admin
  if ( user?.role !== 'super_admin' )
  {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <Shield className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Acesso Restrito</h2>
          <p className="text-gray-600">Apenas super administradores podem acessar esta página.</p>
        </div>
      </div>
    );
  }

  // Query para listar tenants
  const { data: tenantsData, isLoading, refetch } = useQuery( {
    queryKey: [ 'tenants', currentPage, searchTerm, selectedStatus, selectedPlan ],
    queryFn: async () =>
    {
      const params = new URLSearchParams( {
        page: currentPage,
        limit: 20,
        ...( searchTerm && { search: searchTerm } ),
        ...( selectedStatus && { status: selectedStatus } ),
        ...( selectedPlan && { subscription_plan: selectedPlan } )
      } );

      const response = await fetch( `/api/tenants?${ params }`, {
        headers: {
          'Authorization': `Bearer ${ localStorage.getItem( 'accessToken' ) }`
        }
      } );

      if ( !response.ok )
      {
        throw new Error( 'Erro ao carregar tenants' );
      }

      return response.json();
    },
    enabled: !!user
  } );

  // Mutation para deletar tenant
  const deleteTenantMutation = useMutation( {
    mutationFn: async ( tenantId ) =>
    {
      const response = await fetch( `/api/tenants/${ tenantId }`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${ localStorage.getItem( 'accessToken' ) }`
        }
      } );

      if ( !response.ok )
      {
        const error = await response.json();
        throw new Error( error.error || 'Erro ao deletar tenant' );
      }

      return response.json();
    },
    onSuccess: () =>
    {
      toast( {
        title: 'Tenant deletado',
        description: 'Tenant foi removido com sucesso.'
      } );
      queryClient.invalidateQueries( [ 'tenants' ] );
    },
    onError: ( error ) =>
    {
      toast( {
        title: 'Erro ao deletar',
        description: error.message,
        variant: 'destructive'
      } );
    }
  } );

  const handleDeleteTenant = ( tenantId ) =>
  {
    if ( window.confirm( 'Tem certeza que deseja deletar este tenant? Esta ação não pode ser desfeita.' ) )
    {
      deleteTenantMutation.mutate( tenantId );
    }
  };

  const handleViewTenant = ( tenant ) =>
  {
    setSelectedTenant( tenant );
    setModalMode( 'view' );
    setShowTenantModal( true );
  };

  const handleEditTenant = ( tenant ) =>
  {
    setSelectedTenant( tenant );
    setModalMode( 'edit' );
    setShowTenantModal( true );
  };

  const handleCreateTenant = () =>
  {
    setSelectedTenant( null );
    setModalMode( 'create' );
    setShowTenantModal( true );
  };

  const getStatusBadgeVariant = ( status ) =>
  {
    switch ( status )
    {
      case 'active': return 'default';
      case 'trial': return 'secondary';
      case 'suspended': return 'destructive';
      case 'inactive': return 'outline';
      default: return 'outline';
    }
  };

  const getPlanBadgeVariant = ( plan ) =>
  {
    switch ( plan )
    {
      case 'enterprise': return 'destructive';
      case 'pro': return 'default';
      case 'standard': return 'secondary';
      case 'free': return 'outline';
      default: return 'outline';
    }
  };

  const getPlanLabel = ( plan ) =>
  {
    const labels = {
      'free': 'Gratuito',
      'standard': 'Padrão',
      'pro': 'Profissional',
      'enterprise': 'Empresarial'
    };
    return labels[ plan ] || plan;
  };

  const getStatusLabel = ( status ) =>
  {
    const labels = {
      'active': 'Ativo',
      'trial': 'Trial',
      'suspended': 'Suspenso',
      'inactive': 'Inativo'
    };
    return labels[ status ] || status;
  };

  if ( isLoading )
  {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const tenants = tenantsData?.data?.tenants || [];
  const pagination = tenantsData?.data?.pagination || {};

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */ }
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Gerenciamento de Tenants
          </h1>
          <p className="text-gray-600">
            Gerencie organizações, planos e configurações do sistema
          </p>
        </div>

        <div className="flex space-x-2">
          <Button variant="outline" className="flex items-center space-x-2">
            <Database className="w-4 h-4" />
            <span>Relatório</span>
          </Button>

          <Button onClick={ handleCreateTenant } className="flex items-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>Novo Tenant</span>
          </Button>
        </div>
      </div>

      {/* Stats Cards */ }
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Tenants</p>
                <p className="text-3xl font-semibold text-gray-900 mt-2">
                  { pagination.total || 0 }
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <Building className="w-6 h-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tenants Ativos</p>
                <p className="text-3xl font-semibold text-gray-900 mt-2">
                  { tenants.filter( t => t.status === 'active' ).length }
                </p>
              </div>
              <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                <Crown className="w-6 h-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Planos Enterprise</p>
                <p className="text-3xl font-semibold text-gray-900 mt-2">
                  { tenants.filter( t => t.subscription_plan === 'enterprise' ).length }
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Em Trial</p>
                <p className="text-3xl font-semibold text-gray-900 mt-2">
                  { tenants.filter( t => t.status === 'trial' ).length }
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-orange-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */ }
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar tenants..."
                value={ searchTerm }
                onChange={ ( e ) => setSearchTerm( e.target.value ) }
                className="pl-10"
              />
            </div>

            <select
              value={ selectedStatus }
              onChange={ ( e ) => setSelectedStatus( e.target.value ) }
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos os status</option>
              <option value="active">Ativo</option>
              <option value="trial">Trial</option>
              <option value="suspended">Suspenso</option>
              <option value="inactive">Inativo</option>
            </select>

            <select
              value={ selectedPlan }
              onChange={ ( e ) => setSelectedPlan( e.target.value ) }
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos os planos</option>
              <option value="free">Gratuito</option>
              <option value="standard">Padrão</option>
              <option value="pro">Profissional</option>
              <option value="enterprise">Empresarial</option>
            </select>

            <Button variant="outline" onClick={ () => refetch() }>
              <Filter className="w-4 h-4 mr-2" />
              Filtrar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Tenants */ }
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Building className="w-5 h-5" />
            <span>Tenants ({ pagination.total || 0 })</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          { tenants.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Nenhum tenant encontrado
            </div>
          ) : (
            <div className="space-y-4">
              { tenants.map( ( tenant ) => (
                <div
                  key={ tenant.id }
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-semibold">
                      { tenant.name?.[ 0 ]?.toUpperCase() }
                    </div>

                    <div>
                      <div className="font-semibold text-lg">
                        { tenant.name }
                      </div>
                      <div className="text-sm text-gray-600 flex items-center space-x-4">
                        <span className="flex items-center">
                          <Globe className="w-3 h-3 mr-1" />
                          { tenant.slug }
                        </span>
                        { tenant.domain && (
                          <span className="flex items-center">
                            <Globe className="w-3 h-3 mr-1" />
                            { tenant.domain }
                          </span>
                        ) }
                        <span className="flex items-center">
                          <Users className="w-3 h-3 mr-1" />
                          { tenant.active_users || 0 } usuários
                        </span>
                        <span className="flex items-center">
                          <Briefcase className="w-3 h-3 mr-1" />
                          { tenant.active_workspaces || 0 } workspaces
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Badge variant={ getPlanBadgeVariant( tenant.subscription_plan ) }>
                      { getPlanLabel( tenant.subscription_plan ) }
                    </Badge>

                    <Badge variant={ getStatusBadgeVariant( tenant.status ) }>
                      { getStatusLabel( tenant.status ) }
                    </Badge>

                    <div className="flex space-x-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={ () => handleViewTenant( tenant ) }
                      >
                        <Eye className="w-4 h-4" />
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={ () => handleEditTenant( tenant ) }
                      >
                        <Edit className="w-4 h-4" />
                      </Button>

                      { tenant.slug !== 'toit' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={ () => handleDeleteTenant( tenant.id ) }
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      ) }
                    </div>
                  </div>
                </div>
              ) ) }
            </div>
          ) }

          {/* Paginação */ }
          { pagination.totalPages > 1 && (
            <div className="flex justify-center mt-6 space-x-2">
              <Button
                variant="outline"
                disabled={ currentPage === 1 }
                onClick={ () => setCurrentPage( currentPage - 1 ) }
              >
                Anterior
              </Button>

              <span className="flex items-center px-4">
                Página { currentPage } de { pagination.totalPages }
              </span>

              <Button
                variant="outline"
                disabled={ currentPage === pagination.totalPages }
                onClick={ () => setCurrentPage( currentPage + 1 ) }
              >
                Próxima
              </Button>
            </div>
          ) }
        </CardContent>
      </Card>

      {/* Modal de Tenant */ }
      <TenantModal
        isOpen={ showTenantModal }
        onClose={ () => setShowTenantModal( false ) }
        tenant={ selectedTenant }
        mode={ modalMode }
      />
    </div>
  );
}
