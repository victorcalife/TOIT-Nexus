/**
 * PÁGINA DE GERENCIAMENTO DE PERMISSÕES
 * Interface para gerenciar permissões granulares e roles
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
  Shield,
  Users,
  Key,
  Search,
  Filter,
  Edit,
  Plus,
  Eye,
  Lock,
  Unlock,
  Crown,
  UserCheck,
  Settings,
  Activity,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/use-toast';
import UserPermissionsModal from '../components/permissions/UserPermissionsModal';

export default function PermissionsPage()
{
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [ searchTerm, setSearchTerm ] = useState( '' );
  const [ selectedCategory, setSelectedCategory ] = useState( '' );
  const [ selectedUser, setSelectedUser ] = useState( null );
  const [ showPermissionModal, setShowPermissionModal ] = useState( false );
  const [ activeTab, setActiveTab ] = useState( 'overview' );

  const handleEditUserPermissions = ( userId ) =>
  {
    setSelectedUser( userId );
    setShowPermissionModal( true );
  };

  // Verificar se tem permissão para gerenciar permissões
  if ( !user || ![ 'super_admin', 'tenant_admin' ].includes( user.role ) )
  {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <Shield className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Acesso Restrito</h2>
          <p className="text-gray-600">Você não tem permissão para gerenciar permissões do sistema.</p>
        </div>
      </div>
    );
  }

  // Query para obter permissões e roles
  const { data: permissionsData, isLoading } = useQuery( {
    queryKey: [ 'permissions' ],
    queryFn: async () =>
    {
      const response = await fetch( '/api/permissions', {
        headers: {
          'Authorization': `Bearer ${ localStorage.getItem( 'accessToken' ) }`
        }
      } );

      if ( !response.ok )
      {
        throw new Error( 'Erro ao carregar permissões' );
      }

      return response.json();
    },
    enabled: !!user
  } );

  // Query para usuários com permissões customizadas
  const { data: usersWithPermissions } = useQuery( {
    queryKey: [ 'users-permissions' ],
    queryFn: async () =>
    {
      const response = await fetch( '/api/permissions/users', {
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

  // Query para auditoria de permissões
  const { data: auditData } = useQuery( {
    queryKey: [ 'permissions-audit' ],
    queryFn: async () =>
    {
      const response = await fetch( '/api/permissions/audit?limit=10', {
        headers: {
          'Authorization': `Bearer ${ localStorage.getItem( 'accessToken' ) }`
        }
      } );

      if ( !response.ok )
      {
        throw new Error( 'Erro ao carregar auditoria' );
      }

      return response.json();
    },
    enabled: !!user && user.role === 'super_admin'
  } );

  if ( isLoading )
  {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const permissions = permissionsData?.data?.permissions || {};
  const roles = permissionsData?.data?.roles || {};
  const usersData = usersWithPermissions?.data?.users || [];
  const auditLogs = auditData?.data?.logs || [];

  // Agrupar permissões por categoria
  const permissionCategories = {};
  Object.entries( permissions ).forEach( ( [ key, description ] ) =>
  {
    const category = key.split( '.' )[ 0 ];
    if ( !permissionCategories[ category ] )
    {
      permissionCategories[ category ] = [];
    }
    permissionCategories[ category ].push( { key, description } );
  } );

  const getCategoryIcon = ( category ) =>
  {
    const icons = {
      'users': Users,
      'tenants': Shield,
      'system': Settings,
      'chat': Activity,
      'email': Activity,
      'calendar': Activity,
      'reports': Activity,
      'workflows': Activity,
      'quantum': Activity,
      'mila': Activity
    };
    return icons[ category ] || Key;
  };

  const getRoleBadgeVariant = ( role ) =>
  {
    switch ( role )
    {
      case 'super_admin': return 'destructive';
      case 'admin': return 'default';
      case 'manager': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */ }
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Gerenciamento de Permissões
          </h1>
          <p className="text-gray-600">
            Gerencie roles, permissões e controle de acesso do sistema
          </p>
        </div>

        <div className="flex space-x-2">
          <Button variant="outline" className="flex items-center space-x-2">
            <Activity className="w-4 h-4" />
            <span>Auditoria</span>
          </Button>

          <Button className="flex items-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>Nova Role</span>
          </Button>
        </div>
      </div>

      <Tabs value={ activeTab } onValueChange={ setActiveTab }>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="roles">Roles</TabsTrigger>
          <TabsTrigger value="users">Usuários</TabsTrigger>
          <TabsTrigger value="audit">Auditoria</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Stats Cards */ }
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Permissões</p>
                    <p className="text-3xl font-semibold text-gray-900 mt-2">
                      { Object.keys( permissions ).length }
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                    <Key className="w-6 h-6 text-blue-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Roles Definidas</p>
                    <p className="text-3xl font-semibold text-gray-900 mt-2">
                      { Object.keys( roles ).length }
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                    <Shield className="w-6 h-6 text-green-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Usuários c/ Permissões</p>
                    <p className="text-3xl font-semibold text-gray-900 mt-2">
                      { usersData.length }
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-purple-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Categorias</p>
                    <p className="text-3xl font-semibold text-gray-900 mt-2">
                      { Object.keys( permissionCategories ).length }
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center">
                    <Settings className="w-6 h-6 text-orange-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Matriz de Permissões por Categoria */ }
          <Card>
            <CardHeader>
              <CardTitle>Matriz de Permissões</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                { Object.entries( permissionCategories ).map( ( [ category, perms ] ) =>
                {
                  const IconComponent = getCategoryIcon( category );
                  return (
                    <Card key={ category } className="border-l-4 border-l-blue-500">
                      <CardHeader className="pb-3">
                        <div className="flex items-center space-x-2">
                          <IconComponent className="w-5 h-5 text-blue-500" />
                          <CardTitle className="text-lg capitalize">{ category }</CardTitle>
                          <Badge variant="outline">{ perms.length }</Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          { perms.slice( 0, 5 ).map( ( { key, description } ) => (
                            <div key={ key } className="flex items-center justify-between text-sm">
                              <span className="text-gray-600">{ key.split( '.' )[ 1 ] }</span>
                              <CheckCircle className="w-3 h-3 text-green-500" />
                            </div>
                          ) ) }
                          { perms.length > 5 && (
                            <div className="text-xs text-gray-500 pt-2">
                              +{ perms.length - 5 } mais permissões
                            </div>
                          ) }
                        </div>
                      </CardContent>
                    </Card>
                  );
                } ) }
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roles" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Roles do Sistema</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                { Object.entries( roles ).map( ( [ roleKey, roleData ] ) => (
                  <Card key={ roleKey } className="border">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Crown className="w-5 h-5 text-yellow-500" />
                          <CardTitle className="text-lg">{ roleData.name }</CardTitle>
                        </div>
                        <Badge variant={ getRoleBadgeVariant( roleKey ) }>
                          { roleKey }
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">{ roleData.description }</p>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Permissões:</span>
                          <Badge variant="outline">
                            { roleData.permissions?.length || 0 }
                          </Badge>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          { ( roleData.permissions || [] ).slice( 0, 6 ).map( ( permission ) => (
                            <Badge key={ permission } variant="secondary" className="text-xs">
                              { permission.split( '.' )[ 1 ] || permission }
                            </Badge>
                          ) ) }
                          { ( roleData.permissions || [] ).length > 6 && (
                            <Badge variant="outline" className="text-xs">
                              +{ roleData.permissions.length - 6 }
                            </Badge>
                          ) }
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) ) }
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Usuários com Permissões Customizadas</CardTitle>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar usuários..."
                    value={ searchTerm }
                    onChange={ ( e ) => setSearchTerm( e.target.value ) }
                    className="pl-10 w-64"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              { usersData.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <UserCheck className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p>Nenhum usuário com permissões customizadas</p>
                </div>
              ) : (
                <div className="space-y-4">
                  { usersData.map( ( userData ) => (
                    <div
                      key={ userData.id }
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                          { userData.name?.[ 0 ]?.toUpperCase() }
                        </div>

                        <div>
                          <div className="font-semibold">{ userData.name }</div>
                          <div className="text-sm text-gray-600">{ userData.email }</div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Badge variant={ getRoleBadgeVariant( userData.role ) }>
                          { userData.role }
                        </Badge>

                        <Badge variant="outline">
                          { userData.custom_permissions?.length || 0 } permissões
                        </Badge>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={ () => handleEditUserPermissions( userData.id ) }
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ) ) }
                </div>
              ) }
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="space-y-6">
          { user?.role === 'super_admin' ? (
            <Card>
              <CardHeader>
                <CardTitle>Log de Auditoria de Permissões</CardTitle>
              </CardHeader>
              <CardContent>
                { auditLogs.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Activity className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p>Nenhuma atividade de auditoria registrada</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    { auditLogs.map( ( log, index ) => (
                      <div key={ index } className="flex items-center space-x-4 p-4 border rounded-lg">
                        <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center">
                          <Activity className="w-4 h-4 text-blue-500" />
                        </div>

                        <div className="flex-1">
                          <div className="font-medium">{ log.action }</div>
                          <div className="text-sm text-gray-600">{ log.details }</div>
                        </div>

                        <div className="text-sm text-gray-500">
                          { new Date( log.created_at ).toLocaleString( 'pt-BR' ) }
                        </div>
                      </div>
                    ) ) }
                  </div>
                ) }
              </CardContent>
            </Card>
          ) : (
            <div className="text-center py-12">
              <AlertTriangle className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Acesso Restrito
              </h3>
              <p className="text-gray-600">
                Apenas super administradores podem visualizar logs de auditoria.
              </p>
            </div>
          ) }
        </TabsContent>
      </Tabs>

      {/* Modal de Permissões de Usuário */ }
      <UserPermissionsModal
        isOpen={ showPermissionModal }
        onClose={ () => setShowPermissionModal( false ) }
        userId={ selectedUser }
      />
    </div>
  );
}
