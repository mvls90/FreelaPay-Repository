require('dotenv').config();
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

const pool = new Pool({
  host:     process.env.DB_HOST     || 'localhost',
  port:     parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME     || 'freeapi_db',
  user:     process.env.DB_USER     || 'postgres',
  password: process.env.DB_PASSWORD || '',
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

async function seed() {
  const client = await pool.connect();
  console.log('🌱 Iniciando seed...');

  try {
    await client.query('BEGIN');

    // ── Categorias ────────────────────────────────────────────────
    const categories = [
      { name: 'Desenvolvimento Web',    slug: 'desenvolvimento-web',    icon: '💻' },
      { name: 'Desenvolvimento Mobile', slug: 'desenvolvimento-mobile', icon: '📱' },
      { name: 'Design & UI/UX',         slug: 'design-ui-ux',           icon: '🎨' },
      { name: 'Marketing Digital',      slug: 'marketing-digital',      icon: '📣' },
      { name: 'Redação & Conteúdo',     slug: 'redacao-conteudo',       icon: '✍️'  },
      { name: 'Vídeo & Animação',       slug: 'video-animacao',         icon: '🎬' },
      { name: 'Suporte & TI',           slug: 'suporte-ti',             icon: '🔧' },
      { name: 'Consultoria',            slug: 'consultoria',            icon: '💼' },
      { name: 'Educação & Tutoria',     slug: 'educacao-tutoria',       icon: '📚' },
      { name: 'Outros',                 slug: 'outros',                 icon: '🌐' },
    ];

    for (const cat of categories) {
      await client.query(
        `INSERT INTO categories (name, slug, icon)
         VALUES ($1, $2, $3)
         ON CONFLICT (slug) DO NOTHING`,
        [cat.name, cat.slug, cat.icon]
      );
    }
    console.log(`  ✅ ${categories.length} categorias inseridas`);

    // ── Usuário Admin ─────────────────────────────────────────────
    const adminHash = await bcrypt.hash('Admin@123456', 12);
    await client.query(
      `INSERT INTO users (type, status, full_name, email, password_hash, email_verified, verification)
       VALUES ('admin', 'active', 'Administrador', 'admin@freeapi.com.br', $1, true, 'verified')
       ON CONFLICT (email) DO NOTHING`,
      [adminHash]
    );

    // Garantir saldo para o admin
    await client.query(
      `INSERT INTO user_balances (user_id, available, held)
       SELECT id, 0, 0 FROM users WHERE email = 'admin@freeapi.com.br'
       ON CONFLICT (user_id) DO NOTHING`
    );
    console.log('  ✅ Admin criado: admin@freeapi.com.br / Admin@123456');

    // ── Usuário Mediador ──────────────────────────────────────────
    const mediatorHash = await bcrypt.hash('Mediator@123', 12);
    await client.query(
      `INSERT INTO users (type, status, full_name, email, password_hash, email_verified, verification)
       VALUES ('mediator', 'active', 'Mediador Principal', 'mediador@freeapi.com.br', $1, true, 'verified')
       ON CONFLICT (email) DO NOTHING`,
      [mediatorHash]
    );
    await client.query(
      `INSERT INTO user_balances (user_id, available, held)
       SELECT id, 0, 0 FROM users WHERE email = 'mediador@freeapi.com.br'
       ON CONFLICT (user_id) DO NOTHING`
    );
    console.log('  ✅ Mediador criado: mediador@freeapi.com.br / Mediator@123');

    // ── Freelancer de teste ───────────────────────────────────────
    const freelancerHash = await bcrypt.hash('Freelancer@123', 12);
    await client.query(
      `INSERT INTO users (type, status, full_name, email, password_hash, email_verified, verification,
                          bio, skills, trust_score, completed_projects)
       VALUES ('freelancer', 'active', 'João Silva Dev', 'joao@teste.com', $1, true, 'verified',
               'Desenvolvedor Full Stack com 5 anos de experiência em React e Node.js.',
               ARRAY['React','Node.js','PostgreSQL','TypeScript'], 4.8, 12)
       ON CONFLICT (email) DO NOTHING`,
      [freelancerHash]
    );
    await client.query(
      `INSERT INTO user_balances (user_id, available, held)
       SELECT id, 250.00, 0 FROM users WHERE email = 'joao@teste.com'
       ON CONFLICT (user_id) DO NOTHING`
    );
    console.log('  ✅ Freelancer de teste: joao@teste.com / Freelancer@123');

    // ── Cliente de teste ──────────────────────────────────────────
    const clientHash = await bcrypt.hash('Cliente@123', 12);
    await client.query(
      `INSERT INTO users (type, status, full_name, email, password_hash, email_verified)
       VALUES ('client', 'active', 'Maria Santos', 'maria@teste.com', $1, true)
       ON CONFLICT (email) DO NOTHING`,
      [clientHash]
    );
    await client.query(
      `INSERT INTO user_balances (user_id, available, held)
       SELECT id, 0, 0 FROM users WHERE email = 'maria@teste.com'
       ON CONFLICT (user_id) DO NOTHING`
    );
    console.log('  ✅ Cliente de teste: maria@teste.com / Cliente@123');

    // ── Configurações da plataforma ───────────────────────────────
    const settings = [
      ['platform_fee_pct',          '"5.0"',   'Percentual de taxa da plataforma (%)'],
      ['dispute_auto_resolve_days', '"7"',      'Dias para auto-resolução de disputas'],
      ['max_revisions_default',     '"2"',      'Revisões padrão incluídas nas propostas'],
      ['chargeback_protection',     'true',     'Proteção contra chargeback ativa'],
      ['min_withdrawal_amount',     '"50.0"',   'Valor mínimo para saque (R$)'],
      ['proposal_link_expiry_days', '"30"',     'Dias para expiração do link de proposta'],
      ['maintenance_mode',          'false',    'Modo de manutenção ativo'],
    ];

    for (const [key, value, description] of settings) {
      await client.query(
        `INSERT INTO platform_settings (key, value, description)
         VALUES ($1, $2::jsonb, $3)
         ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
        [key, value, description]
      );
    }
    console.log(`  ✅ ${settings.length} configurações inseridas`);

    await client.query('COMMIT');
    console.log('\n🎉 Seed concluído com sucesso!\n');
    console.log('Contas de acesso:');
    console.log('  Admin:      admin@freeapi.com.br    / Admin@123456');
    console.log('  Mediador:   mediador@freeapi.com.br / Mediator@123');
    console.log('  Freelancer: joao@teste.com          / Freelancer@123');
    console.log('  Cliente:    maria@teste.com         / Cliente@123');

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Erro no seed:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
