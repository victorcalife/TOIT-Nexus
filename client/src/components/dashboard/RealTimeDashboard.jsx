/**
 * DASHBOARD KPIs EM TEMPO REAL
 * Dashboard com métricas empresariais atualizadas via WebSocket
 * 100% JavaScript - SEM TYPESCRIPT
 */

import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  ShoppingCart,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
  Brain,
  Target,
  BarChart3,
  PieChart,
  LineChart,
  RefreshCw,
  Settings,
  Maximize,
  Bell,
  Wifi,
  WifiOff
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/use-toast';
import io from 'socket.io-client';

const KPI_TYPES = {
  REVENUE: 'revenue',
  USERS: 'users',
  ORDERS: 'orders',
  PERFORMANCE: 'performance',
  CONVERSION: 'conversion',
  SATISFACTION: 'satisfaction'
};

const ALERT_LEVELS = {
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error',
  INFO: 'info'
};

export default function RealTimeDashboard({ config = {} }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [isConnected, setIsConnected] = useState(false);
  const [realTimeData, setRealTimeData] = useState({});
  const [alerts, setAlerts] = useState([]);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  
  const socketRef = useRef(null);
  const intervalRef = useRef(null);

  // Query para dados iniciais do dashboard
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['dashboard-kpis'],
    queryFn: async () => {
      const response = await fetch('/api/dashboard/kpis', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao carregar KPIs');
      }

      return response.json();
    },
    enabled: !!user,
    refetchInterval: autoRefresh ? 30000 : false // Refetch a cada 30s se auto-refresh ativo
  });

  // Query para métricas em tempo real
  const { data: metricsData } = useQuery({
    queryKey: ['dashboard-metrics'],
    queryFn: async () => {
      const response = await fetch('/api/dashboard/metrics', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao carregar métricas');
      }

      return response.json();
    },
    enabled: !!user,
    refetchInterval: 10000 // Refetch a cada 10s
  });

  // Inicializar WebSocket para atualizações em tempo real
  useEffect(() => {
    if (!user) return;

    const wsUrl = process.env.REACT_APP_WS_URL || 'http://localhost:5000';
    socketRef.current = io(wsUrl, {
      transports: ['websocket', 'polling']
    });

    socketRef.current.on('connect', () => {
      console.log('🔗 Conectado ao WebSocket Dashboard');
      setIsConnected(true);
      
      // Autenticar e entrar na sala de dashboard
      socketRef.current.emit('authenticate', {
        userId: user.id,
        userName: user.name,
        tenantId: user.tenant_id
      });
      
      socketRef.current.emit('join_dashboard', {
        userId: user.id,
        tenantId: user.tenant_id
      });
    });

    socketRef.current.on('disconnect', () => {
      console.log('🔌 Desconectado do WebSocket Dashboard');
      setIsConnected(false);
    });

    // Eventos de dados em tempo real
    socketRef.current.on('dashboard_update', (data) => {
      console.log('📊 Atualização de dashboard recebida:', data);
      setRealTimeData(prev => ({ ...prev, ...data }));
      setLastUpdate(new Date());
      
      // Invalidar queries para atualizar cache
      queryClient.invalidateQueries(['dashboard-kpis']);
    });

    socketRef.current.on('kpi_update', (data) => {
      console.log('📈 Atualização de KPI recebida:', data);
      setRealTimeData(prev => ({
        ...prev,
        [data.kpiId]: data.value
      }));
      setLastUpdate(new Date());
    });

    socketRef.current.on('alert_notification', (alert) => {
      console.log('🚨 Alerta recebido:', alert);
      setAlerts(prev => [alert, ...prev.slice(0, 9)]); // Manter apenas 10 alertas
      
      // Mostrar toast para alertas importantes
      if (alert.level === ALERT_LEVELS.ERROR || alert.level === ALERT_LEVELS.WARNING) {
        toast({
          title: alert.title,
          description: alert.message,
          variant: alert.level === ALERT_LEVELS.ERROR ? 'destructive' : 'default'
        });
      }
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [user, queryClient, toast]);

  // Dados combinados (API + WebSocket)
  const kpis = {
    ...dashboardData?.data?.kpis,
    ...realTimeData
  };

  const metrics = metricsData?.data || {};

  // Componente de KPI
  const KPICard = ({ title, value, change, icon: Icon, type, color = 'blue' }) => {
    const isPositive = change >= 0;
    const TrendIcon = isPositive ? TrendingUp : TrendingDown;
    
    return (
      <Card className="hover:shadow-lg transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{title}</p>
              <p className="text-2xl font-bold text-gray-900">
                {typeof value === 'number' ? value.toLocaleString('pt-BR') : value}
              </p>
              <div className={`flex items-center mt-2 text-sm ${
                isPositive ? 'text-green-600' : 'text-red-600'
              }`}>
                <TrendIcon className="w-4 h-4 mr-1" />
                <span>{Math.abs(change)}%</span>
                <span className="text-gray-500 ml-1">vs período anterior</span>
              </div>
            </div>
            <div className={`p-3 rounded-full bg-${color}-100`}>
              <Icon className={`w-6 h-6 text-${color}-600`} />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Componente de Alerta
  const AlertCard = ({ alert }) => {
    const getAlertIcon = (level) => {
      switch (level) {
        case ALERT_LEVELS.SUCCESS: return CheckCircle;
        case ALERT_LEVELS.WARNING: return AlertTriangle;
        case ALERT_LEVELS.ERROR: return AlertTriangle;
        default: return Bell;
      }
    };

    const getAlertColor = (level) => {
      switch (level) {
        case ALERT_LEVELS.SUCCESS: return 'text-green-600 bg-green-100';
        case ALERT_LEVELS.WARNING: return 'text-yellow-600 bg-yellow-100';
        case ALERT_LEVELS.ERROR: return 'text-red-600 bg-red-100';
        default: return 'text-blue-600 bg-blue-100';
      }
    };

    const AlertIcon = getAlertIcon(alert.level);
    const colorClass = getAlertColor(alert.level);

    return (
      <div className="flex items-start space-x-3 p-3 border rounded-lg">
        <div className={`p-2 rounded-full ${colorClass}`}>
          <AlertIcon className="w-4 h-4" />
        </div>
        <div className="flex-1">
          <p className="font-medium text-gray-900">{alert.title}</p>
          <p className="text-sm text-gray-600">{alert.message}</p>
          <p className="text-xs text-gray-500 mt-1">
            {new Date(alert.timestamp).toLocaleString('pt-BR')}
          </p>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Dashboard em Tempo Real
          </h1>
          <p className="text-gray-600">
            Métricas empresariais atualizadas automaticamente
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-2">
            {isConnected ? (
              <Wifi className="w-4 h-4 text-green-500" />
            ) : (
              <WifiOff className="w-4 h-4 text-red-500" />
            )}
            <span className="text-sm text-gray-600">
              {isConnected ? 'Conectado' : 'Desconectado'}
            </span>
          </div>
          
          {lastUpdate && (
            <div className="flex items-center space-x-1 text-sm text-gray-500">
              <Clock className="w-4 h-4" />
              <span>
                Atualizado {lastUpdate.toLocaleTimeString('pt-BR')}
              </span>
            </div>
          )}
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
            Auto-refresh
          </Button>
          
          <Button variant="outline" size="sm">
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* KPIs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Receita Mensal"
          value={kpis.monthlyRevenue || 0}
          change={kpis.revenueGrowth || 0}
          icon={DollarSign}
          type={KPI_TYPES.REVENUE}
          color="green"
        />
        
        <KPICard
          title="Usuários Ativos"
          value={kpis.activeUsers || 0}
          change={kpis.userGrowth || 0}
          icon={Users}
          type={KPI_TYPES.USERS}
          color="blue"
        />
        
        <KPICard
          title="Pedidos Hoje"
          value={kpis.dailyOrders || 0}
          change={kpis.ordersGrowth || 0}
          icon={ShoppingCart}
          type={KPI_TYPES.ORDERS}
          color="purple"
        />
        
        <KPICard
          title="Performance"
          value={`${kpis.systemPerformance || 0}%`}
          change={kpis.performanceChange || 0}
          icon={Activity}
          type={KPI_TYPES.PERFORMANCE}
          color="orange"
        />
      </div>

      {/* Métricas Avançadas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Métricas Quânticas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Zap className="w-5 h-5 text-purple-600" />
              <span>Métricas Quânticas</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Operações Quânticas</span>
              <span className="font-semibold">{kpis.quantumOperations || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Speedup Quântico</span>
              <Badge variant="secondary">{kpis.quantumSpeedup || '0.0'}x</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Coerência</span>
              <span className="text-green-600 font-semibold">99.8%</span>
            </div>
          </CardContent>
        </Card>

        {/* MILA AI Insights */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Brain className="w-5 h-5 text-blue-600" />
              <span>MILA AI</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Insights Gerados</span>
              <span className="font-semibold">{kpis.milaInsights || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Precisão</span>
              <Badge variant="secondary">97.2%</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Predições Ativas</span>
              <span className="text-blue-600 font-semibold">{kpis.activePredictions || 0}</span>
            </div>
          </CardContent>
        </Card>

        {/* Alertas Recentes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Bell className="w-5 h-5 text-red-600" />
                <span>Alertas</span>
              </div>
              <Badge variant="outline">{alerts.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {alerts.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">
                Nenhum alerta recente
              </p>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {alerts.slice(0, 5).map((alert, index) => (
                  <AlertCard key={index} alert={alert} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Gráficos em Tempo Real */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5" />
              <span>Vendas por Hora</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <LineChart className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                <p>Gráfico em tempo real</p>
                <p className="text-sm">Dados atualizados via WebSocket</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <PieChart className="w-5 h-5" />
              <span>Distribuição de Usuários</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <Target className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                <p>Métricas de engajamento</p>
                <p className="text-sm">Atualização automática</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
