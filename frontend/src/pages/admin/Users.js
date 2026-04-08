import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { Search, CheckCircle, UserX, Ban } from 'lucide-react';
import clsx from 'clsx';
import { format } from 'date-fns';

const STATUS_CFG = { active:{label:'Ativo',cls:'bg-green-100 text-green-700'}, pending:{label:'Pendente',cls:'bg-yellow-100 text-yellow-700'}, suspended:{label:'Suspenso',cls:'bg-orange-100 text-orange-700'}, banned:{label:'Banido',cls:'bg-red-100 text-red-700'} };

export default function AdminUsers() {
  const [search, setSearch] = useState(''); const [type, setType] = useState(''); const [confirm, setConfirm] = useState(null);
  const qc = useQueryClient();
  const { data, isLoading } = useQuery(['admin-users',search,type], () => adminAPI.getUsers({search,type,limit:50}).then(r=>r.data), {keepPreviousData:true});
  const statusMutation = useMutation(({id,status}) => adminAPI.updateUserStatus(id,{status}), {
    onSuccess: () => { toast.success('Atualizado!'); qc.invalidateQueries('admin-users'); setConfirm(null); },
    onError: () => toast.error('Erro'),
  });
  const users = data?.users || [];
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6"><h1 className="text-2xl font-bold text-gray-900">Usuários</h1><p className="text-sm text-gray-500">{data?.pagination?.total||0} cadastrados</p></div>
      <div className="flex gap-3 mb-5">
        <div className="relative flex-1"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/><input value={search} onChange={e=>setSearch(e.target.value)} className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Buscar..."/></div>
        <select value={type} onChange={e=>setType(e.target.value)} className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none"><option value="">Todos</option><option value="freelancer">Freelancers</option><option value="client">Clientes</option></select>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-gray-100 bg-gray-50">{['Usuário','Tipo','Status','Projetos','Saldo','Criado','Ações'].map(h=><th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>)}</tr></thead>
          <tbody className="divide-y divide-gray-50">
            {isLoading ? <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">Carregando...</td></tr>
            : users.map(u => { const scfg=STATUS_CFG[u.status]||STATUS_CFG.pending; return (
              <tr key={u.id} className="hover:bg-gray-50">
                <td className="px-4 py-3"><div className="flex items-center gap-2"><div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-xs font-bold">{u.full_name?.charAt(0)}</div><div><p className="font-medium text-gray-900">{u.full_name}</p><p className="text-xs text-gray-400">{u.email}</p></div></div></td>
                <td className="px-4 py-3"><span className={clsx('text-xs px-2 py-0.5 rounded-full font-medium', u.type==='freelancer'?'bg-blue-100 text-blue-700':'bg-green-100 text-green-700')}>{u.type==='freelancer'?'Freelancer':'Cliente'}</span></td>
                <td className="px-4 py-3"><span className={clsx('text-xs px-2 py-0.5 rounded-full font-medium',scfg.cls)}>{scfg.label}</span></td>
                <td className="px-4 py-3 text-gray-700">{u.completed_projects||0}</td>
                <td className="px-4 py-3 font-medium">R$ {parseFloat(u.available||0).toLocaleString('pt-BR',{minimumFractionDigits:2})}</td>
                <td className="px-4 py-3 text-gray-400 text-xs">{format(new Date(u.created_at),'dd/MM/yy')}</td>
                <td className="px-4 py-3"><div className="flex gap-1">
                  {u.status!=='active'&&<button onClick={()=>statusMutation.mutate({id:u.id,status:'active'})} title="Ativar" className="p-1.5 rounded-lg hover:bg-green-50 text-green-600"><CheckCircle size={14}/></button>}
                  {u.status!=='suspended'&&<button onClick={()=>statusMutation.mutate({id:u.id,status:'suspended'})} title="Suspender" className="p-1.5 rounded-lg hover:bg-orange-50 text-orange-500"><UserX size={14}/></button>}
                  {u.status!=='banned'&&<button onClick={()=>setConfirm(u)} title="Banir" className="p-1.5 rounded-lg hover:bg-red-50 text-red-500"><Ban size={14}/></button>}
                </div></td>
              </tr>
            );})}
          </tbody>
        </table>
      </div>
      {confirm&&(<div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50"><div className="bg-white rounded-2xl p-6 max-w-sm w-full"><h3 className="font-semibold text-gray-900 mb-2">Banir {confirm.full_name}?</h3><p className="text-sm text-gray-500 mb-4">Isso impedirá o acesso do usuário à plataforma.</p><div className="flex gap-3"><button onClick={()=>setConfirm(null)} className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm">Cancelar</button><button onClick={()=>statusMutation.mutate({id:confirm.id,status:'banned'})} className="flex-1 bg-red-600 text-white py-2.5 rounded-xl text-sm font-medium">Banir</button></div></div></div>)}
    </div>
  );
}
