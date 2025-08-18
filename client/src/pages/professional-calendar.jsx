/**
 * PÁGINA DO CALENDÁRIO PROFISSIONAL
 * Sistema completo de calendário com drag-and-drop e integração com tarefas
 * 100% JavaScript - SEM TYPESCRIPT
 */

import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import
  {
    Calendar,
    Plus,
    Search,
    Filter,
    Edit,
    Trash2,
    Eye,
    Clock,
    MapPin,
    Users,
    Bell,
    Repeat,
    Settings,
    Download,
    Upload,
    Sync,
    ChevronLeft,
    ChevronRight,
    Grid3X3,
    List,
    BarChart3,
    Sparkles,
    Brain,
    Target,
    Activity,
    CheckCircle,
    AlertTriangle,
    RefreshCw,
    ExternalLink,
    Copy,
    Share2
  } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/use-toast';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import
  {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
  } from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';

const VIEW_MODES = {
  MONTH: 'dayGridMonth',
  WEEK: 'timeGridWeek',
  DAY: 'timeGridDay',
  LIST: 'listWeek'
};

const EVENT_TYPES = {
  MEETING: 'meeting',
  TASK: 'task',
  REMINDER: 'reminder',
  APPOINTMENT: 'appointment',
  DEADLINE: 'deadline',
  PERSONAL: 'personal'
};

const EVENT_COLORS = {
  meeting: '#3B82F6',
  task: '#10B981',
  reminder: '#F59E0B',
  appointment: '#8B5CF6',
  deadline: '#EF4444',
  personal: '#6B7280'
};

export default function ProfessionalCalendarPage()
{
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const calendarRef = useRef( null );

  const [ currentView, setCurrentView ] = useState( VIEW_MODES.MONTH );
  const [ currentDate, setCurrentDate ] = useState( new Date() );
  const [ selectedEvent, setSelectedEvent ] = useState( null );
  const [ showEventModal, setShowEventModal ] = useState( false );
  const [ searchTerm, setSearchTerm ] = useState( '' );
  const [ filterType, setFilterType ] = useState( 'all' );
  const [ activeTab, setActiveTab ] = useState( 'calendar' );
  const [ draggedEvent, setDraggedEvent ] = useState( null );

  // Query para eventos do calendário
  const { data: eventsData, isLoading } = useQuery( {
    queryKey: [ 'calendar-events', currentDate.getFullYear(), currentDate.getMonth() ],
    queryFn: async () =>
    {
      const startDate = new Date( currentDate.getFullYear(), currentDate.getMonth(), 1 );
      const endDate = new Date( currentDate.getFullYear(), currentDate.getMonth() + 1, 0 );

      const response = await fetch( `/api/calendar/events?start=${ startDate.toISOString() }&end=${ endDate.toISOString() }`, {
        headers: {
          'Authorization': `Bearer ${ localStorage.getItem( 'accessToken' ) }`
        }
      } );

      if ( !response.ok )
      {
        throw new Error( 'Erro ao carregar eventos' );
      }

      return response.json();
    },
    enabled: !!user
  } );

  // Query para tarefas integradas
  const { data: tasksData } = useQuery( {
    queryKey: [ 'calendar-tasks' ],
    queryFn: async () =>
    {
      const response = await fetch( '/api/tasks?calendar_integration=true', {
        headers: {
          'Authorization': `Bearer ${ localStorage.getItem( 'accessToken' ) }`
        }
      } );

      if ( !response.ok )
      {
        throw new Error( 'Erro ao carregar tarefas' );
      }

      return response.json();
    },
    enabled: !!user
  } );

  // Query para configurações do calendário
  const { data: settingsData } = useQuery( {
    queryKey: [ 'calendar-settings' ],
    queryFn: async () =>
    {
      const response = await fetch( '/api/calendar/settings', {
        headers: {
          'Authorization': `Bearer ${ localStorage.getItem( 'accessToken' ) }`
        }
      } );

      if ( !response.ok )
      {
        throw new Error( 'Erro ao carregar configurações' );
      }

      return response.json();
    },
    enabled: !!user
  } );

  // Mutation para criar/editar evento
  const saveEventMutation = useMutation( {
    mutationFn: async ( eventData ) =>
    {
      const url = eventData.id ? `/api/calendar/events/${ eventData.id }` : '/api/calendar/events';
      const method = eventData.id ? 'PUT' : 'POST';

      const response = await fetch( url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${ localStorage.getItem( 'accessToken' ) }`
        },
        body: JSON.stringify( eventData )
      } );

      if ( !response.ok )
      {
        const error = await response.json();
        throw new Error( error.error || 'Erro ao salvar evento' );
      }

      return response.json();
    },
    onSuccess: () =>
    {
      toast( {
        title: 'Evento salvo',
        description: 'Evento foi salvo com sucesso.'
      } );
      queryClient.invalidateQueries( [ 'calendar-events' ] );
      setShowEventModal( false );
      setSelectedEvent( null );
    },
    onError: ( error ) =>
    {
      toast( {
        title: 'Erro ao salvar evento',
        description: error.message,
        variant: 'destructive'
      } );
    }
  } );

  // Mutation para deletar evento
  const deleteEventMutation = useMutation( {
    mutationFn: async ( eventId ) =>
    {
      const response = await fetch( `/api/calendar/events/${ eventId }`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${ localStorage.getItem( 'accessToken' ) }`
        }
      } );

      if ( !response.ok )
      {
        const error = await response.json();
        throw new Error( error.error || 'Erro ao deletar evento' );
      }

      return response.json();
    },
    onSuccess: () =>
    {
      toast( {
        title: 'Evento deletado',
        description: 'Evento foi removido com sucesso.'
      } );
      queryClient.invalidateQueries( [ 'calendar-events' ] );
      setShowEventModal( false );
      setSelectedEvent( null );
    },
    onError: ( error ) =>
    {
      toast( {
        title: 'Erro ao deletar evento',
        description: error.message,
        variant: 'destructive'
      } );
    }
  } );

  // Mutation para otimização quântica
  const optimizeScheduleMutation = useMutation( {
    mutationFn: async () =>
    {
      const response = await fetch( '/api/calendar/quantum-optimize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${ localStorage.getItem( 'accessToken' ) }`
        },
        body: JSON.stringify( {
          dateRange: {
            start: new Date( currentDate.getFullYear(), currentDate.getMonth(), 1 ),
            end: new Date( currentDate.getFullYear(), currentDate.getMonth() + 1, 0 )
          }
        } )
      } );

      if ( !response.ok )
      {
        const error = await response.json();
        throw new Error( error.error || 'Erro na otimização quântica' );
      }

      return response.json();
    },
    onSuccess: ( data ) =>
    {
      toast( {
        title: 'Agenda otimizada',
        description: `Otimização quântica concluída. ${ data.data.potentialImprovements.length } melhorias identificadas.`
      } );
      queryClient.invalidateQueries( [ 'calendar-events' ] );
    },
    onError: ( error ) =>
    {
      toast( {
        title: 'Erro na otimização',
        description: error.message,
        variant: 'destructive'
      } );
    }
  } );

  const events = eventsData?.data?.events || [];
  const tasks = tasksData?.data?.tasks || [];
  const settings = settingsData?.data || {};

  // Combinar eventos e tarefas
  const allEvents = [
    ...events.map( event => ( {
      id: event.id,
      title: event.title,
      start: event.start_date,
      end: event.end_date,
      backgroundColor: EVENT_COLORS[ event.event_type ] || EVENT_COLORS.meeting,
      borderColor: EVENT_COLORS[ event.event_type ] || EVENT_COLORS.meeting,
      extendedProps: {
        type: 'event',
        description: event.description,
        location: event.location,
        attendees: event.attendees,
        eventType: event.event_type,
        isPrivate: event.is_private,
        quantumEnhanced: event.quantum_enhanced
      }
    } ) ),
    ...tasks.map( task => ( {
      id: `task_${ task.id }`,
      title: `📋 ${ task.title }`,
      start: task.due_date,
      backgroundColor: EVENT_COLORS.task,
      borderColor: EVENT_COLORS.task,
      extendedProps: {
        type: 'task',
        description: task.description,
        priority: task.priority,
        status: task.status,
        assignee: task.assignee
      }
    } ) )
  ];

  // Filtrar eventos
  const filteredEvents = allEvents.filter( event =>
  {
    const matchesSearch = event.title.toLowerCase().includes( searchTerm.toLowerCase() );
    const matchesType = filterType === 'all' ||
      ( filterType === 'events' && event.extendedProps.type === 'event' ) ||
      ( filterType === 'tasks' && event.extendedProps.type === 'task' ) ||
      ( filterType === event.extendedProps.eventType );

    return matchesSearch && matchesType;
  } );

  // Handlers do FullCalendar
  const handleDateSelect = ( selectInfo ) =>
  {
    setSelectedEvent( {
      start: selectInfo.start,
      end: selectInfo.end,
      allDay: selectInfo.allDay
    } );
    setShowEventModal( true );
  };

  const handleEventClick = ( clickInfo ) =>
  {
    const event = clickInfo.event;
    setSelectedEvent( {
      id: event.id,
      title: event.title,
      start: event.start,
      end: event.end,
      allDay: event.allDay,
      ...event.extendedProps
    } );
    setShowEventModal( true );
  };

  const handleEventDrop = ( dropInfo ) =>
  {
    const event = dropInfo.event;
    const eventData = {
      id: event.id,
      title: event.title,
      start_date: event.start.toISOString(),
      end_date: event.end ? event.end.toISOString() : event.start.toISOString(),
      ...event.extendedProps
    };

    saveEventMutation.mutate( eventData );
  };

  const handleEventResize = ( resizeInfo ) =>
  {
    const event = resizeInfo.event;
    const eventData = {
      id: event.id,
      title: event.title,
      start_date: event.start.toISOString(),
      end_date: event.end.toISOString(),
      ...event.extendedProps
    };

    saveEventMutation.mutate( eventData );
  };

  const navigateCalendar = ( direction ) =>
  {
    const calendarApi = calendarRef.current.getApi();
    if ( direction === 'prev' )
    {
      calendarApi.prev();
    } else if ( direction === 'next' )
    {
      calendarApi.next();
    } else if ( direction === 'today' )
    {
      calendarApi.today();
    }
    setCurrentDate( calendarApi.getDate() );
  };

  const changeView = ( view ) =>
  {
    setCurrentView( view );
    const calendarApi = calendarRef.current.getApi();
    calendarApi.changeView( view );
  };

  const formatDate = ( date ) =>
  {
    return new Date( date ).toLocaleDateString( 'pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    } );
  };

  if ( isLoading )
  {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */ }
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Calendar className="w-8 h-8 mr-3 text-blue-600" />
            Calendário Profissional
          </h1>
          <p className="text-gray-600">
            Gerencie sua agenda com drag-and-drop e otimização quântica
          </p>
        </div>

        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={ () => optimizeScheduleMutation.mutate() }
            disabled={ optimizeScheduleMutation.isLoading }
            className="flex items-center space-x-2"
          >
            { optimizeScheduleMutation.isLoading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            ) }
            <span>Otimizar Agenda</span>
          </Button>

          <Button onClick={ () => setShowEventModal( true ) } className="flex items-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>Novo Evento</span>
          </Button>
        </div>
      </div>

      {/* Statistics */ }
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Eventos Este Mês</p>
                <p className="text-2xl font-bold text-blue-600">
                  { events.length }
                </p>
              </div>
              <Calendar className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tarefas Pendentes</p>
                <p className="text-2xl font-bold text-green-600">
                  { tasks.filter( t => t.status !== 'completed' ).length }
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Reuniões Hoje</p>
                <p className="text-2xl font-bold text-purple-600">
                  { events.filter( e =>
                    new Date( e.start_date ).toDateString() === new Date().toDateString() &&
                    e.event_type === 'meeting'
                  ).length }
                </p>
              </div>
              <Users className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Otimizações IA</p>
                <p className="text-2xl font-bold text-orange-600">
                  { events.filter( e => e.quantum_enhanced ).length }
                </p>
              </div>
              <Brain className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */ }
      <div className="flex justify-between items-center mb-6">
        {/* Navigation */ }
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={ () => navigateCalendar( 'prev' ) }>
            <ChevronLeft className="w-4 h-4" />
          </Button>

          <Button variant="outline" onClick={ () => navigateCalendar( 'today' ) }>
            Hoje
          </Button>

          <Button variant="outline" onClick={ () => navigateCalendar( 'next' ) }>
            <ChevronRight className="w-4 h-4" />
          </Button>

          <h2 className="text-xl font-semibold ml-4">
            { formatDate( currentDate ) }
          </h2>
        </div>

        {/* View Controls */ }
        <div className="flex items-center space-x-2">
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
            <Button
              size="sm"
              variant={ currentView === VIEW_MODES.MONTH ? 'default' : 'ghost' }
              onClick={ () => changeView( VIEW_MODES.MONTH ) }
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant={ currentView === VIEW_MODES.WEEK ? 'default' : 'ghost' }
              onClick={ () => changeView( VIEW_MODES.WEEK ) }
            >
              <BarChart3 className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant={ currentView === VIEW_MODES.DAY ? 'default' : 'ghost' }
              onClick={ () => changeView( VIEW_MODES.DAY ) }
            >
              <Clock className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant={ currentView === VIEW_MODES.LIST ? 'default' : 'ghost' }
              onClick={ () => changeView( VIEW_MODES.LIST ) }
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Filters */ }
      <div className="flex space-x-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar eventos e tarefas..."
            value={ searchTerm }
            onChange={ ( e ) => setSearchTerm( e.target.value ) }
            className="pl-10"
          />
        </div>

        <select
          value={ filterType }
          onChange={ ( e ) => setFilterType( e.target.value ) }
          className="px-3 py-2 border border-gray-300 rounded-md"
        >
          <option value="all">Todos</option>
          <option value="events">Eventos</option>
          <option value="tasks">Tarefas</option>
          <option value="meeting">Reuniões</option>
          <option value="appointment">Compromissos</option>
          <option value="deadline">Prazos</option>
        </select>
      </div>

      {/* Calendar */ }
      <Card className="mb-8">
        <CardContent className="p-6">
          <FullCalendar
            ref={ calendarRef }
            plugins={ [ dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin ] }
            headerToolbar={ false }
            initialView={ currentView }
            editable={ true }
            selectable={ true }
            selectMirror={ true }
            dayMaxEvents={ true }
            weekends={ settings.weekends !== false }
            events={ filteredEvents }
            select={ handleDateSelect }
            eventClick={ handleEventClick }
            eventDrop={ handleEventDrop }
            eventResize={ handleEventResize }
            businessHours={ {
              startTime: settings.workingHours?.start || '09:00',
              endTime: settings.workingHours?.end || '18:00',
              daysOfWeek: [ 1, 2, 3, 4, 5 ]
            } }
            slotMinTime="06:00:00"
            slotMaxTime="22:00:00"
            height="600px"
            locale="pt-br"
            timeZone={ settings.timeZone || 'America/Sao_Paulo' }
            eventDisplay="block"
            dayHeaderFormat={ { weekday: 'short', day: 'numeric' } }
            slotLabelFormat={ {
              hour: '2-digit',
              minute: '2-digit',
              hour12: false
            } }
            eventTimeFormat={ {
              hour: '2-digit',
              minute: '2-digit',
              hour12: false
            } }
            eventDidMount={ ( info ) =>
            {
              // Adicionar tooltip
              info.el.title = info.event.extendedProps.description || info.event.title;

              // Adicionar indicadores visuais
              if ( info.event.extendedProps.quantumEnhanced )
              {
                const sparkle = document.createElement( 'span' );
                sparkle.innerHTML = '✨';
                sparkle.style.position = 'absolute';
                sparkle.style.top = '2px';
                sparkle.style.right = '2px';
                sparkle.style.fontSize = '10px';
                info.el.style.position = 'relative';
                info.el.appendChild( sparkle );
              }
            } }
          />
        </CardContent>
      </Card>

      {/* Event Types Legend */ }
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Legenda</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            { Object.entries( EVENT_TYPES ).map( ( [ key, type ] ) => (
              <div key={ key } className="flex items-center space-x-2">
                <div
                  className="w-4 h-4 rounded"
                  style={ { backgroundColor: EVENT_COLORS[ type ] } }
                ></div>
                <span className="text-sm capitalize">{ type.replace( '_', ' ' ) }</span>
              </div>
            ) ) }
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
