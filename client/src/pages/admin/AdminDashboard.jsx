import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {  
  Users, 
  Building, 
  Shield, 
  Activity, 
  TrendingUp, 
  AlertTriangle, 
  Server, 
  Database, 
  Settings, 
  UserPlus, 
  Building2, 
  Key, 
  Monitor,
  HardDrive,
  Cpu,
  MemoryStick,
  Network,
  Clock,
  CheckCircle,
  XCircle }
from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [systemStats, setSystemStats] = useState({
    users: { total: 1247, active: 892, new: 23 },
    tenants: { total: 45, active: 42, trial: 8 },
    permissions: { total: 156, assigned: 1340, roles: 12 },
    system: { uptime: 99.9, cpu: 45, memory: 67, storage: 34 }
  });

  const [alerts, setAlerts] = useState([
    {
      id: 1,
      type: 'warning',
      title: 'Alto uso de CPU',
      description: 'Servidor principal com 85% de uso',
      time: '5 min atrás',
      severity: 'medium'
    },
    {
      id: 2,
      type: 'info',
      title: 'Novo tenant criado',
      description: 'Empresa XYZ foi adicionada ao sistema',
      time: '1 hora atrás',
      severity: 'low'
    },
    {
      id: 3,
      type: 'error',
      title: 'Falha na sincronização',
      description: 'Erro na sincronização com banco externo',
      time: '2 horas atrás',
      severity: 'high'
    }
  ]);

  const quickAdminActions = [
    {
      icon: <UserPlus className="h-6 w-6" />,
      title: 'Criar Usuário',
      description: 'Adicionar novo usuário',
      href: '/admin/users/create',
      color: 'bg-blue-500'
    },
    {
      icon: <Building2 className="h-6 w-6" />,
      title: 'Gerenciar Tenants',
      description: 'Administrar organizações',
      href: '/admin/tenants',
      color: 'bg-green-500'
    },
    {
      icon: <Key className="h-6 w-6" />,
      title: 'Permissões',
      description: 'Configurar acessos',
      href: '/admin/permissions',
      color: 'bg-purple-500'
    },
    {
      icon: <Monitor className="h-6 w-6" />,
      title: 'Monitoramento',
      description: 'Status do sistema',
      href: '/admin/monitoring',
      color: 'bg-orange-500'
    }
  ];

  const getAlertIcon = (type) => {
    switch (type) {
      case 'error': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'info': return <CheckCircle className="h-4 w-4 text-blue-600" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return 'border-l-red-500';
      case 'medium': return 'border-l-yellow-500';
      case 'low': return 'border-l-blue-500';
      default: return 'border-l-gray-500';
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
            {getGreeting()}, Administrador!
          </h1>
          <p className="text-muted-foreground">
            Painel de controle do sistema • {new Date().toLocaleDateString('pt-BR', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
        <div className="flex items-center space-x-2 mt-4 sm:mt-0">
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Configurações
          </Button>
          <Button size="sm">
            <Shield className="h-4 w-4 mr-2" />
            Segurança
          </Button>
        </div>
      </div>

      {/* System Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuários</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStats.users.total.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {systemStats.users.active} ativos • +{systemStats.users.new} novos hoje
            </p>
            <Progress value={(systemStats.users.active / systemStats.users.total) * 100} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tenants</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStats.tenants.total}</div>
            <p className="text-xs text-muted-foreground">
              {systemStats.tenants.active} ativos • {systemStats.tenants.trial} em trial
            </p>
            <Progress value={(systemStats.tenants.active / systemStats.tenants.total) * 100} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Permissões</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStats.permissions.total}</div>
            <p className="text-xs text-muted-foreground">
              {systemStats.permissions.assigned} atribuições • {systemStats.permissions.roles} roles
            </p>
            <Progress value={85} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sistema</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStats.system.uptime}%</div>
            <p className="text-xs text-muted-foreground">
              Uptime • CPU: {systemStats.system.cpu}% • RAM: {systemStats.system.memory}%
            </p>
            <Progress value={systemStats.system.uptime} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Quick Actions */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Ações Administrativas</CardTitle>
              <CardDescription>
                Acesso rápido às principais funções administrativas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {quickAdminActions.map((action, index) => (
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

        {/* System Alerts */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Alertas do Sistema</CardTitle>
              <CardDescription>
                Monitoramento em tempo real de eventos críticos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
{alerts.map((alert) => (
                  <div key={alert.id} className={`flex items-start space-x-3 p-4 border-l-4 ${getSeverityColor(alert.severity)} bg-muted/20 rounded-r-lg`}>
                    <div className="mt-1">
                      {getAlertIcon(alert.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-sm">{alert.title}</p>
                        <Badge variant={alert.severity === 'high' ? 'destructive' : alert.severity === 'medium' ? 'secondary' : 'default'} className="text-xs">
                          {alert.severity === 'high' ? 'Crítico' : alert.severity === 'medium' ? 'Atenção' : 'Info'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{alert.description}</p>
                      <div className="flex items-center mt-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3 mr-1" />
                        {alert.time}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 text-center">
                <Button variant="outline" size="sm">
                  Ver todos os alertas
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* System Monitoring */}
      <Card>
        <CardHeader>
          <CardTitle>Monitoramento do Sistema</CardTitle>
          <CardDescription>
            Status em tempo real dos recursos e performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="resources" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="resources">Recursos</TabsTrigger>
              <TabsTrigger value="database">Banco de Dados</TabsTrigger>
              <TabsTrigger value="network">Rede</TabsTrigger>
              <TabsTrigger value="logs">Logs</TabsTrigger>
            </TabsList>
            
            <TabsContent value="resources" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-4">
                <div className="text-center p-4 border rounded-lg">
                  <Cpu className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                  <div className="text-2xl font-bold">{systemStats.system.cpu}%</div>
                  <div className="text-sm text-muted-foreground">CPU</div>
                  <Progress value={systemStats.system.cpu} className="mt-2" />
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <MemoryStick className="h-8 w-8 mx-auto mb-2 text-green-600" />
                  <div className="text-2xl font-bold">{systemStats.system.memory}%</div>
                  <div className="text-sm text-muted-foreground">Memória</div>
                  <Progress value={systemStats.system.memory} className="mt-2" />
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <HardDrive className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                  <div className="text-2xl font-bold">{systemStats.system.storage}%</div>
                  <div className="text-sm text-muted-foreground">Armazenamento</div>
                  <Progress value={systemStats.system.storage} className="mt-2" />
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <Network className="h-8 w-8 mx-auto mb-2 text-orange-600" />
                  <div className="text-2xl font-bold">125ms</div>
                  <div className="text-sm text-muted-foreground">Latência</div>
                  <Progress value={75} className="mt-2" />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="database" className="space-y-4">
              <div className="text-center py-8">
                <Database className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">Métricas do banco de dados em breve...</p>
              </div>
            </TabsContent>
            
            <TabsContent value="network" className="space-y-4">
              <div className="text-center py-8">
                <Network className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">Estatísticas de rede em breve...</p>
              </div>
            </TabsContent>
            
            <TabsContent value="logs" className="space-y-4">
              <div className="text-center py-8">
                <Activity className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">Visualização de logs em breve...</p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
