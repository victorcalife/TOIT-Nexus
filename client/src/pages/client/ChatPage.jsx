/**
 * Página de Chat
 * Interface de chat para comunicação em tempo real
 */
import React, { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Send, Paperclip, Smile, MoreVertical, Phone, Video, Search, Users } from 'lucide-react';
import { toast } from 'sonner';

const ChatPage = () => {
  const [selectedChat, setSelectedChat] = useState(null);
  const [message, setMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const messagesEndRef = useRef(null);
  const queryClient = useQueryClient();

  // Dados simulados para chats
  const mockChats = [
    {
      id: 1,
      name: 'Equipe de Desenvolvimento',
      type: 'group',
      avatar: null,
      lastMessage: 'Vamos revisar o código hoje?',
      lastMessageTime: '2024-01-15T14:30:00Z',
      unreadCount: 3,
      online: true,
      participants: 5
    },
    {
      id: 2,
      name: 'João Silva',
      type: 'direct',
      avatar: '/avatars/joao.jpg',
      lastMessage: 'Obrigado pela ajuda!',
      lastMessageTime: '2024-01-15T13:45:00Z',
      unreadCount: 0,
      online: true
    },
    {
      id: 3,
      name: 'Suporte Técnico',
      type: 'group',
      avatar: null,
      lastMessage: 'Ticket #1234 foi resolvido',
      lastMessageTime: '2024-01-15T12:20:00Z',
      unreadCount: 1,
      online: false,
      participants: 8
    },
    {
      id: 4,
      name: 'Maria Santos',
      type: 'direct',
      avatar: '/avatars/maria.jpg',
      lastMessage: 'Podemos marcar uma reunião?',
      lastMessageTime: '2024-01-15T11:15:00Z',
      unreadCount: 2,
      online: false
    }
  ];

  // Dados simulados para mensagens
  const mockMessages = {
    1: [
      {
        id: 1,
        senderId: 'user1',
        senderName: 'João Silva',
        senderAvatar: '/avatars/joao.jpg',
        content: 'Pessoal, como está o progresso do projeto?',
        timestamp: '2024-01-15T10:00:00Z',
        type: 'text'
      },
      {
        id: 2,
        senderId: 'current',
        senderName: 'Você',
        senderAvatar: '/avatars/current.jpg',
        content: 'Estamos no prazo! Frontend quase pronto.',
        timestamp: '2024-01-15T10:05:00Z',
        type: 'text'
      },
      {
        id: 3,
        senderId: 'user2',
        senderName: 'Maria Santos',
        senderAvatar: '/avatars/maria.jpg',
        content: 'Backend também está avançando bem.',
        timestamp: '2024-01-15T10:10:00Z',
        type: 'text'
      },
      {
        id: 4,
        senderId: 'user1',
        senderName: 'João Silva',
        senderAvatar: '/avatars/joao.jpg',
        content: 'Ótimo! Vamos revisar o código hoje?',
        timestamp: '2024-01-15T14:30:00Z',
        type: 'text'
      }
    ],
    2: [
      {
        id: 1,
        senderId: 'user1',
        senderName: 'João Silva',
        senderAvatar: '/avatars/joao.jpg',
        content: 'Oi! Preciso de ajuda com um bug.',
        timestamp: '2024-01-15T13:00:00Z',
        type: 'text'
      },
      {
        id: 2,
        senderId: 'current',
        senderName: 'Você',
        senderAvatar: '/avatars/current.jpg',
        content: 'Claro! Qual é o problema?',
        timestamp: '2024-01-15T13:05:00Z',
        type: 'text'
      },
      {
        id: 3,
        senderId: 'user1',
        senderName: 'João Silva',
        senderAvatar: '/avatars/joao.jpg',
        content: 'Obrigado pela ajuda!',
        timestamp: '2024-01-15T13:45:00Z',
        type: 'text'
      }
    ]
  };

  // Query para buscar chats
  const { data: chats, isLoading: chatsLoading } = useQuery({
    queryKey: ['chats'],
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return mockChats;
    },
    staleTime: 300000, // 5 minutes
    refetchOnWindowFocus: false
  });

  // Query para buscar mensagens do chat selecionado
  const { data: messages, isLoading: messagesLoading } = useQuery({
    queryKey: ['messages', selectedChat?.id],
    queryFn: async () => {
      if (!selectedChat) return [];
      await new Promise(resolve => setTimeout(resolve, 500));
      return mockMessages[selectedChat.id] || [];
    },
    enabled: !!selectedChat
  });

  // Mutation para enviar mensagem
  const sendMessageMutation = useMutation({
    mutationFn: async (messageData) => {
      await new Promise(resolve => setTimeout(resolve, 500));
      return {
        id: Date.now(),
        senderId: 'current',
        senderName: 'Você',
        senderAvatar: '/avatars/current.jpg',
        content: messageData.content,
        timestamp: new Date().toISOString(),
        type: 'text'
      };
    },
    onSuccess: () => {
      setMessage('');
      queryClient.invalidateQueries(['messages', selectedChat?.id]);
      queryClient.invalidateQueries(['chats']);
    },
    onError: () => {
      toast.error('Erro ao enviar mensagem');
    }
  });

  const handleSendMessage = () => {
    if (!message.trim() || !selectedChat) return;
    
    sendMessageMutation.mutate({
      chatId: selectedChat.id,
      content: message.trim()
    });
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();    
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatLastMessageTime = (timestamp) => {
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

  const filteredChats = chats?.filter(chat => 
    chat.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="h-[calc(100vh-8rem)] flex">
      {/* Chat List */}
      <div className="w-[300px] border-r bg-background">  
              {/* Chat List Header */}
        <div className="p-4 border-b">
          {/* Chat List Header Content */}
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Conversas</h2>
            <Button size="sm" variant="outline" type="button">
              <Users className="h-4 w-4" />
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar conversas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
       
        <ScrollArea className="flex-1 overflow-y-auto">
          {chatsLoading ? (
            <div className="flex items-center justify-center h-32">
              <LoadingSpinner />
            </div>
          ) : (
            <div className="space-y-1 p-2">
              {filteredChats.map((chat) => {
                return (
                <button
                  key={chat.id}
                  className={`p-3 rounded-lg cursor-pointer transition-colors hover:bg-accent ${
                    selectedChat?.id === chat.id ? 'bg-accent' : ''
                  }`}
                  onClick={() => setSelectedChat(chat)}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={chat.avatar} />
                        <AvatarFallback>
                          {chat.type === 'group' ? (
                            <Users className="h-5 w-5" />
                          ) : (
                            chat.name.charAt(0).toUpperCase()
                          )}
                        </AvatarFallback>
                      </Avatar>
                      {chat.online && chat.type === 'direct' && (
                        <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-background" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium truncate">{chat.name}</h3>
                        <span className="text-xs text-muted-foreground">
                          {formatLastMessageTime(chat.lastMessageTime)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground truncate">
                          {chat.lastMessage}
                        </p>
                        {chat.unreadCount > 0 && (
                          <Badge className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                            {chat.unreadCount}
                          </Badge>
                        )}
                      </div>
                      {chat.type === 'group' && (
                        <p className="text-xs text-muted-foreground">
                          {chat.participants} participantes
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              )})}
            </div>
          )}
        </ScrollArea>
      </div>                
      {/* Área de Chat */}
      <div className="flex-1 flex flex-col">
        {selectedChat ? (
          <>
            {/* Header do Chat */}
            <div className="p-4 border-b bg-background">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={selectedChat.avatar} />
                    <AvatarFallback>
                      {selectedChat.type === 'group' ? (
                        <Users className="h-5 w-5" />
                      ) : (
                        selectedChat.name.charAt(0).toUpperCase()
                      )}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium">{selectedChat.name}</h3>
                    {selectedChat.type === 'direct' ? (
                      <p className="text-sm text-muted-foreground">
                        {selectedChat.online ? 'Online' : 'Offline'}
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        {selectedChat.participants} participantes
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline">
                    <Phone className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline">
                    <Video className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Mensagens */}
            <ScrollArea className="flex-1 p-4">
              {messagesLoading ? (
                <div className="flex items-center justify-center h-32">
                  <LoadingSpinner />
                </div>
              ) : (
                <div className="space-y-4">
                  {messages?.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex gap-3 ${
                        msg.senderId === 'current' ? 'flex-row-reverse' : ''
                      }`}
                    >
                      {msg.senderId !== 'current' && (
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={msg.senderAvatar} />
                          <AvatarFallback>
                            {msg.senderName.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div
                        className={`max-w-[70%] ${
                          msg.senderId === 'current' ? 'text-right' : ''
                        }`}
                      >
                        {msg.senderId !== 'current' && (
                          <p className="text-xs text-muted-foreground mb-1">
                            {msg.senderName}
                          </p>
                        )}
                        <div
                          className={`rounded-lg p-3 ${
                            msg.senderId === 'current'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          }`}
                        > 
                          <p className="text-sm">{msg.content}</p>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatTime(msg.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </ScrollArea>

            {/* Input de Mensagem */}
            <div className="p-4 border-t bg-background">
              <div className="flex items-end gap-2">
                <Button size="sm" variant="outline">
                  <Paperclip className="h-4 w-4" />
                </Button>
                <div className="flex-1">
                  <Input
                    placeholder="Digite sua mensagem..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={sendMessageMutation.isPending}
                  />
                </div>
                <Button size="sm" variant="outline">
                  <Smile className="h-4 w-4" />
                </Button>
                <Button 
                  onClick={handleSendMessage}
                  disabled={!message.trim() || sendMessageMutation.isPending}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Selecione uma conversa</h3>
              <p className="text-muted-foreground">
                Escolha uma conversa da lista para começar a conversar
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
