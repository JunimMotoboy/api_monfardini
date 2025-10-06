// Model de usuário para PostgreSQL (NeonDB)
// Este arquivo define funções para manipular usuários no banco

const { Pool } = require('pg')

// Configure sua conexão com o NeonDB aqui
const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    'postgresql://neondb_owner:npg_54SNwVOqFlik@ep-billowing-morning-ad7m2id6-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
  ssl: { rejectUnauthorized: false },
})

async function criarUsuario({ nome, email, senha, telefone }) {
  // Validação básica
  if (!nome || !email || !senha || !telefone) {
    throw new Error('Nome, email, senha e telefone são obrigatórios.')
  }
  // Verifica se o email já existe
  const existe = await pool.query('SELECT id FROM usuarios WHERE email = $1', [
    email,
  ])
  if (existe.rows.length > 0) {
    throw new Error('Email já cadastrado.')
  }
  // Insere o novo usuário
  const result = await pool.query(
    'INSERT INTO usuarios (nome, email, senha, telefone) VALUES ($1, $2, $3, $4) RETURNING id, nome, email, telefone',
    [nome, email, senha, telefone]
  )
  return result.rows[0]
}

module.exports = {
  criarUsuario,
  pool,
}
