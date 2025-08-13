const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

// Enhanced CORS configuration
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Body parsing before routes
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Serve static uploads for candidate images and other assets
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// MongoDB connection
const { connectMongoDB } = require("./connection");
connectMongoDB();

// Import routes
const voterRouter = require("./routes/voter");
const candidateRouter = require("./routes/candidate");
const voteRouter = require("./routes/vote");
const resultRouter = require("./routes/result");

// Mount API routes
app.use("/voter", voterRouter);
app.use("/api/candidates", candidateRouter()); // Candidate routes with multer inside
app.use("/api/votes", voteRouter);
app.use("/api/results", resultRouter);

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

// Root endpoint
app.get("/", (req, res) => {
  res.send("Election API Server - Hello, World!");
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    error: err.message || "Something went wrong!",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Endpoint not found" });
});

// Start server
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`✅ Server started successfully!`);
  console.log(`Listening at: http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received. Shutting down gracefully...");
  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
});
