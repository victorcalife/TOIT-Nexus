/**
 * BUSINESS INTELLIGENCE DASHBOARD - TOIT NEXUS
 * Sistema completo de BI com métricas reais e análises
 * 100% JavaScript - SEM TYPESCRIPT
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import {  
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  AreaChart,
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar }
} from 'recharts';
import {  
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  Users,
  ShoppingCart,
  Activity,
  Target,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  Settings,
  Eye,
  EyeOff,
  Maximize2,
  MoreHorizontal,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
  Database,
  Globe,
  Smartphone,
  Monitor }
} from 'lucide-react';

const BusinessIntelligence = () => {
  const [dashboards, setDashboards] = useState([]);
  const [activeDashboard, setActiveDashboard] = useState('overview');
  const [widgets, setWidgets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState('last30days');
  const [realTimeData, setRealTimeData] = useState({});
  const [kpis, setKpis] = useState({});
  const [filters, setFilters] = useState({
    department: 'all',
    region: 'all',
    product: 'all'
  });
  
  const { toast } = useToast();

  // Cores para gráficos
  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16', '#F97316'];

  /**
   * CARREGAR DADOS DO DASHBOARD
   */
  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/bi/dashboard/${activeDashboard}?dateRange=${dateRange}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao carregar dados do dashboard');
      }

      const data = await response.json();
      setWidgets(data.widgets || []);
      setKpis(data.kpis || {});
      setRealTimeData(data.realTime || {});
      
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados do dashboard",
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
    try {
      const response = await fetch('/api/bi/realtime', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) return;

      const data = await response.json();
      setRealTimeData(prev => ({ ...prev, ...data }));
    } catch (error) {
      console.error('Erro ao carregar dados em tempo real:', error);
    }
  };

  /**
   * EXPORTAR DASHBOARD
   */
  const exportDashboard = async (format = 'pdf') => {
    try {
      const response = await fetch(`/api/bi/export/${activeDashboard}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          format,
          dateRange,
          filters,
          includeCharts: true
        })
      });

      if (!response.ok) {
        throw new Error('Erro ao exportar dashboard');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dashboard_${activeDashboard}_${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Dashboard exportado",
        description: `Dashboard exportado em formato ${format.toUpperCase()}`,
      });
    } catch (error) {
      console.error('Erro ao exportar dashboard:', error);
      toast({
        title: "Erro",
        description: "Não foi possível exportar o dashboard",
        variant: "destructive"
      });
    }
  };

  /**
   * RENDERIZAR KPI CARD
   */
  const renderKPICard = (kpi) => {
    const isPositive = kpi.change >= 0;
    const changeColor = isPositive ? 'text-green-600' : 'text-red-600';
    const TrendIcon = isPositive ? TrendingUp : TrendingDown;

    return (
      <Card key={kpi.id}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{kpi.label}</p>
              <p className="text-2xl font-bold text-gray-900">{kpi.value}</p>
              {kpi.change !== undefined && (
                <div className={`flex items-center mt-1 ${changeColor}`}>
                  <TrendIcon className="h-4 w-4 mr-1" />
                  <span className="text-sm font-medium">
                    {Math.abs(kpi.change)}% vs período anterior
                  </span>
                </div>
              )}
              {kpi.target && (
                <div className="mt-2">
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                    <span>Meta: {kpi.target}</span>
                    <span>{Math.round((kpi.rawValue / kpi.targetValue) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        (kpi.rawValue / kpi.targetValue) >= 1 ? 'bg-green-500' : 'bg-blue-500'
                      }`}
                      style={{
                        width: `${Math.min((kpi.rawValue / kpi.targetValue) * 100, 100)}%`
                      }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
            <div className={`p-3 rounded-full ${kpi.bgColor || 'bg-blue-100'}`}>
              {kpi.icon || <BarChart3 className="h-6 w-6 text-blue-600" />}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  /**
   * RENDERIZAR WIDGET DE GRÁFICO
   */
  const renderChartWidget = (widget) => {
    if (!widget.data || widget.data.length === 0) {
      return (
        <Card key={widget.id}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              {widget.title}
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-64 text-gray-500">
              <div className="text-center">
                <Database className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Sem dados disponíveis</p>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }

    const renderChart = () => {
      switch (widget.type) {
        case 'bar':
          return (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={widget.data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          );

        case 'line':
          return (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={widget.data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="value" stroke="#3B82F6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          );

        case 'pie':
          return (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={widget.data}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {widget.data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          );

        case 'area':
          return (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={widget.data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="value" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} />
              </AreaChart>
            </ResponsiveContainer>
          );

        case 'radar':
          return (
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={widget.data}>
                <PolarGrid />
                <PolarAngleAxis dataKey="name" />
                <PolarRadiusAxis />
                <Radar name="Valor" dataKey="value" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          );

        default:
          return <div>Tipo de gráfico não suportado</div>;
      }
    };

    return (
      <Card key={widget.id}>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div>
              <span>{widget.title}</span>
              {widget.subtitle && (
                <p className="text-sm text-gray-500 font-normal mt-1">{widget.subtitle}</p>
              )}
            </div>
            <div className="flex gap-2">
              {widget.realTime && (
                <Badge variant="outline" className="text-green-600 border-green-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></div>
                  Tempo Real
                </Badge>
              )}
              <Button variant="ghost" size="sm">
                <Maximize2 className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {renderChart()}
          {widget.insights && widget.insights.length > 0 && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Insights
              </h4>
              <ul className="space-y-1">
                {widget.insights.map((insight, index) => (
                  <li key={index} className="text-sm text-blue-800 flex items-start gap-2">
                    <CheckCircle className="h-3 w-3 mt-0.5 text-blue-600" />
                    {insight}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  /**
   * RENDERIZAR TABELA DE DADOS
   */
  const renderDataTable = (widget) => {
    if (!widget.tableData || widget.tableData.length === 0) {
      return (
        <Card key={widget.id}>
          <CardHeader>
            <CardTitle>{widget.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-500">
              <Database className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Sem dados disponíveis</p>
            </div>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card key={widget.id}>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            {widget.title}
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />

          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  ({ widget.tableHeaders.map((header, index }) => (
                    <th key={index} className="text-left py-3 px-4 font-medium text-gray-900">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                ({ widget.tableData.slice(0, 10).map((row, index }) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    ({ row.map((cell, cellIndex }) => (
                      <td key={cellIndex} className="py-3 px-4 text-gray-700">
                        {typeof cell === 'object' && cell.type === 'badge' ? (
                          <Badge variant={cell.variant}>{cell.value}</Badge>
                        ) : typeof cell === 'object' && cell.type === 'trend' ? (`
                          <div className={`flex items-center gap-1 ${cell.positive ? 'text-green-600' : 'text-red-600'}`}>
                            {cell.positive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                            {cell.value}
                          </div>
                        ) : (
                          cell
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {widget.tableData.length > 10 && (
            <div className="mt-4 text-center">
              <Button variant="outline" size="sm">
                Ver todos os {widget.tableData.length} registros
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  /**
   * CONFIGURAR ATUALIZAÇÃO EM TEMPO REAL
   */
  useEffect(() => ({ const interval = setInterval(loadRealTimeData, 30000); // 30 segundos
    return ( }) => clearInterval(interval);
  }, []);

  /**
   * CARREGAR DADOS AO MUDAR DASHBOARD OU FILTROS
   */
  useEffect(() => {
    loadDashboardData();
  }, [activeDashboard, dateRange, filters]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <BarChart3 className="h-8 w-8 text-blue-600" />
                Business Intelligence
              </h1>
              <p className="text-gray-600 mt-2">
                Dashboards e análises em tempo real
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={loadRealTimeData}
                disabled={loading}
              >`
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />

              <Button
                variant="outline"
                onClick=({ ( }) => exportDashboard('pdf')}
              >
                <Download className="h-4 w-4 mr-2" />
                Exportar PDF
              </Button>
              <Button variant="outline">
                <Settings className="h-4 w-4 mr-2" />

            </div>
          </div>
        </div>

        {/* Filtros e Controles */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="flex gap-4 flex-1">
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
                  <option value="thisYear">Este ano</option>
                </select>

                <select
                  value={filters.department}
                  onChange=({ (e }) => setFilters(prev => ({ ...prev, department: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Todos os Departamentos</option>
                  <option value="sales">Vendas</option>
                  <option value="marketing">Marketing</option>
                  <option value="support">Suporte</option>
                  <option value="development">Desenvolvimento</option>
                </select>

                <select
                  value={filters.region}
                  onChange=({ (e }) => setFilters(prev => ({ ...prev, region: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Todas as Regiões</option>
                  <option value="north">Norte</option>
                  <option value="south">Sul</option>
                  <option value="east">Leste</option>
                  <option value="west">Oeste</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  Dados em tempo real
                </div>
                <Badge variant="outline">
                  Última atualização: {new Date().toLocaleTimeString('pt-BR')}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs de Dashboards */}
        <Tabs value={activeDashboard} onValueChange={setActiveDashboard} className="mb-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="sales">Vendas</TabsTrigger>
            <TabsTrigger value="marketing">Marketing</TabsTrigger>
            <TabsTrigger value="operations">Operações</TabsTrigger>
            <TabsTrigger value="financial">Financeiro</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* KPIs Principais */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {Object.values(kpis).map(renderKPICard)}
            </div>

            {/* Widgets de Gráficos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {widgets.filter(w => w.type !== 'table').map(renderChartWidget)}
            </div>

            {/* Tabelas de Dados */}
            <div className="space-y-6">
              {widgets.filter(w => w.type === 'table').map(renderDataTable)}
            </div>
          </TabsContent>

          <TabsContent value="sales">
            <div className="text-center py-12">
              <BarChart3 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Dashboard de Vendas</h3>
              <p className="text-gray-500">Métricas e análises de vendas serão exibidas aqui</p>
            </div>
          </TabsContent>

          <TabsContent value="marketing">
            <div className="text-center py-12">
              <Target className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Dashboard de Marketing</h3>
              <p className="text-gray-500">Métricas e análises de marketing serão exibidas aqui</p>
            </div>
          </TabsContent>

          <TabsContent value="operations">
            <div className="text-center py-12">
              <Activity className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Dashboard de Operações</h3>
              <p className="text-gray-500">Métricas e análises operacionais serão exibidas aqui</p>
            </div>
          </TabsContent>

          <TabsContent value="financial">
            <div className="text-center py-12">
              <DollarSign className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Dashboard Financeiro</h3>
              <p className="text-gray-500">Métricas e análises financeiras serão exibidas aqui</p>
            </div>
          </TabsContent>
        </Tabs>

        {loading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 flex items-center gap-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span>Carregando dados do dashboard...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BusinessIntelligence;
`