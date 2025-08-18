/**
 * HOOK WEBSOCKET DASHBOARD
 * Hook personalizado para conexão WebSocket do dashboard
 * 100% JavaScript - SEM TYPESCRIPT
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from './use-toast';
import io from 'socket.io-client';

export const useDashboardWebSocket = (user) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [isConnected, setIsConnected] = useState(false);
  const [realTimeData, setRealTimeData] = useState({});
  const [alerts, setAlerts] = useState([]);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [connectionQuality, setConnectionQuality] = useState('excellent');
  
  const socketRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const heartbeatIntervalRef = useRef(null);

  // Conectar ao WebSocket
  const connect = useCallback(() => {
    if (!user || socketRef.current?.connected) return;

    const wsUrl = process.env.REACT_APP_WS_URL || 'http://localhost:5000';
    
    socketRef.current = io(wsUrl, {
      transports: ['websocket', 'polling'],
      timeout: 20000,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      maxReconnectionAttempts: 10
    });

    // Event listeners
    socketRef.current.on('connect', () => {
      console.log('🔗 Dashboard WebSocket conectado');
      setIsConnected(true);
      setConnectionQuality('excellent');
      
      // Autenticar
      socketRef.current.emit('authenticate', {
        userId: user.id,
        userName: user.name,
        tenantId: user.tenant_id,
        type: 'dashboard'
      });
      
      // Entrar na sala de dashboard
      socketRef.current.emit('join_dashboard', {
        userId: user.id,
        tenantId: user.tenant_id
      });
      
      // Iniciar heartbeat
      startHeartbeat();
      
      toast({
        title: 'Dashboard conectado',
        description: 'Atualizações em tempo real ativadas.'
      });
    });

    socketRef.current.on('disconnect', (reason) => {
      console.log('🔌 Dashboard WebSocket desconectado:', reason);
      setIsConnected(false);
      setConnectionQuality('poor');
      stopHeartbeat();
      
      // Tentar reconectar se não foi desconexão manual
      if (reason !== 'io client disconnect') {
        scheduleReconnect();
      }
    });

    socketRef.current.on('connect_error', (error) => {
      console.error('❌ Erro de conexão WebSocket:', error);
      setConnectionQuality('poor');
      scheduleReconnect();
    });

    // Eventos de dados
    socketRef.current.on('dashboard_update', handleDashboardUpdate);
    socketRef.current.on('kpi_update', handleKPIUpdate);
    socketRef.current.on('metric_update', handleMetricUpdate);
    socketRef.current.on('alert_notification', handleAlert);
    socketRef.current.on('system_status', handleSystemStatus);
    
    // Heartbeat
    socketRef.current.on('pong', () => {
      setConnectionQuality('excellent');
    });

  }, [user, toast]);

  // Desconectar
  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    
    stopHeartbeat();
    clearReconnectTimeout();
    setIsConnected(false);
  }, []);

  // Iniciar heartbeat
  const startHeartbeat = useCallback(() => {
    heartbeatIntervalRef.current = setInterval(() => {
      if (socketRef.current?.connected) {
        socketRef.current.emit('ping');
      }
    }, 30000); // A cada 30 segundos
  }, []);

  // Parar heartbeat
  const stopHeartbeat = useCallback(() => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }
  }, []);

  // Agendar reconexão
  const scheduleReconnect = useCallback(() => {
    clearReconnectTimeout();
    
    reconnectTimeoutRef.current = setTimeout(() => {
      console.log('🔄 Tentando reconectar dashboard...');
      connect();
    }, 5000);
  }, [connect]);

  // Limpar timeout de reconexão
  const clearReconnectTimeout = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  }, []);

  // Handlers de eventos
  const handleDashboardUpdate = useCallback((data) => {
    console.log('📊 Atualização de dashboard:', data);
    
    setRealTimeData(prev => ({ ...prev, ...data }));
    setLastUpdate(new Date());
    
    // Invalidar queries relacionadas
    queryClient.invalidateQueries(['dashboard-kpis']);
    queryClient.invalidateQueries(['dashboard-metrics']);
  }, [queryClient]);

  const handleKPIUpdate = useCallback((data) => {
    console.log('📈 Atualização de KPI:', data);
    
    setRealTimeData(prev => ({
      ...prev,
      [data.kpiId]: {
        value: data.value,
        change: data.change,
        timestamp: data.timestamp
      }
    }));
    
    setLastUpdate(new Date());
  }, []);

  const handleMetricUpdate = useCallback((data) => {
    console.log('📊 Atualização de métrica:', data);
    
    setRealTimeData(prev => ({
      ...prev,
      metrics: {
        ...prev.metrics,
        [data.metricId]: data.value
      }
    }));
    
    setLastUpdate(new Date());
  }, []);

  const handleAlert = useCallback((alert) => {
    console.log('🚨 Alerta recebido:', alert);
    
    setAlerts(prev => [
      {
        ...alert,
        id: Date.now(),
        timestamp: alert.timestamp || new Date().toISOString()
      },
      ...prev.slice(0, 19) // Manter apenas 20 alertas
    ]);
    
    // Mostrar toast para alertas importantes
    if (alert.level === 'error' || alert.level === 'warning') {
      toast({
        title: alert.title || 'Alerta do Sistema',
        description: alert.message,
        variant: alert.level === 'error' ? 'destructive' : 'default'
      });
    }
  }, [toast]);

  const handleSystemStatus = useCallback((status) => {
    console.log('⚡ Status do sistema:', status);
    
    setRealTimeData(prev => ({
      ...prev,
      systemStatus: status
    }));
    
    // Atualizar qualidade da conexão baseado no status
    if (status.performance < 80) {
      setConnectionQuality('poor');
    } else if (status.performance < 95) {
      setConnectionQuality('good');
    } else {
      setConnectionQuality('excellent');
    }
  }, []);

  // Enviar comando para o servidor
  const sendCommand = useCallback((command, data = {}) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(command, data);
      return true;
    }
    return false;
  }, []);

  // Solicitar atualização manual
  const requestUpdate = useCallback(() => {
    return sendCommand('request_dashboard_update', {
      userId: user?.id,
      tenantId: user?.tenant_id
    });
  }, [sendCommand, user]);

  // Limpar alertas
  const clearAlerts = useCallback(() => {
    setAlerts([]);
  }, []);

  // Remover alerta específico
  const removeAlert = useCallback((alertId) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
  }, []);

  // Efeito principal
  useEffect(() => {
    if (user) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [user, connect, disconnect]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
      clearReconnectTimeout();
    };
  }, [disconnect, clearReconnectTimeout]);

  return {
    // Estado
    isConnected,
    realTimeData,
    alerts,
    lastUpdate,
    connectionQuality,
    
    // Ações
    connect,
    disconnect,
    sendCommand,
    requestUpdate,
    clearAlerts,
    removeAlert,
    
    // Utilitários
    socket: socketRef.current
  };
};
