import { useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useAuthStore } from '../../store/index';
import api from '../../services/api';
import toast from 'react-hot-toast';
import {
  ArrowLeft, FileText, CheckCircle2, Clock, Pen,
  Download, Shield, AlertCircle, Loader2
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import clsx from 'clsx';

const fmt = (dt) => dt ? format(new Date(dt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR }) : '—';
const fmtBRL = (v) => parseFloat(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const STATUS_CFG = {
  draft:             { label: 'Rascunho',               cls: 'bg-gray-100 text-gray-600',    icon: Clock },
  pending_signature: { label: 'Aguardando assinaturas', cls: 'bg-yellow-100 text-yellow-700', icon: Clock },
  signed:            { label: 'Ativo — Ambos assinaram', cls: 'bg-green-100 text-green-700',  icon: CheckCircle2 },
  expired:           { label: 'Expirado',               cls: 'bg-red-100 text-red-600',       icon: AlertCircle },
  cancelled:         { label: 'Cancelado',              cls: 'bg-red-100 text-red-600',       icon: AlertCircle },
};

export default function ContractPage() {
  const { id: projectId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const qc = useQueryClient();
  const printRef = useRef(null);

  const { data, isLoading, error } = useQuery(
    ['contract', projectId],
    () => api.get(`/contracts/${projectId}`).then(r => r.data),
    { retry: 1 }
  );

  const signMutation = useMutation(
    (contractId) => api.post(`/contracts/${contractId}/sign`),
    {
      onSuccess: (res) => {
        toast.success(res.data.message);
        qc.invalidateQueries(['contract', projectId]);
      },
      onError: (err) => toast.error(err.response?.data?.error || 'Erro ao assinar'),
    }
  );

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 size={32} className="animate-spin text-indigo-600" />
    </div>
  );

  if (error || !data?.contract) return (
    <div className="p-6 max-w-3xl mx-auto text-center">
      <AlertCircle size={48} className="text-red-400 mx-auto mb-4" />
      <h2 className="text-xl font-bold text-gray-800 mb-2">Contrato não encontrado</h2>
      <p className="text-gray-500 mb-4">Este contrato ainda não foi gerado ou você não tem permissão para acessá-lo.</p>
      <button onClick={() => navigate(-1)} className="text-indigo-600 hover:underline text-sm">← Voltar</button>
    </div>
  );

  const { contract } = data;
  const c = contract.content_parsed || {};
  const statusCfg = STATUS_CFG[contract.status] || STATUS_CFG.pending_signature;
  const StatusIcon = statusCfg.icon;

  const isFreelancer = user?.id === contract.freelancer_id;
  const isClient = user?.id === contract.client_id;
  const myRole = isFreelancer ? 'freelancer' : 'client';
  const mySig = isFreelancer ? contract.freelancer_sig : contract.client_sig;
  const alreadySigned = !!mySig;

  const basePath = isFreelancer ? '/freelancer' : '/cliente';

  const milestones = Array.isArray(c.milestones) ? c.milestones.filter(Boolean) : [];

  return (
    <>
      {/* Print CSS */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #contract-print, #contract-print * { visibility: visible; }
          #contract-print { position: fixed; top: 0; left: 0; width: 100%; }
          .no-print { display: none !important; }
        }
      `}</style>

      <div className="p-4 sm:p-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6 no-print">
          <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-gray-100">
            <ArrowLeft size={18} className="text-gray-600" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-900">Contrato Digital</h1>
            <p className="text-sm text-gray-500">Projeto: {contract.project_title}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className={clsx('inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold', statusCfg.cls)}>
              <StatusIcon size={12} />
              {statusCfg.label}
            </span>
            <button onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm font-medium transition-colors">
              <Download size={15} /> Baixar PDF
            </button>
          </div>
        </div>

        {/* Contract Document */}
        <div id="contract-print" ref={printRef}
          className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">

          {/* Doc header */}
          <div className="bg-gradient-to-r from-[#0A2540] to-[#0d3060] px-8 py-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#00C896]/20 rounded-xl flex items-center justify-center">
                  <FileText size={20} className="text-[#00C896]" />
                </div>
                <div>
                  <p className="text-xs text-white/60 uppercase tracking-wider">FreelaPay · Contrato Digital</p>
                  <p className="font-bold text-lg">{c.title || contract.project_title}</p>
                </div>
              </div>
              <div className="text-right text-xs text-white/60">
                <p>Contrato #{contract.id?.slice(0, 8).toUpperCase()}</p>
                <p>Gerado em {fmt(contract.created_at)}</p>
              </div>
            </div>
          </div>

          <div className="px-8 py-7 space-y-8">

            {/* Partes */}
            <section>
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <span className="flex-1 border-t border-gray-100" />
                Partes Contratantes
                <span className="flex-1 border-t border-gray-100" />
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                  <p className="text-xs text-gray-400 font-semibold uppercase mb-2">Contratado (Freelancer)</p>
                  <p className="font-bold text-gray-900 text-lg">{contract.freelancer_name}</p>
                  <p className="text-sm text-gray-500">{contract.freelancer_email}</p>
                  {contract.freelancer_sig ? (
                    <div className="mt-3 flex items-center gap-2 text-green-700 bg-green-50 px-3 py-2 rounded-lg">
                      <CheckCircle2 size={14} className="text-green-600" />
                      <div>
                        <p className="text-xs font-bold">Assinado digitalmente</p>
                        <p className="text-xs text-green-600">{fmt(contract.freelancer_sig.timestamp)}</p>
                        <p className="text-xs text-green-600">IP: {contract.freelancer_sig.ip}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-3 flex items-center gap-2 text-yellow-700 bg-yellow-50 px-3 py-2 rounded-lg">
                      <Clock size={14} />
                      <p className="text-xs font-semibold">Assinatura pendente</p>
                    </div>
                  )}
                </div>

                <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                  <p className="text-xs text-gray-400 font-semibold uppercase mb-2">Contratante (Cliente)</p>
                  <p className="font-bold text-gray-900 text-lg">{contract.client_name}</p>
                  <p className="text-sm text-gray-500">{contract.client_email}</p>
                  {contract.client_sig ? (
                    <div className="mt-3 flex items-center gap-2 text-green-700 bg-green-50 px-3 py-2 rounded-lg">
                      <CheckCircle2 size={14} className="text-green-600" />
                      <div>
                        <p className="text-xs font-bold">Assinado digitalmente</p>
                        <p className="text-xs text-green-600">{fmt(contract.client_sig.timestamp)}</p>
                        <p className="text-xs text-green-600">IP: {contract.client_sig.ip}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-3 flex items-center gap-2 text-yellow-700 bg-yellow-50 px-3 py-2 rounded-lg">
                      <Clock size={14} />
                      <p className="text-xs font-semibold">Assinatura pendente</p>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* Objeto */}
            <section>
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <span className="flex-1 border-t border-gray-100" />
                1. Objeto do Contrato
                <span className="flex-1 border-t border-gray-100" />
              </h2>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-400 font-semibold uppercase mb-1">Descrição do serviço</p>
                  <p className="text-gray-700 text-sm leading-relaxed">{c.description || '—'}</p>
                </div>
                {c.scope_details && (
                  <div>
                    <p className="text-xs text-gray-400 font-semibold uppercase mb-1">Escopo detalhado</p>
                    <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">{c.scope_details}</p>
                  </div>
                )}
              </div>
            </section>

            {/* Valores e prazo */}
            <section>
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <span className="flex-1 border-t border-gray-100" />
                2. Valores e Prazo
                <span className="flex-1 border-t border-gray-100" />
              </h2>
              <div className="grid sm:grid-cols-3 gap-4">
                {[
                  { label: 'Valor total do serviço', value: fmtBRL(c.total_amount) },
                  { label: 'Taxa FreelaPay (5%)',    value: fmtBRL(c.platform_fee_amount) },
                  { label: 'Freelancer recebe',      value: fmtBRL(c.freelancer_receives) },
                ].map(item => (
                  <div key={item.label} className="bg-gray-50 rounded-xl p-4 border border-gray-100 text-center">
                    <p className="text-xs text-gray-400 mb-1">{item.label}</p>
                    <p className="text-lg font-extrabold text-[#0A2540]">{item.value}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 grid sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 bg-blue-50 rounded-xl p-4">
                  <Clock size={18} className="text-blue-500 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400">Prazo de entrega</p>
                    <p className="font-bold text-gray-900">{c.deadline_days} dias corridos</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-purple-50 rounded-xl p-4">
                  <FileText size={18} className="text-purple-500 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400">Revisões incluídas</p>
                    <p className="font-bold text-gray-900">{c.revisions_included} rodadas</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Etapas */}
            {milestones.length > 0 && (
              <section>
                <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <span className="flex-1 border-t border-gray-100" />
                  3. Etapas de Pagamento
                  <span className="flex-1 border-t border-gray-100" />
                </h2>
                <div className="space-y-2">
                  {milestones.map((m, i) => (
                    <div key={i} className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-xl border border-gray-100">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full bg-[#0A2540] text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                          {i + 1}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">{m.title}</p>
                          {m.description && <p className="text-xs text-gray-400">{m.description}</p>}
                        </div>
                      </div>
                      <div className="text-right ml-4 flex-shrink-0">
                        <p className="font-bold text-[#0A2540]">{fmtBRL(m.amount)}</p>
                        <p className="text-xs text-gray-400">{m.percentage}% do total</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Cláusulas */}
            {c.clauses && (
              <section>
                <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <span className="flex-1 border-t border-gray-100" />
                  4. Cláusulas e Condições
                  <span className="flex-1 border-t border-gray-100" />
                </h2>
                <div className="space-y-4">
                  {[
                    { title: 'Entrega e Prazo',          text: c.clauses.delivery },
                    { title: 'Revisões',                  text: c.clauses.revisions },
                    { title: 'Cancelamento',              text: c.clauses.cancellation },
                    { title: 'Propriedade Intelectual',   text: c.clauses.intellectual_property },
                    { title: 'Confidencialidade',         text: c.clauses.confidentiality },
                    { title: 'Mediação FreelaPay',        text: c.clauses.mediation },
                    { title: 'Legislação Aplicável',      text: c.clauses.governing_law },
                  ].filter(cl => cl.text).map((cl) => (
                    <div key={cl.title}>
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">{cl.title}</p>
                      <p className="text-sm text-gray-700 leading-relaxed">{cl.text}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Custódia FreelaPay */}
            <div className="bg-[#00C896]/8 border border-[#00C896]/20 rounded-xl p-5 flex gap-4">
              <Shield size={22} className="text-[#00C896] flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-[#0A2540] text-sm mb-1">Proteção FreelaPay — Pagamento em Custódia</p>
                <p className="text-sm text-gray-600 leading-relaxed">
                  O valor acordado ({fmtBRL(c.total_amount)}) será mantido em custódia pela FreelaPay e liberado ao
                  freelancer somente após aprovação formal da entrega pelo cliente, conforme os termos deste contrato.
                  Em caso de disputa, a mediação FreelaPay é vinculante para ambas as partes.
                </p>
              </div>
            </div>

          </div>

          {/* Footer doc */}
          <div className="border-t border-gray-100 px-8 py-4 bg-gray-50/60 text-center">
            <p className="text-xs text-gray-400">
              Documento gerado automaticamente pela plataforma FreelaPay · {fmt(contract.created_at)} · ID: {contract.id}
            </p>
          </div>
        </div>

        {/* Sign / status bar */}
        <div className="mt-6 no-print">
          {contract.status === 'signed' ? (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-5 flex items-center gap-4">
              <CheckCircle2 size={28} className="text-green-600 flex-shrink-0" />
              <div>
                <p className="font-bold text-green-900">Contrato assinado por ambas as partes</p>
                <p className="text-sm text-green-700">
                  Este contrato está oficialmente ativo desde {fmt(contract.signed_at)}.
                </p>
              </div>
            </div>
          ) : alreadySigned ? (
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 flex items-center gap-4">
              <CheckCircle2 size={24} className="text-blue-600 flex-shrink-0" />
              <div>
                <p className="font-bold text-blue-900">Você já assinou este contrato</p>
                <p className="text-sm text-blue-700">Aguardando a assinatura da outra parte.</p>
                <p className="text-xs text-blue-500 mt-1">Assinado em {fmt(mySig?.timestamp)}</p>
              </div>
            </div>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-5">
              <div className="flex items-start gap-3 mb-4">
                <Pen size={20} className="text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-yellow-900">Sua assinatura é necessária</p>
                  <p className="text-sm text-yellow-700 mt-0.5">
                    Ao assinar, você confirma que leu, entende e concorda com todos os termos deste contrato digital.
                    A assinatura será registrada com seu IP e data/hora como prova de aceite.
                  </p>
                </div>
              </div>
              <button
                onClick={() => signMutation.mutate(contract.id)}
                disabled={signMutation.isLoading}
                className="flex items-center gap-2 bg-[#0A2540] hover:bg-[#0d3060] text-white px-6 py-3 rounded-xl text-sm font-bold transition-colors disabled:opacity-60"
              >
                {signMutation.isLoading
                  ? <><Loader2 size={16} className="animate-spin" /> Registrando assinatura...</>
                  : <><Pen size={16} /> Assinar contrato digitalmente</>
                }
              </button>
            </div>
          )}
        </div>

        {/* Back link */}
        <div className="mt-4 no-print">
          <Link to={`${basePath}/projetos/${projectId}`}
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors">
            <ArrowLeft size={14} /> Voltar ao projeto
          </Link>
        </div>
      </div>
    </>
  );
}
