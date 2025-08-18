/**
 * PÁGINA DE MONITORAMENTO E ALERTAS
 * Sistema completo de monitoramento em tempo real e alertas
 * 100% JavaScript - SEM TYPESCRIPT
 */

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  Monitor,
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Bell,
  Settings,
  TrendingUp,
  TrendingDown,
  Cpu,
  HardDrive,
  Wifi,
  Database,
  Server,
  Globe,
  Shield,
  Zap,
  Clock,
  Users,
  BarChart3,
  LineChart,
  PieChart,
  RefreshCw,
  Play,
  Pause,
  Square,
  Download,
  Upload,
  Search,
  Filter,
  Eye,
  EyeOff,
  MemoryStick,
  Gauge
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/use-toast';

const ALERT_TYPES = {
  CRITICAL: 'critical',
  WARNING: 'warning',
  INFO: 'info',
  SUCCESS: 'success'
};

const ALERT_COLORS = {
  critical: 'bg-red-100 text-red-800',
  warning: 'bg-yellow-100 text-yellow-800',
  info: 'bg-blue-100 text-blue-800',
  success: 'bg-green-100 text-green-800'
};

const ALERT_ICONS = {
  critical: XCircle,
  warning: AlertTriangle,
  info: Bell,
  success: CheckCircle
};

const MONITORING_METRICS = [
  {
    id: 'cpu_usage',
    name: 'CPU Usage',
    icon: Cpu,
    unit: '%',
    thresholds: { warning: 70, critical: 90 },
    color: 'blue'
  },
  {
    id: 'memory_usage',
    name: 'Memory Usage',
    icon: MemoryStick,
    unit: '%',
    thresholds: { warning: 80, critical: 95 },
    color: 'green'
  },
  {
    id: 'disk_usage',
    name: 'Disk Usage',
    icon: HardDrive,
    unit: '%',
    thresholds: { warning: 85, critical: 95 },
    color: 'purple'
  },
  {
    id: 'network_throughput',
    name: 'Network Throughput',
    icon: Wifi,
    unit: 'Mbps',
    thresholds: { warning: 800, critical: 950 },
    color: 'orange'
  },
  {
    id: 'response_time',
    name: 'Response Time',
    icon: Clock,
    unit: 'ms',
    thresholds: { warning: 500, critical: 1000 },
    color: 'red'
  },
  {
    id: 'error_rate',
    name: 'Error Rate',
    icon: AlertTriangle,
    unit: '%',
    thresholds: { warning: 1, critical: 5 },
    color: 'yellow'
  },
  {
    id: 'active_users',
    name: 'Active Users',
    icon: Users,
    unit: '',
    thresholds: { warning: 1000, critical: 1500 },
    color: 'indigo'
  },
  {
    id: 'database_connections',
    name: 'DB Connections',
    icon: Database,
    unit: '',
    thresholds: { warning: 80, critical: 95 },
    color: 'teal'
  }
];

export default function MonitoringPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedMetric, setSelectedMetric] = useState(null);
  const [alertsFilter, setAlertsFilter] = useState('all');
  const [timeRange, setTimeRange] = useState('1h');
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Query para métricas em tempo real
  const { data: metricsData, isLoading } = useQuery({
    queryKey: ['monitoring-metrics', timeRange],
    queryFn: async () => {
      const response = await fetch(`/api/monitoring/metrics?range=${timeRange}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao carregar métricas de monitoramento');
      }

      return response.json();
    },
    enabled: !!user,
    refetchInterval: autoRefresh ? 30000 : false
  });

  // Query para alertas ativos
  const { data: alertsData } = useQuery({
    queryKey: ['active-alerts'],
    queryFn: async () => {
      const response = await fetch('/api/monitoring/alerts', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao carregar alertas');
      }

      return response.json();
    },
    enabled: !!user,
    refetchInterval: autoRefresh ? 15000 : false
  });

  // Query para status dos serviços
  const { data: servicesData } = useQuery({
    queryKey: ['services-status'],
    queryFn: async () => {
      const response = await fetch('/api/monitoring/services', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao carregar status dos serviços');
      }

      return response.json();
    },
    enabled: !!user,
    refetchInterval: autoRefresh ? 10000 : false
  });

  // Mutation para configurar alerta
  const configureAlertMutation = useMutation({
    mutationFn: async (alertConfig) => {
      const response = await fetch('/api/monitoring/alerts/configure', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify(alertConfig)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao configurar alerta');
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Alerta configurado',
        description: 'Configuração de alerta salva com sucesso.'
      });
      queryClient.invalidateQueries(['active-alerts']);
    },
    onError: (error) => {
      toast({
        title: 'Erro na configuração',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  // Mutation para silenciar alerta
  const silenceAlertMutation = useMutation({
    mutationFn: async (alertId) => {
      const response = await fetch(`/api/monitoring/alerts/${alertId}/silence`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao silenciar alerta');
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Alerta silenciado',
        description: 'Alerta foi silenciado temporariamente.'
      });
      queryClient.invalidateQueries(['active-alerts']);
    }
  });

  const metrics = metricsData?.data || {};
  const alerts = alertsData?.data?.alerts || [];
  const services = servicesData?.data?.services || [];

  const getMetricValue = (metricId) => {
    return metrics[metricId]?.current || 0;
  };

  const getMetricStatus = (metricId) => {
    const value = getMetricValue(metricId);
    const metric = MONITORING_METRICS.find(m => m.id === metricId);
    
    if (!metric) return 'normal';
    
    if (value >= metric.thresholds.critical) return 'critical';
    if (value >= metric.thresholds.warning) return 'warning';
    return 'normal';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'critical': return 'text-red-600';
      case 'warning': return 'text-yellow-600';
      case 'normal': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const getOverallSystemHealth = () => {
    const criticalCount = MONITORING_METRICS.filter(m => getMetricStatus(m.id) === 'critical').length;
    const warningCount = MONITORING_METRICS.filter(m => getMetricStatus(m.id) === 'warning').length;
    
    if (criticalCount > 0) return 'critical';
    if (warningCount > 0) return 'warning';
    return 'healthy';
  };

  const filteredAlerts = alerts.filter(alert => {
    if (alertsFilter === 'all') return true;
    return alert.type === alertsFilter;
  });

  const systemHealth = getOverallSystemHealth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Monitor className="w-8 h-8 mr-3 text-blue-600" />
            Monitoramento & Alertas
          </h1>
          <p className="text-gray-600">
            Monitoramento em tempo real e sistema de alertas
          </p>
        </div>
        
        <div className="flex space-x-2">
          <Button
            variant={autoRefresh ? "default" : "outline"}
            onClick={() => setAutoRefresh(!autoRefresh)}
            className="flex items-center space-x-2"
          >
            {autoRefresh ? (
              <Pause className="w-4 h-4" />
            ) : (
              <Play className="w-4 h-4" />
            )}
            <span>{autoRefresh ? 'Pausar' : 'Iniciar'} Auto-refresh</span>
          </Button>
          
          <Button variant="outline" className="flex items-center space-x-2">
            <Settings className="w-4 h-4" />
            <span>Configurações</span>
          </Button>
        </div>
      </div>

      {/* System Health Status */}
      <Card className={`mb-8 border-2 ${
        systemHealth === 'healthy' ? 'border-green-200 bg-green-50' :
        systemHealth === 'warning' ? 'border-yellow-200 bg-yellow-50' :
        'border-red-200 bg-red-50'
      }`}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={`p-4 rounded-full ${
                systemHealth === 'healthy' ? 'bg-green-100' :
                systemHealth === 'warning' ? 'bg-yellow-100' : 'bg-red-100'
              }`}>
                <Activity className={`w-8 h-8 ${
                  systemHealth === 'healthy' ? 'text-green-600' :
                  systemHealth === 'warning' ? 'text-yellow-600' : 'text-red-600'
                }`} />
              </div>
              <div>
                <h3 className="text-2xl font-bold">
                  Status do Sistema: {
                    systemHealth === 'healthy' ? 'Saudável' :
                    systemHealth === 'warning' ? 'Atenção' : 'Crítico'
                  }
                </h3>
                <p className={`${
                  systemHealth === 'healthy' ? 'text-green-700' :
                  systemHealth === 'warning' ? 'text-yellow-700' : 'text-red-700'
                }`}>
                  {systemHealth === 'healthy' ? 'Todos os sistemas operando normalmente' :
                   systemHealth === 'warning' ? 'Alguns sistemas requerem atenção' :
                   'Sistemas críticos com problemas'}
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-sm text-gray-600">Uptime</p>
                <p className="text-lg font-bold text-green-600">
                  {((metrics.uptime || 0.999) * 100).toFixed(2)}%
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Alertas Ativos</p>
                <p className="text-lg font-bold text-red-600">
                  {alerts.length}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Última Atualização</p>
                <p className="text-lg font-bold text-blue-600">
                  {new Date().toLocaleTimeString('pt-BR')}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {MONITORING_METRICS.map(metric => {
          const value = getMetricValue(metric.id);
          const status = getMetricStatus(metric.id);
          const Icon = metric.icon;
          
          return (
            <Card key={metric.id} className={`cursor-pointer transition-all hover:shadow-lg ${
              status === 'critical' ? 'border-red-200' :
              status === 'warning' ? 'border-yellow-200' : 'border-gray-200'
            }`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{metric.name}</p>
                    <p className={`text-2xl font-bold ${getStatusColor(status)}`}>
                      {value.toFixed(1)}{metric.unit}
                    </p>
                  </div>
                  <Icon className={`w-8 h-8 text-${metric.color}-600`} />
                </div>
                
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>0</span>
                    <span>Warning: {metric.thresholds.warning}</span>
                    <span>Critical: {metric.thresholds.critical}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        status === 'critical' ? 'bg-red-600' :
                        status === 'warning' ? 'bg-yellow-600' : 'bg-green-600'
                      }`}
                      style={{ 
                        width: `${Math.min((value / metric.thresholds.critical) * 100, 100)}%` 
                      }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="alerts">Alertas</TabsTrigger>
          <TabsTrigger value="services">Serviços</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Tendências de Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <LineChart className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p>Gráfico de tendências</p>
                  <p className="text-sm">Dados dos últimos 24h</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Distribuição de Recursos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {MONITORING_METRICS.slice(0, 4).map(metric => {
                    const value = getMetricValue(metric.id);
                    const percentage = Math.min((value / metric.thresholds.critical) * 100, 100);
                    
                    return (
                      <div key={metric.id} className="space-y-2">
                        <div className="flex justify-between">
                          <span className="font-medium">{metric.name}</span>
                          <span className="text-sm text-gray-600">
                            {value.toFixed(1)}{metric.unit}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full bg-${metric.color}-600`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="mt-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex space-x-2">
              <select
                value={alertsFilter}
                onChange={(e) => setAlertsFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="all">Todos os alertas</option>
                <option value="critical">Críticos</option>
                <option value="warning">Avisos</option>
                <option value="info">Informativos</option>
              </select>
              
              <Button variant="outline" className="flex items-center space-x-2">
                <Settings className="w-4 h-4" />
                <span>Configurar Alertas</span>
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            {filteredAlerts.map(alert => {
              const AlertIcon = ALERT_ICONS[alert.type];
              
              return (
                <Card key={alert.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <AlertIcon className={`w-6 h-6 mt-1 ${
                          alert.type === 'critical' ? 'text-red-600' :
                          alert.type === 'warning' ? 'text-yellow-600' :
                          alert.type === 'info' ? 'text-blue-600' : 'text-green-600'
                        }`} />
                        <div className="flex-1">
                          <h4 className="font-semibold text-lg">{alert.title}</h4>
                          <p className="text-gray-600 mt-1">{alert.description}</p>
                          <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
                            <span>Serviço: {alert.service}</span>
                            <span>Iniciado: {new Date(alert.created_at).toLocaleString('pt-BR')}</span>
                            {alert.resolved_at && (
                              <span>Resolvido: {new Date(alert.resolved_at).toLocaleString('pt-BR')}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Badge className={ALERT_COLORS[alert.type]}>
                          {alert.type}
                        </Badge>
                        
                        {!alert.resolved_at && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => silenceAlertMutation.mutate(alert.id)}
                            disabled={silenceAlertMutation.isLoading}
                          >
                            <EyeOff className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            
            {filteredAlerts.length === 0 && (
              <Card>
                <CardContent className="text-center py-12">
                  <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-400" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Nenhum alerta ativo
                  </h3>
                  <p className="text-gray-600">
                    Todos os sistemas estão operando normalmente
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="services" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map(service => (
              <Card key={service.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-full ${
                        service.status === 'healthy' ? 'bg-green-100' :
                        service.status === 'warning' ? 'bg-yellow-100' : 'bg-red-100'
                      }`}>
                        <Server className={`w-5 h-5 ${
                          service.status === 'healthy' ? 'text-green-600' :
                          service.status === 'warning' ? 'text-yellow-600' : 'text-red-600'
                        }`} />
                      </div>
                      <div>
                        <h4 className="font-semibold">{service.name}</h4>
                        <p className="text-sm text-gray-600">{service.description}</p>
                      </div>
                    </div>
                    
                    <Badge className={
                      service.status === 'healthy' ? 'bg-green-100 text-green-800' :
                      service.status === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }>
                      {service.status}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Uptime:</span>
                      <span className="font-medium">{((service.uptime || 0.999) * 100).toFixed(2)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Response Time:</span>
                      <span className="font-medium">{service.responseTime || 0}ms</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Last Check:</span>
                      <span className="font-medium">
                        {new Date(service.lastCheck).toLocaleTimeString('pt-BR')}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="logs" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Logs do Sistema</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-gray-500">
                <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Visualizador de Logs
                </h3>
                <p className="text-gray-600">
                  Interface de logs em desenvolvimento
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
