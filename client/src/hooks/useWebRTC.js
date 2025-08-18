/**
 * HOOK WEBRTC
 * Hook personalizado para gerenciar conexões WebRTC
 * 100% JavaScript - SEM TYPESCRIPT
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { useToast } from './use-toast';

const CALL_STATES = {
  IDLE: 'idle',
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
  ENDED: 'ended',
  ERROR: 'error'
};

export const useWebRTC = () => {
  const { toast } = useToast();
  
  const [callState, setCallState] = useState(CALL_STATES.IDLE);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [connectionQuality, setConnectionQuality] = useState('excellent');
  
  const localStreamRef = useRef(null);
  const remoteStreamRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const signalingSocketRef = useRef(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  // Configuração WebRTC
  const rtcConfiguration = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' }
    ],
    iceCandidatePoolSize: 10
  };

  // Inicializar WebRTC
  const initializeWebRTC = useCallback(async (callId, userId) => {
    try {
      setCallState(CALL_STATES.CONNECTING);
      
      // Criar PeerConnection
      peerConnectionRef.current = new RTCPeerConnection(rtcConfiguration);
      
      // Event listeners
      peerConnectionRef.current.onicecandidate = (event) => {
        if (event.candidate && signalingSocketRef.current) {
          signalingSocketRef.current.send(JSON.stringify({
            type: 'ice_candidate',
            callId,
            userId,
            candidate: event.candidate
          }));
        }
      };
      
      peerConnectionRef.current.ontrack = (event) => {
        if (event.streams && event.streams[0]) {
          remoteStreamRef.current = event.streams[0];
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = event.streams[0];
          }
        }
      };
      
      peerConnectionRef.current.onconnectionstatechange = () => {
        const state = peerConnectionRef.current.connectionState;
        console.log('Connection state:', state);
        
        switch (state) {
          case 'connected':
            setCallState(CALL_STATES.CONNECTED);
            setConnectionQuality('excellent');
            break;
          case 'connecting':
            setCallState(CALL_STATES.CONNECTING);
            break;
          case 'disconnected':
          case 'failed':
            setCallState(CALL_STATES.ERROR);
            setConnectionQuality('poor');
            break;
          case 'closed':
            setCallState(CALL_STATES.ENDED);
            break;
        }
      };
      
      peerConnectionRef.current.oniceconnectionstatechange = () => {
        const state = peerConnectionRef.current.iceConnectionState;
        console.log('ICE connection state:', state);
        
        // Monitorar qualidade da conexão
        switch (state) {
          case 'connected':
          case 'completed':
            setConnectionQuality('excellent');
            break;
          case 'checking':
            setConnectionQuality('good');
            break;
          case 'disconnected':
            setConnectionQuality('poor');
            break;
          case 'failed':
            setConnectionQuality('poor');
            toast({
              title: 'Conexão instável',
              description: 'A qualidade da chamada pode estar comprometida.',
              variant: 'destructive'
            });
            break;
        }
      };
      
      // Obter mídia local
      await getUserMedia();
      
      // Conectar ao signaling server
      connectSignalingServer(callId, userId);
      
    } catch (error) {
      console.error('Erro ao inicializar WebRTC:', error);
      setCallState(CALL_STATES.ERROR);
      
      toast({
        title: 'Erro na conexão',
        description: 'Falha ao inicializar videochamada.',
        variant: 'destructive'
      });
    }
  }, [toast]);

  // Obter mídia do usuário
  const getUserMedia = useCallback(async (constraints = { video: true, audio: true }) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      localStreamRef.current = stream;
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      
      // Adicionar tracks ao peer connection
      if (peerConnectionRef.current) {
        stream.getTracks().forEach(track => {
          peerConnectionRef.current.addTrack(track, stream);
        });
      }
      
      // Atualizar estados
      const videoTrack = stream.getVideoTracks()[0];
      const audioTrack = stream.getAudioTracks()[0];
      
      setIsVideoEnabled(videoTrack ? videoTrack.enabled : false);
      setIsAudioEnabled(audioTrack ? audioTrack.enabled : false);
      
      return stream;
      
    } catch (error) {
      console.error('Erro ao obter mídia:', error);
      
      toast({
        title: 'Erro de mídia',
        description: 'Não foi possível acessar câmera/microfone.',
        variant: 'destructive'
      });
      
      throw error;
    }
  }, [toast]);

  // Conectar ao signaling server
  const connectSignalingServer = useCallback((callId, userId) => {
    const wsUrl = process.env.REACT_APP_WS_URL || 'ws://localhost:8080';
    signalingSocketRef.current = new WebSocket(wsUrl);
    
    signalingSocketRef.current.onopen = () => {
      console.log('Conectado ao signaling server');
      
      // Entrar na sala
      signalingSocketRef.current.send(JSON.stringify({
        type: 'join_room',
        callId,
        userId
      }));
    };
    
    signalingSocketRef.current.onmessage = async (event) => {
      const data = JSON.parse(event.data);
      await handleSignalingMessage(data);
    };
    
    signalingSocketRef.current.onerror = (error) => {
      console.error('Erro no signaling server:', error);
      toast({
        title: 'Erro de conexão',
        description: 'Falha na conexão com o servidor.',
        variant: 'destructive'
      });
    };
    
    signalingSocketRef.current.onclose = () => {
      console.log('Desconectado do signaling server');
    };
  }, [toast]);

  // Processar mensagens do signaling server
  const handleSignalingMessage = useCallback(async (data) => {
    const { type, payload } = data;
    
    switch (type) {
      case 'room_joined':
        console.log('Entrou na sala:', data);
        setParticipants(data.participants || []);
        break;
        
      case 'participant_joined':
        console.log('Participante entrou:', data);
        setParticipants(prev => [...prev, data.userId]);
        break;
        
      case 'participant_left':
        console.log('Participante saiu:', data);
        setParticipants(prev => prev.filter(id => id !== data.userId));
        break;
        
      case 'offer':
        await handleOffer(payload);
        break;
        
      case 'answer':
        await handleAnswer(payload);
        break;
        
      case 'ice_candidate':
        await handleIceCandidate(payload);
        break;
        
      case 'media_change':
        handleMediaChange(data);
        break;
        
      default:
        console.warn('Tipo de mensagem desconhecido:', type);
    }
  }, []);

  // Processar offer
  const handleOffer = useCallback(async (offer) => {
    try {
      await peerConnectionRef.current.setRemoteDescription(offer);
      const answer = await peerConnectionRef.current.createAnswer();
      await peerConnectionRef.current.setLocalDescription(answer);
      
      // Enviar answer
      if (signalingSocketRef.current) {
        signalingSocketRef.current.send(JSON.stringify({
          type: 'answer',
          payload: answer
        }));
      }
    } catch (error) {
      console.error('Erro ao processar offer:', error);
    }
  }, []);

  // Processar answer
  const handleAnswer = useCallback(async (answer) => {
    try {
      await peerConnectionRef.current.setRemoteDescription(answer);
    } catch (error) {
      console.error('Erro ao processar answer:', error);
    }
  }, []);

  // Processar ICE candidate
  const handleIceCandidate = useCallback(async (candidate) => {
    try {
      await peerConnectionRef.current.addIceCandidate(candidate);
    } catch (error) {
      console.error('Erro ao adicionar ICE candidate:', error);
    }
  }, []);

  // Processar mudança de mídia
  const handleMediaChange = useCallback((data) => {
    console.log('Mudança de mídia:', data);
    // Atualizar UI baseado nas mudanças de mídia dos outros participantes
  }, []);

  // Toggle vídeo
  const toggleVideo = useCallback(() => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
        
        // Notificar outros participantes
        if (signalingSocketRef.current) {
          signalingSocketRef.current.send(JSON.stringify({
            type: 'media_change',
            payload: {
              video: videoTrack.enabled,
              audio: isAudioEnabled
            }
          }));
        }
      }
    }
  }, [isAudioEnabled]);

  // Toggle áudio
  const toggleAudio = useCallback(() => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
        
        // Notificar outros participantes
        if (signalingSocketRef.current) {
          signalingSocketRef.current.send(JSON.stringify({
            type: 'media_change',
            payload: {
              video: isVideoEnabled,
              audio: audioTrack.enabled
            }
          }));
        }
      }
    }
  }, [isVideoEnabled]);

  // Compartilhar tela
  const toggleScreenShare = useCallback(async () => {
    try {
      if (!isScreenSharing) {
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
        
        // Parar compartilhamento quando usuário parar
        videoTrack.onended = async () => {
          setIsScreenSharing(false);
          // Voltar para câmera
          const cameraStream = await navigator.mediaDevices.getUserMedia({ video: true });
          const newVideoTrack = cameraStream.getVideoTracks()[0];
          if (sender) {
            await sender.replaceTrack(newVideoTrack);
          }
        };
        
      } else {
        // Voltar para câmera
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        const videoTrack = stream.getVideoTracks()[0];
        const sender = peerConnectionRef.current?.getSenders().find(s => 
          s.track && s.track.kind === 'video'
        );
        
        if (sender) {
          await sender.replaceTrack(videoTrack);
        }
        
        setIsScreenSharing(false);
      }
      
    } catch (error) {
      console.error('Erro ao compartilhar tela:', error);
      toast({
        title: 'Erro ao compartilhar tela',
        description: 'Não foi possível iniciar o compartilhamento.',
        variant: 'destructive'
      });
    }
  }, [isScreenSharing, toast]);

  // Encerrar chamada
  const endCall = useCallback(() => {
    // Parar streams
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
    }
    
    // Fechar peer connection
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }
    
    // Fechar signaling socket
    if (signalingSocketRef.current) {
      signalingSocketRef.current.close();
    }
    
    // Reset state
    setCallState(CALL_STATES.ENDED);
    setIsVideoEnabled(true);
    setIsAudioEnabled(true);
    setIsScreenSharing(false);
    setParticipants([]);
    setConnectionQuality('excellent');
    
    // Clear refs
    localStreamRef.current = null;
    remoteStreamRef.current = null;
    peerConnectionRef.current = null;
    signalingSocketRef.current = null;
    
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      endCall();
    };
  }, [endCall]);

  return {
    // State
    callState,
    isVideoEnabled,
    isAudioEnabled,
    isScreenSharing,
    participants,
    connectionQuality,
    
    // Refs
    localVideoRef,
    remoteVideoRef,
    
    // Actions
    initializeWebRTC,
    toggleVideo,
    toggleAudio,
    toggleScreenShare,
    endCall,
    
    // Constants
    CALL_STATES
  };
};
