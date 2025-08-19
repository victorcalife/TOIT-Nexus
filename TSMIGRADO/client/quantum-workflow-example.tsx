import React, { useState } from 'react';
import { QuantumLevelSelector } from '../components/quantum-level-selector';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { Workflow, Database, TrendingUp, Users, FileText, BarChart } from 'lucide-react';

// ===== EXEMPLO DE USO DO QUANTUM LEVEL SELECTOR =====
// Demonstra como integrar em diferentes contextos

export function QuantumWorkflowExample() {
  const [results, setResults] = useState<any>(null);
  const [currentContext, setCurrentContext] = useState<string>('workflow_optimization');

  // Contextos onde quantum pode ser usado
  const contexts = [
    {
      id: 'workflow_optimization',
      title: 'Otimização de Workflow',
      description: 'Otimizar processo com 15 steps e 8 variáveis',
      icon: <Workflow className="h-5 w-5" />,
      dataSize: 15,
      complexity: 'high' as const,
      color: 'blue'
    },
    {
      id: 'data_analysis',
      title: 'Análise de Big Data',
      description: 'Dataset com 25,000 registros de clientes',
      icon: <Database className="h-5 w-5" />,
      dataSize: 25000,
      complexity: 'high' as const,
      color: 'green'
    },
    {
      id: 'predictive_analytics',
      title: 'KPIs Preditivos',
      description: 'Predições de vendas para próximos 6 meses',
      icon: <TrendingUp className="h-5 w-5" />,
      dataSize: 1200,
      complexity: 'medium' as const,
      color: 'purple'
    },
    {
      id: 'machine_learning',
      title: 'Machine Learning',
      description: 'Treinar modelo com 8,500 amostras',
      icon: <Users className="h-5 w-5" />,
      dataSize: 8500,
      complexity: 'high' as const,
      color: 'orange'
    },
    {
      id: 'advanced_reporting',
      title: 'Relatórios Avançados',
      description: 'Analytics de 12,000 transações',
      icon: <FileText className="h-5 w-5" />,
      dataSize: 12000,
      complexity: 'medium' as const,
      color: 'red'
    },
    {
      id: 'general_optimization',
      title: 'Otimização Geral',
      description: 'Otimizar portfólio com 20 ativos',
      icon: <BarChart className="h-5 w-5" />,
      dataSize: 20,
      complexity: 'high' as const,
      color: 'indigo'
    }
  ];

  const currentCtx = contexts.find(c => c.id === currentContext);

  const handleLevelChange = (level: 'logic' | 'logic_x' | 'boost') => {
    console.log(`Quantum level changed to: ${level} for context: ${currentContext}`);
  };

  const handleExecute = async (level: 'logic' | 'logic_x' | 'boost') => {
    setResults(null);
    
    // Simular processamento
    const processingTime = level === 'boost' ? 2000 : level === 'logic_x' ? 3000 : 4000;
    
    // Mostrar progresso
    const interval = setInterval(() => {
      setResults((prev: any) => ({
        ...prev,
        progress: Math.min((prev?.progress || 0) + 10, 90)
      }));
    }, processingTime / 10);
    
    await new Promise(resolve => setTimeout(resolve, processingTime));
    clearInterval(interval);
    
    // Simular resultados baseados no nível
    const mockResults = generateMockResults(level, currentContext, currentCtx);
    setResults({ ...mockResults, progress: 100 });
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Sistema Quantum Graduado - Demonstração
          </CardTitle>
          <p className="text-center text-gray-600">
            Teste o sistema de 3 níveis quantum em diferentes contextos
          </p>
        </CardHeader>
      </Card>

      {/* Context Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Escolher Contexto de Teste</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {contexts.map((ctx) => (
              <div
                key={ctx.id}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  currentContext === ctx.id
                    ? `border-${ctx.color}-300 bg-${ctx.color}-50`
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setCurrentContext(ctx.id)}
              >
                <div className="flex items-center space-x-3 mb-2">
                  <div className={`p-2 rounded-lg bg-${ctx.color}-100`}>
                    {React.cloneElement(ctx.icon, {
                      className: `h-5 w-5 text-${ctx.color}-600`
                    })}
                  </div>
                  <h3 className="font-semibold">{ctx.title}</h3>
                </div>
                <p className="text-sm text-gray-600">{ctx.description}</p>
                <div className="mt-2 flex space-x-2">
                  <Badge variant="outline" className="text-xs">
                    {ctx.dataSize?.toLocaleString()} registros
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {ctx.complexity} complexity
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quantum Level Selector */}
      {currentCtx && (
        <QuantumLevelSelector
          context={currentContext}
          dataSize={currentCtx.dataSize}
          complexity={currentCtx.complexity}
          onLevelChange={handleLevelChange}
          onExecute={handleExecute}
        />
      )}

      {/* Results */}
      {results && (
        <Card className="border-2 border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <div className="p-2 bg-green-100 rounded-lg">
                {currentCtx?.icon}
              </div>
              <span>Resultados da Execução</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {results.progress < 100 ? (
              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-lg font-semibold text-green-900">
                    Processando com {results.level}...
                  </p>
                  <p className="text-sm text-green-700">
                    {results.algorithm}
                  </p>
                </div>
                <Progress value={results.progress} className="w-full" />
                <p className="text-sm text-green-600 text-center">
                  {results.progress}% completo
                </p>
              </div>
            ) : (
              <ResultsDisplay results={results} />
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ===== COMPONENTES AUXILIARES =====

function ResultsDisplay({ results }: { results: any }) {
  return (
    <div className="space-y-6">
      {/* Performance Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-900">{results.executionTime}</div>
          <div className="text-sm text-blue-700">Tempo de Execução</div>
        </div>
        <div className="text-center p-4 bg-purple-50 rounded-lg">
          <div className="text-2xl font-bold text-purple-900">{results.quantumAdvantage}</div>
          <div className="text-sm text-purple-700">Vantagem Quantum</div>
        </div>
        <div className="text-center p-4 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-900">{results.accuracy}</div>
          <div className="text-sm text-green-700">Precisão</div>
        </div>
      </div>

      {/* Detailed Results */}
      <div className="space-y-4">
        <h4 className="font-semibold text-gray-900">Detalhes dos Resultados:</h4>
        <div className="bg-white p-4 rounded-lg border">
          <pre className="text-sm text-gray-700 whitespace-pre-wrap">
            {JSON.stringify(results.details, null, 2)}
          </pre>
        </div>
      </div>

      {/* Level Comparison */}
      <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
        <h4 className="font-semibold text-yellow-900 mb-2">Comparação com outros níveis:</h4>
        <div className="space-y-2 text-sm text-yellow-800">
          {results.comparison.map((comp: string, index: number) => (
            <div key={index}>• {comp}</div>
          ))}
        </div>
      </div>

      {/* Cost Information */}
      {results.cost && (
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
          <h4 className="font-semibold text-purple-900 mb-2">Informações de Custo:</h4>
          <div className="text-sm text-purple-800">
            <div>Nível utilizado: <strong>{results.level}</strong></div>
            <div>Custo: <strong>{results.cost}</strong></div>
            {results.creditsUsed && (
              <div>Créditos utilizados: <strong>{results.creditsUsed}</strong></div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ===== MOCK DATA GENERATOR =====

function generateMockResults(level: string, context: string, ctxData: any) {
  const baseResults = {
    level: level.toUpperCase(),
    algorithm: getAlgorithmName(level, context),
    executionTime: getExecutionTime(level),
    quantumAdvantage: getQuantumAdvantage(level),
    accuracy: getAccuracy(level),
    cost: getCost(level),
    creditsUsed: getCreditsUsed(level)
  };

  return {
    ...baseResults,
    details: generateDetailedResults(level, context, ctxData),
    comparison: generateComparison(level),
    recommendations: generateRecommendations(level, context)
  };
}

function getAlgorithmName(level: string, context: string): string {
  const algorithms = {
    logic: 'Adaptive Logic Engine',
    logic_x: 'Enhanced Optimization Algorithm',
    boost: getQuantumAlgorithm(context)
  };
  return algorithms[level] || 'Unknown Algorithm';
}

function getQuantumAlgorithm(context: string): string {
  const mapping = {
    workflow_optimization: 'QAOA (Quantum Approximate Optimization)',
    data_analysis: 'Grover\'s Search Algorithm',
    predictive_analytics: 'Variational Quantum Classifier',
    machine_learning: 'Quantum Neural Network',
    advanced_reporting: 'Quantum Business Analytics',
    general_optimization: 'Quantum Annealing'
  };
  return mapping[context] || 'Quantum Algorithm';
}

function getExecutionTime(level: string): string {
  const times = {
    logic: '4.2s',
    logic_x: '2.8s',
    boost: '1.1s'
  };
  return times[level] || '0s';
}

function getQuantumAdvantage(level: string): string {
  const advantages = {
    logic: '1.2x',
    logic_x: '2.1x',
    boost: '4.7x'
  };
  return advantages[level] || '1x';
}

function getAccuracy(level: string): string {
  const accuracies = {
    logic: '84%',
    logic_x: '91%',
    boost: '97%'
  };
  return accuracies[level] || '0%';
}

function getCost(level: string): string {
  const costs = {
    logic: 'Grátis',
    logic_x: 'Grátis',
    boost: 'R$ 15,00 (3 créditos)'
  };
  return costs[level] || 'Grátis';
}

function getCreditsUsed(level: string): number | null {
  const credits = {
    logic: null,
    logic_x: null,
    boost: 3
  };
  return credits[level];
}

function generateDetailedResults(level: string, context: string, ctxData: any) {
  // Resultados específicos baseados no contexto e nível
  const results = {
    dataProcessed: ctxData?.dataSize?.toLocaleString() || '1,000',
    optimizationAchieved: level === 'boost' ? '67%' : level === 'logic_x' ? '43%' : '28%',
    patternsFound: level === 'boost' ? 47 : level === 'logic_x' ? 23 : 12,
    confidence: level === 'boost' ? 0.97 : level === 'logic_x' ? 0.91 : 0.84,
    processingMode: level === 'boost' ? 'Quantum Hardware' : level === 'logic_x' ? 'Hybrid Classical-Quantum' : 'Enhanced Classical'
  };

  return results;
}

function generateComparison(level: string): string[] {
  const comparisons = {
    logic: [
      'Logic X seria 2.1x mais rápido',
      'Boost seria 4.7x mais rápido e 13% mais preciso',
      'Processamento clássico otimizado'
    ],
    logic_x: [
      'Logic seria 33% mais lento',
      'Boost seria 2.2x mais rápido e 6% mais preciso',
      'Otimização híbrida aplicada'
    ],
    boost: [
      'Logic seria 4.7x mais lento e 13% menos preciso',
      'Logic X seria 2.2x mais lento e 6% menos preciso',
      'Vantagem quântica máxima alcançada'
    ]
  };

  return comparisons[level] || [];
}

function generateRecommendations(level: string, context: string): string[] {
  // Recomendações baseadas no nível e contexto
  const recommendations = [];
  
  if (level === 'logic' && context === 'data_analysis') {
    recommendations.push('Para datasets > 10k, Quantum Boost oferece vantagem significativa');
  }
  
  if (level === 'logic_x' && context === 'machine_learning') {
    recommendations.push('Boost recomendado para modelos com > 5k amostras de treinamento');
  }
  
  return recommendations;
}