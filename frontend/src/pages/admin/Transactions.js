import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { adminAPI } from '../../services/api';
import clsx from 'clsx';
import { format } from 'date-fns';

const STATUS_CFG = { pending:{label:'Pendente',cls:'bg-yellow-100 text-yellow-700'}, held:{label:'Em custódia',cls:'bg-blue-100 text-blue-700'}, released:{label:'Liberado',cls:'bg-green-100 text-green-700'}, cancelled:{label:'Cancelado',cls:'bg-gray-100 text-gray-500'}, refunded:{label:'Estornado',cls:'bg-red-100 text-red-600'} };

export default function AdminTransactions() {
  const [status, setStatus] = useState('');
  const { data, isLoading } = useQuery(['admin-txs',status], () => adminAPI.getTransactions({status}).then(r=>r.data), {keepPreviousData:true});
  const txs = data?.transactions || [];
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6"><h1 className="text-2xl font-bold text-gray-900">Transações</h1></div>
      <div className="flex gap-2 mb-5">
        {[['','Todas'],['held','Em custódia'],['released','Liberadas'],['pending','Pendentes'],['cancelled','Canceladas']].map(([v,l])=>(
          <button key={v} onClick={()=>setStatus(v)} className={clsx('px-4 py-2 rounded-xl text-sm font-medium transition-all',status===v?'bg-indigo-600 text-white':'bg-white border border-gray-200 text-gray-600 hover:border-gray-300')}>{l}</button>
        ))}
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-gray-100 bg-gray-50">{['Projeto','Pagador','Recebedor','Valor','Taxa','Método','Status','Data'].map(h=><th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>)}</tr></thead>
          <tbody className="divide-y divide-gray-50">
            {isLoading?<tr><td colSpan={8} className="px-4 py-8 text-center text-gray-400">Carregando...</td></tr>
            :txs.map(t=>{ const scfg=STATUS_CFG[t.status]||STATUS_CFG.pending; return (
              <tr key={t.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900 max-w-xs truncate">{t.project_title}</td>
                <td className="px-4 py-3 text-gray-600">{t.payer_name}</td>
                <td className="px-4 py-3 text-gray-600">{t.payee_name}</td>
                <td className="px-4 py-3 font-bold text-indigo-600">R$ {parseFloat(t.amount).toLocaleString('pt-BR',{minimumFractionDigits:2})}</td>
                <td className="px-4 py-3 text-gray-500">R$ {parseFloat(t.platform_fee||0).toLocaleString('pt-BR',{minimumFractionDigits:2})}</td>
                <td className="px-4 py-3 text-gray-500">{t.method||'—'}</td>
                <td className="px-4 py-3"><span className={clsx('text-xs px-2 py-0.5 rounded-full font-medium',scfg.cls)}>{scfg.label}</span></td>
                <td className="px-4 py-3 text-gray-400 text-xs">{format(new Date(t.created_at),'dd/MM/yy HH:mm')}</td>
              </tr>
            );})}
          </tbody>
        </table>
      </div>
    </div>
  );
}
