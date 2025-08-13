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

} catch (error) {
      console.error('Erro ao carregar métricas, error);
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
      console.error('Erro ao exportar métricas, error);
    }
  };

  useEffect(() => {
    fetchMetrics();
    // Atualizar métricas em tempo real a cada 30 segundos
    const interval = setInterval(fetchMetrics, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style,
      currency).format(value);
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
      <div className="grid grid-cols-1 md)}</div>
            <p className="text-xs text-muted-foreground">
              MRR)}
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
              ARPU)}
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
              Conversão)}
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
          <div className="grid grid-cols-2 md)}
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
          <div className="grid grid-cols-1 lg, index) => (
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
                  <div key={index} className="flex justify-between items-center py-2 border-b last).toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trials" className="space-y-4">
          <div className="grid grid-cols-1 lg)}
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
                        style={{ width, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="pt-2">
                    <span className="text-sm text-gray-600">
                      Duração Média)</CardTitle>
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