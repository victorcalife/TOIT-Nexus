/**
 * CALENDÁRIO AVANÇADO COMPLETO
 * Sistema profissional de agendamento com múltiplas visualizações
 * 100% JavaScript - SEM TYPESCRIPT
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import {  
  Calendar as CalendarIcon, Plus, ChevronLeft, ChevronRight, 
  Clock, Users, MapPin, Video, Bell, Settings, Filter,
  Download, Share, Search, MoreHorizontal, Edit, Trash2 }
} from 'lucide-react';

export default function Calendar() {
  const { user, tenant } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState('month'); // month, week, day, agenda
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: 'all',
    status: 'all',
    attendees: 'all'
  });

  useEffect(() => {
    loadEvents();
  }, [currentDate, view]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      
      // Simular carregamento de eventos
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const mockEvents = generateMockEvents();
      setEvents(mockEvents);
      
    } catch (error) {
      console.error('Erro ao carregar eventos:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateMockEvents = () => {
    const today = new Date();
    const events = [];
    
    // Gerar eventos para os próximos 30 dias
    for (let i = 0; i < 30; i++) {
      const eventDate = new Date(today);
      eventDate.setDate(today.getDate() + i);
      
      // Adicionar alguns eventos aleatórios
      if (Math.random() > 0.7) {
        events.push({
          id: `event-${i}-1`,`
          title: `Reunião de Equipe ${i + 1}`,
          description: 'Reunião semanal para alinhamento de projetos',
          start: new Date(eventDate.setHours(9, 0)),
          end: new Date(eventDate.setHours(10, 0)),
          category: 'meeting',
          status: 'confirmed',
          attendees: ['João Silva', 'Maria Santos'],
          location: 'Sala de Reuniões A',
          isOnline: false,
          color: '#3b82f6'
        });
      }
      
      if (Math.random() > 0.8) {
        events.push({`
          id: `event-${i}-2`,`
          title: `Apresentação Cliente`,
          description: 'Apresentação de proposta para novo cliente',
          start: new Date(eventDate.setHours(14, 30)),
          end: new Date(eventDate.setHours(16, 0)),
          category: 'presentation',
          status: 'confirmed',
          attendees: ['Victor Calife', 'Cliente ABC'],
          location: 'Online',
          isOnline: true,
          color: '#10b981'
        });
      }
    }
    
    return events;
  };

  const navigateDate = (direction) => {
    const newDate = new Date(currentDate);
    
    switch (view) {
      case 'month':
        newDate.setMonth(currentDate.getMonth() + direction);
        break;
      case 'week':
        newDate.setDate(currentDate.getDate() + (direction * 7));
        break;
      case 'day':
        newDate.setDate(currentDate.getDate() + direction);
        break;
    }
    
    setCurrentDate(newDate);
  };

  const formatDateHeader = () => {
    const options = { 
      year: 'numeric', 
      month: 'long',
      ...(view === 'day' && { day: 'numeric' })
    };
    
    return currentDate.toLocaleDateString('pt-BR', options);
  };

  const getEventsForDate = (date) => {
    return events.filter(event => {
      const eventDate = new Date(event.start);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  const renderMonthView = () => {
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const current = new Date(startDate);
    
    // Gerar 42 dias (6 semanas)
    for (let i = 0; i < 42; i++) {
      const dayEvents = getEventsForDate(current);
      const isCurrentMonth = current.getMonth() === currentDate.getMonth();
      const isToday = current.toDateString() === new Date().toDateString();
      
      days.push(
        <div
          key={current.toISOString()}`
          className={`
            min-h-[120px] p-2 border border-gray-200 cursor-pointer hover:bg-gray-50}
            ${!isCurrentMonth ? 'bg-gray-100 text-gray-400' : 'bg-white'}
            ${isToday ? 'bg-blue-50 border-blue-300' : ''}`
          `}
          onClick=({ ( }) => {
            setCurrentDate(new Date(current));
            setView('day');
          }}
        >`
          <div className={`text-sm font-medium mb-1 ${isToday ? 'text-blue-600' : ''}`}>
            {current.getDate()}
          </div>
          
          <div className="space-y-1">
            {dayEvents.slice(0, 3).map(event => (
              <div
                key={event.id}
                className="text-xs p-1 rounded truncate"
                style={{ backgroundColor: event.color + '20', color: event.color }}
                onClick=({ (e }) => {
                  e.stopPropagation();
                  setSelectedEvent(event);
                  setShowEventModal(true);
                }}
              >
                {event.title}
              </div>
            ))}
            
            {dayEvents.length > 3 && (
              <div className="text-xs text-gray-500">
                +{dayEvents.length - 3} mais
              </div>
            )}
          </div>
        </div>
      );
      
      current.setDate(current.getDate() + 1);
    }
    
    return (
      <div className="grid grid-cols-7 gap-0 border border-gray-200 rounded-lg overflow-hidden">
        {/* Cabeçalho dos dias da semana */}
        {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
          <div key={day} className="bg-gray-100 p-3 text-center font-medium text-gray-700 border-b">
            {day}
          </div>
        ))}
        
        {/* Dias do mês */}
        {days}
      </div>
    );
  };

  const renderWeekView = () => {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
    
    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      weekDays.push(day);
    }
    
    return (
      <div className="grid grid-cols-8 gap-0 border border-gray-200 rounded-lg overflow-hidden">
        {/* Coluna de horários */}
        <div className="bg-gray-50">
          <div className="h-16 border-b border-gray-200"></div>
          {Array.from({ length: 24 }, (_, hour) => (
            <div key={hour} className="h-16 border-b border-gray-200 p-2 text-xs text-gray-500">
              {hour.toString().padStart(2, '0')}:00
            </div>
          ))}
        </div>
        
        {/* Colunas dos dias */}
        {weekDays.map(day => {
          const dayEvents = getEventsForDate(day);
          const isToday = day.toDateString() === new Date().toDateString();
          
          return (
            <div key={day.toISOString()} className="relative">
              {/* Cabeçalho do dia */}`
              <div className={`h-16 p-2 border-b border-gray-200 text-center ${isToday ? 'bg-blue-50' : 'bg-gray-50'}`}>
                <div className="text-xs text-gray-500">
                  {day.toLocaleDateString('pt-BR', { weekday: 'short' })}
                </div>`
                <div className={`text-lg font-medium ${isToday ? 'text-blue-600' : ''}`}>
                  {day.getDate()}
                </div>
              </div>
              
              {/* Grade de horários */}
              {Array.from({ length: 24 }, (_, hour) => (
                <div key={hour} className="h-16 border-b border-gray-200 relative">
                  {/* Eventos do horário */}
                  {dayEvents
                    .filter(event => new Date(event.start).getHours() === hour)
                    .map(event => (
                      <div
                        key={event.id}
                        className="absolute left-1 right-1 p-1 rounded text-xs cursor-pointer"
                        style={{ 
                          backgroundColor: event.color + '20', 
                          color: event.color,
                          top: '2px',
                          height: 'calc(100% - 4px)'}
                        }}
                        onClick=({ ( }) => {
                          setSelectedEvent(event);
                          setShowEventModal(true);
                        }}
                      >
                        <div className="font-medium truncate">{event.title}</div>
                        <div className="truncate opacity-75">{event.location}</div>
                      </div>
                    ))}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    );
  };

  const renderDayView = () => {
    const dayEvents = getEventsForDate(currentDate);
    
    return (
      <div className="grid grid-cols-1 gap-0 border border-gray-200 rounded-lg overflow-hidden">
        {/* Cabeçalho do dia */}
        <div className="bg-gray-50 p-4 border-b">
          <h3 className="text-lg font-medium">
            {currentDate.toLocaleDateString('pt-BR', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </h3>
          <p className="text-sm text-gray-600">
            {dayEvents.length} evento(s) agendado(s)
          </p>
        </div>
        
        {/* Lista de eventos */}
        <div className="p-4 space-y-3">
          {dayEvents.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <CalendarIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Nenhum evento agendado para este dia</p>
            </div>
          ) : (
            dayEvents.map(event => (
              <Card 
                key={event.id} 
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick=({ ( }) => {
                  setSelectedEvent(event);
                  setShowEventModal(true);
                }}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: event.color }}
                        ></div>
                        <h4 className="font-medium">{event.title}</h4>
                        <Badge variant="outline" className="text-xs">
                          {event.category}
                        </Badge>
                      </div>
                      
                      <div className="text-sm text-gray-600 space-y-1">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          {new Date(event.start).toLocaleTimeString('pt-BR', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })} - {new Date(event.end).toLocaleTimeString('pt-BR', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </div>
                        
                        {event.location && (
                          <div className="flex items-center gap-2">
                            {event.isOnline ? <Video className="h-4 w-4" /> : <MapPin className="h-4 w-4" />}
                            {event.location}
                          </div>
                        )}
                        
                        {event.attendees && event.attendees.length > 0 && (
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            {event.attendees.length} participante(s)
                          </div>
                        )}
                      </div>
                      
                      {event.description && (
                        <p className="text-sm text-gray-600 mt-2">
                          {event.description}
                        </p>
                      )}
                    </div>
                    
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    );
  };

  const renderAgendaView = () => ({ const upcomingEvents = events
      .filter(event => new Date(event.start) >= new Date())
      .sort((a, b }) => new Date(a.start) - new Date(b.start))
      .slice(0, 20);
    
    return (
      <div className="space-y-4">
        {upcomingEvents.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <CalendarIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Nenhum evento próximo</p>
          </div>
        ) : (
          upcomingEvents.map(event => (
            <Card 
              key={event.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick=({ ( }) => {
                setSelectedEvent(event);
                setShowEventModal(true);
              }}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: event.color }}
                      ></div>
                      <h4 className="font-medium">{event.title}</h4>
                      <Badge variant="outline" className="text-xs">
                        {event.category}
                      </Badge>
                    </div>
                    
                    <div className="text-sm text-gray-600">
                      {new Date(event.start).toLocaleDateString('pt-BR')} às {' '}
                      {new Date(event.start).toLocaleTimeString('pt-BR', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </div>
                  </div>
                  
                  <div className="text-right text-sm text-gray-500">
                    {Math.ceil((new Date(event.start) - new Date()) / (1000 * 60 * 60 * 24))} dias
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando calendário...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-gray-900">
                Calendário
              </h1>
              
              {/* Navegação de data */}
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick=({ ( }) => navigateDate(-1)}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick=({ ( }) => setCurrentDate(new Date())}
                >

                <Button variant="outline" size="sm" onClick=({ ( }) => navigateDate(1)}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
                
                <h2 className="text-lg font-medium text-gray-700 ml-4">
                  {formatDateHeader()}
                </h2>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Seletor de visualização */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                {[
                  { key: 'month', label: 'Mês' },
                  { key: 'week', label: 'Semana' },
                  { key: 'day', label: 'Dia' },
                  { key: 'agenda', label: 'Agenda' }
                ].map(viewOption => (
                  <Button
                    key={viewOption.key}
                    variant={view === viewOption.key ? "default" : "ghost"}
                    size="sm"
                    onClick=({ ( }) => setView(viewOption.key)}
                    className="text-xs"
                  >
                    {viewOption.label}
                  </Button>
                ))}
              </div>
              
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />

              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Novo Evento
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo do Calendário */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {view === 'month' && renderMonthView()}
        {view === 'week' && renderWeekView()}
        {view === 'day' && renderDayView()}
        {view === 'agenda' && renderAgendaView()}
      </div>
    </div>
  );
}
`