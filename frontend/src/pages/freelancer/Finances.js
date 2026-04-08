import React, { useState } from 'react';
import { useQuery, useMutation } from 'react-query';
import { paymentAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { DollarSign, TrendingUp, Clock, Download, Loader2, ArrowDownCircle } from 'lucide-react';
import clsx from 'clsx';

export default function FreelancerFinances() {
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [withdrawForm, setWithdrawForm] = useState({ amount: '', method: 'pix', pix_key: '' });

  const { data, refetch } = useQuery('balance', () => paymentAPI.getBalance().then(r => r.data));
  const balance = data?.balance || {};

  const withdrawMutation = useMutation(
    () => paymentAPI.requestWithdrawal({
      amount: parseFloat(withdrawForm.amount),
      method: withdrawForm.method,
      bank_info: { pix_key: withdrawForm.pix_key },
    }),
    {
      onSuccess: () => {
        toast.success('Solicitação de saque enviada!');
        setShowWithdraw(false);
        refetch();
      },
      onError: err => toast.error(err.response?.data?.error || 'Erro ao solicitar saque'),
    }
  );

  const cards = [
    {
      label: 'Disponível para saque',
      value: `R$ ${parseFloat(balance.available || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      icon: DollarSign,
      bg: 'bg-green-50',
      color: 'text-green-600',
      desc: 'Pode sacar agora',
    },
    {
      label: 'Em custódia',
      value: `R$ ${parseFloat(balance.held || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      icon: Clock,
      bg: 'bg-blue-50',
      color: 'text-blue-600',
      desc: 'Aguardando aprovação do cliente',
    },
    {
      label: 'Total ganho',
      value: `R$ ${parseFloat(balance.total_earned || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      icon: TrendingUp,
      bg: 'bg-indigo-50',
      color: 'text-indigo-600',
      desc: 'Desde que entrou na plataforma',
    },
    {
      label: 'Total sacado',
      value: `R$ ${parseFloat(balance.total_withdrawn || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      icon: ArrowDownCircle,
      bg: 'bg-purple-50',
      color: 'text-purple-600',
      desc: 'Transferido para sua conta',
    },
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Financeiro</h1>
          <p className="text-sm text-gray-500 mt-0.5">Seu saldo e histórico de pagamentos</p>
        </div>
        <button
          onClick={() => setShowWithdraw(true)}
          disabled={parseFloat(balance.available || 0) < 50}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors">
          <Download size={15} /> Solicitar saque
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {cards.map(c => (
          <div key={c.label} className="bg-white rounded-xl border border-gray-100 p-5">
            <div className={clsx('w-9 h-9 rounded-lg flex items-center justify-center mb-3', c.bg)}>
              <c.icon size={18} className={c.color} />
            </div>
            <p className="text-xl font-bold text-gray-900">{c.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{c.desc}</p>
            <p className="text-xs font-medium text-gray-700 mt-1">{c.label}</p>
          </div>
        ))}
      </div>

      {/* Info sobre saques */}
      <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 mb-6">
        <p className="text-sm text-indigo-800 font-medium">Como funciona o saque?</p>
        <p className="text-xs text-indigo-700 mt-1">
          Valor mínimo: <strong>R$ 50,00</strong>. Processamento em até <strong>1 dia útil</strong>.
          O saldo disponível é liberado após o cliente aprovar cada etapa do projeto.
        </p>
      </div>

      {/* Modal de saque */}
      {showWithdraw && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 text-lg">Solicitar saque</h3>
              <button onClick={() => setShowWithdraw(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>

            <div className="bg-green-50 rounded-xl p-3 mb-4">
              <p className="text-xs text-green-700 font-medium">Saldo disponível</p>
              <p className="text-2xl font-bold text-green-800">
                R$ {parseFloat(balance.available || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Valor para sacar (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  min="50"
                  max={parseFloat(balance.available || 0)}
                  value={withdrawForm.amount}
                  onChange={e => setWithdrawForm(p => ({ ...p, amount: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Mínimo R$ 50,00"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Método</label>
                <select value={withdrawForm.method} onChange={e => setWithdrawForm(p => ({ ...p, method: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <option value="pix">PIX</option>
                  <option value="bank_transfer">Transferência bancária</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  {withdrawForm.method === 'pix' ? 'Chave PIX' : 'Dados bancários'}
                </label>
                <input
                  value={withdrawForm.pix_key}
                  onChange={e => setWithdrawForm(p => ({ ...p, pix_key: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder={withdrawForm.method === 'pix' ? 'CPF, e-mail, telefone ou chave aleatória' : 'Ag. / Conta'}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowWithdraw(false)}
                className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50">
                Cancelar
              </button>
              <button
                onClick={() => withdrawMutation.mutate()}
                disabled={!withdrawForm.amount || !withdrawForm.pix_key || withdrawMutation.isLoading}
                className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2">
                {withdrawMutation.isLoading ? <Loader2 size={14} className="animate-spin" /> : null}
                Confirmar saque
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
