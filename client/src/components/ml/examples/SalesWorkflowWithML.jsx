/**
 * EXEMPLO DE INTEGRAÇÃO ML EM WORKFLOW DE VENDAS
 * Demonstra como integrar ML em workflows existentes
 * 100% JavaScript - SEM TYPESCRIPT
 */

import React, { useState, useEffect } from 'react';
import { WorkflowMLIntegration } from '../WorkflowMLIntegration';
import { MLCreditsWidget } from '../MLCreditsWidget';
import {  




  BarChart3,

 }
} from 'lucide-react';

/**
 * Exemplo de workflow de vendas com integração ML
 * @returns {React.ReactElement} Componente do workflow
 */
export function SalesWorkflowWithML() ({ const [salesData, setSalesData] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [mlInsights, setMLInsights] = useState([]);

  // Simular carregamento de dados de vendas
  useEffect(() => {
    const generateSalesData = ( }) => {
      const days = selectedPeriod === '7d' ? 7 : selectedPeriod === '30d' ? 30 : 90;
      const data = [];
      
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        
        // Simular dados de vendas com tendência e sazonalidade
        const baseValue = 5000;
        const trend = (days - i) * 50; // Tendência de crescimento
        const weekday = date.getDay();
        const weekendFactor = weekday === 0 || weekday === 6 ? 0.7 : 1; // Menor venda nos fins de semana
        const randomFactor = 0.8 + Math.random() * 0.4; // Variação aleatória
        
        const value = Math.round((baseValue + trend) * weekendFactor * randomFactor);
        
        data.push({
          date: date.toISOString().split('T')[0],
          value: value,
          amount: value,
          deals: Math.floor(value / 500), // Número de deals
          customers: Math.floor(value / 1000) // Número de clientes
        });
      }
      
      return data;
    };

    setSalesData(generateSalesData());
  }, [selectedPeriod]);

  /**
   * Lidar com insights ML gerados
   */
  const handleMLInsightGenerated = (insightData) => {
    const newInsight = {
      id: Date.now(),
      type: insightData.insightType,
      data: insightData.insight,
      timestamp: new Date().toISOString(),
      workflowContext: 'sales'
    };
    
    setMLInsights(prev => [newInsight, ...prev.slice(0, 4)]); // Manter apenas os 5 mais recentes
    
    console.log('Insight ML gerado para vendas:', newInsight);
  };

  /**
   * Calcular métricas de vendas
   */
  const calculateMetrics = () => {
    if (salesData.length === 0) return {};
    
    const totalSales = salesData.reduce((sum, item) => sum + item.value, 0);
    const avgDaily = totalSales / salesData.length;
    const lastWeek = salesData.slice(-7).reduce((sum, item) => sum + item.value, 0);
    const prevWeek = salesData.slice(-14, -7).reduce((sum, item) => sum + item.value, 0);
    const weeklyGrowth = prevWeek > 0 ? ((lastWeek - prevWeek) / prevWeek) * 100 : 0;
    
    return ({ totalSales,
      avgDaily,
      weeklyGrowth,
      totalDeals: salesData.reduce((sum, item) => sum + item.deals, 0),
      totalCustomers: salesData.reduce((sum, item }) => sum + item.customers, 0)
    };
  };

  const metrics = calculateMetrics();

  return (
    <div className="space-y-6">
      {/* Header do Workflow */}
      <div className="bg-white p-6 rounded-lg border shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Workflow de Vendas
            </h2>
            <p className="text-gray-600">
              Gerencie e analise suas vendas com insights de ML
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Widget de créditos ML */}
            <MLCreditsWidget variant="compact" />
            
            {/* Filtro de período */}
            <select
              value={selectedPeriod}
              onChange=({ (e }) => setSelectedPeriod(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="7d">Últimos 7 dias</option>
              <option value="30d">Últimos 30 dias</option>
              <option value="90d">Últimos 90 dias</option>
            </select>
          </div>
        </div>

        {/* Métricas principais */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 bg-green-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600">Vendas Total</p>
                <p className="text-xl font-bold text-green-900">
                  R$ {metrics.totalSales?.toLocaleString() || '0'}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600">Média Diária</p>
                <p className="text-xl font-bold text-blue-900">
                  R$ {Math.round(metrics.avgDaily || 0).toLocaleString()}
                </p>
              </div>
              <BarChart3 className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="p-4 bg-purple-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600">Crescimento Semanal</p>
                <p className="text-xl font-bold text-purple-900">
                  {metrics.weeklyGrowth?.toFixed(1) || '0'}%
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-600" />
            </div>
          </div>

          <div className="p-4 bg-orange-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-600">Total Clientes</p>
                <p className="text-xl font-bold text-orange-900">
                  {metrics.totalCustomers || '0'}
                </p>
              </div>
              <Users className="w-8 h-8 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Integração ML */}
      <WorkflowMLIntegration
        workflowData={salesData}
        workflowType="sales"
        workflowId="sales-workflow-1"
        onInsightGenerated={handleMLInsightGenerated}
        showCompact={false}
      />

      {/* Insights ML Gerados */}
      ({ mlInsights.length > 0 && (
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Insights ML Recentes
          </h3>
          
          <div className="space-y-4">
            {mlInsights.map((insight }) => (
              <div key={insight.id} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <div className="p-1 bg-purple-100 rounded">
                      {insight.type === 'prediction' && <TrendingUp className="w-4 h-4 text-purple-600" />}
                      {insight.type === 'optimization' && <BarChart3 className="w-4 h-4 text-purple-600" />}
                      {insight.type === 'anomaly' && <Calendar className="w-4 h-4 text-purple-600" />}
                    </div>
                    <span className="font-medium text-gray-900 capitalize">
                      {insight.type}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(insight.timestamp).toLocaleString()}
                  </span>
                </div>
                
                <div className="text-sm text-gray-700">
                  <p className="mb-2">
                    {insight.data.summary?.description || 'Insight processado com sucesso'}
                  </p>
                  
                  ({ insight.data.insights && (
                    <ul className="list-disc list-inside space-y-1 text-xs text-gray-600">
                      {insight.data.insights.slice(0, 3).map((item, index }) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabela de dados de vendas */}
      <div className="bg-white rounded-lg border shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Dados de Vendas
            </h3>
            <button className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700">
              <Plus className="w-4 h-4 inline mr-2" />
              Nova Venda
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">

                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vendas (R$)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">

                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">

                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ticket Médio
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              ({ salesData.slice(-10).reverse().map((item, index }) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(item.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    R$ {item.value.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.deals}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.customers}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    R$ {Math.round(item.value / Math.max(1, item.deals)).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default SalesWorkflowWithML;
