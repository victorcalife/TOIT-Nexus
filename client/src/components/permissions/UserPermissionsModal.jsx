/**
 * MODAL DE PERMISSÕES DE USUÁRIO
 * Componente para gerenciar permissões específicas de um usuário
 * 100% JavaScript - SEM TYPESCRIPT
 */

import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  X,
  User,
  Shield,
  Key,
  Plus,
  Minus,
  Save,
  Search,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Crown
} from 'lucide-react';
import { useToast } from '../hooks/use-toast';

export function UserPermissionsModal({ 
  isOpen, 
  onClose, 
  userId = null
}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [userPermissions, setUserPermissions] = useState([]);
  const [pendingChanges, setPendingChanges] = useState([]);

  // Query para obter dados do usuário
  const { data: userData, isLoading: userLoading } = useQuery({
    queryKey: ['user', userId],
    queryFn: async () => {
      const response = await fetch(`/api/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao carregar usuário');
      }

      return response.json();
    },
    enabled: !!userId && isOpen
  });

  // Query para obter permissões disponíveis
  const { data: permissionsData, isLoading: permissionsLoading } = useQuery({
    queryKey: ['permissions'],
    queryFn: async () => {
      const response = await fetch('/api/permissions', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao carregar permissões');
      }

      return response.json();
    },
    enabled: isOpen
  });

  // Query para obter permissões customizadas do usuário
  const { data: userPermissionsData } = useQuery({
    queryKey: ['user-permissions', userId],
    queryFn: async () => {
      const response = await fetch(`/api/permissions/user/${userId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao carregar permissões do usuário');
      }

      return response.json();
    },
    enabled: !!userId && isOpen
  });

  // Carregar permissões do usuário quando dados chegarem
  useEffect(() => {
    if (userPermissionsData?.data?.permissions) {
      setUserPermissions(userPermissionsData.data.permissions);
    }
  }, [userPermissionsData]);

  // Mutation para adicionar permissão
  const addPermissionMutation = useMutation({
    mutationFn: async (permission) => {
      const response = await fetch(`/api/permissions/user/${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({ permission })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao adicionar permissão');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['user-permissions', userId]);
      queryClient.invalidateQueries(['users-permissions']);
    }
  });

  // Mutation para remover permissão
  const removePermissionMutation = useMutation({
    mutationFn: async (permission) => {
      const response = await fetch(`/api/permissions/user/${userId}/${permission}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao remover permissão');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['user-permissions', userId]);
      queryClient.invalidateQueries(['users-permissions']);
    }
  });

  const handleAddPermission = (permission) => {
    addPermissionMutation.mutate(permission, {
      onSuccess: () => {
        toast({
          title: 'Permissão adicionada',
          description: `Permissão ${permission} foi adicionada ao usuário.`
        });
      },
      onError: (error) => {
        toast({
          title: 'Erro ao adicionar permissão',
          description: error.message,
          variant: 'destructive'
        });
      }
    });
  };

  const handleRemovePermission = (permission) => {
    removePermissionMutation.mutate(permission, {
      onSuccess: () => {
        toast({
          title: 'Permissão removida',
          description: `Permissão ${permission} foi removida do usuário.`
        });
      },
      onError: (error) => {
        toast({
          title: 'Erro ao remover permissão',
          description: error.message,
          variant: 'destructive'
        });
      }
    });
  };

  if (!isOpen) return null;

  if (userLoading || permissionsLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  const user = userData?.data?.user;
  const permissions = permissionsData?.data?.permissions || {};
  const roles = permissionsData?.data?.roles || {};

  // Agrupar permissões por categoria
  const permissionCategories = {};
  Object.entries(permissions).forEach(([key, description]) => {
    const category = key.split('.')[0];
    if (!permissionCategories[category]) {
      permissionCategories[category] = [];
    }
    permissionCategories[category].push({ key, description });
  });

  // Filtrar permissões
  const filteredCategories = {};
  Object.entries(permissionCategories).forEach(([category, perms]) => {
    if (!selectedCategory || category === selectedCategory) {
      const filteredPerms = perms.filter(({ key, description }) =>
        key.toLowerCase().includes(searchTerm.toLowerCase()) ||
        description.toLowerCase().includes(searchTerm.toLowerCase())
      );
      if (filteredPerms.length > 0) {
        filteredCategories[category] = filteredPerms;
      }
    }
  });

  // Obter permissões da role do usuário
  const rolePermissions = roles[user?.role]?.permissions || [];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
              {user?.first_name?.[0]}{user?.last_name?.[0]}
            </div>
            <div>
              <h2 className="text-xl font-semibold">
                Permissões de {user?.first_name} {user?.last_name}
              </h2>
              <p className="text-sm text-gray-600">{user?.email}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="p-6">
          {/* Info do usuário */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Crown className="w-5 h-5 text-yellow-500" />
                <div>
                  <p className="font-medium">Role Atual: {user?.role}</p>
                  <p className="text-sm text-gray-600">
                    {roles[user?.role]?.description || 'Sem descrição'}
                  </p>
                </div>
              </div>
              <Badge variant="outline">
                {rolePermissions.length} permissões da role
              </Badge>
            </div>
          </div>

          {/* Filtros */}
          <div className="mb-6 flex space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar permissões..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todas as categorias</option>
              {Object.keys(permissionCategories).map((category) => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Lista de permissões por categoria */}
          <div className="space-y-6">
            {Object.entries(filteredCategories).map(([category, perms]) => (
              <Card key={category}>
                <CardHeader>
                  <CardTitle className="text-lg capitalize flex items-center space-x-2">
                    <Key className="w-5 h-5" />
                    <span>{category}</span>
                    <Badge variant="outline">{perms.length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {perms.map(({ key, description }) => {
                      const hasCustomPermission = userPermissions.includes(key);
                      const hasRolePermission = rolePermissions.includes(key);
                      const hasPermission = hasCustomPermission || hasRolePermission;

                      return (
                        <div
                          key={key}
                          className={`flex items-center justify-between p-3 border rounded-lg ${
                            hasPermission ? 'bg-green-50 border-green-200' : 'bg-gray-50'
                          }`}
                        >
                          <div className="flex-1">
                            <div className="font-medium text-sm">{key}</div>
                            <div className="text-xs text-gray-600">{description}</div>
                            {hasRolePermission && (
                              <Badge variant="secondary" className="text-xs mt-1">
                                Via role
                              </Badge>
                            )}
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            {hasPermission ? (
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            ) : (
                              <XCircle className="w-4 h-4 text-gray-400" />
                            )}
                            
                            {hasCustomPermission ? (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleRemovePermission(key)}
                                disabled={removePermissionMutation.isLoading}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Minus className="w-3 h-3" />
                              </Button>
                            ) : !hasRolePermission ? (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleAddPermission(key)}
                                disabled={addPermissionMutation.isLoading}
                                className="text-green-600 hover:text-green-700"
                              >
                                <Plus className="w-3 h-3" />
                              </Button>
                            ) : (
                              <div className="w-8 h-8" /> // Espaço vazio para alinhamento
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Resumo */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Shield className="w-5 h-5 text-blue-500" />
              <h3 className="font-medium">Resumo de Permissões</h3>
            </div>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium">Role:</span> {rolePermissions.length} permissões
              </div>
              <div>
                <span className="font-medium">Customizadas:</span> {userPermissions.length} permissões
              </div>
              <div>
                <span className="font-medium">Total:</span> {
                  new Set([...rolePermissions, ...userPermissions]).size
                } permissões únicas
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserPermissionsModal;
