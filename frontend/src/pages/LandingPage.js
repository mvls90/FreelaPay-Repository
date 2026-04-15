import { useState } from 'react';
import { Link } from 'react-router-dom';

/* ─────────────────────────────────────────────
   DATA
───────────────────────────────────────────── */
const NAV_LINKS = [
  { label: 'Como Funciona', href: '#como-funciona' },
  { label: 'Benefícios', href: '#beneficios' },
  { label: 'Preços', href: '#precos' },
  { label: 'FAQ', href: '#faq' },
];

const PAINS = [
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
      </svg>
    ),
    title: 'Medo de golpes',
    desc: 'Você combina um serviço, transfere o dinheiro e... o freelancer some. Ou entrega algo completamente diferente do acordado.',
    highlight: 'R$ 2,3 bilhões perdidos em golpes digitais só em 2023',
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
    ),
    title: 'Clientes que não pagam',
    desc: 'Você trabalha semanas num projeto, entrega tudo certinho e o cliente desaparece sem pagar. Ou cria problemas para não liberar o pagamento.',
    highlight: '67% dos freelancers já sofreram calote ao menos uma vez',
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M8 12h.01M12 12h.01M16 12h.01M21 3H3a2 2 0 00-2 2v14a2 2 0 002 2h18a2 2 0 002-2V5a2 2 0 00-2-2z" />
      </svg>
    ),
    title: 'Sem mediação em conflitos',
    desc: 'Quando surge uma disputa, cada um fica no seu lado sem ninguém para ajudar. Litígios demoram meses e custam mais do que o projeto vale.',
    highlight: 'Sem mediação, 80% das disputas ficam sem resolução',
  },
];

const STEPS = [
  {
    num: '01',
    color: 'bg-blue-600',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    title: 'Freelancer cria a proposta',
    desc: 'Descreve o escopo, define prazo e valor. O cliente recebe um link seguro para revisar e aceitar os termos do projeto.',
    tag: 'Início',
  },
  {
    num: '02',
    color: 'bg-[#00C896]',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
    title: 'Cliente paga — dinheiro fica bloqueado',
    desc: 'O valor é depositado em custódia no FreelaPay. Ninguém toca no dinheiro: nem o freelancer, nem o cliente, até a entrega ser aprovada.',
    tag: 'Segurança',
  },
  {
    num: '03',
    color: 'bg-purple-600',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: 'Freelancer entrega o trabalho',
    desc: 'Com o pagamento garantido, o freelancer foca 100% na qualidade. Envia a entrega pelo chat integrado da plataforma.',
    tag: 'Entrega',
  },
  {
    num: '04',
    color: 'bg-[#00C896]',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: 'Aprovação e pagamento liberado',
    desc: 'Cliente aprova a entrega e o pagamento é liberado na hora. Todos saem satisfeitos, com tudo documentado.',
    tag: 'Conclusão',
  },
];

const CLIENT_BENEFITS = [
  { icon: '🔒', title: 'Dinheiro protegido', desc: 'Seu pagamento só é liberado quando você aprovar a entrega.' },
  { icon: '📋', title: 'Contrato digital', desc: 'Tudo documentado: escopo, prazo e valor combinados por escrito.' },
  { icon: '⚖️', title: 'Mediação justa', desc: 'Em caso de conflito, nossa equipe analisa e resolve com imparcialidade.' },
  { icon: '💬', title: 'Comunicação centralizada', desc: 'Todo o histórico da negociação num só lugar.' },
];

const FREELANCER_BENEFITS = [
  { icon: '💰', title: 'Pagamento garantido', desc: 'O dinheiro já está depositado antes de você começar a trabalhar.' },
  { icon: '🚀', title: 'Propostas profissionais', desc: 'Crie propostas com aparência profissional em minutos.' },
  { icon: '🛡️', title: 'Proteção contra calote', desc: 'Chega de trabalhar sem saber se vai receber.' },
  { icon: '📈', title: 'Histórico de reputação', desc: 'Construa credibilidade com avaliações e projetos concluídos.' },
];

const TESTIMONIALS = [
  {
    name: 'Carla Mendes',
    role: 'Designer UI/UX • Freelancer',
    avatar: 'CM',
    color: 'bg-pink-500',
    text: 'Antes do FreelaPay eu já fui caloteada três vezes. Hoje trabalho tranquila porque sei que o dinheiro já está reservado antes de eu começar. Fechei mais de 40 projetos pela plataforma sem nenhum problema.',
    stars: 5,
    detail: 'Mais de 40 projetos concluídos',
  },
  {
    name: 'Rafael Oliveira',
    role: 'Dev Full-Stack • Freelancer',
    avatar: 'RO',
    color: 'bg-blue-500',
    text: 'Meu cliente ficou muito mais confiante em contratar porque sabia que o dinheiro estava seguro e só seria liberado após a entrega. A plataforma profissionalizou minha relação com clientes.',
    stars: 5,
    detail: 'Receita 3x maior após usar FreelaPay',
  },
  {
    name: 'Aline Torres',
    role: 'CEO • Contratante recorrente',
    avatar: 'AT',
    color: 'bg-purple-500',
    text: 'Contrato freelancers toda semana para a minha empresa. Com o FreelaPay, tenho controle total: sei exatamente o que foi combinado, tenho histórico de tudo e, se precisar, abro uma disputa. Nunca mais volto ao WhatsApp.',
    stars: 5,
    detail: 'Mais de 120 contratações realizadas',
  },
];

const FAQS = [
  {
    q: 'Como funciona o pagamento em custódia?',
    a: 'Quando o cliente aceita a proposta e efetua o pagamento, o valor fica retido numa conta de custódia do FreelaPay — não vai direto para o freelancer. Só depois que o cliente aprovar a entrega o dinheiro é liberado. Isso protege ambas as partes.',
  },
  {
    q: 'Quanto custa usar o FreelaPay?',
    a: 'Cadastro e uso da plataforma são 100% gratuitos. Cobramos apenas 5% de taxa sobre o valor das transações concluídas com sucesso. Se o projeto for cancelado ou reembolsado, não há cobrança.',
  },
  {
    q: 'O que acontece se o freelancer não entregar?',
    a: 'Se o freelancer não entregar dentro do prazo combinado ou entregar algo fora do escopo acordado, o cliente pode abrir uma disputa. Nossa equipe de mediadores analisa o caso e decide pela devolução total ou parcial do valor.',
  },
  {
    q: 'E se o cliente não aprovar a entrega sem motivo?',
    a: 'O freelancer também pode acionar a mediação se sentir que a recusa de aprovação não tem fundamento. Nossa equipe analisa as evidências (mensagens, arquivos, escopo original) e toma uma decisão justa para as duas partes.',
  },
  {
    q: 'Em quanto tempo recebo após a aprovação?',
    a: 'O pagamento é liberado instantaneamente após a aprovação. O saque para sua conta bancária ocorre em até 1 dia útil, dependendo do banco de destino.',
  },
];

/* ─────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────── */
function Stars({ count }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <svg key={i} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-gray-200 rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-gray-50 transition-colors"
      >
        <span className="font-semibold text-[#0A2540] pr-4">{q}</span>
        <span className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-all ${open ? 'bg-[#00C896] rotate-45' : 'bg-gray-100'}`}>
          <svg className={`w-4 h-4 ${open ? 'text-white' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </span>
      </button>
      {open && (
        <div className="px-6 pb-5 text-gray-600 text-sm leading-relaxed border-t border-gray-100 pt-4">
          {a}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   PAGE
───────────────────────────────────────────── */
export default function LandingPage() {
  return (
    <div className="font-sans text-gray-800 antialiased">

      {/* ════════════════ NAVBAR ════════════════ */}
      <header className="fixed top-0 inset-x-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-18 py-2">
          <a href="#inicio" className="flex items-center gap-2 flex-shrink-0">
            <img src="/logo.png" alt="FreelaPay" className="h-11 w-auto" />
          </a>
          <nav className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((l) => (
              <a key={l.href} href={l.href}
                className="text-sm font-medium text-gray-600 hover:text-[#0A2540] transition-colors">
                {l.label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <Link to="/login"
              className="hidden sm:inline-flex text-sm font-semibold text-[#0A2540] hover:text-[#00C896] transition-colors px-3 py-2">
              Entrar
            </Link>
            <Link to="/cadastro"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#00C896] text-white text-sm font-bold hover:bg-[#00b386] transition-all shadow-md shadow-[#00C896]/20 whitespace-nowrap">
              Criar conta grátis
            </Link>
          </div>
        </div>
      </header>

      {/* ════════════════ HERO ════════════════ */}
      <section id="inicio" className="pt-20 min-h-screen flex items-center bg-gradient-to-br from-[#0A2540] via-[#0e3068] to-[#0A2540] relative overflow-hidden">
        {/* bg orbs */}
        <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-[#00C896]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] border border-white/5 rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          {/* pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#00C896]/15 border border-[#00C896]/30 text-[#00C896] text-xs font-bold mb-8 tracking-wider uppercase">
            <span className="w-2 h-2 rounded-full bg-[#00C896] animate-pulse" />
            Plataforma brasileira de pagamentos seguros
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold text-white leading-tight mb-6 max-w-5xl mx-auto">
            Contrate Freelancers com{' '}
            <span className="relative inline-block">
              <span className="text-[#00C896]">Pagamento 100% Protegido</span>
              <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 300 8" preserveAspectRatio="none">
                <path d="M0 6 Q150 0 300 6" stroke="#00C896" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.5"/>
              </svg>
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed">
            O dinheiro fica em <strong className="text-white">custódia</strong> até o serviço ser entregue e aprovado.
            Chega de calotes, golpes e desentendimentos — <strong className="text-white">tanto para clientes quanto para freelancers</strong>.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-14">
            <Link to="/cadastro"
              className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-xl bg-[#00C896] text-white font-bold text-base hover:bg-[#00b386] transition-all shadow-xl shadow-[#00C896]/30 group">
              Contratar com Segurança
              <svg className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <Link to="/cadastro"
              className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-xl border-2 border-white/25 text-white font-bold text-base hover:bg-white/10 hover:border-white/40 transition-all">
              Quero Trabalhar como Freelancer
            </Link>
          </div>

          {/* Trust badges */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8">
            {[
              { icon: '🔒', label: 'Pagamento protegido' },
              { icon: '🇧🇷', label: 'Plataforma brasileira' },
              { icon: '⚡', label: 'Liberação instantânea' },
            ].map((b) => (
              <div key={b.label} className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2.5 rounded-xl border border-white/10">
                <span className="text-lg">{b.icon}</span>
                <span className="text-white text-sm font-semibold">{b.label}</span>
              </div>
            ))}
          </div>

          {/* Social proof numbers */}
          <div className="mt-16 pt-10 border-t border-white/10 grid grid-cols-3 gap-6 max-w-lg mx-auto">
            {[
              { val: '2.500+', label: 'Freelancers ativos' },
              { val: 'R$ 4M+', label: 'Transacionados' },
              { val: '98%', label: 'Satisfação' },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-3xl font-extrabold text-[#00C896]">{s.val}</p>
                <p className="text-xs text-gray-400 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ PROBLEMA ════════════════ */}
      <section className="py-24 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-red-400 font-bold text-sm uppercase tracking-widest mb-3">A realidade do mercado</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              Você já passou por alguma dessas situações?
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {PAINS.map((p) => (
              <div key={p.title}
                className="bg-gray-800/60 border border-gray-700/50 rounded-2xl p-7 hover:border-red-500/30 hover:bg-gray-800 transition-all">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-red-500/10 text-red-400 mb-5">
                  {p.icon}
                </div>
                <h3 className="text-lg font-bold text-white mb-3">{p.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed mb-4">{p.desc}</p>
                <p className="text-xs font-semibold text-red-400 bg-red-500/10 px-3 py-2 rounded-lg">
                  📊 {p.highlight}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <div className="inline-flex items-center gap-3 bg-[#00C896]/10 border border-[#00C896]/30 px-6 py-4 rounded-2xl">
              <span className="text-[#00C896] text-2xl">✓</span>
              <p className="text-white font-semibold">
                O FreelaPay resolve todos esses problemas — de uma vez por todas.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════ COMO FUNCIONA ════════════════ */}
      <section id="como-funciona" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-[#00C896] font-bold text-sm uppercase tracking-widest mb-3">Processo simples</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0A2540]">Como funciona</h2>
            <p className="mt-4 text-gray-500 max-w-xl mx-auto">
              Em 4 passos claros, ambos os lados ficam protegidos do início ao fim do projeto.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            {/* connector */}
            <div className="hidden lg:block absolute top-14 left-[calc(12.5%+1.5rem)] right-[calc(12.5%+1.5rem)] h-0.5 bg-gradient-to-r from-[#00C896]/30 via-[#00C896]/60 to-[#00C896]/30 z-0" />

            {STEPS.map((step) => (
              <div key={step.num}
                className="relative z-10 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all text-center">
                <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl ${step.color} text-white mb-4`}>
                  {step.icon}
                </div>
                <span className="inline-block px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-500 text-xs font-semibold mb-3">
                  {step.tag}
                </span>
                <span className="absolute top-4 right-5 text-4xl font-extrabold text-gray-50 select-none">{step.num}</span>
                <h3 className="font-bold text-[#0A2540] text-sm leading-snug mb-2">{step.title}</h3>
                <p className="text-gray-500 text-xs leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ BENEFÍCIOS ════════════════ */}
      <section id="beneficios" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-[#00C896] font-bold text-sm uppercase tracking-widest mb-3">Para todos</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0A2540]">
              Benefícios para cada lado
            </h2>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Cliente */}
            <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3 mb-7">
                <div className="w-10 h-10 rounded-xl bg-[#0A2540] flex items-center justify-center text-white text-lg">
                  🏢
                </div>
                <div>
                  <p className="font-extrabold text-[#0A2540] text-lg">Para Clientes</p>
                  <p className="text-gray-400 text-xs">Quem contrata serviços</p>
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                {CLIENT_BENEFITS.map((b) => (
                  <div key={b.title} className="flex gap-3">
                    <span className="text-2xl flex-shrink-0">{b.icon}</span>
                    <div>
                      <p className="font-semibold text-[#0A2540] text-sm">{b.title}</p>
                      <p className="text-gray-500 text-xs mt-0.5 leading-relaxed">{b.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-7">
                <Link to="/cadastro"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#0A2540] text-white text-sm font-bold hover:bg-[#0d3060] transition-colors">
                  Quero contratar com segurança
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
              </div>
            </div>

            {/* Freelancer */}
            <div className="bg-white rounded-3xl p-8 border border-[#00C896]/20 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-[#00C896]/5 rounded-full -mr-10 -mt-10 pointer-events-none" />
              <div className="flex items-center gap-3 mb-7">
                <div className="w-10 h-10 rounded-xl bg-[#00C896] flex items-center justify-center text-white text-lg">
                  💻
                </div>
                <div>
                  <p className="font-extrabold text-[#0A2540] text-lg">Para Freelancers</p>
                  <p className="text-gray-400 text-xs">Quem presta serviços</p>
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                {FREELANCER_BENEFITS.map((b) => (
                  <div key={b.title} className="flex gap-3">
                    <span className="text-2xl flex-shrink-0">{b.icon}</span>
                    <div>
                      <p className="font-semibold text-[#0A2540] text-sm">{b.title}</p>
                      <p className="text-gray-500 text-xs mt-0.5 leading-relaxed">{b.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-7">
                <Link to="/cadastro"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#00C896] text-white text-sm font-bold hover:bg-[#00b386] transition-colors shadow-md shadow-[#00C896]/20">
                  Quero trabalhar sem risco
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════ DEPOIMENTOS ════════════════ */}
      <section id="depoimentos" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-[#00C896] font-bold text-sm uppercase tracking-widest mb-3">Prova social</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0A2540]">
              Quem usa o FreelaPay aprova
            </h2>
            <div className="flex items-center justify-center gap-2 mt-4">
              <Stars count={5} />
              <span className="text-gray-500 text-sm font-medium">4.9 de 5 · mais de 1.200 avaliações</span>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <div key={t.name}
                className="bg-gray-50 rounded-2xl p-7 border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all flex flex-col">
                <Stars count={t.stars} />
                <p className="mt-4 text-gray-700 text-sm leading-relaxed flex-1">"{t.text}"</p>
                <div className="mt-6 pt-5 border-t border-gray-200 flex items-center gap-3">
                  <div className={`w-11 h-11 rounded-full ${t.color} flex items-center justify-center text-white text-sm font-extrabold flex-shrink-0`}>
                    {t.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-[#0A2540] text-sm">{t.name}</p>
                    <p className="text-xs text-gray-400 truncate">{t.role}</p>
                  </div>
                </div>
                <p className="mt-3 text-xs text-[#00C896] font-semibold bg-[#00C896]/10 px-3 py-1.5 rounded-lg">
                  ✓ {t.detail}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ PREÇOS ════════════════ */}
      <section id="precos" className="py-24 bg-gradient-to-br from-[#0A2540] via-[#0e3068] to-[#0A2540] relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_#00C89610_0%,_transparent_70%)] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-14">
            <p className="text-[#00C896] font-bold text-sm uppercase tracking-widest mb-3">Preço transparente</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              Sem mensalidade. Sem taxas escondidas.
            </h2>
            <p className="mt-4 text-gray-300 max-w-lg mx-auto">
              Você só paga quando fechar negócio. Se não transacionar, não paga nada.
            </p>
          </div>

          <div className="max-w-md mx-auto">
            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
              {/* header */}
              <div className="bg-gradient-to-r from-[#00C896] to-[#00b386] px-8 py-8 text-center">
                <span className="inline-block bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full mb-4 uppercase tracking-wider">
                  Plano único para todos
                </span>
                <div className="flex items-end justify-center gap-2">
                  <span className="text-white/80 text-lg font-semibold mb-1">Taxa de</span>
                  <span className="text-6xl font-extrabold text-white leading-none">5%</span>
                </div>
                <p className="text-white/80 text-sm mt-2">apenas sobre transações concluídas</p>
              </div>

              {/* features */}
              <div className="px-8 py-7 space-y-3.5">
                {[
                  { ok: true, text: 'Cadastro 100% gratuito' },
                  { ok: true, text: 'Pagamento em custódia incluído' },
                  { ok: true, text: 'Chat integrado ilimitado' },
                  { ok: true, text: 'Propostas ilimitadas' },
                  { ok: true, text: 'Mediação de disputas incluída' },
                  { ok: true, text: 'Suporte por e-mail e chat' },
                  { ok: false, text: 'Sem mensalidade fixa' },
                  { ok: false, text: 'Sem taxa por cancelamento' },
                ].map((f) => (
                  <div key={f.text} className="flex items-center gap-3">
                    <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${f.ok ? 'bg-[#00C896]/15' : 'bg-gray-100'}`}>
                      {f.ok
                        ? <svg className="w-3 h-3 text-[#00C896]" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                        : <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                      }
                    </div>
                    <span className="text-sm text-gray-700">{f.text}</span>
                  </div>
                ))}
              </div>

              <div className="px-8 pb-8">
                <Link to="/cadastro"
                  className="block w-full py-4 rounded-xl bg-[#0A2540] text-white font-bold text-sm text-center hover:bg-[#0d3060] transition-colors">
                  Criar conta grátis agora
                </Link>
                <p className="text-center text-xs text-gray-400 mt-3">
                  Sem cartão de crédito · Comece em 2 minutos
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════ FAQ ════════════════ */}
      <section id="faq" className="py-24 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-[#00C896] font-bold text-sm uppercase tracking-widest mb-3">Dúvidas frequentes</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0A2540]">
              Perguntas frequentes
            </h2>
          </div>
          <div className="space-y-3">
            {FAQS.map((faq) => (
              <FaqItem key={faq.q} q={faq.q} a={faq.a} />
            ))}
          </div>
          <p className="text-center text-sm text-gray-500 mt-8">
            Ainda tem dúvidas?{' '}
            <a href="mailto:suporte@freelapay.net.br" className="text-[#00C896] font-semibold hover:underline">
              Fale com nosso suporte
            </a>
          </p>
        </div>
      </section>

      {/* ════════════════ CTA FINAL ════════════════ */}
      <section className="py-24 bg-[#0A2540] relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_#00C89618_0%,_transparent_60%)] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#00C896]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <span className="inline-block text-4xl mb-6">🚀</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-5">
            Comece hoje a trabalhar{' '}
            <span className="text-[#00C896]">sem medo</span>
          </h2>
          <p className="text-gray-300 text-lg mb-10 max-w-xl mx-auto">
            Junte-se a milhares de freelancers e clientes que já transacionam com total segurança no FreelaPay.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/cadastro"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-[#00C896] text-white font-bold text-base hover:bg-[#00b386] transition-all shadow-xl shadow-[#00C896]/30 group">
              Criar conta grátis agora
              <svg className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <Link to="/login"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl border-2 border-white/20 text-white font-bold text-base hover:bg-white/10 transition-all">
              Já tenho conta
            </Link>
          </div>
          <p className="mt-6 text-sm text-gray-500">
            Sem cartão de crédito · Cadastro em 2 minutos · Suporte em português
          </p>
        </div>
      </section>

      {/* ════════════════ FOOTER ════════════════ */}
      <footer className="bg-gray-950 text-gray-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
            <div className="sm:col-span-2 lg:col-span-1">
              <img src="/logo.png" alt="FreelaPay" className="h-12 w-auto mb-4 brightness-0 invert" />
              <p className="text-sm leading-relaxed text-gray-500 max-w-xs">
                A plataforma brasileira mais segura para freelancers e clientes fecharem negócios com tranquilidade.
              </p>
              <a href="mailto:suporte@freelapay.net.br"
                className="inline-flex items-center gap-1.5 mt-4 text-sm text-[#00C896] hover:text-[#00b386] transition-colors font-medium">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                suporte@freelapay.net.br
              </a>
            </div>

            <div>
              <p className="text-white font-bold text-sm mb-5">Produto</p>
              <ul className="space-y-3 text-sm">
                <li><a href="#como-funciona" className="hover:text-[#00C896] transition-colors">Como funciona</a></li>
                <li><a href="#beneficios" className="hover:text-[#00C896] transition-colors">Benefícios</a></li>
                <li><a href="#precos" className="hover:text-[#00C896] transition-colors">Preços</a></li>
                <li><a href="#faq" className="hover:text-[#00C896] transition-colors">FAQ</a></li>
              </ul>
            </div>

            <div>
              <p className="text-white font-bold text-sm mb-5">Conta</p>
              <ul className="space-y-3 text-sm">
                <li><Link to="/cadastro" className="hover:text-[#00C896] transition-colors">Criar conta grátis</Link></li>
                <li><Link to="/login" className="hover:text-[#00C896] transition-colors">Fazer login</Link></li>
              </ul>
            </div>

            <div>
              <p className="text-white font-bold text-sm mb-5">Legal</p>
              <ul className="space-y-3 text-sm">
                <li><a href="#" className="hover:text-[#00C896] transition-colors">Termos de Uso</a></li>
                <li><a href="#" className="hover:text-[#00C896] transition-colors">Política de Privacidade</a></li>
                <li><a href="#" className="hover:text-[#00C896] transition-colors">Política de Cookies</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/5 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-600">
            <p>© {new Date().getFullYear()} FreelaPay. Todos os direitos reservados. CNPJ em processo de abertura.</p>
            <p className="flex items-center gap-1.5">
              Feito com <span className="text-red-500">♥</span> no Brasil 🇧🇷
            </p>
          </div>
        </div>
      </footer>

    </div>
  );
}
