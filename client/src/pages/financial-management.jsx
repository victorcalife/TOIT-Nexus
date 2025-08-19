/**
 * SISTEMA FINANCIAL MANAGEMENT COMPLETO - TOIT NEXUS
 * Sistema completo de gestão financeira
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
  DollarSign, 
  TrendingUp,
  TrendingDown,
  PieChart,
  BarChart3,
  LineChart,
  Calculator,
  CreditCard,
  Banknote,
  Wallet,
  Receipt,
  FileText,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Target,
  Award,
  Star,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Minus,
  Edit,
  Trash2,
  Eye,
  Download,
  Upload,
  Search,
  Filter,
  RefreshCw,
  Settings,
  Bell,
  Archive,
  Share,
  Copy,
  MoreHorizontal,
  Building,
  User,
  Tag,
  Bookmark,
  Flag,
  Activity,
  Zap,
  Globe,
  Smartphone,
  Monitor,
  Mail,
  Phone,
  MapPin,
  Users,
  Briefcase,
  PiggyBank,
  TrendingUpIcon,
  Percent,
  Hash,
  ExternalLink
} from 'lucide-react';
import { 
  LineChart as RechartsLineChart, 
  Line, 
  AreaChart,
  Area,
  BarChart, 
  Bar, 
  PieChart as RechartsPieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer
} from 'recharts';

const FinancialManagement = () => {
  const [transactions, setTransactions] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [revenues, setRevenues] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState('thisMonth');
  const [filters, setFilters] = useState({
    type: 'all',
    category: 'all',
    account: 'all',
    status: 'all'
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  
  const { toast } = useToast();

  // Cores para gráficos
  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16', '#F97316'];

  // Tipos de transação
  const transactionTypes = {
    income: { name: 'Receita', color: 'text-green-600 bg-green-100', icon: <ArrowUpRight className="h-3 w-3" /> },
    expense: { name: 'Despesa', color: 'text-red-600 bg-red-100', icon: <ArrowDownRight className="h-3 w-3" /> },
    transfer: { name: 'Transferência', color: 'text-blue-600 bg-blue-100', icon: <ArrowUpRight className="h-3 w-3" /> }
  };

  // Status das faturas
  const invoiceStatuses = {
    draft: { name: 'Rascunho', color: 'text-gray-600 bg-gray-100', icon: <FileText className="h-3 w-3" /> },
    sent: { name: 'Enviada', color: 'text-blue-600 bg-blue-100', icon: <Mail className="h-3 w-3" /> },
    paid: { name: 'Paga', color: 'text-green-600 bg-green-100', icon: <CheckCircle className="h-3 w-3" /> },
    overdue: { name: 'Vencida', color: 'text-red-600 bg-red-100', icon: <AlertTriangle className="h-3 w-3" /> },
    cancelled: { name: 'Cancelada', color: 'text-gray-600 bg-gray-100', icon: <XCircle className="h-3 w-3" /> }
  };

  /**
   * CARREGAR DADOS FINANCEIROS
   */
  const loadFinancialData = async () => {
    setLoading(true);
    try {
      const [transactionsRes, accountsRes, budgetsRes, invoicesRes, expensesRes, revenuesRes, categoriesRes] = await Promise.all([
        fetch(`/api/financial/transactions?dateRange=${dateRange}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('/api/financial/accounts', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('/api/financial/budgets', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('/api/financial/invoices', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch(`/api/financial/expenses?dateRange=${dateRange}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch(`/api/financial/revenues?dateRange=${dateRange}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('/api/financial/categories', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        })
      ]);

      if (transactionsRes.ok) {
        const transactionsData = await transactionsRes.json();
        setTransactions(transactionsData.transactions || []);
      }

      if (accountsRes.ok) {
        const accountsData = await accountsRes.json();
        setAccounts(accountsData.accounts || []);
      }

      if (budgetsRes.ok) {
        const budgetsData = await budgetsRes.json();
        setBudgets(budgetsData.budgets || []);
      }

      if (invoicesRes.ok) {
        const invoicesData = await invoicesRes.json();
        setInvoices(invoicesData.invoices || []);
      }

      if (expensesRes.ok) {
        const expensesData = await expensesRes.json();
        setExpenses(expensesData.expenses || []);
      }

      if (revenuesRes.ok) {
        const revenuesData = await revenuesRes.json();
        setRevenues(revenuesData.revenues || []);
      }

      if (categoriesRes.ok) {
        const categoriesData = await categoriesRes.json();
        setCategories(categoriesData.categories || []);
      }

    } catch (error) {
      console.error('Erro ao carregar dados financeiros:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados financeiros",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * CRIAR TRANSAÇÃO
   */
  const createTransaction = async (transactionData) => {
    try {
      const response = await fetch('/api/financial/transactions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...transactionData,
          createdAt: new Date().toISOString(),
          transactionId: `TXN-${Date.now()}`
        })
      });

      if (!response.ok) {
        throw new Error('Erro ao criar transação');
      }

      const data = await response.json();
      setTransactions(prev => [data.transaction, ...prev]);
      setShowTransactionModal(false);
      
      toast({
        title: "Transação criada",
        description: `Transação de ${data.transaction.type} criada com sucesso`,
      });
    } catch (error) {
      console.error('Erro ao criar transação:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar a transação",
        variant: "destructive"
      });
    }
  };

  /**
   * CRIAR FATURA
   */
  const createInvoice = async (invoiceData) => {
    try {
      const response = await fetch('/api/financial/invoices', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...invoiceData,
          status: 'draft',
          createdAt: new Date().toISOString(),
          invoiceNumber: `INV-${Date.now()}`
        })
      });

      if (!response.ok) {
        throw new Error('Erro ao criar fatura');
      }

      const data = await response.json();
      setInvoices(prev => [data.invoice, ...prev]);
      setShowInvoiceModal(false);
      
      toast({
        title: "Fatura criada",
        description: `Fatura #${data.invoice.invoiceNumber} criada com sucesso`,
      });
    } catch (error) {
      console.error('Erro ao criar fatura:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar a fatura",
        variant: "destructive"
      });
    }
  };

  /**
   * ATUALIZAR STATUS DA FATURA
   */
  const updateInvoiceStatus = async (invoiceId, newStatus) => {
    try {
      const response = await fetch(`/api/financial/invoices/${invoiceId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        throw new Error('Erro ao atualizar status da fatura');
      }

      setInvoices(prev => prev.map(invoice => 
        invoice.id === invoiceId 
          ? { ...invoice, status: newStatus, updatedAt: new Date().toISOString() }
          : invoice
      ));
      
      toast({
        title: "Status atualizado",
        description: "Status da fatura atualizado com sucesso",
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
   * RENDERIZAR GRÁFICO DE LINHA
   */
  const renderLineChart = (data, title, dataKey = 'value') => {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <RechartsLineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => [`R$ ${value.toLocaleString()}`, 'Valor']} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey={dataKey} 
                stroke="#3B82F6" 
                strokeWidth={2}
                dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
              />
            </RechartsLineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    );
  };

  /**
   * RENDERIZAR GRÁFICO DE PIZZA
   */
  const renderPieChart = (data, title) => {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <RechartsPieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`R$ ${value.toLocaleString()}`, 'Valor']} />
            </RechartsPieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    );
  };

  /**
   * RENDERIZAR TRANSAÇÃO
   */
  const renderTransaction = (transaction) => {
    const type = transactionTypes[transaction.type] || transactionTypes.expense;
    const category = categories.find(c => c.id === transaction.categoryId);
    const account = accounts.find(a => a.id === transaction.accountId);
    
    return (
      <div key={transaction.id} className="flex items-center justify-between p-4 border-b border-gray-100 hover:bg-gray-50">
        <div className="flex items-center gap-4">
          <div className={`p-2 rounded-full ${type.color}`}>
            {type.icon}
          </div>
          
          <div>
            <h4 className="font-medium">{transaction.description}</h4>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>{category ? category.name : 'Sem categoria'}</span>
              <span>{account ? account.name : 'Conta não encontrada'}</span>
              <span>{new Date(transaction.date).toLocaleDateString('pt-BR')}</span>
            </div>
          </div>
        </div>
        
        <div className="text-right">
          <div className={`font-bold text-lg ${
            transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
          }`}>
            {transaction.type === 'income' ? '+' : '-'}R$ {transaction.amount.toLocaleString()}
          </div>
          <div className="text-sm text-gray-500">
            {transaction.transactionId}
          </div>
        </div>
      </div>
    );
  };

  /**
   * RENDERIZAR CONTA
   */
  const renderAccount = (account) => {
    const accountTransactions = transactions.filter(t => t.accountId === account.id);
    const balance = accountTransactions.reduce((sum, t) => {
      return sum + (t.type === 'income' ? t.amount : -t.amount);
    }, account.initialBalance || 0);
    
    return (
      <Card key={account.id} className="hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="font-semibold text-lg">{account.name}</h3>
              <p className="text-gray-600 text-sm">{account.type}</p>
            </div>
            <Badge variant={account.status === 'active' ? 'default' : 'secondary'}>
              {account.status === 'active' ? 'Ativa' : 'Inativa'}
            </Badge>
          </div>
          
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Saldo atual:</span>
              <span className={`font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                R$ {balance.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Banco:</span>
              <span>{account.bank || 'Não informado'}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Número:</span>
              <span>{account.accountNumber || 'Não informado'}</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center p-2 bg-gray-50 rounded">
              <div className="text-lg font-bold text-green-600">
                {accountTransactions.filter(t => t.type === 'income').length}
              </div>
              <div className="text-xs text-gray-600">Receitas</div>
            </div>
            <div className="text-center p-2 bg-gray-50 rounded">
              <div className="text-lg font-bold text-red-600">
                {accountTransactions.filter(t => t.type === 'expense').length}
              </div>
              <div className="text-xs text-gray-600">Despesas</div>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Eye className="h-3 w-3 mr-1" />
              Ver Extrato
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
   * RENDERIZAR FATURA
   */
  const renderInvoice = (invoice) => {
    const status = invoiceStatuses[invoice.status] || invoiceStatuses.draft;
    
    return (
      <Card key={invoice.id} className="hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="font-semibold text-lg">#{invoice.invoiceNumber}</h3>
              <p className="text-gray-600 text-sm">{invoice.clientName}</p>
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
          
          <div className="space-y-2 mb-4 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Valor:</span>
              <span className="font-bold text-green-600">
                R$ {invoice.amount?.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Data de emissão:</span>
              <span>{new Date(invoice.issueDate).toLocaleDateString('pt-BR')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Vencimento:</span>
              <span className={
                new Date(invoice.dueDate) < new Date() && invoice.status !== 'paid'
                  ? 'text-red-600 font-medium'
                  : ''
              }>
                {new Date(invoice.dueDate).toLocaleDateString('pt-BR')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Descrição:</span>
              <span className="text-right max-w-32 truncate">{invoice.description}</span>
            </div>
          </div>
          
          <div className="flex gap-2">
            <select
              value={invoice.status}
              onChange={(e) => updateInvoiceStatus(invoice.id, e.target.value)}
              className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
            >
              {Object.entries(invoiceStatuses).map(([key, status]) => (
                <option key={key} value={key}>{status.name}</option>
              ))}
            </select>
            
            <Button variant="outline" size="sm">
              <Download className="h-3 w-3 mr-1" />
              PDF
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  /**
   * OBTER ESTATÍSTICAS FINANCEIRAS
   */
  const getFinancialStats = () => {
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const netIncome = totalIncome - totalExpenses;
    
    const totalAccounts = accounts.length;
    const activeAccounts = accounts.filter(a => a.status === 'active').length;
    
    const pendingInvoices = invoices.filter(i => i.status === 'sent').length;
    const overdueInvoices = invoices.filter(i => i.status === 'overdue').length;
    
    const totalInvoiceAmount = invoices
      .filter(i => i.status !== 'cancelled')
      .reduce((sum, i) => sum + (i.amount || 0), 0);
    
    return { 
      totalIncome, 
      totalExpenses, 
      netIncome, 
      totalAccounts, 
      activeAccounts, 
      pendingInvoices, 
      overdueInvoices, 
      totalInvoiceAmount 
    };
  };

  const stats = getFinancialStats();

  /**
   * DADOS PARA GRÁFICOS
   */
  const getChartData = () => {
    // Dados de receitas vs despesas por mês
    const monthlyData = [
      { name: 'Jan', receitas: 45000, despesas: 32000 },
      { name: 'Fev', receitas: 52000, despesas: 38000 },
      { name: 'Mar', receitas: 48000, despesas: 35000 },
      { name: 'Abr', receitas: 61000, despesas: 42000 },
      { name: 'Mai', receitas: 55000, despesas: 39000 },
      { name: 'Jun', receitas: 67000, despesas: 45000 }
    ];

    // Dados de categorias de despesas
    const expenseCategories = [
      { name: 'Salários', value: 45000 },
      { name: 'Marketing', value: 12000 },
      { name: 'Infraestrutura', value: 8000 },
      { name: 'Operacional', value: 15000 },
      { name: 'Outros', value: 5000 }
    ];

    return { monthlyData, expenseCategories };
  };

  const chartData = getChartData();

  /**
   * FILTRAR TRANSAÇÕES
   */
  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.transactionId.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filters.type === 'all' || transaction.type === filters.type;
    const matchesCategory = filters.category === 'all' || transaction.categoryId === filters.category;
    const matchesAccount = filters.account === 'all' || transaction.accountId === filters.account;
    
    return matchesSearch && matchesType && matchesCategory && matchesAccount;
  });

  /**
   * CARREGAR DADOS AO MONTAR COMPONENTE
   */
  useEffect(() => {
    loadFinancialData();
  }, [dateRange]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <DollarSign className="h-8 w-8 text-blue-600" />
                Financial Management
              </h1>
              <p className="text-gray-600 mt-2">
                Sistema completo de gestão financeira
              </p>
            </div>
            <div className="flex gap-3">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="thisMonth">Este Mês</option>
                <option value="lastMonth">Mês Passado</option>
                <option value="thisQuarter">Este Trimestre</option>
                <option value="thisYear">Este Ano</option>
                <option value="lastYear">Ano Passado</option>
              </select>
              <Button
                variant="outline"
                onClick={loadFinancialData}
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Atualizar
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowInvoiceModal(true)}
              >
                <Receipt className="h-4 w-4 mr-2" />
                Nova Fatura
              </Button>
              <Button
                onClick={() => setShowTransactionModal(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nova Transação
              </Button>
            </div>
          </div>
        </div>

        {/* Estatísticas Financeiras */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Receitas</p>
                  <p className="text-2xl font-bold text-green-600">
                    R$ {stats.totalIncome.toLocaleString()}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Despesas</p>
                  <p className="text-2xl font-bold text-red-600">
                    R$ {stats.totalExpenses.toLocaleString()}
                  </p>
                </div>
                <TrendingDown className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Lucro Líquido</p>
                  <p className={`text-2xl font-bold ${stats.netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    R$ {stats.netIncome.toLocaleString()}
                  </p>
                </div>
                <DollarSign className={`h-8 w-8 ${stats.netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Faturas Pendentes</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.pendingInvoices}</p>
                </div>
                <Receipt className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs do Financial Management */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="transactions">Transações</TabsTrigger>
            <TabsTrigger value="accounts">Contas</TabsTrigger>
            <TabsTrigger value="invoices">Faturas</TabsTrigger>
            <TabsTrigger value="reports">Relatórios</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            {/* Gráficos do Dashboard */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Receitas vs Despesas</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData.monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`R$ ${value.toLocaleString()}`, '']} />
                      <Legend />
                      <Bar dataKey="receitas" fill="#10B981" name="Receitas" />
                      <Bar dataKey="despesas" fill="#EF4444" name="Despesas" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {renderPieChart(chartData.expenseCategories, 'Despesas por Categoria')}
            </div>

            {/* Resumo de Contas */}
            <Card>
              <CardHeader>
                <CardTitle>Resumo de Contas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {accounts.slice(0, 3).map(account => {
                    const balance = transactions
                      .filter(t => t.accountId === account.id)
                      .reduce((sum, t) => sum + (t.type === 'income' ? t.amount : -t.amount), account.initialBalance || 0);
                    
                    return (
                      <div key={account.id} className="p-4 border rounded-lg">
                        <h4 className="font-medium mb-2">{account.name}</h4>
                        <p className={`text-2xl font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          R$ {balance.toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-600">{account.type}</p>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transactions" className="space-y-6">
            {/* Filtros */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Buscar transações..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <select
                      value={filters.type}
                      onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">Todos os Tipos</option>
                      {Object.entries(transactionTypes).map(([key, type]) => (
                        <option key={key} value={key}>{type.name}</option>
                      ))}
                    </select>

                    <select
                      value={filters.category}
                      onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">Todas as Categorias</option>
                      {categories.map(category => (
                        <option key={category.id} value={category.id}>{category.name}</option>
                      ))}
                    </select>

                    <select
                      value={filters.account}
                      onChange={(e) => setFilters(prev => ({ ...prev, account: e.target.value }))}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">Todas as Contas</option>
                      {accounts.map(account => (
                        <option key={account.id} value={account.id}>{account.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Lista de Transações */}
            <Card>
              <CardHeader>
                <CardTitle>Transações Recentes</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-2">Carregando transações...</span>
                  </div>
                ) : filteredTransactions.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <DollarSign className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Nenhuma transação encontrada</p>
                  </div>
                ) : (
                  <div className="max-h-96 overflow-y-auto">
                    {filteredTransactions.map(renderTransaction)}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="accounts" className="space-y-6">
            {/* Lista de Contas */}
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2">Carregando contas...</span>
              </div>
            ) : accounts.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Wallet className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Nenhuma conta encontrada
                  </h3>
                  <p className="text-gray-500">
                    Adicione contas bancárias para gerenciar suas finanças
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {accounts.map(renderAccount)}
              </div>
            )}
          </TabsContent>

          <TabsContent value="invoices" className="space-y-6">
            {/* Lista de Faturas */}
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2">Carregando faturas...</span>
              </div>
            ) : invoices.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Receipt className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Nenhuma fatura encontrada
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Crie sua primeira fatura para começar
                  </p>
                  <Button onClick={() => setShowInvoiceModal(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Criar Fatura
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {invoices.map(renderInvoice)}
              </div>
            )}
          </TabsContent>

          <TabsContent value="reports">
            <Card>
              <CardContent className="p-12 text-center">
                <BarChart3 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Relatórios Financeiros
                </h3>
                <p className="text-gray-500">
                  Relatórios detalhados e análises financeiras serão implementados aqui
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Modais serão implementados na próxima parte */}
        {showTransactionModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">Nova Transação</h2>
              {/* Formulário será implementado */}
              <div className="flex justify-end gap-3 mt-6">
                <Button variant="outline" onClick={() => setShowTransactionModal(false)}>
                  Cancelar
                </Button>
                <Button disabled={loading}>
                  {loading ? 'Criando...' : 'Criar Transação'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FinancialManagement;
