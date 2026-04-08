import React from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import {
  Users, FolderOpen, DollarSign, AlertTriangle,
  TrendingUp, Clock, CheckCircle, XCircle, ArrowRight,
  ShieldAlert, Download
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import clsx from 'clsx';

const StatCard = ({ icon: Icon, label, value, sub, color, bgColor }) => (
  <div className="bg-white rounded-xl border border-gray-100 p-5">
    <div className="flex items-center justify-between mb-3">
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <div className={clsx('w-9 h-9 rounded-lg flex items-center justify-center', bgColor)}>
        <Icon size={17} className={color} />
      </div>
    </div>
    <p className="text-2xl font-bold text-gray-900">{value}</p>
    {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
  </div>
);

const DisputeBadge = ({ status }) => {
  const cfg = {
    open: { label: 'Aberta', cls: 'bg-red-100 text-red-700' },
    under_review: { label: 'Em revisão', cls: 'bg-yellow-100 text-yellow-700' },
    resolved: { label: 'Resolvida', cls: 'bg-green-100 text-green-700' },
    escalated: { label: 'Escalada', cls: 'bg-orange-100 text-orange-700' },
  };
  const c = cfg[status] || { label: status, cls: 'bg-gray-100 text-gray-600' };
  return <span className={clsx('text-xs px-2 py-0.5 rounded-full font-medium', c.cls)}>{c.label}</span>;
};

export default function AdminDashboard() {
  const { data, isLoading } = useQuery('admin-dashboard', () =>
    adminAPI.getDashboard().then(r => r.data),
    { refetchInterval: 30000 }
  );

  const { data: withdrawalsData } = useQuery('pending-withdrawals', () =>
    adminAPI.getWithdrawals().then(r => r.data)
  );

  const { data: alertsData } = useQuery('fraud-alerts', () =>
    adminAPI.getFraudAlerts().then(r => r.data)
  );

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-100 p-5 h-28 animate-pulse bg-gray-50" />
          ))}
        </div>
      </div>
    );
  }

  const { users, projects, payments, disputes, charts } = data || {};

  const stats = [
    {
      icon: Users, label: 'Total usuários', bgColor: 'bg-blue-50', color: 'text-blue-600',
      value: parseInt(users?.total || 0).toLocaleString('pt-BR'),
      sub: `+${users?.new_today || 0} hoje`,
    },
    {
      icon: FolderOpen, label: 'Projetos ativos', bgColor: 'bg-indigo-50', color: 'text-indigo-600',
      value: parseInt(projects?.in_progress || 0).toLocaleString('pt-BR'),
      sub: `${projects?.total || 0} total`,
    },
    {
      icon: DollarSign, label: 'Volume (total)', bgColor: 'bg-green-50', color: 'text-green-600',
      value: `R$ ${parseFloat(payments?.total_volume || 0).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`,
      sub: `Taxas: R$ ${parseFloat(payments?.total_fees || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
    },
    {
      icon: AlertTriangle, label: 'Disputas abertas', bgColor: 'bg-red-50', color: 'text-red-600',
      value: parseInt(disputes?.open || 0),
      sub: disputes?.overdue_sla > 0 ? `⚠️ ${disputes.overdue_sla} fora do SLA` : 'Dentro do SLA',
    },
  ];

  const formatCurrency = (v) => `R$ ${parseFloat(v || 0).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Master</h1>
          <p className="text-sm text-gray-500 mt-0.5">Visão geral da plataforma</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          Atualização automática a cada 30s
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map(s => <StatCard key={s.label} {...s} />)}
      </div>

      {/* Alertas urgentes */}
      {(disputes?.overdue_sla > 0 || alertsData?.alerts?.length > 0 || withdrawalsData?.requests?.length > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          {disputes?.overdue_sla > 0 && (
            <Link to="/admin/disputas" className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-xl hover:border-red-200 transition-colors">
              <AlertTriangle size={18} className="text-red-600 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-red-900">{disputes.overdue_sla} disputas fora do SLA</p>
                <p className="text-xs text-red-600">Requer atenção imediata</p>
              </div>
              <ArrowRight size={14} className="text-red-400 ml-auto" />
            </Link>
          )}
          {alertsData?.alerts?.length > 0 && (
            <div className="flex items-center gap-3 p-4 bg-orange-50 border border-orange-100 rounded-xl">
              <ShieldAlert size={18} className="text-orange-600 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-orange-900">{alertsData.alerts.length} alertas de fraude</p>
                <p className="text-xs text-orange-600">Verificar usuários suspeitos</p>
              </div>
            </div>
          )}
          {withdrawalsData?.requests?.length > 0 && (
            <Link to="/admin/saques" className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-100 rounded-xl hover:border-blue-200 transition-colors">
              <Download size={18} className="text-blue-600 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-blue-900">{withdrawalsData.requests.length} saques pendentes</p>
                <p className="text-xs text-blue-600">Aguardando processamento</p>
              </div>
              <ArrowRight size={14} className="text-blue-400 ml-auto" />
            </Link>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Gráfico receita */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Receita da plataforma (últimos 30 dias)</h2>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={charts?.revenue || []}>
              <defs>
                <linearGradient id="colorReceita" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day"
                tickFormatter={v => new Date(v).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false}
                tickFormatter={v => `R$${v}`} />
              <Tooltip formatter={v => [formatCurrency(v), 'Receita']}
                labelFormatter={v => new Date(v).toLocaleDateString('pt-BR')}
                contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '12px' }} />
              <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2} fill="url(#colorReceita)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Projetos por status */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Status dos projetos</h2>
          <div className="space-y-3">
            {[
              { label: 'Em andamento', value: projects?.in_progress || 0, color: 'bg-blue-500', total: projects?.total },
              { label: 'Concluídos', value: projects?.completed || 0, color: 'bg-green-500', total: projects?.total },
              { label: 'Cancelados', value: projects?.cancelled || 0, color: 'bg-gray-400', total: projects?.total },
              { label: 'Em disputa', value: projects?.disputed || 0, color: 'bg-red-500', total: projects?.total },
            ].map(item => {
              const pct = item.total > 0 ? (item.value / item.total) * 100 : 0;
              return (
                <div key={item.label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">{item.label}</span>
                    <span className="font-semibold text-gray-900">{item.value}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className={clsx('h-2 rounded-full transition-all', item.color)} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-5 pt-4 border-t border-gray-100">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Em custódia</span>
              <span className="font-bold text-indigo-600">{formatCurrency(payments?.held_amount)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Métricas de usuários */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Usuários</h2>
            <Link to="/admin/usuarios" className="text-xs text-indigo-600 flex items-center gap-1 hover:text-indigo-700">
              Gerenciar <ArrowRight size={12} />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Freelancers', value: users?.freelancers || 0, icon: '🧑‍💻' },
              { label: 'Clientes', value: users?.clients || 0, icon: '👥' },
              { label: 'Novos hoje', value: users?.new_today || 0, icon: '🆕' },
              { label: 'Suspensos', value: users?.suspended || 0, icon: '⚠️' },
            ].map(item => (
              <div key={item.label} className="bg-gray-50 rounded-xl p-3 text-center">
                <p className="text-xl mb-1">{item.icon}</p>
                <p className="text-xl font-bold text-gray-900">{parseInt(item.value).toLocaleString('pt-BR')}</p>
                <p className="text-xs text-gray-500">{item.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Disputas recentes */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Disputas recentes</h2>
            <Link to="/admin/disputas" className="text-xs text-indigo-600 flex items-center gap-1 hover:text-indigo-700">
              Ver todas <ArrowRight size={12} />
            </Link>
          </div>
          <div className="space-y-2.5">
            {[
              { label: 'Abertas', value: disputes?.open || 0, status: 'open' },
              { label: 'Em análise', value: disputes?.under_review || 0, status: 'under_review' },
              { label: 'Resolvidas', value: disputes?.resolved || 0, status: 'resolved' },
            ].map(d => (
              <div key={d.label} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div className="flex items-center gap-2">
                  <DisputeBadge status={d.status} />
                </div>
                <span className="font-bold text-gray-900">{d.value}</span>
              </div>
            ))}

            {disputes?.overdue_sla > 0 && (
              <div className="mt-2 flex items-center gap-2 bg-red-50 p-3 rounded-lg">
                <AlertTriangle size={13} className="text-red-500" />
                <p className="text-xs text-red-700">
                  <strong>{disputes.overdue_sla}</strong> disputas fora do SLA de 7 dias
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
