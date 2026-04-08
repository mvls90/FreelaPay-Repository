require('dotenv').config();
const fs   = require('fs');
const path = require('path');
const { Pool } = require('pg');

const pool = new Pool({
  host:     process.env.DB_HOST     || 'localhost',
  port:     parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME     || 'freeapi_db',
  user:     process.env.DB_USER     || 'postgres',
  password: process.env.DB_PASSWORD || '',
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

async function migrate() {
  const client = await pool.connect();
  console.log('🔌 Conectado ao PostgreSQL');

  try {
    const schemaPath = path.join(__dirname, '..', '..', '..', 'database', 'schema.sql');

    if (!fs.existsSync(schemaPath)) {
      throw new Error(`Schema não encontrado: ${schemaPath}`);
    }

    const sql = fs.readFileSync(schemaPath, 'utf8');
    console.log('📄 Schema carregado, aplicando...');

    await client.query(sql);
    console.log('✅ Schema aplicado com sucesso!');

  } catch (err) {
    console.error('❌ Erro na migração:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();
