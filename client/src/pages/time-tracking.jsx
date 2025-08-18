/**
 * PÁGINA DE TIME TRACKING E PRODUTIVIDADE
 * Sistema completo de controle de tempo com métricas e relatórios
 * 100% JavaScript - SEM TYPESCRIPT
 */

import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  Timer,
  Play,
  Pause,
  Square,
  Clock,
  BarChart3,
  Calendar,
  Target,
  TrendingUp,
  Activity,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Settings,
  Download,
  Upload,
  Filter,
  Search,
  Edit,
  Trash2,
  Eye,
  Users,
  Zap,
  Brain,
  Gauge,
  PieChart,
  LineChart,
  Award,
  Coffee,
  Moon,
  Sun,
  Laptop,
  Smartphone
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/use-toast';

const TIME_CATEGORIES = {
  WORK: 'work',
  MEETING: 'meeting',
  BREAK: 'break',
  LEARNING: 'learning',
  ADMIN: 'admin',
  PERSONAL: 'personal'
};

const CATEGORY_COLORS = {
  work: 'bg-blue-100 text-blue-800',
  meeting: 'bg-purple-100 text-purple-800',
  break: 'bg-green-100 text-green-800',
  learning: 'bg-orange-100 text-orange-800',
  admin: 'bg-gray-100 text-gray-800',
  personal: 'bg-pink-100 text-pink-800'
};

const CATEGORY_ICONS = {
  work: Laptop,
  meeting: Users,
  break: Coffee,
  learning: Brain,
  admin: Settings,
  personal: Smartphone
};

export default function TimeTrackingPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const timerRef = useRef(null);
  
  const [activeTimer, setActiveTimer] = useState(null);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(TIME_CATEGORIES.WORK);
  const [description, setDescription] = useState('');
  const [activeView, setActiveView] = useState('timer');
  const [dateRange, setDateRange] = useState('today');
  const [searchTerm, setSearchTerm] = useState('');

  // Query para sessões de tempo
  const { data: timeSessionsData, isLoading } = useQuery({
    queryKey: ['time-sessions', dateRange, searchTerm],
    queryFn: async () => {
      const params = new URLSearchParams({
        range: dateRange,
        ...(searchTerm && { search: searchTerm }),
        limit: 100
      });

      const response = await fetch(`/api/time-tracking/sessions?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao carregar sessões de tempo');
      }

      return response.json();
    },
    enabled: !!user
  });

  // Query para métricas de produtividade
  const { data: metricsData } = useQuery({
    queryKey: ['productivity-metrics', dateRange],
    queryFn: async () => {
      const response = await fetch(`/api/time-tracking/metrics?range=${dateRange}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao carregar métricas');
      }

      return response.json();
    },
    enabled: !!user
  });

  // Query para tarefas ativas
  const { data: tasksData } = useQuery({
    queryKey: ['active-tasks'],
    queryFn: async () => {
      const response = await fetch('/api/tasks?status=in_progress&limit=20', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao carregar tarefas');
      }

      return response.json();
    },
    enabled: !!user
  });

  // Mutation para iniciar/parar timer
  const timerMutation = useMutation({
    mutationFn: async ({ action, data }) => {
      const response = await fetch('/api/time-tracking/timer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({ action, ...data })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro no timer');
      }

      return response.json();
    },
    onSuccess: (data, variables) => {
      if (variables.action === 'start') {
        toast({
          title: 'Timer iniciado',
          description: 'Controle de tempo ativado.'
        });
      } else if (variables.action === 'stop') {
        toast({
          title: 'Timer parado',
          description: `Sessão de ${formatTime(timerSeconds)} registrada.`
        });
      }
      queryClient.invalidateQueries(['time-sessions']);
      queryClient.invalidateQueries(['productivity-metrics']);
    },
    onError: (error) => {
      toast({
        title: 'Erro no timer',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  const timeSessions = timeSessionsData?.data?.sessions || [];
  const metrics = metricsData?.data || {};
  const tasks = tasksData?.data?.tasks || [];

  // Timer functions
  const startTimer = () => {
    if (!selectedCategory) {
      toast({
        title: 'Selecione uma categoria',
        description: 'Escolha uma categoria antes de iniciar o timer.',
        variant: 'destructive'
      });
      return;
    }

    setActiveTimer(true);
    setTimerSeconds(0);
    
    timerRef.current = setInterval(() => {
      setTimerSeconds(prev => prev + 1);
    }, 1000);

    timerMutation.mutate({
      action: 'start',
      data: {
        category: selectedCategory,
        task_id: selectedTask?.id,
        description: description
      }
    });
  };

  const pauseTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setActiveTimer(false);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    if (timerSeconds > 0) {
      timerMutation.mutate({
        action: 'stop',
        data: {
          duration: timerSeconds,
          category: selectedCategory,
          task_id: selectedTask?.id,
          description: description
        }
      });
    }
    
    setActiveTimer(null);
    setTimerSeconds(0);
    setDescription('');
    setSelectedTask(null);
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const getTotalTimeByCategory = (category) => {
    return timeSessions
      .filter(session => session.category === category)
      .reduce((total, session) => total + session.duration, 0);
  };

  const getProductivityScore = () => {
    const workTime = getTotalTimeByCategory('work');
    const totalTime = timeSessions.reduce((total, session) => total + session.duration, 0);
    
    if (totalTime === 0) return 0;
    return Math.round((workTime / totalTime) * 100);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Timer className="w-8 h-8 mr-3 text-blue-600" />
            Time Tracking & Produtividade
          </h1>
          <p className="text-gray-600">
            Controle seu tempo e monitore sua produtividade
          </p>
        </div>
        
        <div className="flex space-x-2">
          <Button variant="outline" className="flex items-center space-x-2">
            <Download className="w-4 h-4" />
            <span>Exportar</span>
          </Button>
          
          <Button variant="outline" className="flex items-center space-x-2">
            <Settings className="w-4 h-4" />
            <span>Configurações</span>
          </Button>
        </div>
      </div>

      {/* Timer Widget */}
      <Card className="mb-8 border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardContent className="p-8">
          <div className="text-center">
            <div className="text-6xl font-mono font-bold text-blue-600 mb-6">
              {formatTime(timerSeconds)}
            </div>
            
            <div className="flex justify-center space-x-4 mb-6">
              {!activeTimer ? (
                <Button
                  size="lg"
                  onClick={startTimer}
                  className="px-8 py-3 text-lg"
                  disabled={timerMutation.isLoading}
                >
                  <Play className="w-6 h-6 mr-2" />
                  Iniciar
                </Button>
              ) : (
                <>
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={pauseTimer}
                    className="px-6 py-3"
                  >
                    <Pause className="w-5 h-5 mr-2" />
                    Pausar
                  </Button>
                  
                  <Button
                    size="lg"
                    variant="destructive"
                    onClick={stopTimer}
                    className="px-6 py-3"
                  >
                    <Square className="w-5 h-5 mr-2" />
                    Parar
                  </Button>
                </>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categoria
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  disabled={activeTimer}
                >
                  {Object.entries(TIME_CATEGORIES).map(([key, value]) => (
                    <option key={key} value={value}>
                      {value.charAt(0).toUpperCase() + value.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tarefa (Opcional)
                </label>
                <select
                  value={selectedTask?.id || ''}
                  onChange={(e) => {
                    const task = tasks.find(t => t.id === e.target.value);
                    setSelectedTask(task);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  disabled={activeTimer}
                >
                  <option value="">Selecionar tarefa...</option>
                  {tasks.map(task => (
                    <option key={task.id} value={task.id}>
                      {task.title}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descrição
                </label>
                <Input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="O que você está fazendo?"
                  disabled={activeTimer}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tempo Hoje</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatDuration(metrics.todayTotal || 0)}
                </p>
              </div>
              <Clock className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Esta Semana</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatDuration(metrics.weekTotal || 0)}
                </p>
              </div>
              <Calendar className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Produtividade</p>
                <p className="text-2xl font-bold text-purple-600">
                  {getProductivityScore()}%
                </p>
              </div>
              <Gauge className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Sessões</p>
                <p className="text-2xl font-bold text-orange-600">
                  {timeSessions.length}
                </p>
              </div>
              <Activity className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeView} onValueChange={setActiveView}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="timer">Timer</TabsTrigger>
          <TabsTrigger value="sessions">Sessões</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="reports">Relatórios</TabsTrigger>
        </TabsList>

        <TabsContent value="timer" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Tempo por Categoria Hoje</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(TIME_CATEGORIES).map(([key, category]) => {
                    const time = getTotalTimeByCategory(category);
                    const Icon = CATEGORY_ICONS[category];
                    
                    return (
                      <div key={key} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Icon className="w-5 h-5 text-gray-600" />
                          <span className="font-medium capitalize">{category}</span>
                        </div>
                        <Badge className={CATEGORY_COLORS[category]}>
                          {formatDuration(time)}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tarefas Ativas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {tasks.slice(0, 5).map(task => (
                    <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{task.title}</p>
                        <p className="text-sm text-gray-600">{task.project_name}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedTask(task);
                          setSelectedCategory('work');
                        }}
                      >
                        <Timer className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sessions" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Sessões de Tempo</CardTitle>
                <div className="flex space-x-2">
                  <select
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="today">Hoje</option>
                    <option value="week">Esta Semana</option>
                    <option value="month">Este Mês</option>
                    <option value="year">Este Ano</option>
                  </select>
                  
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Buscar sessões..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-3">
                {timeSessions.map(session => {
                  const Icon = CATEGORY_ICONS[session.category];
                  
                  return (
                    <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <Icon className="w-5 h-5 text-gray-600" />
                        <div>
                          <p className="font-medium">
                            {session.description || session.task_title || 'Sem descrição'}
                          </p>
                          <p className="text-sm text-gray-600">
                            {new Date(session.start_time).toLocaleString('pt-BR')}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <Badge className={CATEGORY_COLORS[session.category]}>
                          {session.category}
                        </Badge>
                        <span className="font-medium">
                          {formatDuration(session.duration)}
                        </span>
                        <Button size="sm" variant="outline">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Distribuição por Categoria</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(TIME_CATEGORIES).map(([key, category]) => {
                    const time = getTotalTimeByCategory(category);
                    const total = timeSessions.reduce((sum, s) => sum + s.duration, 0);
                    const percentage = total > 0 ? (time / total) * 100 : 0;
                    
                    return (
                      <div key={key} className="space-y-2">
                        <div className="flex justify-between">
                          <span className="font-medium capitalize">{category}</span>
                          <span className="text-sm text-gray-600">
                            {formatDuration(time)} ({percentage.toFixed(1)}%)
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tendências Semanais</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <LineChart className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p>Gráfico de tendências</p>
                  <p className="text-sm">Em desenvolvimento</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="reports" className="mt-6">
          <Card>
            <CardContent className="text-center py-12">
              <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Relatórios Detalhados
              </h3>
              <p className="text-gray-600">
                Relatórios de produtividade em desenvolvimento
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
