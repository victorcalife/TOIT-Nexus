/**
 * PÁGINA DE TESTES DE SEGURANÇA E PENETRAÇÃO
 * Sistema completo de validação de segurança e proteções
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
  Shield,
  Lock,
  Key,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  EyeOff,
  Zap,
  Bug,
  Skull,
  Target,
  Scan,
  Database,
  Globe,
  Server,
  FileText,
  Activity,
  RefreshCw,
  Play,
  Pause,
  Square,
  Settings,
  Download,
  Upload,
  Search,
  Filter,
  Clock,
  BarChart3,
  TrendingUp,
  Users,
  Wifi,
  HardDrive,
  Cpu
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/use-toast';

const SECURITY_CATEGORIES = {
  AUTHENTICATION: 'authentication',
  AUTHORIZATION: 'authorization',
  INPUT_VALIDATION: 'input_validation',
  SESSION_MANAGEMENT: 'session_management',
  CRYPTOGRAPHY: 'cryptography',
  ERROR_HANDLING: 'error_handling',
  LOGGING: 'logging',
  DATA_PROTECTION: 'data_protection',
  COMMUNICATION: 'communication',
  CONFIGURATION: 'configuration'
};

const VULNERABILITY_SEVERITY = {
  CRITICAL: 'critical',
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
  INFO: 'info'
};

const SEVERITY_COLORS = {
  critical: 'bg-red-100 text-red-800',
  high: 'bg-orange-100 text-orange-800',
  medium: 'bg-yellow-100 text-yellow-800',
  low: 'bg-blue-100 text-blue-800',
  info: 'bg-gray-100 text-gray-800'
};

const SECURITY_TESTS = [
  {
    id: 'sql_injection',
    name: 'SQL Injection',
    category: SECURITY_CATEGORIES.INPUT_VALIDATION,
    severity: VULNERABILITY_SEVERITY.CRITICAL,
    description: 'Teste de injeção SQL em formulários e APIs',
    automated: true
  },
  {
    id: 'xss_attacks',
    name: 'Cross-Site Scripting (XSS)',
    category: SECURITY_CATEGORIES.INPUT_VALIDATION,
    severity: VULNERABILITY_SEVERITY.HIGH,
    description: 'Teste de ataques XSS em campos de entrada',
    automated: true
  },
  {
    id: 'csrf_protection',
    name: 'CSRF Protection',
    category: SECURITY_CATEGORIES.SESSION_MANAGEMENT,
    severity: VULNERABILITY_SEVERITY.HIGH,
    description: 'Validação de proteção contra CSRF',
    automated: true
  },
  {
    id: 'auth_bypass',
    name: 'Authentication Bypass',
    category: SECURITY_CATEGORIES.AUTHENTICATION,
    severity: VULNERABILITY_SEVERITY.CRITICAL,
    description: 'Tentativas de bypass de autenticação',
    automated: true
  },
  {
    id: 'privilege_escalation',
    name: 'Privilege Escalation',
    category: SECURITY_CATEGORIES.AUTHORIZATION,
    severity: VULNERABILITY_SEVERITY.HIGH,
    description: 'Teste de escalação de privilégios',
    automated: true
  },
  {
    id: 'session_hijacking',
    name: 'Session Hijacking',
    category: SECURITY_CATEGORIES.SESSION_MANAGEMENT,
    severity: VULNERABILITY_SEVERITY.HIGH,
    description: 'Teste de sequestro de sessão',
    automated: false
  },
  {
    id: 'data_exposure',
    name: 'Sensitive Data Exposure',
    category: SECURITY_CATEGORIES.DATA_PROTECTION,
    severity: VULNERABILITY_SEVERITY.MEDIUM,
    description: 'Exposição de dados sensíveis',
    automated: true
  },
  {
    id: 'weak_crypto',
    name: 'Weak Cryptography',
    category: SECURITY_CATEGORIES.CRYPTOGRAPHY,
    severity: VULNERABILITY_SEVERITY.MEDIUM,
    description: 'Validação de algoritmos criptográficos',
    automated: true
  },
  {
    id: 'insecure_communication',
    name: 'Insecure Communication',
    category: SECURITY_CATEGORIES.COMMUNICATION,
    severity: VULNERABILITY_SEVERITY.MEDIUM,
    description: 'Comunicação insegura (HTTP, TLS fraco)',
    automated: true
  },
  {
    id: 'security_misconfiguration',
    name: 'Security Misconfiguration',
    category: SECURITY_CATEGORIES.CONFIGURATION,
    severity: VULNERABILITY_SEVERITY.MEDIUM,
    description: 'Configurações de segurança inadequadas',
    automated: true
  }
];

export default function SecurityTestsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedTest, setSelectedTest] = useState(null);
  const [scanStatus, setScanStatus] = useState('idle');
  const [runningTests, setRunningTests] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterSeverity, setFilterSeverity] = useState('all');

  // Query para resultados de segurança
  const { data: securityResultsData, isLoading } = useQuery({
    queryKey: ['security-results'],
    queryFn: async () => {
      const response = await fetch('/api/security/scan-results', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao carregar resultados de segurança');
      }

      return response.json();
    },
    enabled: !!user
  });

  // Query para vulnerabilidades
  const { data: vulnerabilitiesData } = useQuery({
    queryKey: ['vulnerabilities'],
    queryFn: async () => {
      const response = await fetch('/api/security/vulnerabilities', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao carregar vulnerabilidades');
      }

      return response.json();
    },
    enabled: !!user
  });

  // Query para configurações de segurança
  const { data: securityConfigData } = useQuery({
    queryKey: ['security-config'],
    queryFn: async () => {
      const response = await fetch('/api/security/config', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao carregar configurações');
      }

      return response.json();
    },
    enabled: !!user
  });

  // Mutation para executar teste de segurança
  const runSecurityTestMutation = useMutation({
    mutationFn: async (testId) => {
      const response = await fetch('/api/security/run-test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({ testId })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao executar teste de segurança');
      }

      return response.json();
    },
    onSuccess: (data, testId) => {
      setRunningTests(prev => {
        const newSet = new Set(prev);
        newSet.delete(testId);
        return newSet;
      });
      queryClient.invalidateQueries(['security-results']);
      queryClient.invalidateQueries(['vulnerabilities']);
      
      if (data.vulnerabilitiesFound > 0) {
        toast({
          title: 'Vulnerabilidades encontradas',
          description: `${data.vulnerabilitiesFound} vulnerabilidades detectadas.`,
          variant: 'destructive'
        });
      } else {
        toast({
          title: 'Teste concluído',
          description: 'Nenhuma vulnerabilidade encontrada.'
        });
      }
    },
    onError: (error, testId) => {
      setRunningTests(prev => {
        const newSet = new Set(prev);
        newSet.delete(testId);
        return newSet;
      });
      toast({
        title: 'Erro no teste',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  // Mutation para scan completo
  const runFullScanMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/security/full-scan', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao executar scan completo');
      }

      return response.json();
    },
    onSuccess: (data) => {
      setScanStatus('completed');
      toast({
        title: 'Scan completo finalizado',
        description: `${data.totalTests} testes executados, ${data.vulnerabilitiesFound} vulnerabilidades encontradas.`
      });
      queryClient.invalidateQueries(['security-results']);
      queryClient.invalidateQueries(['vulnerabilities']);
    },
    onError: (error) => {
      setScanStatus('failed');
      toast({
        title: 'Erro no scan',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  const results = securityResultsData?.data || {};
  const vulnerabilities = vulnerabilitiesData?.data?.vulnerabilities || [];
  const securityConfig = securityConfigData?.data || {};

  const runSecurityTest = (testId) => {
    setRunningTests(prev => new Set(prev).add(testId));
    runSecurityTestMutation.mutate(testId);
  };

  const runFullScan = () => {
    setScanStatus('running');
    runFullScanMutation.mutate();
  };

  const getVulnerabilityStats = () => {
    const stats = {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
      info: 0,
      total: vulnerabilities.length
    };

    vulnerabilities.forEach(vuln => {
      stats[vuln.severity]++;
    });

    return stats;
  };

  const getSecurityScore = () => {
    const stats = getVulnerabilityStats();
    const totalTests = SECURITY_TESTS.length;
    const passedTests = totalTests - stats.total;
    
    if (totalTests === 0) return 100;
    
    let score = (passedTests / totalTests) * 100;
    
    // Penalizar por severidade
    score -= stats.critical * 20;
    score -= stats.high * 10;
    score -= stats.medium * 5;
    score -= stats.low * 2;
    
    return Math.max(0, Math.round(score));
  };

  const filteredTests = SECURITY_TESTS.filter(test => {
    const matchesSearch = test.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      test.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || test.category === filterCategory;
    const matchesSeverity = filterSeverity === 'all' || test.severity === filterSeverity;
    
    return matchesSearch && matchesCategory && matchesSeverity;
  });

  const stats = getVulnerabilityStats();
  const securityScore = getSecurityScore();

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
            <Shield className="w-8 h-8 mr-3 text-blue-600" />
            Testes de Segurança
          </h1>
          <p className="text-gray-600">
            Validação de segurança e testes de penetração
          </p>
        </div>
        
        <div className="flex space-x-2">
          <Button
            onClick={runFullScan}
            disabled={scanStatus === 'running' || runFullScanMutation.isLoading}
            className="flex items-center space-x-2"
          >
            {scanStatus === 'running' ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Scan className="w-4 h-4" />
            )}
            <span>Scan Completo</span>
          </Button>
          
          <Button variant="outline" className="flex items-center space-x-2">
            <Download className="w-4 h-4" />
            <span>Relatório</span>
          </Button>
        </div>
      </div>

      {/* Security Score */}
      <Card className={`mb-8 border-2 ${
        securityScore >= 90 ? 'border-green-200 bg-green-50' :
        securityScore >= 70 ? 'border-yellow-200 bg-yellow-50' :
        'border-red-200 bg-red-50'
      }`}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={`p-4 rounded-full ${
                securityScore >= 90 ? 'bg-green-100' :
                securityScore >= 70 ? 'bg-yellow-100' : 'bg-red-100'
              }`}>
                <Shield className={`w-8 h-8 ${
                  securityScore >= 90 ? 'text-green-600' :
                  securityScore >= 70 ? 'text-yellow-600' : 'text-red-600'
                }`} />
              </div>
              <div>
                <h3 className="text-2xl font-bold">Score de Segurança: {securityScore}/100</h3>
                <p className={`${
                  securityScore >= 90 ? 'text-green-700' :
                  securityScore >= 70 ? 'text-yellow-700' : 'text-red-700'
                }`}>
                  {securityScore >= 90 ? 'Excelente segurança' :
                   securityScore >= 70 ? 'Segurança adequada' : 'Requer atenção imediata'}
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-5 gap-4 text-center">
              <div>
                <p className="text-sm text-red-600">Críticas</p>
                <p className="text-2xl font-bold text-red-600">{stats.critical}</p>
              </div>
              <div>
                <p className="text-sm text-orange-600">Altas</p>
                <p className="text-2xl font-bold text-orange-600">{stats.high}</p>
              </div>
              <div>
                <p className="text-sm text-yellow-600">Médias</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.medium}</p>
              </div>
              <div>
                <p className="text-sm text-blue-600">Baixas</p>
                <p className="text-2xl font-bold text-blue-600">{stats.low}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Info</p>
                <p className="text-2xl font-bold text-gray-600">{stats.info}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Testes Executados</p>
                <p className="text-2xl font-bold text-blue-600">
                  {results.totalTests || 0}
                </p>
              </div>
              <Target className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Vulnerabilidades</p>
                <p className="text-2xl font-bold text-red-600">
                  {stats.total}
                </p>
              </div>
              <Bug className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Último Scan</p>
                <p className="text-2xl font-bold text-purple-600">
                  {results.lastScan ? new Date(results.lastScan).toLocaleDateString('pt-BR') : 'Nunca'}
                </p>
              </div>
              <Clock className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Proteções Ativas</p>
                <p className="text-2xl font-bold text-green-600">
                  {securityConfig.activeProtections || 0}
                </p>
              </div>
              <Shield className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="tests">Testes</TabsTrigger>
          <TabsTrigger value="vulnerabilities">Vulnerabilidades</TabsTrigger>
          <TabsTrigger value="config">Configurações</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Distribuição por Categoria</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(SECURITY_CATEGORIES).map(([key, category]) => {
                    const categoryVulns = vulnerabilities.filter(v => v.category === category).length;
                    const categoryTests = SECURITY_TESTS.filter(t => t.category === category).length;
                    const percentage = categoryTests > 0 ? ((categoryTests - categoryVulns) / categoryTests) * 100 : 100;
                    
                    return (
                      <div key={key} className="flex items-center justify-between">
                        <span className="font-medium capitalize">{category.replace('_', ' ')}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${
                                percentage >= 90 ? 'bg-green-600' :
                                percentage >= 70 ? 'bg-yellow-600' : 'bg-red-600'
                              }`}
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-600">
                            {categoryVulns}/{categoryTests}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Vulnerabilidades Críticas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {vulnerabilities
                    .filter(v => v.severity === 'critical' || v.severity === 'high')
                    .slice(0, 5)
                    .map(vuln => (
                      <div key={vuln.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <AlertTriangle className={`w-5 h-5 ${
                            vuln.severity === 'critical' ? 'text-red-600' : 'text-orange-600'
                          }`} />
                          <div>
                            <p className="font-medium">{vuln.title}</p>
                            <p className="text-sm text-gray-600">{vuln.description}</p>
                          </div>
                        </div>
                        <Badge className={SEVERITY_COLORS[vuln.severity]}>
                          {vuln.severity}
                        </Badge>
                      </div>
                    ))}
                  
                  {vulnerabilities.filter(v => v.severity === 'critical' || v.severity === 'high').length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-400" />
                      <p>Nenhuma vulnerabilidade crítica encontrada</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tests" className="mt-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar testes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="all">Todas as categorias</option>
                {Object.entries(SECURITY_CATEGORIES).map(([key, category]) => (
                  <option key={key} value={category}>
                    {category.replace('_', ' ')}
                  </option>
                ))}
              </select>
              
              <select
                value={filterSeverity}
                onChange={(e) => setFilterSeverity(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="all">Todas as severidades</option>
                {Object.entries(VULNERABILITY_SEVERITY).map(([key, severity]) => (
                  <option key={key} value={severity}>
                    {severity}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-4">
            {filteredTests.map(test => (
              <Card key={test.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-semibold">{test.name}</h3>
                        <Badge className={SEVERITY_COLORS[test.severity]}>
                          {test.severity}
                        </Badge>
                        <Badge variant="outline">
                          {test.category.replace('_', ' ')}
                        </Badge>
                        {test.automated && (
                          <Badge variant="secondary">Automatizado</Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{test.description}</p>
                    </div>
                    
                    <Button
                      onClick={() => runSecurityTest(test.id)}
                      disabled={runningTests.has(test.id) || runSecurityTestMutation.isLoading}
                      className="ml-4"
                    >
                      {runningTests.has(test.id) ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <Play className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="vulnerabilities" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Vulnerabilidades Encontradas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {vulnerabilities.map(vuln => (
                  <div key={vuln.id} className="flex items-start justify-between p-4 border rounded-lg">
                    <div className="flex items-start space-x-3">
                      <AlertTriangle className={`w-5 h-5 mt-1 ${
                        vuln.severity === 'critical' ? 'text-red-600' :
                        vuln.severity === 'high' ? 'text-orange-600' :
                        vuln.severity === 'medium' ? 'text-yellow-600' :
                        vuln.severity === 'low' ? 'text-blue-600' : 'text-gray-600'
                      }`} />
                      <div className="flex-1">
                        <h4 className="font-medium">{vuln.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{vuln.description}</p>
                        {vuln.recommendation && (
                          <p className="text-sm text-blue-600 mt-2">
                            <strong>Recomendação:</strong> {vuln.recommendation}
                          </p>
                        )}
                        <div className="flex items-center space-x-4 mt-3 text-xs text-gray-500">
                          <span>Categoria: {vuln.category}</span>
                          <span>Encontrado em: {new Date(vuln.found_at).toLocaleString('pt-BR')}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Badge className={SEVERITY_COLORS[vuln.severity]}>
                        {vuln.severity}
                      </Badge>
                      <Button size="sm" variant="outline">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                
                {vulnerabilities.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Shield className="w-12 h-12 mx-auto mb-4 text-green-400" />
                    <p>Nenhuma vulnerabilidade encontrada</p>
                    <p className="text-sm">Sistema seguro!</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="config" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Configurações de Segurança</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">HTTPS Obrigatório</span>
                    <Badge className={securityConfig.httpsEnforced ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                      {securityConfig.httpsEnforced ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Proteção CSRF</span>
                    <Badge className={securityConfig.csrfProtection ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                      {securityConfig.csrfProtection ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Rate Limiting</span>
                    <Badge className={securityConfig.rateLimiting ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                      {securityConfig.rateLimiting ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Validação de Input</span>
                    <Badge className={securityConfig.inputValidation ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                      {securityConfig.inputValidation ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Logs de Segurança</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p>Logs de segurança</p>
                  <p className="text-sm">Em desenvolvimento</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
