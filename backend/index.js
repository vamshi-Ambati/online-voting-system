const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

// CORS
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Body parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Static uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// MongoDB connection
const { connectMongoDB } = require("./connection");
connectMongoDB();

// Routes
const voterRouter = require("./routes/voter");
const candidateRouter = require("./routes/candidate");
const voteRouter = require("./routes/vote");
const resultRouter = require("./routes/result");
const electionsRouter = require("./routes/elections");

app.use("/voter", voterRouter);
app.use("/api/candidates", candidateRouter());
app.use("/api/votes", voteRouter);
app.use("/api/results", resultRouter);
app.use("/api/elections", electionsRouter);

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

// Root
app.get("/", (req, res) => {
  res.send("Election API Server - Hello, World!");
});

// Errors
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    error: err.message || "Something went wrong!",
  });
});

// 404
app.use((req, res) => {
  res.status(404).json({ error: "Endpoint not found" });
});

// Start server
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`✅ Server started successfully! at http://localhost:${PORT}`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received. Shutting down gracefully...");
  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
});
