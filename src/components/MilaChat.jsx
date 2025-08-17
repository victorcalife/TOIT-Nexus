/**
 * MILA CHAT COMPONENT
 * 
 * Componente React para chat inteligente com MILA
 * Integrado ao sistema TOIT NEXUS com todas as funcionalidades
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageCircle, 
  Send, 
  Minimize2, 
  Maximize2, 
  Zap, 
  Brain, 
  Settings,
  Sparkles,
  Cpu,
  Database
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTenant } from '../contexts/TenantContext';
import { toast } from 'react-hot-toast';

const MilaChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [milaStatus, setMilaStatus] = useState(null);
  const [suggestedActions, setSuggestedActions] = useState([]);
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const { user } = useAuth();
  const { currentTenant } = useTenant();

  // Inicializar MILA ao montar componente
  useEffect(() => {
    initializeMila();
  }, []);

  // Auto-scroll para última mensagem
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus no input quando abrir chat
  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, isMinimized]);

  const initializeMila = async () => {
    try {
      const response = await fetch('/api/mila/status', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setMilaStatus(data.data);
        
        // Mensagem de boas-vindas
        setMessages([{
          id: 'welcome',
          type: 'mila',
          content: `🤖 **Olá ${user?.name || 'usuário'}! Sou a MILA!**

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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    try {
      const response = await fetch('/api/mila/chat', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: inputMessage,
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

        setMessages(prev => [...prev, milaMessage]);
        setSuggestedActions(data.data.suggestedActions || []);
      } else {
        throw new Error(data.error || 'Erro na comunicação');
      }
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      const errorMessage = {
        id: Date.now() + 1,
        type: 'mila',
        content: '🤖 Desculpe, tive um problema técnico. Pode tentar novamente?',
        timestamp: new Date(),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const executeAction = async (action) => {
    try {
      const response = await fetch('/api/mila/execute-action', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action })
      });

      const data = await response.json();

      if (data.success) {
        if (data.data.redirect) {
          toast.success(data.data.message);
          window.location.href = data.data.redirect;
        } else if (data.data.modal) {
          toast.success(data.data.message);
          // Implementar abertura de modal específico
        }
      }
    } catch (error) {
      console.error('Erro ao executar ação:', error);
      toast.error('Erro ao executar ação');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatMessage = (content) => {
    // Converter markdown básico para JSX
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code>$1</code>')
      .split('\n').map((line, i) => (
        <div key={i} dangerouslySetInnerHTML={{ __html: line }} />
      ));
  };

  return (
    <>
      {/* Chat Toggle Button */}
      <motion.button
        className={`fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg z-50 flex items-center justify-center transition-all duration-300 ${
          isOpen 
            ? 'bg-red-500 hover:bg-red-600' 
            : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700'
        }`}
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        animate={{ 
          rotate: isOpen ? 45 : 0,
          y: isOpen ? 0 : [0, -5, 0]
        }}
        transition={{ 
          rotate: { duration: 0.3 },
          y: { duration: 2, repeat: Infinity, ease: "easeInOut" }
        }}
      >
        {isOpen ? (
          <Minimize2 className="w-6 h-6 text-white" />
        ) : (
          <div className="relative">
            <MessageCircle className="w-6 h-6 text-white" />
            <motion.div
              className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
        )}
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className={`fixed bottom-24 right-6 w-96 bg-white rounded-2xl shadow-2xl z-40 overflow-hidden border border-gray-200 ${
              isMinimized ? 'h-16' : 'h-[600px]'
            }`}
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                      <Brain className="w-5 h-5" />
                    </div>
                    <motion.div
                      className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white"
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">MILA</h3>
                    <p className="text-xs text-white/80">
                      {milaStatus?.mila.status === 'online' ? '🟢 Online' : '🔴 Offline'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setIsMinimized(!isMinimized)}
                    className="p-1 hover:bg-white/20 rounded"
                  >
                    {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* Messages */}
                <div className="flex-1 p-4 space-y-4 overflow-y-auto h-[440px] bg-gray-50">
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className={`max-w-[80%] p-3 rounded-2xl ${
                        message.type === 'user'
                          ? 'bg-blue-500 text-white rounded-br-md'
                          : message.isError
                          ? 'bg-red-100 text-red-800 rounded-bl-md'
                          : 'bg-white text-gray-800 rounded-bl-md shadow-sm border'
                      }`}>
                        <div className="text-sm leading-relaxed">
                          {formatMessage(message.content)}
                        </div>
                        {message.suggestedActions && message.suggestedActions.length > 0 && (
                          <div className="mt-3 space-y-2">
                            {message.suggestedActions.map((action, index) => (
                              <button
                                key={index}
                                onClick={() => executeAction(action.action)}
                                className="block w-full text-left px-3 py-2 text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors"
                              >
                                {action.text}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                  
                  {isTyping && (
                    <motion.div
                      className="flex justify-start"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <div className="bg-white p-3 rounded-2xl rounded-bl-md shadow-sm border">
                        <div className="flex space-x-1">
                          <motion.div
                            className="w-2 h-2 bg-gray-400 rounded-full"
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                          />
                          <motion.div
                            className="w-2 h-2 bg-gray-400 rounded-full"
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                          />
                          <motion.div
                            className="w-2 h-2 bg-gray-400 rounded-full"
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-4 border-t bg-white">
                  <div className="flex space-x-2">
                    <input
                      ref={inputRef}
                      type="text"
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Digite sua pergunta para MILA..."
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={isTyping}
                    />
                    <motion.button
                      onClick={sendMessage}
                      disabled={!inputMessage.trim() || isTyping}
                      className="w-10 h-10 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white rounded-full flex items-center justify-center transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Send className="w-4 h-4" />
                    </motion.button>
                  </div>
                  
                  {/* Quick Actions */}
                  {suggestedActions.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {suggestedActions.slice(0, 3).map((action, index) => (
                        <button
                          key={index}
                          onClick={() => executeAction(action.action)}
                          className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors"
                        >
                          {action.text}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default MilaChat;
