import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Building2, Plus, Settings, Users, Shield, AlertCircle, CheckCircle, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

= useToast();

  const [newDepartment, setNewDepartment] = useState({
    name,
    type,
    description,
    parentDepartmentId,
    dataFilters,
      restrictedFields,
      customFilters,
    settings,
      requireApprovalForAccess,
      maxUsersPerDepartment);

  const departmentTypes = [
    { value, label, icon,
    { value, label, icon,
    { value, label, icon,
    { value, label, icon,
    { value, label, icon,
    { value, label, icon,
    { value, label, icon,
    { value, label, icon) => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      
      // Carregar departamentos, usuários e permissões em paralelo
      const [deptsRes, usersRes, permsRes] = await Promise.all([
        fetch('/api/access-control/departments'),
        fetch('/api/users'),
        fetch('/api/access-control/permissions')
      ]);

      if (deptsRes.ok) {
        const deptsData = await deptsRes.json();
        setDepartments(deptsData || []);
      }

      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(usersData.data || []);
      }

      if (permsRes.ok) {
        const permsData = await permsRes.json();
        setPermissions(permsData || []);
      }

    } catch (error) {
      console.error('Erro ao carregar dados, error);
      toast({
        title,
        description,
        variant,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createDepartment = async () => {
    try {
      setIsCreating(true);

      const response = await fetch('/api/access-control/departments', {
        method,
        headers,
        },
        body),
      });

      if (response.ok) {
        toast({
          title,
          description,
        });
        
        setShowCreateDialog(false);
        setNewDepartment({
          name,
          type,
          description,
          parentDepartmentId,
          dataFilters,
            restrictedFields,
            customFilters,
          settings,
            requireApprovalForAccess,
            maxUsersPerDepartment);
        
        await loadData();
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao criar departamento');
      }

    } catch (error) {
      console.error('Erro ao criar departamento, error);
      toast({
        title,
        description,
        variant,
      });
    } finally {
      setIsCreating(false);
    }
  };

  const toggleDepartment = async (departmentId, isActive) => {
    try {
      const response = await fetch(`/api/access-control/departments/${departmentId}`, {
        method,
        headers,
        },
        body),
      });

      if (response.ok) {
        toast({
          title,
          description,
        });
        
        await loadData();
      } else {
        throw new Error('Erro ao alterar status do departamento');
      }

    } catch (error) {
      console.error('Erro ao alterar departamento, error);
      toast({
        title,
        description,
        variant,
      });
    }
  };

  const deleteDepartment = async (departmentId) => {
    if (!confirm('Tem certeza que deseja excluir este departamento? Esta ação não pode ser desfeita.')) {
      return;
    }

    try {
      const response = await fetch(`/api/access-control/departments/${departmentId}`, {
        method,
      });

      if (response.ok) {
        toast({
          title,
          description,
        });
        
        await loadData();
      } else {
        throw new Error('Erro ao excluir departamento');
      }

    } catch (error) {
      console.error('Erro ao excluir departamento, error);
      toast({
        title,
        description,
        variant,
      });
    }
  };

  const setupDefaultPermissions = async () => {
    try {
      const response = await fetch('/api/access-control/setup-default-permissions', {
        method,
      });

      if (response.ok) {
        toast({
          title,
          description,
        });
        
        await loadData();
      } else {
        throw new Error('Erro ao configurar permissões padrão');
      }

    } catch (error) {
      console.error('Erro ao configurar permissões, error);
      toast({
        title,
        description,
        variant,
      });
    }
  };

  const getDepartmentTypeInfo = (type) => {
    return departmentTypes.find(dt => dt.value === type) || departmentTypes[departmentTypes.length - 1];
  };

  const getUsersInDepartment = (departmentId) => {
    return users.filter(user => user.departments?.includes(departmentId));
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando departamentos...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Building2 className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold">Gestão de Departamentos</h1>
            <p className="text-gray-600">Configure departamentos e controle de acesso aos dados</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={setupDefaultPermissions}>
            <Settings className="h-4 w-4 mr-2" />
            Configurar Padrões
          </Button>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Novo Departamento
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Criar Departamento</DialogTitle>
                <DialogDescription>
                  Configure um novo departamento com controle de acesso aos dados
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome do Departamento</Label>
                    <Input
                      id="name"
                      value={newDepartment.name}
                      onChange={(e) => setNewDepartment(prev => ({ ...prev, name))}
                      placeholder="Ex) => setNewDepartment(prev => ({ ...prev, type))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {departmentTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.icon} {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Input
                    id="description"
                    value={newDepartment.description}
                    onChange={(e) => setNewDepartment(prev => ({ ...prev, description))}
                    placeholder="Descreva as responsabilidades deste departamento"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="parent">Departamento Pai (Opcional)</Label>
                  <Select
                    value={newDepartment.parentDepartmentId || ''}
                    onValueChange={(value) => setNewDepartment(prev => ({ 
                      ...prev, 
                      parentDepartmentId))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um departamento pai" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Nenhum (Departamento raiz)</SelectItem>
                      {departments.map((dept) => (
                        <SelectItem key={dept.id} value={dept.id}>
                          {getDepartmentTypeInfo(dept.type).icon} {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label>Configurações</Label>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">Atribuição Automática</p>
                        <p className="text-xs text-gray-600">Novos usuários são automaticamente atribuídos</p>
                      </div>
                      <Switch
                        checked={newDepartment.settings.autoAssignNewUsers}
                        onCheckedChange={(checked) => setNewDepartment(prev => ({
                          ...prev,
                          settings, autoAssignNewUsers))}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">Requer Aprovação</p>
                        <p className="text-xs text-gray-600">Acesso ao departamento requer aprovação</p>
                      </div>
                      <Switch
                        checked={newDepartment.settings.requireApprovalForAccess}
                        onCheckedChange={(checked) => setNewDepartment(prev => ({
                          ...prev,
                          settings, requireApprovalForAccess))}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Cancelar
                  </Button>
                  <Button 
                    onClick={createDepartment} 
                    disabled={isCreating || !newDepartment.name}
                  >
                    {isCreating ? "Criando..." : "Criar Departamento"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Usuários</p>
                <p className="text-2xl font-bold">{users.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Permissões</p>
                <p className="text-2xl font-bold">{permissions.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Departamentos */}
      <div className="grid gap-4">
        {departments.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum departamento configurado</h3>
                <p className="text-gray-600 mb-4">
                  Crie departamentos para organizar usuários e controlar acesso aos dados.
                </p>
                <Button onClick={() => setShowCreateDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Primeiro Departamento
                </Button>
              </div>
            </CardContent>
          </Card>
        ) {
            const typeInfo = getDepartmentTypeInfo(department.type);
            const usersInDept = getUsersInDepartment(department.id);
            
            return (
              <Card key={department.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">{typeInfo.icon}</div>
                      <div>
                        <CardTitle className="flex items-center space-x-2">
                          <span>{department.name}</span>
                          <Badge variant={department.isActive ? "default" : "secondary"}>
                            {department.isActive ? "Ativo" : "Inativo"}
                          </Badge>
                          <Badge variant="outline">{typeInfo.label}</Badge>
                        </CardTitle>
                        {department.description && (
                          <CardDescription>{department.description}</CardDescription>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedDepartment(department)}
                      >
                        <Settings className="h-4 w-4 mr-1" />
                        Configurar
                      </Button>
                      <Switch
                        checked={department.isActive}
                        onCheckedChange={(checked) => toggleDepartment(department.id, checked)}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteDepartment(department.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Última atualização</p>
                      <p className="text-sm">{new Date(department.updatedAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
