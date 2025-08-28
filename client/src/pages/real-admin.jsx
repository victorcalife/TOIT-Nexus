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
          id: '1',
          cpf: '12345678901',
          email: 'admin@sistema.com',
          firstName: 'Admin',
          lastName: 'Sistema',
          role: 'super_admin',
          isActive: true
        },
        {
          id: '2', 
          cpf: '98765432109',
          email: 'user@empresa.com',
          firstName: 'Usuário',
          lastName: 'Teste',
          role: 'employee',
          tenantId: '1',
          isActive: true
        }
      ]);

      setTenants([
        {
          id: '1',
          name: 'Empresa Principal',
          description: 'Empresa principal do sistema',
          isActive: true,
          createdAt: new Date().toISOString()
        },
        {
          id: '2',
          name: 'Empresa Secundária',
          description: 'Segunda empresa do sistema',
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
        title: 'Erro',
        description: 'Preencha todos os campos obrigatórios',
        variant: 'destructive'
      });
      return;
    }

    // Simular criação (já que a API não funciona)
    const user = {
      id: Date.now().toString(),
      cpf: newUser.cpf,
      email: newUser.email,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      role: newUser.role,
      tenantId: newUser.tenantId,
      isActive: true
    };
    
    setUsers(prev => [...prev, user]);
    
    toast({
      title: 'Sucesso',
      description: 'Usuário criado com sucesso'
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
        title: 'Erro',
        description: 'Nome da empresa é obrigatório',
        variant: 'destructive'
      });
      return;
    }

    // Simular criação (já que a API não funciona)
    const tenant = {
      id: Date.now().toString(),
      name: newTenant.name,
      description: newTenant.description,
      isActive: true,
      createdAt: new Date().toISOString()
    };

    setTenants(prev => [...prev, tenant]);
    
    toast({
      title: 'Sucesso',
      description: 'Empresa criada com sucesso'
    });
    
    setNewTenant({ name: '', description: '' });
    setShowCreateTenant(false);
  };

  const handleToggleUserStatus = async (userId) => {
    setUsers(prev => prev.map(user => 
      user.id === userId 
        ? { ...user, isActive: !user.isActive }
        : user
    ));

    toast({
      title: 'Status atualizado',
      description: 'Status do usuário foi alterado com sucesso'
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
        user={currentUser || { firstName: 'Admin', lastName: 'Sistema', email: 'admin@sistema.com', role: 'super_admin' }}
        onLogout={handleLogout}
      />
      
      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="users" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="users">Usuários</TabsTrigger>
            <TabsTrigger value="tenants">Empresas</TabsTrigger>
            <TabsTrigger value="settings">Configurações</TabsTrigger>
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
                          <p className="text-xs text-gray-400">CPF) => handleToggleUserStatus(user.id)}
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
              <Button onClick=({ ( }) => setShowCreateTenant(true)}>
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
                            Criada em).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={tenant.isActive ? "default" : "secondary"}>
                          {tenant.isActive ? "Ativa" : "Inativa"}
                        </Badge>
                        <Button size="sm" variant="outline">
                          <Settings className="h-4 w-4 mr-1" />
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
            
            <div className="grid grid-cols-1 md).length}</span>
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
        <DialogContent className="sm) => setNewUser(prev => ({ ...prev, firstName))}
                />
              </div>
              <div>
                <Label htmlFor="lastName">Sobrenome</Label>
                <Input
                  id="lastName"
                  value={newUser.lastName}
                  onChange=({ (e }) => setNewUser(prev => ({ ...prev, lastName))}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="cpf">CPF</Label>
              <Input
                id="cpf"
                value={newUser.cpf}
                onChange=({ (e }) => setNewUser(prev => ({ ...prev, cpf))}
                placeholder="00000000000"
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={newUser.email}
                onChange=({ (e }) => setNewUser(prev => ({ ...prev, email))}
              />
            </div>
            <div>
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                value={newUser.password}
                onChange=({ (e }) => setNewUser(prev => ({ ...prev, password))}
              />
            </div>
            <div>
              <Label htmlFor="role">Função</Label>
              <Select value={newUser.role} onValueChange=({ (value }) => setNewUser(prev => ({ ...prev, role))}>
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
        <DialogContent className="sm) => setNewTenant(prev => ({ ...prev, name))}
                placeholder="Ex) => setNewTenant(prev => ({ ...prev, description))}
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
}`