import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from 'react-query';
import { proposalAPI } from '../services/api';
import { useAuthStore } from '../store/index';
import toast from 'react-hot-toast';
import {
  Shield, Clock, RotateCcw, Star, CheckCircle2,
  XCircle, DollarSign, Calendar, Award, Loader2, ChevronRight
} from 'lucide-react';
import clsx from 'clsx';

export default function ProposalViewPage() {
  const { link } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const { data, isLoading, error } = useQuery(
    ['proposal', link],
    () => proposalAPI.getByLink(link).then(r => r.data),
    { retry: false }
  );

  const acceptMutation = useMutation(
    () => proposalAPI.accept(data.proposal.id),
    {
      onSuccess: (res) => {
        toast.success('Proposta aceita! Prossiga com o pagamento.');
        const projectId = res.data.project.id;
        if (user?.type === 'client') {
          navigate(`/cliente/projetos/${projectId}/pagamento`);
        } else {
          navigate(`/cadastro?redirect=/cliente/projetos/${projectId}/pagamento`);
        }
      },
      onError: (err) => toast.error(err.response?.data?.error || 'Erro ao aceitar proposta'),
    }
  );

  const rejectMutation = useMutation(
    () => proposalAPI.reject(data.proposal.id, rejectReason),
    {
      onSuccess: () => {
        toast.success('Proposta recusada.');
        setShowRejectModal(false);
      },
      onError: (err) => toast.error(err.response?.data?.error || 'Erro'),
    }
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-indigo-600" />
      </div>
    );
  }

  if (error || !data?.proposal) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-8 max-w-md w-full text-center">
          <XCircle size={40} className="text-red-400 mx-auto mb-3" />
          <h2 className="text-lg font-semibold text-gray-900">Proposta não encontrada</h2>
          <p className="text-gray-500 text-sm mt-1">Este link pode ter expirado ou sido cancelado.</p>
        </div>
      </div>
    );
  }

  const { proposal } = data;
  const milestones = proposal.milestones?.filter(Boolean) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-4">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <Shield size={16} className="text-white" />
          </div>
          <span className="font-bold text-gray-900">Free.API</span>
          <span className="text-gray-300">•</span>
          <span className="text-sm text-gray-500">Proposta segura e verificada</span>
        </div>
      </div>

      <div className="max-w-3xl mx-auto p-4 py-8">
        {/* Freelancer info */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-4">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xl flex-shrink-0">
              {proposal.freelancer_name?.charAt(0)}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-semibold text-gray-900">{proposal.freelancer_name}</h2>
                {proposal.freelancer_verification === 'verified' && (
                  <span className="flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                    <CheckCircle2 size={11} /> Verificado
                  </span>
                )}
                {proposal.freelancer_trust > 4 && (
                  <span className="flex items-center gap-1 text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">
                    <Award size={11} /> Top Freelancer
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 mt-1.5 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Star size={13} className="text-yellow-400" />
                  {proposal.freelancer_trust?.toFixed(1) || '—'}
                </span>
                <span>{proposal.freelancer_projects || 0} projetos concluídos</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs text-gray-400">Categoria</span>
              <p className="text-sm font-medium text-gray-700">{proposal.category_name || 'Serviços'}</p>
            </div>
          </div>
        </div>

        {/* Proposta */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-4">
          <h1 className="text-xl font-bold text-gray-900 mb-2">{proposal.title}</h1>
          <p className="text-gray-600 text-sm leading-relaxed">{proposal.description}</p>

          {proposal.scope_details && (
            <div className="mt-4 p-4 bg-gray-50 rounded-xl">
              <p className="text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">Escopo e entregáveis</p>
              <p className="text-sm text-gray-700 whitespace-pre-line">{proposal.scope_details}</p>
            </div>
          )}

          {/* Detalhes */}
          <div className="grid grid-cols-3 gap-4 mt-5 pt-5 border-t border-gray-100">
            <div className="text-center">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center mx-auto mb-2">
                <DollarSign size={18} className="text-indigo-600" />
              </div>
              <p className="text-lg font-bold text-gray-900">
                R$ {parseFloat(proposal.total_amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-gray-500">Valor total</p>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center mx-auto mb-2">
                <Calendar size={18} className="text-orange-600" />
              </div>
              <p className="text-lg font-bold text-gray-900">{proposal.deadline_days} dias</p>
              <p className="text-xs text-gray-500">Prazo de entrega</p>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center mx-auto mb-2">
                <RotateCcw size={18} className="text-green-600" />
              </div>
              <p className="text-lg font-bold text-gray-900">{proposal.revisions_included || 0}</p>
              <p className="text-xs text-gray-500">Revisões inclusas</p>
            </div>
          </div>
        </div>

        {/* Etapas de pagamento */}
        {milestones.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-4">
            <h3 className="font-semibold text-gray-900 mb-4">Etapas de pagamento</h3>
            <div className="space-y-3">
              {milestones.map((m, i) => (
                <div key={m.id || i} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 text-sm font-bold flex items-center justify-center flex-shrink-0">
                    {i + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{m.title}</p>
                    {m.description && <p className="text-xs text-gray-500 mt-0.5">{m.description}</p>}
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-indigo-600">
                      R$ {parseFloat(m.amount || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-xs text-gray-400">{m.percentage}%</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Proteção */}
        <div className="bg-indigo-50 rounded-2xl p-5 mb-6">
          <div className="flex items-start gap-3">
            <Shield size={20} className="text-indigo-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-indigo-900">Pagamento 100% protegido</p>
              <p className="text-xs text-indigo-700 mt-1 leading-relaxed">
                Seu pagamento fica em custódia na Free.API e só é liberado ao freelancer após sua aprovação em cada etapa.
                Em caso de problemas, nossa equipe de mediação atua para resolver.
              </p>
            </div>
          </div>
        </div>

        {/* Ações */}
        {['sent', 'viewed'].includes(proposal.status) ? (
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => acceptMutation.mutate()}
              disabled={acceptMutation.isLoading}
              className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white py-3.5 rounded-xl font-semibold text-sm transition-colors"
            >
              {acceptMutation.isLoading ? (
                <><Loader2 size={16} className="animate-spin" /> Processando...</>
              ) : (
                <><CheckCircle2 size={16} /> Aceitar proposta <ChevronRight size={14} /></>
              )}
            </button>
            <button
              onClick={() => setShowRejectModal(true)}
              className="flex items-center justify-center gap-2 px-6 py-3.5 border-2 border-gray-200 text-gray-600 hover:border-red-200 hover:text-red-600 rounded-xl font-medium text-sm transition-colors"
            >
              <XCircle size={15} />
              Recusar
            </button>
          </div>
        ) : (
          <div className="bg-gray-100 rounded-xl p-4 text-center text-sm text-gray-500">
            Esta proposta já foi {proposal.status === 'accepted' ? 'aceita' : 'processada'}.
          </div>
        )}
      </div>

      {/* Modal recusa */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h3 className="font-semibold text-gray-900 mb-3">Recusar proposta</h3>
            <p className="text-sm text-gray-500 mb-4">Conte ao freelancer o motivo da recusa (opcional)</p>
            <textarea
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
              placeholder="Ex: O orçamento está acima do esperado..."
            />
            <div className="flex gap-3 mt-4">
              <button onClick={() => setShowRejectModal(false)}
                className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50">
                Cancelar
              </button>
              <button onClick={() => rejectMutation.mutate()}
                disabled={rejectMutation.isLoading}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2.5 rounded-xl text-sm font-medium transition-colors">
                {rejectMutation.isLoading ? 'Enviando...' : 'Recusar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
