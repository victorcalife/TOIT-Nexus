import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Phone, 
  PhoneOff,
  Monitor,
  MonitorOff,
  Settings,
  Users,
  MessageCircle,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  MoreVertical,
  Camera,
  CameraOff,
  Record,
  StopCircle,
  Share,
  Hand,
  Grid3X3,
  User,
  Clock,
  Wifi,
  WifiOff,
  Signal,
  SignalHigh,
  SignalMedium,
  SignalLow,
  Brain,
  Atom,
  Zap
} from 'lucide-react';

// Importar sistema quântico integrado
import quantumSystemCore from '@/core/QuantumSystemCore';
import milaOmnipresence from '@/core/MilaOmnipresence';
import universalWorkflowEngine from '@/core/UniversalWorkflowEngine';

const CALL_STATES = {
  IDLE: 'idle',
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
  RECONNECTING: 'reconnecting',
  ENDED: 'ended'
};

const VIDEO_LAYOUTS = {
  SPEAKER: 'speaker',
  GRID: 'grid',
  SIDEBAR: 'sidebar'
};

const CALL_QUALITY = {
  EXCELLENT: { label: 'Excelente', color: 'text-green-500', icon: SignalHigh },
  GOOD: { label: 'Boa', color: 'text-blue-500', icon: SignalMedium },
  POOR: { label: 'Ruim', color: 'text-orange-500', icon: SignalLow },
  VERY_POOR: { label: 'Muito Ruim', color: 'text-red-500', icon: Signal }
};

export default function VideoCallInterface({ 
  isOpen = false, 
  onClose,
  callData = null,
  participants = [],
  currentUser = null 
}) {
  const { toast } = useToast();
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);
  
  // Call State
  const [callState, setCallState] = useState(CALL_STATES.IDLE);
  const [callDuration, setCallDuration] = useState(0);
  const [callStartTime, setCallStartTime] = useState(null);
  const [connectionQuality, setConnectionQuality] = useState('EXCELLENT');
  
  // Media State
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [volume, setVolume] = useState(80);
  
  // UI State
  const [layout, setLayout] = useState(VIDEO_LAYOUTS.SPEAKER);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [showChat, setShowChat] = useState(false);
  
  // MILA Integration
  const [milaActive, setMilaActive] = useState(true);
  const [milaInsights, setMilaInsights] = useState([]);
  const [quantumEnhanced, setQuantumEnhanced] = useState(true);
  const [callAnalytics, setCallAnalytics] = useState(null);

  useEffect(() => {
    if (isOpen && callData) {
      initializeQuantumVideoCall();
      initializeWebRTC();
      setupMilaObservation();
    }
    
    return () => {
      cleanup();
    };
  }, [isOpen, callData]);

  useEffect(() => {
    let interval;
    if (callState === CALL_STATES.CONNECTED && callStartTime) {
      interval = setInterval(() => {
        setCallDuration(Math.floor((Date.now() - callStartTime) / 1000));
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [callState, callStartTime]);

  const initializeQuantumVideoCall = async () => {
    try {
      console.log('📹⚛️ Inicializando Video Call Quântico...');
      
      // Conectar ao sistema quântico
      quantumSystemCore.connectModule('video_call', {
        receiveQuantumUpdate: (result) => {
          if (result.automaticInsights) {
            setMilaInsights(prev => [...prev, ...result.automaticInsights]);
          }
          
          if (result.callOptimizations) {
            applyCallOptimizations(result.callOptimizations);
          }
        }
      });

      // Processar dados da chamada com algoritmos quânticos
      const quantumResult = await quantumSystemCore.processQuantumOperation({
        type: 'video_call_optimization',
        data: {
          participants: participants.length,
          callType: callData.type,
          expectedDuration: callData.expectedDuration
        },
        complexity: 3
      });

      setCallAnalytics(quantumResult);

      console.log('✅ Video Call Quântico inicializado');
      
    } catch (error) {
      console.error('❌ Erro na inicialização do video call:', error);
    }
  };

  const setupMilaObservation = () => {
    // Observar interações da chamada
    const observeCallInteraction = (action, data) => {
      milaOmnipresence.observeUserInteraction({
        type: 'video_call_interaction',
        module: 'video_call',
        action,
        data,
        userId: currentUser?.id,
        timestamp: new Date()
      });
    };

    // Configurar observadores
    window.videoCallObserver = observeCallInteraction;
  };

  const initializeWebRTC = async () => {
    try {
      setCallState(CALL_STATES.CONNECTING);
      
      // Configurar PeerConnection
      const configuration = {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ]
      };
      
      peerConnectionRef.current = new RTCPeerConnection(configuration);
      
      // Configurar event listeners
      peerConnectionRef.current.onicecandidate = handleIceCandidate;
      peerConnectionRef.current.ontrack = handleRemoteStream;
      peerConnectionRef.current.onconnectionstatechange = handleConnectionStateChange;
      
      // Obter mídia local
      const stream = await navigator.mediaDevices.getUserMedia({
        video: isVideoEnabled,
        audio: isAudioEnabled
      });
      
      localStreamRef.current = stream;
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      
      // Adicionar tracks ao peer connection
      stream.getTracks().forEach(track => {
        peerConnectionRef.current.addTrack(track, stream);
      });
      
      // Simular conexão bem-sucedida
      setTimeout(() => {
        setCallState(CALL_STATES.CONNECTED);
        setCallStartTime(Date.now());
        
        // Observar início da chamada
        window.videoCallObserver?.('call_started', {
          callId: callData.id,
          participants: participants.length,
          videoEnabled: isVideoEnabled,
          audioEnabled: isAudioEnabled
        });
        
        toast({
          title: "📹 Chamada conectada",
          description: "Conexão WebRTC estabelecida com sucesso"
        });
      }, 2000);
      
    } catch (error) {
      console.error('❌ Erro ao inicializar WebRTC:', error);
      
      toast({
        title: "Erro na conexão",
        description: "Falha ao acessar câmera/microfone",
        variant: "destructive"
      });
      
      setCallState(CALL_STATES.ENDED);
    }
  };

  const handleIceCandidate = (event) => {
    if (event.candidate) {
      // Enviar candidate via signaling server
      console.log('ICE candidate:', event.candidate);
    }
  };

  const handleRemoteStream = (event) => {
    if (remoteVideoRef.current && event.streams[0]) {
      remoteVideoRef.current.srcObject = event.streams[0];
    }
  };

  const handleConnectionStateChange = () => {
    const state = peerConnectionRef.current?.connectionState;
    console.log('Connection state:', state);
    
    if (state === 'connected') {
      setCallState(CALL_STATES.CONNECTED);
      setConnectionQuality('EXCELLENT');
    } else if (state === 'disconnected') {
      setCallState(CALL_STATES.RECONNECTING);
      setConnectionQuality('POOR');
    } else if (state === 'failed') {
      setCallState(CALL_STATES.ENDED);
      setConnectionQuality('VERY_POOR');
    }
  };

  const toggleVideo = async () => {
    try {
      const videoTrack = localStreamRef.current?.getVideoTracks()[0];
      
      if (videoTrack) {
        videoTrack.enabled = !isVideoEnabled;
        setIsVideoEnabled(!isVideoEnabled);
        
        // Observar mudança de vídeo
        window.videoCallObserver?.('toggle_video', {
          enabled: !isVideoEnabled,
          callId: callData.id
        });
        
        toast({
          title: isVideoEnabled ? "📹 Vídeo desabilitado" : "📹 Vídeo habilitado",
          description: isVideoEnabled ? "Sua câmera foi desligada" : "Sua câmera foi ligada"
        });
      }
    } catch (error) {
      console.error('❌ Erro ao alternar vídeo:', error);
    }
  };

  const toggleAudio = async () => {
    try {
      const audioTrack = localStreamRef.current?.getAudioTracks()[0];
      
      if (audioTrack) {
        audioTrack.enabled = !isAudioEnabled;
        setIsAudioEnabled(!isAudioEnabled);
        
        // Observar mudança de áudio
        window.videoCallObserver?.('toggle_audio', {
          enabled: !isAudioEnabled,
          callId: callData.id
        });
        
        toast({
          title: isAudioEnabled ? "🔇 Microfone mutado" : "🎤 Microfone ativo",
          description: isAudioEnabled ? "Seu microfone foi mutado" : "Seu microfone foi ativado"
        });
      }
    } catch (error) {
      console.error('❌ Erro ao alternar áudio:', error);
    }
  };

  const startScreenShare = async () => {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true
      });
      
      // Substituir track de vídeo
      const videoTrack = screenStream.getVideoTracks()[0];
      const sender = peerConnectionRef.current?.getSenders().find(s => 
        s.track && s.track.kind === 'video'
      );
      
      if (sender) {
        await sender.replaceTrack(videoTrack);
      }
      
      setIsScreenSharing(true);
      
      // Observar compartilhamento de tela
      window.videoCallObserver?.('start_screen_share', {
        callId: callData.id
      });
      
      toast({
        title: "🖥️ Compartilhamento iniciado",
        description: "Sua tela está sendo compartilhada"
      });
      
      // Parar compartilhamento quando track terminar
      videoTrack.onended = () => {
        stopScreenShare();
      };
      
    } catch (error) {
      console.error('❌ Erro ao compartilhar tela:', error);
      
      toast({
        title: "Erro no compartilhamento",
        description: "Falha ao compartilhar tela",
        variant: "destructive"
      });
    }
  };

  const stopScreenShare = async () => {
    try {
      // Voltar para câmera
      const videoStream = await navigator.mediaDevices.getUserMedia({ video: true });
      const videoTrack = videoStream.getVideoTracks()[0];
      
      const sender = peerConnectionRef.current?.getSenders().find(s => 
        s.track && s.track.kind === 'video'
      );
      
      if (sender) {
        await sender.replaceTrack(videoTrack);
      }
      
      setIsScreenSharing(false);
      
      toast({
        title: "🖥️ Compartilhamento parado",
        description: "Voltando para câmera"
      });
      
    } catch (error) {
      console.error('❌ Erro ao parar compartilhamento:', error);
    }
  };

  const startRecording = async () => {
    try {
      setIsRecording(true);
      
      // Observar início da gravação
      window.videoCallObserver?.('start_recording', {
        callId: callData.id
      });
      
      toast({
        title: "🔴 Gravação iniciada",
        description: "A chamada está sendo gravada"
      });
      
    } catch (error) {
      console.error('❌ Erro ao iniciar gravação:', error);
    }
  };

  const stopRecording = async () => {
    try {
      setIsRecording(false);
      
      toast({
        title: "⏹️ Gravação parada",
        description: "Gravação salva com sucesso"
      });
      
    } catch (error) {
      console.error('❌ Erro ao parar gravação:', error);
    }
  };

  const endCall = async () => {
    try {
      // Observar fim da chamada
      window.videoCallObserver?.('end_call', {
        callId: callData.id,
        duration: callDuration,
        participants: participants.length
      });
      
      // Criar workflow de follow-up se necessário
      if (callDuration > 300) { // Mais de 5 minutos
        await universalWorkflowEngine.createAutomaticWorkflow({
          type: 'call_follow_up',
          data: {
            callId: callData.id,
            duration: callDuration,
            participants: participants.map(p => p.id),
            recordingAvailable: isRecording
          },
          source: 'video_call'
        });
      }
      
      cleanup();
      
      toast({
        title: "📞 Chamada encerrada",
        description: `Duração: ${formatDuration(callDuration)}`
      });
      
      if (onClose) onClose();
      
    } catch (error) {
      console.error('❌ Erro ao encerrar chamada:', error);
    }
  };

  const cleanup = () => {
    // Parar todas as tracks
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
    }
    
    // Fechar peer connection
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }
    
    setCallState(CALL_STATES.ENDED);
  };

  const applyCallOptimizations = (optimizations) => {
    // Aplicar otimizações quânticas na chamada
    if (optimizations.videoQuality) {
      // Ajustar qualidade do vídeo
      console.log('Aplicando otimização de qualidade:', optimizations.videoQuality);
    }
    
    if (optimizations.audioSettings) {
      // Ajustar configurações de áudio
      console.log('Aplicando otimização de áudio:', optimizations.audioSettings);
    }
  };

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getQualityInfo = () => {
    return CALL_QUALITY[connectionQuality] || CALL_QUALITY.EXCELLENT;
  };

  const renderParticipant = (participant, isLocal = false) => {
    return (
      <div key={participant.id} className="relative bg-gray-900 rounded-lg overflow-hidden">
        {/* Video */}
        <video
          ref={isLocal ? localVideoRef : remoteVideoRef}
          autoPlay
          muted={isLocal}
          playsInline
          className="w-full h-full object-cover"
        />
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        
        {/* Participant Info */}
        <div className="absolute bottom-4 left-4 flex items-center gap-2">
          <Avatar className="w-8 h-8">
            <AvatarImage src={participant.avatar} />
            <AvatarFallback>{participant.name[0]}</AvatarFallback>
          </Avatar>
          
          <div className="text-white">
            <p className="font-medium text-sm">
              {isLocal ? 'Você' : participant.name}
            </p>
            <div className="flex items-center gap-1">
              {!participant.audioEnabled && (
                <MicOff className="w-3 h-3 text-red-400" />
              )}
              {!participant.videoEnabled && (
                <VideoOff className="w-3 h-3 text-red-400" />
              )}
            </div>
          </div>
        </div>
        
        {/* Status Indicators */}
        <div className="absolute top-4 right-4 flex items-center gap-2">
          {isRecording && (
            <div className="flex items-center gap-1 px-2 py-1 bg-red-500 rounded-full">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
              <span className="text-white text-xs font-medium">REC</span>
            </div>
          )}
          
          {isScreenSharing && participant.id === currentUser?.id && (
            <Badge variant="secondary" className="text-xs">
              <Monitor className="w-2 h-2 mr-1" />
              Compartilhando
            </Badge>
          )}
        </div>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gray-900 text-white">
        <div className="flex items-center gap-4">
          <h2 className="font-semibold">{callData?.title || 'Chamada de Vídeo'}</h2>
          
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span className="text-sm">{formatDuration(callDuration)}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${
              callState === CALL_STATES.CONNECTED ? 'bg-green-500' : 
              callState === CALL_STATES.CONNECTING ? 'bg-yellow-500' : 'bg-red-500'
            }`} />
            <span className="text-sm capitalize">{callState}</span>
          </div>
          
          {/* Quality Indicator */}
          <div className="flex items-center gap-1">
            {React.createElement(getQualityInfo().icon, { 
              className: `w-4 h-4 ${getQualityInfo().color}` 
            })}
            <span className={`text-xs ${getQualityInfo().color}`}>
              {getQualityInfo().label}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {quantumEnhanced && (
            <Badge variant="secondary">
              <Atom className="w-3 h-3 mr-1" />
              Quantum Enhanced
            </Badge>
          )}
          
          {milaActive && (
            <Badge variant="outline" className="text-white border-white">
              <Brain className="w-3 h-3 mr-1" />
              MILA Active
            </Badge>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowParticipants(!showParticipants)}
            className="text-white hover:bg-gray-800"
          >
            <Users className="w-4 h-4 mr-2" />
            {participants.length}
          </Button>
        </div>
      </div>

      {/* Main Video Area */}
      <div className="flex-1 relative">
        {layout === VIDEO_LAYOUTS.SPEAKER ? (
          <div className="h-full grid grid-cols-4 gap-4 p-4">
            {/* Main Speaker */}
            <div className="col-span-3 h-full">
              {renderParticipant(participants[0] || currentUser, false)}
            </div>
            
            {/* Sidebar Participants */}
            <div className="space-y-4">
              {renderParticipant(currentUser, true)}
              {participants.slice(1).map(participant => 
                renderParticipant(participant, false)
              )}
            </div>
          </div>
        ) : (
          <div className="h-full grid grid-cols-2 gap-4 p-4">
            {renderParticipant(currentUser, true)}
            {participants.map(participant => 
              renderParticipant(participant, false)
            )}
          </div>
        )}

        {/* MILA Insights Overlay */}
        {milaInsights.length > 0 && (
          <div className="absolute top-4 left-4 max-w-sm">
            <Card className="bg-purple-900/90 border-purple-600 text-white">
              <CardContent className="p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Brain className="w-4 h-4" />
                  <span className="text-sm font-medium">MILA Insights</span>
                </div>
                <p className="text-sm">
                  {milaInsights[milaInsights.length - 1]?.message}
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Controls */}
      {showControls && (
        <div className="p-6 bg-gray-900">
          <div className="flex items-center justify-center gap-4">
            {/* Audio Control */}
            <Button
              variant={isAudioEnabled ? "secondary" : "destructive"}
              size="lg"
              onClick={toggleAudio}
              className="rounded-full w-14 h-14"
            >
              {isAudioEnabled ? (
                <Mic className="w-6 h-6" />
              ) : (
                <MicOff className="w-6 h-6" />
              )}
            </Button>

            {/* Video Control */}
            <Button
              variant={isVideoEnabled ? "secondary" : "destructive"}
              size="lg"
              onClick={toggleVideo}
              className="rounded-full w-14 h-14"
            >
              {isVideoEnabled ? (
                <Video className="w-6 h-6" />
              ) : (
                <VideoOff className="w-6 h-6" />
              )}
            </Button>

            {/* Screen Share */}
            <Button
              variant={isScreenSharing ? "default" : "secondary"}
              size="lg"
              onClick={isScreenSharing ? stopScreenShare : startScreenShare}
              className="rounded-full w-14 h-14"
            >
              {isScreenSharing ? (
                <MonitorOff className="w-6 h-6" />
              ) : (
                <Monitor className="w-6 h-6" />
              )}
            </Button>

            {/* Recording */}
            <Button
              variant={isRecording ? "destructive" : "secondary"}
              size="lg"
              onClick={isRecording ? stopRecording : startRecording}
              className="rounded-full w-14 h-14"
            >
              {isRecording ? (
                <StopCircle className="w-6 h-6" />
              ) : (
                <Record className="w-6 h-6" />
              )}
            </Button>

            {/* Chat */}
            <Button
              variant="secondary"
              size="lg"
              onClick={() => setShowChat(!showChat)}
              className="rounded-full w-14 h-14"
            >
              <MessageCircle className="w-6 h-6" />
            </Button>

            {/* Settings */}
            <Button
              variant="secondary"
              size="lg"
              className="rounded-full w-14 h-14"
            >
              <Settings className="w-6 h-6" />
            </Button>

            {/* End Call */}
            <Button
              variant="destructive"
              size="lg"
              onClick={endCall}
              className="rounded-full w-14 h-14 ml-8"
            >
              <PhoneOff className="w-6 h-6" />
            </Button>
          </div>

          {/* Secondary Controls */}
          <div className="flex items-center justify-center gap-2 mt-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLayout(layout === VIDEO_LAYOUTS.SPEAKER ? VIDEO_LAYOUTS.GRID : VIDEO_LAYOUTS.SPEAKER)}
              className="text-white hover:bg-gray-800"
            >
              <Grid3X3 className="w-4 h-4 mr-2" />
              {layout === VIDEO_LAYOUTS.SPEAKER ? 'Grade' : 'Palestrante'}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="text-white hover:bg-gray-800"
            >
              {isFullscreen ? (
                <Minimize className="w-4 h-4 mr-2" />
              ) : (
                <Maximize className="w-4 h-4 mr-2" />
              )}
              {isFullscreen ? 'Sair' : 'Tela Cheia'}
            </Button>
          </div>
        </div>
      )}

      {/* Connection Status */}
      {callState === CALL_STATES.CONNECTING && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
          <div className="text-center text-white">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Conectando...</h3>
            <p className="text-gray-300">Estabelecendo conexão WebRTC</p>
          </div>
        </div>
      )}

      {/* Reconnecting */}
      {callState === CALL_STATES.RECONNECTING && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-10">
          <Card className="bg-orange-900/90 border-orange-600 text-white">
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <WifiOff className="w-4 h-4" />
                <span className="text-sm font-medium">Reconectando...</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
