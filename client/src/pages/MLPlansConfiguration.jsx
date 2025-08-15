/**
 * PÁGINA DE CONFIGURAÇÃO DE PLANOS ML
 * Interface para visualizar e gerenciar planos de assinatura
 * 100% JavaScript - SEM TYPESCRIPT
 */

import React, { useState, useEffect } from 'react';
import { useMLCredits } from '../hooks/useMLCredits';
import { MLCreditsWidget } from '../components/ml/MLCreditsWidget';
import
{
  Crown,
  Zap,
  Star,
  Check,
  X,
  Settings,
  CreditCard,
  Calendar,
  BarChart3,
  Brain,
  Sparkles,
  ArrowRight,
  Info
} from 'lucide-react';

/**
 * Página de configuração de planos ML
 * @returns {React.ReactElement} Página de configuração
 */
export function MLPlansConfiguration()
{
  const [ selectedPlan, setSelectedPlan ] = useState( '' );
  const [ isChangingPlan, setIsChangingPlan ] = useState( false );
  const [ showComparison, setShowComparison ] = useState( false );

  const {
    credits,
    planName,
    planDisplayName,
    creditsPerMonth,
    needsSetup,
    setupCredits,
    isLoading
  } = useMLCredits();

  // Definição dos planos disponíveis
  const availablePlans = [
    {
      id: 'standard',
      name: 'NEXUS Standard',
      price: 'Grátis',
      priceValue: 0,
      mlCredits: 0,
      autoPredictions: 3,
      maxWorkflows: 5,
      features: [
        'Workflows básicos',
        'Dashboards básicos',
        'Relatórios básicos',
        '3 predições automáticas/dia',
        'Suporte por email'
      ],
      limitations: [
        'Sem créditos ML manuais',
        'Funcionalidades limitadas',
        'Suporte básico'
      ],
      recommended: false,
      color: 'gray'
    },
    {
      id: 'quantum_plus',
      name: 'NEXUS Quantum Plus',
      price: 'R$ 99/mês',
      priceValue: 99,
      mlCredits: 5,
      autoPredictions: 6,
      maxWorkflows: 15,
      features: [
        'Workflows avançados',
        'Dashboards avançados',
        'Relatórios avançados',
        '5 créditos ML manuais/mês',
        '6 predições automáticas/dia',
        'API de predições',
        'Suporte prioritário',
        'Alertas personalizados'
      ],
      limitations: [
        'Limite de 15 workflows',
        'Créditos limitados'
      ],
      recommended: true,
      color: 'blue'
    },
    {
      id: 'quantum_premium',
      name: 'NEXUS Quantum Premium',
      price: 'R$ 199/mês',
      priceValue: 199,
      mlCredits: 15,
      autoPredictions: 12,
      maxWorkflows: 30,
      features: [
        'Workflows premium',
        'Dashboards premium',
        'Relatórios premium',
        '15 créditos ML manuais/mês',
        '12 predições automáticas/dia',
        'API ilimitada',
        'Alertas em tempo real',
        'Suporte dedicado',
        'Integrações personalizadas',
        'Analytics avançados',
        'White label'
      ],
      limitations: [],
      recommended: false,
      color: 'purple'
    }
  ];

  // Definir plano selecionado baseado no plano atual
  useEffect( () =>
  {
    if ( planName && !selectedPlan )
    {
      setSelectedPlan( planName );
    }
  }, [ planName, selectedPlan ] );

  /**
   * Alterar plano
   */
  const handlePlanChange = async ( planId ) =>
  {
    if ( planId === planName ) return;

    setIsChangingPlan( true );

    try
    {
      const success = await setupCredits( planId );
      if ( success )
      {
        setSelectedPlan( planId );
        console.log( `Plano alterado para: ${ planId }` );
      }
    } catch ( error )
    {
      console.error( 'Erro ao alterar plano:', error );
    } finally
    {
      setIsChangingPlan( false );
    }
  };

  /**
   * Renderizar card de plano
   */
  const renderPlanCard = ( plan ) =>
  {
    const isCurrentPlan = planName === plan.id;
    const isSelected = selectedPlan === plan.id;

    return (
      <div
        key={ plan.id }
        className={ `relative p-6 border-2 rounded-xl transition-all duration-200 ${ isCurrentPlan
          ? 'border-green-500 bg-green-50'
          : isSelected
            ? 'border-purple-500 bg-purple-50'
            : 'border-gray-200 bg-white hover:border-gray-300'
          } ${ plan.recommended ? 'ring-2 ring-blue-200' : '' }` }
      >
        {/* Badge de recomendado */ }
        { plan.recommended && (
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
            <span className="px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded-full">
              Recomendado
            </span>
          </div>
        ) }

        {/* Badge de plano atual */ }
        { isCurrentPlan && (
          <div className="absolute -top-3 right-4">
            <span className="px-3 py-1 bg-green-600 text-white text-xs font-medium rounded-full flex items-center space-x-1">
              <Check className="w-3 h-3" />
              <span>Atual</span>
            </span>
          </div>
        ) }

        {/* Header do plano */ }
        <div className="text-center mb-6">
          <div className="flex justify-center mb-3">
            { plan.id === 'standard' && <Star className="w-8 h-8 text-gray-600" /> }
            { plan.id === 'quantum_plus' && <Zap className="w-8 h-8 text-blue-600" /> }
            { plan.id === 'quantum_premium' && <Crown className="w-8 h-8 text-purple-600" /> }
          </div>

          <h3 className="text-xl font-bold text-gray-900 mb-2">
            { plan.name }
          </h3>

          <div className="text-3xl font-bold text-gray-900 mb-1">
            { plan.price }
          </div>

          { plan.priceValue > 0 && (
            <p className="text-sm text-gray-500">
              Cobrado mensalmente
            </p>
          ) }
        </div>

        {/* Recursos ML */ }
        <div className="mb-6">
          <h4 className="font-medium text-gray-900 mb-3 flex items-center space-x-2">
            <Brain className="w-4 h-4 text-purple-600" />
            <span>Recursos ML</span>
          </h4>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Créditos ML/mês</span>
              <span className="font-medium">
                { plan.mlCredits === 0 ? 'Nenhum' : `${ plan.mlCredits } créditos` }
              </span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Predições automáticas/dia</span>
              <span className="font-medium">{ plan.autoPredictions }</span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Workflows agendados</span>
              <span className="font-medium">{ plan.maxWorkflows }</span>
            </div>
          </div>
        </div>

        {/* Features */ }
        <div className="mb-6">
          <h4 className="font-medium text-gray-900 mb-3">Funcionalidades</h4>
          <ul className="space-y-2">
            { plan.features.map( ( feature, index ) => (
              <li key={ index } className="flex items-start space-x-2 text-sm">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">{ feature }</span>
              </li>
            ) ) }
          </ul>
        </div>

        {/* Limitações */ }
        { plan.limitations.length > 0 && (
          <div className="mb-6">
            <h4 className="font-medium text-gray-900 mb-3">Limitações</h4>
            <ul className="space-y-2">
              { plan.limitations.map( ( limitation, index ) => (
                <li key={ index } className="flex items-start space-x-2 text-sm">
                  <X className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-600">{ limitation }</span>
                </li>
              ) ) }
            </ul>
          </div>
        ) }

        {/* Botão de ação */ }
        <button
          onClick={ () => handlePlanChange( plan.id ) }
          disabled={ isCurrentPlan || isChangingPlan }
          className={ `w-full py-3 px-4 rounded-lg font-medium transition-colors ${ isCurrentPlan
            ? 'bg-green-100 text-green-700 cursor-default'
            : 'bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-50'
            }` }
        >
          { isCurrentPlan ? (
            <span className="flex items-center justify-center space-x-2">
              <Check className="w-4 h-4" />
              <span>Plano Atual</span>
            </span>
          ) : isChangingPlan && selectedPlan === plan.id ? (
            'Alterando...'
          ) : (
            <span className="flex items-center justify-center space-x-2">
              <span>{ plan.priceValue === 0 ? 'Selecionar' : 'Assinar' }</span>
              <ArrowRight className="w-4 h-4" />
            </span>
          ) }
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */ }
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Settings className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Configuração de Planos ML
                </h1>
                <p className="text-gray-600">
                  Gerencie seu plano e recursos de Machine Learning
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <MLCreditsWidget variant="compact" />

              <button
                onClick={ () => setShowComparison( !showComparison ) }
                className="px-4 py-2 bg-gray-100 text-gray-700 text-sm rounded-md hover:bg-gray-200"
              >
                { showComparison ? 'Ocultar' : 'Comparar' } Planos
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Status atual */ }
        { !needsSetup && (
          <div className="bg-white p-6 rounded-lg border shadow-sm mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <CreditCard className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Plano Atual: { planDisplayName }
                  </h3>
                  <p className="text-gray-600">
                    { creditsPerMonth } créditos ML por mês • { credits.available } disponíveis
                  </p>
                </div>
              </div>

              <div className="text-right">
                <p className="text-sm text-gray-500">Próximo reset</p>
                <p className="font-medium text-gray-900">
                  { credits.resetDate ? new Date( credits.resetDate ).toLocaleDateString() : 'N/A' }
                </p>
              </div>
            </div>
          </div>
        ) }

        {/* Planos disponíveis */ }
        <div className="mb-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Escolha seu Plano Quantum ML
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Desbloqueie o poder da inteligência artificial para seus workflows,
              dashboards e relatórios com nossos planos especializados.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            { availablePlans.map( plan => renderPlanCard( plan ) ) }
          </div>
        </div>

        {/* Tabela de comparação */ }
        { showComparison && (
          <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Comparação Detalhada de Planos
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Recurso
                    </th>
                    { availablePlans.map( plan => (
                      <th key={ plan.id } className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        { plan.name }
                      </th>
                    ) ) }
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      Preço Mensal
                    </td>
                    { availablePlans.map( plan => (
                      <td key={ plan.id } className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-900">
                        { plan.price }
                      </td>
                    ) ) }
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      Créditos ML/mês
                    </td>
                    { availablePlans.map( plan => (
                      <td key={ plan.id } className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-900">
                        { plan.mlCredits === 0 ? 'Nenhum' : plan.mlCredits }
                      </td>
                    ) ) }
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      Predições automáticas/dia
                    </td>
                    { availablePlans.map( plan => (
                      <td key={ plan.id } className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-900">
                        { plan.autoPredictions }
                      </td>
                    ) ) }
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      Workflows agendados
                    </td>
                    { availablePlans.map( plan => (
                      <td key={ plan.id } className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-900">
                        { plan.maxWorkflows }
                      </td>
                    ) ) }
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        ) }

        {/* Informações adicionais */ }
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start space-x-3">
            <Info className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900 mb-2">
                Sobre os Créditos ML
              </h4>
              <div className="text-sm text-blue-700 space-y-1">
                <p>• Créditos ML são usados para insights manuais (predições, otimizações, detecção de anomalias)</p>
                <p>• Predições automáticas não consomem créditos ML</p>
                <p>• Créditos são resetados automaticamente todo mês</p>
                <p>• Você pode acompanhar o uso em tempo real no dashboard</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MLPlansConfiguration;
