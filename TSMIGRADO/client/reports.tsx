import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { 
  Plus, 
  Search, 
  FileText, 
  Edit, 
  Trash2, 
  Play,
  Download,
  Calendar,
  Mail,
  Settings,
  BarChart3
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Reports() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingReport, setEditingReport] = useState<any>(null);
  const [newReport, setNewReport] = useState({
    name: "",
    description: "",
    type: "client_summary",
    schedule: "manual",
    frequency: "",
    isActive: true,
    filters: {
      categories: [] as string[],
      riskProfiles: [] as string[],
      dateRange: "30_days",
      minInvestment: "",
      maxInvestment: ""
    },
    fields: [] as string[],
    deliveryMethod: "email",
    recipients: [] as string[],
    template: "standard"
  });

  const { toast } = useToast();

  const { data: reports, isLoading: reportsLoading } = useQuery({
    queryKey: ['/api/reports'],
    retry: false,
  });

  const { data: categories } = useQuery({
    queryKey: ['/api/categories'],
    retry: false,
  });

  const createReportMutation = useMutation({
    mutationFn: async (reportData: any) => {
      const processedData = {
        ...reportData,
        filters: {
          ...reportData.filters,
          minInvestment: reportData.filters.minInvestment ? parseFloat(reportData.filters.minInvestment) : null,
          maxInvestment: reportData.filters.maxInvestment ? parseFloat(reportData.filters.maxInvestment) : null,
        }
      };
      await apiRequest('POST', '/api/reports', processedData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/reports'] });
      setIsCreateDialogOpen(false);
      resetForm();
      toast({
        title: "Relatório criado",
        description: "Template de relatório foi criado com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Falha ao criar relatório.",
        variant: "destructive",
      });
    },
  });

  const updateReportMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string, data: any }) => {
      const processedData = {
        ...data,
        filters: {
          ...data.filters,
          minInvestment: data.filters.minInvestment ? parseFloat(data.filters.minInvestment) : null,
          maxInvestment: data.filters.maxInvestment ? parseFloat(data.filters.maxInvestment) : null,
        }
      };
      await apiRequest('PUT', `/api/reports/${id}`, processedData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/reports'] });
      setEditingReport(null);
      resetForm();
      toast({
        title: "Relatório atualizado",
        description: "Relatório foi atualizado com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Falha ao atualizar relatório.",
        variant: "destructive",
      });
    },
  });

  const deleteReportMutation = useMutation({
    mutationFn: async (reportId: string) => {
      await apiRequest('DELETE', `/api/reports/${reportId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/reports'] });
      toast({
        title: "Relatório excluído",
        description: "Relatório foi excluído com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Falha ao excluir relatório.",
        variant: "destructive",
      });
    },
  });

  const generateReportMutation = useMutation({
    mutationFn: async (reportId: string) => {
      const response = await apiRequest('POST', `/api/reports/${reportId}/generate`);
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Relatório gerado",
        description: "Relatório foi gerado e enviado com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Falha ao gerar relatório.",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setNewReport({
      name: "",
      description: "",
      type: "client_summary",
      schedule: "manual",
      frequency: "",
      isActive: true,
      filters: {
        categories: [],
        riskProfiles: [],
        dateRange: "30_days",
        minInvestment: "",
        maxInvestment: ""
      },
      fields: [],
      deliveryMethod: "email",
      recipients: [],
      template: "standard"
    });
  };

  const handleEdit = (report: any) => {
    setNewReport({
      name: report.name || "",
      description: report.description || "",
      type: report.type || "client_summary",
      schedule: report.schedule || "manual",
      frequency: report.frequency || "",
      isActive: report.isActive !== false,
      filters: {
        categories: report.filters?.categories || [],
        riskProfiles: report.filters?.riskProfiles || [],
        dateRange: report.filters?.dateRange || "30_days",
        minInvestment: report.filters?.minInvestment?.toString() || "",
        maxInvestment: report.filters?.maxInvestment?.toString() || ""
      },
      fields: report.fields || [],
      deliveryMethod: report.deliveryMethod || "email",
      recipients: report.recipients || [],
      template: report.template || "standard"
    });
    setEditingReport(report);
  };

  const handleSubmit = () => {
    if (!newReport.name.trim()) {
      toast({
        title: "Erro",
        description: "Nome do relatório é obrigatório.",
        variant: "destructive",
      });
      return;
    }

    if (editingReport) {
      updateReportMutation.mutate({ id: editingReport.id, data: newReport });
    } else {
      createReportMutation.mutate(newReport);
    }
  };

  const handleCategoryToggle = (categoryId: string) => {
    setNewReport(prev => ({
      ...prev,
      filters: {
        ...prev.filters,
        categories: prev.filters.categories.includes(categoryId)
          ? prev.filters.categories.filter(c => c !== categoryId)
          : [...prev.filters.categories, categoryId]
      }
    }));
  };

  const handleRiskProfileToggle = (profile: string) => {
    setNewReport(prev => ({
      ...prev,
      filters: {
        ...prev.filters,
        riskProfiles: prev.filters.riskProfiles.includes(profile)
          ? prev.filters.riskProfiles.filter(p => p !== profile)
          : [...prev.filters.riskProfiles, profile]
      }
    }));
  };

  const handleFieldToggle = (field: string) => {
    setNewReport(prev => ({
      ...prev,
      fields: prev.fields.includes(field)
        ? prev.fields.filter(f => f !== field)
        : [...prev.fields, field]
    }));
  };

  const handleRecipientAdd = (email: string) => {
    if (email && !newReport.recipients.includes(email)) {
      setNewReport(prev => ({
        ...prev,
        recipients: [...prev.recipients, email]
      }));
    }
  };

  const handleRecipientRemove = (email: string) => {
    setNewReport(prev => ({
      ...prev,
      recipients: prev.recipients.filter(r => r !== email)
    }));
  };

  const filteredReports = (reports || []).filter((report: any) =>
    report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'client_summary':
        return 'Resumo de Clientes';
      case 'portfolio_performance':
        return 'Performance de Portfólio';
      case 'activity_report':
        return 'Relatório de Atividades';
      case 'risk_analysis':
        return 'Análise de Risco';
      case 'workflow_metrics':
        return 'Métricas de Workflows';
      default:
        return type;
    }
  };

  const getScheduleLabel = (schedule: string) => {
    switch (schedule) {
      case 'manual':
        return 'Manual';
      case 'daily':
        return 'Diário';
      case 'weekly':
        return 'Semanal';
      case 'monthly':
        return 'Mensal';
      case 'quarterly':
        return 'Trimestral';
      default:
        return schedule;
    }
  };

  const availableFields = [
    { id: 'client_name', label: 'Nome do Cliente' },
    { id: 'email', label: 'Email' },
    { id: 'phone', label: 'Telefone' },
    { id: 'current_investment', label: 'Investimento Atual' },
    { id: 'risk_profile', label: 'Perfil de Risco' },
    { id: 'category', label: 'Categoria' },
    { id: 'last_activity', label: 'Última Atividade' },
    { id: 'portfolio_value', label: 'Valor do Portfólio' },
    { id: 'returns', label: 'Retornos' },
    { id: 'fees', label: 'Taxas' }
  ];

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Relatórios</h1>
            <p className="text-sm text-gray-600 mt-1">
              Configure e gerencie relatórios automatizados
            </p>
          </div>
          <Dialog open={isCreateDialogOpen || !!editingReport} onOpenChange={(open) => {
            setIsCreateDialogOpen(open);
            if (!open) {
              setEditingReport(null);
              resetForm();
            }
          }}>
            <DialogTrigger asChild>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Novo Relatório
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingReport ? 'Editar' : 'Criar'} Relatório</DialogTitle>
                <DialogDescription>
                  Configure um template de relatório com filtros e entrega automatizada.
                </DialogDescription>
              </DialogHeader>
              
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="basic">Básico</TabsTrigger>
                  <TabsTrigger value="filters">Filtros</TabsTrigger>
                  <TabsTrigger value="fields">Campos</TabsTrigger>
                  <TabsTrigger value="delivery">Entrega</TabsTrigger>
                </TabsList>
                
                <TabsContent value="basic" className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <Label htmlFor="name">Nome do Relatório</Label>
                      <Input
                        id="name"
                        value={newReport.name}
                        onChange={(e) => setNewReport(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Ex: Relatório Mensal de Clientes Premium"
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">Descrição</Label>
                      <Textarea
                        id="description"
                        value={newReport.description}
                        onChange={(e) => setNewReport(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Descreva o propósito deste relatório..."
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="type">Tipo de Relatório</Label>
                        <Select value={newReport.type} onValueChange={(value) => setNewReport(prev => ({ ...prev, type: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o tipo" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="client_summary">Resumo de Clientes</SelectItem>
                            <SelectItem value="portfolio_performance">Performance de Portfólio</SelectItem>
                            <SelectItem value="activity_report">Relatório de Atividades</SelectItem>
                            <SelectItem value="risk_analysis">Análise de Risco</SelectItem>
                            <SelectItem value="workflow_metrics">Métricas de Workflows</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="template">Template</Label>
                        <Select value={newReport.template} onValueChange={(value) => setNewReport(prev => ({ ...prev, template: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o template" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="standard">Padrão</SelectItem>
                            <SelectItem value="executive">Executivo</SelectItem>
                            <SelectItem value="detailed">Detalhado</SelectItem>
                            <SelectItem value="summary">Resumo</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="schedule">Agendamento</Label>
                        <Select value={newReport.schedule} onValueChange={(value) => setNewReport(prev => ({ ...prev, schedule: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a frequência" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="manual">Manual</SelectItem>
                            <SelectItem value="daily">Diário</SelectItem>
                            <SelectItem value="weekly">Semanal</SelectItem>
                            <SelectItem value="monthly">Mensal</SelectItem>
                            <SelectItem value="quarterly">Trimestral</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      {newReport.schedule !== 'manual' && (
                        <div>
                          <Label htmlFor="frequency">Horário</Label>
                          <Input
                            id="frequency"
                            type="time"
                            value={newReport.frequency}
                            onChange={(e) => setNewReport(prev => ({ ...prev, frequency: e.target.value }))}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="filters" className="space-y-4">
                  <div className="space-y-4">
                    <div>
                      <Label>Categorias de Cliente</Label>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        {(categories || []).map((category: any) => (
                          <div key={category.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`category-${category.id}`}
                              checked={newReport.filters.categories.includes(category.id)}
                              onCheckedChange={() => handleCategoryToggle(category.id)}
                            />
                            <Label htmlFor={`category-${category.id}`}>{category.name}</Label>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <Label>Perfis de Risco</Label>
                      <div className="flex gap-4 mt-2">
                        {['conservative', 'moderate', 'aggressive'].map((profile) => (
                          <div key={profile} className="flex items-center space-x-2">
                            <Checkbox
                              id={`risk-${profile}`}
                              checked={newReport.filters.riskProfiles.includes(profile)}
                              onCheckedChange={() => handleRiskProfileToggle(profile)}
                            />
                            <Label htmlFor={`risk-${profile}`}>
                              {profile === 'conservative' ? 'Conservador' : 
                               profile === 'moderate' ? 'Moderado' : 'Agressivo'}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="dateRange">Período dos Dados</Label>
                      <Select value={newReport.filters.dateRange} onValueChange={(value) => setNewReport(prev => ({
                        ...prev,
                        filters: { ...prev.filters, dateRange: value }
                      }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o período" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="7_days">Últimos 7 dias</SelectItem>
                          <SelectItem value="30_days">Últimos 30 dias</SelectItem>
                          <SelectItem value="90_days">Últimos 90 dias</SelectItem>
                          <SelectItem value="180_days">Últimos 6 meses</SelectItem>
                          <SelectItem value="365_days">Último ano</SelectItem>
                          <SelectItem value="all_time">Todo o período</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="minInvestment">Investimento Mínimo</Label>
                        <Input
                          id="minInvestment"
                          type="number"
                          value={newReport.filters.minInvestment}
                          onChange={(e) => setNewReport(prev => ({
                            ...prev,
                            filters: { ...prev.filters, minInvestment: e.target.value }
                          }))}
                          placeholder="0.00"
                        />
                      </div>
                      <div>
                        <Label htmlFor="maxInvestment">Investimento Máximo</Label>
                        <Input
                          id="maxInvestment"
                          type="number"
                          value={newReport.filters.maxInvestment}
                          onChange={(e) => setNewReport(prev => ({
                            ...prev,
                            filters: { ...prev.filters, maxInvestment: e.target.value }
                          }))}
                          placeholder="Deixe vazio para ilimitado"
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="fields" className="space-y-4">
                  <div>
                    <Label>Campos a Incluir no Relatório</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {availableFields.map((field) => (
                        <div key={field.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`field-${field.id}`}
                            checked={newReport.fields.includes(field.id)}
                            onCheckedChange={() => handleFieldToggle(field.id)}
                          />
                          <Label htmlFor={`field-${field.id}`}>{field.label}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="delivery" className="space-y-4">
                  <div>
                    <Label htmlFor="deliveryMethod">Método de Entrega</Label>
                    <Select value={newReport.deliveryMethod} onValueChange={(value) => setNewReport(prev => ({ ...prev, deliveryMethod: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o método" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="download">Download</SelectItem>
                        <SelectItem value="webhook">Webhook</SelectItem>
                        <SelectItem value="api">API</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {newReport.deliveryMethod === 'email' && (
                    <div>
                      <Label>Destinatários</Label>
                      <div className="space-y-2 mt-2">
                        <div className="flex gap-2">
                          <Input
                            placeholder="email@exemplo.com"
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                handleRecipientAdd((e.target as HTMLInputElement).value);
                                (e.target as HTMLInputElement).value = '';
                              }
                            }}
                          />
                          <Button type="button" variant="outline" size="sm">
                            Adicionar
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {newReport.recipients.map((email) => (
                            <Badge key={email} variant="secondary" className="cursor-pointer" onClick={() => handleRecipientRemove(email)}>
                              {email} ×
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isActive"
                      checked={newReport.isActive}
                      onCheckedChange={(checked) => setNewReport(prev => ({ ...prev, isActive: !!checked }))}
                    />
                    <Label htmlFor="isActive">Relatório ativo</Label>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex gap-2 mt-6">
                <Button onClick={handleSubmit} disabled={createReportMutation.isPending || updateReportMutation.isPending}>
                  {editingReport ? 'Atualizar' : 'Criar'} Relatório
                </Button>
                <Button variant="outline" onClick={() => {
                  setIsCreateDialogOpen(false);
                  setEditingReport(null);
                  resetForm();
                }}>
                  Cancelar
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      {/* Search */}
      <div className="px-6 py-4 bg-gray-50 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Buscar relatórios..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Reports List */}
      <main className="flex-1 overflow-y-auto p-6">
        {reportsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-6 w-32 mb-2" />
                  <Skeleton className="h-4 w-full mb-4" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredReports.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredReports.map((report: any) => (
              <Card key={report.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      <FileText className="w-5 h-5 text-primary-500" />
                      <div>
                        <CardTitle className="text-lg">{report.name}</CardTitle>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="outline">{getTypeLabel(report.type)}</Badge>
                          {!report.isActive && (
                            <Badge variant="secondary">Inativo</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => generateReportMutation.mutate(report.id)}
                        disabled={generateReportMutation.isPending}
                      >
                        <Play className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(report)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteReportMutation.mutate(report.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm mb-4">
                    {report.description || 'Sem descrição'}
                  </p>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Agendamento:</span>
                      <Badge variant="outline">{getScheduleLabel(report.schedule)}</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Entrega:</span>
                      <div className="flex items-center space-x-1">
                        {report.deliveryMethod === 'email' && <Mail className="w-4 h-4" />}
                        {report.deliveryMethod === 'download' && <Download className="w-4 h-4" />}
                        <span className="text-sm font-medium">{report.deliveryMethod}</span>
                      </div>
                    </div>
                    
                    {report.recipients && report.recipients.length > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Destinatários:</span>
                        <span className="text-sm font-medium">{report.recipients.length}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Campos:</span>
                      <span className="text-sm font-medium">{report.fields?.length || 0}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum relatório encontrado</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm ? 'Nenhum relatório corresponde aos critérios de busca.' : 'Crie seu primeiro template de relatório.'}
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Novo Relatório
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}