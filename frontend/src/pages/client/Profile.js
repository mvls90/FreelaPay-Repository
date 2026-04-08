import React, { useState } from 'react';
import { useQuery, useMutation } from 'react-query';
import { useForm } from 'react-hook-form';
import { userAPI } from '../../services/api';
import { useAuthStore } from '../../store/index';
import toast from 'react-hot-toast';
import { Loader2, Edit2 } from 'lucide-react';

export default function ClientProfile() {
  const { user: authUser, updateUser } = useAuthStore();
  const [editMode, setEditMode] = useState(false);
  const { data } = useQuery('my-profile', () => userAPI.getProfile().then(r => r.data));
  const user = data?.user || authUser;
  const { register, handleSubmit } = useForm({
    defaultValues: { full_name: authUser?.full_name || '', phone: authUser?.phone || '', location_city: authUser?.location_city || '', location_state: authUser?.location_state || '' },
  });
  const updateMutation = useMutation(
    (d) => userAPI.updateProfile(d),
    { onSuccess: (res) => { updateUser(res.data.user); toast.success('Perfil atualizado!'); setEditMode(false); }, onError: () => toast.error('Erro ao atualizar') }
  );
  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Meu Perfil</h1>
        <button onClick={() => setEditMode(!editMode)} className="flex items-center gap-2 border border-gray-200 text-gray-700 hover:border-indigo-300 hover:text-indigo-600 px-4 py-2 rounded-xl text-sm font-medium transition-colors">
          <Edit2 size={14} /> {editMode ? 'Cancelar' : 'Editar'}
        </button>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-5 flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-green-100 flex items-center justify-center text-green-700 font-bold text-2xl">{user?.full_name?.charAt(0)?.toUpperCase()}</div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">{user?.full_name}</h2>
          <p className="text-sm text-gray-500">{user?.email}</p>
          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium mt-1 inline-block">Cliente</span>
        </div>
      </div>
      {editMode ? (
        <form onSubmit={handleSubmit(d => updateMutation.mutate(d))} className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {[['full_name','Nome completo'],['phone','Telefone'],['location_city','Cidade'],['location_state','Estado']].map(([f,l]) => (
              <div key={f}><label className="text-sm font-medium text-gray-700 mb-1 block">{l}</label>
                <input {...register(f)} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" /></div>
            ))}
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setEditMode(false)} className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm font-medium">Cancelar</button>
            <button type="submit" disabled={updateMutation.isLoading} className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2">
              {updateMutation.isLoading && <Loader2 size={14} className="animate-spin" />} Salvar
            </button>
          </div>
        </form>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-3 text-sm">
          {[['E-mail', user?.email],['Telefone', user?.phone || '—'],['Cidade', user?.location_city || '—'],['Estado', user?.location_state || '—']].map(([l,v]) => (
            <div key={l} className="flex justify-between border-b border-gray-50 pb-3 last:border-0 last:pb-0">
              <span className="text-gray-500">{l}</span><span className="font-medium text-gray-800">{v}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
