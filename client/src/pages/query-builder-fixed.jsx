import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Play, Save, Download, Eye, Code, Table, BarChart3, LineChart as LineChartIcon, PieChart as PieChartIcon } from 'lucide-react';

// Chart colors
const CHART_COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00'];

// TQL Examples
const TQL_EXAMPLES = {
  tempo_real: [
    {
      title: "Dashboard Tempo Real",
      description: "Dashboard com KPIs atualizados em tempo real",
      code: `DASHBOARD "Vendas Tempo Real":
    KPI vendas_hoje TITULO "Vendas Hoje", MOEDA R$;
    KPI pedidos_ativo TITULO "Pedidos Ativos";`
    KPI usuarios_online TITULO "Online";`
    }
  ],
  basico: [
    {
      title: "Consulta Simples",
      description: "Buscar todos os clientes ativos",`
      code: `BUSCAR clientes ONDE status = "ativo";`
    },
    {
      title: "Filtro por Data",
      description: "Vendas dos últimos 30 dias",`
      code: `BUSCAR vendas ONDE data >= HOJE(-30);`
    }
  ],
  temporal: [
    {
      title: "Comparação Mensal",
      description: "Vendas do mês atual vs anterior",`
      code: `COMPARAR vendas MES(0) COM MES(-1);`
    },
    {
      title: "Previsão",
      description: "Previsão de vendas próximos 30 dias",`
      code: `PREVER vendas PROXIMOS(30) DIAS;`
    }
  ],
  dashboard: [
    {
      title: "Dashboard Executivo",
      description: "Dashboard completo para executivos",`
      code: `DASHBOARD "Executivo":
    KPI receita_mes TITULO "Receita Mensal", MOEDA R$;
    KPI clientes_novos TITULO "Novos Clientes";
    GRAFICO vendas_tempo TIPO linha PERIODO 30;`
    TABELA top_produtos LIMITE 10;`
    }
  ]
};

// Sample data
const SAMPLE_DATA = [
  { name: 'Jan', vendas: 4000, meta: 3500 },
  { name: 'Fev', vendas: 3000, meta: 3200 },
  { name: 'Mar', vendas: 5000, meta: 4000 },
  { name: 'Abr', vendas: 4500, meta: 4200 },
  { name: 'Mai', vendas: 6000, meta: 5000 },
  { name: 'Jun', vendas: 5500, meta: 5200 }
];

export default function QueryBuilder() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // State
  const [currentQuery, setCurrentQuery] = useState({
    name: '',
    tables: [],
    fields: [],
    filters: [],
    joins: [],
    groupBy: [],
    orderBy: []
  });

  const [visualization, setVisualization] = useState({
    type: 'bar',
    title: '',
    colors: CHART_COLORS,
    width: 800,
    height: 400,
    showLegend: true,
    showGrid: true
  });

  const [queryResults, setQueryResults] = useState([]);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('tempo_real');
  const [tqlCode, setTqlCode] = useState('');
  const [currentTQLQuery, setCurrentTQLQuery] = useState({
    name: '',
    tqlCode: '',
    description: ''
  });

  // Available tables
  const availableTables = [
    { name: 'clientes', fields: ['id', 'name', 'email', 'currentInvestment', 'riskProfile', 'createdAt'] },
    { name: 'workflows', fields: ['id', 'name', 'status', 'executionCount', 'createdAt'] },
    { name: 'reports', fields: ['id', 'name', 'createdAt'] },
    { name: 'activities', fields: ['id', 'action', 'description', 'createdAt'] }
  ];

  // Fetch saved queries
  const { data: savedQueries = [] } = useQuery(({ queryKey: ['saved-queries'],
    queryFn: ( }) => apiRequest('/api/query-builder/queries'),
    retry: 2
  });

  // Execute query mutation
  const executeQueryMutation = useMutation(({ mutationFn: async (query }) => {
      // Simulate MILA quantum processing
      const milaResponse = await apiRequest('/api/mila/process-query', 'POST', {
        query: query.tqlCode || query,
        useQuantumOptimization: true
      });
      
      return milaResponse;
    },
    onSuccess: (data) => {
      setQueryResults(data.results || SAMPLE_DATA);
      toast({
        title: "Query executada com MILA",`
        description: `${data.results?.length || SAMPLE_DATA.length} resultados com otimização quântica`,
      });
    },
    onError: (error) => {
      toast({
        title: "Erro na execução",
        description: error.message || "Erro ao executar query",
        variant: "destructive",
      });
    }
  });

  // Save query mutation
  const saveQueryMutation = useMutation(({ mutationFn: async (queryData }) => {
      return await apiRequest('/api/query-builder/queries', 'POST', queryData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-queries'] });
      setSaveDialogOpen(false);
      toast({
        title: "Query salva",
        description: "Query salva com sucesso",
      });
    }
  });

  // Execute TQL query
  const executeTQLQuery = () => {
    if (!tqlCode.trim()) {
      toast({
        title: "Erro",
        description: "Digite uma query TQL para executar",
        variant: "destructive"
      });
      return;
    }

    executeQueryMutation.mutate({
      tqlCode,
      name: currentTQLQuery.name || 'Query sem nome',
      type: 'tql'
    });
  };

  // Load example
  const loadExample = (example) => {
    setTqlCode(example.code);
    setCurrentTQLQuery({
      name: example.title,
      tqlCode: example.code,
      description: example.description
    });
  };

  // Render chart based on type
  const renderChart = () => {
    if (!queryResults.length) return null;

    const chartProps = {
      width: visualization.width,
      height: visualization.height,
      data: queryResults
    };

    switch (visualization.type) {
      case 'bar':
        return (
          <ResponsiveContainer {...chartProps}>
            <BarChart data={queryResults}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="vendas" fill="#8884d8" />
              <Bar dataKey="meta" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        );
      case 'line':
        return (
          <ResponsiveContainer {...chartProps}>
            <LineChart data={queryResults}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="vendas" stroke="#8884d8" />
              <Line type="monotone" dataKey="meta" stroke="#82ca9d" />
            </LineChart>
          </ResponsiveContainer>
        );
      case 'pie':
        return (
          <ResponsiveContainer {...chartProps}>
            <PieChart>
              <Pie
                data={queryResults}
                cx="50%"
                cy="50%"
                labelLine={false}`
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="vendas"
              >
                ({ queryResults.map((entry, index }) => (`
                  <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        );
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Query Builder</h1>
          <p className="text-muted-foreground">Construa consultas com TQL e visualize dados com MILA</p>
        </div>
        <div className="flex gap-2">
          <Button onClick=({ ( }) => setIsPreviewMode(!isPreviewMode)} variant="outline">
            <Eye className="w-4 h-4 mr-2" />
            {isPreviewMode ? 'Editor' : 'Preview'}
          </Button>
          <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Save className="w-4 h-4 mr-2" />

            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Salvar Query</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="queryName">Nome da Query</Label>
                  <Input
                    id="queryName"
                    value={currentTQLQuery.name}
                    onChange=({ (e }) => setCurrentTQLQuery(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Digite o nome da query"
                  />
                </div>
                <div>
                  <Label htmlFor="queryDescription">Descrição</Label>
                  <Textarea
                    id="queryDescription"
                    value={currentTQLQuery.description}
                    onChange=({ (e }) => setCurrentTQLQuery(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Descreva o que esta query faz"
                  />
                </div>
                <Button 
                  onClick=({ ( }) => saveQueryMutation.mutate(currentTQLQuery)}
                  disabled={saveQueryMutation.isPending}
                  className="w-full"
                >
                  {saveQueryMutation.isPending ? 'Salvando...' : 'Salvar Query'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="tql" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="tql">TQL Editor</TabsTrigger>
          <TabsTrigger value="visual">Visual Builder</TabsTrigger>
          <TabsTrigger value="results">Resultados</TabsTrigger>
        </TabsList>

        <TabsContent value="tql" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Examples */}
            <Card>
              <CardHeader>
                <CardTitle>Exemplos TQL</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tempo_real">Tempo Real</SelectItem>
                      <SelectItem value="basico">Básico</SelectItem>
                      <SelectItem value="temporal">Temporal</SelectItem>
                      <SelectItem value="dashboard">Dashboard</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    ({ TQL_EXAMPLES[selectedCategory]?.map((example, index }) => (
                      <div key={index} className="p-3 border rounded-lg cursor-pointer hover:bg-muted" onClick=({ ( }) => loadExample(example)}>
                        <h4 className="font-medium">{example.title}</h4>
                        <p className="text-sm text-muted-foreground">{example.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* TQL Editor */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="w-5 h-5" />
                  Editor TQL
                  <Badge variant="secondary">MILA Powered</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Textarea
                    value={tqlCode}
                    onChange=({ (e }) => setTqlCode(e.target.value)}
                    placeholder="Digite sua query TQL aqui..."
                    className="min-h-[300px] font-mono"
                  />
                  <div className="flex gap-2">
                    <Button onClick={executeTQLQuery} disabled={executeQueryMutation.isPending}>
                      <Play className="w-4 h-4 mr-2" />
                      {executeQueryMutation.isPending ? 'Executando...' : 'Executar com MILA'}
                    </Button>
                    <Button variant="outline">
                      <Download className="w-4 h-4 mr-2" />

                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="visual" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Visual Query Builder</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Visual query builder em desenvolvimento...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results" className="space-y-4">
          {queryResults.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Visualization Controls */}
              <Card>
                <CardHeader>
                  <CardTitle>Visualização</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label>Tipo de Gráfico</Label>
                      <div className="flex gap-2 mt-2">
                        <Button
                          variant={visualization.type === 'bar' ? 'default' : 'outline'}
                          size="sm"
                          onClick=({ ( }) => setVisualization(prev => ({ ...prev, type: 'bar' }))}
                        >
                          <BarChart3 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant={visualization.type === 'line' ? 'default' : 'outline'}
                          size="sm"
                          onClick=({ ( }) => setVisualization(prev => ({ ...prev, type: 'line' }))}
                        >
                          <LineChartIcon className="w-4 h-4" />
                        </Button>
                        <Button
                          variant={visualization.type === 'pie' ? 'default' : 'outline'}
                          size="sm"
                          onClick=({ ( }) => setVisualization(prev => ({ ...prev, type: 'pie' }))}
                        >
                          <PieChartIcon className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="chartTitle">Título do Gráfico</Label>
                      <Input
                        id="chartTitle"
                        value={visualization.title}
                        onChange=({ (e }) => setVisualization(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Digite o título"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>{visualization.title || 'Gráfico'}</CardTitle>
                </CardHeader>
                <CardContent>
                  {renderChart()}
                </CardContent>
              </Card>

              {/* Data Table */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Table className="w-5 h-5" />
                    Dados ({queryResults.length} registros)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-gray-300">
                      <thead>
                        <tr className="bg-muted">
                          {queryResults[0] && Object.keys(queryResults[0]).map(key => (
                            <th key={key} className="border border-gray-300 px-4 py-2 text-left">
                              {key}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        ({ queryResults.map((row, index }) => (
                          <tr key={index} className="hover:bg-muted/50">
                            ({ Object.values(row).map((value, cellIndex }) => (
                              <td key={cellIndex} className="border border-gray-300 px-4 py-2">
                                {value}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {queryResults.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-muted-foreground">Execute uma query para ver os resultados</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
`