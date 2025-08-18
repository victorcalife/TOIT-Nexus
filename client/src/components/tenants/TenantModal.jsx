/**
 * MODAL DE TENANT
 * Componente para criar, editar e visualizar tenants
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
  Building,
  Globe,
  Mail,
  Phone,
  MapPin,
  Settings,
  Crown,
  Users,
  Database,
  Save,
  Calendar,
  DollarSign
} from 'lucide-react';
import { useToast } from '../hooks/use-toast';

export function TenantModal({ 
  isOpen, 
  onClose, 
  tenant = null, 
  mode = 'view' // view, create, edit
}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    domain: '',
    email: '',
    phone: '',
    website: '',
    address: '',
    subscription_plan: 'free',
    status: 'active',
    max_users: 10,
    max_workspaces: 5,
    max_storage_gb: 1,
    settings: {},
    features: {},
    branding: {}
  });

  const [errors, setErrors] = useState({});
  const [activeTab, setActiveTab] = useState('basic');

  // Carregar dados do tenant quando modal abrir
  useEffect(() => {
    if (tenant && (mode === 'edit' || mode === 'view')) {
      setFormData({
        name: tenant.name || '',
        slug: tenant.slug || '',
        domain: tenant.domain || '',
        email: tenant.email || '',
        phone: tenant.phone || '',
        website: tenant.website || '',
        address: tenant.address || '',
        subscription_plan: tenant.subscription_plan || 'free',
        status: tenant.status || 'active',
        max_users: tenant.max_users || 10,
        max_workspaces: tenant.max_workspaces || 5,
        max_storage_gb: tenant.max_storage_gb || 1,
        settings: tenant.settings || {},
        features: tenant.features || {},
        branding: tenant.branding || {}
      });
    } else if (mode === 'create') {
      setFormData({
        name: '',
        slug: '',
        domain: '',
        email: '',
        phone: '',
        website: '',
        address: '',
        subscription_plan: 'free',
        status: 'active',
        max_users: 10,
        max_workspaces: 5,
        max_storage_gb: 1,
        settings: {},
        features: {},
        branding: {}
      });
    }
    setErrors({});
  }, [tenant, mode, isOpen]);

  // Mutation para criar tenant
  const createTenantMutation = useMutation({
    mutationFn: async (tenantData) => {
      const response = await fetch('/api/tenants', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify(tenantData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao criar tenant');
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Tenant criado',
        description: 'Tenant foi criado com sucesso.'
      });
      queryClient.invalidateQueries(['tenants']);
      onClose();
    },
    onError: (error) => {
      toast({
        title: 'Erro ao criar tenant',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  // Mutation para atualizar tenant
  const updateTenantMutation = useMutation({
    mutationFn: async (tenantData) => {
      const response = await fetch(`/api/tenants/${tenant.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify(tenantData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao atualizar tenant');
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Tenant atualizado',
        description: 'Tenant foi atualizado com sucesso.'
      });
      queryClient.invalidateQueries(['tenants']);
      onClose();
    },
    onError: (error) => {
      toast({
        title: 'Erro ao atualizar tenant',
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
    
    // Auto-gerar slug baseado no nome
    if (field === 'name' && mode === 'create') {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      setFormData(prev => ({
        ...prev,
        slug: slug
      }));
    }
    
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

    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }

    if (!formData.slug.trim()) {
      newErrors.slug = 'Slug é obrigatório';
    } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      newErrors.slug = 'Slug deve conter apenas letras minúsculas, números e hífens';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (formData.domain && !/^[a-z0-9.-]+\.[a-z]{2,}$/.test(formData.domain)) {
      newErrors.domain = 'Domínio inválido';
    }

    if (formData.max_users < 1) {
      newErrors.max_users = 'Máximo de usuários deve ser pelo menos 1';
    }

    if (formData.max_workspaces < 1) {
      newErrors.max_workspaces = 'Máximo de workspaces deve ser pelo menos 1';
    }

    if (formData.max_storage_gb < 1) {
      newErrors.max_storage_gb = 'Máximo de armazenamento deve ser pelo menos 1GB';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const tenantData = {
      name: formData.name,
      slug: formData.slug,
      domain: formData.domain || null,
      email: formData.email,
      phone: formData.phone || null,
      website: formData.website || null,
      address: formData.address || null,
      subscription_plan: formData.subscription_plan,
      status: formData.status,
      max_users: parseInt(formData.max_users),
      max_workspaces: parseInt(formData.max_workspaces),
      max_storage_gb: parseInt(formData.max_storage_gb),
      settings: formData.settings,
      features: formData.features,
      branding: formData.branding
    };

    if (mode === 'create') {
      createTenantMutation.mutate(tenantData);
    } else if (mode === 'edit') {
      updateTenantMutation.mutate(tenantData);
    }
  };

  const getModalTitle = () => {
    switch (mode) {
      case 'create': return 'Criar Tenant';
      case 'edit': return 'Editar Tenant';
      case 'view': return 'Visualizar Tenant';
      default: return 'Tenant';
    }
  };

  const getPlanLabel = (plan) => {
    const labels = {
      'free': 'Gratuito',
      'standard': 'Padrão',
      'pro': 'Profissional',
      'enterprise': 'Empresarial'
    };
    return labels[plan] || plan;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">{getModalTitle()}</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Dados Básicos</TabsTrigger>
              <TabsTrigger value="limits">Limites</TabsTrigger>
              <TabsTrigger value="settings">Configurações</TabsTrigger>
              <TabsTrigger value="stats">Estatísticas</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Nome *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      disabled={mode === 'view'}
                      className={errors.name ? 'border-red-500' : ''}
                    />
                    {errors.name && (
                      <p className="text-sm text-red-500 mt-1">{errors.name}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="slug">Slug *</Label>
                    <Input
                      id="slug"
                      value={formData.slug}
                      onChange={(e) => handleInputChange('slug', e.target.value)}
                      disabled={mode === 'view' || (mode === 'edit' && tenant?.slug === 'toit')}
                      className={errors.slug ? 'border-red-500' : ''}
                    />
                    {errors.slug && (
                      <p className="text-sm text-red-500 mt-1">{errors.slug}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
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

                  <div>
                    <Label htmlFor="domain">Domínio</Label>
                    <Input
                      id="domain"
                      value={formData.domain}
                      onChange={(e) => handleInputChange('domain', e.target.value)}
                      disabled={mode === 'view'}
                      placeholder="exemplo.com"
                      className={errors.domain ? 'border-red-500' : ''}
                    />
                    {errors.domain && (
                      <p className="text-sm text-red-500 mt-1">{errors.domain}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
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

                  <div>
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      value={formData.website}
                      onChange={(e) => handleInputChange('website', e.target.value)}
                      disabled={mode === 'view'}
                      placeholder="https://exemplo.com"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="address">Endereço</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    disabled={mode === 'view'}
                    placeholder="Endereço completo"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="subscription_plan">Plano</Label>
                    <select
                      id="subscription_plan"
                      value={formData.subscription_plan}
                      onChange={(e) => handleInputChange('subscription_plan', e.target.value)}
                      disabled={mode === 'view'}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="free">Gratuito</option>
                      <option value="standard">Padrão</option>
                      <option value="pro">Profissional</option>
                      <option value="enterprise">Empresarial</option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="status">Status</Label>
                    <select
                      id="status"
                      value={formData.status}
                      onChange={(e) => handleInputChange('status', e.target.value)}
                      disabled={mode === 'view'}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="active">Ativo</option>
                      <option value="trial">Trial</option>
                      <option value="suspended">Suspenso</option>
                      <option value="inactive">Inativo</option>
                    </select>
                  </div>
                </div>

                {mode !== 'view' && (
                  <div className="flex justify-end space-x-2 pt-4">
                    <Button type="button" variant="outline" onClick={onClose}>
                      Cancelar
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={createTenantMutation.isLoading || updateTenantMutation.isLoading}
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {mode === 'create' ? 'Criar' : 'Salvar'}
                    </Button>
                  </div>
                )}
              </form>
            </TabsContent>

            <TabsContent value="limits" className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="max_users">Máximo de Usuários</Label>
                  <Input
                    id="max_users"
                    type="number"
                    min="1"
                    value={formData.max_users}
                    onChange={(e) => handleInputChange('max_users', e.target.value)}
                    disabled={mode === 'view'}
                    className={errors.max_users ? 'border-red-500' : ''}
                  />
                  {errors.max_users && (
                    <p className="text-sm text-red-500 mt-1">{errors.max_users}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="max_workspaces">Máximo de Workspaces</Label>
                  <Input
                    id="max_workspaces"
                    type="number"
                    min="1"
                    value={formData.max_workspaces}
                    onChange={(e) => handleInputChange('max_workspaces', e.target.value)}
                    disabled={mode === 'view'}
                    className={errors.max_workspaces ? 'border-red-500' : ''}
                  />
                  {errors.max_workspaces && (
                    <p className="text-sm text-red-500 mt-1">{errors.max_workspaces}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="max_storage_gb">Armazenamento (GB)</Label>
                  <Input
                    id="max_storage_gb"
                    type="number"
                    min="1"
                    value={formData.max_storage_gb}
                    onChange={(e) => handleInputChange('max_storage_gb', e.target.value)}
                    disabled={mode === 'view'}
                    className={errors.max_storage_gb ? 'border-red-500' : ''}
                  />
                  {errors.max_storage_gb && (
                    <p className="text-sm text-red-500 mt-1">{errors.max_storage_gb}</p>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="settings" className="space-y-4">
              <div className="text-center py-8 text-gray-500">
                <Settings className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p>Configurações avançadas serão implementadas em breve</p>
              </div>
            </TabsContent>

            <TabsContent value="stats" className="space-y-4">
              {tenant && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Usuários Ativos</Label>
                    <p className="text-2xl font-bold text-blue-600">
                      {tenant.active_users || 0}
                    </p>
                  </div>
                  <div>
                    <Label>Workspaces Ativos</Label>
                    <p className="text-2xl font-bold text-green-600">
                      {tenant.active_workspaces || 0}
                    </p>
                  </div>
                  <div>
                    <Label>Criado em</Label>
                    <p className="text-sm text-gray-600">
                      {tenant.created_at ? new Date(tenant.created_at).toLocaleString('pt-BR') : '-'}
                    </p>
                  </div>
                  <div>
                    <Label>Atualizado em</Label>
                    <p className="text-sm text-gray-600">
                      {tenant.updated_at ? new Date(tenant.updated_at).toLocaleString('pt-BR') : '-'}
                    </p>
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

export default TenantModal;
