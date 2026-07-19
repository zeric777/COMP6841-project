const express = require("express");
const db = require("../database/db");

const router = express.Router();

router.get("/", (req, res) => {
  res.json({
    status: "ok",
  });
});

router.post("/", (req, res) => {
  const { challenge, flag } = req.body;
  const challengeValue = String(challenge || "").toLowerCase();
  const xssMatch = challengeValue.match(/^xss-(\d+)$/);
  const sqliMatch = challengeValue.match(/^sqli-(\d+)$/);
  const bofMatch = challengeValue.match(/^bof-(\d+)$/);
  const formatMatch = challengeValue.match(/^fs-(\d+)$/);
  const challengeNumber =
    typeof challenge === "number"
      ? challenge
      : xssMatch
        ? 100 + Number(xssMatch[1])
        : sqliMatch
          ? Number(sqliMatch[1])
          : bofMatch
            ? 200 + Number(bofMatch[1])
            : formatMatch
              ? 300 + Number(formatMatch[1])
              : Number(challengeValue);

  if (!challengeNumber || !flag) {
    return res.status(400).json({
      status: "error",
      message: "Challenge and flag are required.",
    });
  }

  db.get("SELECT flag FROM flags WHERE challenge = ?", [challengeNumber], (error, row) => {
    if (error) {
      return res.status(500).json({
        status: "error",
        message: error.message,
      });
    }

    if (!row || row.flag !== flag.trim()) {
      return res.status(400).json({
        status: "error",
        message: "Incorrect flag.",
      });
    }

    return res.json({
      status: "ok",
      message: "FLAG Accepted",
    });
  });
});

module.exports = router;
