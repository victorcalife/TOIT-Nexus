/**
 * WIDGET DE SLOTS ML
 * Componente para mostrar e gerenciar slots ML
 * 100% JavaScript - SEM TYPESCRIPT
 */

import React, { useState } from 'react';
import { useMLSlots } from '../../hooks/useMLSlots';
import {
  Zap,
  Plus,
  Trash2,
  Activity,
  Database,
  FileText,
  Workflow,
  BarChart3,
  Clock,
  Mail,
  CheckCircle,
  PlusCircle,
  Shield,
  Bell,
  AlertTriangle,
  Info,
  Settings
} from 'lucide-react';

// Ícones para tipos de slots
const SLOT_ICONS = {
  tql_query: Database,
  report_column: FileText,
  workflow_step: Workflow,
  dashboard_widget: BarChart3,
  auto_prediction: Clock,
  email_trigger: Mail,
  form_validation: CheckCircle,
  data_enrichment: PlusCircle,
  anomaly_monitor: Shield,
  smart_notification: Bell
};

/**
 * Widget de slots ML
 * @param {Object} props - Propriedades do componente
 * @returns {React.ReactElement} Widget de slots ML
 */
export function MLSlotsWidget({ variant = 'full', showCreateButton = true, className = '' }) {
  const {
    slots,
    storage,
    createSlot,
    deactivateSlot,
    canCreateSlot,
    formatBytes,
    isLoading,
    error,
    refresh
  } = useMLSlots();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  /**
   * Renderizar versão compacta
   */
  if (variant === 'compact') {
    return (
      <div className={`bg-white rounded-lg border p-4 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Zap className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Slots ML</h3>
              <p className="text-sm text-gray-500">
                {slots.used}/{slots.total} em uso
              </p>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-lg font-bold text-gray-900">
              {slots.available}
            </div>
            <div className="text-xs text-gray-500">disponíveis</div>
          </div>
        </div>
        
        {/* Barra de progresso */}
        <div className="mt-3">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Utilização</span>
            <span>{Math.round((slots.used / slots.total) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(slots.used / slots.total) * 100}%` }}
            />
          </div>
        </div>
      </div>
    );
  }

  /**
   * Criar novo slot
   */
  const handleCreateSlot = async (slotData) => {
    setIsCreating(true);
    try {
      await createSlot(
        slotData.type,
        slotData.name,
        slotData.location,
        slotData.config
      );
      setShowCreateModal(false);
      refresh();
    } catch (error) {
      console.error('Erro ao criar slot:', error);
      alert('Erro ao criar slot: ' + error.message);
    } finally {
      setIsCreating(false);
    }
  };

  /**
   * Remover slot
   */
  const handleRemoveSlot = async (slotLocation) => {
    if (!confirm('Tem certeza que deseja remover este slot ML?')) return;

    try {
      await deactivateSlot(slotLocation);
      refresh();
    } catch (error) {
      console.error('Erro ao remover slot:', error);
      alert('Erro ao remover slot: ' + error.message);
    }
  };

  if (isLoading) {
    return (
      <div className={`bg-white rounded-lg border p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-lg border p-6 ${className}`}>
        <div className="flex items-center space-x-3 text-red-600">
          <AlertTriangle className="w-5 h-5" />
          <div>
            <h3 className="font-medium">Erro ao carregar slots ML</h3>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg border ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Zap className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Slots ML
              </h3>
              <p className="text-sm text-gray-500">
                {slots.used}/{slots.total} slots em uso • {slots.available} disponíveis
              </p>
            </div>
          </div>
          
          {showCreateButton && canCreateSlot() && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-purple-600 text-white text-sm rounded-md hover:bg-purple-700 flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Novo Slot</span>
            </button>
          )}
        </div>
        
        {/* Barra de progresso */}
        <div className="mt-4">
          <div className="flex justify-between text-xs text-gray-500 mb-2">
            <span>Utilização de Slots</span>
            <span>{Math.round((slots.used / slots.total) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all duration-300 ${
                slots.used / slots.total > 0.8 ? 'bg-red-500' :
                slots.used / slots.total > 0.6 ? 'bg-yellow-500' : 'bg-purple-600'
              }`}
              style={{ width: `${(slots.used / slots.total) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Lista de slots */}
      <div className="p-6">
        {slots.list.length === 0 ? (
          <div className="text-center py-8">
            <Zap className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">
              Nenhum slot ML configurado
            </h4>
            <p className="text-gray-500 mb-4">
              Crie seu primeiro slot ML para começar a usar inteligência artificial.
            </p>
            {showCreateButton && canCreateSlot() && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
              >
                Criar Primeiro Slot
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {slots.list.map((slot) => {
              const IconComponent = SLOT_ICONS[slot.slot_type] || Activity;
              
              return (
                <div
                  key={slot.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <IconComponent className="w-5 h-5 text-gray-600" />
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {slot.slot_name}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {slot.typeInfo?.description || slot.slot_type}
                      </p>
                      <div className="flex items-center space-x-4 mt-1">
                        <span className="text-xs text-gray-400">
                          📍 {slot.slot_location}
                        </span>
                        <span className="text-xs text-gray-400">
                          🔢 {slot.usage_count} usos
                        </span>
                        {slot.last_used_at && (
                          <span className="text-xs text-gray-400">
                            🕐 {new Date(slot.last_used_at).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <div className={`px-2 py-1 rounded-full text-xs ${
                      slot.is_active 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-gray-100 text-gray-500'
                    }`}>
                      {slot.is_active ? 'Ativo' : 'Inativo'}
                    </div>
                    
                    {slot.is_active && (
                      <button
                        onClick={() => handleRemoveSlot(slot.slot_location)}
                        className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                        title="Remover slot"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Storage info */}
      <div className="p-6 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Database className="w-5 h-5 text-gray-500" />
            <div>
              <h4 className="font-medium text-gray-900">Storage</h4>
              <p className="text-sm text-gray-500">
                {formatBytes(storage.used)} de {formatBytes(storage.total)} usado
              </p>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-sm font-medium text-gray-900">
              {Math.round((storage.used / storage.total) * 100)}%
            </div>
            <div className="text-xs text-gray-500">utilizado</div>
          </div>
        </div>
        
        <div className="mt-3">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${
                storage.used / storage.total > 0.9 ? 'bg-red-500' :
                storage.used / storage.total > 0.7 ? 'bg-yellow-500' : 'bg-blue-500'
              }`}
              style={{ width: `${(storage.used / storage.total) * 100}%` }}
            />
          </div>
        </div>
        
        {storage.analysis.warnings.length > 0 && (
          <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-700">
            <div className="flex items-center space-x-1">
              <AlertTriangle className="w-3 h-3" />
              <span>{storage.analysis.warnings[0]}</span>
            </div>
          </div>
        )}
      </div>

      {/* Modal de criação (simplificado) */}
      {showCreateModal && (
        <CreateSlotModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateSlot}
          isCreating={isCreating}
        />
      )}
    </div>
  );
}

/**
 * Modal para criar novo slot (componente simplificado)
 */
function CreateSlotModal({ onClose, onCreate, isCreating }) {
  const [formData, setFormData] = useState({
    type: 'dashboard_widget',
    name: '',
    location: '',
    config: {}
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.location) {
      alert('Nome e localização são obrigatórios');
      return;
    }
    onCreate(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">Criar Novo Slot ML</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Slot
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="dashboard_widget">Widget de Dashboard</option>
              <option value="report_column">Coluna de Relatório</option>
              <option value="workflow_step">Etapa de Workflow</option>
              <option value="tql_query">Query TQL</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome do Slot
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              placeholder="Ex: Predição de Vendas"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Localização
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              placeholder="Ex: dashboard_vendas_widget_1"
            />
          </div>
          
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isCreating}
              className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
            >
              {isCreating ? 'Criando...' : 'Criar Slot'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default MLSlotsWidget;
