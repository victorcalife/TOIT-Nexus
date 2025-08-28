import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import {   }
} from 'lucide-react';

} catch (error) {
      console.error('Erro ao carregar relatório de assinaturas, error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const exportReport = async (format) => {
    try {
      const response = await fetch(`/api/admin/subscription-reports/export?format=${format}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;`
        a.download = `toit-nexus-subscriptions-${new Date().toISOString().split('T')[0]}.${format}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Erro ao exportar relatório, error);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style,
      currency).format(value);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('pt-BR');
  };

  const getStatusBadge = (status) => ({ switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Ativo</Badge>;
      case 'trial':
        return <Badge className="bg-blue-100 text-blue-800">Trial</Badge>;
      case 'inactive':
        return <Badge className="bg-red-100 text-red-800">Inativo</Badge>;
      case 'expired':
        return <Badge className="bg-gray-100 text-gray-800">Expirado</Badge>;
      default }) => {
    if (riskScore >= 70) {
      return <Badge className="bg-red-100 text-red-800">Alto Risco</Badge>;
    } else if (riskScore >= 40) {
      return <Badge className="bg-yellow-100 text-yellow-800">Médio Risco</Badge>;
    } else {
      return <Badge className="bg-green-100 text-green-800">Baixo Risco</Badge>;
    }
  };

  const filterSubscriptions = (subscriptions) => {
    return subscriptions.filter(sub => {
      // Filtro por termo de busca
      const matchesSearch = searchTerm === '' || 
        sub.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.tenantName.toLowerCase().includes(searchTerm.toLowerCase());

      // Filtro por status
      const matchesStatus = selectedStatus === 'all' || sub.status === selectedStatus;

      // Filtro por risco
      let matchesRisk = true;
      if (riskFilter === 'high') matchesRisk = sub.riskScore >= 70;
      else if (riskFilter === 'medium') matchesRisk = sub.riskScore >= 40 && sub.riskScore < 70;
      else if (riskFilter === 'low') matchesRisk = sub.riskScore < 40;

      return matchesSearch && matchesStatus && matchesRisk;
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2 text-lg">Carregando relatórios de assinaturas...</span>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Erro ao carregar relatórios de assinaturas</p>
        <Button onClick={fetchReport} className="mt-4">
          <RefreshCw className="w-4 h-4 mr-2" />
          Tentar novamente
        </Button>
      </div>
    );
  }

  const allSubscriptions = [
    ...report.subscriptions.active,
    ...report.subscriptions.inactive,
    ...report.subscriptions.trials
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Relatórios de Assinaturas</h1>
          <p className="text-gray-600 mt-2">
            Análise detalhada de todas as assinaturas do TOIT NEXUS
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={fetchReport}
            disabled={refreshing}
            variant="outline"
            size="sm"
          >`
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
          <Button
            onClick=({ ( }) => exportReport('csv')}
            variant="outline"
            size="sm"
          >
            <Download className="w-4 h-4 mr-2" />
          </Button>
          <Button
            onClick=({ ( }) => exportReport('json')}
            variant="outline"
            size="sm"
          >
            <Download className="w-4 h-4 mr-2" />
          </Button>
        </div>
      </div>

      {/* Cards de Overview */}
      <div className="grid grid-cols-1 md)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tenure Média</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{report.analytics.averageTenure.toFixed(1)} meses</div>
            <p className="text-xs text-muted-foreground">
              Permanência média
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Churn</CardTitle>
            <UserX className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{report.analytics.churnRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Cancelamentos vs total
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
              {report.analytics.growthRate > 0 ? '+' : ''}{report.analytics.growthRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">vs. período anterior</p>
          </CardContent>
        </Card>
      </div>

      {/* Alertas */}
      {(report.alerts.expiringSoon > 0 || report.alerts.trialEnding > 0 || report.alerts.highRiskChurn > 0) && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center text-orange-800">
              <AlertTriangle className="w-5 h-5 mr-2" />
              Alertas Importantes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md)}
              {report.alerts.trialEnding > 0 && (
                <div className="flex items-center space-x-2">
                  <XCircle className="w-4 h-4 text-red-600" />
                  <span className="text-sm">
                    <strong>{report.alerts.trialEnding}</strong> trials terminando em 2 dias
                  </span>
                </div>
              )}
              {report.alerts.highRiskChurn > 0 && (
                <div className="flex items-center space-x-2">
                  <Shield className="w-4 h-4 text-red-600" />
                  <span className="text-sm">
                    <strong>{report.alerts.highRiskChurn}</strong> assinaturas com alto risco
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs com Detalhes */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">Todas ({allSubscriptions.length})</TabsTrigger>
          <TabsTrigger value="active">Ativas ({report.subscriptions.active.length})</TabsTrigger>
          <TabsTrigger value="trials">Trials ({report.subscriptions.trials.length})</TabsTrigger>
          <TabsTrigger value="at-risk">Em Risco</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Controles de Filtro */}
        <div className="flex flex-wrap gap-4 items-center p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-2">
            <Search className="w-4 h-4 text-gray-400" />
            <Input
              placeholder="Buscar por nome, email ou empresa..."
              className="w-64"
              value={searchTerm}
              onChange=({ (e }) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <select
            value={selectedStatus}
            onChange=({ (e }) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="all">Todos os Status</option>
            <option value="active">Ativo</option>
            <option value="trial">Trial</option>
            <option value="inactive">Inativo</option>
          </select>

          <select
            value={riskFilter}
            onChange=({ (e }) => setRiskFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="all">Todos os Riscos</option>
            <option value="high">Alto Risco (70%+)</option>
            <option value="medium">Médio Risco (40-69%)</option>
            <option value="low">Baixo Risco (&lt;40%)</option>
          </select>
        </div>

        <TabsContent value="all" className="space-y-4">
          <SubscriptionTable subscriptions={filterSubscriptions(allSubscriptions)} />
        </TabsContent>

        <TabsContent value="active" className="space-y-4">
          <SubscriptionTable subscriptions={filterSubscriptions(report.subscriptions.active)} />
        </TabsContent>

        <TabsContent value="trials" className="space-y-4">
          <SubscriptionTable subscriptions={filterSubscriptions(report.subscriptions.trials)} />
        </TabsContent>

        <TabsContent value="at-risk" className="space-y-4">
          <SubscriptionTable 
            subscriptions={filterSubscriptions(allSubscriptions.filter(sub => sub.riskScore >= 70))} 
          />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">{plan.plan}</Badge>
                        <span className="text-sm">{plan.count} assinantes</span>
                      </div>
                      <span className="font-medium">{formatCurrency(plan.revenue)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Tendências Mensais */}
            <Card>
              <CardHeader>
                <CardTitle>Tendências (Últimos 12 meses)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  ({ report.analytics.monthlyTrends.slice(-6).map((trend, index }) => (
                    <div key={index} className="flex justify-between items-center py-1">
                      <span className="text-sm">{trend.month}</span>
                      <div className="text-right">
                        <div className="text-sm font-medium">{trend.active} ativos</div>
                        <div className="text-xs text-gray-500">
                          {formatCurrency(trend.revenue)} | {trend.churn} churn
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function SubscriptionTable({ subscriptions }: ({ subscriptions) {
  const formatCurrency = (value }) => {
    return new Intl.NumberFormat('pt-BR', {
      style,
      currency).format(value);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('pt-BR');
  };

  const getStatusBadge = (status) => ({ switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Ativo</Badge>;
      case 'trial':
        return <Badge className="bg-blue-100 text-blue-800">Trial</Badge>;
      case 'inactive':
        return <Badge className="bg-red-100 text-red-800">Inativo</Badge>;
      case 'expired':
        return <Badge className="bg-gray-100 text-gray-800">Expirado</Badge>;
      default }) => {
    if (riskScore >= 70) {
      return <Badge className="bg-red-100 text-red-800">Alto ({riskScore}%)</Badge>;
    } else if (riskScore >= 40) {
      return <Badge className="bg-yellow-100 text-yellow-800">Médio ({riskScore}%)</Badge>;
    } else {
      return <Badge className="bg-green-100 text-green-800">Baixo ({riskScore}%)</Badge>;
    }
  };

  if (subscriptions.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-gray-500">Nenhuma assinatura encontrada com os filtros aplicados.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Usuário
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Receita/Mês
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                  Último Login
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              ({ subscriptions.map((subscription }) => (
                <tr key={subscription.id} className="hover)}
                  </td>
                  <td className="px-4 py-4 text-right font-medium">
                    {formatCurrency(subscription.monthlyRevenue)}
                  </td>
                  <td className="px-4 py-4 text-center">
                    {getRiskBadge(subscription.riskScore)}
                  </td>
                  <td className="px-4 py-4 text-center text-sm">
                    {subscription.tenureInMonths} meses
                  </td>
                  <td className="px-4 py-4 text-center text-sm text-gray-500">
                    {subscription.lastLoginAt ? formatDate(subscription.lastLoginAt) : 'Nunca'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

export default SubscriptionReportsDashboard;`