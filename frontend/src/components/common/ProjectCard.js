import React from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, Clock, ChevronRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import clsx from 'clsx';
import StatusBadge from './StatusBadge';
import Avatar from './Avatar';
import ProgressBar from './ProgressBar';

export default function ProjectCard({ project, role = 'freelancer' }) {
  const isFreelancer = role === 'freelancer';
  const basePath     = isFreelancer ? '/freelancer' : '/cliente';
  const otherName    = isFreelancer ? project.client_name : project.freelancer_name;
  const otherAvatar  = isFreelancer ? project.client_avatar : project.freelancer_avatar;
  const deadline     = project.deadline_at ? new Date(project.deadline_at) : null;
  const isLate       = deadline && deadline < new Date() && !['completed','cancelled'].includes(project.status);
  const needsAction  = !isFreelancer && project.status === 'in_review';

  return (
    <Link
      to={`${basePath}/projetos/${project.id}`}
      className={clsx(
        'block bg-white rounded-xl border p-5 hover:shadow-sm transition-all group',
        needsAction ? 'border-yellow-200' : 'border-gray-100 hover:border-indigo-200'
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <Avatar name={otherName} src={otherAvatar} size="sm" className="mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h3 className="font-semibold text-gray-900 truncate group-hover:text-indigo-600 transition-colors">
                {project.title}
              </h3>
              <StatusBadge status={project.status} />
              {isLate && <StatusBadge status="late" type="custom" />}
              {needsAction && (
                <span className="text-xs bg-yellow-500 text-white px-2 py-0.5 rounded-full font-medium">
                  Ação necessária
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500">
              {isFreelancer ? 'Cliente' : 'Freelancer'}:{' '}
              <span className="font-medium text-gray-700">{otherName}</span>
            </p>
            {project.progress_pct > 0 && (
              <div className="mt-2.5">
                <ProgressBar value={project.progress_pct} showPercent size="sm" color="indigo" />
              </div>
            )}
          </div>
        </div>

        <div className="text-right flex-shrink-0 flex flex-col items-end gap-1">
          <p className="font-bold text-indigo-600 text-sm">
            R$ {parseFloat(project.total_amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          {deadline && (
            <p className={clsx('text-xs flex items-center gap-1', isLate ? 'text-red-500' : 'text-gray-400')}>
              <Clock size={11} />
              {isLate ? 'Atrasado' : formatDistanceToNow(deadline, { locale: ptBR, addSuffix: true })}
            </p>
          )}
          {project.unread_messages > 0 && (
            <span className="flex items-center gap-1 text-xs text-indigo-600 font-medium">
              <MessageSquare size={11} /> {project.unread_messages}
            </span>
          )}
          <ChevronRight size={14} className="text-gray-300 group-hover:text-indigo-400 transition-colors mt-1" />
        </div>
      </div>
    </Link>
  );
}
