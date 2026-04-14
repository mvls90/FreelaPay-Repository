import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { projectAPI } from '../../services/api';
import { useAuthStore } from '../../store/index';
import { FolderOpen, Clock, CheckCircle, AlertTriangle, ArrowRight, Mail, X } from 'lucide-react';
import clsx from 'clsx';

const STATUS_CFG = {
  waiting_payment:    { label: 'Aguard. pagamento',  cls: 'bg-orange-100 text-orange-700' },
  in_progress:        { label: 'Em andamento',       cls: 'bg-blue-100 text-blue-700' },
  in_review:          { label: 'Aguard. revisão',    cls: 'bg-yellow-100 text-yellow-700' },
  revision_requested: { label: 'Revisão solicitada', cls: 'bg-purple-100 text-purple-700' },
  completed:          { label: 'Concluído',           cls: 'bg-green-100 text-green-700' },
  disputed:           { label: 'Em disputa',          cls: 'bg-red-100 text-red-700' },
};

export default function ClientDashboard() {
  const { user } = useAuthStore();
  const [bannerDismissed, setBannerDismissed] = React.useState(
    localStorage.getItem('email_banner_dismissed') === 'true'
  );

  const handleDismiss = () => {
    localStorage.setItem('email_banner_dismissed', 'true');
    setBannerDismissed(true);
  };

  const { data } = useQuery('client-projects', () => projectAPI.getAll({ limit: 20 }).then(r => r.data));
  const projects = data?.projects || [];

  const stats = {
    total: projects.length,
    active: projects.filter(p => ['in_progress','in_review','revision_requested'].includes(p.status)).length,
    completed: projects.filter(p => p.status === 'completed').length,
    pending_review: projects.filter(p => p.status === 'in_review').length,
  };

  const totalSpent = projects.filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + parseFloat(p.total_amount || 0), 0);

  return (
    <div className="p-6 max-w-5xl mx-auto">

      {/* Banner verificação de e-mail */}
      {!user?.email_verified && !bannerDismissed && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Mail size={18} className="text-amber-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-amber-900">Verifique seu e-mail</p>
              <p className="text-xs text-amber-700 mt-0.5">
                Enviamos um link de verificação para <strong>{user?.email}</strong>. Verifique sua caixa de entrada e spam.
              </p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="text-amber-500 hover:text-amber-700 flex-shrink-0"
          >
            <X size={18} />
          </button>
        </div>
      )}

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Olá, {user?.full_name?.split(' ')[0]}! 👋</h1>
        <p className="text-gray-500 text-sm mt-0.5">Acompanhe seus projetos contratados</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { icon: FolderOpen, label: 'Total de projetos', value: stats.total, bg: 'bg-indigo-50', color: 'text-indigo-600' },
          { icon: Clock, label: 'Em andamento', value: stats.active, bg: 'bg-blue-50', color: 'text-blue-600' },
          { icon: CheckCircle, label: 'Concluídos', value: stats.completed, bg: 'bg-green-50', color: 'text-green-600' },
          { icon: AlertTriangle, label: 'Aguard. aprovação', value: stats.pending_review, bg: 'bg-yellow-50', color: 'text-yellow-600' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-5">
            <div className={clsx('w-9 h-9 rounded-lg flex items-center justify-center mb-3', s.bg)}>
              <s.icon size={17} className={s.color} />
            </div>
            <p className="text-2xl font-bold text-gray-900">{s.value}</p>
            <p className="text-xs font-medium text-gray-600 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {stats.pending_review > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} className="text-yellow-600" />
            <p className="text-sm font-semibold text-yellow-900">
              {stats.pending_review} projeto{stats.pending_review > 1 ? 's' : ''} aguardando sua aprovação
            </p>
          </div>
          <Link to="/cliente/projetos" className="text-xs text-yellow-700 font-medium hover:underline flex items-center gap-1">
            Revisar <ArrowRight size={12} />
          </Link>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Projetos recentes</h2>
          <Link to="/cliente/projetos" className="text-xs text-indigo-600 flex items-center gap-1 hover:text-indigo-700">
            Ver todos <ArrowRight size={12} />
          </Link>
        </div>
        {projects.length === 0 ? (
          <div className="p-12 text-center">
            <FolderOpen size={36} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">Nenhum projeto ainda</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {projects.slice(0, 8).map(p => {
              const cfg = STATUS_CFG[p.status] || { label: p.status, cls: 'bg-gray-100 text-gray-600' };
              return (
                <Link key={p.id} to={`/cliente/projetos/${p.id}`}
                  className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors group">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-gray-900 truncate group-hover:text-indigo-600 transition-colors">{p.title}</p>
                      <span className={clsx('text-xs px-2 py-0.5 rounded-full font-medium', cfg.cls)}>{cfg.label}</span>
                    </div>
                    <p className="text-xs text-gray-500">Freelancer: {p.freelancer_name}</p>
                  </div>
                  <div className="text-right ml-4 flex-shrink-0">
                    <p className="font-semibold text-indigo-600 text-sm">
                      R$ {parseFloat(p.total_amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                    {p.status === 'in_review' && <p className="text-xs text-yellow-600 font-medium mt-0.5">Ação necessária</p>}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
        {totalSpent > 0 && (
          <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex justify-between">
            <span className="text-xs text-gray-500">Total investido</span>
            <span className="text-sm font-bold text-gray-800">R$ {totalSpent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
          </div>
        )}
      </div>
    </div>
  );
}
