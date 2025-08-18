/**
 * PÁGINA DE GERENCIAMENTO DE WORKSPACES
 * Interface para gerenciar espaços de trabalho do tenant
 * 100% JavaScript - SEM TYPESCRIPT
 */

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  Briefcase,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  Users,
  Settings,
  Star,
  Lock,
  Unlock,
  Calendar,
  Activity,
  Folder,
  Share2
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/use-toast';

export default function WorkspacesPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVisibility, setSelectedVisibility] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedWorkspace, setSelectedWorkspace] = useState(null);
  const [showWorkspaceModal, setShowWorkspaceModal] = useState(false);
  const [modalMode, setModalMode] = useState('view'); // view, create, edit

  // Query para listar workspaces
  const { data: workspacesData, isLoading, refetch } = useQuery({
    queryKey: ['workspaces', currentPage, searchTerm, selectedVisibility],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: currentPage,
        limit: 20,
        ...(searchTerm && { search: searchTerm }),
        ...(selectedVisibility && { is_public: selectedVisibility })
      });

      const response = await fetch(`/api/workspaces?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao carregar workspaces');
      }

      return response.json();
    },
    enabled: !!user
  });

  // Mutation para deletar workspace
  const deleteWorkspaceMutation = useMutation({
    mutationFn: async (workspaceId) => {
      const response = await fetch(`/api/workspaces/${workspaceId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao deletar workspace');
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Workspace deletado',
        description: 'Workspace foi removido com sucesso.'
      });
      queryClient.invalidateQueries(['workspaces']);
    },
    onError: (error) => {
      toast({
        title: 'Erro ao deletar',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  const handleDeleteWorkspace = (workspaceId) => {
    if (window.confirm('Tem certeza que deseja deletar este workspace?')) {
      deleteWorkspaceMutation.mutate(workspaceId);
    }
  };

  const handleViewWorkspace = (workspace) => {
    setSelectedWorkspace(workspace);
    setModalMode('view');
    setShowWorkspaceModal(true);
  };

  const handleEditWorkspace = (workspace) => {
    setSelectedWorkspace(workspace);
    setModalMode('edit');
    setShowWorkspaceModal(true);
  };

  const handleCreateWorkspace = () => {
    setSelectedWorkspace(null);
    setModalMode('create');
    setShowWorkspaceModal(true);
  };

  const getColorStyle = (color) => {
    return {
      backgroundColor: color || '#3b82f6',
      width: '12px',
      height: '12px',
      borderRadius: '50%'
    };
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const workspaces = workspacesData?.data?.workspaces || [];
  const pagination = workspacesData?.data?.pagination || {};

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Meus Workspaces
          </h1>
          <p className="text-gray-600">
            Gerencie seus espaços de trabalho e projetos
          </p>
        </div>
        
        <div className="flex space-x-2">
          <Button variant="outline" className="flex items-center space-x-2">
            <Share2 className="w-4 h-4" />
            <span>Compartilhar</span>
          </Button>
          
          <Button onClick={handleCreateWorkspace} className="flex items-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>Novo Workspace</span>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Workspaces</p>
                <p className="text-3xl font-semibold text-gray-900 mt-2">
                  {pagination.total || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Meus Workspaces</p>
                <p className="text-3xl font-semibold text-gray-900 mt-2">
                  {workspaces.filter(w => w.owner_id === user?.id).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                <Star className="w-6 h-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Públicos</p>
                <p className="text-3xl font-semibold text-gray-900 mt-2">
                  {workspaces.filter(w => w.is_public).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                <Unlock className="w-6 h-6 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Privados</p>
                <p className="text-3xl font-semibold text-gray-900 mt-2">
                  {workspaces.filter(w => !w.is_public).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center">
                <Lock className="w-6 h-6 text-orange-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar workspaces..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <select
              value={selectedVisibility}
              onChange={(e) => setSelectedVisibility(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos os tipos</option>
              <option value="true">Públicos</option>
              <option value="false">Privados</option>
            </select>
            
            <Button variant="outline" onClick={() => refetch()}>
              <Filter className="w-4 h-4 mr-2" />
              Filtrar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Workspaces */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {workspaces.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Briefcase className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Nenhum workspace encontrado
            </h3>
            <p className="text-gray-600 mb-4">
              Crie seu primeiro workspace para começar a organizar seus projetos.
            </p>
            <Button onClick={handleCreateWorkspace}>
              <Plus className="w-4 h-4 mr-2" />
              Criar Workspace
            </Button>
          </div>
        ) : (
          workspaces.map((workspace) => (
            <Card key={workspace.id} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div style={getColorStyle(workspace.color)} />
                    <div>
                      <CardTitle className="text-lg">{workspace.name}</CardTitle>
                      <p className="text-sm text-gray-600 mt-1">
                        {workspace.slug}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    {workspace.is_default && (
                      <Badge variant="secondary" className="text-xs">
                        Padrão
                      </Badge>
                    )}
                    {workspace.is_public ? (
                      <Unlock className="w-4 h-4 text-gray-400" />
                    ) : (
                      <Lock className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {workspace.description || 'Sem descrição'}
                </p>
                
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <div className="flex items-center space-x-4">
                    <span className="flex items-center">
                      <Users className="w-3 h-3 mr-1" />
                      {workspace.member_count || 0}
                    </span>
                    <span className="flex items-center">
                      <Folder className="w-3 h-3 mr-1" />
                      {workspace.team_count || 0}
                    </span>
                  </div>
                  
                  <span className="flex items-center">
                    <Calendar className="w-3 h-3 mr-1" />
                    {new Date(workspace.created_at).toLocaleDateString('pt-BR')}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="text-xs text-gray-500">
                    Por: {workspace.owner_name || 'Desconhecido'}
                  </div>
                  
                  <div className="flex space-x-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleViewWorkspace(workspace)}
                    >
                      <Eye className="w-3 h-3" />
                    </Button>
                    
                    {(workspace.owner_id === user?.id || ['super_admin', 'tenant_admin'].includes(user?.role)) && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditWorkspace(workspace)}
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        
                        {!workspace.is_default && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteWorkspace(workspace.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Paginação */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center mt-8 space-x-2">
          <Button
            variant="outline"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            Anterior
          </Button>
          
          <span className="flex items-center px-4">
            Página {currentPage} de {pagination.totalPages}
          </span>
          
          <Button
            variant="outline"
            disabled={currentPage === pagination.totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            Próxima
          </Button>
        </div>
      )}
    </div>
  );
}
