import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Loader2, Zap, Cpu, Brain, Sparkles, Rocket, DollarSign, CheckCircle } from 'lucide-react';

// ===== QUANTUM LEVEL SELECTOR =====
// Sistema graduado) => void;
  onExecute) => Promise<any>;
  disabled,
  dataSize,
  complexity = 'medium',
  onLevelChange,
  onExecute,
  disabled = false,
  className = ''
}) ({ const [selectedLevel, setSelectedLevel] = useState<'logic' | 'logic_x' | 'boost'>('logic');
  const [capabilities, setCapabilities] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [executing, setExecuting] = useState(false);

  useEffect(( }) => {
    checkQuantumCapabilities();
  }, [context, dataSize, complexity]);

  const checkQuantumCapabilities = async () => {
    setLoading(true);
    try {
      // Verificar capacidades disponíveis
      const response = await fetch('/api/quantum-billing/capabilities/check', {
        method,
        headers,
        body, dataSize, complexity })
      });
      
      const data = await response.json();
      setCapabilities(data);
      
      // Auto-selecionar nível recomendado
      if (data.recommended === 'boost' && data.boost?.available) {
        setSelectedLevel('boost');
      } else if (data.recommended === 'logic_x') {
        setSelectedLevel('logic_x');
      }
    } catch (error) {
      console.error('Error checking quantum capabilities, error);
    } finally {
      setLoading(false);
    }
  };

  const handleLevelChange = (level) => {
    setSelectedLevel(level);
    onLevelChange(level);
  };

  const handleExecute = async () => {
    setExecuting(true);
    try {
      await onExecute(selectedLevel);
    } catch (error) {
      console.error('Execution error, error);
    } finally {
      setExecuting(false);
    }
  };

  if (loading) {
    return (
      <Card className={`border-gray-200 ${className}`}>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-3 text-gray-600">Verificando capacidades quantum...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
`
    <div className={`space-y-6 ${className}`}>
      {/* Quantum Level Selection */}
      <Card className="border-2 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="h-5 w-5 text-blue-600" />
            <span>Nível de Processamento Quantum</span>
          </CardTitle>
          <CardDescription>
            Escolha o nível de inteligência quantum para esta operação
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md) => handleLevelChange('logic')}
              price="Grátis"
              priceColor="text-green-600"
              features={[
                'Motor adaptativo inteligente',
                'Otimização básica de workflows',
                'Reconhecimento de padrões',
                'Sugestões automatizadas'
}
              ]}
              borderColor="border-green-200"
              bgColor="bg-green-50"
              available={true}
            />

            {/* QUANTUM LOGIC X */}
            <QuantumLevelCard
              level="logic_x"
              title="Quantum Logic X"
              subtitle="Processamento avançado"
              icon={<Sparkles className="h-6 w-6" />}
              selected={selectedLevel === 'logic_x'}
              onClick={() => handleLevelChange('logic_x')}
              price="Grátis"
              priceColor="text-blue-600"
              features={[
                'Tudo do Logic +',
                'Otimização avançada',
                'Predições inteligentes',
                'Analytics melhorado',
                'Auto-otimização'
}
              ]}
              borderColor="border-blue-200"
              bgColor="bg-blue-50"
              available={true}
              recommended={capabilities?.recommended === 'logic_x'}
            />

            {/* QUANTUM BOOST */}
            <QuantumLevelCard
              level="boost"
              title="Quantum Boost"
              subtitle="Vantagem exponencial"
              icon={<Rocket className="h-6 w-6" />}
              selected={selectedLevel === 'boost'}
              onClick={() => handleLevelChange('boost')}
              price={capabilities?.boost?.price || 'R$ 15,00'}
              priceColor="text-purple-600"
              features={[
                'Algoritmos quânticos reais',
                'Vantagem O(√N) vs O(N)',
                'Qiskit AI Enhancement',
                'IBM Quantum Network',
                'Long-range entanglement'
}
              ]}
              borderColor="border-purple-200"
              bgColor="bg-purple-50"
              available={capabilities?.boost?.available || false}
              premium={true}
              recommended={capabilities?.recommended === 'boost'}
              upgradeRequired={capabilities?.boost?.upgradeRequired}
              creditsNeeded={capabilities?.boost?.creditsNeeded}
            />
          </div>
        </CardContent>
      </Card>

      {/* Execution Section */}
      <Card className={`border-2 transition-all duration-200 ${
        selectedLevel === 'boost' ? 'border-purple-300 bg-gradient-to-r from-purple-50 to-blue-50' : 
        selectedLevel === 'logic_x' ? 'border-blue-300 bg-blue-50' :
        'border-green-300 bg-green-50'
      }`}>
        <CardContent className="pt-6">
          <ExecutionPanel
            selectedLevel={selectedLevel}
            capabilities={capabilities}
            onExecute={handleExecute}
            executing={executing}
            disabled={disabled}
          />
        </CardContent>
      </Card>

      {/* Recommendation Alert */}
      {capabilities?.recommendation && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <Sparkles className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            <strong>Recomendação IA:</strong> {capabilities.recommendation}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

// ===== COMPONENTES AUXILIARES =====

) {
  return (
    <div
      className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
        selected ? `${borderColor} ${bgColor} shadow-lg` : 'border-gray-200 hover:border-gray-300'
      }`}
      onClick={onClick}

      {/* Premium badge */}
      {premium && (
        <div className="absolute top-2 right-2">
          <Badge variant="secondary" className="bg-purple-100 text-purple-800">
          </Badge>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center space-x-3 mb-3">
        <div className={`p-2 rounded-lg ${bgColor}`}>
          {React.cloneElement(icon as React.ReactElement, {
            className: 'h-6 w-6'
          })}
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-600">{subtitle}</p>
        </div>
      </div>

      {/* Price */}
      <div className={`text-lg font-bold ${priceColor} mb-3`}>
        {price}
      </div>

      {/* Features */}
      <ul className="space-y-2 text-sm text-gray-700 mb-4">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start space-x-2">
            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      {/* Availability status */}
      {!available && (
        <div className="text-center">
          {upgradeRequired ? (
            <div className="text-xs text-gray-600">
              Requer upgrade para Quantum Unstoppable
            </div>
          ) : (
            <div className="text-xs text-gray-600">
              Créditos necessários: {creditsNeeded}
            </div>
          )}
        </div>
      )}

      {/* Selection indicator */}
      {selected && (
        <div className="absolute inset-0 rounded-lg border-2 border-blue-500 bg-blue-50 bg-opacity-20 pointer-events-none" />
      )}
    </div>
  );
}

function ExecutionPanel({ selectedLevel, capabilities, onExecute, executing, disabled }) {
  const levelConfig = {
    logic: {
      description: 'Processamento clássico otimizado',
      buttonText: 'Executar Logic',
      buttonClass: 'bg-green-600 hover:bg-green-700',
      icon: <Play className="mr-2 h-4 w-4" />
    },
    logic_x: {
      description: 'Algoritmos híbridos avançados',
      buttonText: 'Executar Logic X',
      buttonClass: 'bg-blue-600 hover:bg-blue-700',
      icon: <Sparkles className="mr-2 h-4 w-4" />
    },
    boost: {
      description: 'Computação quântica real',
      buttonText: 'Executar Quantum Boost',
      buttonClass: 'bg-purple-600 hover:bg-purple-700',
      icon: <Rocket className="mr-2 h-4 w-4" />
    }
  };

  const config = levelConfig[selectedLevel];
  const levelData = capabilities?.[selectedLevel];

  return (
    <div className="space-y-4">
      {/* Description */}
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">{config.description}</h3>
        
        {/* Benefits for current level */}
        {levelData?.benefits && (
          <div className="text-sm text-gray-600">
            <ul className="space-y-1">
              {levelData.benefits.map((benefit, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <Zap className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
          </ul>
        </div>
      )}

      {/* Cost info for Boost */}
      {selectedLevel === 'boost' && levelData?.cost && (
        <div className="flex items-center justify-between text-sm p-3 bg-purple-50 rounded-lg">
          <span className="text-purple-700">Custo desta execução:</span>
          <span className="font-semibold text-purple-900">{levelData.cost}</span>
        </div>
      )}

      {/* Execute button */}
      <Button
        onClick={onExecute}
        disabled={disabled || executing || (selectedLevel === 'boost' && !levelData?.available)}
        className={`w-full ${config.buttonClass}`}
        size="lg"
      >
        {executing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processando...
          </>
        ) : (
          <>
            {config.icon}
            {config.buttonText}
          </>
        )}
      </Button>

      {/* Upgrade prompt for Boost */}
      {selectedLevel === 'boost' && !levelData?.available && (
        <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <p className="text-sm text-yellow-800 mb-3">
            {levelData?.upgradeRequired 
              ? 'Upgrade para Quantum Unstoppable necessário'
              : 'Créditos insuficientes'
            }
          </p>
          <Button
            size="sm"
            className="bg-yellow-600 hover:bg-yellow-700"
            onClick={() => window.location.href = levelData?.upgradeRequired ? '/quantum-packages' : '/quantum-credits'}
          >
            {levelData?.upgradeRequired ? 'Fazer Upgrade' : 'Comprar Créditos'}
          </Button>
        </div>
      )}
    </div>
  );
}`