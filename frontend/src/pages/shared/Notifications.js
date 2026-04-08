import React from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { notificationAPI } from '../../services/api';
import { useNotificationStore } from '../../store/index';
import { Bell, CheckCheck, Loader2 } from 'lucide-react';
import clsx from 'clsx';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const TYPE_ICONS = { proposal_accepted:'🎉', payment_received:'💰', payment_released:'✅', milestone_approved:'✅', milestone_rejected:'🔄', revision_requested:'✏️', project_completed:'🏆', dispute_opened:'⚠️', dispute_resolved:'⚖️', message_received:'💬', system_alert:'🔔' };

export default function NotificationsPage() {
  const qc = useQueryClient();
  const { markAllRead: markAllInStore, markRead: markReadInStore } = useNotificationStore();
  const { data, isLoading } = useQuery('notifications', () => notificationAPI.getAll().then(r=>r.data));
  const markAllMutation = useMutation(() => notificationAPI.markAllRead(), {
    onSuccess: () => { markAllInStore(); qc.invalidateQueries('notifications'); }
  });
  const markOneMutation = useMutation((id) => notificationAPI.markRead(id), {
    onSuccess: (_, id) => { markReadInStore(id); qc.invalidateQueries('notifications'); }
  });
  const notifications = data?.notifications || [];
  const unread = notifications.filter(n=>!n.is_read).length;
  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notificações</h1>
          {unread>0&&<p className="text-sm text-gray-500 mt-0.5">{unread} não lida{unread>1?'s':''}</p>}
        </div>
        {unread>0&&<button onClick={()=>markAllMutation.mutate()} className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700 font-medium"><CheckCheck size={16}/>Marcar todas como lidas</button>}
      </div>
      {isLoading ? (
        <div className="flex items-center justify-center h-40"><Loader2 size={28} className="animate-spin text-indigo-400"/></div>
      ) : notifications.length===0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center"><Bell size={40} className="text-gray-300 mx-auto mb-3"/><p className="font-medium text-gray-500">Nenhuma notificação</p></div>
      ) : (
        <div className="space-y-2">
          {notifications.map(n=>(
            <div key={n.id} onClick={()=>!n.is_read&&markOneMutation.mutate(n.id)}
              className={clsx('bg-white rounded-xl border p-4 transition-all cursor-pointer',n.is_read?'border-gray-100 opacity-70':'border-indigo-100 hover:border-indigo-200 shadow-sm')}>
              <div className="flex items-start gap-3">
                <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0',n.is_read?'bg-gray-50':'bg-indigo-50')}>{TYPE_ICONS[n.type]||'🔔'}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={clsx('text-sm font-semibold',n.is_read?'text-gray-600':'text-gray-900')}>{n.title}</p>
                    {!n.is_read&&<div className="w-2 h-2 rounded-full bg-indigo-500 flex-shrink-0 mt-1.5"/>}
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5">{n.body}</p>
                  <p className="text-xs text-gray-400 mt-1">{formatDistanceToNow(new Date(n.created_at),{locale:ptBR,addSuffix:true})}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
