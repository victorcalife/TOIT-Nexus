const WebSocket = require('ws');
const { v4: uuidv4 } = require('uuid');
const DatabaseService = require('./DatabaseService');

class VideoCallService {
  constructor() {
    this.db = new DatabaseService();
    this.rooms = new Map(); // callId -> room data
    this.connections = new Map(); // userId -> WebSocket connection
    this.recordings = new Map(); // callId -> recording data
    
    this.initializeWebSocketServer();
  }

  /**
   * Inicializar servidor WebSocket para sinalização
   */
  initializeWebSocketServer() {
    try {
      const port = process.env.WS_PORT || 8080;
      
      this.wss = new WebSocket.Server({ 
        port,
        verifyClient: (info) => {
          // Verificar autenticação se necessário
          return true;
        }
      });

      this.wss.on('connection', (ws, req) => {
        console.log('📹 Nova conexão WebSocket para vídeo');
        
        ws.on('message', (message) => {
          this.handleWebSocketMessage(ws, message);
        });

        ws.on('close', () => {
          this.handleWebSocketClose(ws);
        });

        ws.on('error', (error) => {
          console.error('❌ Erro WebSocket:', error);
        });
      });

      console.log(`✅ Servidor WebSocket iniciado na porta ${port}`);

    } catch (error) {
      console.error('❌ Erro ao inicializar WebSocket:', error);
      
      // Fallback para desenvolvimento
      this.wss = {
        clients: new Set(),
        broadcast: (data) => {
          console.log('📹 WebSocket simulado:', data.type);
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
      const { type, callId, userId, payload } = data;

      console.log(`📹 Mensagem WebSocket: ${type} para chamada ${callId}`);

      switch (type) {
        case 'join_room':
          await this.handleJoinRoom(ws, callId, userId);
          break;

        case 'offer':
          await this.handleOffer(callId, userId, payload);
          break;

        case 'answer':
          await this.handleAnswer(callId, userId, payload);
          break;

        case 'ice_candidate':
          await this.handleIceCandidate(callId, userId, payload);
          break;

        case 'media_change':
          await this.handleMediaChange(callId, userId, payload);
          break;

        case 'leave_room':
          await this.handleLeaveRoom(callId, userId);
          break;

        default:
          console.warn('⚠️ Tipo de mensagem desconhecido:', type);
      }

    } catch (error) {
      console.error('❌ Erro ao processar mensagem WebSocket:', error);
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
    // Remover usuário de todas as salas
    for (const [userId, connection] of this.connections.entries()) {
      if (connection === ws) {
        this.connections.delete(userId);
        
        // Notificar outras salas sobre desconexão
        for (const [callId, room] of this.rooms.entries()) {
          if (room.participants.has(userId)) {
            this.handleLeaveRoom(callId, userId);
          }
        }
        break;
      }
    }
  }

  /**
   * Criar sala de chamada
   */
  async createRoom(options) {
    try {
      const { callId, participants, type, quantumOptimizations = {} } = options;

      console.log(`📹 Criando sala para chamada ${callId}`);

      // Configurações WebRTC otimizadas
      const iceServers = [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' }
      ];

      // Adicionar TURN servers se disponível
      if (process.env.TURN_SERVER) {
        iceServers.push({
          urls: process.env.TURN_SERVER,
          username: process.env.TURN_USERNAME,
          credential: process.env.TURN_PASSWORD
        });
      }

      const roomConfig = {
        callId,
        roomId: `room_${callId}`,
        participants: new Set(participants),
        connections: new Map(),
        type,
        iceServers,
        mediaConstraints: this.getMediaConstraints(type, quantumOptimizations),
        quantumOptimizations,
        createdAt: new Date(),
        isRecording: false
      };

      this.rooms.set(callId, roomConfig);

      return {
        roomId: roomConfig.roomId,
        iceServers,
        mediaConstraints: roomConfig.mediaConstraints,
        quantumOptimizations
      };

    } catch (error) {
      console.error('❌ Erro ao criar sala:', error);
      throw error;
    }
  }

  /**
   * Obter configurações de mídia baseadas no tipo e otimizações
   */
  getMediaConstraints(type, quantumOptimizations = {}) {
    const baseConstraints = {
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
        sampleRate: 48000
      },
      video: type !== 'audio' ? {
        width: { ideal: 1280, max: 1920 },
        height: { ideal: 720, max: 1080 },
        frameRate: { ideal: 30, max: 60 },
        facingMode: 'user'
      } : false
    };

    // Aplicar otimizações quânticas
    if (quantumOptimizations.videoQuality) {
      const quality = quantumOptimizations.videoQuality;
      if (quality === 'high') {
        baseConstraints.video.width = { ideal: 1920 };
        baseConstraints.video.height = { ideal: 1080 };
        baseConstraints.video.frameRate = { ideal: 60 };
      } else if (quality === 'low') {
        baseConstraints.video.width = { ideal: 640 };
        baseConstraints.video.height = { ideal: 480 };
        baseConstraints.video.frameRate = { ideal: 15 };
      }
    }

    if (quantumOptimizations.audioQuality) {
      const quality = quantumOptimizations.audioQuality;
      if (quality === 'high') {
        baseConstraints.audio.sampleRate = 96000;
      } else if (quality === 'low') {
        baseConstraints.audio.sampleRate = 16000;
      }
    }

    return baseConstraints;
  }

  /**
   * Entrar na sala
   */
  async handleJoinRoom(ws, callId, userId) {
    try {
      const room = this.rooms.get(callId);
      if (!room) {
        ws.send(JSON.stringify({
          type: 'error',
          message: 'Sala não encontrada'
        }));
        return;
      }

      // Adicionar conexão
      this.connections.set(userId, ws);
      room.connections.set(userId, ws);

      // Notificar usuário sobre configurações da sala
      ws.send(JSON.stringify({
        type: 'room_joined',
        callId,
        roomConfig: {
          iceServers: room.iceServers,
          mediaConstraints: room.mediaConstraints
        },
        participants: Array.from(room.connections.keys()).filter(id => id !== userId)
      }));

      // Notificar outros participantes
      this.broadcastToRoom(callId, {
        type: 'participant_joined',
        userId,
        callId
      }, userId);

      console.log(`📹 Usuário ${userId} entrou na sala ${callId}`);

    } catch (error) {
      console.error('❌ Erro ao entrar na sala:', error);
    }
  }

  /**
   * Processar oferta WebRTC
   */
  async handleOffer(callId, fromUserId, payload) {
    try {
      const { toUserId, offer } = payload;
      
      const room = this.rooms.get(callId);
      if (!room) return;

      const targetConnection = room.connections.get(toUserId);
      if (targetConnection) {
        targetConnection.send(JSON.stringify({
          type: 'offer',
          fromUserId,
          offer,
          callId
        }));
      }

    } catch (error) {
      console.error('❌ Erro ao processar oferta:', error);
    }
  }

  /**
   * Processar resposta WebRTC
   */
  async handleAnswer(callId, fromUserId, payload) {
    try {
      const { toUserId, answer } = payload;
      
      const room = this.rooms.get(callId);
      if (!room) return;

      const targetConnection = room.connections.get(toUserId);
      if (targetConnection) {
        targetConnection.send(JSON.stringify({
          type: 'answer',
          fromUserId,
          answer,
          callId
        }));
      }

    } catch (error) {
      console.error('❌ Erro ao processar resposta:', error);
    }
  }

  /**
   * Processar candidato ICE
   */
  async handleIceCandidate(callId, fromUserId, payload) {
    try {
      const { toUserId, candidate } = payload;
      
      const room = this.rooms.get(callId);
      if (!room) return;

      const targetConnection = room.connections.get(toUserId);
      if (targetConnection) {
        targetConnection.send(JSON.stringify({
          type: 'ice_candidate',
          fromUserId,
          candidate,
          callId
        }));
      }

    } catch (error) {
      console.error('❌ Erro ao processar candidato ICE:', error);
    }
  }

  /**
   * Processar mudança de mídia
   */
  async handleMediaChange(callId, userId, payload) {
    try {
      const { audioEnabled, videoEnabled, screenSharing } = payload;

      // Atualizar banco de dados
      await this.db.query(`
        UPDATE call_participants 
        SET audio_enabled = ?, video_enabled = ?, screen_sharing = ?
        WHERE call_id = ? AND user_id = ?
      `, [audioEnabled, videoEnabled, screenSharing, callId, userId]);

      // Notificar outros participantes
      this.broadcastToRoom(callId, {
        type: 'media_changed',
        userId,
        audioEnabled,
        videoEnabled,
        screenSharing,
        callId
      }, userId);

    } catch (error) {
      console.error('❌ Erro ao processar mudança de mídia:', error);
    }
  }

  /**
   * Sair da sala
   */
  async handleLeaveRoom(callId, userId) {
    try {
      const room = this.rooms.get(callId);
      if (!room) return;

      // Remover conexão
      room.connections.delete(userId);
      this.connections.delete(userId);

      // Atualizar banco de dados
      await this.db.query(`
        UPDATE call_participants 
        SET left_at = NOW(),
            duration = TIMESTAMPDIFF(SECOND, joined_at, NOW())
        WHERE call_id = ? AND user_id = ? AND left_at IS NULL
      `, [callId, userId]);

      // Notificar outros participantes
      this.broadcastToRoom(callId, {
        type: 'participant_left',
        userId,
        callId
      });

      // Se não há mais participantes, limpar sala
      if (room.connections.size === 0) {
        this.cleanupRoom(callId);
      }

      console.log(`📹 Usuário ${userId} saiu da sala ${callId}`);

    } catch (error) {
      console.error('❌ Erro ao sair da sala:', error);
    }
  }

  /**
   * Transmitir mensagem para todos na sala
   */
  broadcastToRoom(callId, message, excludeUserId = null) {
    try {
      const room = this.rooms.get(callId);
      if (!room) return;

      for (const [userId, connection] of room.connections.entries()) {
        if (userId !== excludeUserId && connection.readyState === WebSocket.OPEN) {
          connection.send(JSON.stringify(message));
        }
      }

    } catch (error) {
      console.error('❌ Erro ao transmitir mensagem:', error);
    }
  }

  /**
   * Notificar participantes
   */
  async notifyParticipants(callId, participantIds, message) {
    try {
      // Se não especificou participantes, notificar todos na sala
      if (participantIds.length === 0) {
        this.broadcastToRoom(callId, message);
        return;
      }

      // Notificar participantes específicos
      for (const participantId of participantIds) {
        const connection = this.connections.get(participantId);
        if (connection && connection.readyState === WebSocket.OPEN) {
          connection.send(JSON.stringify(message));
        }
      }

    } catch (error) {
      console.error('❌ Erro ao notificar participantes:', error);
    }
  }

  /**
   * Obter configurações da sala
   */
  async getRoomConfig(callId) {
    try {
      const room = this.rooms.get(callId);
      if (!room) {
        throw new Error('Sala não encontrada');
      }

      return {
        roomId: room.roomId,
        iceServers: room.iceServers,
        mediaConstraints: room.mediaConstraints,
        quantumOptimizations: room.quantumOptimizations
      };

    } catch (error) {
      console.error('❌ Erro ao obter configurações da sala:', error);
      throw error;
    }
  }

  /**
   * Iniciar gravação
   */
  async startRecording(callId) {
    try {
      console.log(`🔴 Iniciando gravação da chamada ${callId}`);

      const recordingId = uuidv4();
      const recordingPath = `recordings/${callId}_${recordingId}.webm`;

      // Configurar gravação (implementação simplificada)
      const recordingData = {
        recordingId,
        recordingPath,
        callId,
        startedAt: new Date(),
        isActive: true
      };

      this.recordings.set(callId, recordingData);

      // Notificar sala sobre gravação
      this.broadcastToRoom(callId, {
        type: 'recording_started',
        callId,
        recordingId
      });

      return {
        recordingId,
        recordingPath
      };

    } catch (error) {
      console.error('❌ Erro ao iniciar gravação:', error);
      throw error;
    }
  }

  /**
   * Parar gravação
   */
  async stopRecording(callId) {
    try {
      console.log(`⏹️ Parando gravação da chamada ${callId}`);

      const recordingData = this.recordings.get(callId);
      if (!recordingData) {
        throw new Error('Gravação não encontrada');
      }

      const endTime = new Date();
      const duration = Math.floor((endTime - recordingData.startedAt) / 1000);

      recordingData.isActive = false;
      recordingData.endedAt = endTime;
      recordingData.duration = duration;

      // Notificar sala
      this.broadcastToRoom(callId, {
        type: 'recording_stopped',
        callId,
        recordingId: recordingData.recordingId,
        duration
      });

      return {
        recordingPath: recordingData.recordingPath,
        duration
      };

    } catch (error) {
      console.error('❌ Erro ao parar gravação:', error);
      throw error;
    }
  }

  /**
   * Limpar recursos da sala
   */
  async cleanupRoom(callId) {
    try {
      console.log(`🧹 Limpando sala ${callId}`);

      // Parar gravação se ativa
      if (this.recordings.has(callId)) {
        await this.stopRecording(callId);
        this.recordings.delete(callId);
      }

      // Remover sala
      this.rooms.delete(callId);

      // Atualizar status da chamada no banco
      await this.db.query(`
        UPDATE video_calls 
        SET status = 'ended', ended_at = NOW()
        WHERE id = ? AND status != 'ended'
      `, [callId]);

    } catch (error) {
      console.error('❌ Erro ao limpar sala:', error);
    }
  }

  /**
   * Obter estatísticas das chamadas
   */
  async getCallStats() {
    try {
      const stats = {
        activeRooms: this.rooms.size,
        activeConnections: this.connections.size,
        activeRecordings: Array.from(this.recordings.values()).filter(r => r.isActive).length,
        rooms: Array.from(this.rooms.entries()).map(([callId, room]) => ({
          callId,
          participants: room.connections.size,
          type: room.type,
          createdAt: room.createdAt,
          isRecording: room.isRecording
        }))
      };

      return stats;

    } catch (error) {
      console.error('❌ Erro ao obter estatísticas:', error);
      return null;
    }
  }

  /**
   * Verificar qualidade da conexão
   */
  async checkConnectionQuality(callId, userId) {
    try {
      // Implementação simplificada de verificação de qualidade
      const connection = this.connections.get(userId);
      if (!connection) {
        return 'disconnected';
      }

      // Simular verificação de qualidade baseada em latência
      const latency = Math.random() * 200; // 0-200ms
      
      let quality;
      if (latency < 50) quality = 'excellent';
      else if (latency < 100) quality = 'good';
      else if (latency < 150) quality = 'poor';
      else quality = 'very_poor';

      // Atualizar no banco
      await this.db.query(`
        UPDATE call_participants 
        SET connection_quality = ?
        WHERE call_id = ? AND user_id = ?
      `, [quality, callId, userId]);

      return quality;

    } catch (error) {
      console.error('❌ Erro ao verificar qualidade:', error);
      return 'unknown';
    }
  }

  /**
   * Fechar serviço
   */
  async close() {
    try {
      // Encerrar todas as chamadas ativas
      for (const callId of this.rooms.keys()) {
        await this.cleanupRoom(callId);
      }

      // Fechar servidor WebSocket
      if (this.wss && this.wss.close) {
        this.wss.close();
      }

      console.log('✅ Serviço de vídeo chamadas encerrado');

    } catch (error) {
      console.error('❌ Erro ao fechar serviço:', error);
    }
  }
}

module.exports = VideoCallService;
