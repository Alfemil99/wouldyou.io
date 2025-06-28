// backend/index.js

const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const { MongoClient } = require("mongodb");
require("dotenv").config();

const app = express();
const server = http.createServer(app);

// 🟢 CORS: Sæt dine frontend-domæner her!
const corsOptions = {
  origin: [
    "https://v-r-eight.vercel.app",
    "https://v-r-alfemil99s-projects.vercel.app"
  ],
  methods: ["GET", "POST"],
  credentials: true
};

app.use(cors(corsOptions));

const io = new Server(server, {
  cors: corsOptions
});

// 🔗 MongoDB
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);
let db, questions, votes;

client.connect()
  .then(() => {
    db = client.db("would-you-rather");
    questions = db.collection("questions");
    votes = db.collection("votes");
    console.log("✅ MongoDB connected");
  })
  .catch(err => {
    console.error("❌ MongoDB connection failed:", err);
  });

// 🌐 Simple GET route
app.get("/", (req, res) => {
  res.send("Would You Rather backend is running!");
});

// 🔌 Socket.io logic
io.on("connection", (socket) => {
  console.log("🔗 Socket connected:", socket.id);

  // Get specific question (valgfri)
  socket.on("get-question", async (questionId) => {
    const q = await questions.findOne({ _id: questionId });
    console.log("get-question:", questionId, q);
    if (q) {
      socket.emit("question-data", q);
    } else {
      socket.emit("question-data", { _id: "fail", question_red: "ERROR", question_blue: "Not found" });
    }
  });

  // Get random question
  socket.on("get-random-question", async () => {
    try {
      const count = await questions.countDocuments();
      if (count === 0) {
        console.log("⚠️ No questions in DB!");
        socket.emit("question-data", {
          _id: "fail",
          question_red: "Oops!",
          question_blue: "No questions found!"
        });
        return;
      }
      const randomIndex = Math.floor(Math.random() * count);
      const randomQuestion = await questions.find().limit(1).skip(randomIndex).toArray();
      console.log("🎲 Random question:", randomQuestion[0]);
      socket.emit("question-data", randomQuestion[0]);
    } catch (err) {
      console.error("❌ get-random-question failed:", err);
      socket.emit("question-data", {
        _id: "fail",
        question_red: "Error",
        question_blue: "Try again!"
      });
    }
  });

  // Vote
  socket.on("vote", async ({ questionId, choice }) => {
    try {
      const field = choice === "red" ? "votes_red" : "votes_blue";
      await votes.updateOne(
        { question_id: questionId },
        { $inc: { [field]: 1 } },
        { upsert: true }
      );

      const question = await questions.findOne({ _id: questionId });
      const result = await votes.findOne({ question_id: questionId });

      console.log(`✅ Voted ${choice} on ${questionId} | Totals:`, result);

      socket.emit("vote-result", {
        question_red: question?.question_red || "Unknown",
        question_blue: question?.question_blue || "Unknown",
        votes_red: result?.votes_red || 0,
        votes_blue: result?.votes_blue || 0
      });
    } catch (err) {
      console.error("❌ vote failed:", err);
      socket.emit("vote-result", { error: "Vote failed" });
    }
  });

  socket.on("disconnect", () => {
    console.log("🔌 Socket disconnected:", socket.id);
  });
});

// 🚀 Start server
server.listen(3001, () => {
  console.log("🚀 Server running on port 3001");
});
