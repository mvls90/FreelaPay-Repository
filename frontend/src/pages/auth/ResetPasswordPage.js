import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { authAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { Shield, Loader2, Eye, EyeOff } from 'lucide-react';

export default function ResetPasswordPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const token = params.get('token');

  const onSubmit = async ({ new_password }) => {
    if (!token) return toast.error('Token inválido');
    setLoading(true);
    try {
      await authAPI.resetPassword({ token, new_password });
      toast.success('Senha redefinida com sucesso!');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Token inválido ou expirado');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-indigo-600 rounded-2xl mb-4 shadow-lg shadow-indigo-200">
            <Shield size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Free.API</h1>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Nova senha</h2>
          <p className="text-sm text-gray-500 mb-6">Escolha uma senha forte com pelo menos 8 caracteres.</p>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Nova senha</label>
              <div className="relative">
                <input
                  type={showPwd ? 'text' : 'password'}
                  {...register('new_password', { required: true, minLength: { value: 8, message: 'Mínimo 8 caracteres' } })}
                  className="w-full px-4 py-2.5 pr-10 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Mínimo 8 caracteres"
                />
                <button type="button" onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.new_password && <p className="text-red-500 text-xs mt-1">{errors.new_password.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirmar senha</label>
              <input
                type="password"
                {...register('confirm', { validate: v => v === watch('new_password') || 'Senhas não conferem' })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Repita a senha"
              />
              {errors.confirm && <p className="text-red-500 text-xs mt-1">{errors.confirm.message}</p>}
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white py-2.5 rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2">
              {loading ? <><Loader2 size={16} className="animate-spin" /> Salvando...</> : 'Salvar nova senha'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
