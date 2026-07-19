const express = require("express");
const path = require("path");

const router = express.Router();
const challengeDirectory = path.join(__dirname, "..", "challenges", "format");
const challengeFiles = {
  1: { binary: "fs1", source: "fs1.c" },
  2: { binary: "fs2", source: "fs2.c" },
  3: { binary: "fs3", source: "fs3.c" },
  4: { binary: "fs4", source: "fs4.c" },
};

router.get("/", (req, res) => {
  res.json({ status: "ok", message: "Format String challenge API" });
});

router.get("/challenges", (req, res) => {
  res.json({
    status: "ok",
    challenges: [
      { id: 1, slug: "echo-service", name: "Echo Service", difficulty: 1 },
      { id: 2, slug: "hidden-password", name: "Authentication Server", difficulty: 2 },
      { id: 3, slug: "secret-counter", name: "Admin Login", difficulty: 3 },
      { id: 4, slug: "system-utility", name: "System Utility", difficulty: 4 },
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
