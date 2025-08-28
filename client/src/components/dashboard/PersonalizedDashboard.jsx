/**
 * PERSONALIZED DASHBOARD
 * Dashboard personalizado baseado na persona do usuário
 * Adapta widgets, métricas e layout conforme o perfil
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 













 }
  } from 'recharts';
import { 





















    BarChart3,
    PieChart as PieChartIcon,
    LineChart as LineChartIcon }
  } from 'lucide-react';

const PersonalizedDashboard = ( { userRole, tenantId, userId } ) =>
{
  const [ dashboardData, setDashboardData ] = useState( {} );
  const [ isLoading, setIsLoading ] = useState( true );
  const [ selectedPeriod, setSelectedPeriod ] = useState( '30d' );
  const [ widgets, setWidgets ] = useState( [] );

  // Configurações de dashboard por persona
  const dashboardConfigs = {
    super_admin: {
      title: 'Dashboard Global - Super Admin',
      description: 'Visão completa do sistema TOIT Nexus',
      primaryColor: '#dc2626',
      widgets: [
        'system_health',
        'tenant_overview',
        'global_metrics',
        'performance_stats',
        'security_alerts',
        'revenue_tracking'
      ]
    },
    tenant_admin: {
      title: 'Dashboard Executivo',
      description: 'Visão estratégica da empresa',
      primaryColor: '#2563eb',
      widgets: [
        'company_kpis',
        'team_performance',
        'financial_overview',
        'growth_metrics',
        'client_satisfaction',
        'operational_efficiency'
      ]
    },
    manager: {
      title: 'Dashboard Gerencial',
      description: 'Gestão de equipe e projetos',
      primaryColor: '#059669',
      widgets: [
        'team_metrics',
        'project_status',
        'individual_performance',
        'task_completion',
        'team_productivity',
        'goal_tracking'
      ]
    },
    employee: {
      title: 'Dashboard Pessoal',
      description: 'Sua produtividade e tarefas',
      primaryColor: '#7c3aed',
      widgets: [
        'personal_tasks',
        'recent_activities',
        'achievements',
        'time_tracking',
        'skill_progress',
        'notifications'
      ]
    }
  };

  useEffect( () =>
  {
    loadDashboardData();
  }, [ userRole, tenantId, userId, selectedPeriod ] );

  const loadDashboardData = async () =>
  {
    setIsLoading( true );
    try
    {
      // Simular carregamento de dados baseado na persona
      const mockData = generateMockDataByRole( userRole );
      setDashboardData( mockData );
      setWidgets( dashboardConfigs[ userRole ]?.widgets || [] );
    } catch ( error )
    {
      console.error( 'Erro ao carregar dashboard:', error );
    } finally
    {
      setIsLoading( false );
    }
  };

  const generateMockDataByRole = ( role ) =>
  {
    const baseData = {
      period: selectedPeriod,
      lastUpdate: new Date(),
    };

    switch ( role )
    {
      case 'super_admin':
        return {
          ...baseData,
          systemHealth: 98.5,
          totalTenants: 156,
          activeUsers: 2847,
          systemLoad: 67,
          revenue: 485000,
          alerts: 3,
          tenantGrowth: [
            { month: 'Jan', tenants: 120, users: 2100 },
            { month: 'Fev', tenants: 135, users: 2350 },
            { month: 'Mar', tenants: 142, users: 2580 },
            { month: 'Abr', tenants: 156, users: 2847 }
          ],
          performanceMetrics: {
            responseTime: 245,
            uptime: 99.9,
            errorRate: 0.02
          }
        };

      case 'tenant_admin':
        return {
          ...baseData,
          revenue: 125000,
          growth: 15.3,
          teamSize: 45,
          clientSatisfaction: 4.7,
          activeProjects: 12,
          completedTasks: 89,
          monthlyMetrics: [
            { month: 'Jan', revenue: 98000, clients: 23, satisfaction: 4.5 },
            { month: 'Fev', revenue: 112000, clients: 28, satisfaction: 4.6 },
            { month: 'Mar', revenue: 118000, clients: 31, satisfaction: 4.6 },
            { month: 'Abr', revenue: 125000, clients: 35, satisfaction: 4.7 }
          ],
          departmentPerformance: [
            { name: 'Vendas', performance: 92, target: 100 },
            { name: 'Marketing', performance: 87, target: 85 },
            { name: 'Suporte', performance: 95, target: 90 },
            { name: 'Desenvolvimento', performance: 88, target: 85 }
          ]
        };

      case 'manager':
        return {
          ...baseData,
          teamSize: 8,
          activeProjects: 5,
          completedTasks: 34,
          teamProductivity: 87,
          onTimeDelivery: 92,
          teamSatisfaction: 4.3,
          projectProgress: [
            { project: 'Projeto A', progress: 85, deadline: '2024-05-15' },
            { project: 'Projeto B', progress: 67, deadline: '2024-06-01' },
            { project: 'Projeto C', progress: 92, deadline: '2024-04-30' },
            { project: 'Projeto D', progress: 45, deadline: '2024-07-15' }
          ],
          teamMetrics: [
            { member: 'Ana Silva', tasks: 12, completed: 10, performance: 95 },
            { member: 'João Santos', tasks: 15, completed: 13, performance: 88 },
            { member: 'Maria Costa', tasks: 9, completed: 9, performance: 100 },
            { member: 'Pedro Lima', tasks: 11, completed: 8, performance: 82 }
          ]
        };

      case 'employee':
        return {
          ...baseData,
          pendingTasks: 7,
          completedToday: 3,
          weeklyGoal: 25,
          weeklyCompleted: 18,
          productivity: 85,
          streak: 5,
          recentActivities: [
            { activity: 'Concluiu tarefa "Revisar documentação"', time: '10:30' },
            { activity: 'Iniciou projeto "Nova funcionalidade"', time: '09:15' },
            { activity: 'Participou da reunião de equipe', time: '08:00' }
          ],
          skillProgress: [
            { skill: 'JavaScript', progress: 85 },
            { skill: 'React', progress: 78 },
            { skill: 'Node.js', progress: 72 },
            { skill: 'Database', progress: 65 }
          ],
          achievements: [
            { title: 'Streak de 5 dias', icon: '🔥', earned: true },
            { title: 'Meta semanal atingida', icon: '🎯', earned: false },
            { title: 'Colaborador do mês', icon: '⭐', earned: true }
          ]
        };

      default:
        return baseData;
    }
  };

  const config = dashboardConfigs[ userRole ] || dashboardConfigs.employee;

  if ( isLoading )
  ({ return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            { [ ...Array( 8 ) ].map( ( _, i  }) => (
              <div key={ i } className="h-32 bg-slate-200 rounded"></div>
            ) ) }
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header do Dashboard */ }
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{ config.title }</h1>
          <p className="text-slate-600 mt-1">{ config.description }</p>
        </div>

        <div className="flex items-center space-x-3">
          <select
            value={ selectedPeriod }
            onChange=({ ( e  }) => setSelectedPeriod( e.target.value ) }
            className="px-3 py-2 border border-slate-300 rounded-lg"
          >
            <option value="7d">Últimos 7 dias</option>
            <option value="30d">Últimos 30 dias</option>
            <option value="90d">Últimos 90 dias</option>
            <option value="1y">Último ano</option>
          </select>

          <Button variant="outline" onClick={ loadDashboardData }>
            <RefreshCw className="h-4 w-4 mr-1" />

          </Button>

          <Button variant="outline">
            <Download className="h-4 w-4 mr-1" />

          </Button>

          <Button variant="outline">
            <Settings className="h-4 w-4 mr-1" />

          </Button>
        </div>
      </div>

      {/* Widgets do Dashboard */ }
      <div className="space-y-6">
        { userRole === 'super_admin' && (
          <SuperAdminWidgets data={ dashboardData } config={ config } />
        ) }

        { userRole === 'tenant_admin' && (
          <TenantAdminWidgets data={ dashboardData } config={ config } />
        ) }

        { userRole === 'manager' && (
          <ManagerWidgets data={ dashboardData } config={ config } />
        ) }

        { userRole === 'employee' && (
          <EmployeeWidgets data={ dashboardData } config={ config } />
        ) }
      </div>
    </div>
  );
};

// Widgets para Super Admin
const SuperAdminWidgets = ( { data, config } ) => (
  <>
    {/* Métricas Principais */ }
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <MetricCard
        title="Saúde do Sistema"
        value={ `${ data.systemHealth }%` }
        icon={ Activity }
        color="text-green-600"
        trend={ +2.1 }
      />
      <MetricCard
        title="Total de Tenants"
        value={ data.totalTenants }
        icon={ Users }
        color="text-blue-600"
        trend={ +8.3 }
      />
      <MetricCard
        title="Usuários Ativos"
        value={ data.activeUsers?.toLocaleString() }
        icon={ Target }
        color="text-purple-600"
        trend={ +12.5 }
      />
      <MetricCard
        title="Receita Total"`
        value={ `R$ ${ ( data.revenue / 1000 ).toFixed( 0 ) }k` }
        icon={ DollarSign }
        color="text-green-600"
        trend={ +15.2 }
      />
    </div>

    {/* Gráficos */ }
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Crescimento de Tenants</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={ 300 }>
            <AreaChart data={ data.tenantGrowth }>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="tenants" stroke="#2563eb" fill="#3b82f6" fillOpacity={ 0.3 } />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Performance do Sistema</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span>Tempo de Resposta</span>
                <span>{ data.performanceMetrics?.responseTime }ms</span>
              </div>
              <Progress value={ 75 } className="h-2" />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span>Uptime</span>
                <span>{ data.performanceMetrics?.uptime }%</span>
              </div>
              <Progress value={ 99.9 } className="h-2" />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span>Taxa de Erro</span>
                <span>{ data.performanceMetrics?.errorRate }%</span>
              </div>
              <Progress value={ 2 } className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </>
);

// Widgets para Tenant Admin
const TenantAdminWidgets = ( { data, config } ) => (
  <>
    {/* KPIs Executivos */ }
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <MetricCard
        title="Receita Mensal"`
        value={ `R$ ${ ( data.revenue / 1000 ).toFixed( 0 ) }k` }
        icon={ DollarSign }
        color="text-green-600"
        trend={ data.growth }
      />
      <MetricCard
        title="Tamanho da Equipe"
        value={ data.teamSize }
        icon={ Users }
        color="text-blue-600"
        trend={ +5.2 }
      />
      <MetricCard
        title="Satisfação do Cliente"
        value={ data.clientSatisfaction }
        icon={ Star }
        color="text-yellow-600"
        trend={ +0.3 }
      />
      <MetricCard
        title="Projetos Ativos"
        value={ data.activeProjects }
        icon={ Target }
        color="text-purple-600"
        trend={ +2 }
      />
    </div>

    {/* Gráficos Executivos */ }
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Performance Mensal</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={ 300 }>
            <LineChart data={ data.monthlyMetrics }>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={ 3 } />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Performance por Departamento</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            ({ data.departmentPerformance?.map( ( dept, index  }) => (
              <div key={ index }>
                <div className="flex justify-between mb-2">
                  <span className="font-medium">{ dept.name }</span>
                  <span className="text-sm text-slate-600">
                    { dept.performance }% / { dept.target }%
                  </span>
                </div>
                <Progress
                  value={ ( dept.performance / dept.target ) * 100 }
                  className="h-3"
                />
              </div>
            ) ) }
          </div>
        </CardContent>
      </Card>
    </div>
  </>
);

// Widgets para Manager
const ManagerWidgets = ( { data, config } ) => (
  <>
    {/* Métricas de Gestão */ }
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <MetricCard
        title="Tamanho da Equipe"
        value={ data.teamSize }
        icon={ Users }
        color="text-blue-600"
        trend={ 0 }
      />
      <MetricCard
        title="Projetos Ativos"
        value={ data.activeProjects }
        icon={ Target }
        color="text-green-600"
        trend={ +1 }
      />
      <MetricCard
        title="Tarefas Concluídas"
        value={ data.completedTasks }
        icon={ CheckCircle }
        color="text-purple-600"
        trend={ +8 }
      />
      <MetricCard
        title="Produtividade"`
        value={ `${ data.teamProductivity }%` }
        icon={ TrendingUp }
        color="text-orange-600"
        trend={ +3.2 }
      />
    </div>

    {/* Gestão de Projetos e Equipe */ }
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Status dos Projetos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            ({ data.projectProgress?.map( ( project, index  }) => (
              <div key={ index } className="p-3 border border-slate-200 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">{ project.project }</span>
                  <Badge variant={ project.progress >= 80 ? "default" : "secondary" }>
                    { project.progress }%
                  </Badge>
                </div>
                <Progress value={ project.progress } className="h-2 mb-2" />
                <div className="text-xs text-slate-500">
                  Prazo: { new Date( project.deadline ).toLocaleDateString( 'pt-BR' ) }
                </div>
              </div>
            ) ) }
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Performance da Equipe</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            ({ data.teamMetrics?.map( ( member, index  }) => (
              <div key={ index } className="flex items-center justify-between p-2 hover:bg-slate-50 rounded">
                <div>
                  <div className="font-medium">{ member.member }</div>
                  <div className="text-sm text-slate-600">
                    { member.completed }/{ member.tasks } tarefas
                  </div>
                </div>
                <div className="text-right">`
                  <div className={ `font-semibold ${ member.performance >= 90 ? 'text-green-600' :
                      member.performance >= 80 ? 'text-yellow-600' : 'text-red-600'`}
                    }` }>
                    { member.performance }%
                  </div>
                </div>
              </div>
            ) ) }
          </div>
        </CardContent>
      </Card>
    </div>
  </>
);

// Widgets para Employee
const EmployeeWidgets = ( { data, config } ) => (
  <>
    {/* Métricas Pessoais */ }
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <MetricCard
        title="Tarefas Pendentes"
        value={ data.pendingTasks }
        icon={ Clock }
        color="text-orange-600"
        trend={ -2 }
      />
      <MetricCard
        title="Concluídas Hoje"
        value={ data.completedToday }
        icon={ CheckCircle }
        color="text-green-600"
        trend={ +1 }
      />
      <MetricCard
        title="Meta Semanal"`
        value={ `${ data.weeklyCompleted }/${ data.weeklyGoal }` }
        icon={ Target }
        color="text-blue-600"
        trend={ +3 }
      />
      <MetricCard
        title="Streak Atual"`
        value={ `${ data.streak } dias` }
        icon={ Zap }
        color="text-purple-600"
        trend={ +1 }
      />
    </div>

    {/* Produtividade e Desenvolvimento */ }
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Atividades Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            ({ data.recentActivities?.map( ( activity, index  }) => (
              <div key={ index } className="flex items-start space-x-3 p-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm text-slate-900">{ activity.activity }</p>
                  <p className="text-xs text-slate-500">{ activity.time }</p>
                </div>
              </div>
            ) ) }
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Progresso de Habilidades</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            ({ data.skillProgress?.map( ( skill, index  }) => (
              <div key={ index }>
                <div className="flex justify-between mb-2">
                  <span className="font-medium">{ skill.skill }</span>
                  <span className="text-sm text-slate-600">{ skill.progress }%</span>
                </div>
                <Progress value={ skill.progress } className="h-2" />
              </div>
            ) ) }
          </div>
        </CardContent>
      </Card>
    </div>

    {/* Conquistas */ }
    <Card>
      <CardHeader>
        <CardTitle>Conquistas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          ({ data.achievements?.map( ( achievement, index  }) => (`
            <div key={ index } className={ `
              p-4 rounded-lg border-2 text-center
              ${ achievement.earned
                ? 'border-green-200 bg-green-50'
                : 'border-slate-200 bg-slate-50'}
              }`
            `}>
              <div className="text-3xl mb-2">{ achievement.icon }</div>`
              <div className={ `font-medium ${ achievement.earned ? 'text-green-800' : 'text-slate-600'`}
                }` }>
                { achievement.title }
              </div>
              { achievement.earned && (
                <Badge variant="default" className="mt-2">Conquistado</Badge>
              ) }
            </div>
          ) ) }
        </div>
      </CardContent>
    </Card>
  </>
);

// Componente de Métrica
const MetricCard = ( { title, value, icon: Icon, color, trend } ) => (
  <Card>
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-600">{ title }</p>
          <p className="text-2xl font-bold text-slate-900">{ value }</p>
          { trend !== undefined && (`
            <div className={ `flex items-center mt-1 ${ trend > 0 ? 'text-green-600' : trend < 0 ? 'text-red-600' : 'text-slate-600'`}
              }` }>
              { trend > 0 ? (
                <TrendingUp className="h-4 w-4 mr-1" />
              ) : trend < 0 ? (
                <TrendingDown className="h-4 w-4 mr-1" />
              ) : null }
              <span className="text-sm font-medium">
                { trend > 0 ? '+' : '' }{ trend }%
              </span>
            </div>
          ) }
        </div>`
        <div className={ `p-3 rounded-full bg-slate-100 ${ color }` }>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </CardContent>
  </Card>
);

export default PersonalizedDashboard;
`