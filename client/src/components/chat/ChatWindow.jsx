/**
 * CHAT WINDOW - Componente principal do sistema de chat
 */

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import
  {
    Send,
    Paperclip,
    Phone,
    Video,
    MoreVertical,
    Smile,
    Image as ImageIcon,
    File,
    Download
  } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ChatWindow( {
  conversationId,
  currentUserId,
  onClose
} )
{
  const [ messages, setMessages ] = useState( [] );
  const [ newMessage, setNewMessage ] = useState( '' );
  const [ isTyping, setIsTyping ] = useState( false );
  const [ onlineUsers, setOnlineUsers ] = useState( [] );
  const [ isLoading, setIsLoading ] = useState( false );
  const messagesEndRef = useRef( null );
  const fileInputRef = useRef( null );

  // Scroll para a última mensagem
  const scrollToBottom = () =>
  {
    messagesEndRef.current?.scrollIntoView( { behavior: 'smooth' } );
  };

  useEffect( () =>
  {
    scrollToBottom();
  }, [ messages ] );

  // Carregar mensagens
  useEffect( () =>
  {
    if ( conversationId )
    {
      loadMessages();
      loadOnlineUsers();
    }
  }, [ conversationId ] );

  const loadMessages = async () =>
  {
    try
    {
      setIsLoading( true );
      const response = await fetch( `/api/chat/conversations/${ conversationId }/messages` );
      const data = await response.json();

      if ( data.success )
      {
        setMessages( data.data.messages || [] );
      }
    } catch ( error )
    {
      console.error( 'Erro ao carregar mensagens:', error );
    } finally
    {
      setIsLoading( false );
    }
  };

  const loadOnlineUsers = async () =>
  {
    try
    {
      const response = await fetch( '/api/chat/online-users' );
      const data = await response.json();

      if ( data.success )
      {
        setOnlineUsers( data.data || [] );
      }
    } catch ( error )
    {
      console.error( 'Erro ao carregar usuários online:', error );
    }
  };

  // Enviar mensagem
  const sendMessage = async () =>
  {
    if ( !newMessage.trim() ) return;

    try
    {
      const response = await fetch( `/api/chat/conversations/${ conversationId }/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify( {
          content: newMessage,
          senderId: currentUserId,
          type: 'text'
        } )
      } );

      const data = await response.json();

      if ( data.success )
      {
        setMessages( prev => [ ...prev, data.data ] );
        setNewMessage( '' );
      }
    } catch ( error )
    {
      console.error( 'Erro ao enviar mensagem:', error );
    }
  };

  // Upload de arquivo
  const handleFileUpload = async ( event ) =>
  {
    const file = event.target.files[ 0 ];
    if ( !file ) return;

    try
    {
      const formData = new FormData();
      formData.append( 'file', file );
      formData.append( 'senderId', currentUserId );

      const response = await fetch( `/api/chat/conversations/${ conversationId }/upload`, {
        method: 'POST',
        body: formData
      } );

      const data = await response.json();

      if ( data.success )
      {
        setMessages( prev => [ ...prev, data.data.message ] );
      }
    } catch ( error )
    {
      console.error( 'Erro ao enviar arquivo:', error );
    }
  };

  // Iniciar chamada de voz
  const startVoiceCall = async () =>
  {
    try
    {
      const response = await fetch( '/api/chat/voice-calls', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify( {
          conversationId,
          callerId: currentUserId,
          participants: [ 'other_user' ] // Implementar lógica para obter participantes
        } )
      } );

      const data = await response.json();

      if ( data.success )
      {
        console.log( 'Chamada iniciada:', data.data );
        // Implementar interface de chamada
      }
    } catch ( error )
    {
      console.error( 'Erro ao iniciar chamada:', error );
    }
  };

  // Renderizar mensagem
  const renderMessage = ( message ) =>
  {
    const isOwnMessage = message.senderId === currentUserId;

    return (
      <div
        key={ message.id }
        className={ cn(
          'flex mb-4',
          isOwnMessage ? 'justify-end' : 'justify-start'
        ) }
      >
        { !isOwnMessage && (
          <Avatar className="w-8 h-8 mr-2">
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
        ) }

        <div
          className={ cn(
            'max-w-xs lg:max-w-md px-4 py-2 rounded-lg',
            isOwnMessage
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-900'
          ) }
        >
          { message.type === 'text' && (
            <p className="text-sm">{ message.content }</p>
          ) }

          { message.type === 'file' && (
            <div className="flex items-center space-x-2">
              <File className="w-4 h-4" />
              <span className="text-sm">{ message.content }</span>
              <Button size="sm" variant="ghost">
                <Download className="w-4 h-4" />
              </Button>
            </div>
          ) }

          <div className="text-xs opacity-70 mt-1">
            { new Date( message.timestamp ).toLocaleTimeString() }
          </div>
        </div>

        { isOwnMessage && (
          <Avatar className="w-8 h-8 ml-2">
            <AvatarFallback>Eu</AvatarFallback>
          </Avatar>
        ) }
      </div>
    );
  };

  return (
    <Card className="h-full flex flex-col">
      {/* Header do Chat */ }
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar>
              <AvatarFallback>CH</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">Chat</CardTitle>
              <div className="flex items-center space-x-2">
                <Badge variant="secondary" className="text-xs">
                  { onlineUsers.length } online
                </Badge>
                { isTyping && (
                  <span className="text-xs text-gray-500">Digitando...</span>
                ) }
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button size="sm" variant="ghost" onClick={ startVoiceCall }>
              <Phone className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="ghost">
              <Video className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="ghost">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      {/* Área de Mensagens */ }
      <CardContent className="flex-1 overflow-y-auto p-4">
        { isLoading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="space-y-4">
            { messages.map( renderMessage ) }
            <div ref={ messagesEndRef } />
          </div>
        ) }
      </CardContent>

      {/* Input de Mensagem */ }
      <div className="border-t p-4">
        <div className="flex items-center space-x-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={ () => fileInputRef.current?.click() }
          >
            <Paperclip className="w-4 h-4" />
          </Button>

          <Button size="sm" variant="ghost">
            <ImageIcon className="w-4 h-4" />
          </Button>

          <Button size="sm" variant="ghost">
            <Smile className="w-4 h-4" />
          </Button>

          <Input
            value={ newMessage }
            onChange={ ( e ) => setNewMessage( e.target.value ) }
            placeholder="Digite sua mensagem..."
            className="flex-1"
            onKeyPress={ ( e ) =>
            {
              if ( e.key === 'Enter' )
              {
                sendMessage();
              }
            } }
          />

          <Button onClick={ sendMessage } disabled={ !newMessage.trim() }>
            <Send className="w-4 h-4" />
          </Button>
        </div>

        <input
          ref={ fileInputRef }
          type="file"
          className="hidden"
          onChange={ handleFileUpload }
        />
      </div>
    </Card>
  );
}
