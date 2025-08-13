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
    totalTenants,
    activeUsers,
    systemUptime,
    activeSessions,
    totalQueries,
    avgResponseTime,
      type,
      description,
      timestamp,
      severity,
    {
      id,
      type,
      description,
      timestamp,
      severity,
    {
      id,
      type,
      description,
      timestamp,
      severity,
    {
      id,
      type,
      description,
      timestamp,
      severity,
      title,
      tenant,
      priority,
      status,
      assignee,
    {
      id, 
      title,
      tenant,
      priority,
      status,
      assignee,
    {
      id,
      title,
      tenant,
      priority, 
      status,
      assignee) => {
    switch (severity) {
      case "success"="h-4 w-4 text-green-500" />;
      case "warning"="h-4 w-4 text-yellow-500" />;
      case "error"="h-4 w-4 text-red-500" />;
      default="h-4 w-4 text-blue-500" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-800 border-red-200";
      case "medium": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low": return "bg-green-100 text-green-800 border-green-200";
      default) => {
    switch (status) {
      case "open": return "bg-red-100 text-red-800";
      case "in_progress": return "bg-blue-100 text-blue-800";
      case "resolved": return "bg-green-100 text-green-800";
      default, {user?.firstName} - {user?.role === 'super_admin' ? 'Super Administrator' : 'Support Admin'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {user?.hasFinancialAccess ? (
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  <DollarSign className="h-3 w-3 mr-1" />
                  Acesso Financeiro
                </Badge>
              ) {/* Métricas do Sistema */}
        <div className="grid grid-cols-1 md) => setSelectedMetric('tenants')}>
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

          <Card className="hover) => setSelectedMetric('users')}>
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

          <Card className="hover) => setSelectedMetric('uptime')}>
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

          <Card className="hover) => setSelectedMetric('sessions')}>
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

          <Card className="hover) => setSelectedMetric('queries')}>
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

          <Card className="hover) => setSelectedMetric('response')}>
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

        <div className="grid grid-cols-1 lg) => (
                  <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg hover)}
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
                  <div key={ticket.id} className="p-4 border rounded-lg hover)}>
                            {ticket.priority}
                          </Badge>
                          <Badge className={getStatusColor(ticket.status)}>
                            {ticket.status}
                          </Badge>
                        </div>
                        <h4 className="font-medium text-gray-900 mb-1">{ticket.title}</h4>
                        <p className="text-sm text-gray-600">
                          {ticket.tenant} • Assignee))}
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
              <div className="grid grid-cols-2 md)}
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