import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { proposalAPI } from '../../services/api';
import { Plus, Copy, Check, ExternalLink, FileText } from 'lucide-react';
import clsx from 'clsx';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import toast from 'react-hot-toast';

const STATUS_CFG = {
  draft:    { label: 'Rascunho',   cls: 'bg-gray-100 text-gray-500' },
  sent:     { label: 'Enviada',    cls: 'bg-blue-100 text-blue-700' },
  viewed:   { label: 'Visualizada', cls: 'bg-yellow-100 text-yellow-700' },
  accepted: { label: 'Aceita',     cls: 'bg-green-100 text-green-700' },
  rejected: { label: 'Recusada',   cls: 'bg-red-100 text-red-600' },
  expired:  { label: 'Expirada',   cls: 'bg-gray-100 text-gray-400' },
};

const FILTERS = [
  { value: '', label: 'Todas' },
  { value: 'sent', label: 'Enviadas' },
  { value: 'viewed', label: 'Visualizadas' },
  { value: 'accepted', label: 'Aceitas' },
  { value: 'rejected', label: 'Recusadas' },
];

export default function FreelancerProposals() {
  const [status, setStatus] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  const { data, isLoading } = useQuery(
    ['proposals', status],
    () => proposalAPI.getAll({ status, limit: 50 }).then(r => r.data),
    { keepPreviousData: true }
  );

  const proposals = data?.proposals || [];

  const copyLink = async (link, id) => {
    const url = `${window.location.origin}/proposta/${link}`;
    await navigator.clipboard.writeText(url);
    setCopiedId(id);
    toast.success('Link copiado!');
    setTimeout(() => setCopiedId(null), 3000);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Propostas</h1>
          <p className="text-sm text-gray-500 mt-0.5">{proposals.length} proposta(s)</p>
        </div>
        <Link to="/freelancer/propostas/nova"
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors">
          <Plus size={16} /> Nova proposta
        </Link>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 overflow-x-auto pb-1 mb-5">
        {FILTERS.map(f => (
          <button key={f.value} onClick={() => setStatus(f.value)}
            className={clsx('px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all',
              status === f.value ? 'bg-indigo-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300')}>
            {f.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => <div key={i} className="bg-white rounded-xl border border-gray-100 h-20 animate-pulse" />)}
        </div>
      ) : proposals.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <FileText size={40} className="text-gray-300 mx-auto mb-3" />
          <p className="font-medium text-gray-500">Nenhuma proposta ainda</p>
          <Link to="/freelancer/propostas/nova" className="text-sm text-indigo-600 mt-2 inline-block hover:underline">
            Criar primeira proposta
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Proposta</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Valor</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Prazo</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Criada</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Link</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {proposals.map(p => {
                const cfg = STATUS_CFG[p.status] || STATUS_CFG.draft;
                return (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4">
                      <p className="font-medium text-gray-900 max-w-xs truncate">{p.title}</p>
                      {p.client_name && <p className="text-xs text-gray-400 mt-0.5">Cliente: {p.client_name}</p>}
                    </td>
                    <td className="px-5 py-4 font-semibold text-indigo-600 whitespace-nowrap">
                      R$ {parseFloat(p.total_amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-5 py-4 text-gray-600 hidden sm:table-cell">{p.deadline_days}d</td>
                    <td className="px-5 py-4">
                      <span className={clsx('text-xs px-2.5 py-1 rounded-full font-medium', cfg.cls)}>{cfg.label}</span>
                    </td>
                    <td className="px-5 py-4 text-gray-400 hidden md:table-cell">
                      {format(new Date(p.created_at), 'dd/MM/yy', { locale: ptBR })}
                    </td>
                    <td className="px-5 py-4">
                      {['sent','viewed'].includes(p.status) && (
                        <div className="flex items-center gap-2">
                          <button onClick={() => copyLink(p.unique_link, p.id)}
                            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-indigo-600 transition-colors"
                            title="Copiar link">
                            {copiedId === p.id ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
                          </button>
                          <a href={`/proposta/${p.unique_link}`} target="_blank" rel="noreferrer"
                            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-indigo-600 transition-colors"
                            title="Abrir proposta">
                            <ExternalLink size={14} />
                          </a>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
