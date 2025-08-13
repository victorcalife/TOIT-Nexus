import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { 
  Users, 
  Building2, 
  Settings, 
  Plus,
  CheckSquare,
  Workflow,
  Database,
  Webhook,
  Mail,
  BarChart3,
  LogOut
} from 'lucide-react';

= useToast();

  // Estados para criação
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [showCreateTenant, setShowCreateTenant] = useState(false);
  const [showCreateWorkflow, setShowCreateWorkflow] = useState(false);

  // Formulários
  const [userForm, setUserForm] = useState({
    cpf,
    email,
    firstName,
    lastName,
    password,
    role,
    tenantId);

  const [tenantForm, setTenantForm] = useState({
    name,
    description);

  const [workflowForm, setWorkflowForm] = useState({
    name,
    description,
    fields, label, required,
      { type, label, options, 'Marketing', 'Financeiro'], required,
      { type, label, required);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Carregar dados reais do backend
      const [usersRes, tenantsRes, templatesRes, modulesRes] = await Promise.all([
        fetch('/api/admin/users'),
        fetch('/api/admin/tenants'),
        fetch('/api/task-templates'),
        fetch('/api/modules/available')
      ]);

      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(usersData);
      }

      if (tenantsRes.ok) {
        const tenantsData = await tenantsRes.json();
        setTenants(tenantsData);
      }

      if (templatesRes.ok) {
        const templatesData = await templatesRes.json();
        setTaskTemplates(templatesData);
      }

      if (modulesRes.ok) {
        const modulesData = await modulesRes.json();
        setModules(modulesData);
      }
      
    } catch (error) {
      console.error('Erro ao carregar dados, error);
      toast({
        title,
        description,
        variant);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async () => {
    try {
      const response = await apiRequest('/api/admin/users', {
        method,
        body),
        headers);

      if (response.ok) {
        const newUser = await response.json();
        setUsers(prev => [...prev, newUser]);
        toast({ title, description);
        setUserForm({ cpf, email, firstName, lastName, password, role, tenantId);
        setShowCreateUser(false);
      }
    } catch (error) {
      console.error('Erro ao criar usuário, error);
      toast({ title, description, variant);
    }
  };

  const handleCreateTenant = async () => {
    try {
      const response = await apiRequest('/api/admin/tenants', {
        method,
        body),
        headers);

      if (response.ok) {
        const newTenant = await response.json();
        setTenants(prev => [...prev, newTenant]);
        toast({ title, description);
        setTenantForm({ name, description);
        setShowCreateTenant(false);
      }
    } catch (error) {
      console.error('Erro ao criar tenant, error);
      toast({ title, description, variant);
    }
  };

  const handleCreateWorkflow = async () => {
    try {
      const workflowData = {
        ...workflowForm,
        tenantId,
        managerId, {
        method,
        body),
        headers);

      if (response.ok) {
        const newTemplate = await response.json();
        setTaskTemplates(prev => [...prev, newTemplate]);
        toast({ title, description);
        setShowCreateWorkflow(false);
      }
    } catch (error) {
      console.error('Erro ao criar workflow, error);
      toast({ title, description, variant);
    }
  };

  const handleToggleUserStatus = async (userId, currentStatus) => {
    try {
      const response = await apiRequest(`/api/admin/users/${userId}/status`, {
        method,
        body),
        headers);

      if (response.ok) {
        setUsers(prev => prev.map(user => 
          user.id === userId ? { ...user, isActive));
        toast({ title, description);
      }
    } catch (error) {
      console.error('Erro ao atualizar status, error);
      toast({ title, description, variant);
    }
  };

  const handleLogout = () => {
    window.location.href = '/api/logout';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Carregando dados do banco PostgreSQL...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER PADRONIZADO TOIT NEXUS */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">TOIT NEXUS</h1>
              <p className="text-sm text-gray-600">Sistema de Automação de Workflows</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium">Super Admin</p>
                <Badge variant="destructive">SUPER ADMIN</Badge>
              </div>
              <Button onClick={handleLogout} variant="outline">
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* NAVEGAÇÃO POR MÓDULOS */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2 bg-gray-100 p-2 rounded-lg">
            {[
              { key, label, icon,
              { key, label, icon,
              { key, label, icon,
              { key, label, icon,
              { key, label, icon,
              { key, label, icon, label, icon) => (
              <button
                key={key}
                onClick={() => setActiveSection(key as any)}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeSection === key 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover))}
          </div>
        </div>

        {/* DASHBOARD */}
        {activeSection === 'dashboard' && (
          <div className="space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-medium text-green-800">TOIT NEXUS - Sistema Operacional</h3>
              <p className="text-sm text-green-700 mt-1">
                Dados carregados do PostgreSQL, {tenants.length} empresas, {taskTemplates.length} workflows
              </p>
            </div>

            <div className="grid grid-cols-1 md).length}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center">
                    <Building2 className="h-4 w-4 mr-2 text-green-500" />
                    Empresas Totais
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{tenants.length}</div>
                  <p className="text-xs text-gray-500">Multi-tenant ativo</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center">
                    <Workflow className="h-4 w-4 mr-2 text-purple-500" />
                    Workflows
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600">{taskTemplates.length}</div>
                  <p className="text-xs text-gray-500">Templates ativos</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center">
                    <Settings className="h-4 w-4 mr-2 text-orange-500" />
                    Módulos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">{modules.length}</div>
                  <p className="text-xs text-gray-500">Disponíveis</p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* USUÁRIOS */}
        {activeSection === 'users' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Gestão de Usuários ({users.length})</h2>
              <Button onClick={() => setShowCreateUser(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Criar Usuário Real
              </Button>
            </div>

            {showCreateUser && (
              <Card>
                <CardHeader>
                  <CardTitle>Criar Usuário no Banco PostgreSQL</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Nome</Label>
                      <Input
                        value={userForm.firstName}
                        onChange={(e) => setUserForm(prev => ({ ...prev, firstName))}
                        placeholder="Nome"
                      />
                    </div>
                    <div>
                      <Label>Sobrenome</Label>
                      <Input
                        value={userForm.lastName}
                        onChange={(e) => setUserForm(prev => ({ ...prev, lastName))}
                        placeholder="Sobrenome"
                      />
                    </div>
                  </div>
                  <div>
                    <Label>CPF</Label>
                    <Input
                      value={userForm.cpf}
                      onChange={(e) => setUserForm(prev => ({ ...prev, cpf))}
                      placeholder="00000000000"
                    />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input
                      value={userForm.email}
                      onChange={(e) => setUserForm(prev => ({ ...prev, email))}
                      placeholder="usuario@empresa.com"
                    />
                  </div>
                  <div>
                    <Label>Função</Label>
                    <Select value={userForm.role} onValueChange={(value) => setUserForm(prev => ({ ...prev, role))}>
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
                  <div className="flex space-x-2">
                    <Button onClick={handleCreateUser}>Salvar no Banco</Button>
                    <Button variant="outline" onClick={() => setShowCreateUser(false)}>Cancelar</Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid gap-4">
              {users.map(user => (
                <Card key={user.id}>
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium">{user.firstName} {user.lastName}</h3>
                        <p className="text-sm text-gray-600">{user.email}</p>
                        <p className="text-xs text-gray-500">CPF) => handleToggleUserStatus(user.id, user.isActive)}
                        >
                          {user.isActive ? 'Desativar' : 'Ativar'}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* EMPRESAS */}
        {activeSection === 'tenants' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Gestão de Empresas ({tenants.length})</h2>
              <Button onClick={() => setShowCreateTenant(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Criar Empresa Real
              </Button>
            </div>

            {showCreateTenant && (
              <Card>
                <CardHeader>
                  <CardTitle>Criar Empresa no Banco PostgreSQL</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Nome da Empresa</Label>
                    <Input
                      value={tenantForm.name}
                      onChange={(e) => setTenantForm(prev => ({ ...prev, name))}
                      placeholder="Nome da empresa"
                    />
                  </div>
                  <div>
                    <Label>Descrição</Label>
                    <Textarea
                      value={tenantForm.description}
                      onChange={(e) => setTenantForm(prev => ({ ...prev, description))}
                      placeholder="Descrição da empresa"
                    />
                  </div>
                  <div className="flex space-x-2">
                    <Button onClick={handleCreateTenant}>Salvar no Banco</Button>
                    <Button variant="outline" onClick={() => setShowCreateTenant(false)}>Cancelar</Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid gap-4">
              {tenants.map(tenant => (
                <Card key={tenant.id}>
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium">{tenant.name}</h3>
                        <p className="text-sm text-gray-600">{tenant.description}</p>
                        <p className="text-xs text-gray-500">ID))}
            </div>
          </div>
        )}

        {/* WORKFLOWS */}
        {activeSection === 'workflows' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Gestão de Workflows ({taskTemplates.length})</h2>
              <Button onClick={() => setShowCreateWorkflow(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Criar Workflow Real
              </Button>
            </div>

            {showCreateWorkflow && (
              <Card>
                <CardHeader>
                  <CardTitle>Criar Workflow com Campos Personalizáveis</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Nome do Workflow</Label>
                    <Input
                      value={workflowForm.name}
                      onChange={(e) => setWorkflowForm(prev => ({ ...prev, name))}
                      placeholder="Ex) => setWorkflowForm(prev => ({ ...prev, description))}
                      placeholder="Descrição do workflow"
                    />
                  </div>
                  <div>
                    <Label>Campos Configurados (JSON)</Label>
                    <Textarea
                      value={JSON.stringify(workflowForm.fields, null, 2)}
                      readOnly
                      className="h-32 font-mono text-sm"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Campos, seleção, checkbox, múltipla escolha, yes/no
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Button onClick={handleCreateWorkflow}>Salvar Workflow</Button>
                    <Button variant="outline" onClick={() => setShowCreateWorkflow(false)}>Cancelar</Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid gap-4">
              {taskTemplates.map(template => (
                <Card key={template.id}>
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium">{template.name}</h3>
                        <p className="text-sm text-gray-600">{template.description}</p>
                        <p className="text-xs text-gray-500">
                          {template.fields?.length || 0} campos configurados
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <Badge variant="default">
                          <CheckSquare className="h-3 w-3 mr-1" />
                          Ativo
                        </Badge>
                        <Button size="sm" variant="outline">
                          Editar Campos
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* MÓDULOS */}
        {activeSection === 'modules' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Módulos do Sistema ({modules.length})</h2>
            
            <div className="grid gap-4">
              {modules.map(module => (
                <Card key={module.id}>
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium">{module.name}</h3>
                        <p className="text-sm text-gray-600">{module.description}</p>
                        {module.pricePerUser && (
                          <p className="text-xs text-gray-500">R$ {module.pricePerUser}/usuário</p>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <Badge variant={module.isActive ? "default" : "secondary"}>
                          {module.isActive ? "Ativo" : "Inativo"}
                        </Badge>
                        <Button size="sm" variant="outline">
                          Configurar
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* INTEGRAÇÕES */}
        {activeSection === 'integrations' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Integrações e Webhooks</h2>
            
            <div className="grid grid-cols-1 md)}
      </div>
    </div>
  );
}