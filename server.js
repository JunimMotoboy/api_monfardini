const express = require("express");
const cors = require("cors");
const DATABASE_URL =
  "postgresql://neondb_owner:npg_54SNwVOqFlik@ep-billowing-morning-ad7m2id6-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=disable";

const { Pool } = require("pg");

const app = express();

app.use(express.json()); // permite receber JSON no body
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.listen(8000, () => {
  console.log("Server foi aberto com sucesso!");
});

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: false, // desativa SSL para evitar erro de certificado autoassinado
});


// app.get("/profissionais", async (req, res) => {
//   res.json(listaProfissionais);
// });

app.get("/funcionarios", async (req, res)=>{
    const result = await pool.query("SELECT * FROM funcionarios")
    res.json(result.rows)
})



