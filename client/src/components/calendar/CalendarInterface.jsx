import React, { useState, useEffect, useRef, useCallback } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import multiMonthPlugin from '@fullcalendar/multimonth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { useToast } from '@/hooks/use-toast';
import {  
  Calendar as CalendarIcon,
  Users,
  Phone,
  Video,
  Clock,
  Bell,
  Atom,
  Brain,
  Grid3X3,
  List,
  Eye,
  Trash2,
  Edit2,
  CheckSquare,
  Plus,
  Users,
  CheckSquare,
  Clock,
  AlertTriangle,
  Play,
  Pause,
  Settings,
  Calendar,
  MessageCircle,
  BarChart3,
  Target,
  Timer,
  Activity,
  UserCheck,
  Zap,
  Filter,
  Search,
  MoreHorizontal,
  Menu,
  X,
  Check,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  PlusCircle,
  MinusCircle,
  XCircle,
  CheckCircle,
  AlertCircle,
  Info,
  HelpCircle,
  Settings,
  User,
  Users,
  UserPlus,
  UserMinus,
  UserCheck,
  UserX,
  UserCheck,
  UserX,
  UserCheck,
  UserX,
  UserCheck,
  UserX,
  UserCheck,
  UserX,
  UserCheck,
  UserX,
  UserCheck,
  UserX,
  UserCheck,
  UserX,
  UserCheck,
  UserX,
  UserCheck,
  UserX,
  UserCheck,
  UserX,
  UserCheck,
  UserX,
  UserCheck,
  UserX,
  UserCheck,
  UserX,
  Filter

} from 'lucide-react';

// Importar sistema quântico integrado
import quantumSystemCore from '@/core/QuantumSystemCore';
import milaOmnipresence from '@/core/MilaOmnipresence';
import universalWorkflowEngine from '@/core/UniversalWorkflowEngine';

const EVENT_TYPES = {
  MEETING: { label: 'Reunião', color: '#3B82F6', icon: Users },
  CALL: { label: 'Chamada', color: '#10B981', icon: Phone },
  VIDEO_CALL: { label: 'Vídeo Chamada', color: '#8B5CF6', icon: Video },
  TASK: { label: 'Tarefa', color: '#F59E0B', icon: Clock },
  REMINDER: { label: 'Lembrete', color: '#EF4444', icon: Bell },
  PERSONAL: { label: 'Pessoal', color: '#6B7280', icon: CalendarIcon },
  QUANTUM: { label: 'Processamento Quântico', color: '#EC4899', icon: Atom },
  MILA: { label: 'Sessão MILA', color: '#7C3AED', icon: Brain }
};

const VIEW_MODES = {
  dayGridMonth: { label: 'Mês', icon: Grid3X3 },
  timeGridWeek: { label: 'Semana', icon: CalendarIcon },
  timeGridDay: { label: 'Dia', icon: Clock },
  listWeek: { label: 'Lista', icon: List },
  multiMonthYear: { label: 'Ano', icon: Eye }
};

export default function CalendarInterface({ 
  isOpen = true, 
  onClose,
  currentUser = null,
  integrations = {}
}) {
  const { toast } = useToast();
  const calendarRef = useRef(null);
  
  // Estado do calendário
  const [events, setEvents] = useState([]);
  const [currentView, setCurrentView] = useState('timeGridWeek');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(false);
  
  // Estado de filtros
  const [filters, setFilters] = useState({
    eventTypes: Object.keys(EVENT_TYPES),
    users: [],
    search: '',
    dateRange: null
  });
  
  // Estado de criação/edição
  const [showEventDialog, setShowEventDialog] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    start: new Date(),
    end: new Date(),
    type: 'MEETING',
    location: '',
    attendees: [],
    isRecurring: false,
    recurrenceRule: '',
    reminders: [15], // minutos antes
    isPrivate: false,
    quantumEnhanced: true,
    milaAssisted: true
  });
  
  // Estado de configurações
  const [calendarSettings, setCalendarSettings] = useState({
    workingHours: { start: '09:00', end: '18:00' },
    weekends: true,
    timeZone: 'America/Sao_Paulo',
    defaultView: 'timeGridWeek',
    quantumOptimization: true,
    milaInsights: true,
    autoScheduling: true
  });
  
  // Estado MILA e Quantum
  const [milaActive, setMilaActive] = useState(true);
  const [milaInsights, setMilaInsights] = useState([]);
  const [quantumOptimizations, setQuantumOptimizations] = useState({});

  useEffect(() => {
    if (isOpen) {
      initializeQuantumCalendar();
      loadEvents();
      setupMilaObservation();
    }
  }, [isOpen]);

  const initializeQuantumCalendar = async () => ({ try {
      console.log('📅⚛️ Inicializando Calendário Quântico...');
      
      // Conectar ao sistema quântico
      quantumSystemCore.connectModule('calendar', {
        receiveQuantumUpdate: (result }) => {
          if (result.scheduleOptimizations) {
            setQuantumOptimizations(result.scheduleOptimizations);
            applyQuantumOptimizations(result.scheduleOptimizations);
          }
          
          if (result.automaticInsights) {
            setMilaInsights(prev => [...prev, ...result.automaticInsights]);
          }
        }
      });

      // Processar otimizações de agenda
      const quantumResult = await quantumSystemCore.processQuantumOperation({
        type: 'schedule_optimization',
        data: {
          currentEvents: events.length,
          workingHours: calendarSettings.workingHours,
          preferences: calendarSettings
        },
        complexity: 3
      });

      setQuantumOptimizations(quantumResult);

      console.log('✅ Calendário Quântico inicializado');
      
    } catch (error) {
      console.error('❌ Erro na inicialização do calendário:', error);
    }
  };

  const setupMilaObservation = () => ({ // Observar interações do calendário
    const observeCalendarInteraction = (action, data }) => {
      milaOmnipresence.observeUserInteraction({
        type: 'calendar_interaction',
        module: 'calendar',
        action,
        data,
        userId: currentUser?.id,
        timestamp: new Date()
      });
    };

    // Configurar observadores
    window.calendarObserver = observeCalendarInteraction;
  };

  const loadEvents = async () => {
    try {
      setLoading(true);
      
      // Simular carregamento de eventos
      const mockEvents = [
        {
          id: '1',
          title: 'Reunião de Planejamento',
          start: new Date(2024, 11, 20, 10, 0),
          end: new Date(2024, 11, 20, 11, 30),
          type: 'MEETING',
          description: 'Planejamento estratégico Q1 2025',
          location: 'Sala de Reuniões A',
          attendees: ['user1', 'user2'],
          backgroundColor: EVENT_TYPES.MEETING.color
        },
        {
          id: '2',
          title: 'Processamento Quântico - Relatórios',
          start: new Date(2024, 11, 21, 14, 0),
          end: new Date(2024, 11, 21, 15, 0),
          type: 'QUANTUM',
          description: 'Otimização quântica de relatórios mensais',
          backgroundColor: EVENT_TYPES.QUANTUM.color,
          quantumEnhanced: true
        },
        {
          id: '3',
          title: 'Sessão MILA - Análise Preditiva',
          start: new Date(2024, 11, 22, 9, 0),
          end: new Date(2024, 11, 22, 10, 0),
          type: 'MILA',
          description: 'Análise preditiva de vendas com MILA',
          backgroundColor: EVENT_TYPES.MILA.color,
          milaGenerated: true
        }
      ];
      
      setEvents(mockEvents);
      
      // Processar eventos com MILA
      if (milaActive) {
        const insights = await generateCalendarInsights(mockEvents);
        setMilaInsights(insights);
      }
      
    } catch (error) {
      console.error('❌ Erro ao carregar eventos:', error);
      toast({
        title: "Erro ao carregar eventos",
        description: "Falha ao obter eventos do calendário",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const generateCalendarInsights = async (events) => {
    try {
      // Simular insights MILA
      const insights = [
        {
          type: 'schedule_optimization',
          message: 'Detectei 3 conflitos potenciais na sua agenda desta semana',
          confidence: 0.85,
          action: 'suggest_reschedule'
        },
        {
          type: 'productivity_pattern',
          message: 'Suas reuniões mais produtivas acontecem entre 10h-12h',
          confidence: 0.92,
          action: 'optimize_timing'
        },
        {
          type: 'workload_balance',
          message: 'Quinta-feira está sobrecarregada. Sugiro redistribuir 2 tarefas',
          confidence: 0.78,
          action: 'balance_workload'
        }
      ];
      
      return insights;
    } catch (error) {
      console.error('❌ Erro ao gerar insights:', error);
      return [];
    }
  };

  const applyQuantumOptimizations = (optimizations) => {
    // Aplicar otimizações quânticas no calendário
    if (optimizations.suggestedTimes) {
      console.log('Aplicando otimizações de horário:', optimizations.suggestedTimes);
    }
    
    if (optimizations.conflictResolution) {
      console.log('Resolvendo conflitos:', optimizations.conflictResolution);
    }
  };

  const handleDateSelect = useCallback((selectInfo) => {
    // Observar seleção de data
    window.calendarObserver?.('date_select', {
      start: selectInfo.start,
      end: selectInfo.end,
      view: currentView
    });

    setEventForm({
      ...eventForm,
      start: selectInfo.start,
      end: selectInfo.end || new Date(selectInfo.start.getTime() + 60 * 60 * 1000) // 1 hora padrão
    });
    setSelectedEvent(null);
    setShowEventDialog(true);
  }, [eventForm, currentView]);

  const handleEventClick = useCallback((clickInfo) => {
    const event = clickInfo.event;
    
    // Observar clique em evento
    window.calendarObserver?.('event_click', {
      eventId: event.id,
      title: event.title,
      type: event.extendedProps.type
    });

    setSelectedEvent({
      id: event.id,
      title: event.title,
      start: event.start,
      end: event.end,
      description: event.extendedProps.description || '',
      type: event.extendedProps.type || 'MEETING',
      location: event.extendedProps.location || '',
      attendees: event.extendedProps.attendees || [],
      backgroundColor: event.backgroundColor
    });
    setShowEventDialog(true);
  }, []);

  const handleEventDrop = useCallback(async (dropInfo) => {
    try {
      const event = dropInfo.event;
      
      // Observar movimentação de evento
      window.calendarObserver?.('event_move', {
        eventId: event.id,
        oldStart: dropInfo.oldEvent.start,
        newStart: event.start,
        delta: dropInfo.delta
      });

      // Processar com algoritmos quânticos
      if (calendarSettings.quantumOptimization) {
        const optimizationResult = await quantumSystemCore.processQuantumOperation({
          type: 'event_reschedule_optimization',
          data: {
            eventId: event.id,
            newStart: event.start,
            newEnd: event.end,
            conflictCheck: true
          },
          complexity: 2
        });

        if (optimizationResult.conflicts) {
          toast({
            title: "⚛️ Conflito Detectado",
            description: `Algoritmo quântico detectou ${optimizationResult.conflicts.length} conflitos`,
            variant: "destructive"
          });
          
          // Reverter se houver conflitos críticos
          if (optimizationResult.conflicts.some(c => c.severity === 'critical')) {
            dropInfo.revert();
            return;
          }
        }
      }

      // Atualizar evento
      const updatedEvents = events.map(e => 
        e.id === event.id 
          ? { ...e, start: event.start, end: event.end }
          : e
      );
      setEvents(updatedEvents);

      toast({
        title: "📅 Evento movido",
        description: `${event.title} reagendado com sucesso`
      });

    } catch (error) {
      console.error('❌ Erro ao mover evento:', error);
      dropInfo.revert();
    }
  }, [events, calendarSettings.quantumOptimization]);

  const handleEventResize = useCallback(async (resizeInfo) => {
    try {
      const event = resizeInfo.event;
      
      // Observar redimensionamento
      window.calendarObserver?.('event_resize', {
        eventId: event.id,
        oldEnd: resizeInfo.oldEvent.end,
        newEnd: event.end
      });

      // Atualizar evento
      const updatedEvents = events.map(e => 
        e.id === event.id 
          ? { ...e, end: event.end }
          : e
      );
      setEvents(updatedEvents);

      toast({
        title: "📅 Duração alterada",
        description: `Duração de ${event.title} atualizada`
      });

    } catch (error) {
      console.error('❌ Erro ao redimensionar evento:', error);
      resizeInfo.revert();
    }
  }, [events]);

  const saveEvent = async () => {
    try {
      if (!eventForm.title.trim()) {
        toast({
          title: "Título obrigatório",
          description: "Por favor, insira um título para o evento",
          variant: "destructive"
        });
        return;
      }

      // Processar com MILA se habilitado
      let milaEnhancements = {};
      if (eventForm.milaAssisted) {
        milaEnhancements = await enhanceEventWithMila(eventForm);
      }

      // Otimizar com algoritmos quânticos
      let quantumOptimizations = {};
      if (eventForm.quantumEnhanced) {
        quantumOptimizations = await quantumSystemCore.processQuantumOperation({
          type: 'event_optimization',
          data: {
            title: eventForm.title,
            duration: eventForm.end - eventForm.start,
            attendees: eventForm.attendees.length,
            type: eventForm.type
          },
          complexity: 2
        });
      }

      const newEvent = {
        id: selectedEvent?.id || `event_${Date.now()}`,
        title: eventForm.title,
        start: eventForm.start,
        end: eventForm.end,
        description: eventForm.description,
        type: eventForm.type,
        location: eventForm.location,
        attendees: eventForm.attendees,
        backgroundColor: EVENT_TYPES[eventForm.type].color,
        borderColor: EVENT_TYPES[eventForm.type].color,
        textColor: '#ffffff',
        extendedProps: {
          type: eventForm.type,
          description: eventForm.description,
          location: eventForm.location,
          attendees: eventForm.attendees,
          isPrivate: eventForm.isPrivate,
          quantumEnhanced: eventForm.quantumEnhanced,
          milaAssisted: eventForm.milaAssisted,
          milaEnhancements,
          quantumOptimizations
        }
      };

      if (selectedEvent) {
        // Atualizar evento existente
        setEvents(events.map(e => e.id === selectedEvent.id ? newEvent : e));
        
        // Observar edição
        window.calendarObserver?.('event_edit', {
          eventId: selectedEvent.id,
          changes: newEvent
        });
        
        toast({
          title: "📅 Evento atualizado",
          description: "Evento editado com sucesso"
        });
      } else {
        // Criar novo evento
        setEvents([...events, newEvent]);
        
        // Observar criação
        window.calendarObserver?.('event_create', {
          eventId: newEvent.id,
          event: newEvent
        });
        
        toast({
          title: "📅 Evento criado",
          description: "Novo evento adicionado ao calendário"
        });

        // Criar workflow automático se necessário
        if (eventForm.type === 'MEETING' && eventForm.attendees.length > 1) {
          await universalWorkflowEngine.createAutomaticWorkflow({
            type: 'meeting_preparation',
            data: {
              eventId: newEvent.id,
              attendees: eventForm.attendees,
              meetingTime: eventForm.start
            },
            source: 'calendar'
          });
        }
      }

      setShowEventDialog(false);
      resetEventForm();

    } catch (error) {
      console.error('❌ Erro ao salvar evento:', error);
      toast({
        title: "Erro ao salvar",
        description: "Falha ao salvar evento",
        variant: "destructive"
      });
    }
  };

  const enhanceEventWithMila = async (eventData) => {
    try {
      // Simular melhorias MILA
      const enhancements = {
        suggestedDuration: eventData.type === 'MEETING' ? 45 : 30, // minutos
        optimalTime: '10:00', // horário mais produtivo
        preparationTasks: [
          'Revisar agenda anterior',
          'Preparar materiais de apresentação',
          'Confirmar presença dos participantes'
        ],
        followUpActions: [
          'Enviar resumo da reunião',
          'Agendar próximos passos',
          'Atualizar status do projeto'
        ]
      };
      
      return enhancements;
    } catch (error) {
      console.error('❌ Erro ao processar com MILA:', error);
      return {};
    }
  };

  const deleteEvent = async () => {
    try {
      if (!selectedEvent) return;

      setEvents(events.filter(e => e.id !== selectedEvent.id));
      
      // Observar exclusão
      window.calendarObserver?.('event_delete', {
        eventId: selectedEvent.id,
        title: selectedEvent.title
      });

      toast({
        title: "📅 Evento excluído",
        description: "Evento removido do calendário"
      });

      setShowEventDialog(false);
      resetEventForm();

    } catch (error) {
      console.error('❌ Erro ao excluir evento:', error);
    }
  };

  const resetEventForm = () => {
    setEventForm({
      title: '',
      description: '',
      start: new Date(),
      end: new Date(),
      type: 'MEETING',
      location: '',
      attendees: [],
      isRecurring: false,
      recurrenceRule: '',
      reminders: [15],
      isPrivate: false,
      quantumEnhanced: true,
      milaAssisted: true
    });
    setSelectedEvent(null);
  };

  const changeView = (view) => {
    setCurrentView(view);
    const calendarApi = calendarRef.current?.getApi();
    if (calendarApi) {
      calendarApi.changeView(view);
    }
    
    // Observar mudança de visualização
    window.calendarObserver?.('view_change', {
      newView: view,
      date: selectedDate
    });
  };

  const navigateCalendar = (direction) => {
    const calendarApi = calendarRef.current?.getApi();
    if (calendarApi) {
      if (direction === 'prev') {
        calendarApi.prev();
      } else if (direction === 'next') {
        calendarApi.next();
      } else if (direction === 'today') {
        calendarApi.today();
      }
      
      setSelectedDate(calendarApi.getDate());
    }
  };

  const exportCalendar = async () => {
    try {
      // Simular exportação
      const exportData = {
        events: events,
        settings: calendarSettings,
        exportedAt: new Date(),
        format: 'ics'
      };
      
      // Observar exportação
      window.calendarObserver?.('calendar_export', {
        eventCount: events.length,
        format: 'ics'
      });

      toast({
        title: "📅 Calendário exportado",
        description: "Arquivo ICS gerado com sucesso"
      });

    } catch (error) {
      console.error('❌ Erro na exportação:', error);
    }
  };

  const syncWithExternalCalendar = async (provider) => {
    try {
      // Simular sincronização`
      console.log(`Sincronizando com ${provider}...`);
      
      // Observar sincronização
      window.calendarObserver?.('calendar_sync', {
        provider,
        eventCount: events.length
      });

      toast({`
        title: `📅 Sincronizado com ${provider}`,
        description: "Calendário sincronizado com sucesso"
      });

    } catch (error) {
      console.error('❌ Erro na sincronização:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border-b">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            📅 Calendário Inteligente
          </h1>
          
          {quantumOptimizations.enabled && (
            <Badge variant="secondary" className="bg-purple-100 text-purple-800">
              <Atom className="w-3 h-3 mr-1" />
              Quantum Enhanced
            </Badge>
          )}
          
          {milaActive && (
            <Badge variant="outline" className="border-blue-500 text-blue-600">
              <Brain className="w-3 h-3 mr-1" />
              MILA Active
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Navegação */}
          <div className="flex items-center gap-1 mr-4">
            <Button
              variant="outline"
              size="sm"
              onClick=({ ( }) => navigateCalendar('prev')}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick=({ ( }) => navigateCalendar('today')}
            >
              <Today className="w-4 h-4 mr-1" />

            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick=({ ( }) => navigateCalendar('next')}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          {/* Visualizações */}
          <div className="flex items-center gap-1 mr-4">
            ({ Object.entries(VIEW_MODES).map(([view, config] }) => (
              <Button
                key={view}
                variant={currentView === view ? "default" : "outline"}
                size="sm"
                onClick=({ ( }) => changeView(view)}
              >
                {React.createElement(config.icon, { className: "w-4 h-4 mr-1" })}
                {config.label}
              </Button>
            ))}
          </div>

          {/* Ações */}
          <Button
            onClick=({ ( }) => setShowEventDialog(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Evento
          </Button>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-4">
                <h4 className="font-medium">Configurações</h4>
                
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={exportCalendar}
                    className="w-full justify-start"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Exportar Calendário
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick=({ ( }) => syncWithExternalCalendar('Google')}
                    className="w-full justify-start"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Sincronizar com Google
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick=({ ( }) => syncWithExternalCalendar('Outlook')}
                    className="w-full justify-start"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Sincronizar com Outlook
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* MILA Insights */}
      ({ milaInsights.length > 0 && (
        <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-b">
          <div className="flex items-center gap-2 mb-2">
            <Brain className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-medium text-purple-800 dark:text-purple-200">
              MILA Insights
            </span>
          </div>
          <div className="space-y-1">
            {milaInsights.slice(0, 2).map((insight, index }) => (
              <p key={index} className="text-sm text-purple-700 dark:text-purple-300">
                💡 {insight.message}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Calendário Principal */}
      <div className="flex-1 p-4">
        <Card className="h-full">
          <CardContent className="p-4 h-full">
            <FullCalendar
              ref={calendarRef}
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin, multiMonthPlugin]}
              headerToolbar={false}
              initialView={currentView}
              editable={true}
              selectable={true}
              selectMirror={true}
              dayMaxEvents={true}
              weekends={calendarSettings.weekends}
              events={events}
              select={handleDateSelect}
              eventClick={handleEventClick}
              eventDrop={handleEventDrop}
              eventResize={handleEventResize}
              businessHours={{
                startTime: calendarSettings.workingHours.start,
                endTime: calendarSettings.workingHours.end,
                daysOfWeek: [1, 2, 3, 4, 5]}
              }}
              slotMinTime="06:00:00"
              slotMaxTime="22:00:00"
              height="100%"
              locale="pt-br"
              timeZone={calendarSettings.timeZone}
              eventDisplay="block"
              dayHeaderFormat={{ weekday: 'short', day: 'numeric' }}
              slotLabelFormat={{
                hour: '2-digit',
                minute: '2-digit',
                hour12: false}
              }}
              eventTimeFormat={{
                hour: '2-digit',
                minute: '2-digit',
                hour12: false}
              }}
            />
          </CardContent>
        </Card>
      </div>

      {/* Dialog de Evento */}
      <Dialog open={showEventDialog} onOpenChange={setShowEventDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedEvent ? 'Editar Evento' : 'Novo Evento'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Título */}
            <div>
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                value={eventForm.title}
                onChange=({ (e }) => setEventForm({ ...eventForm, title: e.target.value })}
                placeholder="Digite o título do evento"
              />
            </div>

            {/* Tipo */}
            <div>
              <Label htmlFor="type">Tipo</Label>
              <Select
                value={eventForm.type}
                onValueChange=({ (value }) => setEventForm({ ...eventForm, type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  ({ Object.entries(EVENT_TYPES).map(([key, config] }) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center gap-2">
                        {React.createElement(config.icon, { 
                          className: "w-4 h-4",
                          style: { color: config.color }
                        })}
                        {config.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Data e Hora */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Data/Hora Início</Label>
                <Input
                  type="datetime-local"
                  value={eventForm.start.toISOString().slice(0, 16)}
                  onChange=({ (e }) => setEventForm({ 
                    ...eventForm, 
                    start: new Date(e.target.value) 
                  })}
                />
              </div>
              <div>
                <Label>Data/Hora Fim</Label>
                <Input
                  type="datetime-local"
                  value={eventForm.end.toISOString().slice(0, 16)}
                  onChange=({ (e }) => setEventForm({ 
                    ...eventForm, 
                    end: new Date(e.target.value) 
                  })}
                />
              </div>
            </div>

            {/* Descrição */}
            <div>
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={eventForm.description}
                onChange=({ (e }) => setEventForm({ ...eventForm, description: e.target.value })}
                placeholder="Descrição do evento"
                rows={3}
              />
            </div>

            {/* Local */}
            <div>
              <Label htmlFor="location">Local</Label>
              <Input
                id="location"
                value={eventForm.location}
                onChange=({ (e }) => setEventForm({ ...eventForm, location: e.target.value })}
                placeholder="Local do evento"
              />
            </div>

            {/* Opções Avançadas */}
            <div className="space-y-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <h4 className="font-medium text-sm">Opções Avançadas</h4>
              
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={eventForm.quantumEnhanced}
                    onChange=({ (e }) => setEventForm({ 
                      ...eventForm, 
                      quantumEnhanced: e.target.checked 
                    })}
                  />
                  <Atom className="w-4 h-4 text-purple-600" />
                  Otimização Quântica
                </label>
                
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={eventForm.milaAssisted}
                    onChange=({ (e }) => setEventForm({ 
                      ...eventForm, 
                      milaAssisted: e.target.checked 
                    })}
                  />
                  <Brain className="w-4 h-4 text-blue-600" />
                  Assistência MILA
                </label>
                
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={eventForm.isPrivate}
                    onChange=({ (e }) => setEventForm({ 
                      ...eventForm, 
                      isPrivate: e.target.checked 
                    })}
                  />
                  <EyeOff className="w-4 h-4 text-gray-600" />

                </label>
              </div>
            </div>

            {/* Ações */}
            <div className="flex justify-between pt-4">
              <div>
                {selectedEvent && (
                  <Button
                    variant="destructive"
                    onClick={deleteEvent}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />

                  </Button>
                )}
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick=({ ( }) => setShowEventDialog(false)}
                >

                </Button>
                <Button onClick={saveEvent}>
                  <Sparkles className="w-4 h-4 mr-2" />
                  {selectedEvent ? 'Atualizar' : 'Criar'} Evento
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
`