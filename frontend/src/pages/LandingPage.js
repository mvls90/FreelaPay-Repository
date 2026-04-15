import { Link } from 'react-router-dom';

const NAV_LINKS = [
  { label: 'Como Funciona', href: '#como-funciona' },
  { label: 'Benefícios', href: '#beneficios' },
  { label: 'Preços', href: '#precos' },
  { label: 'Depoimentos', href: '#depoimentos' },
];

const STEPS = [
  {
    num: '01',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    title: 'Freelancer cria a proposta',
    desc: 'O freelancer detalha o escopo do projeto, valor e prazo. O cliente recebe um link seguro para revisar e aceitar os termos.',
  },
  {
    num: '02',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    title: 'Cliente paga com segurança',
    desc: 'O valor é depositado em custódia no FreelaPay. O dinheiro fica protegido e só é liberado após a entrega aprovada.',
  },
  {
    num: '03',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: 'Freelancer recebe após aprovação',
    desc: 'Com o trabalho entregue e aprovado pelo cliente, o pagamento é liberado instantaneamente para o freelancer.',
  },
];

const BENEFITS = [
  {
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
    title: 'Pagamento em Custódia',
    desc: 'O dinheiro fica retido com segurança até a conclusão e aprovação do serviço. Ninguém sai no prejuízo.',
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    title: 'Proteção Contra Golpes',
    desc: 'Chega de calotes e fraudes. Garantimos que o freelancer entrega antes de receber e o cliente não paga pelo ar.',
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M8 12h.01M12 12h.01M16 12h.01M21 3H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z" />
      </svg>
    ),
    title: 'Chat Integrado',
    desc: 'Comunicação direta entre freelancer e cliente dentro da plataforma, com histórico completo e arquivos compartilhados.',
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
      </svg>
    ),
    title: 'Mediação de Disputas',
    desc: 'Em caso de conflito, nossa equipe de mediadores analisa o caso com imparcialidade e resolve com justiça.',
  },
];

const TESTIMONIALS = [
  {
    name: 'Carla Mendes',
    role: 'Designer UI/UX',
    avatar: 'CM',
    text: 'Antes do FreelaPay eu sempre tinha medo de não receber. Agora trabalho tranquila sabendo que o dinheiro está garantido. Já fechei mais de 30 projetos pela plataforma!',
    stars: 5,
  },
  {
    name: 'Rafael Oliveira',
    role: 'Desenvolvedor Full-Stack',
    avatar: 'RO',
    text: 'A plataforma é simples e profissional. Meu cliente ficou super confiante em pagar porque o dinheiro ficou em custódia. Recomendo para todo freelancer.',
    stars: 5,
  },
  {
    name: 'Aline Torres',
    role: 'Empresária — Contratante',
    avatar: 'AT',
    text: 'Contrato freelancers regularmente e o FreelaPay me dá segurança total. Se o serviço não for entregue conforme combinado, sei que tenho proteção. Nunca mais contrato de outra forma.',
    stars: 5,
  },
];

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

export default function LandingPage() {
  return (
    <div className="font-sans text-gray-800 antialiased">
      {/* ── Navbar ── */}
      <header className="fixed top-0 inset-x-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <a href="#inicio" className="flex items-center gap-2">
            <img src="/logo.png" alt="FreelaPay" className="h-8 w-auto" />
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
              className="hidden sm:inline-flex text-sm font-medium text-[#0A2540] hover:text-[#00C896] transition-colors">
              Entrar
            </Link>
            <Link to="/cadastro"
              className="inline-flex items-center px-4 py-2 rounded-lg bg-[#00C896] text-white text-sm font-semibold hover:bg-[#00b386] transition-colors shadow-sm">
              Criar conta grátis
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section id="inicio" className="pt-16 min-h-screen flex items-center bg-gradient-to-br from-[#0A2540] via-[#0d3060] to-[#0A2540] relative overflow-hidden">
        {/* decorative circles */}
        <div className="absolute top-20 right-0 w-96 h-96 bg-[#00C896]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#00C896]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 grid lg:grid-cols-2 gap-16 items-center">
          {/* Text */}
          <div>
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00C896]/20 text-[#00C896] text-xs font-semibold mb-6">
              <span className="w-2 h-2 rounded-full bg-[#00C896] animate-pulse" />
              Plataforma 100% segura para freelancers
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-6">
              Trabalhe livre,{' '}
              <span className="text-[#00C896]">receba com segurança</span>
            </h1>
            <p className="text-lg text-gray-300 mb-8 max-w-lg">
              O FreelaPay protege cada transação entre freelancer e cliente com
              pagamento em <strong className="text-white">custódia</strong>.
              Você entrega o trabalho, o dinheiro já está garantido.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/cadastro"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#00C896] text-white font-bold text-base hover:bg-[#00b386] transition-all shadow-lg shadow-[#00C896]/30">
                Começar agora — é grátis
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <a href="#como-funciona"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border border-white/20 text-white font-semibold text-base hover:bg-white/10 transition-all">
                Ver como funciona
              </a>
            </div>
            {/* trust bar */}
            <div className="mt-12 flex flex-wrap gap-6">
              {[
                { val: '2.500+', label: 'Freelancers ativos' },
                { val: 'R$ 4M+', label: 'Transacionados' },
                { val: '98%', label: 'Satisfação' },
              ].map((s) => (
                <div key={s.label}>
                  <p className="text-2xl font-extrabold text-[#00C896]">{s.val}</p>
                  <p className="text-xs text-gray-400">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Card mockup */}
          <div className="hidden lg:flex justify-center">
            <div className="relative w-full max-w-md">
              <div className="bg-white rounded-2xl shadow-2xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-500">Proposta #0042</span>
                  <span className="px-2.5 py-1 rounded-full bg-[#00C896]/15 text-[#00C896] text-xs font-bold">Em custódia</span>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Serviço</p>
                  <p className="font-semibold text-[#0A2540]">Desenvolvimento de Landing Page</p>
                </div>
                <div className="flex justify-between items-end border-t pt-4">
                  <div>
                    <p className="text-xs text-gray-400">Freelancer</p>
                    <p className="font-medium text-[#0A2540]">Ana Costa</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400">Valor protegido</p>
                    <p className="text-2xl font-extrabold text-[#0A2540]">R$ 2.500</p>
                  </div>
                </div>
                <button className="w-full py-3 rounded-xl bg-[#0A2540] text-white font-bold text-sm">
                  Aprovar entrega e liberar pagamento
                </button>
              </div>
              {/* floating badge */}
              <div className="absolute -top-4 -right-4 bg-[#00C896] text-white text-xs font-bold px-3 py-2 rounded-xl shadow-lg shadow-[#00C896]/30">
                ✓ Pagamento garantido
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Como Funciona ── */}
      <section id="como-funciona" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-[#00C896] font-semibold text-sm uppercase tracking-widest mb-3">Simples e transparente</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0A2540]">Como funciona</h2>
            <p className="mt-4 text-gray-500 max-w-xl mx-auto">
              Em 3 passos simples, freelancers e clientes trabalham com total segurança.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* connector line */}
            <div className="hidden md:block absolute top-16 left-1/3 right-1/3 h-0.5 bg-gradient-to-r from-[#00C896]/30 to-[#00C896]/30" />

            {STEPS.map((step) => (
              <div key={step.num} className="relative bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#0A2540] text-[#00C896] mb-6">
                  {step.icon}
                </div>
                <span className="absolute top-6 right-6 text-4xl font-extrabold text-gray-100">{step.num}</span>
                <h3 className="text-lg font-bold text-[#0A2540] mb-3">{step.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Benefícios ── */}
      <section id="beneficios" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-[#00C896] font-semibold text-sm uppercase tracking-widest mb-3">Por que escolher</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0A2540]">
              Tudo o que você precisa para trabalhar sem medo
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {BENEFITS.map((b) => (
              <div key={b.title}
                className="group p-6 rounded-2xl border border-gray-100 hover:border-[#00C896]/30 hover:shadow-lg hover:-translate-y-1 transition-all">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#00C896]/10 text-[#00C896] mb-4 group-hover:bg-[#00C896] group-hover:text-white transition-colors">
                  {b.icon}
                </div>
                <h3 className="font-bold text-[#0A2540] mb-2">{b.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Preços ── */}
      <section id="precos" className="py-24 bg-gradient-to-br from-[#0A2540] to-[#0d3060]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-[#00C896] font-semibold text-sm uppercase tracking-widest mb-3">Preço justo</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
            Sem mensalidade. Sem surpresas.
          </h2>
          <p className="text-gray-300 mb-12 max-w-md mx-auto">
            Você só paga quando fechar negócio. Simples assim.
          </p>

          <div className="max-w-sm mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden">
            <div className="bg-[#00C896] py-6 px-8">
              <p className="text-white font-semibold text-sm">Plano único</p>
              <p className="text-5xl font-extrabold text-white mt-2">5%</p>
              <p className="text-white/80 text-sm mt-1">por transação concluída</p>
            </div>
            <div className="py-8 px-8 space-y-4">
              {[
                'Sem mensalidade fixa',
                'Pagamento em custódia incluído',
                'Chat integrado ilimitado',
                'Mediação de disputas',
                'Propostas ilimitadas',
                'Suporte por e-mail e chat',
              ].map((f) => (
                <div key={f} className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-[#00C896]/15 flex items-center justify-center">
                    <svg className="w-3 h-3 text-[#00C896]" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-sm text-gray-700">{f}</span>
                </div>
              ))}
            </div>
            <div className="px-8 pb-8">
              <Link to="/cadastro"
                className="block w-full py-3.5 rounded-xl bg-[#0A2540] text-white font-bold text-sm text-center hover:bg-[#0d3060] transition-colors">
                Criar minha conta grátis
              </Link>
            </div>
          </div>

          <p className="mt-8 text-gray-400 text-sm">
            A taxa de 5% é cobrada apenas sobre transações concluídas com sucesso.
          </p>
        </div>
      </section>

      {/* ── Depoimentos ── */}
      <section id="depoimentos" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-[#00C896] font-semibold text-sm uppercase tracking-widest mb-3">Quem usa aprova</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0A2540]">
              O que dizem sobre o FreelaPay
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="bg-white rounded-2xl p-7 shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col">
                <Stars count={t.stars} />
                <p className="mt-4 text-gray-600 text-sm leading-relaxed flex-1">"{t.text}"</p>
                <div className="mt-6 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#0A2540] flex items-center justify-center text-white text-sm font-bold">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-[#0A2540] text-sm">{t.name}</p>
                    <p className="text-xs text-gray-400">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Final ── */}
      <section className="py-24 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0A2540] mb-4">
            Pronto para trabalhar com segurança?
          </h2>
          <p className="text-gray-500 mb-8 text-lg">
            Junte-se a milhares de freelancers que já protegem seus projetos e recebimentos com o FreelaPay.
          </p>
          <Link to="/cadastro"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-[#00C896] text-white font-bold text-base hover:bg-[#00b386] transition-all shadow-lg shadow-[#00C896]/30">
            Criar conta grátis agora
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
          <p className="mt-4 text-sm text-gray-400">Sem cartão de crédito · 100% gratuito para começar</p>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-[#0A2540] text-gray-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
            <div>
              <img src="/logo.png" alt="FreelaPay" className="h-7 w-auto mb-4 brightness-0 invert" />
              <p className="text-sm leading-relaxed">
                A plataforma mais segura para freelancers e clientes fecharem negócio com tranquilidade.
              </p>
            </div>
            <div>
              <p className="text-white font-semibold text-sm mb-4">Produto</p>
              <ul className="space-y-2 text-sm">
                <li><a href="#como-funciona" className="hover:text-[#00C896] transition-colors">Como funciona</a></li>
                <li><a href="#beneficios" className="hover:text-[#00C896] transition-colors">Benefícios</a></li>
                <li><a href="#precos" className="hover:text-[#00C896] transition-colors">Preços</a></li>
              </ul>
            </div>
            <div>
              <p className="text-white font-semibold text-sm mb-4">Conta</p>
              <ul className="space-y-2 text-sm">
                <li><Link to="/cadastro" className="hover:text-[#00C896] transition-colors">Criar conta</Link></li>
                <li><Link to="/login" className="hover:text-[#00C896] transition-colors">Entrar</Link></li>
              </ul>
            </div>
            <div>
              <p className="text-white font-semibold text-sm mb-4">Suporte</p>
              <ul className="space-y-2 text-sm">
                <li><a href="mailto:suporte@freelapay.com.br" className="hover:text-[#00C896] transition-colors">suporte@freelapay.com.br</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <p>© {new Date().getFullYear()} FreelaPay. Todos os direitos reservados.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-[#00C896] transition-colors">Termos de Uso</a>
              <a href="#" className="hover:text-[#00C896] transition-colors">Privacidade</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
