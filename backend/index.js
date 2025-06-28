// backend/index.js

const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const { MongoClient } = require("mongodb");
require("dotenv").config();

const app = express();
const server = http.createServer(app);

// ✅ Tillad CORS fra din Vercel frontend
const corsOptions = {
  origin: [
    "https://dilemma.vercel.app",
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

// ✅ MongoDB setup
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

// ✅ Simpel GET til test
app.get("/", (req, res) => {
  res.send("✅ DILEMMA.NET backend is running!");
});

// ✅ Socket.io logik
io.on("connection", (socket) => {
  console.log("🔗 New socket connected:", socket.id);

  // 🎲 Random spørgsmål
  socket.on("get-random-question", async () => {
    try {
      const count = await questions.countDocuments();
      if (count === 0) {
        console.warn("⚠️ No questions found!");
        socket.emit("question-data", {
          _id: "fail",
          question_red: "Oops!",
          question_blue: "No questions available!"
        });
        return;
      }

      const randomIndex = Math.floor(Math.random() * count);
      const [randomQuestion] = await questions.find().skip(randomIndex).limit(1).toArray();

      console.log("🎲 Sending question:", randomQuestion);
      socket.emit("question-data", randomQuestion);
    } catch (err) {
      console.error("❌ get-random-question error:", err);
      socket.emit("question-data", {
        _id: "fail",
        question_red: "Server error",
        question_blue: "Try again!"
      });
    }
  });

  // ✅ Stem
  socket.on("vote", async ({ questionId, choice }) => {
    try {
      if (!questionId) {
        console.warn("⚠️ Missing questionId in vote");
        return;
      }

      const field = choice === "red" ? "votes_red" : "votes_blue";

      await votes.updateOne(
        { question_id: questionId },
        { $inc: { [field]: 1 } },
        { upsert: true }
      );

      const question = await questions.findOne({ _id: questionId }); // STRING match
      const result = await votes.findOne({ question_id: questionId });

      console.log(`✅ Vote saved: ${choice} on ${questionId}`);

      socket.emit("vote-result", {
        question_red: question?.question_red || "Unknown",
        question_blue: question?.question_blue || "Unknown",
        votes_red: result?.votes_red || 0,
        votes_blue: result?.votes_blue || 0
      });
    } catch (err) {
      console.error("❌ vote error:", err);
      socket.emit("vote-result", { error: "Vote failed" });
    }
  });

  socket.on("disconnect", () => {
    console.log("🔌 Socket disconnected:", socket.id);
  });
});

// ✅ Server start
server.listen(3001, () => {
  console.log("🚀 DILEMMA.NET backend running on port 3001");
});
