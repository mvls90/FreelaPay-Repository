import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { authAPI } from '../../services/api';
import { Shield, CheckCircle, XCircle, Loader2 } from 'lucide-react';

export default function VerifyEmailPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading'); // loading | success | error
  const token = params.get('token');

  useEffect(() => {
    if (!token) { setStatus('error'); return; }
    authAPI.verifyEmail(token)
      .then(() => { setStatus('success'); setTimeout(() => navigate('/dashboard'), 3000); })
      .catch(() => setStatus('error'));
  }, [token]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-indigo-600 rounded-2xl mb-4">
            <Shield size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Free.API</h1>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
          {status === 'loading' && (
            <>
              <Loader2 size={40} className="animate-spin text-indigo-600 mx-auto mb-4" />
              <p className="font-medium text-gray-900">Verificando e-mail...</p>
            </>
          )}
          {status === 'success' && (
            <>
              <CheckCircle size={48} className="text-green-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-900 mb-2">E-mail verificado!</h2>
              <p className="text-gray-500 text-sm">Sua conta está ativa. Redirecionando...</p>
            </>
          )}
          {status === 'error' && (
            <>
              <XCircle size={48} className="text-red-400 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-900 mb-2">Link inválido</h2>
              <p className="text-gray-500 text-sm mb-4">Este link expirou ou já foi usado.</p>
              <button onClick={() => navigate('/login')}
                className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700">
                Ir para login
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
