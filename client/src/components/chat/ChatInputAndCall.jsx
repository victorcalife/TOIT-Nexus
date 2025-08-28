/**
 * CHAT INPUT AND CALL COMPONENTS
 * Componentes de input de mensagem e chamadas
 */

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Paperclip,
  Image,
  Smile,
  Mic,
  MicOff,
  Send,
  Phone,
  PhoneOff,
  Video,
  VideoOff,
  Volume2,
  VolumeX,
  Minimize2,
  Maximize2,
  Monitor,
  Users,
  MessageSquare,
  Settings,
  MoreVertical,
  Camera,
  ScreenShare,
  ScreenShareOff,
  Grid3X3,
  UserPlus,
  Record,
  X,
  Maximize
} from 'lucide-react';

// Input de Mensagem
export const ChatInput = ({ 
  newMessage, 
  onMessageChange, 
  onSendMessage, 
  onFileUpload, 
  showEmojiPicker, 
  onToggleEmojiPicker, 
  fileInputRef,
  isTyping
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSendMessage();
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      onFileUpload(files);
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      onFileUpload(files);
    }
  };

  const startRecording = () => {
    setIsRecording(true);
    setRecordingTime(0);
    // Implementar gravação de áudio
  };

  const stopRecording = () => {
    setIsRecording(false);
    setRecordingTime(0);
    // Implementar parada da gravação
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm border-t border-slate-200 p-4">
      {/* Indicador de digitação */}
      {isTyping && (
        <div className="mb-2 text-sm text-slate-500">
          <span className="animate-pulse">Alguém está digitando...</span>
        </div>
      )}

      {/* Área de drag and drop */}
      <div
        className={`
          relative transition-all duration-200
          ${isDragOver ? 'bg-blue-50 border-2 border-dashed border-blue-300 rounded-lg p-4' : ''}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {isDragOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-blue-50/90 rounded-lg z-10">
            <div className="text-center">
              <Paperclip className="h-8 w-8 mx-auto mb-2 text-blue-500" />
              <p className="text-blue-700 font-medium">Solte os arquivos aqui</p>
            </div>
          </div>
        )}

        <div className="flex items-end space-x-3">
          {/* Botões de ação */}
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="text-slate-600 hover:text-blue-600"
            >
              <Paperclip className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="text-slate-600 hover:text-green-600"
            >
              <Image className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleEmojiPicker}
              className="text-slate-600 hover:text-yellow-600"
            >
              <Smile className="h-4 w-4" />
            </Button>
          </div>

          {/* Input de texto */}
          <div className="flex-1">
            <Textarea
              value={newMessage}
              onChange={(e) => onMessageChange(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Digite sua mensagem..."
              className="min-h-[40px] max-h-32 resize-none border-slate-300 focus:border-blue-500"
              rows={1}
            />
          </div>

          {/* Botão de gravação de áudio */}
          <Button
            variant="ghost"
            size="sm"
            onMouseDown={startRecording}
            onMouseUp={stopRecording}
            onMouseLeave={stopRecording}
            className={`text-slate-600 hover:text-red-600 ${isRecording ? 'bg-red-100 text-red-600' : ''}`}
          >
            <Mic className="h-4 w-4" />
          </Button>

          {/* Botão de envio */}
          <Button
            onClick={onSendMessage}
            disabled={!newMessage.trim()}
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>

        {/* Indicador de gravação */}
        {isRecording && (
          <div className="mt-2 flex items-center space-x-2 text-red-600">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-sm">Gravando áudio... {recordingTime}s</span>
          </div>
        )}
      </div>

      {/* Input de arquivo oculto */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Picker de emoji */}
      {showEmojiPicker && (
        <EmojiPicker onSelectEmoji={(emoji) => onMessageChange(newMessage + emoji)} />
      )}
    </div>
  );
};

// Picker de Emoji
const EmojiPicker = ({ onSelectEmoji }) => {
  const emojiCategories = {
    smileys: ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰'],
    gestures: ['👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👋', '🤚'],
    hearts: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖'],
    objects: ['🎉', '🎊', '🎈', '🎁', '🏆', '🥇', '🥈', '🥉', '⭐', '🌟', '💫', '✨', '🔥', '💯', '⚡', '💎']
  };

  return (
    <div className="absolute bottom-full left-0 mb-2 bg-white border border-slate-200 rounded-lg shadow-lg p-4 w-80 z-50">
      <div className="space-y-3">
        {Object.entries(emojiCategories).map(([category, emojis]) => (
          <div key={category}>
            <h4 className="text-sm font-medium text-slate-600 mb-2 capitalize">{category}</h4>
            <div className="grid grid-cols-8 gap-1">
              {emojis.map(emoji => (
                <button
                  key={emoji}
                  onClick={() => onSelectEmoji(emoji)}
                  className="p-2 hover:bg-slate-100 rounded text-lg"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Modal de Chamada
export const CallModal = ({ 
  callType, 
  participants, 
  isMuted, 
  isVideoOff, 
  isScreenSharing, 
  onToggleMute, 
  onToggleVideo, 
  onToggleScreenShare, 
  onEndCall,
  videoRef,
  localVideoRef
}) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState(null);
  const [showParticipants, setShowParticipants] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  // Simular duração da chamada
  React.useEffect(() => {
    const interval = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <div className="bg-white rounded-lg shadow-xl border border-slate-200 p-3 w-64">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">Chamada ativa</span>
              <span className="text-xs text-slate-500">{formatDuration(callDuration)}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(false)}
                className="h-6 w-6 p-0"
              >
                <Maximize2 className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onEndCall}
                className="h-6 w-6 p-0 text-red-500 hover:text-red-600"
              >
                <PhoneOff className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Dialog open={true} onOpenChange={() => {}}>
      <DialogContent className={`${isFullscreen ? 'max-w-full h-full' : 'max-w-4xl'} p-0`}>
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white h-full flex flex-col">
          {/* Header da chamada */}
          <div className="flex items-center justify-between p-4 border-b border-slate-700">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="font-medium">
                {callType === 'video' ? 'Chamada de Vídeo' : 'Chamada de Áudio'}
              </span>
              <span className="text-slate-300">{formatDuration(callDuration)}</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowParticipants(!showParticipants)}
                className="text-white hover:bg-slate-700"
              >
                <Users className="h-4 w-4 mr-1" />
                {participants.length}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(true)}
                className="text-white hover:bg-slate-700"
              >
                <Minimize2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="text-white hover:bg-slate-700"
              >
                <Maximize className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onEndCall}
                className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Área principal da chamada */}
          <div className="flex-1 flex">
            {/* Vídeos dos participantes */}
            <div className="flex-1 relative">
              {callType === 'video' ? (
                <div className="grid grid-cols-2 gap-2 h-full p-4">
                  {participants.map(participant => (
                    <ParticipantVideo
                      key={participant.id}
                      participant={participant}
                      isSelected={selectedParticipant?.id === participant.id}
                      onSelect={() => setSelectedParticipant(participant)}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="grid grid-cols-2 gap-8">
                    {participants.map(participant => (
                      <ParticipantAudio
                        key={participant.id}
                        participant={participant}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Vídeo local (picture-in-picture) */}
              {callType === 'video' && (
                <div className="absolute bottom-4 right-4 w-48 h-36 bg-slate-800 rounded-lg overflow-hidden border-2 border-slate-600">
                  <video
                    ref={localVideoRef}
                    autoPlay
                    muted
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-2 left-2 text-xs bg-black/50 px-2 py-1 rounded">
                    Você
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar de participantes */}
            {showParticipants && (
              <div className="w-80 bg-slate-800 border-l border-slate-700 p-4">
                <h3 className="font-medium mb-4">Participantes ({participants.length})</h3>
                <div className="space-y-3">
                  {participants.map(participant => (
                    <div key={participant.id} className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={participant.avatar} alt={participant.name} />
                        <AvatarFallback className="bg-slate-600 text-white text-xs">
                          {participant.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{participant.name}</p>
                        <div className="flex items-center space-x-2 text-xs text-slate-400">
                          {participant.isMuted && <MicOff className="h-3 w-3" />}
                          {participant.isVideoOff && <VideoOff className="h-3 w-3" />}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Controles da chamada */}
          <div className="p-6 border-t border-slate-700">
            <div className="flex items-center justify-center space-x-4">
              <Button
                variant="ghost"
                size="lg"
                onClick={onToggleMute}
                className={`rounded-full w-12 h-12 ${isMuted ? 'bg-red-600 hover:bg-red-700' : 'bg-slate-700 hover:bg-slate-600'}`}
              >
                {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
              </Button>

              {callType === 'video' && (
                <Button
                  variant="ghost"
                  size="lg"
                  onClick={onToggleVideo}
                  className={`rounded-full w-12 h-12 ${isVideoOff ? 'bg-red-600 hover:bg-red-700' : 'bg-slate-700 hover:bg-slate-600'}`}
                >
                  {isVideoOff ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
                </Button>
              )}

              <Button
                variant="ghost"
                size="lg"
                onClick={onToggleScreenShare}
                className={`rounded-full w-12 h-12 ${isScreenSharing ? 'bg-blue-600 hover:bg-blue-700' : 'bg-slate-700 hover:bg-slate-600'}`}
              >
                {isScreenSharing ? <ScreenShareOff className="h-5 w-5" /> : <ScreenShare className="h-5 w-5" />}
              </Button>

              <Button
                variant="ghost"
                size="lg"
                className="rounded-full w-12 h-12 bg-slate-700 hover:bg-slate-600"
              >
                <MessageSquare className="h-5 w-5" />
              </Button>

              <Button
                variant="ghost"
                size="lg"
                className="rounded-full w-12 h-12 bg-slate-700 hover:bg-slate-600"
              >
                <Settings className="h-5 w-5" />
              </Button>

              <Button
                variant="ghost"
                size="lg"
                onClick={onEndCall}
                className="rounded-full w-12 h-12 bg-red-600 hover:bg-red-700"
              >
                <PhoneOff className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Componente de Vídeo do Participante
const ParticipantVideo = ({ participant, isSelected, onSelect }) => (
  <div
    onClick={onSelect}
    className={`relative bg-slate-800 rounded-lg overflow-hidden cursor-pointer transition-all duration-200 ${
      isSelected ? 'ring-2 ring-blue-500' : 'hover:ring-2 hover:ring-slate-500'
    }`}
  >
    {participant.isVideoOff ? (
      <div className="flex items-center justify-center h-full">
        <Avatar className="h-20 w-20">
          <AvatarImage src={participant.avatar} alt={participant.name} />
          <AvatarFallback className="bg-slate-600 text-white text-2xl">
            {participant.name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </div>
    ) : (
      <video
        autoPlay
        className="w-full h-full object-cover"
        src={`/videos/${participant.id}.mp4`}
      />
    )}
    
    <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded text-sm">
      {participant.name}
    </div>
    
    <div className="absolute bottom-2 right-2 flex space-x-1">
      {participant.isMuted && (
        <div className="bg-red-600 p-1 rounded">
          <MicOff className="h-3 w-3" />
        </div>
      )}
      {participant.isVideoOff && (
        <div className="bg-red-600 p-1 rounded">
          <VideoOff className="h-3 w-3" />
        </div>
      )}
    </div>
  </div>
);

// Componente de Áudio do Participante
const ParticipantAudio = ({ participant }) => (
  <div className="text-center">
    <Avatar className="h-24 w-24 mx-auto mb-3">
      <AvatarImage src={participant.avatar} alt={participant.name} />
      <AvatarFallback className="bg-slate-600 text-white text-3xl">
        {participant.name.charAt(0).toUpperCase()}
      </AvatarFallback>
    </Avatar>
    <h3 className="font-medium mb-2">{participant.name}</h3>
    <div className="flex items-center justify-center space-x-2">
      {participant.isMuted ? (
        <MicOff className="h-4 w-4 text-red-400" />
      ) : (
        <div className="flex space-x-1">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="w-1 bg-green-500 rounded-full animate-pulse"
              style={{
                height: `${Math.random() * 20 + 10}px`,
                animationDelay: `${i * 0.1}s`
              }}
            />
          ))}
        </div>
      )}
    </div>
  </div>
);