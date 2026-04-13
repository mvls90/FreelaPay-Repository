import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { projectAPI } from '../../services/api';
import toast from 'react-hot-toast';
import {
  ArrowLeft, MessageSquare, Send, CheckCircle2, Clock,
  Upload, AlertTriangle, RotateCcw, DollarSign, Loader2,
  FileText, X, ChevronDown, ChevronUp
} from 'lucide-react';
import clsx from 'clsx';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const STATUS_LABEL = {
  waiting_payment: { label: 'Aguardando pagamento', cls: 'bg-orange-100 text-orange-700' },
  in_progress:     { label: 'Em andamento',         cls: 'bg-blue-100 text-blue-700' },
  in_review:       { label: 'Enviado para revisão', cls: 'bg-yellow-100 text-yellow-700' },
  revision_requested: { label: 'Revisão solicitada', cls: 'bg-purple-100 text-purple-700' },
  completed:       { label: 'Concluído',            cls: 'bg-green-100 text-green-700' },
  disputed:        { label: 'Em disputa',           cls: 'bg-red-100 text-red-700' },
};

const MILESTONE_STATUS = {
  pending:    { label: 'Pendente',   cls: 'bg-gray-100 text-gray-500' },
  in_progress:{ label: 'Em andamento', cls: 'bg-blue-100 text-blue-600' },
  submitted:  { label: 'Aguard. aprovação', cls: 'bg-yellow-100 text-yellow-700' },
  approved:   { label: 'Aprovada',   cls: 'bg-green-100 text-green-700' },
  paid:       { label: 'Paga',       cls: 'bg-emerald-100 text-emerald-700' },
  rejected:   { label: 'Revisão',    cls: 'bg-red-100 text-red-600' },
};

export default function FreelancerProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [updateOpen, setUpdateOpen] = useState(false);
  const [updateForm, setUpdateForm] = useState({ title: '', description: '', progress_pct: '', is_delivery: false, milestone_id: '' });
  const [showHistory, setShowHistory] = useState(false);

  const { data, isLoading } = useQuery(['project', id], () => projectAPI.getById(id).then(r => r.data));

  const updateMutation = useMutation(
    (payload) => projectAPI.addUpdate(id, payload),
    {
      onSuccess: () => {
        toast.success('Atualização enviada!');
        qc.invalidateQueries(['project', id]);
        setUpdateOpen(false);
        setUpdateForm({ title: '', description: '', progress_pct: '', is_delivery: false, milestone_id: '' });
      },
      onError: err => toast.error(err.response?.data?.error || 'Erro ao enviar'),
    }
  );

  if (isLoading) return (
    <div className="flex items-center justify-center h-64"><Loader2 size={32} className="animate-spin text-indigo-600" /></div>
  );

  const project = data?.project;
  if (!project) return null;

  const milestones = project.milestones?.filter(Boolean) || [];
  const updates = project.updates?.filter(Boolean) || [];
  const statusCfg = STATUS_LABEL[project.status] || { label: project.status, cls: 'bg-gray-100 text-gray-600' };
  const activeMilestone = milestones.find(m => ['pending','in_progress','rejected'].includes(m.status));
  const canSendUpdate = ['in_progress', 'revision_requested'].includes(project.status);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-gray-100">
          <ArrowLeft size={18} className="text-gray-600" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-bold text-gray-900 truncate">{project.title}</h1>
            <span className={clsx('text-xs px-2.5 py-1 rounded-full font-medium', statusCfg.cls)}>{statusCfg.label}</span>
          </div>
          <p className="text-sm text-gray-500 mt-0.5">Cliente: {project.client_name}</p>
        </div>
        <Link to={`/freelancer/projetos/${id}/chat`}
  className="relative flex items-center gap-2 border border-gray-200 text-gray-700 hover:border-indigo-300 hover:text-indigo-600 px-4 py-2 rounded-xl text-sm font-medium transition-colors">
  <MessageSquare size={15} /> Chat
  {project.unread_messages > 0 && (
    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
      {project.unread_messages}
    </span>
  )}
</Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Main */}
        <div className="lg:col-span-2 space-y-5">
          {/* Progresso */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-gray-900">Progresso geral</h2>
              <span className="text-sm font-bold text-indigo-600">{project.progress_pct || 0}%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2.5 mb-4">
              <div className="bg-indigo-500 h-2.5 rounded-full transition-all" style={{ width: `${project.progress_pct || 0}%` }} />
            </div>
            <div className="grid grid-cols-3 gap-4 text-center text-sm">
              <div>
                <p className="text-lg font-bold text-gray-900">
                  R$ {parseFloat(project.total_amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-xs text-gray-500">Valor total</p>
              </div>
              <div>
                <p className="text-lg font-bold text-blue-600">
                  R$ {parseFloat(project.amount_held || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-xs text-gray-500">Em custódia</p>
              </div>
              <div>
                <p className="text-lg font-bold text-green-600">
                  R$ {parseFloat(project.amount_released || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-xs text-gray-500">Liberado</p>
              </div>
            </div>
          </div>

          {/* Etapas */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h2 className="font-semibold text-gray-900 mb-4">Etapas do projeto</h2>
            <div className="space-y-3">
              {milestones.map((m, i) => {
                const mcfg = MILESTONE_STATUS[m.status] || MILESTONE_STATUS.pending;
                return (
                  <div key={m.id || i} className={clsx('p-4 rounded-xl border', m.status === 'rejected' ? 'border-red-200 bg-red-50' : 'border-gray-100 bg-gray-50')}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className={clsx('w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5',
                          m.status === 'paid' || m.status === 'approved' ? 'bg-green-500 text-white' : 'bg-white border-2 border-gray-300 text-gray-500')}>
                          {m.status === 'paid' || m.status === 'approved' ? <CheckCircle2 size={14} /> : i + 1}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{m.title}</p>
                          {m.description && <p className="text-xs text-gray-500 mt-0.5">{m.description}</p>}
                          {m.rejection_reason && (
                            <p className="text-xs text-red-600 mt-1 font-medium">Revisão: {m.rejection_reason}</p>
                          )}
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className={clsx('text-xs px-2 py-0.5 rounded-full font-medium', mcfg.cls)}>{mcfg.label}</span>
                        <p className="text-sm font-bold text-indigo-600 mt-1">
                          R$ {parseFloat(m.amount || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Histórico de atualizações */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <button onClick={() => setShowHistory(!showHistory)}
              className="w-full flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">Histórico de atualizações ({updates.length})</h2>
              {showHistory ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
            </button>
            {showHistory && (
              <div className="mt-4 space-y-3">
                {updates.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-4">Nenhuma atualização ainda</p>
                ) : updates.map((u, i) => (
                  <div key={u.id || i} className="border-l-2 border-indigo-200 pl-4 py-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900">{u.title || 'Atualização'}</p>
                      <span className="text-xs text-gray-400">
                        {u.created_at ? format(new Date(u.created_at), "dd/MM 'às' HH:mm", { locale: ptBR }) : ''}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-0.5">{u.description}</p>
                    {u.progress_pct && <p className="text-xs text-indigo-600 mt-1">Progresso: {u.progress_pct}%</p>}
                    {u.is_delivery && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Entrega</span>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Ações */}
          {canSendUpdate && (
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <h3 className="font-semibold text-gray-900 mb-3">Ações</h3>
              <button onClick={() => setUpdateOpen(!updateOpen)}
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-xl text-sm font-medium transition-colors">
                <Upload size={15} /> Enviar atualização
              </button>
              {updateOpen && (
                <div className="mt-4 space-y-3">
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1 block">Título</label>
                    <input
                      value={updateForm.title}
                      onChange={e => setUpdateForm(p => ({ ...p, title: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Atualização de progresso"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1 block">Descrição</label>
                    <textarea
                      value={updateForm.description}
                      onChange={e => setUpdateForm(p => ({ ...p, description: e.target.value }))}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                      placeholder="Descreva o que foi feito..."
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs font-medium text-gray-600 mb-1 block">Progresso %</label>
                      <input type="number" min="0" max="100"
                        value={updateForm.progress_pct}
                        onChange={e => setUpdateForm(p => ({ ...p, progress_pct: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="75" />
                    </div>
                    {activeMilestone && (
                      <div>
                        <label className="text-xs font-medium text-gray-600 mb-1 block">Etapa</label>
                        <select
                          value={updateForm.milestone_id}
                          onChange={e => setUpdateForm(p => ({ ...p, milestone_id: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                          <option value="">Nenhuma</option>
                          {milestones.filter(m => ['pending','in_progress','rejected'].includes(m.status)).map(m => (
                            <option key={m.id} value={m.id}>{m.title}</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={updateForm.is_delivery}
                      onChange={e => setUpdateForm(p => ({ ...p, is_delivery: e.target.checked }))}
                      className="rounded border-gray-300 text-indigo-600" />
                    <span className="text-sm text-gray-700">Marcar como entrega final</span>
                  </label>
                  <button
                    onClick={() => updateMutation.mutate(updateForm)}
                    disabled={!updateForm.description || updateMutation.isLoading}
                    className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white py-2 rounded-lg text-sm font-medium transition-colors">
                    {updateMutation.isLoading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                    Enviar
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Info */}
          <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-3 text-sm">
            <h3 className="font-semibold text-gray-900">Informações</h3>
            <div className="flex justify-between"><span className="text-gray-500">Revisões usadas</span>
              <span className="font-medium">{project.revisions_used || 0}/{project.revisions_allowed || 0}</span>
            </div>
            {project.deadline_at && (
              <div className="flex justify-between"><span className="text-gray-500">Prazo</span>
                <span className="font-medium">{format(new Date(project.deadline_at), 'dd/MM/yyyy')}</span>
              </div>
            )}
            {project.started_at && (
              <div className="flex justify-between"><span className="text-gray-500">Iniciado em</span>
                <span className="font-medium">{format(new Date(project.started_at), 'dd/MM/yyyy')}</span>
              </div>
            )}
          </div>

          {/* Abrir disputa */}
          {['in_progress','in_review','revision_requested'].includes(project.status) && (
            <Link to={`/freelancer/disputas/nova?project=${id}`}
              className="flex items-center gap-2 w-full text-center justify-center border border-red-200 text-red-600 hover:bg-red-50 py-2.5 rounded-xl text-sm font-medium transition-colors">
              <AlertTriangle size={14} /> Abrir disputa
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
