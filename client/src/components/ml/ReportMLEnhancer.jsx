/**
 * COMPONENTE REPORT ML ENHANCER
 * Aprimora relatórios com insights automáticos de ML
 * 100% JavaScript - SEM TYPESCRIPT
 */

import React, { useState, useCallback, useEffect } from 'react';
import { QuantumInsightButton } from './QuantumInsightButton';
import { useMLCredits } from '../../hooks/useMLCredits';
import { 




  BarChart3,







 }
} from 'lucide-react';

/**
 * Componente para aprimorar relatórios com ML
 * @param {Object} props - Propriedades do componente
 * @param {Array} props.reportData - Dados do relatório
 * @param {string} props.reportType - Tipo do relatório
 * @param {string} props.reportTitle - Título do relatório
 * @param {Object} props.reportConfig - Configurações do relatório
 * @param {Function} props.onInsightGenerated - Callback quando insight é gerado
 * @param {boolean} props.autoAnalyze - Se deve analisar automaticamente
 * @returns {React.ReactElement} Componente de aprimoramento ML
 */
export function ReportMLEnhancer( {
  reportData = [],
  reportType = 'general',
  reportTitle = 'Relatório',
  reportConfig = {},
  onInsightGenerated = () => { },
  autoAnalyze = false
} )
{
  const [ isExpanded, setIsExpanded ] = useState( false );
  const [ generatedInsights, setGeneratedInsights ] = useState( [] );
  const [ isAnalyzing, setIsAnalyzing ] = useState( false );
  const [ selectedInsightTypes, setSelectedInsightTypes ] = useState( [ 'prediction' ] );
  const [ analysisResults, setAnalysisResults ] = useState( null );

  const { hasEnoughCredits, needsSetup } = useMLCredits();

  /**
   * Tipos de insights disponíveis para relatórios
   */
  const availableInsights = [
    {
      type: 'prediction',
      label: 'Predições',
      description: 'Previsões baseadas nos dados do relatório',
      icon: TrendingUp,
      color: 'blue'
    },
    {
      type: 'optimization',
      label: 'Otimizações',
      description: 'Oportunidades de melhoria identificadas',
      icon: Zap,
      color: 'yellow'
    },
    {
      type: 'anomaly',
      label: 'Anomalias',
      description: 'Padrões incomuns nos dados',
      icon: AlertTriangle,
      color: 'red'
    },
    {
      type: 'segmentation',
      label: 'Segmentação',
      description: 'Agrupamentos e categorias nos dados',
      icon: BarChart3,
      color: 'green'
    }
  ];

  /**
   * Analisar relatório automaticamente
   */
  const analyzeReport = useCallback( async () =>
  {
    if ( !reportData || reportData.length < 5 || needsSetup )
    {
      return;
    }

    setIsAnalyzing( true );

    try
    {
      const insights = [];

      // Gerar insights para cada tipo selecionado
      for ( const insightType of selectedInsightTypes )
      {
        try
        {
          const baseURL = process.env.REACT_APP_API_URL || '';
          const response = await fetch( `${ baseURL }/api/quantum/insight`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Tenant-ID': 'default'
            },
            body: JSON.stringify( {
              data: reportData,
              insightType,
              options: {`
                context: `report_${ reportType }`,
                reportTitle,
                reportConfig
              }
            } )
          } );

          if ( response.ok )
          {
            const result = await response.json();
            if ( result.success )
            {
              insights.push( {
                type: insightType,
                data: result.data.insight,
                timestamp: new Date().toISOString(),
                reportContext: true
              } );
            }
          }
        } catch ( error )
        {`
          console.error( `Erro ao gerar insight ${ insightType }:`, error );
        }
      }

      setGeneratedInsights( insights );
      setAnalysisResults( {
        totalInsights: insights.length,
        timestamp: new Date().toISOString(),
        reportData: reportData.length
      } );

      // Callback para componente pai
      onInsightGenerated( insights );

    } catch ( error )
    {
      console.error( 'Erro na análise do relatório:', error );
    } finally
    {
      setIsAnalyzing( false );
    }
  }, [ reportData, reportType, reportTitle, reportConfig, selectedInsightTypes, needsSetup, onInsightGenerated ] );

  /**
   * Análise automática quando dados mudarem
   */
  useEffect( () =>
  ({ if ( autoAnalyze && reportData.length > 0 && hasEnoughCredits( selectedInsightTypes.length ) )
    {
      const timer = setTimeout( ( }) =>
      {
        analyzeReport();
      }, 3000 ); // Aguardar 3s para evitar múltiplas execuções

      return () => clearTimeout( timer );
    }
  }, [ autoAnalyze, reportData.length, hasEnoughCredits, selectedInsightTypes.length, analyzeReport ] );

  /**
   * Alternar seleção de tipo de insight
   */
  const toggleInsightType = ( type ) =>
  {
    setSelectedInsightTypes( prev =>
      prev.includes( type )
        ? prev.filter( t => t !== type )
        : [ ...prev, type ]
    );
  };

  /**
   * Exportar insights
   */
  const exportInsights = () =>
  {
    const exportData = {
      reportTitle,
      reportType,
      analysisDate: new Date().toISOString(),
      dataPoints: reportData.length,
      insights: generatedInsights.map( insight => ( {
        type: insight.type,
        summary: insight.data.summary,
        insights: insight.data.insights,
        timestamp: insight.timestamp
      } ) )
    };

    const blob = new Blob( [ JSON.stringify( exportData, null, 2 ) ], {
      type: 'application/json'
    } );

    const url = URL.createObjectURL( blob );
    const a = document.createElement( 'a' );
    a.href = url;`
    a.download = `insights-${ reportTitle.toLowerCase().replace( /\s+/g, '-' ) }-${ Date.now() }.json`;
    document.body.appendChild( a );
    a.click();
    document.body.removeChild( a );
    URL.revokeObjectURL( url );
  };

  /**
   * Renderizar insight individual
   */
  const renderInsight = ( insight, index ) =>
  {
    const insightConfig = availableInsights.find( i => i.type === insight.type );
    const Icon = insightConfig?.icon || Brain;
    const colorClass = 'text-purple-600';

    return (
      <div key={ index } className="p-4 border border-gray-200 rounded-lg">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-purple-100 rounded-lg">`
              <Icon className={ `w-4 h-4 ${ colorClass }` } />
            </div>
            <div>
              <h4 className="font-medium text-gray-900">
                { insightConfig?.label || insight.type }
              </h4>
              <p className="text-xs text-gray-500">
                { new Date( insight.timestamp ).toLocaleString() }
              </p>
            </div>
          </div>

          <button
            className="text-gray-400 hover:text-gray-600"
            title="Ver detalhes"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2">
          <p className="text-sm text-gray-700">
            { insight.data.summary?.description || 'Insight gerado com sucesso' }
          </p>

          ({ insight.data.insights && insight.data.insights.length > 0 && (
            <div className="space-y-1">
              { insight.data.insights.slice( 0, 3 ).map( ( item, idx  }) => (
                <div key={ idx } className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0" />
                  <p className="text-xs text-gray-600">{ item }</p>
                </div>
              ) ) }
            </div>
          ) }

          { insight.data.recommendations && insight.data.recommendations.length > 0 && (
            <div className="mt-3 p-2 bg-blue-50 rounded-md">
              <p className="text-xs font-medium text-blue-900 mb-1">Recomendações:</p>
              <p className="text-xs text-blue-700">
                { insight.data.recommendations[ 0 ].title || insight.data.recommendations[ 0 ] }
              </p>
            </div>
          ) }
        </div>
      </div>
    );
  };

  /**
   * Renderizar versão compacta
   */
  if ( !isExpanded )
  {
    return (
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Brain className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="font-medium text-purple-900">
                Análise ML do Relatório
              </h3>
              <p className="text-sm text-purple-600">
                { generatedInsights.length > 0`
                  ? `${ generatedInsights.length } insights gerados``
                  : `${ reportData.length } pontos de dados disponíveis`
                }
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            { generatedInsights.length > 0 && (
              <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                { generatedInsights.length } insights
              </span>
            ) }

            <button
              onClick=({ ( }) => setIsExpanded( true ) }
              className="p-1 text-purple-600 hover:text-purple-700"
              title="Expandir análise ML"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
      {/* Header */ }
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-blue-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Brain className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-purple-900">
                Análise ML do Relatório
              </h3>
              <p className="text-sm text-purple-600">
                Insights automáticos para "{ reportTitle }"
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            { generatedInsights.length > 0 && (
              <>
                <button
                  onClick={ exportInsights }
                  className="p-2 text-purple-600 hover:text-purple-700"
                  title="Exportar insights"
                >
                  <Download className="w-4 h-4" />
                </button>

                <button
                  className="p-2 text-purple-600 hover:text-purple-700"
                  title="Compartilhar"
                >
                  <Share className="w-4 h-4" />
                </button>
              </>
            ) }

            <button
              onClick=({ ( }) => setIsExpanded( false ) }
              className="p-2 text-purple-600 hover:text-purple-700"
              title="Recolher"
            >
              <ChevronUp className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */ }
      <div className="p-4">
        { needsSetup ? (
          <div className="text-center py-8">
            <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">
              Configure seu plano ML
            </h4>
            <p className="text-gray-600 mb-4">
              Para gerar insights automáticos nos relatórios
            </p>
            <button className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700">
              Configurar Agora
            </button>
          </div>
        ) : reportData.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">
              Dados insuficientes para análise ML
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Configuração de análise */ }
            <div>
              <h4 className="font-medium text-gray-900 mb-3">
                Tipos de Análise
              </h4>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                ({ availableInsights.map( ( insight  }) =>
                {
                  const Icon = insight.icon;
                  const isSelected = selectedInsightTypes.includes( insight.type );

                  return (
                    <button
                      key={ insight.type }
                      onClick=({ ( }) => toggleInsightType( insight.type ) }`
                      className={ `p-3 border rounded-lg text-left transition-colors ${ isSelected
                        ? 'border-purple-300 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'`}
                        }` }
                    >
                      <div className="flex items-center space-x-2 mb-2">`
                        <Icon className={ `w-4 h-4 text-${ insight.color }-600` } />
                        <span className="text-sm font-medium text-gray-900">
                          { insight.label }
                        </span>
                      </div>
                      <p className="text-xs text-gray-600">
                        { insight.description }
                      </p>
                    </button>
                  );
                } ) }
              </div>
            </div>

            {/* Botão de análise */ }
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">
                  Analisar Relatório
                </p>
                <p className="text-sm text-gray-600">
                  { reportData.length } pontos de dados • { selectedInsightTypes.length } tipos selecionados
                </p>
              </div>

              <button
                onClick={ analyzeReport }
                disabled={ isAnalyzing || selectedInsightTypes.length === 0 || !hasEnoughCredits( selectedInsightTypes.length ) }
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                { isAnalyzing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Analisando...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Gerar Insights ({ selectedInsightTypes.length } ⚡)</span>
                  </>
                ) }
              </button>
            </div>

            {/* Resultados da análise */ }
            { analysisResults && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Sparkles className="w-4 h-4 text-green-600" />
                  <span className="font-medium text-green-900">
                    Análise Concluída
                  </span>
                </div>
                <p className="text-sm text-green-700">
                  { analysisResults.totalInsights } insights gerados a partir de { analysisResults.reportData } pontos de dados
                </p>
                <p className="text-xs text-green-600 mt-1">
                  { new Date( analysisResults.timestamp ).toLocaleString() }
                </p>
              </div>
            ) }

            {/* Insights gerados */ }
            { generatedInsights.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-4">
                  Insights Gerados ({ generatedInsights.length })
                </h4>

                <div className="space-y-4">
                  ({ generatedInsights.map( ( insight, index  }) => renderInsight( insight, index ) ) }
                </div>
              </div>
            ) }

            {/* Dica de uso */ }
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start space-x-2">
                <Brain className="w-4 h-4 text-blue-600 mt-0.5" />
                <div className="text-xs text-blue-700">
                  <p className="font-medium mb-1">💡 Dica:</p>
                  <p>
                    Os insights ML são gerados baseados nos dados do seu relatório.
                    Selecione os tipos de análise mais relevantes para obter insights mais precisos.
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) }
      </div>
    </div>
  );
}

export default ReportMLEnhancer;
`