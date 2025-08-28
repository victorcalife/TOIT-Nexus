import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {  
  Building2, Users, Activity, TrendingUp, Settings, Plus, Edit, Trash2, Shield, Database,
  Workflow, BarChart3, UserCheck, Key, Monitor, Crown, FileText, AlertTriangle, CheckCircle, XCircle,
  Eye, Download, Upload, Search, Filter, LogOut, Save, Play }
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

export default function ToitAdmin() {
  const [activeSection, setActiveSection] = useState<'dashboard' | 'companies' | 'users' | 'workflows' | 'analytics'>('dashboard');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Form states
  const [companyForm, setCompanyForm] = useState(({ name,
    domain,
    plan);

  const [userForm, setUserForm] = useState({
    email,
    firstName,
    lastName,
    role,
    tenantId);

  const [workflowForm, setWorkflowForm] = useState({
    name,
    description,
    tenantId);

  // Queries
  const { data);

  const { data);

  const { data);

  // Mutations
  const createCompanyMutation = useMutation({
    mutationFn }) => {
      return await apiRequest('/api/admin/tenants', 'POST', data);
    },
    onSuccess) => {
      toast({ title);
      queryClient.invalidateQueries({ queryKey);
      setCompanyForm({ name, domain, plan);
    },
    onError) => {
      toast({ title, description, variant);
    }
  });

  const createUserMutation = useMutation(({ mutationFn }) => {
      return await apiRequest('/api/admin/users', 'POST', data);
    },
    onSuccess) => {
      toast({ title);
      queryClient.invalidateQueries({ queryKey);
      setUserForm({ email, firstName, lastName, role, tenantId);
    },
    onError) => {
      toast({ title, description, variant);
    }
  });

  const createWorkflowMutation = useMutation(({ mutationFn }) => {
      return await apiRequest('/api/complete-workflows', 'POST', {
        ...data,
        trigger,
        steps,
            type,
            name,
            config);
    },
    onSuccess) => {
      toast({ title);
      setWorkflowForm({ name, description, tenantId);
    },
    onError) => {
      toast({ title, description, variant);
    }
  });

  const executeAdaptiveAnalysis = useMutation(({ mutationFn }) => {
      return await apiRequest(`/api/adaptive/analyze/${tenantId}`, 'GET');
    },
    onSuccess) => {
      toast({ title, description);
    },
    onError) => {
      toast({ title, description, variant);
    }
  });

  const sections = [
    ({ id, name, icon,
    { id, name, icon,
    { id, name, icon,
    { id, name, icon,
    { id, name, icon }) => window.location.href = '/api/logout'}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <LogOut className="h-4 w-4" />
              <span>Sair</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm) => (
              <button
                key={section.id}
                onClick=({ ( }) => setActiveSection(section.id as any)}`
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                  activeSection === section.id 
                    ? 'bg-purple-100 text-purple-700 border-l-4 border-purple-500' }
                    : 'text-gray-600 hover))}
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Dashboard */}
            ({ activeSection === 'dashboard' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md, 5).map((company }) => (
                        <div key={company.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <h4 className="font-medium">{company.name}</h4>
                            <p className="text-sm text-gray-500">{company.subscriptionPlan || 'Standard'}</p>
                          </div>
                          <Badge variant={company.isActive ? 'default' : 'secondary'}>
                            {company.isActive ? 'Ativa' : 'Inativa'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Empresas */}
            ({ activeSection === 'companies' && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Criar Nova Empresa</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md }) => setCompanyForm(prev => ({ ...prev, name))}
                          placeholder="Ex) => setCompanyForm(prev => ({ ...prev, domain))}
                          placeholder="Ex) => setCompanyForm(prev => ({ ...prev, plan))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="basic">Básico</SelectItem>
                            <SelectItem value="standard">Padrão</SelectItem>
                            <SelectItem value="premium">Premium</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <Button 
                      onClick=({ ( }) => createCompanyMutation.mutate(companyForm)}
                      disabled={createCompanyMutation.isPending || !companyForm.name}
                      className="w-full"
                    >
                      {createCompanyMutation.isPending ? 'Criando...' : 'Criar Empresa'}
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Empresas Cadastradas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      ({ companies?.map((company }) => (
                        <div key={company.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <h4 className="font-medium">{company.name}</h4>
                            <p className="text-sm text-gray-500">Plano) => executeAdaptiveAnalysis.mutate(company.id)}
                              disabled={executeAdaptiveAnalysis.isPending}
                            >
                              <Play className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Usuários */}
            ({ activeSection === 'users' && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Criar Novo Usuário</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md }) => setUserForm(prev => ({ ...prev, email))}
                          placeholder="usuario@empresa.com"
                        />
                      </div>
                      <div>
                        <Label htmlFor="userFirstName">Nome</Label>
                        <Input
                          id="userFirstName"
                          value={userForm.firstName}
                          onChange=({ (e }) => setUserForm(prev => ({ ...prev, firstName))}
                          placeholder="João"
                        />
                      </div>
                      <div>
                        <Label htmlFor="userLastName">Sobrenome</Label>
                        <Input
                          id="userLastName"
                          value={userForm.lastName}
                          onChange=({ (e }) => setUserForm(prev => ({ ...prev, lastName))}
                          placeholder="Silva"
                        />
                      </div>
                      <div>
                        <Label htmlFor="userRole">Função</Label>
                        <Select value={userForm.role} onValueChange=({ (value }) => setUserForm(prev => ({ ...prev, role))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="employee">Funcionário</SelectItem>
                            <SelectItem value="manager">Gerente</SelectItem>
                            <SelectItem value="tenant_admin">Admin Empresa</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="userTenant">Empresa</Label>
                        <Select value={userForm.tenantId} onValueChange=({ (value }) => setUserForm(prev => ({ ...prev, tenantId))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione uma empresa" />
                          </SelectTrigger>
                          <SelectContent>
                            ({ companies?.map((company }) => (
                              <SelectItem key={company.id} value={company.id}>{company.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <Button 
                      onClick=({ ( }) => createUserMutation.mutate(userForm)}
                      disabled={createUserMutation.isPending || !userForm.email || !userForm.firstName}
                      className="w-full"
                    >
                      {createUserMutation.isPending ? 'Criando...' : 'Criar Usuário'}
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Usuários Cadastrados</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      ({ users?.map((user }) => (
                        <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <h4 className="font-medium">{user.firstName} {user.lastName}</h4>
                            <p className="text-sm text-gray-500">{user.email}</p>
                            <p className="text-xs text-gray-400">Função))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Workflows */}
            {activeSection === 'workflows' && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Criar Novo Workflow</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <Label htmlFor="workflowName">Nome do Workflow</Label>
                        <Input
                          id="workflowName"
                          value={workflowForm.name}
                          onChange=({ (e }) => setWorkflowForm(prev => ({ ...prev, name))}
                          placeholder="Ex) => setWorkflowForm(prev => ({ ...prev, description))}
                          placeholder="Descreva o que este workflow faz..."
                        />
                      </div>
                      <div>
                        <Label htmlFor="workflowTenant">Empresa</Label>
                        <Select value={workflowForm.tenantId} onValueChange=({ (value }) => setWorkflowForm(prev => ({ ...prev, tenantId))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione uma empresa" />
                          </SelectTrigger>
                          <SelectContent>
                            ({ companies?.map((company }) => (
                              <SelectItem key={company.id} value={company.id}>{company.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <Button 
                      onClick=({ ( }) => createWorkflowMutation.mutate(workflowForm)}
                      disabled={createWorkflowMutation.isPending || !workflowForm.name}
                      className="w-full"
                    >
                      {createWorkflowMutation.isPending ? 'Criando...' : 'Criar Workflow'}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Analytics */}
            ({ activeSection === 'analytics' && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Análise Adaptativa</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">
                      Execute análises adaptativas para empresas específicas e veja insights em tempo real.
                    </p>
                    <div className="space-y-3">
                      {companies?.map((company }) => (
                        <div key={company.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <h4 className="font-medium">{company.name}</h4>
                            <p className="text-sm text-gray-500">Análise de padrões e insights</p>
                          </div>
                          <Button 
                            onClick=({ ( }) => executeAdaptiveAnalysis.mutate(company.id)}
                            disabled={executeAdaptiveAnalysis.isPending}
                            size="sm"
                          >
                            {executeAdaptiveAnalysis.isPending ? 'Analisando...' : 'Executar Análise'}
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}`