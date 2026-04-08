import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { disputeAPI } from '../../services/api';
import { useAuthStore } from '../../store/index';
import toast from 'react-hot-toast';
import { ArrowLeft, Send, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import clsx from 'clsx';

export default function DisputePage() {
  const { id } = useParams(); const navigate = useNavigate();
  const { user } = useAuthStore(); const qc = useQueryClient();
  const [input, setInput] = useState('');

  const { data, isLoading } = useQuery(['dispute',id], () => disputeAPI.getById(id).then(r=>r.data));
  const sendMutation = useMutation((content) => disputeAPI.sendMessage(id,{content}), {
    onSuccess: () => { setInput(''); qc.invalidateQueries(['dispute',id]); },
    onError: () => toast.error('Erro ao enviar'),
  });

  if (isLoading) return <div className="flex items-center justify-center h-64"><Loader2 size={32} className="animate-spin text-indigo-600"/></div>;
  const dispute = data?.dispute; const messages = data?.messages || [];
  if (!dispute) return null;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={()=>navigate(-1)} className="p-2 rounded-lg hover:bg-gray-100"><ArrowLeft size={18} className="text-gray-600"/></button>
        <div>
          <h1 className="text-xl font-bold text-gray-900">{dispute.subject}</h1>
          <div className="flex items-center gap-2 mt-0.5">
            <span className={clsx('text-xs px-2 py-0.5 rounded-full font-medium',
              dispute.status==='open'?'bg-red-100 text-red-700':dispute.status==='resolved'?'bg-green-100 text-green-700':'bg-yellow-100 text-yellow-700')}>
              {dispute.status}
            </span>
            <span className="text-xs text-gray-400">Projeto: {dispute.project_title}</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-5 mb-4">
        <p className="text-sm font-medium text-gray-700 mb-2">Descrição</p>
        <p className="text-sm text-gray-600">{dispute.description}</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">Mensagens ({messages.length})</h3>
        </div>
        <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
          {messages.length === 0
            ? <p className="text-sm text-gray-400 text-center py-4">Nenhuma mensagem ainda</p>
            : messages.map((m,i) => {
                const isMe = m.author_id === user?.id;
                return (
                  <div key={m.id||i} className={clsx('flex', isMe ? 'justify-end' : 'justify-start')}>
                    <div className={clsx('max-w-sm px-4 py-2.5 rounded-2xl text-sm',
                      isMe ? 'bg-indigo-600 text-white rounded-br-sm' : 'bg-gray-100 text-gray-900 rounded-bl-sm')}>
                      {!isMe && <p className="text-xs font-semibold mb-1 opacity-70">{m.author_name}</p>}
                      <p>{m.content}</p>
                      <p className={clsx('text-xs mt-1', isMe ? 'text-indigo-200' : 'text-gray-400')}>
                        {format(new Date(m.created_at), 'dd/MM HH:mm')}
                      </p>
                    </div>
                  </div>
                );
              })
          }
        </div>
        {!['resolved','closed'].includes(dispute.status) && (
          <div className="p-4 border-t border-gray-100 flex gap-2">
            <input value={input} onChange={e=>setInput(e.target.value)}
              onKeyDown={e => e.key==='Enter' && input.trim() && sendMutation.mutate(input)}
              className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Sua mensagem..."/>
            <button onClick={()=>sendMutation.mutate(input)} disabled={!input.trim()||sendMutation.isLoading}
              className="p-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white rounded-xl">
              <Send size={16}/>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
