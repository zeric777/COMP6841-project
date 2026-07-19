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
  const challengeNumber =
    typeof challenge === "number"
      ? challenge
      : Number(String(challenge || "").replace("sqli-", ""));

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
