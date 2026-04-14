import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuthStore } from '../store/index';
import { useNotificationStore } from '../store/index';
import toast from 'react-hot-toast';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { accessToken, user } = useAuthStore();
  const { addNotification } = useNotificationStore();
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  // Rastreia salas de projeto para re-entrar após reconexão
  const joinedProjectsRef = useRef(new Set());
  // Projeto de chat atualmente aberto — suprime toast duplicado
  const activeChatProjectRef = useRef(null);

  // Dependência em user?.id (primitivo) evita reconexões desnecessárias
  // quando outros campos do user mudam (ex: email_verified)
  useEffect(() => {
    if (!accessToken || !user) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setIsConnected(false);
      }
      return;
    }

    const socket = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:3001', {
      auth: { token: accessToken },
      transports: ['websocket', 'polling'],
      reconnectionDelayMax: 5000,
      // reconnectionAttempts padrão = Infinity; não limitar para manter conexão
    });

    socket.on('connect', () => {
      setIsConnected(true);
      console.log('✅ Socket conectado');
      // Re-entra em todas as salas de projeto após connect/reconexão
      joinedProjectsRef.current.forEach(id => socket.emit('join_project', id));
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('connect_error', (err) => {
      console.error('Erro de conexão socket:', err.message);
    });

    // Notificações em tempo real
    socket.on('notification', (notification) => {
      addNotification(notification);
      toast(notification.title, {
        icon: getNotificationIcon(notification.type),
        duration: 5000,
      });
    });

    // Mensagem recebida — notificação com som em qualquer página.
    // Suprimida quando o usuário já está visualizando o chat daquele projeto
    // para evitar duplicação com a notificação interna do Chat.js.
    socket.on('message_notification', ({ from, message, projectId }) => {
      if (activeChatProjectRef.current === String(projectId)) return;
      toast(`💬 ${from}: ${message}`, { duration: 4000 });
      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.connect(g);
        g.connect(ctx.destination);
        o.frequency.value = 520;
        g.gain.value = 0.3;
        o.start();
        o.stop(ctx.currentTime + 0.15);
      } catch {}
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    };
  }, [accessToken, user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Entra na sala do projeto e salva o ID para re-entrada automática após reconexão
  const joinProject = (projectId) => {
    joinedProjectsRef.current.add(String(projectId));
    if (socketRef.current?.connected) {
      socketRef.current.emit('join_project', projectId);
    }
    // Se ainda não conectado, será re-emitido no handler 'connect' acima
  };

  const joinDispute = (disputeId) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('join_dispute', disputeId);
    }
  };

  const sendMessage = (projectId, content, attachments = []) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('send_message', { projectId, content, attachments });
    }
  };

  const sendTyping = (projectId) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('typing', { projectId });
    }
  };

  // Registra qual chat está aberto para suprimir toast duplicado de message_notification
  const setActiveChatProject = (projectId) => {
    activeChatProjectRef.current = projectId ? String(projectId) : null;
  };

  const onNewMessage = (callback) => {
    socketRef.current?.on('new_message', callback);
    return () => socketRef.current?.off('new_message', callback);
  };

  const onUserTyping = (callback) => {
    socketRef.current?.on('user_typing', callback);
    return () => socketRef.current?.off('user_typing', callback);
  };

  const onDisputeMessage = (callback) => {
    socketRef.current?.on('dispute_message', callback);
    return () => socketRef.current?.off('dispute_message', callback);
  };

  return (
    <SocketContext.Provider value={{
      socket: socketRef.current,
      isConnected,
      joinProject,
      joinDispute,
      sendMessage,
      sendTyping,
      setActiveChatProject,
      onNewMessage,
      onUserTyping,
      onDisputeMessage,
    }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error('useSocket deve ser usado dentro de SocketProvider');
  return ctx;
};

const getNotificationIcon = (type) => {
  const icons = {
    proposal_accepted: '🎉',
    payment_received: '💰',
    payment_released: '✅',
    milestone_approved: '✅',
    milestone_rejected: '🔄',
    revision_requested: '✏️',
    project_completed: '🏆',
    dispute_opened: '⚠️',
    dispute_resolved: '⚖️',
    message_received: '💬',
    system_alert: '🔔',
  };
  return icons[type] || '🔔';
};
