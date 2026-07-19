const express = require("express");
const cors = require("cors");
const sqliRoutes = require("./routes/sqli");
const xssRoutes = require("./routes/xss");
const bofRoutes = require("./routes/bof");
const formatRoutes = require("./routes/format");
const flagRoutes = require("./routes/flag");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "COMP6841 CTF",
  });
});

app.use("/api/sqli", sqliRoutes);
app.use("/api/xss", xssRoutes);
app.use("/api/bof", bofRoutes);
app.use("/api/format", formatRoutes);
app.use("/api/flag", flagRoutes);

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`CTF backend running on http://localhost:${PORT}`);
  });
}

module.exports = app;
