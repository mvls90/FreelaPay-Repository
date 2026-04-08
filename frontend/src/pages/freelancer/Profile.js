import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useForm } from 'react-hook-form';
import { userAPI } from '../../services/api';
import { useAuthStore } from '../../store/index';
import toast from 'react-hot-toast';
import { User, Star, Shield, CheckCircle, Loader2, Edit2 } from 'lucide-react';
import clsx from 'clsx';

const SKILLS_OPTIONS = [
  'React', 'Vue.js', 'Angular', 'Node.js', 'Python', 'PHP', 'Laravel',
  'WordPress', 'Figma', 'UI/UX Design', 'Photoshop', 'Illustrator',
  'Motion Design', 'Copywriting', 'SEO', 'Social Media', 'Video Editing',
];

export default function FreelancerProfile() {
  const { user: authUser, updateUser } = useAuthStore();
  const qc = useQueryClient();
  const [editMode, setEditMode] = useState(false);
  const [selectedSkills, setSelectedSkills] = useState(authUser?.skills || []);

  const { data } = useQuery('my-profile', () => userAPI.getProfile().then(r => r.data));

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      full_name: authUser?.full_name || '',
      phone: authUser?.phone || '',
      bio: authUser?.bio || '',
      website_url: authUser?.website_url || '',
      location_city: authUser?.location_city || '',
      location_state: authUser?.location_state || '',
      pix_key: authUser?.pix_key || '',
    },
  });

  const updateMutation = useMutation(
    (d) => userAPI.updateProfile({ ...d, skills: selectedSkills }),
    {
      onSuccess: (res) => {
        updateUser(res.data.user);
        toast.success('Perfil atualizado!');
        setEditMode(false);
        qc.invalidateQueries('my-profile');
      },
      onError: () => toast.error('Erro ao atualizar perfil'),
    }
  );

  const user = data?.user || authUser;

  const toggleSkill = (skill) => {
    setSelectedSkills(prev =>
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    );
  };

  const verificationInfo = {
    unverified: { label: 'Não verificado', cls: 'bg-gray-100 text-gray-500', icon: null },
    basic:      { label: 'Verificação básica', cls: 'bg-blue-100 text-blue-600', icon: CheckCircle },
    verified:   { label: 'Verificado', cls: 'bg-green-100 text-green-700', icon: CheckCircle },
    premium:    { label: 'Premium verificado', cls: 'bg-purple-100 text-purple-700', icon: Shield },
  }[user?.verification] || { label: 'Não verificado', cls: 'bg-gray-100 text-gray-500' };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Meu Perfil</h1>
        <button onClick={() => setEditMode(!editMode)}
          className="flex items-center gap-2 border border-gray-200 text-gray-700 hover:border-indigo-300 hover:text-indigo-600 px-4 py-2 rounded-xl text-sm font-medium transition-colors">
          <Edit2 size={14} /> {editMode ? 'Cancelar' : 'Editar perfil'}
        </button>
      </div>

      {/* Avatar + stats */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-5">
        <div className="flex items-start gap-5">
          <div className="w-20 h-20 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-3xl flex-shrink-0">
            {user?.full_name?.charAt(0)?.toUpperCase()}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-bold text-gray-900">{user?.full_name}</h2>
              <span className={clsx('text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1', verificationInfo.cls)}>
                {verificationInfo.icon && <verificationInfo.icon size={11} />}
                {verificationInfo.label}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-0.5">{user?.email}</p>
            {user?.bio && <p className="text-sm text-gray-700 mt-2">{user?.bio}</p>}
            <div className="flex items-center gap-4 mt-3 text-sm">
              <span className="flex items-center gap-1 text-yellow-600">
                <Star size={14} /> {parseFloat(user?.trust_score || 0).toFixed(1)}
              </span>
              <span className="text-gray-500">{user?.completed_projects || 0} projetos concluídos</span>
            </div>
          </div>
        </div>
      </div>

      {editMode ? (
        <form onSubmit={handleSubmit(d => updateMutation.mutate(d))} className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
          <h3 className="font-semibold text-gray-900 mb-2">Editar informações</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Nome completo</label>
              <input {...register('full_name', { required: true })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Telefone</label>
              <input {...register('phone')}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="(11) 99999-9999" />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Bio / Apresentação</label>
            <textarea {...register('bio')} rows={3}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              placeholder="Conte um pouco sobre você e suas habilidades..." />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Website</label>
              <input {...register('website_url')}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="https://..." />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Chave PIX</label>
              <input {...register('pix_key')}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="CPF, e-mail ou telefone" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Cidade</label>
              <input {...register('location_city')}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Estado</label>
              <input {...register('location_state')}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="SP" maxLength={2} />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Habilidades</label>
            <div className="flex flex-wrap gap-2">
              {SKILLS_OPTIONS.map(skill => (
                <button key={skill} type="button" onClick={() => toggleSkill(skill)}
                  className={clsx('px-3 py-1.5 rounded-full text-xs font-medium transition-all',
                    selectedSkills.includes(skill)
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200')}>
                  {skill}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setEditMode(false)}
              className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50">
              Cancelar
            </button>
            <button type="submit" disabled={updateMutation.isLoading}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2">
              {updateMutation.isLoading ? <Loader2 size={14} className="animate-spin" /> : null}
              Salvar alterações
            </button>
          </div>
        </form>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4 text-sm">
          <h3 className="font-semibold text-gray-900">Informações</h3>
          {[
            { label: 'E-mail', value: user?.email },
            { label: 'Telefone', value: user?.phone || '—' },
            { label: 'Website', value: user?.website_url || '—' },
            { label: 'Localização', value: user?.location_city ? `${user.location_city}/${user.location_state}` : '—' },
            { label: 'Chave PIX', value: user?.pix_key || '—' },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between border-b border-gray-50 pb-3 last:border-0 last:pb-0">
              <span className="text-gray-500">{label}</span>
              <span className="font-medium text-gray-800">{value}</span>
            </div>
          ))}
          {user?.skills?.length > 0 && (
            <div>
              <p className="text-gray-500 mb-2">Habilidades</p>
              <div className="flex flex-wrap gap-2">
                {user.skills.map(s => (
                  <span key={s} className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-medium">{s}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
