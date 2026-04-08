// src/utils/validators.js

export const rules = {
  required: (msg = 'Campo obrigatório') => ({
    required: msg,
  }),

  email: {
    required: 'E-mail obrigatório',
    pattern: {
      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: 'E-mail inválido',
    },
  },

  password: {
    required: 'Senha obrigatória',
    minLength: { value: 8, message: 'Mínimo de 8 caracteres' },
    pattern: {
      value: /^(?=.*[A-Za-z])(?=.*\d).{8,}$/,
      message: 'A senha deve conter letras e números',
    },
  },

  fullName: {
    required: 'Nome obrigatório',
    minLength: { value: 3, message: 'Nome muito curto' },
    maxLength: { value: 200, message: 'Nome muito longo' },
  },

  phone: {
    pattern: {
      value: /^(\(?\d{2}\)?\s?)?(\d{4,5}[-\s]?\d{4})$/,
      message: 'Telefone inválido',
    },
  },

  currency: (min = 1) => ({
    required: 'Valor obrigatório',
    min: { value: min, message: `Valor mínimo: R$ ${min}` },
    validate: (v) => !isNaN(parseFloat(v)) || 'Valor inválido',
  }),

  positiveInt: (min = 1) => ({
    required: 'Campo obrigatório',
    min: { value: min, message: `Mínimo: ${min}` },
    validate: (v) => Number.isInteger(Number(v)) || 'Deve ser um número inteiro',
  }),

  cpf: {
    pattern: {
      value: /^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/,
      message: 'CPF inválido',
    },
  },

  url: {
    pattern: {
      value: /^https?:\/\/.+/,
      message: 'URL inválida (deve começar com http:// ou https://)',
    },
  },

  confirmPassword: (getValues) => ({
    required: 'Confirmação obrigatória',
    validate: (val) => val === getValues('password') || 'As senhas não conferem',
  }),
};
