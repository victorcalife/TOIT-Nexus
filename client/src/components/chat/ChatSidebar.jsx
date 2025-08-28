/**
 * CHAT SIDEBAR - Componente de chat integrado na sidebar
 */

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  MessageCircle,
  Plus,
  Search,
  MoreHorizontal,
  Circle,
  Users,
  Phone,
  Video
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function ChatSidebar({ 
  isOpen, 
  onToggle, 
  onSelectConversation,
  currentUserId 
}) {
  const [conversations, setConversations] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);

  // Dados mock para demonstração
  useEffect(() => {
    setConversations([
      {
        id: 'conv_1',
        type: 'direct',
        name: 'João Silva',
        lastMessage: 'Oi! Como está o projeto?',
        lastMessageTime: new Date(Date.now() - 300000), // 5 min atrás
        unreadCount: 2,
        isOnline: true,
        avatar: null
      },
      {
        id: 'conv_2',
        type: 'direct',
        name: 'Maria Santos',
        lastMessage: 'Vou revisar os documentos hoje',
        lastMessageTime: new Date(Date.now() - 1800000), // 30 min atrás
        unreadCount: 0,
        isOnline: false,
        avatar: null
      },
      {
        id: 'conv_3',
        type: 'group',
        name: 'Equipe Desenvolvimento',
        lastMessage: 'Ana: Reunião às 15h',
        lastMessageTime: new Date(Date.now() - 3600000), // 1h atrás
        unreadCount: 5,
        isOnline: true,
        avatar: null
      }
    ]);

    setOnlineUsers([
      { id: 'user_1', name: 'João Silva', status: 'online' },
      { id: 'user_2', name: 'Ana Costa', status: 'away' },
      { id: 'user_3', name: 'Pedro Lima', status: 'busy' }
    ]);
  }, []);

  // Formatar tempo da última mensagem
  const formatLastMessageTime = (time) => {
    const now = new Date();
    const diff = now - time;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'agora';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    return `${days}d`;
  };

  // Obter iniciais do nome
  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  // Selecionar conversa
  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation.id);
    if (onSelectConversation) {
      onSelectConversation(conversation);
    }
  };

  // Renderizar status do usuário
  const renderUserStatus = (status) => {
    const statusColors = {
      online: 'bg-green-500',
      away: 'bg-yellow-500',
      busy: 'bg-red-500',
      offline: 'bg-gray-400'
    };

    return (
      <Circle 
        className={cn(
          'w-3 h-3 fill-current',
          statusColors[status] || statusColors.offline
        )} 
      />
    );
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={onToggle}
          className="rounded-full w-14 h-14 shadow-lg"
          size="lg"
        >
          <MessageCircle className="w-6 h-6" />
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-80 h-96 bg-white border border-gray-200 rounded-lg shadow-xl z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center space-x-2">
          <MessageCircle className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold">Chat</h3>
          {onlineUsers.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {onlineUsers.length} online
            </Badge>
          )}
        </div>
        
        <div className="flex items-center space-x-1">
          <Button size="sm" variant="ghost" className="w-8 h-8 p-0">
            <Plus className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="ghost" className="w-8 h-8 p-0">
            <Search className="w-4 h-4" />
          </Button>
          <Button 
            size="sm" 
            variant="ghost" 
            className="w-8 h-8 p-0"
            onClick={onToggle}
          >
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Lista de Conversas */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {conversations.map((conversation) => (
            <div
              key={conversation.id}
              className={cn(
                'flex items-center space-x-3 p-3 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors',
                selectedConversation === conversation.id && 'bg-blue-50 border border-blue-200'
              )}
              onClick={() => handleSelectConversation(conversation)}
            >
              <div className="relative">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={conversation.avatar} />
                  <AvatarFallback className="text-sm bg-gray-100">
                    {getInitials(conversation.name)}
                  </AvatarFallback>
                </Avatar>
                
                {conversation.type === 'direct' && (
                  <div className="absolute -bottom-1 -right-1">
                    {renderUserStatus(conversation.isOnline ? 'online' : 'offline')}
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-gray-900 truncate">
                    {conversation.name}
                  </h4>
                  <span className="text-xs text-gray-500">
                    {formatLastMessageTime(conversation.lastMessageTime)}
                  </span>
                </div>
                
                <div className="flex items-center justify-between mt-1">
                  <p className="text-xs text-gray-600 truncate">
                    {conversation.lastMessage}
                  </p>
                  
                  {conversation.unreadCount > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="text-xs min-w-[20px] h-5 flex items-center justify-center"
                    >
                      {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Footer com ações rápidas */}
      <div className="border-t p-3">
        <div className="flex items-center justify-center space-x-4">
          <Button size="sm" variant="ghost" className="flex-1">
            <Phone className="w-4 h-4 mr-2" />
            Áudio
          </Button>
          <Button size="sm" variant="ghost" className="flex-1">
            <Video className="w-4 h-4 mr-2" />
            Vídeo
          </Button>
        </div>
      </div>
    </div>
  );
}
