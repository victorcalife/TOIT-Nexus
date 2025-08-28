/**
 * ANALYTICS DASHBOARD - TOIT NEXUS
 * Sistema completo de analytics e métricas em tempo real
 * 100% JavaScript - SEM TYPESCRIPT
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import {  
  LineChart, 
  Line, 
  AreaChart,
  Area,
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  RechartsScale }
} from 'recharts';
import {  
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Users,
  Eye,
  Click,
  Clock,
  Globe,
  Smartphone,
  Monitor,
  Activity,
  Target,
  Zap,
  RefreshCw,
  Download,
  Filter,
  Calendar,
  MapPin,
  Share,
  Heart,
  MessageSquare,
  ShoppingCart,
  DollarSign,
  Percent,
  ArrowUp,
  ArrowDown,
  Minus,
  AlertTriangle,
  CheckCircle,
  Info }
} from 'lucide-react';

const AnalyticsDashboard = () => {
  const [analytics, setAnalytics] = useState({});
  const [realTimeData, setRealTimeData] = useState({});
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState('last7days');
  const [activeMetric, setActiveMetric] = useState('overview');
  const [isRealTime, setIsRealTime] = useState(true);
  const [filters, setFilters] = useState({
    source: 'all',
    device: 'all',
    location: 'all'
  });
  
  const { toast } = useToast();

  // Cores para gráficos
  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16', '#F97316'];

  /**
   * CARREGAR DADOS DE ANALYTICS
   */
  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/analytics?dateRange=${dateRange}&filters=${JSON.stringify(filters)}`, {
        headers: {`
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao carregar analytics');
      }

      const data = await response.json();
      setAnalytics(data);
    } catch (error) {
      console.error('Erro ao carregar analytics:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados de analytics",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * CARREGAR DADOS EM TEMPO REAL
   */
  const loadRealTimeData = async () => {
    if (!isRealTime) return;

    try {
      const response = await fetch('/api/analytics/realtime', {
        headers: {`
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) return;

      const data = await response.json();
      setRealTimeData(data);
    } catch (error) {
      console.error('Erro ao carregar dados em tempo real:', error);
    }
  };

  /**
   * CONFIGURAR STREAM DE DADOS EM TEMPO REAL
   */
  const setupRealTimeStream = () => {
    if (!isRealTime) return;
`
    const eventSource = new EventSource(`/api/analytics/stream?token=${localStorage.getItem('token')}`);
    
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setRealTimeData(prev => ({ ...prev, ...data }));
    };

    eventSource.onerror = (error) => {
      console.error('Erro no stream de analytics:', error);
      eventSource.close();
    };

    return () => eventSource.close();
  };

  /**
   * EXPORTAR RELATÓRIO
   */
  const exportReport = async (format = 'pdf') => {
    try {
      const response = await fetch('/api/analytics/export', {
        method: 'POST',
        headers: {`
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          format,
          dateRange,
          filters,
          metrics: activeMetric
        })
      });

      if (!response.ok) {
        throw new Error('Erro ao exportar relatório');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;`
      a.download = `analytics_${dateRange}_${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Relatório exportado",`
        description: `Relatório exportado em formato ${format.toUpperCase()}`,
      });
    } catch (error) {
      console.error('Erro ao exportar:', error);
      toast({
        title: "Erro",
        description: "Não foi possível exportar o relatório",
        variant: "destructive"
      });
    }
  };

  /**
   * RENDERIZAR MÉTRICA CARD
   */
  const renderMetricCard = (metric) => {
    const isPositive = metric.change >= 0;
    const changeColor = isPositive ? 'text-green-600' : 'text-red-600';
    const TrendIcon = isPositive ? TrendingUp : TrendingDown;
    const ChangeIcon = isPositive ? ArrowUp : metric.change === 0 ? Minus : ArrowDown;

    return (
      <Card key={metric.id}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{metric.label}</p>
              <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
              {metric.change !== undefined && (`
                <div className={`flex items-center mt-1 ${changeColor}`}>
                  <ChangeIcon className="h-4 w-4 mr-1" />
                  <span className="text-sm font-medium">
                    {Math.abs(metric.change)}% vs período anterior
                  </span>
                </div>
              )}
              {metric.realTimeValue && (
                <div className="mt-2">
                  <Badge variant="outline" className="text-green-600 border-green-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></div>
                    Agora: {metric.realTimeValue}
                  </Badge>
                </div>
              )}
            </div>`
            <div className={`p-3 rounded-full ${metric.bgColor || 'bg-blue-100'}`}>
              {metric.icon || <BarChart3 className="h-6 w-6 text-blue-600" />}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  /**
   * RENDERIZAR GRÁFICO DE LINHA
   */
  const renderLineChart = (data, title, dataKey = 'value') => {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            {title}
            {isRealTime && (
              <Badge variant="outline" className="text-green-600 border-green-600">
                <Activity className="h-3 w-3 mr-1" />
                Tempo Real
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey={dataKey} 
                stroke="#3B82F6" 
                strokeWidth={2}
                dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    );
  };

  /**
   * RENDERIZAR GRÁFICO DE ÁREA
   */
  const renderAreaChart = (data, title, dataKey = 'value') => {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area 
                type="monotone" 
                dataKey={dataKey} 
                stroke="#3B82F6" 
                fill="#3B82F6" 
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    );
  };

  /**
   * RENDERIZAR GRÁFICO DE PIZZA
   */
  const renderPieChart = (data, title) => {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}`
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                ({ data.map((entry, index }) => (`
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    );
  };

  /**
   * RENDERIZAR TABELA TOP PÁGINAS
   */
  const renderTopPagesTable = (pages) => ({ return (
      <Card>
        <CardHeader>
          <CardTitle>Páginas Mais Visitadas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Página</th>
                  <th className="text-left py-3 px-4">Visualizações</th>
                  <th className="text-left py-3 px-4">Usuários Únicos</th>
                  <th className="text-left py-3 px-4">Tempo Médio</th>
                  <th className="text-left py-3 px-4">Taxa de Rejeição</th>
                </tr>
              </thead>
              <tbody>
                {pages.map((page, index }) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{page.path}</span>
                        {page.isRealTime && (
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">{page.pageviews.toLocaleString()}</td>
                    <td className="py-3 px-4">{page.uniqueUsers.toLocaleString()}</td>
                    <td className="py-3 px-4">{page.avgTime}</td>
                    <td className="py-3 px-4">`
                      <span className={`${
                        page.bounceRate > 70 ? 'text-red-600' : 
                        page.bounceRate > 40 ? 'text-yellow-600' : 'text-green-600'`}
                      }`}>
                        {page.bounceRate}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    );
  };

  /**
   * RENDERIZAR MAPA DE CALOR DE ATIVIDADE
   */
  const renderActivityHeatmap = (data) => {
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

    return (
      <Card>
        <CardHeader>
          <CardTitle>Mapa de Calor de Atividade</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="grid grid-cols-25 gap-1 text-xs">
              <div></div>
              {hours.map(hour => (
                <div key={hour} className="text-center text-gray-500">
                  {hour % 6 === 0 ? hour : ''}
                </div>
              ))}
            </div>
            ({ days.map((day, dayIndex }) => (
              <div key={day} className="grid grid-cols-25 gap-1">
                <div className="text-xs text-gray-500 flex items-center">{day}</div>
                {hours.map(hour => {
                  const activity = data.find(d => d.day === dayIndex && d.hour === hour);
                  const intensity = activity ? Math.min(activity.value / 100, 1) : 0;
                  return (
                    <div`
                      key={`${day}-${hour}`}
                      className="w-3 h-3 rounded-sm"
                      style={{
                        backgroundColor: intensity > 0 `}
                          ? `rgba(59, 130, 246, ${intensity})` 
                          : '#f3f4f6'
                      }}`
                      title={`${day} ${hour}:00 - ${activity?.value || 0} atividades`}
                    />
                  );
                })}
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between mt-4 text-xs text-gray-500">
            <span>Menos</span>
            <div className="flex gap-1">
              {[0, 0.2, 0.4, 0.6, 0.8, 1].map(intensity => (
                <div
                  key={intensity}
                  className="w-3 h-3 rounded-sm"
                  style={{
                    backgroundColor: intensity > 0 `}
                      ? `rgba(59, 130, 246, ${intensity})` 
                      : '#f3f4f6'
                  }}
                />
              ))}
            </div>
            <span>Mais</span>
          </div>
        </CardContent>
      </Card>
    );
  };

  /**
   * CONFIGURAR COMPONENTE
   */
  useEffect(() => ({ loadAnalytics();
    
    const cleanup = setupRealTimeStream();
    const interval = setInterval(loadRealTimeData, 30000); // 30 segundos
    
    return ( }) => {
      cleanup && cleanup();
      clearInterval(interval);
    };
  }, [dateRange, filters, isRealTime]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <BarChart3 className="h-8 w-8 text-blue-600" />
                Analytics Dashboard
              </h1>
              <p className="text-gray-600 mt-2">
                Métricas e análises em tempo real do sistema
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick=({ ( }) => setIsRealTime(!isRealTime)}
              >`
                <Activity className={`h-4 w-4 mr-2 ${isRealTime ? 'text-green-600' : 'text-gray-600'}`} />
                {isRealTime ? 'Tempo Real Ativo' : 'Tempo Real Inativo'}
              </Button>
              <Button
                variant="outline"
                onClick={loadAnalytics}
                disabled={loading}
              >`
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />

              <Button
                variant="outline"
                onClick=({ ( }) => exportReport('pdf')}
              >
                <Download className="h-4 w-4 mr-2" />

            </div>
          </div>
        </div>

        {/* Filtros */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="flex gap-4">
                <select
                  value={dateRange}
                  onChange=({ (e }) => setDateRange(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="today">Hoje</option>
                  <option value="yesterday">Ontem</option>
                  <option value="last7days">Últimos 7 dias</option>
                  <option value="last30days">Últimos 30 dias</option>
                  <option value="last90days">Últimos 90 dias</option>
                  <option value="thisMonth">Este mês</option>
                  <option value="lastMonth">Mês passado</option>
                </select>

                <select
                  value={filters.device}
                  onChange=({ (e }) => setFilters(prev => ({ ...prev, device: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Todos os Dispositivos</option>
                  <option value="desktop">Desktop</option>
                  <option value="mobile">Mobile</option>
                  <option value="tablet">Tablet</option>
                </select>

                <select
                  value={filters.source}
                  onChange=({ (e }) => setFilters(prev => ({ ...prev, source: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Todas as Fontes</option>
                  <option value="direct">Direto</option>
                  <option value="organic">Busca Orgânica</option>
                  <option value="social">Redes Sociais</option>
                  <option value="referral">Referência</option>
                </select>
              </div>

              <div className="flex items-center gap-2 ml-auto">
                <Badge variant="outline">
                  Última atualização: {new Date().toLocaleTimeString('pt-BR')}
                </Badge>
                {isRealTime && (
                  <Badge variant="outline" className="text-green-600 border-green-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></div>
                    Ao Vivo
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Métricas Principais */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {analytics.metrics && analytics.metrics.map(renderMetricCard)}
        </div>

        {/* Tabs de Analytics */}
        <Tabs value={activeMetric} onValueChange={setActiveMetric} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="audience">Audiência</TabsTrigger>
            <TabsTrigger value="behavior">Comportamento</TabsTrigger>
            <TabsTrigger value="acquisition">Aquisição</TabsTrigger>
            <TabsTrigger value="conversions">Conversões</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Gráficos de Visão Geral */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {analytics.pageviews && renderLineChart(analytics.pageviews, 'Visualizações de Página')}
              {analytics.sessions && renderAreaChart(analytics.sessions, 'Sessões')}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {analytics.devices && renderPieChart(analytics.devices, 'Dispositivos')}
              {analytics.browsers && renderPieChart(analytics.browsers, 'Navegadores')}
            </div>

            {analytics.topPages && renderTopPagesTable(analytics.topPages)}
          </TabsContent>

          <TabsContent value="audience" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {analytics.demographics && renderPieChart(analytics.demographics, 'Demografia')}
              {analytics.locations && renderPieChart(analytics.locations, 'Localização')}
            </div>
            
            {analytics.activityHeatmap && renderActivityHeatmap(analytics.activityHeatmap)}
          </TabsContent>

          <TabsContent value="behavior">
            <div className="text-center py-12">
              <Eye className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Análise de Comportamento</h3>
              <p className="text-gray-500">Dados de comportamento do usuário serão exibidos aqui</p>
            </div>
          </TabsContent>

          <TabsContent value="acquisition">
            <div className="text-center py-12">
              <Target className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Canais de Aquisição</h3>
              <p className="text-gray-500">Dados de aquisição de usuários serão exibidos aqui</p>
            </div>
          </TabsContent>

          <TabsContent value="conversions">
            <div className="text-center py-12">
              <Zap className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Conversões</h3>
              <p className="text-gray-500">Dados de conversão serão exibidos aqui</p>
            </div>
          </TabsContent>
        </Tabs>

        {loading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 flex items-center gap-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span>Carregando dados de analytics...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
`