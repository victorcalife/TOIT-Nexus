import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
  MessageCircle, 
  X, 
  Minimize2, 
  Maximize2,
  Send, 
  Users,
  Bot,
  Phone,
  Video,
  Paperclip,
  Smile
} from 'lucide-react';
import io from 'socket.io-client';

export default function FloatingChatWidget() {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [activeTab, setActiveTab] = useState('mila');
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  
  // MILA Chat State
  const [milaMessages, setMilaMessages] = useState([]);
  const [milaInput, setMilaInput] = useState('');
  const [milaTyping, setMilaTyping] = useState(false);
  
  // User Chat State
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [userMessages, setUserMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  
  // Notifications
  const [unreadCount, setUnreadCount] = useState(0);
  const [milaUnread, setMilaUnread] = useState(0);
  const [userUnread, setUserUnread] = useState(0);
  
  const messagesEndRef = useRef(null);

  // Inicializar WebSocket e MILA
  useEffect(() => {
    initializeChat();
    initializeMila();
  }, []);

  // Auto-scroll
  useEffect(() => {
    scrollToBottom();
  }, [milaMessages, userMessages]);

  const initializeChat = () => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    const tenantId = localStorage.getItem('tenantId');

    if (!token || !userId) return;

    // Conectar WebSocket
    const newSocket = io( process.env.REACT_APP_WS_URL || 'https://api.toit.com.br', {
      transports: ['websocket', 'polling']
    });

    newSocket.on('connect', () => {
      setIsConnected(true);
      newSocket.emit('authenticate', { token, userId, tenantId });
    });

    newSocket.on('authenticated', (data) => {
      setOnlineUsers(new Set(data.onlineUsers.map(u => u.userId)));
      loadConversations();
    });

    newSocket.on('new_message', (message) => {
      setUserMessages(prev => [...prev, message]);
      
      // Notificação se chat não estiver aberto ou em aba diferente
      if (!isOpen || activeTab !== 'users') {
        setUserUnread(prev => prev + 1);
        showMessageNotification(message);
      }
    });

    setSocket(newSocket);
  };

  const initializeMila = async () => {
    try {
      const response = await fetch('/api/mila/status', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        
        // Mensagem de boas-vindas da MILA
        setMilaMessages([{
          id: 'welcome',
          type: 'mila',
          content: `Olá! Sou a **MILA** 🧠

Sua assistente inteligente do TOIT NEXUS. Estou aqui para ajudar com:

🎨 **No-Code**: Workflows e dashboards visuais
📊 **TQL**: Consultas em português  
🧠 **ML**: Insights e predições
🔗 **Integrações**: Conectar sistemas
${data.data.user.canAccessQuantum ? '⚛️ **Quantum**: Algoritmos avançados' : ''}

**Como posso ajudar você hoje?**`,
          timestamp: new Date(),
          suggestedActions: [
            { text: '🎨 Criar Workflow', action: 'open_workflow_builder' },
            { text: '📊 Consulta TQL', action: 'open_tql_builder' },
            { text: '🧠 Insight ML', action: 'generate_ml_insight' }
          ]
        }]);
      }
    } catch (error) {
      console.error('Erro ao inicializar MILA:', error);
    }
  };

  const loadConversations = async () => {
    try {
      const response = await fetch('/api/chat/conversations', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setConversations(data.conversations || []);
      }
    } catch (error) {
      // Mock data para desenvolvimento
      setConversations([
        {
          id: 'conv_1',
          name: 'Equipe Desenvolvimento',
          type: 'group',
          lastMessage: 'Vamos revisar o código hoje?',
          timestamp: new Date(),
          unread: 2,
          participants: [{ id: 'user_1', name: 'João' }]
        }
      ]);
    }
  };

  const sendMilaMessage = async () => {
    if (!milaInput.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: milaInput,
      timestamp: new Date()
    };

    setMilaMessages(prev => [...prev, userMessage]);
    setMilaInput('');
    setMilaTyping(true);

    try {
      const response = await fetch('/api/mila/chat', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: milaInput,
          context: {
            currentPage: window.location.pathname,
            timestamp: new Date().toISOString()
          }
        })
      });

      const data = await response.json();

      if (data.success) {
        const milaMessage = {
          id: Date.now() + 1,
          type: 'mila',
          content: data.data.message,
          timestamp: new Date(),
          intent: data.data.intent,
          suggestedActions: data.data.suggestedActions
        };

        setMilaMessages(prev => [...prev, milaMessage]);
        
        // Notificação se não estiver na aba da MILA
        if (activeTab !== 'mila') {
          setMilaUnread(prev => prev + 1);
        }
      }
    } catch (error) {
      console.error('Erro ao enviar mensagem para MILA:', error);
    } finally {
      setMilaTyping(false);
    }
  };

  const sendUserMessage = () => {
    if (!userInput.trim() || !selectedConversation || !socket) return;

    socket.emit('send_message', {
      roomId: selectedConversation.id,
      content: userInput,
      type: 'text'
    });

    setUserInput('');
  };

  const showMessageNotification = (message) => {
    toast({
      title: "💬 Nova mensagem",
      description: `${message.senderName}: ${message.content}`,
      action: (
        <Button size="sm" onClick={() => {
          setIsOpen(true);
          setActiveTab('users');
        }}>
          Ver
        </Button>
      )
    });
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    
    // Limpar contadores de não lidas
    if (tab === 'mila') {
      setMilaUnread(0);
    } else if (tab === 'users') {
      setUserUnread(0);
    }
  };

  // Calcular total de não lidas
  useEffect(() => {
    setUnreadCount(milaUnread + userUnread);
  }, [milaUnread, userUnread]);

  const handleKeyPress = (e, type) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (type === 'mila') {
        sendMilaMessage();
      } else {
        sendUserMessage();
      }
    }
  };

  return (
    <>
      {/* Botão Flutuante */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-50">
          <Button
            onClick={() => setIsOpen(true)}
            className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 relative"
            size="lg"
          >
            <MessageCircle className="h-6 w-6" />
            {unreadCount > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-2 -right-2 h-6 w-6 p-0 flex items-center justify-center text-xs"
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </Badge>
            )}
          </Button>
        </div>
      )}

      {/* Widget de Chat */}
      {isOpen && (
        <div className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ${
          isMinimized ? 'w-80 h-16' : 'w-96 h-[600px]'
        }`}>
          <Card className="h-full shadow-2xl border-2">
            {/* Header */}
            <CardHeader className="p-3 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                    <span className="font-semibold text-sm">Chat</span>
                  </div>
                  {unreadCount > 0 && (
                    <Badge variant="secondary" className="h-5 text-xs">
                      {unreadCount}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setIsMinimized(!isMinimized)}
                    className="h-6 w-6 p-0"
                  >
                    {isMinimized ? <Maximize2 className="h-3 w-3" /> : <Minimize2 className="h-3 w-3" />}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setIsOpen(false)}
                    className="h-6 w-6 p-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            {/* Conteúdo */}
            {!isMinimized && (
              <CardContent className="p-0 h-[calc(100%-60px)]">
                <Tabs value={activeTab} onValueChange={handleTabChange} className="h-full">
                  <TabsList className="grid w-full grid-cols-2 m-2">
                    <TabsTrigger value="mila" className="relative">
                      <Bot className="h-4 w-4 mr-1" />
                      MILA
                      {milaUnread > 0 && (
                        <Badge variant="destructive" className="ml-1 h-4 w-4 p-0 text-xs">
                          {milaUnread}
                        </Badge>
                      )}
                    </TabsTrigger>
                    <TabsTrigger value="users" className="relative">
                      <Users className="h-4 w-4 mr-1" />
                      Equipe
                      {userUnread > 0 && (
                        <Badge variant="destructive" className="ml-1 h-4 w-4 p-0 text-xs">
                          {userUnread}
                        </Badge>
                      )}
                    </TabsTrigger>
                  </TabsList>

                  {/* MILA Chat */}
                  <TabsContent value="mila" className="h-[calc(100%-60px)] flex flex-col m-0">
                    <ScrollArea className="flex-1 p-3">
                      <div className="space-y-3">
                        {milaMessages.map((message) => (
                          <div
                            key={message.id}
                            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                          >
                            <div className={`flex gap-2 max-w-[85%] ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                              <Avatar className="h-6 w-6">
                                <AvatarFallback className="text-xs">
                                  {message.type === 'mila' ? '🧠' : 'U'}
                                </AvatarFallback>
                              </Avatar>
                              
                              <div className={`rounded-lg p-2 text-sm ${
                                message.type === 'user' 
                                  ? 'bg-primary text-primary-foreground' 
                                  : 'bg-muted'
                              }`}>
                                <div className="whitespace-pre-wrap">{message.content}</div>
                                {message.suggestedActions && (
                                  <div className="flex flex-wrap gap-1 mt-2">
                                    {message.suggestedActions.map((action, index) => (
                                      <Button
                                        key={index}
                                        size="sm"
                                        variant="outline"
                                        className="h-6 text-xs"
                                        onClick={() => {
                                          // Implementar ações sugeridas
                                          console.log('Ação:', action);
                                        }}
                                      >
                                        {action.text}
                                      </Button>
                                    ))}
                                  </div>
                                )}
                                <div className="text-xs opacity-70 mt-1">
                                  {new Date(message.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                        {milaTyping && (
                          <div className="flex justify-start">
                            <div className="flex gap-2">
                              <Avatar className="h-6 w-6">
                                <AvatarFallback className="text-xs">🧠</AvatarFallback>
                              </Avatar>
                              <div className="bg-muted rounded-lg p-2 text-sm">
                                <div className="flex gap-1">
                                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                        <div ref={messagesEndRef} />
                      </div>
                    </ScrollArea>

                    {/* Input MILA */}
                    <div className="p-3 border-t">
                      <div className="flex gap-2">
                        <Input
                          placeholder="Pergunte à MILA..."
                          value={milaInput}
                          onChange={(e) => setMilaInput(e.target.value)}
                          onKeyPress={(e) => handleKeyPress(e, 'mila')}
                          className="text-sm"
                        />
                        <Button 
                          size="sm" 
                          onClick={sendMilaMessage}
                          disabled={!milaInput.trim() || milaTyping}
                        >
                          <Send className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </TabsContent>

                  {/* User Chat */}
                  <TabsContent value="users" className="h-[calc(100%-60px)] flex flex-col m-0">
                    {selectedConversation ? (
                      <>
                        {/* Header da conversa */}
                        <div className="p-3 border-b">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Avatar className="h-6 w-6">
                                <AvatarFallback className="text-xs">
                                  {selectedConversation.type === 'group' ? <Users className="h-3 w-3" /> : selectedConversation.name.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium text-sm">{selectedConversation.name}</div>
                                <div className="text-xs text-muted-foreground">
                                  {selectedConversation.type === 'group' 
                                    ? `${selectedConversation.participants?.length || 0} participantes`
                                    : 'Online'
                                  }
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-1">
                              <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                                <Phone className="h-3 w-3" />
                              </Button>
                              <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                                <Video className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>

                        {/* Mensagens */}
                        <ScrollArea className="flex-1 p-3">
                          <div className="space-y-3">
                            {userMessages.map((message) => {
                              const isOwn = message.senderId === localStorage.getItem('userId');
                              return (
                                <div
                                  key={message.id}
                                  className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                                >
                                  <div className={`flex gap-2 max-w-[85%] ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
                                    {!isOwn && (
                                      <Avatar className="h-6 w-6">
                                        <AvatarFallback className="text-xs">
                                          {message.senderName?.charAt(0) || 'U'}
                                        </AvatarFallback>
                                      </Avatar>
                                    )}
                                    
                                    <div className={`rounded-lg p-2 text-sm ${
                                      isOwn 
                                        ? 'bg-primary text-primary-foreground' 
                                        : 'bg-muted'
                                    }`}>
                                      {!isOwn && (
                                        <div className="text-xs font-medium mb-1 opacity-70">
                                          {message.senderName}
                                        </div>
                                      )}
                                      <div>{message.content}</div>
                                      <div className="text-xs opacity-70 mt-1">
                                        {new Date(message.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                            <div ref={messagesEndRef} />
                          </div>
                        </ScrollArea>

                        {/* Input usuário */}
                        <div className="p-3 border-t">
                          <div className="flex gap-2">
                            <Input
                              placeholder="Digite sua mensagem..."
                              value={userInput}
                              onChange={(e) => setUserInput(e.target.value)}
                              onKeyPress={(e) => handleKeyPress(e, 'user')}
                              className="text-sm"
                              disabled={!isConnected}
                            />
                            <Button 
                              size="sm" 
                              onClick={sendUserMessage}
                              disabled={!userInput.trim() || !isConnected}
                            >
                              <Send className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="flex-1 flex flex-col">
                        {/* Lista de conversas */}
                        <ScrollArea className="flex-1 p-3">
                          <div className="space-y-2">
                            {conversations.map((conversation) => (
                              <div
                                key={conversation.id}
                                className="p-2 rounded-lg cursor-pointer hover:bg-muted transition-colors"
                                onClick={() => setSelectedConversation(conversation)}
                              >
                                <div className="flex items-center gap-2">
                                  <Avatar className="h-8 w-8">
                                    <AvatarFallback className="text-xs">
                                      {conversation.type === 'group' ? <Users className="h-4 w-4" /> : conversation.name.charAt(0)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                      <div className="font-medium text-sm truncate">{conversation.name}</div>
                                      {conversation.unread > 0 && (
                                        <Badge variant="destructive" className="h-4 w-4 p-0 text-xs">
                                          {conversation.unread}
                                        </Badge>
                                      )}
                                    </div>
                                    <div className="text-xs text-muted-foreground truncate">
                                      {conversation.lastMessage || 'Nenhuma mensagem'}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            )}
          </Card>
        </div>
      )}
    </>
  );
}
