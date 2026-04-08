import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Copy, Check, ExternalLink, Calendar, RotateCcw, DollarSign } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import toast from 'react-hot-toast';
import clsx from 'clsx';
import StatusBadge from './StatusBadge';

export default function ProposalCard({ proposal }) {
  const [copied, setCopied] = useState(false);

  const copyLink = async (e) => {
    e.preventDefault();
    const url = `${window.location.origin}/proposta/${proposal.unique_link}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success('Link copiado!');
    setTimeout(() => setCopied(false), 3000);
  };

  const canCopy = ['sent', 'viewed'].includes(proposal.status);

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 hover:border-indigo-200 hover:shadow-sm transition-all">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <h3 className="font-semibold text-gray-900 truncate">{proposal.title}</h3>
            <StatusBadge status={proposal.status} type="proposal" />
          </div>

          <div className="flex flex-wrap gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <DollarSign size={13} />
              <span className="font-semibold text-indigo-600">
                R$ {parseFloat(proposal.total_amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </span>
            <span className="flex items-center gap-1">
              <Calendar size={13} />
              {proposal.deadline_days} dias
            </span>
            <span className="flex items-center gap-1">
              <RotateCcw size={13} />
              {proposal.revisions_included || 0} revisões
            </span>
          </div>

          {proposal.client_name && (
            <p className="text-xs text-gray-400 mt-1.5">Cliente: {proposal.client_name}</p>
          )}

          <p className="text-xs text-gray-400 mt-1">
            Criada em {format(new Date(proposal.created_at), "dd 'de' MMMM", { locale: ptBR })}
          </p>
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          {canCopy && (
            <>
              <button
                onClick={copyLink}
                title="Copiar link"
                className="p-2 rounded-lg hover:bg-indigo-50 text-gray-400 hover:text-indigo-600 transition-colors"
              >
                {copied ? <Check size={15} className="text-green-600" /> : <Copy size={15} />}
              </button>
              <a
                href={`/proposta/${proposal.unique_link}`}
                target="_blank"
                rel="noreferrer"
                title="Abrir proposta"
                className="p-2 rounded-lg hover:bg-indigo-50 text-gray-400 hover:text-indigo-600 transition-colors"
              >
                <ExternalLink size={15} />
              </a>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
