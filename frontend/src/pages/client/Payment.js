import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from 'react-query';
import { projectAPI, paymentAPI } from '../../services/api';
import toast from 'react-hot-toast';
import {
  Shield, Copy, Check, Loader2, CreditCard,
  QrCode, RefreshCw, Lock, AlertCircle
} from 'lucide-react';
import clsx from 'clsx';

const METHODS = [
  { id: 'pix', label: 'PIX', icon: QrCode, desc: 'Aprovação imediata', badge: 'Recomendado' },
  { id: 'credit_card', label: 'Cartão de crédito', icon: CreditCard, desc: 'Em até 12x', badge: null },
];

export default function ClientPayment() {
  const { id: projectId } = useParams();
  const navigate = useNavigate();
  const [selectedMethod, setSelectedMethod] = useState('pix');
  const [paymentData, setPaymentData] = useState(null);
  const [copied, setCopied] = useState(false);
  const [step, setStep] = useState('select'); // select | processing | waiting | done

  const { data: projectData, isLoading } = useQuery(
    ['project', projectId],
    () => projectAPI.getById(projectId).then(r => r.data)
  );

  const initiateMutation = useMutation(
    (method) => paymentAPI.initiate(projectId, { method }),
    {
      onSuccess: (res) => {
        setPaymentData(res.data);
        setStep('waiting');
      },
      onError: (err) => {
        toast.error(err.response?.data?.error || 'Erro ao gerar pagamento');
        setStep('select');
      },
    }
  );

  const handlePay = () => {
    setStep('processing');
    initiateMutation.mutate(selectedMethod);
  };

  const copyPixCode = async () => {
    await navigator.clipboard.writeText(paymentData.qr_code);
    setCopied(true);
    toast.success('Código PIX copiado!');
    setTimeout(() => setCopied(false), 3000);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={32} className="animate-spin text-indigo-600" />
      </div>
    );
  }

  const project = projectData?.project;
  if (!project) return null;

  return (
    <div className="p-6 max-w-xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 bg-green-100 rounded-xl flex items-center justify-center">
          <Lock size={17} className="text-green-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Pagamento seguro</h1>
          <p className="text-xs text-gray-500">Protegido pela Free.API</p>
        </div>
      </div>

      {/* Resumo do projeto */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-4">
        <h3 className="text-xs font-medium text-gray-500 mb-3 uppercase tracking-wide">Resumo do projeto</h3>
        <div className="flex items-start justify-between">
          <div>
            <p className="font-semibold text-gray-900">{project.title}</p>
            <p className="text-sm text-gray-500 mt-0.5">Freelancer: {project.freelancer_name}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-indigo-600">
              R$ {parseFloat(project.total_amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-gray-400">Valor total</p>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-100 flex items-start gap-2">
          <Shield size={14} className="text-green-600 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-gray-500">
            O valor fica em custódia e só é liberado ao freelancer após sua aprovação em cada entrega.
          </p>
        </div>
      </div>

      {step === 'select' && (
        <>
          {/* Métodos */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Escolha a forma de pagamento</h3>
            <div className="space-y-2.5">
              {METHODS.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setSelectedMethod(m.id)}
                  className={clsx(
                    'w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all',
                    selectedMethod === m.id
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200 hover:border-gray-300'
                  )}
                >
                  <div className={clsx(
                    'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
                    selectedMethod === m.id ? 'bg-indigo-600' : 'bg-gray-100'
                  )}>
                    <m.icon size={18} className={selectedMethod === m.id ? 'text-white' : 'text-gray-500'} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-gray-900">{m.label}</span>
                      {m.badge && (
                        <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-medium">
                          {m.badge}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-gray-500">{m.desc}</span>
                  </div>
                  <div className={clsx(
                    'w-5 h-5 rounded-full border-2 flex items-center justify-center',
                    selectedMethod === m.id ? 'border-indigo-600' : 'border-gray-300'
                  )}>
                    {selectedMethod === m.id && <div className="w-2.5 h-2.5 rounded-full bg-indigo-600" />}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handlePay}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2"
          >
            <Lock size={15} />
            Pagar R$ {parseFloat(project.total_amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} com segurança
          </button>
        </>
      )}

      {step === 'processing' && (
        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
          <Loader2 size={40} className="animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="font-semibold text-gray-900">Gerando pagamento...</p>
          <p className="text-sm text-gray-500 mt-1">Aguarde alguns segundos</p>
        </div>
      )}

      {step === 'waiting' && paymentData && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          {selectedMethod === 'pix' ? (
            <>
              <div className="text-center mb-5">
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <QrCode size={22} className="text-indigo-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Pague com PIX</h3>
                <p className="text-sm text-gray-500 mt-1">Escaneie o QR Code ou copie o código</p>
              </div>

              {/* QR Code */}
              {paymentData.qr_code_base64 && (
                <div className="flex justify-center mb-5">
                  <div className="p-3 border border-gray-200 rounded-xl">
                    <img
                      src={`data:image/png;base64,${paymentData.qr_code_base64}`}
                      alt="QR Code PIX"
                      className="w-48 h-48"
                    />
                  </div>
                </div>
              )}

              {/* Código PIX */}
              <div className="bg-gray-50 rounded-xl p-3 mb-4">
                <p className="text-xs text-gray-500 mb-1.5">Código PIX copia e cola</p>
                <p className="text-xs font-mono text-gray-700 break-all leading-relaxed">
                  {paymentData.qr_code}
                </p>
              </div>

              <button
                onClick={copyPixCode}
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-medium text-sm transition-colors mb-3"
              >
                {copied ? <><Check size={15} /> Copiado!</> : <><Copy size={15} /> Copiar código PIX</>}
              </button>

              <div className="flex items-center gap-2 bg-amber-50 p-3 rounded-xl">
                <AlertCircle size={14} className="text-amber-600 flex-shrink-0" />
                <p className="text-xs text-amber-700">
                  O código expira em <strong>30 minutos</strong>. Após o pagamento, o projeto iniciará automaticamente.
                </p>
              </div>

              <button
                onClick={() => navigate(`/cliente/projetos/${projectId}`)}
                className="w-full mt-3 text-sm text-gray-500 hover:text-gray-700 py-2"
              >
                Já paguei, ver projeto →
              </button>
            </>
          ) : (
            <div className="text-center">
              <p className="text-sm text-gray-500">Redirecionar para checkout do cartão...</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
