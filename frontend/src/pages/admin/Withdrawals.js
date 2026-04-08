import React from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { Check, X, Download } from 'lucide-react';
import { format } from 'date-fns';

export default function AdminWithdrawals() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery('withdrawals', () => adminAPI.getWithdrawals().then(r=>r.data));
  const processMutation = useMutation(({id,status}) => adminAPI.processWithdrawal(id,{status}), {
    onSuccess: (_, {status}) => { toast.success(status==='approved'?'Saque aprovado!':'Saque recusado'); qc.invalidateQueries('withdrawals'); },
    onError: () => toast.error('Erro'),
  });
  const requests = data?.requests || [];
  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6"><h1 className="text-2xl font-bold text-gray-900">Saques pendentes</h1><p className="text-sm text-gray-500">{requests.length} aguardando</p></div>
      {isLoading ? <div className="space-y-3">{[...Array(3)].map((_,i)=><div key={i} className="bg-white rounded-xl border border-gray-100 h-20 animate-pulse"/>)}</div>
      : requests.length===0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <Download size={40} className="text-gray-300 mx-auto mb-3"/><p className="text-gray-500">Nenhum saque pendente</p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map(r=>(
            <div key={r.id} className="bg-white rounded-xl border border-gray-100 p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-gray-900">{r.full_name}</p>
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">{r.method}</span>
                  </div>
                  <p className="text-sm text-gray-500">{r.email}</p>
                  {r.bank_info?.pix_key&&<p className="text-xs text-gray-400 mt-0.5">PIX: {r.bank_info.pix_key}</p>}
                  <p className="text-xs text-gray-400 mt-1">Solicitado: {format(new Date(r.created_at),'dd/MM/yy HH:mm')}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-indigo-600">R$ {parseFloat(r.amount).toLocaleString('pt-BR',{minimumFractionDigits:2})}</p>
                  <p className="text-xs text-gray-400 mt-0.5">Saldo atual: R$ {parseFloat(r.current_balance||0).toLocaleString('pt-BR',{minimumFractionDigits:2})}</p>
                  <div className="flex gap-2 mt-3 justify-end">
                    <button onClick={()=>processMutation.mutate({id:r.id,status:'rejected'})}
                      className="flex items-center gap-1.5 border border-red-200 text-red-600 hover:bg-red-50 px-3 py-2 rounded-xl text-sm font-medium transition-colors">
                      <X size={13}/> Recusar
                    </button>
                    <button onClick={()=>processMutation.mutate({id:r.id,status:'approved'})}
                      className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-xl text-sm font-medium transition-colors">
                      <Check size={13}/> Aprovar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
