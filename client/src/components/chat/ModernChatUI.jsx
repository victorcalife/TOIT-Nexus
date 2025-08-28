/**
 * MODERN CHAT UI
 * Interface moderna de chat com vídeo/áudio
 * Compartilhamento de arquivos e salas virtuais
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {  





















  Trash2,












  Minimize2,
  Maximize2,
  Volume2,












 }
} from 'lucide-react';
import { format, isToday, isYesterday } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const ModernChatUI = ({ tenantId, userId, userRole }) => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [isCallActive, setIsCallActive] = useState(false);
  const [callType, setCallType] = useState(null); // 'audio' | 'video'
  const [callParticipants, setCallParticipants] = useState([]);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [draggedFiles, setDraggedFiles] = useState([]);
  
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const localVideoRef = useRef(null);

  // Estados da interface
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [chatSettings, setChatSettings] = useState({
    notifications: true,
    sounds: true,
    readReceipts: true,
    typing: true,
    theme: 'light'
  });

  // Emojis para reações rápidas
  const quickEmojis = ['👍', '❤️', '😂', '😮', '😢', '😡', '🎉', '🔥'];

  // Status de usuário
  const userStatuses = {
    online: { label: 'Online', color: 'bg-green-500', textColor: 'text-green-600' },
    away: { label: 'Ausente', color: 'bg-yellow-500', textColor: 'text-yellow-600' },
    busy: { label: 'Ocupado', color: 'bg-red-500', textColor: 'text-red-600' },
    offline: { label: 'Offline', color: 'bg-gray-400', textColor: 'text-gray-600' }
  };

  // Tipos de mensagem
  const messageTypes = {
    text: { icon: MessageCircle, color: 'text-blue-600' },
    image: { icon: Image, color: 'text-green-600' },
    file: { icon: FileText, color: 'text-purple-600' },
    audio: { icon: Mic, color: 'text-orange-600' },
    video: { icon: Video, color: 'text-red-600' },
    location: { icon: MapPin, color: 'text-pink-600' },
    link: { icon: Link, color: 'text-indigo-600' },
    system: { icon: Info, color: 'text-gray-600' }
  };

  // Carregar conversas
  useEffect(() => {
    loadConversations();
    loadOnlineUsers();
  }, [tenantId, userId]);

  // Scroll automático para última mensagem
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadConversations = async () => {
    try {
      const mockConversations = generateMockConversations();
      setConversations(mockConversations);
      if (mockConversations.length > 0) {
        setSelectedConversation(mockConversations[0]);
        loadMessages(mockConversations[0].id);
      }
    } catch (error) {
      console.error('Erro ao carregar conversas:', error);
    }
  };

  const loadOnlineUsers = async () => {
    try {
      const mockOnlineUsers = new Set(['user1', 'user2', 'user3']);
      setOnlineUsers(mockOnlineUsers);
    } catch (error) {
      console.error('Erro ao carregar usuários online:', error);
    }
  };

  const loadMessages = async (conversationId) => {
    try {
      const mockMessages = generateMockMessages(conversationId);
      setMessages(mockMessages);
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error);
    }
  };

  // Gerar conversas mock
  const generateMockConversations = () => {
    return [
      {
        id: '1',
        type: 'direct',
        name: 'João Silva',
        avatar: '/avatars/joao.jpg',
        lastMessage: 'Oi! Como está o projeto?',
        lastMessageTime: new Date(),
        unreadCount: 2,
        isOnline: true,
        status: 'online',
        participants: ['user1', 'current_user']
      },
      {
        id: '2',
        type: 'group',
        name: 'Equipe de Desenvolvimento',
        avatar: '/avatars/team.jpg',
        lastMessage: 'Maria: Vamos fazer a reunião às 15h',
        lastMessageTime: new Date(Date.now() - 3600000),
        unreadCount: 5,
        isOnline: false,
        status: 'group',
        participants: ['user1', 'user2', 'user3', 'current_user']
      },
      {
        id: '3',
        type: 'direct',
        name: 'Ana Costa',
        avatar: '/avatars/ana.jpg',
        lastMessage: 'Obrigada pela ajuda!',
        lastMessageTime: new Date(Date.now() - 7200000),
        unreadCount: 0,
        isOnline: true,
        status: 'away',
        participants: ['user2', 'current_user']
      },
      {
        id: '4',
        type: 'channel',
        name: '#geral',
        avatar: '/avatars/channel.jpg',
        lastMessage: 'Pedro: Bom dia pessoal!',
        lastMessageTime: new Date(Date.now() - 10800000),
        unreadCount: 12,
        isOnline: false,
        status: 'channel',
        participants: ['user1', 'user2', 'user3', 'user4', 'current_user']
      }
    ];
  };

  // Gerar mensagens mock
  const generateMockMessages = (conversationId) => {
    const baseMessages = [
      {
        id: '1',
        conversationId,
        senderId: 'user1',
        senderName: 'João Silva',
        senderAvatar: '/avatars/joao.jpg',
        content: 'Oi! Como está o andamento do projeto?',
        type: 'text',
        timestamp: new Date(Date.now() - 3600000),
        status: 'read',
        reactions: [
          { emoji: '👍', users: ['current_user'], count: 1 }
        ],
        isEdited: false,
        replyTo: null
      },
      {
        id: '2',
        conversationId,
        senderId: 'current_user',
        senderName: 'Você',
        senderAvatar: '/avatars/you.jpg',
        content: 'Está indo bem! Já terminei a parte do frontend.',
        type: 'text',
        timestamp: new Date(Date.now() - 3500000),
        status: 'read',
        reactions: [],
        isEdited: false,
        replyTo: null
      },
      {
        id: '3',
        conversationId,
        senderId: 'user1',
        senderName: 'João Silva',
        senderAvatar: '/avatars/joao.jpg',
        content: 'Ótimo! Você pode me enviar as telas para eu dar uma olhada?',
        type: 'text',
        timestamp: new Date(Date.now() - 3000000),
        status: 'read',
        reactions: [],
        isEdited: false,
        replyTo: null
      },
      {
        id: '4',
        conversationId,
        senderId: 'current_user',
        senderName: 'Você',
        senderAvatar: '/avatars/you.jpg',
        content: 'Claro! Vou enviar agora.',
        type: 'text',
        timestamp: new Date(Date.now() - 2800000),
        status: 'read',
        reactions: [],
        isEdited: false,
        replyTo: null
      },
      {
        id: '5',
        conversationId,
        senderId: 'current_user',
        senderName: 'Você',
        senderAvatar: '/avatars/you.jpg',
        content: 'dashboard-mockup.png',
        type: 'image',
        timestamp: new Date(Date.now() - 2700000),
        status: 'read',
        reactions: [
          { emoji: '🔥', users: ['user1'], count: 1 },
          { emoji: '👍', users: ['user1'], count: 1 }
        ],
        isEdited: false,
        replyTo: null,
        fileUrl: '/uploads/dashboard-mockup.png',
        fileName: 'dashboard-mockup.png',
        fileSize: '2.4 MB'
      },
      {
        id: '6',
        conversationId,
        senderId: 'user1',
        senderName: 'João Silva',
        senderAvatar: '/avatars/joao.jpg',
        content: 'Ficou incrível! Parabéns pelo trabalho.',
        type: 'text',
        timestamp: new Date(Date.now() - 1800000),
        status: 'read',
        reactions: [
          { emoji: '❤️', users: ['current_user'], count: 1 }
        ],
        isEdited: false,
        replyTo: '5'
      },
      {
        id: '7',
        conversationId,
        senderId: 'user1',
        senderName: 'João Silva',
        senderAvatar: '/avatars/joao.jpg',
        content: 'Que tal fazermos uma call para discutir os próximos passos?',
        type: 'text',
        timestamp: new Date(Date.now() - 300000),
        status: 'delivered',
        reactions: [],
        isEdited: false,
        replyTo: null
      },
      {
        id: '8',
        conversationId,
        senderId: 'current_user',
        senderName: 'Você',
        senderAvatar: '/avatars/you.jpg',
        content: 'Perfeito! Estou disponível agora.',
        type: 'text',
        timestamp: new Date(Date.now() - 60000),
        status: 'sent',
        reactions: [],
        isEdited: false,
        replyTo: null
      }
    ];

    return baseMessages;
  };

  // Enviar mensagem
  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    const message = {
      id: Date.now().toString(),
      conversationId: selectedConversation.id,
      senderId: 'current_user',
      senderName: 'Você',
      senderAvatar: '/avatars/you.jpg',
      content: newMessage,
      type: 'text',
      timestamp: new Date(),
      status: 'sending',
      reactions: [],
      isEdited: false,
      replyTo: null
    };

    setMessages([...messages, message]);
    setNewMessage('');

    // Simular envio
    setTimeout(() => {
      setMessages(prev => prev.map(msg => 
        msg.id === message.id 
          ? { ...msg, status: 'sent' }
          : msg
      ));
    }, 1000);

    setTimeout(() => {
      setMessages(prev => prev.map(msg => 
        msg.id === message.id 
          ? { ...msg, status: 'delivered' }
          : msg
      ));
    }, 2000);
  };

  // Iniciar chamada
  const startCall = async (type) => {
    if (!selectedConversation) return;

    setCallType(type);
    setIsCallActive(true);
    setCallParticipants([
      {
        id: 'current_user',
        name: 'Você',
        avatar: '/avatars/you.jpg',
        isMuted: false,
        isVideoOff: false
      },
      ...selectedConversation.participants
        .filter(p => p !== 'current_user')
        .map(p => ({
          id: p,
          name: `Usuário ${p}`,`
          avatar: `/avatars/${p}.jpg`,
          isMuted: false,
          isVideoOff: type === 'audio'
        }))
    ]);

    // Simular conexão
    setTimeout(() => {`
      console.log(`Chamada ${type} iniciada com ${selectedConversation.name}`);
    }, 1000);
  };

  // Encerrar chamada
  const endCall = () => {
    setIsCallActive(false);
    setCallType(null);
    setCallParticipants([]);
    setIsMuted(false);
    setIsVideoOff(false);
    setIsScreenSharing(false);
  };

  // Toggle mute
  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  // Toggle vídeo
  const toggleVideo = () => {
    setIsVideoOff(!isVideoOff);
  };

  // Toggle compartilhamento de tela
  const toggleScreenShare = () => {
    setIsScreenSharing(!isScreenSharing);
  };

  // Adicionar reação
  const addReaction = (messageId, emoji) => {
    setMessages(messages.map(msg => {
      if (msg.id === messageId) {
        const existingReaction = msg.reactions.find(r => r.emoji === emoji);
        if (existingReaction) {
          if (existingReaction.users.includes('current_user')) {
            // Remover reação
            return {
              ...msg,
              reactions: msg.reactions.map(r => 
                r.emoji === emoji
                  ? {
                      ...r,
                      users: r.users.filter(u => u !== 'current_user'),
                      count: r.count - 1
                    }
                  : r
              ).filter(r => r.count > 0)
            };
          } else {
            // Adicionar usuário à reação existente
            return {
              ...msg,
              reactions: msg.reactions.map(r => 
                r.emoji === emoji
                  ? {
                      ...r,
                      users: [...r.users, 'current_user'],
                      count: r.count + 1
                    }
                  : r
              )
            };
          }
        } else {
          // Nova reação
          return {
            ...msg,
            reactions: [
              ...msg.reactions,
              {
                emoji,
                users: ['current_user'],
                count: 1
              }
            ]
          };
        }
      }
      return msg;
    }));
  };

  // Upload de arquivo
  const handleFileUpload = async (files) => {
    for (const file of files) {
      const message = {
        id: Date.now().toString() + Math.random(),
        conversationId: selectedConversation.id,
        senderId: 'current_user',
        senderName: 'Você',
        senderAvatar: '/avatars/you.jpg',
        content: file.name,
        type: file.type.startsWith('image/') ? 'image' : 'file',
        timestamp: new Date(),
        status: 'sending',
        reactions: [],
        isEdited: false,
        replyTo: null,
        fileUrl: URL.createObjectURL(file),
        fileName: file.name,
        fileSize: formatFileSize(file.size)
      };

      setMessages(prev => [...prev, message]);

      // Simular upload
      setTimeout(() => {
        setMessages(prev => prev.map(msg => 
          msg.id === message.id 
            ? { ...msg, status: 'sent' }
            : msg
        ));
      }, 2000);
    }
  };

  // Formatar tamanho do arquivo
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Scroll para o final
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Filtrar conversas
  const filteredConversations = conversations.filter(conv =>
    conv.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Sidebar de Conversas */}
      <ChatSidebar
        conversations={filteredConversations}
        selectedConversation={selectedConversation}
        onSelectConversation=({ (conv }) => {
          setSelectedConversation(conv);
          loadMessages(conv.id);
        }}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onlineUsers={onlineUsers}
        userStatuses={userStatuses}
        collapsed={sidebarCollapsed}
        onToggleCollapse=({ ( }) => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Área Principal do Chat */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Header do Chat */}
            <ChatHeader
              conversation={selectedConversation}
              onStartCall={startCall}
              isCallActive={isCallActive}
              onlineUsers={onlineUsers}
              userStatuses={userStatuses}
            />

            {/* Área de Mensagens */}
            <ChatMessages
              messages={messages}
              currentUserId="current_user"
              onAddReaction={addReaction}
              quickEmojis={quickEmojis}
              messageTypes={messageTypes}
              messagesEndRef={messagesEndRef}
            />

            {/* Input de Mensagem */}
            <ChatInput
              newMessage={newMessage}
              onMessageChange={setNewMessage}
              onSendMessage={sendMessage}
              onFileUpload={handleFileUpload}
              showEmojiPicker={showEmojiPicker}
              onToggleEmojiPicker=({ ( }) => setShowEmojiPicker(!showEmojiPicker)}
              fileInputRef={fileInputRef}
              isTyping={isTyping}
            />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-slate-500">
              <MessageCircle className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-semibold mb-2">Selecione uma conversa</h3>
              <p>Escolha uma conversa para começar a conversar</p>
            </div>
          </div>
        )}
      </div>

      {/* Modal de Chamada */}
      {isCallActive && (
        <CallModal
          callType={callType}
          participants={callParticipants}
          isMuted={isMuted}
          isVideoOff={isVideoOff}
          isScreenSharing={isScreenSharing}
          onToggleMute={toggleMute}
          onToggleVideo={toggleVideo}
          onToggleScreenShare={toggleScreenShare}
          onEndCall={endCall}
          videoRef={videoRef}
          localVideoRef={localVideoRef}
        />
      )}
    </div>
  );
};

export default ModernChatUI;
`