import React from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/index';
import { projectAPI, paymentAPI, proposalAPI } from '../../services/api';
import {
  TrendingUp, Clock, CheckCircle, AlertTriangle,
  Plus, ArrowRight, DollarSign, Mail, X
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import clsx from 'clsx';

const StatusBadge = ({ status }) => {
  const config = {
    in_progress: { label: 'Em andamento', cls: 'bg-blue-100 text-blue-700' },
    in_review: { label: 'Em revisão', cls: 'bg-yellow-100 text-yellow-700' },
    completed: { label: 'Concluído', cls: 'bg-green-100 text-green-700' },
    waiting_payment: { label: 'Aguard. pgto', cls: 'bg-orange-100 text-orange-700' },
    revision_requested: { label: 'Revisão solicitada', cls: 'bg-purple-100 text-purple-700' },
    disputed: { label: 'Em disputa', cls: 'bg-red-100 text-red-700' },
  };
  const c = config[status] || { label: status, cls: 'bg-gray-100 text-gray-600' };
  return <span className={clsx('text-xs px-2 py-0.5 rounded-full font-medium', c.cls)}>{c.label}</span>;
};

export default function FreelancerDashboard() {
  const { user } = useAuthStore();
  const [bannerDismissed, setBannerDismissed] = React.useState(
    localStorage.getItem('email_banner_dismissed') === 'true'
  );

  const { data: projectsData } = useQuery('my-projects', () =>
    projectAPI.getAll({ limit: 5 }).then(r => r.data)
  );

  const { data: balanceData } = useQuery('my-balance', () =>
    paymentAPI.getBalance().then(r => r.data)
  );

  const { data: proposalsData } = useQuery('my-proposals', () =>
    proposalAPI.getAll({ limit: 5 }).then(r => r.data)
  );

  const balance = balanceData?.balance || {};
  const projects = projectsData?.projects || [];
  const proposals = proposalsData?.proposals || [];

  const handleDismiss = () => {
    localStorage.setItem('email_banner_dismissed', 'true');
    setBannerDismissed(true);
  };

  const stats = [
    {
      label: 'Disponível para saque',
      value: `R$ ${parseFloat(balance.available || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      icon: DollarSign,
      color: 'text-green-600',
      bg: 'bg-green-50',
      sublabel: 'em sua carteira',
    },
    {
      label: 'Em custódia',
      value: `R$ ${parseFloat(balance.held || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      icon: Clock,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      sublabel: 'aguardando aprovação',
    },
    {
      label: 'Total ganho',
      value: `R$ ${parseFloat(balance.total_earned || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      icon: TrendingUp,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
      sublabel: 'desde o início',
    },
    {
      label: 'Projetos concluídos',
      value: user?.completed_projects || 0,
      icon: CheckCircle,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      sublabel: `trust score: ${user?.trust_score || 0}`,
    },
  ];

  const mockChartData = [
    { mes: 'Jan', ganhos: 1200 },
    { mes: 'Fev', ganhos: 1900 },
    { mes: 'Mar', ganhos: 800 },
    { mes: 'Abr', ganhos: 2400 },
    { mes: 'Mai', ganhos: 1800 },
    { mes: 'Jun', ganhos: 3100 },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">

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

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Olá, {user?.full_name?.split(' ')[0]}! 👋
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
        <Link
          to="/freelancer/propostas/nova"
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
        >
          <Plus size={16} />
          Nova Proposta
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className={clsx('w-9 h-9 rounded-lg flex items-center justify-center', s.bg)}>
                <s.icon size={18} className={s.color} />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.sublabel}</p>
            <p className="text-xs font-medium text-gray-700 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gráfico */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Ganhos dos últimos 6 meses</h2>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={mockChartData}>
              <defs>
                <linearGradient id="colorGanhos" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="mes" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false}
                tickFormatter={v => `R$${v}`} />
              <Tooltip formatter={v => [`R$ ${v.toLocaleString('pt-BR')}`, 'Ganhos']}
                contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '12px' }} />
              <Area type="monotone" dataKey="ganhos" stroke="#6366f1" strokeWidth={2}
                fill="url(#colorGanhos)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Projetos recentes */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Projetos ativos</h2>
            <Link to="/freelancer/projetos" className="text-xs text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
              Ver todos <ArrowRight size={12} />
            </Link>
          </div>
          <div className="space-y-3">
            {projects.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">Nenhum projeto ainda</p>
            ) : (
              projects.map((p) => (
                <Link
                  key={p.id}
                  to={`/freelancer/projetos/${p.id}`}
                  className="block p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium text-gray-900 truncate">{p.title}</p>
                    <StatusBadge status={p.status} />
                  </div>
                  <div className="flex items-center justify-between mt-1.5">
                    <span className="text-xs text-gray-500">{p.client_name}</span>
                    <span className="text-xs font-semibold text-indigo-600">
                      R$ {parseFloat(p.total_amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  {p.progress_pct > 0 && (
                    <div className="mt-2">
                      <div className="w-full bg-gray-100 rounded-full h-1">
                        <div className="bg-indigo-500 h-1 rounded-full" style={{ width: `${p.progress_pct}%` }} />
                      </div>
                    </div>
                  )}
                </Link>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Propostas recentes */}
      <div className="mt-6 bg-white rounded-xl border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900">Propostas enviadas</h2>
          <Link to="/freelancer/propostas" className="text-xs text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
            Ver todas <ArrowRight size={12} />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-gray-500 border-b border-gray-100">
                <th className="pb-2 text-left font-medium">Proposta</th>
                <th className="pb-2 text-left font-medium">Valor</th>
                <th className="pb-2 text-left font-medium">Prazo</th>
                <th className="pb-2 text-left font-medium">Status</th>
                <th className="pb-2 text-left font-medium">Data</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {proposals.length === 0 ? (
                <tr><td colSpan={5} className="py-4 text-center text-gray-400">Nenhuma proposta ainda</td></tr>
              ) : (
                proposals.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 font-medium text-gray-900 max-w-xs truncate">{p.title}</td>
                    <td className="py-3 text-indigo-600 font-semibold">
                      R$ {parseFloat(p.total_amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 text-gray-600">{p.deadline_days} dias</td>
                    <td className="py-3"><StatusBadge status={p.status} /></td>
                    <td className="py-3 text-gray-500">
                      {new Date(p.created_at).toLocaleDateString('pt-BR')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
