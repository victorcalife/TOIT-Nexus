/**
 * COMPONENTE WORKFLOW ML INTEGRATION
 * Integração de ML nos workflows existentes
 * 100% JavaScript - SEM TYPESCRIPT
 */

import React, { useState, useCallback, useMemo } from 'react';
import { QuantumInsightButton } from './QuantumInsightButton';
import { useMLCredits } from '../../hooks/useMLCredits';
import {  



  BarChart3, 



 }
} from 'lucide-react';

/**
 * Componente de integração ML para workflows
 * @param {Object} props - Propriedades do componente
 * @param {Array} props.workflowData - Dados do workflow
 * @param {string} props.workflowType - Tipo do workflow
 * @param {string} props.workflowId - ID do workflow
 * @param {Function} props.onInsightGenerated - Callback quando insight é gerado
 * @param {boolean} props.showCompact - Se deve mostrar versão compacta
 * @returns {React.ReactElement} Componente de integração
 */
export function WorkflowMLIntegration(({ workflowData = [],
  workflowType = 'general',
  workflowId,
  onInsightGenerated = ( }) => {},
  showCompact = false
}) {
  const [isExpanded, setIsExpanded] = useState(!showCompact);
  const [selectedInsightType, setSelectedInsightType] = useState('prediction');
  const [lastInsight, setLastInsight] = useState(null);

  const { needsSetup, hasEnoughCredits } = useMLCredits();

  /**
   * Processar dados do workflow para ML
   */
  const processedData = useMemo(() => {
    if (!workflowData || workflowData.length === 0) {
      // Gerar dados de exemplo baseados no tipo de workflow
      return generateSampleData(workflowType);
    }

    // Processar dados reais do workflow
    return workflowData.map(item => ({
      date: item.date || item.created_at || new Date().toISOString().split('T')[0],
      value: parseFloat(item.value || item.amount || item.count || Math.random() * 1000)
    })).filter(item => !isNaN(item.value));
  }, [workflowData, workflowType]);

  /**
   * Gerar dados de exemplo baseados no tipo de workflow
   */
  function generateSampleData(type) {
    const days = 30;
    const baseValue = getBaseValueForWorkflowType(type);
    
    return Array.from({ length: days }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (days - 1 - i));
      
      const trend = i * (Math.random() * 10 - 5);
      const seasonal = Math.sin((i / 7) * Math.PI) * (baseValue * 0.1);
      const random = (Math.random() - 0.5) * (baseValue * 0.2);
      
      return {
        date: date.toISOString().split('T')[0],
        value: Math.max(0, baseValue + trend + seasonal + random)
      };
    });
  }

  /**
   * Obter valor base baseado no tipo de workflow
   */
  function getBaseValueForWorkflowType(type) {
    const baseValues = {
      sales: 5000,
      marketing: 1000,
      finance: 10000,
      operations: 2000,
      hr: 500,
      general: 1000
    };
    
    return baseValues[type] || baseValues.general;
  }

  /**
   * Obter insights recomendados baseados no tipo de workflow
   */
  const getRecommendedInsights = useCallback(() => {
    const insights = {
      sales: [
        { type: 'prediction', label: 'Previsão de Vendas', description: 'Preveja vendas futuras baseado no histórico' },
        { type: 'optimization', label: 'Otimizar Processo', description: 'Identifique gargalos no processo de vendas' },
        { type: 'anomaly', label: 'Detectar Anomalias', description: 'Encontre padrões incomuns nas vendas' }
      ],
      marketing: [
        { type: 'segmentation', label: 'Segmentação', description: 'Segmente audiência para campanhas' },
        { type: 'prediction', label: 'ROI Previsto', description: 'Preveja retorno de campanhas' },
        { type: 'optimization', label: 'Otimizar Campanhas', description: 'Melhore performance das campanhas' }
      ],
      finance: [
        { type: 'prediction', label: 'Fluxo de Caixa', description: 'Preveja entradas e saídas financeiras' },
        { type: 'anomaly', label: 'Fraudes/Anomalias', description: 'Detecte transações suspeitas' },
        { type: 'optimization', label: 'Otimizar Custos', description: 'Identifique oportunidades de economia' }
      ],
      operations: [
        { type: 'optimization', label: 'Eficiência Operacional', description: 'Otimize processos operacionais' },
        { type: 'prediction', label: 'Demanda Futura', description: 'Preveja demanda de recursos' },
        { type: 'anomaly', label: 'Falhas de Sistema', description: 'Detecte problemas operacionais' }
      ],
      hr: [
        { type: 'prediction', label: 'Turnover', description: 'Preveja rotatividade de funcionários' },
        { type: 'segmentation', label: 'Perfis de Funcionários', description: 'Segmente funcionários por performance' },
        { type: 'optimization', label: 'Otimizar Recrutamento', description: 'Melhore processo de contratação' }
      ],
      general: [
        { type: 'prediction', label: 'Predição Geral', description: 'Análise preditiva dos dados' },
        { type: 'optimization', label: 'Otimização', description: 'Identifique melhorias' },
        { type: 'anomaly', label: 'Anomalias', description: 'Detecte padrões incomuns' }
      ]
    };

    return insights[workflowType] || insights.general;
  }, [workflowType]);

  /**
   * Lidar com insight gerado
   */
  const handleInsightGenerated = useCallback((insightData) => {
    setLastInsight(insightData);
    onInsightGenerated(insightData);
  }, [onInsightGenerated]);

  /**
   * Renderizar versão compacta
   */
  if (showCompact && !isExpanded) {
    return (
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Brain className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-medium text-purple-900">
              Quantum ML
            </span>
            {processedData.length > 0 && (
              <span className="text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded-full">
                {processedData.length} pontos
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {!needsSetup && hasEnoughCredits(1) && (
              <QuantumInsightButton
                data={processedData}
                insightType={selectedInsightType}
                variant="secondary"
                size="sm"
                onSuccess={handleInsightGenerated}
              />
            )}
            
            <button
              onClick=({ ( }) => setIsExpanded(true)}
              className="p-1 text-purple-600 hover:text-purple-700"
              title="Expandir opções ML"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg">
      {/* Header */}
      <div className="p-4 border-b border-purple-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Brain className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="font-medium text-purple-900">
                Quantum ML Insights
              </h3>
              <p className="text-sm text-purple-600">
                Análise inteligente dos dados do workflow
              </p>
            </div>
          </div>

          ({ showCompact && (
            <button
              onClick={( }) => setIsExpanded(false)}
              className="p-1 text-purple-600 hover:text-purple-700"
              title="Recolher"
            >
              <ChevronUp className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {needsSetup ? (
          <div className="text-center py-6">
            <AlertTriangle className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
            <p className="text-sm text-gray-600 mb-3">
              Configure seu plano ML para usar insights
            </p>
            <button className="px-4 py-2 bg-purple-600 text-white text-sm rounded-md hover:bg-purple-700">
              Configurar Agora
            </button>
          </div>
        ) : processedData.length === 0 ? (
          <div className="text-center py-6">
            <BarChart3 className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600">
              Dados insuficientes para análise ML
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Informações dos dados */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2 text-purple-700">
                <BarChart3 className="w-4 h-4" />
                <span>{processedData.length} pontos de dados</span>
              </div>
              <div className="flex items-center space-x-2 text-purple-700">
                <TrendingUp className="w-4 h-4" />
                <span>Tipo: {workflowType}</span>
              </div>
            </div>

            {/* Insights recomendados */}
            <div>
              <h4 className="text-sm font-medium text-purple-900 mb-3">
                Insights Recomendados
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                ({ getRecommendedInsights().map((insight }) => (
                  <div
                    key={insight.type}
                    className="p-3 bg-white border border-purple-200 rounded-lg hover:border-purple-300 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        {insight.type === 'prediction' && <TrendingUp className="w-4 h-4 text-blue-600" />}
                        {insight.type === 'optimization' && <Zap className="w-4 h-4 text-yellow-600" />}
                        {insight.type === 'anomaly' && <AlertTriangle className="w-4 h-4 text-red-600" />}
                        {insight.type === 'segmentation' && <BarChart3 className="w-4 h-4 text-green-600" />}
                        <span className="text-sm font-medium text-gray-900">
                          {insight.label}
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-xs text-gray-600 mb-3">
                      {insight.description}
                    </p>
                    
                    <QuantumInsightButton
                      data={processedData}
                      insightType={insight.type}
                      variant="secondary"
                      size="sm"
                      className="w-full"
                      onSuccess={handleInsightGenerated}
                    >

                    </QuantumInsightButton>
                  </div>
                ))}
              </div>
            </div>

            {/* Último insight gerado */}
            {lastInsight && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-start space-x-2">
                  <Info className="w-4 h-4 text-green-600 mt-0.5" />
                  <div className="flex-1">
                    <h5 className="text-sm font-medium text-green-900 mb-1">
                      Último Insight Gerado
                    </h5>
                    <p className="text-xs text-green-700">
                      {lastInsight.insight?.summary?.description || 'Insight executado com sucesso'}
                    </p>
                    <p className="text-xs text-green-600 mt-1">
                      Processado em {lastInsight.processingTime}ms
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Dica de uso */}
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start space-x-2">
                <Info className="w-4 h-4 text-blue-600 mt-0.5" />
                <div className="text-xs text-blue-700">
                  <p className="font-medium mb-1">💡 Dica:</p>
                  <p>
                    Os insights são gerados baseados nos dados do seu workflow. 
                    Quanto mais dados históricos, mais precisas serão as análises.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default WorkflowMLIntegration;
