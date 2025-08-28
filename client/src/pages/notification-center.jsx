/**
 * CENTRO DE NOTIFICAÇÕES - TOIT NEXUS
 * Sistema completo de notificações em tempo real
 * 100% JavaScript - SEM TYPESCRIPT
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckboxWithLabel } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import {  
  Bell, 
  Mail, 
  MessageSquare,
  AlertTriangle,
  CheckCircle,
  Info,
  X,
  Eye,
  EyeOff,
  Settings,
  Filter,
  Search,
  Trash2,
  Archive,
  Star,
  Clock,
  User,
  Calendar,
  Zap,
  Smartphone,
  Monitor,
  Volume2,
  VolumeX,
  Pause,
  Play,
  RefreshCw,
  Download,
  MoreHorizontal,
  Send,
  Users,
  Target,
  Activity }
} from 'lucide-react';

const NotificationCenter = () => {
  const [notifications, setNotifications] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [channels, setChannels] = useState([]);
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    type: 'all',
    status: 'all',
    priority: 'all',
    channel: 'all'
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNotifications, setSelectedNotifications] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [realTimeEnabled, setRealTimeEnabled] = useState(true);
  
  const { toast } = useToast();

  // Tipos de notificação
  const notificationTypes = [
    {
      id: 'info',
      name: 'Informação',
      icon: <Info className="h-4 w-4" />,
      color: 'text-blue-600 bg-blue-100',
      borderColor: 'border-blue-200'
    },
    {
      id: 'success',
      name: 'Sucesso',
      icon: <CheckCircle className="h-4 w-4" />,
      color: 'text-green-600 bg-green-100',
      borderColor: 'border-green-200'
    },
    {
      id: 'warning',
      name: 'Aviso',
      icon: <AlertTriangle className="h-4 w-4" />,
      color: 'text-yellow-600 bg-yellow-100',
      borderColor: 'border-yellow-200'
    },
    {
      id: 'error',
      name: 'Erro',
      icon: <X className="h-4 w-4" />,
      color: 'text-red-600 bg-red-100',
      borderColor: 'border-red-200'
    },
    {
      id: 'message',
      name: 'Mensagem',
      icon: <MessageSquare className="h-4 w-4" />,
      color: 'text-purple-600 bg-purple-100',
      borderColor: 'border-purple-200'
    }
  ];

  // Canais de notificação
  const notificationChannels = [
    {
      id: 'push',
      name: 'Push Notification',
      icon: <Bell className="h-4 w-4" />,
      description: 'Notificações push no navegador'
    },
    {
      id: 'email',
      name: 'Email',
      icon: <Mail className="h-4 w-4" />,
      description: 'Notificações por email'
    },
    {
      id: 'sms',
      name: 'SMS',
      icon: <Smartphone className="h-4 w-4" />,
      description: 'Notificações por SMS'
    },
    {
      id: 'in_app',
      name: 'In-App',
      icon: <Monitor className="h-4 w-4" />,
      description: 'Notificações dentro da aplicação'
    },
    {
      id: 'webhook',
      name: 'Webhook',
      icon: <Zap className="h-4 w-4" />,
      description: 'Notificações via webhook'
    }
  ];

  /**
   * CARREGAR NOTIFICAÇÕES
   */
  const loadNotifications = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/notifications', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao carregar notificações');
      }

      const data = await response.json();
      setNotifications(data.notifications || []);
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as notificações",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * MARCAR COMO LIDA
   */
  const markAsRead = async (notificationIds) => {
    try {
      const response = await fetch('/api/notifications/mark-read', {
        method: 'POST',
        headers: {`
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ notificationIds })
      });

      if (!response.ok) {
        throw new Error('Erro ao marcar como lida');
      }

      setNotifications(prev => prev.map(notification => 
        notificationIds.includes(notification.id)
          ? { ...notification, isRead: true }
          : notification
      ));
      
      toast({
        title: "Notificações marcadas",
        description: "Notificações marcadas como lidas",
      });
    } catch (error) {
      console.error('Erro ao marcar como lida:', error);
      toast({
        title: "Erro",
        description: "Não foi possível marcar as notificações",
        variant: "destructive"
      });
    }
  };

  /**
   * ARQUIVAR NOTIFICAÇÕES
   */
  const archiveNotifications = async (notificationIds) => {
    try {
      const response = await fetch('/api/notifications/archive', {
        method: 'POST',
        headers: {`
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ notificationIds })
      });

      if (!response.ok) {
        throw new Error('Erro ao arquivar notificações');
      }

      setNotifications(prev => prev.filter(notification => 
        !notificationIds.includes(notification.id)
      ));
      setSelectedNotifications([]);
      
      toast({
        title: "Notificações arquivadas",
        description: "Notificações arquivadas com sucesso",
      });
    } catch (error) {
      console.error('Erro ao arquivar:', error);
      toast({
        title: "Erro",
        description: "Não foi possível arquivar as notificações",
        variant: "destructive"
      });
    }
  };

  /**
   * DELETAR NOTIFICAÇÕES
   */
  const deleteNotifications = async (notificationIds) => {
    if (!confirm('Tem certeza que deseja deletar as notificações selecionadas?')) return;

    try {
      const response = await fetch('/api/notifications/delete', {
        method: 'DELETE',
        headers: {`
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ notificationIds })
      });

      if (!response.ok) {
        throw new Error('Erro ao deletar notificações');
      }

      setNotifications(prev => prev.filter(notification => 
        !notificationIds.includes(notification.id)
      ));
      setSelectedNotifications([]);
      
      toast({
        title: "Notificações deletadas",
        description: "Notificações deletadas com sucesso",
      });
    } catch (error) {
      console.error('Erro ao deletar:', error);
      toast({
        title: "Erro",
        description: "Não foi possível deletar as notificações",
        variant: "destructive"
      });
    }
  };

  /**
   * ENVIAR NOTIFICAÇÃO
   */
  const sendNotification = async (notificationData) => {
    try {
      const response = await fetch('/api/notifications/send', {
        method: 'POST',
        headers: {`
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(notificationData)
      });

      if (!response.ok) {
        throw new Error('Erro ao enviar notificação');
      }

      const data = await response.json();
      setNotifications(prev => [data.notification, ...prev]);
      
      toast({
        title: "Notificação enviada",
        description: "Notificação enviada com sucesso",
      });
    } catch (error) {
      console.error('Erro ao enviar notificação:', error);
      toast({
        title: "Erro",
        description: "Não foi possível enviar a notificação",
        variant: "destructive"
      });
    }
  };

  /**
   * CONFIGURAR NOTIFICAÇÕES EM TEMPO REAL
   */
  const setupRealTimeNotifications = () => {
    if (!realTimeEnabled) return;
`
    const eventSource = new EventSource(`/api/notifications/stream?token=${localStorage.getItem('token')}`);
    
    eventSource.onmessage = (event) => {
      const notification = JSON.parse(event.data);
      setNotifications(prev => [notification, ...prev]);
      
      // Mostrar notificação push se suportado
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(notification.title, {
          body: notification.message,
          icon: '/favicon.ico'
        });
      }
      
      // Mostrar toast
      toast({
        title: notification.title,
        description: notification.message,
      });
    };

    eventSource.onerror = (error) => {
      console.error('Erro no stream de notificações:', error);
      eventSource.close();
    };

    return () => eventSource.close();
  };

  /**
   * SOLICITAR PERMISSÃO PARA NOTIFICAÇÕES
   */
  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        toast({
          title: "Permissão concedida",
          description: "Notificações push ativadas",
        });
      }
    }
  };

  /**
   * FILTRAR NOTIFICAÇÕES
   */
  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filters.type === 'all' || notification.type === filters.type;
    const matchesStatus = filters.status === 'all' || 
                         (filters.status === 'read' && notification.isRead) ||
                         (filters.status === 'unread' && !notification.isRead);
    const matchesPriority = filters.priority === 'all' || notification.priority === filters.priority;
    const matchesChannel = filters.channel === 'all' || notification.channel === filters.channel;
    
    return matchesSearch && matchesType && matchesStatus && matchesPriority && matchesChannel;
  });

  /**
   * RENDERIZAR NOTIFICAÇÃO
   */
  const renderNotification = (notification) => {
    const notificationType = notificationTypes.find(type => type.id === notification.type);
    const isSelected = selectedNotifications.includes(notification.id);
    
    return (
      <div
        key={notification.id}`
        className={`p-4 border rounded-lg transition-colors ${
          notification.isRead ? 'bg-white' : 'bg-blue-50 border-blue-200'`}
        } ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
      >
        <div className="flex items-start gap-3">
          <CheckboxWithLabel
            checked={isSelected}
            onCheckedChange=({ (checked }) => {
              if (checked) {
                setSelectedNotifications(prev => [...prev, notification.id]);
              } else {
                setSelectedNotifications(prev => prev.filter(id => id !== notification.id));
              }
            }}
          />
          `
          <div className={`p-2 rounded-full ${notificationType?.color || 'text-gray-600 bg-gray-100'}`}>
            {notificationType?.icon || <Bell className="h-4 w-4" />}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">`
              <h4 className={`font-medium ${notification.isRead ? 'text-gray-700' : 'text-gray-900'}`}>
                {notification.title}
              </h4>
              <div className="flex items-center gap-2">
                {notification.priority === 'high' && (
                  <Badge variant="destructive" className="text-xs">Alta</Badge>
                )}
                {notification.priority === 'medium' && (
                  <Badge variant="default" className="text-xs">Média</Badge>
                )}
                <span className="text-xs text-gray-500">
                  {new Date(notification.createdAt).toLocaleString('pt-BR')}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick=({ ( }) => markAsRead([notification.id])}
                  className="h-6 w-6 p-0"
                >
                  {notification.isRead ? (
                    <EyeOff className="h-3 w-3" />
                  ) : (
                    <Eye className="h-3 w-3" />
                  )}
                </Button>
              </div>
            </div>
            `
            <p className={`text-sm mb-2 ${notification.isRead ? 'text-gray-600' : 'text-gray-800'}`}>
              {notification.message}
            </p>
            
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <User className="h-3 w-3" />
                {notification.sender || 'Sistema'}
              </div>
              <div className="flex items-center gap-1">
                {notificationChannels.find(c => c.id === notification.channel)?.icon}
                {notificationChannels.find(c => c.id === notification.channel)?.name || 'In-App'}
              </div>
              ({ notification.actionUrl && (
                <Button
                  variant="link"
                  size="sm"
                  className="h-auto p-0 text-xs text-blue-600"
                  onClick={( }) => window.open(notification.actionUrl, '_blank')}
                >
                  Ver detalhes
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  /**
   * OBTER ESTATÍSTICAS
   */
  const getStats = () => {
    const total = notifications.length;
    const unread = notifications.filter(n => !n.isRead).length;
    const today = notifications.filter(n => {
      const notificationDate = new Date(n.createdAt);
      const today = new Date();
      return notificationDate.toDateString() === today.toDateString();
    }).length;
    
    return { total, unread, today };
  };

  const stats = getStats();

  /**
   * CONFIGURAR COMPONENTE
   */
  useEffect(() => {
    loadNotifications();
    requestNotificationPermission();
    
    const cleanup = setupRealTimeNotifications();
    return cleanup;
  }, [realTimeEnabled]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Bell className="h-8 w-8 text-blue-600" />
                Centro de Notificações
              </h1>
              <p className="text-gray-600 mt-2">
                Gerencie todas as notificações do sistema
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick=({ ( }) => setRealTimeEnabled(!realTimeEnabled)}
              >
                {realTimeEnabled ? (
                  <>
                    <Pause className="h-4 w-4 mr-2" />
                    Pausar Tempo Real
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Ativar Tempo Real
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={loadNotifications}
                disabled={loading}
              >`
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />

              <Button
                onClick=({ ( }) => setShowCreateModal(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Send className="h-4 w-4 mr-2" />
                Enviar Notificação
              </Button>
            </div>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <Bell className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Não Lidas</p>
                  <p className="text-2xl font-bold text-red-600">{stats.unread}</p>
                </div>
                <Eye className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Hoje</p>
                  <p className="text-2xl font-bold text-green-600">{stats.today}</p>
                </div>
                <Calendar className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Tempo Real</p>`
                  <p className={`text-2xl font-bold ${realTimeEnabled ? 'text-green-600' : 'text-gray-600'}`}>
                    {realTimeEnabled ? 'Ativo' : 'Inativo'}
                  </p>
                </div>`
                <Activity className={`h-8 w-8 ${realTimeEnabled ? 'text-green-600' : 'text-gray-600'}`} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros e Ações */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar notificações..."
                    value={searchTerm}
                    onChange=({ (e }) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="flex gap-3">
                <select
                  value={filters.type}
                  onChange=({ (e }) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Todos os Tipos</option>
                  {notificationTypes.map(type => (
                    <option key={type.id} value={type.id}>{type.name}</option>
                  ))}
                </select>

                <select
                  value={filters.status}
                  onChange=({ (e }) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Todos os Status</option>
                  <option value="unread">Não Lidas</option>
                  <option value="read">Lidas</option>
                </select>

                <select
                  value={filters.priority}
                  onChange=({ (e }) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Todas as Prioridades</option>
                  <option value="high">Alta</option>
                  <option value="medium">Média</option>
                  <option value="low">Baixa</option>
                </select>
              </div>
            </div>

            {selectedNotifications.length > 0 && (
              <div className="flex items-center gap-3 mt-4 pt-4 border-t">
                <span className="text-sm text-gray-600">
                  {selectedNotifications.length} selecionadas
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick=({ ( }) => markAsRead(selectedNotifications)}
                >
                  <Eye className="h-3 w-3 mr-1" />
                  Marcar como Lidas
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick=({ ( }) => archiveNotifications(selectedNotifications)}
                >
                  <Archive className="h-3 w-3 mr-1" />

                <Button
                  variant="outline"
                  size="sm"
                  onClick=({ ( }) => deleteNotifications(selectedNotifications)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-3 w-3 mr-1" />

              </div>
            )}
          </CardContent>
        </Card>

        {/* Lista de Notificações */}
        <div className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2">Carregando notificações...</span>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Bell className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhuma notificação encontrada
                </h3>
                <p className="text-gray-500">
                  {searchTerm || Object.values(filters).some(f => f !== 'all') 
                    ? 'Tente ajustar os filtros de busca'
                    : 'Você não tem notificações no momento'
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredNotifications.map(renderNotification)
          )}
        </div>
      </div>

      {/* Modal de Criação - Será implementado na próxima parte */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Enviar Nova Notificação</h2>
            {/* Formulário será implementado na próxima parte */}
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick=({ ( }) => setShowCreateModal(false)}>

              <Button disabled={loading}>
                {loading ? 'Enviando...' : 'Enviar Notificação'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;
`