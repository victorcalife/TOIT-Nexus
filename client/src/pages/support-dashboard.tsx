import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, 
  Users, 
  Database, 
  Activity, 
  TrendingUp, 
  Settings, 
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  BarChart3,
  UserCog
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function SupportDashboard() {
  const { user } = useAuth();
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);

  // Mock data para demonstração
  const systemMetrics = {
    totalTenants: 156,
    activeUsers: 2847,
    systemUptime: "99.97%",
    activeSessions: 342,
    totalQueries: 12847,
    avgResponseTime: "142ms"
  };

  const recentActivities = [
    {
      id: 1,
      type: "tenant_created",
      description: "Nova empresa criada: Tech Solutions Ltda",
      timestamp: "2 min atrás",
      severity: "info"
    },
    {
      id: 2,
      type: "system_alert",
      description: "Alto uso de CPU detectado no servidor DB",
      timestamp: "5 min atrás",
      severity: "warning"
    },
    {
      id: 3,
      type: "user_login",
      description: "Super Admin logou no sistema",
      timestamp: "10 min atrás",
      severity: "info"
    },
    {
      id: 4,
      type: "backup_completed",
      description: "Backup automático concluído com sucesso",
      timestamp: "15 min atrás",
      severity: "success"
    }
  ];

  const supportTickets = [
    {
      id: "TKT-001",
      title: "Problema de conexão com API externa",
      tenant: "Empresa ABC",
      priority: "high",
      status: "open",
      assignee: "João Silva"
    },
    {
      id: "TKT-002", 
      title: "Solicitação de novo módulo personalizado",
      tenant: "Tech Corp",
      priority: "medium",
      status: "in_progress",
      assignee: "Maria Santos"
    },
    {
      id: "TKT-003",
      title: "Relatório de performance lento",
      tenant: "Inovação Ltd",
      priority: "low", 
      status: "resolved",
      assignee: "Pedro Costa"
    }
  ];

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "success": return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "warning": return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case "error": return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default: return <Activity className="h-4 w-4 text-blue-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-800 border-red-200";
      case "medium": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low": return "bg-green-100 text-green-800 border-green-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open": return "bg-red-100 text-red-800";
      case "in_progress": return "bg-blue-100 text-blue-800";
      case "resolved": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Shield className="h-8 w-8 text-purple-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard TOIT Support</h1>
                <p className="text-gray-600">
                  Bem-vindo, {user?.firstName} - {user?.role === 'super_admin' ? 'Super Administrator' : 'Support Admin'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {user?.hasFinancialAccess ? (
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  <DollarSign className="h-3 w-3 mr-1" />
                  Acesso Financeiro
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  <UserCog className="h-3 w-3 mr-1" />
                  Suporte Técnico
                </Badge>
              )}
              
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Configurações
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Métricas do Sistema */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
          <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedMetric('tenants')}>
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

          <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedMetric('users')}>
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

          <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedMetric('uptime')}>
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

          <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedMetric('sessions')}>
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

          <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedMetric('queries')}>
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

          <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedMetric('response')}>
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
          {/* Atividade Recente do Sistema */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-5 w-5" />
                <span>Atividade Recente do Sistema</span>
              </CardTitle>
              <CardDescription>
                Últimas atividades e eventos do sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity) => (
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
                {supportTickets.map((ticket) => (
                  <div key={ticket.id} className="p-4 border rounded-lg hover:border-purple-200 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-sm font-mono text-gray-500">{ticket.id}</span>
                          <Badge className={getPriorityColor(ticket.priority)}>
                            {ticket.priority}
                          </Badge>
                          <Badge className={getStatusColor(ticket.status)}>
                            {ticket.status}
                          </Badge>
                        </div>
                        <h4 className="font-medium text-gray-900 mb-1">{ticket.title}</h4>
                        <p className="text-sm text-gray-600">
                          {ticket.tenant} • Assignee: {ticket.assignee}
                        </p>
                      </div>
                    </div>
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

        {/* Ações Rápidas */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Ações Rápidas</CardTitle>
              <CardDescription>
                Ferramentas e ações frequentemente utilizadas pela equipe de suporte
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button variant="outline" className="h-24 flex-col">
                  <Users className="h-6 w-6 mb-2" />
                  <span>Gerenciar Usuários</span>
                </Button>
                
                <Button variant="outline" className="h-24 flex-col" disabled={!user?.hasFinancialAccess}>
                  <DollarSign className="h-6 w-6 mb-2" />
                  <span>Relatórios Financeiros</span>
                  {!user?.hasFinancialAccess && (
                    <span className="text-xs text-red-500 mt-1">Restrito</span>
                  )}
                </Button>
                
                <Button variant="outline" className="h-24 flex-col">
                  <Database className="h-6 w-6 mb-2" />
                  <span>Monitor Sistema</span>
                </Button>
                
                <Button variant="outline" className="h-24 flex-col">
                  <Settings className="h-6 w-6 mb-2" />
                  <span>Configurações</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}