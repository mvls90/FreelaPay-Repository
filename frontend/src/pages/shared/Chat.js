import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import { projectAPI, messageAPI } from '../../services/api';
import { useAuthStore } from '../../store/index';
import { useSocket } from '../../context/SocketContext';
import { ArrowLeft, Send, Paperclip, Loader2 } from 'lucide-react';
import clsx from 'clsx';
import { format, isToday, isYesterday } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const formatMsgDate = (date) => {
  const d = new Date(date);
  if (isToday(d)) return format(d, 'HH:mm');
  if (isYesterday(d)) return `Ontem ${format(d, 'HH:mm')}`;
  return format(d, 'dd/MM HH:mm');
};

const groupByDate = (messages) => {
  const groups = {};
  messages.forEach(msg => {
    const d = new Date(msg.created_at);
    const key = isToday(d) ? 'Hoje' : isYesterday(d) ? 'Ontem' : format(d, "d 'de' MMMM", { locale: ptBR });
    if (!groups[key]) groups[key] = [];
    groups[key].push(msg);
  });
  return groups;
};

// Som de notificação
const playNotificationSound = () => {
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
};

export default function ChatPage() {
  const { id: projectId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { joinProject, sendMessage: socketSendMessage, sendTyping, setActiveChatProject, onNewMessage, onUserTyping } = useSocket();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [typingUser, setTypingUser] = useState(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const [toast, setToast] = useState(null);

  const { data: projectData } = useQuery(
    ['project', projectId],
    () => projectAPI.getById(projectId).then(r => r.data)
  );

  const { isLoading } = useQuery(
    ['messages', projectId],
    () => messageAPI.getProjectMessages(projectId).then(r => r.data),
    {
      onSuccess: (data) => setMessages(data.messages || []),
    }
  );

  useEffect(() => {
    joinProject(projectId);
    messageAPI.markRead(projectId).catch(() => {});
  }, [projectId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Informa ao SocketContext qual chat está aberto para suprimir toast duplicado
  useEffect(() => {
    setActiveChatProject(projectId);
    return () => setActiveChatProject(null);
  }, [projectId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const unsub = onNewMessage((msg) => {
      setMessages(prev => {
        // Evita duplicatas exatas (mesmo id)
        if (prev.find(m => m.id === msg.id)) return prev;
        // Mensagens próprias: o update otimista + resposta da API já cuidam da UI.
        // Ignorar o bounce-back do socket evita race condition com o tempId.
        if (msg.sender_id === user.id) return prev;
        playNotificationSound();
        setToast(`${msg.sender_name}: ${msg.content}`);
        setTimeout(() => setToast(null), 4000);
        return [...prev, msg];
      });
    });
    return unsub;
  }, [onNewMessage, user.id]);

  useEffect(() => {
    const unsub = onUserTyping(({ name, userId }) => {
      if (userId === user.id) return;
      setTypingUser(name);
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => setTypingUser(null), 2000);
    });
    return unsub;
  }, [onUserTyping, user.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingUser]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isSending) return;

    const content = input.trim();
    setInput('');
    setIsSending(true);

    // Update otimista — aparece imediatamente
    const tempId = `temp-${Date.now()}`;
    const tempMsg = {
      id: tempId,
      sender_id: user.id,
      sender_name: user.full_name,
      content,
      created_at: new Date().toISOString(),
    };
    setMessages(prev => [...prev, tempMsg]);

    try {
      const res = await messageAPI.send(projectId, { content });
      // Substitui a mensagem otimista pela real
      const realMsg = res.data?.message;
      if (realMsg) {
        setMessages(prev => prev.map(m => m.id === tempId ? realMsg : m));
      }
    } catch {
      // Remove otimista em caso de erro
      setMessages(prev => prev.filter(m => m.id !== tempId));
      setInput(content);
    } finally {
      setIsSending(false);
    }
  };

  const handleTyping = () => sendTyping(projectId);

  const project = projectData?.project;
  const otherName = user?.type === 'freelancer' ? project?.client_name : project?.freelancer_name;

  const grouped = groupByDate(messages);

  return (
    <div className="flex flex-col h-[calc(100vh-56px)] relative">
      {/* Toast notificação */}
      {toast && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-indigo-600 text-white px-4 py-3 rounded-xl shadow-lg text-sm max-w-xs truncate animate-bounce">
          💬 {toast}
        </div>
      )}

      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3 flex-shrink-0">
        <button onClick={() => navigate(-1)} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
          <ArrowLeft size={18} className="text-gray-600" />
        </button>
        <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-semibold text-sm flex-shrink-0">
          {otherName?.charAt(0) || '?'}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-gray-900 truncate">{otherName || 'Carregando...'}</p>
          <p className="text-xs text-gray-400 truncate">{project?.title}</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-1">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 size={24} className="animate-spin text-indigo-400" />
          </div>
        ) : (
          Object.entries(grouped).map(([date, msgs]) => (
            <div key={date}>
              <div className="flex items-center gap-3 my-4">
                <div className="flex-1 h-px bg-gray-100" />
                <span className="text-xs text-gray-400 font-medium px-2">{date}</span>
                <div className="flex-1 h-px bg-gray-100" />
              </div>
              {msgs.map((msg) => {
                const isMe = msg.sender_id === user.id;
                return (
                  <div key={msg.id} className={clsx('flex mb-2', isMe ? 'justify-end' : 'justify-start')}>
                    {!isMe && (
                      <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600 mr-2 mt-1 flex-shrink-0">
                        {msg.sender_name?.charAt(0)}
                      </div>
                    )}
                    <div className="max-w-xs lg:max-w-md">
                      <div className={clsx(
                        'px-4 py-2.5 rounded-2xl text-sm leading-relaxed',
                        isMe
                          ? 'bg-indigo-600 text-white rounded-br-sm'
                          : 'bg-white text-gray-900 border border-gray-100 rounded-bl-sm shadow-sm'
                      )}>
                        {msg.content}
                      </div>
                      <p className={clsx('text-xs mt-1', isMe ? 'text-right text-gray-400' : 'text-gray-400')}>
                        {formatMsgDate(msg.created_at)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ))
        )}

        {typingUser && (
          <div className="flex items-center gap-2 ml-9 mt-2">
            <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-sm px-4 py-2.5 shadow-sm flex items-center gap-1">
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            <p className="text-xs text-gray-400">{typingUser} está digitando</p>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-white border-t border-gray-100 p-3 flex-shrink-0">
        <form onSubmit={handleSend} className="flex items-end gap-2">
          <button type="button" className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0">
            <Paperclip size={18} />
          </button>
          <div className="flex-1 relative">
            <textarea
              value={input}
              onChange={(e) => { setInput(e.target.value); handleTyping(); }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(e); }
              }}
              rows={1}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none max-h-32 overflow-y-auto"
              placeholder="Mensagem..."
              style={{ lineHeight: '1.4' }}
            />
          </div>
          <button
            type="submit"
            disabled={!input.trim() || isSending}
            className="p-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white rounded-xl transition-colors flex-shrink-0"
          >
            {isSending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          </button>
        </form>
        <p className="text-xs text-gray-400 mt-1.5 ml-10">Enter para enviar · Shift+Enter para nova linha</p>
      </div>
    </div>
  );
}
