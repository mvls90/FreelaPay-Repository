import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { adminAPI } from '../../services/api';
import { AlertTriangle, Clock, ArrowRight } from 'lucide-react';
import clsx from 'clsx';
import { format, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const STATUS_CFG = { open:{label:'Aberta',cls:'bg-red-100 text-red-700'}, under_review:{label:'Em análise',cls:'bg-yellow-100 text-yellow-700'}, resolved:{label:'Resolvida',cls:'bg-green-100 text-green-700'}, escalated:{label:'Escalada',cls:'bg-orange-100 text-orange-700'} };

export default function AdminDisputes() {
  const [status, setStatus] = useState('');
  const { data, isLoading } = useQuery(['admin-disputes',status], () => adminAPI.getDisputes({status}).then(r=>r.data), {keepPreviousData:true});
  const disputes = data?.disputes || [];
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6"><h1 className="text-2xl font-bold text-gray-900">Disputas</h1></div>
      <div className="flex gap-2 mb-5">
        {[['','Todas'],['open','Abertas'],['under_review','Em análise'],['resolved','Resolvidas']].map(([v,l])=>(
          <button key={v} onClick={()=>setStatus(v)} className={clsx('px-4 py-2 rounded-xl text-sm font-medium transition-all',status===v?'bg-indigo-600 text-white':'bg-white border border-gray-200 text-gray-600 hover:border-gray-300')}>{l}</button>
        ))}
      </div>
      <div className="space-y-3">
        {isLoading ? [...Array(3)].map((_,i)=><div key={i} className="bg-white rounded-xl border border-gray-100 h-20 animate-pulse"/>) 
        : disputes.length===0 ? <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center"><AlertTriangle size={40} className="text-gray-300 mx-auto mb-3"/><p className="text-gray-500">Nenhuma disputa</p></div>
        : disputes.map(d => { const cfg=STATUS_CFG[d.status]||STATUS_CFG.open; const sla=d.sla_deadline?new Date(d.sla_deadline):null; const overdue=sla&&sla<new Date()&&!['resolved','closed'].includes(d.status);
          return (
            <Link key={d.id} to={`/admin/disputas/${d.id}`} className={clsx('block bg-white rounded-xl border p-5 hover:shadow-sm transition-all',overdue?'border-red-200':'border-gray-100 hover:border-indigo-200')}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900 truncate">{d.subject}</h3>
                    <span className={clsx('text-xs px-2 py-0.5 rounded-full font-medium',cfg.cls)}>{cfg.label}</span>
                    {overdue&&<span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full font-medium">SLA vencido</span>}
                  </div>
                  <p className="text-xs text-gray-500">Projeto: {d.project_title} · Freelancer: {d.freelancer_name} · Cliente: {d.client_name}</p>
                  {d.mediator_name&&<p className="text-xs text-indigo-600 mt-0.5">Mediador: {d.mediator_name}</p>}
                </div>
                <div className="text-right flex-shrink-0">
                  {sla&&<p className={clsx('text-xs flex items-center gap-1',overdue?'text-red-600':'text-gray-400')}><Clock size={11}/>{overdue?'Atrasado':formatDistanceToNow(sla,{locale:ptBR,addSuffix:true})}</p>}
                  <p className="text-xs text-gray-400 mt-1">{format(new Date(d.created_at),'dd/MM/yy')}</p>
                  <ArrowRight size={14} className="text-gray-300 mt-1 ml-auto"/>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
