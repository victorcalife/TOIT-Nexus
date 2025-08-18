/**
 * PÁGINA DE GERENCIAMENTO DE USUÁRIOS
 * Interface completa para CRUD de usuários
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
  Users,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  UserCheck,
  UserX,
  Mail,
  Phone,
  Calendar,
  Shield,
  Settings,
  Download,
  Upload
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/use-toast';
import UserModal from '../components/users/UserModal';

export default function UsersPage()
{
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [ searchTerm, setSearchTerm ] = useState( '' );
  const [ selectedRole, setSelectedRole ] = useState( '' );
  const [ selectedStatus, setSelectedStatus ] = useState( '' );
  const [ currentPage, setCurrentPage ] = useState( 1 );
  const [ selectedUser, setSelectedUser ] = useState( null );
  const [ showUserModal, setShowUserModal ] = useState( false );
  const [ modalMode, setModalMode ] = useState( 'view' ); // view, create, edit

  // Query para listar usuários
  const { data: usersData, isLoading, refetch } = useQuery( {
    queryKey: [ 'users', currentPage, searchTerm, selectedRole, selectedStatus ],
    queryFn: async () =>
    {
      const params = new URLSearchParams( {
        page: currentPage,
        limit: 20,
        ...( searchTerm && { search: searchTerm } ),
        ...( selectedRole && { role: selectedRole } ),
        ...( selectedStatus && { status: selectedStatus } )
      } );

      const response = await fetch( `/api/users?${ params }`, {
        headers: {
          'Authorization': `Bearer ${ localStorage.getItem( 'accessToken' ) }`
        }
      } );

      if ( !response.ok )
      {
        throw new Error( 'Erro ao carregar usuários' );
      }

      return response.json();
    },
    enabled: !!user
  } );

  // Mutation para deletar usuário
  const deleteUserMutation = useMutation( {
    mutationFn: async ( userId ) =>
    {
      const response = await fetch( `/api/users/${ userId }`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${ localStorage.getItem( 'accessToken' ) }`
        }
      } );

      if ( !response.ok )
      {
        const error = await response.json();
        throw new Error( error.error || 'Erro ao deletar usuário' );
      }

      return response.json();
    },
    onSuccess: () =>
    {
      toast( {
        title: 'Usuário deletado',
        description: 'Usuário foi removido com sucesso.'
      } );
      queryClient.invalidateQueries( [ 'users' ] );
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

  // Mutation para ativar/desativar usuário
  const toggleUserStatusMutation = useMutation( {
    mutationFn: async ( { userId, isActive } ) =>
    {
      const response = await fetch( `/api/users/${ userId }`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${ localStorage.getItem( 'accessToken' ) }`
        },
        body: JSON.stringify( { is_active: !isActive } )
      } );

      if ( !response.ok )
      {
        const error = await response.json();
        throw new Error( error.error || 'Erro ao alterar status' );
      }

      return response.json();
    },
    onSuccess: ( data, variables ) =>
    {
      toast( {
        title: 'Status alterado',
        description: `Usuário ${ variables.isActive ? 'desativado' : 'ativado' } com sucesso.`
      } );
      queryClient.invalidateQueries( [ 'users' ] );
    },
    onError: ( error ) =>
    {
      toast( {
        title: 'Erro ao alterar status',
        description: error.message,
        variant: 'destructive'
      } );
    }
  } );

  const handleDeleteUser = ( userId ) =>
  {
    if ( window.confirm( 'Tem certeza que deseja deletar este usuário?' ) )
    {
      deleteUserMutation.mutate( userId );
    }
  };

  const handleToggleStatus = ( userId, isActive ) =>
  {
    toggleUserStatusMutation.mutate( { userId, isActive } );
  };

  const handleViewUser = ( user ) =>
  {
    setSelectedUser( user );
    setModalMode( 'view' );
    setShowUserModal( true );
  };

  const handleEditUser = ( user ) =>
  {
    setSelectedUser( user );
    setModalMode( 'edit' );
    setShowUserModal( true );
  };

  const handleCreateUser = () =>
  {
    setSelectedUser( null );
    setModalMode( 'create' );
    setShowUserModal( true );
  };

  const getRoleBadgeVariant = ( role ) =>
  {
    switch ( role )
    {
      case 'super_admin': return 'destructive';
      case 'tenant_admin': return 'default';
      case 'manager': return 'secondary';
      default: return 'outline';
    }
  };

  const getRoleLabel = ( role ) =>
  {
    const labels = {
      'super_admin': 'Super Admin',
      'tenant_admin': 'Admin',
      'manager': 'Gerente',
      'user': 'Usuário'
    };
    return labels[ role ] || role;
  };

  if ( isLoading )
  {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const users = usersData?.data?.users || [];
  const pagination = usersData?.data?.pagination || {};

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */ }
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Gerenciamento de Usuários
          </h1>
          <p className="text-gray-600">
            Gerencie usuários, permissões e acessos do sistema
          </p>
        </div>

        <div className="flex space-x-2">
          <Button variant="outline" className="flex items-center space-x-2">
            <Download className="w-4 h-4" />
            <span>Exportar</span>
          </Button>

          <Button onClick={ handleCreateUser } className="flex items-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>Novo Usuário</span>
          </Button>
        </div>
      </div>

      {/* Filtros */ }
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar usuários..."
                value={ searchTerm }
                onChange={ ( e ) => setSearchTerm( e.target.value ) }
                className="pl-10"
              />
            </div>

            <select
              value={ selectedRole }
              onChange={ ( e ) => setSelectedRole( e.target.value ) }
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todas as funções</option>
              <option value="super_admin">Super Admin</option>
              <option value="tenant_admin">Admin</option>
              <option value="manager">Gerente</option>
              <option value="user">Usuário</option>
            </select>

            <select
              value={ selectedStatus }
              onChange={ ( e ) => setSelectedStatus( e.target.value ) }
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos os status</option>
              <option value="active">Ativo</option>
              <option value="inactive">Inativo</option>
            </select>

            <Button variant="outline" onClick={ () => refetch() }>
              <Filter className="w-4 h-4 mr-2" />
              Filtrar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Usuários */ }
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="w-5 h-5" />
            <span>Usuários ({ pagination.total || 0 })</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          { users.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Nenhum usuário encontrado
            </div>
          ) : (
            <div className="space-y-4">
              { users.map( ( user ) => (
                <div
                  key={ user.id }
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                      { user.first_name?.[ 0 ] }{ user.last_name?.[ 0 ] }
                    </div>

                    <div>
                      <div className="font-semibold">
                        { user.first_name } { user.last_name }
                      </div>
                      <div className="text-sm text-gray-600 flex items-center space-x-4">
                        <span className="flex items-center">
                          <Mail className="w-3 h-3 mr-1" />
                          { user.email }
                        </span>
                        { user.phone && (
                          <span className="flex items-center">
                            <Phone className="w-3 h-3 mr-1" />
                            { user.phone }
                          </span>
                        ) }
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Badge variant={ getRoleBadgeVariant( user.role ) }>
                      { getRoleLabel( user.role ) }
                    </Badge>

                    <Badge variant={ user.is_active ? 'default' : 'secondary' }>
                      { user.is_active ? 'Ativo' : 'Inativo' }
                    </Badge>

                    <div className="flex space-x-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={ () => handleViewUser( user ) }
                      >
                        <Eye className="w-4 h-4" />
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={ () => handleEditUser( user ) }
                      >
                        <Edit className="w-4 h-4" />
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={ () => handleToggleStatus( user.id, user.is_active ) }
                      >
                        { user.is_active ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" /> }
                      </Button>

                      { user.id !== user.id && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={ () => handleDeleteUser( user.id ) }
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

      {/* Modal de Usuário */ }
      <UserModal
        isOpen={ showUserModal }
        onClose={ () => setShowUserModal( false ) }
        user={ selectedUser }
        mode={ modalMode }
      />
    </div>
  );
}
