import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Plus, Save, Play, Eye, Palette, BarChart3, Table, PieChart, LineChart, 
  Settings, Download, Share, Code, BookOpen, Lightbulb, Calendar, 
  Calculator, TrendingUp, AlertCircle, CheckCircle, Zap
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { UnifiedHeader } from "@/components/unified-header";

// Chart components
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart as RechartsLineChart, Line,
  PieChart as RechartsPieChart, Pie, Cell,
  AreaChart, Area
} from 'recharts';

// Color palette
const CHART_COLORS = [
  '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
  '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1'
];

// TQL Examples organized by category
const TQL_EXAMPLES = {
  tempo_real: [
    {
      title: "Vendas de hoje (tempo real)",
      description: "Vendas atualizadas em tempo real - atualiza automaticamente",
      code: "SOMAR valor DE vendas ONDE data = HOJE;"
    },
    {
      title: "Usuários online agora",
      description: "Contagem de usuários conectados neste momento",
      code: "CONTAR usuarios ONDE ultimo_acesso = AGORA E status = \"online\";"
    },
    {
      title: "Dashboard Tempo Real Completo",
      description: "Dashboard executivo em tempo real com auto-refresh",
      code: `# Dashboard em tempo real
vendas_hoje = SOMAR valor DE vendas ONDE data = HOJE;
pedidos_ativo = CONTAR pedidos ONDE status = "ativo" E criado = AGORA;
usuarios_online = CONTAR usuarios ONDE ultimo_acesso = AGORA;

DASHBOARD "Live Dashboard" ATUALIZAR_A_CADA 15_SEGUNDOS:
    KPI vendas_hoje TITULO "Vendas Hoje", MOEDA R$;
    KPI pedidos_ativo TITULO "Pedidos Ativos";
    KPI usuarios_online TITULO "Online";`
    }
  ],
  basico: [
    {
      title: "Listar todos os clientes",
      description: "Mostra todos os clientes cadastrados",
      code: "MOSTRAR clientes;"
    },
    {
      title: "Contar funcionários ativos",
      description: "Conta quantos funcionários estão ativos",
      code: "CONTAR funcionarios ONDE status = \"ativo\";"
    },
    {
      title: "Soma de vendas do mês",
      description: "Total de vendas do mês atual",
      code: "SOMAR valor DE vendas ONDE data = MES(0);"
    }
  ],
  temporal: [
    {
      title: "Vendas de hoje em tempo real",
      description: "Vendas atualizadas em tempo real para hoje",
      code: "SOMAR valor DE vendas ONDE data = HOJE;"
    },
    {
      title: "Pedidos desta semana",
      description: "Todos os pedidos da semana atual",
      code: "CONTAR pedidos ONDE data ENTRE ESTA_SEMANA;"
    },
    {
      title: "Comparativo hoje vs ontem",
      description: "Comparação em tempo real",
      code: "vendas_hoje = SOMAR valor DE vendas ONDE data = HOJE;\nvendas_ontem = SOMAR valor DE vendas ONDE data = ONTEM;\ndiferenca = vendas_hoje - vendas_ontem;"
    },
    {
      title: "Vendas deste mês em tempo real",
      description: "Total do mês atual atualizado constantemente",
      code: "SOMAR valor DE vendas ONDE data ENTRE ESTE_MES;"
    },
    {
      title: "Status agora vs período anterior",
      description: "Métricas em tempo real comparativas",
      code: "funcionarios_agora = CONTAR funcionarios ONDE status = \"ativo\" E ultimo_acesso = AGORA;\nfuncionarios_semana = CONTAR funcionarios ONDE ultimo_acesso ENTRE ESTA_SEMANA;"
    },
    {
      title: "Vendas dos últimos 30 dias",
      description: "Vendas em período específico",
      code: "SOMAR valor DE vendas ONDE data ENTRE DIA(-30) E DIA(0);"
    },
    {
      title: "Comparativo mensal",
      description: "Vendas de múltiplos meses",
      code: "SOMAR valor DE vendas ONDE data = (MES(-2), MES(-1), MES(0));"
    }
  ],
  dashboard: [
    {
      title: "Dashboard TEMPO REAL - Hoje",
      description: "Métricas atualizadas constantemente",
      code: `# Dashboard em tempo real
vendas_hoje = SOMAR valor DE vendas ONDE data = HOJE;
vendas_ontem = SOMAR valor DE vendas ONDE data = ONTEM;
crescimento_dia = (vendas_hoje - vendas_ontem) / vendas_ontem * 100;
pedidos_agora = CONTAR pedidos ONDE status = "ativo" E criado = AGORA;
usuarios_online = CONTAR usuarios ONDE ultimo_acesso = AGORA;

DASHBOARD "Tempo Real - Hoje" ATUALIZAR_A_CADA 30_SEGUNDOS:
    KPI vendas_hoje TITULO "Vendas Hoje", MOEDA R$, COR azul;
    KPI crescimento_dia TITULO "vs Ontem", FORMATO %, 
        COR verde SE >0, COR vermelho SE <0;
    KPI pedidos_agora TITULO "Pedidos Ativos", COR laranja;
    KPI usuarios_online TITULO "Online Agora", COR verde;
    GRAFICO linha DE vendas PERIODO ESTA_SEMANA TITULO "Vendas da Semana";`
    },
    {
      title: "Dashboard Vendas Simples",
      description: "KPIs básicos de vendas",
      code: `# Variáveis de vendas
vendas_mes = SOMAR valor DE vendas ONDE data = MES(0);
vendas_anterior = SOMAR valor DE vendas ONDE data = MES(-1);
crescimento = (vendas_mes - vendas_anterior) / vendas_anterior * 100;

DASHBOARD "Vendas Mensal":
    KPI vendas_mes TITULO "Vendas do Mês", MOEDA R$;
    KPI crescimento TITULO "Crescimento", FORMATO %, 
        COR verde SE >0, COR vermelho SE <0;
    GRAFICO barras DE vendas TITULO "Vendas por Mês";`
    },
    {
      title: "Dashboard Recursos Humanos",
      description: "Métricas de RH completas",
      code: `# Métricas de RH
total_funcionarios = CONTAR funcionarios ONDE status = "ativo";
salario_medio = MEDIA salario DE funcionarios;
admissoes_mes = CONTAR funcionarios ONDE admissao = MES(0);

DASHBOARD "RH - Métricas":
    KPI total_funcionarios TITULO "Funcionários Ativos";
    KPI salario_medio TITULO "Salário Médio", MOEDA R$;
    KPI admissoes_mes TITULO "Admissões Mês", COR verde;
    GRAFICO pizza DE funcionarios AGRUPADO POR departamento;`
    },
    {
      title: "Dashboard Executivo Completo",
      description: "Visão executiva com múltiplos KPIs",
      code: `# KPIs executivos
receita_anual = SOMAR receita DE financeiro ONDE data = ANO(0);
funcionarios_ativos = CONTAR funcionarios ONDE status = "ativo";
projetos_andamento = CONTAR projetos ONDE status = "em andamento";
satisfacao = MEDIA nota DE pesquisas ONDE data = MES(0);

DASHBOARD "Executivo":
    KPI receita_anual TITULO "Receita Anual", MOEDA R$;
    KPI funcionarios_ativos TITULO "Funcionários";
    KPI projetos_andamento TITULO "Projetos Ativos";
    KPI satisfacao TITULO "Satisfação", FORMATO decimal,
        COR verde SE >4, COR amarelo SE >3, COR vermelho SE <=3;
    GRAFICO linha DE receita_anual PERIODO ULTIMOS MES(12);
    GRAFICO pizza DE projetos AGRUPADO POR status;`
    }
  ]
};

interface TQLQuery {
  id?: string;
  name: string;
  description?: string;
  tqlCode: string;
  category: 'query' | 'dashboard' | 'variable';
  variables?: Record<string, any>;
  visualization?: VisualizationConfig;
}

interface VisualizationConfig {
  type: 'table' | 'bar' | 'line' | 'pie' | 'area' | 'gauge' | 'kpi';
  title: string;
  xAxis?: string;
  yAxis?: string;
  colors: string[];
  width: number;
  height: number;
  showLegend: boolean;
  showGrid: boolean;
}

interface SavedQuery {
  id: string;
  name: string;
  query: QueryBuilder;
  visualization: VisualizationConfig;
  data?: any[];
  createdAt: string;
  updatedAt: string;
}

export default function QueryBuilderPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // State management
  const [currentQuery, setCurrentQuery] = useState<QueryBuilder>({
    name: '',
    tables: [],
    fields: [],
    filters: [],
    joins: [],
    groupBy: [],
    orderBy: []
  });

  const [visualization, setVisualization] = useState<VisualizationConfig>({
    type: 'table',
    title: 'Resultado da Consulta',
    colors: CHART_COLORS,
    width: 100,
    height: 400,
    showLegend: true,
    showGrid: true
  });

  const [queryResults, setQueryResults] = useState<any[]>([]);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<'tempo_real' | 'basico' | 'temporal' | 'dashboard'>('tempo_real');

  // Available tables and fields (would come from database schema)
  const availableTables = [
    { name: 'clients', fields: ['id', 'name', 'email', 'currentInvestment', 'riskProfile', 'createdAt'] },
    { name: 'workflows', fields: ['id', 'name', 'status', 'executionCount', 'createdAt'] },
    { name: 'reports', fields: ['id', 'name', 'createdAt'] },
    { name: 'activities', fields: ['id', 'action', 'description', 'createdAt'] }
  ];

  // Fetch saved queries
  const { data: savedQueries = [] } = useQuery<SavedQuery[]>({
    queryKey: ['/api/query-builder/queries'],
    retry: false
  });

  // Execute query mutation
  const executeQueryMutation = useMutation({
    mutationFn: async (query: QueryBuilder) => {
      return await apiRequest('/api/query-builder/execute', 'POST', { query });
    },
    onSuccess: (data: any) => {
      setQueryResults(data.results || []);
      toast({
        title: "Consulta executada",
        description: `${data.results?.length || 0} registros encontrados`,
      });
    },
    onError: (error) => {
      toast({
        title: "Erro na consulta",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Save query mutation
  const saveQueryMutation = useMutation({
    mutationFn: async (queryData: { query: QueryBuilder; visualization: VisualizationConfig }) => {
      return await apiRequest('/api/query-builder/queries', 'POST', queryData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/query-builder/queries'] });
      setSaveDialogOpen(false);
      toast({
        title: "Consulta salva",
        description: "Sua consulta foi salva com sucesso",
      });
    }
  });

  // Add field to query
  const addField = () => {
    setCurrentQuery(prev => ({
      ...prev,
      fields: [...prev.fields, { table: '', field: '' }]
    }));
  };

  // Add filter to query
  const addFilter = () => {
    setCurrentQuery(prev => ({
      ...prev,
      filters: [...prev.filters, { field: '', operator: '=', value: '' }]
    }));
  };

  // Update field
  const updateField = (index: number, field: Partial<QueryField>) => {
    setCurrentQuery(prev => ({
      ...prev,
      fields: prev.fields.map((f, i) => i === index ? { ...f, ...field } : f)
    }));
  };

  // Update filter
  const updateFilter = (index: number, filter: Partial<QueryFilter>) => {
    setCurrentQuery(prev => ({
      ...prev,
      filters: prev.filters.map((f, i) => i === index ? { ...f, ...filter } : f)
    }));
  };

  // Execute query
  const executeQuery = () => {
    if (currentQuery.fields.length === 0) {
      toast({
        title: "Erro",
        description: "Adicione pelo menos um campo à consulta",
        variant: "destructive",
      });
      return;
    }
    executeQueryMutation.mutate(currentQuery);
  };

  // Load saved query
  const loadQuery = (savedQuery: SavedQuery) => {
    setCurrentQuery(savedQuery.query);
    setVisualization(savedQuery.visualization);
    if (savedQuery.data) {
      setQueryResults(savedQuery.data);
    }
  };

  // Render visualization
  const renderVisualization = () => {
    if (!queryResults.length) return null;

    const containerStyle = {
      width: `${visualization.width}%`,
      height: visualization.height
    };

    switch (visualization.type) {
      case 'table':
        return (
          <div className="overflow-auto border rounded-lg" style={containerStyle}>
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  {Object.keys(queryResults[0] || {}).map(key => (
                    <th key={key} className="px-4 py-2 text-left font-medium">
                      {key}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {queryResults.map((row, i) => (
                  <tr key={i} className="border-t">
                    {Object.values(row).map((value: any, j) => (
                      <td key={j} className="px-4 py-2">
                        {String(value)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      case 'bar':
        return (
          <div style={containerStyle}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={queryResults}>
                {visualization.showGrid && <CartesianGrid strokeDasharray="3 3" />}
                <XAxis dataKey={visualization.xAxis || 'label'} />
                <YAxis />
                <Tooltip />
                {visualization.showLegend && <Legend />}
                <Bar 
                  dataKey={visualization.yAxis || 'value'} 
                  fill={visualization.colors[0]} 
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        );

      case 'line':
        return (
          <div style={containerStyle}>
            <ResponsiveContainer width="100%" height="100%">
              <RechartsLineChart data={queryResults}>
                {visualization.showGrid && <CartesianGrid strokeDasharray="3 3" />}
                <XAxis dataKey={visualization.xAxis || 'label'} />
                <YAxis />
                <Tooltip />
                {visualization.showLegend && <Legend />}
                <Line 
                  type="monotone" 
                  dataKey={visualization.yAxis || 'value'} 
                  stroke={visualization.colors[0]} 
                />
              </RechartsLineChart>
            </ResponsiveContainer>
          </div>
        );

      case 'pie':
        return (
          <div style={containerStyle}>
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <Pie
                  data={queryResults}
                  dataKey={visualization.yAxis || 'value'}
                  nameKey={visualization.xAxis || 'label'}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                >
                  {queryResults.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={visualization.colors[index % visualization.colors.length]} />
                  ))}
                </Pie>
                <Tooltip />
                {visualization.showLegend && <Legend />}
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
        );

      case 'area':
        return (
          <div style={containerStyle}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={queryResults}>
                {visualization.showGrid && <CartesianGrid strokeDasharray="3 3" />}
                <XAxis dataKey={visualization.xAxis || 'label'} />
                <YAxis />
                <Tooltip />
                {visualization.showLegend && <Legend />}
                <Area 
                  type="monotone" 
                  dataKey={visualization.yAxis || 'value'} 
                  stroke={visualization.colors[0]} 
                  fill={visualization.colors[0]} 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        );
        
      case 'kpi':
        // Renderizar KPI TQL
        const kpiValue = queryResults[0]?.value || queryResults[0] || 0;
        return (
          <div className="text-center p-6">
            <div className="text-4xl font-bold text-blue-600 mb-2">
              {typeof kpiValue === 'number' ? 
                kpiValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : 
                kpiValue
              }
            </div>
            <div className="text-sm text-gray-500">
              {visualization.title}
            </div>
          </div>
        );
        
      case 'gauge':
        // Renderizar Gauge TQL
        const gaugeValue = typeof queryResults[0] === 'number' ? queryResults[0] : 
                          queryResults[0]?.value || 0;
        const percentage = Math.min(Math.max(gaugeValue, 0), 100);
        return (
          <div className="text-center p-6">
            <div className="relative w-32 h-32 mx-auto mb-4">
              <div className="absolute inset-0 rounded-full border-8 border-gray-200 dark:border-gray-700"></div>
              <div 
                className="absolute inset-0 rounded-full border-8 border-blue-500 border-t-transparent transform -rotate-90"
                style={{ 
                  clipPath: `polygon(50% 50%, 50% 0%, ${50 + 50 * Math.cos((percentage / 100) * 2 * Math.PI - Math.PI/2)}% ${50 + 50 * Math.sin((percentage / 100) * 2 * Math.PI - Math.PI/2)}%, 50% 50%)` 
                }}
              ></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold">{percentage}%</span>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              {visualization.title}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <UnifiedHeader />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            TQL Builder - Linguagem Brasileira
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Crie consultas em português, dashboards e relatórios executivos
          </p>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="secondary" className="text-green-700 bg-green-100">
              🇧🇷 100% Português
            </Badge>
            <Badge variant="secondary" className="text-blue-700 bg-blue-100">
              📊 12 Tipos de Gráficos
            </Badge>
            <Badge variant="secondary" className="text-purple-700 bg-purple-100">
              ⚡ Dashboards Dinâmicos
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* TQL Editor Panel */}
          <div className="col-span-12 lg:col-span-4">
            <Card className="h-fit">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="w-5 h-5" />
                  Editor TQL - Linguagem Portuguesa
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="editor">Editor</TabsTrigger>
                    <TabsTrigger value="examples">Exemplos</TabsTrigger>
                    <TabsTrigger value="help">Ajuda</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="editor" className="space-y-4">
                    {/* Query Name */}
                    <div>
                      <Label htmlFor="tqlQueryName">Nome da Consulta TQL</Label>
                      <Input
                        id="tqlQueryName"
                        value={currentTQLQuery.name}
                        onChange={(e) => setCurrentTQLQuery(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Minha consulta TQL"
                      />
                    </div>
                    
                    {/* TQL Code Editor */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label htmlFor="tqlCode">Código TQL</Label>
                        <div className="flex gap-1">
                          <Button size="sm" variant="outline" onClick={validateTQLSyntax}>
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setTqlCode('')}>
                            <AlertCircle className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <Textarea
                        id="tqlCode"
                        value={tqlCode}
                        onChange={(e) => {
                          setTqlCode(e.target.value);
                          setCurrentTQLQuery(prev => ({ ...prev, tqlCode: e.target.value }));
                        }}
                        placeholder={`# Digite sua consulta TQL em português:\n\n# Exemplo simples:\nSOMAR valor DE vendas ONDE data = MES(0);\n\n# Dashboard completo:\nvendas_mes = SOMAR valor DE vendas ONDE data = MES(0);\n\nDASHBOARD "Vendas Mensal":\n    KPI vendas_mes TITULO "Vendas do Mês", MOEDA R$;`}
                        className="min-h-[200px] font-mono text-sm"
                      />
                    </div>
                    
                    {/* Schema Selection */}
                    {schemas.length > 0 && (
                      <div>
                        <Label>Esquema de Dados</Label>
                        <Select value={schemas[0]} disabled>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecionar esquema" />
                          </SelectTrigger>
                          <SelectContent>
                            {schemas.map(schema => (
                              <SelectItem key={schema} value={schema}>
                                {schema}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <Button 
                        onClick={executeTQLQuery} 
                        disabled={executeTQLMutation.isPending}
                        className="flex-1"
                      >
                        <Play className="w-4 h-4 mr-2" />
                        {executeTQLMutation.isPending ? 'Executando...' : 'Executar TQL'}
                      </Button>
                      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
                        <DialogTrigger asChild>
                          <Button variant="outline">
                            <Save className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Salvar Consulta TQL</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="saveName">Nome</Label>
                              <Input
                                id="saveName"
                                value={currentTQLQuery.name}
                                onChange={(e) => setCurrentTQLQuery(prev => ({ ...prev, name: e.target.value }))}
                              />
                            </div>
                            <div>
                              <Label htmlFor="saveDescription">Descrição</Label>
                              <Textarea
                                id="saveDescription"
                                value={currentTQLQuery.description || ''}
                                onChange={(e) => setCurrentTQLQuery(prev => ({ ...prev, description: e.target.value }))}
                              />
                            </div>
                            <Button 
                              onClick={() => saveTQLMutation.mutate(currentTQLQuery)}
                              disabled={saveTQLMutation.isPending}
                              className="w-full"
                            >
                              Salvar TQL
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="examples" className="space-y-4">
                    <div>
                      <Label>Categorias de Exemplos</Label>
                      <Select 
                        value={selectedCategory} 
                        onValueChange={(value: 'tempo_real' | 'basico' | 'temporal' | 'dashboard') => setSelectedCategory(value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="tempo_real">⚡ Tempo Real</SelectItem>
                          <SelectItem value="basico">🔰 Básico</SelectItem>
                          <SelectItem value="temporal">⏰ Temporal</SelectItem>
                          <SelectItem value="dashboard">📊 Dashboard</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <ScrollArea className="h-[400px]">
                      <div className="space-y-2">
                        {TQL_EXAMPLES[selectedCategory]?.map((example, index) => (
                          <Card 
                            key={index}
                            className="p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                            onClick={() => insertTQLExample(example)}
                          >
                            <div className="font-medium text-sm">{example.title}</div>
                            <div className="text-xs text-gray-500 mt-1">{example.description}</div>
                            <div className="mt-2 p-2 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">
                              {example.code.split('\n')[0]}...
                            </div>
                          </Card>
                        )) || []}
                      </div>
                    </ScrollArea>
                  </TabsContent>
                  
                  <TabsContent value="help" className="space-y-4">
                    <Alert>
                      <BookOpen className="h-4 w-4" />
                      <AlertDescription>
                        <strong>TQL - TOIT Query Language</strong><br/>
                        Linguagem de consulta 100% em português brasileiro para criar relatórios e dashboards em tempo real.
                      </AlertDescription>
                    </Alert>
                    
                    <ScrollArea className="h-[500px] space-y-4">
                      <div className="space-y-6 text-sm pr-4">
                        
                        {/* 1. CONSULTAS BÁSICAS */}
                        <div>
                          <h4 className="font-semibold text-base mb-2 flex items-center gap-2">
                            <Code className="w-4 h-4" />
                            1. Consultas Básicas
                          </h4>
                          <div className="space-y-2">
                            <div><strong>Ações disponíveis:</strong></div>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <Badge variant="outline">MOSTRAR</Badge>
                              <Badge variant="outline">SOMAR</Badge>
                              <Badge variant="outline">CONTAR</Badge>
                              <Badge variant="outline">MEDIA</Badge>
                              <Badge variant="outline">MAXIMO</Badge>
                              <Badge variant="outline">MINIMO</Badge>
                            </div>
                            <div className="text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded font-mono mt-2">
                              MOSTRAR clientes;<br/>
                              CONTAR funcionarios ONDE status = "ativo";<br/>
                              SOMAR valor DE vendas ONDE data = HOJE;
                            </div>
                          </div>
                        </div>

                        {/* 2. FUNÇÕES TEMPORAIS */}
                        <div>
                          <h4 className="font-semibold text-base mb-2 flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            2. Funções Temporais em Tempo Real
                          </h4>
                          <div className="space-y-2">
                            <div><strong>Comandos em tempo real:</strong></div>
                            <div className="grid grid-cols-3 gap-1 text-xs">
                              <Badge variant="secondary">AGORA</Badge>
                              <Badge variant="secondary">HOJE</Badge>
                              <Badge variant="secondary">ONTEM</Badge>
                              <Badge variant="secondary">ESTA_SEMANA</Badge>
                              <Badge variant="secondary">ESTE_MES</Badge>
                              <Badge variant="secondary">ESTE_ANO</Badge>
                            </div>
                            <div><strong>Funções numéricas:</strong></div>
                            <div className="grid grid-cols-3 gap-1 text-xs">
                              <Badge variant="secondary">DIA(0)</Badge>
                              <Badge variant="secondary">MES(-1)</Badge>
                              <Badge variant="secondary">ANO(0)</Badge>
                              <Badge variant="secondary">SEMANA(-2)</Badge>
                              <Badge variant="secondary">HORA(0)</Badge>
                              <Badge variant="secondary">MINUTO(0)</Badge>
                            </div>
                            <div className="text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded font-mono mt-2">
                              # Tempo real<br/>
                              vendas_hoje = SOMAR valor DE vendas ONDE data = HOJE;<br/>
                              online_agora = CONTAR usuarios ONDE status = AGORA;<br/>
                              <br/>
                              # Períodos específicos<br/>
                              vendas_mes = SOMAR valor ONDE data ENTRE ESTE_MES;<br/>
                              comparativo = ONDE data = (ONTEM, HOJE);
                            </div>
                          </div>
                        </div>

                        {/* 3. FILTROS E CONDIÇÕES */}
                        <div>
                          <h4 className="font-semibold text-base mb-2 flex items-center gap-2">
                            <Settings className="w-4 h-4" />
                            3. Filtros e Condições
                          </h4>
                          <div className="space-y-2">
                            <div><strong>Operadores disponíveis:</strong></div>
                            <div className="grid grid-cols-4 gap-1 text-xs">
                              <Badge variant="outline">ONDE</Badge>
                              <Badge variant="outline">E</Badge>
                              <Badge variant="outline">OU</Badge>
                              <Badge variant="outline">NAO</Badge>
                              <Badge variant="outline">ENTRE</Badge>
                              <Badge variant="outline">COMO</Badge>
                              <Badge variant="outline">CONTEM</Badge>
                              <Badge variant="outline">INICIA</Badge>
                            </div>
                            <div className="text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded font-mono mt-2">
                              CONTAR clientes ONDE status = "ativo" E cidade = "São Paulo";<br/>
                              SOMAR vendas ONDE valor ENTRE 1000 E 5000;<br/>
                              MOSTRAR usuarios ONDE nome CONTEM "Silva";
                            </div>
                          </div>
                        </div>

                        {/* 4. VARIÁVEIS E CÁLCULOS */}
                        <div>
                          <h4 className="font-semibold text-base mb-2 flex items-center gap-2">
                            <Calculator className="w-4 h-4" />
                            4. Variáveis e Cálculos
                          </h4>
                          <div className="space-y-2">
                            <div><strong>Operações matemáticas:</strong></div>
                            <div className="grid grid-cols-4 gap-1 text-xs">
                              <Badge variant="outline">+</Badge>
                              <Badge variant="outline">-</Badge>
                              <Badge variant="outline">*</Badge>
                              <Badge variant="outline">/</Badge>
                              <Badge variant="outline">%</Badge>
                              <Badge variant="outline">^</Badge>
                            </div>
                            <div className="text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded font-mono mt-2">
                              # Definir variáveis<br/>
                              vendas_mes = SOMAR valor DE vendas ONDE data = ESTE_MES;<br/>
                              vendas_anterior = SOMAR valor DE vendas ONDE data = MES(-1);<br/>
                              <br/>
                              # Calcular crescimento<br/>
                              crescimento = (vendas_mes - vendas_anterior) / vendas_anterior * 100;
                            </div>
                          </div>
                        </div>

                        {/* 5. DASHBOARDS */}
                        <div>
                          <h4 className="font-semibold text-base mb-2 flex items-center gap-2">
                            <BarChart3 className="w-4 h-4" />
                            5. Dashboards Dinâmicos
                          </h4>
                          <div className="space-y-2">
                            <div><strong>Tipos de componentes:</strong></div>
                            <div className="grid grid-cols-3 gap-1 text-xs">
                              <Badge variant="default">KPI</Badge>
                              <Badge variant="default">GRAFICO</Badge>
                              <Badge variant="default">TABELA</Badge>
                              <Badge variant="default">CARTAO</Badge>
                              <Badge variant="default">LISTA</Badge>
                              <Badge variant="default">MAPA</Badge>
                            </div>
                            <div><strong>Tipos de gráficos:</strong></div>
                            <div className="grid grid-cols-4 gap-1 text-xs">
                              <Badge variant="secondary">barras</Badge>
                              <Badge variant="secondary">linha</Badge>
                              <Badge variant="secondary">pizza</Badge>
                              <Badge variant="secondary">area</Badge>
                              <Badge variant="secondary">gauge</Badge>
                              <Badge variant="secondary">radar</Badge>
                            </div>
                            <div className="text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded font-mono mt-2">
                              DASHBOARD "Vendas Tempo Real" ATUALIZAR_A_CADA 30_SEGUNDOS:<br/>
                              &nbsp;&nbsp;KPI vendas_hoje TITULO "Vendas Hoje", MOEDA R$, COR azul;<br/>
                              &nbsp;&nbsp;KPI crescimento TITULO "vs Ontem", FORMATO %,<br/>
                              &nbsp;&nbsp;&nbsp;&nbsp;COR verde SE &gt;0, COR vermelho SE &lt;0;<br/>
                              &nbsp;&nbsp;GRAFICO linha DE vendas PERIODO ESTA_SEMANA;<br/>
                              &nbsp;&nbsp;TABELA TOP 10 DE clientes ORDENADO POR valor;
                            </div>
                          </div>
                        </div>

                        {/* 6. FORMATAÇÃO E CORES */}
                        <div>
                          <h4 className="font-semibold text-base mb-2 flex items-center gap-2">
                            <Palette className="w-4 h-4" />
                            6. Formatação e Estilos
                          </h4>
                          <div className="space-y-2">
                            <div><strong>Formatos disponíveis:</strong></div>
                            <div className="grid grid-cols-4 gap-1 text-xs">
                              <Badge variant="outline">MOEDA</Badge>
                              <Badge variant="outline">FORMATO %</Badge>
                              <Badge variant="outline">DECIMAL</Badge>
                              <Badge variant="outline">INTEIRO</Badge>
                            </div>
                            <div><strong>Cores disponíveis:</strong></div>
                            <div className="grid grid-cols-5 gap-1 text-xs">
                              <Badge variant="outline">azul</Badge>
                              <Badge variant="outline">verde</Badge>
                              <Badge variant="outline">vermelho</Badge>
                              <Badge variant="outline">amarelo</Badge>
                              <Badge variant="outline">roxo</Badge>
                              <Badge variant="outline">laranja</Badge>
                              <Badge variant="outline">rosa</Badge>
                              <Badge variant="outline">cinza</Badge>
                            </div>
                            <div className="text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded font-mono mt-2">
                              KPI receita TITULO "Receita Total", MOEDA R$, COR verde;<br/>
                              KPI conversao TITULO "Taxa Conversão", FORMATO %, COR azul;<br/>
                              KPI temperatura TITULO "Temperatura", FORMATO decimal, COR laranja;
                            </div>
                          </div>
                        </div>

                        {/* 7. AGRUPAMENTO E ORDENAÇÃO */}
                        <div>
                          <h4 className="font-semibold text-base mb-2 flex items-center gap-2">
                            <TrendingUp className="w-4 h-4" />
                            7. Agrupamento e Ordenação
                          </h4>
                          <div className="space-y-2">
                            <div><strong>Comandos de organização:</strong></div>
                            <div className="grid grid-cols-4 gap-1 text-xs">
                              <Badge variant="outline">AGRUPADO POR</Badge>
                              <Badge variant="outline">ORDENADO POR</Badge>
                              <Badge variant="outline">LIMITADO A</Badge>
                              <Badge variant="outline">TOP</Badge>
                            </div>
                            <div className="text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded font-mono mt-2">
                              SOMAR vendas AGRUPADO POR regiao ORDENADO POR valor DESC;<br/>
                              MOSTRAR TOP 5 DE produtos ORDENADO POR vendas;<br/>
                              CONTAR clientes AGRUPADO POR mes LIMITADO A 12;
                            </div>
                          </div>
                        </div>

                        {/* 8. EXEMPLOS COMPLETOS */}
                        <div>
                          <h4 className="font-semibold text-base mb-2 flex items-center gap-2">
                            <Lightbulb className="w-4 h-4" />
                            8. Exemplos Práticos Completos
                          </h4>
                          <div className="text-xs bg-gray-100 dark:bg-gray-800 p-3 rounded font-mono leading-relaxed">
                            <strong># Dashboard Executivo Tempo Real</strong><br/>
                            receita_hoje = SOMAR receita DE vendas ONDE data = HOJE;<br/>
                            receita_ontem = SOMAR receita DE vendas ONDE data = ONTEM;<br/>
                            crescimento = (receita_hoje - receita_ontem) / receita_ontem * 100;<br/>
                            usuarios_online = CONTAR usuarios ONDE ultimo_acesso = AGORA;<br/>
                            pedidos_pendentes = CONTAR pedidos ONDE status = "pendente";<br/>
                            <br/>
                            DASHBOARD "Executivo Live" ATUALIZAR_A_CADA 15_SEGUNDOS:<br/>
                            &nbsp;&nbsp;KPI receita_hoje TITULO "Receita Hoje", MOEDA R$, COR verde;<br/>
                            &nbsp;&nbsp;KPI crescimento TITULO "Crescimento vs Ontem", FORMATO %,<br/>
                            &nbsp;&nbsp;&nbsp;&nbsp;COR verde SE &gt;0, COR vermelho SE &lt;0;<br/>
                            &nbsp;&nbsp;KPI usuarios_online TITULO "Usuários Online", COR azul;<br/>
                            &nbsp;&nbsp;KPI pedidos_pendentes TITULO "Pedidos Pendentes", COR laranja;<br/>
                            &nbsp;&nbsp;GRAFICO linha DE receita PERIODO ESTA_SEMANA TITULO "Receita Semanal";<br/>
                            &nbsp;&nbsp;GRAFICO barras DE vendas AGRUPADO POR regiao TOP 5;<br/>
                            &nbsp;&nbsp;TABELA pedidos ONDE status = "pendente" LIMITADO A 10;
                          </div>
                        </div>

                      </div>
                    </ScrollArea>
                  </TabsContent>
                  
                </Tabs>



              </CardContent>
            </Card>

            {/* Saved TQL Queries */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Consultas TQL Salvas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  <div className="space-y-2">
                    {savedTQLQueries.map(query => (
                      <div
                        key={query.id}
                        className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        onClick={() => loadTQLQuery(query)}
                      >
                        <div className="font-medium">{query.name}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {query.description}
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge 
                            variant={query.category === 'dashboard' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {query.category === 'dashboard' ? '📊 Dashboard' : '🔍 Consulta'}
                          </Badge>
                          <div className="text-xs text-gray-400">
                            {new Date(query.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {savedTQLQueries.length === 0 && (
                      <div className="text-center text-gray-500 py-8">
                        <Lightbulb className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Nenhuma consulta salva ainda.</p>
                        <p className="text-xs">Use os exemplos para começar!</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Visualization Panel */}
          <div className="col-span-12 lg:col-span-8">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Resultados TQL
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Button
                      variant={executionResult?.type === 'dashboard' ? "default" : "outline"}
                      size="sm"
                      onClick={() => setIsPreviewMode(!isPreviewMode)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      {executionResult?.type === 'dashboard' ? 'Dashboard' : 'Preview'}
                    </Button>
                    {executionResult && (
                      <Badge variant="secondary">
                        {executionResult.type === 'dashboard' ? '📊 Dashboard' : 
                         executionResult.type === 'variable' ? '🔢 Variável' : '📋 Dados'}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {executionResult ? (
                  // Renderizar resultados TQL
                  <div className="space-y-4">
                    {executionResult.type === 'dashboard' && executionResult.dashboard ? (
                      // Renderizar Dashboard TQL
                      <div className="space-y-6">
                        <div className="text-center">
                          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                            {executionResult.dashboard.name}
                          </h2>
                          <p className="text-sm text-gray-500 mt-1">
                            Dashboard gerado com {executionResult.dashboard.widgets.length} widgets
                          </p>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {executionResult.dashboard.widgets.map((widget, index) => (
                            <Card key={widget.id || index} className="p-4">
                              <CardHeader className="pb-2">
                                <CardTitle className="text-lg">
                                  {widget.title || `Widget ${index + 1}`}
                                </CardTitle>
                              </CardHeader>
                              <CardContent>
                                {widget.type === 'kpi' ? (
                                  <div className="text-center">
                                    <div className="text-3xl font-bold text-blue-600">
                                      {/* Placeholder KPI value */}
                                      R$ 125.340
                                    </div>
                                    <div className="text-sm text-gray-500 mt-1">
                                      KPI Processado
                                    </div>
                                  </div>
                                ) : widget.type === 'chart' ? (
                                  <div className="h-32 bg-gradient-to-r from-blue-100 to-purple-100 rounded flex items-center justify-center">
                                    <BarChart3 className="w-8 h-8 text-blue-500" />
                                    <span className="ml-2 text-blue-700">Gráfico TQL</span>
                                  </div>
                                ) : (
                                  <div className="h-24 bg-gray-100 dark:bg-gray-800 rounded flex items-center justify-center">
                                    <span className="text-gray-500">{widget.type.toUpperCase()}</span>
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    ) : (
                      // Renderizar dados simples ou variáveis
                      <div>
                        <Alert className="mb-4">
                          <CheckCircle className="h-4 w-4" />
                          <AlertDescription>
                            <strong>Execução TQL concluída!</strong><br/>
                            Tipo: {executionResult.type === 'variable' ? 'Variável calculada' : 'Consulta de dados'}
                          </AlertDescription>
                        </Alert>
                        
                        {queryResults.length > 0 && renderVisualization()}
                      </div>
                    )}
                  </div>
                ) : (
                  // Configurações de visualização padrão
                  <Tabs defaultValue="config" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="config">Configuração</TabsTrigger>
                      <TabsTrigger value="style">Estilo</TabsTrigger>
                      <TabsTrigger value="preview">Preview</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="config" className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Tipo de Visualização</Label>
                          <Select
                            value={visualization.type}
                            onValueChange={(type: any) => setVisualization(prev => ({ ...prev, type }))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="table">Tabela</SelectItem>
                              <SelectItem value="bar">Gráfico de Barras</SelectItem>
                              <SelectItem value="line">Gráfico de Linha</SelectItem>
                              <SelectItem value="pie">Gráfico de Pizza</SelectItem>
                              <SelectItem value="area">Gráfico de Área</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <Label>Título</Label>
                          <Input
                            value={visualization.title}
                            onChange={(e) => setVisualization(prev => ({ ...prev, title: e.target.value }))}
                          />
                        </div>
                        
                        {visualization.type !== 'table' && (
                          <>
                            <div>
                              <Label>Eixo X</Label>
                              <Select
                                value={visualization.xAxis || ''}
                                onValueChange={(xAxis) => setVisualization(prev => ({ ...prev, xAxis }))}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecionar campo" />
                                </SelectTrigger>
                                <SelectContent>
                                  {queryResults.length > 0 && Object.keys(queryResults[0]).map(key => (
                                    <SelectItem key={key} value={key}>
                                      {key}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div>
                              <Label>Eixo Y</Label>
                              <Select
                                value={visualization.yAxis || ''}
                                onValueChange={(yAxis) => setVisualization(prev => ({ ...prev, yAxis }))}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecionar campo" />
                                </SelectTrigger>
                                <SelectContent>
                                  {queryResults.length > 0 && Object.keys(queryResults[0]).map(key => (
                                    <SelectItem key={key} value={key}>
                                      {key}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </>
                        )}
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="style" className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Largura (%)</Label>
                          <Slider
                            value={[visualization.width]}
                            onValueChange={([width]) => setVisualization(prev => ({ ...prev, width }))}
                            max={100}
                            min={50}
                            step={10}
                          />
                          <div className="text-sm text-gray-500 mt-1">{visualization.width}%</div>
                        </div>
                        
                        <div>
                          <Label>Altura (px)</Label>
                          <Slider
                            value={[visualization.height]}
                            onValueChange={([height]) => setVisualization(prev => ({ ...prev, height }))}
                            max={800}
                            min={200}
                            step={50}
                          />
                          <div className="text-sm text-gray-500 mt-1">{visualization.height}px</div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={visualization.showLegend}
                            onCheckedChange={(showLegend) => setVisualization(prev => ({ ...prev, showLegend }))}
                          />
                          <Label>Mostrar Legenda</Label>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={visualization.showGrid}
                            onCheckedChange={(showGrid) => setVisualization(prev => ({ ...prev, showGrid }))}
                          />
                          <Label>Mostrar Grade</Label>
                        </div>
                      </div>
                      
                      <div>
                        <Label>Cores do Gráfico</Label>
                        <div className="grid grid-cols-5 gap-2 mt-2">
                          {CHART_COLORS.map((color, index) => (
                            <div
                              key={color}
                              className="w-8 h-8 rounded border cursor-pointer"
                              style={{ backgroundColor: color }}
                              onClick={() => {
                                const newColors = [...visualization.colors];
                                newColors[0] = color;
                                setVisualization(prev => ({ ...prev, colors: newColors }));
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="preview">
                      <div className="border rounded-lg p-4 min-h-[400px]">
                        {renderVisualization()}
                      </div>
                    </TabsContent>
                  </Tabs>
                )}
              </CardContent>
            </Card>

            {/* Estado inicial - aguardando execução TQL */}
            {!executionResult && (
              <Card>
                <CardContent className="pt-6">
                  <div className="border rounded-lg p-8 min-h-[400px] flex flex-col items-center justify-center text-center">
                    <Code className="w-16 h-16 text-gray-400 mb-4" />
                    <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Aguardando consulta TQL
                    </h3>
                    <p className="text-gray-500 mb-4">
                      Digite uma consulta TQL no editor ao lado e clique em "Executar TQL" para ver os resultados.
                    </p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      <Badge variant="outline">
                        <Calendar className="w-3 h-3 mr-1" />
                        Funções temporais
                      </Badge>
                      <Badge variant="outline">
                        <Calculator className="w-3 h-3 mr-1" />
                        Variáveis calculadas
                      </Badge>
                      <Badge variant="outline">
                        <BarChart3 className="w-3 h-3 mr-1" />
                        Dashboards dinâmicos
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}