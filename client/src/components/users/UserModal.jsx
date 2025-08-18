/**
 * MODAL DE USUÁRIO
 * Componente para criar, editar e visualizar usuários
 * 100% JavaScript - SEM TYPESCRIPT
 */

import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  X,
  User,
  Mail,
  Phone,
  Shield,
  Calendar,
  Save,
  Edit,
  Eye,
  Upload,
  Camera
} from 'lucide-react';
import { useToast } from '../hooks/use-toast';

export function UserModal({ 
  isOpen, 
  onClose, 
  user = null, 
  mode = 'view' // view, create, edit
}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    cpf: '',
    phone: '',
    role: 'user',
    is_active: true,
    password: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState({});
  const [activeTab, setActiveTab] = useState('basic');

  // Carregar dados do usuário quando modal abrir
  useEffect(() => {
    if (user && (mode === 'edit' || mode === 'view')) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        cpf: user.cpf || '',
        phone: user.phone || '',
        role: user.role || 'user',
        is_active: user.is_active !== undefined ? user.is_active : true,
        password: '',
        confirmPassword: ''
      });
    } else if (mode === 'create') {
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        cpf: '',
        phone: '',
        role: 'user',
        is_active: true,
        password: '',
        confirmPassword: ''
      });
    }
    setErrors({});
  }, [user, mode, isOpen]);

  // Mutation para criar usuário
  const createUserMutation = useMutation({
    mutationFn: async (userData) => {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify(userData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao criar usuário');
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Usuário criado',
        description: 'Usuário foi criado com sucesso.'
      });
      queryClient.invalidateQueries(['users']);
      onClose();
    },
    onError: (error) => {
      toast({
        title: 'Erro ao criar usuário',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  // Mutation para atualizar usuário
  const updateUserMutation = useMutation({
    mutationFn: async (userData) => {
      const response = await fetch(`/api/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify(userData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao atualizar usuário');
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Usuário atualizado',
        description: 'Usuário foi atualizado com sucesso.'
      });
      queryClient.invalidateQueries(['users']);
      onClose();
    },
    onError: (error) => {
      toast({
        title: 'Erro ao atualizar usuário',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Limpar erro do campo
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.first_name.trim()) {
      newErrors.first_name = 'Nome é obrigatório';
    }

    if (!formData.last_name.trim()) {
      newErrors.last_name = 'Sobrenome é obrigatório';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (mode === 'create' && !formData.password) {
      newErrors.password = 'Senha é obrigatória';
    }

    if (formData.password && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Senhas não conferem';
    }

    if (formData.cpf && !/^\d{11}$|^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(formData.cpf)) {
      newErrors.cpf = 'CPF inválido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const userData = {
      first_name: formData.first_name,
      last_name: formData.last_name,
      email: formData.email,
      cpf: formData.cpf,
      phone: formData.phone,
      role: formData.role,
      is_active: formData.is_active
    };

    if (mode === 'create' && formData.password) {
      userData.password = formData.password;
    }

    if (mode === 'create') {
      createUserMutation.mutate(userData);
    } else if (mode === 'edit') {
      updateUserMutation.mutate(userData);
    }
  };

  const getRoleLabel = (role) => {
    const labels = {
      'super_admin': 'Super Admin',
      'tenant_admin': 'Admin',
      'manager': 'Gerente',
      'user': 'Usuário'
    };
    return labels[role] || role;
  };

  const getModalTitle = () => {
    switch (mode) {
      case 'create': return 'Criar Usuário';
      case 'edit': return 'Editar Usuário';
      case 'view': return 'Visualizar Usuário';
      default: return 'Usuário';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">{getModalTitle()}</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Dados Básicos</TabsTrigger>
              <TabsTrigger value="permissions">Permissões</TabsTrigger>
              <TabsTrigger value="activity">Atividade</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="first_name">Nome *</Label>
                    <Input
                      id="first_name"
                      value={formData.first_name}
                      onChange={(e) => handleInputChange('first_name', e.target.value)}
                      disabled={mode === 'view'}
                      className={errors.first_name ? 'border-red-500' : ''}
                    />
                    {errors.first_name && (
                      <p className="text-sm text-red-500 mt-1">{errors.first_name}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="last_name">Sobrenome *</Label>
                    <Input
                      id="last_name"
                      value={formData.last_name}
                      onChange={(e) => handleInputChange('last_name', e.target.value)}
                      disabled={mode === 'view'}
                      className={errors.last_name ? 'border-red-500' : ''}
                    />
                    {errors.last_name && (
                      <p className="text-sm text-red-500 mt-1">{errors.last_name}</p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    disabled={mode === 'view'}
                    className={errors.email ? 'border-red-500' : ''}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500 mt-1">{errors.email}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="cpf">CPF</Label>
                    <Input
                      id="cpf"
                      value={formData.cpf}
                      onChange={(e) => handleInputChange('cpf', e.target.value)}
                      disabled={mode === 'view'}
                      placeholder="000.000.000-00"
                      className={errors.cpf ? 'border-red-500' : ''}
                    />
                    {errors.cpf && (
                      <p className="text-sm text-red-500 mt-1">{errors.cpf}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="phone">Telefone</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      disabled={mode === 'view'}
                      placeholder="(11) 99999-9999"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="role">Função</Label>
                    <select
                      id="role"
                      value={formData.role}
                      onChange={(e) => handleInputChange('role', e.target.value)}
                      disabled={mode === 'view'}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="user">Usuário</option>
                      <option value="manager">Gerente</option>
                      <option value="tenant_admin">Admin</option>
                      <option value="super_admin">Super Admin</option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="is_active">Status</Label>
                    <select
                      id="is_active"
                      value={formData.is_active ? 'true' : 'false'}
                      onChange={(e) => handleInputChange('is_active', e.target.value === 'true')}
                      disabled={mode === 'view'}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="true">Ativo</option>
                      <option value="false">Inativo</option>
                    </select>
                  </div>
                </div>

                {mode === 'create' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="password">Senha *</Label>
                      <Input
                        id="password"
                        type="password"
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        className={errors.password ? 'border-red-500' : ''}
                      />
                      {errors.password && (
                        <p className="text-sm text-red-500 mt-1">{errors.password}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="confirmPassword">Confirmar Senha *</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                        className={errors.confirmPassword ? 'border-red-500' : ''}
                      />
                      {errors.confirmPassword && (
                        <p className="text-sm text-red-500 mt-1">{errors.confirmPassword}</p>
                      )}
                    </div>
                  </div>
                )}

                {mode !== 'view' && (
                  <div className="flex justify-end space-x-2 pt-4">
                    <Button type="button" variant="outline" onClick={onClose}>
                      Cancelar
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={createUserMutation.isLoading || updateUserMutation.isLoading}
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {mode === 'create' ? 'Criar' : 'Salvar'}
                    </Button>
                  </div>
                )}
              </form>
            </TabsContent>

            <TabsContent value="permissions" className="space-y-4">
              <div className="text-center py-8 text-gray-500">
                <Shield className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p>Gerenciamento de permissões será implementado em breve</p>
              </div>
            </TabsContent>

            <TabsContent value="activity" className="space-y-4">
              {user && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Último Login</Label>
                      <p className="text-sm text-gray-600">
                        {user.last_login ? new Date(user.last_login).toLocaleString('pt-BR') : 'Nunca'}
                      </p>
                    </div>
                    <div>
                      <Label>Total de Logins</Label>
                      <p className="text-sm text-gray-600">{user.login_count || 0}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Criado em</Label>
                      <p className="text-sm text-gray-600">
                        {user.created_at ? new Date(user.created_at).toLocaleString('pt-BR') : '-'}
                      </p>
                    </div>
                    <div>
                      <Label>Atualizado em</Label>
                      <p className="text-sm text-gray-600">
                        {user.updated_at ? new Date(user.updated_at).toLocaleString('pt-BR') : '-'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

export default UserModal;
