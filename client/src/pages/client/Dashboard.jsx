import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {  
  BarChart3, 
  Workflow, 
  Database, 
  Brain, 
  Mail, 
  MessageSquare, 
  Users, 
  TrendingUp, 
  Clock, 
  CheckCircle,
  AlertCircle,
  Activity,
  Calendar,
  FileText,
  Settings
} from 'lucide-react';

const Dashboard = () => {
  const { user, tenant } = useAuth();
  const [stats, setStats] = useState({
    workflows: { total: 12, active: 8, completed: 156 },
    reports: { total: 24, generated: 89, scheduled: 5 },
    tasks: { total: 45, pending: 12, completed: 33 },
    connections: { total: 6, active: 4, errors: 1 }
  });

  const [recentActivities, setRecentActivities] = useState([
    {
      id: 1,
      type: 'workflow',
      title: 'Workflow de Vendas executado',
      description: 'Processamento de 150 leads concluído',
      time: '2 min atrás',
      status: 'success'
    },
    {
      id: 2,
      type: 'report',
      title: 'Relatório mensal gerado',
      description: 'Relatório de performance disponível',
      time: '15 min atrás',
      status: 'success'
    },
    {
      id: 3,
      type: 'task',
      title: 'Tarefa de análise pendente',
      description: 'Análise de dados aguardando aprovação',
      time: '1 hora atrás',
      status: 'pending'
    },
    {
      id: 4,
      type: 'connection',
      title: 'Erro na conexão com API',
      description: 'Falha na sincronização com sistema externo',
      time: '2 horas atrás',
      status: 'error'
    }
  ]);

  const quickActions = [
    {
      icon: <Workflow className="h-6 w-6" />,
      title: 'Criar Workflow',
      description: 'Automatize processos',
      href: '/workflows',
      color: 'bg-blue-500'
    },
    {
      icon: <BarChart3 className="h-6 w-6" />,
      title: 'Gerar Relatório',
      description: 'Análise de dados',
      href: '/reports',
      color: 'bg-green-500'
    },
    {
      icon: <Database className="h-6 w-6" />,
      title: 'Query Builder',
      description: 'Consultar dados',
      href: '/query-builder',
      color: 'bg-purple-500'
    },
    {
      icon: <Brain className="h-6 w-6" />,
      title: 'Machine Learning',
      description: 'Modelos de IA',
      href: '/ml',
      color: 'bg-orange-500'
    }
  ];

  const getActivityIcon = (type) => {
    switch (type) {
      case 'workflow': return <Workflow className="h-4 w-4" />;
      case 'report': return <BarChart3 className="h-4 w-4" />;
      case 'task': return <CheckCircle className="h-4 w-4" />;
      case 'connection': return <Database className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return 'text-green-600';
      case 'pending': return 'text-yellow-600';
      case 'error': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {getGreeting()}, {user?.name || 'Usuário'}!
          </h1>
          <p className="text-muted-foreground">
            {tenant && `Workspace: ${tenant}`} • Hoje é {new Date().toLocaleDateString('pt-BR', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
        <div className="flex items-center space-x-2 mt-4 sm:mt-0">
          <Button variant="outline" size="sm">
            <Calendar className="h-4 w-4 mr-2" />

          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Configurações
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Workflows</CardTitle>
            <Workflow className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.workflows.active}</div>
            <p className="text-xs text-muted-foreground">
              {stats.workflows.total} total • {stats.workflows.completed} executados
            </p>
            <Progress value={(stats.workflows.active / stats.workflows.total) * 100} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Relatórios</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.reports.total}</div>
            <p className="text-xs text-muted-foreground">
              {stats.reports.generated} gerados • {stats.reports.scheduled} agendados
            </p>
            <Progress value={(stats.reports.generated / (stats.reports.generated + stats.reports.scheduled)) * 100} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tarefas</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.tasks.pending}</div>
            <p className="text-xs text-muted-foreground">
              {stats.tasks.total} total • {stats.tasks.completed} concluídas
            </p>
            <Progress value={(stats.tasks.completed / stats.tasks.total) * 100} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conexões</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.connections.active}</div>
            <p className="text-xs text-muted-foreground">
              {stats.connections.total} total • {stats.connections.errors} com erro
            </p>
            <Progress value={(stats.connections.active / stats.connections.total) * 100} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Quick Actions */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Ações Rápidas</CardTitle>
              <CardDescription>
                Acesse rapidamente as principais funcionalidades
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {quickActions.map((action, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  className="w-full justify-start h-auto p-4"
                  asChild
                >
                  <a href={action.href}>
                    <div className={`${action.color} p-2 rounded-md text-white mr-3`}>
                      {action.icon}
                    </div>
                    <div className="text-left">
                      <div className="font-medium">{action.title}</div>
                      <div className="text-sm text-muted-foreground">{action.description}</div>
                    </div>
                  </a>
                </Button>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Recent Activities */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Atividades Recentes</CardTitle>
              <CardDescription>
                Acompanhe as últimas atividades do sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className={`${getStatusColor(activity.status)} mt-1`}>
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-sm">{activity.title}</p>
                        <Badge variant={activity.status === 'error' ? 'destructive' : activity.status === 'pending' ? 'secondary' : 'default'} className="text-xs">
                          {activity.status === 'success' ? 'Sucesso' : activity.status === 'pending' ? 'Pendente' : 'Erro'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{activity.description}</p>
                      <div className="flex items-center mt-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3 mr-1" />
                        {activity.time}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 text-center">
                <Button variant="outline" size="sm">
                  Ver todas as atividades
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Performance Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Visão Geral de Performance</CardTitle>
          <CardDescription>
            Métricas e indicadores de performance do sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Visão Geral</TabsTrigger>
              <TabsTrigger value="workflows">Workflows</TabsTrigger>
              <TabsTrigger value="reports">Relatórios</TabsTrigger>
              <TabsTrigger value="system">Sistema</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="text-center p-4 border rounded-lg">
                  <TrendingUp className="h-8 w-8 mx-auto mb-2 text-green-600" />
                  <div className="text-2xl font-bold">+23%</div>
                  <div className="text-sm text-muted-foreground">Produtividade</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <Users className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                  <div className="text-2xl font-bold">1,234</div>
                  <div className="text-sm text-muted-foreground">Usuários Ativos</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <Activity className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                  <div className="text-2xl font-bold">99.9%</div>
                  <div className="text-sm text-muted-foreground">Uptime</div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="workflows" className="space-y-4">
              <div className="text-center py-8">
                <Workflow className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">Métricas detalhadas de workflows em breve...</p>
              </div>
            </TabsContent>
            
            <TabsContent value="reports" className="space-y-4">
              <div className="text-center py-8">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">Análise de relatórios em breve...</p>
              </div>
            </TabsContent>
            
            <TabsContent value="system" className="space-y-4">
              <div className="text-center py-8">
                <Activity className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">Métricas do sistema em breve...</p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;