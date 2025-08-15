/**
 * COMPONENTE QUANTUM INSIGHT BUTTON
 * Botão principal para executar insights ML com validação de créditos
 * 100% JavaScript - SEM TYPESCRIPT
 */

import React, { useState, useCallback } from 'react';
import { useMLCredits } from '../../hooks/useMLCredits';
import { Brain, Zap, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

/**
 * Botão para executar insights ML
 * @param {Object} props - Propriedades do componente
 * @param {Array} props.data - Dados para análise ML
 * @param {string} props.insightType - Tipo de insight (prediction, optimization, anomaly, etc.)
 * @param {Object} props.options - Opções adicionais para o insight
 * @param {Function} props.onSuccess - Callback executado em caso de sucesso
 * @param {Function} props.onError - Callback executado em caso de erro
 * @param {string} props.variant - Variante visual do botão
 * @param {string} props.size - Tamanho do botão
 * @param {boolean} props.disabled - Se o botão está desabilitado
 * @param {string} props.className - Classes CSS adicionais
 * @param {React.ReactNode} props.children - Conteúdo do botão
 * @returns {React.ReactElement} Componente do botão
 */
export function QuantumInsightButton({
  data = [],
  insightType = 'prediction',
  options = {},
  onSuccess = () => {},
  onError = () => {},
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = '',
  children
}) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastResult, setLastResult] = useState(null);
  const [error, setError] = useState(null);

  const {
    hasEnoughCredits,
    credits,
    isLoading: creditsLoading,
    needsSetup,
    getCreditsStatus,
    consumeCreditsLocally
  } = useMLCredits();

  /**
   * Executar insight ML
   */
  const executeInsight = useCallback(async () => {
    // Validações iniciais
    if (!data || data.length === 0) {
      const errorMsg = 'Dados são obrigatórios para executar o insight';
      setError(errorMsg);
      onError(new Error(errorMsg));
      return;
    }

    if (needsSetup) {
      const errorMsg = 'Configure seu plano ML antes de usar insights';
      setError(errorMsg);
      onError(new Error(errorMsg));
      return;
    }

    if (!hasEnoughCredits(1)) {
      const errorMsg = 'Créditos ML insuficientes';
      setError(errorMsg);
      onError(new Error(errorMsg));
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      console.log(`🧠 [QuantumInsight] Executando insight: ${insightType}`);

      // Fazer requisição para API
      const baseURL = process.env.REACT_APP_API_URL || '';
      const response = await fetch(`${baseURL}/api/quantum/insight`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Tenant-ID': 'default' // TODO: Pegar do contexto
        },
        body: JSON.stringify({
          data,
          insightType,
          options
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `HTTP ${response.status}`);
      }

      if (result.success) {
        console.log('✅ [QuantumInsight] Insight executado com sucesso');
        
        // Atualizar créditos localmente
        consumeCreditsLocally(1);
        
        // Armazenar resultado
        setLastResult(result.data);
        
        // Callback de sucesso
        onSuccess(result.data);
      } else {
        throw new Error(result.error || 'Erro desconhecido');
      }

    } catch (error) {
      console.error('❌ [QuantumInsight] Erro ao executar insight:', error);
      setError(error.message);
      onError(error);
    } finally {
      setIsProcessing(false);
    }
  }, [data, insightType, options, needsSetup, hasEnoughCredits, consumeCreditsLocally, onSuccess, onError]);

  /**
   * Obter classes CSS do botão baseado na variante
   */
  const getButtonClasses = useCallback(() => {
    const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';
    
    // Classes de tamanho
    const sizeClasses = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-3 text-base',
      xl: 'px-8 py-4 text-lg'
    };

    // Classes de variante
    const variantClasses = {
      primary: 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl focus:ring-purple-500',
      secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-900 border border-gray-300 focus:ring-gray-500',
      success: 'bg-green-600 hover:bg-green-700 text-white focus:ring-green-500',
      warning: 'bg-yellow-600 hover:bg-yellow-700 text-white focus:ring-yellow-500',
      danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500'
    };

    // Classes de estado
    const stateClasses = {
      disabled: 'opacity-50 cursor-not-allowed',
      processing: 'cursor-wait',
      error: 'border-red-300 bg-red-50 text-red-700'
    };

    let classes = `${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]}`;

    if (disabled || creditsLoading || needsSetup || !hasEnoughCredits(1)) {
      classes += ` ${stateClasses.disabled}`;
    }

    if (isProcessing) {
      classes += ` ${stateClasses.processing}`;
    }

    if (error) {
      classes += ` ${stateClasses.error}`;
    }

    return `${classes} ${className}`;
  }, [variant, size, disabled, creditsLoading, needsSetup, hasEnoughCredits, isProcessing, error, className]);

  /**
   * Obter ícone baseado no estado
   */
  const getIcon = useCallback(() => {
    if (isProcessing) {
      return <Loader2 className="w-4 h-4 animate-spin" />;
    }

    if (error) {
      return <AlertCircle className="w-4 h-4" />;
    }

    if (lastResult) {
      return <CheckCircle className="w-4 h-4" />;
    }

    if (insightType === 'optimization') {
      return <Zap className="w-4 h-4" />;
    }

    return <Brain className="w-4 h-4" />;
  }, [isProcessing, error, lastResult, insightType]);

  /**
   * Obter texto do botão
   */
  const getButtonText = useCallback(() => {
    if (children) {
      return children;
    }

    if (isProcessing) {
      return 'Processando...';
    }

    if (needsSetup) {
      return 'Configure ML';
    }

    if (!hasEnoughCredits(1)) {
      return 'Sem Créditos';
    }

    const typeLabels = {
      prediction: 'Predição',
      optimization: 'Otimizar',
      anomaly: 'Detectar Anomalias',
      segmentation: 'Segmentar',
      recommendation: 'Recomendar'
    };

    return typeLabels[insightType] || 'Quantum Insight';
  }, [children, isProcessing, needsSetup, hasEnoughCredits, insightType]);

  /**
   * Obter tooltip baseado no estado
   */
  const getTooltip = useCallback(() => {
    if (needsSetup) {
      return 'Configure seu plano ML para usar insights';
    }

    if (!hasEnoughCredits(1)) {
      return `Créditos insuficientes (${credits.available} disponíveis)`;
    }

    if (data.length === 0) {
      return 'Dados são necessários para executar o insight';
    }

    if (error) {
      return `Erro: ${error}`;
    }

    if (lastResult) {
      return 'Insight executado com sucesso';
    }

    return `Executar ${insightType} (consome 1 crédito)`;
  }, [needsSetup, hasEnoughCredits, credits.available, data.length, error, lastResult, insightType]);

  /**
   * Verificar se o botão deve estar desabilitado
   */
  const isDisabled = useCallback(() => {
    return disabled || 
           creditsLoading || 
           isProcessing || 
           needsSetup || 
           !hasEnoughCredits(1) || 
           data.length === 0;
  }, [disabled, creditsLoading, isProcessing, needsSetup, hasEnoughCredits, data.length]);

  return (
    <div className="relative inline-block">
      <button
        onClick={executeInsight}
        disabled={isDisabled()}
        className={getButtonClasses()}
        title={getTooltip()}
        aria-label={getTooltip()}
      >
        <span className="mr-2">
          {getIcon()}
        </span>
        <span>
          {getButtonText()}
        </span>
        
        {/* Indicador de créditos */}
        {!needsSetup && hasEnoughCredits(1) && !isProcessing && (
          <span className="ml-2 px-1.5 py-0.5 text-xs bg-white/20 rounded-full">
            1 ⚡
          </span>
        )}
      </button>

      {/* Status dos créditos */}
      {!needsSetup && (
        <div className="absolute -top-2 -right-2 z-10">
          <div className={`w-3 h-3 rounded-full ${
            getCreditsStatus() === 'good' ? 'bg-green-500' :
            getCreditsStatus() === 'warning' ? 'bg-yellow-500' :
            getCreditsStatus() === 'critical' ? 'bg-orange-500' :
            'bg-red-500'
          }`} title={`Créditos: ${credits.available}/${credits.total}`} />
        </div>
      )}

      {/* Feedback de erro */}
      {error && (
        <div className="absolute top-full left-0 mt-1 p-2 bg-red-100 border border-red-300 rounded-md text-sm text-red-700 whitespace-nowrap z-20">
          {error}
        </div>
      )}

      {/* Feedback de sucesso */}
      {lastResult && !error && !isProcessing && (
        <div className="absolute top-full left-0 mt-1 p-2 bg-green-100 border border-green-300 rounded-md text-sm text-green-700 whitespace-nowrap z-20">
          Insight executado com sucesso!
        </div>
      )}
    </div>
  );
}

export default QuantumInsightButton;
