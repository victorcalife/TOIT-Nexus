/**
 * Página de Saúde do Sistema - Administração
 * Sistema TOIT Nexus - Módulo Administrador
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';
import {  
  Activity, 
  Server, 
  Database, 
  Cpu, 
  HardDrive, 
  MemoryStick, 
  Network, 
  Wifi, 
  WifiOff, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  RefreshCw, 
  TrendingUp, 
  TrendingDown, 
  Zap, 
  Globe, 
  Shield, 
  Mail, 
  Bell, 
  Cloud, 
  CloudOff, 
  Monitor, 
  Smartphone, 
  Users, 
  FileText, 
  Settings, 
  AlertCircle, 
  Info, 
  Eye, 
  BarChart3, 
  PieChart, 
  LineChart, 
  Timer, 
  Gauge, 
  Thermometer, 
  Battery, 
  BatteryLow, 
  Signal, 
  SignalHigh, 
  SignalLow, 
  SignalMedium,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';

const SystemHealth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState('1h');
  
  // Dados simulados de saúde do sistema
  const [systemHealth, setSystemHealth] = useState({
    overall: {
      status: 'healthy',
      uptime: '15 dias, 8 horas, 23 minutos',
      lastRestart: '2024-01-01 06:00:00',
      version: '1.2.3',
      environment: 'production'
    },
    services: [
      {
        name: 'API Gateway',
        status: 'healthy',
        uptime: '99.9%',
        responseTime: '45ms',
        requests: '1.2M',
        errors: '0.1%',
        lastCheck: '2024-01-15 14:30:00'
      },
      {
        name: 'Authentication Service',
        status: 'healthy',
        uptime: '99.8%',
        responseTime: '32ms',
        requests: '450K',
        errors: '0.2%',
        lastCheck: '2024-01-15 14:30:00'
      },
      {
        name: 'Database Primary',
        status: 'warning',
        uptime: '99.5%',
        responseTime: '120ms',
        requests: '2.1M',
        errors: '0.5%',
        lastCheck: '2024-01-15 14:29:45'
      },
      {
        name: 'Redis Cache',
        status: 'healthy',
        uptime: '99.9%',
        responseTime: '8ms',
        requests: '5.2M',
        errors: '0.0%',
        lastCheck: '2024-01-15 14:30:00'
      },
      {
        name: 'Email Service',
        status: 'healthy',
        uptime: '99.7%',
        responseTime: '250ms',
        requests: '25K',
        errors: '0.3%',
        lastCheck: '2024-01-15 14:30:00'
      },
      {
        name: 'File Storage',
        status: 'critical',
        uptime: '95.2%',
        responseTime: '1200ms',
        requests: '180K',
        errors: '4.8%',
        lastCheck: '2024-01-15 14:28:30'
      }
    ],
    infrastructure: {
      cpu: {
        usage: 65,
        cores: 8,
        temperature: 68,
        status: 'normal'
      },
      memory: {
        used: 12.5,
        total: 32,
        usage: 39,
        status: 'normal'
      },
      disk: {
        used: 450,
        total: 1000,
        usage: 45,
        status: 'normal'
      },
      network: {
        inbound: '125 MB/s',
        outbound: '89 MB/s',
        latency: '12ms',
        status: 'normal'
      }
    },
    metrics: {
      activeUsers: 1247,
      totalRequests: 8945623,
      errorRate: 0.2,
      avgResponseTime: 89,
      throughput: 1250
    },
    alerts: [
      {
        id: 1,
        level: 'warning',
        service: 'Database Primary',
        message: 'Tempo de resposta acima do normal',
        timestamp: '2024-01-15 14:25:00',
        acknowledged: false
      },
      {
        id: 2,
        level: 'critical',
        service: 'File Storage',
        message: 'Alta taxa de erro detectada',
        timestamp: '2024-01-15 14:20:00',
        acknowledged: false
      },
      {
        id: 3,
        level: 'info',
        service: 'System',
        message: 'Backup automático concluído',
        timestamp: '2024-01-15 14:00:00',
        acknowledged: true
      }
    ]
  });

  const getStatusIcon = (status) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'critical':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      healthy: 'bg-green-100 text-green-800',
      warning: 'bg-yellow-100 text-yellow-800',
      critical: 'bg-red-100 text-red-800'
    };
    
    const labels = {
      healthy: 'Saudável',
      warning: 'Atenção',
      critical: 'Crítico'
    };
    
    return (
      <Badge className={variants[status] || 'bg-gray-100 text-gray-800'}>
        {labels[status] || status}
      </Badge>
    );
  };

  const getAlertIcon = (level) => {
    switch (level) {
      case 'critical':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'info':
        return <Info className="h-4 w-4 text-blue-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getUsageColor = (usage) => {
    if (usage >= 90) return 'text-red-600';
    if (usage >= 70) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getProgressColor = (usage) => {
    if (usage >= 90) return 'bg-red-500';
    if (usage >= 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => {
      setLastUpdate(new Date());
      toast.success('Dados de saúde atualizados!');
      setIsLoading(false);
    }, 1000);
  };

  const toggleAutoRefresh = () => {
    if (autoRefresh) {
      clearInterval(refreshInterval);
      setRefreshInterval(null);
      setAutoRefresh(false);
      toast.info('Atualização automática desabilitada');
    } else {
      const interval = setInterval(() => {
        setLastUpdate(new Date());
      }, 30000); // 30 segundos
      setRefreshInterval(interval);
      setAutoRefresh(true);
      toast.info('Atualização automática habilitada (30s)');
    }
  };

  const acknowledgeAlert = (alertId) => {
    setSystemHealth(prev => ({
      ...prev,
      alerts: prev.alerts.map(alert => 
        alert.id === alertId ? { ...alert, acknowledged: true } : alert
      )
    }));
    toast.success('Alerta reconhecido!');
  };

  const restartService = (serviceName) => {
    if (window.confirm(`Tem certeza que deseja reiniciar o serviço "${serviceName}"?`)) {
      toast.success(`Reiniciando ${serviceName}...`);
      // Simular reinicialização
      setTimeout(() => {
        toast.success(`${serviceName} reiniciado com sucesso!`);
      }, 3000);
    }
  };

  useEffect(() => {
    // Auto refresh inicial
    if (autoRefresh) {
      const interval = setInterval(() => {
        setLastUpdate(new Date());
      }, 30000);
      setRefreshInterval(interval);
    }

    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, []);

  const overallStatus = systemHealth.services.some(s => s.status === 'critical') ? 'critical' :
                      systemHealth.services.some(s => s.status === 'warning') ? 'warning' : 'healthy';

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Saúde do Sistema</h1>
          <p className="text-gray-600">Monitore o status e performance de todos os serviços</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={toggleAutoRefresh}
            className={autoRefresh ? 'bg-green-50 border-green-200' : ''}
          >
            <Activity className="h-4 w-4 mr-2" />
            Auto Refresh {autoRefresh ? 'ON' : 'OFF'}
          </Button>
          <Button variant="outline" onClick={handleRefresh} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Overall Status */}
      <Card className={`border-l-4 ${
        overallStatus === 'healthy' ? 'border-l-green-500' :
        overallStatus === 'warning' ? 'border-l-yellow-500' : 'border-l-red-500'
      }`}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {getStatusIcon(overallStatus)}
              <div>
                <h2 className="text-xl font-semibold">Status Geral do Sistema</h2>
                <p className="text-gray-600">Última atualização: {lastUpdate.toLocaleString()}</p>
              </div>
            </div>
            <div className="text-right">
              {getStatusBadge(overallStatus)}
              <p className="text-sm text-gray-600 mt-1">Uptime: {systemHealth.overall.uptime}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">Versão</p>
              <p className="font-semibold">{systemHealth.overall.version}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Ambiente</p>
              <p className="font-semibold capitalize">{systemHealth.overall.environment}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Usuários Ativos</p>
              <p className="font-semibold">{systemHealth.metrics.activeUsers.toLocaleString()}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Taxa de Erro</p>
              <p className="font-semibold">{systemHealth.metrics.errorRate}%</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Infrastructure Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Cpu className="h-4 w-4" />
              CPU
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-2xl font-bold">{systemHealth.infrastructure.cpu.usage}%</span>
                <Thermometer className={`h-5 w-5 ${
                  systemHealth.infrastructure.cpu.temperature > 80 ? 'text-red-500' : 'text-green-500'
                }`} />
              </div>
              <Progress 
                value={systemHealth.infrastructure.cpu.usage} 
                className="h-2"
              />
              <div className="text-xs text-gray-600">
                <p>{systemHealth.infrastructure.cpu.cores} cores</p>
                <p>Temp: {systemHealth.infrastructure.cpu.temperature}°C</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <MemoryStick className="h-4 w-4" />
              Memória
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-2xl font-bold">{systemHealth.infrastructure.memory.usage}%</span>
                <Battery className="h-5 w-5 text-blue-500" />
              </div>
              <Progress 
                value={systemHealth.infrastructure.memory.usage} 
                className="h-2"
              />
              <div className="text-xs text-gray-600">
                <p>{systemHealth.infrastructure.memory.used}GB / {systemHealth.infrastructure.memory.total}GB</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <HardDrive className="h-4 w-4" />
              Disco
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-2xl font-bold">{systemHealth.infrastructure.disk.usage}%</span>
                <HardDrive className="h-5 w-5 text-purple-500" />
              </div>
              <Progress 
                value={systemHealth.infrastructure.disk.usage} 
                className="h-2"
              />
              <div className="text-xs text-gray-600">
                <p>{systemHealth.infrastructure.disk.used}GB / {systemHealth.infrastructure.disk.total}GB</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Network className="h-4 w-4" />
              Rede
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold">{systemHealth.infrastructure.network.latency}</span>
                <Signal className="h-5 w-5 text-green-500" />
              </div>
              <div className="text-xs text-gray-600 space-y-1">
                <p>↓ {systemHealth.infrastructure.network.inbound}</p>
                <p>↑ {systemHealth.infrastructure.network.outbound}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Services Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            Status dos Serviços
          </CardTitle>
          <CardDescription>
            Monitoramento em tempo real de todos os serviços do sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {systemHealth.services.map((service, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex items-center space-x-4">
                  {getStatusIcon(service.status)}
                  <div>
                    <h3 className="font-medium">{service.name}</h3>
                    <p className="text-sm text-gray-600">Última verificação: {service.lastCheck}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-6">
                  <div className="text-center">
                    <p className="text-xs text-gray-600">Uptime</p>
                    <p className="font-medium">{service.uptime}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-600">Resposta</p>
                    <p className="font-medium">{service.responseTime}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-600">Requisições</p>
                    <p className="font-medium">{service.requests}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-600">Erros</p>
                    <p className="font-medium">{service.errors}</p>
                  </div>
                  
                  <div className="flex gap-2">
                    {getStatusBadge(service.status)}
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => restartService(service.name)}
                      disabled={service.status === 'healthy'}
                    >
                      <RefreshCw className="h-3 w-3 mr-1" />
                      Reiniciar
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Alertas Ativos
          </CardTitle>
          <CardDescription>
            Alertas e notificações do sistema que requerem atenção
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {systemHealth.alerts.filter(alert => !alert.acknowledged).length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <p className="text-gray-500">Nenhum alerta ativo no momento</p>
              </div>
            ) : (
              systemHealth.alerts
                .filter(alert => !alert.acknowledged)
                .map((alert) => (
                  <div key={alert.id} className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
                    <div className="flex items-center space-x-3">
                      {getAlertIcon(alert.level)}
                      <div>
                        <h4 className="font-medium">{alert.service}</h4>
                        <p className="text-sm text-gray-600">{alert.message}</p>
                        <p className="text-xs text-gray-500">{alert.timestamp}</p>
                      </div>
                    </div>
                    
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => acknowledgeAlert(alert.id)}
                    >
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Reconhecer
                    </Button>
                  </div>
                ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Requisições Totais</p>
                <p className="text-2xl font-bold">{systemHealth.metrics.totalRequests.toLocaleString()}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tempo Médio de Resposta</p>
                <p className="text-2xl font-bold">{systemHealth.metrics.avgResponseTime}ms</p>
              </div>
              <Timer className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Throughput</p>
                <p className="text-2xl font-bold">{systemHealth.metrics.throughput}/s</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Taxa de Erro</p>
                <p className="text-2xl font-bold">{systemHealth.metrics.errorRate}%</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-400" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SystemHealth;