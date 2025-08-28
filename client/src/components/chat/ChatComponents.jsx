/**
 * CHAT COMPONENTS
 * Componentes auxiliares para o sistema de chat
 */

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Search,
  ChevronDown,
  ChevronUp,
  Phone,
  Video,
  MoreVertical,
  MoreHorizontal,
  Settings,
  UserPlus,
  Users,
  Bell,
  BellOff,
  Pin,
  Archive,
  Trash2,
  Edit,
  Copy,
  Reply,
  Forward,
  Smile,
  Paperclip,
  Send,
  Minimize2,
  Maximize2,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Clock,
  Check,
  CheckCheck,
  MessageCircle,
  Download
} from 'lucide-react';
import { format, isToday, isYesterday } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Componente Sidebar do Chat
export const ChatSidebar = ({ 
  conversations, 
  selectedConversation, 
  onSelectConversation, 
  searchTerm, 
  onSearchChange, 
  onlineUsers, 
  userStatuses,
  collapsed,
  onToggleCollapse
}) => (
  <div className={`${collapsed ? 'w-16' : 'w-80'} bg-white/80 backdrop-blur-sm border-r border-slate-200 transition-all duration-300`}>
    {/* Header */}
    <div className="p-4 border-b border-slate-200">
      <div className="flex items-center justify-between mb-4">
        <h2 className={`font-semibold text-slate-800 ${collapsed ? 'hidden' : 'block'}`}>
          Conversas
        </h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleCollapse}
        >
          {collapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
        </Button>
      </div>
      
      {!collapsed && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Buscar conversas..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
      )}
    </div>

    {/* Lista de Conversas */}
    <div className="overflow-y-auto" style={{ height: 'calc(100vh - 120px)' }}>
      {conversations.map(conversation => (
        <ConversationItem
          key={conversation.id}
          conversation={conversation}
          isSelected={selectedConversation?.id === conversation.id}
          onSelect={() => onSelectConversation(conversation)}
          isOnline={onlineUsers.has(conversation.participants?.[0])}
          userStatuses={userStatuses}
          collapsed={collapsed}
        />
      ))}
    </div>
  </div>
);

// Item de Conversa
const ConversationItem = ({ 
  conversation, 
  isSelected, 
  onSelect, 
  isOnline, 
  userStatuses,
  collapsed
}) => {
  const formatTime = (date) => {
    if (isToday(date)) {
      return format(date, 'HH:mm');
    } else if (isYesterday(date)) {
      return 'Ontem';
    } else {
      return format(date, 'dd/MM');
    }
  };

  const getStatusColor = () => {
    if (conversation.type === 'group' || conversation.type === 'channel') {
      return 'bg-gray-400';
    }
    return isOnline ? 'bg-green-500' : 'bg-gray-400';
  };

  return (
    <div
      onClick={onSelect}
      className={`
        p-4 cursor-pointer transition-all duration-200 border-b border-slate-100
        ${isSelected 
          ? 'bg-gradient-to-r from-blue-100 to-blue-50 border-l-4 border-l-blue-500' 
          : 'hover:bg-slate-50'}
      `}
    >
      <div className="flex items-center space-x-3">
        {/* Avatar com status */}
        <div className="relative">
          <Avatar className="h-12 w-12">
            <AvatarImage src={conversation.avatar} alt={conversation.name} />
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
              {conversation.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          {conversation.type === 'direct' && (
            <div className={`absolute -bottom-1 -right-1 w-4 h-4 ${getStatusColor()} rounded-full border-2 border-white`}></div>
          )}
        </div>

        {!collapsed && (
          <div className="flex-1 min-w-0">
            {/* Nome e horário */}
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-medium text-slate-800 truncate">
                {conversation.name}
              </h3>
              <span className="text-xs text-slate-500">
                {formatTime(conversation.lastMessageTime)}
              </span>
            </div>

            {/* Última mensagem e contador */}
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-600 truncate flex-1">
                {conversation.lastMessage}
              </p>
              {conversation.unreadCount > 0 && (
                <Badge className="ml-2 bg-blue-500 text-white text-xs">
                  {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
                </Badge>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Header do Chat
export const ChatHeader = ({ 
  conversation, 
  onStartCall, 
  isCallActive, 
  onlineUsers, 
  userStatuses 
}) => {
  const isOnline = onlineUsers.has(conversation.participants?.[0]);
  
  return (
    <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {/* Avatar */}
          <div className="relative">
            <Avatar className="h-10 w-10">
              <AvatarImage src={conversation.avatar} alt={conversation.name} />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                {conversation.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {conversation.type === 'direct' && (
              <div className={`absolute -bottom-1 -right-1 w-3 h-3 ${isOnline ? 'bg-green-500' : 'bg-gray-400'} rounded-full border-2 border-white`}></div>
            )}
          </div>

          {/* Info */}
          <div>
            <h2 className="font-semibold text-slate-800">{conversation.name}</h2>
            <p className="text-sm text-slate-500">
              {conversation.type === 'direct' 
                ? (isOnline ? 'Online' : 'Offline')
                : `${conversation.participants?.length || 0} participantes`
              }
            </p>
          </div>
        </div>

        {/* Ações */}
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onStartCall('audio')}
            disabled={isCallActive}
            className="text-slate-600 hover:text-green-600"
          >
            <Phone className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onStartCall('video')}
            disabled={isCallActive}
            className="text-slate-600 hover:text-blue-600"
          >
            <Video className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-slate-600 hover:text-purple-600"
          >
            <Users className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-slate-600 hover:text-slate-800"
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

// Área de Mensagens
export const ChatMessages = ({ 
  messages, 
  currentUserId, 
  onAddReaction, 
  quickEmojis, 
  messageTypes,
  messagesEndRef
}) => (
  <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ height: 'calc(100vh - 200px)' }}>
    {messages.map((message, index) => {
      const isOwn = message.senderId === currentUserId;
      const showAvatar = !isOwn && (index === 0 || messages[index - 1].senderId !== message.senderId);
      const showTime = index === 0 || 
        (new Date(message.timestamp) - new Date(messages[index - 1].timestamp)) > 300000; // 5 minutos

      return (
        <MessageItem
          key={message.id}
          message={message}
          isOwn={isOwn}
          showAvatar={showAvatar}
          showTime={showTime}
          onAddReaction={onAddReaction}
          quickEmojis={quickEmojis}
          messageTypes={messageTypes}
        />
      );
    })}
    <div ref={messagesEndRef} />
  </div>
);

// Item de Mensagem
const MessageItem = ({ 
  message, 
  isOwn, 
  showAvatar, 
  showTime, 
  onAddReaction, 
  quickEmojis, 
  messageTypes 
}) => {
  const [showReactions, setShowReactions] = useState(false);
  const [showActions, setShowActions] = useState(false);

  const formatTime = (date) => {
    return format(new Date(date), 'HH:mm');
  };

  const getStatusIcon = () => {
    switch (message.status) {
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

  const MessageTypeIcon = messageTypes[message.type]?.icon || MessageCircle;

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} group`}>
      <div className={`flex max-w-xs lg:max-w-md ${isOwn ? 'flex-row-reverse' : 'flex-row'} items-end space-x-2`}>
        {/* Avatar */}
        {!isOwn && (
          <div className="w-8 h-8">
            {showAvatar && (
              <Avatar className="h-8 w-8">
                <AvatarImage src={message.senderAvatar} alt={message.senderName} />
                <AvatarFallback className="bg-gradient-to-br from-slate-400 to-slate-600 text-white text-xs">
                  {message.senderName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            )}
          </div>
        )}

        {/* Mensagem */}
        <div
          className="relative"
          onMouseEnter={() => setShowActions(true)}
          onMouseLeave={() => setShowActions(false)}
        >
          {/* Nome do remetente */}
          {!isOwn && showAvatar && (
            <p className="text-xs text-slate-600 mb-1 ml-3">{message.senderName}</p>
          )}

          {/* Conteúdo da mensagem */}
          <div
            className={`
              px-4 py-2 rounded-2xl relative
              ${isOwn 
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white' 
                : 'bg-white border border-slate-200 text-slate-800'}
              ${message.type === 'image' ? 'p-1' : ''}
            `}
          >
            {/* Conteúdo baseado no tipo */}
            {message.type === 'text' && (
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
            )}
            
            {message.type === 'image' && (
              <div className="relative">
                <img 
                  src={message.fileUrl} 
                  alt={message.fileName}
                  className="max-w-full h-auto rounded-xl"
                  style={{ maxHeight: '300px' }}
                />
                <div className="absolute top-2 right-2">
                  <Button size="sm" variant="ghost" className="h-6 w-6 p-0 bg-black/20 hover:bg-black/40">
                    <Download className="h-3 w-3 text-white" />
                  </Button>
                </div>
              </div>
            )}

            {message.type === 'file' && (
              <div className="flex items-center space-x-3 p-2">
                <div className="p-2 bg-slate-100 rounded-lg">
                  <MessageTypeIcon className="h-5 w-5 text-slate-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{message.fileName}</p>
                  <p className="text-xs text-slate-500">{message.fileSize}</p>
                </div>
                <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                  <Download className="h-3 w-3" />
                </Button>
              </div>
            )}

            {/* Status e horário */}
            <div className={`flex items-center justify-end space-x-1 mt-1 ${isOwn ? 'text-blue-100' : 'text-slate-400'}`}>
              <span className="text-xs">{formatTime(message.timestamp)}</span>
              {isOwn && getStatusIcon()}
            </div>
          </div>

          {/* Reações */}
          {message.reactions && message.reactions.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1 ml-3">
              {message.reactions.map((reaction, index) => (
                <button
                  key={index}
                  onClick={() => onAddReaction(message.id, reaction.emoji)}
                  className={`
                    flex items-center space-x-1 px-2 py-1 rounded-full text-xs
                    ${reaction.users.includes('current_user')
                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
                      : 'bg-slate-100 text-slate-600 border border-slate-200'}
                    hover:bg-blue-50 transition-colors duration-200
                  `}
                >
                  <span>{reaction.emoji}</span>
                  <span>{reaction.count}</span>
                </button>
              ))}
            </div>
          )}

          {/* Ações da mensagem */}
          {showActions && (
            <div className={`absolute top-0 ${isOwn ? 'left-0 -translate-x-full' : 'right-0 translate-x-full'} flex items-center space-x-1 bg-white border border-slate-200 rounded-lg shadow-lg p-1`}>
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0"
                onClick={() => setShowReactions(!showReactions)}
              >
                <Smile className="h-3 w-3" />
              </Button>
              <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                <Reply className="h-3 w-3" />
              </Button>
              <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                <Forward className="h-3 w-3" />
              </Button>
              <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                <Copy className="h-3 w-3" />
              </Button>
              {isOwn && (
                <>
                  <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-red-500">
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </>
              )}
            </div>
          )}

          {/* Picker de reações */}
          {showReactions && (
            <div className={`absolute top-0 ${isOwn ? 'left-0 -translate-x-full -translate-y-full' : 'right-0 translate-x-full -translate-y-full'} bg-white border border-slate-200 rounded-lg shadow-lg p-2 flex space-x-1`}>
              {quickEmojis.map(emoji => (
                <button
                  key={emoji}
                  onClick={() => {
                    onAddReaction(message.id, emoji);
                    setShowReactions(false);
                  }}
                  className="hover:bg-slate-100 p-1 rounded text-lg"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
