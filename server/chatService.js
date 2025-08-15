/**
 * CHAT SERVICE - Sistema completo de chat em tempo real
 * Funcionalidades: mensagens, arquivos, chamadas de voz, presença
 */

const { nanoid } = require( 'nanoid' );
const fs = require( 'fs' );
const path = require( 'path' );

class ChatService
{
  constructor()
  {
    this.activeUsers = new Map(); // Usuários online
    this.chatRooms = new Map(); // Salas de chat ativas
    this.voiceCalls = new Map(); // Chamadas de voz ativas
  }

  /**
   * CRIAR NOVA CONVERSA
   */
  async createConversation( participants, type = 'direct', name = null )
  {
    try
    {
      const conversationId = nanoid();

      const conversation = {
        id: conversationId,
        type, // 'direct', 'group', 'channel'
        name: name || ( type === 'direct' ? null : `Conversa ${ conversationId.slice( 0, 8 ) }` ),
        participants: participants,
        createdAt: new Date(),
        lastActivity: new Date(),
        isActive: true
      };

      // Salvar no banco (simulado)
      console.log( `💬 Nova conversa criada: ${ conversationId } (${ type })` );

      return conversation;
    } catch ( error )
    {
      throw new Error( `Erro ao criar conversa: ${ error.message }` );
    }
  }

  /**
   * ENVIAR MENSAGEM
   */
  async sendMessage( conversationId, senderId, content, type = 'text', attachments = [] )
  {
    try
    {
      const messageId = nanoid();

      const message = {
        id: messageId,
        conversationId,
        senderId,
        content,
        type, // 'text', 'file', 'image', 'voice', 'system'
        attachments,
        timestamp: new Date(),
        isRead: false,
        isEdited: false,
        reactions: []
      };

      // Salvar mensagem no banco (simulado)
      console.log( `📨 Mensagem enviada: ${ messageId } por ${ senderId }` );

      // Notificar participantes em tempo real
      await this.notifyParticipants( conversationId, message );

      return message;
    } catch ( error )
    {
      throw new Error( `Erro ao enviar mensagem: ${ error.message }` );
    }
  }

  /**
   * UPLOAD DE ARQUIVO NO CHAT
   */
  async uploadChatFile( file, senderId, conversationId )
  {
    try
    {
      const uploadDir = path.join( process.cwd(), 'uploads', 'chat' );

      // Criar diretório se não existir
      if ( !fs.existsSync( uploadDir ) )
      {
        fs.mkdirSync( uploadDir, { recursive: true } );
      }

      const fileId = nanoid();
      const fileName = `${ fileId }_${ file.originalname }`;
      const filePath = path.join( uploadDir, fileName );

      // Salvar arquivo
      fs.writeFileSync( filePath, file.buffer );

      const fileInfo = {
        id: fileId,
        originalName: file.originalname,
        fileName,
        filePath,
        mimeType: file.mimetype,
        size: file.size,
        uploadedBy: senderId,
        uploadedAt: new Date()
      };

      console.log( `📎 Arquivo enviado no chat: ${ file.originalname } (${ file.size } bytes)` );

      return fileInfo;
    } catch ( error )
    {
      throw new Error( `Erro ao fazer upload: ${ error.message }` );
    }
  }

  /**
   * INICIAR CHAMADA DE VOZ
   */
  async startVoiceCall( conversationId, callerId, participants )
  {
    try
    {
      const callId = nanoid();

      const voiceCall = {
        id: callId,
        conversationId,
        callerId,
        participants,
        status: 'ringing', // 'ringing', 'active', 'ended'
        startedAt: new Date(),
        endedAt: null,
        duration: 0
      };

      this.voiceCalls.set( callId, voiceCall );

      console.log( `📞 Chamada de voz iniciada: ${ callId } por ${ callerId }` );

      // Notificar participantes
      await this.notifyVoiceCall( voiceCall );

      return voiceCall;
    } catch ( error )
    {
      throw new Error( `Erro ao iniciar chamada: ${ error.message }` );
    }
  }

  /**
   * ACEITAR CHAMADA DE VOZ
   */
  async acceptVoiceCall( callId, userId )
  {
    try
    {
      const call = this.voiceCalls.get( callId );
      if ( !call )
      {
        throw new Error( 'Chamada não encontrada' );
      }

      call.status = 'active';
      call.acceptedAt = new Date();

      console.log( `📞 Chamada aceita: ${ callId } por ${ userId }` );

      return call;
    } catch ( error )
    {
      throw new Error( `Erro ao aceitar chamada: ${ error.message }` );
    }
  }

  /**
   * FINALIZAR CHAMADA DE VOZ
   */
  async endVoiceCall( callId, userId )
  {
    try
    {
      const call = this.voiceCalls.get( callId );
      if ( !call )
      {
        throw new Error( 'Chamada não encontrada' );
      }

      call.status = 'ended';
      call.endedAt = new Date();
      call.duration = call.endedAt - call.startedAt;

      console.log( `📞 Chamada finalizada: ${ callId } (${ call.duration }ms)` );

      // Remover da memória
      this.voiceCalls.delete( callId );

      return call;
    } catch ( error )
    {
      throw new Error( `Erro ao finalizar chamada: ${ error.message }` );
    }
  }

  /**
   * ATUALIZAR PRESENÇA DO USUÁRIO
   */
  async updateUserPresence( userId, status = 'online' )
  {
    try
    {
      const presence = {
        userId,
        status, // 'online', 'away', 'busy', 'offline'
        lastSeen: new Date(),
        isTyping: false
      };

      this.activeUsers.set( userId, presence );

      console.log( `👤 Presença atualizada: ${ userId } - ${ status }` );

      return presence;
    } catch ( error )
    {
      throw new Error( `Erro ao atualizar presença: ${ error.message }` );
    }
  }

  /**
   * MARCAR COMO DIGITANDO
   */
  async setTyping( conversationId, userId, isTyping = true )
  {
    try
    {
      const user = this.activeUsers.get( userId );
      if ( user )
      {
        user.isTyping = isTyping;
        user.typingIn = isTyping ? conversationId : null;
      }

      // Notificar outros participantes
      await this.notifyTyping( conversationId, userId, isTyping );

      return { success: true };
    } catch ( error )
    {
      throw new Error( `Erro ao atualizar digitação: ${ error.message }` );
    }
  }

  /**
   * BUSCAR MENSAGENS DA CONVERSA
   */
  async getMessages( conversationId, limit = 50, offset = 0 )
  {
    try
    {
      // Simular busca no banco
      const messages = [
        {
          id: 'msg_1',
          conversationId,
          senderId: 'user_1',
          content: 'Olá! Como você está?',
          type: 'text',
          timestamp: new Date( Date.now() - 3600000 ),
          isRead: true
        },
        {
          id: 'msg_2',
          conversationId,
          senderId: 'user_2',
          content: 'Oi! Estou bem, obrigado! E você?',
          type: 'text',
          timestamp: new Date( Date.now() - 3000000 ),
          isRead: true
        }
      ];

      return {
        messages,
        total: messages.length,
        hasMore: false
      };
    } catch ( error )
    {
      throw new Error( `Erro ao buscar mensagens: ${ error.message }` );
    }
  }

  /**
   * NOTIFICAR PARTICIPANTES (WebSocket)
   */
  async notifyParticipants( conversationId, message )
  {
    // Implementar WebSocket aqui
    console.log( `🔔 Notificando participantes da conversa ${ conversationId }` );
  }

  /**
   * NOTIFICAR CHAMADA DE VOZ
   */
  async notifyVoiceCall( voiceCall )
  {
    console.log( `🔔 Notificando chamada de voz ${ voiceCall.id }` );
  }

  /**
   * NOTIFICAR DIGITAÇÃO
   */
  async notifyTyping( conversationId, userId, isTyping )
  {
    console.log( `🔔 ${ userId } ${ isTyping ? 'está digitando' : 'parou de digitar' } em ${ conversationId }` );
  }

  /**
   * OBTER USUÁRIOS ONLINE
   */
  getOnlineUsers()
  {
    return Array.from( this.activeUsers.values() );
  }

  /**
   * OBTER CHAMADAS ATIVAS
   */
  getActiveCalls()
  {
    return Array.from( this.voiceCalls.values() );
  }
}

const chatService = new ChatService();

module.exports = { ChatService, chatService };
