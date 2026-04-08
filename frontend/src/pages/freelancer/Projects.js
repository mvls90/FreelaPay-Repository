import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { projectAPI } from '../../services/api';
import { FolderOpen, MessageSquare, Clock, ChevronRight, Search } from 'lucide-react';
import clsx from 'clsx';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const STATUS_CONFIG = {
  waiting_payment: { label: 'Aguard. pagamento', cls: 'bg-orange-100 text-orange-700' },
  in_progress:     { label: 'Em andamento',      cls: 'bg-blue-100 text-blue-700' },
  in_review:       { label: 'Em revisão',         cls: 'bg-yellow-100 text-yellow-700' },
  revision_requested: { label: 'Revisão solicitada', cls: 'bg-purple-100 text-purple-700' },
  completed:       { label: 'Concluído',          cls: 'bg-green-100 text-green-700' },
  cancelled:       { label: 'Cancelado',          cls: 'bg-gray-100 text-gray-500' },
  disputed:        { label: 'Em disputa',         cls: 'bg-red-100 text-red-700' },
};

const FILTERS = [
  { value: '', label: 'Todos' },
  { value: 'in_progress', label: 'Em andamento' },
  { value: 'in_review', label: 'Em revisão' },
  { value: 'completed', label: 'Concluídos' },
  { value: 'disputed', label: 'Disputas' },
];

export default function FreelancerProjects() {
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery(
    ['projects', status],
    () => projectAPI.getAll({ status, limit: 50 }).then(r => r.data),
    { keepPreviousData: true }
  );

  const projects = (data?.projects || []).filter(p =>
    !search || p.title.toLowerCase().includes(search.toLowerCase()) || p.client_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Meus Projetos</h1>
          <p className="text-sm text-gray-500 mt-0.5">{data?.pagination?.total || 0} projetos no total</p>
        </div>
        <Link to="/freelancer/propostas/nova"
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors">
          + Nova proposta
        </Link>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Buscar projeto ou cliente..."
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {FILTERS.map(f => (
            <button key={f.value} onClick={() => setStatus(f.value)}
              className={clsx('px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all',
                status === f.value ? 'bg-indigo-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300')}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Lista */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-100 p-5 h-24 animate-pulse" />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <FolderOpen size={40} className="text-gray-300 mx-auto mb-3" />
          <p className="font-medium text-gray-500">Nenhum projeto encontrado</p>
          <p className="text-sm text-gray-400 mt-1">Crie uma proposta para começar</p>
        </div>
      ) : (
        <div className="space-y-3">
          {projects.map(project => {
            const cfg = STATUS_CONFIG[project.status] || { label: project.status, cls: 'bg-gray-100 text-gray-600' };
            const deadline = project.deadline_at ? new Date(project.deadline_at) : null;
            const isLate = deadline && deadline < new Date() && !['completed','cancelled'].includes(project.status);

            return (
              <Link key={project.id} to={`/freelancer/projetos/${project.id}`}
                className="block bg-white rounded-xl border border-gray-100 p-5 hover:border-indigo-200 hover:shadow-sm transition-all group">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="font-semibold text-gray-900 truncate group-hover:text-indigo-600 transition-colors">
                        {project.title}
                      </h3>
                      <span className={clsx('text-xs px-2 py-0.5 rounded-full font-medium', cfg.cls)}>{cfg.label}</span>
                      {isLate && <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium">Atrasado</span>}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>Cliente: <span className="text-gray-700 font-medium">{project.client_name}</span></span>
                      {project.unread_messages > 0 && (
                        <span className="flex items-center gap-1 text-indigo-600 font-medium">
                          <MessageSquare size={13} /> {project.unread_messages} nova{project.unread_messages > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                    {project.progress_pct > 0 && (
                      <div className="mt-2.5 flex items-center gap-2">
                        <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                          <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: `${project.progress_pct}%` }} />
                        </div>
                        <span className="text-xs text-gray-400">{project.progress_pct}%</span>
                      </div>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-indigo-600">
                      R$ {parseFloat(project.total_amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                    {deadline && (
                      <p className={clsx('text-xs mt-1 flex items-center gap-1 justify-end', isLate ? 'text-red-500' : 'text-gray-400')}>
                        <Clock size={11} />
                        {isLate ? 'Atrasado' : formatDistanceToNow(deadline, { locale: ptBR, addSuffix: true })}
                      </p>
                    )}
                    <ChevronRight size={16} className="text-gray-300 mt-1 ml-auto group-hover:text-indigo-400 transition-colors" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
