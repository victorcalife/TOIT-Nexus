/**
 * TQL QUERY BUILDER - HELPER EM TEMPO REAL
 * Interface visual para construção de queries TQL com autocomplete
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Card, 
  Input, 
  Button, 
  Tooltip, 
  Tag, 
  Divider,
  Row,
  Col,
  Select,
  Switch,
  message,
  Spin,
  Alert,
  Collapse,
  List,
  Typography
} from 'antd';
import { 
  PlayCircleOutlined,
  SaveOutlined,
  ClearOutlined,
  BulbOutlined,
  ThunderboltOutlined,
  ExperimentOutlined,
  HistoryOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import MonacoEditor from '@monaco-editor/react';
import './TQLQueryBuilder.css';

const { Option } = Select;
const { Panel } = Collapse;
const { Text, Paragraph } = Typography;

const TQLQueryBuilder = ({ onExecute, onSave }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [validation, setValidation] = useState({ valid: true, errors: [], suggestions: [] });
  const [loading, setLoading] = useState(false);
  const [quantumMode, setQuantumMode] = useState(true);
  const [autoComplete, setAutoComplete] = useState(true);
  const [queryHistory, setQueryHistory] = useState([]);
  const [selectedTable, setSelectedTable] = useState('');
  const [availableTables, setAvailableTables] = useState([]);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [showHelp, setShowHelp] = useState(false);

  const editorRef = useRef(null);
  const monacoRef = useRef(null);

  // Palavras-chave TQL para syntax highlighting
  const tqlKeywords = [
    'MOSTRAR', 'SOMAR', 'CONTAR', 'MEDIA', 'MAX', 'MIN', 'RANKING', 'TOP', 'PIOR',
    'PRIMEIRO', 'ULTIMO', 'DISTINTO', 'EXISTE', 'TODOS', 'QUALQUER',
    'ONDE', 'DE', 'AGRUPADO', 'ORDENADO', 'POR', 'TENDO', 'LIMITE', 'DESLOCAMENTO',
    'UNIAO', 'INTERSECAO', 'EXCETO',
    'JUNTAR', 'JUNTAR_INTERNO', 'JUNTAR_ESQUERDO', 'JUNTAR_DIREITO', 'JUNTAR_COMPLETO',
    'EM', 'USANDO',
    'E', 'OU', 'NAO', 'VERDADEIRO', 'FALSO', 'NULO', 'NAO_NULO',
    'IGUAL', 'DIFERENTE', 'MAIOR', 'MENOR', 'MAIOR_IGUAL', 'MENOR_IGUAL',
    'TEM', 'SEM', 'ENTRE', 'DENTRO', 'FORA', 'SIMILAR', 'REGEX',
    'DIA', 'MES', 'ANO', 'HORA', 'MINUTO', 'SEGUNDO', 'HOJE', 'AGORA', 'ONTEM', 'AMANHA',
    'MAIUSCULA', 'MINUSCULA', 'TAMANHO', 'SUBSTRING', 'SUBSTITUIR', 'APARAR', 'CONCATENAR',
    'ABSOLUTO', 'ARREDONDAR', 'TETO', 'PISO', 'POTENCIA', 'RAIZ', 'LOGARITMO',
    'CASO', 'QUANDO', 'ENTAO', 'SENAO', 'FIM', 'COALESCE', 'NULLIF'
  ];

  // Templates de query comuns
  const queryTemplates = [
    {
      name: 'Consulta Básica',
      template: 'MOSTRAR * DE tabela ONDE campo IGUAL "valor"',
      description: 'Consulta simples com filtro'
    },
    {
      name: 'Agregação',
      template: 'SOMAR campo DE tabela AGRUPADO POR categoria',
      description: 'Soma com agrupamento'
    },
    {
      name: 'JOIN Simples',
      template: 'MOSTRAR a.campo1, b.campo2 DE tabela1 a JUNTAR_INTERNO tabela2 b EM a.id IGUAL b.id',
      description: 'JOIN entre duas tabelas'
    },
    {
      name: 'Ranking',
      template: 'RANKING campo DE tabela ORDENADO POR campo DESC LIMITE 10',
      description: 'Top 10 registros'
    },
    {
      name: 'Análise Temporal',
      template: 'CONTAR * DE vendas ONDE data MAIOR DIA(-30) AGRUPADO POR DIA(data)',
      description: 'Contagem dos últimos 30 dias'
    }
  ];

  // Carregar dados iniciais
  useEffect(() => {
    loadAvailableTables();
    loadQueryHistory();
  }, []);

  // Configurar Monaco Editor
  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // Registrar linguagem TQL
    monaco.languages.register({ id: 'tql' });

    // Configurar syntax highlighting
    monaco.languages.setMonarchTokensProvider('tql', {
      keywords: tqlKeywords,
      operators: ['=', '!=', '>', '<', '>=', '<=', 'TEM', 'SEM', 'ENTRE', 'DENTRO', 'FORA'],
      symbols: /[=><!~?:&|+\-*\/\^%]+/,
      
      tokenizer: {
        root: [
          [/[A-Z_]+/, { cases: { '@keywords': 'keyword', '@default': 'identifier' } }],
          [/[a-z_$][\w$]*/, 'identifier'],
          [/".*?"/, 'string'],
          [/'.*?'/, 'string'],
          [/\d+/, 'number'],
          [/@symbols/, { cases: { '@operators': 'operator', '@default': '' } }],
        ],
      },
    });

    // Configurar autocomplete
    monaco.languages.registerCompletionItemProvider('tql', {
      provideCompletionItems: (model, position) => {
        const word = model.getWordUntilPosition(position);
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn
        };

        return {
          suggestions: getSuggestions(model.getValue(), position).map(suggestion => ({
            label: suggestion,
            kind: monaco.languages.CompletionItemKind.Keyword,
            insertText: suggestion,
            range: range
          }))
        };
      }
    });

    // Configurar validação em tempo real
    editor.onDidChangeModelContent(() => {
      const currentQuery = editor.getValue();
      setQuery(currentQuery);
      
      if (autoComplete) {
        validateQuery(currentQuery);
      }
    });

    // Configurar posição do cursor
    editor.onDidChangeCursorPosition((e) => {
      setCursorPosition(e.position.column);
    });
  };

  // Carregar tabelas disponíveis
  const loadAvailableTables = async () => {
    try {
      // Simular carregamento de tabelas
      const tables = [
        'usuarios', 'produtos', 'vendas', 'categorias', 'pedidos',
        'clientes', 'fornecedores', 'estoque', 'financeiro', 'logs'
      ];
      setAvailableTables(tables);
    } catch (error) {
      console.error('Erro ao carregar tabelas:', error);
    }
  };

  // Carregar histórico de queries
  const loadQueryHistory = async () => {
    try {
      // Simular carregamento do histórico
      const history = [
        'MOSTRAR * DE usuarios ONDE ativo IGUAL VERDADEIRO',
        'SOMAR valor DE vendas AGRUPADO POR mes',
        'CONTAR * DE produtos ONDE categoria IGUAL "eletrônicos"'
      ];
      setQueryHistory(history);
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
    }
  };

  // Obter sugestões de autocomplete
  const getSuggestions = useCallback((currentQuery, position) => {
    const beforeCursor = currentQuery.substring(0, position ? position.column - 1 : cursorPosition);
    const suggestions = [];

    // Sugestões baseadas no contexto
    if (beforeCursor === '' || beforeCursor.endsWith(' ')) {
      if (beforeCursor === '') {
        suggestions.push(...['MOSTRAR', 'SOMAR', 'CONTAR', 'MEDIA', 'MAX', 'MIN', 'RANKING']);
      }
      
      if (beforeCursor.match(/^(MOSTRAR|SOMAR|CONTAR|MEDIA|MAX|MIN)\s+/)) {
        suggestions.push('DE');
      }
      
      if (beforeCursor.includes(' DE ') && !beforeCursor.includes(' ONDE ')) {
        suggestions.push(...['ONDE', 'JUNTAR', 'AGRUPADO', 'ORDENADO', 'LIMITE']);
        suggestions.push(...availableTables);
      }
      
      if (beforeCursor.includes(' ONDE ')) {
        suggestions.push(...['E', 'OU', 'ENTRE', 'DENTRO', 'TEM', 'SEM']);
      }
    }

    return suggestions;
  }, [cursorPosition, availableTables]);

  // Validar query em tempo real
  const validateQuery = async (currentQuery) => {
    if (!currentQuery.trim()) {
      setValidation({ valid: true, errors: [], suggestions: [] });
      return;
    }

    try {
      const response = await fetch('/api/tql/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: currentQuery })
      });

      const result = await response.json();
      setValidation(result);

    } catch (error) {
      setValidation({
        valid: false,
        errors: ['Erro na validação da query'],
        suggestions: []
      });
    }
  };

  // Executar query
  const executeQuery = async () => {
    if (!query.trim()) {
      message.warning('Digite uma query TQL para executar');
      return;
    }

    setLoading(true);
    try {
      const result = await onExecute(query, {
        quantumProcessing: quantumMode,
        timeout: 30000
      });

      // Adicionar ao histórico
      if (!queryHistory.includes(query)) {
        setQueryHistory([query, ...queryHistory.slice(0, 9)]);
      }

      message.success('Query executada com sucesso!');

    } catch (error) {
      message.error(`Erro na execução: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Salvar query
  const saveQuery = async () => {
    if (!query.trim()) {
      message.warning('Digite uma query TQL para salvar');
      return;
    }

    try {
      await onSave(query);
      message.success('Query salva com sucesso!');
    } catch (error) {
      message.error(`Erro ao salvar: ${error.message}`);
    }
  };

  // Limpar editor
  const clearEditor = () => {
    setQuery('');
    if (editorRef.current) {
      editorRef.current.setValue('');
    }
  };

  // Inserir template
  const insertTemplate = (template) => {
    setQuery(template);
    if (editorRef.current) {
      editorRef.current.setValue(template);
      editorRef.current.focus();
    }
  };

  // Inserir do histórico
  const insertFromHistory = (historyQuery) => {
    setQuery(historyQuery);
    if (editorRef.current) {
      editorRef.current.setValue(historyQuery);
      editorRef.current.focus();
    }
  };

  return (
    <div className="tql-query-builder">
      <Card title="🔍 TQL Query Builder" className="builder-card">
        <Row gutter={[16, 16]}>
          {/* Editor Principal */}
          <Col xs={24} lg={16}>
            <div className="editor-container">
              <div className="editor-toolbar">
                <div className="editor-controls">
                  <Tooltip title="Executar Query">
                    <Button 
                      type="primary" 
                      icon={<PlayCircleOutlined />}
                      onClick={executeQuery}
                      loading={loading}
                      disabled={!validation.valid}
                    >
                      Executar
                    </Button>
                  </Tooltip>
                  
                  <Tooltip title="Salvar Query">
                    <Button 
                      icon={<SaveOutlined />}
                      onClick={saveQuery}
                      disabled={!query.trim()}
                    >
                      Salvar
                    </Button>
                  </Tooltip>
                  
                  <Tooltip title="Limpar Editor">
                    <Button 
                      icon={<ClearOutlined />}
                      onClick={clearEditor}
                    >
                      Limpar
                    </Button>
                  </Tooltip>
                </div>

                <div className="editor-options">
                  <Tooltip title="Ativar processamento quântico">
                    <Switch
                      checkedChildren={<ExperimentOutlined />}
                      unCheckedChildren="Quantum"
                      checked={quantumMode}
                      onChange={setQuantumMode}
                    />
                  </Tooltip>
                  
                  <Tooltip title="Autocomplete automático">
                    <Switch
                      checkedChildren="Auto"
                      unCheckedChildren="Manual"
                      checked={autoComplete}
                      onChange={setAutoComplete}
                    />
                  </Tooltip>
                </div>
              </div>

              <div className="monaco-editor-wrapper">
                <MonacoEditor
                  height="300px"
                  language="tql"
                  value={query}
                  onMount={handleEditorDidMount}
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    lineNumbers: 'on',
                    roundedSelection: false,
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    suggestOnTriggerCharacters: true,
                    quickSuggestions: true,
                    wordBasedSuggestions: true
                  }}
                />
              </div>

              {/* Validação em tempo real */}
              {!validation.valid && (
                <Alert
                  type="error"
                  message="Erros na Query"
                  description={
                    <ul>
                      {validation.errors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  }
                  showIcon
                  style={{ marginTop: 8 }}
                />
              )}

              {validation.suggestions.length > 0 && (
                <Alert
                  type="info"
                  message="Sugestões de Melhoria"
                  description={
                    <ul>
                      {validation.suggestions.map((suggestion, index) => (
                        <li key={index}>
                          {suggestion.severity === 'warning' && <ExclamationCircleOutlined />}
                          {suggestion.severity === 'info' && <InfoCircleOutlined />}
                          {suggestion.severity === 'error' && <ExclamationCircleOutlined />}
                          {' '}{suggestion.message}
                        </li>
                      ))}
                    </ul>
                  }
                  showIcon
                  style={{ marginTop: 8 }}
                />
              )}
            </div>
          </Col>

          {/* Painel Lateral */}
          <Col xs={24} lg={8}>
            <Collapse defaultActiveKey={['templates']} className="helper-panels">
              {/* Templates */}
              <Panel header="📋 Templates" key="templates">
                <List
                  size="small"
                  dataSource={queryTemplates}
                  renderItem={template => (
                    <List.Item
                      actions={[
                        <Button 
                          type="link" 
                          size="small"
                          onClick={() => insertTemplate(template.template)}
                        >
                          Usar
                        </Button>
                      ]}
                    >
                      <List.Item.Meta
                        title={template.name}
                        description={template.description}
                      />
                    </List.Item>
                  )}
                />
              </Panel>

              {/* Histórico */}
              <Panel header="📜 Histórico" key="history">
                <List
                  size="small"
                  dataSource={queryHistory}
                  renderItem={historyQuery => (
                    <List.Item
                      actions={[
                        <Button 
                          type="link" 
                          size="small"
                          onClick={() => insertFromHistory(historyQuery)}
                        >
                          Usar
                        </Button>
                      ]}
                    >
                      <Text ellipsis style={{ maxWidth: 200 }}>
                        {historyQuery}
                      </Text>
                    </List.Item>
                  )}
                />
              </Panel>

              {/* Tabelas */}
              <Panel header="🗃️ Tabelas" key="tables">
                <Select
                  placeholder="Selecionar tabela"
                  style={{ width: '100%', marginBottom: 8 }}
                  value={selectedTable}
                  onChange={setSelectedTable}
                >
                  {availableTables.map(table => (
                    <Option key={table} value={table}>{table}</Option>
                  ))}
                </Select>
                
                <div className="table-tags">
                  {availableTables.map(table => (
                    <Tag 
                      key={table}
                      style={{ cursor: 'pointer', margin: 2 }}
                      onClick={() => {
                        const currentValue = editorRef.current?.getValue() || '';
                        const newValue = currentValue + (currentValue ? ' ' : '') + table;
                        setQuery(newValue);
                        editorRef.current?.setValue(newValue);
                      }}
                    >
                      {table}
                    </Tag>
                  ))}
                </div>
              </Panel>

              {/* Ajuda */}
              <Panel header="❓ Ajuda TQL" key="help">
                <div className="help-content">
                  <Paragraph>
                    <Text strong>Comandos Básicos:</Text>
                  </Paragraph>
                  <ul>
                    <li><Text code>MOSTRAR</Text> - Selecionar dados</li>
                    <li><Text code>SOMAR</Text> - Somar valores</li>
                    <li><Text code>CONTAR</Text> - Contar registros</li>
                    <li><Text code>ONDE</Text> - Filtrar dados</li>
                    <li><Text code>JUNTAR</Text> - Unir tabelas</li>
                  </ul>
                  
                  <Paragraph>
                    <Text strong>Operadores:</Text>
                  </Paragraph>
                  <ul>
                    <li><Text code>IGUAL</Text> - Igualdade (=)</li>
                    <li><Text code>MAIOR</Text> - Maior que (>)</li>
                    <li><Text code>TEM</Text> - Contém texto</li>
                    <li><Text code>ENTRE</Text> - Entre valores</li>
                    <li><Text code>E</Text> - Operador AND</li>
                  </ul>
                </div>
              </Panel>
            </Collapse>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default TQLQueryBuilder;
