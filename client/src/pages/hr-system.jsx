/**
 * SISTEMA HR COMPLETO - TOIT NEXUS
 * Sistema completo de recursos humanos
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
  Users, 
  UserPlus,
  Briefcase,
  Calendar,
  DollarSign,
  Clock,
  Award,
  Target,
  TrendingUp,
  TrendingDown,
  Star,
  Heart,
  MessageSquare,
  FileText,
  Upload,
  Download,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  AlertTriangle,
  User,
  Mail,
  Phone,
  MapPin,
  Building,
  GraduationCap,
  Zap,
  RefreshCw,
  Settings,
  Bell,
  Archive,
  MoreHorizontal,
  ChevronRight,
  ChevronDown,
  BarChart3,
  PieChart,
  LineChart,
  Activity,
  Globe,
  Smartphone,
  Monitor,
  Tag,
  Bookmark,
  Flag,
  Shield,
  Key,
  Lock,
  Unlock,
  CreditCard,
  Receipt,
  Calculator,
  PiggyBank,
  Wallet,
  BanknoteIcon,
  Percent
} from 'lucide-react';

const HRSystem = () => {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [positions, setPositions] = useState([]);
  const [payroll, setPayroll] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [performance, setPerformance] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [showPayrollModal, setShowPayrollModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    department: 'all',
    position: 'all',
    status: 'all',
    location: 'all'
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('employees');
  
  const { toast } = useToast();

  // Status dos funcionários
  const employeeStatuses = {
    active: { name: 'Ativo', color: 'text-green-600 bg-green-100', icon: <CheckCircle className="h-3 w-3" /> },
    inactive: { name: 'Inativo', color: 'text-gray-600 bg-gray-100', icon: <XCircle className="h-3 w-3" /> },
    on_leave: { name: 'Em Licença', color: 'text-yellow-600 bg-yellow-100', icon: <Clock className="h-3 w-3" /> },
    terminated: { name: 'Desligado', color: 'text-red-600 bg-red-100', icon: <XCircle className="h-3 w-3" /> }
  };

  // Tipos de licença
  const leaveTypes = {
    vacation: { name: 'Férias', color: 'text-blue-600 bg-blue-100' },
    sick: { name: 'Licença Médica', color: 'text-red-600 bg-red-100' },
    personal: { name: 'Licença Pessoal', color: 'text-purple-600 bg-purple-100' },
    maternity: { name: 'Licença Maternidade', color: 'text-pink-600 bg-pink-100' },
    paternity: { name: 'Licença Paternidade', color: 'text-indigo-600 bg-indigo-100' }
  };

  /**
   * CARREGAR DADOS DO HR
   */
  const loadHRData = async () => {
    setLoading(true);
    try {
      const [employeesRes, departmentsRes, positionsRes, payrollRes, leavesRes, performanceRes] = await Promise.all([
        fetch('/api/hr/employees', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('/api/hr/departments', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('/api/hr/positions', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('/api/hr/payroll', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('/api/hr/leaves', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('/api/hr/performance', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        })
      ]);

      if (employeesRes.ok) {
        const employeesData = await employeesRes.json();
        setEmployees(employeesData.employees || []);
      }

      if (departmentsRes.ok) {
        const departmentsData = await departmentsRes.json();
        setDepartments(departmentsData.departments || []);
      }

      if (positionsRes.ok) {
        const positionsData = await positionsRes.json();
        setPositions(positionsData.positions || []);
      }

      if (payrollRes.ok) {
        const payrollData = await payrollRes.json();
        setPayroll(payrollData.payroll || []);
      }

      if (leavesRes.ok) {
        const leavesData = await leavesRes.json();
        setLeaves(leavesData.leaves || []);
      }

      if (performanceRes.ok) {
        const performanceData = await performanceRes.json();
        setPerformance(performanceData.performance || []);
      }

    } catch (error) {
      console.error('Erro ao carregar dados do HR:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados do HR",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * CRIAR FUNCIONÁRIO
   */
  const createEmployee = async (employeeData) => {
    try {
      const response = await fetch('/api/hr/employees', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...employeeData,
          status: 'active',
          hireDate: new Date().toISOString(),
          employeeId: `EMP-${Date.now()}`
        })
      });

      if (!response.ok) {
        throw new Error('Erro ao criar funcionário');
      }

      const data = await response.json();
      setEmployees(prev => [data.employee, ...prev]);
      setShowEmployeeModal(false);
      
      toast({
        title: "Funcionário criado",
        description: `Funcionário ${data.employee.name} criado com sucesso`,
      });
    } catch (error) {
      console.error('Erro ao criar funcionário:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar o funcionário",
        variant: "destructive"
      });
    }
  };

  /**
   * PROCESSAR FOLHA DE PAGAMENTO
   */
  const processPayroll = async (payrollData) => {
    try {
      const response = await fetch('/api/hr/payroll/process', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...payrollData,
          processedAt: new Date().toISOString()
        })
      });

      if (!response.ok) {
        throw new Error('Erro ao processar folha de pagamento');
      }

      const data = await response.json();
      setPayroll(prev => [data.payroll, ...prev]);
      
      toast({
        title: "Folha processada",
        description: "Folha de pagamento processada com sucesso",
      });
    } catch (error) {
      console.error('Erro ao processar folha:', error);
      toast({
        title: "Erro",
        description: "Não foi possível processar a folha de pagamento",
        variant: "destructive"
      });
    }
  };

  /**
   * SOLICITAR LICENÇA
   */
  const requestLeave = async (leaveData) => {
    try {
      const response = await fetch('/api/hr/leaves', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...leaveData,
          status: 'pending',
          requestedAt: new Date().toISOString()
        })
      });

      if (!response.ok) {
        throw new Error('Erro ao solicitar licença');
      }

      const data = await response.json();
      setLeaves(prev => [data.leave, ...prev]);
      
      toast({
        title: "Licença solicitada",
        description: "Solicitação de licença enviada para aprovação",
      });
    } catch (error) {
      console.error('Erro ao solicitar licença:', error);
      toast({
        title: "Erro",
        description: "Não foi possível solicitar a licença",
        variant: "destructive"
      });
    }
  };

  /**
   * RENDERIZAR CARD DE FUNCIONÁRIO
   */
  const renderEmployeeCard = (employee) => {
    const status = employeeStatuses[employee.status] || employeeStatuses.active;
    const department = departments.find(d => d.id === employee.departmentId);
    const position = positions.find(p => p.id === employee.positionId);
    
    return (
      <Card key={employee.id} className="hover:shadow-md transition-shadow cursor-pointer">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-bold text-lg">
                  {employee.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h3 className="font-semibold text-lg">{employee.name}</h3>
                <p className="text-gray-600 text-sm">{employee.employeeId}</p>
              </div>
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
          
          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Briefcase className="h-4 w-4" />
              {position ? position.name : 'Cargo não definido'}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Building className="h-4 w-4" />
              {department ? department.name : 'Departamento não definido'}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Mail className="h-4 w-4" />
              {employee.email}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Phone className="h-4 w-4" />
              {employee.phone}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center p-2 bg-gray-50 rounded">
              <div className="text-lg font-bold text-green-600">
                R$ {employee.salary?.toLocaleString() || '0'}
              </div>
              <div className="text-xs text-gray-600">Salário</div>
            </div>
            <div className="text-center p-2 bg-gray-50 rounded">
              <div className="text-lg font-bold text-blue-600">
                {employee.yearsOfService || 0}
              </div>
              <div className="text-xs text-gray-600">Anos</div>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedEmployee(employee)}
            >
              <Eye className="h-3 w-3 mr-1" />
              Ver Perfil
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                // Implementar edição
              }}
            >
              <Edit className="h-3 w-3 mr-1" />
              Editar
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  /**
   * RENDERIZAR DEPARTAMENTO
   */
  const renderDepartment = (department) => {
    const employeeCount = employees.filter(e => e.departmentId === department.id).length;
    const avgSalary = employees
      .filter(e => e.departmentId === department.id)
      .reduce((sum, e) => sum + (e.salary || 0), 0) / employeeCount || 0;
    
    return (
      <Card key={department.id} className="hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="font-semibold text-lg">{department.name}</h3>
              <p className="text-gray-600 text-sm">{department.description}</p>
            </div>
            <Badge variant="outline">
              {employeeCount} funcionários
            </Badge>
          </div>
          
          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <User className="h-4 w-4" />
              Gerente: {department.manager || 'Não definido'}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="h-4 w-4" />
              Localização: {department.location || 'Não definida'}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <DollarSign className="h-4 w-4" />
              Salário médio: R$ {avgSalary.toLocaleString()}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center p-2 bg-gray-50 rounded">
              <div className="text-lg font-bold text-blue-600">{employeeCount}</div>
              <div className="text-xs text-gray-600">Funcionários</div>
            </div>
            <div className="text-center p-2 bg-gray-50 rounded">
              <div className="text-lg font-bold text-green-600">
                {department.budget ? `R$ ${department.budget.toLocaleString()}` : 'N/A'}
              </div>
              <div className="text-xs text-gray-600">Orçamento</div>
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
          </div>
        </CardContent>
      </Card>
    );
  };

  /**
   * RENDERIZAR LICENÇA
   */
  const renderLeave = (leave) => {
    const leaveType = leaveTypes[leave.type] || leaveTypes.vacation;
    const employee = employees.find(e => e.id === leave.employeeId);
    
    return (
      <Card key={leave.id} className="hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="font-semibold text-lg">
                {employee ? employee.name : 'Funcionário não encontrado'}
              </h3>
              <p className="text-gray-600 text-sm">{leave.reason}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={leaveType.color}>
                {leaveType.name}
              </Badge>
              <Badge variant={
                leave.status === 'approved' ? 'default' :
                leave.status === 'rejected' ? 'destructive' : 'secondary'
              }>
                {leave.status === 'approved' ? 'Aprovado' :
                 leave.status === 'rejected' ? 'Rejeitado' : 'Pendente'}
              </Badge>
            </div>
          </div>
          
          <div className="space-y-2 mb-4 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Data de início:</span>
              <span>{new Date(leave.startDate).toLocaleDateString('pt-BR')}</span>
            </div>
            <div className="flex justify-between">
              <span>Data de fim:</span>
              <span>{new Date(leave.endDate).toLocaleDateString('pt-BR')}</span>
            </div>
            <div className="flex justify-between">
              <span>Duração:</span>
              <span>{leave.duration} dias</span>
            </div>
            <div className="flex justify-between">
              <span>Solicitado em:</span>
              <span>{new Date(leave.requestedAt).toLocaleDateString('pt-BR')}</span>
            </div>
          </div>
          
          {leave.status === 'pending' && (
            <div className="flex gap-2">
              <Button
                variant="default"
                size="sm"
                onClick={() => {
                  // Implementar aprovação
                }}
              >
                <CheckCircle className="h-3 w-3 mr-1" />
                Aprovar
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  // Implementar rejeição
                }}
              >
                <XCircle className="h-3 w-3 mr-1" />
                Rejeitar
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  /**
   * OBTER ESTATÍSTICAS
   */
  const getStats = () => {
    const totalEmployees = employees.length;
    const activeEmployees = employees.filter(e => e.status === 'active').length;
    const totalPayroll = employees.reduce((sum, e) => sum + (e.salary || 0), 0);
    const pendingLeaves = leaves.filter(l => l.status === 'pending').length;
    const avgSalary = totalEmployees > 0 ? totalPayroll / totalEmployees : 0;
    
    return { totalEmployees, activeEmployees, totalPayroll, pendingLeaves, avgSalary };
  };

  const stats = getStats();

  /**
   * FILTRAR FUNCIONÁRIOS
   */
  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.employeeId.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDepartment = filters.department === 'all' || employee.departmentId === filters.department;
    const matchesPosition = filters.position === 'all' || employee.positionId === filters.position;
    const matchesStatus = filters.status === 'all' || employee.status === filters.status;
    
    return matchesSearch && matchesDepartment && matchesPosition && matchesStatus;
  });

  /**
   * CARREGAR DADOS AO MONTAR COMPONENTE
   */
  useEffect(() => {
    loadHRData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Users className="h-8 w-8 text-blue-600" />
                Sistema HR
              </h1>
              <p className="text-gray-600 mt-2">
                Gestão completa de recursos humanos
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={loadHRData}
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Atualizar
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowPayrollModal(true)}
              >
                <Calculator className="h-4 w-4 mr-2" />
                Processar Folha
              </Button>
              <Button
                onClick={() => setShowEmployeeModal(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Novo Funcionário
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
                  <p className="text-sm font-medium text-gray-600">Total Funcionários</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalEmployees}</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Ativos</p>
                  <p className="text-2xl font-bold text-green-600">{stats.activeEmployees}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Folha Total</p>
                  <p className="text-2xl font-bold text-purple-600">
                    R$ {stats.totalPayroll.toLocaleString()}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Licenças Pendentes</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.pendingLeaves}</p>
                </div>
                <Clock className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Salário Médio</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    R$ {stats.avgSalary.toLocaleString()}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs do HR */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="employees">Funcionários</TabsTrigger>
            <TabsTrigger value="departments">Departamentos</TabsTrigger>
            <TabsTrigger value="leaves">Licenças</TabsTrigger>
            <TabsTrigger value="payroll">Folha de Pagamento</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>

          <TabsContent value="employees" className="space-y-6">
            {/* Filtros */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Buscar funcionários..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <select
                      value={filters.department}
                      onChange={(e) => setFilters(prev => ({ ...prev, department: e.target.value }))}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">Todos os Departamentos</option>
                      {departments.map(dept => (
                        <option key={dept.id} value={dept.id}>{dept.name}</option>
                      ))}
                    </select>

                    <select
                      value={filters.position}
                      onChange={(e) => setFilters(prev => ({ ...prev, position: e.target.value }))}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">Todos os Cargos</option>
                      {positions.map(pos => (
                        <option key={pos.id} value={pos.id}>{pos.name}</option>
                      ))}
                    </select>

                    <select
                      value={filters.status}
                      onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">Todos os Status</option>
                      {Object.entries(employeeStatuses).map(([key, status]) => (
                        <option key={key} value={key}>{status.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Lista de Funcionários */}
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2">Carregando funcionários...</span>
              </div>
            ) : filteredEmployees.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Nenhum funcionário encontrado
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Comece adicionando seu primeiro funcionário
                  </p>
                  <Button onClick={() => setShowEmployeeModal(true)}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Adicionar Funcionário
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEmployees.map(renderEmployeeCard)}
              </div>
            )}
          </TabsContent>

          <TabsContent value="departments" className="space-y-6">
            {/* Lista de Departamentos */}
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2">Carregando departamentos...</span>
              </div>
            ) : departments.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Building className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Nenhum departamento encontrado
                  </h3>
                  <p className="text-gray-500">
                    Crie departamentos para organizar sua empresa
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {departments.map(renderDepartment)}
              </div>
            )}
          </TabsContent>

          <TabsContent value="leaves" className="space-y-6">
            {/* Lista de Licenças */}
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2">Carregando licenças...</span>
              </div>
            ) : leaves.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Nenhuma licença encontrada
                  </h3>
                  <p className="text-gray-500">
                    As solicitações de licença aparecerão aqui
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {leaves.map(renderLeave)}
              </div>
            )}
          </TabsContent>

          <TabsContent value="payroll">
            <Card>
              <CardContent className="p-12 text-center">
                <Calculator className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Folha de Pagamento
                </h3>
                <p className="text-gray-500">
                  Sistema de folha de pagamento será implementado aqui
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance">
            <Card>
              <CardContent className="p-12 text-center">
                <Award className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Avaliação de Performance
                </h3>
                <p className="text-gray-500">
                  Sistema de avaliação de performance será implementado aqui
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Modais serão implementados na próxima parte */}
        {showEmployeeModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">Novo Funcionário</h2>
              {/* Formulário será implementado */}
              <div className="flex justify-end gap-3 mt-6">
                <Button variant="outline" onClick={() => setShowEmployeeModal(false)}>
                  Cancelar
                </Button>
                <Button disabled={loading}>
                  {loading ? 'Criando...' : 'Criar Funcionário'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HRSystem;
