import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UnifiedHeader } from '@/components/unified-header';
import { 
  Database, 
  Play, 
  Save, 
  Download, 
  Eye, 
  Plus, 
  Trash2, 
  BarChart3, 
  Table, 
  PieChart,
  LineChart,
  Settings,
  Filter,
  SortAsc,
  SortDesc,
  Group,
  Calculator
} from 'lucide-react';

// Query builder interface
interface QueryConfig {
  tables: string[];
  columns: Array<{
    table: string;
    column: string;
    alias?: string;
    aggregation?: 'SUM' | 'COUNT' | 'AVG' | 'MAX' | 'MIN';
  }>;
  joins: Array<{
    type: 'INNER' | 'LEFT' | 'RIGHT' | 'FULL';
    table: string;
    condition: string;
  }>;
  filters: Array<{
    column: string;
    operator: '=' | '!=' | '>' | '<' | '>=' | '<=' | 'LIKE' | 'IN';
    value: string;
    logic?: 'AND' | 'OR';
  }>;
  groupBy: string[];
  orderBy: Array<{
    column: string;
    direction: 'ASC' | 'DESC';
  }>;
  limit?: number;
}

interface ResultConfig {
  type: 'table' | 'bar' | 'line' | 'pie' | 'metric';
  title: string;
  xAxis?: string;
  yAxis?: string;
  colorScheme?: string;
  showLabels?: boolean;
  showLegend?: boolean;
}

interface Connection {
  id: string;
  name: string;
  type: string;
  config: any;
}

interface SavedQuery {
  id: string;
  name: string;
  description: string;
  queryConfig: QueryConfig;
  sqlQuery: string;
  resultConfig: ResultConfig;
  connectionId: string;
  lastExecuted?: string;
  executionCount: number;
  tags: string[];
}

export default function QueryBuilder() {
  const [selectedConnection, setSelectedConnection] = useState<Connection | null>(null);
  const [queryConfig, setQueryConfig] = useState<QueryConfig>({
    tables: [],
    columns: [],
    joins: [],
    filters: [],
    groupBy: [],
    orderBy: [],
  });
  const [resultConfig, setResultConfig] = useState<ResultConfig>({
    type: 'table',
    title: 'Query Result',
    showLabels: true,
    showLegend: true,
  });
  const [sqlQuery, setSqlQuery] = useState('');
  const [queryResults, setQueryResults] = useState<any[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [activeTab, setActiveTab] = useState('builder');
  const [savedQueries, setSavedQueries] = useState<SavedQuery[]>([]);
  const [queryName, setQueryName] = useState('');
  const [queryDescription, setQueryDescription] = useState('');

  // Mock connections - in real app, fetch from API
  const [connections] = useState<Connection[]>([
    {
      id: '1',
      name: 'PostgreSQL Principal',
      type: 'database',
      config: { host: 'localhost', database: 'main_db' }
    },
    {
      id: '2',
      name: 'API de Vendas',
      type: 'api',
      config: { endpoint: 'https://api.example.com/sales' }
    },
  ]);

  // Mock table schema - in real app, fetch dynamically
  const [tableSchema, setTableSchema] = useState<Record<string, string[]>>({
    users: ['id', 'name', 'email', 'created_at'],
    orders: ['id', 'user_id', 'amount', 'status', 'created_at'],
    products: ['id', 'name', 'price', 'category', 'stock'],
  });

  // Generate SQL from visual query builder
  const generateSQL = () => {
    if (queryConfig.tables.length === 0) return '';

    let sql = 'SELECT ';
    
    // Columns
    if (queryConfig.columns.length === 0) {
      sql += '*';
    } else {
      sql += queryConfig.columns.map(col => {
        let colStr = `${col.table}.${col.column}`;
        if (col.aggregation) {
          colStr = `${col.aggregation}(${colStr})`;
        }
        if (col.alias) {
          colStr += ` AS ${col.alias}`;
        }
        return colStr;
      }).join(', ');
    }

    // FROM
    sql += `\nFROM ${queryConfig.tables[0]}`;

    // JOINs
    queryConfig.joins.forEach(join => {
      sql += `\n${join.type} JOIN ${join.table} ON ${join.condition}`;
    });

    // WHERE
    if (queryConfig.filters.length > 0) {
      sql += '\nWHERE ';
      sql += queryConfig.filters.map((filter, index) => {
        let filterStr = `${filter.column} ${filter.operator} `;
        if (filter.operator === 'IN') {
          filterStr += `(${filter.value})`;
        } else if (filter.operator === 'LIKE') {
          filterStr += `'%${filter.value}%'`;
        } else {
          filterStr += `'${filter.value}'`;
        }
        
        if (index > 0 && filter.logic) {
          filterStr = `${filter.logic} ` + filterStr;
        }
        return filterStr;
      }).join(' ');
    }

    // GROUP BY
    if (queryConfig.groupBy.length > 0) {
      sql += `\nGROUP BY ${queryConfig.groupBy.join(', ')}`;
    }

    // ORDER BY
    if (queryConfig.orderBy.length > 0) {
      sql += `\nORDER BY ${queryConfig.orderBy.map(order => 
        `${order.column} ${order.direction}`
      ).join(', ')}`;
    }

    // LIMIT
    if (queryConfig.limit) {
      sql += `\nLIMIT ${queryConfig.limit}`;
    }

    return sql;
  };

  // Update SQL when query config changes
  useEffect(() => {
    const newSQL = generateSQL();
    setSqlQuery(newSQL);
  }, [queryConfig]);

  // Execute query
  const executeQuery = async () => {
    if (!selectedConnection || !sqlQuery) return;

    setIsExecuting(true);
    try {
      // Mock execution - in real app, call API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock results
      const mockResults = [
        { id: 1, name: 'João Silva', email: 'joao@email.com', total_orders: 5, total_amount: 1250.00 },
        { id: 2, name: 'Maria Santos', email: 'maria@email.com', total_orders: 3, total_amount: 890.50 },
        { id: 3, name: 'Pedro Costa', email: 'pedro@email.com', total_orders: 8, total_amount: 2100.75 },
      ];
      
      setQueryResults(mockResults);
    } catch (error) {
      console.error('Error executing query:', error);
    } finally {
      setIsExecuting(false);
    }
  };

  // Save query
  const saveQuery = () => {
    if (!queryName || !sqlQuery) return;

    const newQuery: SavedQuery = {
      id: Date.now().toString(),
      name: queryName,
      description: queryDescription,
      queryConfig,
      sqlQuery,
      resultConfig,
      connectionId: selectedConnection?.id || '',
      executionCount: 0,
      tags: [],
    };

    setSavedQueries(prev => [...prev, newQuery]);
    setQueryName('');
    setQueryDescription('');
  };

  // Load saved query
  const loadQuery = (query: SavedQuery) => {
    setQueryConfig(query.queryConfig);
    setResultConfig(query.resultConfig);
    setSqlQuery(query.sqlQuery);
    setQueryName(query.name);
    setQueryDescription(query.description);
    setActiveTab('builder');
  };

  // Add column to query
  const addColumn = () => {
    if (queryConfig.tables.length === 0) return;
    
    setQueryConfig(prev => ({
      ...prev,
      columns: [...prev.columns, {
        table: prev.tables[0],
        column: tableSchema[prev.tables[0]]?.[0] || 'id',
      }]
    }));
  };

  // Add filter to query
  const addFilter = () => {
    if (queryConfig.tables.length === 0) return;
    
    setQueryConfig(prev => ({
      ...prev,
      filters: [...prev.filters, {
        column: `${prev.tables[0]}.${tableSchema[prev.tables[0]]?.[0] || 'id'}`,
        operator: '=',
        value: '',
        logic: prev.filters.length > 0 ? 'AND' : undefined,
      }]
    }));
  };

  // Render query results based on result config
  const renderResults = () => {
    if (queryResults.length === 0) return null;

    switch (resultConfig.type) {
      case 'table':
        return (
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {Object.keys(queryResults[0]).map(key => (
                    <th key={key} className="px-4 py-2 text-left text-sm font-medium text-gray-700 border-b">
                      {key}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {queryResults.map((row, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    {Object.values(row).map((value, i) => (
                      <td key={i} className="px-4 py-2 text-sm text-gray-900 border-b">
                        {String(value)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      case 'metric':
        const firstRow = queryResults[0];
        const metricValue = Object.values(firstRow)[0];
        return (
          <div className="text-center p-8">
            <div className="text-4xl font-bold text-blue-600 mb-2">
              {typeof metricValue === 'number' ? metricValue.toLocaleString() : metricValue}
            </div>
            <div className="text-gray-600">
              {resultConfig.title}
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center p-8 text-gray-500">
            Visualização {resultConfig.type} será implementada
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <UnifiedHeader title="Query Builder" subtitle="Construa consultas visuais sem código" showUserActions={true} />

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Connection Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Database className="h-5 w-5 mr-2" />
              Selecionar Conexão
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {connections.map(conn => (
                <div 
                  key={conn.id}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                    selectedConnection?.id === conn.id 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedConnection(conn)}
                >
                  <div className="font-medium">{conn.name}</div>
                  <div className="text-sm text-gray-500">{conn.type}</div>
                  <Badge variant="outline" className="mt-2">
                    {conn.type === 'database' ? 'PostgreSQL' : 'REST API'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {selectedConnection && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Query Builder */}
            <div className="lg:col-span-3">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="builder">Visual Builder</TabsTrigger>
                  <TabsTrigger value="sql">SQL Editor</TabsTrigger>
                  <TabsTrigger value="results">Resultados</TabsTrigger>
                  <TabsTrigger value="visualization">Visualização</TabsTrigger>
                </TabsList>

                {/* Visual Builder */}
                <TabsContent value="builder">
                  <Card>
                    <CardHeader>
                      <CardTitle>Construtor Visual</CardTitle>
                      <CardDescription>Configure sua consulta usando interface visual</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Tables Selection */}
                      <div>
                        <Label className="text-base font-medium">Tabelas</Label>
                        <div className="mt-2 space-y-2">
                          {Object.keys(tableSchema).map(table => (
                            <label key={table} className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={queryConfig.tables.includes(table)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setQueryConfig(prev => ({
                                      ...prev,
                                      tables: [...prev.tables, table]
                                    }));
                                  } else {
                                    setQueryConfig(prev => ({
                                      ...prev,
                                      tables: prev.tables.filter(t => t !== table)
                                    }));
                                  }
                                }}
                                className="rounded"
                              />
                              <span className="text-sm">{table}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Columns Selection */}
                      {queryConfig.tables.length > 0 && (
                        <div>
                          <div className="flex items-center justify-between">
                            <Label className="text-base font-medium">Colunas</Label>
                            <Button onClick={addColumn} size="sm">
                              <Plus className="h-4 w-4 mr-1" />
                              Adicionar
                            </Button>
                          </div>
                          <div className="mt-2 space-y-2">
                            {queryConfig.columns.map((col, index) => (
                              <div key={index} className="grid grid-cols-12 gap-2">
                                <Select
                                  value={col.table}
                                  onValueChange={(value) => {
                                    const newColumns = [...queryConfig.columns];
                                    newColumns[index].table = value;
                                    setQueryConfig(prev => ({ ...prev, columns: newColumns }));
                                  }}
                                >
                                  <SelectTrigger className="col-span-3">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {queryConfig.tables.map(table => (
                                      <SelectItem key={table} value={table}>{table}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                
                                <Select
                                  value={col.column}
                                  onValueChange={(value) => {
                                    const newColumns = [...queryConfig.columns];
                                    newColumns[index].column = value;
                                    setQueryConfig(prev => ({ ...prev, columns: newColumns }));
                                  }}
                                >
                                  <SelectTrigger className="col-span-3">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {tableSchema[col.table]?.map(column => (
                                      <SelectItem key={column} value={column}>{column}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>

                                <Select
                                  value={col.aggregation || ''}
                                  onValueChange={(value) => {
                                    const newColumns = [...queryConfig.columns];
                                    newColumns[index].aggregation = value as any;
                                    setQueryConfig(prev => ({ ...prev, columns: newColumns }));
                                  }}
                                >
                                  <SelectTrigger className="col-span-2">
                                    <SelectValue placeholder="Agregação" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="">Nenhuma</SelectItem>
                                    <SelectItem value="COUNT">COUNT</SelectItem>
                                    <SelectItem value="SUM">SUM</SelectItem>
                                    <SelectItem value="AVG">AVG</SelectItem>
                                    <SelectItem value="MAX">MAX</SelectItem>
                                    <SelectItem value="MIN">MIN</SelectItem>
                                  </SelectContent>
                                </Select>

                                <Input
                                  placeholder="Alias"
                                  value={col.alias || ''}
                                  onChange={(e) => {
                                    const newColumns = [...queryConfig.columns];
                                    newColumns[index].alias = e.target.value;
                                    setQueryConfig(prev => ({ ...prev, columns: newColumns }));
                                  }}
                                  className="col-span-3"
                                />

                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    const newColumns = queryConfig.columns.filter((_, i) => i !== index);
                                    setQueryConfig(prev => ({ ...prev, columns: newColumns }));
                                  }}
                                  className="col-span-1"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Filters */}
                      <div>
                        <div className="flex items-center justify-between">
                          <Label className="text-base font-medium">Filtros</Label>
                          <Button onClick={addFilter} size="sm">
                            <Filter className="h-4 w-4 mr-1" />
                            Adicionar
                          </Button>
                        </div>
                        <div className="mt-2 space-y-2">
                          {queryConfig.filters.map((filter, index) => (
                            <div key={index} className="grid grid-cols-12 gap-2">
                              {index > 0 && (
                                <Select
                                  value={filter.logic || 'AND'}
                                  onValueChange={(value) => {
                                    const newFilters = [...queryConfig.filters];
                                    newFilters[index].logic = value as 'AND' | 'OR';
                                    setQueryConfig(prev => ({ ...prev, filters: newFilters }));
                                  }}
                                >
                                  <SelectTrigger className="col-span-1">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="AND">AND</SelectItem>
                                    <SelectItem value="OR">OR</SelectItem>
                                  </SelectContent>
                                </Select>
                              )}
                              
                              <Input
                                placeholder="Coluna"
                                value={filter.column}
                                onChange={(e) => {
                                  const newFilters = [...queryConfig.filters];
                                  newFilters[index].column = e.target.value;
                                  setQueryConfig(prev => ({ ...prev, filters: newFilters }));
                                }}
                                className={index > 0 ? "col-span-4" : "col-span-5"}
                              />

                              <Select
                                value={filter.operator}
                                onValueChange={(value) => {
                                  const newFilters = [...queryConfig.filters];
                                  newFilters[index].operator = value as any;
                                  setQueryConfig(prev => ({ ...prev, filters: newFilters }));
                                }}
                              >
                                <SelectTrigger className="col-span-2">
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
                                  <SelectItem value="IN">IN</SelectItem>
                                </SelectContent>
                              </Select>

                              <Input
                                placeholder="Valor"
                                value={filter.value}
                                onChange={(e) => {
                                  const newFilters = [...queryConfig.filters];
                                  newFilters[index].value = e.target.value;
                                  setQueryConfig(prev => ({ ...prev, filters: newFilters }));
                                }}
                                className="col-span-4"
                              />

                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  const newFilters = queryConfig.filters.filter((_, i) => i !== index);
                                  setQueryConfig(prev => ({ ...prev, filters: newFilters }));
                                }}
                                className="col-span-1"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* SQL Editor */}
                <TabsContent value="sql">
                  <Card>
                    <CardHeader>
                      <CardTitle>Editor SQL</CardTitle>
                      <CardDescription>Edite o SQL gerado ou escreva sua própria consulta</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Textarea
                        value={sqlQuery}
                        onChange={(e) => setSqlQuery(e.target.value)}
                        placeholder="SELECT * FROM users WHERE..."
                        className="min-h-[300px] font-mono text-sm"
                      />
                      <div className="flex justify-between mt-4">
                        <Button
                          onClick={executeQuery}
                          disabled={isExecuting || !sqlQuery}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          {isExecuting ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                          ) : (
                            <Play className="h-4 w-4 mr-2" />
                          )}
                          Executar Query
                        </Button>
                        <Button onClick={saveQuery} disabled={!queryName || !sqlQuery}>
                          <Save className="h-4 w-4 mr-2" />
                          Salvar Query
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Results */}
                <TabsContent value="results">
                  <Card>
                    <CardHeader>
                      <CardTitle>Resultados da Consulta</CardTitle>
                      <CardDescription>
                        {queryResults.length > 0 
                          ? `${queryResults.length} registros encontrados`
                          : 'Execute uma consulta para ver os resultados'
                        }
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {renderResults()}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Visualization */}
                <TabsContent value="visualization">
                  <Card>
                    <CardHeader>
                      <CardTitle>Configuração de Visualização</CardTitle>
                      <CardDescription>Configure como os resultados serão apresentados</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="chart-type">Tipo de Visualização</Label>
                          <Select
                            value={resultConfig.type}
                            onValueChange={(value) => {
                              setResultConfig(prev => ({ ...prev, type: value as any }));
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="table">
                                <div className="flex items-center">
                                  <Table className="h-4 w-4 mr-2" />
                                  Tabela
                                </div>
                              </SelectItem>
                              <SelectItem value="bar">
                                <div className="flex items-center">
                                  <BarChart3 className="h-4 w-4 mr-2" />
                                  Gráfico de Barras
                                </div>
                              </SelectItem>
                              <SelectItem value="line">
                                <div className="flex items-center">
                                  <LineChart className="h-4 w-4 mr-2" />
                                  Gráfico de Linha
                                </div>
                              </SelectItem>
                              <SelectItem value="pie">
                                <div className="flex items-center">
                                  <PieChart className="h-4 w-4 mr-2" />
                                  Gráfico de Pizza
                                </div>
                              </SelectItem>
                              <SelectItem value="metric">
                                <div className="flex items-center">
                                  <Calculator className="h-4 w-4 mr-2" />
                                  Métrica
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor="chart-title">Título</Label>
                          <Input
                            id="chart-title"
                            value={resultConfig.title}
                            onChange={(e) => {
                              setResultConfig(prev => ({ ...prev, title: e.target.value }));
                            }}
                          />
                        </div>
                      </div>

                      {/* Preview */}
                      <div className="border-2 border-dashed border-gray-200 rounded-lg p-4">
                        <div className="text-sm text-gray-500 mb-2">Pré-visualização:</div>
                        {renderResults()}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Save Query */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Salvar Consulta</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label htmlFor="query-name">Nome</Label>
                    <Input
                      id="query-name"
                      value={queryName}
                      onChange={(e) => setQueryName(e.target.value)}
                      placeholder="Nome da consulta"
                    />
                  </div>
                  <div>
                    <Label htmlFor="query-desc">Descrição</Label>
                    <Textarea
                      id="query-desc"
                      value={queryDescription}
                      onChange={(e) => setQueryDescription(e.target.value)}
                      placeholder="Descrição opcional"
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Saved Queries */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Consultas Salvas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {savedQueries.map(query => (
                      <div
                        key={query.id}
                        className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                        onClick={() => loadQuery(query)}
                      >
                        <div className="font-medium text-sm">{query.name}</div>
                        {query.description && (
                          <div className="text-xs text-gray-500 mt-1">{query.description}</div>
                        )}
                        <div className="flex items-center text-xs text-gray-400 mt-2">
                          <Eye className="h-3 w-3 mr-1" />
                          {query.executionCount} execuções
                        </div>
                      </div>
                    ))}
                    {savedQueries.length === 0 && (
                      <div className="text-sm text-gray-500 text-center py-4">
                        Nenhuma consulta salva
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}