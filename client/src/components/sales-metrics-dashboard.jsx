import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BarChart3,
  RefreshCw,
  Download,
  Users,
  Timer,
  TrendingUp,
  DollarSign
} from 'lucide-react';

const SalesMetricsDashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [realTimeMetrics, setRealTimeMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchMetrics = async () => {
    try {
      setRefreshing(true);
      const [metricsResponse, realTimeResponse] = await Promise.all([
        fetch('/api/admin/sales-metrics'),
        fetch('/api/admin/real-time-metrics')
      ]);
      
      if (metricsResponse.ok && realTimeResponse.ok) {
        const metricsData = await metricsResponse.json();
        const realTimeData = await realTimeResponse.json();
        setMetrics(metricsData);
        setRealTimeMetrics(realTimeData);
      }
    } catch (error) {
      console.error('Erro ao carregar métricas:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const exportMetrics = async (format) => {
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
    const interval = setInterval(fetchMetrics, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatPercentage = (value) => {
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(metrics?.overview?.totalRevenue || 0)}</div>
            <p className="text-xs text-muted-foreground">
              MRR: {formatCurrency(metrics?.overview?.mrr || 0)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuários Ativos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.overview?.totalUsers || 0}</div>
            <p className="text-xs text-muted-foreground">
              ARPU: {formatCurrency(metrics?.overview?.arpu || 0)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Trials Ativos</CardTitle>
            <Timer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.overview?.activeTrials || 0}</div>
            <p className="text-xs text-muted-foreground">
              Conversão: {formatPercentage(metrics?.overview?.conversionRate || 0)}
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
              {metrics?.revenue?.growth > 0 ? '+' : ''}{formatPercentage(metrics?.revenue?.growth || 0)}
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
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(realTimeMetrics?.todayRevenue || 0)}
              </div>
              <div className="text-sm text-gray-500">Receita Hoje</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {realTimeMetrics?.newSignups || 0}
              </div>
              <div className="text-sm text-gray-500">Novos Cadastros</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {realTimeMetrics?.activeUsers || 0}
              </div>
              <div className="text-sm text-gray-500">Usuários Online</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {formatCurrency(realTimeMetrics?.monthlyRevenue || 0)}
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Distribuição por Plano</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {metrics?.subscriptions?.byPlan?.map((plan, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">{plan.plan}</Badge>
                        <span className="text-sm">{plan.count} usuários</span>
                      </div>
                      <span className="font-medium">{formatCurrency(plan.revenue)}</span>
                    </div>
                  )) || []}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Status das Assinaturas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Ativas</span>
                    <span className="font-medium text-green-600">{metrics?.subscriptions?.active || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Canceladas</span>
                    <span className="font-medium text-red-600">{metrics?.subscriptions?.cancelled || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pausadas</span>
                    <span className="font-medium text-yellow-600">{metrics?.subscriptions?.paused || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trials" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Análise de Trials</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">{metrics?.trials?.active || 0}</div>
                  <div className="text-sm text-gray-500">Trials Ativos</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{metrics?.trials?.converted || 0}</div>
                  <div className="text-sm text-gray-500">Convertidos</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{metrics?.trials?.expired || 0}</div>
                  <div className="text-sm text-gray-500">Expirados</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{formatPercentage(metrics?.trials?.conversionRate || 0)}</div>
                  <div className="text-sm text-gray-500">Taxa de Conversão</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Análise de Receita</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">{formatCurrency(metrics?.revenue?.monthly || 0)}</div>
                  <div className="text-sm text-gray-500">Receita Mensal</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{formatCurrency(metrics?.revenue?.annual || 0)}</div>
                  <div className="text-sm text-gray-500">Receita Anual</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{formatPercentage(metrics?.revenue?.growth || 0)}</div>
                  <div className="text-sm text-gray-500">Crescimento</div>
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
                {metrics?.geography?.map((location, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span>{location.country}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">{location.users} usuários</span>
                      <span className="font-medium">{formatCurrency(location.revenue)}</span>
                    </div>
                  </div>
                )) || []}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export { SalesMetricsDashboard };
export default SalesMetricsDashboard;