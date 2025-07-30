import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, 
  Users, 
  Workflow, 
  Settings, 
  Plus, 
  Activity,
  TrendingUp,
  FileText,
  Calendar,
  Bell
} from 'lucide-react';
import { UnifiedHeader } from '@/components/unified-header';

export default function Dashboard() {
  const [selectedTenant, setSelectedTenant] = useState<any>(null);

  useEffect(() => {
    const tenant = localStorage.getItem('selectedTenant');
    if (tenant) {
      setSelectedTenant(JSON.parse(tenant));
    } else {
      // Redirect to tenant selection if no tenant is selected
      window.location.href = '/select-tenant';
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('selectedTenant');
    window.location.href = '/api/logout';
  };

  const handleBackToSelection = () => {
    localStorage.removeItem('selectedTenant');
    window.location.href = '/select-tenant';
  };

  if (!selectedTenant) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <UnifiedHeader 
        title={`${selectedTenant.name} - Dashboard`}
        subtitle={`Painel de controle da empresa ${selectedTenant.name}`}
        showUserActions={true}
        user={{ firstName: 'Usuário', lastName: 'Empresa' }}
        onLogout={handleLogout}
      />
      
      <div className="px-6 py-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Bem-vindo ao {selectedTenant.name}
            </h1>
            <p className="text-gray-600">
              {selectedTenant.description}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" onClick={handleBackToSelection}>
              Trocar Empresa
            </Button>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              {selectedTenant.userCount} usuários ativos
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Workflows Ativos</CardTitle>
              <Workflow className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{selectedTenant.workflowCount}</div>
              <p className="text-xs text-muted-foreground">+2 este mês</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Usuários</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{selectedTenant.userCount}</div>
              <p className="text-xs text-muted-foreground">5 novos esta semana</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Execuções Hoje</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">247</div>
              <p className="text-xs text-muted-foreground">98.5% taxa de sucesso</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Relatórios</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">3 pendentes</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="workflows">Workflows</TabsTrigger>
            <TabsTrigger value="clients">Clientes</TabsTrigger>
            <TabsTrigger value="reports">Relatórios</TabsTrigger>
            <TabsTrigger value="settings">Configurações</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Atividade Recente</CardTitle>
                  <CardDescription>Últimas ações na sua empresa</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div>
                        <p className="text-sm font-medium">Workflow "Cadastro Cliente" executado</p>
                        <p className="text-xs text-muted-foreground">há 5 minutos</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div>
                        <p className="text-sm font-medium">Novo usuário adicionado ao sistema</p>
                        <p className="text-xs text-muted-foreground">há 1 hora</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      <div>
                        <p className="text-sm font-medium">Relatório mensal gerado</p>
                        <p className="text-xs text-muted-foreground">há 2 horas</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Ações Rápidas</CardTitle>
                  <CardDescription>Funcionalidades mais utilizadas</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full justify-start">
                    <Plus className="h-4 w-4 mr-2" />
                    Criar Novo Workflow
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Users className="h-4 w-4 mr-2" />
                    Gerenciar Clientes
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="h-4 w-4 mr-2" />
                    Gerar Relatório
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Settings className="h-4 w-4 mr-2" />
                    Configurações
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="workflows" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Workflows da Empresa</h2>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Novo Workflow
              </Button>
            </div>
            <Card>
              <CardContent className="p-6">
                <p className="text-center text-muted-foreground">
                  Interface de criação e gestão de workflows será implementada aqui.
                  <br />
                  Permitirá criar automações personalizadas para sua empresa.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="clients" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Gestão de Clientes</h2>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Novo Cliente
              </Button>
            </div>
            <Card>
              <CardContent className="p-6">
                <p className="text-center text-muted-foreground">
                  Sistema de gestão de clientes será implementado aqui.
                  <br />
                  Cadastro, categorização e histórico de interações.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Relatórios e Analytics</h2>
              <Button>
                <FileText className="h-4 w-4 mr-2" />
                Novo Relatório
              </Button>
            </div>
            <Card>
              <CardContent className="p-6">
                <p className="text-center text-muted-foreground">
                  Sistema de relatórios dinâmicos será implementado aqui.
                  <br />
                  Dashboards personalizados e exports automatizados.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <h2 className="text-xl font-semibold">Configurações da Empresa</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Informações Gerais</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p><strong>Nome:</strong> {selectedTenant.name}</p>
                    <p><strong>Domínio:</strong> {selectedTenant.domain}.toitflow.com</p>
                    <p><strong>Usuários:</strong> {selectedTenant.userCount}</p>
                    <p><strong>Workflows:</strong> {selectedTenant.workflowCount}</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Configurações Avançadas</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Configurações de integração, permissões e customizações serão implementadas aqui.
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}