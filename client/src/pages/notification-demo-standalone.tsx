import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bell, Users, Workflow, BarChart3, CheckCircle, AlertCircle, AlertTriangle, Info, X, Check, CheckCheck } from 'lucide-react';
import toitNexusLogo from '@/assets/toit-nexus-logo.svg';

// Standalone notification types
interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// Toast notification component
function ToastNotification({ notification, onRemove, position }: { notification: Notification; onRemove: (id: string) => void; position: number }) {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (notification.duration) {
      const timer = setTimeout(() => {
        handleRemove();
      }, notification.duration);
      return () => clearTimeout(timer);
    }
  }, [notification.duration]);

  const getIcon = () => {
    switch (notification.type) {
      case 'success': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error': return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'info': default: return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getBorderColor = () => {
    switch (notification.type) {
      case 'success': return 'border-l-green-500';
      case 'error': return 'border-l-red-500';
      case 'warning': return 'border-l-yellow-500';
      case 'info': default: return 'border-l-blue-500';
    }
  };

  const getBackgroundColor = () => {
    switch (notification.type) {
      case 'success': return 'bg-green-50';
      case 'error': return 'bg-red-50';
      case 'warning': return 'bg-yellow-50';
      case 'info': default: return 'bg-blue-50';
    }
  };

  const handleRemove = () => {
    setIsExiting(true);
    setTimeout(() => {
      onRemove(notification.id);
    }, 300);
  };

  const handleAction = () => {
    if (notification.action?.onClick) {
      notification.action.onClick();
      handleRemove();
    }
  };

  return (
    <div
      className={`fixed right-4 z-50 transition-all duration-300 ease-in-out ${
        isVisible && !isExiting
          ? 'opacity-100 translate-x-0'
          : 'opacity-0 translate-x-full'
      }`}
      style={{ top: `${80 + position * 100}px` }}
    >
      <Card className={`w-80 border-l-4 shadow-lg ${getBorderColor()} ${getBackgroundColor()}`}>
        <div className="p-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 mt-0.5">{getIcon()}</div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-gray-900">{notification.title}</h4>
              <p className="text-sm text-gray-700 mt-1">{notification.message}</p>
              {notification.action && (
                <Button variant="outline" size="sm" className="mt-2 text-xs" onClick={handleAction}>
                  {notification.action.label}
                </Button>
              )}
            </div>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600" onClick={handleRemove}>
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

// Notification bell component
function NotificationBell({ notifications, onMarkAllRead, onClearAll, onMarkAsRead, onRemoveNotification }: {
  notifications: Notification[];
  onMarkAllRead: () => void;
  onClearAll: () => void;
  onMarkAsRead: (id: string) => void;
  onRemoveNotification: (id: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [hasNewNotification, setHasNewNotification] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    if (unreadCount > 0) {
      setHasNewNotification(true);
      const timer = setTimeout(() => setHasNewNotification(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [unreadCount]);

  const formatTime = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'agora';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    return `${days}d`;
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        className={`relative text-white hover:bg-white/20 transition-all duration-300 ${
          hasNewNotification ? 'animate-bounce' : ''
        }`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell className={`h-5 w-5 transition-all duration-300 ${hasNewNotification ? 'animate-pulse' : ''}`} />
        {unreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className={`absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs font-bold animate-in zoom-in-50 duration-200 ${
              hasNewNotification ? 'animate-pulse' : ''
            }`}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-96 max-h-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 animate-in slide-in-from-top-2 duration-200">
          <Card className="border-0 shadow-none">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold text-gray-900">Notificações</CardTitle>
                <div className="flex items-center space-x-2">
                  {unreadCount > 0 && (
                    <Button variant="ghost" size="sm" className="text-xs text-gray-500 hover:text-gray-700" onClick={onMarkAllRead}>
                      <CheckCheck className="h-3 w-3 mr-1" />
                      Marcar todas
                    </Button>
                  )}
                  {notifications.length > 0 && (
                    <Button variant="ghost" size="sm" className="text-xs text-gray-500 hover:text-gray-700" onClick={onClearAll}>
                      <X className="h-3 w-3 mr-1" />
                      Limpar
                    </Button>
                  )}
                </div>
              </div>
              {unreadCount > 0 && (
                <p className="text-sm text-gray-600">
                  {unreadCount} {unreadCount === 1 ? 'nova notificação' : 'novas notificações'}
                </p>
              )}
            </CardHeader>
            
            <CardContent className="p-0">
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">
                    <Bell className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">Nenhuma notificação</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {notifications.map((notification, index) => (
                      <div key={notification.id} className={`relative p-4 border-l-4 transition-all duration-200 cursor-pointer animate-in slide-in-from-right-full duration-300 ${
                        notification.type === 'success' ? 'border-l-green-500' :
                        notification.type === 'error' ? 'border-l-red-500' :
                        notification.type === 'warning' ? 'border-l-yellow-500' : 'border-l-blue-500'
                      } ${
                        !notification.read ? (
                          notification.type === 'success' ? 'bg-green-50 hover:bg-green-100' :
                          notification.type === 'error' ? 'bg-red-50 hover:bg-red-100' :
                          notification.type === 'warning' ? 'bg-yellow-50 hover:bg-yellow-100' : 'bg-blue-50 hover:bg-blue-100'
                        ) : 'bg-gray-50 hover:bg-gray-100'
                      }`} style={{ animationDelay: `${index * 50}ms` }}>
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0 mt-0.5">
                            {notification.type === 'success' ? <CheckCircle className="h-5 w-5 text-green-500" /> :
                             notification.type === 'error' ? <AlertCircle className="h-5 w-5 text-red-500" /> :
                             notification.type === 'warning' ? <AlertTriangle className="h-5 w-5 text-yellow-500" /> :
                             <Info className="h-5 w-5 text-blue-500" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className={`text-sm font-medium ${notification.read ? 'text-gray-600' : 'text-gray-900'}`}>
                                  {notification.title}
                                  {!notification.read && (
                                    <span className="inline-block w-2 h-2 bg-blue-500 rounded-full ml-2 animate-pulse"></span>
                                  )}
                                </h4>
                                <p className={`text-sm mt-1 ${notification.read ? 'text-gray-500' : 'text-gray-700'}`}>
                                  {notification.message}
                                </p>
                                {notification.action && (
                                  <Button variant="outline" size="sm" className="mt-2 text-xs" onClick={notification.action.onClick}>
                                    {notification.action.label}
                                  </Button>
                                )}
                              </div>
                              <div className="flex items-center space-x-1 ml-2">
                                <span className="text-xs text-gray-400">{formatTime(notification.timestamp)}</span>
                                <div className="flex space-x-1">
                                  {!notification.read && (
                                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-gray-400 hover:text-blue-600" 
                                           onClick={(e) => { e.stopPropagation(); onMarkAsRead(notification.id); }}>
                                      <Check className="h-3 w-3" />
                                    </Button>
                                  )}
                                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-gray-400 hover:text-red-600" 
                                         onClick={(e) => { e.stopPropagation(); onRemoveNotification(notification.id); }}>
                                    <X className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

export default function NotificationDemoStandalone() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = (notificationData: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const notification: Notification = {
      ...notificationData,
      id: `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      read: false,
    };

    setNotifications(prev => [notification, ...prev]);

    if (notification.duration) {
      setTimeout(() => {
        removeNotification(notification.id);
      }, notification.duration);
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  // Get toast notifications (with duration)
  const toastNotifications = notifications.filter(n => n.duration && n.duration > 0).slice(0, 3);

  const sendSuccessNotification = () => {
    addNotification({
      type: 'success',
      title: 'Operação Concluída',
      message: 'Sua ação foi executada com sucesso!',
      duration: 4000
    });
  };

  const sendErrorNotification = () => {
    addNotification({
      type: 'error',
      title: 'Erro na Operação',
      message: 'Ocorreu um problema ao executar a ação. Tente novamente.',
      duration: 6000
    });
  };

  const sendWarningNotification = () => {
    addNotification({
      type: 'warning',
      title: 'Atenção Necessária',
      message: 'Esta ação pode ter consequências. Deseja continuar?',
      action: {
        label: 'Continuar',
        onClick: () => {
          addNotification({
            type: 'info',
            title: 'Ação Confirmada',
            message: 'Continuando com a operação...',
            duration: 3000
          });
        }
      }
    });
  };

  const sendInfoNotification = () => {
    addNotification({
      type: 'info',
      title: 'Nova Funcionalidade',
      message: 'O sistema de notificações em tempo real está ativo! Experimente as diferentes opções.',
      duration: 5000
    });
  };

  const sendWorkflowNotification = () => {
    addNotification({
      type: 'success',
      title: 'Workflow Executado',
      message: 'O workflow "Processamento de Clientes" foi concluído com sucesso. 25 registros processados.',
      action: {
        label: 'Ver Detalhes',
        onClick: () => {
          console.log('Redirecionando para detalhes do workflow...');
        }
      }
    });
  };

  const sendPersistentNotification = () => {
    addNotification({
      type: 'warning',
      title: 'Backup Necessário',
      message: 'É recomendado fazer backup dos dados antes de continuar com a migração.',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header 
        className="text-white shadow-lg"
        style={{
          background: 'linear-gradient(90deg, #1e3a8a 0%, #581c87 50%, #06b6d4 100%)',
          backgroundSize: '100% 100%'
        }}
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img 
                src={toitNexusLogo} 
                alt="TOIT Nexus Logo" 
                className="h-10 w-auto" 
                style={{ transform: 'scale(1.15)' }}
              />
              <div>
                <h1 className="text-2xl font-bold">Demo - Sistema de Notificações</h1>
                <p className="text-blue-100 text-sm">Sistema completo de notificações em tempo real</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <NotificationBell 
                notifications={notifications}
                onMarkAllRead={markAllAsRead}
                onClearAll={clearAll}
                onMarkAsRead={markAsRead}
                onRemoveNotification={removeNotification}
              />
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/20" onClick={() => window.location.href = '/'}>
                Voltar
              </Button>
            </div>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8 space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-gray-900">TOIT Nexus - Sistema de Notificações</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Demonstração completa do sistema de notificações em tempo real com WebSocket, 
            animações sutis e diferentes tipos de alertas.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Notificações Ativas</CardTitle>
              <Bell className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{notifications.length}</div>
              <p className="text-xs text-muted-foreground">{notifications.filter(n => !n.read).length} não lidas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Usuários Online</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1</div>
              <p className="text-xs text-muted-foreground">Você (demo)</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Workflows Ativos</CardTitle>
              <Workflow className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-muted-foreground">Demo mode</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taxa de Sucesso</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">100%</div>
              <p className="text-xs text-muted-foreground">Sistema funcionando</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="w-full">
              <CardHeader>
                <CardTitle>Sistema de Notificações</CardTitle>
                <CardDescription>
                  Teste as diferentes tipos de notificações em tempo real com animações sutis
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <Button 
                    onClick={sendSuccessNotification}
                    variant="outline"
                    className="text-green-600 border-green-200 hover:bg-green-50"
                  >
                    Sucesso
                  </Button>
                  
                  <Button 
                    onClick={sendErrorNotification}
                    variant="outline"
                    className="text-red-600 border-red-200 hover:bg-red-50"
                  >
                    Erro
                  </Button>
                  
                  <Button 
                    onClick={sendWarningNotification}
                    variant="outline"
                    className="text-yellow-600 border-yellow-200 hover:bg-yellow-50"
                  >
                    Aviso
                  </Button>
                  
                  <Button 
                    onClick={sendInfoNotification}
                    variant="outline"
                    className="text-blue-600 border-blue-200 hover:bg-blue-50"
                  >
                    Informação
                  </Button>
                </div>
                
                <div className="space-y-2">
                  <Button 
                    onClick={sendWorkflowNotification}
                    variant="outline"
                    className="w-full"
                  >
                    Notificação de Workflow
                  </Button>
                  
                  <Button 
                    onClick={sendPersistentNotification}
                    variant="outline"
                    className="w-full"
                  >
                    Notificação Persistente
                  </Button>
                </div>
                
                <div className="text-sm text-gray-600 p-3 bg-gray-50 rounded">
                  <p><strong>Recursos:</strong></p>
                  <ul className="list-disc list-inside space-y-1 mt-2">
                    <li>Notificações toast com auto-dismiss</li>
                    <li>Sino de notificações no header com contador</li>
                    <li>Animações sutis de entrada e saída</li>
                    <li>Ações personalizadas em notificações</li>
                    <li>Diferentes tipos visuais (sucesso, erro, aviso, info)</li>
                    <li>Sistema completamente funcional</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Status do Sistema</CardTitle>
                <CardDescription>Demonstração ativa</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Notification System</span>
                  <Badge className="bg-green-500">Ativo</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Animações</span>
                  <Badge className="bg-green-500">Funcionando</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Demo Mode</span>
                  <Badge className="bg-blue-500">Online</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recursos Implementados</CardTitle>
                <CardDescription>Sistema completo de notificações</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Notificações em tempo real</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Sino de notificações no header</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Toast notifications com auto-dismiss</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Animações sutis de entrada/saída</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Diferentes tipos visuais</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Ações customizáveis</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Contador de não lidas</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Toast notifications */}
      {toastNotifications.map((notification, index) => (
        <ToastNotification
          key={notification.id}
          notification={notification}
          onRemove={removeNotification}
          position={index}
        />
      ))}
    </div>
  );
}