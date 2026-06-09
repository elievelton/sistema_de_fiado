const express = require("express");
const router = express.Router();
const db = require("../database");

router.post("/", (req, res) => {
  const { divida_id, valor, data, metodo } = req.body;

  db.run(
    "INSERT INTO pagamentos (divida_id, valor, data, metodo) VALUES (?, ?, ?, ?)",
    [divida_id, valor, data, metodo],
    function (err) {
      if (err) return res.send(err);
      res.send({ id: this.lastID });
    }
  );
});

router.get("/:divida_id", (req, res) => {
  db.all(
    "SELECT * FROM pagamentos WHERE divida_id = ?",
    [req.params.divida_id],
    (err, rows) => {
      if (err) return res.send(err);
      res.send(rows);
    }
  );
});

module.exports = router;