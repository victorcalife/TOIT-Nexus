/**
 * MESSAGE INPUT COMPONENT
 * Input de mensagem com funcionalidades avançadas
 */

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Send, 
  Paperclip, 
  Smile, 
  Image, 
  Mic, 
  MicOff,
  Plus,
  Calendar,
  MapPin,
  AtSign
} from 'lucide-react';

const MessageInput = ({ 
  newMessage, 
  setNewMessage, 
  onSendMessage, 
  onFileUpload, 
  fileInputRef, 
  isTyping 
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const inputRef = useRef(null);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSendMessage();
    }
  };

  const handleVoiceRecord = () => {
    setIsRecording(!isRecording);
    // Implementar gravação de áudio
  };

  const insertEmoji = (emoji) => {
    setNewMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
    inputRef.current?.focus();
  };

  const quickEmojis = ['😀', '😂', '❤️', '👍', '👎', '😢', '😮', '😡'];

  return (
    <div className="bg-white border-t border-slate-200 p-4">
      {/* Indicador de digitação */}
      {isTyping && (
        <div className="mb-2 text-sm text-slate-500">
          Alguém está digitando...
        </div>
      )}

      {/* Ações rápidas */}
      {showQuickActions && (
        <div className="mb-3 flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Calendar className="h-4 w-4 mr-1" />
            Agendar
          </Button>
          <Button variant="outline" size="sm">
            <MapPin className="h-4 w-4 mr-1" />
            Localização
          </Button>
          <Button variant="outline" size="sm">
            <AtSign className="h-4 w-4 mr-1" />
            Mencionar
          </Button>
        </div>
      )}

      {/* Picker de emoji */}
      {showEmojiPicker && (
        <div className="mb-3 p-3 bg-slate-50 rounded-lg">
          <div className="grid grid-cols-8 gap-2">
            {quickEmojis.map(emoji => (
              <button
                key={emoji}
                onClick={() => insertEmoji(emoji)}
                className="text-xl hover:bg-slate-200 rounded p-1 transition-colors duration-200"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input principal */}
      <div className="flex items-end space-x-2">
        {/* Botão de ações */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowQuickActions(!showQuickActions)}
          className={showQuickActions ? 'bg-blue-50' : ''}
        >
          <Plus className="h-4 w-4" />
        </Button>

        {/* Área de input */}
        <div className="flex-1 relative">
          <Input
            ref={inputRef}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Digite sua mensagem..."
            className="pr-20"
            multiline
          />
          
          {/* Botões dentro do input */}
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
            >
              <Paperclip className="h-4 w-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            >
              <Smile className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Botão de áudio/enviar */}
        {newMessage.trim() ? (
          <Button onClick={onSendMessage}>
            <Send className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            variant={isRecording ? "destructive" : "outline"}
            onClick={handleVoiceRecord}
          >
            {isRecording ? (
              <MicOff className="h-4 w-4" />
            ) : (
              <Mic className="h-4 w-4" />
            )}
          </Button>
        )}
      </div>

      {/* Input de arquivo oculto */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={onFileUpload}
        multiple
        className="hidden"
        accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
      />
    </div>
  );
};

export default MessageInput;
