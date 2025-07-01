const express = require("express");
const app = express();
const cors = require("cors");
app.use(cors());
const voterRouter = require("./routes/voter");
const candidateRouter = require("./routes/candidate");
const voteRouter = require("./routes/vote");
const { connectMongoDB } = require("./connection");
app.use(express.json());

connectMongoDB();

app.use("/voter", voterRouter);
app.use("/api", candidateRouter);
app.use("/api/votes",voteRouter);
app.get("/", (req, res) => {
  res.send("Hello, World!");
});

app.listen(3000, () => {
  console.log("✅ Server started successfully! Listening at: http://localhost:3000");
});
