import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Slider } from '@/components/ui/slider';
import { 
  Plus, 
  Trash2, 
  GripVertical, 
  Settings, 
  Eye,
  Type,
  Hash,
  Calendar,
  Mail,
  CheckSquare,
  List,
  Star,
  FileUp,
  AlertCircle,
  Move
} from 'lucide-react';

export ) {
  const [editingField, setEditingField] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState<Record<string, boolean>>({});

  const addField = (type) => {
    const newField= {
      id)}`,
      type,
      label,
      required,
      options, 'select', 'multiselect'].includes(type) ? ['Opção 1', 'Opção 2'] : undefined
    };

    onChange([...fields, newField]);
    setEditingField(newField.id);
  };

  const updateField = (fieldId, updates) => {
    const updatedFields = fields.map(field =>
      field.id === fieldId ? { ...field, ...updates } );
    onChange(updatedFields);
  };

  const removeField = (fieldId) => {
    onChange(fields.filter(field => field.id !== fieldId));
    if (editingField === fieldId) {
      setEditingField(null);
    }
  };

  const moveField = (fieldId, direction) => {
    const currentIndex = fields.findIndex(f => f.id === fieldId);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= fields.length) return;

    const newFields = [...fields];
    [newFields[currentIndex], newFields[newIndex]] = [newFields[newIndex], newFields[currentIndex]];
    onChange(newFields);
  };

  const updateFieldOptions = (fieldId, options) => {
    updateField(fieldId, { options) !== '') });
  };

  const renderFieldIcon = (type) => {
    const fieldType = FIELD_TYPES.find(t => t.value === type);
    if (!fieldType) return <const Icon = fieldType.icon;
    return <Icon className="h-4 w-4" />;
  };

  const renderFieldPreview = (field) => {
    const commonProps = {
      placeholder,
      required,
      disabled) {
      case 'text':
      case 'email':
      case 'url':
        return <Input {...commonProps} defaultValue={field.defaultValue} />;
      
      case 'textarea':
        return <Textarea {...commonProps} defaultValue={field.defaultValue} />;
      
      case 'number':
        return <Input type="number" {...commonProps} defaultValue={field.defaultValue} />;
      
      case 'date':
        return <Input type="date" {...commonProps} defaultValue={field.defaultValue} />;
      
      case 'time':
        return <Input type="time" {...commonProps} defaultValue={field.defaultValue} />;
      
      case 'datetime':
        return <Input type="datetime-local" {...commonProps} defaultValue={field.defaultValue} />;
      
      case 'checkbox':
        return (
          <div className="flex items-center space-x-2">
            <Checkbox defaultChecked={field.defaultValue} disabled />
            <label className="text-sm">{field.label}</label>
          </div>
        );
      
      case 'radio':
        return (
          <div className="space-y-2">
            {field.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <input 
                  type="radio" 
                  name={field.id} 
                  defaultChecked={field.defaultValue === option}
                  disabled 
                />
                <label className="text-sm">{option}</label>
              </div>
            ))}
          </div>
        );
      
      case 'select':
        return (
          <Select disabled>
            <SelectTrigger>
              <SelectValue placeholder="Selecione uma opção" />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option, index) => (
                <SelectItem key={index} value={option}>{option}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      
      case 'multiselect':
        return (
          <div className="space-y-2 p-2 border rounded">
            {field.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Checkbox disabled />
                <label className="text-sm">{option}</label>
              </div>
            ))}
          </div>
        );
      
      case 'file':
        return (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
            <FileUp className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500">Clique para enviar arquivo</p>
          </div>
        );
      
      case 'rating':
        return (
          <div className="flex space-x-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star 
                key={star} 
                className="h-5 w-5 text-gray-300 cursor-pointer" 
                fill={star <= (field.defaultValue || 0) ? 'currentColor' : 'none'}
              />
            ))}
          </div>
        );
      
      case 'slider':
        return (
          <div className="space-y-2">
            <input 
              type="range" 
              min={field.validation?.min || 0}
              max={field.validation?.max || 100}
              defaultValue={field.defaultValue || 50}
              disabled
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>{field.validation?.min || 0}</span>
              <span>{field.validation?.max || 100}</span>
            </div>
          </div>
        );
      
      default) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center space-x-2">
          <Eye className="h-5 w-5" />
          <span>Preview do Formulário</span>
        </h3>
        {fields.length === 0 ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Nenhum campo adicionado ainda. Use o construtor para criar campos.
            </AlertDescription>
          </Alert>
        ) {fields.map((field) => (
              <div key={field.id} className="space-y-2">
                <Label className="flex items-center space-x-2">
                  <span>{field.label}</span>
                  {field.required && <span className="text-red-500">*</span>}
                </Label>
                {renderFieldPreview(field)}
                {field.validation?.customMessage && (
                  <p className="text-xs text-gray-500">{field.validation.customMessage}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Add Field Buttons */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Plus className="h-5 w-5" />
            <span>Adicionar Campo</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md) => {
              const Icon = fieldType.icon;
              return (
                <Button
                  key={fieldType.value}
                  variant="outline"
                  size="sm"
                  onClick={() => addField(fieldType.value as TaskField['type'])}
                  className="justify-start h-auto p-3"
                >
                  <Icon className="h-4 w-4 mr-2" />
                  <span className="text-xs">{fieldType.label}</span>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Fields List */}
      <ScrollArea className="h-96">
        <div className="space-y-4">
          {fields.map((field, index) => (
            <Card key={field.id} className={editingField === field.id ? 'ring-2 ring-blue-500' : ''}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <GripVertical className="h-4 w-4 text-gray-400 cursor-move" />
                    {renderFieldIcon(field.type)}
                    <div>
                      <h4 className="font-medium">{field.label}</h4>
                      <p className="text-sm text-gray-500 capitalize">
                        {FIELD_TYPES.find(t => t.value === field.type)?.label}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {field.required && (
                      <Badge variant="secondary" className="text-xs">Obrigatório</Badge>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => moveField(field.id, 'up')}
                      disabled={index === 0}
                    >
                      ↑
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => moveField(field.id, 'down')}
                      disabled={index === fields.length - 1}
                    >
                      ↓
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingField(editingField === field.id ? null)}
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeField(field.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              {editingField === field.id && (
                <CardContent className="space-y-4">
                  <Separator />
                  
                  {/* Basic Settings */}
                  <div className="grid grid-cols-1 md) => updateField(field.id, { label)}
                        placeholder="Digite o rótulo"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Placeholder</Label>
                      <Input
                        value={field.placeholder || ''}
                        onChange={(e) => updateField(field.id, { placeholder)}
                        placeholder="Texto de exemplo"
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={field.required}
                      onCheckedChange={(checked) => updateField(field.id, { required)}
                    />
                    <Label>Campo obrigatório</Label>
                  </div>

                  {/* Options for select/radio/multiselect */}
                  {['radio', 'select', 'multiselect'].includes(field.type) && (
                    <div className="space-y-2">
                      <Label>Opções</Label>
                      <div className="space-y-2">
                        {field.options?.map((option, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <Input
                              value={option}
                              onChange={(e) => {
                                const newOptions = [...(field.options || [])];
                                newOptions[index] = e.target.value;
                                updateFieldOptions(field.id, newOptions);
                              }}
                              placeholder={`Opção ${index + 1}`}
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const newOptions = field.options?.filter((_, i) => i !== index) || [];
                                updateFieldOptions(field.id, newOptions);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const newOptions = [...(field.options || []), `Opção ${(field.options?.length || 0) + 1}`];
                            updateFieldOptions(field.id, newOptions);
                          }}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Adicionar Opção
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Advanced Settings */}
                  <div className="space-y-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowAdvanced({
                        ...showAdvanced,
                        [field.id]: !showAdvanced[field.id]
                      })}
                    >
                      Configurações Avançadas {showAdvanced[field.id] ? '▼' : '▶'}
                    </Button>

                    {showAdvanced[field.id] && (
                      <div className="space-y-4 pl-4 border-l-2 border-gray-200">
                        {/* Validation */}
                        {['text', 'textarea', 'number', 'slider'].includes(field.type) && (
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Valor Mínimo</Label>
                              <Input
                                type="number"
                                value={field.validation?.min || ''}
                                onChange={(e) => updateField(field.id, {
                                  validation,
                                    min) {field.validation?.max || ''}
                                onChange={(e) => updateField(field.id, {
                                  validation,
                                    max) {field.validation?.pattern || ''}
                            onChange={(e) => updateField(field.id, {
                              validation,
                                pattern)}
                            placeholder="Ex) => updateField(field.id, {
                              validation,
                                customMessage)}
                            placeholder="Mensagem quando validação falhar"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Valor Padrão</Label>
                          <Input
                            value={field.defaultValue || ''}
                            onChange={(e) => updateField(field.id, { defaultValue)}
                            placeholder="Valor inicial do campo"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Preview */}
                  <div className="space-y-2">
                    <Label>Preview</Label>
                    <div className="p-3 border rounded-lg bg-gray-50">
                      {renderFieldPreview(field)}
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          ))}

          {fields.length === 0 && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Nenhum campo foi adicionado ainda. Use os botões acima para adicionar campos ao seu formulário.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}