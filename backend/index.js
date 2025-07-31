const express = require("express");
const app = express();
const cors = require("cors");
const path = require('path'); // <-- Add this line

app.use(cors());
app.use(express.json());

const voterRouter = require("./routes/voter");
const candidateRouter = require("./routes/candidate");
const voteRouter = require("./routes/vote");
const dashboardRouter = require("./routes/dashboard");
const resultRouter = require('./routes/result');
const { connectMongoDB } = require("./connection");

connectMongoDB();

// Serve static images from /public/img as /img
app.use('/img', express.static(path.join(__dirname, 'public/img')));

// API routes
app.use("/voter", voterRouter);
app.use("/api", candidateRouter);
app.use("/api/votes", voteRouter);
app.use("/api/dashboard", dashboardRouter);
app.use('/api/results', resultRouter);

app.get("/", (req, res) => {
  res.send("Hello, World!");
});

app.listen(3000, () => {
  console.log("✅ Server started successfully! Listening at: http://localhost:3000");
});
