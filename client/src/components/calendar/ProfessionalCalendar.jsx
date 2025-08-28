/**
 * PROFESSIONAL CALENDAR COMPONENT
 * Interface moderna de calendário com drag-and-drop
 * Múltiplas visualizações e funcionalidades avançadas
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 





    Grid3X3,






    Trash2,





    Share2 }
  } from 'lucide-react';
import { format, addDays, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isSameDay, isSameMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const ProfessionalCalendar = ( { tenantId, userId, userRole } ) =>
{
  const [ currentDate, setCurrentDate ] = useState( new Date() );
  const [ viewMode, setViewMode ] = useState( 'month' ); // month, week, day, agenda
  const [ events, setEvents ] = useState( [] );
  const [ selectedEvent, setSelectedEvent ] = useState( null );
  const [ isEventDialogOpen, setIsEventDialogOpen ] = useState( false );
  const [ isCreateMode, setIsCreateMode ] = useState( false );
  const [ draggedEvent, setDraggedEvent ] = useState( null );
  const [ searchTerm, setSearchTerm ] = useState( '' );
  const [ filterCategory, setFilterCategory ] = useState( 'all' );
  const [ isLoading, setIsLoading ] = useState( false );

  // Estados do formulário de evento
  const [ eventForm, setEventForm ] = useState( {
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: '',
    category: 'meeting',
    priority: 'medium',
    location: '',
    attendees: '',
    isRecurring: false,
    recurringType: 'weekly',
    reminderMinutes: 15,
    isAllDay: false
  } );

  // Categorias de eventos
  const eventCategories = {
    meeting: { label: 'Reunião', color: 'bg-blue-500', icon: Users },
    task: { label: 'Tarefa', color: 'bg-green-500', icon: Clock },
    call: { label: 'Chamada', color: 'bg-purple-500', icon: Video },
    appointment: { label: 'Compromisso', color: 'bg-orange-500', icon: Calendar },
    deadline: { label: 'Prazo', color: 'bg-red-500', icon: Bell },
    personal: { label: 'Pessoal', color: 'bg-gray-500', icon: Eye }
  };

  // Carregar eventos
  useEffect( () =>
  {
    loadEvents();
  }, [ currentDate, viewMode, tenantId, userId ] );

  const loadEvents = async () =>
  {
    setIsLoading( true );
    try
    {
      // Simular carregamento de eventos
      const mockEvents = generateMockEvents();
      setEvents( mockEvents );
    } catch ( error )
    {
      console.error( 'Erro ao carregar eventos:', error );
    } finally
    {
      setIsLoading( false );
    }
  };

  // Gerar eventos mock para demonstração
  const generateMockEvents = () =>
  {
    const mockEvents = [
      {
        id: '1',
        title: 'Reunião de Planejamento',
        description: 'Planejamento estratégico Q4',
        startDate: format( new Date(), 'yyyy-MM-dd' ),
        startTime: '09:00',
        endTime: '10:30',
        category: 'meeting',
        priority: 'high',
        location: 'Sala de Reuniões A',
        attendees: 'João, Maria, Pedro',
        isAllDay: false
      },
      {
        id: '2',
        title: 'Apresentação para Cliente',
        description: 'Apresentação da proposta comercial',
        startDate: format( addDays( new Date(), 1 ), 'yyyy-MM-dd' ),
        startTime: '14:00',
        endTime: '15:30',
        category: 'appointment',
        priority: 'high',
        location: 'Online - Teams',
        attendees: 'Cliente ABC, Equipe Comercial',
        isAllDay: false
      },
      {
        id: '3',
        title: 'Entrega do Projeto',
        description: 'Deadline final do projeto X',
        startDate: format( addDays( new Date(), 3 ), 'yyyy-MM-dd' ),
        startTime: '18:00',
        endTime: '18:00',
        category: 'deadline',
        priority: 'high',
        location: '',
        attendees: '',
        isAllDay: false
      }
    ];
    return mockEvents;
  };

  // Navegação do calendário
  const navigateCalendar = ( direction ) =>
  {
    const amount = viewMode === 'day' ? 1 : viewMode === 'week' ? 7 : 30;
    const newDate = direction === 'prev'
      ? subDays( currentDate, amount )
      : addDays( currentDate, amount );
    setCurrentDate( newDate );
  };

  // Criar novo evento
  const handleCreateEvent = () =>
  {
    setIsCreateMode( true );
    setSelectedEvent( null );
    setEventForm( {
      title: '',
      description: '',
      startDate: format( currentDate, 'yyyy-MM-dd' ),
      endDate: format( currentDate, 'yyyy-MM-dd' ),
      startTime: '09:00',
      endTime: '10:00',
      category: 'meeting',
      priority: 'medium',
      location: '',
      attendees: '',
      isRecurring: false,
      recurringType: 'weekly',
      reminderMinutes: 15,
      isAllDay: false
    } );
    setIsEventDialogOpen( true );
  };

  // Editar evento
  const handleEditEvent = ( event ) =>
  {
    setIsCreateMode( false );
    setSelectedEvent( event );
    setEventForm( {
      title: event.title,
      description: event.description,
      startDate: event.startDate,
      endDate: event.endDate || event.startDate,
      startTime: event.startTime,
      endTime: event.endTime,
      category: event.category,
      priority: event.priority,
      location: event.location || '',
      attendees: event.attendees || '',
      isRecurring: event.isRecurring || false,
      recurringType: event.recurringType || 'weekly',
      reminderMinutes: event.reminderMinutes || 15,
      isAllDay: event.isAllDay || false
    } );
    setIsEventDialogOpen( true );
  };

  // Salvar evento
  const handleSaveEvent = async () =>
  {
    try
    {
      if ( isCreateMode )
      {
        // Criar novo evento
        const newEvent = {
          id: Date.now().toString(),
          ...eventForm
        };
        setEvents( [ ...events, newEvent ] );
      } else
      {
        // Atualizar evento existente
        setEvents( events.map( event =>
          event.id === selectedEvent.id
            ? { ...event, ...eventForm }
            : event
        ) );
      }
      setIsEventDialogOpen( false );
    } catch ( error )
    {
      console.error( 'Erro ao salvar evento:', error );
    }
  };

  // Deletar evento
  const handleDeleteEvent = ( eventId ) =>
  {
    setEvents( events.filter( event => event.id !== eventId ) );
    setIsEventDialogOpen( false );
  };

  // Drag and Drop
  const handleDragStart = ( event, eventData ) =>
  {
    setDraggedEvent( eventData );
  };

  const handleDragOver = ( event ) =>
  {
    event.preventDefault();
  };

  const handleDrop = ( event, newDate ) =>
  {
    event.preventDefault();
    if ( draggedEvent )
    {
      setEvents( events.map( evt =>
        evt.id === draggedEvent.id
          ? { ...evt, startDate: format( newDate, 'yyyy-MM-dd' ) }
          : evt
      ) );
      setDraggedEvent( null );
    }
  };

  // Filtrar eventos
  const filteredEvents = events.filter( event =>
  {
    const matchesSearch = event.title.toLowerCase().includes( searchTerm.toLowerCase() ) ||
      event.description.toLowerCase().includes( searchTerm.toLowerCase() );
    const matchesCategory = filterCategory === 'all' || event.category === filterCategory;
    return matchesSearch && matchesCategory;
  } );

  // Renderizar cabeçalho
  const renderHeader = () => (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center space-x-4">
        <h2 className="text-2xl font-bold text-slate-800">
          { format( currentDate, 'MMMM yyyy', { locale: ptBR } ) }
        </h2>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick=({ ( }) => navigateCalendar( 'prev' ) }
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick=({ ( }) => setCurrentDate( new Date() ) }
          >

          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick=({ ( }) => navigateCalendar( 'next' ) }
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        {/* Busca */ }
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Buscar eventos..."
            value={ searchTerm }
            onChange=({ ( e  }) => setSearchTerm( e.target.value ) }
            className="pl-10 w-64"
          />
        </div>

        {/* Filtro por categoria */ }
        <Select value={ filterCategory } onValueChange={ setFilterCategory }>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            ({ Object.entries( eventCategories ).map( ( [ key, category ]  }) => (
              <SelectItem key={ key } value={ key }>
                { category.label }
              </SelectItem>
            ) ) }
          </SelectContent>
        </Select>

        {/* Modos de visualização */ }
        <div className="flex items-center bg-slate-100 rounded-lg p-1">
          { [
            { mode: 'month', icon: Grid3X3, label: 'Mês' },
            { mode: 'week', icon: Calendar, label: 'Semana' },
            { mode: 'day', icon: Clock, label: 'Dia' },
            { mode: 'agenda', icon: List, label: 'Agenda' }
          ].map( ( { mode, icon: Icon, label } ) => (
            <Button
              key={ mode }
              variant={ viewMode === mode ? 'default' : 'ghost' }
              size="sm"
              onClick=({ ( }) => setViewMode( mode ) }
              className="h-8"
            >
              <Icon className="h-4 w-4 mr-1" />
              { label }
            </Button>
          ) ) }
        </div>

        {/* Ações */ }
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-1" />

          </Button>
          <Button variant="outline" size="sm">
            <Share2 className="h-4 w-4 mr-1" />

          </Button>
          <Button onClick={ handleCreateEvent }>
            <Plus className="h-4 w-4 mr-1" />
            Novo Evento
          </Button>
        </div>
      </div>
    </div>
  );

  // Renderizar evento
  const renderEvent = ( event ) =>
  {
    const category = eventCategories[ event.category ];
    const Icon = category.icon;

    return (
      <div
        key={ event.id }
        draggable
        onDragStart=({ ( e  }) => handleDragStart( e, event ) }
        onClick=({ ( }) => handleEditEvent( event ) }
        className={ `}
          ${ category.color } text-white p-2 rounded-md mb-1 cursor-pointer
          hover:opacity-90 transition-opacity duration-200
          text-xs font-medium shadow-sm`
        `}
      >
        <div className="flex items-center space-x-1">
          <Icon className="h-3 w-3" />
          <span className="truncate">{ event.title }</span>
        </div>
        { !event.isAllDay && (
          <div className="text-xs opacity-90 mt-1">
            { event.startTime } - { event.endTime }
          </div>
        ) }
        { event.priority === 'high' && (
          <Badge variant="destructive" className="text-xs mt-1">
            Alta Prioridade
          </Badge>
        ) }
      </div>
    );
  };

  return (
    <div className="space-y-6">
      { renderHeader() }

      {/* Calendário Principal */ }
      <Card>
        <CardContent className="p-6">
          { viewMode === 'month' && (
            <MonthView
              currentDate={ currentDate }
              events={ filteredEvents }
              onDrop={ handleDrop }
              onDragOver={ handleDragOver }
              renderEvent={ renderEvent }
            />
          ) }
          { viewMode === 'week' && (
            <WeekView
              currentDate={ currentDate }
              events={ filteredEvents }
              onDrop={ handleDrop }
              onDragOver={ handleDragOver }
              renderEvent={ renderEvent }
            />
          ) }
          { viewMode === 'day' && (
            <DayView
              currentDate={ currentDate }
              events={ filteredEvents }
              onDrop={ handleDrop }
              onDragOver={ handleDragOver }
              renderEvent={ renderEvent }
            />
          ) }
          { viewMode === 'agenda' && (
            <AgendaView
              events={ filteredEvents }
              renderEvent={ renderEvent }
            />
          ) }
        </CardContent>
      </Card>

      {/* Dialog de Evento */ }
      <EventDialog
        isOpen={ isEventDialogOpen }
        onClose=({ ( }) => setIsEventDialogOpen( false ) }
        eventForm={ eventForm }
        setEventForm={ setEventForm }
        onSave={ handleSaveEvent }
        onDelete=({ selectedEvent ? ( }) => handleDeleteEvent( selectedEvent.id ) : null }
        isCreateMode={ isCreateMode }
        eventCategories={ eventCategories }
      />
    </div>
  );
};

// Componente de Visualização Mensal
const MonthView = ( { currentDate, events, onDrop, onDragOver, renderEvent } ) =>
{
  const monthStart = startOfMonth( currentDate );
  const monthEnd = endOfMonth( currentDate );
  const startDate = startOfWeek( monthStart );
  const endDate = endOfWeek( monthEnd );

  const days = [];
  let day = startDate;

  while ( day <= endDate )
  {
    days.push( day );
    day = addDays( day, 1 );
  }

  return (
    <div className="grid grid-cols-7 gap-1">
      {/* Cabeçalho dos dias da semana */ }
      { [ 'Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb' ].map( dayName => (
        <div key={ dayName } className="p-2 text-center font-semibold text-slate-600 bg-slate-50">
          { dayName }
        </div>
      ) ) }

      {/* Dias do mês */ }
      { days.map( day =>
      {
        const dayEvents = events.filter( event => isSameDay( new Date( event.startDate ), day ) );
        const isCurrentMonth = isSameMonth( day, currentDate );
        const isToday = isSameDay( day, new Date() );

        return (
          <div
            key={ day.toString() }
            onDrop=({ ( e  }) => onDrop( e, day ) }
            onDragOver={ onDragOver }`
            className={ `
              min-h-[120px] p-2 border border-slate-200}
              ${ isCurrentMonth ? 'bg-white' : 'bg-slate-50' }
              ${ isToday ? 'bg-blue-50 border-blue-300' : '' }
              hover:bg-slate-50 transition-colors duration-200`
            `}
          >`
            <div className={ `
              text-sm font-medium mb-1}
              ${ isCurrentMonth ? 'text-slate-900' : 'text-slate-400' }
              ${ isToday ? 'text-blue-600 font-bold' : '' }`
            `}>
              { format( day, 'd' ) }
            </div>
            <div className="space-y-1">
              { dayEvents.slice( 0, 3 ).map( renderEvent ) }
              { dayEvents.length > 3 && (
                <div className="text-xs text-slate-500 font-medium">
                  +{ dayEvents.length - 3 } mais
                </div>
              ) }
            </div>
          </div>
        );
      } ) }
    </div>
  );
};

// Componente de Visualização Semanal
const WeekView = ( { currentDate, events, onDrop, onDragOver, renderEvent } ) =>
{
  const weekStart = startOfWeek( currentDate );
  const weekDays = Array.from( { length: 7 }, ( _, i ) => addDays( weekStart, i ) );

  return (
    <div className="grid grid-cols-8 gap-1">
      {/* Coluna de horários */ }
      <div className="space-y-1">
        <div className="h-12"></div> {/* Espaço para cabeçalho */ }
        { Array.from( { length: 24 }, ( _, hour ) => (
          <div key={ hour } className="h-12 text-xs text-slate-500 pr-2 text-right">
            { hour.toString().padStart( 2, '0' ) }:00
          </div>
        ) ) }
      </div>

      {/* Colunas dos dias */ }
      { weekDays.map( day =>
      {
        const dayEvents = events.filter( event => isSameDay( new Date( event.startDate ), day ) );
        const isToday = isSameDay( day, new Date() );

        return (
          <div key={ day.toString() } className="space-y-1">
            {/* Cabeçalho do dia */ }`
            <div className={ `
              h-12 p-2 text-center border border-slate-200 rounded}
              ${ isToday ? 'bg-blue-100 border-blue-300' : 'bg-slate-50' }`
            `}>
              <div className="text-xs text-slate-600">
                { format( day, 'EEE', { locale: ptBR } ) }
              </div>`
              <div className={ `text-lg font-semibold ${ isToday ? 'text-blue-600' : 'text-slate-900' }` }>
                { format( day, 'd' ) }
              </div>
            </div>

            {/* Grade de horários */ }
            <div className="space-y-1">
              { Array.from( { length: 24 }, ( _, hour ) => (
                <div
                  key={ hour }
                  onDrop=({ ( e  }) => onDrop( e, day ) }
                  onDragOver={ onDragOver }
                  className="h-12 border border-slate-100 hover:bg-slate-50 transition-colors duration-200"
                >
                  {/* Eventos neste horário */ }
                  { dayEvents
                    .filter( event =>
                    {
                      const eventHour = parseInt( event.startTime.split( ':' )[ 0 ] );
                      return eventHour === hour;
                    } )
                    .map( renderEvent )
                  }
                </div>
              ) ) }
            </div>
          </div>
        );
      } ) }
    </div>
  );
};

// Componente de Visualização Diária
const DayView = ( { currentDate, events, onDrop, onDragOver, renderEvent } ) =>
{
  const dayEvents = events.filter( event => isSameDay( new Date( event.startDate ), currentDate ) );

  return (
    <div className="grid grid-cols-2 gap-6">
      {/* Grade de horários */ }
      <div className="space-y-1">
        <h3 className="text-lg font-semibold mb-4">
          { format( currentDate, 'EEEE, d MMMM yyyy', { locale: ptBR } ) }
        </h3>
        { Array.from( { length: 24 }, ( _, hour ) => (
          <div
            key={ hour }
            onDrop=({ ( e  }) => onDrop( e, currentDate ) }
            onDragOver={ onDragOver }
            className="flex items-center h-16 border border-slate-200 rounded hover:bg-slate-50 transition-colors duration-200"
          >
            <div className="w-16 text-sm text-slate-500 text-center">
              { hour.toString().padStart( 2, '0' ) }:00
            </div>
            <div className="flex-1 p-2">
              { dayEvents
                .filter( event =>
                {
                  const eventHour = parseInt( event.startTime.split( ':' )[ 0 ] );
                  return eventHour === hour;
                } )
                .map( renderEvent )
              }
            </div>
          </div>
        ) ) }
      </div>

      {/* Lista de eventos do dia */ }
      <div>
        <h3 className="text-lg font-semibold mb-4">Eventos do Dia</h3>
        <div className="space-y-3">
          { dayEvents.length > 0 ? (
            dayEvents.map( event => (
              <Card key={ event.id } className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-900">{ event.title }</h4>
                    <p className="text-sm text-slate-600 mt-1">{ event.description }</p>
                    <div className="flex items-center space-x-4 mt-2 text-xs text-slate-500">
                      <span className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        { event.startTime } - { event.endTime }
                      </span>
                      { event.location && (
                        <span className="flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          { event.location }
                        </span>
                      ) }
                    </div>
                  </div>
                  <Badge variant="outline" className="ml-2">
                    { eventCategories[ event.category ]?.label }
                  </Badge>
                </div>
              </Card>
            ) )
          ) : (
            <div className="text-center text-slate-500 py-8">
              <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Nenhum evento agendado para hoje</p>
            </div>
          ) }
        </div>
      </div>
    </div>
  );
};

// Componente de Visualização de Agenda
const AgendaView = ( { events, renderEvent } ) =>
({ const sortedEvents = events.sort( ( a, b  }) =>
  {`
    const dateA = new Date( `${ a.startDate } ${ a.startTime }` );`
    const dateB = new Date( `${ b.startDate } ${ b.startTime }` );
    return dateA - dateB;
  } );

  const groupedEvents = sortedEvents.reduce( ( groups, event ) =>
  {
    const date = event.startDate;
    if ( !groups[ date ] )
    {
      groups[ date ] = [];
    }
    groups[ date ].push( event );
    return groups;
  }, {} );

  return (
    <div className="space-y-6">
      ({ Object.entries( groupedEvents ).map( ( [ date, dayEvents ]  }) => (
        <div key={ date }>
          <h3 className="text-lg font-semibold mb-3 text-slate-800">
            { format( new Date( date ), 'EEEE, d MMMM yyyy', { locale: ptBR } ) }
          </h3>
          <div className="space-y-2">
            { dayEvents.map( event => (
              <Card key={ event.id } className="p-4 hover:shadow-md transition-shadow duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">`
                    <div className={ `w-4 h-4 rounded-full ${ eventCategories[ event.category ]?.color }` }></div>
                    <div>
                      <h4 className="font-semibold text-slate-900">{ event.title }</h4>
                      <p className="text-sm text-slate-600">{ event.description }</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-slate-900">
                      { event.startTime } - { event.endTime }
                    </div>
                    { event.location && (
                      <div className="text-xs text-slate-500 flex items-center mt-1">
                        <MapPin className="h-3 w-3 mr-1" />
                        { event.location }
                      </div>
                    ) }
                  </div>
                </div>
              </Card>
            ) ) }
          </div>
        </div>
      ) ) }

      { events.length === 0 && (
        <div className="text-center text-slate-500 py-12">
          <Calendar className="h-16 w-16 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-semibold mb-2">Nenhum evento encontrado</h3>
          <p>Não há eventos agendados no período selecionado</p>
        </div>
      ) }
    </div>
  );
};

export default ProfessionalCalendar;
`