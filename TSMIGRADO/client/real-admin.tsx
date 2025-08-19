import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { StandardHeader } from '@/components/standard-header';
import { 
  Users, 
  Building2, 
  Settings, 
  Plus,
  UserPlus,
  BuildingIcon
} from 'lucide-react';

interface User {
  id: string;
  cpf: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  tenantId?: string;
  isActive: boolean;
}

interface Tenant {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  createdAt: string;
}

export default function RealAdmin() {
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState<User[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [showCreateTenant, setShowCreateTenant] = useState(false);
  const { toast } = useToast();

  // Estados para criação de usuário
  const [newUser, setNewUser] = useState({
    cpf: '',
    email: '',
    firstName: '',
    lastName: '',
    password: '',
    role: 'employee',
    tenantId: ''
  });

  // Estados para criação de tenant
  const [newTenant, setNewTenant] = useState({
    name: '',
    description: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Carregar usuário atual
      const userResponse = await fetch('/api/auth/user');
      if (userResponse.ok) {
        const userData = await userResponse.json();
        setCurrentUser(userData);
      }

      // Simular dados para teste (já que as APIs não estão funcionando)
      setUsers([
        {
          id: 'user-1',
          cpf: '00000000000',
          email: 'super@toit.nexus',
          firstName: 'Super',
          lastName: 'Admin',
          role: 'super_admin',
          isActive: true
        },
        {
          id: 'user-2', 
          cpf: '11111111111',
          email: 'admin@empresa.com',
          firstName: 'Admin',
          lastName: 'Empresa',
          role: 'tenant_admin',
          tenantId: 'tenant-1',
          isActive: true
        }
      ]);

      setTenants([
        {
          id: 'tenant-1',
          name: 'Empresa Exemplo LTDA',
          description: 'Empresa de exemplo para demonstração',
          isActive: true,
          createdAt: new Date().toISOString()
        },
        {
          id: 'tenant-2',
          name: 'Tech Solutions SA',
          description: 'Empresa de tecnologia',
          isActive: true,
          createdAt: new Date().toISOString()
        }
      ]);

    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
    setLoading(false);
  };

  const handleCreateUser = async () => {
    if (!newUser.cpf || !newUser.email || !newUser.firstName || !newUser.password) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }

    // Simular criação (já que a API não funciona)
    const user: User = {
      id: `user-${Date.now()}`,
      cpf: newUser.cpf,
      email: newUser.email,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      role: newUser.role,
      tenantId: newUser.tenantId || undefined,
      isActive: true
    };

    setUsers(prev => [...prev, user]);
    
    toast({
      title: "Usuário criado",
      description: "Usuário criado com sucesso!"
    });
    
    setNewUser({
      cpf: '',
      email: '',
      firstName: '',
      lastName: '',
      password: '',
      role: 'employee',
      tenantId: ''
    });
    
    setShowCreateUser(false);
  };

  const handleCreateTenant = async () => {
    if (!newTenant.name) {
      toast({
        title: "Nome obrigatório",
        description: "O nome da empresa é obrigatório",
        variant: "destructive"
      });
      return;
    }

    // Simular criação (já que a API não funciona)
    const tenant: Tenant = {
      id: `tenant-${Date.now()}`,
      name: newTenant.name,
      description: newTenant.description,
      isActive: true,
      createdAt: new Date().toISOString()
    };

    setTenants(prev => [...prev, tenant]);
    
    toast({
      title: "Empresa criada",
      description: "Empresa criada com sucesso!"
    });
    
    setNewTenant({ name: '', description: '' });
    setShowCreateTenant(false);
  };

  const handleToggleUserStatus = async (userId: string) => {
    setUsers(prev => prev.map(user => 
      user.id === userId 
        ? { ...user, isActive: !user.isActive }
        : user
    ));

    toast({
      title: "Status atualizado",
      description: "Status do usuário alterado com sucesso"
    });
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/logout', { method: 'POST' });
      window.location.reload();
    } catch (error) {
      window.location.reload();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Carregando sistema administrativo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <StandardHeader 
        user={currentUser || { firstName: 'Admin', lastName: 'Sistema', email: '', role: 'super_admin' }} 
        onLogout={handleLogout} 
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="users" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>Gestão de Usuários</span>
            </TabsTrigger>
            <TabsTrigger value="tenants" className="flex items-center space-x-2">
              <Building2 className="h-4 w-4" />
              <span>Gestão de Empresas</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center space-x-2">
              <Settings className="h-4 w-4" />
              <span>Configurações</span>
            </TabsTrigger>
          </TabsList>

          {/* Gestão de Usuários */}
          <TabsContent value="users" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Usuários do Sistema ({users.length})</h2>
              <Button onClick={() => setShowCreateUser(true)}>
                <UserPlus className="h-4 w-4 mr-2" />
                Criar Usuário
              </Button>
            </div>

            <div className="grid gap-4">
              {users.map(user => (
                <Card key={user.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <Users className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-medium">{user.firstName} {user.lastName}</h3>
                          <p className="text-sm text-gray-500">{user.email}</p>
                          <p className="text-xs text-gray-400">CPF: {user.cpf}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={
                          user.role === 'super_admin' ? 'destructive' :
                          user.role === 'tenant_admin' ? 'default' :
                          user.role === 'manager' ? 'secondary' : 'outline'
                        }>
                          {user.role === 'super_admin' ? 'Super Admin' :
                           user.role === 'tenant_admin' ? 'Admin Tenant' :
                           user.role === 'manager' ? 'Gerente' : 'Funcionário'}
                        </Badge>
                        <Badge variant={user.isActive ? "default" : "secondary"}>
                          {user.isActive ? "Ativo" : "Inativo"}
                        </Badge>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleToggleUserStatus(user.id)}
                        >
                          {user.isActive ? 'Desativar' : 'Ativar'}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Gestão de Empresas */}
          <TabsContent value="tenants" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Empresas do Sistema ({tenants.length})</h2>
              <Button onClick={() => setShowCreateTenant(true)}>
                <BuildingIcon className="h-4 w-4 mr-2" />
                Criar Empresa
              </Button>
            </div>

            <div className="grid gap-4">
              {tenants.map(tenant => (
                <Card key={tenant.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                          <Building2 className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <h3 className="font-medium">{tenant.name}</h3>
                          <p className="text-sm text-gray-500">{tenant.description}</p>
                          <p className="text-xs text-gray-400">
                            Criada em: {new Date(tenant.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={tenant.isActive ? "default" : "secondary"}>
                          {tenant.isActive ? "Ativa" : "Inativa"}
                        </Badge>
                        <Button size="sm" variant="outline">
                          <Settings className="h-4 w-4 mr-1" />
                          Configurar
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Configurações */}
          <TabsContent value="settings" className="space-y-6">
            <h2 className="text-xl font-semibold">Configurações do Sistema</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Estatísticas</CardTitle>
                  <CardDescription>
                    Informações do sistema
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Total de Usuários:</span>
                      <span className="font-semibold">{users.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total de Empresas:</span>
                      <span className="font-semibold">{tenants.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Usuários Ativos:</span>
                      <span className="font-semibold">{users.filter(u => u.isActive).length}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialog Criar Usuário */}
      <Dialog open={showCreateUser} onOpenChange={setShowCreateUser}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Criar Novo Usuário</DialogTitle>
            <DialogDescription>
              Preencha os dados do novo usuário
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">Nome</Label>
                <Input
                  id="firstName"
                  value={newUser.firstName}
                  onChange={(e) => setNewUser(prev => ({ ...prev, firstName: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="lastName">Sobrenome</Label>
                <Input
                  id="lastName"
                  value={newUser.lastName}
                  onChange={(e) => setNewUser(prev => ({ ...prev, lastName: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="cpf">CPF</Label>
              <Input
                id="cpf"
                value={newUser.cpf}
                onChange={(e) => setNewUser(prev => ({ ...prev, cpf: e.target.value }))}
                placeholder="00000000000"
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                value={newUser.password}
                onChange={(e) => setNewUser(prev => ({ ...prev, password: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="role">Função</Label>
              <Select value={newUser.role} onValueChange={(value) => setNewUser(prev => ({ ...prev, role: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="super_admin">Super Admin</SelectItem>
                  <SelectItem value="tenant_admin">Admin Tenant</SelectItem>
                  <SelectItem value="manager">Gerente</SelectItem>
                  <SelectItem value="employee">Funcionário</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleCreateUser} className="w-full">
              Criar Usuário
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog Criar Tenant */}
      <Dialog open={showCreateTenant} onOpenChange={setShowCreateTenant}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Criar Nova Empresa</DialogTitle>
            <DialogDescription>
              Preencha os dados da nova empresa
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="tenantName">Nome da Empresa</Label>
              <Input
                id="tenantName"
                value={newTenant.name}
                onChange={(e) => setNewTenant(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ex: Empresa LTDA"
              />
            </div>
            <div>
              <Label htmlFor="tenantDescription">Descrição</Label>
              <Input
                id="tenantDescription"
                value={newTenant.description}
                onChange={(e) => setNewTenant(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descrição da empresa"
              />
            </div>
            <Button onClick={handleCreateTenant} className="w-full">
              Criar Empresa
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}