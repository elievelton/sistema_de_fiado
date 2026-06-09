const express = require("express");
const cors = require("cors");

const app = express();
require("./database"); // isso inicializa o banco

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// Rotas
app.use("/clientes", require("./routes/clientes"));
app.use("/dividas", require("./routes/dividas"));
app.use("/pagamentos", require("./routes/pagamentos"));

app.listen(3000, () => {
  console.log("Servidor rodando em http://localhost:3000");});