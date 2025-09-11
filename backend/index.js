// server.js or app.js (your main express server file)
const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

// Enable CORS
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Body parsing with increased limits for image uploads
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Serve uploads folder statically
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// MongoDB connection
const { connectMongoDB } = require("./connection");
connectMongoDB();

// Register your routes
const voterRouter = require("./routes/voter");
const candidateRouter = require("./routes/candidate");
const voteRouter = require("./routes/vote");
const resultRouter = require("./routes/result");
const electionsRouter = require("./routes/elections");
const faceVerifyRouter = require("./routes/faceVerify");

app.use("/voter", voterRouter);
app.use("/api/candidates", candidateRouter());
app.use("/api/votes", voteRouter);
app.use("/api/results", resultRouter);
app.use("/api/elections", electionsRouter);
app.use("/api/verify-face", faceVerifyRouter);

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

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    error: err.message || "Something went wrong!",
  });
});

// Handle 404
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
