const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("./db.sqlite");

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS clientes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT,
      telefone TEXT
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS dividas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cliente_id INTEGER,
      valor REAL,
      data TEXT,
      status TEXT DEFAULT 'ativa'
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS pagamentos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      divida_id INTEGER,
      valor REAL,
      data TEXT,
      metodo TEXT
    )
  `);
});

module.exports = db;