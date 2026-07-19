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

  db.run(`
    CREATE TABLE IF NOT EXISTS comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
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
    [1, "COMP6841{K7mP2aQ9}"],
    [2, "COMP6841{R8tW3xK5}"],
    [3, "COMP6841{B6dH1sY4}"],
    [4, "COMP6841{C9vJ2pL7}"],
    [5, "COMP6841{M5qZ8nF3}"],
    [101, "COMP6841{T4kR9wD2}"],
    [102, "COMP6841{G7mX1cP8}"],
    [103, "COMP6841{V3hN6sQ4}"],
    [201, "COMP6841{A8yK5dL1}"],
    [202, "COMP6841{P2rF7mW9}"],
    [203, "COMP6841{J6uC3xH8}"],
    [301, "COMP6841{Z4nB8qT1}"],
    [302, "COMP6841{E7pL2vR5}"],
    [303, "COMP6841{W9cM4kD6}"],
    [304, "COMP6841{H3sX7aN2}"],
  ].forEach((flag) => flagSeed.run(flag));
  flagSeed.finalize();

  const commentSeed = db.prepare(
    "INSERT OR IGNORE INTO comments (id, username, content) VALUES (?, ?, ?)"
  );
  [
    [1, "Tom", "Very useful."],
    [2, "Eric", "Nice explanation."],
  ].forEach((comment) => commentSeed.run(comment));
  commentSeed.finalize();

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
