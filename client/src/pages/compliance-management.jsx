/**
 * SISTEMA COMPLIANCE MANAGEMENT COMPLETO - TOIT NEXUS
 * Sistema completo de gestão de conformidade
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
  FileText,
  FileCheck,
  FileX,
  Scale,
  Gavel,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Key,
  User,
  Users,
  Building,
  Globe,
  Calendar,
  Target,
  Award,
  Star,
  Flag,
  Tag,
  Hash,
  Search,
  Filter,
  Plus,
  Minus,
  Edit,
  Trash2,
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
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  LineChart,
  Activity,
  Zap,
  Database,
  Server,
  Cloud,
  Smartphone,
  Monitor,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  GraduationCap,
  BookOpen,
  Library,
  Newspaper,
  ClipboardCheck,
  ClipboardList,
  Clipboard,
  List,
  Grid,
  Table,
  Layers,
  GitBranch,
  GitCommit,
  GitMerge,
  Code,
  Terminal,
  Cpu,
  HardDrive,
  Wifi,
  WifiOff,
  Navigation,
  Compass,
  Map,
  Route,
  Car,
  Truck,
  Plane,
  Train,
  Ship,
  Bike }
} from 'lucide-react';

const ComplianceManagement = () => {
  const [regulations, setRegulations] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [audits, setAudits] = useState([]);
  const [risks, setRisks] = useState([]);
  const [controls, setControls] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [selectedRegulation, setSelectedRegulation] = useState(null);
  const [showRegulationModal, setShowRegulationModal] = useState(false);
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    category: 'all',
    priority: 'all',
    owner: 'all',
    framework: 'all'
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('regulations');
  
  const { toast } = useToast();

  // Status de conformidade
  const complianceStatuses = {
    compliant: { name: 'Conforme', color: 'text-green-600 bg-green-100', icon: <CheckCircle className="h-3 w-3" /> },
    non_compliant: { name: 'Não Conforme', color: 'text-red-600 bg-red-100', icon: <XCircle className="h-3 w-3" /> },
    partial: { name: 'Parcialmente Conforme', color: 'text-yellow-600 bg-yellow-100', icon: <AlertTriangle className="h-3 w-3" /> },
    pending: { name: 'Pendente', color: 'text-blue-600 bg-blue-100', icon: <Clock className="h-3 w-3" /> },
    under_review: { name: 'Em Revisão', color: 'text-purple-600 bg-purple-100', icon: <Eye className="h-3 w-3" /> }
  };

  // Níveis de risco
  const riskLevels = {
    low: { name: 'Baixo', color: 'text-green-600 bg-green-100' },
    medium: { name: 'Médio', color: 'text-yellow-600 bg-yellow-100' },
    high: { name: 'Alto', color: 'text-orange-600 bg-orange-100' },
    critical: { name: 'Crítico', color: 'text-red-600 bg-red-100' }
  };

  // Frameworks de conformidade
  const complianceFrameworks = {
    gdpr: { name: 'GDPR', color: 'text-blue-600 bg-blue-100', icon: <Shield className="h-3 w-3" /> },
    lgpd: { name: 'LGPD', color: 'text-green-600 bg-green-100', icon: <Scale className="h-3 w-3" /> },
    sox: { name: 'SOX', color: 'text-purple-600 bg-purple-100', icon: <FileCheck className="h-3 w-3" /> },
    iso27001: { name: 'ISO 27001', color: 'text-orange-600 bg-orange-100', icon: <Lock className="h-3 w-3" /> },
    pci_dss: { name: 'PCI DSS', color: 'text-red-600 bg-red-100', icon: <CreditCard className="h-3 w-3" /> },
    hipaa: { name: 'HIPAA', color: 'text-teal-600 bg-teal-100', icon: <Heart className="h-3 w-3" /> }
  };

  // Status de auditoria
  const auditStatuses = {
    planned: { name: 'Planejada', color: 'text-blue-600 bg-blue-100', icon: <Calendar className="h-3 w-3" /> },
    in_progress: { name: 'Em Andamento', color: 'text-yellow-600 bg-yellow-100', icon: <Activity className="h-3 w-3" /> },
    completed: { name: 'Concluída', color: 'text-green-600 bg-green-100', icon: <CheckCircle className="h-3 w-3" /> },
    cancelled: { name: 'Cancelada', color: 'text-red-600 bg-red-100', icon: <XCircle className="h-3 w-3" /> }
  };

  /**
   * CARREGAR DADOS DO COMPLIANCE
   */
  const loadComplianceData = async () => {
    setLoading(true);
    try {
      const [regulationsRes, policiesRes, auditsRes, risksRes, controlsRes, incidentsRes, assessmentsRes] = await Promise.all([
        fetch('/api/compliance/regulations', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('/api/compliance/policies', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('/api/compliance/audits', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('/api/compliance/risks', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('/api/compliance/controls', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('/api/compliance/incidents', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('/api/compliance/assessments', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        })
      ]);

      if (regulationsRes.ok) {
        const regulationsData = await regulationsRes.json();
        setRegulations(regulationsData.regulations || []);
      }

      if (policiesRes.ok) {
        const policiesData = await policiesRes.json();
        setPolicies(policiesData.policies || []);
      }

      if (auditsRes.ok) {
        const auditsData = await auditsRes.json();
        setAudits(auditsData.audits || []);
      }

      if (risksRes.ok) {
        const risksData = await risksRes.json();
        setRisks(risksData.risks || []);
      }

      if (controlsRes.ok) {
        const controlsData = await controlsRes.json();
        setControls(controlsData.controls || []);
      }

      if (incidentsRes.ok) {
        const incidentsData = await incidentsRes.json();
        setIncidents(incidentsData.incidents || []);
      }

      if (assessmentsRes.ok) {
        const assessmentsData = await assessmentsRes.json();
        setAssessments(assessmentsData.assessments || []);
      }

    } catch (error) {
      console.error('Erro ao carregar dados do compliance:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados do compliance",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * CRIAR REGULAMENTAÇÃO
   */
  const createRegulation = async (regulationData) => {
    try {
      const response = await fetch('/api/compliance/regulations', {
        method: 'POST',
        headers: {`
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...regulationData,
          status: 'pending',
          createdAt: new Date().toISOString(),`
          regulationId: `REG-${Date.now()}`
        })
      });

      if (!response.ok) {
        throw new Error('Erro ao criar regulamentação');
      }

      const data = await response.json();
      setRegulations(prev => [data.regulation, ...prev]);
      setShowRegulationModal(false);
      
      toast({
        title: "Regulamentação criada",`
        description: `Regulamentação ${data.regulation.name} criada com sucesso`,
      });
    } catch (error) {
      console.error('Erro ao criar regulamentação:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar a regulamentação",
        variant: "destructive"
      });
    }
  };

  /**
   * ATUALIZAR STATUS DE CONFORMIDADE
   */
  const updateComplianceStatus = async (regulationId, newStatus) => {
    try {`
      const response = await fetch(`/api/compliance/regulations/${regulationId}/status`, {
        method: 'PATCH',
        headers: {`
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        throw new Error('Erro ao atualizar status de conformidade');
      }

      setRegulations(prev => prev.map(regulation => 
        regulation.id === regulationId 
          ? { ...regulation, status: newStatus, updatedAt: new Date().toISOString() }
          : regulation
      ));
      
      toast({
        title: "Status atualizado",
        description: "Status de conformidade atualizado com sucesso",
      });
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status",
        variant: "destructive"
      });
    }
  };

  /**
   * CRIAR AUDITORIA
   */
  const createAudit = async (auditData) => {
    try {
      const response = await fetch('/api/compliance/audits', {
        method: 'POST',
        headers: {`
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...auditData,
          status: 'planned',
          createdAt: new Date().toISOString(),`
          auditId: `AUD-${Date.now()}`
        })
      });

      if (!response.ok) {
        throw new Error('Erro ao criar auditoria');
      }

      const data = await response.json();
      setAudits(prev => [data.audit, ...prev]);
      setShowAuditModal(false);
      
      toast({
        title: "Auditoria criada",`
        description: `Auditoria ${data.audit.name} criada com sucesso`,
      });
    } catch (error) {
      console.error('Erro ao criar auditoria:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar a auditoria",
        variant: "destructive"
      });
    }
  };

  /**
   * RENDERIZAR REGULAMENTAÇÃO
   */
  const renderRegulation = (regulation) => {
    const status = complianceStatuses[regulation.status] || complianceStatuses.pending;
    const framework = complianceFrameworks[regulation.framework] || complianceFrameworks.gdpr;
    const risk = riskLevels[regulation.riskLevel] || riskLevels.medium;
    
    return (
      <Card key={regulation.id} className="hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-lg">{regulation.name}</h3>
                <Badge className={framework.color}>
                  {framework.icon}
                  <span className="ml-1">{framework.name}</span>
                </Badge>
              </div>
              <p className="text-gray-600 text-sm line-clamp-2">{regulation.description}</p>
              <p className="text-xs text-gray-500 mt-1">{regulation.regulationId}</p>
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
              Responsável: {regulation.owner || 'Não atribuído'}
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Próxima revisão: {regulation.nextReview ? new Date(regulation.nextReview).toLocaleDateString('pt-BR') : 'Não definida'}
            </div>
            <div className="flex items-center gap-2">
              <Flag className="h-4 w-4" />
              Nível de risco: 
              <Badge className={risk.color} variant="outline">
                {risk.name}
              </Badge>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center p-2 bg-gray-50 rounded">
              <div className="text-lg font-bold text-blue-600">{regulation.controls?.length || 0}</div>
              <div className="text-xs text-gray-600">Controles</div>
            </div>
            <div className="text-center p-2 bg-gray-50 rounded">
              <div className="text-lg font-bold text-green-600">{regulation.policies?.length || 0}</div>
              <div className="text-xs text-gray-600">Políticas</div>
            </div>
            <div className="text-center p-2 bg-gray-50 rounded">
              <div className="text-lg font-bold text-orange-600">{regulation.incidents || 0}</div>
              <div className="text-xs text-gray-600">Incidentes</div>
            </div>
          </div>
          
          <div className="flex gap-2">
            <select
              value={regulation.status}
              onChange=({ (e }) => updateComplianceStatus(regulation.id, e.target.value)}
              className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
            >
              ({ Object.entries(complianceStatuses).map(([key, status] }) => (
                <option key={key} value={key}>{status.name}</option>
              ))}
            </select>
            
            <Button
              variant="outline"
              size="sm"
              onClick=({ ( }) => setSelectedRegulation(regulation)}
            >
              <Eye className="h-3 w-3 mr-1" />

          </div>
        </CardContent>
      </Card>
    );
  };

  /**
   * RENDERIZAR AUDITORIA
   */
  const renderAudit = (audit) => {
    const status = auditStatuses[audit.status] || auditStatuses.planned;
    const framework = complianceFrameworks[audit.framework] || complianceFrameworks.gdpr;
    
    return (
      <Card key={audit.id} className="hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-lg">{audit.name}</h3>
                <Badge className={framework.color}>
                  {framework.icon}
                  <span className="ml-1">{framework.name}</span>
                </Badge>
              </div>
              <p className="text-gray-600 text-sm line-clamp-2">{audit.description}</p>
              <p className="text-xs text-gray-500 mt-1">{audit.auditId}</p>
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
              Auditor: {audit.auditor || 'Não atribuído'}
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Data de início: {audit.startDate ? new Date(audit.startDate).toLocaleDateString('pt-BR') : 'Não definida'}
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Data de conclusão: {audit.endDate ? new Date(audit.endDate).toLocaleDateString('pt-BR') : 'Não definida'}
            </div>
            <div className="flex items-center gap-2">
              <Building className="h-4 w-4" />
              Escopo: {audit.scope || 'Não definido'}
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center p-2 bg-gray-50 rounded">
              <div className="text-lg font-bold text-blue-600">{audit.findings?.length || 0}</div>
              <div className="text-xs text-gray-600">Achados</div>
            </div>
            <div className="text-center p-2 bg-gray-50 rounded">
              <div className="text-lg font-bold text-red-600">{audit.nonCompliances || 0}</div>
              <div className="text-xs text-gray-600">Não Conformidades</div>
            </div>
            <div className="text-center p-2 bg-gray-50 rounded">
              <div className="text-lg font-bold text-green-600">{audit.recommendations?.length || 0}</div>
              <div className="text-xs text-gray-600">Recomendações</div>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Eye className="h-3 w-3 mr-1" />
              Ver Relatório
            </Button>
            <Button variant="outline" size="sm">
              <Edit className="h-3 w-3 mr-1" />

            <Button variant="outline" size="sm">
              <Download className="h-3 w-3 mr-1" />

          </div>
        </CardContent>
      </Card>
    );
  };

  /**
   * RENDERIZAR POLÍTICA
   */
  const renderPolicy = (policy) => {
    const status = complianceStatuses[policy.status] || complianceStatuses.pending;
    
    return (
      <Card key={policy.id} className="hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="font-semibold text-lg">{policy.name}</h3>
              <p className="text-gray-600 text-sm line-clamp-2">{policy.description}</p>
              <p className="text-xs text-gray-500 mt-1">Versão {policy.version || '1.0'}</p>
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
            <div className="flex justify-between">
              <span>Aprovada por:</span>
              <span>{policy.approvedBy || 'Pendente'}</span>
            </div>
            <div className="flex justify-between">
              <span>Data de aprovação:</span>
              <span>{policy.approvedDate ? new Date(policy.approvedDate).toLocaleDateString('pt-BR') : 'Pendente'}</span>
            </div>
            <div className="flex justify-between">
              <span>Próxima revisão:</span>
              <span>{policy.nextReview ? new Date(policy.nextReview).toLocaleDateString('pt-BR') : 'Não definida'}</span>
            </div>
            <div className="flex justify-between">
              <span>Categoria:</span>
              <span>{policy.category || 'Geral'}</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center p-2 bg-gray-50 rounded">
              <div className="text-lg font-bold text-blue-600">{policy.acknowledgments || 0}</div>
              <div className="text-xs text-gray-600">Reconhecimentos</div>
            </div>
            <div className="text-center p-2 bg-gray-50 rounded">
              <div className="text-lg font-bold text-green-600">{policy.trainings || 0}</div>
              <div className="text-xs text-gray-600">Treinamentos</div>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Eye className="h-3 w-3 mr-1" />
              Ver Política
            </Button>
            <Button variant="outline" size="sm">
              <Edit className="h-3 w-3 mr-1" />

            <Button variant="outline" size="sm">
              <Users className="h-3 w-3 mr-1" />

          </div>
        </CardContent>
      </Card>
    );
  };

  /**
   * RENDERIZAR RISCO
   */
  const renderRisk = (risk) => {
    const level = riskLevels[risk.level] || riskLevels.medium;
    const status = complianceStatuses[risk.status] || complianceStatuses.pending;
    
    return (
      <Card key={risk.id} className="hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-lg">{risk.name}</h3>
                <Badge className={level.color}>
                  {level.name}
                </Badge>
              </div>
              <p className="text-gray-600 text-sm line-clamp-2">{risk.description}</p>
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
            <div className="flex justify-between">
              <span>Probabilidade:</span>
              <span>{risk.probability || 'Não avaliada'}</span>
            </div>
            <div className="flex justify-between">
              <span>Impacto:</span>
              <span>{risk.impact || 'Não avaliado'}</span>
            </div>
            <div className="flex justify-between">
              <span>Responsável:</span>
              <span>{risk.owner || 'Não atribuído'}</span>
            </div>
            <div className="flex justify-between">
              <span>Última avaliação:</span>
              <span>{risk.lastAssessment ? new Date(risk.lastAssessment).toLocaleDateString('pt-BR') : 'Nunca'}</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center p-2 bg-gray-50 rounded">
              <div className="text-lg font-bold text-blue-600">{risk.controls?.length || 0}</div>
              <div className="text-xs text-gray-600">Controles</div>
            </div>
            <div className="text-center p-2 bg-gray-50 rounded">
              <div className="text-lg font-bold text-orange-600">{risk.incidents || 0}</div>
              <div className="text-xs text-gray-600">Incidentes</div>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Eye className="h-3 w-3 mr-1" />

            <Button variant="outline" size="sm">
              <Shield className="h-3 w-3 mr-1" />

            <Button variant="outline" size="sm">
              <Target className="h-3 w-3 mr-1" />

          </div>
        </CardContent>
      </Card>
    );
  };

  /**
   * OBTER ESTATÍSTICAS
   */
  const getStats = () => {
    const totalRegulations = regulations.length;
    const compliantRegulations = regulations.filter(r => r.status === 'compliant').length;
    const totalAudits = audits.length;
    const completedAudits = audits.filter(a => a.status === 'completed').length;
    const totalPolicies = policies.length;
    const approvedPolicies = policies.filter(p => p.status === 'approved').length;
    const totalRisks = risks.length;
    const highRisks = risks.filter(r => ['high', 'critical'].includes(r.level)).length;
    const totalIncidents = incidents.length;
    const openIncidents = incidents.filter(i => i.status === 'open').length;
    
    return { 
      totalRegulations, 
      compliantRegulations, 
      totalAudits, 
      completedAudits, 
      totalPolicies, 
      approvedPolicies, 
      totalRisks, 
      highRisks, 
      totalIncidents, 
      openIncidents 
    };
  };

  const stats = getStats();

  /**
   * FILTRAR REGULAMENTAÇÕES
   */
  const filteredRegulations = regulations.filter(regulation => {
    const matchesSearch = regulation.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         regulation.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filters.status === 'all' || regulation.status === filters.status;
    const matchesFramework = filters.framework === 'all' || regulation.framework === filters.framework;
    const matchesOwner = filters.owner === 'all' || regulation.ownerId === filters.owner;
    
    return matchesSearch && matchesStatus && matchesFramework && matchesOwner;
  });

  /**
   * CARREGAR DADOS AO MONTAR COMPONENTE
   */
  useEffect(() => {
    loadComplianceData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Scale className="h-8 w-8 text-blue-600" />
                Compliance Management
              </h1>
              <p className="text-gray-600 mt-2">
                Sistema completo de gestão de conformidade
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={loadComplianceData}
                disabled={loading}
              >`
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />

              <Button
                variant="outline"
                onClick=({ ( }) => setShowAuditModal(true)}
              >
                <ClipboardCheck className="h-4 w-4 mr-2" />
                Nova Auditoria
              </Button>
              <Button
                onClick=({ ( }) => setShowRegulationModal(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nova Regulamentação
              </Button>
            </div>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Regulamentações</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalRegulations}</p>
                  <p className="text-xs text-gray-500">{stats.compliantRegulations} conformes</p>
                </div>
                <Scale className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Auditorias</p>
                  <p className="text-2xl font-bold text-green-600">{stats.totalAudits}</p>
                  <p className="text-xs text-gray-500">{stats.completedAudits} concluídas</p>
                </div>
                <ClipboardCheck className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Políticas</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.totalPolicies}</p>
                  <p className="text-xs text-gray-500">{stats.approvedPolicies} aprovadas</p>
                </div>
                <FileCheck className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Riscos</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.totalRisks}</p>
                  <p className="text-xs text-gray-500">{stats.highRisks} alto/crítico</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Incidentes</p>
                  <p className="text-2xl font-bold text-red-600">{stats.totalIncidents}</p>
                  <p className="text-xs text-gray-500">{stats.openIncidents} abertos</p>
                </div>
                <Flag className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs do Compliance */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="regulations">Regulamentações</TabsTrigger>
            <TabsTrigger value="audits">Auditorias</TabsTrigger>
            <TabsTrigger value="policies">Políticas</TabsTrigger>
            <TabsTrigger value="risks">Riscos</TabsTrigger>
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          </TabsList>

          <TabsContent value="regulations" className="space-y-6">
            {/* Filtros */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Buscar regulamentações..."
                        value={searchTerm}
                        onChange=({ (e }) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <select
                      value={filters.status}
                      onChange=({ (e }) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">Todos os Status</option>
                      ({ Object.entries(complianceStatuses).map(([key, status] }) => (
                        <option key={key} value={key}>{status.name}</option>
                      ))}
                    </select>

                    <select
                      value={filters.framework}
                      onChange=({ (e }) => setFilters(prev => ({ ...prev, framework: e.target.value }))}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">Todos os Frameworks</option>
                      ({ Object.entries(complianceFrameworks).map(([key, framework] }) => (
                        <option key={key} value={key}>{framework.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Lista de Regulamentações */}
            ({ loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2">Carregando regulamentações...</span>
              </div>
            ) : filteredRegulations.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Scale className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Nenhuma regulamentação encontrada
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Comece adicionando regulamentações para monitorar conformidade
                  </p>
                  <Button onClick={( }) => setShowRegulationModal(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Regulamentação
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredRegulations.map(renderRegulation)}
              </div>
            )}
          </TabsContent>

          <TabsContent value="audits" className="space-y-6">
            {/* Lista de Auditorias */}
            ({ loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2">Carregando auditorias...</span>
              </div>
            ) : audits.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <ClipboardCheck className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Nenhuma auditoria encontrada
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Crie auditorias para verificar conformidade
                  </p>
                  <Button onClick={( }) => setShowAuditModal(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Criar Auditoria
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {audits.map(renderAudit)}
              </div>
            )}
          </TabsContent>

          <TabsContent value="policies" className="space-y-6">
            {/* Lista de Políticas */}
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2">Carregando políticas...</span>
              </div>
            ) : policies.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <FileCheck className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Nenhuma política encontrada
                  </h3>
                  <p className="text-gray-500">
                    Crie políticas para estabelecer diretrizes de conformidade
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {policies.map(renderPolicy)}
              </div>
            )}
          </TabsContent>

          <TabsContent value="risks" className="space-y-6">
            {/* Lista de Riscos */}
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2">Carregando riscos...</span>
              </div>
            ) : risks.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <AlertTriangle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Nenhum risco encontrado
                  </h3>
                  <p className="text-gray-500">
                    Identifique e gerencie riscos de conformidade
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {risks.map(renderRisk)}
              </div>
            )}
          </TabsContent>

          <TabsContent value="dashboard">
            <Card>
              <CardContent className="p-12 text-center">
                <BarChart3 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Dashboard de Conformidade
                </h3>
                <p className="text-gray-500">
                  Dashboards e métricas de conformidade serão implementados aqui
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Modais serão implementados na próxima parte */}
        {showRegulationModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">Nova Regulamentação</h2>
              {/* Formulário será implementado */}
              <div className="flex justify-end gap-3 mt-6">
                <Button variant="outline" onClick=({ ( }) => setShowRegulationModal(false)}>

                <Button disabled={loading}>
                  {loading ? 'Criando...' : 'Criar Regulamentação'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ComplianceManagement;
`