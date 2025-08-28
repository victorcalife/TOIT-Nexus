import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {  
  Settings, 
  Plus, 
  Save, 
  Edit, 
  Trash2, 
  Copy,
  Package,
  CheckCircle,
  XCircle,
  DollarSign,
  Users,
  Crown,
  Zap,
  Mail,
  Calendar,
  Database,
  Upload,
  Webhook,
  BarChart3,
  Workflow,
  FileText,
  CheckSquare,
  Bell,
  Shield,
  Building2 }
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

// Definição completa de todos os módulos disponíveis
const ALL_MODULES = {
  'Conectividade e Interfaces': {
    email, icon, description,
    apis, icon, description,
    calendars, icon, description, Apple, Outlook/Microsoft' },
    database, icon, description, MySQL, MongoDB' },
    file_upload, icon, description, .xlsx, .csv' },
    webhooks, icon, description,
  'Ferramentas de Produtividade': {
    task_management, icon, description,
    workflow_builder, icon, description,
    query_builder, icon, description,
    dashboard_builder, icon, description,
    reports, icon, description,
    notifications, icon, description,
  'Funcionalidades Empresariais': {
    team_management, icon, description,
    department_management, icon, description,
    access_control, icon, description) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<AccessProfile | null>(null);
  const [newProfile, setNewProfile] = useState<AccessProfile>({
    name,
    description,
    price_monthly,
    price_yearly,
    max_users,
    max_storage_gb,
    modules,
    features,
    stripe_price_id_monthly,
    stripe_price_id_yearly,
    stripe_product_id,
    is_active);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch existing profiles
  const { data= [], isLoading } = useQuery(({ queryKey,
    queryFn }) => apiRequest('/api/admin/access-profiles').then(res => res.json())
  });

  // Create profile mutation
  const createProfileMutation = useMutation(({ mutationFn }) => {
      return await apiRequest('/api/admin/access-profiles', {
        method,
        body)
      });
    },
    onSuccess) => {
      queryClient.invalidateQueries({ queryKey);
      setIsCreateDialogOpen(false);
      setNewProfile({
        name,
        description,
        price_monthly,
        price_yearly,
        max_users,
        max_storage_gb,
        modules,
        features,
        stripe_price_id_monthly,
        stripe_price_id_yearly,
        stripe_product_id,
        is_active);
      toast({
        title,
        description,
      });
    },
    onError) => {
      toast({
        title,
        description,
        variant,
      });
    }
  });

  // Update profile mutation
  const updateProfileMutation = useMutation(({ mutationFn }) => {
      return await apiRequest(`/api/admin/access-profiles/${profile.id}`, {
        method,
        body)
      });
    },
    onSuccess) => {
      queryClient.invalidateQueries({ queryKey);
      setEditingProfile(null);
      toast({
        title,
        description,
      });
    }
  });

  // Delete profile mutation
  const deleteProfileMutation = useMutation(({ mutationFn }) => {`
      return await apiRequest(`/api/admin/access-profiles/${profileId}`, {
        method);
    },
    onSuccess) => {
      queryClient.invalidateQueries({ queryKey);
      toast({
        title,
        description,
      });
    }
  });

  const handleModuleToggle = (moduleKey, isCreate = false) => {
    if (isCreate) {
      setNewProfile(prev => ({
        ...prev,
        modules,
          [moduleKey]: !prev.modules[moduleKey]
        }
      }));
    } else if (editingProfile) {
      setEditingProfile(prev => ({
        ...prev!,
        modules,
          [moduleKey]: !prev.modules[moduleKey]
        }
      }));
    }
  };

  const handleSaveProfile = () => {
    if (editingProfile) {
      updateProfileMutation.mutate(editingProfile);
    } else {
      createProfileMutation.mutate(newProfile);
    }
  };

  const duplicateProfile = (profile) => {
    setNewProfile({
      ...profile,
      id,`
      name)`,
      created_at);
    setIsCreateDialogOpen(true);
  };

  const getActiveModulesCount = (modules) => {
    return Object.values(modules).filter(Boolean).length;
  };

  const renderModuleCategory = (categoryName, modules, profileModules, isCreate = false) => (
    <Card key={categoryName} className="mb-4">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">{categoryName}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md).map(([key, module]: [string, any]) => {
            const IconComponent = module.icon;
            const isActive = profileModules[key] || false;
            
            return (
              <div key={key} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">`
                  <IconComponent className={`h-5 w-5 ${isActive ? 'text-green-600' : 'text-gray-400'}`} />
                  <div>
                    <p className="font-medium">{module.name}</p>
                    <p className="text-sm text-muted-foreground">{module.description}</p>
                  </div>
                </div>
                <Switch
                  checked={isActive}
                  onCheckedChange=({ ( }) => handleModuleToggle(key, isCreate)}
                />
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Configurador de Perfis de Acesso</h1>
          <p className="text-muted-foreground">
            Configure quais módulos e funcionalidades cada plano de assinatura terá acesso
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Perfil
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Criar Novo Perfil de Acesso</DialogTitle>
              <DialogDescription>
                Configure os módulos e preços para um novo plano de assinatura
              </DialogDescription>
            </DialogHeader>

            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="basic">Informações Básicas</TabsTrigger>
                <TabsTrigger value="modules">Módulos e Funcionalidades</TabsTrigger>
                <TabsTrigger value="pricing">Preços e Limites</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="profile-name">Nome do Perfil</Label>
                    <Input
                      id="profile-name"
                      placeholder="Ex, PREMIUM, ENTERPRISE"
                      value={newProfile.name}
                      onChange=({ (e }) => setNewProfile(prev => ({ ...prev, name))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="profile-status">Status</Label>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={newProfile.is_active}
                        onCheckedChange=({ (checked }) => setNewProfile(prev => ({ ...prev, is_active))}
                      />
                      <span>{newProfile.is_active ? 'Ativo' : 'Inativo'}</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="profile-description">Descrição</Label>
                  <Textarea
                    id="profile-description"
                    placeholder="Descreva as principais características deste plano..."
                    value={newProfile.description}
                    onChange=({ (e }) => setNewProfile(prev => ({ ...prev, description))}
                  />
                </div>
              </TabsContent>

              <TabsContent value="modules" className="space-y-4">
                ({ Object.entries(ALL_MODULES).map(([categoryName, modules] }) => 
                  renderModuleCategory(categoryName, modules, newProfile.modules, true)
                )}
              </TabsContent>

              <TabsContent value="pricing" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price-monthly">Preço Mensal (R$)</Label>
                    <Input
                      id="price-monthly"
                      type="number"
                      step="0.01"
                      value={newProfile.price_monthly}
                      onChange=({ (e }) => setNewProfile(prev => ({ ...prev, price_monthly) || 0 }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price-yearly">Preço Anual (R$)</Label>
                    <Input
                      id="price-yearly"
                      type="number"
                      step="0.01"
                      value={newProfile.price_yearly}
                      onChange=({ (e }) => setNewProfile(prev => ({ ...prev, price_yearly) || 0 }))}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="max-users">Máximo de Usuários</Label>
                    <Input
                      id="max-users"
                      type="number"
                      value={newProfile.max_users}
                      onChange=({ (e }) => setNewProfile(prev => ({ ...prev, max_users) || 1 }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="max-storage">Armazenamento (GB)</Label>
                    <Input
                      id="max-storage"
                      type="number"
                      value={newProfile.max_storage_gb}
                      onChange=({ (e }) => setNewProfile(prev => ({ ...prev, max_storage_gb) || 1 }))}
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-gray-900 border-t pt-4">Integração Stripe</h4>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="stripe-product-id">Product ID (Stripe)</Label>
                      <Input
                        id="stripe-product-id"
                        placeholder="prod_1234abcd..."
                        value={newProfile.stripe_product_id}
                        onChange=({ (e }) => setNewProfile(prev => ({ ...prev, stripe_product_id))}
                      />
                      <p className="text-xs text-muted-foreground">ID do produto no Stripe Dashboard</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="stripe-price-monthly">Price ID Mensal (Stripe)</Label>
                      <Input
                        id="stripe-price-monthly"
                        placeholder="price_1234abcd..."
                        value={newProfile.stripe_price_id_monthly}
                        onChange=({ (e }) => setNewProfile(prev => ({ ...prev, stripe_price_id_monthly))}
                      />
                      <p className="text-xs text-muted-foreground">Price ID para cobrança mensal</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="stripe-price-yearly">Price ID Anual (Stripe)</Label>
                      <Input
                        id="stripe-price-yearly"
                        placeholder="price_5678efgh..."
                        value={newProfile.stripe_price_id_yearly}
                        onChange=({ (e }) => setNewProfile(prev => ({ ...prev, stripe_price_id_yearly))}
                      />
                      <p className="text-xs text-muted-foreground">Price ID para cobrança anual</p>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick=({ ( }) => setIsCreateDialogOpen(false)}>
              <Button onClick={handleSaveProfile} disabled={createProfileMutation.isPending}>
                {createProfileMutation.isPending ? 'Salvando...' : 'Salvar Perfil'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Lista de Perfis Existentes */}
      <div className="grid grid-cols-1 md) => ({ const activeModules = getActiveModulesCount(profile.modules);
          const totalModules = Object.keys(ALL_MODULES).reduce((acc, category }) => 
            acc + Object.keys(ALL_MODULES[category as keyof typeof ALL_MODULES]).length, 0
          );

          return (
            <Card key={profile.id} className="relative">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <Crown className="h-5 w-5 text-yellow-600" />
                    <span>{profile.name}</span>
                  </CardTitle>
                  <Badge variant={profile.is_active ? "default" : "secondary"}>
                    {profile.is_active ? "Ativo" : "Inativo"}
                  </Badge>
                </div>
                <CardDescription>{profile.description}</CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Preço Mensal)}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Preço Anual)}</div>
                  </div>
                  <div>`
                    <span className="text-muted-foreground">Máx. Usuários) * 100}%` }}
                    ></div>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick=({ ( }) => setEditingProfile(profile)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick=({ ( }) => duplicateProfile(profile)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick=({ ( }) => deleteProfileMutation.mutate(profile.id!)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Modal de Edição */}
      {editingProfile && (
        <Dialog open={!!editingProfile} onOpenChange=({ ( }) => setEditingProfile(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Editar Perfil) => setEditingProfile(prev => ({ ...prev!, name))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-profile-status">Status</Label>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={editingProfile.is_active}
                        onCheckedChange=({ (checked }) => setEditingProfile(prev => ({ ...prev!, is_active))}
                      />
                      <span>{editingProfile.is_active ? 'Ativo' : 'Inativo'}</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-profile-description">Descrição</Label>
                  <Textarea
                    id="edit-profile-description"
                    value={editingProfile.description}
                    onChange=({ (e }) => setEditingProfile(prev => ({ ...prev!, description))}
                  />
                </div>
              </TabsContent>

              <TabsContent value="modules" className="space-y-4">
                ({ Object.entries(ALL_MODULES).map(([categoryName, modules] }) => 
                  renderModuleCategory(categoryName, modules, editingProfile.modules, false)
                )}
              </TabsContent>

              <TabsContent value="pricing" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-price-monthly">Preço Mensal (R$)</Label>
                    <Input
                      id="edit-price-monthly"
                      type="number"
                      step="0.01"
                      value={editingProfile.price_monthly}
                      onChange=({ (e }) => setEditingProfile(prev => ({ ...prev!, price_monthly) || 0 }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-price-yearly">Preço Anual (R$)</Label>
                    <Input
                      id="edit-price-yearly"
                      type="number"
                      step="0.01"
                      value={editingProfile.price_yearly}
                      onChange=({ (e }) => setEditingProfile(prev => ({ ...prev!, price_yearly) || 0 }))}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-max-users">Máximo de Usuários</Label>
                    <Input
                      id="edit-max-users"
                      type="number"
                      value={editingProfile.max_users}
                      onChange=({ (e }) => setEditingProfile(prev => ({ ...prev!, max_users) || 1 }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-max-storage">Armazenamento (GB)</Label>
                    <Input
                      id="edit-max-storage"
                      type="number"
                      value={editingProfile.max_storage_gb}
                      onChange=({ (e }) => setEditingProfile(prev => ({ ...prev!, max_storage_gb) || 1 }))}
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-gray-900 border-t pt-4">Integração Stripe</h4>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-stripe-product-id">Product ID (Stripe)</Label>
                      <Input
                        id="edit-stripe-product-id"
                        placeholder="prod_1234abcd..."
                        value={editingProfile.stripe_product_id || ''}
                        onChange=({ (e }) => setEditingProfile(prev => ({ ...prev!, stripe_product_id))}
                      />
                      <p className="text-xs text-muted-foreground">ID do produto no Stripe Dashboard</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-stripe-price-monthly">Price ID Mensal (Stripe)</Label>
                      <Input
                        id="edit-stripe-price-monthly"
                        placeholder="price_1234abcd..."
                        value={editingProfile.stripe_price_id_monthly || ''}
                        onChange=({ (e }) => setEditingProfile(prev => ({ ...prev!, stripe_price_id_monthly))}
                      />
                      <p className="text-xs text-muted-foreground">Price ID para cobrança mensal</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-stripe-price-yearly">Price ID Anual (Stripe)</Label>
                      <Input
                        id="edit-stripe-price-yearly"
                        placeholder="price_5678efgh..."
                        value={editingProfile.stripe_price_id_yearly || ''}
                        onChange=({ (e }) => setEditingProfile(prev => ({ ...prev!, stripe_price_id_yearly))}
                      />
                      <p className="text-xs text-muted-foreground">Price ID para cobrança anual</p>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick=({ ( }) => setEditingProfile(null)}>
              <Button onClick={handleSaveProfile} disabled={updateProfileMutation.isPending}>
                {updateProfileMutation.isPending ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}`