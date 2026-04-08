import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { adminAPI, disputeAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { ArrowLeft, Send, Loader2, CheckCircle } from 'lucide-react';
import clsx from 'clsx';
import { format } from 'date-fns';

const RESOLUTIONS = [
  { value: 'full_release',    label: 'Liberar 100% ao freelancer' },
  { value: 'partial_release', label: 'Liberar valor parcial' },
  { value: 'full_refund',     label: 'Reembolso total ao cliente' },
  { value: 'partial_refund',  label: 'Reembolso parcial' },
];

export default function AdminDisputeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [msgInput, setMsgInput]     = useState('');
  const [resolution, setResolution] = useState('');
  const [resNotes, setResNotes]     = useState('');

  const { data, isLoading } = useQuery(
    ['dispute', id],
    () => disputeAPI.getById(id).then(r => r.data)
  );

  const sendMsgMutation = useMutation(
    (content) => disputeAPI.sendMessage(id, { content, is_internal: false }),
    { onSuccess: () => { setMsgInput(''); qc.invalidateQueries(['dispute', id]); } }
  );

  const resolveDisputeMutation = useMutation(
    () => disputeAPI.resolve
      ? disputeAPI.resolve(id, { resolution, resolution_notes: resNotes })
      : import('../../services/api').then(({ default: api }) =>
          api.post(`/disputes/${id}/resolve`, { resolution, resolution_notes: resNotes })
        ),
    {
      onSuccess: () => {
        toast.success('Disputa resolvida!');
        qc.invalidateQueries(['dispute', id]);
      },
      onError: (err) => toast.error(err.response?.data?.error || 'Erro ao resolver'),
    }
  );

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 size={32} className="animate-spin text-indigo-600" />
    </div>
  );

  const dispute  = data?.dispute;
  const messages = data?.messages || [];
  if (!dispute) return null;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-gray-100">
          <ArrowLeft size={18} className="text-gray-600" />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-gray-900 truncate">{dispute.subject}</h1>
          <p className="text-sm text-gray-500">Projeto: {dispute.project_title}</p>
        </div>
        <span className={clsx('text-xs px-3 py-1.5 rounded-full font-medium',
          dispute.status === 'open'     ? 'bg-red-100 text-red-700' :
          dispute.status === 'resolved' ? 'bg-green-100 text-green-700' :
                                          'bg-yellow-100 text-yellow-700')}>
          {dispute.status}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Coluna principal */}
        <div className="lg:col-span-2 space-y-4">
          {/* Partes */}
          <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-3 text-sm">
            <h3 className="font-semibold text-gray-900">Partes envolvidas</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 rounded-xl p-3">
                <p className="text-xs text-blue-600 font-medium mb-1">Freelancer</p>
                <p className="font-semibold text-gray-900">{dispute.freelancer_name}</p>
              </div>
              <div className="bg-green-50 rounded-xl p-3">
                <p className="text-xs text-green-600 font-medium mb-1">Cliente</p>
                <p className="font-semibold text-gray-900">{dispute.client_name}</p>
              </div>
            </div>
            <div>
              <p className="text-gray-500 mb-1">Descrição</p>
              <p className="text-gray-700">{dispute.description}</p>
            </div>
          </div>

          {/* Chat */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Mensagens ({messages.length})</h3>
            <div className="space-y-3 max-h-72 overflow-y-auto mb-4 pr-1">
              {messages.length === 0
                ? <p className="text-sm text-gray-400 text-center py-4">Nenhuma mensagem</p>
                : messages.map((m, i) => (
                    <div key={m.id || i} className="flex gap-2">
                      <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                        {m.author_name?.charAt(0)}
                      </div>
                      <div className="flex-1 bg-gray-50 rounded-xl p-3">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-xs font-semibold text-gray-800">{m.author_name}</p>
                          <p className="text-xs text-gray-400">{format(new Date(m.created_at), 'dd/MM HH:mm')}</p>
                        </div>
                        <p className="text-sm text-gray-700">{m.content}</p>
                      </div>
                    </div>
                  ))
              }
            </div>
            <div className="flex gap-2">
              <input
                value={msgInput}
                onChange={e => setMsgInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && msgInput.trim() && sendMsgMutation.mutate(msgInput)}
                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Mensagem para as partes..."
              />
              <button
                onClick={() => msgInput.trim() && sendMsgMutation.mutate(msgInput)}
                disabled={!msgInput.trim() || sendMsgMutation.isLoading}
                className="p-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white rounded-xl transition-colors"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Resolver */}
          {!['resolved', 'closed'].includes(dispute.status) && (
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <h3 className="font-semibold text-gray-900 mb-3">Resolver disputa</h3>
              <div className="space-y-2 mb-3">
                {RESOLUTIONS.map(r => (
                  <button key={r.value} onClick={() => setResolution(r.value)}
                    className={clsx('w-full text-left p-3 rounded-xl border text-sm transition-all',
                      resolution === r.value
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                        : 'border-gray-200 text-gray-700 hover:border-gray-300')}>
                    {r.label}
                  </button>
                ))}
              </div>
              <textarea
                value={resNotes}
                onChange={e => setResNotes(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none mb-3"
                placeholder="Justificativa da decisão..."
              />
              <button
                onClick={() => resolveDisputeMutation.mutate()}
                disabled={!resolution || resolveDisputeMutation.isLoading}
                className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white py-2.5 rounded-xl text-sm font-medium transition-colors"
              >
                {resolveDisputeMutation.isLoading
                  ? <Loader2 size={14} className="animate-spin" />
                  : <CheckCircle size={14} />}
                Resolver disputa
              </button>
            </div>
          )}

          {/* Info */}
          <div className="bg-white rounded-xl border border-gray-100 p-5 text-sm space-y-2">
            <h3 className="font-semibold text-gray-900">Informações</h3>
            <div className="flex justify-between">
              <span className="text-gray-500">Aberta em</span>
              <span className="font-medium">
                {format(new Date(dispute.opened_at || dispute.created_at), 'dd/MM/yy HH:mm')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Valor projeto</span>
              <span className="font-medium">
                R$ {parseFloat(dispute.project_amount || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
            {dispute.mediator_name && (
              <div className="flex justify-between">
                <span className="text-gray-500">Mediador</span>
                <span className="font-medium text-indigo-600">{dispute.mediator_name}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
