import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuthStore } from '../../store/index';
import toast from 'react-hot-toast';
import { Shield, Eye, EyeOff, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const { login, isLoading } = useAuthStore();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [requires2FA, setRequires2FA] = useState(false);
  const [formData, setFormData] = useState(null);

  const { register, handleSubmit, formState: { errors } } = useForm();
  const { register: register2fa, handleSubmit: handleSubmit2fa } = useForm();

  const onSubmit = async (data) => {
    try {
      const result = await login(data.email, data.password);
      if (result?.requires_2fa) {
        setRequires2FA(true);
        setFormData(data);
        return;
      }
      toast.success('Login realizado com sucesso!');
      const user = useAuthStore.getState().user;
      if (user?.type === 'freelancer') navigate('/freelancer/dashboard');
      else if (user?.type === 'client') navigate('/cliente/dashboard');
      else navigate('/admin/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.error || 'E-mail ou senha incorretos');
    }
  };

  const onSubmit2FA = async (data) => {
    try {
      await login(formData.email, formData.password, data.totp_code);
      toast.success('Login realizado!');
      const user = useAuthStore.getState().user;
      if (user?.type === 'freelancer') navigate('/freelancer/dashboard');
      else if (user?.type === 'client') navigate('/cliente/dashboard');
      else navigate('/admin/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Código inválido');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img src="/logo.png" alt="FreelaPay" className="h-30 w-auto mx-auto mb-2" />
          <p className="text-gray-500 text-sm mt-1">Plataforma segura de freelancers</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          {!requires2FA ? (
            <>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Entrar na conta</h2>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">E-mail</label>
                  <input
                    type="email"
                    {...register('email', { required: 'E-mail obrigatório' })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    placeholder="seu@email.com"
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Senha</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      {...register('password', { required: 'Senha obrigatória' })}
                      className="w-full px-4 py-2.5 pr-10 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      placeholder="••••••••"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
                </div>

                <div className="flex justify-end">
                  <Link to="/esqueci-senha" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                    Esqueci a senha
                  </Link>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white py-2.5 rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2"
                >
                  {isLoading ? <><Loader2 size={16} className="animate-spin" /> Entrando...</> : 'Entrar'}
                </button>
              </form>
            </>
          ) : (
            <>
              <div className="text-center mb-6">
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Shield size={22} className="text-indigo-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Verificação 2FA</h2>
                <p className="text-sm text-gray-500 mt-1">Digite o código do seu autenticador</p>
              </div>
              <form onSubmit={handleSubmit2fa(onSubmit2FA)} className="space-y-4">
                <input
                  type="text"
                  {...register2fa('totp_code', { required: true })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg text-center text-2xl font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="000000"
                  maxLength={6}
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-lg font-medium text-sm transition-colors"
                >
                  Verificar
                </button>
                <button type="button" onClick={() => setRequires2FA(false)}
                  className="w-full text-gray-500 text-sm hover:text-gray-700">
                  Voltar ao login
                </button>
              </form>
            </>
          )}

          <div className="mt-6 pt-6 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-500">
              Não tem conta?{' '}
              <Link to="/cadastro" className="text-indigo-600 hover:text-indigo-700 font-medium">
                Criar conta grátis
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
