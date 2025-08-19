/**
 * SISTEMA DE RELATÓRIOS AVANÇADOS - TOIT NEXUS
 * Relatórios reais com gráficos, filtros e exportação
 * 100% JavaScript - SEM TYPESCRIPT
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input, SearchInput } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckboxWithLabel } from '@/components/ui/checkbox';
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
  Area
} from 'recharts';
import { 
  FileText, 
  Download, 
  Filter,
  Calendar,
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Activity,
  Target,
  BarChart3,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  Settings,
  RefreshCw,
  Share,
  Printer,
  Mail,
  Eye,
  Edit,
  Trash2,
  Plus,
  Search
} from 'lucide-react';

const AdvancedReports = () => {
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    dateRange: 'last30days',
    startDate: '',
    endDate: '',
    category: 'all',
    status: 'all'
  });
  const [chartType, setChartType] = useState('bar');
  const [customFilters, setCustomFilters] = useState({});
  const [savedReports, setSavedReports] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  const { toast } = useToast();

  // Cores para gráficos
  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16', '#F97316'];

  /**
   * CARREGAR RELATÓRIOS DISPONÍVEIS
   */
  const loadAvailableReports = async () => {
    try {
      const response = await fetch('/api/reports/available', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao carregar relatórios');
      }

      const data = await response.json();
      setReports(data.reports || []);
    } catch (error) {
      console.error('Erro ao carregar relatórios:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os relatórios disponíveis",
        variant: "destructive"
      });
    }
  };

  /**
   * GERAR RELATÓRIO
   */
  const generateReport = async (reportId, customFilters = {}) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/reports/generate/${reportId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          filters: { ...filters, ...customFilters },
          chartType,
          includeRawData: true
        })
      });

      if (!response.ok) {
        throw new Error('Erro ao gerar relatório');
      }

      const data = await response.json();
      setReportData(data);
      
      toast({
        title: "Relatório gerado",
        description: `Relatório ${data.name} gerado com sucesso`,
      });
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      toast({
        title: "Erro",
        description: "Não foi possível gerar o relatório",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * EXPORTAR RELATÓRIO
   */
  const exportReport = async (format = 'pdf') => {
    if (!reportData) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/reports/export/${reportData.id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          format,
          includeCharts: true,
          includeRawData: true
        })
      });

      if (!response.ok) {
        throw new Error('Erro ao exportar relatório');
      }

      // Download do arquivo
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${reportData.name}_${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Relatório exportado",
        description: `Relatório exportado em formato ${format.toUpperCase()}`,
      });
    } catch (error) {
      console.error('Erro ao exportar relatório:', error);
      toast({
        title: "Erro",
        description: "Não foi possível exportar o relatório",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * SALVAR RELATÓRIO PERSONALIZADO
   */
  const saveCustomReport = async (reportConfig) => {
    try {
      const response = await fetch('/api/reports/save', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(reportConfig)
      });

      if (!response.ok) {
        throw new Error('Erro ao salvar relatório');
      }

      const data = await response.json();
      setSavedReports(prev => [...prev, data.report]);
      
      toast({
        title: "Relatório salvo",
        description: "Relatório personalizado salvo com sucesso",
      });
    } catch (error) {
      console.error('Erro ao salvar relatório:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o relatório",
        variant: "destructive"
      });
    }
  };

  /**
   * RENDERIZAR GRÁFICO
   */
  const renderChart = () => {
    if (!reportData || !reportData.chartData) return null;

    const data = reportData.chartData;

    switch (chartType) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={data}>
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
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={data}>
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
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        );

      case 'area':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="value" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} />
            </AreaChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  /**
   * RENDERIZAR MÉTRICAS RESUMO
   */
  const renderSummaryMetrics = () => {
    if (!reportData || !reportData.summary) return null;

    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {reportData.summary.map((metric, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{metric.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                  {metric.change && (
                    <div className={`flex items-center mt-1 ${
                      metric.change > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {metric.change > 0 ? (
                        <TrendingUp className="h-4 w-4 mr-1" />
                      ) : (
                        <TrendingDown className="h-4 w-4 mr-1" />
                      )}
                      <span className="text-sm font-medium">
                        {Math.abs(metric.change)}%
                      </span>
                    </div>
                  )}
                </div>
                <div className={`p-3 rounded-full ${metric.bgColor || 'bg-blue-100'}`}>
                  {metric.icon || <BarChart3 className="h-6 w-6 text-blue-600" />}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  /**
   * RENDERIZAR TABELA DE DADOS
   */
  const renderDataTable = () => {
    if (!reportData || !reportData.tableData) return null;

    return (
      <Card>
        <CardHeader>
          <CardTitle>Dados Detalhados</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  {reportData.tableHeaders.map((header, index) => (
                    <th key={index} className="text-left py-3 px-4 font-medium text-gray-900">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {reportData.tableData.map((row, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    {row.map((cell, cellIndex) => (
                      <td key={cellIndex} className="py-3 px-4 text-gray-700">
                        {cell}
                      </td>
                    ))}
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
   * CARREGAR DADOS AO MONTAR COMPONENTE
   */
  useEffect(() => {
    loadAvailableReports();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <FileText className="h-8 w-8 text-blue-600" />
                Relatórios Avançados
              </h1>
              <p className="text-gray-600 mt-2">
                Gere relatórios detalhados com gráficos e análises avançadas
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => setShowCreateModal(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Criar Relatório
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Lista de Relatórios */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Relatórios Disponíveis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {reports.map((report) => (
                    <div
                      key={report.id}
                      onClick={() => setSelectedReport(report)}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedReport?.id === report.id
                          ? 'bg-blue-100 border-blue-200'
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          {report.icon || <BarChart3 className="h-4 w-4 text-blue-600" />}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{report.name}</h4>
                          <p className="text-sm text-gray-500">{report.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Filtros */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Filtros
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Período
                  </label>
                  <select
                    value={filters.dateRange}
                    onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="today">Hoje</option>
                    <option value="yesterday">Ontem</option>
                    <option value="last7days">Últimos 7 dias</option>
                    <option value="last30days">Últimos 30 dias</option>
                    <option value="last90days">Últimos 90 dias</option>
                    <option value="custom">Personalizado</option>
                  </select>
                </div>

                {filters.dateRange === 'custom' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Data Inicial
                      </label>
                      <Input
                        type="date"
                        value={filters.startDate}
                        onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Data Final
                      </label>
                      <Input
                        type="date"
                        value={filters.endDate}
                        onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
                      />
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Gráfico
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant={chartType === 'bar' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setChartType('bar')}
                    >
                      <BarChart3 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={chartType === 'line' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setChartType('line')}
                    >
                      <LineChartIcon className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={chartType === 'pie' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setChartType('pie')}
                    >
                      <PieChartIcon className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={chartType === 'area' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setChartType('area')}
                    >
                      <Activity className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <Button
                  onClick={() => selectedReport && generateReport(selectedReport.id)}
                  disabled={!selectedReport || loading}
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Gerando...
                    </>
                  ) : (
                    <>
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Gerar Relatório
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Área Principal */}
          <div className="lg:col-span-3">
            {reportData ? (
              <div className="space-y-6">
                {/* Header do Relatório */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-xl">{reportData.name}</CardTitle>
                        <p className="text-gray-600 mt-1">{reportData.description}</p>
                        <p className="text-sm text-gray-500 mt-2">
                          Gerado em: {new Date(reportData.generatedAt).toLocaleString('pt-BR')}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          onClick={() => exportReport('pdf')}
                          disabled={loading}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          PDF
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => exportReport('excel')}
                          disabled={loading}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Excel
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => exportReport('csv')}
                          disabled={loading}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          CSV
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                </Card>

                {/* Métricas Resumo */}
                {renderSummaryMetrics()}

                {/* Gráfico */}
                <Card>
                  <CardHeader>
                    <CardTitle>Visualização</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {renderChart()}
                  </CardContent>
                </Card>

                {/* Tabela de Dados */}
                {renderDataTable()}
              </div>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Selecione um relatório
                  </h3>
                  <p className="text-gray-500">
                    Escolha um relatório da lista ao lado e configure os filtros para gerar
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedReports;
