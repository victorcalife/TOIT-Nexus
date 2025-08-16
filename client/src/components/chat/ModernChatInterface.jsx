/**
 * MODERN CHAT INTERFACE
 * Interface moderna de chat com vídeo/áudio integrado
 * Funcionalidades: mensagens em tempo real, chamadas, compartilhamento de arquivos
 */

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import
  {
    Send,
    Phone,
    Video,
    Paperclip,
    Smile,
    MoreHorizontal,
    Search,
    Plus,
    Settings,
    Mic,
    MicOff,
    VideoOff,
    PhoneOff,
    ScreenShare,
    Users,
    MessageSquare,
    Image,
    File,
    Download,
    Reply,
    Edit,
    Trash2,
    Pin,
    Star,
    Clock,
    Check,
    CheckCheck,
    Circle,
    Minimize2,
    Maximize2,
    X
  } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const ModernChatInterface = ( { tenantId, userId, userRole } ) =>
{
  const [ conversations, setConversations ] = useState( [] );
  const [ selectedConversation, setSelectedConversation ] = useState( null );
  const [ messages, setMessages ] = useState( [] );
  const [ newMessage, setNewMessage ] = useState( '' );
  const [ isTyping, setIsTyping ] = useState( false );
  const [ onlineUsers, setOnlineUsers ] = useState( [] );
  const [ searchTerm, setSearchTerm ] = useState( '' );
  const [ isCallActive, setIsCallActive ] = useState( false );
  const [ callType, setCallType ] = useState( 'audio' ); // 'audio' | 'video'
  const [ isVideoEnabled, setIsVideoEnabled ] = useState( true );
  const [ isAudioEnabled, setIsAudioEnabled ] = useState( true );
  const [ isScreenSharing, setIsScreenSharing ] = useState( false );
  const [ callParticipants, setCallParticipants ] = useState( [] );
  const [ isMinimized, setIsMinimized ] = useState( false );

  const messagesEndRef = useRef( null );
  const fileInputRef = useRef( null );
  const videoRef = useRef( null );

  // Carregar conversas
  useEffect( () =>
  {
    loadConversations();
    loadOnlineUsers();
  }, [ tenantId, userId ] );

  // Auto-scroll para última mensagem
  useEffect( () =>
  {
    scrollToBottom();
  }, [ messages ] );

  const loadConversations = async () =>
  {
    // Simular carregamento de conversas
    const mockConversations = [
      {
        id: '1',
        name: 'Equipe de Desenvolvimento',
        type: 'group',
        participants: [ 'João Silva', 'Maria Santos', 'Pedro Costa' ],
        lastMessage: 'Vamos revisar o código hoje?',
        lastMessageTime: new Date(),
        unreadCount: 3,
        isOnline: true,
        avatar: null
      },
      {
        id: '2',
        name: 'Ana Oliveira',
        type: 'direct',
        participants: [ 'Ana Oliveira' ],
        lastMessage: 'Obrigada pela ajuda com o projeto!',
        lastMessageTime: new Date( Date.now() - 1800000 ),
        unreadCount: 0,
        isOnline: true,
        avatar: null
      },
      {
        id: '3',
        name: 'Suporte Técnico',
        type: 'group',
        participants: [ 'Carlos Tech', 'Suporte Bot' ],
        lastMessage: 'Ticket #1234 foi resolvido',
        lastMessageTime: new Date( Date.now() - 3600000 ),
        unreadCount: 1,
        isOnline: false,
        avatar: null
      }
    ];
    setConversations( mockConversations );
  };

  const loadOnlineUsers = async () =>
  {
    // Simular usuários online
    const mockOnlineUsers = [
      { id: '1', name: 'João Silva', status: 'online', avatar: null },
      { id: '2', name: 'Maria Santos', status: 'busy', avatar: null },
      { id: '3', name: 'Ana Oliveira', status: 'online', avatar: null },
      { id: '4', name: 'Pedro Costa', status: 'away', avatar: null }
    ];
    setOnlineUsers( mockOnlineUsers );
  };

  const loadMessages = async ( conversationId ) =>
  {
    // Simular carregamento de mensagens
    const mockMessages = [
      {
        id: '1',
        senderId: '2',
        senderName: 'Maria Santos',
        content: 'Olá pessoal! Como estão os preparativos para a apresentação?',
        timestamp: new Date( Date.now() - 7200000 ),
        type: 'text',
        status: 'read',
        reactions: [],
        isEdited: false
      },
      {
        id: '2',
        senderId: userId,
        senderName: 'Você',
        content: 'Tudo certo! Já terminei a parte do backend.',
        timestamp: new Date( Date.now() - 6900000 ),
        type: 'text',
        status: 'read',
        reactions: [ { emoji: '👍', users: [ 'Maria Santos' ] } ],
        isEdited: false
      },
      {
        id: '3',
        senderId: '3',
        senderName: 'João Silva',
        content: 'Ótimo! Vou compartilhar os mockups atualizados.',
        timestamp: new Date( Date.now() - 6600000 ),
        type: 'text',
        status: 'read',
        reactions: [],
        isEdited: false
      },
      {
        id: '4',
        senderId: '3',
        senderName: 'João Silva',
        content: '',
        timestamp: new Date( Date.now() - 6300000 ),
        type: 'file',
        status: 'read',
        fileData: {
          name: 'Mockups_v2.pdf',
          size: '2.4 MB',
          type: 'pdf',
          url: '#'
        },
        reactions: [],
        isEdited: false
      },
      {
        id: '5',
        senderId: '2',
        senderName: 'Maria Santos',
        content: 'Perfeito! Vamos revisar juntos na reunião de amanhã?',
        timestamp: new Date( Date.now() - 300000 ),
        type: 'text',
        status: 'delivered',
        reactions: [],
        isEdited: false
      }
    ];
    setMessages( mockMessages );
  };

  const scrollToBottom = () =>
  {
    messagesEndRef.current?.scrollIntoView( { behavior: 'smooth' } );
  };

  const handleConversationSelect = ( conversation ) =>
  {
    setSelectedConversation( conversation );
    loadMessages( conversation.id );

    // Marcar como lida
    setConversations( conversations.map( conv =>
      conv.id === conversation.id
        ? { ...conv, unreadCount: 0 }
        : conv
    ) );
  };

  const sendMessage = async () =>
  {
    if ( !newMessage.trim() || !selectedConversation ) return;

    const message = {
      id: Date.now().toString(),
      senderId: userId,
      senderName: 'Você',
      content: newMessage,
      timestamp: new Date(),
      type: 'text',
      status: 'sending',
      reactions: [],
      isEdited: false
    };

    setMessages( [ ...messages, message ] );
    setNewMessage( '' );

    // Simular envio
    setTimeout( () =>
    {
      setMessages( prev => prev.map( msg =>
        msg.id === message.id
          ? { ...msg, status: 'sent' }
          : msg
      ) );
    }, 1000 );

    setTimeout( () =>
    {
      setMessages( prev => prev.map( msg =>
        msg.id === message.id
          ? { ...msg, status: 'delivered' }
          : msg
      ) );
    }, 2000 );
  };

  const startCall = ( type ) =>
  {
    setCallType( type );
    setIsCallActive( true );
    setCallParticipants( [
      { id: userId, name: 'Você', isVideoEnabled: type === 'video', isAudioEnabled: true },
      ...selectedConversation.participants.map( name => ( {
        id: Math.random().toString(),
        name,
        isVideoEnabled: type === 'video',
        isAudioEnabled: true
      } ) )
    ] );
  };

  const endCall = () =>
  {
    setIsCallActive( false );
    setCallParticipants( [] );
    setIsVideoEnabled( true );
    setIsAudioEnabled( true );
    setIsScreenSharing( false );
  };

  const toggleVideo = () =>
  {
    setIsVideoEnabled( !isVideoEnabled );
  };

  const toggleAudio = () =>
  {
    setIsAudioEnabled( !isAudioEnabled );
  };

  const toggleScreenShare = () =>
  {
    setIsScreenSharing( !isScreenSharing );
  };

  const handleFileUpload = ( event ) =>
  {
    const files = Array.from( event.target.files );
    files.forEach( file =>
    {
      const message = {
        id: Date.now().toString() + Math.random(),
        senderId: userId,
        senderName: 'Você',
        content: '',
        timestamp: new Date(),
        type: 'file',
        status: 'sending',
        fileData: {
          name: file.name,
          size: formatFileSize( file.size ),
          type: file.type,
          url: URL.createObjectURL( file )
        },
        reactions: [],
        isEdited: false
      };
      setMessages( prev => [ ...prev, message ] );
    } );
  };

  const formatFileSize = ( bytes ) =>
  {
    if ( bytes === 0 ) return '0 Bytes';
    const k = 1024;
    const sizes = [ 'Bytes', 'KB', 'MB', 'GB' ];
    const i = Math.floor( Math.log( bytes ) / Math.log( k ) );
    return parseFloat( ( bytes / Math.pow( k, i ) ).toFixed( 2 ) ) + ' ' + sizes[ i ];
  };

  const getStatusIcon = ( status ) =>
  {
    switch ( status )
    {
      case 'sending':
        return <Clock className="h-3 w-3 text-slate-400" />;
      case 'sent':
        return <Check className="h-3 w-3 text-slate-400" />;
      case 'delivered':
        return <CheckCheck className="h-3 w-3 text-slate-400" />;
      case 'read':
        return <CheckCheck className="h-3 w-3 text-blue-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = ( status ) =>
  {
    switch ( status )
    {
      case 'online':
        return 'bg-green-500';
      case 'busy':
        return 'bg-red-500';
      case 'away':
        return 'bg-yellow-500';
      default:
        return 'bg-slate-400';
    }
  };

  // Filtrar conversas
  const filteredConversations = conversations.filter( conv =>
    conv.name.toLowerCase().includes( searchTerm.toLowerCase() )
  );

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar - Lista de Conversas */ }
      <div className="w-80 bg-white border-r border-slate-200 flex flex-col">
        {/* Header da Sidebar */ }
        <div className="p-4 border-b border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-800">Chat</h2>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Busca */ }
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Buscar conversas..."
              value={ searchTerm }
              onChange={ ( e ) => setSearchTerm( e.target.value ) }
              className="pl-10"
            />
          </div>
        </div>

        {/* Lista de Conversas */ }
        <div className="flex-1 overflow-y-auto">
          { filteredConversations.map( conversation => (
            <ConversationItem
              key={ conversation.id }
              conversation={ conversation }
              isSelected={ selectedConversation?.id === conversation.id }
              onClick={ () => handleConversationSelect( conversation ) }
            />
          ) ) }
        </div>

        {/* Usuários Online */ }
        <div className="border-t border-slate-200 p-4">
          <h3 className="text-sm font-semibold text-slate-600 mb-3">
            Online ({ onlineUsers.filter( u => u.status === 'online' ).length })
          </h3>
          <div className="space-y-2">
            { onlineUsers.slice( 0, 4 ).map( user => (
              <div key={ user.id } className="flex items-center space-x-2">
                <div className="relative">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={ user.avatar } />
                    <AvatarFallback className="text-xs">
                      { user.name.split( ' ' ).map( n => n[ 0 ] ).join( '' ) }
                    </AvatarFallback>
                  </Avatar>
                  <div className={ `absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${ getStatusColor( user.status ) }` } />
                </div>
                <span className="text-sm text-slate-700 truncate">{ user.name }</span>
              </div>
            ) ) }
          </div>
        </div>
      </div>

      {/* Área Principal do Chat */ }
      <div className="flex-1 flex flex-col">
        { selectedConversation ? (
          <>
            {/* Header do Chat */ }
            <ChatHeader
              conversation={ selectedConversation }
              onStartCall={ startCall }
              onlineUsers={ onlineUsers }
            />

            {/* Área de Mensagens */ }
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              { messages.map( message => (
                <MessageItem
                  key={ message.id }
                  message={ message }
                  isOwn={ message.senderId === userId }
                  getStatusIcon={ getStatusIcon }
                />
              ) ) }
              <div ref={ messagesEndRef } />
            </div>

            {/* Input de Mensagem */ }
            <MessageInput
              newMessage={ newMessage }
              setNewMessage={ setNewMessage }
              onSendMessage={ sendMessage }
              onFileUpload={ handleFileUpload }
              fileInputRef={ fileInputRef }
              isTyping={ isTyping }
            />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-slate-500">
              <MessageSquare className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">Selecione uma conversa</h3>
              <p>Escolha uma conversa da lista para começar a conversar</p>
            </div>
          </div>
        ) }
      </div>

      {/* Interface de Chamada */ }
      { isCallActive && (
        <CallInterface
          callType={ callType }
          participants={ callParticipants }
          isVideoEnabled={ isVideoEnabled }
          isAudioEnabled={ isAudioEnabled }
          isScreenSharing={ isScreenSharing }
          isMinimized={ isMinimized }
          onToggleVideo={ toggleVideo }
          onToggleAudio={ toggleAudio }
          onToggleScreenShare={ toggleScreenShare }
          onEndCall={ endCall }
          onMinimize={ () => setIsMinimized( !isMinimized ) }
          videoRef={ videoRef }
        />
      ) }
    </div>
  );
};

// Componente Item de Conversa
const ConversationItem = ( { conversation, isSelected, onClick } ) =>
{
  return (
    <div
      onClick={ onClick }
      className={ `
        p-4 border-b border-slate-100 cursor-pointer transition-colors duration-200
        ${ isSelected ? 'bg-blue-50 border-blue-200' : 'hover:bg-slate-50' }
      `}
    >
      <div className="flex items-center space-x-3">
        <div className="relative">
          <Avatar className="h-12 w-12">
            <AvatarImage src={ conversation.avatar } />
            <AvatarFallback>
              { conversation.type === 'group' ? (
                <Users className="h-6 w-6" />
              ) : (
                conversation.name.split( ' ' ).map( n => n[ 0 ] ).join( '' )
              ) }
            </AvatarFallback>
          </Avatar>
          { conversation.isOnline && (
            <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
          ) }
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-semibold text-slate-900 truncate">
              { conversation.name }
            </h3>
            <span className="text-xs text-slate-500">
              { format( conversation.lastMessageTime, 'HH:mm' ) }
            </span>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-600 truncate">
              { conversation.lastMessage }
            </p>
            { conversation.unreadCount > 0 && (
              <Badge variant="default" className="ml-2 text-xs">
                { conversation.unreadCount }
              </Badge>
            ) }
          </div>

          { conversation.type === 'group' && (
            <div className="flex items-center mt-1">
              <Users className="h-3 w-3 text-slate-400 mr-1" />
              <span className="text-xs text-slate-500">
                { conversation.participants.length } participantes
              </span>
            </div>
          ) }
        </div>
      </div>
    </div>
  );
};

// Componente Header do Chat
const ChatHeader = ( { conversation, onStartCall, onlineUsers } ) =>
{
  const participantsOnline = conversation.participants.filter( name =>
    onlineUsers.some( user => user.name === name && user.status === 'online' )
  ).length;

  return (
    <div className="bg-white border-b border-slate-200 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={ conversation.avatar } />
            <AvatarFallback>
              { conversation.type === 'group' ? (
                <Users className="h-5 w-5" />
              ) : (
                conversation.name.split( ' ' ).map( n => n[ 0 ] ).join( '' )
              ) }
            </AvatarFallback>
          </Avatar>

          <div>
            <h2 className="font-semibold text-slate-900">{ conversation.name }</h2>
            <p className="text-sm text-slate-500">
              { conversation.type === 'group'
                ? `${ participantsOnline } de ${ conversation.participants.length } online`
                : conversation.isOnline ? 'Online' : 'Offline'
              }
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={ () => onStartCall( 'audio' ) }
          >
            <Phone className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={ () => onStartCall( 'video' ) }
          >
            <Video className="h-4 w-4" />
          </Button>

          <Button variant="outline" size="sm">
            <Search className="h-4 w-4" />
          </Button>

          <Button variant="outline" size="sm">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

// Componente Item de Mensagem
const MessageItem = ( { message, isOwn, getStatusIcon } ) =>
{
  const [ showActions, setShowActions ] = useState( false );

  const renderMessageContent = () =>
  {
    switch ( message.type )
    {
      case 'file':
        return (
          <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg max-w-xs">
            <div className="flex-shrink-0">
              { message.fileData.type.startsWith( 'image/' ) ? (
                <Image className="h-8 w-8 text-blue-500" />
              ) : (
                <File className="h-8 w-8 text-slate-500" />
              ) }
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">
                { message.fileData.name }
              </p>
              <p className="text-xs text-slate-500">{ message.fileData.size }</p>
            </div>
            <Button variant="ghost" size="sm">
              <Download className="h-4 w-4" />
            </Button>
          </div>
        );

      default:
        return (
          <div className={ `
            max-w-xs lg:max-w-md px-4 py-2 rounded-lg
            ${ isOwn
              ? 'bg-blue-500 text-white'
              : 'bg-white border border-slate-200 text-slate-900'
            }
          `}>
            <p className="text-sm">{ message.content }</p>
            { message.isEdited && (
              <span className="text-xs opacity-70 italic">(editado)</span>
            ) }
          </div>
        );
    }
  };

  return (
    <div
      className={ `flex ${ isOwn ? 'justify-end' : 'justify-start' }` }
      onMouseEnter={ () => setShowActions( true ) }
      onMouseLeave={ () => setShowActions( false ) }
    >
      <div className={ `flex items-end space-x-2 ${ isOwn ? 'flex-row-reverse space-x-reverse' : '' }` }>
        { !isOwn && (
          <Avatar className="h-8 w-8">
            <AvatarFallback className="text-xs">
              { message.senderName.split( ' ' ).map( n => n[ 0 ] ).join( '' ) }
            </AvatarFallback>
          </Avatar>
        ) }

        <div className={ `flex flex-col ${ isOwn ? 'items-end' : 'items-start' }` }>
          { !isOwn && (
            <span className="text-xs text-slate-500 mb-1 px-1">
              { message.senderName }
            </span>
          ) }

          <div className="relative">
            { renderMessageContent() }

            { showActions && (
              <div className={ `
                absolute top-0 flex items-center space-x-1 bg-white border border-slate-200 rounded-lg shadow-lg p-1
                ${ isOwn ? '-left-20' : '-right-20' }
              `}>
                <Button variant="ghost" size="sm">
                  <Reply className="h-3 w-3" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Star className="h-3 w-3" />
                </Button>
                { isOwn && (
                  <>
                    <Button variant="ghost" size="sm">
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </>
                ) }
              </div>
            ) }
          </div>

          <div className={ `flex items-center space-x-1 mt-1 px-1 ${ isOwn ? 'flex-row-reverse' : '' }` }>
            <span className="text-xs text-slate-500">
              { format( message.timestamp, 'HH:mm' ) }
            </span>
            { isOwn && getStatusIcon( message.status ) }
          </div>

          {/* Reações */ }
          { message.reactions && message.reactions.length > 0 && (
            <div className="flex items-center space-x-1 mt-1">
              { message.reactions.map( ( reaction, index ) => (
                <Badge key={ index } variant="secondary" className="text-xs">
                  { reaction.emoji } { reaction.users.length }
                </Badge>
              ) ) }
            </div>
          ) }
        </div>
      </div>
    </div>
  );
};

export default ModernChatInterface;
