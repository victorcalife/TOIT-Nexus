import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { 
  Database,
  Users,
  TrendingUp,
  Activity,
  BarChart3,
  Clock,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  DollarSign,
  Bell }
} from 'lucide-react';

export default function SupportDashboard() {
  const { user } = useAuth();
  const [selectedMetric, setSelectedMetric] = useState(null);

  // Mock data para demonstração
  const systemMetrics = {
    totalTenants: 45,
    activeUsers: 1247,
    systemUptime: '99.9%',
    activeSessions: 89,
    totalQueries: 15420,
    avgResponseTime: '120ms'
  };

  const recentActivities = [
    {
      id: 1,
      type: 'login',
      description: 'Novo usuário registrado no tenant ACME Corp',
      timestamp: '2 min atrás',
      severity: 'success'
    },
    {
      id: 2,
      type: 'error',
      description: 'Falha na conexão com banco de dados - Tenant XYZ',
      timestamp: '5 min atrás',
      severity: 'error'
    },
    {
      id: 3,
      type: 'warning',
      description: 'Alto uso de CPU detectado no servidor principal',
      timestamp: '10 min atrás',
      severity: 'warning'
    },
    {
      id: 4,
      type: 'info',
      description: 'Backup automático concluído com sucesso',
      timestamp: '15 min atrás',
      severity: 'success'
    }
  ];

  const supportTickets = [
    {
      id: 1,
      title: 'Problema de integração com API externa',
      tenant: 'ACME Corp',
      priority: 'high',
      status: 'open',
      assignee: 'João Silva'
    },
    {
      id: 2,
      title: 'Solicitação de novo módulo personalizado',
      tenant: 'Tech Solutions',
      priority: 'medium',
      status: 'in_progress',
      assignee: 'Maria Santos'
    },
    {
      id: 3,
      title: 'Dúvida sobre configuração de relatórios',
      tenant: 'StartupXYZ',
      priority: 'low',
      status: 'resolved',
      assignee: 'Pedro Costa'
    }
  ];

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Bell className="h-4 w-4 text-blue-500" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'bg-red-100 text-red-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard de Suporte</h1>
              <p className="text-gray-600 mt-1">
                Bem-vindo, {user?.firstName} - {user?.role === 'super_admin' ? 'Super Administrator' : 'Support Admin'}
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              {user?.hasFinancialAccess && (
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  <DollarSign className="h-3 w-3 mr-1" />
                  Acesso Financeiro
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Métricas do Sistema */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setSelectedMetric('tenants')}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Tenants</p>
                  <p className="text-2xl font-bold text-purple-600">{systemMetrics.totalTenants}</p>
                </div>
                <Database className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setSelectedMetric('users')}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Usuários Ativos</p>
                  <p className="text-2xl font-bold text-blue-600">{systemMetrics.activeUsers}</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setSelectedMetric('uptime')}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Uptime</p>
                  <p className="text-2xl font-bold text-green-600">{systemMetrics.systemUptime}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setSelectedMetric('sessions')}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Sessões Ativas</p>
                  <p className="text-2xl font-bold text-orange-600">{systemMetrics.activeSessions}</p>
                </div>
                <Activity className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setSelectedMetric('queries')}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Queries Hoje</p>
                  <p className="text-2xl font-bold text-indigo-600">{systemMetrics.totalQueries}</p>
                </div>
                <BarChart3 className="h-8 w-8 text-indigo-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setSelectedMetric('response')}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Tempo Resposta</p>
                  <p className="text-2xl font-bold text-cyan-600">{systemMetrics.avgResponseTime}</p>
                </div>
                <Clock className="h-8 w-8 text-cyan-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Atividades Recentes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-5 w-5" />
                <span>Atividades Recentes</span>
              </CardTitle>
              <CardDescription>
                Últimas atividades do sistema em tempo real
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                ({ recentActivities.map((activity }) => (
                  <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50">
                    {getSeverityIcon(activity.severity)}
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {activity.description}
                      </p>
                      <p className="text-xs text-gray-500">{activity.timestamp}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Tickets de Suporte */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Tickets de Suporte</span>
              </CardTitle>
              <CardDescription>
                Tickets ativos que requerem atenção da equipe
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                ({ supportTickets.map((ticket }) => (
                  <div key={ticket.id} className="p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Badge className={getPriorityColor(ticket.priority)}>
                          {ticket.priority}
                        </Badge>
                        <Badge className={getStatusColor(ticket.status)}>
                          {ticket.status}
                        </Badge>
                      </div>
                    </div>
                    <h4 className="font-medium text-gray-900 mb-1">{ticket.title}</h4>
                    <p className="text-sm text-gray-600">
                      {ticket.tenant} • Assignee: {ticket.assignee}
                    </p>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 pt-4 border-t">
                <Button className="w-full" variant="outline">
                  Ver Todos os Tickets
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}