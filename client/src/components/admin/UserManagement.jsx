import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';

import {
  Users,
  UserPlus,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  Shield,
  Key,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  Clock,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Activity,
  Settings,
  Download,
  Upload
} from 'lucide-react';

// Importar sistema de permissões
import { useAuth } from '@/hooks/useAuth';
import { usePermissions } from '@/hooks/usePermissions';

const ROLES = {
  'user': { label: 'Usuário', color: 'bg-blue-100 text-blue-800' },
  'manager': { label: 'Gerente', color: 'bg-green-100 text-green-800' },
  'admin': { label: 'Administrador', color: 'bg-purple-100 text-purple-800' },
  'super_admin': { label: 'Super Admin', color: 'bg-red-100 text-red-800' }
};

const PERMISSIONS = {
  'users.view': 'Visualizar usuários',
  'users.create': 'Criar usuários',
  'users.edit': 'Editar usuários',
  'users.delete': 'Deletar usuários',
  'users.manage_roles': 'Gerenciar roles',
  'users.manage_permissions': 'Gerenciar permissões',
  'chat.view': 'Visualizar chat',
  'chat.send': 'Enviar mensagens',
  'chat.moderate': 'Moderar chat',
  'email.view': 'Visualizar emails',
  'email.send': 'Enviar emails',
  'email.manage': 'Gerenciar emails',
  'calendar.view': 'Visualizar calendário',
  'calendar.create': 'Criar eventos',
  'calendar.edit': 'Editar eventos',
  'reports.view': 'Visualizar relatórios',
  'reports.create': 'Criar relatórios',
  'reports.export': 'Exportar relatórios',
  'workflows.view': 'Visualizar workflows',
  'workflows.create': 'Criar workflows',
  'workflows.execute': 'Executar workflows',
  'quantum.access': 'Acessar funcionalidades quânticas',
  'mila.access': 'Acessar MILA'
};

export default function UserManagement() {
  const { user: currentUser } = useAuth();
  const { hasPermission } = usePermissions();
  const { toast } = useToast();

  // Estado dos usuários
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showPermissionsDialog, setShowPermissionsDialog] = useState(false);

  // Estado dos filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Estado do formulário
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'user',
    isActive: true
  });

  // Estado das permissões
  const [userPermissions, setUserPermissions] = useState([]);
  const [availablePermissions, setAvailablePermissions] = useState(PERMISSIONS);

  useEffect(() => {
    loadUsers();
  }, [currentPage, searchTerm, roleFilter, statusFilter]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams({
        page: currentPage,
        limit: 20,
        ...(searchTerm && { search: searchTerm }),
        ...(roleFilter && { role: roleFilter }),
        ...(statusFilter && { status: statusFilter })
      });

      const response = await fetch(`/api/users?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data.data.users);
        setTotalPages(data.data.pagination.totalPages);
      } else {
        throw new Error('Erro ao carregar usuários');
      }
    } catch (error) {
      console.error('❌ Erro ao carregar usuários:', error);
      toast({
        title: "Erro",
        description: "Falha ao carregar usuários",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Erro",
        description: "Senhas não conferem",
        variant: "destructive"
      });
      return;
    }

    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
          isActive: formData.isActive
        })
      });

      if (response.ok) {
        toast({
          title: "Sucesso",
          description: "Usuário criado com sucesso"
        });
        setShowCreateDialog(false);
        setFormData({
          name: '',
          email: '',
          password: '',
          confirmPassword: '',
          role: 'user',
          isActive: true
        });
        loadUsers();
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao criar usuário');
      }
    } catch (error) {
      console.error('❌ Erro ao criar usuário:', error);
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleEditUser = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch(`/api/users/${selectedUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          role: formData.role,
          isActive: formData.isActive
        })
      });

      if (response.ok) {
        toast({
          title: "Sucesso",
          description: "Usuário atualizado com sucesso"
        });
        setShowEditDialog(false);
        setSelectedUser(null);
        loadUsers();
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao atualizar usuário');
      }
    } catch (error) {
      console.error('❌ Erro ao atualizar usuário:', error);
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm('Tem certeza que deseja deletar este usuário?')) {
      return;
    }

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        toast({
          title: "Sucesso",
          description: "Usuário deletado com sucesso"
        });
        loadUsers();
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao deletar usuário');
      }
    } catch (error) {
      console.error('❌ Erro ao deletar usuário:', error);
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const loadUserPermissions = async (userId) => {
    try {
      const response = await fetch(`/api/permissions/user/${userId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUserPermissions(data.data.permissions.all);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar permissões:', error);
    }
  };

  const handlePermissionChange = async (permission, granted) => {
    try {
      const method = granted ? 'POST' : 'DELETE';
      const url = granted 
        ? `/api/permissions/user/${selectedUser.id}`
        : `/api/permissions/user/${selectedUser.id}/${permission}`;

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        ...(granted && { body: JSON.stringify({ permission }) })
      });

      if (response.ok) {
        toast({
          title: "Sucesso",
          description: `Permissão ${granted ? 'concedida' : 'removida'} com sucesso`
        });
        loadUserPermissions(selectedUser.id);
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao alterar permissão');
      }
    } catch (error) {
      console.error('❌ Erro ao alterar permissão:', error);
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const openEditDialog = (user) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: '',
      confirmPassword: '',
      role: user.role,
      isActive: user.is_active
    });
    setShowEditDialog(true);
  };

  const openPermissionsDialog = (user) => {
    setSelectedUser(user);
    loadUserPermissions(user.id);
    setShowPermissionsDialog(true);
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = !roleFilter || user.role === roleFilter;
    const matchesStatus = !statusFilter || 
                         (statusFilter === 'active' && user.is_active) ||
                         (statusFilter === 'inactive' && !user.is_active);
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  if (!hasPermission('users.view')) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">Acesso Negado</h3>
          <p className="text-gray-600">Você não tem permissão para visualizar usuários.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gerenciamento de Usuários</h1>
          <p className="text-gray-600">Gerencie usuários, roles e permissões do sistema</p>
        </div>
        
        {hasPermission('users.create') && (
          <Button onClick={() => setShowCreateDialog(true)}>
            <UserPlus className="w-4 h-4 mr-2" />
            Novo Usuário
          </Button>
        )}
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-6">
          <div className="flex gap-4 items-center">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Buscar usuários..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrar por role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos os roles</SelectItem>
                {Object.entries(ROLES).map(([value, { label }]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos os status</SelectItem>
                <SelectItem value="active">Ativo</SelectItem>
                <SelectItem value="inactive">Inativo</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Usuários */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Usuários ({filteredUsers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center gap-4">
                    <Avatar>
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-gray-900">{user.name}</h3>
                        <Badge className={ROLES[user.role]?.color}>
                          {ROLES[user.role]?.label}
                        </Badge>
                        {user.is_active ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-500" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{user.email}</p>
                      {user.last_login && (
                        <p className="text-xs text-gray-500">
                          Último login: {new Date(user.last_login).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {hasPermission('users.manage_permissions') && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openPermissionsDialog(user)}
                      >
                        <Key className="w-4 h-4 mr-1" />
                        Permissões
                      </Button>
                    )}
                    
                    {hasPermission('users.edit') && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(user)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    )}
                    
                    {hasPermission('users.delete') && user.id !== currentUser.id && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              
              {filteredUsers.length === 0 && (
                <div className="text-center py-8">
                  <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900">Nenhum usuário encontrado</h3>
                  <p className="text-gray-600">Tente ajustar os filtros ou criar um novo usuário.</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Paginação */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            Anterior
          </Button>
          
          <span className="text-sm text-gray-600">
            Página {currentPage} de {totalPages}
          </span>
          
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
          >
            Próxima
          </Button>
        </div>
      )}

      {/* Dialog Criar Usuário */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Criar Novo Usuário</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleCreateUser} className="space-y-4">
            <div>
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="confirmPassword">Confirmar Senha</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="role">Role</Label>
              <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(ROLES).map(([value, { label }]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              />
              <Label htmlFor="isActive">Usuário ativo</Label>
            </div>
            
            <div className="flex gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)} className="flex-1">
                Cancelar
              </Button>
              <Button type="submit" className="flex-1">
                Criar Usuário
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog Editar Usuário */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Usuário</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleEditUser} className="space-y-4">
            <div>
              <Label htmlFor="editName">Nome</Label>
              <Input
                id="editName"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="editEmail">Email</Label>
              <Input
                id="editEmail"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="editRole">Role</Label>
              <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(ROLES).map(([value, { label }]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="editIsActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              />
              <Label htmlFor="editIsActive">Usuário ativo</Label>
            </div>
            
            <div className="flex gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setShowEditDialog(false)} className="flex-1">
                Cancelar
              </Button>
              <Button type="submit" className="flex-1">
                Salvar Alterações
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog Permissões */}
      <Dialog open={showPermissionsDialog} onOpenChange={setShowPermissionsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Gerenciar Permissões - {selectedUser?.name}
            </DialogTitle>
          </DialogHeader>
          
          <ScrollArea className="h-96">
            <div className="space-y-4">
              {Object.entries(availablePermissions).map(([permission, description]) => (
                <div key={permission} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">{description}</h4>
                    <p className="text-sm text-gray-600">{permission}</p>
                  </div>
                  
                  <Checkbox
                    checked={userPermissions.includes(permission)}
                    onCheckedChange={(checked) => handlePermissionChange(permission, checked)}
                  />
                </div>
              ))}
            </div>
          </ScrollArea>
          
          <div className="flex justify-end pt-4">
            <Button onClick={() => setShowPermissionsDialog(false)}>
              Fechar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
