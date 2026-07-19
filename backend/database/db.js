const path = require("path");
const sqlite3 = require("sqlite3").verbose();

const dbPath = path.join(__dirname, "ctf.db");
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      price TEXT NOT NULL
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS flags (
      challenge INTEGER PRIMARY KEY,
      flag TEXT NOT NULL
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user',
      bio TEXT DEFAULT ''
    )
  `);

  const productCount = db.prepare("INSERT OR IGNORE INTO products (id, name, price) VALUES (?, ?, ?)");
  [
    [1, "Apple", "$1200"],
    [2, "Mouse", "$35"],
    [3, "Keyboard", "$60"],
    [4, "Monitor", "$300"],
    [5, "USB Cable", "$10"],
  ].forEach((product) => productCount.run(product));
  productCount.finalize();

  const flagSeed = db.prepare("INSERT OR REPLACE INTO flags (challenge, flag) VALUES (?, ?)");
  [
    [1, "FLAG{basic_union_sqli}"],
    [2, "FLAG{filter_bypass}"],
    [3, "FLAG{blind_sqli}"],
    [4, "FLAG{admin_access}"],
    [5, "FLAG{second_order}"],
  ].forEach((flag) => flagSeed.run(flag));
  flagSeed.finalize();

  const userSeed = db.prepare(
    "INSERT OR IGNORE INTO users (id, username, password, role, bio) VALUES (?, ?, ?, ?, ?)"
  );
  [
    [1, "alice", "alice123", "user", "Frontend engineer"],
    [2, "bob", "bob123", "user", "Warehouse support"],
    [3, "admin", "super-secret-password", "admin", "System administrator"],
  ].forEach((user) => userSeed.run(user));
  userSeed.finalize();
});

module.exports = db;
