const express = require("express");
const cors = require("cors");
const DATABASE_URL =
  "postgresql://neondb_owner:npg_54SNwVOqFlik@ep-billowing-morning-ad7m2id6-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

const { Pool } = require("pg");

const app = express();

app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.listen(8000, () => {
  console.log("Server foi aberto com sucesso!");
});

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: false, 
});

app.get("/funcionarios", async (req, res)=>{
    const result = await pool.query("SELECT * FROM funcionarios")
    res.json(result.rows)
})
app.post("/funcionarios", async (req, res)=>{
    const {name, cargo} = req.body
    const result = await pool.query("INSERT INTO funcionarios (name, cargo) VALUES ($1, $2) RETURNING *", [name, cargo])
    res.json(result.rows[0])
})

app.get("/procedimentos", async (req, res)=>{
    const result = await pool.query("SELECT * FROM procedimentos")
    res.json(result.rows)
})

app.get("/procedimentos/:cargo", async (req, res)=>{
    const result = await pool.query("SELECT * FROM procedimentos WHERE cargo = $1", [req.params.cargo])
    res.json(result.rows)
})

app.post("/procedimentos", async (req, res)=>{
    const {procedimento, cargo} = req.body
    const result = await pool.query("INSERT INTO procedimentos (procedimento, cargo) VALUES ($1, $2) RETURNING *", [procedimento, cargo])
    res.json(result.rows[0])
})

app.post("/horarios", async (req, res)=>{
    const {data, hora, funcionario_id} = req.body
    const result = await pool.query("INSERT INTO horarios (data, hora, funcionario_id) VALUES ($1, $2, $3) RETURNING *", [data, hora, funcionario_id])
    res.json(result.rows[0])
})

app.get("/horarios", async (req, res)=>{
    const result = await pool.query("SELECT * FROM horarios")
    res.json(result.rows)
})

app.get("/horarios/:funcionario_id", async (req, res)=>{
    const result = await pool.query("SELECT * FROM horarios WHERE id_funcionario = $1", [req.params.funcionario_id])
    res.json(result.rows)
})

app.post("/horario_marcado", async(req, res)=>{
    console.log(req.body)
    const {horario, data, nome_funcionario, nome_cliente, valor, procedimento, telefone_cliente} = req.body
    const result = await pool.query("INSERT INTO horarios_marcados (horario, data, nome_funcionario, nome_cliente, valor, procedimento, telefone_cliente) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *", [horario, data, nome_funcionario, nome_cliente, valor, procedimento, telefone_cliente])
    res.send('Horário marcado com sucesso!')

})
app.get("/horario_marcado", async (req, res)=>{
    const result = await pool.query("SELECT * FROM horarios_marcados")
    res.json(result.rows)
})
app.delete("/horario_marcado/:id", async (req, res)=>{
    const result = await pool.query("DELETE FROM horarios_marcados WHERE id = $1", [req.params.id])
    res.send("Horário cancelado com sucesso!")
})
app.put("/horario_marcado/:id", async (req, res)=>{
    const {horario, data, nome_funcionario, nome_cliente, valor, procedimento, telefone_cliente} = req.body
    const result = await pool.query("UPDATE horarios_marcados SET horario = $1, data = $2, nome_funcionario = $3, nome_cliente = $4, valor = $5, procedimento = $6, telefone_cliente = $7 WHERE id = $8 RETURNING *", [horario, data, nome_funcionario, nome_cliente, valor, procedimento, telefone_cliente, req.params.id])    
    res.json(result.rows[0])
})





  



