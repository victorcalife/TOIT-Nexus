/**
 * PROFESSIONAL CALENDAR UI
 * Interface moderna e profissional de calendário
 * Múltiplas visualizações, drag-and-drop, sincronização
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Calendar, 
  Clock, 
  Plus, 
  ChevronLeft, 
  ChevronRight, 
  Grid3X3, 
  List, 
  Users, 
  Video,
  MapPin,
  Bell,
  Repeat,
  Trash2,
  Edit,
  Eye,
  Filter,
  Search,
  Download,
  Share2,
  Settings,
  Sync,
  AlertCircle,
  CheckCircle,
  Star,
  MoreHorizontal
} from 'lucide-react';
import { format, addDays, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isSameDay, isSameMonth, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const ProfessionalCalendarUI = ({ tenantId, userId, userRole }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('month');
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
  const [isCreateMode, setIsCreateMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [draggedEvent, setDraggedEvent] = useState(null);
  const [syncStatus, setSyncStatus] = useState('synced');

  // Categorias de eventos
  const eventCategories = {
    meeting: { label: 'Reunião', color: 'bg-blue-500', textColor: 'text-white' },
    task: { label: 'Tarefa', color: 'bg-green-500', textColor: 'text-white' },
    call: { label: 'Chamada', color: 'bg-purple-500', textColor: 'text-white' },
    appointment: { label: 'Compromisso', color: 'bg-orange-500', textColor: 'text-white' },
    deadline: { label: 'Prazo', color: 'bg-red-500', textColor: 'text-white' },
    personal: { label: 'Pessoal', color: 'bg-gray-500', textColor: 'text-white' },
    holiday: { label: 'Feriado', color: 'bg-pink-500', textColor: 'text-white' }
  };

  // Carregar eventos
  useEffect(() => {
    loadEvents();
  }, [currentDate, viewMode, tenantId, userId]);

  const loadEvents = async () => {
    setIsLoading(true);
    try {
      // Simular carregamento de eventos
      const mockEvents = generateMockEvents();
      setEvents(mockEvents);
      setSyncStatus('synced');
    } catch (error) {
      console.error('Erro ao carregar eventos:', error);
      setSyncStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  // Gerar eventos mock
  const generateMockEvents = () => {
    const today = new Date();
    return [
      {
        id: '1',
        title: 'Reunião de Planejamento Estratégico',
        description: 'Planejamento estratégico Q4 2025',
        startDate: format(today, 'yyyy-MM-dd'),
        startTime: '09:00',
        endTime: '10:30',
        category: 'meeting',
        priority: 'high',
        location: 'Sala de Reuniões A',
        attendees: ['João Silva', 'Maria Santos', 'Pedro Costa'],
        isAllDay: false,
        isRecurring: false,
        reminderMinutes: 15,
        status: 'confirmed'
      },
      {
        id: '2',
        title: 'Apresentação para Cliente ABC',
        description: 'Apresentação da proposta comercial',
        startDate: format(addDays(today, 1), 'yyyy-MM-dd'),
        startTime: '14:00',
        endTime: '15:30',
        category: 'appointment',
        priority: 'high',
        location: 'Online - Teams',
        attendees: ['Cliente ABC', 'Equipe Comercial'],
        isAllDay: false,
        isRecurring: false,
        reminderMinutes: 30,
        status: 'confirmed'
      },
      {
        id: '3',
        title: 'Entrega do Projeto X',
        description: 'Deadline final do projeto X',
        startDate: format(addDays(today, 3), 'yyyy-MM-dd'),
        startTime: '18:00',
        endTime: '18:00',
        category: 'deadline',
        priority: 'high',
        location: '',
        attendees: [],
        isAllDay: false,
        isRecurring: false,
        reminderMinutes: 60,
        status: 'pending'
      },
      {
        id: '4',
        title: 'Chamada com Fornecedor',
        description: 'Negociação de contrato',
        startDate: format(addDays(today, 2), 'yyyy-MM-dd'),
        startTime: '11:00',
        endTime: '12:00',
        category: 'call',
        priority: 'medium',
        location: 'Telefone',
        attendees: ['Fornecedor XYZ'],
        isAllDay: false,
        isRecurring: true,
        reminderMinutes: 15,
        status: 'confirmed'
      },
      {
        id: '5',
        title: 'Feriado Nacional',
        description: 'Independência do Brasil',
        startDate: '2025-09-07',
        startTime: '00:00',
        endTime: '23:59',
        category: 'holiday',
        priority: 'low',
        location: '',
        attendees: [],
        isAllDay: true,
        isRecurring: true,
        reminderMinutes: 0,
        status: 'confirmed'
      }
    ];
  };

  // Navegação do calendário
  const navigateCalendar = (direction) => {
    const amount = viewMode === 'day' ? 1 : viewMode === 'week' ? 7 : 30;
    const newDate = direction === 'prev' 
      ? subDays(currentDate, amount)
      : addDays(currentDate, amount);
    setCurrentDate(newDate);
  };

  // Filtrar eventos
  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || event.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  // Criar novo evento
  const handleCreateEvent = () => {
    setIsCreateMode(true);
    setSelectedEvent(null);
    setIsEventDialogOpen(true);
  };

  // Editar evento
  const handleEditEvent = (event) => {
    setIsCreateMode(false);
    setSelectedEvent(event);
    setIsEventDialogOpen(true);
  };

  // Drag and Drop
  const handleDragStart = (event, eventData) => {
    setDraggedEvent(eventData);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleDrop = (event, newDate) => {
    event.preventDefault();
    if (draggedEvent) {
      setEvents(events.map(evt => 
        evt.id === draggedEvent.id 
          ? { ...evt, startDate: format(newDate, 'yyyy-MM-dd') }
          : evt
      ));
      setDraggedEvent(null);
    }
  };

  // Sincronizar calendário
  const handleSync = async () => {
    setSyncStatus('syncing');
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      await loadEvents();
      setSyncStatus('synced');
    } catch (error) {
      setSyncStatus('error');
    }
  };

  // Renderizar cabeçalho
  const renderHeader = () => (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center space-x-4">
        <h2 className="text-3xl font-bold text-slate-800">
          {format(currentDate, 'MMMM yyyy', { locale: ptBR })}
        </h2>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateCalendar('prev')}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentDate(new Date())}
          >
            Hoje
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateCalendar('next')}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Status de sincronização */}
        <div className="flex items-center space-x-2">
          {syncStatus === 'synced' && (
            <Badge variant="outline" className="text-green-600 border-green-600">
              <CheckCircle className="h-3 w-3 mr-1" />
              Sincronizado
            </Badge>
          )}
          {syncStatus === 'syncing' && (
            <Badge variant="outline" className="text-blue-600 border-blue-600">
              <Sync className="h-3 w-3 mr-1 animate-spin" />
              Sincronizando...
            </Badge>
          )}
          {syncStatus === 'error' && (
            <Badge variant="outline" className="text-red-600 border-red-600">
              <AlertCircle className="h-3 w-3 mr-1" />
              Erro na sincronização
            </Badge>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-3">
        {/* Busca */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Buscar eventos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-64"
          />
        </div>

        {/* Filtro por categoria */}
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-40">
            <Filter className="h-4 w-4 mr-1" />
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            {Object.entries(eventCategories).map(([key, category]) => (
              <SelectItem key={key} value={key}>
                {category.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Modos de visualização */}
        <div className="flex items-center bg-slate-100 rounded-lg p-1">
          {[
            { mode: 'month', icon: Grid3X3, label: 'Mês' },
            { mode: 'week', icon: Calendar, label: 'Semana' },
            { mode: 'day', icon: Clock, label: 'Dia' },
            { mode: 'agenda', icon: List, label: 'Agenda' }
          ].map(({ mode, icon: Icon, label }) => (
            <Button
              key={mode}
              variant={viewMode === mode ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode(mode)}
              className="h-8"
            >
              <Icon className="h-4 w-4 mr-1" />
              {label}
            </Button>
          ))}
        </div>

        {/* Ações */}
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={handleSync}>
            <Sync className="h-4 w-4 mr-1" />
            Sincronizar
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-1" />
            Exportar
          </Button>
          <Button variant="outline" size="sm">
            <Share2 className="h-4 w-4 mr-1" />
            Compartilhar
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-1" />
            Configurações
          </Button>
          <Button onClick={handleCreateEvent}>
            <Plus className="h-4 w-4 mr-1" />
            Novo Evento
          </Button>
        </div>
      </div>
    </div>
  );

  // Renderizar evento
  const renderEvent = (event) => {
    const category = eventCategories[event.category];
    const Icon = category === eventCategories.meeting ? Users :
                category === eventCategories.call ? Video :
                category === eventCategories.deadline ? AlertCircle :
                category === eventCategories.task ? CheckCircle :
                category === eventCategories.personal ? Star : Calendar;

    return (
      <div
        key={event.id}
        draggable
        onDragStart={(e) => handleDragStart(e, event)}
        onClick={() => handleEditEvent(event)}
        className={`
          ${category.color} ${category.textColor} p-2 rounded-md mb-1 cursor-pointer
          hover:opacity-90 transition-all duration-200 shadow-sm hover:shadow-md
          text-xs font-medium border-l-4 border-white/30
        `}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1 flex-1 min-w-0">
            <Icon className="h-3 w-3 flex-shrink-0" />
            <span className="truncate">{event.title}</span>
          </div>
          {event.priority === 'high' && (
            <div className="w-2 h-2 bg-white rounded-full flex-shrink-0 ml-1"></div>
          )}
        </div>
        
        {!event.isAllDay && (
          <div className="text-xs opacity-90 mt-1">
            {event.startTime} - {event.endTime}
          </div>
        )}
        
        {event.location && (
          <div className="flex items-center text-xs opacity-80 mt-1">
            <MapPin className="h-2 w-2 mr-1" />
            <span className="truncate">{event.location}</span>
          </div>
        )}
        
        {event.isRecurring && (
          <div className="flex items-center text-xs opacity-80 mt-1">
            <Repeat className="h-2 w-2 mr-1" />
            <span>Recorrente</span>
          </div>
        )}
        
        {event.attendees && event.attendees.length > 0 && (
          <div className="flex items-center text-xs opacity-80 mt-1">
            <Users className="h-2 w-2 mr-1" />
            <span>{event.attendees.length} participante(s)</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      {renderHeader()}

      {/* Calendário Principal */}
      <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
        <CardContent className="p-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <Sync className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-500" />
                <p className="text-slate-600">Carregando eventos...</p>
              </div>
            </div>
          ) : (
            <>
              {viewMode === 'month' && (
                <MonthView 
                  currentDate={currentDate}
                  events={filteredEvents}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  renderEvent={renderEvent}
                  eventCategories={eventCategories}
                />
              )}
              {viewMode === 'week' && (
                <WeekView 
                  currentDate={currentDate}
                  events={filteredEvents}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  renderEvent={renderEvent}
                />
              )}
              {viewMode === 'day' && (
                <DayView 
                  currentDate={currentDate}
                  events={filteredEvents}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  renderEvent={renderEvent}
                />
              )}
              {viewMode === 'agenda' && (
                <AgendaView 
                  events={filteredEvents}
                  renderEvent={renderEvent}
                  eventCategories={eventCategories}
                />
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Estatísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Eventos Hoje</p>
                <p className="text-2xl font-bold">
                  {filteredEvents.filter(e => isSameDay(new Date(e.startDate), new Date())).length}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Esta Semana</p>
                <p className="text-2xl font-bold">
                  {filteredEvents.filter(e => {
                    const eventDate = new Date(e.startDate);
                    const weekStart = startOfWeek(new Date());
                    const weekEnd = endOfWeek(new Date());
                    return eventDate >= weekStart && eventDate <= weekEnd;
                  }).length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Reuniões</p>
                <p className="text-2xl font-bold">
                  {filteredEvents.filter(e => e.category === 'meeting').length}
                </p>
              </div>
              <Users className="h-8 w-8 text-purple-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm">Prazos</p>
                <p className="text-2xl font-bold">
                  {filteredEvents.filter(e => e.category === 'deadline').length}
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-orange-200" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfessionalCalendarUI;
