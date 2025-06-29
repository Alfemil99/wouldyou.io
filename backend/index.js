// backend/index.js

import express from "express";
import http from "http";
import cors from "cors";
import { Server } from "socket.io";
import { MongoClient, ObjectId } from "mongodb";
import dotenv from "dotenv";
dotenv.config();

const app = express();
const server = http.createServer(app);

app.use(express.json());

// ✅ CORS til Vercel-domæner
const corsOptions = {
  origin: [
    "https://wouldyou.io",
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

let db, polls;

client.connect()
  .then(() => {
    db = client.db("would-you-rather");
    polls = db.collection("polls");
    console.log("✅ MongoDB connected");
  })
  .catch(err => {
    console.error("❌ MongoDB connection failed:", err);
  });

// ✅ Test route
app.get("/", (req, res) => {
  res.send("✅ WOULDYOU.IO backend is running!");
});

// ✅ Submit new poll (create modal)
app.post("/submit-poll", async (req, res) => {
  const { question_text, options } = req.body;

  if (!question_text || !options || options.length < 2) {
    return res.status(400).send("Invalid poll data.");
  }

  await polls.insertOne({
    question_text,
    options: options.map(opt => ({
      text: opt.text,
      votes: 0
    })),
    category: "User", // eller fx fra form
    approved: false,
    created_at: new Date()
  });

  res.send("Thanks! We'll review your poll.");
});

// ✅ Socket.io logic
io.on("connection", (socket) => {
  console.log("🔗 New socket connected:", socket.id);

  // 🎲 Get multiple random polls
  socket.on("get-random-polls", async () => {
    try {
      const howMany = Math.floor(Math.random() * 4) + 2; // 2–5 polls
      const count = await polls.countDocuments({ approved: true });

      const randomIndex = Math.max(0, Math.floor(Math.random() * (count - howMany)));
      const randomPolls = await polls.find({ approved: true })
        .skip(randomIndex)
        .limit(howMany)
        .toArray();

      console.log("🎲 Sending polls:", randomPolls.length);
      socket.emit("polls-data", randomPolls);
    } catch (err) {
      console.error("❌ get-random-polls error:", err);
      socket.emit("polls-data", []);
    }
  });

  // ✅ Vote on an option
  socket.on("vote", async ({ pollId, optionIndex }) => {
    try {
      if (!pollId || optionIndex === undefined) {
        console.warn("⚠️ Invalid vote payload:", pollId, optionIndex);
        return;
      }

      const result = await polls.updateOne(
        { _id: new ObjectId(pollId) },
        { $inc: { [`options.${optionIndex}.votes`]: 1 } }
      );

      console.log(`✅ Vote saved for Poll: ${pollId} Option: ${optionIndex}`);

      const updatedPoll = await polls.findOne({ _id: new ObjectId(pollId) });

      socket.emit("vote-result", updatedPoll);

    } catch (err) {
      console.error("❌ vote error:", err);
      socket.emit("vote-result", { error: "Vote failed" });
    }
  });

  socket.on("disconnect", () => {
    console.log("🔌 Socket disconnected:", socket.id);
  });
});

// ✅ Start server
server.listen(3001, () => {
  console.log("🚀 WOULDYOU.IO backend running on port 3001");
});
