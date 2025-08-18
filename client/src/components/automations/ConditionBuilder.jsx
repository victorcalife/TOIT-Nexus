/**
 * CONDITION BUILDER
 * Interface para criação de condições complexas para automações
 * 100% JavaScript - SEM TYPESCRIPT
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import {
  Plus,
  Trash2,
  GitBranch,
  Target,
  Code,
  Calendar,
  Clock,
  User,
  Database,
  Hash,
  Type,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';

const CONDITION_TYPES = {
  SIMPLE: 'simple',
  COMPLEX: 'complex',
  FUNCTION: 'function',
  TIME: 'time',
  USER: 'user',
  DATA: 'data'
};

const OPERATORS = {
  // Comparação
  EQUALS: { symbol: '=', label: 'Igual a', types: ['string', 'number', 'boolean'] },
  NOT_EQUALS: { symbol: '!=', label: 'Diferente de', types: ['string', 'number', 'boolean'] },
  GREATER: { symbol: '>', label: 'Maior que', types: ['number', 'date'] },
  GREATER_EQUAL: { symbol: '>=', label: 'Maior ou igual', types: ['number', 'date'] },
  LESS: { symbol: '<', label: 'Menor que', types: ['number', 'date'] },
  LESS_EQUAL: { symbol: '<=', label: 'Menor ou igual', types: ['number', 'date'] },
  
  // String
  CONTAINS: { symbol: 'contains', label: 'Contém', types: ['string'] },
  NOT_CONTAINS: { symbol: 'not_contains', label: 'Não contém', types: ['string'] },
  STARTS_WITH: { symbol: 'starts_with', label: 'Começa com', types: ['string'] },
  ENDS_WITH: { symbol: 'ends_with', label: 'Termina com', types: ['string'] },
  REGEX: { symbol: 'regex', label: 'Regex', types: ['string'] },
  
  // Array
  IN: { symbol: 'in', label: 'Está em', types: ['array'] },
  NOT_IN: { symbol: 'not_in', label: 'Não está em', types: ['array'] },
  
  // Existência
  EXISTS: { symbol: 'exists', label: 'Existe', types: ['any'] },
  NOT_EXISTS: { symbol: 'not_exists', label: 'Não existe', types: ['any'] },
  
  // Temporal
  TODAY: { symbol: 'today', label: 'É hoje', types: ['date'] },
  YESTERDAY: { symbol: 'yesterday', label: 'Foi ontem', types: ['date'] },
  THIS_WEEK: { symbol: 'this_week', label: 'Esta semana', types: ['date'] },
  THIS_MONTH: { symbol: 'this_month', label: 'Este mês', types: ['date'] },
  
  // Lógico
  AND: { symbol: 'AND', label: 'E', types: ['logical'] },
  OR: { symbol: 'OR', label: 'OU', types: ['logical'] },
  NOT: { symbol: 'NOT', label: 'NÃO', types: ['logical'] }
};

const FIELD_TYPES = {
  STRING: { icon: Type, label: 'Texto' },
  NUMBER: { icon: Hash, label: 'Número' },
  BOOLEAN: { icon: ToggleLeft, label: 'Verdadeiro/Falso' },
  DATE: { icon: Calendar, label: 'Data' },
  TIME: { icon: Clock, label: 'Hora' },
  USER: { icon: User, label: 'Usuário' },
  ARRAY: { icon: Database, label: 'Lista' }
};

const PREDEFINED_FIELDS = {
  // Campos do usuário
  'user.id': { type: 'number', label: 'ID do Usuário' },
  'user.email': { type: 'string', label: 'Email do Usuário' },
  'user.role': { type: 'string', label: 'Papel do Usuário' },
  'user.created_at': { type: 'date', label: 'Data de Criação do Usuário' },
  'user.last_login': { type: 'date', label: 'Último Login' },
  
  // Campos de tempo
  'current.time': { type: 'time', label: 'Hora Atual' },
  'current.date': { type: 'date', label: 'Data Atual' },
  'current.day_of_week': { type: 'number', label: 'Dia da Semana' },
  'current.hour': { type: 'number', label: 'Hora Atual (0-23)' },
  
  // Campos do sistema
  'system.load': { type: 'number', label: 'Carga do Sistema' },
  'system.users_online': { type: 'number', label: 'Usuários Online' },
  'system.memory_usage': { type: 'number', label: 'Uso de Memória' },
  
  // Campos de dados
  'data.count': { type: 'number', label: 'Contagem de Registros' },
  'data.last_modified': { type: 'date', label: 'Última Modificação' },
  'data.size': { type: 'number', label: 'Tamanho dos Dados' }
};

export default function ConditionBuilder({ 
  conditions = [], 
  onChange, 
  allowComplex = true,
  showPreview = true 
}) {
  const [selectedCondition, setSelectedCondition] = useState(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Adicionar nova condição
  const addCondition = (type = CONDITION_TYPES.SIMPLE) => {
    const newCondition = {
      id: Date.now(),
      type,
      field: '',
      operator: OPERATORS.EQUALS.symbol,
      value: '',
      fieldType: 'string',
      logicalOperator: conditions.length > 0 ? 'AND' : null,
      group: null,
      enabled: true
    };

    onChange([...conditions, newCondition]);
  };

  // Remover condição
  const removeCondition = (conditionId) => {
    const newConditions = conditions.filter(c => c.id !== conditionId);
    onChange(newConditions);
  };

  // Atualizar condição
  const updateCondition = (conditionId, field, value) => {
    const newConditions = conditions.map(c =>
      c.id === conditionId ? { ...c, [field]: value } : c
    );
    onChange(newConditions);
  };

  // Agrupar condições
  const groupConditions = (conditionIds) => {
    const groupId = Date.now();
    const newConditions = conditions.map(c =>
      conditionIds.includes(c.id) ? { ...c, group: groupId } : c
    );
    onChange(newConditions);
  };

  // Gerar preview da condição
  const generateConditionPreview = () => {
    if (conditions.length === 0) return 'Nenhuma condição definida';

    return conditions.map((condition, index) => {
      let preview = '';
      
      if (index > 0 && condition.logicalOperator) {
        preview += `${condition.logicalOperator} `;
      }
      
      if (condition.group) {
        preview += '(';
      }
      
      preview += `${condition.field} ${condition.operator} ${condition.value}`;
      
      if (condition.group) {
        preview += ')';
      }
      
      return preview;
    }).join(' ');
  };

  // Validar condição
  const validateCondition = (condition) => {
    const errors = [];
    
    if (!condition.field) {
      errors.push('Campo é obrigatório');
    }
    
    if (!condition.operator) {
      errors.push('Operador é obrigatório');
    }
    
    if (!condition.value && !['exists', 'not_exists'].includes(condition.operator)) {
      errors.push('Valor é obrigatório');
    }
    
    return errors;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Condições</h3>
          <p className="text-sm text-gray-600">
            Defina quando a automação deve ser executada
          </p>
        </div>
        
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            <Code className="w-4 h-4 mr-2" />
            {showAdvanced ? 'Simples' : 'Avançado'}
          </Button>
          
          <Button onClick={() => addCondition()}>
            <Plus className="w-4 h-4 mr-2" />
            Adicionar
          </Button>
        </div>
      </div>

      {/* Conditions List */}
      {conditions.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Target className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Nenhuma condição definida
            </h3>
            <p className="text-gray-600 mb-4">
              A automação será executada sempre que o trigger for ativado
            </p>
            <Button onClick={() => addCondition()}>
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Primeira Condição
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {conditions.map((condition, index) => {
            const errors = validateCondition(condition);
            const hasErrors = errors.length > 0;
            
            return (
              <Card key={condition.id} className={hasErrors ? 'border-red-300' : ''}>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-4">
                    {/* Logical Operator */}
                    {index > 0 && (
                      <select
                        value={condition.logicalOperator || 'AND'}
                        onChange={(e) => updateCondition(condition.id, 'logicalOperator', e.target.value)}
                        className="px-2 py-1 border rounded text-sm font-medium"
                      >
                        <option value="AND">E</option>
                        <option value="OR">OU</option>
                      </select>
                    )}
                    
                    {/* Field */}
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Campo
                      </label>
                      <select
                        value={condition.field}
                        onChange={(e) => {
                          const field = e.target.value;
                          const fieldInfo = PREDEFINED_FIELDS[field];
                          updateCondition(condition.id, 'field', field);
                          if (fieldInfo) {
                            updateCondition(condition.id, 'fieldType', fieldInfo.type);
                          }
                        }}
                        className="w-full px-3 py-2 border rounded-md"
                      >
                        <option value="">Selecionar campo</option>
                        {Object.entries(PREDEFINED_FIELDS).map(([key, field]) => (
                          <option key={key} value={key}>
                            {field.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    {/* Operator */}
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Operador
                      </label>
                      <select
                        value={condition.operator}
                        onChange={(e) => updateCondition(condition.id, 'operator', e.target.value)}
                        className="w-full px-3 py-2 border rounded-md"
                      >
                        {Object.entries(OPERATORS)
                          .filter(([_, op]) => 
                            op.types.includes(condition.fieldType) || 
                            op.types.includes('any')
                          )
                          .map(([key, operator]) => (
                            <option key={key} value={operator.symbol}>
                              {operator.label}
                            </option>
                          ))
                        }
                      </select>
                    </div>
                    
                    {/* Value */}
                    {!['exists', 'not_exists', 'today', 'yesterday', 'this_week', 'this_month'].includes(condition.operator) && (
                      <div className="flex-1">
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Valor
                        </label>
                        <Input
                          value={condition.value}
                          onChange={(e) => updateCondition(condition.id, 'value', e.target.value)}
                          placeholder="Digite o valor"
                          type={condition.fieldType === 'number' ? 'number' : 'text'}
                        />
                      </div>
                    )}
                    
                    {/* Actions */}
                    <div className="flex flex-col space-y-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateCondition(condition.id, 'enabled', !condition.enabled)}
                        className={condition.enabled ? '' : 'opacity-50'}
                      >
                        {condition.enabled ? (
                          <ToggleRight className="w-4 h-4" />
                        ) : (
                          <ToggleLeft className="w-4 h-4" />
                        )}
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => removeCondition(condition.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {/* Errors */}
                  {hasErrors && (
                    <div className="mt-2 text-sm text-red-600">
                      {errors.map((error, i) => (
                        <div key={i}>• {error}</div>
                      ))}
                    </div>
                  )}
                  
                  {/* Advanced Options */}
                  {showAdvanced && (
                    <div className="mt-4 pt-4 border-t">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Tipo do Campo
                          </label>
                          <select
                            value={condition.fieldType}
                            onChange={(e) => updateCondition(condition.id, 'fieldType', e.target.value)}
                            className="w-full px-3 py-2 border rounded-md"
                          >
                            {Object.entries(FIELD_TYPES).map(([key, type]) => (
                              <option key={key} value={key.toLowerCase()}>
                                {type.label}
                              </option>
                            ))}
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Grupo
                          </label>
                          <Input
                            value={condition.group || ''}
                            onChange={(e) => updateCondition(condition.id, 'group', e.target.value || null)}
                            placeholder="ID do grupo (opcional)"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Preview */}
      {showPreview && conditions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Preview da Condição</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 p-4 rounded-lg">
              <code className="text-sm text-gray-800">
                {generateConditionPreview()}
              </code>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Templates */}
      {conditions.length === 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Templates Rápidos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                variant="outline"
                className="h-auto p-4 text-left"
                onClick={() => {
                  onChange([
                    {
                      id: Date.now(),
                      type: CONDITION_TYPES.TIME,
                      field: 'current.hour',
                      operator: '>=',
                      value: '9',
                      fieldType: 'number',
                      enabled: true
                    },
                    {
                      id: Date.now() + 1,
                      type: CONDITION_TYPES.TIME,
                      field: 'current.hour',
                      operator: '<=',
                      value: '18',
                      fieldType: 'number',
                      logicalOperator: 'AND',
                      enabled: true
                    }
                  ]);
                }}
              >
                <div>
                  <div className="font-medium">Horário Comercial</div>
                  <div className="text-sm text-gray-600">Entre 9h e 18h</div>
                </div>
              </Button>
              
              <Button
                variant="outline"
                className="h-auto p-4 text-left"
                onClick={() => {
                  onChange([
                    {
                      id: Date.now(),
                      type: CONDITION_TYPES.USER,
                      field: 'user.role',
                      operator: '=',
                      value: 'admin',
                      fieldType: 'string',
                      enabled: true
                    }
                  ]);
                }}
              >
                <div>
                  <div className="font-medium">Apenas Admins</div>
                  <div className="text-sm text-gray-600">Usuário é administrador</div>
                </div>
              </Button>
              
              <Button
                variant="outline"
                className="h-auto p-4 text-left"
                onClick={() => {
                  onChange([
                    {
                      id: Date.now(),
                      type: CONDITION_TYPES.DATA,
                      field: 'data.count',
                      operator: '>',
                      value: '100',
                      fieldType: 'number',
                      enabled: true
                    }
                  ]);
                }}
              >
                <div>
                  <div className="font-medium">Alto Volume</div>
                  <div className="text-sm text-gray-600">Mais de 100 registros</div>
                </div>
              </Button>
              
              <Button
                variant="outline"
                className="h-auto p-4 text-left"
                onClick={() => {
                  onChange([
                    {
                      id: Date.now(),
                      type: CONDITION_TYPES.TIME,
                      field: 'current.date',
                      operator: 'today',
                      value: '',
                      fieldType: 'date',
                      enabled: true
                    }
                  ]);
                }}
              >
                <div>
                  <div className="font-medium">Apenas Hoje</div>
                  <div className="text-sm text-gray-600">Executar apenas hoje</div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
