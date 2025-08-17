const WebSocket = require('ws');
const { v4: uuidv4 } = require('uuid');
const DatabaseService = require('./DatabaseService');
const QuantumProcessor = require('./QuantumProcessor');
const MilaService = require('./MilaService');

class ChatService {
  constructor() {
    this.db = new DatabaseService();
    this.quantumProcessor = new QuantumProcessor();
    this.milaService = new MilaService();
    this.connections = new Map(); // userId -> WebSocket connection
    this.rooms = new Map(); // conversationId -> Set of userIds
    
    this.initializeWebSocketServer();
  }

  /**
   * Inicializar servidor WebSocket para chat em tempo real
   */
  initializeWebSocketServer() {
    try {
      const port = process.env.CHAT_WS_PORT || 8081;
      
      this.wss = new WebSocket.Server({ 
        port,
        verifyClient: (info) => {
          // Verificar autenticação se necessário
          return true;
        }
      });

      this.wss.on('connection', (ws, req) => {
        console.log('💬 Nova conexão WebSocket para chat');
        
        ws.on('message', (message) => {
          this.handleWebSocketMessage(ws, message);
        });

        ws.on('close', () => {
          this.handleWebSocketClose(ws);
        });

        ws.on('error', (error) => {
          console.error('❌ Erro WebSocket Chat:', error);
        });
      });

      console.log(`✅ Servidor WebSocket Chat iniciado na porta ${port}`);

    } catch (error) {
      console.error('❌ Erro ao inicializar WebSocket Chat:', error);
      
      // Fallback para desenvolvimento
      this.wss = {
        clients: new Set(),
        broadcast: (data) => {
          console.log('💬 WebSocket Chat simulado:', data.type);
        }
      };
    }
  }

  /**
   * Processar mensagens WebSocket
   */
  async handleWebSocketMessage(ws, message) {
    try {
      const data = JSON.parse(message);
      const { type, userId, conversationId, payload } = data;

      console.log(`💬 Mensagem WebSocket Chat: ${type} de usuário ${userId}`);

      switch (type) {
        case 'authenticate':
          await this.handleAuthenticate(ws, userId);
          break;

        case 'join_conversation':
          await this.handleJoinConversation(ws, userId, conversationId);
          break;

        case 'leave_conversation':
          await this.handleLeaveConversation(userId, conversationId);
          break;

        case 'typing_start':
          await this.handleTypingStart(userId, conversationId);
          break;

        case 'typing_stop':
          await this.handleTypingStop(userId, conversationId);
          break;

        case 'message_read':
          await this.handleMessageRead(userId, conversationId, payload.messageId);
          break;

        case 'presence_update':
          await this.handlePresenceUpdate(userId, payload.status);
          break;

        default:
          console.warn('⚠️ Tipo de mensagem Chat desconhecido:', type);
      }

    } catch (error) {
      console.error('❌ Erro ao processar mensagem WebSocket Chat:', error);
      ws.send(JSON.stringify({
        type: 'error',
        message: 'Erro ao processar mensagem'
      }));
    }
  }

  /**
   * Processar fechamento de conexão WebSocket
   */
  handleWebSocketClose(ws) {
    // Remover usuário de todas as conversas
    for (const [userId, connection] of this.connections.entries()) {
      if (connection === ws) {
        this.connections.delete(userId);
        
        // Remover de todas as salas
        for (const [conversationId, participants] of this.rooms.entries()) {
          if (participants.has(userId)) {
            participants.delete(userId);
            
            // Notificar outros participantes sobre saída
            this.broadcastToConversation(conversationId, {
              type: 'user_left',
              userId,
              conversationId
            }, userId);
          }
        }
        
        // Atualizar presença como offline
        this.updateUserPresence(userId, 'offline');
        break;
      }
    }
  }

  /**
   * Autenticar usuário
   */
  async handleAuthenticate(ws, userId) {
    try {
      // Verificar se usuário existe
      const users = await this.db.query(`
        SELECT id, name, avatar FROM users WHERE id = ?
      `, [userId]);

      if (users.length === 0) {
        ws.send(JSON.stringify({
          type: 'auth_error',
          message: 'Usuário não encontrado'
        }));
        return;
      }

      // Armazenar conexão
      this.connections.set(userId, ws);

      // Atualizar presença
      await this.updateUserPresence(userId, 'online');

      // Confirmar autenticação
      ws.send(JSON.stringify({
        type: 'authenticated',
        userId,
        user: users[0]
      }));

      console.log(`💬 Usuário ${userId} autenticado no chat`);

    } catch (error) {
      console.error('❌ Erro na autenticação:', error);
      ws.send(JSON.stringify({
        type: 'auth_error',
        message: 'Erro na autenticação'
      }));
    }
  }

  /**
   * Entrar em conversa
   */
  async handleJoinConversation(ws, userId, conversationId) {
    try {
      // Verificar se usuário é participante
      const participants = await this.db.query(`
        SELECT id FROM chat_participants 
        WHERE conversation_id = ? AND user_id = ?
      `, [conversationId, userId]);

      if (participants.length === 0) {
        ws.send(JSON.stringify({
          type: 'join_error',
          message: 'Acesso negado a esta conversa'
        }));
        return;
      }

      // Adicionar à sala
      if (!this.rooms.has(conversationId)) {
        this.rooms.set(conversationId, new Set());
      }
      this.rooms.get(conversationId).add(userId);

      // Confirmar entrada
      ws.send(JSON.stringify({
        type: 'conversation_joined',
        conversationId,
        participants: Array.from(this.rooms.get(conversationId))
      }));

      // Notificar outros participantes
      this.broadcastToConversation(conversationId, {
        type: 'user_joined',
        userId,
        conversationId
      }, userId);

      console.log(`💬 Usuário ${userId} entrou na conversa ${conversationId}`);

    } catch (error) {
      console.error('❌ Erro ao entrar na conversa:', error);
    }
  }

  /**
   * Sair de conversa
   */
  async handleLeaveConversation(userId, conversationId) {
    try {
      const room = this.rooms.get(conversationId);
      if (room) {
        room.delete(userId);
        
        // Notificar outros participantes
        this.broadcastToConversation(conversationId, {
          type: 'user_left',
          userId,
          conversationId
        }, userId);

        // Remover sala se vazia
        if (room.size === 0) {
          this.rooms.delete(conversationId);
        }
      }

    } catch (error) {
      console.error('❌ Erro ao sair da conversa:', error);
    }
  }

  /**
   * Iniciar digitação
   */
  async handleTypingStart(userId, conversationId) {
    try {
      this.broadcastToConversation(conversationId, {
        type: 'typing_start',
        userId,
        conversationId
      }, userId);

    } catch (error) {
      console.error('❌ Erro ao processar digitação:', error);
    }
  }

  /**
   * Parar digitação
   */
  async handleTypingStop(userId, conversationId) {
    try {
      this.broadcastToConversation(conversationId, {
        type: 'typing_stop',
        userId,
        conversationId
      }, userId);

    } catch (error) {
      console.error('❌ Erro ao processar parada de digitação:', error);
    }
  }

  /**
   * Marcar mensagem como lida
   */
  async handleMessageRead(userId, conversationId, messageId) {
    try {
      // Atualizar última leitura
      await this.db.query(`
        UPDATE chat_participants 
        SET last_read_at = NOW()
        WHERE conversation_id = ? AND user_id = ?
      `, [conversationId, userId]);

      // Notificar outros participantes
      this.broadcastToConversation(conversationId, {
        type: 'message_read',
        userId,
        conversationId,
        messageId
      }, userId);

    } catch (error) {
      console.error('❌ Erro ao marcar mensagem como lida:', error);
    }
  }

  /**
   * Atualizar presença do usuário
   */
  async handlePresenceUpdate(userId, status) {
    try {
      await this.updateUserPresence(userId, status);

      // Notificar contatos sobre mudança de presença
      const contacts = await this.getUserContacts(userId);
      
      for (const contactId of contacts) {
        const connection = this.connections.get(contactId);
        if (connection && connection.readyState === WebSocket.OPEN) {
          connection.send(JSON.stringify({
            type: 'presence_changed',
            userId,
            status
          }));
        }
      }

    } catch (error) {
      console.error('❌ Erro ao atualizar presença:', error);
    }
  }

  /**
   * Transmitir mensagem para todos na conversa
   */
  broadcastToConversation(conversationId, message, excludeUserId = null) {
    try {
      const room = this.rooms.get(conversationId);
      if (!room) return;

      for (const userId of room) {
        if (userId !== excludeUserId) {
          const connection = this.connections.get(userId);
          if (connection && connection.readyState === WebSocket.OPEN) {
            connection.send(JSON.stringify(message));
          }
        }
      }

    } catch (error) {
      console.error('❌ Erro ao transmitir mensagem:', error);
    }
  }

  /**
   * Notificar participantes específicos
   */
  async notifyParticipants(conversationId, message, excludeUserId = null) {
    try {
      // Buscar participantes da conversa
      const participants = await this.db.query(`
        SELECT user_id FROM chat_participants 
        WHERE conversation_id = ?
      `, [conversationId]);

      // Notificar cada participante
      for (const participant of participants) {
        if (participant.user_id !== excludeUserId) {
          const connection = this.connections.get(participant.user_id);
          if (connection && connection.readyState === WebSocket.OPEN) {
            connection.send(JSON.stringify({
              ...message,
              conversationId
            }));
          }
        }
      }

    } catch (error) {
      console.error('❌ Erro ao notificar participantes:', error);
    }
  }

  /**
   * Processar nova mensagem
   */
  async processNewMessage(messageData) {
    try {
      const { conversationId, userId, content, messageType } = messageData;

      // Processar com MILA se habilitado
      let milaResponse = null;
      if (messageType === 'text' && content) {
        milaResponse = await this.milaService.processMessage({
          content,
          conversationId,
          userId
        });
      }

      // Processar com algoritmos quânticos se habilitado
      let quantumAnalysis = null;
      if (messageData.quantumEnhanced) {
        quantumAnalysis = await this.quantumProcessor.processOperation({
          type: 'message_sentiment_analysis',
          data: { content, conversationId },
          complexity: 1,
          userId
        });
      }

      // Notificar participantes sobre nova mensagem
      await this.notifyParticipants(conversationId, {
        type: 'new_message',
        message: {
          ...messageData,
          milaResponse,
          quantumAnalysis
        }
      }, userId);

      // Gerar resposta automática da MILA se necessário
      if (milaResponse && milaResponse.shouldRespond) {
        setTimeout(async () => {
          await this.sendMilaResponse(conversationId, milaResponse);
        }, 1000);
      }

      return {
        success: true,
        milaResponse,
        quantumAnalysis
      };

    } catch (error) {
      console.error('❌ Erro ao processar nova mensagem:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Enviar resposta automática da MILA
   */
  async sendMilaResponse(conversationId, milaResponse) {
    try {
      // Criar mensagem da MILA
      const messageResult = await this.db.query(`
        INSERT INTO chat_messages (
          conversation_id, user_id, message_type, content, 
          mila_generated, created_at
        ) VALUES (?, 1, 'mila', ?, 1, NOW())
      `, [conversationId, milaResponse.response]);

      const messageId = messageResult.insertId;

      // Buscar dados completos da mensagem
      const fullMessage = await this.db.query(`
        SELECT cm.*, u.name as user_name, u.avatar as user_avatar
        FROM chat_messages cm
        JOIN users u ON cm.user_id = u.id
        WHERE cm.id = ?
      `, [messageId]);

      // Notificar participantes
      await this.notifyParticipants(conversationId, {
        type: 'new_message',
        message: fullMessage[0]
      });

      // Atualizar conversa
      await this.db.query(`
        UPDATE chat_conversations 
        SET last_message_at = NOW(), message_count = message_count + 1
        WHERE id = ?
      `, [conversationId]);

    } catch (error) {
      console.error('❌ Erro ao enviar resposta MILA:', error);
    }
  }

  /**
   * Atualizar presença do usuário
   */
  async updateUserPresence(userId, status) {
    try {
      // Atualizar no banco de dados (se tiver tabela de presença)
      await this.db.query(`
        INSERT INTO user_presence (user_id, status, updated_at)
        VALUES (?, ?, NOW())
        ON DUPLICATE KEY UPDATE status = ?, updated_at = NOW()
      `, [userId, status, status]);

    } catch (error) {
      console.error('❌ Erro ao atualizar presença:', error);
    }
  }

  /**
   * Obter contatos do usuário
   */
  async getUserContacts(userId) {
    try {
      const contacts = await this.db.query(`
        SELECT DISTINCT 
          CASE 
            WHEN cp1.user_id = ? THEN cp2.user_id 
            ELSE cp1.user_id 
          END as contact_id
        FROM chat_participants cp1
        JOIN chat_participants cp2 ON cp1.conversation_id = cp2.conversation_id
        JOIN chat_conversations cc ON cp1.conversation_id = cc.id
        WHERE (cp1.user_id = ? OR cp2.user_id = ?)
        AND cp1.user_id != cp2.user_id
        AND cc.type = 'direct'
      `, [userId, userId, userId]);

      return contacts.map(c => c.contact_id);

    } catch (error) {
      console.error('❌ Erro ao obter contatos:', error);
      return [];
    }
  }

  /**
   * Obter estatísticas do chat
   */
  async getChatStats() {
    try {
      const stats = {
        activeConnections: this.connections.size,
        activeRooms: this.rooms.size,
        totalParticipants: Array.from(this.rooms.values())
          .reduce((sum, room) => sum + room.size, 0),
        rooms: Array.from(this.rooms.entries()).map(([conversationId, participants]) => ({
          conversationId,
          participants: participants.size,
          participantIds: Array.from(participants)
        }))
      };

      return stats;

    } catch (error) {
      console.error('❌ Erro ao obter estatísticas:', error);
      return null;
    }
  }

  /**
   * Buscar mensagens com filtros avançados
   */
  async searchMessages(userId, filters) {
    try {
      const { query, conversationId, dateFrom, dateTo, messageType, limit = 50 } = filters;

      let whereClause = `
        WHERE cp.user_id = ?
        AND (cm.content LIKE ? OR cm.content LIKE ?)
      `;
      let params = [userId, `%${query}%`, `%${query}%`];

      if (conversationId) {
        whereClause += ` AND cm.conversation_id = ?`;
        params.push(conversationId);
      }

      if (dateFrom) {
        whereClause += ` AND cm.created_at >= ?`;
        params.push(dateFrom);
      }

      if (dateTo) {
        whereClause += ` AND cm.created_at <= ?`;
        params.push(dateTo);
      }

      if (messageType) {
        whereClause += ` AND cm.message_type = ?`;
        params.push(messageType);
      }

      const messages = await this.db.query(`
        SELECT 
          cm.id,
          cm.conversation_id,
          cm.content,
          cm.message_type,
          cm.created_at,
          u.name as user_name,
          u.avatar as user_avatar,
          cc.name as conversation_name
        FROM chat_messages cm
        JOIN chat_participants cp ON cm.conversation_id = cp.conversation_id
        JOIN users u ON cm.user_id = u.id
        JOIN chat_conversations cc ON cm.conversation_id = cc.id
        ${whereClause}
        ORDER BY cm.created_at DESC
        LIMIT ?
      `, [...params, limit]);

      return {
        success: true,
        messages,
        query,
        resultCount: messages.length
      };

    } catch (error) {
      console.error('❌ Erro na busca de mensagens:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Criar backup de conversa
   */
  async backupConversation(conversationId, userId) {
    try {
      // Verificar permissões
      const isParticipant = await this.db.query(`
        SELECT id FROM chat_participants 
        WHERE conversation_id = ? AND user_id = ?
      `, [conversationId, userId]);

      if (isParticipant.length === 0) {
        throw new Error('Acesso negado');
      }

      // Buscar todas as mensagens
      const messages = await this.db.query(`
        SELECT 
          cm.*,
          u.name as user_name,
          u.email as user_email
        FROM chat_messages cm
        JOIN users u ON cm.user_id = u.id
        WHERE cm.conversation_id = ?
        ORDER BY cm.created_at
      `, [conversationId]);

      // Buscar dados da conversa
      const conversation = await this.db.query(`
        SELECT * FROM chat_conversations WHERE id = ?
      `, [conversationId]);

      const backup = {
        conversation: conversation[0],
        messages,
        exportedAt: new Date(),
        exportedBy: userId
      };

      return {
        success: true,
        backup,
        messageCount: messages.length
      };

    } catch (error) {
      console.error('❌ Erro no backup:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Fechar serviço
   */
  async close() {
    try {
      // Notificar todos os usuários conectados
      for (const [userId, connection] of this.connections.entries()) {
        if (connection.readyState === WebSocket.OPEN) {
          connection.send(JSON.stringify({
            type: 'service_shutdown',
            message: 'Serviço de chat sendo reiniciado'
          }));
          connection.close();
        }
      }

      // Fechar servidor WebSocket
      if (this.wss && this.wss.close) {
        this.wss.close();
      }

      console.log('✅ Serviço de chat encerrado');

    } catch (error) {
      console.error('❌ Erro ao fechar serviço de chat:', error);
    }
  }
}

module.exports = ChatService;
