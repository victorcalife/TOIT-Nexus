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
import {  
  Users, 
  Building2, 
  Settings, 
  Plus,
  Edit,
  Trash2,
  Eye,
  Check,
  X,
  UserPlus,
  BuildingIcon }
} from 'lucide-react';

= useToast();

  // Estados para criação de usuário
  const [newUser, setNewUser] = useState(({ cpf,
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

  useEffect(( }) => {
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

      // Carregar usuários
      const usersResponse = await fetch('/api/admin/users');
      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        setUsers(usersData);
      }

      // Carregar tenants
      const tenantsResponse = await fetch('/api/admin/tenants');
      if (tenantsResponse.ok) {
        const tenantsData = await tenantsResponse.json();
        setTenants(tenantsData);
      }
    } catch (error) {
      console.error('Erro ao carregar dados, error);
      toast({
        title,
        description,
        variant);
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

    try {
      const response = await fetch('/api/admin/users', {
        method,
        headers,
        body)
      });

      if (response.ok) {
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
        loadData(); // Recarregar lista
      } else {
        const error = await response.json();
        throw new Error(error.message);
      }
    } catch (error) {
      toast({
        title,
        description,
        variant);
    }
  };

  const handleCreateTenant = async () => {
    if (!newTenant.name) {
      toast({
        title,
        description,
        variant);
      return;
    }

    try {
      const response = await fetch('/api/admin/tenants', {
        method,
        headers,
        body)
      });

      if (response.ok) {
        toast({
          title,
          description);
        setNewTenant({ name, description);
        loadData(); // Recarregar lista
      } else {
        const error = await response.json();
        throw new Error(error.message);
      }
    } catch (error) {
      toast({
        title,
        description,
        variant);
    }
  };

  const handleToggleUserStatus = async (userId, newStatus) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/status`, {
        method,
        headers,
        body)
      });

      if (response.ok) {
        toast({
          title,
          description);
        loadData();
      }
    } catch (error) {
      toast({
        title,
        description,
        variant);
    }
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
      {/* Header */}
      <div className="bg-white shadow border-b">
        <div className="max-w-7xl mx-auto px-4 sm) => setNewUser(prev => ({ ...prev, firstName))}
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
                    <div>
                      <Label htmlFor="tenant">Empresa</Label>
                      <Select value={newUser.tenantId} onValueChange=({ (value }) => setNewUser(prev => ({ ...prev, tenantId))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma empresa" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Nenhuma empresa</SelectItem>
                          {tenants.map(tenant => (
                            <SelectItem key={tenant.id} value={tenant.id}>{tenant.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button onClick={handleCreateUser} className="w-full">
                      Criar Usuário
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
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
                          <p className="text-xs text-gray-400">CPF)}
                        <Button
                          size="sm"
                          variant={user.isActive ? "destructive" : "default"}
                          onClick=({ ( }) => handleToggleUserStatus(user.id, !user.isActive)}
                        >
                          {user.isActive ? (
                            <>
                              <X className="h-4 w-4 mr-1" />
                          ) {/* Gestão de Empresas */}
          <TabsContent value="tenants" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Empresas do Sistema</h2>
              <Dialog>
                <DialogTrigger asChild>
                  <Button>
                    <BuildingIcon className="h-4 w-4 mr-2" />
                    Criar Empresa
                  </Button>
                </DialogTrigger>
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
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4 mr-1" />
                          Ver Detalhes
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
    </div>
  );
}`