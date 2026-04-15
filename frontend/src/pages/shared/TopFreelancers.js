import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/index';
import toast from 'react-hot-toast';

/* ─────────────────────────────────────────────
   DATA
───────────────────────────────────────────── */
const CATEGORIES = [
  { id: 'todos',       label: 'Todos' },
  { id: 'dev',         label: 'Desenvolvimento' },
  { id: 'design',      label: 'Design' },
  { id: 'social',      label: 'Social Media' },
  { id: 'trafego',     label: 'Tráfego Pago' },
  { id: 'redacao',     label: 'Redação' },
  { id: 'gestao',      label: 'Gestão' },
];

const FREELANCERS = [
  /* Desenvolvimento */
  {
    id: 'fake-1', cat: 'dev', initials: 'LF', color: 'bg-blue-500',
    name: 'Lucas Ferreira', specialty: 'Dev Full-Stack (React + Node)',
    rating: 5.0, projects: 87, bio: 'Especialista em aplicações web escaláveis. +5 anos de mercado.',
    skills: ['React', 'Node.js', 'PostgreSQL'],
  },
  {
    id: 'fake-2', cat: 'dev', initials: 'MP', color: 'bg-indigo-500',
    name: 'Marcos Pinto', specialty: 'Dev Mobile (React Native)',
    rating: 4.9, projects: 62, bio: 'Apps iOS e Android de alta performance. Entregas no prazo.',
    skills: ['React Native', 'Firebase', 'TypeScript'],
  },
  {
    id: 'fake-3', cat: 'dev', initials: 'FG', color: 'bg-cyan-600',
    name: 'Felipe Gomes', specialty: 'Back-End & APIs',
    rating: 4.8, projects: 54, bio: 'APIs REST e GraphQL robustas. Python, Go e Node.',
    skills: ['Python', 'Go', 'Docker'],
  },
  /* Design */
  {
    id: 'fake-4', cat: 'design', initials: 'AM', color: 'bg-pink-500',
    name: 'Ana Moraes', specialty: 'UI/UX Design',
    rating: 5.0, projects: 74, bio: 'Interfaces que convertem. Figma e Framer expert.',
    skills: ['Figma', 'Framer', 'Design System'],
  },
  {
    id: 'fake-5', cat: 'design', initials: 'BS', color: 'bg-rose-500',
    name: 'Beatriz Souza', specialty: 'Design Gráfico & Branding',
    rating: 4.8, projects: 48, bio: 'Identidade visual que comunica valor. Atendo PMEs e startups.',
    skills: ['Illustrator', 'Photoshop', 'Branding'],
  },
  {
    id: 'fake-6', cat: 'design', initials: 'VN', color: 'bg-fuchsia-500',
    name: 'Vanessa Nunes', specialty: 'Motion Design & Vídeo',
    rating: 4.7, projects: 35, bio: 'Animações e vídeos que prendem a atenção. After Effects.',
    skills: ['After Effects', 'Premiere', 'Lottie'],
  },
  /* Social Media */
  {
    id: 'fake-7', cat: 'social', initials: 'CS', color: 'bg-orange-500',
    name: 'Carla Santos', specialty: 'Social Media Manager',
    rating: 4.9, projects: 58, bio: 'Estratégia e gestão de redes sociais com foco em resultado.',
    skills: ['Instagram', 'TikTok', 'Analytics'],
  },
  {
    id: 'fake-8', cat: 'social', initials: 'PL', color: 'bg-amber-500',
    name: 'Pedro Lima', specialty: 'Criação de Conteúdo',
    rating: 4.8, projects: 42, bio: 'Conteúdo viral e engajador para marcas em crescimento.',
    skills: ['Copywriting', 'Canva', 'Reels'],
  },
  {
    id: 'fake-9', cat: 'social', initials: 'IR', color: 'bg-yellow-600',
    name: 'Isabela Ramos', specialty: 'Gestão de Comunidade',
    rating: 4.7, projects: 31, bio: 'Community manager especializada em fidelização de audiência.',
    skills: ['Discord', 'WhatsApp Biz', 'E-mail Mktg'],
  },
  /* Tráfego Pago */
  {
    id: 'fake-10', cat: 'trafego', initials: 'RO', color: 'bg-purple-500',
    name: 'Rafael Oliveira', specialty: 'Google Ads & Meta Ads',
    rating: 4.9, projects: 63, bio: 'Campanhas que geram ROI real. Gerenciei +R$ 2M em verba.',
    skills: ['Google Ads', 'Meta Ads', 'Analytics'],
  },
  {
    id: 'fake-11', cat: 'trafego', initials: 'DC', color: 'bg-violet-500',
    name: 'Diego Costa', specialty: 'Performance & Funil',
    rating: 4.8, projects: 44, bio: 'Especialista em funil de vendas e otimização de conversão.',
    skills: ['Facebook Ads', 'Hotmart', 'CRO'],
  },
  /* Redação */
  {
    id: 'fake-12', cat: 'redacao', initials: 'JL', color: 'bg-teal-500',
    name: 'Julia Lima', specialty: 'Copywriting & SEO',
    rating: 4.8, projects: 57, bio: 'Textos que vendem e rankiam. Especialista em landing pages.',
    skills: ['SEO', 'Copywriting', 'Blogs'],
  },
  {
    id: 'fake-13', cat: 'redacao', initials: 'GB', color: 'bg-emerald-500',
    name: 'Gabriel Barros', specialty: 'Redação Técnica',
    rating: 4.7, projects: 38, bio: 'Documentação técnica, manuais e conteúdo B2B de qualidade.',
    skills: ['Markdown', 'Confluence', 'Notion'],
  },
  /* Gestão */
  {
    id: 'fake-14', cat: 'gestao', initials: 'TR', color: 'bg-green-600',
    name: 'Thiago Rocha', specialty: 'Gestão de Projetos',
    rating: 4.8, projects: 51, bio: 'Scrum Master certificado. Entregas dentro do prazo e orçamento.',
    skills: ['Scrum', 'Jira', 'Notion'],
  },
  {
    id: 'fake-15', cat: 'gestao', initials: 'LA', color: 'bg-lime-600',
    name: 'Lívia Alves', specialty: 'Consultoria Estratégica',
    rating: 4.7, projects: 29, bio: 'Planejamento estratégico e OKRs para startups e PMEs.',
    skills: ['OKR', 'Miro', 'Business Model'],
  },
];

/* badge by position */
const BADGE = { 1: { label: '🥇 #1', bg: 'bg-yellow-500' }, 2: { label: '🥈 #2', bg: 'bg-gray-400' }, 3: { label: '🥉 #3', bg: 'bg-orange-500' } };

function StarRating({ rating }) {
  return (
    <div className="flex items-center gap-1">
      {[1,2,3,4,5].map(i => (
        <svg key={i} className="w-3.5 h-3.5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      <span className="text-xs font-bold text-gray-700 ml-0.5">{rating.toFixed(1)}</span>
    </div>
  );
}

export default function TopFreelancers() {
  const [activeCategory, setActiveCategory] = useState('todos');
  const [search, setSearch] = useState('');
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const filtered = FREELANCERS.filter(f => {
    const matchCat = activeCategory === 'todos' || f.cat === activeCategory;
    const matchSearch = search === '' ||
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.specialty.toLowerCase().includes(search.toLowerCase()) ||
      f.skills.some(s => s.toLowerCase().includes(search.toLowerCase()));
    return matchCat && matchSearch;
  });


  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl">🏆</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Top Freelancers</h1>
        </div>
        <p className="text-gray-500">Os profissionais mais bem avaliados e com mais projetos concluídos na plataforma.</p>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1 max-w-md">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Buscar por nome, habilidade..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#00C896]/30 focus:border-[#00C896] transition-colors"
          />
        </div>
      </div>

      {/* Category tabs */}
      <div className="flex flex-wrap gap-2 mb-8">
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              activeCategory === cat.id
                ? 'bg-[#0A2540] text-white shadow-sm'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-[#0A2540] hover:text-[#0A2540]'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Stats bar */}
      <div className="flex items-center gap-3 mb-6">
        <span className="text-sm text-gray-500">
          <strong className="text-gray-800">{filtered.length}</strong> freelancers encontrados
        </span>
        {activeCategory !== 'todos' && (
          <span className="text-xs bg-[#00C896]/10 text-[#00C896] font-semibold px-2.5 py-1 rounded-full">
            {CATEGORIES.find(c => c.id === activeCategory)?.label}
          </span>
        )}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">🔍</div>
          <p className="text-gray-500 font-medium">Nenhum freelancer encontrado</p>
          <button onClick={() => { setSearch(''); setActiveCategory('todos'); }}
            className="mt-4 text-sm text-[#00C896] font-semibold hover:underline">
            Limpar filtros
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map((f, idx) => {
            const rank = idx + 1;
            const badge = BADGE[rank];
            return (
              <div key={f.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all overflow-hidden flex flex-col">
                {/* top accent */}
                <div className={`h-1.5 w-full ${
                  rank === 1 ? 'bg-yellow-400' : rank === 2 ? 'bg-gray-300' : rank === 3 ? 'bg-orange-400' : 'bg-gray-100'
                }`} />

                <div className="p-5 flex-1 flex flex-col">
                  {/* Avatar + badge */}
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-14 h-14 rounded-2xl ${f.color} flex items-center justify-center text-white font-extrabold text-lg shadow-sm`}>
                      {f.initials}
                    </div>
                    {badge && (
                      <span className={`${badge.bg} text-white text-xs font-extrabold px-2.5 py-1 rounded-full shadow-sm`}>
                        {badge.label}
                      </span>
                    )}
                  </div>

                  {/* Info */}
                  <p className="font-extrabold text-gray-900 text-base leading-tight">{f.name}</p>
                  <p className="text-sm text-gray-500 mt-0.5 mb-3">{f.specialty}</p>

                  <StarRating rating={f.rating} />

                  <p className="text-xs text-gray-400 mt-1 mb-3">
                    <strong className="text-gray-600">{f.projects}</strong> projetos concluídos
                  </p>

                  <p className="text-xs text-gray-500 leading-relaxed mb-4 flex-1">{f.bio}</p>

                  {/* Skills */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {f.skills.map(s => (
                      <span key={s} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md font-medium">
                        {s}
                      </span>
                    ))}
                  </div>

                  {/* Action */}
                  <Link
                    to={`/perfil/${f.id}`}
                    className="w-full py-2.5 rounded-xl bg-[#0A2540] text-white text-sm font-bold hover:bg-[#0d3060] transition-colors flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Ver Perfil
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Footer note */}
      <div className="mt-10 p-4 bg-[#00C896]/8 rounded-2xl border border-[#00C896]/15 text-center">
        <p className="text-sm text-gray-600">
          <span className="font-semibold text-[#0A2540]">Ranking atualizado diariamente</span> com base em avaliações e projetos concluídos na plataforma.
        </p>
      </div>
    </div>
  );
}
