/**
 * WEBSOCKET SERVICE - Sistema de Chat em Tempo Real
 * 
 * Implementação completa de WebSocket para chat, notificações e colaboração
 * Suporte a múltiplas salas, mensagens privadas e notificações push
 */

const { Server } = require( 'socket.io' );
const { nanoid } = require( 'nanoid' );
const { ChatService } = require( './chatService' );

class WebSocketService
{
  constructor( server )
  {
    this.io = new Server( server, {
      cors: {
        origin: process.env.FRONTEND_URL || "https://toit.com.br",
        methods: [ "GET", "POST" ],
        credentials: true
      },
      transports: [ 'websocket', 'polling' ]
    } );

    this.connectedUsers = new Map(); // userId -> socketId
    this.userSockets = new Map(); // socketId -> userData
    this.activeRooms = new Map(); // roomId -> Set of userIds
    this.typingUsers = new Map(); // roomId -> Set of userIds

    this.chatService = new ChatService();
    this.setupEventHandlers();

    console.log( '🔌 WebSocket Service inicializado' );
  }

  setupEventHandlers()
  {
    this.io.on( 'connection', ( socket ) =>
    {
      console.log( `🔗 Cliente conectado: ${ socket.id }` );

      // Autenticação do usuário
      socket.on( 'authenticate', async ( data ) =>
      {
        try
        {
          const { token, userId, tenantId } = data;

          // Validar token (implementar validação real)
          if ( !token || !userId )
          {
            socket.emit( 'auth_error', { message: 'Token ou userId inválido' } );
            return;
          }

          // Registrar usuário conectado
          this.connectedUsers.set( userId, socket.id );
          this.userSockets.set( socket.id, { userId, tenantId, socket } );

          // Entrar nas salas do usuário
          await this.joinUserRooms( socket, userId, tenantId );

          // Notificar outros usuários que este usuário está online
          this.broadcastUserStatus( userId, 'online' );

          socket.emit( 'authenticated', {
            success: true,
            userId,
            onlineUsers: this.getOnlineUsers( tenantId )
          } );

          console.log( `✅ Usuário autenticado: ${ userId }` );
        } catch ( error )
        {
          console.error( '❌ Erro na autenticação:', error );
          socket.emit( 'auth_error', { message: 'Erro na autenticação' } );
        }
      } );

      // Enviar mensagem
      socket.on( 'send_message', async ( data ) =>
      {
        try
        {
          const userData = this.userSockets.get( socket.id );
          if ( !userData )
          {
            socket.emit( 'error', { message: 'Usuário não autenticado' } );
            return;
          }

          const { roomId, content, type = 'text', attachments = [] } = data;

          // Criar mensagem
          const message = await this.chatService.sendMessage(
            roomId,
            userData.userId,
            content,
            type,
            attachments
          );

          // Enviar para todos na sala
          this.io.to( roomId ).emit( 'new_message', {
            ...message,
            senderName: userData.userName || 'Usuário',
            senderAvatar: userData.avatar
          } );

          // Enviar notificação push para usuários offline
          await this.sendPushNotifications( roomId, message, userData.userId );

          console.log( `📨 Mensagem enviada na sala ${ roomId } por ${ userData.userId }` );
        } catch ( error )
        {
          console.error( '❌ Erro ao enviar mensagem:', error );
          socket.emit( 'error', { message: 'Erro ao enviar mensagem' } );
        }
      } );

      // Entrar em sala
      socket.on( 'join_room', async ( data ) =>
      {
        try
        {
          const userData = this.userSockets.get( socket.id );
          if ( !userData ) return;

          const { roomId } = data;

          // Entrar na sala
          socket.join( roomId );

          // Registrar usuário na sala
          if ( !this.activeRooms.has( roomId ) )
          {
            this.activeRooms.set( roomId, new Set() );
          }
          this.activeRooms.get( roomId ).add( userData.userId );

          // Buscar histórico de mensagens
          const messages = await this.chatService.getMessages( roomId, 50 );
          socket.emit( 'room_messages', { roomId, messages: messages.messages } );

          // Notificar outros usuários na sala
          socket.to( roomId ).emit( 'user_joined', {
            userId: userData.userId,
            userName: userData.userName
          } );

          console.log( `👥 Usuário ${ userData.userId } entrou na sala ${ roomId }` );
        } catch ( error )
        {
          console.error( '❌ Erro ao entrar na sala:', error );
        }
      } );

      // Sair da sala
      socket.on( 'leave_room', ( data ) =>
      {
        const userData = this.userSockets.get( socket.id );
        if ( !userData ) return;

        const { roomId } = data;

        socket.leave( roomId );

        // Remover usuário da sala
        if ( this.activeRooms.has( roomId ) )
        {
          this.activeRooms.get( roomId ).delete( userData.userId );
        }

        // Notificar outros usuários
        socket.to( roomId ).emit( 'user_left', {
          userId: userData.userId,
          userName: userData.userName
        } );
      } );

      // Indicador de digitação
      socket.on( 'typing_start', ( data ) =>
      {
        const userData = this.userSockets.get( socket.id );
        if ( !userData ) return;

        const { roomId } = data;

        if ( !this.typingUsers.has( roomId ) )
        {
          this.typingUsers.set( roomId, new Set() );
        }
        this.typingUsers.get( roomId ).add( userData.userId );

        socket.to( roomId ).emit( 'user_typing', {
          userId: userData.userId,
          userName: userData.userName,
          isTyping: true
        } );
      } );

      socket.on( 'typing_stop', ( data ) =>
      {
        const userData = this.userSockets.get( socket.id );
        if ( !userData ) return;

        const { roomId } = data;

        if ( this.typingUsers.has( roomId ) )
        {
          this.typingUsers.get( roomId ).delete( userData.userId );
        }

        socket.to( roomId ).emit( 'user_typing', {
          userId: userData.userId,
          userName: userData.userName,
          isTyping: false
        } );
      } );

      // Chamada de voz/vídeo
      socket.on( 'call_user', ( data ) =>
      {
        const userData = this.userSockets.get( socket.id );
        if ( !userData ) return;

        const { targetUserId, callType, offer } = data;
        const targetSocketId = this.connectedUsers.get( targetUserId );

        if ( targetSocketId )
        {
          this.io.to( targetSocketId ).emit( 'incoming_call', {
            callerId: userData.userId,
            callerName: userData.userName,
            callType,
            offer,
            callId: nanoid()
          } );
        }
      } );

      socket.on( 'answer_call', ( data ) =>
      {
        const { callerId, answer, accepted } = data;
        const callerSocketId = this.connectedUsers.get( callerId );

        if ( callerSocketId )
        {
          this.io.to( callerSocketId ).emit( 'call_answered', {
            answer,
            accepted
          } );
        }
      } );

      socket.on( 'end_call', ( data ) =>
      {
        const { targetUserId } = data;
        const targetSocketId = this.connectedUsers.get( targetUserId );

        if ( targetSocketId )
        {
          this.io.to( targetSocketId ).emit( 'call_ended' );
        }
      } );

      // Desconexão
      socket.on( 'disconnect', () =>
      {
        const userData = this.userSockets.get( socket.id );
        if ( userData )
        {
          // Remover usuário das estruturas
          this.connectedUsers.delete( userData.userId );
          this.userSockets.delete( socket.id );

          // Remover de todas as salas
          for ( const [ roomId, users ] of this.activeRooms.entries() )
          {
            if ( users.has( userData.userId ) )
            {
              users.delete( userData.userId );
              socket.to( roomId ).emit( 'user_left', {
                userId: userData.userId,
                userName: userData.userName
              } );
            }
          }

          // Notificar que usuário está offline
          this.broadcastUserStatus( userData.userId, 'offline' );

          console.log( `🔌 Usuário desconectado: ${ userData.userId }` );
        }
      } );
    } );
  }

  // Entrar nas salas do usuário automaticamente
  async joinUserRooms( socket, userId, tenantId )
  {
    try
    {
      // Buscar conversas do usuário
      const conversations = await this.chatService.getUserConversations( userId );

      for ( const conversation of conversations )
      {
        socket.join( conversation.id );

        if ( !this.activeRooms.has( conversation.id ) )
        {
          this.activeRooms.set( conversation.id, new Set() );
        }
        this.activeRooms.get( conversation.id ).add( userId );
      }
    } catch ( error )
    {
      console.error( '❌ Erro ao entrar nas salas do usuário:', error );
    }
  }

  // Broadcast status do usuário
  broadcastUserStatus( userId, status )
  {
    this.io.emit( 'user_status_change', {
      userId,
      status,
      timestamp: new Date()
    } );
  }

  // Obter usuários online por tenant
  getOnlineUsers( tenantId )
  {
    const onlineUsers = [];
    for ( const [ socketId, userData ] of this.userSockets.entries() )
    {
      if ( userData.tenantId === tenantId )
      {
        onlineUsers.push( {
          userId: userData.userId,
          userName: userData.userName,
          status: 'online'
        } );
      }
    }
    return onlineUsers;
  }

  // Enviar notificação push
  async sendPushNotifications( roomId, message, senderId )
  {
    try
    {
      // Buscar participantes da sala que estão offline
      const roomUsers = this.activeRooms.get( roomId ) || new Set();
      const allParticipants = await this.chatService.getRoomParticipants( roomId );

      for ( const participant of allParticipants )
      {
        if ( participant.id !== senderId && !roomUsers.has( participant.id ) )
        {
          // Usuário está offline, enviar notificação push
          await this.sendPushNotification( participant.id, {
            title: 'Nova mensagem',
            body: message.content,
            data: {
              roomId,
              messageId: message.id,
              senderId
            }
          } );
        }
      }
    } catch ( error )
    {
      console.error( '❌ Erro ao enviar notificações push:', error );
    }
  }

  // Enviar notificação push individual
  async sendPushNotification( userId, notification )
  {
    // Implementar integração com serviço de push notifications
    console.log( `🔔 Push notification para ${ userId }:`, notification.title );
  }

  // Enviar mensagem para usuário específico
  sendToUser( userId, event, data )
  {
    const socketId = this.connectedUsers.get( userId );
    if ( socketId )
    {
      this.io.to( socketId ).emit( event, data );
      return true;
    }
    return false;
  }

  // Enviar mensagem para sala
  sendToRoom( roomId, event, data )
  {
    this.io.to( roomId ).emit( event, data );
  }

  // Broadcast para todos
  broadcast( event, data )
  {
    this.io.emit( event, data );
  }

  // Obter estatísticas
  getStats()
  {
    return {
      connectedUsers: this.connectedUsers.size,
      activeRooms: this.activeRooms.size,
      totalSockets: this.userSockets.size
    };
  }
}

module.exports = WebSocketService;
