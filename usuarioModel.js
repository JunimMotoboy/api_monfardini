

const { Pool } = require('pg')


const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    'postgresql://neondb_owner:npg_54SNwVOqFlik@ep-billowing-morning-ad7m2id6-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
  ssl: { rejectUnauthorized: false },
})

async function criarUsuario({ nome, email, senha }) {

  if (!nome || !email || !senha ) {
    throw new Error('Nome, email e senha  são obrigatórios.')
  }
  
  const existe = await pool.query('SELECT id FROM usuarios WHERE email = $1', [
    email,
  ])
  if (existe.rows.length > 0) {
    throw new Error('Email já cadastrado.')
  }

  const result = await pool.query(
    'INSERT INTO usuarios (nome, email, senha) VALUES ($1, $2, $3) RETURNING id, nome, email',
    [nome, email, senha]
  )
  return result.rows[0]
}

module.exports = {
  criarUsuario,
  pool,
}
