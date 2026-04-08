// src/utils/format.js

/**
 * Formata valor monetário em Real brasileiro
 * @param {number|string} value
 * @returns {string}  Ex: "R$ 1.500,00"
 */
export const formatCurrency = (value) => {
  const num = parseFloat(value || 0);
  return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

/**
 * Formata valor sem o prefixo R$
 * @param {number|string} value
 * @returns {string}  Ex: "1.500,00"
 */
export const formatAmount = (value) => {
  return parseFloat(value || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 });
};

/**
 * Formata data para padrão brasileiro
 * @param {string|Date} date
 * @param {boolean} withTime
 * @returns {string}  Ex: "15/03/2025" ou "15/03/2025 14:30"
 */
export const formatDate = (date, withTime = false) => {
  if (!date) return '—';
  const d = new Date(date);
  const dateStr = d.toLocaleDateString('pt-BR');
  if (!withTime) return dateStr;
  const timeStr = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  return `${dateStr} ${timeStr}`;
};

/**
 * Trunca texto com reticências
 * @param {string} text
 * @param {number} maxLength
 * @returns {string}
 */
export const truncate = (text, maxLength = 100) => {
  if (!text || text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

/**
 * Calcula taxa da plataforma e valor líquido
 * @param {number} total
 * @param {number} feePct  Default 5%
 * @returns {{ fee: number, net: number }}
 */
export const calcFee = (total, feePct = 5) => {
  const fee = (total * feePct) / 100;
  return { fee: parseFloat(fee.toFixed(2)), net: parseFloat((total - fee).toFixed(2)) };
};

/**
 * Retorna iniciais do nome
 * @param {string} name
 * @returns {string}  Ex: "João Silva" → "JS"
 */
export const getInitials = (name = '') => {
  return name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('');
};

/**
 * Formata número de telefone brasileiro
 * @param {string} phone
 * @returns {string}
 */
export const formatPhone = (phone = '') => {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 11) return `(${digits.slice(0,2)}) ${digits.slice(2,7)}-${digits.slice(7)}`;
  if (digits.length === 10) return `(${digits.slice(0,2)}) ${digits.slice(2,6)}-${digits.slice(6)}`;
  return phone;
};

/**
 * Verifica se uma string é um e-mail válido
 */
export const isValidEmail = (email = '') => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

/**
 * Gera cor de fundo baseada em string (para avatares)
 */
export const stringToColor = (str = '') => {
  const colors = ['#4F46E5','#0891B2','#059669','#D97706','#DC2626','#7C3AED','#DB2777'];
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash += str.charCodeAt(i);
  return colors[hash % colors.length];
};
