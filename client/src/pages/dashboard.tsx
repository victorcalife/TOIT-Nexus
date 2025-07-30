import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  BarChart3, 
  Users, 
  Workflow, 
  TrendingUp,
  Activity,
  Clock,
  CheckCircle,
  AlertTriangle
} from "lucide-react";

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/dashboard/stats'],
    retry: false,
  });

  const { data: activities, isLoading: activitiesLoading } = useQuery({
    queryKey: ['/api/dashboard/activities'],
    retry: false,
  });

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'create_client':
        return <Users className="w-4 h-4 text-blue-500" />;
      case 'create_workflow':
        return <Workflow className="w-4 h-4 text-green-500" />;
      case 'create_integration':
        return <BarChart3 className="w-4 h-4 text-purple-500" />;
      default:
        return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const getActionLabel = (action: string) => {
    switch (action) {
      case 'create_client':
        return 'Cliente criado';
      case 'update_client':
        return 'Cliente atualizado';
      case 'delete_client':
        return 'Cliente excluído';
      case 'create_workflow':
        return 'Workflow criado';
      case 'update_workflow':
        return 'Workflow atualizado';
      case 'delete_workflow':
        return 'Workflow excluído';
      case 'create_integration':
        return 'Integração criada';
      case 'update_integration':
        return 'Integração atualizada';
      case 'delete_integration':
        return 'Integração excluída';
      case 'create_category':
        return 'Categoria criada';
      case 'update_category':
        return 'Categoria atualizada';
      case 'delete_category':
        return 'Categoria excluída';
      default:
        return 'Atividade do sistema';
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-600 mt-1">
            Visão geral das atividades e métricas do sistema
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsLoading ? (
            <>
              {[...Array(4)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <Skeleton className="h-4 w-24 mb-2" />
                        <Skeleton className="h-8 w-16" />
                      </div>
                      <Skeleton className="h-12 w-12 rounded-lg" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </>
          ) : (
            <>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total de Clientes</p>
                      <p className="text-3xl font-semibold text-gray-900 mt-2">
                        {stats?.totalClients || 0}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-primary-50 rounded-lg flex items-center justify-center">
                      <Users className="w-6 h-6 text-primary-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Workflows Ativos</p>
                      <p className="text-3xl font-semibold text-gray-900 mt-2">
                        {stats?.activeWorkflows || 0}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-success-50 rounded-lg flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-success-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total de Execuções</p>
                      <p className="text-3xl font-semibold text-gray-900 mt-2">
                        {stats?.totalExecutions || 0}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-warning-50 rounded-lg flex items-center justify-center">
                      <Activity className="w-6 h-6 text-warning-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Taxa de Sucesso</p>
                      <p className="text-3xl font-semibold text-gray-900 mt-2">
                        {stats?.successRate || 0}%
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-success-50 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-success-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activities */}
          <Card>
            <CardHeader>
              <CardTitle>Atividades Recentes</CardTitle>
              <CardDescription>
                Últimas ações realizadas no sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              {activitiesLoading ? (
                <div className="space-y-4">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="flex items-center space-x-4">
                      <Skeleton className="h-10 w-10 rounded-lg" />
                      <div className="flex-1">
                        <Skeleton className="h-4 w-32 mb-1" />
                        <Skeleton className="h-3 w-48" />
                      </div>
                      <Skeleton className="h-3 w-16" />
                    </div>
                  ))}
                </div>
              ) : activities && activities.length > 0 ? (
                <div className="space-y-4">
                  {activities.map((activity: any) => (
                    <div key={activity.id} className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center">
                        {getActionIcon(activity.action)}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {getActionLabel(activity.action)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {activity.description || 'Atividade do sistema'}
                        </p>
                      </div>
                      <p className="text-xs text-gray-400">
                        {new Date(activity.createdAt).toLocaleString('pt-BR')}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Activity className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Nenhuma atividade recente</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* System Status */}
          <Card>
            <CardHeader>
              <CardTitle>Status do Sistema</CardTitle>
              <CardDescription>
                Visão geral da saúde do sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-success-50 rounded-lg flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-success-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Servidor Principal</p>
                      <p className="text-xs text-gray-500">Online e funcionando</p>
                    </div>
                  </div>
                  <Badge className="bg-success-100 text-success-800">Online</Badge>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-success-50 rounded-lg flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-success-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Banco de Dados</p>
                      <p className="text-xs text-gray-500">Conectado e responsivo</p>
                    </div>
                  </div>
                  <Badge className="bg-success-100 text-success-800">Online</Badge>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-warning-50 rounded-lg flex items-center justify-center">
                      <AlertTriangle className="w-4 h-4 text-warning-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Integrações Externas</p>
                      <p className="text-xs text-gray-500">Algumas com latência elevada</p>
                    </div>
                  </div>
                  <Badge className="bg-warning-100 text-warning-800">Atenção</Badge>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-success-50 rounded-lg flex items-center justify-center">
                      <Activity className="w-4 h-4 text-success-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Workflows</p>
                      <p className="text-xs text-gray-500">{stats?.activeWorkflows || 0} workflows ativos</p>
                    </div>
                  </div>
                  <Badge className="bg-success-100 text-success-800">Funcionando</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
            <CardDescription>
              Acesse as funcionalidades mais utilizadas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <a
                href="/clients"
                className="flex flex-col items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Users className="w-8 h-8 text-primary-500 mb-2" />
                <span className="text-sm font-medium text-gray-900">Adicionar Cliente</span>
              </a>
              
              <a
                href="/workflows"
                className="flex flex-col items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Workflow className="w-8 h-8 text-success-500 mb-2" />
                <span className="text-sm font-medium text-gray-900">Criar Workflow</span>
              </a>

              <a
                href="/integrations"
                className="flex flex-col items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <BarChart3 className="w-8 h-8 text-purple-500 mb-2" />
                <span className="text-sm font-medium text-gray-900">Nova Integração</span>
              </a>

              <a
                href="/settings"
                className="flex flex-col items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Clock className="w-8 h-8 text-warning-500 mb-2" />
                <span className="text-sm font-medium text-gray-900">Configurações</span>
              </a>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}