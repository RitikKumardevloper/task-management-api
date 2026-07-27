const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const userRoutes = require("./routes/auth.routes");
const taskRoutes = require("./routes/task.routes");
const fs = require("fs");
const path = require("path");
const app = express();

const authLimiter = require("express-rate-limit")({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: {
    success: false,
    message: "Too many attempts, please try again later.",
  },
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors());

app.use(helmet());
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Task Management API",
  });
});

app.get("/health", (req, res) => {
  res.json({ success: true, message: "API is healthy" });
});

app.get("/api/docs", (req, res) => {
  const specPath = path.join(__dirname, "docs", "openapi.json");
  const spec = fs.readFileSync(specPath, "utf8");
  res.type("json").send(spec);
});

app.use("/api/auth", userRoutes);
app.use("/api/task", taskRoutes);

module.exports = app;
