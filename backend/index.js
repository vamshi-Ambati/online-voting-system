const express = require("express");
const cors = require("cors");
const path = require("path");
const { connectMongoDB } = require("./connection");
const { connectRabbitMQ } = require("./utils/rabbitmq");

const app = express();

const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",").map((o) => o.trim())
  : ["http://localhost:3000", "http://localhost:5173"];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes("*") || allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        console.warn(`❌ CORS blocked: ${origin}`);
        return callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
    optionsSuccessStatus: 200,
  })
);

app.use(cors());

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

connectMongoDB();

connectRabbitMQ(); // Connect to RabbitMQ on server startup

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

app.get("/", (req, res) => {
  res.send("Election API Server - Hello, World!");
});

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});

process.on("SIGTERM", () => {
  console.log("SIGTERM received. Shutting down...");
  server.close(() => process.exit(0));
});
