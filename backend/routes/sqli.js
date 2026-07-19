const express = require("express");
const db = require("../database/db");

const router = express.Router();

const runQuery = (sql, res, mapRows = (rows) => rows) => {
  db.all(sql, (error, rows) => {
    if (error) {
      return res.status(400).json({
        status: "error",
        message: error.message,
      });
    }

    return res.json({
      status: "ok",
      results: mapRows(rows),
    });
  });
};

router.get("/", (req, res) => {
  res.json({
    status: "ok",
    message: "SQL Injection challenge API",
  });
});

router.get("/challenges", (req, res) => {
  res.json({
    status: "ok",
    challenges: [
      { id: 1, slug: "product-search", name: "Product Search", difficulty: 1 },
      { id: 2, slug: "advanced-search", name: "Advanced Search", difficulty: 2 },
      { id: 3, slug: "user-directory", name: "User Directory", difficulty: 3 },
      { id: 4, slug: "admin-portal", name: "Admin Portal", difficulty: 4 },
      { id: 5, slug: "employee-management", name: "Employee Management", difficulty: 5 },
    ],
  });
});

router.get("/1/search", (req, res) => {
  const keyword = req.query.q || "";
  const sql = `
    SELECT id, name, price
    FROM products
    WHERE name LIKE '%${keyword}%'
  `;

  runQuery(sql, res);
});

router.get("/2/search", (req, res) => {
  const keyword = req.query.q || "";

  if (/[ \t]/.test(keyword)) {
    return res.status(400).json({
      status: "error",
      message: "Illegal characters detected.",
    });
  }

  const sql = `
    SELECT id, name, price
    FROM products
    WHERE name LIKE '%${keyword}%'
  `;

  runQuery(sql, res);
});

router.get("/3/profile", (req, res) => {
  const id = req.query.id || "";
  const sql = `
    SELECT username
    FROM users
    WHERE id = ${id}
  `;

  db.get(sql, (error, row) => {
    if (error) {
      return res.status(400).json({
        status: "error",
        message: error.message,
      });
    }

    return res.json({
      status: "ok",
      message: row ? "User exists" : "User not found",
    });
  });
});

router.post("/4/login", (req, res) => {
  const { username = "", password = "" } = req.body;

  if (/union|select/i.test(username) || /union|select/i.test(password)) {
    return res.status(400).json({
      status: "error",
      message: "Illegal keyword detected.",
    });
  }

  const sql = `
    SELECT username, role
    FROM users
    WHERE username = '${username}'
      AND password = '${password}'
  `;

  db.get(sql, (error, row) => {
    if (error) {
      return res.status(400).json({
        status: "error",
        message: error.message,
      });
    }

    if (!row) {
      return res.status(401).json({
        status: "error",
        message: "Invalid credentials.",
      });
    }

    if (row.role !== "admin") {
      return res.status(403).json({
        status: "error",
        message: "Admin access required.",
      });
    }

    db.get("SELECT flag FROM flags WHERE challenge = 4", (flagError, flagRow) => {
      if (flagError) {
        return res.status(500).json({
          status: "error",
          message: flagError.message,
        });
      }

      return res.json({
        status: "ok",
        message: "Welcome Administrator",
        panel: ["System Status", "Users", "Logs"],
        flag: flagRow.flag,
      });
    });
  });
});

router.post("/5/register", (req, res) => {
  const { username = "", password = "" } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      status: "error",
      message: "Username and password are required.",
    });
  }

  db.run(
    "INSERT INTO users (username, password, role, bio) VALUES (?, ?, 'user', '')",
    [username, password],
    (error) => {
      if (error) {
        return res.status(400).json({
          status: "error",
          message: error.message,
        });
      }

      return res.json({
        status: "ok",
        message: "Registration complete.",
      });
    }
  );
});

router.post("/5/login", (req, res) => {
  const { username = "", password = "" } = req.body;

  db.get(
    "SELECT username FROM users WHERE username = ? AND password = ?",
    [username, password],
    (error, row) => {
      if (error) {
        return res.status(500).json({
          status: "error",
          message: error.message,
        });
      }

      if (!row) {
        return res.status(401).json({
          status: "error",
          message: "Invalid credentials.",
        });
      }

      return res.json({
        status: "ok",
        username: row.username,
      });
    }
  );
});

router.post("/5/bio", (req, res) => {
  const { username = "", bio = "" } = req.body;

  db.run("UPDATE users SET bio = ? WHERE username = ?", [bio, username], function updateBio(error) {
    if (error) {
      return res.status(500).json({
        status: "error",
        message: error.message,
      });
    }

    if (!this.changes) {
      return res.status(404).json({
        status: "error",
        message: "User not found.",
      });
    }

    return res.json({
      status: "ok",
      message: "Bio saved.",
    });
  });
});

router.get("/5/export", (req, res) => {
  const username = req.query.username || "";

  db.get("SELECT bio FROM users WHERE username = ?", [username], (bioError, row) => {
    if (bioError) {
      return res.status(500).json({
        status: "error",
        message: bioError.message,
      });
    }

    if (!row) {
      return res.status(404).json({
        status: "error",
        message: "User not found.",
      });
    }

    const sql = `
      SELECT username, bio
      FROM users
      WHERE bio LIKE '%${row.bio}%'
    `;

    runQuery(sql, res, (rows) =>
      rows.map((exportRow) => ({
        username: exportRow.username,
        bio: exportRow.bio,
      }))
    );
  });
});

module.exports = router;
