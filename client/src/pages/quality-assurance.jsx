/**
 * SISTEMA QUALITY ASSURANCE COMPLETO - TOIT NEXUS
 * Sistema completo de controle de qualidade
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
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Target,
  Award,
  Star,
  Flag,
  Bug,
  TestTube,
  Microscope,
  ClipboardCheck,
  ClipboardList,
  FileCheck,
  FileX,
  FileText,
  BarChart3,
  PieChart,
  LineChart,
  TrendingUp,
  TrendingDown,
  Activity,
  Zap,
  User,
  Users,
  Calendar,
  Tag,
  Hash,
  Search,
  Filter,
  Plus,
  Minus,
  Edit,
  Trash2,
  Eye,
  Download,
  Upload,
  RefreshCw,
  Settings,
  Bell,
  Archive,
  Share,
  Copy,
  Move,
  Link,
  ExternalLink,
  MoreHorizontal,
  ChevronRight,
  ChevronDown,
  ArrowUp,
  ArrowDown,
  Play,
  Pause,
  Square,
  RotateCcw,
  FastForward,
  SkipForward,
  Globe,
  Lock,
  Unlock,
  Key,
  Database,
  Server,
  Cloud,
  Smartphone,
  Monitor,
  Mail,
  Phone,
  MapPin,
  Building,
  Briefcase,
  Layers,
  GitBranch,
  GitCommit,
  GitMerge,
  Code,
  Terminal,
  Cpu,
  HardDrive,
  Wifi,
  WifiOff
} from 'lucide-react';

const QualityAssurance = () => {
  const [testCases, setTestCases] = useState([]);
  const [testSuites, setTestSuites] = useState([]);
  const [testRuns, setTestRuns] = useState([]);
  const [defects, setDefects] = useState([]);
  const [requirements, setRequirements] = useState([]);
  const [testPlans, setTestPlans] = useState([]);
  const [metrics, setMetrics] = useState([]);
  const [selectedTestCase, setSelectedTestCase] = useState(null);
  const [showTestCaseModal, setShowTestCaseModal] = useState(false);
  const [showDefectModal, setShowDefectModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    assignee: 'all',
    suite: 'all',
    severity: 'all'
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('testcases');
  
  const { toast } = useToast();

  // Status dos casos de teste
  const testCaseStatuses = {
    draft: { name: 'Rascunho', color: 'text-gray-600 bg-gray-100', icon: <FileText className="h-3 w-3" /> },
    ready: { name: 'Pronto', color: 'text-blue-600 bg-blue-100', icon: <ClipboardCheck className="h-3 w-3" /> },
    in_progress: { name: 'Em Execução', color: 'text-yellow-600 bg-yellow-100', icon: <Play className="h-3 w-3" /> },
    passed: { name: 'Passou', color: 'text-green-600 bg-green-100', icon: <CheckCircle className="h-3 w-3" /> },
    failed: { name: 'Falhou', color: 'text-red-600 bg-red-100', icon: <XCircle className="h-3 w-3" /> },
    blocked: { name: 'Bloqueado', color: 'text-orange-600 bg-orange-100', icon: <AlertTriangle className="h-3 w-3" /> }
  };

  // Prioridades
  const priorities = {
    low: { name: 'Baixa', color: 'text-green-600 bg-green-100' },
    medium: { name: 'Média', color: 'text-yellow-600 bg-yellow-100' },
    high: { name: 'Alta', color: 'text-orange-600 bg-orange-100' },
    critical: { name: 'Crítica', color: 'text-red-600 bg-red-100' }
  };

  // Severidades dos defeitos
  const severities = {
    low: { name: 'Baixa', color: 'text-green-600 bg-green-100' },
    medium: { name: 'Média', color: 'text-yellow-600 bg-yellow-100' },
    high: { name: 'Alta', color: 'text-orange-600 bg-orange-100' },
    critical: { name: 'Crítica', color: 'text-red-600 bg-red-100' }
  };

  // Status dos defeitos
  const defectStatuses = {
    new: { name: 'Novo', color: 'text-blue-600 bg-blue-100', icon: <Bug className="h-3 w-3" /> },
    assigned: { name: 'Atribuído', color: 'text-yellow-600 bg-yellow-100', icon: <User className="h-3 w-3" /> },
    in_progress: { name: 'Em Progresso', color: 'text-purple-600 bg-purple-100', icon: <Activity className="h-3 w-3" /> },
    resolved: { name: 'Resolvido', color: 'text-green-600 bg-green-100', icon: <CheckCircle className="h-3 w-3" /> },
    closed: { name: 'Fechado', color: 'text-gray-600 bg-gray-100', icon: <Archive className="h-3 w-3" /> },
    rejected: { name: 'Rejeitado', color: 'text-red-600 bg-red-100', icon: <XCircle className="h-3 w-3" /> }
  };

  /**
   * CARREGAR DADOS DO QA
   */
  const loadQAData = async () => {
    setLoading(true);
    try {
      const [testCasesRes, testSuitesRes, testRunsRes, defectsRes, requirementsRes, testPlansRes, metricsRes] = await Promise.all([
        fetch('/api/qa/testcases', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('/api/qa/testsuites', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('/api/qa/testruns', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('/api/qa/defects', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('/api/qa/requirements', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('/api/qa/testplans', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('/api/qa/metrics', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        })
      ]);

      if (testCasesRes.ok) {
        const testCasesData = await testCasesRes.json();
        setTestCases(testCasesData.testCases || []);
      }

      if (testSuitesRes.ok) {
        const testSuitesData = await testSuitesRes.json();
        setTestSuites(testSuitesData.testSuites || []);
      }

      if (testRunsRes.ok) {
        const testRunsData = await testRunsRes.json();
        setTestRuns(testRunsData.testRuns || []);
      }

      if (defectsRes.ok) {
        const defectsData = await defectsRes.json();
        setDefects(defectsData.defects || []);
      }

      if (requirementsRes.ok) {
        const requirementsData = await requirementsRes.json();
        setRequirements(requirementsData.requirements || []);
      }

      if (testPlansRes.ok) {
        const testPlansData = await testPlansRes.json();
        setTestPlans(testPlansData.testPlans || []);
      }

      if (metricsRes.ok) {
        const metricsData = await metricsRes.json();
        setMetrics(metricsData.metrics || []);
      }

    } catch (error) {
      console.error('Erro ao carregar dados do QA:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados do QA",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * CRIAR CASO DE TESTE
   */
  const createTestCase = async (testCaseData) => {
    try {
      const response = await fetch('/api/qa/testcases', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...testCaseData,
          status: 'draft',
          createdAt: new Date().toISOString(),
          testCaseId: `TC-${Date.now()}`
        })
      });

      if (!response.ok) {
        throw new Error('Erro ao criar caso de teste');
      }

      const data = await response.json();
      setTestCases(prev => [data.testCase, ...prev]);
      setShowTestCaseModal(false);
      
      toast({
        title: "Caso de teste criado",
        description: `Caso de teste ${data.testCase.testCaseId} criado com sucesso`,
      });
    } catch (error) {
      console.error('Erro ao criar caso de teste:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar o caso de teste",
        variant: "destructive"
      });
    }
  };

  /**
   * EXECUTAR CASO DE TESTE
   */
  const executeTestCase = async (testCaseId, result) => {
    try {
      const response = await fetch(`/api/qa/testcases/${testCaseId}/execute`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          result,
          executedAt: new Date().toISOString()
        })
      });

      if (!response.ok) {
        throw new Error('Erro ao executar caso de teste');
      }

      setTestCases(prev => prev.map(testCase => 
        testCase.id === testCaseId 
          ? { ...testCase, status: result, lastExecuted: new Date().toISOString() }
          : testCase
      ));
      
      toast({
        title: "Caso de teste executado",
        description: `Resultado: ${result === 'passed' ? 'Passou' : 'Falhou'}`,
      });
    } catch (error) {
      console.error('Erro ao executar caso de teste:', error);
      toast({
        title: "Erro",
        description: "Não foi possível executar o caso de teste",
        variant: "destructive"
      });
    }
  };

  /**
   * CRIAR DEFEITO
   */
  const createDefect = async (defectData) => {
    try {
      const response = await fetch('/api/qa/defects', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...defectData,
          status: 'new',
          createdAt: new Date().toISOString(),
          defectId: `DEF-${Date.now()}`
        })
      });

      if (!response.ok) {
        throw new Error('Erro ao criar defeito');
      }

      const data = await response.json();
      setDefects(prev => [data.defect, ...prev]);
      setShowDefectModal(false);
      
      toast({
        title: "Defeito criado",
        description: `Defeito ${data.defect.defectId} criado com sucesso`,
      });
    } catch (error) {
      console.error('Erro ao criar defeito:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar o defeito",
        variant: "destructive"
      });
    }
  };

  /**
   * RENDERIZAR CASO DE TESTE
   */
  const renderTestCase = (testCase) => {
    const status = testCaseStatuses[testCase.status] || testCaseStatuses.draft;
    const priority = priorities[testCase.priority] || priorities.medium;
    const suite = testSuites.find(s => s.id === testCase.suiteId);
    
    return (
      <Card key={testCase.id} className="hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-lg">{testCase.title}</h3>
                <Badge className={priority.color}>
                  {priority.name}
                </Badge>
              </div>
              <p className="text-gray-600 text-sm line-clamp-2">{testCase.description}</p>
              <p className="text-xs text-gray-500 mt-1">{testCase.testCaseId}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={status.color}>
                {status.icon}
                <span className="ml-1">{status.name}</span>
              </Badge>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="space-y-2 mb-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <TestTube className="h-4 w-4" />
              Suite: {suite ? suite.name : 'Não atribuído'}
            </div>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Responsável: {testCase.assignee || 'Não atribuído'}
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Criado em: {new Date(testCase.createdAt).toLocaleDateString('pt-BR')}
            </div>
            {testCase.lastExecuted && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Última execução: {new Date(testCase.lastExecuted).toLocaleDateString('pt-BR')}
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center p-2 bg-gray-50 rounded">
              <div className="text-lg font-bold text-blue-600">{testCase.steps?.length || 0}</div>
              <div className="text-xs text-gray-600">Passos</div>
            </div>
            <div className="text-center p-2 bg-gray-50 rounded">
              <div className="text-lg font-bold text-green-600">{testCase.executions || 0}</div>
              <div className="text-xs text-gray-600">Execuções</div>
            </div>
            <div className="text-center p-2 bg-gray-50 rounded">
              <div className="text-lg font-bold text-orange-600">{testCase.defects || 0}</div>
              <div className="text-xs text-gray-600">Defeitos</div>
            </div>
          </div>
          
          <div className="flex gap-2">
            {testCase.status === 'ready' || testCase.status === 'draft' ? (
              <>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => executeTestCase(testCase.id, 'passed')}
                >
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Passou
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => executeTestCase(testCase.id, 'failed')}
                >
                  <XCircle className="h-3 w-3 mr-1" />
                  Falhou
                </Button>
              </>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => executeTestCase(testCase.id, 'ready')}
              >
                <RotateCcw className="h-3 w-3 mr-1" />
                Reexecutar
              </Button>
            )}
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedTestCase(testCase)}
            >
              <Eye className="h-3 w-3 mr-1" />
              Ver
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  /**
   * RENDERIZAR DEFEITO
   */
  const renderDefect = (defect) => {
    const status = defectStatuses[defect.status] || defectStatuses.new;
    const severity = severities[defect.severity] || severities.medium;
    const priority = priorities[defect.priority] || priorities.medium;
    
    return (
      <Card key={defect.id} className="hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-lg">{defect.title}</h3>
                <Badge className={severity.color}>
                  {severity.name}
                </Badge>
                <Badge className={priority.color}>
                  {priority.name}
                </Badge>
              </div>
              <p className="text-gray-600 text-sm line-clamp-2">{defect.description}</p>
              <p className="text-xs text-gray-500 mt-1">{defect.defectId}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={status.color}>
                {status.icon}
                <span className="ml-1">{status.name}</span>
              </Badge>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="space-y-2 mb-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Reportado por: {defect.reporter || 'Desconhecido'}
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Atribuído a: {defect.assignee || 'Não atribuído'}
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Criado em: {new Date(defect.createdAt).toLocaleDateString('pt-BR')}
            </div>
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4" />
              Módulo: {defect.module || 'Não especificado'}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center p-2 bg-gray-50 rounded">
              <div className="text-lg font-bold text-blue-600">{defect.testCaseId || 'N/A'}</div>
              <div className="text-xs text-gray-600">Caso de Teste</div>
            </div>
            <div className="text-center p-2 bg-gray-50 rounded">
              <div className="text-lg font-bold text-orange-600">{defect.environment || 'N/A'}</div>
              <div className="text-xs text-gray-600">Ambiente</div>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Eye className="h-3 w-3 mr-1" />
              Ver Detalhes
            </Button>
            <Button variant="outline" size="sm">
              <Edit className="h-3 w-3 mr-1" />
              Editar
            </Button>
            {defect.status === 'new' && (
              <Button variant="default" size="sm">
                <User className="h-3 w-3 mr-1" />
                Atribuir
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  /**
   * RENDERIZAR SUITE DE TESTE
   */
  const renderTestSuite = (suite) => {
    const suiteTestCases = testCases.filter(tc => tc.suiteId === suite.id);
    const passedTests = suiteTestCases.filter(tc => tc.status === 'passed').length;
    const failedTests = suiteTestCases.filter(tc => tc.status === 'failed').length;
    const passRate = suiteTestCases.length > 0 ? (passedTests / suiteTestCases.length * 100).toFixed(0) : 0;
    
    return (
      <Card key={suite.id} className="hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="font-semibold text-lg">{suite.name}</h3>
              <p className="text-gray-600 text-sm line-clamp-2">{suite.description}</p>
            </div>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Taxa de Sucesso */}
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Taxa de Sucesso</span>
              <span className="font-medium">{passRate}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full transition-all"
                style={{ width: `${passRate}%` }}
              ></div>
            </div>
          </div>
          
          <div className="grid grid-cols-4 gap-4 mb-4">
            <div className="text-center p-2 bg-gray-50 rounded">
              <div className="text-lg font-bold text-blue-600">{suiteTestCases.length}</div>
              <div className="text-xs text-gray-600">Total</div>
            </div>
            <div className="text-center p-2 bg-gray-50 rounded">
              <div className="text-lg font-bold text-green-600">{passedTests}</div>
              <div className="text-xs text-gray-600">Passou</div>
            </div>
            <div className="text-center p-2 bg-gray-50 rounded">
              <div className="text-lg font-bold text-red-600">{failedTests}</div>
              <div className="text-xs text-gray-600">Falhou</div>
            </div>
            <div className="text-center p-2 bg-gray-50 rounded">
              <div className="text-lg font-bold text-orange-600">
                {suiteTestCases.filter(tc => tc.status === 'blocked').length}
              </div>
              <div className="text-xs text-gray-600">Bloqueado</div>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button variant="default" size="sm">
              <Play className="h-3 w-3 mr-1" />
              Executar Suite
            </Button>
            <Button variant="outline" size="sm">
              <Eye className="h-3 w-3 mr-1" />
              Ver Casos
            </Button>
            <Button variant="outline" size="sm">
              <BarChart3 className="h-3 w-3 mr-1" />
              Relatório
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  /**
   * OBTER ESTATÍSTICAS
   */
  const getStats = () => {
    const totalTestCases = testCases.length;
    const passedTests = testCases.filter(tc => tc.status === 'passed').length;
    const failedTests = testCases.filter(tc => tc.status === 'failed').length;
    const blockedTests = testCases.filter(tc => tc.status === 'blocked').length;
    const totalDefects = defects.length;
    const openDefects = defects.filter(d => ['new', 'assigned', 'in_progress'].includes(d.status)).length;
    const criticalDefects = defects.filter(d => d.severity === 'critical').length;
    const testCoverage = totalTestCases > 0 ? ((passedTests + failedTests) / totalTestCases * 100).toFixed(0) : 0;
    
    return { 
      totalTestCases, 
      passedTests, 
      failedTests, 
      blockedTests, 
      totalDefects, 
      openDefects, 
      criticalDefects, 
      testCoverage 
    };
  };

  const stats = getStats();

  /**
   * FILTRAR CASOS DE TESTE
   */
  const filteredTestCases = testCases.filter(testCase => {
    const matchesSearch = testCase.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         testCase.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         testCase.testCaseId.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filters.status === 'all' || testCase.status === filters.status;
    const matchesPriority = filters.priority === 'all' || testCase.priority === filters.priority;
    const matchesAssignee = filters.assignee === 'all' || testCase.assignee === filters.assignee;
    const matchesSuite = filters.suite === 'all' || testCase.suiteId === filters.suite;
    
    return matchesSearch && matchesStatus && matchesPriority && matchesAssignee && matchesSuite;
  });

  /**
   * CARREGAR DADOS AO MONTAR COMPONENTE
   */
  useEffect(() => {
    loadQAData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Shield className="h-8 w-8 text-blue-600" />
                Quality Assurance
              </h1>
              <p className="text-gray-600 mt-2">
                Sistema completo de controle de qualidade
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={loadQAData}
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Atualizar
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowDefectModal(true)}
              >
                <Bug className="h-4 w-4 mr-2" />
                Novo Defeito
              </Button>
              <Button
                onClick={() => setShowTestCaseModal(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Novo Caso de Teste
              </Button>
            </div>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Casos de Teste</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalTestCases}</p>
                  <p className="text-xs text-gray-500">{stats.testCoverage}% cobertura</p>
                </div>
                <TestTube className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Testes Passou</p>
                  <p className="text-2xl font-bold text-green-600">{stats.passedTests}</p>
                  <p className="text-xs text-gray-500">{stats.failedTests} falharam</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Defeitos</p>
                  <p className="text-2xl font-bold text-red-600">{stats.totalDefects}</p>
                  <p className="text-xs text-gray-500">{stats.openDefects} abertos</p>
                </div>
                <Bug className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Críticos</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.criticalDefects}</p>
                  <p className="text-xs text-gray-500">{stats.blockedTests} bloqueados</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs do QA */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="testcases">Casos de Teste</TabsTrigger>
            <TabsTrigger value="testsuites">Suites</TabsTrigger>
            <TabsTrigger value="defects">Defeitos</TabsTrigger>
            <TabsTrigger value="testruns">Execuções</TabsTrigger>
            <TabsTrigger value="metrics">Métricas</TabsTrigger>
          </TabsList>

          <TabsContent value="testcases" className="space-y-6">
            {/* Filtros */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Buscar casos de teste..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <select
                      value={filters.status}
                      onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">Todos os Status</option>
                      {Object.entries(testCaseStatuses).map(([key, status]) => (
                        <option key={key} value={key}>{status.name}</option>
                      ))}
                    </select>

                    <select
                      value={filters.priority}
                      onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">Todas as Prioridades</option>
                      {Object.entries(priorities).map(([key, priority]) => (
                        <option key={key} value={key}>{priority.name}</option>
                      ))}
                    </select>

                    <select
                      value={filters.suite}
                      onChange={(e) => setFilters(prev => ({ ...prev, suite: e.target.value }))}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">Todas as Suites</option>
                      {testSuites.map(suite => (
                        <option key={suite.id} value={suite.id}>{suite.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Lista de Casos de Teste */}
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2">Carregando casos de teste...</span>
              </div>
            ) : filteredTestCases.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <TestTube className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Nenhum caso de teste encontrado
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Comece criando seu primeiro caso de teste
                  </p>
                  <Button onClick={() => setShowTestCaseModal(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Criar Caso de Teste
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTestCases.map(renderTestCase)}
              </div>
            )}
          </TabsContent>

          <TabsContent value="testsuites" className="space-y-6">
            {/* Lista de Suites */}
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2">Carregando suites...</span>
              </div>
            ) : testSuites.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <ClipboardList className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Nenhuma suite encontrada
                  </h3>
                  <p className="text-gray-500">
                    Crie suites para organizar seus casos de teste
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {testSuites.map(renderTestSuite)}
              </div>
            )}
          </TabsContent>

          <TabsContent value="defects" className="space-y-6">
            {/* Lista de Defeitos */}
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2">Carregando defeitos...</span>
              </div>
            ) : defects.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Bug className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Nenhum defeito encontrado
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Ótimo! Nenhum defeito foi reportado ainda
                  </p>
                  <Button onClick={() => setShowDefectModal(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Reportar Defeito
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {defects.map(renderDefect)}
              </div>
            )}
          </TabsContent>

          <TabsContent value="testruns">
            <Card>
              <CardContent className="p-12 text-center">
                <Activity className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Execuções de Teste
                </h3>
                <p className="text-gray-500">
                  Histórico de execuções de teste será implementado aqui
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="metrics">
            <Card>
              <CardContent className="p-12 text-center">
                <BarChart3 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Métricas de Qualidade
                </h3>
                <p className="text-gray-500">
                  Dashboards e métricas de qualidade serão implementados aqui
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Modais serão implementados na próxima parte */}
        {showTestCaseModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">Novo Caso de Teste</h2>
              {/* Formulário será implementado */}
              <div className="flex justify-end gap-3 mt-6">
                <Button variant="outline" onClick={() => setShowTestCaseModal(false)}>
                  Cancelar
                </Button>
                <Button disabled={loading}>
                  {loading ? 'Criando...' : 'Criar Caso de Teste'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QualityAssurance;
