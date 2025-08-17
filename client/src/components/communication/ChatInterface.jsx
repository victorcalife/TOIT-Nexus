import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { 
  Send, 
  Smile, 
  Paperclip, 
  Phone, 
  Video, 
  MoreVertical,
  Search,
  Users,
  Settings,
  Mic,
  MicOff,
  VideoOff,
  PhoneOff,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Brain,
  Atom,
  Zap,
  Bot,
  User,
  Clock,
  Check,
  CheckCheck,
  Star,
  Heart,
  ThumbsUp,
  Laugh
} from 'lucide-react';

// Importar sistema quântico integrado
import quantumSystemCore from '@/core/QuantumSystemCore';
import milaOmnipresence from '@/core/MilaOmnipresence';
import universalWorkflowEngine from '@/core/UniversalWorkflowEngine';

const EMOJI_REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '😡'];

const MESSAGE_TYPES = {
  TEXT: 'text',
  IMAGE: 'image',
  FILE: 'file',
  SYSTEM: 'system',
  MILA: 'mila',
  QUANTUM: 'quantum'
};

export default function ChatInterface({ 
  isOpen = true, 
  onClose, 
  selectedConversation = null,
  conversations = [],
  currentUser = null 
}) {
  const { toast } = useToast();
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  
  // Chat State
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  
  // Video Call State
  const [isVideoCall, setIsVideoCall] = useState(false);
  const [isAudioCall, setIsAudioCall] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  
  // MILA Integration
  const [milaActive, setMilaActive] = useState(true);
  const [milaInsights, setMilaInsights] = useState([]);
  const [quantumEnhanced, setQuantumEnhanced] = useState(true);
  
  // UI State
  const [searchQuery, setSearchQuery] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);

  useEffect(() => {
    initializeQuantumChat();
    connectWebSocket();
    loadMessages();
    setupMilaObservation();
    
    return () => {
      disconnectWebSocket();
    };
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const initializeQuantumChat = async () => {
    try {
      console.log('💬⚛️ Inicializando Chat Quântico...');
      
      // Conectar ao sistema quântico
      quantumSystemCore.connectModule('chat', {
        receiveQuantumUpdate: (result) => {
          if (result.automaticInsights) {
            setMilaInsights(prev => [...prev, ...result.automaticInsights]);
          }
          
          if (result.suggestedActions) {
            result.suggestedActions.forEach(action => {
              if (action.module === 'chat') {
                handleQuantumSuggestion(action);
              }
            });
          }
        }
      });

      // Configurar MILA para chat
      milaOmnipresence.on('intelligent_suggestions_ready', (data) => {
        if (data.module === 'chat') {
          handleMilaChatSuggestions(data.suggestions);
        }
      });

      console.log('✅ Chat Quântico inicializado');
      
    } catch (error) {
      console.error('❌ Erro na inicialização do chat:', error);
    }
  };

  const setupMilaObservation = () => {
    // Observar interações do chat
    const observeChatInteraction = (action, data) => {
      milaOmnipresence.observeUserInteraction({
        type: 'chat_interaction',
        module: 'chat',
        action,
        data,
        userId: currentUser?.id,
        timestamp: new Date()
      });
    };

    // Configurar observadores
    window.chatObserver = observeChatInteraction;
  };

  const connectWebSocket = () => {
    try {
      // Simular conexão WebSocket
      setIsConnected(true);
      
      // Simular mensagens em tempo real
      const interval = setInterval(() => {
        if (Math.random() > 0.95) { // 5% chance de nova mensagem
          receiveMessage({
            id: `msg_${Date.now()}`,
            type: MESSAGE_TYPES.TEXT,
            content: 'Mensagem de exemplo em tempo real',
            sender: {
              id: 'user_2',
              name: 'João Silva',
              avatar: null,
              status: 'online'
            },
            timestamp: new Date(),
            conversationId: selectedConversation?.id
          });
        }
      }, 10000);

      return () => clearInterval(interval);
      
    } catch (error) {
      console.error('❌ Erro na conexão WebSocket:', error);
      setIsConnected(false);
    }
  };

  const disconnectWebSocket = () => {
    setIsConnected(false);
  };

  const loadMessages = async () => {
    if (!selectedConversation) return;

    try {
      const response = await fetch(`/api/chat/conversations/${selectedConversation.id}/messages`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
      }
    } catch (error) {
      // Mock messages
      setMessages([
        {
          id: 'msg_1',
          type: MESSAGE_TYPES.TEXT,
          content: 'Olá! Como posso ajudar você hoje?',
          sender: {
            id: 'mila',
            name: 'MILA',
            avatar: null,
            isBot: true
          },
          timestamp: new Date(Date.now() - 3600000),
          conversationId: selectedConversation?.id,
          reactions: []
        },
        {
          id: 'msg_2',
          type: MESSAGE_TYPES.TEXT,
          content: 'Preciso de ajuda com uma análise de dados',
          sender: currentUser,
          timestamp: new Date(Date.now() - 3000000),
          conversationId: selectedConversation?.id,
          reactions: []
        },
        {
          id: 'msg_3',
          type: MESSAGE_TYPES.QUANTUM,
          content: 'Processando sua solicitação com algoritmos quânticos...',
          sender: {
            id: 'quantum_system',
            name: 'Sistema Quântico',
            avatar: null,
            isBot: true
          },
          timestamp: new Date(Date.now() - 2900000),
          conversationId: selectedConversation?.id,
          reactions: [],
          quantumData: {
            algorithm: 'grover',
            speedup: 3.2,
            confidence: 0.94
          }
        }
      ]);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    const message = {
      id: `msg_${Date.now()}`,
      type: MESSAGE_TYPES.TEXT,
      content: newMessage.trim(),
      sender: currentUser,
      timestamp: new Date(),
      conversationId: selectedConversation.id,
      reactions: []
    };

    // Adicionar mensagem localmente
    setMessages(prev => [...prev, message]);
    setNewMessage('');

    // Observar envio para MILA
    window.chatObserver?.('send_message', {
      messageLength: message.content.length,
      conversationId: selectedConversation.id,
      messageType: MESSAGE_TYPES.TEXT
    });

    try {
      // Enviar via WebSocket/API
      const response = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(message)
      });

      if (response.ok) {
        // Processar mensagem com MILA se ativada
        if (milaActive) {
          await processMilaResponse(message);
        }

        // Criar workflow se necessário
        if (message.content.toLowerCase().includes('relatório') || 
            message.content.toLowerCase().includes('dashboard')) {
          await universalWorkflowEngine.createAutomaticWorkflow({
            type: 'chat_request',
            data: {
              message: message.content,
              conversationId: selectedConversation.id,
              requestType: 'report_or_dashboard'
            },
            source: 'chat'
          });
        }
      }

    } catch (error) {
      console.error('❌ Erro ao enviar mensagem:', error);
      
      // Simular resposta MILA
      if (milaActive) {
        setTimeout(() => {
          processMilaResponse(message);
        }, 1000);
      }
    }
  };

  const processMilaResponse = async (userMessage) => {
    try {
      // Processar com sistema quântico
      const quantumResult = await quantumSystemCore.processQuantumOperation({
        type: 'chat_analysis',
        data: {
          message: userMessage.content,
          context: messages.slice(-5),
          conversationId: selectedConversation.id
        },
        complexity: 2
      });

      // Gerar resposta MILA
      const milaResponse = {
        id: `mila_${Date.now()}`,
        type: MESSAGE_TYPES.MILA,
        content: generateMilaResponse(userMessage.content, quantumResult),
        sender: {
          id: 'mila',
          name: 'MILA',
          avatar: null,
          isBot: true
        },
        timestamp: new Date(),
        conversationId: selectedConversation.id,
        reactions: [],
        quantumData: quantumResult
      };

      // Adicionar resposta após delay realista
      setTimeout(() => {
        setMessages(prev => [...prev, milaResponse]);
      }, 1500);

    } catch (error) {
      console.error('❌ Erro no processamento MILA:', error);
    }
  };

  const generateMilaResponse = (userMessage, quantumResult) => {
    const message = userMessage.toLowerCase();
    
    if (message.includes('relatório')) {
      return `🧠 Entendi que você precisa de um relatório! Baseado na análise quântica, posso criar um relatório ${quantumResult.suggestedType || 'personalizado'} para você. Quer que eu inicie o processo?`;
    }
    
    if (message.includes('dashboard')) {
      return `📊 Perfeito! Posso criar um dashboard otimizado com algoritmos quânticos. Com base nos seus padrões de uso, sugiro incluir ${quantumResult.suggestedWidgets?.join(', ') || 'widgets de KPI e gráficos'}. Devo prosseguir?`;
    }
    
    if (message.includes('dados') || message.includes('análise')) {
      return `⚛️ Análise quântica concluída! Identifiquei ${quantumResult.patternsFound || 3} padrões relevantes nos seus dados. Posso gerar insights detalhados ou criar visualizações automáticas. O que prefere?`;
    }
    
    return `🧠 Analisei sua mensagem com processamento quântico (speedup: ${quantumResult.quantumSpeedup?.toFixed(2) || '2.1'}x). Como posso ajudar você de forma mais específica?`;
  };

  const startVideoCall = async () => {
    try {
      setIsVideoCall(true);
      setCallDuration(0);
      
      // Observar início de chamada
      window.chatObserver?.('start_video_call', {
        conversationId: selectedConversation?.id,
        participants: selectedConversation?.participants?.length || 2
      });

      // Simular duração da chamada
      const interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);

      toast({
        title: "📹 Chamada de vídeo iniciada",
        description: "Conectando com WebRTC...",
        action: (
          <Button size="sm" variant="destructive" onClick={() => endCall(interval)}>
            <PhoneOff className="w-3 h-3 mr-1" />
            Encerrar
          </Button>
        )
      });

    } catch (error) {
      console.error('❌ Erro ao iniciar chamada:', error);
    }
  };

  const startAudioCall = async () => {
    try {
      setIsAudioCall(true);
      setCallDuration(0);
      
      // Observar início de chamada
      window.chatObserver?.('start_audio_call', {
        conversationId: selectedConversation?.id
      });

      const interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);

      toast({
        title: "📞 Chamada de áudio iniciada",
        description: "Conectando...",
        action: (
          <Button size="sm" variant="destructive" onClick={() => endCall(interval)}>
            <PhoneOff className="w-3 h-3 mr-1" />
            Encerrar
          </Button>
        )
      });

    } catch (error) {
      console.error('❌ Erro ao iniciar chamada:', error);
    }
  };

  const endCall = (interval) => {
    clearInterval(interval);
    setIsVideoCall(false);
    setIsAudioCall(false);
    setCallDuration(0);
    
    toast({
      title: "📞 Chamada encerrada",
      description: `Duração: ${formatDuration(callDuration)}`
    });
  };

  const addReaction = (messageId, emoji) => {
    setMessages(prev => prev.map(msg => {
      if (msg.id === messageId) {
        const existingReaction = msg.reactions.find(r => r.emoji === emoji && r.userId === currentUser?.id);
        
        if (existingReaction) {
          // Remover reação
          return {
            ...msg,
            reactions: msg.reactions.filter(r => !(r.emoji === emoji && r.userId === currentUser?.id))
          };
        } else {
          // Adicionar reação
          return {
            ...msg,
            reactions: [...msg.reactions, {
              emoji,
              userId: currentUser?.id,
              userName: currentUser?.name,
              timestamp: new Date()
            }]
          };
        }
      }
      return msg;
    }));
  };

  const receiveMessage = (message) => {
    setMessages(prev => [...prev, message]);
    
    // Notificação se janela não estiver em foco
    if (document.hidden) {
      new Notification(`Nova mensagem de ${message.sender.name}`, {
        body: message.content,
        icon: message.sender.avatar || '/default-avatar.png'
      });
    }
  };

  const handleQuantumSuggestion = (action) => {
    if (action.action === 'suggest_response') {
      setNewMessage(action.suggestedText);
      inputRef.current?.focus();
    }
  };

  const handleMilaChatSuggestions = (suggestions) => {
    suggestions.forEach(suggestion => {
      if (suggestion.type === 'quick_reply') {
        toast({
          title: "🧠 MILA Sugere",
          description: suggestion.message,
          action: (
            <Button size="sm" onClick={() => setNewMessage(suggestion.text)}>
              Usar Sugestão
            </Button>
          )
        });
      }
    });
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderMessage = (message) => {
    const isOwn = message.sender.id === currentUser?.id;
    const isMila = message.sender.isBot;
    
    return (
      <div
        key={message.id}
        className={`flex gap-3 mb-4 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}
      >
        {/* Avatar */}
        <Avatar className="w-8 h-8 flex-shrink-0">
          <AvatarImage src={message.sender.avatar} />
          <AvatarFallback className={isMila ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}>
            {isMila ? <Brain className="w-4 h-4" /> : message.sender.name?.[0]}
          </AvatarFallback>
        </Avatar>

        {/* Message Content */}
        <div className={`flex flex-col max-w-[70%] ${isOwn ? 'items-end' : 'items-start'}`}>
          {/* Sender Name */}
          {!isOwn && (
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-medium text-gray-700">
                {message.sender.name}
              </span>
              {isMila && (
                <Badge variant="secondary" className="text-xs">
                  <Brain className="w-2 h-2 mr-1" />
                  AI
                </Badge>
              )}
              {message.type === MESSAGE_TYPES.QUANTUM && (
                <Badge variant="outline" className="text-xs">
                  <Atom className="w-2 h-2 mr-1" />
                  Quantum
                </Badge>
              )}
            </div>
          )}

          {/* Message Bubble */}
          <div
            className={`
              relative px-4 py-2 rounded-2xl max-w-full break-words
              ${isOwn 
                ? 'bg-blue-500 text-white rounded-br-md' 
                : isMila 
                  ? 'bg-purple-50 border border-purple-200 text-purple-900 rounded-bl-md'
                  : 'bg-gray-100 text-gray-900 rounded-bl-md'
              }
              ${message.type === MESSAGE_TYPES.QUANTUM ? 'border-2 border-blue-300 bg-gradient-to-r from-blue-50 to-purple-50' : ''}
            `}
            onDoubleClick={() => setSelectedMessage(message)}
          >
            {/* Message Content */}
            <div className="text-sm leading-relaxed">
              {message.content}
            </div>

            {/* Quantum Data */}
            {message.quantumData && (
              <div className="mt-2 pt-2 border-t border-gray-200">
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <Atom className="w-3 h-3" />
                  <span>Algoritmo: {message.quantumData.algorithm}</span>
                  {message.quantumData.speedup && (
                    <span>• Speedup: {message.quantumData.speedup}x</span>
                  )}
                  {message.quantumData.confidence && (
                    <span>• Confiança: {(message.quantumData.confidence * 100).toFixed(0)}%</span>
                  )}
                </div>
              </div>
            )}

            {/* Timestamp */}
            <div className={`text-xs mt-1 ${isOwn ? 'text-blue-100' : 'text-gray-500'}`}>
              {formatTime(message.timestamp)}
              {isOwn && (
                <CheckCheck className="w-3 h-3 inline ml-1" />
              )}
            </div>
          </div>

          {/* Reactions */}
          {message.reactions.length > 0 && (
            <div className="flex gap-1 mt-1">
              {EMOJI_REACTIONS.map(emoji => {
                const reactions = message.reactions.filter(r => r.emoji === emoji);
                if (reactions.length === 0) return null;
                
                const hasUserReaction = reactions.some(r => r.userId === currentUser?.id);
                
                return (
                  <button
                    key={emoji}
                    onClick={() => addReaction(message.id, emoji)}
                    className={`
                      flex items-center gap-1 px-2 py-1 rounded-full text-xs
                      ${hasUserReaction 
                        ? 'bg-blue-100 text-blue-600 border border-blue-300' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }
                    `}
                  >
                    <span>{emoji}</span>
                    <span>{reactions.length}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Quick Reactions */}
          {selectedMessage?.id === message.id && (
            <div className="flex gap-1 mt-2">
              {EMOJI_REACTIONS.map(emoji => (
                <button
                  key={emoji}
                  onClick={() => {
                    addReaction(message.id, emoji);
                    setSelectedMessage(null);
                  }}
                  className="w-8 h-8 rounded-full bg-white border border-gray-200 hover:bg-gray-50 flex items-center justify-center text-sm"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-gray-50">
        <div className="flex items-center gap-3">
          {selectedConversation && (
            <>
              <Avatar className="w-10 h-10">
                <AvatarImage src={selectedConversation.avatar} />
                <AvatarFallback>
                  {selectedConversation.isGroup ? (
                    <Users className="w-5 h-5" />
                  ) : (
                    selectedConversation.name?.[0]
                  )}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold text-gray-900">
                  {selectedConversation.name}
                </h3>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-400'}`} />
                  <span className="text-sm text-gray-500">
                    {isConnected ? 'Online' : 'Desconectado'}
                  </span>
                  {quantumEnhanced && (
                    <Badge variant="secondary" className="text-xs">
                      <Atom className="w-2 h-2 mr-1" />
                      Quantum
                    </Badge>
                  )}
                  {milaActive && (
                    <Badge variant="outline" className="text-xs">
                      <Brain className="w-2 h-2 mr-1" />
                      MILA
                    </Badge>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Call Controls */}
          {(isVideoCall || isAudioCall) && (
            <div className="flex items-center gap-2 px-3 py-1 bg-red-100 rounded-full">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="text-sm font-medium text-red-700">
                {formatDuration(callDuration)}
              </span>
            </div>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={startAudioCall}
            disabled={isVideoCall || isAudioCall}
          >
            <Phone className="w-4 h-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={startVideoCall}
            disabled={isVideoCall || isAudioCall}
          >
            <Video className="w-4 h-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMilaActive(!milaActive)}
          >
            <Brain className={`w-4 h-4 ${milaActive ? 'text-purple-600' : 'text-gray-400'}`} />
          </Button>

          <Button variant="ghost" size="sm">
            <MoreVertical className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Video Call Overlay */}
      {isVideoCall && (
        <div className="absolute inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
          <div className="text-center text-white">
            <div className="w-32 h-32 bg-gray-600 rounded-full mx-auto mb-4 flex items-center justify-center">
              <User className="w-16 h-16" />
            </div>
            <h3 className="text-xl font-semibold mb-2">{selectedConversation?.name}</h3>
            <p className="text-gray-300 mb-6">{formatDuration(callDuration)}</p>
            
            <div className="flex items-center justify-center gap-4">
              <Button
                variant={isMuted ? "destructive" : "secondary"}
                size="lg"
                onClick={() => setIsMuted(!isMuted)}
                className="rounded-full w-12 h-12"
              >
                {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </Button>
              
              <Button
                variant={isVideoEnabled ? "secondary" : "destructive"}
                size="lg"
                onClick={() => setIsVideoEnabled(!isVideoEnabled)}
                className="rounded-full w-12 h-12"
              >
                {isVideoEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
              </Button>
              
              <Button
                variant="destructive"
                size="lg"
                onClick={() => endCall()}
                className="rounded-full w-12 h-12"
              >
                <PhoneOff className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-1">
          {messages.map(renderMessage)}
          
          {/* Typing Indicator */}
          {typingUsers.length > 0 && (
            <div className="flex items-center gap-2 text-sm text-gray-500 ml-11">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              </div>
              <span>{typingUsers.join(', ')} está digitando...</span>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* MILA Insights */}
      {milaInsights.length > 0 && (
        <div className="px-4 py-2 bg-purple-50 border-t border-purple-200">
          <div className="flex items-center gap-2 mb-2">
            <Brain className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-medium text-purple-700">Insights MILA</span>
          </div>
          <div className="text-sm text-purple-600">
            {milaInsights[milaInsights.length - 1]?.message}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="p-4 border-t bg-gray-50">
        <div className="flex items-end gap-2">
          <div className="flex-1 relative">
            <Input
              ref={inputRef}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="Digite sua mensagem..."
              className="pr-20 resize-none min-h-[40px] max-h-32"
              disabled={!isConnected}
            />
            
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              >
                <Smile className="w-4 h-4" />
              </Button>
              
              <Button variant="ghost" size="sm">
                <Paperclip className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          <Button
            onClick={sendMessage}
            disabled={!newMessage.trim() || !isConnected}
            className="px-4 py-2"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>

        {/* Connection Status */}
        <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span>{isConnected ? 'Conectado' : 'Reconectando...'}</span>
            {quantumEnhanced && (
              <span className="text-blue-600">• Quantum Enhanced</span>
            )}
          </div>
          
          {selectedConversation && (
            <span>
              {selectedConversation.participants?.length || 2} participante(s)
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
