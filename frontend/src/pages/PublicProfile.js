import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { useAuthStore } from '../store/index';
import api from '../services/api';
import toast from 'react-hot-toast';
import { ArrowLeft, Star, Briefcase, MessageSquare, UserCheck, Loader2, AlertCircle } from 'lucide-react';

/* Freelancers fictícios com IDs "fake-*" */
const MOCK_PROFILES = {
  'fake-1':  { initials: 'LF', color: 'bg-blue-500',   name: 'Lucas Ferreira',    specialty: 'Dev Full-Stack (React + Node)',   rating: 5.0, projects: 87, bio: 'Especialista em aplicações web escaláveis com mais de 5 anos de mercado. Trabalho com React, Node.js e PostgreSQL para construir produtos sólidos e bem testados. Entrega pontual e comunicação clara são minha marca.', skills: ['React', 'Node.js', 'PostgreSQL', 'TypeScript', 'Docker', 'AWS'] },
  'fake-2':  { initials: 'MP', color: 'bg-indigo-500',  name: 'Marcos Pinto',      specialty: 'Dev Mobile (React Native)',      rating: 4.9, projects: 62, bio: 'Desenvolvedor mobile focado em React Native. Apps iOS e Android de alta performance com código limpo e UX cuidadosa. Certificado Google Associate Android Developer.', skills: ['React Native', 'Firebase', 'TypeScript', 'Expo', 'Redux'] },
  'fake-3':  { initials: 'FG', color: 'bg-cyan-600',    name: 'Felipe Gomes',      specialty: 'Back-End & APIs',               rating: 4.8, projects: 54, bio: 'Engenheiro back-end especializado em APIs REST e GraphQL de alta disponibilidade. Python, Go e Node, com foco em segurança e performance.', skills: ['Python', 'Go', 'Docker', 'Kubernetes', 'Redis', 'GraphQL'] },
  'fake-4':  { initials: 'AM', color: 'bg-pink-500',    name: 'Ana Moraes',        specialty: 'UI/UX Design',                  rating: 5.0, projects: 74, bio: 'Designer apaixonada por interfaces que convertem. Uso Figma e metodologias de Design Thinking para criar produtos digitais intuitivos e visualmente impactantes.', skills: ['Figma', 'Framer', 'Design System', 'Pesquisa UX', 'Prototipagem'] },
  'fake-5':  { initials: 'BS', color: 'bg-rose-500',    name: 'Beatriz Souza',     specialty: 'Design Gráfico & Branding',     rating: 4.8, projects: 48, bio: 'Identidade visual que comunica valor real. Atendo PMEs e startups que precisam se destacar no mercado com marca forte e consistente.', skills: ['Illustrator', 'Photoshop', 'Branding', 'Logotipos', 'Manual de Marca'] },
  'fake-6':  { initials: 'VN', color: 'bg-fuchsia-500', name: 'Vanessa Nunes',     specialty: 'Motion Design & Vídeo',         rating: 4.7, projects: 35, bio: 'Animações e vídeos que prendem a atenção desde os primeiros segundos. Especialista em After Effects e motion graphics para marcas digitais.', skills: ['After Effects', 'Premiere', 'Lottie', 'Cinema 4D', 'DaVinci Resolve'] },
  'fake-7':  { initials: 'CS', color: 'bg-orange-500',  name: 'Carla Santos',      specialty: 'Social Media Manager',          rating: 4.9, projects: 58, bio: 'Estratégia e gestão de redes sociais com foco em resultado mensurável. Trabalho com Instagram, TikTok e LinkedIn, crescendo audiências e gerando engajamento real.', skills: ['Instagram', 'TikTok', 'Analytics', 'LinkedIn', 'Cronograma Editorial'] },
  'fake-8':  { initials: 'PL', color: 'bg-amber-500',   name: 'Pedro Lima',        specialty: 'Criação de Conteúdo',           rating: 4.8, projects: 42, bio: 'Criador de conteúdo viral para marcas em crescimento. Storytelling, legendas e Reels que engajam e convertem.', skills: ['Copywriting', 'Canva', 'Reels', 'Roteirização', 'SEO para Redes'] },
  'fake-9':  { initials: 'IR', color: 'bg-yellow-600',  name: 'Isabela Ramos',     specialty: 'Gestão de Comunidade',          rating: 4.7, projects: 31, bio: 'Community manager especializada em construir e fidelizar comunidades digitais engajadas. Discord, WhatsApp Business e estratégias de retenção de membros.', skills: ['Discord', 'WhatsApp Biz', 'E-mail Mktg', 'Gestão de Crise', 'Analytics'] },
  'fake-10': { initials: 'RO', color: 'bg-purple-500',  name: 'Rafael Oliveira',   specialty: 'Google Ads & Meta Ads',         rating: 4.9, projects: 63, bio: 'Especialista em performance com campanhas que geram ROI real. Gerenciei mais de R$ 2 milhões em verba publicitária nos últimos 3 anos. Certificado Google Ads.', skills: ['Google Ads', 'Meta Ads', 'Analytics', 'Tag Manager', 'CRO'] },
  'fake-11': { initials: 'DC', color: 'bg-violet-500',  name: 'Diego Costa',       specialty: 'Performance & Funil de Vendas', rating: 4.8, projects: 44, bio: 'Especialista em funil de vendas completo. Do tráfego à conversão, monto estratégias que aumentam vendas de forma consistente e escalável.', skills: ['Facebook Ads', 'Hotmart', 'CRO', 'Funil de Vendas', 'E-mail Automation'] },
  'fake-12': { initials: 'JL', color: 'bg-teal-500',    name: 'Julia Lima',        specialty: 'Copywriting & SEO',             rating: 4.8, projects: 57, bio: 'Textos que vendem e rankiam no Google. Especialista em landing pages, e-mails de vendas e conteúdo SEO para blogs e sites.', skills: ['SEO', 'Copywriting', 'Blogs', 'Landing Pages', 'E-mail Marketing'] },
  'fake-13': { initials: 'GB', color: 'bg-emerald-500', name: 'Gabriel Barros',    specialty: 'Redação Técnica',               rating: 4.7, projects: 38, bio: 'Documentação técnica, manuais de produto e conteúdo B2B de qualidade. Tradução de assuntos complexos em linguagem acessível.', skills: ['Markdown', 'Confluence', 'Notion', 'API Docs', 'UX Writing'] },
  'fake-14': { initials: 'TR', color: 'bg-green-600',   name: 'Thiago Rocha',      specialty: 'Gestão de Projetos',            rating: 4.8, projects: 51, bio: 'Scrum Master certificado com histórico de entregas dentro do prazo e orçamento. Ajudo times remotos a trabalharem com clareza e agilidade.', skills: ['Scrum', 'Jira', 'Notion', 'OKR', 'Gestão de Riscos'] },
  'fake-15': { initials: 'LA', color: 'bg-lime-600',    name: 'Lívia Alves',       specialty: 'Consultoria Estratégica',       rating: 4.7, projects: 29, bio: 'Planejamento estratégico e OKRs para startups e PMEs. Ajudo empresas a definir objetivos claros, prioridades e indicadores que realmente importam.', skills: ['OKR', 'Miro', 'Business Model', 'Canvas', 'Balanced Scorecard'] },
};

function Stars({ rating }) {
  return (
    <div className="flex items-center gap-1">
      {[1,2,3,4,5].map(i => (
        <Star key={i} size={16}
          className={i <= Math.round(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'} />
      ))}
      <span className="text-sm font-bold text-gray-700 ml-1">{rating.toFixed(1)}</span>
    </div>
  );
}

export default function PublicProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, accessToken } = useAuthStore();

  const isMock = id?.startsWith('fake-');

  // Buscar perfil real da API
  const { data, isLoading, error } = useQuery(
    ['public-profile', id],
    () => api.get(`/users/${id}`).then(r => r.data),
    { enabled: !isMock, retry: 1 }
  );

  const handleHire = () => {
    if (!accessToken) {
      toast('Crie uma conta gratuita para contratar este freelancer!', { icon: '🔒' });
      navigate('/cadastro');
      return;
    }
    if (user?.type === 'client') {
      toast.success('Para contratar, crie um projeto e aguarde a proposta do freelancer.', { duration: 4000 });
      navigate('/cliente/projetos');
    } else {
      toast('Apenas clientes podem contratar freelancers.', { icon: 'ℹ️' });
    }
  };

  const handleMessage = () => {
    if (!accessToken) {
      toast('Faça login ou crie uma conta para enviar mensagens!', { icon: '💬' });
      navigate('/cadastro');
      return;
    }
    if (user?.type === 'client') {
      navigate('/cliente/projetos');
    } else if (user?.type === 'freelancer') {
      navigate('/freelancer/projetos');
    }
  };

  /* ── Mock profile ── */
  if (isMock) {
    const mock = MOCK_PROFILES[id];
    if (!mock) return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle size={48} className="text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Perfil não encontrado</p>
          <button onClick={() => navigate(-1)} className="mt-4 text-[#00C896] hover:underline text-sm">← Voltar</button>
        </div>
      </div>
    );

    return <ProfileView
      name={mock.name}
      specialty={mock.specialty}
      rating={mock.rating}
      projects={mock.projects}
      bio={mock.bio}
      skills={mock.skills}
      initials={mock.initials}
      avatarColor={mock.color}
      isMock
      onHire={handleHire}
      onMessage={handleMessage}
      onBack={() => navigate(-1)}
    />;
  }

  /* ── Loading / error ── */
  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 size={32} className="animate-spin text-[#00C896]" />
    </div>
  );

  if (error || !data?.user) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <AlertCircle size={48} className="text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">Perfil não encontrado</p>
        <button onClick={() => navigate(-1)} className="mt-4 text-[#00C896] hover:underline text-sm">← Voltar</button>
      </div>
    </div>
  );

  const profile = data.user;
  const initials = profile.full_name?.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() || '?';

  return <ProfileView
    name={profile.full_name}
    specialty={profile.specialty || 'Freelancer'}
    rating={profile.trust_score || 5.0}
    projects={profile.completed_projects || 0}
    bio={profile.bio || 'Freelancer verificado na plataforma FreelaPay.'}
    skills={profile.skills || []}
    initials={initials}
    avatarColor="bg-[#0A2540]"
    isMock={false}
    onHire={handleHire}
    onMessage={handleMessage}
    onBack={() => navigate(-1)}
  />;
}

function ProfileView({ name, specialty, rating, projects, bio, skills, initials, avatarColor, isMock, onHire, onMessage, onBack }) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back */}
      <div className="max-w-3xl mx-auto px-4 pt-6 pb-2">
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors">
          <ArrowLeft size={15} /> Voltar
        </button>
      </div>

      <div className="max-w-3xl mx-auto px-4 pb-12 space-y-5">
        {/* Hero card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="h-24 bg-gradient-to-r from-[#0A2540] to-[#0d3060]" />
          <div className="px-6 pb-6">
            <div className={`w-20 h-20 rounded-2xl ${avatarColor} flex items-center justify-center text-white font-extrabold text-2xl shadow-lg -mt-10 mb-4 border-4 border-white`}>
              {initials}
            </div>
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl font-extrabold text-gray-900">{name}</h1>
                  {!isMock && (
                    <span className="flex items-center gap-1 bg-[#00C896]/15 text-[#00C896] text-xs font-bold px-2 py-0.5 rounded-full">
                      <UserCheck size={11} /> Verificado
                    </span>
                  )}
                  {isMock && (
                    <span className="bg-gray-100 text-gray-500 text-xs font-semibold px-2 py-0.5 rounded-full">
                      Perfil fictício
                    </span>
                  )}
                </div>
                <p className="text-[#00C896] font-semibold mt-0.5">{specialty}</p>
                <div className="flex items-center gap-4 mt-3 flex-wrap">
                  <Stars rating={rating} />
                  <div className="flex items-center gap-1.5 text-sm text-gray-500">
                    <Briefcase size={14} />
                    <span><strong className="text-gray-800">{projects}</strong> projetos concluídos</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-3 flex-shrink-0">
                <button onClick={onMessage}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 hover:border-[#0A2540] text-sm font-semibold transition-colors">
                  <MessageSquare size={15} /> Mensagem
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bio */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-bold text-gray-900 mb-3">Sobre</h2>
          <p className="text-gray-600 leading-relaxed">{bio}</p>
        </div>

        {/* Skills */}
        {skills.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-bold text-gray-900 mb-4">Habilidades</h2>
            <div className="flex flex-wrap gap-2">
              {skills.map(s => (
                <span key={s} className="px-3 py-1.5 bg-[#0A2540]/8 text-[#0A2540] rounded-lg text-sm font-semibold">
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { val: `${rating.toFixed(1)}/5`, label: 'Avaliação média' },
            { val: projects, label: 'Projetos concluídos' },
            { val: '100%', label: 'Pagamento garantido' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
              <p className="text-2xl font-extrabold text-[#0A2540]">{s.val}</p>
              <p className="text-xs text-gray-400 mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="bg-[#0A2540] rounded-2xl p-6 text-center">
          <p className="text-white font-bold text-lg mb-2">Pronto para contratar {name.split(' ')[0]}?</p>
          <p className="text-gray-400 text-sm mb-5">O pagamento é protegido em custódia. Você só paga se o serviço for entregue.</p>
          <button onClick={onHire}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#00C896] text-white font-bold text-sm hover:bg-[#00b386] transition-colors shadow-lg shadow-[#00C896]/25">
            Contratar com segurança
          </button>
          {!useAuthStore.getState().accessToken && (
            <p className="text-gray-500 text-xs mt-3">
              <Link to="/cadastro" className="text-[#00C896] hover:underline">Crie uma conta grátis</Link> para começar
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
