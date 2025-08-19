import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  Timer, 
  Download,
  RefreshCw,
  BarChart3,
  Target,
  CreditCard
} from 'lucide-react';

interface SalesMetrics {
  overview: {
    totalRevenue: number;
    totalUsers: number;
    activeTrials: number;
    conversionRate: number;
    monthlyRecurringRevenue: number;
    averageRevenuePerUser: number;
  };
  subscriptions: {
    byPlan: { plan: string; count: number; revenue: number }[];
    byStatus: { status: string; count: number }[];
    recentSignups: any[];
  };
  trials: {
    total: number;
    active: number;
    expired: number;
    conversionRate: number;
    averageTrialDuration: number;
  };
  revenue: {
    monthly: { month: string; revenue: number; users: number }[];
    yearly: number;
    growth: number;
  };
  geography: {
    byRegion: { region: string; users: number; revenue: number }[];
  };
  churn: {
    rate: number;
    reasons: { reason: string; count: number }[];
  };
}

interface RealTimeMetrics {
  activeUsers: number;
  activeTrials: number;
  todaySignups: number;
  monthlyRevenue: number;
}

export function SalesMetricsDashboard() {
  const [metrics, setMetrics] = useState<SalesMetrics | null>(null);
  const [realTimeMetrics, setRealTimeMetrics] = useState<RealTimeMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('12months');

  const fetchMetrics = async () => {
    try {
      setRefreshing(true);
      const [overviewResponse, realtimeResponse] = await Promise.all([
        fetch('/api/admin/sales-metrics/overview'),
        fetch('/api/admin/sales-metrics/realtime')
      ]);

      if (overviewResponse.ok && realtimeResponse.ok) {
        const overviewData = await overviewResponse.json();
        const realtimeData = await realtimeResponse.json();
        
        setMetrics(overviewData.data);
        setRealTimeMetrics(realtimeData.data);
      }
    } catch (error) {
      console.error('Erro ao carregar métricas:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const exportMetrics = async (format: 'json' | 'csv' = 'json') => {
    try {
      const response = await fetch(`/api/admin/sales-metrics/export?format=${format}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `toit-nexus-metrics-${new Date().toISOString().split('T')[0]}.${format}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Erro ao exportar métricas:', error);
    }
  };

  useEffect(() => {
    fetchMetrics();
    // Atualizar métricas em tempo real a cada 30 segundos
    const interval = setInterval(fetchMetrics, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2 text-lg">Carregando métricas de vendas...</span>
      </div>
    );
  }

  if (!metrics || !realTimeMetrics) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Erro ao carregar métricas de vendas</p>
        <Button onClick={fetchMetrics} className="mt-4">
          <RefreshCw className="w-4 h-4 mr-2" />
          Tentar novamente
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard de Vendas</h1>
          <p className="text-gray-600 mt-2">
            Métricas completas do TOIT NEXUS - Atualizado em tempo real
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={fetchMetrics}
            disabled={refreshing}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          <Button
            onClick={() => exportMetrics('csv')}
            variant="outline"
            size="sm"
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar CSV
          </Button>
          <Button
            onClick={() => exportMetrics('json')}
            variant="outline"
            size="sm"
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar JSON
          </Button>
        </div>
      </div>

      {/* Cards de Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(metrics.overview.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              MRR: {formatCurrency(metrics.overview.monthlyRecurringRevenue)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuários Ativos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.overview.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              ARPU: {formatCurrency(metrics.overview.averageRevenuePerUser)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Trials Ativos</CardTitle>
            <Timer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.overview.activeTrials}</div>
            <p className="text-xs text-muted-foreground">
              Conversão: {formatPercentage(metrics.overview.conversionRate)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Crescimento</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.revenue.growth > 0 ? '+' : ''}{formatPercentage(metrics.revenue.growth)}
            </div>
            <p className="text-xs text-muted-foreground">vs. mês anterior</p>
          </CardContent>
        </Card>
      </div>

      {/* Métricas em Tempo Real */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="w-5 h-5 mr-2" />
            Métricas em Tempo Real
          </CardTitle>
          <CardDescription>Dados atualizados automaticamente</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {realTimeMetrics.activeUsers}
              </div>
              <div className="text-sm text-gray-500">Usuários Ativos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {realTimeMetrics.activeTrials}
              </div>
              <div className="text-sm text-gray-500">Trials Ativos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {realTimeMetrics.todaySignups}
              </div>
              <div className="text-sm text-gray-500">Signups Hoje</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {formatCurrency(realTimeMetrics.monthlyRevenue)}
              </div>
              <div className="text-sm text-gray-500">Receita Mensal</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs com Detalhes */}
      <Tabs defaultValue="subscriptions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="subscriptions">Assinaturas</TabsTrigger>
          <TabsTrigger value="trials">Trials</TabsTrigger>
          <TabsTrigger value="revenue">Receita</TabsTrigger>
          <TabsTrigger value="geography">Geografia</TabsTrigger>
        </TabsList>

        <TabsContent value="subscriptions" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Assinaturas por Plano */}
            <Card>
              <CardHeader>
                <CardTitle>Assinaturas por Plano</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {metrics.subscriptions.byPlan.map((plan, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">{plan.plan}</Badge>
                        <span className="text-sm">{plan.count} usuários</span>
                      </div>
                      <span className="font-medium">{formatCurrency(plan.revenue)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Status das Contas */}
            <Card>
              <CardHeader>
                <CardTitle>Status das Contas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {metrics.subscriptions.byStatus.map((status, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm">{status.status}</span>
                      <Badge 
                        variant={
                          status.status === 'Ativas' ? 'default' :
                          status.status === 'Trial' ? 'secondary' : 'outline'
                        }
                      >
                        {status.count}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Signups Recentes */}
          <Card>
            <CardHeader>
              <CardTitle>Signups Recentes (Últimos 7 dias)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {metrics.subscriptions.recentSignups.slice(0, 5).map((signup, index) => (
                  <div key={index} className="flex justify-between items-center py-2 border-b last:border-b-0">
                    <div>
                      <div className="font-medium">{signup.name}</div>
                      <div className="text-sm text-gray-500">{signup.email}</div>
                    </div>
                    <div className="text-right">
                      <Badge variant={signup.isTrialActive ? 'secondary' : 'default'}>
                        {signup.plan}
                      </Badge>
                      <div className="text-xs text-gray-500 mt-1">
                        {new Date(signup.createdAt).toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trials" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Resumo de Trials</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Total de Trials</span>
                    <span className="font-bold">{metrics.trials.total}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Trials Ativos</span>
                    <span className="font-bold text-green-600">{metrics.trials.active}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Trials Expirados</span>
                    <span className="font-bold text-red-600">{metrics.trials.expired}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Taxa de Conversão</span>
                    <span className="font-bold text-blue-600">
                      {formatPercentage(metrics.trials.conversionRate)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance de Trials</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">Taxa de Conversão</span>
                      <span className="text-sm font-medium">
                        {formatPercentage(metrics.trials.conversionRate)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full" 
                        style={{ width: `${Math.min(metrics.trials.conversionRate, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="pt-2">
                    <span className="text-sm text-gray-600">
                      Duração Média: {metrics.trials.averageTrialDuration} dias
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Receita Mensal (Últimos 12 meses)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {metrics.revenue.monthly.map((month, index) => (
                  <div key={index} className="flex justify-between items-center py-2">
                    <span className="text-sm">{month.month}</span>
                    <div className="text-right">
                      <div className="font-medium">{formatCurrency(month.revenue)}</div>
                      <div className="text-xs text-gray-500">{month.users} usuários</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="pt-4 border-t mt-4">
                <div className="flex justify-between font-bold">
                  <span>Total Anual</span>
                  <span>{formatCurrency(metrics.revenue.yearly)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="geography" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Distribuição Geográfica</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {metrics.geography.byRegion.map((region, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <div>
                      <div className="font-medium">{region.region}</div>
                      <div className="text-sm text-gray-500">{region.users} usuários</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{formatCurrency(region.revenue)}</div>
                      <div className="text-xs text-gray-500">
                        {((region.revenue / metrics.overview.totalRevenue) * 100).toFixed(1)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default SalesMetricsDashboard;