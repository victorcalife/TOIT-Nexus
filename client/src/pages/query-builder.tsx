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
import { Plus, Save, Play, Eye, Palette, BarChart3, Table, PieChart, LineChart, Settings, Download, Share } from "lucide-react";
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

interface QueryField {
  table: string;
  field: string;
  alias?: string;
  aggregation?: 'SUM' | 'COUNT' | 'AVG' | 'MAX' | 'MIN';
}

interface QueryFilter {
  field: string;
  operator: '=' | '!=' | '>' | '<' | '>=' | '<=' | 'LIKE' | 'IN';
  value: string;
}

interface QueryBuilder {
  id?: string;
  name: string;
  description?: string;
  tables: string[];
  fields: QueryField[];
  filters: QueryFilter[];
  joins: any[];
  groupBy: string[];
  orderBy: string[];
  limit?: number;
}

interface VisualizationConfig {
  type: 'table' | 'bar' | 'line' | 'pie' | 'area';
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
    onSuccess: (data) => {
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
                <XAxis dataKey={visualization.xAxis} />
                <YAxis />
                <Tooltip />
                {visualization.showLegend && <Legend />}
                <Bar 
                  dataKey={visualization.yAxis} 
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
                <XAxis dataKey={visualization.xAxis} />
                <YAxis />
                <Tooltip />
                {visualization.showLegend && <Legend />}
                <Line 
                  type="monotone" 
                  dataKey={visualization.yAxis} 
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
                  dataKey={visualization.yAxis}
                  nameKey={visualization.xAxis}
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
                <XAxis dataKey={visualization.xAxis} />
                <YAxis />
                <Tooltip />
                {visualization.showLegend && <Legend />}
                <Area 
                  type="monotone" 
                  dataKey={visualization.yAxis} 
                  stroke={visualization.colors[0]} 
                  fill={visualization.colors[0]} 
                />
              </AreaChart>
            </ResponsiveContainer>
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
            Query Builder Interativo
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Crie consultas, visualizações e relatórios sem código
          </p>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Query Builder Panel */}
          <div className="col-span-12 lg:col-span-4">
            <Card className="h-fit">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Construtor de Consulta
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Query Name */}
                <div>
                  <Label htmlFor="queryName">Nome da Consulta</Label>
                  <Input
                    id="queryName"
                    value={currentQuery.name}
                    onChange={(e) => setCurrentQuery(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Minha consulta personalizada"
                  />
                </div>

                {/* Tables Selection */}
                <div>
                  <Label>Tabelas</Label>
                  <Select
                    value=""
                    onValueChange={(table) => {
                      if (!currentQuery.tables.includes(table)) {
                        setCurrentQuery(prev => ({
                          ...prev,
                          tables: [...prev.tables, table]
                        }));
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Adicionar tabela" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableTables.map(table => (
                        <SelectItem key={table.name} value={table.name}>
                          {table.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {currentQuery.tables.map(table => (
                      <Badge key={table} variant="secondary">
                        {table}
                        <button
                          onClick={() => setCurrentQuery(prev => ({
                            ...prev,
                            tables: prev.tables.filter(t => t !== table)
                          }))}
                          className="ml-2 text-red-500"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Fields Selection */}
                <div>
                  <div className="flex items-center justify-between">
                    <Label>Campos</Label>
                    <Button size="sm" onClick={addField}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="space-y-2 mt-2">
                    {currentQuery.fields.map((field, index) => (
                      <div key={index} className="grid grid-cols-2 gap-2">
                        <Select
                          value={field.table}
                          onValueChange={(table) => updateField(index, { table })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Tabela" />
                          </SelectTrigger>
                          <SelectContent>
                            {currentQuery.tables.map(table => (
                              <SelectItem key={table} value={table}>
                                {table}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Select
                          value={field.field}
                          onValueChange={(fieldName) => updateField(index, { field: fieldName })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Campo" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableTables
                              .find(t => t.name === field.table)?.fields
                              .map(f => (
                                <SelectItem key={f} value={f}>
                                  {f}
                                </SelectItem>
                              )) || []
                            }
                          </SelectContent>
                        </Select>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Filters */}
                <div>
                  <div className="flex items-center justify-between">
                    <Label>Filtros</Label>
                    <Button size="sm" onClick={addFilter}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="space-y-2 mt-2">
                    {currentQuery.filters.map((filter, index) => (
                      <div key={index} className="grid grid-cols-3 gap-2">
                        <Input
                          value={filter.field}
                          onChange={(e) => updateFilter(index, { field: e.target.value })}
                          placeholder="Campo"
                        />
                        <Select
                          value={filter.operator}
                          onValueChange={(operator: any) => updateFilter(index, { operator })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="=">=</SelectItem>
                            <SelectItem value="!=">!=</SelectItem>
                            <SelectItem value=">">></SelectItem>
                            <SelectItem value="<"><</SelectItem>
                            <SelectItem value=">=">>=</SelectItem>
                            <SelectItem value="<="><=</SelectItem>
                            <SelectItem value="LIKE">LIKE</SelectItem>
                          </SelectContent>
                        </Select>
                        <Input
                          value={filter.value}
                          onChange={(e) => updateFilter(index, { value: e.target.value })}
                          placeholder="Valor"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button 
                    onClick={executeQuery} 
                    disabled={executeQueryMutation.isPending}
                    className="flex-1"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Executar
                  </Button>
                  <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline">
                        <Save className="w-4 h-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Salvar Consulta</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="saveName">Nome</Label>
                          <Input
                            id="saveName"
                            value={currentQuery.name}
                            onChange={(e) => setCurrentQuery(prev => ({ ...prev, name: e.target.value }))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="saveDescription">Descrição</Label>
                          <Textarea
                            id="saveDescription"
                            value={currentQuery.description || ''}
                            onChange={(e) => setCurrentQuery(prev => ({ ...prev, description: e.target.value }))}
                          />
                        </div>
                        <Button 
                          onClick={() => saveQueryMutation.mutate({ query: currentQuery, visualization })}
                          disabled={saveQueryMutation.isPending}
                          className="w-full"
                        >
                          Salvar
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>

            {/* Saved Queries */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Consultas Salvas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {savedQueries.map(query => (
                    <div
                      key={query.id}
                      className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                      onClick={() => loadQuery(query)}
                    >
                      <div className="font-medium">{query.name}</div>
                      <div className="text-sm text-gray-500">
                        {new Date(query.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Visualization Panel */}
          <div className="col-span-12 lg:col-span-8">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="w-5 h-5" />
                    Visualização
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Button
                      variant={isPreviewMode ? "default" : "outline"}
                      size="sm"
                      onClick={() => setIsPreviewMode(!isPreviewMode)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Preview
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {!isPreviewMode ? (
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
                ) : (
                  <div className="border rounded-lg p-4 min-h-[400px]">
                    <h3 className="text-lg font-semibold mb-4">{visualization.title}</h3>
                    {renderVisualization()}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}