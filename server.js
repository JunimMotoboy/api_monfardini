const express = require('express')
const cors = require('cors')
const DATABASE_URL =
  'postgresql://neondb_owner:npg_54SNwVOqFlik@ep-billowing-morning-ad7m2id6-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'

const { Pool } = require('pg')
const { criarUsuario } = require('./usuarioModel')

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors())
app.listen(8000, () => {
  console.log('Server foi aberto com sucesso!')
})

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: false,
})

app.get('/funcionarios', async (req, res) => {
  const result = await pool.query('SELECT * FROM funcionarios')
  res.json(result.rows)
})
app.post('/funcionarios', async (req, res) => {
  const { name, cargo } = req.body
  const result = await pool.query(
    'INSERT INTO funcionarios (name, cargo) VALUES ($1, $2) RETURNING *',
    [name, cargo]
  )
  res.json(result.rows[0])
})

app.get('/procedimentos', async (req, res) => {
  const result = await pool.query('SELECT * FROM procedimentos')
  res.json(result.rows)
})

app.get('/procedimentos/:cargo', async (req, res) => {
  const result = await pool.query(
    'SELECT * FROM procedimentos WHERE cargo = $1',
    [req.params.cargo]
  )
  res.json(result.rows)
})

app.post('/procedimentos', async (req, res) => {
  const { procedimento, cargo } = req.body
  const result = await pool.query(
    'INSERT INTO procedimentos (procedimento, cargo) VALUES ($1, $2) RETURNING *',
    [procedimento, cargo]
  )
  res.json(result.rows[0])
})

app.post('/horarios', async (req, res) => {
  const { data, hora, funcionario_id } = req.body
  const result = await pool.query(
    'INSERT INTO horarios (data, hora, funcionario_id) VALUES ($1, $2, $3) RETURNING *',
    [data, hora, funcionario_id]
  )
  res.json(result.rows[0])
})

app.get('/horarios', async (req, res) => {
  const result = await pool.query('SELECT * FROM horarios')
  res.json(result.rows)
})

app.get('/horarios/:funcionario_id', async (req, res) => {
  const result = await pool.query(
    'SELECT * FROM horarios WHERE funcionario_id = $1',
    [req.params.funcionario_id]
  )
  res.json(result.rows)
})

app.post('/horario_marcado/funcionario/{funcionarioId}', async (req, res) => {
  const {
    horario,
    data,
    nome_funcionario,
    nome_cliente,
    valor,
    procedimento,
    telefone_cliente,
    funcionario_id,
  } = req.body

  if (!nome_cliente || !funcionario_id) {
    return res
      .status(400)
      .json({ erro: 'nome_cliente e funcionario_id são obrigatórios.' })
  }

  const result = await pool.query(
    'INSERT INTO horarios_marcados (funcionario_id, horario, data, nome_funcionario, nome_cliente, valor, procedimento, telefone_cliente) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
    [
      funcionario_id,
      horario,
      data,
      nome_funcionario,
      nome_cliente,
      valor,
      procedimento,
      telefone_cliente,

    ]
  )
  res.send('Horário marcado com sucesso!')
})
app.get('/horario_marcado', async (req, res) => {
  const result = await pool.query('SELECT * FROM horarios_marcados')
  res.json(result.rows)
})
app.delete('/horario_marcado/:id', async (req, res) => {
  const result = await pool.query(
    'DELETE FROM horarios_marcados WHERE id = $1',
    [req.params.id]
  )
  res.send('Horário cancelado com sucesso!')
})
app.put('/horario_marcado/:id', async (req, res) => {
  const {
    horario,
    data,
    nome_funcionario,
    nome_cliente,
    valor,
    procedimento,
    telefone_cliente,
  } = req.body
  const result = await pool.query(
    'UPDATE horarios_marcados SET horario = $1, data = $2, nome_funcionario = $3, nome_cliente = $4, valor = $5, procedimento = $6, telefone_cliente = $7 WHERE id = $8 RETURNING *',
    [
      horario,
      data,
      nome_funcionario,
      nome_cliente,
      valor,
      procedimento,
      telefone_cliente,
      req.params.id,
    ]
  )
  res.json(result.rows[0])
})

app.post('/usuarios', async (req, res) => {
  try {
    const { nome, email, senha } = req.body
    // Verifica se já existe usuário com o mesmo e-mail
    const existe = await pool.query(
      'SELECT id FROM usuarios WHERE email = $1',
      [email]
    )
    if (existe.rows.length > 0) {
      return res
        .status(400)
        .json({ erro: 'Usuário já existe com este e-mail.' })
    }
    // Cria o usuário se não existir
    const usuario = await criarUsuario({ nome, email, senha })
    res.status(201).json(usuario)
  } catch (error) {
    res.status(400).json({ erro: error.message })
  }
})

app.get('/usuarios', async (req, res) => {
  const result = await pool.query('SELECT email, senha FROM usuarios')
  res.json(result.rows)
})
app.delete('/usuarios/:id', async (req, res) => {
  const result = await pool.query('DELETE FROM usuarios WHERE id = $1', [
    req.params.id,
  ])
  res.send('Usuário deletado com sucesso!')
})
app.put('/usuarios/:id', async (req, res) => {
  const { nome, email, senha } = req.body
  const result = await pool.query(
    'UPDATE usuarios SET nome = $1, email = $2, senha = $3 WHERE id = $4 RETURNING id, nome, email',
    [nome, email, senha, req.params.id]
  )
  res.json(result.rows[0])
})

// Rota para buscar imagem do funcionário
app.get('/funcionarios/:id/imagem', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT img FROM funcionarios WHERE id = $1',
      [req.params.id]
    )
    if (result.rows.length === 0) {
      return res.status(404).json({ erro: 'Funcionário não encontrado.' })
    }
    const img = result.rows[0].img
    if (!img) {
      return res.status(404).json({ erro: 'Imagem não encontrada.' })
    }
    res.json({ img }) // Retorna a imagem (base64 ou URL)
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao buscar imagem.' })
  }
})
// Rota para salvar agendamento vinculado ao funcionário
app.post('/agendamentos/funcionario/:id', async (req, res) => {
  try {
    const funcionario_id = req.params.id
    const {
      horario,
      data,
      nome_cliente,
      valor,
      procedimento,
      telefone_cliente,
    } = req.body
    const result = await pool.query(
      'INSERT INTO horarios_marcados (funcionario_id, horario, data, nome_cliente, valor, procedimento, telefone_cliente) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [
        funcionario_id,
        horario,
        data,
        nome_cliente,
        valor,
        procedimento,
        telefone_cliente,
      ]
    )
    res.status(201).json(result.rows[0])
  } catch (error) {
    res.status(400).json({ erro: 'Erro ao salvar agendamento.' })
  }
})
// Rota para listar agendamentos de um funcionário
app.get('/agendamentos/funcionario/:id', async (req, res) => {
  try {
    const funcionario_id = req.params.id
    const result = await pool.query(
      'SELECT * FROM horarios_marcados WHERE funcionario_id = $1',
      [funcionario_id]
    )
    res.json(result.rows)
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao buscar agendamentos.' })
  }
})
