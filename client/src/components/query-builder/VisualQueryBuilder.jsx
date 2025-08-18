/**
 * VISUAL QUERY BUILDER
 * Interface drag-and-drop para construção visual de queries TQL
 * 100% JavaScript - SEM TYPESCRIPT
 */

import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  Database,
  Table,
  Columns,
  Filter,
  Plus,
  Trash2,
  Play,
  Save,
  Code,
  Eye,
  Settings,
  Zap,
  Brain,
  Target,
  BarChart3,
  PieChart,
  LineChart,
  TrendingUp
} from 'lucide-react';

const FIELD_TYPES = {
  TEXT: 'text',
  NUMBER: 'number',
  DATE: 'date',
  BOOLEAN: 'boolean'
};

const OPERATORS = {
  EQUALS: '=',
  NOT_EQUALS: '!=',
  GREATER: '>',
  LESS: '<',
  GREATER_EQUAL: '>=',
  LESS_EQUAL: '<=',
  CONTAINS: 'CONTÉM',
  STARTS_WITH: 'INICIA COM',
  ENDS_WITH: 'TERMINA COM',
  IN: 'EM',
  BETWEEN: 'ENTRE'
};

const AGGREGATIONS = {
  COUNT: 'CONTAR',
  SUM: 'SOMAR',
  AVG: 'MÉDIA',
  MIN: 'MÍNIMO',
  MAX: 'MÁXIMO'
};

export default function VisualQueryBuilder({ onQueryChange, onExecute }) {
  const [selectedTables, setSelectedTables] = useState([]);
  const [selectedFields, setSelectedFields] = useState([]);
  const [filters, setFilters] = useState([]);
  const [groupBy, setGroupBy] = useState([]);
  const [orderBy, setOrderBy] = useState([]);
  const [aggregations, setAggregations] = useState([]);
  const [generatedTQL, setGeneratedTQL] = useState('');

  // Mock data - em produção viria da API
  const availableTables = [
    {
      name: 'vendas',
      displayName: 'Vendas',
      fields: [
        { name: 'id', type: FIELD_TYPES.NUMBER, displayName: 'ID' },
        { name: 'valor', type: FIELD_TYPES.NUMBER, displayName: 'Valor' },
        { name: 'data', type: FIELD_TYPES.DATE, displayName: 'Data' },
        { name: 'vendedor', type: FIELD_TYPES.TEXT, displayName: 'Vendedor' },
        { name: 'produto', type: FIELD_TYPES.TEXT, displayName: 'Produto' },
        { name: 'regiao', type: FIELD_TYPES.TEXT, displayName: 'Região' }
      ]
    },
    {
      name: 'clientes',
      displayName: 'Clientes',
      fields: [
        { name: 'id', type: FIELD_TYPES.NUMBER, displayName: 'ID' },
        { name: 'nome', type: FIELD_TYPES.TEXT, displayName: 'Nome' },
        { name: 'email', type: FIELD_TYPES.TEXT, displayName: 'Email' },
        { name: 'cidade', type: FIELD_TYPES.TEXT, displayName: 'Cidade' },
        { name: 'ativo', type: FIELD_TYPES.BOOLEAN, displayName: 'Ativo' }
      ]
    },
    {
      name: 'produtos',
      displayName: 'Produtos',
      fields: [
        { name: 'id', type: FIELD_TYPES.NUMBER, displayName: 'ID' },
        { name: 'nome', type: FIELD_TYPES.TEXT, displayName: 'Nome' },
        { name: 'preco', type: FIELD_TYPES.NUMBER, displayName: 'Preço' },
        { name: 'categoria', type: FIELD_TYPES.TEXT, displayName: 'Categoria' }
      ]
    }
  ];

  // Gerar TQL baseado na configuração visual
  const generateTQL = useCallback(() => {
    let tql = '';

    // Se há agregações, criar variáveis primeiro
    if (aggregations.length > 0) {
      aggregations.forEach(agg => {
        const tableName = selectedTables.find(t => t.fields.some(f => f.name === agg.field))?.name;
        tql += `${agg.variable} = ${agg.function} ${agg.field} DE ${tableName}`;
        
        if (filters.length > 0) {
          tql += ' ONDE ';
          tql += filters.map(filter => 
            `${filter.field} ${filter.operator} ${filter.value}`
          ).join(' E ');
        }
        tql += ';\n';
      });

      // Criar dashboard
      tql += '\nDASHBOARD "Dashboard Visual":\n';
      aggregations.forEach(agg => {
        tql += `    KPI ${agg.variable} TITULO "${agg.displayName}"`;
        if (agg.field === 'valor' || agg.field === 'preco') {
          tql += ', MOEDA R$';
        }
        tql += ';\n';
      });
    } else {
      // Query simples
      tql = 'BUSCAR ';
      
      if (selectedFields.length > 0) {
        tql += selectedFields.map(f => f.name).join(', ');
      } else {
        tql += '*';
      }
      
      if (selectedTables.length > 0) {
        tql += ` DE ${selectedTables[0].name}`;
      }
      
      if (filters.length > 0) {
        tql += ' ONDE ';
        tql += filters.map(filter => 
          `${filter.field} ${filter.operator} ${filter.value}`
        ).join(' E ');
      }
      
      if (groupBy.length > 0) {
        tql += ` AGRUPADO POR ${groupBy.map(g => g.name).join(', ')}`;
      }
      
      if (orderBy.length > 0) {
        tql += ` ORDENADO POR ${orderBy.map(o => `${o.name} ${o.direction}`).join(', ')}`;
      }
      
      tql += ';';
    }

    setGeneratedTQL(tql);
    onQueryChange?.(tql);
    return tql;
  }, [selectedTables, selectedFields, filters, groupBy, orderBy, aggregations, onQueryChange]);

  // Adicionar tabela
  const addTable = (table) => {
    if (!selectedTables.find(t => t.name === table.name)) {
      setSelectedTables(prev => [...prev, table]);
    }
  };

  // Adicionar campo
  const addField = (field, tableName) => {
    const fullField = { ...field, tableName, fullName: `${tableName}.${field.name}` };
    if (!selectedFields.find(f => f.fullName === fullField.fullName)) {
      setSelectedFields(prev => [...prev, fullField]);
    }
  };

  // Adicionar filtro
  const addFilter = () => {
    setFilters(prev => [...prev, {
      id: Date.now(),
      field: '',
      operator: OPERATORS.EQUALS,
      value: ''
    }]);
  };

  // Adicionar agregação
  const addAggregation = () => {
    setAggregations(prev => [...prev, {
      id: Date.now(),
      function: AGGREGATIONS.COUNT,
      field: '',
      variable: `var_${prev.length + 1}`,
      displayName: `Métrica ${prev.length + 1}`
    }]);
  };

  // Remover item
  const removeItem = (id, setter) => {
    setter(prev => prev.filter(item => item.id !== id));
  };

  // Executar query
  const handleExecute = () => {
    const tql = generateTQL();
    onExecute?.(tql);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
      {/* Painel de Tabelas */}
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Database className="w-5 h-5" />
              <span>Tabelas</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {availableTables.map(table => (
              <div
                key={table.name}
                className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                onClick={() => addTable(table)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Table className="w-4 h-4" />
                    <span className="font-medium">{table.displayName}</span>
                  </div>
                  <Badge variant="outline">{table.fields.length}</Badge>
                </div>
                
                <div className="mt-2 space-y-1">
                  {table.fields.slice(0, 3).map(field => (
                    <div
                      key={field.name}
                      className="text-xs text-gray-600 flex items-center space-x-1 hover:text-blue-600 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        addField(field, table.name);
                      }}
                    >
                      <Columns className="w-3 h-3" />
                      <span>{field.displayName}</span>
                    </div>
                  ))}
                  {table.fields.length > 3 && (
                    <div className="text-xs text-gray-400">
                      +{table.fields.length - 3} mais...
                    </div>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Painel de Construção */}
      <div className="space-y-4">
        <Tabs defaultValue="fields" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="fields">Campos</TabsTrigger>
            <TabsTrigger value="filters">Filtros</TabsTrigger>
            <TabsTrigger value="group">Grupo</TabsTrigger>
            <TabsTrigger value="kpis">KPIs</TabsTrigger>
          </TabsList>

          <TabsContent value="fields" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Campos Selecionados</span>
                  <Badge>{selectedFields.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedFields.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">
                    Clique nos campos das tabelas para adicionar
                  </p>
                ) : (
                  <div className="space-y-2">
                    {selectedFields.map(field => (
                      <div
                        key={field.fullName}
                        className="flex items-center justify-between p-2 bg-blue-50 rounded"
                      >
                        <span className="text-sm">{field.tableName}.{field.displayName}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setSelectedFields(prev => 
                            prev.filter(f => f.fullName !== field.fullName)
                          )}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="filters" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Filtros</span>
                  <Button size="sm" onClick={addFilter}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {filters.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">
                    Nenhum filtro adicionado
                  </p>
                ) : (
                  <div className="space-y-3">
                    {filters.map(filter => (
                      <div key={filter.id} className="flex items-center space-x-2">
                        <Input
                          placeholder="Campo"
                          value={filter.field}
                          onChange={(e) => setFilters(prev =>
                            prev.map(f => f.id === filter.id ? { ...f, field: e.target.value } : f)
                          )}
                          className="flex-1"
                        />
                        <select
                          value={filter.operator}
                          onChange={(e) => setFilters(prev =>
                            prev.map(f => f.id === filter.id ? { ...f, operator: e.target.value } : f)
                          )}
                          className="px-2 py-1 border rounded"
                        >
                          {Object.entries(OPERATORS).map(([key, value]) => (
                            <option key={key} value={value}>{value}</option>
                          ))}
                        </select>
                        <Input
                          placeholder="Valor"
                          value={filter.value}
                          onChange={(e) => setFilters(prev =>
                            prev.map(f => f.id === filter.id ? { ...f, value: e.target.value } : f)
                          )}
                          className="flex-1"
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeItem(filter.id, setFilters)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="kpis" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>KPIs e Métricas</span>
                  <Button size="sm" onClick={addAggregation}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {aggregations.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">
                    Adicione KPIs para criar dashboards
                  </p>
                ) : (
                  <div className="space-y-3">
                    {aggregations.map(agg => (
                      <div key={agg.id} className="p-3 border rounded-lg space-y-2">
                        <div className="flex items-center justify-between">
                          <Input
                            placeholder="Nome da métrica"
                            value={agg.displayName}
                            onChange={(e) => setAggregations(prev =>
                              prev.map(a => a.id === agg.id ? { ...a, displayName: e.target.value } : a)
                            )}
                            className="flex-1 mr-2"
                          />
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeItem(agg.id, setAggregations)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                        
                        <div className="flex space-x-2">
                          <select
                            value={agg.function}
                            onChange={(e) => setAggregations(prev =>
                              prev.map(a => a.id === agg.id ? { ...a, function: e.target.value } : a)
                            )}
                            className="px-2 py-1 border rounded flex-1"
                          >
                            {Object.entries(AGGREGATIONS).map(([key, value]) => (
                              <option key={key} value={value}>{value}</option>
                            ))}
                          </select>
                          
                          <Input
                            placeholder="Campo"
                            value={agg.field}
                            onChange={(e) => setAggregations(prev =>
                              prev.map(a => a.id === agg.id ? { ...a, field: e.target.value } : a)
                            )}
                            className="flex-1"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Painel de Resultado */}
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>TQL Gerado</span>
              <div className="flex space-x-2">
                <Button size="sm" variant="outline" onClick={generateTQL}>
                  <Code className="w-4 h-4" />
                </Button>
                <Button size="sm" onClick={handleExecute}>
                  <Play className="w-4 h-4" />
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm whitespace-pre-wrap">
              {generatedTQL || '// TQL será gerado aqui...'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Visualização</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-500">
              <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p>Execute a query para ver os resultados</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
