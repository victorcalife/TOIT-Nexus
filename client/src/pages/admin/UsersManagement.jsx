/**
 * Página de Gerenciamento de Usuários - Administração
 * Sistema TOIT Nexus - Módulo Administrador
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import {  
  Users, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff,
  UserPlus,
  UserMinus,
  Shield,
  ShieldCheck,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Building,
  Crown,
  Settings,
  MoreVertical,
  Download,
  Upload,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  Ban
} from 'lucide-react';
import { toast } from 'sonner';

const UsersManagement = () => {
  const [users, setUsers] = useState([
    {
      id: 1,
      name: 'João Silva',
      email: 'joao.silva@empresa.com',
      phone: '(11) 99999-9999',
      role: 'admin',
      tenant: 'Empresa ABC',
      department: 'TI',
      status: 'active',
      lastLogin: '2024-01-15 14:30',
      createdAt: '2023-06-15',
      permissions: ['read', 'write', 'delete', 'admin'],
      avatar: null
    },
    {
      id: 2,
      name: 'Maria Santos',
      email: 'maria.santos@empresa.com',
      phone: '(11) 88888-8888',
      role: 'manager',
      tenant: 'Empresa ABC',
      department: 'Vendas',
      status: 'active',
      lastLogin: '2024-01-15 10:15',
      createdAt: '2023-08-20',
      permissions: ['read', 'write'],
      avatar: null
    },
    {
      id: 3,
      name: 'Pedro Costa',
      email: 'pedro.costa@empresa.com',
      phone: '(11) 77777-7777',
      role: 'user',
      tenant: 'Empresa XYZ',
      department: 'Marketing',
      status: 'inactive',
      lastLogin: '2024-01-10 16:45',
      createdAt: '2023-09-10',
      permissions: ['read'],
      avatar: null
    },
    {
      id: 4,
      name: 'Ana Oliveira',
      email: 'ana.oliveira@empresa.com',
      phone: '(11) 66666-6666',
      role: 'user',
      tenant: 'Empresa ABC',
      department: 'RH',
      status: 'pending',
      lastLogin: null,
      createdAt: '2024-01-14',
      permissions: ['read'],
      avatar: null
    },
    {
      id: 5,
      name: 'Carlos Ferreira',
      email: 'carlos.ferreira@empresa.com',
      phone: '(11) 55555-5555',
      role: 'manager',
      tenant: 'Empresa XYZ',
      department: 'Financeiro',
      status: 'suspended',
      lastLogin: '2024-01-12 09:20',
      createdAt: '2023-07-05',
      permissions: ['read', 'write'],
      avatar: null
    }
  ]);

  const [filteredUsers, setFilteredUsers] = useState(users);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedTenant, setSelectedTenant] = useState('all');
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Filtros únicos
  const roles = [...new Set(users.map(user => user.role))];
  const tenants = [...new Set(users.map(user => user.tenant))];
  const departments = [...new Set(users.map(user => user.department))];

  useEffect(() => {
    let filtered = users;

    // Filtro por termo de busca
    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.department.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro por role
    if (selectedRole !== 'all') {
      filtered = filtered.filter(user => user.role === selectedRole);
    }

    // Filtro por status
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(user => user.status === selectedStatus);
    }

    // Filtro por tenant
    if (selectedTenant !== 'all') {
      filtered = filtered.filter(user => user.tenant === selectedTenant);
    }

    setFilteredUsers(filtered);
  }, [searchTerm, selectedRole, selectedStatus, selectedTenant, users]);

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { label: 'Ativo', className: 'bg-green-100 text-green-800' },
      inactive: { label: 'Inativo', className: 'bg-gray-100 text-gray-800' },
      pending: { label: 'Pendente', className: 'bg-yellow-100 text-yellow-800' },
      suspended: { label: 'Suspenso', className: 'bg-red-100 text-red-800' }
    };
    
    const config = statusConfig[status] || statusConfig.inactive;
    return (
      <Badge className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const getRoleBadge = (role) => {
    const roleConfig = {
      admin: { label: 'Administrador', className: 'bg-purple-100 text-purple-800', icon: Crown },
      manager: { label: 'Gerente', className: 'bg-blue-100 text-blue-800', icon: Shield },
      user: { label: 'Usuário', className: 'bg-gray-100 text-gray-800', icon: Users }
    };
    
    const config = roleConfig[role] || roleConfig.user;
    const Icon = config.icon;
    
    return (
      <Badge className={config.className}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const handleUserAction = (action, user) => {
    setIsLoading(true);
    
    setTimeout(() => {
      switch (action) {
        case 'activate':
          setUsers(prev => prev.map(u => 
            u.id === user.id ? { ...u, status: 'active' } : u
          ));
          toast.success(`Usuário ${user.name} ativado com sucesso!`);
          break;
        case 'deactivate':
          setUsers(prev => prev.map(u => 
            u.id === user.id ? { ...u, status: 'inactive' } : u
          ));
          toast.success(`Usuário ${user.name} desativado com sucesso!`);
          break;
        case 'suspend':
          setUsers(prev => prev.map(u => 
            u.id === user.id ? { ...u, status: 'suspended' } : u
          ));
          toast.success(`Usuário ${user.name} suspenso com sucesso!`);
          break;
        case 'delete':
          if (window.confirm(`Tem certeza que deseja excluir o usuário ${user.name}?`)) {
            setUsers(prev => prev.filter(u => u.id !== user.id));
            toast.success(`Usuário ${user.name} excluído com sucesso!`);
          }
          break;
        case 'reset-password':
          toast.success(`Email de redefinição de senha enviado para ${user.email}`);
          break;
        default:
          break;
      }
      setIsLoading(false);
    }, 1000);
  };

  const handleCreateUser = () => {
    setSelectedUser(null);
    setShowUserModal(true);
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

  const handleExportUsers = () => {
    const dataStr = JSON.stringify(filteredUsers, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'usuarios-toit-nexus.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    toast.success('Lista de usuários exportada com sucesso!');
  };

  const handleBulkAction = (action) => {
    // Implementar ações em lote`
    toast.info(`Ação em lote: ${action} - Em desenvolvimento`);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gerenciamento de Usuários</h1>
          <p className="text-gray-600">Gerencie usuários, permissões e acessos do sistema</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportUsers}>
            <Download className="h-4 w-4 mr-2" />

          <Button onClick={handleCreateUser}>
            <UserPlus className="h-4 w-4 mr-2" />
            Novo Usuário
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Usuários</p>
                <p className="text-2xl font-bold text-gray-900">{users.length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Usuários Ativos</p>
                <p className="text-2xl font-bold text-green-600">
                  {users.filter(u => u.status === 'active').length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pendentes</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {users.filter(u => u.status === 'pending').length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Suspensos</p>
                <p className="text-2xl font-bold text-red-600">
                  {users.filter(u => u.status === 'suspended').length}
                </p>
              </div>
              <Ban className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar por nome, email ou departamento..."
                  value={searchTerm}
                  onChange=({ (e }) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <select
              value={selectedRole}
              onChange=({ (e }) => setSelectedRole(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="all">Todas as Funções</option>
              {roles.map(role => (
                <option key={role} value={role}>
                  {role === 'admin' ? 'Administrador' : 
                   role === 'manager' ? 'Gerente' : 'Usuário'}
                </option>
              ))}
            </select>
            
            <select
              value={selectedStatus}
              onChange=({ (e }) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="all">Todos os Status</option>
              <option value="active">Ativo</option>
              <option value="inactive">Inativo</option>
              <option value="pending">Pendente</option>
              <option value="suspended">Suspenso</option>
            </select>
            
            <select
              value={selectedTenant}
              onChange=({ (e }) => setSelectedTenant(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="all">Todos os Tenants</option>
              {tenants.map(tenant => (
                <option key={tenant} value={tenant}>{tenant}</option>
              ))}
            </select>
            
            <Button variant="outline" onClick=({ ( }) => {
              setSearchTerm('');
              setSelectedRole('all');
              setSelectedStatus('all');
              setSelectedTenant('all');
            }}>
              <RefreshCw className="h-4 w-4 mr-2" />

          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Lista de Usuários ({filteredUsers.length})</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick=({ ( }) => handleBulkAction('activate')}>
                Ativar Selecionados
              </Button>
              <Button variant="outline" size="sm" onClick=({ ( }) => handleBulkAction('deactivate')}>
                Desativar Selecionados
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">
                    <input type="checkbox" className="rounded" />
                  </th>
                  <th className="text-left p-3">Usuário</th>
                  <th className="text-left p-3">Função</th>
                  <th className="text-left p-3">Tenant</th>
                  <th className="text-left p-3">Departamento</th>
                  <th className="text-left p-3">Status</th>
                  <th className="text-left p-3">Último Login</th>
                  <th className="text-left p-3">Ações</th>
                </tr>
              </thead>
              <tbody>
                ({ filteredUsers.map((user }) => (
                  <tr key={user.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">
                      <input type="checkbox" className="rounded" />
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-blue-600">
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{user.name}</p>
                          <p className="text-sm text-gray-600">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      {getRoleBadge(user.role)}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{user.tenant}</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className="text-sm text-gray-600">{user.department}</span>
                    </td>
                    <td className="p-3">
                      {getStatusBadge(user.status)}
                    </td>
                    <td className="p-3">
                      <span className="text-sm text-gray-600">
                        {user.lastLogin ? new Date(user.lastLogin).toLocaleString('pt-BR') : 'Nunca'}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick=({ ( }) => handleEditUser(user)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        
                        ({ user.status === 'active' ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={( }) => handleUserAction('deactivate', user)}
                            disabled={isLoading}
                          >
                            <EyeOff className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick=({ ( }) => handleUserAction('activate', user)}
                            disabled={isLoading}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        )}
                        
                        <Button
                          size="sm"
                          variant="outline"
                          onClick=({ ( }) => handleUserAction('reset-password', user)}
                          disabled={isLoading}
                        >
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                        
                        <Button
                          size="sm"
                          variant="outline"
                          onClick=({ ( }) => handleUserAction('delete', user)}
                          disabled={isLoading}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredUsers.length === 0 && (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Nenhum usuário encontrado com os filtros aplicados</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* User Modal - Placeholder */}
      {showUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <h2 className="text-xl font-bold mb-4">
              {selectedUser ? 'Editar Usuário' : 'Novo Usuário'}
            </h2>
            <p className="text-gray-600 mb-4">
              Modal de criação/edição de usuário - Em desenvolvimento
            </p>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick=({ ( }) => setShowUserModal(false)}>

              <Button onClick=({ ( }) => {
                setShowUserModal(false);
                toast.success(selectedUser ? 'Usuário atualizado!' : 'Usuário criado!');
              }}>
                {selectedUser ? 'Atualizar' : 'Criar'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersManagement;`