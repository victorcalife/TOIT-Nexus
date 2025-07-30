import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';

interface NotificationMessage {
  type: 'notification';
  notificationType: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

class NotificationWebSocketServer {
  private wss: WebSocketServer;
  private clients: Set<WebSocket> = new Set();

  constructor(server: Server) {
    this.wss = new WebSocketServer({ 
      server, 
      path: '/ws',
      verifyClient: (info: any) => {
        // Basic verification - in production, you'd verify authentication
        return true;
      }
    });

    this.wss.on('connection', (ws: WebSocket) => {
      console.log('New WebSocket connection established');
      this.clients.add(ws);
      
      ws.on('close', () => {
        console.log('WebSocket connection closed');
        this.clients.delete(ws);
      });

      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
        this.clients.delete(ws);
      });

      // Send welcome message
      this.sendToClient(ws, {
        type: 'notification',
        notificationType: 'info',
        title: 'Conexão estabelecida',
        message: 'Sistema de notificações ativo',
        duration: 3000
      });
    });
  }

  // Send notification to specific client
  private sendToClient(ws: WebSocket, message: NotificationMessage) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  }

  // Broadcast notification to all connected clients
  public broadcast(notification: NotificationMessage) {
    console.log(`Broadcasting notification: ${notification.title}`);
    
    this.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(notification));
      }
    });
  }

  // Send notification to specific user (if you have user identification)
  public sendToUser(userId: string, notification: NotificationMessage) {
    // In a real implementation, you'd maintain a mapping of userId to WebSocket connections
    // For now, we'll broadcast to all
    this.broadcast(notification);
  }

  // Send system-wide notifications
  public sendSystemNotification(title: string, message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') {
    this.broadcast({
      type: 'notification',
      notificationType: type,
      title,
      message,
      duration: 5000
    });
  }

  // Send workflow notifications
  public sendWorkflowNotification(workflowName: string, status: 'started' | 'completed' | 'failed', details?: string) {
    const typeMap = {
      started: 'info' as const,
      completed: 'success' as const,
      failed: 'error' as const
    };

    const titleMap = {
      started: `Workflow "${workflowName}" iniciado`,
      completed: `Workflow "${workflowName}" concluído`,
      failed: `Workflow "${workflowName}" falhou`
    };

    this.broadcast({
      type: 'notification',
      notificationType: typeMap[status],
      title: titleMap[status],
      message: details || 'Clique para ver detalhes',
      duration: status === 'failed' ? 10000 : 5000
    });
  }

  // Send tenant notifications
  public sendTenantNotification(tenantName: string, action: string, details?: string) {
    this.broadcast({
      type: 'notification',
      notificationType: 'info',
      title: `Empresa ${tenantName}`,
      message: `${action}. ${details || ''}`,
      duration: 4000
    });
  }

  // Get connection stats
  public getStats() {
    return {
      connectedClients: this.clients.size,
      totalConnections: this.clients.size
    };
  }
}

export { NotificationWebSocketServer };
export type { NotificationMessage };