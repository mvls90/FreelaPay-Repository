import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation } from 'react-query';
import { projectAPI, paymentAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { Shield, Loader2, Lock, ExternalLink } from 'lucide-react';

export default function ClientPayment() {
  const { id: projectId } = useParams();
  const [loading, setLoading] = useState(false);

  const { data: projectData, isLoading } = useQuery(
    ['project', projectId],
    () => projectAPI.getById(projectId).then(r => r.data)
  );

  const payMutation = useMutation(
    () => paymentAPI.initiate(projectId, {}),
    {
      onSuccess: (res) => {
        const url = res.data.sandbox_url || res.data.checkout_url;
        if (url) window.location.href = url;
        else toast.error('Erro ao obter URL de pagamento');
      },
      onError: (err) => {
        toast.error(err.response?.data?.error || 'Erro ao processar pagamento');
        setLoading(false);
      },
    }
  );

  if (isLoading) return <div className="flex items-center justify-center h-64"><Loader2 size={32} className="animate-spin text-indigo-600" /></div>;
  const project = projectData?.project;
  if (!project) return null;

  return (
    <div className="p-6 max-w-xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 bg-green-100 rounded-xl flex items-center justify-center">
          <Lock size={17} className="text-green-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Pagamento seguro</h1>
          <p className="text-xs text-gray-500">Protegido pelo Mercado Pago</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="font-semibold text-gray-900">{project.title}</p>
            <p className="text-sm text-gray-500 mt-0.5">Freelancer: {project.freelancer_name}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-indigo-600">
              R$ {parseFloat(project.total_amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-gray-100 flex items-start gap-2">
          <Shield size={14} className="text-green-600 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-gray-500">Valor em custódia. Liberado ao freelancer somente após sua aprovação.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Formas de pagamento</h3>
        <div className="grid grid-cols-3 gap-3 text-center">
          {[['📱','PIX','Imediato'],['💳','Cartão','Até 12x'],['🏦','Boleto','1-3 dias']].map(([icon,label,desc]) => (
            <div key={label} className="p-3 bg-gray-50 rounded-xl">
              <p className="text-xl mb-1">{icon}</p>
              <p className="text-xs font-medium text-gray-700">{label}</p>
              <p className="text-xs text-gray-400">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={() => { setLoading(true); payMutation.mutate(); }}
        disabled={loading || payMutation.isLoading}
        className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white py-4 rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2"
      >
        {loading || payMutation.isLoading
          ? <><Loader2 size={16} className="animate-spin" /> Aguarde...</>
          : <><ExternalLink size={15} /> Pagar com Mercado Pago</>
        }
      </button>
      <p className="text-xs text-center text-gray-400 mt-3">Você será redirecionado para o ambiente seguro do Mercado Pago</p>
    </div>
  );
}
