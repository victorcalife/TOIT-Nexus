/**
 * SISTEMA DE CHAT EM TEMPO REAL - TOIT NEXUS
 * WebSocket real com funcionalidades completas
 * 100% JavaScript - SEM TYPESCRIPT
 */

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import {  
  MessageCircle, 
  Send, 
  Users, 
  Phone, 
  Video,
  Paperclip,
  Smile,
  MoreVertical,
  Search,
  Settings,
  UserPlus,
  Archive,
  Star,
  Reply,
  Forward,
  Download,
  Trash2,
  Edit3,
  Check,
  CheckCheck,
  Clock,
  AlertCircle }
} from 'lucide-react';

const ChatSystem = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [activeChat, setActiveChat] = useState(null);
  const [chats, setChats] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMessages, setSelectedMessages] = useState([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  
  const messagesEndRef = useRef(null);
  const wsRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const fileInputRef = useRef(null);
  
  const { user } = useAuth();
  const { toast } = useToast();

  /**
   * CONECTAR WEBSOCKET
   */
  const connectWebSocket = () => {
    const wsUrl = `wss://api.toit.com.br/ws/chat?token=${localStorage.getItem('token')}`;
    
    wsRef.current = new WebSocket(wsUrl);
    
    wsRef.current.onopen = () => {
      setIsConnected(true);
      console.log('🔗 WebSocket conectado');
      toast({
        title: "Chat conectado",
        description: "Você está online e pode enviar mensagens",
      });
    };
    
    wsRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      handleWebSocketMessage(data);
    };
    
    wsRef.current.onclose = () => {
      setIsConnected(false);
      console.log('❌ WebSocket desconectado');
      // Tentar reconectar após 3 segundos
      setTimeout(connectWebSocket, 3000);
    };
    
    wsRef.current.onerror = (error) => {
      console.error('❌ Erro WebSocket:', error);
      toast({
        title: "Erro de conexão",
        description: "Problema na conexão do chat",
        variant: "destructive"
      });
    };
  };

  /**
   * PROCESSAR MENSAGENS WEBSOCKET
   */
  const handleWebSocketMessage = (data) => {
    switch (data.type) {
      case 'new_message':
        setMessages(prev => [...prev, data.message]);
        scrollToBottom();
        break;
        
      case 'message_delivered':
        setMessages(prev => prev.map(msg => 
          msg.id === data.messageId 
            ? { ...msg, status: 'delivered' }
            : msg
        ));
        break;
        
      case 'message_read':
        setMessages(prev => prev.map(msg => 
          msg.id === data.messageId 
            ? { ...msg, status: 'read' }
            : msg
        ));
        break;
        
      case 'user_typing':
        if (data.userId !== user.id) ({ setTypingUsers(prev => [...prev.filter(u => u.id !== data.userId), data.user]);
          // Remove typing após 3 segundos
          setTimeout(( }) => {
            setTypingUsers(prev => prev.filter(u => u.id !== data.userId));
          }, 3000);
        }
        break;
        
      case 'user_online':
        setOnlineUsers(prev => [...prev.filter(u => u.id !== data.user.id), data.user]);
        break;
        
      case 'user_offline':
        setOnlineUsers(prev => prev.filter(u => u.id !== data.userId));
        break;
        
      case 'chat_created':
        setChats(prev => [...prev, data.chat]);
        break;
        
      default:
        console.log('Tipo de mensagem não reconhecido:', data.type);
    }
  };

  /**
   * ENVIAR MENSAGEM
   */
  const sendMessage = async () => {
    if (!newMessage.trim() || !activeChat || !isConnected) return;

    const messageData = {
      type: 'send_message',
      chatId: activeChat.id,
      content: newMessage.trim(),
      messageType: 'text',
      timestamp: new Date().toISOString()
    };

    // Adicionar mensagem localmente (otimistic update)
    const tempMessage = {`
      id: `temp-${Date.now()}`,
      content: newMessage.trim(),
      senderId: user.id,
      senderName: user.name,
      timestamp: new Date().toISOString(),
      status: 'sending',
      messageType: 'text'
    };

    setMessages(prev => [...prev, tempMessage]);
    setNewMessage('');
    scrollToBottom();

    // Enviar via WebSocket
    wsRef.current.send(JSON.stringify(messageData));
  };

  /**
   * CARREGAR CHATS
   */
  const loadChats = async () => {
    try {
      const response = await fetch('/api/chat/conversations', {
        headers: {`
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao carregar chats');
      }

      const data = await response.json();
      setChats(data.chats || []);
      
      // Selecionar primeiro chat se existir
      if (data.chats && data.chats.length > 0 && !activeChat) {
        setActiveChat(data.chats[0]);
      }
    } catch (error) {
      console.error('Erro ao carregar chats:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as conversas",
        variant: "destructive"
      });
    }
  };

  /**
   * CARREGAR MENSAGENS DO CHAT
   */
  const loadMessages = async (chatId) => {
    try {`
      const response = await fetch(`/api/chat/messages/${chatId}`, {
        headers: {`
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao carregar mensagens');
      }

      const data = await response.json();
      setMessages(data.messages || []);
      scrollToBottom();
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as mensagens",
        variant: "destructive"
      });
    }
  };

  /**
   * CRIAR NOVO CHAT
   */
  const createNewChat = async (participantIds, chatName = null) => {
    try {
      const response = await fetch('/api/chat/create', {
        method: 'POST',
        headers: {`
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          participantIds,
          chatName,
          chatType: participantIds.length > 1 ? 'group' : 'direct'
        })
      });

      if (!response.ok) {
        throw new Error('Erro ao criar chat');
      }

      const data = await response.json();
      setChats(prev => [...prev, data.chat]);
      setActiveChat(data.chat);
      
      toast({
        title: "Chat criado",
        description: "Nova conversa iniciada com sucesso",
      });
    } catch (error) {
      console.error('Erro ao criar chat:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar o chat",
        variant: "destructive"
      });
    }
  };

  /**
   * ENVIAR ARQUIVO
   */
  const sendFile = async (file) => {
    if (!file || !activeChat) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('chatId', activeChat.id);

    try {
      const response = await fetch('/api/chat/upload', {
        method: 'POST',
        headers: {`
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Erro ao enviar arquivo');
      }

      const data = await response.json();
      
      // Enviar mensagem de arquivo via WebSocket
      const messageData = {
        type: 'send_message',
        chatId: activeChat.id,
        content: data.fileUrl,
        messageType: 'file',
        fileName: file.name,
        fileSize: file.size,
        timestamp: new Date().toISOString()
      };

      wsRef.current.send(JSON.stringify(messageData));
      
      toast({
        title: "Arquivo enviado",`
        description: `${file.name} foi enviado com sucesso`,
      });
    } catch (error) {
      console.error('Erro ao enviar arquivo:', error);
      toast({
        title: "Erro",
        description: "Não foi possível enviar o arquivo",
        variant: "destructive"
      });
    }
  };

  /**
   * INDICAR QUE ESTÁ DIGITANDO
   */
  const handleTyping = () => {
    if (!isConnected || !activeChat) return;

    if (!isTyping) {
      setIsTyping(true);
      wsRef.current.send(JSON.stringify({
        type: 'typing_start',
        chatId: activeChat.id
      }));
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      wsRef.current.send(JSON.stringify({
        type: 'typing_stop',
        chatId: activeChat.id
      }));
    }, 1000);
  };

  /**
   * SCROLL PARA BAIXO
   */
  const scrollToBottom = () => ({ setTimeout(( }) => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  /**
   * FORMATAR TIMESTAMP
   */
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else {
      return date.toLocaleDateString('pt-BR', { 
        day: '2-digit', 
        month: '2-digit' 
      });
    }
  };

  /**
   * RENDERIZAR STATUS DA MENSAGEM
   */
  const renderMessageStatus = (message) => {
    if (message.senderId !== user.id) return null;

    switch (message.status) {
      case 'sending':
        return <Clock className="h-3 w-3 text-gray-400" />;
      case 'delivered':
        return <Check className="h-3 w-3 text-gray-400" />;
      case 'read':
        return <CheckCheck className="h-3 w-3 text-blue-500" />;
      default:
        return <AlertCircle className="h-3 w-3 text-red-400" />;
    }
  };

  /**
   * FILTRAR CHATS
   */
  const filteredChats = chats.filter(chat => 
    chat.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    chat.participants?.some(p => 
      p.name?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  /**
   * INICIALIZAR COMPONENTE
   */
  useEffect(() => ({ connectWebSocket();
    loadChats();

    return ( }) => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  /**
   * CARREGAR MENSAGENS QUANDO CHAT ATIVO MUDAR
   */
  useEffect(() => {
    if (activeChat) {
      loadMessages(activeChat.id);
    }
  }, [activeChat]);

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Sidebar - Lista de Chats */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header da Sidebar */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <MessageCircle className="h-6 w-6 text-blue-600" />

            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <UserPlus className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Status de Conexão */}
          <div className="flex items-center gap-2 mb-4">`
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-sm text-gray-600">
              {isConnected ? 'Online' : 'Desconectado'}
            </span>
          </div>

          {/* Busca */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar conversas..."
              value={searchTerm}
              onChange=({ (e }) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Lista de Chats */}
        <div className="flex-1 overflow-y-auto">
          ({ filteredChats.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-2" />
              <p>Nenhuma conversa encontrada</p>
            </div>
          ) : (
            filteredChats.map((chat }) => (
              <div
                key={chat.id}
                onClick=({ ( }) => setActiveChat(chat)}`
                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                  activeChat?.id === chat.id ? 'bg-blue-50 border-blue-200' : ''`}
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-semibold">
                        {chat.name?.charAt(0)?.toUpperCase() || 'C'}
                      </span>
                    </div>
                    {chat.chatType === 'direct' && onlineUsers.some(u => 
                      chat.participants?.some(p => p.id === u.id && p.id !== user.id)
                    ) && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-gray-900 truncate">
                        {chat.name || chat.participants?.filter(p => p.id !== user.id).map(p => p.name).join(', ')}
                      </h3>
                      <span className="text-xs text-gray-500">
                        {formatTimestamp(chat.lastMessageAt)}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-600 truncate">
                        {chat.lastMessage || 'Nenhuma mensagem'}
                      </p>
                      {chat.unreadCount > 0 && (
                        <Badge variant="destructive" className="text-xs">
                          {chat.unreadCount}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Área Principal do Chat */}
      <div className="flex-1 flex flex-col">
        {activeChat ? (
          <>
            {/* Header do Chat */}
            <div className="p-4 bg-white border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold">
                      {activeChat.name?.charAt(0)?.toUpperCase() || 'C'}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {activeChat.name || activeChat.participants?.filter(p => p.id !== user.id).map(p => p.name).join(', ')}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {activeChat.chatType === 'group' `
                        ? `${activeChat.participants?.length} participantes`
                        : onlineUsers.some(u => activeChat.participants?.some(p => p.id === u.id && p.id !== user.id))
                          ? 'Online'
                          : 'Offline'
                      }
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Phone className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Video className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Área de Mensagens */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              ({ messages.map((message }) => (
                <div
                  key={message.id}`
                  className={`flex ${message.senderId === user.id ? 'justify-end' : 'justify-start'}`}
                >`
                  <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.senderId === user.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-900'`}
                  }`}>
                    {message.senderId !== user.id && activeChat.chatType === 'group' && (
                      <p className="text-xs font-medium mb-1 opacity-75">
                        {message.senderName}
                      </p>
                    )}
                    
                    {message.messageType === 'file' ? (
                      <div className="flex items-center gap-2">
                        <Paperclip className="h-4 w-4" />
                        <span className="text-sm">{message.fileName}</span>
                        <Button variant="ghost" size="sm">
                          <Download className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <p className="text-sm">{message.content}</p>
                    )}
                    
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs opacity-75">
                        {formatTimestamp(message.timestamp)}
                      </span>
                      {renderMessageStatus(message)}
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Indicador de digitação */}
              {typingUsers.length > 0 && (
                <div className="flex justify-start">
                  <div className="bg-gray-200 text-gray-900 px-4 py-2 rounded-lg">
                    <p className="text-sm">
                      {typingUsers.map(u => u.name).join(', ')} está digitando...
                    </p>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input de Mensagem */}
            <div className="p-4 bg-white border-t border-gray-200">
              <div className="flex items-center gap-3">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange=({ (e }) => {
                    if (e.target.files[0]) {
                      sendFile(e.target.files[0]);
                    }
                  }}
                  className="hidden"
                />
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick=({ ( }) => fileInputRef.current?.click()}
                >
                  <Paperclip className="h-4 w-4" />
                </Button>
                
                <div className="flex-1 relative">
                  <Input
                    placeholder="Digite sua mensagem..."
                    value={newMessage}
                    onChange=({ (e }) => {
                      setNewMessage(e.target.value);
                      handleTyping();
                    }}
                    onKeyPress=({ (e }) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                    className="pr-10"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2"
                    onClick=({ ( }) => setShowEmojiPicker(!showEmojiPicker)}
                  >
                    <Smile className="h-4 w-4" />
                  </Button>
                </div>
                
                <Button
                  onClick={sendMessage}
                  disabled={!newMessage.trim() || !isConnected}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <MessageCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Selecione uma conversa
              </h3>
              <p className="text-gray-500">
                Escolha uma conversa da lista para começar a conversar
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatSystem;
`