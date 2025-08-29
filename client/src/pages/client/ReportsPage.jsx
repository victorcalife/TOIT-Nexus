import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import {  
  FileText, 
  Plus, 
  Search, 
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  Copy,
  Clock,
  Calendar,
  BarChart3,
  PieChart,
  TrendingUp,
  FileSpreadsheet,
  FilePdf,
  Mail,
  Share2,
  Settings,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const ReportsPage = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [reports, setReports] = useState([]);

  // Simular dados de relatórios
  useEffect(() => {
    const mockReports = [
      {
        id: '1',
        name: 'Relatório de Vendas Mensal',
        description: 'Análise completa das vendas do mês atual',
        category: 'vendas',
        type: 'dashboard',
        status: 'published',
        lastGenerated: '2024-01-15T10:30:00Z',
        nextScheduled: '2024-02-01T08:00:00Z',
        format: ['pdf', 'excel'],
        recipients: ['gerencia@empresa.com', 'vendas@empresa.com'],
        size: '2.5 MB',
        downloads: 45,
        views: 128,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-14T15:30:00Z',
        isScheduled: true,
        schedule: 'monthly'
      },
      {
        id: '2',
        name: 'Dashboard de Performance',
        description: 'Métricas de performance em tempo real',
        category: 'performance',
        type: 'dashboard',
        status: 'published',
        lastGenerated: '2024-01-15T11:00:00Z',
        nextScheduled: null,
        format: ['web'],
        recipients: [],
        size: 'N/A',
        downloads: 0,
        views: 256,
        createdAt: '2024-01-05T00:00:00Z',
        updatedAt: '2024-01-15T11:00:00Z',
        isScheduled: false,
        schedule: null
      },
      {
        id: '3',
        name: 'Análise de Estoque',
        description: 'Relatório detalhado do status do estoque',
        category: 'estoque',
        type: 'report',
        status: 'draft',
        lastGenerated: null,
        nextScheduled: null,
        format: ['pdf', 'excel'],
        recipients: ['estoque@empresa.com'],
        size: 'N/A',
        downloads: 0,
        views: 12,
        createdAt: '2024-01-10T00:00:00Z',
        updatedAt: '2024-01-12T14:20:00Z',
        isScheduled: false,
        schedule: null
      },
      {
        id: '4',
        name: 'Relatório Financeiro Semanal',
        description: 'Resumo financeiro da semana',
        category: 'financeiro',
        type: 'report',
        status: 'error',
        lastGenerated: '2024-01-14T08:00:00Z',
        nextScheduled: '2024-01-21T08:00:00Z',
        format: ['pdf'],
        recipients: ['financeiro@empresa.com', 'diretoria@empresa.com'],
        size: '1.8 MB',
        downloads: 23,
        views: 67,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-14T08:00:00Z',
        isScheduled: true,
        schedule: 'weekly'
      },
      {
        id: '5',
        name: 'Análise de Clientes',
        description: 'Segmentação e análise comportamental de clientes',
        category: 'clientes',
        type: 'analytics',
        status: 'published',
        lastGenerated: '2024-01-15T09:15:00Z',
        nextScheduled: '2024-01-22T09:15:00Z',
        format: ['pdf', 'excel', 'web'],
        recipients: ['marketing@empresa.com'],
        size: '4.2 MB',
        downloads: 18,
        views: 89,
        createdAt: '2024-01-08T00:00:00Z',
        updatedAt: '2024-01-15T09:15:00Z',
        isScheduled: true,
        schedule: 'weekly'
      }
    ];
    setReports(mockReports);
  }, []);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'published':
        return <FileText className="h-4 w-4 text-green-600" />;
      case 'draft':
        return <Edit className="h-4 w-4 text-yellow-600" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'generating':
        return <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />;
      default:
        return <FileText className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'published':
        return <Badge className="bg-green-100 text-green-800">Publicado</Badge>;
      case 'draft':
        return <Badge className="bg-yellow-100 text-yellow-800">Rascunho</Badge>;
      case 'error':
        return <Badge variant="destructive">Erro</Badge>;
      case 'generating':
        return <Badge className="bg-blue-100 text-blue-800">Gerando</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'dashboard':
        return <BarChart3 className="h-4 w-4 text-blue-600" />;
      case 'report':
        return <FileText className="h-4 w-4 text-green-600" />;
      case 'analytics':
        return <PieChart className="h-4 w-4 text-purple-600" />;
      default:
        return <FileText className="h-4 w-4 text-gray-600" />;
    }
  };

  const getFormatIcon = (format) => {
    switch (format) {
      case 'pdf':
        return <FilePdf className="h-3 w-3 text-red-600" />;
      case 'excel':
        return <FileSpreadsheet className="h-3 w-3 text-green-600" />;
      case 'web':
        return <BarChart3 className="h-3 w-3 text-blue-600" />;
      default:
        return <FileText className="h-3 w-3 text-gray-600" />;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || report.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || report.status === selectedStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleGenerateReport = async (reportId) => {
    setIsLoading(true);
    try {
      // Simular geração do relatório
      await new Promise(resolve => setTimeout(resolve, 3000));
      console.log('Gerando relatório:', reportId);
      // Aqui seria feita a chamada real para a API
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadReport = (reportId, format) => {
    console.log('Baixando relatório:', reportId, 'formato:', format);
    // Aqui seria feita a chamada real para download
  };

  const handleShareReport = (reportId) => {
    console.log('Compartilhando relatório:', reportId);
    // Aqui seria implementada a funcionalidade de compartilhamento
  };

  const categories = [
    { value: 'all', label: 'Todas' },
    { value: 'vendas', label: 'Vendas' },
    { value: 'financeiro', label: 'Financeiro' },
    { value: 'estoque', label: 'Estoque' },
    { value: 'clientes', label: 'Clientes' },
    { value: 'performance', label: 'Performance' }
  ];

  const statuses = [
    { value: 'all', label: 'Todos' },
    { value: 'published', label: 'Publicado' },
    { value: 'draft', label: 'Rascunho' },
    { value: 'error', label: 'Erro' },
    { value: 'generating', label: 'Gerando' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Relatórios</h1>
          <p className="text-gray-600 mt-1">
            Crie, gerencie e compartilhe relatórios e dashboards
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Configurações
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Novo Relatório
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Relatórios</p>
                <p className="text-2xl font-bold text-gray-900">{reports.length}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Publicados</p>
                <p className="text-2xl font-bold text-green-600">
                  {reports.filter(r => r.status === 'published').length}
                </p>
              </div>
              <FileText className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Downloads</p>
                <p className="text-2xl font-bold text-blue-600">
                  {reports.reduce((acc, r) => acc + r.downloads, 0)}
                </p>
              </div>
              <Download className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Visualizações</p>
                <p className="text-2xl font-bold text-purple-600">
                  {reports.reduce((acc, r) => acc + r.views, 0)}
                </p>
              </div>
              <Eye className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Buscar relatórios</Label>
              <div className="relative mt-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Digite o nome ou descrição..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="category">Categoria</Label>
              <select
                id="category"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {statuses.map(status => (
                  <option key={status.value} value={status.value}>{status.label}</option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reports List */}
      <div className="grid gap-6">
        {filteredReports.map((report) => (
          <Card key={report.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(report.status)}
                    {getTypeIcon(report.type)}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{report.name}</CardTitle>
                    <CardDescription className="mt-1">
                      {report.description}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusBadge(report.status)}
                  <Badge variant="outline" className="text-xs">
                    {report.category}
                  </Badge>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Report Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Downloads</p>
                  <p className="font-semibold">{report.downloads}</p>
                </div>
                <div>
                  <p className="text-gray-600">Visualizações</p>
                  <p className="font-semibold">{report.views}</p>
                </div>
                <div>
                  <p className="text-gray-600">Tamanho</p>
                  <p className="font-semibold">{report.size}</p>
                </div>
                <div>
                  <p className="text-gray-600">Formatos</p>
                  <div className="flex flex-wrap gap-1">
                    {report.format.map((format, index) => (
                      <div key={index} className="flex items-center space-x-1">
                        {getFormatIcon(format)}
                        <span className="text-xs">{format.toUpperCase()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Schedule and Generation Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm border-t pt-4">
                <div>
                  <p className="text-gray-600">Última Geração</p>
                  <p className="font-medium">{formatDate(report.lastGenerated)}</p>
                </div>
                <div>
                  <p className="text-gray-600">Próxima Geração</p>
                  <p className="font-medium">
                    {report.nextScheduled ? formatDate(report.nextScheduled) : 'Manual'}
                  </p>
                </div>
              </div>

              {/* Recipients */}
              {report.recipients.length > 0 && (
                <div className="text-sm border-t pt-4">
                  <p className="text-gray-600 mb-2">Destinatários</p>
                  <div className="flex flex-wrap gap-2">
                    {report.recipients.map((email, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        <Mail className="h-3 w-3 mr-1" />
                        {email}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2 pt-4 border-t">
                <Button 
                  size="sm" 
                  onClick={() => handleGenerateReport(report.id)}
                  disabled={isLoading || report.status === 'generating'}
                >
                  <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
                  Gerar
                </Button>

                {report.status === 'published' && (
                  <>
                    <Button size="sm" variant="outline">
                      <Eye className="h-4 w-4 mr-1" />
                      Visualizar
                    </Button>

                    {report.format.map((format, index) => (
                      <Button 
                        key={index}
                        size="sm" 
                        variant="outline"
                        onClick={() => handleDownloadReport(report.id, format)}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        {format.toUpperCase()}
                      </Button>
                    ))}
                  </>
                )}
                
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleShareReport(report.id)}
                >
                  <Share2 className="h-4 w-4 mr-1" />
                  Compartilhar
                </Button>

                <Button size="sm" variant="outline">
                  <Edit className="h-4 w-4 mr-1" />
                  Editar
                </Button>

                <Button size="sm" variant="outline">
                  <Copy className="h-4 w-4 mr-1" />
                  Duplicar
                </Button>

                <Button size="sm" variant="outline">
                  <Settings className="h-4 w-4 mr-1" />
                  Configurar
                </Button>

                <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                  <Trash2 className="h-4 w-4 mr-1" />
                  Excluir
                </Button>

              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredReports.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {searchTerm || selectedCategory !== 'all' || selectedStatus !== 'all' ? 
                'Nenhum relatório encontrado' : 
                'Nenhum relatório criado'
              }
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || selectedCategory !== 'all' || selectedStatus !== 'all' ? 
                'Tente ajustar os filtros de busca.' : 
                'Comece criando seu primeiro relatório.'
              }
            </p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Criar Primeiro Relatório
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex items-center space-x-3">
            <LoadingSpinner size="sm" />
            <span>Gerando relatório...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsPage;