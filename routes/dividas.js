const express = require("express");
const router = express.Router();
const db = require("../database");

router.post("/", (req, res) => {
  const { cliente_id, valor, data } = req.body;

  db.run(
    "INSERT INTO dividas (cliente_id, valor, data) VALUES (?, ?, ?)",
    [cliente_id, valor, data],
    function (err) {
      if (err) return res.send(err);
      res.send({ id: this.lastID });
    }
  );
});

router.get("/:cliente_id", (req, res) => {
  db.all(
    "SELECT * FROM dividas WHERE cliente_id = ?",
    [req.params.cliente_id],
    (err, rows) => {
      if (err) return res.send(err);
      res.send(rows);
    }
  );
});

// Atualizar status da dívida
router.put("/:id/status", (req, res) => {
  const { status } = req.body;

  db.run(
    "UPDATE dividas SET status = ? WHERE id = ?",
    [status, req.params.id],
    function (err) {
      if (err) return res.send(err);
      res.send({ success: true });
    }
  );
});

module.exports = router;