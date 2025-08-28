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

const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('departments');

  // Department management
  const { data= [], isLoading,
  });

  const { data= [], isLoading,
  });

  const { data= [], isLoading,
  });

  const setupDefaultPermissions = useMutation(({ mutationFn) => apiRequest('/api/access-control/setup-default-permissions', { method),
    onSuccess }) => {
      toast({ title, description);
      queryClient.invalidateQueries({ queryKey);
      queryClient.invalidateQueries({ queryKey);
    },
    onError) => {
      toast({ title, description, variant);
    },
  });

  const createDepartment = useMutation(({ mutationFn) =>
      apiRequest('/api/access-control/departments', { method, body),
    onSuccess }) => {
      toast({ title, description);
      queryClient.invalidateQueries({ queryKey);
    },
    onError) => {
      toast({ title, description, variant);
    },
  });

  const createPermission = useMutation(({ mutationFn) =>
      apiRequest('/api/access-control/permissions', { method, body),
    onSuccess }) => {
      toast({ title, description);
      queryClient.invalidateQueries({ queryKey);
    },
    onError) => {
      toast({ title, description, variant);
    },
  });

  const assignUserToDepartment = useMutation({
    mutationFn, departmentId }: ({ userId }) =>
      apiRequest(`/api/access-control/users/${userId}/departments`, {
        method,
        body,
      }),
    onSuccess) => {
      toast({ title, description);
    },
    onError) => {
      toast({ title, description, variant);
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
          onClick=({ ( }) => setupDefaultPermissions.mutate()}
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
        </TabsList>

        <TabsContent value="departments" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Departamentos</h2>
            <DepartmentDialog onSubmit={createDepartment.mutate} />
          </div>
          
          <div className="grid grid-cols-1 md) => (
              <Card key={dept.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {dept.name}
                    <Badge variant={dept.isActive ? 'default' : 'secondary'}>
                      {dept.isActive ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </CardTitle>
                  <CardDescription>Tipo))}
          </div>
        </TabsContent>

        <TabsContent value="permissions" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Permissões</h2>
            <PermissionDialog onSubmit={createPermission.mutate} />
          </div>
          
          <div className="grid grid-cols-1 md) => (
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
          
          <div className="grid grid-cols-1 md) => (
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
                    <p className="text-sm">CPF))}
          </div>
        </TabsContent>

        <TabsContent value="examples" className="space-y-4">
          <h2 className="text-xl font-semibold">Exemplos de Controle de Acesso</h2>
          
          <div className="grid grid-cols-1 md);
}

function DepartmentDialog({ onSubmit }: ({ onSubmit }) => void }) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name,
    type,
    description,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    setOpen(false);
    setFormData({ name, type, description);
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
              onChange=({ (e }) => setFormData({ ...formData, name)}
              placeholder="Ex) => setFormData({ ...formData, type)}>
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
              onChange=({ (e }) => setFormData({ ...formData, description)}
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

function PermissionDialog({ onSubmit }: ({ onSubmit }) => void }) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name,
    resource,
    action,
    description,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    setOpen(false);
    setFormData({ name, resource, action, description);
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
              onChange=({ (e }) => setFormData({ ...formData, name)}
              placeholder="Ex) => setFormData({ ...formData, resource)}>
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
            <Select value={formData.action} onValueChange=({ (value }) => setFormData({ ...formData, action)}>
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
              onChange=({ (e }) => setFormData({ ...formData, description)}
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
}: ({ user }) => void;
}) ({ const [selectedDept, setSelectedDept] = useState('');

  const handleAssign = ( }) => {
    if (selectedDept) {
      onAssign({ userId, departmentId);
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
            ({ departments.map((dept }) => (
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
}`