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
  Building2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

// Definição completa de todos os módulos disponíveis
const ALL_MODULES = {
  'Conectividade e Interfaces': {
    email: { name: 'E-mail', icon: Mail, description: 'Conectar e-mail para workflows e notificações' },
    apis: { name: 'APIs', icon: Zap, description: 'Conectar com APIs de terceiros' },
    calendars: { name: 'Calendários', icon: Calendar, description: 'Google, Apple, Outlook/Microsoft' },
    database: { name: 'Banco de Dados', icon: Database, description: 'Conectar com PostgreSQL, MySQL, MongoDB' },
    file_upload: { name: 'Upload de Arquivo', icon: Upload, description: 'Upload .xls, .xlsx, .csv' },
    webhooks: { name: 'Webhooks', icon: Webhook, description: 'Configurar webhooks e callbacks' }
  },
  'Ferramentas de Produtividade': {
    task_management: { name: 'Gestão de Tarefas', icon: CheckSquare, description: 'Criar e gerenciar tarefas com templates' },
    workflow_builder: { name: 'Workflow Builder', icon: Workflow, description: 'Construtor de workflows automatizados' },
    query_builder: { name: 'Query Builder', icon: Database, description: 'Construtor visual de consultas SQL' },
    dashboard_builder: { name: 'Dashboard Builder', icon: BarChart3, description: 'Criar dashboards personalizados' },
    reports: { name: 'Relatórios', icon: FileText, description: 'Gerar relatórios personalizáveis' },
    notifications: { name: 'Notificações', icon: Bell, description: 'Central de notificações push/email/SMS' }
  },
  'Funcionalidades Empresariais': {
    team_management: { name: 'Gestão de Equipe', icon: Users, description: 'Vincular/desvincular usuários' },
    department_management: { name: 'Departamentos', icon: Building2, description: 'Controle dados por departamento' },
    access_control: { name: 'Controle de Acesso', icon: Shield, description: 'Permissões granulares por usuário' }
  }
};

interface AccessProfile {
  id?: string;
  name: string;
  description: string;
  price_monthly: number;
  price_yearly: number;
  max_users: number;
  max_storage_gb: number;
  modules: { [key: string]: boolean };
  features: string[];
  stripe_price_id_monthly?: string;
  stripe_price_id_yearly?: string;
  stripe_product_id?: string;
  is_active: boolean;
  created_at?: string;
}

export default function ProfileBuilder() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<AccessProfile | null>(null);
  const [newProfile, setNewProfile] = useState<AccessProfile>({
    name: '',
    description: '',
    price_monthly: 0,
    price_yearly: 0,
    max_users: 1,
    max_storage_gb: 1,
    modules: {},
    features: [],
    stripe_price_id_monthly: '',
    stripe_price_id_yearly: '',
    stripe_product_id: '',
    is_active: true
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch existing profiles
  const { data: profiles = [], isLoading } = useQuery({
    queryKey: ['/api/admin/access-profiles'],
    queryFn: () => apiRequest('/api/admin/access-profiles').then(res => res.json())
  });

  // Create profile mutation
  const createProfileMutation = useMutation({
    mutationFn: async (profile: AccessProfile) => {
      return await apiRequest('/api/admin/access-profiles', {
        method: 'POST',
        body: JSON.stringify(profile)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/access-profiles'] });
      setIsCreateDialogOpen(false);
      setNewProfile({
        name: '',
        description: '',
        price_monthly: 0,
        price_yearly: 0,
        max_users: 1,
        max_storage_gb: 1,
        modules: {},
        features: [],
        stripe_price_id_monthly: '',
        stripe_price_id_yearly: '',
        stripe_product_id: '',
        is_active: true
      });
      toast({
        title: 'Sucesso!',
        description: 'Perfil de acesso criado com sucesso.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message || 'Falha ao criar perfil de acesso.',
        variant: 'destructive',
      });
    }
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (profile: AccessProfile) => {
      return await apiRequest(`/api/admin/access-profiles/${profile.id}`, {
        method: 'PUT',
        body: JSON.stringify(profile)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/access-profiles'] });
      setEditingProfile(null);
      toast({
        title: 'Sucesso!',
        description: 'Perfil de acesso atualizado com sucesso.',
      });
    }
  });

  // Delete profile mutation
  const deleteProfileMutation = useMutation({
    mutationFn: async (profileId: string) => {
      return await apiRequest(`/api/admin/access-profiles/${profileId}`, {
        method: 'DELETE'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/access-profiles'] });
      toast({
        title: 'Sucesso!',
        description: 'Perfil de acesso removido com sucesso.',
      });
    }
  });

  const handleModuleToggle = (moduleKey: string, isCreate = false) => {
    if (isCreate) {
      setNewProfile(prev => ({
        ...prev,
        modules: {
          ...prev.modules,
          [moduleKey]: !prev.modules[moduleKey]
        }
      }));
    } else if (editingProfile) {
      setEditingProfile(prev => ({
        ...prev!,
        modules: {
          ...prev!.modules,
          [moduleKey]: !prev!.modules[moduleKey]
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

  const duplicateProfile = (profile: AccessProfile) => {
    setNewProfile({
      ...profile,
      id: undefined,
      name: `${profile.name} (Cópia)`,
      created_at: undefined
    });
    setIsCreateDialogOpen(true);
  };

  const getActiveModulesCount = (modules: { [key: string]: boolean }) => {
    return Object.values(modules).filter(Boolean).length;
  };

  const renderModuleCategory = (categoryName: string, modules: any, profileModules: { [key: string]: boolean }, isCreate = false) => (
    <Card key={categoryName} className="mb-4">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">{categoryName}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(modules).map(([key, module]: [string, any]) => {
            const IconComponent = module.icon;
            const isActive = profileModules[key] || false;
            
            return (
              <div key={key} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <IconComponent className={`h-5 w-5 ${isActive ? 'text-green-600' : 'text-gray-400'}`} />
                  <div>
                    <p className="font-medium">{module.name}</p>
                    <p className="text-sm text-muted-foreground">{module.description}</p>
                  </div>
                </div>
                <Switch
                  checked={isActive}
                  onCheckedChange={() => handleModuleToggle(key, isCreate)}
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
                      placeholder="Ex: BÁSICO, PREMIUM, ENTERPRISE"
                      value={newProfile.name}
                      onChange={(e) => setNewProfile(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="profile-status">Status</Label>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={newProfile.is_active}
                        onCheckedChange={(checked) => setNewProfile(prev => ({ ...prev, is_active: checked }))}
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
                    onChange={(e) => setNewProfile(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>
              </TabsContent>

              <TabsContent value="modules" className="space-y-4">
                {Object.entries(ALL_MODULES).map(([categoryName, modules]) => 
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
                      onChange={(e) => setNewProfile(prev => ({ ...prev, price_monthly: parseFloat(e.target.value) || 0 }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price-yearly">Preço Anual (R$)</Label>
                    <Input
                      id="price-yearly"
                      type="number"
                      step="0.01"
                      value={newProfile.price_yearly}
                      onChange={(e) => setNewProfile(prev => ({ ...prev, price_yearly: parseFloat(e.target.value) || 0 }))}
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
                      onChange={(e) => setNewProfile(prev => ({ ...prev, max_users: parseInt(e.target.value) || 1 }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="max-storage">Armazenamento (GB)</Label>
                    <Input
                      id="max-storage"
                      type="number"
                      value={newProfile.max_storage_gb}
                      onChange={(e) => setNewProfile(prev => ({ ...prev, max_storage_gb: parseInt(e.target.value) || 1 }))}
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
                        onChange={(e) => setNewProfile(prev => ({ ...prev, stripe_product_id: e.target.value }))}
                      />
                      <p className="text-xs text-muted-foreground">ID do produto no Stripe Dashboard</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="stripe-price-monthly">Price ID Mensal (Stripe)</Label>
                      <Input
                        id="stripe-price-monthly"
                        placeholder="price_1234abcd..."
                        value={newProfile.stripe_price_id_monthly}
                        onChange={(e) => setNewProfile(prev => ({ ...prev, stripe_price_id_monthly: e.target.value }))}
                      />
                      <p className="text-xs text-muted-foreground">Price ID para cobrança mensal</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="stripe-price-yearly">Price ID Anual (Stripe)</Label>
                      <Input
                        id="stripe-price-yearly"
                        placeholder="price_5678efgh..."
                        value={newProfile.stripe_price_id_yearly}
                        onChange={(e) => setNewProfile(prev => ({ ...prev, stripe_price_id_yearly: e.target.value }))}
                      />
                      <p className="text-xs text-muted-foreground">Price ID para cobrança anual</p>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSaveProfile} disabled={createProfileMutation.isPending}>
                {createProfileMutation.isPending ? 'Salvando...' : 'Salvar Perfil'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Lista de Perfis Existentes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {profiles.map((profile: AccessProfile) => {
          const activeModules = getActiveModulesCount(profile.modules);
          const totalModules = Object.keys(ALL_MODULES).reduce((acc, category) => 
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
                    <span className="text-muted-foreground">Preço Mensal:</span>
                    <div className="font-medium">R$ {profile.price_monthly.toFixed(2)}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Preço Anual:</span>
                    <div className="font-medium">R$ {profile.price_yearly.toFixed(2)}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Máx. Usuários:</span>
                    <div className="font-medium">{profile.max_users === -1 ? 'Ilimitado' : profile.max_users}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Storage:</span>
                    <div className="font-medium">{profile.max_storage_gb} GB</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Módulos Ativos:</span>
                    <span className="font-medium">{activeModules}/{totalModules}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full" 
                      style={{ width: `${(activeModules / totalModules) * 100}%` }}
                    ></div>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => setEditingProfile(profile)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Editar
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => duplicateProfile(profile)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => deleteProfileMutation.mutate(profile.id!)}
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
        <Dialog open={!!editingProfile} onOpenChange={() => setEditingProfile(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Editar Perfil: {editingProfile.name}</DialogTitle>
              <DialogDescription>
                Modifique os módulos e configurações deste perfil de acesso
              </DialogDescription>
            </DialogHeader>

            <Tabs defaultValue="modules" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="basic">Informações Básicas</TabsTrigger>
                <TabsTrigger value="modules">Módulos e Funcionalidades</TabsTrigger>
                <TabsTrigger value="pricing">Preços e Limites</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-profile-name">Nome do Perfil</Label>
                    <Input
                      id="edit-profile-name"
                      value={editingProfile.name}
                      onChange={(e) => setEditingProfile(prev => ({ ...prev!, name: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-profile-status">Status</Label>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={editingProfile.is_active}
                        onCheckedChange={(checked) => setEditingProfile(prev => ({ ...prev!, is_active: checked }))}
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
                    onChange={(e) => setEditingProfile(prev => ({ ...prev!, description: e.target.value }))}
                  />
                </div>
              </TabsContent>

              <TabsContent value="modules" className="space-y-4">
                {Object.entries(ALL_MODULES).map(([categoryName, modules]) => 
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
                      onChange={(e) => setEditingProfile(prev => ({ ...prev!, price_monthly: parseFloat(e.target.value) || 0 }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-price-yearly">Preço Anual (R$)</Label>
                    <Input
                      id="edit-price-yearly"
                      type="number"
                      step="0.01"
                      value={editingProfile.price_yearly}
                      onChange={(e) => setEditingProfile(prev => ({ ...prev!, price_yearly: parseFloat(e.target.value) || 0 }))}
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
                      onChange={(e) => setEditingProfile(prev => ({ ...prev!, max_users: parseInt(e.target.value) || 1 }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-max-storage">Armazenamento (GB)</Label>
                    <Input
                      id="edit-max-storage"
                      type="number"
                      value={editingProfile.max_storage_gb}
                      onChange={(e) => setEditingProfile(prev => ({ ...prev!, max_storage_gb: parseInt(e.target.value) || 1 }))}
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
                        onChange={(e) => setEditingProfile(prev => ({ ...prev!, stripe_product_id: e.target.value }))}
                      />
                      <p className="text-xs text-muted-foreground">ID do produto no Stripe Dashboard</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-stripe-price-monthly">Price ID Mensal (Stripe)</Label>
                      <Input
                        id="edit-stripe-price-monthly"
                        placeholder="price_1234abcd..."
                        value={editingProfile.stripe_price_id_monthly || ''}
                        onChange={(e) => setEditingProfile(prev => ({ ...prev!, stripe_price_id_monthly: e.target.value }))}
                      />
                      <p className="text-xs text-muted-foreground">Price ID para cobrança mensal</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-stripe-price-yearly">Price ID Anual (Stripe)</Label>
                      <Input
                        id="edit-stripe-price-yearly"
                        placeholder="price_5678efgh..."
                        value={editingProfile.stripe_price_id_yearly || ''}
                        onChange={(e) => setEditingProfile(prev => ({ ...prev!, stripe_price_id_yearly: e.target.value }))}
                      />
                      <p className="text-xs text-muted-foreground">Price ID para cobrança anual</p>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setEditingProfile(null)}>
                Cancelar
              </Button>
              <Button onClick={handleSaveProfile} disabled={updateProfileMutation.isPending}>
                {updateProfileMutation.isPending ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}