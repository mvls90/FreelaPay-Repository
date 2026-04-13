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
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socket.on('connect', () => {
      setIsConnected(true);
      console.log('✅ Socket conectado');
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

    // Mensagem recebida
    socket.on('message_notification', ({ from, message }) => {
      toast(`💬 ${from}: ${message}`, { duration: 4000 });
    });

    // Fallback: notificação via new_message quando fora do chat
    socket.on('new_message', (msg) => {
      if (msg.sender_id !== user?.id) {
        toast(`💬 ${msg.sender_name}: ${msg.content?.substring(0, 60)}`, { duration: 4000 });
        try {
          const ctx = new (window.AudioContext || window.webkitAudioContext)();
          const o = ctx.createOscillator();
          const g = ctx.createGain();
          o.connect(g); g.connect(ctx.destination);
          o.frequency.value = 520; g.gain.value = 0.3;
          o.start(); o.stop(ctx.currentTime + 0.15);
        } catch {}
      }
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    };
  }, [accessToken, user]);

  const joinProject = (projectId) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('join_project', projectId);
    }
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
