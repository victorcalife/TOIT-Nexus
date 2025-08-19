import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

export default function SimpleAdmin() {
  const [activeSection, setActiveSection] = useState<'dashboard' | 'users' | 'companies'>('dashboard');
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [showCreateCompany, setShowCreateCompany] = useState(false);
  const [userForm, setUserForm] = useState({ name: '', email: '', cpf: '' });
  const [companyForm, setCompanyForm] = useState({ name: '', description: '' });
  const { toast } = useToast();

  const handleLogout = () => {
    window.location.href = '/api/logout';
  };

  const createUser = () => {
    if (!userForm.name || !userForm.email || !userForm.cpf) {
      toast({ title: "Erro", description: "Preencha todos os campos", variant: "destructive" });
      return;
    }
    
    toast({ title: "Sucesso", description: `Usuário ${userForm.name} criado!` });
    setUserForm({ name: '', email: '', cpf: '' });
    setShowCreateUser(false);
  };

  const createCompany = () => {
    if (!companyForm.name) {
      toast({ title: "Erro", description: "Nome da empresa é obrigatório", variant: "destructive" });
      return;
    }
    
    toast({ title: "Sucesso", description: `Empresa ${companyForm.name} criada!` });
    setCompanyForm({ name: '', description: '' });
    setShowCreateCompany(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER PADRONIZADO */}
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
                Sair
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* NAVEGAÇÃO */}
        <div className="mb-6">
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveSection('dashboard')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeSection === 'dashboard' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveSection('users')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeSection === 'users' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Usuários
            </button>
            <button
              onClick={() => setActiveSection('companies')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeSection === 'companies' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Empresas
            </button>
          </div>
        </div>

        {/* CONTEÚDO DASHBOARD */}
        {activeSection === 'dashboard' && (
          <div className="space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-medium text-green-800">Sistema Funcionando!</h3>
              <p className="text-sm text-green-700 mt-1">
                Painel administrativo operacional com navegação funcional.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Usuários</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600">2</div>
                  <p className="text-sm text-gray-600">Total de usuários</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Empresas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">1</div>
                  <p className="text-sm text-gray-600">Total de empresas</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">Online</div>
                  <p className="text-sm text-gray-600">Sistema operacional</p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* CONTEÚDO USUÁRIOS */}
        {activeSection === 'users' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Gestão de Usuários</h2>
              <Button onClick={() => setShowCreateUser(true)}>
                Criar Usuário
              </Button>
            </div>

            {showCreateUser && (
              <Card>
                <CardHeader>
                  <CardTitle>Novo Usuário</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="name">Nome</Label>
                    <Input
                      id="name"
                      value={userForm.name}
                      onChange={(e) => setUserForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Nome completo"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={userForm.email}
                      onChange={(e) => setUserForm(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="email@exemplo.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="cpf">CPF</Label>
                    <Input
                      id="cpf"
                      value={userForm.cpf}
                      onChange={(e) => setUserForm(prev => ({ ...prev, cpf: e.target.value }))}
                      placeholder="00000000000"
                    />
                  </div>
                  <div className="flex space-x-2">
                    <Button onClick={createUser}>Criar</Button>
                    <Button variant="outline" onClick={() => setShowCreateUser(false)}>
                      Cancelar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium">Super Admin</h3>
                      <p className="text-sm text-gray-600">super@toit.nexus</p>
                      <p className="text-xs text-gray-500">CPF: 00000000000</p>
                    </div>
                    <div className="flex space-x-2">
                      <Badge variant="destructive">Super Admin</Badge>
                      <Badge variant="default">Ativo</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium">Admin Tenant</h3>
                      <p className="text-sm text-gray-600">admin@empresa.com</p>
                      <p className="text-xs text-gray-500">CPF: 11111111111</p>
                    </div>
                    <div className="flex space-x-2">
                      <Badge variant="default">Admin</Badge>
                      <Badge variant="default">Ativo</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* CONTEÚDO EMPRESAS */}
        {activeSection === 'companies' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Gestão de Empresas</h2>
              <Button onClick={() => setShowCreateCompany(true)}>
                Criar Empresa
              </Button>
            </div>

            {showCreateCompany && (
              <Card>
                <CardHeader>
                  <CardTitle>Nova Empresa</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="companyName">Nome da Empresa</Label>
                    <Input
                      id="companyName"
                      value={companyForm.name}
                      onChange={(e) => setCompanyForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Nome da empresa"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Descrição</Label>
                    <Input
                      id="description"
                      value={companyForm.description}
                      onChange={(e) => setCompanyForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Descrição da empresa"
                    />
                  </div>
                  <div className="flex space-x-2">
                    <Button onClick={createCompany}>Criar</Button>
                    <Button variant="outline" onClick={() => setShowCreateCompany(false)}>
                      Cancelar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardContent className="pt-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium">TOIT NEXUS</h3>
                    <p className="text-sm text-gray-600">Empresa principal do sistema</p>
                    <p className="text-xs text-gray-500">ID: toit-main</p>
                  </div>
                  <div className="flex space-x-2">
                    <Badge variant="default">Ativa</Badge>
                    <Button size="sm" variant="outline">
                      Configurar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}