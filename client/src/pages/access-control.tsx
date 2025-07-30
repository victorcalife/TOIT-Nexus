import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Shield, Users, Building2, Key, Plus, Trash2, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

type Department = {
  id: string;
  name: string;
  type: string;
  description: string;
  isActive: boolean;
  createdAt: string;
};

type Permission = {
  id: string;
  name: string;
  resource: string;
  action: string;
  description: string;
};

type User = {
  id: string;
  cpf: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
};

export default function AccessControlPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('departments');

  // Department management
  const { data: departments = [], isLoading: loadingDepartments } = useQuery({
    queryKey: ['/api/access-control/departments'],
  });

  const { data: permissions = [], isLoading: loadingPermissions } = useQuery({
    queryKey: ['/api/access-control/permissions'],
  });

  const { data: users = [], isLoading: loadingUsers } = useQuery({
    queryKey: ['/api/users'],
  });

  const setupDefaultPermissions = useMutation({
    mutationFn: () => apiRequest('/api/access-control/setup-default-permissions', { method: 'POST' }),
    onSuccess: () => {
      toast({ title: 'Sucesso', description: 'Departamentos e permissões padrão criados!' });
      queryClient.invalidateQueries({ queryKey: ['/api/access-control/departments'] });
      queryClient.invalidateQueries({ queryKey: ['/api/access-control/permissions'] });
    },
    onError: () => {
      toast({ title: 'Erro', description: 'Falha ao criar estrutura padrão', variant: 'destructive' });
    },
  });

  const createDepartment = useMutation({
    mutationFn: (data: { name: string; type: string; description: string }) =>
      apiRequest('/api/access-control/departments', { method: 'POST', body: data }),
    onSuccess: () => {
      toast({ title: 'Sucesso', description: 'Departamento criado!' });
      queryClient.invalidateQueries({ queryKey: ['/api/access-control/departments'] });
    },
    onError: () => {
      toast({ title: 'Erro', description: 'Falha ao criar departamento', variant: 'destructive' });
    },
  });

  const createPermission = useMutation({
    mutationFn: (data: { name: string; resource: string; action: string; description: string }) =>
      apiRequest('/api/access-control/permissions', { method: 'POST', body: data }),
    onSuccess: () => {
      toast({ title: 'Sucesso', description: 'Permissão criada!' });
      queryClient.invalidateQueries({ queryKey: ['/api/access-control/permissions'] });
    },
    onError: () => {
      toast({ title: 'Erro', description: 'Falha ao criar permissão', variant: 'destructive' });
    },
  });

  const assignUserToDepartment = useMutation({
    mutationFn: ({ userId, departmentId }: { userId: string; departmentId: string }) =>
      apiRequest(`/api/access-control/users/${userId}/departments`, {
        method: 'POST',
        body: { departmentId },
      }),
    onSuccess: () => {
      toast({ title: 'Sucesso', description: 'Usuário atribuído ao departamento!' });
    },
    onError: () => {
      toast({ title: 'Erro', description: 'Falha ao atribuir usuário', variant: 'destructive' });
    },
  });

  if (loadingDepartments || loadingPermissions || loadingUsers) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Controle de Acesso</h1>
          <p className="text-muted-foreground">
            Gerencie departamentos, permissões e acesso de usuários por empresa
          </p>
        </div>
        <Button
          onClick={() => setupDefaultPermissions.mutate()}
          disabled={setupDefaultPermissions.isPending}
          variant="outline"
        >
          <Settings className="h-4 w-4 mr-2" />
          Configurar Estrutura Padrão
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="departments">
            <Building2 className="h-4 w-4 mr-2" />
            Departamentos
          </TabsTrigger>
          <TabsTrigger value="permissions">
            <Key className="h-4 w-4 mr-2" />
            Permissões
          </TabsTrigger>
          <TabsTrigger value="users">
            <Users className="h-4 w-4 mr-2" />
            Usuários
          </TabsTrigger>
          <TabsTrigger value="examples">
            <Shield className="h-4 w-4 mr-2" />
            Exemplos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="departments" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Departamentos</h2>
            <DepartmentDialog onSubmit={createDepartment.mutate} />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {departments.map((dept: Department) => (
              <Card key={dept.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {dept.name}
                    <Badge variant={dept.isActive ? 'default' : 'secondary'}>
                      {dept.isActive ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </CardTitle>
                  <CardDescription>Tipo: {dept.type}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{dept.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="permissions" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Permissões</h2>
            <PermissionDialog onSubmit={createPermission.mutate} />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {permissions.map((perm: Permission) => (
              <Card key={perm.id}>
                <CardHeader>
                  <CardTitle>{perm.name}</CardTitle>
                  <CardDescription>
                    <Badge variant="outline">{perm.resource}</Badge>
                    <Badge variant="outline" className="ml-1">{perm.action}</Badge>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{perm.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <h2 className="text-xl font-semibold">Usuários e Departamentos</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {users.map((user: User) => (
              <Card key={user.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {user.firstName} {user.lastName}
                    <Badge variant={user.isActive ? 'default' : 'secondary'}>
                      {user.role}
                    </Badge>
                  </CardTitle>
                  <CardDescription>{user.email}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm">CPF: {user.cpf}</p>
                    <UserDepartmentAssignment 
                      user={user} 
                      departments={departments}
                      onAssign={assignUserToDepartment.mutate}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="examples" className="space-y-4">
          <h2 className="text-xl font-semibold">Exemplos de Controle de Acesso</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Cenário: Departamento de Vendas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <h4 className="font-medium text-green-800 dark:text-green-200">✅ Pode Acessar:</h4>
                  <ul className="text-sm text-green-700 dark:text-green-300 mt-1 space-y-1">
                    <li>• Visualizar todos os clientes</li>
                    <li>• Editar prospects e oportunidades</li>
                    <li>• Criar relatórios de vendas</li>
                    <li>• Executar workflows de vendas</li>
                  </ul>
                </div>
                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <h4 className="font-medium text-red-800 dark:text-red-200">❌ Não Pode Acessar:</h4>
                  <ul className="text-sm text-red-700 dark:text-red-300 mt-1 space-y-1">
                    <li>• Dados financeiros</li>
                    <li>• Informações de compras</li>
                    <li>• Configurações do sistema</li>
                    <li>• Dados de outros departamentos</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cenário: Departamento de Compras</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <h4 className="font-medium text-green-800 dark:text-green-200">✅ Pode Acessar:</h4>
                  <ul className="text-sm text-green-700 dark:text-green-300 mt-1 space-y-1">
                    <li>• Gerenciar fornecedores</li>
                    <li>• Workflows de aquisição</li>
                    <li>• Relatórios de compras</li>
                    <li>• Dados de custos e orçamentos</li>
                  </ul>
                </div>
                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <h4 className="font-medium text-red-800 dark:text-red-200">❌ Não Pode Acessar:</h4>
                  <ul className="text-sm text-red-700 dark:text-red-300 mt-1 space-y-1">
                    <li>• Dados de vendas</li>
                    <li>• Informações de clientes</li>
                    <li>• Relatórios financeiros</li>
                    <li>• Workflows de vendas</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Matriz de Permissões por Função</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300 dark:border-gray-600">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-800">
                      <th className="border border-gray-300 dark:border-gray-600 p-2 text-left">Função</th>
                      <th className="border border-gray-300 dark:border-gray-600 p-2 text-center">Clientes</th>
                      <th className="border border-gray-300 dark:border-gray-600 p-2 text-center">Relatórios</th>
                      <th className="border border-gray-300 dark:border-gray-600 p-2 text-center">Workflows</th>
                      <th className="border border-gray-300 dark:border-gray-600 p-2 text-center">Admin</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-300 dark:border-gray-600 p-2 font-medium">Super Admin</td>
                      <td className="border border-gray-300 dark:border-gray-600 p-2 text-center">✅ Total</td>
                      <td className="border border-gray-300 dark:border-gray-600 p-2 text-center">✅ Total</td>
                      <td className="border border-gray-300 dark:border-gray-600 p-2 text-center">✅ Total</td>
                      <td className="border border-gray-300 dark:border-gray-600 p-2 text-center">✅ Total</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 dark:border-gray-600 p-2 font-medium">Tenant Admin</td>
                      <td className="border border-gray-300 dark:border-gray-600 p-2 text-center">✅ Empresa</td>
                      <td className="border border-gray-300 dark:border-gray-600 p-2 text-center">✅ Empresa</td>
                      <td className="border border-gray-300 dark:border-gray-600 p-2 text-center">✅ Empresa</td>
                      <td className="border border-gray-300 dark:border-gray-600 p-2 text-center">✅ Empresa</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 dark:border-gray-600 p-2 font-medium">Manager</td>
                      <td className="border border-gray-300 dark:border-gray-600 p-2 text-center">📖 Dep. + Leitura</td>
                      <td className="border border-gray-300 dark:border-gray-600 p-2 text-center">✏️ Dep. + Admin</td>
                      <td className="border border-gray-300 dark:border-gray-600 p-2 text-center">✏️ Dep. + Admin</td>
                      <td className="border border-gray-300 dark:border-gray-600 p-2 text-center">❌ Não</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 dark:border-gray-600 p-2 font-medium">Employee</td>
                      <td className="border border-gray-300 dark:border-gray-600 p-2 text-center">📖 Apenas Dep.</td>
                      <td className="border border-gray-300 dark:border-gray-600 p-2 text-center">📖 Apenas Dep.</td>
                      <td className="border border-gray-300 dark:border-gray-600 p-2 text-center">📖 Apenas Dep.</td>
                      <td className="border border-gray-300 dark:border-gray-600 p-2 text-center">❌ Não</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function DepartmentDialog({ onSubmit }: { onSubmit: (data: any) => void }) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    description: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    setOpen(false);
    setFormData({ name: '', type: '', description: '' });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Novo Departamento
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Criar Departamento</DialogTitle>
          <DialogDescription>
            Adicione um novo departamento para organizar usuários e permissões.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ex: Vendas"
              required
            />
          </div>
          <div>
            <Label htmlFor="type">Tipo</Label>
            <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sales">Vendas</SelectItem>
                <SelectItem value="purchases">Compras</SelectItem>
                <SelectItem value="finance">Financeiro</SelectItem>
                <SelectItem value="operations">Operações</SelectItem>
                <SelectItem value="hr">Recursos Humanos</SelectItem>
                <SelectItem value="it">TI</SelectItem>
                <SelectItem value="marketing">Marketing</SelectItem>
                <SelectItem value="custom">Personalizado</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descreva as responsabilidades do departamento"
            />
          </div>
          <Button type="submit" className="w-full">
            Criar Departamento
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function PermissionDialog({ onSubmit }: { onSubmit: (data: any) => void }) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    resource: '',
    action: '',
    description: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    setOpen(false);
    setFormData({ name: '', resource: '', action: '', description: '' });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nova Permissão
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Criar Permissão</DialogTitle>
          <DialogDescription>
            Defina uma nova permissão para controlar acesso a recursos.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ex: Ver Clientes"
              required
            />
          </div>
          <div>
            <Label htmlFor="resource">Recurso</Label>
            <Select value={formData.resource} onValueChange={(value) => setFormData({ ...formData, resource: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o recurso" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="clients">Clientes</SelectItem>
                <SelectItem value="reports">Relatórios</SelectItem>
                <SelectItem value="workflows">Workflows</SelectItem>
                <SelectItem value="integrations">Integrações</SelectItem>
                <SelectItem value="users">Usuários</SelectItem>
                <SelectItem value="admin">Administração</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="action">Ação</Label>
            <Select value={formData.action} onValueChange={(value) => setFormData({ ...formData, action: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a ação" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="read">Ler</SelectItem>
                <SelectItem value="write">Escrever</SelectItem>
                <SelectItem value="delete">Deletar</SelectItem>
                <SelectItem value="admin">Administrar</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descreva o que esta permissão permite"
            />
          </div>
          <Button type="submit" className="w-full">
            Criar Permissão
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function UserDepartmentAssignment({ 
  user, 
  departments, 
  onAssign 
}: { 
  user: User; 
  departments: Department[]; 
  onAssign: (data: { userId: string; departmentId: string }) => void;
}) {
  const [selectedDept, setSelectedDept] = useState('');

  const handleAssign = () => {
    if (selectedDept) {
      onAssign({ userId: user.id, departmentId: selectedDept });
      setSelectedDept('');
    }
  };

  return (
    <div className="space-y-2">
      <Label>Atribuir ao Departamento</Label>
      <div className="flex gap-2">
        <Select value={selectedDept} onValueChange={setSelectedDept}>
          <SelectTrigger className="flex-1">
            <SelectValue placeholder="Selecione o departamento" />
          </SelectTrigger>
          <SelectContent>
            {departments.map((dept: Department) => (
              <SelectItem key={dept.id} value={dept.id}>
                {dept.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={handleAssign} disabled={!selectedDept} size="sm">
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}