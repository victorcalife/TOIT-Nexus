/**
 * EVENT DIALOG COMPONENT
 * Diálogo para criar e editar eventos do calendário
 */

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Bell, 
  Repeat, 
  Trash2, 
  Save,
  AlertTriangle,
  Video,
  Phone,
  Mail
} from 'lucide-react';

const EventDialog = ({ 
  isOpen, 
  onClose, 
  eventForm, 
  setEventForm, 
  onSave, 
  onDelete, 
  isCreateMode, 
  eventCategories 
}) => {
  
  // Atualizar campo do formulário
  const updateField = (field, value) => {
    setEventForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Validar formulário
  const isFormValid = () => {
    return eventForm.title.trim() !== '' && 
           eventForm.startDate !== '' && 
           eventForm.startTime !== '' && 
           eventForm.endTime !== '';
  };

  // Opções de prioridade
  const priorityOptions = {
    low: { label: 'Baixa', color: 'bg-green-100 text-green-800' },
    medium: { label: 'Média', color: 'bg-yellow-100 text-yellow-800' },
    high: { label: 'Alta', color: 'bg-red-100 text-red-800' }
  };

  // Opções de recorrência
  const recurringOptions = {
    daily: 'Diariamente',
    weekly: 'Semanalmente',
    monthly: 'Mensalmente',
    yearly: 'Anualmente'
  };

  // Opções de lembrete
  const reminderOptions = {
    0: 'No momento',
    5: '5 minutos antes',
    15: '15 minutos antes',
    30: '30 minutos antes',
    60: '1 hora antes',
    1440: '1 dia antes'
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>{isCreateMode ? 'Criar Novo Evento' : 'Editar Evento'}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações Básicas */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="title" className="text-sm font-medium">
                Título do Evento *
              </Label>
              <Input
                id="title"
                value={eventForm.title}
                onChange={(e) => updateField('title', e.target.value)}
                placeholder="Digite o título do evento"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="description" className="text-sm font-medium">
                Descrição
              </Label>
              <Textarea
                id="description"
                value={eventForm.description}
                onChange={(e) => updateField('description', e.target.value)}
                placeholder="Adicione uma descrição (opcional)"
                rows={3}
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category" className="text-sm font-medium">
                  Categoria
                </Label>
                <Select value={eventForm.category} onValueChange={(value) => updateField('category', value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Selecione a categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(eventCategories).map(([key, category]) => {
                      const Icon = category.icon;
                      return (
                        <SelectItem key={key} value={key}>
                          <div className="flex items-center space-x-2">
                            <Icon className="h-4 w-4" />
                            <span>{category.label}</span>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="priority" className="text-sm font-medium">
                  Prioridade
                </Label>
                <Select value={eventForm.priority} onValueChange={(value) => updateField('priority', value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Selecione a prioridade" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(priorityOptions).map(([key, option]) => (
                      <SelectItem key={key} value={key}>
                        <Badge className={option.color} variant="secondary">
                          {option.label}
                        </Badge>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Separator />

          {/* Data e Horário */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>Data e Horário</span>
            </h3>

            <div className="flex items-center space-x-2">
              <Switch
                id="allDay"
                checked={eventForm.isAllDay}
                onCheckedChange={(checked) => updateField('isAllDay', checked)}
              />
              <Label htmlFor="allDay" className="text-sm">
                Evento de dia inteiro
              </Label>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate" className="text-sm font-medium">
                  Data de Início *
                </Label>
                <Input
                  id="startDate"
                  type="date"
                  value={eventForm.startDate}
                  onChange={(e) => updateField('startDate', e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="endDate" className="text-sm font-medium">
                  Data de Término
                </Label>
                <Input
                  id="endDate"
                  type="date"
                  value={eventForm.endDate}
                  onChange={(e) => updateField('endDate', e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>

            {!eventForm.isAllDay && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startTime" className="text-sm font-medium">
                    Horário de Início *
                  </Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={eventForm.startTime}
                    onChange={(e) => updateField('startTime', e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="endTime" className="text-sm font-medium">
                    Horário de Término *
                  </Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={eventForm.endTime}
                    onChange={(e) => updateField('endTime', e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Localização e Participantes */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center space-x-2">
              <MapPin className="h-5 w-5" />
              <span>Localização e Participantes</span>
            </h3>

            <div>
              <Label htmlFor="location" className="text-sm font-medium">
                Local
              </Label>
              <Input
                id="location"
                value={eventForm.location}
                onChange={(e) => updateField('location', e.target.value)}
                placeholder="Sala de reuniões, endereço ou link online"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="attendees" className="text-sm font-medium">
                Participantes
              </Label>
              <Input
                id="attendees"
                value={eventForm.attendees}
                onChange={(e) => updateField('attendees', e.target.value)}
                placeholder="Nome dos participantes (separados por vírgula)"
                className="mt-1"
              />
            </div>
          </div>

          <Separator />

          {/* Configurações Avançadas */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center space-x-2">
              <Bell className="h-5 w-5" />
              <span>Configurações Avançadas</span>
            </h3>

            <div>
              <Label htmlFor="reminder" className="text-sm font-medium">
                Lembrete
              </Label>
              <Select 
                value={eventForm.reminderMinutes.toString()} 
                onValueChange={(value) => updateField('reminderMinutes', parseInt(value))}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Selecione o lembrete" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(reminderOptions).map(([minutes, label]) => (
                    <SelectItem key={minutes} value={minutes}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id="recurring"
                  checked={eventForm.isRecurring}
                  onCheckedChange={(checked) => updateField('isRecurring', checked)}
                />
                <Label htmlFor="recurring" className="text-sm">
                  Evento recorrente
                </Label>
              </div>

              {eventForm.isRecurring && (
                <div>
                  <Label htmlFor="recurringType" className="text-sm font-medium">
                    Frequência
                  </Label>
                  <Select 
                    value={eventForm.recurringType} 
                    onValueChange={(value) => updateField('recurringType', value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Selecione a frequência" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(recurringOptions).map(([key, label]) => (
                        <SelectItem key={key} value={key}>
                          <div className="flex items-center space-x-2">
                            <Repeat className="h-4 w-4" />
                            <span>{label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </div>

          {/* Ações Rápidas */}
          <div className="grid grid-cols-3 gap-2">
            <Button variant="outline" size="sm" className="flex items-center space-x-1">
              <Video className="h-4 w-4" />
              <span>Adicionar Chamada</span>
            </Button>
            <Button variant="outline" size="sm" className="flex items-center space-x-1">
              <Phone className="h-4 w-4" />
              <span>Adicionar Telefone</span>
            </Button>
            <Button variant="outline" size="sm" className="flex items-center space-x-1">
              <Mail className="h-4 w-4" />
              <span>Enviar Convite</span>
            </Button>
          </div>
        </div>

        <DialogFooter className="flex items-center justify-between">
          <div>
            {!isCreateMode && onDelete && (
              <Button
                variant="destructive"
                onClick={onDelete}
                className="flex items-center space-x-1"
              >
                <Trash2 className="h-4 w-4" />
                <span>Excluir</span>
              </Button>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button 
              onClick={onSave} 
              disabled={!isFormValid()}
              className="flex items-center space-x-1"
            >
              <Save className="h-4 w-4" />
              <span>{isCreateMode ? 'Criar Evento' : 'Salvar Alterações'}</span>
            </Button>
          </div>
        </DialogFooter>

        {/* Validação */}
        {!isFormValid() && (
          <div className="flex items-center space-x-2 text-sm text-red-600 bg-red-50 p-3 rounded-md">
            <AlertTriangle className="h-4 w-4" />
            <span>Preencha todos os campos obrigatórios (*)</span>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EventDialog;
