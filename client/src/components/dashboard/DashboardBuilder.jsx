import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import {  
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area, ScatterChart, Scatter }
} from 'recharts';
import {  





  Trash2, 









  BarChart3,
  LineChart as LineChartIcon,
  PieChart as PieChartIcon,











 }
} from 'lucide-react';

const CHART_TYPES = [
  { id: 'bar', name: 'Barras', icon: BarChart3, component: BarChart },
  { id: 'line', name: 'Linha', icon: LineChartIcon, component: LineChart },
  { id: 'pie', name: 'Pizza', icon: PieChartIcon, component: PieChart },
  { id: 'area', name: 'Área', icon: Activity, component: AreaChart },
  { id: 'scatter', name: 'Dispersão', icon: Target, component: ScatterChart }
];

const KPI_TYPES = [
  { id: 'number', name: 'Número', icon: Gauge },
  { id: 'percentage', name: 'Porcentagem', icon: TrendingUp },
  { id: 'currency', name: 'Moeda', icon: Activity },
  { id: 'progress', name: 'Progresso', icon: Target }
];

const COLOR_PALETTES = [
  { name: 'Azul Corporativo', colors: ['#1e40af', '#3b82f6', '#60a5fa', '#93c5fd', '#dbeafe'] },
  { name: 'Verde Sucesso', colors: ['#166534', '#16a34a', '#22c55e', '#4ade80', '#bbf7d0'] },
  { name: 'Roxo Moderno', colors: ['#7c3aed', '#8b5cf6', '#a78bfa', '#c4b5fd', '#e9d5ff'] },
  { name: 'Laranja Energia', colors: ['#ea580c', '#f97316', '#fb923c', '#fdba74', '#fed7aa'] },
  { name: 'Rosa Criativo', colors: ['#be185d', '#e11d48', '#f43f5e', '#fb7185', '#fda4af'] }
];

export default function DashboardBuilder({ dashboardId, onSave, onClose }) {
  const { toast } = useToast();
  
  // Dashboard State
  const [dashboard, setDashboard] = useState({
    id: dashboardId || null,
    name: '',
    description: '',
    layout: 'grid',
    theme: 'light',
    colorPalette: COLOR_PALETTES[0],
    widgets: [],
    filters: [],
    refreshInterval: 30000,
    isPublic: false,
    tags: []
  });

  // Builder State
  const [selectedWidget, setSelectedWidget] = useState(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [showWidgetDialog, setShowWidgetDialog] = useState(false);
  const [showDataSourceDialog, setShowDataSourceDialog] = useState(false);
  const [showStyleDialog, setShowStyleDialog] = useState(false);
  
  // Widget Creation State
  const [newWidget, setNewWidget] = useState({
    type: 'kpi',
    chartType: 'bar',
    title: '',
    dataSource: '',
    query: '',
    x: 0,
    y: 0,
    width: 4,
    height: 3,
    config: {}
  });

  // Data Sources
  const [dataSources, setDataSources] = useState([]);
  const [newDataSource, setNewDataSource] = useState({
    name: '',
    type: 'mysql',
    host: '',
    port: 3306,
    database: '',
    username: '',
    password: '',
    url: ''
  });

  // MILA Integration
  const [milaInsights, setMilaInsights] = useState([]);
  const [quantumEnhanced, setQuantumEnhanced] = useState(true);

  useEffect(() => {
    if (dashboardId) {
      loadDashboard();
    }
    loadDataSources();
    loadMilaInsights();
  }, [dashboardId]);

  const loadDashboard = async () => {
    try {
      const response = await fetch(`/api/dashboards/${dashboardId}`, {
        headers: {`
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setDashboard(data.dashboard);
      }
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
    }
  };

  const loadDataSources = async () => {
    try {
      const response = await fetch('/api/data-sources', {
        headers: {`
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setDataSources(data.dataSources || []);
      }
    } catch (error) {
      // Mock data sources
      setDataSources([
        {
          id: 'ds_1',
          name: 'Banco Principal',
          type: 'mysql',
          host: 'api.toit.com.br',
          database: 'toit_nexus',
          status: 'connected'
        },
        {
          id: 'ds_2',
          name: 'Analytics DB',
          type: 'postgresql',
          host: 'analytics.toit.com.br',
          database: 'analytics',
          status: 'connected'
        }
      ]);
    }
  };

  const loadMilaInsights = async () => {
    try {
      const response = await fetch('/api/mila/dashboard-insights', {
        method: 'POST',
        headers: {`
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          dashboardId,
          useQuantumAnalysis: quantumEnhanced
        })
      });

      if (response.ok) {
        const data = await response.json();
        setMilaInsights(data.insights || []);
      }
    } catch (error) {
      // Mock MILA insights
      setMilaInsights([
        {
          id: 1,
          type: 'optimization',
          title: 'Otimização de Layout Detectada',
          message: 'MILA sugere reorganizar widgets para melhor visualização baseado em padrões de uso.',
          confidence: 0.92,
          action: 'optimize_layout'
        },
        {
          id: 2,
          type: 'data_insight',
          title: 'Padrão Anômalo Identificado',
          message: 'Algoritmo quântico detectou anomalia nos dados de vendas. Investigação recomendada.',
          confidence: 0.87,
          action: 'investigate_anomaly'
        }
      ]);
    }
  };

  const saveDashboard = async () => {
    try {
      const method = dashboard.id ? 'PUT' : 'POST';`
      const url = dashboard.id ? `/api/dashboards/${dashboard.id}` : '/api/dashboards';

      const response = await fetch(url, {
        method,
        headers: {`
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...dashboard,
          quantumEnhanced,
          milaProcessed: true
        })
      });

      if (response.ok) {
        const data = await response.json();
        setDashboard(data.dashboard);
        
        toast({
          title: "✅ Dashboard salvo",
          description: "Dashboard salvo com sucesso no workspace"
        });

        if (onSave) onSave(data.dashboard);
      }
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: "Falha ao salvar dashboard",
        variant: "destructive"
      });
    }
  };

  const addWidget = () => {
    const widget = {
      ...newWidget,`
      id: `widget_${Date.now()}`,
      createdAt: new Date()
    };

    setDashboard(prev => ({
      ...prev,
      widgets: [...prev.widgets, widget]
    }));

    setNewWidget({
      type: 'kpi',
      chartType: 'bar',
      title: '',
      dataSource: '',
      query: '',
      x: 0,
      y: 0,
      width: 4,
      height: 3,
      config: {}
    });

    setShowWidgetDialog(false);

    toast({
      title: "Widget adicionado",
      description: "Widget adicionado ao dashboard"
    });
  };

  const removeWidget = (widgetId) => {
    setDashboard(prev => ({
      ...prev,
      widgets: prev.widgets.filter(w => w.id !== widgetId)
    }));

    toast({
      title: "Widget removido",
      description: "Widget removido do dashboard"
    });
  };

  const addDataSource = async () => {
    try {
      const response = await fetch('/api/data-sources', {
        method: 'POST',
        headers: {`
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newDataSource)
      });

      if (response.ok) {
        const data = await response.json();
        setDataSources(prev => [...prev, data.dataSource]);
        
        setNewDataSource({
          name: '',
          type: 'mysql',
          host: '',
          port: 3306,
          database: '',
          username: '',
          password: '',
          url: ''
        });

        setShowDataSourceDialog(false);

        toast({
          title: "✅ Fonte de dados adicionada",
          description: "Conexão configurada com sucesso"
        });
      }
    } catch (error) {
      toast({
        title: "Erro na conexão",
        description: "Falha ao conectar com a fonte de dados",
        variant: "destructive"
      });
    }
  };

  const testDataSource = async (dataSource) => {
    try {`
      const response = await fetch(`/api/data-sources/${dataSource.id}/test`, {
        method: 'POST',
        headers: {`
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        toast({
          title: "✅ Conexão OK",
          description: "Fonte de dados conectada com sucesso"
        });
      }
    } catch (error) {
      toast({
        title: "❌ Falha na conexão",
        description: "Não foi possível conectar à fonte de dados",
        variant: "destructive"
      });
    }
  };

  const sendDashboardByEmail = async () => {
    try {
      const response = await fetch('/api/dashboards/send-email', {
        method: 'POST',
        headers: {`
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          dashboardId: dashboard.id,
          format: 'pdf',
          recipients: [], // Será preenchido em dialog`
          subject: `Dashboard: ${dashboard.name}`,
          message: 'Dashboard em anexo gerado automaticamente pelo TOIT NEXUS'
        })
      });

      if (response.ok) {
        toast({
          title: "📧 Email enviado",
          description: "Dashboard enviado por email com sucesso"
        });
      }
    } catch (error) {
      toast({
        title: "Erro no envio",
        description: "Falha ao enviar dashboard por email",
        variant: "destructive"
      });
    }
  };

  const applyMilaOptimization = async (insightId) => {
    try {
      const response = await fetch('/api/mila/apply-dashboard-optimization', {
        method: 'POST',
        headers: {`
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          dashboardId: dashboard.id,
          insightId,
          useQuantumOptimization: quantumEnhanced
        })
      });

      if (response.ok) {
        const data = await response.json();
        setDashboard(data.optimizedDashboard);
        
        toast({
          title: "🧠 MILA Otimização Aplicada",
          description: "Dashboard otimizado com algoritmos quânticos"
        });
      }
    } catch (error) {
      toast({
        title: "Erro na otimização",
        description: "Falha ao aplicar otimização MILA",
        variant: "destructive"
      });
    }
  };

  const renderWidget = (widget) => {
    const ChartComponent = CHART_TYPES.find(t => t.id === widget.chartType)?.component || BarChart;
    
    return (
      <Card key={widget.id} className="relative group">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">{widget.title}</CardTitle>
            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
              <Button size="sm" variant="ghost" onClick={() => setSelectedWidget(widget)}>
                <Edit className="h-3 w-3" />
              </Button>
              <Button size="sm" variant="ghost" onClick={() => removeWidget(widget.id)}>
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {widget.type === 'kpi' ? (
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">1,247</div>
              <div className="text-sm text-muted-foreground">+12.5% vs mês anterior</div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <ChartComponent data={[}
                { name: 'Jan', value: 400 },
                { name: 'Fev', value: 300 },
                { name: 'Mar', value: 500 },
                { name: 'Abr', value: 450 }
              ]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                {widget.chartType === 'bar' && <Bar dataKey="value" fill={dashboard.colorPalette.colors[0]} />}
                {widget.chartType === 'line' && <Line type="monotone" dataKey="value" stroke={dashboard.colorPalette.colors[0]} />}
                {widget.chartType === 'area' && <Area type="monotone" dataKey="value" fill={dashboard.colorPalette.colors[0]} />}
              </ChartComponent>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Input
              placeholder="Nome do dashboard"
              value={dashboard.name}
              onChange={(e) => setDashboard(prev => ({ ...prev, name: e.target.value }))}
              className="w-64"
            />
            <Badge variant={quantumEnhanced ? "default" : "secondary"}>
              <Atom className="w-3 h-3 mr-1" />
              {quantumEnhanced ? 'Quantum Enhanced' : 'Standard'}
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsPreviewMode(!isPreviewMode)}
            >
              <Eye className="w-4 h-4 mr-2" />
              {isPreviewMode ? 'Editar' : 'Preview'}
            </Button>

            <Dialog open={showDataSourceDialog} onOpenChange={setShowDataSourceDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Database className="w-4 h-4 mr-2" />
                  Fontes de Dados
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Gerenciar Fontes de Dados</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  {/* Lista de fontes existentes */}
                  <div className="space-y-2">
                    {dataSources.map((ds) => (
                      <div key={ds.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <div className="font-medium">{ds.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {ds.type.toUpperCase()} - {ds.host}/{ds.database}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={ds.status === 'connected' ? 'default' : 'destructive'}>
                            {ds.status}
                          </Badge>
                          <Button size="sm" variant="outline" onClick={() => testDataSource(ds)}>

                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Adicionar nova fonte */}
                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-3">Adicionar Nova Fonte</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Nome</Label>
                        <Input
                          value={newDataSource.name}
                          onChange={(e) => setNewDataSource(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Nome da fonte"
                        />
                      </div>
                      <div>
                        <Label>Tipo</Label>
                        <Select
                          value={newDataSource.type}
                          onValueChange={(value) => setNewDataSource(prev => ({ ...prev, type: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="mysql">MySQL</SelectItem>
                            <SelectItem value="postgresql">PostgreSQL</SelectItem>
                            <SelectItem value="mongodb">MongoDB</SelectItem>
                            <SelectItem value="sqlite">SQLite</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Host</Label>
                        <Input
                          value={newDataSource.host}
                          onChange={(e) => setNewDataSource(prev => ({ ...prev, host: e.target.value }))}
                          placeholder="api.toit.com.br"
                        />
                      </div>
                      <div>
                        <Label>Porta</Label>
                        <Input
                          type="number"
                          value={newDataSource.port}
                          onChange={(e) => setNewDataSource(prev => ({ ...prev, port: parseInt(e.target.value) }))}
                          placeholder="3306"
                        />
                      </div>
                      <div>
                        <Label>Database</Label>
                        <Input
                          value={newDataSource.database}
                          onChange={(e) => setNewDataSource(prev => ({ ...prev, database: e.target.value }))}
                          placeholder="nome_database"
                        />
                      </div>
                      <div>
                        <Label>Usuário</Label>
                        <Input
                          value={newDataSource.username}
                          onChange={(e) => setNewDataSource(prev => ({ ...prev, username: e.target.value }))}
                          placeholder="usuario"
                        />
                      </div>
                      <div className="col-span-2">
                        <Label>Senha</Label>
                        <Input
                          type="password"
                          value={newDataSource.password}
                          onChange={(e) => setNewDataSource(prev => ({ ...prev, password: e.target.value }))}
                          placeholder="senha"
                        />
                      </div>
                      <div className="col-span-2">
                        <Label>URL de Conexão (Opcional)</Label>
                        <Input
                          value={newDataSource.url}
                          onChange={(e) => setNewDataSource(prev => ({ ...prev, url: e.target.value }))}
                          placeholder="mysql://user:pass@host:port/database"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end mt-4">
                      <Button onClick={addDataSource}>
                        <Plus className="w-4 h-4 mr-2" />
                        Adicionar Fonte
                      </Button>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Button variant="outline" size="sm" onClick={sendDashboardByEmail}>
              <Mail className="w-4 h-4 mr-2" />
              Enviar Email
            </Button>

            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />

            </Button>

            <Button onClick={saveDashboard}>
              <Save className="w-4 h-4 mr-2" />

            </Button>

            {onClose && (
              <Button variant="outline" onClick={onClose}>

              </Button>
            )}
          </div>
        </div>
      </div>

      {/* MILA Insights */}
      ({ milaInsights.length > 0 && (
        <div className="border-b p-4">
          <div className="flex items-center gap-2 mb-3">
            <Brain className="w-4 h-4" />
            <span className="font-medium">Insights MILA</span>
            <Badge variant="secondary">Quantum AI</Badge>
          </div>
          <div className="flex gap-2 overflow-x-auto">
            {milaInsights.map((insight }) => (
              <Card key={insight.id} className="min-w-80">
                <CardContent className="p-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{insight.title}</h4>
                      <p className="text-xs text-muted-foreground mt-1">{insight.message}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Progress value={insight.confidence * 100} className="w-16 h-1" />
                        <span className="text-xs">{(insight.confidence * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                    <Button size="sm" onClick={() => applyMilaOptimization(insight.id)}>
                      <Zap className="w-3 h-3 mr-1" />

                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 flex">
        {/* Sidebar */}
        ({ !isPreviewMode && (
          <div className="w-80 border-r p-4 space-y-4">
            <div>
              <h3 className="font-medium mb-3">Widgets</h3>
              <div className="grid grid-cols-2 gap-2">
                {CHART_TYPES.map((type }) => (
                  <Button
                    key={type.id}
                    variant="outline"
                    size="sm"
                    className="h-16 flex flex-col gap-1"
                    onClick={() => {
                      setNewWidget(prev => ({ ...prev, chartType: type.id, type: 'chart' }));
                      setShowWidgetDialog(true);
                    }}
                  >
                    <type.icon className="w-4 h-4" />
                    <span className="text-xs">{type.name}</span>
                  </Button>
                ))}
                ({ KPI_TYPES.map((type }) => (
                  <Button
                    key={type.id}
                    variant="outline"
                    size="sm"
                    className="h-16 flex flex-col gap-1"
                    onClick={() => {
                      setNewWidget(prev => ({ ...prev, type: 'kpi', kpiType: type.id }));
                      setShowWidgetDialog(true);
                    }}
                  >
                    <type.icon className="w-4 h-4" />
                    <span className="text-xs">{type.name}</span>
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-3">Personalização</h3>
              <div className="space-y-3">
                <div>
                  <Label>Paleta de Cores</Label>
                  <div className="grid grid-cols-1 gap-2 mt-1">
                    {COLOR_PALETTES.map((palette) => (
                      <Button
                        key={palette.name}
                        variant={dashboard.colorPalette.name === palette.name ? "default" : "outline"}
                        size="sm"
                        className="justify-start"
                        onClick={() => setDashboard(prev => ({ ...prev, colorPalette: palette }))}
                      >
                        <div className="flex gap-1 mr-2">
                          {palette.colors.slice(0, 3).map((color, i) => (
                            <div
                              key={i}
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                        <span className="text-xs">{palette.name}</span>
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Atualização Automática</Label>
                  <Select
                    value={dashboard.refreshInterval.toString()}
                    onValueChange={(value) => setDashboard(prev => ({ ...prev, refreshInterval: parseInt(value) }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10000">10 segundos</SelectItem>
                      <SelectItem value="30000">30 segundos</SelectItem>
                      <SelectItem value="60000">1 minuto</SelectItem>
                      <SelectItem value="300000">5 minutos</SelectItem>
                      <SelectItem value="0">Manual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <Label>Processamento Quântico</Label>
                  <Button
                    variant={quantumEnhanced ? "default" : "outline"}
                    size="sm"
                    onClick={() => setQuantumEnhanced(!quantumEnhanced)}
                  >
                    <Atom className="w-3 h-3 mr-1" />
                    {quantumEnhanced ? 'ON' : 'OFF'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Dashboard Canvas */}
        <div className="flex-1 p-4">
          {dashboard.widgets.length === 0 ? (
            <div className="h-full flex items-center justify-center border-2 border-dashed border-muted-foreground/25 rounded-lg">
              <div className="text-center">
                <Grid className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Dashboard Vazio</h3>
                <p className="text-muted-foreground mb-4">Adicione widgets para começar a construir seu dashboard</p>
                <Button onClick={() => setShowWidgetDialog(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Widget
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-12 gap-4 h-full">
              {dashboard.widgets.map(renderWidget)}
            </div>
          )}
        </div>
      </div>

      {/* Widget Dialog */}
      <Dialog open={showWidgetDialog} onOpenChange={setShowWidgetDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Adicionar Widget</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Título</Label>
                <Input
                  value={newWidget.title}
                  onChange={(e) => setNewWidget(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Título do widget"
                />
              </div>
              <div>
                <Label>Fonte de Dados</Label>
                <Select
                  value={newWidget.dataSource}
                  onValueChange={(value) => setNewWidget(prev => ({ ...prev, dataSource: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar fonte" />
                  </SelectTrigger>
                  <SelectContent>
                    ({ dataSources.map((ds }) => (
                      <SelectItem key={ds.id} value={ds.id}>{ds.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Query/Consulta</Label>
              <Textarea
                value={newWidget.query}
                onChange={(e) => setNewWidget(prev => ({ ...prev, query: e.target.value }))}
                placeholder="SELECT * FROM tabela WHERE..."
                rows={4}
              />
            </div>

            <div className="grid grid-cols-4 gap-4">
              <div>
                <Label>Largura</Label>
                <Input
                  type="number"
                  value={newWidget.width}
                  onChange={(e) => setNewWidget(prev => ({ ...prev, width: parseInt(e.target.value) }))}
                  min="1"
                  max="12"
                />
              </div>
              <div>
                <Label>Altura</Label>
                <Input
                  type="number"
                  value={newWidget.height}
                  onChange={(e) => setNewWidget(prev => ({ ...prev, height: parseInt(e.target.value) }))}
                  min="1"
                  max="12"
                />
              </div>
              <div>
                <Label>Posição X</Label>
                <Input
                  type="number"
                  value={newWidget.x}
                  onChange={(e) => setNewWidget(prev => ({ ...prev, x: parseInt(e.target.value) }))}
                  min="0"
                  max="11"
                />
              </div>
              <div>
                <Label>Posição Y</Label>
                <Input
                  type="number"
                  value={newWidget.y}
                  onChange={(e) => setNewWidget(prev => ({ ...prev, y: parseInt(e.target.value) }))}
                  min="0"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowWidgetDialog(false)}>

              </Button>
              <Button onClick={addWidget}>
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Widget
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
`