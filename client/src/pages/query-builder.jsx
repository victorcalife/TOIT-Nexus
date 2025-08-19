/**
 * TQL QUERY BUILDER VISUAL AVANÇADO
 * Interface drag-drop para construção de queries SQL
 * 100% JavaScript - SEM TYPESCRIPT
 */

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import
{
  Database, Play, Save, Download, Upload, History,
  Table, Columns, Filter, Link, Plus, Trash2, Copy,
  Code, Eye, Settings, Search, BookOpen, Zap
} from 'lucide-react';

// Chart components
import
{
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
      title: "Dashboard Tempo Real",
      description: "Dashboard com KPIs atualizados em tempo real",
      code: `DASHBOARD "Vendas Tempo Real":
    KPI vendas_hoje TITULO "Vendas Hoje", MOEDA R$;
    KPI pedidos_ativo TITULO "Pedidos Ativos";
    KPI usuarios_online TITULO "Online";`
    }
  ],
  basico: [
    {
      title: "Consulta Simples",
      description: "Buscar todos os clientes ativos",
      code: `BUSCAR clientes ONDE status = "ativo";`
    },
    {
      title: "Filtro por Data",
      description: "Vendas dos últimos 30 dias",
      code: `BUSCAR vendas ONDE data >= HOJE(-30);`
    },
    {
      title: "Agrupamento",
      description: "Total de vendas por vendedor",
      code: `BUSCAR vendas AGRUPAR POR vendedor SOMAR(valor);`
    }
  ],
  temporal: [
    {
      title: "Comparação Mensal",
      description: "Vendas do mês atual vs anterior",
      code: `COMPARAR vendas MES(0) COM MES(-1);`
    },
    {
      title: "Tendência Semanal",
      description: "Evolução das vendas por semana",
      code: `TENDENCIA vendas POR SEMANA ULTIMOS(12);`
    },
    {
      title: "Sazonalidade",
      description: "Padrão sazonal de vendas",
      code: `SAZONALIDADE vendas POR MES ANOS(3);`
    },
    {
      title: "Previsão",
      description: "Previsão de vendas próximos 30 dias",
      code: `PREVER vendas PROXIMOS(30) DIAS;`
    },
    {
      title: "Análise Diária",
      description: "Performance diária vs meta",
      code: `ANALISAR vendas DIARIO COMPARAR meta;`
    },
    {
      title: "Período Específico",
      description: "Vendas entre datas específicas",
      code: `BUSCAR vendas ENTRE DATA("2024-01-01") E DIA(0);`
    },
    {
      title: "Comparação Trimestral",
      description: "Comparar trimestres",
      code: `COMPARAR vendas TRIMESTRE(-1) COM TRIMESTRE(0);`
    }
  ],
  dashboard: [
    {
      title: "Dashboard Executivo",
      description: "Dashboard completo para executivos",
      code: `DASHBOARD "Executivo":
    KPI receita_mes TITULO "Receita Mensal", MOEDA R$;
    KPI clientes_novos TITULO "Novos Clientes";
    GRAFICO vendas_tempo TIPO linha PERIODO 30;
    TABELA top_produtos LIMITE 10;`
    }
  ],
  quantum: [
    {
      title: "Algoritmo Grover com MILA",
      description: "Busca quântica otimizada",
      code: `EXECUTAR_QUANTUM "grover_search"
PARAMETROS {
    searchSpace: [1,2,3,4,5,6,7,8],
    targetItem: 5
}
BACKEND "ibm_torino"
RETORNAR speedup, probability, iterations;`
    },
    {
      title: "Dashboard Quântico MILA",
      description: "Métricas do sistema quântico",
      code: `QUANTUM_DASHBOARD "MILA System":
    QUANTUM_KPI ibm_backends TITULO "Backends IBM";
    QUANTUM_KPI total_qubits TITULO "Qubits Disponíveis";
    QUANTUM_KPI algoritmos_executados TITULO "Algoritmos Hoje";
    QUANTUM_GRAFICO speedup DE algoritmos_quantum;`
    },
    {
      title: "Otimização QAOA",
      description: "Problema de otimização quântica",
      code: `EXECUTAR_QUANTUM "qaoa_optimization"
PROBLEMA "maxcut"
PARAMETROS {
    nodes: 6,
    edges: [[0,1], [1,2], [2,3]]
}
RETORNAR solution, cost, approximationRatio;`
    }
  ]
};

// Sample data for preview
const SAMPLE_DATA = [
  { name: 'Jan', vendas: 4000, meta: 3500 },
  { name: 'Fev', vendas: 3000, meta: 3200 },
  { name: 'Mar', vendas: 5000, meta: 4000 },
  { name: 'Abr', vendas: 4500, meta: 4200 },
  { name: 'Mai', vendas: 6000, meta: 5000 },
  { name: 'Jun', vendas: 5500, meta: 5200 }
];

// Query Builder Component
export default function QueryBuilder()
{
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // State management
  const [ currentQuery, setCurrentQuery ] = useState( {
    name: '',
    tables: [],
    fields: [],
    filters: [],
    joins: [],
    groupBy: [],
    orderBy: []
  } );

  const [ visualization, setVisualization ] = useState( {
    type: 'bar',
    title: '',
    colors: CHART_COLORS,
    width: 800,
    height: 400,
    showLegend: true,
    showGrid: true
  } );

  const [ queryResults, setQueryResults ] = useState( [] );
  const [ isPreviewMode, setIsPreviewMode ] = useState( false );
  const [ saveDialogOpen, setSaveDialogOpen ] = useState( false );
  const [ selectedCategory, setSelectedCategory ] = useState( 'tempo_real' );
  const [ tqlCode, setTqlCode ] = useState( '' );
  const [ currentTQLQuery, setCurrentTQLQuery ] = useState( {
    name: '',
    tqlCode: '',
    description: ''
  } );

  // Available tables and fields (would come from database schema)
  const availableTables = [
    { name: 'clientes', fields: [ 'id', 'name', 'email', 'currentInvestment', 'riskProfile', 'createdAt' ] },
    { name: 'workflows', fields: [ 'id', 'name', 'status', 'executionCount', 'createdAt' ] },
    { name: 'reports', fields: [ 'id', 'name', 'createdAt' ] },
    { name: 'activities', fields: [ 'id', 'action', 'description', 'createdAt' ] }
  ];

  // Fetch saved queries
  const { data: savedQueries = [] } = useQuery( {
    queryKey: [ 'saved-queries' ],
    queryFn: () => apiRequest( '/api/query-builder/queries' ),
    retry: 2
  } );

  // Execute TQL query mutation with MILA integration
  const executeQueryMutation = useMutation( {
    mutationFn: async ( query ) =>
    {
      // Execute TQL with MILA quantum processing
      const tqlResponse = await apiRequest( '/api/tql/execute', 'POST', {
        tql: query.tqlCode || query,
        schemaId: 'default',
        format: 'dashboard',
        useQuantumOptimization: true,
        milaProcessing: true
      } );

      // Process with MILA for enhanced results
      const milaResponse = await apiRequest( '/api/mila/process-query', 'POST', {
        query: query.tqlCode || query,
        tqlResult: tqlResponse.data,
        useQuantumAlgorithms: true,
        optimizationLevel: 'maximum'
      } );

      return {
        ...tqlResponse,
        milaEnhancements: milaResponse,
        results: milaResponse.enhancedResults || tqlResponse.data || []
      };
    },
    onSuccess: ( data ) =>
    {
      setQueryResults( data.results || [] );
      toast( {
        title: "TQL executada com MILA + Quantum",
        description: `${ data.results?.length || 0 } resultados com otimização quântica`,
      } );
    },
    onError: ( error ) =>
    {
      toast( {
        title: "Erro na execução TQL",
        description: error.message || "Erro ao executar query TQL",
        variant: "destructive",
      } );
    }
  } );

  // Save query mutation
  const saveQueryMutation = useMutation( {
    mutationFn: async ( queryData ) =>
    {
      return await apiRequest( '/api/query-builder/queries', 'POST', queryData );
    },
    onSuccess: () =>
    {
      queryClient.invalidateQueries( { queryKey: [ 'saved-queries' ] } );
      setSaveDialogOpen( false );
      toast( {
        title: "Query salva",
        description: "Query salva com sucesso",
      } );
    }
  } );

  // Execute TQL query with MILA integration
  const executeTQLQuery = async () =>
  {
    if ( !tqlCode.trim() )
    {
      toast( {
        title: "Erro",
        description: "Digite uma query TQL para executar",
        variant: "destructive"
      } );
      return;
    }

    // Show processing toast
    toast( {
      title: "🧠 MILA processando...",
      description: "Executando TQL com otimização quântica",
    } );

    try
    {
      // Execute with real TQL engine + MILA
      const result = await executeQueryMutation.mutateAsync( {
        tqlCode,
        name: currentTQLQuery.name || 'Query TQL',
        type: 'tql',
        useQuantumOptimization: true,
        milaProcessing: true
      } );

      // Update visualization based on result type
      if ( result.queryType === 'dashboard' )
      {
        setVisualization( prev => ( {
          ...prev,
          type: 'bar',
          title: currentTQLQuery.name || 'Dashboard TQL'
        } ) );
      }

    } catch ( error )
    {
      console.error( 'Erro executando TQL:', error );
    }
  };

  // Add field to query
  const addField = ( table, field ) =>
  {
    setCurrentQuery( prev => ( {
      ...prev,
      fields: [ ...prev.fields, { table, field } ]
    } ) );
  };

  // Add filter to query
  const addFilter = ( field, operator, value ) =>
  {
    setCurrentQuery( prev => ( {
      ...prev,
      filters: [ ...prev.filters, { field, operator, value } ]
    } ) );
  };

  // Update field
  const updateField = ( index, field ) =>
  {
    setCurrentQuery( prev => ( {
      ...prev,
      fields, i) => i === index ? { ...f, ...field } )
  }));
};

// Update filter
const updateFilter = ( index, filter ) =>
{
  setCurrentQuery( prev => ( {
    ...prev,
    filters, i) => i === index ? { ...f, ...filter } )
}));
  };

// Execute query
const executeQuery = () =>
{
  if ( currentQuery.fields.length === 0 )
  {
    toast( {
      title,
      description,
      variant,
    } );
    return;
  }
  executeQueryMutation.mutate( currentQuery );
};

// Load saved query
const loadQuery = ( savedQuery ) =>
{
  setCurrentQuery( savedQuery.query );
  setVisualization( savedQuery.visualization );
  if ( savedQuery.data )
  {
    setQueryResults( savedQuery.data );
  }
};

// Render visualization
const renderVisualization = () =>
{
  if ( !queryResults.length ) return null;

  const containerStyle = {
    width,
    height) {
      case 'table':
        return (
    <div className="overflow-auto border rounded-lg" style={ containerStyle }>
      <table className="w-full">
        <thead className="bg-gray-50 dark).map(key => (
                    <th key={key} className="px-4 py-2 text-left font-medium">
        { key }
      </th>
                  ))}
    </tr>
              </thead >
  <tbody>
    { queryResults.map( ( row, i ) => (
      <tr key={ i } className="border-t">
        { Object.values( row ).map( ( value, j ) => (
          <td key={ j } className="px-4 py-2">
            { String( value ) }
          </td>
        ) ) }
      </tr>
    ) ) }
  </tbody>
            </table >
          </div >
        );

      case 'bar':
return (
  <div style={ containerStyle }>
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={ queryResults }>
        { visualization.showGrid && <CartesianGrid strokeDasharray="3 3" /> }
        <XAxis dataKey={ visualization.xAxis || 'label' } />
        <YAxis />
        <Tooltip />
        { visualization.showLegend && <Legend /> }
        <Bar
          dataKey={ visualization.yAxis || 'value' }
          fill={ visualization.colors[ 0 ] }
        />
      </BarChart>
    </ResponsiveContainer>
  </div>
);

      case 'line':
return (
  <div style={ containerStyle }>
    <ResponsiveContainer width="100%" height="100%">
      <RechartsLineChart data={ queryResults }>
        { visualization.showGrid && <CartesianGrid strokeDasharray="3 3" /> }
        <XAxis dataKey={ visualization.xAxis || 'label' } />
        <YAxis />
        <Tooltip />
        { visualization.showLegend && <Legend /> }
        <Line
          type="monotone"
          dataKey={ visualization.yAxis || 'value' }
          stroke={ visualization.colors[ 0 ] }
        />
      </RechartsLineChart>
    </ResponsiveContainer>
  </div>
);

      case 'pie':
return (
  <div style={ containerStyle }>
    <ResponsiveContainer width="100%" height="100%">
      <RechartsPieChart>
        <Pie
          data={ queryResults }
          dataKey={ visualization.yAxis || 'value' }
          nameKey={ visualization.xAxis || 'label' }
          cx="50%"
          cy="50%"
          outerRadius={ 80 }
          fill="#8884d8"
        >
          { queryResults.map( ( entry, index ) => (
            <Cell key={ `cell-${ index }` } fill={ visualization.colors[ index % visualization.colors.length ] } />
          ) ) }
        </Pie>
        <Tooltip />
        { visualization.showLegend && <Legend /> }
      </RechartsPieChart>
    </ResponsiveContainer>
  </div>
);

      case 'area':
return (
  <div style={ containerStyle }>
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={ queryResults }>
        { visualization.showGrid && <CartesianGrid strokeDasharray="3 3" /> }
        <XAxis dataKey={ visualization.xAxis || 'label' } />
        <YAxis />
        <Tooltip />
        { visualization.showLegend && <Legend /> }
        <Area
          type="monotone"
          dataKey={ visualization.yAxis || 'value' }
          stroke={ visualization.colors[ 0 ] }
          fill={ visualization.colors[ 0 ] }
        />
      </AreaChart>
    </ResponsiveContainer>
  </div>
);
        
      case 'kpi':
// Renderizar KPI TQL
const kpiValue = queryResults[ 0 ]?.value || queryResults[ 0 ] || 0;
return (
  <div className="text-center p-6">
    <div className="text-4xl font-bold text-blue-600 mb-2">
      { typeof kpiValue === 'number' ?
        kpiValue.toLocaleString( 'pt-BR', { style, currency) { visualization.title }
    </div>
  </div>
);
        
      case 'gauge':
// Renderizar Gauge TQL
const gaugeValue = typeof queryResults[ 0 ] === 'number' ? queryResults[ 0 ] :
  queryResults[ 0 ]?.value || 0;
const percentage = Math.min( Math.max( gaugeValue, 0 ), 100 );
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
          </div >
        );

      default, dashboards e relatórios executivos
          </p >
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
        </div >

  <div className="grid grid-cols-12 gap-6">
    {/* TQL Editor Panel */ }
    <div className="col-span-12 lg) => setCurrentTQLQuery(prev => ({ ...prev, name))}
                        placeholder="Minha consulta TQL"
                      />
  </div>

{/* TQL Code Editor */ }
<div>
  <div className="flex items-center justify-between mb-2">
    <Label htmlFor="tqlCode">Código TQL</Label>
    <div className="flex gap-1">
      <Button size="sm" variant="outline" onClick={ validateTQLSyntax }>
        <CheckCircle className="w-4 h-4" />
      </Button>
      <Button size="sm" variant="outline" onClick={ () => setTqlCode( '' ) }>
        <AlertCircle className="w-4 h-4" />
      </Button>
    </div>
  </div>
  <Textarea
    id="tqlCode"
    value={ tqlCode }
    onChange={ ( e ) =>
    {
      setTqlCode( e.target.value );
      setCurrentTQLQuery( prev => ( { ...prev, tqlCode) );
    } }
    placeholder={ `# Digite sua consulta TQL em português);\n\n# Dashboard completo);\n\nDASHBOARD "Vendas Mensal":\n    KPI vendas_mes TITULO "Vendas do Mês", MOEDA R$;` }
    className="min-h-[200px] font-mono text-sm"
  />
</div>

{/* Schema Selection */ }
{
  schemas.length > 0 && (
    <div>
      <Label>Esquema de Dados</Label>
      <Select value={ schemas[ 0 ] } disabled>
        <SelectTrigger>
          <SelectValue placeholder="Selecionar esquema" />
        </SelectTrigger>
        <SelectContent>
          { schemas.map( schema => (
            <SelectItem key={ schema } value={ schema }>
              { schema }
            </SelectItem>
          ) ) }
        </SelectContent>
      </Select>
    </div>
  )
}

{/* Action Buttons */ }
<div className="flex gap-2">
  <Button
    onClick={ executeTQLQuery }
    disabled={ executeQueryMutation.isPending }
    className="flex-1"
  >
    <Play className="w-4 h-4 mr-2" />
    { executeQueryMutation.isPending ? 'Executando TQL com MILA...' : 'Executar TQL' }
  </Button>
  <Dialog open={ saveDialogOpen } onOpenChange={ setSaveDialogOpen }>
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
            value={ currentTQLQuery.name }
            onChange={ ( e ) => setCurrentTQLQuery( prev => ( { ...prev, name) ) }
          />
        </div>
        <div>
          <Label htmlFor="saveDescription">Descrição</Label>
          <Textarea
            id="saveDescription"
            value={ currentTQLQuery.description || '' }
            onChange={ ( e ) => setCurrentTQLQuery( prev => ( { ...prev, description) ) }
          />
        </div>
        <Button
          onClick={ () => saveTQLMutation.mutate( currentTQLQuery ) }
          disabled={ saveTQLMutation.isPending }
          className="w-full"
        >
          Salvar TQL
        </Button>
      </div>
    </DialogContent>
  </Dialog>
</div>
                  </TabsContent >

  <TabsContent value="examples" className="space-y-4">
    <div>
      <Label>Categorias de Exemplos</Label>
      <Select
        value={ selectedCategory }
        onValueChange={ ( value ) => setSelectedCategory( value ) }
      >
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="tempo_real">⚡ Tempo Real</SelectItem>
          <SelectItem value="basico">🔰 Básico</SelectItem>
          <SelectItem value="temporal">⏰ Temporal</SelectItem>
          <SelectItem value="dashboard">📊 Dashboard</SelectItem>
          <SelectItem value="quantum">⚛️ Quantum MILA</SelectItem>
        </SelectContent>
      </Select>
    </div>

    <ScrollArea className="h-[400px]">
      <div className="space-y-2">
        { TQL_EXAMPLES[ selectedCategory ]?.map( ( example, index ) => (
          <Card
            key={ index }
            className="p-3 cursor-pointer hover) => insertTQLExample(example)}
                          >
                            <div className="font-medium text-sm">{example.title}</div>
        < div className = "text-xs text-gray-500 mt-1" > { example.description }</div>
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
          <strong>TQL - TOIT Query Language</strong><br />
          Linguagem de consulta 100% em português brasileiro para criar relatórios e dashboards em tempo real.
        </AlertDescription>
      </Alert>

      <ScrollArea className="h-[500px] space-y-4">
        <div className="space-y-6 text-sm pr-4">

          {/* 1. CONSULTAS BÁSICAS */ }
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
              <div><strong>Operadores disponíveis);<br />
                <br />
                # Calcular crescimento<br />
                crescimento = (vendas_mes - vendas_anterior) / vendas_anterior * 100;
              </div>
            </div>
          </div>

          {/* 5. DASHBOARDS */ }
          <div>
            <h4 className="font-semibold text-base mb-2 flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              5. Dashboards Dinâmicos
            </h4>
            <div className="space-y-2">
              <div><strong>Tipos de componentes, MOEDA R$, COR azul;<br />
                &nbsp;&nbsp;KPI crescimento TITULO "vs Ontem", FORMATO %,<br />
                &nbsp;&nbsp;&nbsp;&nbsp;COR verde SE &gt;0, COR vermelho SE &lt;0;<br />
                &nbsp;&nbsp;GRAFICO linha DE vendas PERIODO ESTA_SEMANA;<br />
                &nbsp;&nbsp;TABELA TOP 10 DE clientes ORDENADO POR valor;
              </div>
            </div>
          </div>

          {/* 6. FORMATAÇÃO E CORES */ }
          <div>
            <h4 className="font-semibold text-base mb-2 flex items-center gap-2">
              <Palette className="w-4 h-4" />
              6. Formatação e Estilos
            </h4>
            <div className="space-y-2">
              <div><strong>Formatos disponíveis, MOEDA R$, COR verde;<br />
                KPI conversao TITULO "Taxa Conversão", FORMATO %, COR azul;<br />
                KPI temperatura TITULO "Temperatura", FORMATO decimal, COR laranja;
              </div>
            </div>
          </div>

          {/* 7. AGRUPAMENTO E ORDENAÇÃO */ }
          <div>
            <h4 className="font-semibold text-base mb-2 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              7. Agrupamento e Ordenação
            </h4>
            <div className="space-y-2">
              <div><strong>Comandos de organização) / receita_ontem * 100;<br />
                usuarios_online = CONTAR usuarios ONDE ultimo_acesso = AGORA;<br />
                pedidos_pendentes = CONTAR pedidos ONDE status = "pendente";<br />
                <br />
                DASHBOARD "Executivo Live" ATUALIZAR_A_CADA 15_SEGUNDOS, MOEDA R$, COR verde;<br />
                &nbsp;&nbsp;KPI crescimento TITULO "Crescimento vs Ontem", FORMATO %,<br />
                &nbsp;&nbsp;&nbsp;&nbsp;COR verde SE &gt;0, COR vermelho SE &lt;0;<br />
                &nbsp;&nbsp;KPI usuarios_online TITULO "Usuários Online", COR azul;<br />
                &nbsp;&nbsp;KPI pedidos_pendentes TITULO "Pedidos Pendentes", COR laranja;<br />
                &nbsp;&nbsp;GRAFICO linha DE receita PERIODO ESTA_SEMANA TITULO "Receita Semanal";<br />
                &nbsp;&nbsp;GRAFICO barras DE vendas AGRUPADO POR regiao TOP 5;<br />
                &nbsp;&nbsp;TABELA pedidos ONDE status = "pendente" LIMITADO A 10;
              </div>
            </div>

          </div>
      </ScrollArea>
  </TabsContent>
                  
                </Tabs >



              </CardContent >
            </Card >

  {/* Saved TQL Queries */ }
  < Card className = "mt-6" >
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
                </ScrollArea >
              </CardContent >
            </Card >
          </div >

  {/* Visualization Panel */ }
  < div className = "col-span-12 lg) => setIsPreviewMode(!isPreviewMode)}
    >
    <Eye className="w-4 h-4 mr-2" />
{ executionResult?.type === 'dashboard' ? 'Dashboard' : 'Preview' }
                    </Button >
  { executionResult && (
    <Badge variant="secondary">
      { executionResult.type === 'dashboard' ? '📊 Dashboard' :
        executionResult.type === 'variable' ? '🔢 Variável' : '📋 Dados' }
    </Badge>
  )}
                  </div >
                </div >
              </CardHeader >
  <CardContent>
    { executionResult ? (
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
              </CardContent >
            </Card >

  {/* Estado inicial - aguardando execução TQL */ }
{
  !executionResult && (
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