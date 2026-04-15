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
    emoji: '😱',
    title: 'Medo de golpes',
    desc: 'Você paga adiantado e o freelancer some. Ou entrega algo completamente diferente do combinado.',
    stat: 'R$ 2,3 bi perdidos em golpes digitais em 2023',
  },
  {
    emoji: '💸',
    title: 'Clientes que não pagam',
    desc: 'Semanas de trabalho entregue e o cliente desaparece sem pagar, ou inventa defeitos para não liberar.',
    stat: '67% dos freelancers já sofreram calote',
  },
  {
    emoji: '😤',
    title: 'Sem proteção nem mediação',
    desc: 'Quando surge conflito, cada um fica por si mesmo. Sem contrato, sem árbitro, sem resolução.',
    stat: '80% das disputas ficam sem solução',
  },
];

const COMPARE_ROWS = [
  { label: 'Pagamento protegido em custódia', without: false, with: true },
  { label: 'Contrato digital documentado', without: false, with: true },
  { label: 'Garantia de entrega', without: false, with: true },
  { label: 'Mediação de conflitos', without: false, with: true },
  { label: 'Chat integrado com histórico', without: false, with: true },
  { label: 'Risco de calote ou golpe', without: true, with: false },
];

const STEPS = [
  {
    num: '1',
    color: 'from-blue-600 to-blue-700',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    title: 'Freelancer cria a proposta',
    desc: 'Define escopo, prazo e valor. O cliente recebe um link seguro para aceitar os termos.',
  },
  {
    num: '2',
    color: 'from-[#00C896] to-[#00b07e]',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
    title: 'Cliente paga — dinheiro bloqueado',
    desc: 'O valor fica retido em custódia no FreelaPay. Ninguém acessa até a entrega ser aprovada.',
  },
  {
    num: '3',
    color: 'from-purple-600 to-purple-700',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: 'Entrega e pagamento liberado',
    desc: 'Freelancer entrega, cliente aprova e o pagamento é liberado instantaneamente. Todos protegidos.',
  },
];

const TOP_FREELANCERS = [
  { initials: 'LF', color: 'bg-blue-500',   name: 'Lucas Ferreira',    area: 'Dev Full-Stack',   rating: 5.0, projects: 87, badge: 1 },
  { initials: 'AM', color: 'bg-pink-500',    name: 'Ana Moraes',        area: 'UI/UX Design',     rating: 5.0, projects: 74, badge: 2 },
  { initials: 'RO', color: 'bg-purple-500',  name: 'Rafael Oliveira',   area: 'Tráfego Pago',     rating: 4.9, projects: 63, badge: 3 },
  { initials: 'CS', color: 'bg-orange-500',  name: 'Carla Santos',      area: 'Social Media',     rating: 4.9, projects: 58, badge: null },
  { initials: 'MP', color: 'bg-green-600',   name: 'Marcos Pinto',      area: 'Dev Mobile',       rating: 4.8, projects: 52, badge: null },
  { initials: 'JL', color: 'bg-rose-500',    name: 'Julia Lima',        area: 'Redação/Copywrite', rating: 4.8, projects: 47, badge: null },
  { initials: 'TR', color: 'bg-teal-500',    name: 'Thiago Rocha',      area: 'Gestão de Projetos',rating: 4.7, projects: 41, badge: null },
  { initials: 'BS', color: 'bg-yellow-600',  name: 'Beatriz Souza',     area: 'Design Gráfico',   rating: 4.7, projects: 38, badge: null },
];

const CLIENT_BENEFITS = [
  { icon: '🔒', title: 'Dinheiro só sai com sua aprovação', desc: 'O pagamento fica retido até você confirmar que o serviço foi entregue conforme combinado.' },
  { icon: '📋', title: 'Contrato digital sempre documentado', desc: 'Escopo, prazo e valor registrados por escrito. Sem combinados verbais que se perdem.' },
  { icon: '⚖️', title: 'Mediação justa em conflitos', desc: 'Se surgir divergência, nossa equipe analisa as evidências e resolve com imparcialidade.' },
  { icon: '💬', title: 'Comunicação centralizada', desc: 'Histórico completo de mensagens e arquivos num único lugar, para consultar quando quiser.' },
];

const FREELANCER_BENEFITS = [
  { icon: '💰', title: 'Pagamento garantido antes de começar', desc: 'O dinheiro já está depositado quando você inicia o trabalho. Chega de correr risco.' },
  { icon: '📄', title: 'Proposta profissional em minutos', desc: 'Crie propostas com visual clean que impressionam clientes e fecham negócios mais rápido.' },
  { icon: '🛡️', title: 'Proteção total contra calote', desc: 'Nunca mais trabalhe sem a certeza de que vai receber. Período.' },
  { icon: '⭐', title: 'Construa sua reputação', desc: 'Avaliações e projetos concluídos visíveis para novos clientes. Cada entrega vira portfólio.' },
];

const TESTIMONIALS = [
  {
    name: 'Carla Mendes',
    role: 'Designer UI/UX • Freelancer',
    avatar: 'CM', color: 'bg-pink-500',
    text: 'Antes do FreelaPay eu já fui caloteada três vezes. Hoje trabalho tranquila porque sei que o dinheiro já está reservado antes de eu começar. Fechei mais de 40 projetos sem nenhum problema.',
    detail: '+40 projetos concluídos',
  },
  {
    name: 'Rafael Oliveira',
    role: 'Dev Full-Stack • Freelancer',
    avatar: 'RO', color: 'bg-blue-500',
    text: 'Meu cliente ficou muito mais confiante em contratar porque sabia que o dinheiro estava seguro. A plataforma profissionalizou minha relação com clientes completamente.',
    detail: 'Receita 3x maior',
  },
  {
    name: 'Aline Torres',
    role: 'CEO • Contratante recorrente',
    avatar: 'AT', color: 'bg-purple-500',
    text: 'Contrato freelancers toda semana. Com o FreelaPay tenho controle total, histórico de tudo e mediação quando preciso. Nunca mais contrato fora da plataforma.',
    detail: '+120 contratações realizadas',
  },
];

const FAQS = [
  {
    q: 'Como funciona o pagamento em custódia?',
    a: 'Quando o cliente aceita a proposta e paga, o valor fica retido numa conta de custódia do FreelaPay — não vai direto para o freelancer. Só após o cliente aprovar a entrega o dinheiro é liberado. Isso protege ambos os lados.',
  },
  {
    q: 'Quanto custa usar o FreelaPay?',
    a: 'Cadastro e uso da plataforma são 100% gratuitos. Cobramos apenas 5% de taxa sobre o valor das transações concluídas com sucesso. Se o projeto for cancelado ou reembolsado, não há cobrança alguma.',
  },
  {
    q: 'O que acontece se o freelancer não entregar?',
    a: 'Se o freelancer não entregar dentro do prazo ou entregar algo fora do escopo acordado, o cliente abre uma disputa. Nossa equipe analisa o caso e decide pela devolução total ou parcial.',
  },
  {
    q: 'E se o cliente não aprovar sem motivo?',
    a: 'O freelancer também pode acionar mediação se a recusa não tiver fundamento. Nossa equipe analisa as evidências (mensagens, arquivos, escopo original) e toma decisão justa para as duas partes.',
  },
  {
    q: 'Em quanto tempo recebo após a aprovação?',
    a: 'O pagamento é liberado instantaneamente após a aprovação. O saque para sua conta bancária ocorre em até 1 dia útil, dependendo do banco de destino.',
  },
];

/* ─────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────── */
function Stars({ rating }) {
  return (
    <div className="flex items-center gap-1">
      {[1,2,3,4,5].map(i => (
        <svg key={i} className="w-3.5 h-3.5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      <span className="text-xs font-semibold text-gray-700 ml-0.5">{rating.toFixed(1)}</span>
    </div>
  );
}

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-gray-200 rounded-2xl overflow-hidden">
      <button onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-gray-50 transition-colors gap-4">
        <span className="font-semibold text-[#0A2540]">{q}</span>
        <span className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 ${open ? 'bg-[#00C896] rotate-45' : 'bg-gray-100'}`}>
          <svg className={`w-4 h-4 ${open ? 'text-white' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </span>
      </button>
      {open && (
        <div className="px-6 pb-5 text-gray-600 text-sm leading-relaxed border-t border-gray-100 pt-4">{a}</div>
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

      {/* ════ NAVBAR ════ */}
      <header className="fixed top-0 inset-x-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between py-3">
          <a href="#inicio">
            <img src="/logo.png" alt="FreelaPay" className="h-12 w-auto" />
          </a>
          <nav className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map(l => (
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
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#00C896] text-white text-sm font-bold hover:bg-[#00b386] transition-all shadow-md shadow-[#00C896]/25">
              Criar conta grátis
            </Link>
          </div>
        </div>
      </header>

      {/* ════ HERO ════ */}
      <section id="inicio" className="pt-20 min-h-screen flex items-center bg-gradient-to-br from-[#0A2540] via-[#0d2f5c] to-[#0A2540] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#00C896]/8 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-700/10 rounded-full blur-3xl pointer-events-none" />
        {/* grid overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 grid lg:grid-cols-2 gap-16 items-center w-full">
          {/* Left text */}
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#00C896]/15 border border-[#00C896]/25 text-[#00C896] text-xs font-bold mb-8 tracking-wider uppercase">
              <span className="w-2 h-2 rounded-full bg-[#00C896] animate-pulse" />
              Plataforma brasileira de pagamentos seguros
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-[3.25rem] font-extrabold text-white leading-[1.1] mb-6">
              Segurança total para{' '}
              <span className="text-[#00C896]">contratar ou trabalhar</span>{' '}
              como freelancer no Brasil
            </h1>

            <p className="text-lg text-gray-300 mb-3 leading-relaxed">
              O pagamento só é liberado após a entrega do serviço.
            </p>
            <p className="text-base text-gray-400 mb-10 leading-relaxed">
              Custódia, contrato digital, chat integrado e mediação de disputas — tudo numa só plataforma.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Link to="/cadastro"
                className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-xl bg-[#00C896] text-white font-bold text-base hover:bg-[#00b386] transition-all shadow-xl shadow-[#00C896]/30 group">
                Contratar com Segurança
                <svg className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link to="/cadastro"
                className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-xl border-2 border-white/20 text-white font-bold text-base hover:bg-white/8 hover:border-white/35 transition-all">
                Quero Trabalhar como Freelancer
              </Link>
            </div>

            {/* badges */}
            <div className="flex flex-wrap gap-3">
              {[
                { icon: '🔒', label: 'Pagamento Escrow' },
                { icon: '🛡️', label: 'Antifraude' },
                { icon: '🇧🇷', label: '100% Brasileiro' },
              ].map(b => (
                <div key={b.label} className="flex items-center gap-2 bg-white/8 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/10">
                  <span className="text-base">{b.icon}</span>
                  <span className="text-white text-xs font-semibold">{b.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right — mockup card */}
          <div className="hidden lg:flex justify-center items-center">
            <div className="relative w-full max-w-[380px]">
              {/* main card */}
              <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
                <div className="bg-gradient-to-r from-[#0A2540] to-[#0d3060] px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#00C896]" />
                    <span className="text-white text-xs font-semibold">FreelaPay</span>
                  </div>
                  <span className="text-xs bg-[#00C896]/20 text-[#00C896] px-2 py-0.5 rounded-full font-bold">Em custódia</span>
                </div>
                <div className="px-6 py-5 space-y-4">
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Projeto</p>
                    <p className="font-bold text-[#0A2540]">Desenvolvimento de E-commerce</p>
                  </div>
                  <div className="flex justify-between">
                    <div>
                      <p className="text-xs text-gray-400">Freelancer</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">LF</div>
                        <span className="text-sm font-medium text-[#0A2540]">Lucas Ferreira</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-400">Valor protegido</p>
                      <p className="text-2xl font-extrabold text-[#0A2540] mt-0.5">R$ 4.800</p>
                    </div>
                  </div>
                  <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                    <div className="h-full w-[65%] bg-gradient-to-r from-[#00C896] to-[#00b07e] rounded-full" />
                  </div>
                  <p className="text-xs text-gray-400">Progresso: 65% concluído</p>
                  <button className="w-full py-3 rounded-xl bg-[#00C896] text-white font-bold text-sm hover:bg-[#00b386] transition-colors">
                    Aprovar entrega e liberar pagamento
                  </button>
                </div>
              </div>
              {/* floating badges */}
              <div className="absolute -top-5 -right-5 bg-[#00C896] text-white text-xs font-bold px-3 py-2 rounded-xl shadow-lg shadow-[#00C896]/30">
                ✓ Pagamento garantido
              </div>
              <div className="absolute -bottom-4 -left-4 bg-white text-[#0A2540] text-xs font-bold px-3 py-2 rounded-xl shadow-xl border border-gray-100">
                🔒 Dinheiro em custódia
              </div>
            </div>
          </div>
        </div>

        {/* stats bar */}
        <div className="absolute bottom-0 inset-x-0 border-t border-white/8 bg-white/4 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 grid grid-cols-3 gap-4 text-center">
            {[
              { val: '2.500+', label: 'Freelancers ativos' },
              { val: 'R$ 4M+', label: 'Transacionados com segurança' },
              { val: '98%', label: 'Taxa de satisfação' },
            ].map(s => (
              <div key={s.label}>
                <p className="text-xl sm:text-2xl font-extrabold text-[#00C896]">{s.val}</p>
                <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════ PROBLEMA ════ */}
      <section className="py-24 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-red-400 font-bold text-sm uppercase tracking-widest mb-3">A realidade</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              Cansado de correr riscos?
            </h2>
            <p className="text-gray-400 mt-4 max-w-xl mx-auto">
              Quem trabalha como freelancer ou contrata serviços online sabe bem essas dores.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {PAINS.map(p => (
              <div key={p.title}
                className="bg-gray-800/60 border border-gray-700/40 rounded-2xl p-7 hover:border-red-500/30 hover:bg-gray-800 transition-all group">
                <div className="text-4xl mb-4">{p.emoji}</div>
                <h3 className="text-lg font-bold text-white mb-3">{p.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed mb-4">{p.desc}</p>
                <p className="text-xs font-semibold text-red-400 bg-red-500/10 px-3 py-2 rounded-lg">
                  📊 {p.stat}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-12 text-center">
            <div className="inline-flex items-center gap-3 bg-[#00C896]/10 border border-[#00C896]/25 px-6 py-4 rounded-2xl">
              <span className="text-[#00C896] text-xl">✓</span>
              <p className="text-white font-semibold">O FreelaPay resolve todos esses problemas — de uma vez por todas.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ════ COMPARAÇÃO ════ */}
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-[#00C896] font-bold text-sm uppercase tracking-widest mb-3">Comparativo</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0A2540]">
              Sem FreelaPay vs Com FreelaPay
            </h2>
          </div>
          <div className="rounded-3xl overflow-hidden border border-gray-100 shadow-lg">
            {/* header */}
            <div className="grid grid-cols-3 bg-gray-50 border-b border-gray-100">
              <div className="py-4 px-6 text-sm font-semibold text-gray-500">Situação</div>
              <div className="py-4 px-6 text-center text-sm font-bold text-red-500 border-l border-gray-100">Sem FreelaPay</div>
              <div className="py-4 px-6 text-center text-sm font-bold text-[#00C896] border-l border-gray-100">Com FreelaPay</div>
            </div>
            {COMPARE_ROWS.map((row, i) => (
              <div key={row.label}
                className={`grid grid-cols-3 border-b border-gray-100 last:border-0 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                <div className="py-4 px-6 text-sm text-gray-700 font-medium flex items-center">{row.label}</div>
                <div className="py-4 px-6 flex items-center justify-center border-l border-gray-100">
                  {row.without
                    ? <span className="w-7 h-7 rounded-full bg-red-100 flex items-center justify-center"><svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg></span>
                    : <span className="w-7 h-7 rounded-full bg-red-100 flex items-center justify-center"><svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg></span>
                  }
                </div>
                <div className="py-4 px-6 flex items-center justify-center border-l border-gray-100">
                  {row.with
                    ? <span className="w-7 h-7 rounded-full bg-[#00C896]/15 flex items-center justify-center"><svg className="w-4 h-4 text-[#00C896]" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg></span>
                    : <span className="w-7 h-7 rounded-full bg-red-100 flex items-center justify-center"><svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg></span>
                  }
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════ COMO FUNCIONA ════ */}
      <section id="como-funciona" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-[#00C896] font-bold text-sm uppercase tracking-widest mb-3">Processo transparente</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0A2540]">Como funciona</h2>
            <p className="mt-4 text-gray-500 max-w-lg mx-auto">3 passos simples que garantem a segurança de todos.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-4 relative">
            {/* arrows */}
            <div className="hidden md:flex absolute top-16 left-[calc(33.33%-0px)] items-center justify-center w-[calc(33.33%)] z-10 pointer-events-none">
              <svg className="w-10 h-10 text-[#00C896]/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </div>
            <div className="hidden md:flex absolute top-16 left-[calc(66.66%-0px)] items-center justify-center w-[calc(33.33%)] z-10 pointer-events-none">
              <svg className="w-10 h-10 text-[#00C896]/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </div>
            {STEPS.map(step => (
              <div key={step.num}
                className="relative bg-white rounded-2xl p-8 border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all text-center z-0">
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${step.color} text-white mb-5 shadow-lg`}>
                  {step.icon}
                </div>
                <div className="absolute top-5 right-5 text-5xl font-extrabold text-gray-50 select-none leading-none">{step.num}</div>
                <h3 className="font-bold text-[#0A2540] text-base mb-3">{step.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════ TOP FREELANCERS ════ */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
            <div>
              <p className="text-[#00C896] font-bold text-sm uppercase tracking-widest mb-2">Talentos verificados</p>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0A2540]">Top Freelancers</h2>
              <p className="text-gray-500 mt-2">Os profissionais mais bem avaliados da plataforma</p>
            </div>
            <Link to="/cadastro"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-[#0A2540] text-[#0A2540] font-bold text-sm hover:bg-[#0A2540] hover:text-white transition-all">
              Ver todos
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {TOP_FREELANCERS.map(f => (
              <div key={f.name}
                className="relative bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
                {f.badge && (
                  <div className={`absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center text-xs font-extrabold text-white shadow-sm ${
                    f.badge === 1 ? 'bg-yellow-500' : f.badge === 2 ? 'bg-gray-400' : 'bg-orange-500'
                  }`}>
                    #{f.badge}
                  </div>
                )}
                <div className={`w-14 h-14 rounded-2xl ${f.color} flex items-center justify-center text-white font-extrabold text-lg mb-4`}>
                  {f.initials}
                </div>
                <p className="font-bold text-[#0A2540] text-sm">{f.name}</p>
                <p className="text-xs text-gray-500 mb-2">{f.area}</p>
                <Stars rating={f.rating} />
                <p className="text-xs text-gray-400 mt-1.5">{f.projects} projetos concluídos</p>
                <Link to="/cadastro"
                  className="mt-4 block w-full py-2 rounded-lg bg-[#0A2540] text-white text-xs font-bold text-center hover:bg-[#0d3060] transition-colors">
                  Contratar
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════ BENEFÍCIOS ════ */}
      <section id="beneficios" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-[#00C896] font-bold text-sm uppercase tracking-widest mb-3">Para todos</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0A2540]">Benefícios para cada lado</h2>
          </div>
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Cliente */}
            <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3 mb-7">
                <div className="w-11 h-11 rounded-xl bg-[#0A2540] flex items-center justify-center text-xl">🏢</div>
                <div>
                  <p className="font-extrabold text-[#0A2540] text-lg">Para Clientes</p>
                  <p className="text-gray-400 text-xs">Quem contrata serviços</p>
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-5">
                {CLIENT_BENEFITS.map(b => (
                  <div key={b.title} className="flex gap-3">
                    <span className="text-2xl flex-shrink-0">{b.icon}</span>
                    <div>
                      <p className="font-semibold text-[#0A2540] text-sm">{b.title}</p>
                      <p className="text-gray-500 text-xs mt-0.5 leading-relaxed">{b.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Link to="/cadastro"
                className="mt-7 inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#0A2540] text-white text-sm font-bold hover:bg-[#0d3060] transition-colors">
                Quero contratar com segurança
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>

            {/* Freelancer */}
            <div className="bg-white rounded-3xl p-8 border border-[#00C896]/20 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-[#00C896]/5 rounded-full -mr-8 -mt-8 pointer-events-none" />
              <div className="flex items-center gap-3 mb-7">
                <div className="w-11 h-11 rounded-xl bg-[#00C896] flex items-center justify-center text-xl">💻</div>
                <div>
                  <p className="font-extrabold text-[#0A2540] text-lg">Para Freelancers</p>
                  <p className="text-gray-400 text-xs">Quem presta serviços</p>
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-5">
                {FREELANCER_BENEFITS.map(b => (
                  <div key={b.title} className="flex gap-3">
                    <span className="text-2xl flex-shrink-0">{b.icon}</span>
                    <div>
                      <p className="font-semibold text-[#0A2540] text-sm">{b.title}</p>
                      <p className="text-gray-500 text-xs mt-0.5 leading-relaxed">{b.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Link to="/cadastro"
                className="mt-7 inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#00C896] text-white text-sm font-bold hover:bg-[#00b386] transition-colors shadow-md shadow-[#00C896]/20">
                Quero trabalhar sem risco
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ════ DEPOIMENTOS ════ */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-[#00C896] font-bold text-sm uppercase tracking-widest mb-3">Prova social</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0A2540]">Quem usa o FreelaPay aprova</h2>
            <div className="flex items-center justify-center gap-2 mt-4">
              {[1,2,3,4,5].map(i => (
                <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
              <span className="text-gray-500 text-sm font-medium ml-1">4.9 de 5 · +1.200 avaliações</span>
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map(t => (
              <div key={t.name}
                className="bg-gray-50 rounded-2xl p-7 border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all flex flex-col">
                <div className="flex gap-0.5 mb-4">
                  {[1,2,3,4,5].map(i => (
                    <svg key={i} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-700 text-sm leading-relaxed flex-1">"{t.text}"</p>
                <div className="mt-5 pt-5 border-t border-gray-200 flex items-center gap-3">
                  <div className={`w-11 h-11 rounded-full ${t.color} flex items-center justify-center text-white text-sm font-extrabold flex-shrink-0`}>
                    {t.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-[#0A2540] text-sm">{t.name}</p>
                    <p className="text-xs text-gray-400 truncate">{t.role}</p>
                  </div>
                </div>
                <p className="mt-3 text-xs text-[#00C896] font-semibold bg-[#00C896]/10 px-3 py-1.5 rounded-lg">✓ {t.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════ PREÇOS ════ */}
      <section id="precos" className="py-24 bg-gradient-to-br from-[#0A2540] via-[#0e3068] to-[#0A2540] relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_#00C89610_0%,_transparent_70%)] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-14">
            <p className="text-[#00C896] font-bold text-sm uppercase tracking-widest mb-3">Preço justo e transparente</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">Sem mensalidade. Sem surpresas.</h2>
            <p className="text-gray-300 mt-4 max-w-md mx-auto">Você só paga quando fechar negócio com sucesso.</p>
          </div>
          <div className="max-w-sm mx-auto">
            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
              <div className="bg-gradient-to-r from-[#00C896] to-[#00b07e] px-8 py-8 text-center">
                <span className="inline-block bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full mb-4 uppercase tracking-wider">Plano único para todos</span>
                <p className="text-white/80 text-sm mb-1">Apenas</p>
                <div className="flex items-end justify-center gap-1">
                  <span className="text-6xl font-extrabold text-white leading-none">5%</span>
                </div>
                <p className="text-white/80 text-sm mt-2">por transação concluída</p>
              </div>
              <div className="px-8 py-6 space-y-3">
                {[
                  { ok: true,  text: 'Cadastro 100% gratuito' },
                  { ok: true,  text: 'Custódia inclusa em toda transação' },
                  { ok: true,  text: 'Chat integrado ilimitado' },
                  { ok: true,  text: 'Propostas ilimitadas' },
                  { ok: true,  text: 'Mediação de disputas inclusa' },
                  { ok: false, text: 'Sem mensalidade fixa' },
                  { ok: false, text: 'Sem taxa de cancelamento' },
                ].map(f => (
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
                <p className="text-center text-xs text-gray-400 mt-3">Sem cartão · Começa em 2 minutos</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════ FAQ ════ */}
      <section id="faq" className="py-24 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-[#00C896] font-bold text-sm uppercase tracking-widest mb-3">Dúvidas</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0A2540]">Perguntas frequentes</h2>
          </div>
          <div className="space-y-3">
            {FAQS.map(faq => <FaqItem key={faq.q} q={faq.q} a={faq.a} />)}
          </div>
          <p className="text-center text-sm text-gray-500 mt-8">
            Ainda com dúvidas?{' '}
            <a href="mailto:suporte@freelapay.net.br" className="text-[#00C896] font-semibold hover:underline">
              Fale com nosso suporte
            </a>
          </p>
        </div>
      </section>

      {/* ════ CTA FINAL ════ */}
      <section className="py-28 bg-[#0A2540] relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_#00C89618_0%,_transparent_55%)] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#00C896]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#00C896]/15 mb-6">
            <span className="text-3xl">🚀</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-5">
            Comece hoje a trabalhar{' '}
            <span className="text-[#00C896]">sem medo</span>
          </h2>
          <p className="text-gray-300 text-lg mb-10 max-w-xl mx-auto leading-relaxed">
            Junte-se a milhares de freelancers e clientes que já transacionam com total segurança. O primeiro passo é gratuito.
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
              className="inline-flex items-center justify-center px-8 py-4 rounded-xl border-2 border-white/20 text-white font-bold text-base hover:bg-white/8 transition-all">
              Já tenho conta
            </Link>
          </div>
          <p className="mt-6 text-sm text-gray-500">Sem cartão de crédito · Cadastro em 2 minutos · Suporte em português</p>
        </div>
      </section>

      {/* ════ FOOTER ════ */}
      <footer className="bg-gray-950 text-gray-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
            <div className="sm:col-span-2 lg:col-span-1">
              <img src="/logo.png" alt="FreelaPay" className="h-13 w-auto mb-4 brightness-0 invert" style={{height:'3.25rem'}} />
              <p className="text-sm leading-relaxed text-gray-500 max-w-xs mb-4">
                A plataforma brasileira mais segura para freelancers e clientes fecharem negócios com total tranquilidade.
              </p>
              <a href="mailto:suporte@freelapay.net.br"
                className="inline-flex items-center gap-1.5 text-sm text-[#00C896] hover:text-[#00b386] transition-colors font-medium">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                suporte@freelapay.net.br
              </a>
            </div>
            <div>
              <p className="text-white font-bold text-sm mb-5">Produto</p>
              <ul className="space-y-3 text-sm">
                {[['#como-funciona','Como funciona'],['#beneficios','Benefícios'],['#precos','Preços'],['#faq','FAQ']].map(([h,l]) => (
                  <li key={h}><a href={h} className="hover:text-[#00C896] transition-colors">{l}</a></li>
                ))}
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
            <div className="flex flex-col sm:flex-row gap-1 sm:gap-4 text-center sm:text-left">
              <p>© {new Date().getFullYear()} FreelaPay Tecnologia Ltda. Todos os direitos reservados.</p>
              <p>CNPJ: 00.000.000/0001-00 · São Paulo, SP</p>
            </div>
            <p className="flex items-center gap-1.5">Feito com <span className="text-red-500">♥</span> no Brasil 🇧🇷</p>
          </div>
        </div>
      </footer>

    </div>
  );
}
