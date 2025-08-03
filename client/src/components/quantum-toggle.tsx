import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Switch } from './ui/switch';
import { Alert, AlertDescription } from './ui/alert';
import { Loader2, Zap, Cpu, DollarSign, TrendingUp, AlertTriangle, Star } from 'lucide-react';

// ===== QUANTUM TOGGLE COMPONENT =====
// Interface para usuário escolher quando usar computação quântica

interface QuantumToggleProps {
  context: string;
  dataSize?: number;
  complexity?: 'low' | 'medium' | 'high';
  onQuantumToggle: (useQuantum: boolean) => void;
  onExecute: (useQuantum: boolean) => Promise<any>;
  disabled?: boolean;
  className?: string;
}

export function QuantumToggle({
  context,
  dataSize,
  complexity = 'medium',
  onQuantumToggle,
  onExecute,
  disabled = false,
  className = ''
}: QuantumToggleProps) {
  const [quantumLevel, setQuantumLevel] = useState<'logic' | 'logic_x' | 'boost'>('logic');
  const [eligibility, setEligibility] = useState<any>(null);
  const [canUse, setCanUse] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [executing, setExecuting] = useState(false);

  // Verificar elegibilidade ao montar componente
  useEffect(() => {
    checkQuantumEligibility();
  }, [context, dataSize, complexity]);

  const checkQuantumEligibility = async () => {
    setLoading(true);
    try {
      // Simulação da API call
      const response = await fetch('/api/quantum-billing/eligibility/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ context, dataSize, complexity })
      });
      
      const data = await response.json();
      setEligibility(data.eligibility);
      setCanUse(data.canUse);
      
      // Auto-sugerir quantum se recomendado
      if (data.eligibility?.autoSuggest && data.canUse?.canUse) {
        setUseQuantum(true);
        onQuantumToggle(true);
      }
    } catch (error) {
      console.error('Error checking quantum eligibility:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuantumToggle = (checked: boolean) => {
    setUseQuantum(checked);
    onQuantumToggle(checked);
  };

  const handleExecute = async () => {
    setExecuting(true);
    try {
      await onExecute(useQuantum);
    } catch (error) {
      console.error('Execution error:', error);
    } finally {
      setExecuting(false);
    }
  };

  // Se não é elegível para quantum, mostrar apenas botão clássico
  if (!loading && (!eligibility?.eligible)) {
    return (
      <Card className={`border-gray-200 ${className}`}>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Cpu className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Processamento Clássico</h4>
                <p className="text-sm text-gray-500">Incluído na mensalidade</p>
              </div>
            </div>
            
            <Button 
              onClick={handleExecute}
              disabled={disabled || executing}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {executing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processando...
                </>
              ) : (
                'Executar'
              )}
            </Button>
          </div>
          
          {eligibility?.reason && (
            <Alert className="mt-4 border-gray-200">
              <AlertDescription className="text-sm text-gray-600">
                {eligibility.reason}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className={`border-gray-200 ${className}`}>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-3 text-gray-600">Verificando disponibilidade quantum...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Interface completa com opção quantum
  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header com toggle quantum */}
      <Card className={`border-2 transition-all duration-200 ${
        useQuantum ? 'border-purple-300 bg-gradient-to-r from-purple-50 to-blue-50' : 'border-gray-200'
      }`}>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${useQuantum ? 'bg-purple-100' : 'bg-blue-100'}`}>
                {useQuantum ? (
                  <Zap className="h-5 w-5 text-purple-600" />
                ) : (
                  <Cpu className="h-5 w-5 text-blue-600" />
                )}
              </div>
              <div>
                <CardTitle className="text-lg">
                  {useQuantum ? 'Computação Quântica' : 'Processamento Clássico'}
                </CardTitle>
                <CardDescription>
                  {useQuantum ? 'Algoritmos quânticos avançados' : 'Processamento tradicional incluído'}
                </CardDescription>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {eligibility?.autoSuggest && (
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                  <Star className="w-3 h-3 mr-1" />
                  Recomendado
                </Badge>
              )}
              
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Quantum</span>
                <Switch
                  checked={useQuantum}
                  onCheckedChange={handleQuantumToggle}
                  disabled={!canUse?.canUse}
                />
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {useQuantum ? (
            <QuantumDetails 
              eligibility={eligibility}
              canUse={canUse}
              onExecute={handleExecute}
              executing={executing}
              disabled={disabled}
            />
          ) : (
            <ClassicalDetails 
              onExecute={handleExecute}
              executing={executing}
              disabled={disabled}
            />
          )}
        </CardContent>
      </Card>

      {/* Upgrade prompt se necessário */}
      {useQuantum && !canUse?.canUse && (
        <UpgradePrompt canUse={canUse} />
      )}

      {/* Quantum benefits se disponível */}
      {eligibility?.eligible && !useQuantum && (
        <QuantumBenefitsCard 
          eligibility={eligibility}
          onActivate={() => handleQuantumToggle(true)}
        />
      )}
    </div>
  );
}

// ===== COMPONENTES AUXILIARES =====

function QuantumDetails({ eligibility, canUse, onExecute, executing, disabled }: any) {
  if (!canUse?.canUse) {
    return (
      <Alert className="border-red-200 bg-red-50">
        <AlertTriangle className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-800">
          {canUse?.reason}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      {/* Benefícios quantum */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="text-center p-3 bg-purple-50 rounded-lg">
          <TrendingUp className="h-6 w-6 text-purple-600 mx-auto mb-2" />
          <div className="text-sm font-medium text-purple-900">Vantagem</div>
          <div className="text-xs text-purple-700">{eligibility.savings}</div>
        </div>
        
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <Zap className="h-6 w-6 text-blue-600 mx-auto mb-2" />
          <div className="text-sm font-medium text-blue-900">Algoritmo</div>
          <div className="text-xs text-blue-700">{eligibility.algorithm}</div>
        </div>
        
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <DollarSign className="h-6 w-6 text-green-600 mx-auto mb-2" />
          <div className="text-sm font-medium text-green-900">Custo</div>
          <div className="text-xs text-green-700">{canUse.cost}</div>
        </div>
      </div>

      {/* Benefício principal */}
      <div className="p-4 bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg">
        <p className="text-sm text-gray-800 font-medium mb-2">Benefício Quantum:</p>
        <p className="text-sm text-gray-700">{eligibility.benefit}</p>
      </div>

      {/* Saldo atual */}
      {canUse.tier === 'unstoppable' && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Saldo atual:</span>
          <div className="flex items-center space-x-2">
            <Badge variant="outline">{canUse.currentBalance} créditos</Badge>
            <span className="text-gray-400">→</span>
            <Badge variant="outline">{canUse.balanceAfter} após execução</Badge>
          </div>
        </div>
      )}

      {/* Botão de execução */}
      <Button 
        onClick={onExecute}
        disabled={disabled || executing}
        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
        size="lg"
      >
        {executing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Executando Quantum...
          </>
        ) : (
          <>
            <Zap className="mr-2 h-4 w-4" />
            Executar com Quantum
          </>
        )}
      </Button>
    </div>
  );
}

function ClassicalDetails({ onExecute, executing, disabled }: any) {
  return (
    <div className="space-y-4">
      <div className="p-4 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-800 font-medium mb-2">Processamento Clássico:</p>
        <p className="text-sm text-blue-700">
          Algoritmos tradicionais eficientes, incluídos na sua mensalidade sem custos adicionais.
        </p>
      </div>

      <Button 
        onClick={onExecute}
        disabled={disabled || executing}
        className="w-full bg-blue-600 hover:bg-blue-700"
        size="lg"
      >
        {executing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processando...
          </>
        ) : (
          <>
            <Cpu className="mr-2 h-4 w-4" />
            Executar Clássico
          </>
        )}
      </Button>
    </div>
  );
}

function UpgradePrompt({ canUse }: any) {
  const handleUpgrade = () => {
    // Navegar para página de upgrade
    window.location.href = '/quantum-packages';
  };

  const handlePurchaseCredits = () => {
    // Navegar para compra de créditos
    window.location.href = '/quantum-credits';
  };

  return (
    <Card className="border-yellow-200 bg-yellow-50">
      <CardContent className="pt-6">
        {canUse?.action === 'upgrade_required' && (
          <div className="text-center space-y-4">
            <div className="p-3 bg-yellow-100 rounded-full w-fit mx-auto">
              <TrendingUp className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <h3 className="font-semibold text-yellow-900">Upgrade para Quantum Unstoppable</h3>
              <p className="text-sm text-yellow-700 mt-1">
                Desbloqueie algoritmos quânticos avançados e ganhe 100 créditos de bônus!
              </p>
            </div>
            <Button 
              onClick={handleUpgrade}
              className="bg-yellow-600 hover:bg-yellow-700"
            >
              Fazer Upgrade Agora
            </Button>
          </div>
        )}

        {canUse?.action === 'purchase_credits' && (
          <div className="text-center space-y-4">
            <div className="p-3 bg-yellow-100 rounded-full w-fit mx-auto">
              <DollarSign className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <h3 className="font-semibold text-yellow-900">Créditos Insuficientes</h3>
              <p className="text-sm text-yellow-700 mt-1">
                Você precisa de {canUse.credits?.missing} créditos adicionais para usar este algoritmo quântico.
              </p>
              <div className="text-xs text-yellow-600 mt-2">
                Preço: R$ {canUse.credits?.missing * 5},00 ({canUse.credits?.missing} × R$ 5,00)
              </div>
            </div>
            <Button 
              onClick={handlePurchaseCredits}
              className="bg-yellow-600 hover:bg-yellow-700"
            >
              Comprar Créditos
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function QuantumBenefitsCard({ eligibility, onActivate }: any) {
  return (
    <Card className="border-green-200 bg-green-50">
      <CardContent className="pt-6">
        <div className="flex items-start space-x-4">
          <div className="p-2 bg-green-100 rounded-lg flex-shrink-0">
            <Zap className="h-5 w-5 text-green-600" />
          </div>
          <div className="flex-1">
            <h4 className="font-medium text-green-900 mb-2">Disponível: Computação Quântica</h4>
            <p className="text-sm text-green-700 mb-3">{eligibility.benefit}</p>
            <div className="text-xs text-green-600 mb-4">
              <strong>Vantagem:</strong> {eligibility.savings}
            </div>
            <Button 
              onClick={onActivate}
              size="sm"
              className="bg-green-600 hover:bg-green-700"
            >
              Ativar Quantum
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}