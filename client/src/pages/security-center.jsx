/**
 * CENTRO DE SEGURANÇA - TOIT NEXUS
 * Sistema completo de segurança e monitoramento
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
  Shield, 
  ShieldAlert,
  ShieldCheck,
  Lock,
  Unlock,
  Key,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Globe,
  Smartphone,
  Monitor,
  Activity,
  Zap,
  RefreshCw,
  Download,
  Filter,
  Search,
  Settings,
  Bell,
  BellOff,
  Fingerprint,
  Scan,
  Database,
  Server,
  Network,
  Wifi,
  WifiOff,
  Bug,
  Target,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  LineChart,
  MapPin,
  Calendar,
  FileText,
  Archive,
  Trash2,
  Edit,
  Plus,
  Minus,
  MoreHorizontal
} from 'lucide-react';

const SecurityCenter = () => {
  const [securityData, setSecurityData] = useState({});
  const [threats, setThreats] = useState([]);
  const [logs, setLogs] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [realTimeEnabled, setRealTimeEnabled] = useState(true);
  const [filters, setFilters] = useState({
    severity: 'all',
    type: 'all',
    status: 'all',
    timeRange: 'last24h'
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItems, setSelectedItems] = useState([]);
  
  const { toast } = useToast();

  // Níveis de severidade
  const severityLevels = {
    critical: {
      name: 'Crítico',
      color: 'text-red-600 bg-red-100 border-red-200',
      icon: <ShieldAlert className="h-4 w-4" />
    },
    high: {
      name: 'Alto',
      color: 'text-orange-600 bg-orange-100 border-orange-200',
      icon: <AlertTriangle className="h-4 w-4" />
    },
    medium: {
      name: 'Médio',
      color: 'text-yellow-600 bg-yellow-100 border-yellow-200',
      icon: <Eye className="h-4 w-4" />
    },
    low: {
      name: 'Baixo',
      color: 'text-blue-600 bg-blue-100 border-blue-200',
      icon: <CheckCircle className="h-4 w-4" />
    },
    info: {
      name: 'Info',
      color: 'text-gray-600 bg-gray-100 border-gray-200',
      icon: <FileText className="h-4 w-4" />
    }
  };

  // Tipos de ameaças
  const threatTypes = {
    malware: { name: 'Malware', icon: <Bug className="h-4 w-4" /> },
    phishing: { name: 'Phishing', icon: <Target className="h-4 w-4" /> },
    bruteforce: { name: 'Força Bruta', icon: <Lock className="h-4 w-4" /> },
    ddos: { name: 'DDoS', icon: <Network className="h-4 w-4" /> },
    intrusion: { name: 'Intrusão', icon: <Shield className="h-4 w-4" /> },
    vulnerability: { name: 'Vulnerabilidade', icon: <ShieldAlert className="h-4 w-4" /> }
  };

  /**
   * CARREGAR DADOS DE SEGURANÇA
   */
  const loadSecurityData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/security/dashboard?timeRange=${filters.timeRange}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao carregar dados de segurança');
      }

      const data = await response.json();
      setSecurityData(data.dashboard || {});
      setThreats(data.threats || []);
      setLogs(data.logs || []);
      setAlerts(data.alerts || []);
    } catch (error) {
      console.error('Erro ao carregar dados de segurança:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados de segurança",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * EXECUTAR SCAN DE SEGURANÇA
   */
  const runSecurityScan = async (scanType = 'full') => {
    setLoading(true);
    try {
      const response = await fetch('/api/security/scan', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ scanType })
      });

      if (!response.ok) {
        throw new Error('Erro ao executar scan');
      }

      const data = await response.json();
      
      toast({
        title: "Scan iniciado",
        description: `Scan de segurança ${scanType} iniciado com sucesso`,
      });

      // Recarregar dados após alguns segundos
      setTimeout(loadSecurityData, 3000);
    } catch (error) {
      console.error('Erro ao executar scan:', error);
      toast({
        title: "Erro",
        description: "Não foi possível executar o scan de segurança",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * BLOQUEAR AMEAÇA
   */
  const blockThreat = async (threatId) => {
    try {
      const response = await fetch(`/api/security/threats/${threatId}/block`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao bloquear ameaça');
      }

      setThreats(prev => prev.map(threat => 
        threat.id === threatId 
          ? { ...threat, status: 'blocked', blockedAt: new Date().toISOString() }
          : threat
      ));
      
      toast({
        title: "Ameaça bloqueada",
        description: "Ameaça bloqueada com sucesso",
      });
    } catch (error) {
      console.error('Erro ao bloquear ameaça:', error);
      toast({
        title: "Erro",
        description: "Não foi possível bloquear a ameaça",
        variant: "destructive"
      });
    }
  };

  /**
   * MARCAR COMO FALSO POSITIVO
   */
  const markAsFalsePositive = async (threatId) => {
    try {
      const response = await fetch(`/api/security/threats/${threatId}/false-positive`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao marcar como falso positivo');
      }

      setThreats(prev => prev.map(threat => 
        threat.id === threatId 
          ? { ...threat, status: 'false_positive', resolvedAt: new Date().toISOString() }
          : threat
      ));
      
      toast({
        title: "Marcado como falso positivo",
        description: "Ameaça marcada como falso positivo",
      });
    } catch (error) {
      console.error('Erro ao marcar como falso positivo:', error);
      toast({
        title: "Erro",
        description: "Não foi possível marcar como falso positivo",
        variant: "destructive"
      });
    }
  };

  /**
   * CONFIGURAR MONITORAMENTO EM TEMPO REAL
   */
  const setupRealTimeMonitoring = () => {
    if (!realTimeEnabled) return;

    const eventSource = new EventSource(`/api/security/stream?token=${localStorage.getItem('token')}`);
    
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === 'threat') {
        setThreats(prev => [data.threat, ...prev]);
        
        // Mostrar notificação para ameaças críticas
        if (data.threat.severity === 'critical') {
          toast({
            title: "🚨 Ameaça Crítica Detectada",
            description: data.threat.description,
            variant: "destructive"
          });
        }
      } else if (data.type === 'alert') {
        setAlerts(prev => [data.alert, ...prev]);
      } else if (data.type === 'log') {
        setLogs(prev => [data.log, ...prev.slice(0, 999)]); // Manter apenas 1000 logs
      }
    };

    eventSource.onerror = (error) => {
      console.error('Erro no stream de segurança:', error);
      eventSource.close();
    };

    return () => eventSource.close();
  };

  /**
   * RENDERIZAR CARD DE MÉTRICA
   */
  const renderMetricCard = (metric) => {
    const isPositive = metric.change >= 0;
    const changeColor = metric.isInverted 
      ? (isPositive ? 'text-red-600' : 'text-green-600')
      : (isPositive ? 'text-green-600' : 'text-red-600');
    const TrendIcon = isPositive ? TrendingUp : TrendingDown;

    return (
      <Card key={metric.id}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{metric.label}</p>
              <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
              {metric.change !== undefined && (
                <div className={`flex items-center mt-1 ${changeColor}`}>
                  <TrendIcon className="h-4 w-4 mr-1" />
                  <span className="text-sm font-medium">
                    {Math.abs(metric.change)}% vs período anterior
                  </span>
                </div>
              )}
            </div>
            <div className={`p-3 rounded-full ${metric.bgColor || 'bg-blue-100'}`}>
              {metric.icon || <Shield className="h-6 w-6 text-blue-600" />}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  /**
   * RENDERIZAR AMEAÇA
   */
  const renderThreat = (threat) => {
    const severity = severityLevels[threat.severity] || severityLevels.info;
    const threatType = threatTypes[threat.type] || threatTypes.intrusion;
    const isSelected = selectedItems.includes(threat.id);
    
    return (
      <div
        key={threat.id}
        className={`p-4 border rounded-lg transition-colors ${
          isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
        } ${severity.color.includes('red') ? 'border-l-4 border-l-red-500' : ''}`}
      >
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => {
              if (e.target.checked) {
                setSelectedItems(prev => [...prev, threat.id]);
              } else {
                setSelectedItems(prev => prev.filter(id => id !== threat.id));
              }
            }}
            className="mt-1"
          />
          
          <div className={`p-2 rounded-full ${severity.color}`}>
            {severity.icon}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-gray-900">{threat.title}</h4>
              <div className="flex items-center gap-2">
                <Badge className={severity.color}>
                  {severity.name}
                </Badge>
                <Badge variant="outline">
                  {threatType.name}
                </Badge>
                <span className="text-xs text-gray-500">
                  {new Date(threat.detectedAt).toLocaleString('pt-BR')}
                </span>
              </div>
            </div>
            
            <p className="text-sm text-gray-600 mb-3">{threat.description}</p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-gray-500 mb-3">
              <div>
                <span className="font-medium">IP de Origem:</span>
                <br />
                {threat.sourceIp}
              </div>
              <div>
                <span className="font-medium">País:</span>
                <br />
                {threat.country || 'Desconhecido'}
              </div>
              <div>
                <span className="font-medium">Tentativas:</span>
                <br />
                {threat.attempts || 1}
              </div>
              <div>
                <span className="font-medium">Status:</span>
                <br />
                <Badge variant={
                  threat.status === 'blocked' ? 'destructive' :
                  threat.status === 'resolved' ? 'default' :
                  threat.status === 'false_positive' ? 'secondary' : 'outline'
                }>
                  {threat.status === 'blocked' ? 'Bloqueado' :
                   threat.status === 'resolved' ? 'Resolvido' :
                   threat.status === 'false_positive' ? 'Falso Positivo' : 'Ativo'}
                </Badge>
              </div>
            </div>
            
            {threat.status === 'active' && (
              <div className="flex gap-2">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => blockThreat(threat.id)}
                >
                  <Lock className="h-3 w-3 mr-1" />
                  Bloquear
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => markAsFalsePositive(threat.id)}
                >
                  <XCircle className="h-3 w-3 mr-1" />
                  Falso Positivo
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // Implementar detalhes da ameaça
                  }}
                >
                  <Eye className="h-3 w-3 mr-1" />
                  Detalhes
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  /**
   * RENDERIZAR LOG DE SEGURANÇA
   */
  const renderSecurityLog = (log) => {
    const severity = severityLevels[log.level] || severityLevels.info;
    
    return (
      <div key={log.id} className="p-3 border-b border-gray-100 hover:bg-gray-50">
        <div className="flex items-start gap-3">
          <div className={`p-1 rounded ${severity.color}`}>
            {severity.icon}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <span className="font-medium text-sm">{log.event}</span>
              <span className="text-xs text-gray-500">
                {new Date(log.timestamp).toLocaleString('pt-BR')}
              </span>
            </div>
            
            <p className="text-sm text-gray-600 mb-1">{log.message}</p>
            
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span>IP: {log.sourceIp}</span>
              <span>Usuário: {log.userId || 'Sistema'}</span>
              <span>Ação: {log.action}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  /**
   * FILTRAR AMEAÇAS
   */
  const filteredThreats = threats.filter(threat => {
    const matchesSearch = threat.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         threat.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         threat.sourceIp.includes(searchTerm);
    
    const matchesSeverity = filters.severity === 'all' || threat.severity === filters.severity;
    const matchesType = filters.type === 'all' || threat.type === filters.type;
    const matchesStatus = filters.status === 'all' || threat.status === filters.status;
    
    return matchesSearch && matchesSeverity && matchesType && matchesStatus;
  });

  /**
   * OBTER ESTATÍSTICAS
   */
  const getStats = () => {
    const total = threats.length;
    const active = threats.filter(t => t.status === 'active').length;
    const blocked = threats.filter(t => t.status === 'blocked').length;
    const critical = threats.filter(t => t.severity === 'critical').length;
    
    return { total, active, blocked, critical };
  };

  const stats = getStats();

  /**
   * CONFIGURAR COMPONENTE
   */
  useEffect(() => {
    loadSecurityData();
    
    const cleanup = setupRealTimeMonitoring();
    return cleanup;
  }, [filters.timeRange, realTimeEnabled]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Shield className="h-8 w-8 text-blue-600" />
                Centro de Segurança
              </h1>
              <p className="text-gray-600 mt-2">
                Monitoramento e proteção em tempo real
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setRealTimeEnabled(!realTimeEnabled)}
              >
                {realTimeEnabled ? (
                  <>
                    <Bell className="h-4 w-4 mr-2 text-green-600" />
                    Monitoramento Ativo
                  </>
                ) : (
                  <>
                    <BellOff className="h-4 w-4 mr-2 text-gray-600" />
                    Monitoramento Inativo
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => runSecurityScan('quick')}
                disabled={loading}
              >
                <Scan className="h-4 w-4 mr-2" />
                Scan Rápido
              </Button>
              <Button
                onClick={() => runSecurityScan('full')}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Executando...
                  </>
                ) : (
                  <>
                    <Shield className="h-4 w-4 mr-2" />
                    Scan Completo
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Métricas de Segurança */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total de Ameaças</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <Shield className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Ameaças Ativas</p>
                  <p className="text-2xl font-bold text-red-600">{stats.active}</p>
                </div>
                <ShieldAlert className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Bloqueadas</p>
                  <p className="text-2xl font-bold text-green-600">{stats.blocked}</p>
                </div>
                <ShieldCheck className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Críticas</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.critical}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs de Segurança */}
        <Tabs defaultValue="threats" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="threats">Ameaças</TabsTrigger>
            <TabsTrigger value="logs">Logs</TabsTrigger>
            <TabsTrigger value="firewall">Firewall</TabsTrigger>
            <TabsTrigger value="settings">Configurações</TabsTrigger>
          </TabsList>

          <TabsContent value="threats" className="space-y-6">
            {/* Filtros */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Buscar ameaças..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <select
                      value={filters.severity}
                      onChange={(e) => setFilters(prev => ({ ...prev, severity: e.target.value }))}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">Todas as Severidades</option>
                      <option value="critical">Crítico</option>
                      <option value="high">Alto</option>
                      <option value="medium">Médio</option>
                      <option value="low">Baixo</option>
                    </select>

                    <select
                      value={filters.type}
                      onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">Todos os Tipos</option>
                      <option value="malware">Malware</option>
                      <option value="phishing">Phishing</option>
                      <option value="bruteforce">Força Bruta</option>
                      <option value="ddos">DDoS</option>
                      <option value="intrusion">Intrusão</option>
                    </select>

                    <select
                      value={filters.status}
                      onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">Todos os Status</option>
                      <option value="active">Ativo</option>
                      <option value="blocked">Bloqueado</option>
                      <option value="resolved">Resolvido</option>
                    </select>
                  </div>
                </div>

                {selectedItems.length > 0 && (
                  <div className="flex items-center gap-3 mt-4 pt-4 border-t">
                    <span className="text-sm text-gray-600">
                      {selectedItems.length} selecionadas
                    </span>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        selectedItems.forEach(id => blockThreat(id));
                        setSelectedItems([]);
                      }}
                    >
                      <Lock className="h-3 w-3 mr-1" />
                      Bloquear Todas
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        selectedItems.forEach(id => markAsFalsePositive(id));
                        setSelectedItems([]);
                      }}
                    >
                      <XCircle className="h-3 w-3 mr-1" />
                      Marcar como Falso Positivo
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Lista de Ameaças */}
            <div className="space-y-4">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-2">Carregando ameaças...</span>
                </div>
              ) : filteredThreats.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <ShieldCheck className="h-16 w-16 text-green-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Nenhuma ameaça encontrada
                    </h3>
                    <p className="text-gray-500">
                      {searchTerm || Object.values(filters).some(f => f !== 'all') 
                        ? 'Tente ajustar os filtros de busca'
                        : 'Sistema seguro - nenhuma ameaça detectada'
                      }
                    </p>
                  </CardContent>
                </Card>
              ) : (
                filteredThreats.map(renderThreat)
              )}
            </div>
          </TabsContent>

          <TabsContent value="logs">
            <Card>
              <CardHeader>
                <CardTitle>Logs de Segurança</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="max-h-96 overflow-y-auto">
                  {logs.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>Nenhum log disponível</p>
                    </div>
                  ) : (
                    logs.map(renderSecurityLog)
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="firewall">
            <Card>
              <CardContent className="p-12 text-center">
                <Network className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Configurações de Firewall
                </h3>
                <p className="text-gray-500">
                  Configurações de firewall serão implementadas aqui
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardContent className="p-12 text-center">
                <Settings className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Configurações de Segurança
                </h3>
                <p className="text-gray-500">
                  Configurações de segurança serão implementadas aqui
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SecurityCenter;
