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

app.get("/procedimentos/:id", async (req, res)=>{
    const result = await pool.query("SELECT * FROM procedimentos WHERE id = $1", [req.params.id])
    res.json(result.rows)
})

app.post("/procedimentos", async (req, res)=>{
    const {procedimento, cargo} = req.body
    const result = await pool.query("INSERT INTO procedimentos (procedimento, cargo) VALUES ($1, $2) RETURNING *", [procedimento, cargo])
    res.json(result.rows[0])
})




  



