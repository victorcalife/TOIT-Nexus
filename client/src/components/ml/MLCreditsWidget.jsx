/**
 * COMPONENTE ML CREDITS WIDGET
 * Widget para mostrar créditos ML no dashboard
 * 100% JavaScript - SEM TYPESCRIPT
 */

import React, { useState, useCallback } from 'react';
import { useMLCredits } from '../../hooks/useMLCredits';
import { 
  Zap, 
  Calendar, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Settings,
  RefreshCw,
  Info
} from 'lucide-react';

/**
 * Widget de créditos ML
 * @param {Object} props - Propriedades do componente
 * @param {string} props.variant - Variante visual ('card', 'compact', 'minimal')
 * @param {boolean} props.showDetails - Se deve mostrar detalhes expandidos
 * @param {boolean} props.showActions - Se deve mostrar botões de ação
 * @param {string} props.className - Classes CSS adicionais
 * @returns {React.ReactElement} Componente do widget
 */
export function MLCreditsWidget({
  variant = 'card',
  showDetails = true,
  showActions = true,
  className = ''
}) {
  const [showSetup, setShowSetup] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('');

  const {
    credits,
    isLoading,
    hasError,
    error,
    needsSetup,
    isConfigured,
    planDisplayName,
    creditsPerMonth,
    daysUntilReset,
    usagePercentage,
    getCreditsStatus,
    refreshCredits,
    setupCredits
  } = useMLCredits();

  /**
   * Configurar plano ML
   */
  const handleSetupPlan = useCallback(async () => {
    if (!selectedPlan) return;

    try {
      const success = await setupCredits(selectedPlan);
      if (success) {
        setShowSetup(false);
        setSelectedPlan('');
      }
    } catch (error) {
      console.error('Erro ao configurar plano:', error);
    }
  }, [selectedPlan, setupCredits]);

  /**
   * Obter cor baseada no status dos créditos
   */
  const getStatusColor = useCallback(() => {
    const status = getCreditsStatus();
    
    switch (status) {
      case 'good': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'critical': return 'text-orange-600 bg-orange-100';
      case 'empty': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  }, [getCreditsStatus]);

  /**
   * Obter ícone de status
   */
  const getStatusIcon = useCallback(() => {
    const status = getCreditsStatus();
    
    switch (status) {
      case 'good': return <CheckCircle className="w-4 h-4" />;
      case 'warning': return <AlertTriangle className="w-4 h-4" />;
      case 'critical': return <AlertTriangle className="w-4 h-4" />;
      case 'empty': return <AlertTriangle className="w-4 h-4" />;
      default: return <Info className="w-4 h-4" />;
    }
  }, [getCreditsStatus]);

  /**
   * Renderizar barra de progresso
   */
  const renderProgressBar = useCallback(() => {
    const percentage = usagePercentage();
    const status = getCreditsStatus();
    
    const barColors = {
      good: 'bg-green-500',
      warning: 'bg-yellow-500',
      critical: 'bg-orange-500',
      empty: 'bg-red-500'
    };

    return (
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className={`h-2 rounded-full transition-all duration-300 ${barColors[status]}`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    );
  }, [usagePercentage, getCreditsStatus]);

  /**
   * Renderizar configuração de plano
   */
  const renderPlanSetup = useCallback(() => {
    const plans = [
      { id: 'standard', name: 'NEXUS Standard', credits: 0, price: 'Grátis' },
      { id: 'quantum_plus', name: 'NEXUS Quantum Plus', credits: 5, price: 'R$ 99/mês' },
      { id: 'quantum_premium', name: 'NEXUS Quantum Premium', credits: 15, price: 'R$ 199/mês' }
    ];

    return (
      <div className="p-4 border-t border-gray-200">
        <h4 className="text-sm font-medium text-gray-900 mb-3">
          Configurar Plano ML
        </h4>
        
        <div className="space-y-2 mb-4">
          {plans.map(plan => (
            <label key={plan.id} className="flex items-center space-x-3 cursor-pointer">
              <input
                type="radio"
                name="plan"
                value={plan.id}
                checked={selectedPlan === plan.id}
                onChange={(e) => setSelectedPlan(e.target.value)}
                className="text-purple-600 focus:ring-purple-500"
              />
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900">{plan.name}</div>
                <div className="text-xs text-gray-500">
                  {plan.credits} créditos/mês • {plan.price}
                </div>
              </div>
            </label>
          ))}
        </div>

        <div className="flex space-x-2">
          <button
            onClick={handleSetupPlan}
            disabled={!selectedPlan || isLoading}
            className="flex-1 px-3 py-2 bg-purple-600 text-white text-sm rounded-md hover:bg-purple-700 disabled:opacity-50"
          >
            {isLoading ? 'Configurando...' : 'Configurar'}
          </button>
          <button
            onClick={() => setShowSetup(false)}
            className="px-3 py-2 bg-gray-100 text-gray-700 text-sm rounded-md hover:bg-gray-200"
          >
            Cancelar
          </button>
        </div>
      </div>
    );
  }, [selectedPlan, isLoading, handleSetupPlan]);

  // Renderização para variante minimal
  if (variant === 'minimal') {
    return (
      <div className={`inline-flex items-center space-x-2 ${className}`}>
        <Zap className="w-4 h-4 text-purple-600" />
        <span className="text-sm font-medium">
          {isLoading ? '...' : `${credits.available}/${credits.total}`}
        </span>
        <div className={`w-2 h-2 rounded-full ${getStatusColor().split(' ')[1]}`} />
      </div>
    );
  }

  // Renderização para variante compact
  if (variant === 'compact') {
    return (
      <div className={`flex items-center justify-between p-3 bg-white rounded-lg border ${className}`}>
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${getStatusColor()}`}>
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900">
              {isLoading ? 'Carregando...' : `${credits.available} créditos`}
            </div>
            <div className="text-xs text-gray-500">
              {needsSetup ? 'Configure seu plano' : `${credits.used}/${credits.total} usados`}
            </div>
          </div>
        </div>
        
        {showActions && (
          <button
            onClick={refreshCredits}
            className="p-1 text-gray-400 hover:text-gray-600"
            title="Atualizar"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        )}
      </div>
    );
  }

  // Renderização para variante card (padrão)
  return (
    <div className={`bg-white rounded-lg border shadow-sm ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className={`p-2 rounded-lg ${getStatusColor()}`}>
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-900">Créditos ML</h3>
              {isConfigured && (
                <p className="text-xs text-gray-500">{planDisplayName}</p>
              )}
            </div>
          </div>

          {showActions && (
            <div className="flex items-center space-x-1">
              <button
                onClick={refreshCredits}
                disabled={isLoading}
                className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                title="Atualizar"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
              
              {needsSetup && (
                <button
                  onClick={() => setShowSetup(!showSetup)}
                  className="p-1 text-gray-400 hover:text-gray-600"
                  title="Configurar"
                >
                  <Settings className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {hasError ? (
          <div className="text-center py-4">
            <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
            <p className="text-sm text-red-600">{error}</p>
            <button
              onClick={refreshCredits}
              className="mt-2 text-xs text-red-600 hover:text-red-700 underline"
            >
              Tentar novamente
            </button>
          </div>
        ) : needsSetup ? (
          <div className="text-center py-4">
            <Settings className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600 mb-3">
              Configure seu plano ML para começar a usar insights
            </p>
            <button
              onClick={() => setShowSetup(true)}
              className="px-4 py-2 bg-purple-600 text-white text-sm rounded-md hover:bg-purple-700"
            >
              Configurar Plano
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Estatísticas principais */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {isLoading ? '...' : credits.available}
                </div>
                <div className="text-xs text-gray-500">Disponíveis</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {isLoading ? '...' : credits.total}
                </div>
                <div className="text-xs text-gray-500">Total/mês</div>
              </div>
            </div>

            {/* Barra de progresso */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-gray-500">
                <span>Uso: {usagePercentage()}%</span>
                <span>{credits.used} usados</span>
              </div>
              {renderProgressBar()}
            </div>

            {/* Detalhes adicionais */}
            {showDetails && (
              <div className="space-y-2 pt-2 border-t border-gray-100">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-1 text-gray-500">
                    <Calendar className="w-3 h-3" />
                    <span>Reset em</span>
                  </div>
                  <span className="font-medium text-gray-900">
                    {daysUntilReset()} dias
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-1 text-gray-500">
                    <TrendingUp className="w-3 h-3" />
                    <span>Status</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    {getStatusIcon()}
                    <span className={`font-medium ${getStatusColor().split(' ')[0]}`}>
                      {getCreditsStatus() === 'good' ? 'Bom' :
                       getCreditsStatus() === 'warning' ? 'Atenção' :
                       getCreditsStatus() === 'critical' ? 'Crítico' : 'Esgotado'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Setup de plano */}
      {showSetup && renderPlanSetup()}
    </div>
  );
}

export default MLCreditsWidget;
