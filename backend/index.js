const express = require("express");
const cors = require("cors");
const path = require("path");
const { connectMongoDB } = require("./connection");

const app = express();

/* -------------------- CORS CONFIG -------------------- */
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",").map((o) => o.trim())
  : ["http://localhost:3000"]; // default for local dev

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes("*") || allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        console.warn(`❌ CORS blocked request from origin: ${origin}`);
        return callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true, // allow cookies/auth headers
  })
);

/* -------------------- BODY PARSING -------------------- */
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

/* -------------------- STATIC FILES -------------------- */
// Only serve uploaded files if needed
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/* -------------------- DATABASE -------------------- */
connectMongoDB();

/* -------------------- ROUTES -------------------- */
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

/* -------------------- HEALTH CHECK -------------------- */
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

/* -------------------- ROOT -------------------- */
app.get("/", (req, res) => {
  res.send("Election API Server - Hello, World!");
});

/* -------------------- ERROR HANDLING -------------------- */
app.use((err, req, res, next) => {
  console.error("🔥 Error:", err.stack);
  res.status(err.statusCode || 500).json({
    error: err.message || "Something went wrong!",
  });
});

app.use((req, res) => res.status(404).json({ error: "Endpoint not found" }));

/* -------------------- START SERVER -------------------- */
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`✅ Server started at http://localhost:${PORT}`);
  console.log(`🌍 Allowed Origins: ${allowedOrigins.join(", ")}`);
});

/* -------------------- GRACEFUL SHUTDOWN -------------------- */
process.on("SIGTERM", () => {
  console.log("SIGTERM received. Shutting down...");
  server.close(() => process.exit(0));
});
