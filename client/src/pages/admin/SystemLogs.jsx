/**
 * Página de Logs do Sistema - Administração
 * Sistema TOIT Nexus - Módulo Administrador
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import {  
  FileText, 
  Search, 
  Filter, 
  Download, 
  RefreshCw, 
  AlertTriangle, 
  Info, 
  CheckCircle, 
  XCircle, 
  Clock, 
  User, 
  Server, 
  Database, 
  Shield, 
  Mail, 
  Bell, 
  Globe, 
  Zap, 
  Eye, 
  Calendar, 
  ChevronDown, 
  ChevronUp, 
  Trash2, 
  Archive, 
  ExternalLink, 
  Copy, 
  MoreHorizontal,
  Activity,
  Bug,
  Cpu,
  HardDrive,
  Network,
  Lock,
  Unlock,
  UserCheck,
  UserX,
  LogIn,
  LogOut,
  Settings,
  Code,
  Terminal,
  Smartphone,
  Monitor,
  Wifi,
  WifiOff
} from 'lucide-react';
import { toast } from 'sonner';

const SystemLogs = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [expandedLogs, setExpandedLogs] = useState(new Set());
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(null);
  
  // Dados simulados de logs
  const [logs, setLogs] = useState([
    {
      id: 1,
      timestamp: '2024-01-15 14:30:25',
      level: 'error',
      category: 'authentication',
      message: 'Falha na autenticação do usuário',
      details: 'Tentativa de login com credenciais inválidas para o usuário: admin@empresa.com',
      source: 'AuthService',
      ip: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      userId: 'user_123',
      sessionId: 'sess_abc123',
      stackTrace: 'AuthenticationError: Invalid credentials\n    at AuthService.authenticate (auth.js:45)\n    at LoginController.login (login.js:23)'
    },
    {
      id: 2,
      timestamp: '2024-01-15 14:28:15',
      level: 'warning',
      category: 'performance',
      message: 'Query lenta detectada',
      details: 'Query executada em 5.2 segundos: SELECT * FROM users WHERE tenant_id = 123',
      source: 'DatabaseService',
      ip: '192.168.1.50',
      userAgent: 'Internal Service',
      userId: null,
      sessionId: null,
      stackTrace: null
    },
    {
      id: 3,
      timestamp: '2024-01-15 14:25:10',
      level: 'info',
      category: 'user_activity',
      message: 'Usuário logado com sucesso',
      details: 'Login realizado com sucesso para o usuário: joao.silva@empresa.com',
      source: 'AuthService',
      ip: '192.168.1.75',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      userId: 'user_456',
      sessionId: 'sess_def456',
      stackTrace: null
    },
    {
      id: 4,
      timestamp: '2024-01-15 14:20:05',
      level: 'error',
      category: 'system',
      message: 'Falha na conexão com o banco de dados',
      details: 'Timeout na conexão com PostgreSQL após 30 segundos',
      source: 'DatabaseConnection',
      ip: '192.168.1.10',
      userAgent: 'Internal Service',
      userId: null,
      sessionId: null,
      stackTrace: 'ConnectionTimeoutError: Connection timeout\n    at Pool.connect (pool.js:123)\n    at Database.query (db.js:67)'
    },
    {
      id: 5,
      timestamp: '2024-01-15 14:15:30',
      level: 'info',
      category: 'api',
      message: 'Requisição API processada',
      details: 'GET /api/v1/users - Status: 200 - Tempo: 245ms',
      source: 'APIGateway',
      ip: '192.168.1.200',
      userAgent: 'PostmanRuntime/7.32.3',
      userId: 'user_789',
      sessionId: 'sess_ghi789',
      stackTrace: null
    },
    {
      id: 6,
      timestamp: '2024-01-15 14:10:45',
      level: 'warning',
      category: 'security',
      message: 'Múltiplas tentativas de login falharam',
      details: 'IP 192.168.1.999 tentou fazer login 5 vezes em 2 minutos',
      source: 'SecurityService',
      ip: '192.168.1.999',
      userAgent: 'curl/7.68.0',
      userId: null,
      sessionId: null,
      stackTrace: null
    },
    {
      id: 7,
      timestamp: '2024-01-15 14:05:20',
      level: 'success',
      category: 'backup',
      message: 'Backup automático concluído',
      details: 'Backup do banco de dados realizado com sucesso - Tamanho: 2.5GB',
      source: 'BackupService',
      ip: '192.168.1.10',
      userAgent: 'Internal Service',
      userId: null,
      sessionId: null,
      stackTrace: null
    },
    {
      id: 8,
      timestamp: '2024-01-15 14:00:15',
      level: 'info',
      category: 'email',
      message: 'E-mail enviado com sucesso',
      details: 'E-mail de boas-vindas enviado para: novo.usuario@empresa.com',
      source: 'EmailService',
      ip: '192.168.1.30',
      userAgent: 'Internal Service',
      userId: 'user_101',
      sessionId: null,
      stackTrace: null
    }
  ]);

  const tabs = [
    { id: 'all', label: 'Todos', icon: FileText },
    { id: 'error', label: 'Erros', icon: XCircle },
    { id: 'warning', label: 'Avisos', icon: AlertTriangle },
    { id: 'info', label: 'Informações', icon: Info },
    { id: 'success', label: 'Sucessos', icon: CheckCircle }
  ];

  const categories = [
    { value: 'all', label: 'Todas as Categorias' },
    { value: 'authentication', label: 'Autenticação' },
    { value: 'user_activity', label: 'Atividade do Usuário' },
    { value: 'api', label: 'API' },
    { value: 'system', label: 'Sistema' },
    { value: 'database', label: 'Banco de Dados' },
    { value: 'security', label: 'Segurança' },
    { value: 'performance', label: 'Performance' },
    { value: 'backup', label: 'Backup' },
    { value: 'email', label: 'E-mail' }
  ];

  const getLevelIcon = (level) => {
    switch (level) {
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'info':
        return <Info className="h-4 w-4 text-blue-500" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <Info className="h-4 w-4 text-gray-500" />;
    }
  };

  const getLevelBadge = (level) => {
    const variants = {
      error: 'bg-red-100 text-red-800',
      warning: 'bg-yellow-100 text-yellow-800',
      info: 'bg-blue-100 text-blue-800',
      success: 'bg-green-100 text-green-800'
    };
    
    return (
      <Badge className={`${variants[level] || 'bg-gray-100 text-gray-800'} capitalize`}>
        {level}
      </Badge>
    );
  };

  const getCategoryIcon = (category) => {
    const icons = {
      authentication: <Lock className="h-4 w-4" />,
      user_activity: <User className="h-4 w-4" />,
      api: <Code className="h-4 w-4" />,
      system: <Server className="h-4 w-4" />,
      database: <Database className="h-4 w-4" />,
      security: <Shield className="h-4 w-4" />,
      performance: <Zap className="h-4 w-4" />,
      backup: <Archive className="h-4 w-4" />,
      email: <Mail className="h-4 w-4" />
    };
    
    return icons[category] || <FileText className="h-4 w-4" />;
  };

  const filteredLogs = logs.filter(log => {
    const matchesTab = activeTab === 'all' || log.level === activeTab;
    const matchesSearch = log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.source.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = selectedLevel === 'all' || log.level === selectedLevel;
    const matchesCategory = selectedCategory === 'all' || log.category === selectedCategory;
    
    return matchesTab && matchesSearch && matchesLevel && matchesCategory;
  });

  const toggleLogExpansion = (logId) => {
    const newExpanded = new Set(expandedLogs);
    if (newExpanded.has(logId)) {
      newExpanded.delete(logId);
    } else {
      newExpanded.add(logId);
    }
    setExpandedLogs(newExpanded);
  };

  const handleRefreshLogs = () => {
    setIsLoading(true);
    setTimeout(() => {
      toast.success('Logs atualizados com sucesso!');
      setIsLoading(false);
    }, 1000);
  };

  const handleExportLogs = () => {
    const dataStr = JSON.stringify(filteredLogs, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `system-logs-${new Date().toISOString().split('T')[0]}.json`;



    link.click();
    toast.success('Logs exportados com sucesso!');
  };

  const handleClearLogs = () => {
    if (window.confirm('Tem certeza que deseja limpar todos os logs? Esta ação não pode ser desfeita.')) {
      setLogs([]);
      toast.success('Logs limpos com sucesso!');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copiado para a área de transferência!');
  };

  const toggleAutoRefresh = () => {
    if (autoRefresh) {
      clearInterval(refreshInterval);
      setRefreshInterval(null);
      setAutoRefresh(false);
      toast.info('Atualização automática desabilitada');
    } else {
      const interval = setInterval(handleRefreshLogs, 30000); // 30 segundos
      setRefreshInterval(interval);
      setAutoRefresh(true);
      toast.info('Atualização automática habilitada (30s)');
    }
  };

  useEffect(() => {
    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [refreshInterval]);

  const getLogStats = () => {
    const total = logs.length;
    const errors = logs.filter(log => log.level === 'error').length;
    const warnings = logs.filter(log => log.level === 'warning').length;
    const infos = logs.filter(log => log.level === 'info').length;
    const successes = logs.filter(log => log.level === 'success').length;
    
    return { total, errors, warnings, infos, successes };
  };

  const stats = getLogStats();

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Logs do Sistema</h1>
          <p className="text-gray-600">Monitore e analise os logs de atividade do sistema</p>
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
          <Button variant="outline" onClick={handleRefreshLogs} disabled={isLoading}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>



          <Button variant="outline" onClick={handleClearLogs} className="text-red-600 hover:text-red-700">

        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <FileText className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Erros</p>
                <p className="text-2xl font-bold text-red-600">{stats.errors}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avisos</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.warnings}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Informações</p>
                <p className="text-2xl font-bold text-blue-600">{stats.infos}</p>
              </div>
              <Info className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Sucessos</p>
                <p className="text-2xl font-bold text-green-600">{stats.successes}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar nos logs..."
                  value={searchTerm}
                  onChange=({ (e }) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="min-w-48">
              <select
                value={selectedLevel}
                onChange=({ (e }) => setSelectedLevel(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="all">Todos os Níveis</option>
                <option value="error">Erros</option>
                <option value="warning">Avisos</option>
                <option value="info">Informações</option>
                <option value="success">Sucessos</option>
              </select>
            </div>
            
            <div className="min-w-48">
              <select
                value={selectedCategory}
                onChange=({ (e }) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                {categories.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className="border-b">
        <nav className="flex space-x-8">
          ({ tabs.map((tab }) => {
            const Icon = tab.icon;
            const count = tab.id === 'all' ? stats.total : stats[tab.id + 's'] || 0;
            return (
              <button
                key={tab.id}
                onClick=({ ( }) => setActiveTab(tab.id)}`
                className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'`}
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
                <Badge variant="secondary" className="ml-1">{count}</Badge>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Logs List */}
      <div className="space-y-2">
        ({ filteredLogs.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Nenhum log encontrado com os filtros aplicados.</p>
            </CardContent>
          </Card>
        ) : (
          filteredLogs.map((log }) => (
            <Card key={log.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    {getLevelIcon(log.level)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getLevelBadge(log.level)}
                        <Badge variant="outline" className="flex items-center gap-1">
                          {getCategoryIcon(log.category)}
                          {log.category.replace('_', ' ')}
                        </Badge>
                        <span className="text-sm text-gray-500 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {log.timestamp}
                        </span>
                        <span className="text-sm text-gray-500">
                          {log.source}
                        </span>
                      </div>
                      
                      <h3 className="font-medium text-gray-900 mb-1">{log.message}</h3>
                      <p className="text-sm text-gray-600 mb-2">{log.details}</p>
                      
                      {log.ip && (
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Globe className="h-3 w-3" />
                            IP: {log.ip}
                          </span>
                          {log.userId && (
                            <span className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              User: {log.userId}
                            </span>
                          )}
                          {log.sessionId && (
                            <span className="flex items-center gap-1">
                              <Terminal className="h-3 w-3" />
                              Session: {log.sessionId}
                            </span>
                          )}
                        </div>
                      )}
                      
                      {expandedLogs.has(log.id) && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-md">
                          {log.userAgent && (
                            <div className="mb-2">
                              <span className="text-xs font-medium text-gray-700">User Agent:</span>
                              <p className="text-xs text-gray-600 mt-1">{log.userAgent}</p>
                            </div>
                          )}
                          
                          {log.stackTrace && (
                            <div>
                              <span className="text-xs font-medium text-gray-700">Stack Trace:</span>
                              <pre className="text-xs text-gray-600 mt-1 whitespace-pre-wrap bg-gray-100 p-2 rounded">
                                {log.stackTrace}
                              </pre>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1 ml-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick=({ ( }) => copyToClipboard(JSON.stringify(log, null, 2))}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick=({ ( }) => toggleLogExpansion(log.id)}
                    >
                      {expandedLogs.has(log.id) ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Pagination */}
      {filteredLogs.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-700">
            Mostrando {filteredLogs.length} de {logs.length} logs
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled>

            <Button variant="outline" size="sm" disabled>
              Próximo
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SystemLogs;`