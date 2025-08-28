import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { 
    MessageCircle,
    Phone,
    Video,
    MoreVertical,
    Send,
    Paperclip,
    Smile,
    Search,
    Users,
    Settings,
    Plus,
    Wifi,
    WifiOff }
  } from 'lucide-react';
import io from 'socket.io-client';

export default function Chat()
{
  const { toast } = useToast();
  const [ socket, setSocket ] = useState( null );
  const [ isConnected, setIsConnected ] = useState( false );
  const [ selectedConversation, setSelectedConversation ] = useState( null );
  const [ conversations, setConversations ] = useState( [] );
  const [ messages, setMessages ] = useState( [] );
  const [ newMessage, setNewMessage ] = useState( '' );
  const [ searchTerm, setSearchTerm ] = useState( '' );
  const [ onlineUsers, setOnlineUsers ] = useState( new Set() );
  const [ typingUsers, setTypingUsers ] = useState( new Set() );
  const [ isTyping, setIsTyping ] = useState( false );
  const messagesEndRef = useRef( null );
  const typingTimeoutRef = useRef( null );

  // Inicializar WebSocket
  useEffect( () =>
  {
    const token = localStorage.getItem( 'token' );
    const userId = localStorage.getItem( 'userId' );
    const tenantId = localStorage.getItem( 'tenantId' );

    if ( !token || !userId )
    {
      toast( {
        title: "Erro de autenticação",
        description: "Faça login para usar o chat",
        variant: "destructive"
      } );
      return;
    }

    // Conectar ao WebSocket
    const newSocket = io( process.env.REACT_APP_WS_URL || 'https://api.toit.com.br', {
      transports: [ 'websocket', 'polling' ]
    } );

    newSocket.on( 'connect', () =>
    {
      console.log( '🔗 Conectado ao WebSocket' );
      setIsConnected( true );

      // Autenticar usuário
      newSocket.emit( 'authenticate', { token, userId, tenantId } );
    } );

    newSocket.on( 'disconnect', () =>
    {
      console.log( '🔌 Desconectado do WebSocket' );
      setIsConnected( false );
    } );

    newSocket.on( 'authenticated', ( data ) =>
    {
      console.log( '✅ Autenticado no chat' );
      setOnlineUsers( new Set( data.onlineUsers.map( u => u.userId ) ) );
      loadConversations();
    } );

    newSocket.on( 'auth_error', ( error ) =>
    {
      toast( {
        title: "Erro de autenticação",
        description: error.message,
        variant: "destructive"
      } );
    } );

    // Eventos de mensagens
    newSocket.on( 'new_message', ( message ) =>
    {
      setMessages( prev => [ ...prev, message ] );

      // Atualizar última mensagem na conversa
      setConversations( prev => prev.map( conv =>
        conv.id === message.conversationId
          ? { ...conv, lastMessage: message.content, timestamp: new Date( message.timestamp ) }
          : conv
      ) );
    } );

    newSocket.on( 'room_messages', ( data ) =>
    {
      setMessages( data.messages );
    } );

    // Eventos de usuários
    newSocket.on( 'user_status_change', ( data ) =>
    {
      setOnlineUsers( prev =>
      {
        const newSet = new Set( prev );
        if ( data.status === 'online' )
        {
          newSet.add( data.userId );
        } else
        {
          newSet.delete( data.userId );
        }
        return newSet;
      } );
    } );

    newSocket.on( 'user_typing', ( data ) =>
    {
      setTypingUsers( prev =>
      {
        const newSet = new Set( prev );
        if ( data.isTyping )
        {
          newSet.add( data.userId );
        } else
        {
          newSet.delete( data.userId );
        }
        return newSet;
      } );
    } );

    // Eventos de chamadas
    newSocket.on( 'incoming_call', ( data ) =>
    {
      toast( {
        title: "📞 Chamada recebida",
        description: `${ data.callerName } está chamando`,
        action: (
          <div className="flex gap-2">
            <Button size="sm" onClick=({ ( }) => answerCall( data, true ) }>

            <Button size="sm" variant="outline" onClick=({ ( }) => answerCall( data, false ) }>

          </div>
        )
      } );
    } );

    setSocket( newSocket );

    return () =>
    {
      newSocket.disconnect();
    };
  }, [] );

  // Auto-scroll para última mensagem
  useEffect( () =>
  {
    scrollToBottom();
  }, [ messages ] );

  const scrollToBottom = () =>
  {
    messagesEndRef.current?.scrollIntoView( { behavior: 'smooth' } );
  };

  // Carregar conversas
  const loadConversations = async () =>
  {
    try
    {
      const response = await fetch( '/api/chat/conversations', {
        headers: {`
          'Authorization': `Bearer ${ localStorage.getItem( 'token' ) }`
        }
      } );

      if ( response.ok )
      {
        const data = await response.json();
        setConversations( data.conversations || [] );

        // Selecionar primeira conversa se houver
        if ( data.conversations?.length > 0 )
        {
          selectConversation( data.conversations[ 0 ] );
        }
      }
    } catch ( error )
    {
      console.error( 'Erro ao carregar conversas:', error );
      // Mock data para desenvolvimento
      setConversations( [
        {
          id: 'conv_1',
          name: 'Equipe Desenvolvimento',
          type: 'group',
          lastMessage: 'Vamos revisar o código hoje?',
          timestamp: new Date(),
          unread: 3,
          participants: [
            { id: 'user_1', name: 'João' },
            { id: 'user_2', name: 'Maria' },
            { id: 'user_3', name: 'Pedro' }
          ]
        },
        {
          id: 'conv_2',
          name: 'Ana Silva',
          type: 'direct',
          lastMessage: 'Obrigada pela ajuda!',
          timestamp: new Date( Date.now() - 3600000 ),
          unread: 0,
          participants: [
            { id: 'user_4', name: 'Ana Silva' }
          ]
        }
      ] );
    }
  };

  // Selecionar conversa
  const selectConversation = ( conversation ) =>
  {
    setSelectedConversation( conversation );
    setMessages( [] );

    if ( socket )
    {
      socket.emit( 'join_room', { roomId: conversation.id } );
    }
  };

  // Enviar mensagem
  const handleSendMessage = () =>
  {
    if ( !newMessage.trim() || !selectedConversation || !socket ) return;

    socket.emit( 'send_message', {
      roomId: selectedConversation.id,
      content: newMessage,
      type: 'text'
    } );

    setNewMessage( '' );
    stopTyping();
  };

  // Indicador de digitação
  const handleTyping = () =>
  {
    if ( !socket || !selectedConversation ) return;

    if ( !isTyping )
    {
      setIsTyping( true );
      socket.emit( 'typing_start', { roomId: selectedConversation.id } );
    }

    // Reset timeout
    if ( typingTimeoutRef.current )
    {
      clearTimeout( typingTimeoutRef.current );
    }

    typingTimeoutRef.current = setTimeout( () =>
    {
      stopTyping();
    }, 3000 );
  };

  const stopTyping = () =>
  {
    if ( isTyping && socket && selectedConversation )
    {
      setIsTyping( false );
      socket.emit( 'typing_stop', { roomId: selectedConversation.id } );
    }

    if ( typingTimeoutRef.current )
    {
      clearTimeout( typingTimeoutRef.current );
    }
  };

  const handleKeyPress = ( e ) =>
  {
    if ( e.key === 'Enter' && !e.shiftKey )
    {
      e.preventDefault();
      handleSendMessage();
    } else
    {
      handleTyping();
    }
  };

  // Iniciar chamada
  const startCall = ( type ) =>
  {
    if ( !selectedConversation || !socket ) return;

    // Para conversas diretas
    if ( selectedConversation.type === 'direct' )
    {
      const targetUserId = selectedConversation.participants.find( p => p.id !== localStorage.getItem( 'userId' ) );

      socket.emit( 'call_user', {
        targetUserId: targetUserId.id,
        callType: type
      } );

      toast( {`
        title: `📞 Chamando...`,`
        description: `Iniciando chamada de ${ type } com ${ targetUserId.name }`
      } );
    }
  };

  // Responder chamada
  const answerCall = ( callData, accepted ) =>
  {
    if ( !socket ) return;

    socket.emit( 'answer_call', {
      callerId: callData.callerId,
      accepted
    } );

    if ( accepted )
    {
      toast( {
        title: "📞 Chamada aceita",
        description: "Conectando..."
      } );
    }
  };

  const filteredConversations = conversations.filter( conv =>
    conv.name.toLowerCase().includes( searchTerm.toLowerCase() )
  );

  return (
    <div className="h-screen flex bg-background">
      {/* Sidebar - Lista de Conversas */ }
      <div className="w-80 border-r bg-card">
        {/* Header da Sidebar */ }
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold">Conversas</h2>
              { isConnected ? (
                <Wifi className="h-4 w-4 text-green-500" />
              ) : (
                <WifiOff className="h-4 w-4 text-red-500" />
              ) }
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="ghost">
                <Plus className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="ghost">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Busca */ }
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar conversas..."
              value={ searchTerm }
              onChange=({ ( e  }) => setSearchTerm( e.target.value ) }
              className="pl-10"
            />
          </div>
        </div>

        {/* Lista de Conversas */ }
        <ScrollArea className="h-[calc(100vh-140px)]">
          <div className="p-2">
            ({ filteredConversations.map( ( conversation  }) => (
              <div
                key={ conversation.id }`
                className={ `p-3 rounded-lg cursor-pointer transition-colors mb-1 ${ selectedConversation?.id === conversation.id
                    ? 'bg-primary/10 border border-primary/20'
                    : 'hover:bg-muted'`}
                  }` }
                onClick=({ ( }) => selectConversation( conversation ) }
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={ conversation.avatar } />
                      <AvatarFallback>
                        { conversation.type === 'group' ? (
                          <Users className="h-5 w-5" />
                        ) : (
                          conversation.name.charAt( 0 )
                        ) }
                      </AvatarFallback>
                    </Avatar>
                    { conversation.type === 'direct' && onlineUsers.has( conversation.participants?.[ 0 ]?.id ) && (
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
                    ) }
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium truncate">{ conversation.name }</h3>
                      <span className="text-xs text-muted-foreground">
                        { conversation.timestamp ? new Date( conversation.timestamp ).toLocaleTimeString( 'pt-BR', { hour: '2-digit', minute: '2-digit' } ) : '' }
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground truncate">
                        { conversation.lastMessage || 'Nenhuma mensagem' }
                      </p>
                      { conversation.unread > 0 && (
                        <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
                          { conversation.unread }
                        </Badge>
                      ) }
                    </div>
                  </div>
                </div>
              </div>
            ) ) }
          </div>
        </ScrollArea>
      </div>

      {/* Área Principal do Chat */ }
      { selectedConversation ? (
        <div className="flex-1 flex flex-col">
          {/* Header do Chat */ }
          <div className="p-4 border-b bg-card">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={ selectedConversation.avatar } />
                  <AvatarFallback>
                    { selectedConversation.type === 'group' ? (
                      <Users className="h-5 w-5" />
                    ) : (
                      selectedConversation.name.charAt( 0 )
                    ) }
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">{ selectedConversation.name }</h3>
                  <p className="text-sm text-muted-foreground">
                    { selectedConversation.type === 'group'`
                      ? `${ selectedConversation.participants?.length || 0 } participantes`
                      : onlineUsers.has( selectedConversation.participants?.[ 0 ]?.id ) ? 'Online' : 'Offline'
                    }
                    { typingUsers.size > 0 && (
                      <span className="text-blue-500 ml-2">digitando...</span>
                    ) }
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button size="sm" variant="ghost" onClick=({ ( }) => startCall( 'audio' ) }>
                  <Phone className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="ghost" onClick=({ ( }) => startCall( 'video' ) }>
                  <Video className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="ghost">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Área de Mensagens */ }
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              ({ messages.map( ( message  }) =>
              {
                const isOwn = message.senderId === localStorage.getItem( 'userId' );
                return (
                  <div
                    key={ message.id }`
                    className={ `flex ${ isOwn ? 'justify-end' : 'justify-start' }` }
                  >`
                    <div className={ `flex gap-2 max-w-[70%] ${ isOwn ? 'flex-row-reverse' : 'flex-row' }` }>
                      { !isOwn && (
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">
                            { message.senderName?.charAt( 0 ) || 'U' }
                          </AvatarFallback>
                        </Avatar>
                      ) }
`
                      <div className={ `rounded-lg p-3 ${ isOwn
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'`}
                        }` }>
                        { !isOwn && (
                          <p className="text-xs font-medium mb-1 opacity-70">
                            { message.senderName }
                          </p>
                        ) }
                        <p className="text-sm">{ message.content }</p>`
                        <p className={ `text-xs mt-1 ${ isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'`}
                          }` }>
                          { new Date( message.timestamp ).toLocaleTimeString( 'pt-BR', { hour: '2-digit', minute: '2-digit' } ) }
                        </p>
                      </div>
                    </div>
                  </div>
                );
              } ) }
              <div ref={ messagesEndRef } />
            </div>
          </ScrollArea>

          {/* Input de Mensagem */ }
          <div className="p-4 border-t bg-card">
            <div className="flex items-center gap-2">
              <Button size="sm" variant="ghost">
                <Paperclip className="h-4 w-4" />
              </Button>

              <div className="flex-1 relative">
                <Input
                  placeholder="Digite sua mensagem..."
                  value={ newMessage }
                  onChange=({ ( e  }) => setNewMessage( e.target.value ) }
                  onKeyPress={ handleKeyPress }
                  onBlur={ stopTyping }
                  className="pr-10"
                  disabled={ !isConnected }
                />
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2"
                >
                  <Smile className="h-4 w-4" />
                </Button>
              </div>

              <Button
                onClick={ handleSendMessage }
                disabled={ !newMessage.trim() || !isConnected }
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center bg-muted/20">
          <div className="text-center">
            <MessageCircle className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Selecione uma conversa</h3>
            <p className="text-muted-foreground">Escolha uma conversa para começar a conversar</p>
          </div>
        </div>
      ) }
    </div>
  );
}
`