import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { TaskField } from '@/components/task-field-builder';
import {   }
} from 'lucide-react';

) {
  const [responses, setResponses] = useState<Record<string, any>>(task.responses || {});
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [newComment, setNewComment] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);

  // Calculate progress
  const requiredFields = template.fields.filter(field => field.required);
  const completedRequiredFields = requiredFields.filter(field => 
    responses[field.id] !== undefined && responses[field.id] !== '' && responses[field.id] !== null
  );
  const progress = requiredFields.length > 0 ? (completedRequiredFields.length / requiredFields.length) * 100 : 100;

  useEffect(() => {
    setResponses(task.responses || {});
  }, [task.responses]);

  const validateField = (field, value)=> {
    // Check required fields
    if (field.required && (value === undefined || value === null || value === '')) {
      return `${field.label} é obrigatório`;
    }

    if (value === undefined || value === null || value === '') {
      return null; // Skip validation for empty optional fields
    }

    // Type-specific validation
    switch (field.type) {
      case 'email':
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {`
          return `${field.label} deve ser um email válido`;
        }
        break;
      
      case 'url':
        try {
          new URL(value);
        } catch (error) {`
          return `${field.label} deve ser uma URL válida`;
        }
        break;
      
      case 'number':
        if (isNaN(Number(value))) {`
          return `${field.label} deve ser um número`;
        }
        if (field.validation?.min !== undefined && Number(value) < field.validation.min) {`
          return `${field.label} deve ser maior que ${field.validation.min}`;
        }
        if (field.validation?.max !== undefined && Number(value) > field.validation.max) {`
          return `${field.label} deve ser menor que ${field.validation.max}`;
        }
        break;
      
      case 'select':
      case 'radio':
        if (field.options && !field.options.includes(value)) {`
          return `Valor inválido para ${field.label}`;
        }
        break;
      
      case 'multiselect':
        if (field.options && Array.isArray(value)) {
          for (const item of value) {
            if (!field.options.includes(item)) {`
              return `Valor inválido para ${field.label}: ${item}`;
            }
          }
        }
        break;
    }

    // Regex validation
    if (field.validation?.pattern && typeof value === 'string') {
      const regex = new RegExp(field.validation.pattern);
      if (!regex.test(value)) {`
        return field.validation.customMessage || `Formato inválido para ${field.label}`;
      }
    }

    return null;
  };

  const handleFieldChange = (fieldId, value) => {
    if (isReadOnly) return;
    
    const newResponses = { ...responses, [fieldId]: value };
    setResponses(newResponses);

    // Clear validation error for this field
    if (validationErrors[fieldId]) {
      setValidationErrors({ ...validationErrors, [fieldId]: '' });
    }
  };

  const handleSave = async () => {
    if (isReadOnly || isSaving) return;

    setIsSaving(true);
    try {
      await onSave(responses);
    } finally {
      setIsSaving(false);
    }
  };

  const handleComplete = async () => {
    if (isReadOnly || isCompleting) return;

    // Validate all fields
    const errors, string> = {};
    
    for (const field of template.fields) {
      const error = validateField(field, responses[field.id]);
      if (error) {
        errors[field.id] = error;
      }
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    setIsCompleting(true);
    try {
      await onComplete(responses);
    } finally {
      setIsCompleting(false);
    }
  };

  const handleAddComment = () => {
    if (!newComment.trim() || isReadOnly) return;
    
    onAddComment(newComment.trim());
    setNewComment('');
  };

  const shouldShowField = (field)=> {
    if (!field.conditionalLogic?.showIf) {
      return true;
    }

    const condition = field.conditionalLogic.showIf;
    const fieldValue = responses[condition.fieldId];

    switch (condition.operator) ({ case 'equals':
        return fieldValue === condition.value;
      case 'not_equals':
        return fieldValue !== condition.value;
      case 'contains':
        return String(fieldValue || '').includes(String(condition.value));
      case 'greater_than':
        return Number(fieldValue || 0) > Number(condition.value);
      case 'less_than':
        return Number(fieldValue || 0) < Number(condition.value);
      default }) => {
    if (!shouldShowField(field)) {
      return null;
    }

    const hasError = validationErrors[field.id];
    const value = responses[field.id];

    const commonProps = {
      disabled,
      required) {
      case 'text':
      case 'email':
      case 'url':
        fieldElement = (
          <Input
            {...commonProps}
            type={field.type === 'text' ? 'text' : field.type}
            value={value || ''}
            onChange=({ (e }) => handleFieldChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            className={hasError ? 'border-red-500' : ''}
          />
        );
        break;
      
      case 'textarea':
        fieldElement = (
          <Textarea
            {...commonProps}
            value={value || ''}
            onChange=({ (e }) => handleFieldChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            className={hasError ? 'border-red-500' : ''}
            rows={3}
          />
        );
        break;
      
      case 'number':
        fieldElement = (
          <Input
            {...commonProps}
            type="number"
            value={value || ''}
            onChange=({ (e }) => handleFieldChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            min={field.validation?.min}
            max={field.validation?.max}
            className={hasError ? 'border-red-500' : ''}
          />
        );
        break;
      
      case 'date':
        fieldElement = (
          <Input
            {...commonProps}
            type="date"
            value={value || ''}
            onChange=({ (e }) => handleFieldChange(field.id, e.target.value)}
            className={hasError ? 'border-red-500' : ''}
          />
        );
        break;
      
      case 'time':
        fieldElement = (
          <Input
            {...commonProps}
            type="time"
            value={value || ''}
            onChange=({ (e }) => handleFieldChange(field.id, e.target.value)}
            className={hasError ? 'border-red-500' : ''}
          />
        );
        break;
      
      case 'datetime':
        fieldElement = (
          <Input
            {...commonProps}
            type="datetime-local"
            value={value || ''}
            onChange=({ (e }) => handleFieldChange(field.id, e.target.value)}
            className={hasError ? 'border-red-500' : ''}
          />
        );
        break;
      
      case 'checkbox':
        fieldElement = (
          <div className="flex items-center space-x-2">
            <Checkbox
              checked={!!value}
              onCheckedChange=({ (checked }) => handleFieldChange(field.id, checked)}
              disabled={isReadOnly}
            />
            <Label className="text-sm">{field.label}</Label>
          </div>
        );
        break;
      
      case 'radio':
        fieldElement = (
          <div className="space-y-2">
            ({ field.options?.map((option, index }) => (
              <div key={index} className="flex items-center space-x-2">
                <input
                  type="radio"
                  name={field.id}
                  value={option}
                  checked={value === option}
                  onChange=({ (e }) => handleFieldChange(field.id, e.target.value)}
                  disabled={isReadOnly}
                />
                <label className="text-sm">{option}</label>
              </div>
            ))}
          </div>
        );
        break;
      
      case 'select':
        fieldElement = (
          <Select
            value={value || ''}
            onValueChange=({ (newValue }) => handleFieldChange(field.id, newValue)}
            disabled={isReadOnly}
          >
            <SelectTrigger className={hasError ? 'border-red-500' : ''}>
              <SelectValue placeholder={field.placeholder || 'Selecione uma opção'} />
            </SelectTrigger>
            <SelectContent>
              ({ field.options?.map((option, index }) => (
                <SelectItem key={index} value={option}>{option}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
        break;
      
      case 'multiselect':
        fieldElement = (
          <div className="space-y-2 p-2 border rounded">
            ({ field.options?.map((option, index }) => (
              <div key={index} className="flex items-center space-x-2">
                <Checkbox
                  checked={Array.isArray(value) && value.includes(option)}
                  onCheckedChange=({ (checked }) => {
                    const currentValues = Array.isArray(value) ? value, option]
                      : currentValues.filter(v => v !== option);
                    handleFieldChange(field.id, newValues);
                  }}
                  disabled={isReadOnly}
                />
                <label className="text-sm">{option}</label>
              </div>
            ))}
          </div>
        );
        break;
      
      case 'file':
        fieldElement = (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
            <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500">`
              ({ value ? `Arquivo }) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handleFieldChange(field.id, file.name);
                  }
                }}
                className="hidden"
              />
            )}
          </div>
        );
        break;
      
      case 'rating':
        fieldElement = (
          <div className="flex space-x-1">
            ({ [1, 2, 3, 4, 5].map((star }) => (
              <Star
                key={star}`
                className={`h-5 w-5 cursor-pointer ${
                  star <= (value || 0) ? 'text-yellow-500 fill-current' : 'text-gray-300'`}
                }`}
                onClick=({ ( }) => !isReadOnly && handleFieldChange(field.id, star)}
              />
            ))}
          </div>
        );
        break;
      
      case 'slider':
        fieldElement = (
          <div className="space-y-2">
            <input
              type="range"
              min={field.validation?.min || 0}
              max={field.validation?.max || 100}
              value={value || field.validation?.min || 0}
              onChange=({ (e }) => handleFieldChange(field.id, Number(e.target.value))}
              disabled={isReadOnly}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>{field.validation?.min || 0}</span>
              <span className="font-medium">{value || 0}</span>
              <span>{field.validation?.max || 100}</span>
            </div>
          </div>
        );
        break;
      
      default) => handleFieldChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            className={hasError ? 'border-red-500' : ''}
          />
        );
    }

    return (
      <div key={field.id} className="space-y-2">
        {field.};

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default);

  return (
    <div className="space-y-6">
      {/* Task Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <CardTitle className="flex items-center space-x-2">
                <span>{task.title}</span>`
                <Badge className={`${getPriorityColor(task.priority)} text-white`}>
                  {task.priority}
                </Badge>
              </CardTitle>
              <p className="text-gray-600">{task.description}</p>
            </div>
            <div className="text-right space-y-1">
              {task.dueDate && (
                <div className="flex items-center space-x-1 text-sm text-gray-500">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                </div>
              )}
              <div className="flex items-center space-x-1 text-sm text-gray-500">
                <Clock className="h-4 w-4" />
                <span>{template.estimatedDuration}min</span>
              </div>
              <div className="flex items-center space-x-1 text-sm text-gray-500">
                <User className="h-4 w-4" />
                <span>{task.assignedTo}</span>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Progress */}
      {showProgress && (
        <Card>
          <CardContent className="p-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Progresso</span>
                <span className="text-sm text-gray-500">
                  {completedRequiredFields.length} de {requiredFields.length} campos obrigatórios
                </span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Form Fields */}
      <Card>
        <CardHeader>
          <CardTitle>Formulário</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {visibleFields.length === 0 ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Nenhum campo para preencher neste formulário.
              </AlertDescription>
            </Alert>
          ) {/* Actions */}
      {!isReadOnly && task.status !== 'completed' && (
        <Card>
          <CardContent className="p-4">
            <div className="flex space-x-2">
              <Button
                onClick={handleSave}
                disabled={isSaving}
                variant="outline"
              >
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? 'Salvando...' : 'Salvar Progresso'}
              </Button>
              <Button
                onClick={handleComplete}
                disabled={isCompleting || progress < 100}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                {isCompleting ? 'Finalizando...' : 'Concluir Tarefa'}
              </Button>
            </div>
            {progress < 100 && (
              <p className="text-sm text-gray-500 mt-2">
                Complete todos os campos obrigatórios para finalizar a tarefa
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Comments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MessageSquare className="h-5 w-5" />
            <span>Comentários ({task.comments.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add Comment */}
          {!isReadOnly && (
            <div className="space-y-2">
              <Textarea
                value={newComment}
                onChange=({ (e }) => setNewComment(e.target.value)}
                placeholder="Adicione um comentário..."
                rows={2}
              />
              <Button
                size="sm"
                onClick={handleAddComment}
                disabled={!newComment.trim()}
              >
                Adicionar Comentário
              </Button>
            </div>
          )}

          <Separator />

          {/* Comments List */}
          <ScrollArea className="h-48">
            ({ task.comments.length === 0 ? (
              <p className="text-gray-500 text-sm">Nenhum comentário ainda.</p>
            ) {task.comments.map((comment }) => (
                  <div key={comment.id} className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-sm">{comment.userName}</span>
                      <span className="text-xs text-gray-500">
                        {new Date(comment.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">{comment.message}</p>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}`