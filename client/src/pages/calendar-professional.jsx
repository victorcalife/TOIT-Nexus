/**
 * CALENDÁRIO PROFISSIONAL - TOIT NEXUS
 * Sistema completo de calendário com drag & drop e integrações
 * 100% JavaScript - SEM TYPESCRIPT
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight,
  Plus,
  Edit,
  Trash2,
  Clock,
  MapPin,
  Users,
  Video,
  Phone,
  Mail,
  Bell,
  Repeat,
  ExternalLink,
  Download,
  Upload,
  Settings,
  Filter,
  Search,
  Eye,
  EyeOff,
  Star,
  AlertCircle,
  CheckCircle,
  XCircle,
  MoreHorizontal
} from 'lucide-react';

const CalendarProfessional = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState('month'); // month, week, day, agenda
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [draggedEvent, setDraggedEvent] = useState(null);
  const [calendars, setCalendars] = useState([]);
  const [visibleCalendars, setVisibleCalendars] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const { toast } = useToast();

  // Formulário de evento
  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    location: '',
    attendees: [],
    calendar: 'default',
    reminder: '15',
    repeat: 'none',
    color: '#3B82F6',
    isAllDay: false,
    meetingType: 'none', // none, video, phone
    meetingUrl: '',
    priority: 'medium'
  });

  /**
   * CARREGAR EVENTOS
   */
  const loadEvents = async () => {
    setLoading(true);
    try {
      const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      
      const response = await fetch(`/api/calendar/events?start=${startDate.toISOString()}&end=${endDate.toISOString()}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao carregar eventos');
      }

      const data = await response.json();
      setEvents(data.events || []);
    } catch (error) {
      console.error('Erro ao carregar eventos:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os eventos",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * CARREGAR CALENDÁRIOS
   */
  const loadCalendars = async () => {
    try {
      const response = await fetch('/api/calendar/calendars', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao carregar calendários');
      }

      const data = await response.json();
      setCalendars(data.calendars || []);
      setVisibleCalendars(new Set(data.calendars.map(cal => cal.id)));
    } catch (error) {
      console.error('Erro ao carregar calendários:', error);
    }
  };

  /**
   * CRIAR EVENTO
   */
  const createEvent = async () => {
    try {
      const eventData = {
        ...eventForm,
        startDateTime: `${eventForm.startDate}T${eventForm.startTime}`,
        endDateTime: `${eventForm.endDate}T${eventForm.endTime}`,
        attendees: eventForm.attendees.map(email => ({ email }))
      };

      const response = await fetch('/api/calendar/events', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(eventData)
      });

      if (!response.ok) {
        throw new Error('Erro ao criar evento');
      }

      const data = await response.json();
      setEvents(prev => [...prev, data.event]);
      setShowCreateModal(false);
      resetEventForm();
      
      toast({
        title: "Evento criado",
        description: "Evento criado com sucesso",
      });
    } catch (error) {
      console.error('Erro ao criar evento:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar o evento",
        variant: "destructive"
      });
    }
  };

  /**
   * ATUALIZAR EVENTO
   */
  const updateEvent = async (eventId, updates) => {
    try {
      const response = await fetch(`/api/calendar/events/${eventId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        throw new Error('Erro ao atualizar evento');
      }

      const data = await response.json();
      setEvents(prev => prev.map(event => 
        event.id === eventId ? data.event : event
      ));
      
      toast({
        title: "Evento atualizado",
        description: "Evento atualizado com sucesso",
      });
    } catch (error) {
      console.error('Erro ao atualizar evento:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o evento",
        variant: "destructive"
      });
    }
  };

  /**
   * DELETAR EVENTO
   */
  const deleteEvent = async (eventId) => {
    if (!confirm('Tem certeza que deseja deletar este evento?')) return;

    try {
      const response = await fetch(`/api/calendar/events/${eventId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao deletar evento');
      }

      setEvents(prev => prev.filter(event => event.id !== eventId));
      setSelectedEvent(null);
      setShowEventModal(false);
      
      toast({
        title: "Evento deletado",
        description: "Evento removido com sucesso",
      });
    } catch (error) {
      console.error('Erro ao deletar evento:', error);
      toast({
        title: "Erro",
        description: "Não foi possível deletar o evento",
        variant: "destructive"
      });
    }
  };

  /**
   * SINCRONIZAR COM GOOGLE CALENDAR
   */
  const syncWithGoogle = async () => {
    try {
      const response = await fetch('/api/calendar/sync/google', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao sincronizar');
      }

      await loadEvents();
      
      toast({
        title: "Sincronização concluída",
        description: "Eventos sincronizados com Google Calendar",
      });
    } catch (error) {
      console.error('Erro ao sincronizar:', error);
      toast({
        title: "Erro",
        description: "Não foi possível sincronizar com Google Calendar",
        variant: "destructive"
      });
    }
  };

  /**
   * RESETAR FORMULÁRIO
   */
  const resetEventForm = () => {
    setEventForm({
      title: '',
      description: '',
      startDate: '',
      startTime: '',
      endDate: '',
      endTime: '',
      location: '',
      attendees: [],
      calendar: 'default',
      reminder: '15',
      repeat: 'none',
      color: '#3B82F6',
      isAllDay: false,
      meetingType: 'none',
      meetingUrl: '',
      priority: 'medium'
    });
  };

  /**
   * NAVEGAR MESES
   */
  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  /**
   * OBTER DIAS DO MÊS
   */
  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Dias do mês anterior
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const prevDate = new Date(year, month, -i);
      days.push({
        date: prevDate,
        isCurrentMonth: false,
        events: []
      });
    }
    
    // Dias do mês atual
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dayEvents = events.filter(event => {
        const eventDate = new Date(event.startDateTime);
        return eventDate.toDateString() === date.toDateString() &&
               visibleCalendars.has(event.calendarId);
      });
      
      days.push({
        date,
        isCurrentMonth: true,
        events: dayEvents
      });
    }
    
    // Completar com dias do próximo mês
    const remainingDays = 42 - days.length; // 6 semanas * 7 dias
    for (let day = 1; day <= remainingDays; day++) {
      const nextDate = new Date(year, month + 1, day);
      days.push({
        date: nextDate,
        isCurrentMonth: false,
        events: []
      });
    }
    
    return days;
  };

  /**
   * RENDERIZAR EVENTO NO CALENDÁRIO
   */
  const renderEventInCalendar = (event) => {
    return (
      <div
        key={event.id}
        className={`text-xs p-1 mb-1 rounded cursor-pointer truncate ${
          event.priority === 'high' ? 'border-l-2 border-red-500' :
          event.priority === 'low' ? 'border-l-2 border-gray-400' : ''
        }`}
        style={{ backgroundColor: event.color + '20', color: event.color }}
        onClick={() => {
          setSelectedEvent(event);
          setShowEventModal(true);
        }}
        draggable
        onDragStart={() => setDraggedEvent(event)}
      >
        <div className="flex items-center gap-1">
          {event.meetingType === 'video' && <Video className="h-3 w-3" />}
          {event.meetingType === 'phone' && <Phone className="h-3 w-3" />}
          {event.repeat !== 'none' && <Repeat className="h-3 w-3" />}
          <span className="truncate">{event.title}</span>
        </div>
        {!event.isAllDay && (
          <div className="text-xs opacity-75">
            {new Date(event.startDateTime).toLocaleTimeString('pt-BR', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </div>
        )}
      </div>
    );
  };

  /**
   * FILTRAR EVENTOS
   */
  const filteredEvents = events.filter(event => 
    event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  /**
   * CARREGAR DADOS AO MONTAR COMPONENTE
   */
  useEffect(() => {
    loadEvents();
    loadCalendars();
  }, [currentDate]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Calendar className="h-8 w-8 text-blue-600" />
                Calendário Profissional
              </h1>
              <p className="text-gray-600 mt-2">
                Gerencie seus compromissos e reuniões
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={syncWithGoogle}
                disabled={loading}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Sync Google
              </Button>
              <Button
                onClick={() => setShowCreateModal(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Novo Evento
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Mini Calendário */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Navegação</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigateMonth(-1)}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <h3 className="font-medium">
                    {currentDate.toLocaleDateString('pt-BR', { 
                      month: 'long', 
                      year: 'numeric' 
                    })}
                  </h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigateMonth(1)}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="grid grid-cols-4 gap-2 mb-4">
                  {['Mês', 'Semana', 'Dia', 'Lista'].map((viewType, index) => (
                    <Button
                      key={viewType}
                      variant={view === ['month', 'week', 'day', 'agenda'][index] ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setView(['month', 'week', 'day', 'agenda'][index])}
                      className="text-xs"
                    >
                      {viewType}
                    </Button>
                  ))}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentDate(new Date())}
                  className="w-full"
                >
                  Hoje
                </Button>
              </CardContent>
            </Card>

            {/* Busca */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Buscar
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Input
                  placeholder="Buscar eventos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </CardContent>
            </Card>

            {/* Calendários */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Meus Calendários</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {calendars.map((calendar) => (
                    <div key={calendar.id} className="flex items-center gap-3">
                      <button
                        onClick={() => {
                          const newVisible = new Set(visibleCalendars);
                          if (newVisible.has(calendar.id)) {
                            newVisible.delete(calendar.id);
                          } else {
                            newVisible.add(calendar.id);
                          }
                          setVisibleCalendars(newVisible);
                        }}
                        className="flex items-center gap-2"
                      >
                        {visibleCalendars.has(calendar.id) ? (
                          <Eye className="h-4 w-4 text-blue-600" />
                        ) : (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: calendar.color }}
                      ></div>
                      <span className="text-sm font-medium">{calendar.name}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Próximos Eventos */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Próximos Eventos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {filteredEvents
                    .filter(event => new Date(event.startDateTime) > new Date())
                    .sort((a, b) => new Date(a.startDateTime) - new Date(b.startDateTime))
                    .slice(0, 5)
                    .map((event) => (
                      <div
                        key={event.id}
                        className="p-2 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
                        onClick={() => {
                          setSelectedEvent(event);
                          setShowEventModal(true);
                        }}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: event.color }}
                          ></div>
                          <span className="font-medium text-sm truncate">{event.title}</span>
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(event.startDateTime).toLocaleDateString('pt-BR')} às{' '}
                          {new Date(event.startDateTime).toLocaleTimeString('pt-BR', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </div>
                        {event.location && (
                          <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                            <MapPin className="h-3 w-3" />
                            {event.location}
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Calendário Principal */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">
                    {currentDate.toLocaleDateString('pt-BR', { 
                      month: 'long', 
                      year: 'numeric' 
                    })}
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigateMonth(-1)}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigateMonth(1)}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {view === 'month' && (
                  <div className="grid grid-cols-7 gap-1">
                    {/* Cabeçalho dos dias da semana */}
                    {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day) => (
                      <div key={day} className="p-2 text-center font-medium text-gray-600 text-sm">
                        {day}
                      </div>
                    ))}
                    
                    {/* Dias do mês */}
                    {getDaysInMonth().map((day, index) => (
                      <div
                        key={index}
                        className={`min-h-[120px] p-2 border border-gray-200 ${
                          !day.isCurrentMonth ? 'bg-gray-50 text-gray-400' : 'bg-white'
                        } ${
                          day.date.toDateString() === new Date().toDateString() 
                            ? 'bg-blue-50 border-blue-200' 
                            : ''
                        }`}
                        onDrop={(e) => {
                          e.preventDefault();
                          if (draggedEvent) {
                            const newStartDate = day.date.toISOString().split('T')[0];
                            updateEvent(draggedEvent.id, {
                              startDateTime: `${newStartDate}T${draggedEvent.startDateTime.split('T')[1]}`,
                              endDateTime: `${newStartDate}T${draggedEvent.endDateTime.split('T')[1]}`
                            });
                            setDraggedEvent(null);
                          }
                        }}
                        onDragOver={(e) => e.preventDefault()}
                        onDoubleClick={() => {
                          const dateStr = day.date.toISOString().split('T')[0];
                          setEventForm(prev => ({
                            ...prev,
                            startDate: dateStr,
                            endDate: dateStr,
                            startTime: '09:00',
                            endTime: '10:00'
                          }));
                          setShowCreateModal(true);
                        }}
                      >
                        <div className="font-medium text-sm mb-1">
                          {day.date.getDate()}
                        </div>
                        <div className="space-y-1">
                          {day.events.slice(0, 3).map(renderEventInCalendar)}
                          {day.events.length > 3 && (
                            <div className="text-xs text-gray-500">
                              +{day.events.length - 3} mais
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {loading && (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-2">Carregando eventos...</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Modal de Criação de Evento - Será implementado na próxima parte */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Criar Novo Evento</h2>
            {/* Formulário será implementado na próxima parte */}
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                Cancelar
              </Button>
              <Button onClick={createEvent} disabled={loading}>
                {loading ? 'Criando...' : 'Criar Evento'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarProfessional;
