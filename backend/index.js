// server.js
const express = require("express");
const cors = require("cors");
const path = require("path");
const { connectMongoDB } = require("./connection");

const app = express();

// Allowed origins for CORS
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",")
  : ["*"];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes("*") || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// Body parsing with limits
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Serve uploads (optional, but you might not need this if you always delete files)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// MongoDB
connectMongoDB();

// Routes
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

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    error: err.message || "Something went wrong!",
  });
});

app.use((req, res) => res.status(404).json({ error: "Endpoint not found" }));

// Start server
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`✅ Server started at http://localhost:${PORT}`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received. Shutting down...");
  server.close(() => process.exit(0));
});
