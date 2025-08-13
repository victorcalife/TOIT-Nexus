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
  tempo_real)",
      description,
      code,
    {
      title,
      description,
      code,
    {
      title,
      description,
      code, MOEDA R$;
    KPI pedidos_ativo TITULO "Pedidos Ativos";
    KPI usuarios_online TITULO "Online";`
    }
  ],
  basico,
      description,
      code,
    {
      title,
      description,
      code,
    {
      title,
      description,
      code);"
    }
  ],
  temporal,
      description,
      code,
    {
      title,
      description,
      code,
    {
      title,
      description,
      code,
    {
      title,
      description,
      code,
    {
      title,
      description,
      code,
    {
      title,
      description,
      code) E DIA(0);"
    },
    {
      title,
      description,
      code), MES(-1), MES(0));"
    }
  ],
  dashboard,
      description,
      code) / vendas_ontem * 100;
pedidos_agora = CONTAR pedidos ONDE status = "ativo" E criado = AGORA;
usuarios_online = CONTAR usuarios ONDE ultimo_acesso = AGORA;

DASHBOARD "Tempo Real - Hoje" ATUALIZAR_A_CADA 30_SEGUNDOS, MOEDA R$, COR azul;
    KPI crescimento_dia TITULO "vs Ontem", FORMATO %, 
        COR verde SE >0, COR vermelho SE <0;
    KPI pedidos_agora TITULO "Pedidos Ativos", COR laranja;
    KPI usuarios_online TITULO "Online Agora", COR verde;
    GRAFICO linha DE vendas PERIODO ESTA_SEMANA TITULO "Vendas da Semana";`
    },
    {
      title,
      description,
      code);
vendas_anterior = SOMAR valor DE vendas ONDE data = MES(-1);
crescimento = (vendas_mes - vendas_anterior) / vendas_anterior * 100;

DASHBOARD "Vendas Mensal":
    KPI vendas_mes TITULO "Vendas do Mês", MOEDA R$;
    KPI crescimento TITULO "Crescimento", FORMATO %, 
        COR verde SE >0, COR vermelho SE <0;
    GRAFICO barras DE vendas TITULO "Vendas por Mês";`
    },
    {
      title,
      description,
      code);

DASHBOARD "RH - Métricas":
    KPI total_funcionarios TITULO "Funcionários Ativos";
    KPI salario_medio TITULO "Salário Médio", MOEDA R$;
    KPI admissoes_mes TITULO "Admissões Mês", COR verde;
    GRAFICO pizza DE funcionarios AGRUPADO POR departamento;`
    },
    {
      title,
      description,
      code);
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

= useToast();
  const queryClient = useQueryClient();

  // State management
  const [currentQuery, setCurrentQuery] = useState<QueryBuilder>({
    name,
    tables,
    fields,
    filters,
    joins,
    groupBy,
    orderBy);

  const [visualization, setVisualization] = useState<VisualizationConfig>({
    type,
    title,
    colors,
    width,
    height,
    showLegend,
    showGrid);

  const [queryResults, setQueryResults] = useState<any[]>([]);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<'tempo_real' | 'basico' | 'temporal' | 'dashboard'>('tempo_real');

  // Available tables and fields (would come from database schema)
  const availableTables = [
    { name, fields, 'name', 'email', 'currentInvestment', 'riskProfile', 'createdAt'] },
    { name, fields, 'name', 'status', 'executionCount', 'createdAt'] },
    { name, fields, 'name', 'createdAt'] },
    { name, fields, 'action', 'description', 'createdAt'] }
  ];

  // Fetch saved queries
  const { data= [] } = useQuery<SavedQuery[]>({
    queryKey,
    retry);

  // Execute query mutation
  const executeQueryMutation = useMutation({
    mutationFn) => {
      return await apiRequest('/api/query-builder/execute', 'POST', { query });
    },
    onSuccess) => {
      setQueryResults(data.results || []);
      toast({
        title,
        description,
      });
    },
    onError) => {
      toast({
        title,
        description,
        variant,
      });
    }
  });

  // Save query mutation
  const saveQueryMutation = useMutation({
    mutationFn) => {
      return await apiRequest('/api/query-builder/queries', 'POST', queryData);
    },
    onSuccess) => {
      queryClient.invalidateQueries({ queryKey);
      setSaveDialogOpen(false);
      toast({
        title,
        description,
      });
    }
  });

  // Add field to query
  const addField = () => {
    setCurrentQuery(prev => ({
      ...prev,
      fields, { table, field));
  };

  // Add filter to query
  const addFilter = () => {
    setCurrentQuery(prev => ({
      ...prev,
      filters, { field, operator, value));
  };

  // Update field
  const updateField = (index, field) => {
    setCurrentQuery(prev => ({
      ...prev,
      fields, i) => i === index ? { ...f, ...field } )
    }));
  };

  // Update filter
  const updateFilter = (index, filter) => {
    setCurrentQuery(prev => ({
      ...prev,
      filters, i) => i === index ? { ...f, ...filter } )
    }));
  };

  // Execute query
  const executeQuery = () => {
    if (currentQuery.fields.length === 0) {
      toast({
        title,
        description,
        variant,
      });
      return;
    }
    executeQueryMutation.mutate(currentQuery);
  };

  // Load saved query
  const loadQuery = (savedQuery) => {
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
      width,
      height) {
      case 'table':
        return (
          <div className="overflow-auto border rounded-lg" style={containerStyle}>
            <table className="w-full">
              <thead className="bg-gray-50 dark).map(key => (
                    <th key={key} className="px-4 py-2 text-left font-medium">
                      {key}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {queryResults.map((row, i) => (
                  <tr key={i} className="border-t">
                    {Object.values(row).map((value, j) => (
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
                kpiValue.toLocaleString('pt-BR', { style, currency) {visualization.title}
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
              <div className="absolute inset-0 rounded-full border-8 border-gray-200 dark, 50% 0%, ${50 + 50 * Math.cos((percentage / 100) * 2 * Math.PI - Math.PI/2)}% ${50 + 50 * Math.sin((percentage / 100) * 2 * Math.PI - Math.PI/2)}%, 50% 50%)` 
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

      default, dashboards e relatórios executivos
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
          <div className="col-span-12 lg) => setCurrentTQLQuery(prev => ({ ...prev, name))}
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
                          setCurrentTQLQuery(prev => ({ ...prev, tqlCode));
                        }}
                        placeholder={`# Digite sua consulta TQL em português);\n\n# Dashboard completo);\n\nDASHBOARD "Vendas Mensal":\n    KPI vendas_mes TITULO "Vendas do Mês", MOEDA R$;`}
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
                                onChange={(e) => setCurrentTQLQuery(prev => ({ ...prev, name))}
                              />
                            </div>
                            <div>
                              <Label htmlFor="saveDescription">Descrição</Label>
                              <Textarea
                                id="saveDescription"
                                value={currentTQLQuery.description || ''}
                                onChange={(e) => setCurrentTQLQuery(prev => ({ ...prev, description))}
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
                        onValueChange={(value) => setSelectedCategory(value)}
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
                            className="p-3 cursor-pointer hover) => insertTQLExample(example)}
                          >
                            <div className="font-medium text-sm">{example.title}</div>
                            <div className="text-xs text-gray-500 mt-1">{example.description}</div>
                            <div className="mt-2 p-2 bg-gray-100 dark)[0]}...
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
                            <div><strong>Ações disponíveis)</Badge>
                              <Badge variant="secondary">MES(-1)</Badge>
                              <Badge variant="secondary">ANO(0)</Badge>
                              <Badge variant="secondary">SEMANA(-2)</Badge>
                              <Badge variant="secondary">HORA(0)</Badge>
                              <Badge variant="secondary">MINUTO(0)</Badge>
                            </div>
                            <div className="text-xs bg-gray-100 dark, HOJE);
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
                            <div><strong>Operadores disponíveis);<br/>
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
                            <div><strong>Tipos de componentes, MOEDA R$, COR azul;<br/>
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
                            <div><strong>Formatos disponíveis, MOEDA R$, COR verde;<br/>
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
                            <div><strong>Comandos de organização) / receita_ontem * 100;<br/>
                            usuarios_online = CONTAR usuarios ONDE ultimo_acesso = AGORA;<br/>
                            pedidos_pendentes = CONTAR pedidos ONDE status = "pendente";<br/>
                            <br/>
                            DASHBOARD "Executivo Live" ATUALIZAR_A_CADA 15_SEGUNDOS, MOEDA R$, COR verde;<br/>
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
                        className="p-3 border rounded-lg cursor-pointer hover) => loadTQLQuery(query)}
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
          <div className="col-span-12 lg) => setIsPreviewMode(!isPreviewMode)}
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
                          <h2 className="text-2xl font-bold text-gray-900 dark, index) => (
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
                                ) {visualization.type}
                            onValueChange={(type) => setVisualization(prev => ({ ...prev, newColors[0] = color;
                                setVisualization(prev => ({ ...prev, colors));
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
                    <h3 className="text-xl font-semibold text-gray-700 dark)}
          </div>
        </div>
      </div>
    </div>
  );
}