const express = require("express");
const router = express.Router();
const db = require("../database");

router.post("/", (req, res) => {
  const { nome, telefone } = req.body;

  db.run(
    "INSERT INTO clientes (nome, telefone) VALUES (?, ?)",
    [nome, telefone],
    function (err) {
      if (err) return res.send(err);
      res.send({ id: this.lastID });
    }
  );
});

router.get("/", (req, res) => {
  db.all("SELECT * FROM clientes", [], (err, rows) => {
    if (err) return res.send(err);
    res.send(rows);
  });
});

module.exports = router;