import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { projectAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { ArrowLeft, MessageSquare, CheckCircle2, XCircle, Loader2, AlertTriangle, Shield } from 'lucide-react';
import clsx from 'clsx';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const STATUS_CFG = {
  waiting_payment:    { label: 'Aguardando pagamento', cls: 'bg-orange-100 text-orange-700' },
  in_progress:        { label: 'Em andamento',         cls: 'bg-blue-100 text-blue-700' },
  in_review:          { label: 'Aguard. sua revisão',  cls: 'bg-yellow-100 text-yellow-700' },
  revision_requested: { label: 'Revisão solicitada',   cls: 'bg-purple-100 text-purple-700' },
  completed:          { label: 'Concluído',             cls: 'bg-green-100 text-green-700' },
  disputed:           { label: 'Em disputa',            cls: 'bg-red-100 text-red-700' },
};

export default function ClientProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  const { data, isLoading } = useQuery(['project', id], () => projectAPI.getById(id).then(r => r.data));

  const approveMutation = useMutation(
    (milestoneId) => projectAPI.approveMilestone(id, milestoneId),
    {
      onSuccess: () => { toast.success('Etapa aprovada!'); qc.invalidateQueries(['project', id]); },
      onError: err => toast.error(err.response?.data?.error || 'Erro'),
    }
  );

  const rejectMutation = useMutation(
    ({ milestoneId, reason }) => projectAPI.rejectMilestone(id, milestoneId, reason),
    {
      onSuccess: () => {
        toast.success('Revisão solicitada!');
        qc.invalidateQueries(['project', id]);
        setRejectModal(null); setRejectReason('');
      },
      onError: err => toast.error(err.response?.data?.error || 'Erro'),
    }
  );

  if (isLoading) return <div className="flex items-center justify-center h-64"><Loader2 size={32} className="animate-spin text-indigo-600" /></div>;
  const project = data?.project;
  if (!project) return null;

  const milestones = project.milestones?.filter(Boolean) || [];
  const updates = project.updates?.filter(Boolean) || [];
  const statusCfg = STATUS_CFG[project.status] || { label: project.status, cls: 'bg-gray-100 text-gray-600' };
  const submittedMilestone = milestones.find(m => m.status === 'submitted');

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-gray-100"><ArrowLeft size={18} className="text-gray-600" /></button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-bold text-gray-900 truncate">{project.title}</h1>
            <span className={clsx('text-xs px-2.5 py-1 rounded-full font-medium', statusCfg.cls)}>{statusCfg.label}</span>
          </div>
          <p className="text-sm text-gray-500 mt-0.5">Freelancer: {project.freelancer_name}</p>
        </div>
        <Link to={`/cliente/projetos/${id}/chat`}
          className="flex items-center gap-2 border border-gray-200 text-gray-700 hover:border-indigo-300 hover:text-indigo-600 px-4 py-2 rounded-xl text-sm font-medium transition-colors">
          <MessageSquare size={15} /> Chat
        </Link>
      </div>

      {submittedMilestone && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-5 mb-5">
          <div className="flex items-start gap-3 mb-4">
            <AlertTriangle size={20} className="text-yellow-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-yellow-900">Entrega aguardando sua aprovação</p>
              <p className="text-sm text-yellow-700 mt-0.5">O freelancer enviou a etapa "<strong>{submittedMilestone.title}</strong>".</p>
              {submittedMilestone.submission_notes && (
                <div className="mt-2 bg-white/60 rounded-lg p-3 text-sm text-yellow-800">{submittedMilestone.submission_notes}</div>
              )}
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => approveMutation.mutate(submittedMilestone.id)} disabled={approveMutation.isLoading}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors">
              {approveMutation.isLoading ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={15} />} Aprovar
            </button>
            <button onClick={() => setRejectModal(submittedMilestone.id)}
              className="flex items-center gap-2 border-2 border-orange-200 text-orange-700 hover:bg-orange-50 px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors">
              <XCircle size={15} /> Pedir revisão
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-gray-900">Progresso</h2>
              <span className="text-sm font-bold text-indigo-600">{project.progress_pct || 0}%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2.5 mb-4">
              <div className="bg-indigo-500 h-2.5 rounded-full" style={{ width: `${project.progress_pct || 0}%` }} />
            </div>
            <div className="grid grid-cols-3 gap-4 text-center text-sm">
              <div><p className="text-lg font-bold text-gray-900">R$ {parseFloat(project.total_amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p><p className="text-xs text-gray-500">Total</p></div>
              <div><p className="text-lg font-bold text-blue-600">R$ {parseFloat(project.amount_held || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p><p className="text-xs text-gray-500">Em custódia</p></div>
              <div><p className="text-lg font-bold text-green-600">R$ {parseFloat(project.amount_released || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p><p className="text-xs text-gray-500">Liberado</p></div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h2 className="font-semibold text-gray-900 mb-4">Etapas</h2>
            <div className="space-y-3">
              {milestones.map((m, i) => (
                <div key={m.id || i} className={clsx('p-4 rounded-xl border',
                  m.status === 'submitted' ? 'border-yellow-200 bg-yellow-50' :
                  m.status === 'approved' || m.status === 'paid' ? 'border-green-200 bg-green-50' : 'border-gray-100 bg-gray-50')}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={clsx('w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0',
                        m.status === 'paid' || m.status === 'approved' ? 'bg-green-500 text-white' :
                        m.status === 'submitted' ? 'bg-yellow-500 text-white' : 'bg-white border-2 border-gray-300 text-gray-500')}>
                        {m.status === 'paid' || m.status === 'approved' ? <CheckCircle2 size={13} /> : i + 1}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{m.title}</p>
                        {m.submitted_at && <p className="text-xs text-gray-400">Enviado: {format(new Date(m.submitted_at), 'dd/MM HH:mm')}</p>}
                      </div>
                    </div>
                    <p className="text-sm font-bold text-indigo-600">R$ {parseFloat(m.amount || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {updates.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <h2 className="font-semibold text-gray-900 mb-4">Atualizações do freelancer</h2>
              <div className="space-y-3">
                {updates.map((u, i) => (
                  <div key={u.id || i} className="border-l-2 border-indigo-200 pl-4 py-1">
                    <div className="flex justify-between"><p className="text-sm font-medium text-gray-900">{u.title || 'Atualização'}</p>
                      <span className="text-xs text-gray-400">{u.created_at ? format(new Date(u.created_at), "dd/MM 'às' HH:mm", { locale: ptBR }) : ''}</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-0.5">{u.description}</p>
                    {u.is_delivery && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Entrega</span>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-3 text-sm">
            <h3 className="font-semibold text-gray-900">Informações</h3>
            {project.deadline_at && <div className="flex justify-between"><span className="text-gray-500">Prazo</span><span className="font-medium">{format(new Date(project.deadline_at), 'dd/MM/yyyy')}</span></div>}
            <div className="flex justify-between"><span className="text-gray-500">Revisões disp.</span><span className="font-medium">{(project.revisions_allowed || 0) - (project.revisions_used || 0)}</span></div>
          </div>
          <div className="bg-indigo-50 rounded-xl p-4 flex items-start gap-2">
            <Shield size={14} className="text-indigo-600 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-indigo-700">Pagamento em custódia, liberado somente após sua aprovação.</p>
          </div>
          {['in_progress','in_review','revision_requested'].includes(project.status) && (
            <Link to={`/cliente/disputas/nova?project=${id}`}
              className="flex items-center justify-center gap-2 w-full border border-red-200 text-red-600 hover:bg-red-50 py-2.5 rounded-xl text-sm font-medium transition-colors">
              <AlertTriangle size={14} /> Abrir disputa
            </Link>
          )}
        </div>
      </div>

      {rejectModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h3 className="font-semibold text-gray-900 mb-3">Solicitar revisão</h3>
            <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)} rows={3}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
              placeholder="O que precisa ser ajustado?" />
            <div className="flex gap-3 mt-4">
              <button onClick={() => { setRejectModal(null); setRejectReason(''); }} className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm font-medium">Cancelar</button>
              <button onClick={() => rejectMutation.mutate({ milestoneId: rejectModal, reason: rejectReason })}
                disabled={!rejectReason || rejectMutation.isLoading}
                className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white py-2.5 rounded-xl text-sm font-medium transition-colors">
                Solicitar revisão
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
