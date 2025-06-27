
const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const { MongoClient } = require("mongodb");
require("dotenv").config();

const app = express();
app.use(cors());
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);
let db, questions, votes;

client.connect().then(() => {
  db = client.db("would-you-rather");
  questions = db.collection("questions");
  votes = db.collection("votes");
  console.log("Connected to MongoDB");
});

io.on("connection", (socket) => {
  socket.on("get-question", async (questionId) => {
    const q = await questions.findOne({ _id: questionId });
    socket.emit("question-data", q);
  });

  socket.on("vote", async ({ questionId, choice }) => {
    const field = choice === "red" ? "votes_red" : "votes_blue";
    await votes.updateOne({ question_id: questionId }, { $inc: { [field]: 1 } }, { upsert: true });

    const question = await questions.findOne({ _id: questionId });
    const result = await votes.findOne({ question_id: questionId });

    socket.emit("vote-result", { 
      question_red: question.question_red,
      question_blue: question.question_blue,
      votes_red: result.votes_red || 0,
      votes_blue: result.votes_blue || 0
    });
  });
});

server.listen(3001, () => {
  console.log("Server running on port 3001");
});
