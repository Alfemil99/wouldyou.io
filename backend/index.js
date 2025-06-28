// backend/index.js

const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const { MongoClient, ObjectId } = require("mongodb");
require("dotenv").config();

const app = express();
const server = http.createServer(app);

app.use(express.json());

// ✅ CORS til Vercel-domæner
const corsOptions = {
  origin: [
    "https://wouldyou.io",
    "https://www.wouldyou.io",
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

let db, questions, votes, pendingQuestions;

client.connect()
  .then(() => {
    db = client.db("would-you-rather");
    questions = db.collection("questions");
    votes = db.collection("votes");
    pendingQuestions = db.collection("pending_questions");
    console.log("✅ MongoDB connected");
  })
  .catch(err => {
    console.error("❌ MongoDB connection failed:", err);
  });

// ✅ Test route
app.get("/", (req, res) => {
  res.send("✅ WOULDYOU.IO backend is running!");
});

// ✅ POST: Create new would you rather
app.post("/submit-question", async (req, res) => {
  const { optionA, optionB } = req.body;

  const badWords = ["fuck", "shit", "porn", "nazi"];
  const regex = new RegExp(`\\b(${badWords.join("|")})\\b`, "i");

  function isValid(option) {
    if (!option || option.length > 80) return false;
    if (/(https?:\/\/|www\.)/i.test(option)) return false;
    if (/\.(jpg|jpeg|png|gif|svg)/i.test(option)) return false;
    if (regex.test(option)) return false;
    return true;
  }

  if (!isValid(optionA) || !isValid(optionB)) {
    return res.status(400).send("Invalid or inappropriate input.");
  }

  await pendingQuestions.insertOne({
    question_red: optionA,
    question_blue: optionB,
    created_at: new Date(),
    approved: false
  });

  res.send("Thanks! We'll review your would you rather.");
});

// ✅ Socket.io logik
io.on("connection", (socket) => {
  console.log("🔗 New socket connected:", socket.id);

  // 🎲 Random spørgsmål
  socket.on("get-random-question", async () => {
    try {
      const count = await questions.countDocuments();
      if (count === 0) {
        socket.emit("question-data", {
          _id: "fail",
          question_red: "Oops!",
          question_blue: "No questions found."
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

      const question = await questions.findOne({ _id: questionId });
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
}); // ✅ ÉN io.on - lukker korrekt her!


// ✅ Server start
server.listen(3001, () => {
  console.log("🚀 WOULDYOU.IO backend running on port 3001");
});
