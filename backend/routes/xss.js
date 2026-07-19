const express = require("express");
const db = require("../database/db");

const router = express.Router();

router.get("/", (req, res) => {
  res.json({
    status: "ok",
    message: "XSS challenge API",
  });
});

router.get("/challenges", (req, res) => {
  res.json({
    status: "ok",
    challenges: [
      { id: 1, slug: "forum-search", name: "Forum Search", difficulty: 1 },
      { id: 2, slug: "post-comments", name: "Post Comments", difficulty: 3 },
      { id: 3, slug: "live-profile", name: "Live Profile", difficulty: 4 },
    ],
  });
});

router.get("/1/search", (req, res) => {
  const query = String(req.query.q || "");
  const reflection = query.replace(/<script\b[^>]*>[\s\S]*?<\/script\s*>/gi, "");

  res.json({
    status: "ok",
    reflection,
  });
});

router.get("/2/comments", (req, res) => {
  db.all(
    "SELECT id, username, content, created_at FROM comments ORDER BY id ASC",
    (error, rows) => {
      if (error) {
        return res.status(500).json({ status: "error", message: error.message });
      }

      return res.json({ status: "ok", comments: rows });
    }
  );
});

router.post("/2/comments", (req, res) => {
  const { username = "Guest", content = "" } = req.body;

  if (!content.trim()) {
    return res.status(400).json({
      status: "error",
      message: "A comment is required.",
    });
  }

  if (content.length > 280) {
    return res.status(400).json({
      status: "error",
      message: "Comments must be 280 characters or fewer.",
    });
  }

  db.run(
    "INSERT INTO comments (username, content) VALUES (?, ?)",
    [String(username).slice(0, 32), content],
    function createComment(error) {
      if (error) {
        return res.status(500).json({ status: "error", message: error.message });
      }

      return res.status(201).json({
        status: "ok",
        message: "Comment published. The administrator will review new comments.",
        id: this.lastID,
      });
    }
  );
});

router.post("/2/report", (req, res) => {
  db.get("SELECT flag FROM flags WHERE challenge = 102", (error, row) => {
    if (error || !row) {
      return res.status(500).json({ status: "error", message: "Report service unavailable." });
    }

    return res.json({
      status: "ok",
      message: "Administrator report received.",
      flag: row.flag,
    });
  });
});

module.exports = router;
