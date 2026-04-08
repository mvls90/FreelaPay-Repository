// src/components/common/StatusBadge.js
import React from 'react';
import clsx from 'clsx';

const PROJECT_STATUS = {
  waiting_payment:    { label: 'Aguard. pagamento',  cls: 'bg-orange-100 text-orange-700' },
  in_progress:        { label: 'Em andamento',       cls: 'bg-blue-100 text-blue-700' },
  in_review:          { label: 'Em revisão',         cls: 'bg-yellow-100 text-yellow-700' },
  revision_requested: { label: 'Revisão solicitada', cls: 'bg-purple-100 text-purple-700' },
  completed:          { label: 'Concluído',           cls: 'bg-green-100 text-green-700' },
  cancelled:          { label: 'Cancelado',           cls: 'bg-gray-100 text-gray-500' },
  disputed:           { label: 'Em disputa',          cls: 'bg-red-100 text-red-700' },
};

const PROPOSAL_STATUS = {
  draft:    { label: 'Rascunho',    cls: 'bg-gray-100 text-gray-500' },
  sent:     { label: 'Enviada',     cls: 'bg-blue-100 text-blue-700' },
  viewed:   { label: 'Visualizada', cls: 'bg-yellow-100 text-yellow-700' },
  accepted: { label: 'Aceita',      cls: 'bg-green-100 text-green-700' },
  rejected: { label: 'Recusada',    cls: 'bg-red-100 text-red-600' },
  expired:  { label: 'Expirada',    cls: 'bg-gray-100 text-gray-400' },
};

const USER_STATUS = {
  active:    { label: 'Ativo',    cls: 'bg-green-100 text-green-700' },
  pending:   { label: 'Pendente', cls: 'bg-yellow-100 text-yellow-700' },
  suspended: { label: 'Suspenso', cls: 'bg-orange-100 text-orange-700' },
  banned:    { label: 'Banido',   cls: 'bg-red-100 text-red-700' },
};

const MAPS = { project: PROJECT_STATUS, proposal: PROPOSAL_STATUS, user: USER_STATUS };

export default function StatusBadge({ status, type = 'project', size = 'sm' }) {
  const map = MAPS[type] || MAPS.project;
  const cfg = map[status] || { label: status, cls: 'bg-gray-100 text-gray-600' };
  return (
    <span className={clsx(
      'inline-flex items-center rounded-full font-medium',
      size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1',
      cfg.cls
    )}>
      {cfg.label}
    </span>
  );
}
