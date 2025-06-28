// backend/index.js

const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const { MongoClient } = require("mongodb");
require("dotenv").config();

const app = express();
const server = http.createServer(app);

// 🟢 Tillad dine Vercel-domæner
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

// MongoDB setup
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

// Simpel route (valgfri)
app.get("/", (req, res) => {
  res.send("Would You Rather backend is running!");
});

// Socket.io events
io.on("connection", (socket) => {
  console.log("🔌 Socket connected:", socket.id);

  // Hent spørgsmål med ID (valgfrit)
  socket.on("get-question", async (questionId) => {
    const q = await questions.findOne({ _id: questionId });
    if (q) {
      socket.emit("question-data", q);
    } else {
      socket.emit("question-data", { question_red: "FEJL", question_blue: "Ukendt spørgsmål" });
    }
  });

  // Hent tilfældigt spørgsmål
  socket.on("get-random-question", async () => {
    const count = await questions.countDocuments();
    const randomIndex = Math.floor(Math.random() * count);
    const randomQuestion = await questions.find().limit(1).skip(randomIndex).toArray();
    if (randomQuestion[0]) {
      socket.emit("question-data", randomQuestion[0]);
    }
  });

  // Stem
  socket.on("vote", async ({ questionId, choice }) => {
    const field = choice === "red" ? "votes_red" : "votes_blue";
    await votes.updateOne(
      { question_id: questionId },
      { $inc: { [field]: 1 } },
      { upsert: true }
    );

    const question = await questions.findOne({ _id: questionId });
    const result = await votes.findOne({ question_id: questionId });

    socket.emit("vote-result", {
      question_red: question.question_red,
      question_blue: question.question_blue,
      votes_red: result.votes_red || 0,
      votes_blue: result.votes_blue || 0
    });
  });

  socket.on("disconnect", () => {
    console.log("🔌 Socket disconnected:", socket.id);
  });
});

server.listen(3001, () => {
  console.log("🚀 Server running on port 3001");
});
