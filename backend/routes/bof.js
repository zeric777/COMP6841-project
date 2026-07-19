const express = require("express");
const path = require("path");

const router = express.Router();
const challengeDirectory = path.join(__dirname, "..", "challenges", "bof");

const challengeFiles = {
  1: { binary: "bof1", source: "bof1.c" },
  2: { binary: "bof2", source: "bof2.c" },
  3: { binary: "bof3", source: "bof3.c" },
};

router.get("/", (req, res) => {
  res.json({ status: "ok", message: "Buffer Overflow challenge API" });
});

router.get("/challenges", (req, res) => {
  res.json({
    status: "ok",
    challenges: [
      { id: 1, slug: "employee-verification", name: "Employee Verification", difficulty: 1 },
      { id: 2, slug: "binary-login", name: "Binary Login", difficulty: 2 },
      { id: 3, slug: "backup-server", name: "Backup Server", difficulty: 3 },
    ],
  });
});

router.get("/:challengeId/download", (req, res) => {
  const challenge = challengeFiles[req.params.challengeId];
  if (!challenge) return res.status(404).json({ status: "error", message: "Challenge not found." });

  return res.download(path.join(challengeDirectory, "bin", challenge.binary), challenge.binary, (error) => {
    if (error && !res.headersSent) {
      res.status(404).json({ status: "error", message: "Challenge binary is not available." });
    }
  });
});

router.get("/:challengeId/source", (req, res) => {
  const challenge = challengeFiles[req.params.challengeId];
  if (!challenge) return res.status(404).json({ status: "error", message: "Challenge not found." });

  return res.download(path.join(challengeDirectory, "src", challenge.source), challenge.source);
});

module.exports = router;
