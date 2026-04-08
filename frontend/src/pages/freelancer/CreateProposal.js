import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { proposalAPI } from '../../services/api';
import toast from 'react-hot-toast';
import {
  Plus, Trash2, Copy, Check, ChevronRight,
  DollarSign, Calendar, RotateCcw, Info, Loader2
} from 'lucide-react';
import clsx from 'clsx';

const STEPS = ['Serviço', 'Pagamento', 'Etapas', 'Revisar'];

export default function CreateProposal() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdLink, setCreatedLink] = useState(null);
  const [copied, setCopied] = useState(false);
  const [paymentType, setPaymentType] = useState('full');

  const { register, handleSubmit, watch, control, getValues, formState: { errors } } = useForm({
    defaultValues: {
      milestones: [
        { title: 'Adiantamento inicial', percentage: 50, description: 'Pagamento para início do projeto' },
        { title: 'Entrega final', percentage: 50, description: 'Pagamento na conclusão' },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'milestones' });

  const totalAmount = parseFloat(watch('total_amount') || 0);
  const platformFee = (totalAmount * 5) / 100;
  const youReceive = totalAmount - platformFee;

  const milestonesValues = watch('milestones') || [];
  const totalPct = milestonesValues.reduce((acc, m) => acc + parseFloat(m.percentage || 0), 0);

  const onSubmit = async (data) => {
    if (paymentType === 'milestones' && Math.abs(totalPct - 100) > 0.01) {
      toast.error('A soma das etapas deve ser 100%');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        ...data,
        payment_type: paymentType,
        milestones: paymentType === 'milestones' ? data.milestones : undefined,
      };

      const response = await proposalAPI.create(payload);
      setCreatedLink(response.data.proposal_url);
      toast.success('Proposta criada com sucesso!');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Erro ao criar proposta');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(createdLink);
    setCopied(true);
    toast.success('Link copiado!');
    setTimeout(() => setCopied(false), 3000);
  };

  if (createdLink) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check size={28} className="text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Proposta criada!</h2>
          <p className="text-gray-500 text-sm mb-6">Compartilhe este link com seu cliente</p>

          <div className="bg-gray-50 rounded-xl p-4 mb-4">
            <p className="text-xs text-gray-500 mb-2">Link da proposta</p>
            <p className="text-sm font-mono text-indigo-600 break-all">{createdLink}</p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={copyLink}
              className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-medium text-sm transition-colors"
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? 'Copiado!' : 'Copiar link'}
            </button>
            <button
              onClick={() => navigate('/freelancer/propostas')}
              className="flex-1 border border-gray-200 text-gray-700 hover:bg-gray-50 py-3 rounded-xl font-medium text-sm transition-colors"
            >
              Ver propostas
            </button>
          </div>

          <p className="text-xs text-gray-400 mt-4">
            O link expira em 30 dias. Você pode reenviar quando quiser.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Nova Proposta</h1>
        <p className="text-gray-500 text-sm mt-0.5">Crie uma proposta e compartilhe o link com seu cliente</p>
      </div>

      {/* Steps */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1">
        {STEPS.map((s, i) => (
          <React.Fragment key={s}>
            <button
              onClick={() => i < step && setStep(i)}
              className={clsx(
                'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all',
                i === step ? 'bg-indigo-600 text-white' :
                i < step ? 'bg-indigo-100 text-indigo-700 cursor-pointer' :
                'bg-gray-100 text-gray-400 cursor-default'
              )}
            >
              <span className={clsx(
                'w-5 h-5 rounded-full flex items-center justify-center text-xs',
                i === step ? 'bg-white/20 text-white' :
                i < step ? 'bg-indigo-600 text-white' :
                'bg-gray-200 text-gray-400'
              )}>
                {i < step ? <Check size={10} /> : i + 1}
              </span>
              {s}
            </button>
            {i < STEPS.length - 1 && <ChevronRight size={14} className="text-gray-300 flex-shrink-0" />}
          </React.Fragment>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="bg-white rounded-2xl border border-gray-100 p-6">

          {/* Step 0: Serviço */}
          {step === 0 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Título do serviço *</label>
                <input
                  {...register('title', { required: 'Título obrigatório' })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Ex: Desenvolvimento de site institucional"
                />
                {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Descrição detalhada *</label>
                <textarea
                  {...register('description', { required: 'Descrição obrigatória' })}
                  rows={4}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  placeholder="Descreva o que está incluso no serviço, tecnologias utilizadas, etc."
                />
                {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Escopo e entregáveis</label>
                <textarea
                  {...register('scope_details')}
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  placeholder="Liste os entregáveis específicos (ex: 5 páginas, 1 logo, 2 banners...)"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    <Calendar size={13} className="inline mr-1" />
                    Prazo de entrega (dias) *
                  </label>
                  <input
                    type="number"
                    {...register('deadline_days', { required: 'Prazo obrigatório', min: 1 })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="7"
                    min="1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    <RotateCcw size={13} className="inline mr-1" />
                    Revisões inclusas
                  </label>
                  <select
                    {...register('revisions_included')}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {[0, 1, 2, 3, 5, 10].map(n => (
                      <option key={n} value={n}>{n === 0 ? 'Sem revisões' : `${n} revisão${n > 1 ? 'ões' : ''}`}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 1: Pagamento */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  <DollarSign size={13} className="inline mr-1" />
                  Valor total do projeto (R$) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  {...register('total_amount', { required: 'Valor obrigatório', min: 10 })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="1500.00"
                />
              </div>

              {totalAmount > 0 && (
                <div className="bg-indigo-50 rounded-xl p-4 text-sm">
                  <div className="flex justify-between mb-1.5">
                    <span className="text-gray-600">Valor total</span>
                    <span className="font-medium">R$ {totalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between mb-1.5 text-red-600">
                    <span>Taxa da plataforma (5%)</span>
                    <span>- R$ {platformFee.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-green-700 border-t border-indigo-200 pt-1.5 mt-1.5">
                    <span>Você recebe</span>
                    <span>R$ {youReceive.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Tipo de pagamento</label>
                <div className="grid grid-cols-2 gap-3">
                  <button type="button" onClick={() => setPaymentType('full')}
                    className={clsx('p-4 rounded-xl border-2 text-left transition-all',
                      paymentType === 'full' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-gray-300')}>
                    <p className="font-semibold text-sm text-gray-900">100% antecipado</p>
                    <p className="text-xs text-gray-500 mt-0.5">Pagamento total antes de começar</p>
                  </button>
                  <button type="button" onClick={() => setPaymentType('milestones')}
                    className={clsx('p-4 rounded-xl border-2 text-left transition-all',
                      paymentType === 'milestones' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-gray-300')}>
                    <p className="font-semibold text-sm text-gray-900">Por etapas</p>
                    <p className="text-xs text-gray-500 mt-0.5">Pagamento dividido em marcos</p>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Etapas */}
          {step === 2 && (
            <div className="space-y-4">
              {paymentType === 'full' ? (
                <div className="text-center py-8 text-gray-500">
                  <Check size={32} className="mx-auto mb-2 text-green-500" />
                  <p className="text-sm">Pagamento 100% antecipado selecionado.</p>
                  <p className="text-xs text-gray-400 mt-1">O cliente pagará o valor total antes de você começar.</p>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">Etapas de pagamento</h3>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Total: <span className={clsx('font-semibold', Math.abs(totalPct - 100) < 0.01 ? 'text-green-600' : 'text-red-500')}>{totalPct}%</span>
                        {Math.abs(totalPct - 100) > 0.01 && ' (deve somar 100%)'}
                      </p>
                    </div>
                    <button type="button"
                      onClick={() => append({ title: '', percentage: 0, description: '' })}
                      className="flex items-center gap-1.5 text-xs text-indigo-600 font-medium hover:text-indigo-700">
                      <Plus size={14} /> Adicionar etapa
                    </button>
                  </div>

                  <div className="space-y-3">
                    {fields.map((field, index) => (
                      <div key={field.id} className="p-4 border border-gray-100 rounded-xl bg-gray-50">
                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center mt-0.5 flex-shrink-0">
                            {index + 1}
                          </div>
                          <div className="flex-1 space-y-2">
                            <div className="grid grid-cols-3 gap-2">
                              <div className="col-span-2">
                                <input
                                  {...register(`milestones.${index}.title`, { required: true })}
                                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                  placeholder="Título da etapa"
                                />
                              </div>
                              <div className="relative">
                                <input
                                  type="number"
                                  step="0.01"
                                  {...register(`milestones.${index}.percentage`, { required: true, min: 1, max: 100 })}
                                  className="w-full px-3 py-2 pr-7 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                  placeholder="50"
                                />
                                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400">%</span>
                              </div>
                            </div>
                            <input
                              {...register(`milestones.${index}.description`)}
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              placeholder="Descrição (opcional)"
                            />
                            {totalAmount > 0 && (
                              <p className="text-xs text-indigo-600 font-medium">
                                = R$ {((totalAmount * (parseFloat(milestonesValues[index]?.percentage) || 0)) / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </p>
                            )}
                          </div>
                          {fields.length > 1 && (
                            <button type="button" onClick={() => remove(index)}
                              className="text-red-400 hover:text-red-600 transition-colors mt-0.5">
                              <Trash2 size={15} />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Step 3: Revisar */}
          {step === 3 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Resumo da proposta</h3>
              <div className="bg-gray-50 rounded-xl p-4 space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Serviço</span>
                  <span className="font-medium text-gray-900 text-right max-w-48 truncate">{getValues('title')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Prazo</span>
                  <span className="font-medium">{getValues('deadline_days')} dias</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Revisões</span>
                  <span className="font-medium">{getValues('revisions_included') || 2}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Pagamento</span>
                  <span className="font-medium">{paymentType === 'full' ? '100% antecipado' : 'Por etapas'}</span>
                </div>
                <div className="border-t border-gray-200 pt-3 flex justify-between">
                  <span className="text-gray-500">Valor total</span>
                  <span className="font-semibold text-indigo-600">R$ {totalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-green-700">
                  <span>Você recebe</span>
                  <span className="font-semibold">R$ {youReceive.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>

              <div className="flex items-start gap-2 bg-blue-50 p-3 rounded-lg">
                <Info size={14} className="text-blue-500 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-blue-700">
                  Ao confirmar, será gerado um link único para compartilhar com seu cliente. O pagamento fica em custódia até sua aprovação.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-4">
          <button
            type="button"
            onClick={() => setStep(s => s - 1)}
            disabled={step === 0}
            className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Voltar
          </button>

          {step < STEPS.length - 1 ? (
            <button
              type="button"
              onClick={() => setStep(s => s + 1)}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl text-sm font-medium transition-colors"
            >
              Próximo <ChevronRight size={16} />
            </button>
          ) : (
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-6 py-2.5 rounded-xl text-sm font-medium transition-colors"
            >
              {isSubmitting ? <><Loader2 size={14} className="animate-spin" /> Criando...</> : <><Check size={14} /> Criar proposta</>}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
