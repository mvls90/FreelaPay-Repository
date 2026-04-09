import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuthStore } from '../../store/index';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Loader2, Briefcase, UserCircle } from 'lucide-react';
import clsx from 'clsx';

export default function RegisterPage() {
  const { register: registerUser, isLoading } = useAuthStore();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [selectedType, setSelectedType] = useState('freelancer');

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: { type: 'freelancer' },
  });

  const password = watch('password');

  const onSubmit = async (data) => {
    try {
      await registerUser({ ...data, type: selectedType });
      toast.success('Conta criada com sucesso! Bem-vindo ao FreelaPay!');
      if (selectedType === 'freelancer') {
        navigate('/freelancer/dashboard');
      } else {
        navigate('/cliente/dashboard');
      }
    } catch (error) {
      const msg = error.response?.data?.error || '';
      if (msg.includes('cadastrado')) {
        toast.error('Este e-mail já está cadastrado. Tente fazer login.');
      } else {
        toast.error(msg || 'Erro ao criar conta. Tente novamente.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img src="/logo.png" alt="FreelaPay" className="h-13 w-auto mx-auto mb-2" />
          <p className="text-gray-500 text-sm mt-1">Crie sua conta grátis</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Criar conta</h2>

          <div className="grid grid-cols-2 gap-3 mb-6">
            <button
              type="button"
              onClick={() => setSelectedType('freelancer')}
              className={clsx(
                'p-4 rounded-xl border-2 text-left transition-all',
                selectedType === 'freelancer'
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-gray-200 hover:border-gray-300'
              )}
            >
              <Briefcase size={20} className={selectedType === 'freelancer' ? 'text-indigo-600' : 'text-gray-400'} />
              <p className="font-semibold text-sm mt-2 text-gray-900">Freelancer</p>
              <p className="text-xs text-gray-500 mt-0.5">Vendo serviços</p>
            </button>
            <button
              type="button"
              onClick={() => setSelectedType('client')}
              className={clsx(
                'p-4 rounded-xl border-2 text-left transition-all',
                selectedType === 'client'
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-gray-200 hover:border-gray-300'
              )}
            >
              <UserCircle size={20} className={selectedType === 'client' ? 'text-indigo-600' : 'text-gray-400'} />
              <p className="font-semibold text-sm mt-2 text-gray-900">Cliente</p>
              <p className="text-xs text-gray-500 mt-0.5">Contrato serviços</p>
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Nome completo</label>
              <input
                {...register('full_name', { required: 'Nome obrigatório', minLength: { value: 3, message: 'Mínimo 3 caracteres' } })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                placeholder="João Silva"
              />
              {errors.full_name && <p className="text-red-500 text-xs mt-1">{errors.full_name.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">E-mail</label>
              <input
                type="email"
                {...register('email', { required: 'E-mail obrigatório' })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                placeholder="seu@email.com"
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Telefone</label>
              <input
                {...register('phone')}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                placeholder="(11) 99999-9999"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Senha</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  {...register('password', {
                    required: 'Senha obrigatória',
                    minLength: { value: 8, message: 'Mínimo 8 caracteres' },
                  })}
                  className="w-full px-4 py-2.5 pr-10 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  placeholder="Mínimo 8 caracteres"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirmar senha</label>
              <input
                type="password"
                {...register('confirm_password', {
                  required: 'Confirmação obrigatória',
                  validate: v => v === password || 'As senhas não conferem',
                })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                placeholder="Repita a senha"
              />
              {errors.confirm_password && <p className="text-red-500 text-xs mt-1">{errors.confirm_password.message}</p>}
            </div>

            <p className="text-xs text-gray-500">
              Ao criar sua conta, você concorda com os{' '}
              <a href="#" className="text-indigo-600 hover:underline">Termos de Uso</a> e{' '}
              <a href="#" className="text-indigo-600 hover:underline">Política de Privacidade</a>.
            </p>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white py-2.5 rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2"
            >
              {isLoading ? <><Loader2 size={16} className="animate-spin" /> Criando conta...</> : 'Criar conta'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-500">
              Já tem conta?{' '}
              <Link to="/login" className="text-indigo-600 hover:text-indigo-700 font-medium">Entrar</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
