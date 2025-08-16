/**
 * CALL INTERFACE COMPONENT
 * Interface de chamada de vídeo/áudio
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  PhoneOff, 
  ScreenShare, 
  ScreenShareOff,
  Users, 
  Settings, 
  Minimize2, 
  Maximize2,
  Volume2,
  VolumeX,
  MessageSquare,
  MoreHorizontal,
  UserPlus,
  Record,
  Camera,
  Monitor
} from 'lucide-react';

const CallInterface = ({
  callType,
  participants,
  isVideoEnabled,
  isAudioEnabled,
  isScreenSharing,
  isMinimized,
  onToggleVideo,
  onToggleAudio,
  onToggleScreenShare,
  onEndCall,
  onMinimize,
  videoRef
}) => {
  const [callDuration, setCallDuration] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [showChat, setShowChat] = useState(false);

  // Timer da chamada
  useEffect(() => {
    const timer = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Card className="w-80 bg-slate-900 text-white border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-blue-500">
                      {participants[0]?.name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                </div>
                <div>
                  <p className="font-medium text-sm">
                    {callType === 'video' ? 'Videochamada' : 'Chamada de áudio'}
                  </p>
                  <p className="text-xs text-slate-300">{formatDuration(callDuration)}</p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onToggleAudio}
                  className={`text-white ${!isAudioEnabled ? 'bg-red-500' : ''}`}
                >
                  {isAudioEnabled ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onMinimize}
                  className="text-white"
                >
                  <Maximize2 className="h-4 w-4" />
                </Button>

                <Button
                  variant="destructive"
                  size="sm"
                  onClick={onEndCall}
                >
                  <PhoneOff className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-900 flex flex-col">
      {/* Header da Chamada */}
      <div className="bg-slate-800 p-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
            <span className="text-white font-medium">
              {callType === 'video' ? 'Videochamada' : 'Chamada de áudio'}
            </span>
          </div>
          
          <Badge variant="secondary" className="bg-slate-700 text-white">
            {formatDuration(callDuration)}
          </Badge>

          {isRecording && (
            <Badge variant="destructive" className="animate-pulse">
              <Record className="h-3 w-3 mr-1" />
              Gravando
            </Badge>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowParticipants(!showParticipants)}
            className="text-white"
          >
            <Users className="h-4 w-4 mr-1" />
            {participants.length}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowChat(!showChat)}
            className="text-white"
          >
            <MessageSquare className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={onMinimize}
            className="text-white"
          >
            <Minimize2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Área Principal da Chamada */}
      <div className="flex-1 flex">
        {/* Vídeo Principal */}
        <div className="flex-1 relative bg-slate-800">
          {callType === 'video' && isVideoEnabled ? (
            <div className="w-full h-full flex items-center justify-center">
              {isScreenSharing ? (
                <div className="w-full h-full bg-slate-700 flex items-center justify-center">
                  <div className="text-center text-white">
                    <Monitor className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium">Compartilhando tela</p>
                    <p className="text-sm text-slate-300">Sua tela está sendo compartilhada</p>
                  </div>
                </div>
              ) : (
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  autoPlay
                  muted
                />
              )}
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center text-white">
                <Avatar className="h-32 w-32 mx-auto mb-4">
                  <AvatarFallback className="bg-blue-500 text-4xl">
                    {participants[0]?.name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <h2 className="text-2xl font-semibold mb-2">
                  {participants[0]?.name || 'Participante'}
                </h2>
                <p className="text-slate-300">
                  {callType === 'audio' ? 'Chamada de áudio' : 'Vídeo desabilitado'}
                </p>
              </div>
            </div>
          )}

          {/* Vídeo Picture-in-Picture */}
          {callType === 'video' && isVideoEnabled && !isScreenSharing && (
            <div className="absolute top-4 right-4 w-48 h-36 bg-slate-700 rounded-lg overflow-hidden border-2 border-slate-600">
              <div className="w-full h-full flex items-center justify-center text-white">
                <Camera className="h-8 w-8 opacity-50" />
              </div>
            </div>
          )}

          {/* Indicadores de Status */}
          <div className="absolute top-4 left-4 flex flex-col space-y-2">
            {!isAudioEnabled && (
              <Badge variant="destructive" className="flex items-center">
                <MicOff className="h-3 w-3 mr-1" />
                Microfone desligado
              </Badge>
            )}
            {!isVideoEnabled && callType === 'video' && (
              <Badge variant="secondary" className="flex items-center bg-slate-700 text-white">
                <VideoOff className="h-3 w-3 mr-1" />
                Câmera desligada
              </Badge>
            )}
            {isMuted && (
              <Badge variant="secondary" className="flex items-center bg-slate-700 text-white">
                <VolumeX className="h-3 w-3 mr-1" />
                Som desligado
              </Badge>
            )}
          </div>
        </div>

        {/* Sidebar de Participantes */}
        {showParticipants && (
          <div className="w-80 bg-slate-800 border-l border-slate-700 p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold">
                Participantes ({participants.length})
              </h3>
              <Button variant="ghost" size="sm" className="text-white">
                <UserPlus className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-3">
              {participants.map(participant => (
                <div key={participant.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-slate-700">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>
                      {participant.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-white font-medium">{participant.name}</p>
                    <div className="flex items-center space-x-2">
                      {participant.isAudioEnabled ? (
                        <Mic className="h-3 w-3 text-green-500" />
                      ) : (
                        <MicOff className="h-3 w-3 text-red-500" />
                      )}
                      {callType === 'video' && (
                        participant.isVideoEnabled ? (
                          <Video className="h-3 w-3 text-green-500" />
                        ) : (
                          <VideoOff className="h-3 w-3 text-red-500" />
                        )
                      )}
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="text-white">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Controles da Chamada */}
      <div className="bg-slate-800 p-6">
        <div className="flex items-center justify-center space-x-4">
          {/* Controle de Áudio */}
          <Button
            variant={isAudioEnabled ? "secondary" : "destructive"}
            size="lg"
            onClick={onToggleAudio}
            className="rounded-full w-14 h-14"
          >
            {isAudioEnabled ? <Mic className="h-6 w-6" /> : <MicOff className="h-6 w-6" />}
          </Button>

          {/* Controle de Vídeo */}
          {callType === 'video' && (
            <Button
              variant={isVideoEnabled ? "secondary" : "destructive"}
              size="lg"
              onClick={onToggleVideo}
              className="rounded-full w-14 h-14"
            >
              {isVideoEnabled ? <Video className="h-6 w-6" /> : <VideoOff className="h-6 w-6" />}
            </Button>
          )}

          {/* Compartilhamento de Tela */}
          <Button
            variant={isScreenSharing ? "default" : "secondary"}
            size="lg"
            onClick={onToggleScreenShare}
            className="rounded-full w-14 h-14"
          >
            {isScreenSharing ? <ScreenShareOff className="h-6 w-6" /> : <ScreenShare className="h-6 w-6" />}
          </Button>

          {/* Gravação */}
          <Button
            variant={isRecording ? "destructive" : "secondary"}
            size="lg"
            onClick={toggleRecording}
            className="rounded-full w-14 h-14"
          >
            <Record className="h-6 w-6" />
          </Button>

          {/* Volume */}
          <Button
            variant={isMuted ? "destructive" : "secondary"}
            size="lg"
            onClick={toggleMute}
            className="rounded-full w-14 h-14"
          >
            {isMuted ? <VolumeX className="h-6 w-6" /> : <Volume2 className="h-6 w-6" />}
          </Button>

          {/* Configurações */}
          <Button
            variant="secondary"
            size="lg"
            className="rounded-full w-14 h-14"
          >
            <Settings className="h-6 w-6" />
          </Button>

          {/* Encerrar Chamada */}
          <Button
            variant="destructive"
            size="lg"
            onClick={onEndCall}
            className="rounded-full w-16 h-16 ml-8"
          >
            <PhoneOff className="h-8 w-8" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CallInterface;
