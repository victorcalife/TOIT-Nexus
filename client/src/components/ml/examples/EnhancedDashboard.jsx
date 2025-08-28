/**
 * EXEMPLO DE DASHBOARD APRIMORADO COM ML
 * Demonstra como integrar widgets ML em dashboards existentes
 * 100% JavaScript - SEM TYPESCRIPT
 */

import React, { useState, useEffect } from 'react';
import { DashboardMLWidget } from '../DashboardMLWidget';
import { MLCreditsWidget } from '../MLCreditsWidget';
import {  





  BarChart3,

 }
} from 'lucide-react';

/**
 * Dashboard aprimorado com funcionalidades ML
 * @returns {React.ReactElement} Dashboard com ML
 */
export function EnhancedDashboard() {
  const [dashboardData, setDashboardData] = useState({
    sales: [],
    users: [],
    orders: [],
    revenue: []
  });
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [mlInsights, setMLInsights] = useState([]);

  // Simular carregamento de dados do dashboard
  useEffect(() => ({ const generateDashboardData = ( }) => {
      const days = selectedPeriod === '7d' ? 7 : selectedPeriod === '30d' ? 30 : 90;
      
      const salesData = [];
      const usersData = [];
      const ordersData = [];
      const revenueData = [];

      for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];

        // Simular dados com tendências realistas
        const dayOfWeek = date.getDay();
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
        const weekendFactor = isWeekend ? 0.7 : 1;
        
        // Dados de vendas
        const baseSales = 5000;
        const salesTrend = (days - i) * 30;
        const salesValue = Math.round((baseSales + salesTrend + (Math.random() * 1000 - 500)) * weekendFactor);
        salesData.push({ date: dateStr, value: Math.max(0, salesValue) });

        // Dados de usuários
        const baseUsers = 200;
        const usersValue = Math.round(baseUsers + (Math.random() * 50 - 25));
        usersData.push({ date: dateStr, value: Math.max(0, usersValue) });

        // Dados de pedidos
        const baseOrders = 50;
        const ordersValue = Math.round((baseOrders + (Math.random() * 20 - 10)) * weekendFactor);
        ordersData.push({ date: dateStr, value: Math.max(0, ordersValue) });

        // Dados de receita
        const revenueValue = salesValue * (0.8 + Math.random() * 0.4);
        revenueData.push({ date: dateStr, value: Math.max(0, Math.round(revenueValue)) });
      }

      setDashboardData({
        sales: salesData,
        users: usersData,
        orders: ordersData,
        revenue: revenueData
      });
    };

    generateDashboardData();
  }, [selectedPeriod]);

  /**
   * Calcular métricas do dashboard
   */
  const calculateMetrics = () => {
    const { sales, users, orders, revenue } = dashboardData;
    
    const totalSales = sales.reduce((sum, item) => sum + item.value, 0);
    const totalUsers = users.reduce((sum, item) => sum + item.value, 0);
    const totalOrders = orders.reduce((sum, item) => sum + item.value, 0);
    const totalRevenue = revenue.reduce((sum, item) => sum + item.value, 0);

    // Calcular crescimento (últimos 7 dias vs 7 anteriores)
    const getGrowth = (data) => ({ if (data.length < 14) return 0;
      const recent = data.slice(-7).reduce((sum, item) => sum + item.value, 0);
      const previous = data.slice(-14, -7).reduce((sum, item }) => sum + item.value, 0);
      return previous > 0 ? ((recent - previous) / previous) * 100 : 0;
    };

    return {
      totalSales,
      totalUsers,
      totalOrders,
      totalRevenue,
      salesGrowth: getGrowth(sales),
      usersGrowth: getGrowth(users),
      ordersGrowth: getGrowth(orders),
      revenueGrowth: getGrowth(revenue)
    };
  };

  const metrics = calculateMetrics();

  /**
   * Lidar com insights ML gerados
   */
  const handleMLInsight = (insight) => {
    const newInsight = {
      id: Date.now(),
      ...insight,
      timestamp: new Date().toISOString()
    };
    
    setMLInsights(prev => [newInsight, ...prev.slice(0, 4)]);
    console.log('Novo insight ML:', newInsight);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Dashboard Inteligente
              </h1>
              <p className="text-gray-600">
                Analytics aprimorado com Quantum ML
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <MLCreditsWidget variant="compact" />
              
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
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Métricas principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Vendas Total</p>
                <p className="text-2xl font-bold text-gray-900">
                  R$ {metrics.totalSales.toLocaleString()}
                </p>
                <div className="flex items-center mt-1">
                  <TrendingUp className={`w-4 h-4 mr-1 ${
                    metrics.salesGrowth >= 0 ? 'text-green-600' : 'text-red-600'`}
                  }`} />`
                  <span className={`text-sm ${
                    metrics.salesGrowth >= 0 ? 'text-green-600' : 'text-red-600'`}
                  }`}>
                    {metrics.salesGrowth.toFixed(1)}%
                  </span>
                </div>
              </div>
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Usuários Ativos</p>
                <p className="text-2xl font-bold text-gray-900">
                  {metrics.totalUsers.toLocaleString()}
                </p>
                <div className="flex items-center mt-1">`
                  <TrendingUp className={`w-4 h-4 mr-1 ${
                    metrics.usersGrowth >= 0 ? 'text-green-600' : 'text-red-600'`}
                  }`} />`
                  <span className={`text-sm ${
                    metrics.usersGrowth >= 0 ? 'text-green-600' : 'text-red-600'`}
                  }`}>
                    {metrics.usersGrowth.toFixed(1)}%
                  </span>
                </div>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pedidos</p>
                <p className="text-2xl font-bold text-gray-900">
                  {metrics.totalOrders.toLocaleString()}
                </p>
                <div className="flex items-center mt-1">`
                  <TrendingUp className={`w-4 h-4 mr-1 ${
                    metrics.ordersGrowth >= 0 ? 'text-green-600' : 'text-red-600'`}
                  }`} />`
                  <span className={`text-sm ${
                    metrics.ordersGrowth >= 0 ? 'text-green-600' : 'text-red-600'`}
                  }`}>
                    {metrics.ordersGrowth.toFixed(1)}%
                  </span>
                </div>
              </div>
              <ShoppingCart className="w-8 h-8 text-purple-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Receita</p>
                <p className="text-2xl font-bold text-gray-900">
                  R$ {metrics.totalRevenue.toLocaleString()}
                </p>
                <div className="flex items-center mt-1">`
                  <TrendingUp className={`w-4 h-4 mr-1 ${
                    metrics.revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'`}
                  }`} />`
                  <span className={`text-sm ${
                    metrics.revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'`}
                  }`}>
                    {metrics.revenueGrowth.toFixed(1)}%
                  </span>
                </div>
              </div>
              <Activity className="w-8 h-8 text-orange-600" />
            </div>
          </div>
        </div>

        {/* Widgets ML */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <DashboardMLWidget
            title="Análise de Vendas"
            data={dashboardData.sales}
            dataType="sales"
            period={selectedPeriod}
            autoInsights={true}
            onInsightClick={handleMLInsight}
            size="md"
          />

          <DashboardMLWidget
            title="Análise de Usuários"
            data={dashboardData.users}
            dataType="users"
            period={selectedPeriod}
            autoInsights={false}
            onInsightClick={handleMLInsight}
            size="md"
          />
        </div>

        {/* Widgets ML menores */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <DashboardMLWidget
            title="Pedidos ML"
            data={dashboardData.orders}
            dataType="orders"
            period={selectedPeriod}
            size="sm"
          />

          <DashboardMLWidget
            title="Receita ML"
            data={dashboardData.revenue}
            dataType="revenue"
            period={selectedPeriod}
            size="sm"
          />

          <div className="bg-white p-4 rounded-lg border shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-gray-900">Performance</h4>
              <BarChart3 className="w-5 h-5 text-gray-600" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Conversão</span>
                <span className="font-medium">3.2%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Ticket Médio</span>
                <span className="font-medium">R$ 127</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-gray-900">Tendências</h4>
              <PieChart className="w-5 h-5 text-gray-600" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Crescimento</span>
                <span className="font-medium text-green-600">+12.5%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Sazonalidade</span>
                <span className="font-medium">Detectada</span>
              </div>
            </div>
          </div>
        </div>

        {/* Insights ML recentes */}
        ({ mlInsights.length > 0 && (
          <div className="bg-white rounded-lg border shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Insights ML Recentes
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {mlInsights.map((insight }) => (
                  <div key={insight.id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <div className="p-1 bg-purple-100 rounded">
                          <TrendingUp className="w-4 h-4 text-purple-600" />
                        </div>
                        <span className="font-medium text-gray-900 capitalize">
                          {insight.type}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(insight.timestamp).toLocaleString()}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-700">
                      {insight.data?.summary?.description || 'Insight processado com sucesso'}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default EnhancedDashboard;
`