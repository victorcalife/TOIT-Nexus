/**
 * EXEMPLO DE RELATÓRIO APRIMORADO COM ML
 * Demonstra como integrar ML em relatórios existentes
 * 100% JavaScript - SEM TYPESCRIPT
 */

import React, { useState, useEffect } from 'react';
import { ReportMLEnhancer } from '../ReportMLEnhancer';
import { MLCreditsWidget } from '../MLCreditsWidget';
import { 
  FileText, 
  Download, 
  Share, 
  Filter,
  Calendar,
  TrendingUp,
  BarChart3,
  PieChart,
  Users,
  DollarSign
} from 'lucide-react';

/**
 * Relatório aprimorado com funcionalidades ML
 * @returns {React.ReactElement} Relatório com ML
 */
export function EnhancedReport() {
  const [reportData, setReportData] = useState([]);
  const [reportType, setReportType] = useState('sales');
  const [dateRange, setDateRange] = useState('30d');
  const [generatedInsights, setGeneratedInsights] = useState([]);
  const [reportConfig, setReportConfig] = useState({
    groupBy: 'day',
    metrics: ['total', 'average', 'growth'],
    filters: {}
  });

  // Simular carregamento de dados do relatório
  useEffect(() => {
    const generateReportData = () => {
      const days = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90;
      const data = [];
      
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];

        // Gerar dados baseados no tipo de relatório
        let value;
        switch (reportType) {
          case 'sales':
            value = 5000 + (days - i) * 50 + (Math.random() * 1000 - 500);
            break;
          case 'users':
            value = 200 + Math.floor(Math.random() * 50);
            break;
          case 'revenue':
            value = 8000 + (days - i) * 80 + (Math.random() * 1500 - 750);
            break;
          case 'performance':
            value = 85 + Math.random() * 15;
            break;
          default:
            value = 1000 + Math.random() * 500;
        }

        data.push({
          date: dateStr,
          value: Math.max(0, Math.round(value)),
          category: reportType,
          metadata: {
            dayOfWeek: date.getDay(),
            month: date.getMonth(),
            quarter: Math.floor(date.getMonth() / 3) + 1
          }
        });
      }
      
      setReportData(data);
    };

    generateReportData();
  }, [reportType, dateRange]);

  /**
   * Lidar com insights ML gerados
   */
  const handleInsightsGenerated = (insights) => {
    setGeneratedInsights(insights);
    console.log('Insights gerados para o relatório:', insights);
  };

  /**
   * Calcular métricas do relatório
   */
  const calculateMetrics = () => {
    if (reportData.length === 0) return {};

    const values = reportData.map(item => item.value);
    const total = values.reduce((sum, val) => sum + val, 0);
    const average = total / values.length;
    const max = Math.max(...values);
    const min = Math.min(...values);
    
    // Calcular crescimento
    const recent = values.slice(-7);
    const previous = values.slice(-14, -7);
    const recentAvg = recent.reduce((sum, val) => sum + val, 0) / recent.length;
    const previousAvg = previous.length > 0 ? 
      previous.reduce((sum, val) => sum + val, 0) / previous.length : recentAvg;
    const growth = previousAvg > 0 ? ((recentAvg - previousAvg) / previousAvg) * 100 : 0;

    return {
      total,
      average,
      max,
      min,
      growth,
      dataPoints: values.length
    };
  };

  const metrics = calculateMetrics();

  /**
   * Exportar relatório
   */
  const exportReport = () => {
    const reportExport = {
      title: `Relatório de ${reportType}`,
      type: reportType,
      dateRange,
      generatedAt: new Date().toISOString(),
      data: reportData,
      metrics,
      insights: generatedInsights,
      config: reportConfig
    };

    const blob = new Blob([JSON.stringify(reportExport, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio-${reportType}-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  /**
   * Obter ícone baseado no tipo de relatório
   */
  const getReportIcon = () => {
    switch (reportType) {
      case 'sales': return DollarSign;
      case 'users': return Users;
      case 'revenue': return TrendingUp;
      case 'performance': return BarChart3;
      default: return FileText;
    }
  };

  const ReportIcon = getReportIcon();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <ReportIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Relatório de {reportType.charAt(0).toUpperCase() + reportType.slice(1)}
                </h1>
                <p className="text-gray-600">
                  Análise detalhada com insights de Machine Learning
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <MLCreditsWidget variant="compact" />
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={exportReport}
                  className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 flex items-center space-x-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Exportar</span>
                </button>
                
                <button className="px-4 py-2 bg-gray-100 text-gray-700 text-sm rounded-md hover:bg-gray-200 flex items-center space-x-2">
                  <Share className="w-4 h-4" />
                  <span>Compartilhar</span>
                </button>
              </div>
            </div>
          </div>

          {/* Filtros */}
          <div className="mt-6 flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-700">Filtros:</span>
            </div>
            
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="sales">Vendas</option>
              <option value="users">Usuários</option>
              <option value="revenue">Receita</option>
              <option value="performance">Performance</option>
            </select>

            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="7d">Últimos 7 dias</option>
              <option value="30d">Últimos 30 dias</option>
              <option value="90d">Últimos 90 dias</option>
            </select>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Métricas do relatório */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">
                  {metrics.total?.toLocaleString() || '0'}
                </p>
              </div>
              <BarChart3 className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Média</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Math.round(metrics.average || 0).toLocaleString()}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Crescimento</p>
                <p className={`text-2xl font-bold ${
                  metrics.growth >= 0 ? 'text-green-900' : 'text-red-900'
                }`}>
                  {metrics.growth?.toFixed(1) || '0'}%
                </p>
              </div>
              <PieChart className="w-8 h-8 text-purple-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pontos de Dados</p>
                <p className="text-2xl font-bold text-gray-900">
                  {metrics.dataPoints || '0'}
                </p>
              </div>
              <Calendar className="w-8 h-8 text-orange-600" />
            </div>
          </div>
        </div>

        {/* Aprimoramento ML */}
        <div className="mb-8">
          <ReportMLEnhancer
            reportData={reportData}
            reportType={reportType}
            reportTitle={`Relatório de ${reportType}`}
            reportConfig={reportConfig}
            onInsightGenerated={handleInsightsGenerated}
            autoAnalyze={false}
          />
        </div>

        {/* Tabela de dados */}
        <div className="bg-white rounded-lg border shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Dados do Relatório
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Categoria
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trimestre
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reportData.slice(-15).reverse().map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(item.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {item.value.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                      {item.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      Q{item.metadata.quarter}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EnhancedReport;
