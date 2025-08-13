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

= useToast();

  // Estados para criação de usuário
  const [newUser, setNewUser] = useState({
    cpf,
    email,
    firstName,
    lastName,
    password,
    role,
    tenantId);

  // Estados para criação de tenant
  const [newTenant, setNewTenant] = useState({
    name,
    description);

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
          id,
          cpf,
          email,
          firstName,
          lastName,
          role,
          isActive,
        {
          id, 
          cpf,
          email,
          firstName,
          lastName,
          role,
          tenantId,
          isActive);

      setTenants([
        {
          id,
          name,
          description,
          isActive,
          createdAt).toISOString()
        },
        {
          id,
          name,
          description,
          isActive,
          createdAt).toISOString()
        }
      ]);

    } catch (error) {
      console.error('Erro ao carregar dados, error);
    }
    setLoading(false);
  };

  const handleCreateUser = async () => {
    if (!newUser.cpf || !newUser.email || !newUser.firstName || !newUser.password) {
      toast({
        title,
        description,
        variant);
      return;
    }

    // Simular criação (já que a API não funciona)
    const user= {
      id)}`,
      cpf,
      email,
      firstName,
      lastName,
      role,
      tenantId,
      isActive, user]);
    
    toast({
      title,
      description);
    
    setNewUser({
      cpf,
      email,
      firstName,
      lastName,
      password,
      role,
      tenantId);
    
    setShowCreateUser(false);
  };

  const handleCreateTenant = async () => {
    if (!newTenant.name) {
      toast({
        title,
        description,
        variant);
      return;
    }

    // Simular criação (já que a API não funciona)
    const tenant= {
      id)}`,
      name,
      description,
      isActive,
      createdAt).toISOString()
    };

    setTenants(prev => [...prev, tenant]);
    
    toast({
      title,
      description);
    
    setNewTenant({ name, description);
    setShowCreateTenant(false);
  };

  const handleToggleUserStatus = async (userId) => {
    setUsers(prev => prev.map(user => 
      user.id === userId 
        ? { ...user, isActive));

    toast({
      title,
      description);
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/logout', { method);
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
        user={currentUser || { firstName, lastName, email, role)</h2>
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
                  onChange={(e) => setNewUser(prev => ({ ...prev, lastName))}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="cpf">CPF</Label>
              <Input
                id="cpf"
                value={newUser.cpf}
                onChange={(e) => setNewUser(prev => ({ ...prev, cpf))}
                placeholder="00000000000"
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser(prev => ({ ...prev, email))}
              />
            </div>
            <div>
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                value={newUser.password}
                onChange={(e) => setNewUser(prev => ({ ...prev, password))}
              />
            </div>
            <div>
              <Label htmlFor="role">Função</Label>
              <Select value={newUser.role} onValueChange={(value) => setNewUser(prev => ({ ...prev, role))}>
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
}