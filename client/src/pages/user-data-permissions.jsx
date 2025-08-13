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
import { User, Shield, Eye, Settings, Plus, Search, Filter, CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

= useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      
      // Carregar usuários, permissões e departamentos
      const [usersRes, permsRes, deptsRes] = await Promise.all([
        fetch('/api/users'),
        fetch('/api/access-control/permissions'),
        fetch('/api/access-control/departments')
      ]);

      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(usersData.data || []);
      }

      if (permsRes.ok) {
        const permsData = await permsRes.json();
        setPermissions(permsData || []);
      }

      if (deptsRes.ok) {
        const deptsData = await deptsRes.json();
        setDepartments(deptsData || []);
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

  const grantPermission = async (userId, permissionId, departmentId?) => {
    try {
      const response = await fetch(`/api/access-control/users/${userId}/permissions`, {
        method,
        headers,
        },
        body,
          departmentId,
          granted),
      });

      if (response.ok) {
        toast({
          title,
          description,
        });
        
        await loadData();
      } else {
        throw new Error('Erro ao conceder permissão');
      }

    } catch (error) {
      console.error('Erro ao conceder permissão, error);
      toast({
        title,
        description,
        variant,
      });
    }
  };

  const revokePermission = async (userId, permissionId) => {
    try {
      const response = await fetch(`/api/access-control/users/${userId}/permissions/${permissionId}`, {
        method,
      });

      if (response.ok) {
        toast({
          title,
          description,
        });
        
        await loadData();
      } else {
        throw new Error('Erro ao revogar permissão');
      }

    } catch (error) {
      console.error('Erro ao revogar permissão, error);
      toast({
        title,
        description,
        variant,
      });
    }
  };

  const previewUserData = async (userId) => {
    try {
      const response = await fetch(`/api/access-control/users/${userId}/data-preview`);
      
      if (response.ok) {
        const previewData = await response.json();
        setDataPreview(previewData.data || []);
        setShowPreviewDialog(true);
      } else {
        throw new Error('Erro ao carregar preview dos dados');
      }

    } catch (error) {
      console.error('Erro ao carregar preview, error);
      toast({
        title,
        description,
        variant,
      });
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const getPermissionStatus = (user, permissionId) => {
    const userPerm = user.permissions?.find(p => p.permissionId === permissionId);
    return userPerm?.granted || false;
  };

  const getResourceIcon = (resource) => {
    const icons = {
      'clients': '👥',
      'reports': '📊',
      'workflows': '🔄',
      'tasks': '✅',
      'files': '📁',
      'integrations': '🔗'
    };
    return icons[resource] || '📄';
  };

  const getRoleColor = (role) => {
    const colors = {
      'super_admin': 'bg-red-100 text-red-800',
      'tenant_admin': 'bg-blue-100 text-blue-800',
      'manager': 'bg-green-100 text-green-800',
      'employee': 'bg-gray-100 text-gray-800'
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando permissões de usuários...</p>
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
          <Shield className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold">Permissões de Dados por Usuário</h1>
            <p className="text-gray-600">Configure quais dados cada usuário pode acessar</p>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filtros</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Filtrar por Função</Label>
              <Select value={filterRole} onValueChange={setFilterRole}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as funções</SelectItem>
                  <SelectItem value="employee">Funcionário</SelectItem>
                  <SelectItem value="manager">Gerente</SelectItem>
                  <SelectItem value="tenant_admin">Admin da Empresa</SelectItem>
                  <SelectItem value="super_admin">Super Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Usuários */}
      <div className="grid gap-4">
        {filteredUsers.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum usuário encontrado</h3>
                <p className="text-gray-600">
                  Ajuste os filtros para encontrar usuários ou verifique se há usuários cadastrados.
                </p>
              </div>
            </CardContent>
          </Card>
        ) {user.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="flex items-center space-x-2">
                        <span>{user.name}</span>
                        <Badge className={getRoleColor(user.role)}>
                          {user.role}
                        </Badge>
                      </CardTitle>
                      <CardDescription>{user.email}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => previewUserData(user.id)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Preview
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedUser(user)}
                    >
                      <Settings className="h-4 w-4 mr-1" />
                      Configurar
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Permissões Atuais</h4>
                    <div className="grid grid-cols-2 md, 8).map((permission) => {
                        const hasPermission = getPermissionStatus(user, permission.id);
                        return (
                          <div
                            key={permission.id}
                            className={`flex items-center space-x-2 p-2 rounded-lg border ${
                              hasPermission 
                                ? 'bg-green-50 border-green-200' 
                                : 'bg-gray-50 border-gray-200'
                            }`}
                          >
                            <div className="text-sm">
                              {getResourceIcon(permission.resource)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium truncate">
                                {permission.name}
                              </p>
                            </div>
                            {hasPermission ? (
                              <CheckCircle className="h-3 w-3 text-green-600" />
                            ) {user.departments && user.departments.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Departamentos</h4>
                      <div className="flex flex-wrap gap-1">
                        {user.departments.map((deptId) => {
                          const dept = departments.find(d => d.id === deptId);
                          return dept ? (
                            <Badge key={deptId} variant="outline" className="text-xs">
                              {dept.name}
                            </Badge>
                          ) {/* Dialog de Configuração de Usuário */}
      {selectedUser && (
        <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Configurar Permissões - {selectedUser.name}</DialogTitle>
              <DialogDescription>
                Configure quais dados este usuário pode acessar
              </DialogDescription>
            </DialogHeader>
            
            <Tabs defaultValue="permissions" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="permissions">Permissões</TabsTrigger>
                <TabsTrigger value="departments">Departamentos</TabsTrigger>
              </TabsList>
              
              <TabsContent value="permissions" className="space-y-4">
                <div className="grid gap-4 max-h-96 overflow-y-auto">
                  {permissions.map((permission) => {
                    const hasPermission = getPermissionStatus(selectedUser, permission.id);
                    return (
                      <div key={permission.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="text-lg">
                            {getResourceIcon(permission.resource)}
                          </div>
                          <div>
                            <p className="font-medium">{permission.name}</p>
                            <p className="text-sm text-gray-600">{permission.description}</p>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {permission.resource}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {permission.action}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <Switch
                          checked={hasPermission}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              grantPermission(selectedUser.id, permission.id);
                            } else {
                              revokePermission(selectedUser.id, permission.id);
                            }
                          }}
                        />
                      </div>
                    );
                  })}
                </div>
              </TabsContent>
              
              <TabsContent value="departments" className="space-y-4">
                <div className="text-center py-8">
                  <p className="text-gray-600">
                    Configuração de departamentos será implementada em breve.
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      )}

      {/* Dialog de Preview de Dados */}
      <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Preview de Dados do Usuário</DialogTitle>
            <DialogDescription>
              Visualize quais dados este usuário pode acessar
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {dataPreview.map((preview) => (
              <Card key={preview.resource}>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <span>{getResourceIcon(preview.resource)}</span>
                    <span className="capitalize">{preview.resource}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600">Total de Registros</p>
                      <p className="text-lg font-semibold">{preview.totalRecords}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Registros Acessíveis</p>
                      <p className="text-lg font-semibold text-green-600">{preview.accessibleRecords}</p>
                    </div>
                  </div>
                  
                  {preview.restrictions.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">Restrições Aplicadas</p>
                      <div className="flex flex-wrap gap-1">
                        {preview.restrictions.map((restriction, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {restriction}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {preview.sampleData.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Dados de Exemplo</p>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <pre className="text-xs overflow-x-auto">
                          {JSON.stringify(preview.sampleData.slice(0, 3), null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
