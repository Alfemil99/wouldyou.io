// index.js (backend) — ES Module version

import dotenv from "dotenv";
dotenv.config();

import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import { MongoClient, ObjectId } from "mongodb";

// === MongoDB setup ===
const uri = process.env.MONGODB_URI || "your_mongodb_connection_string";
const client = new MongoClient(uri);
let pollsCollection;

async function connectDB() {
  try {
    await client.connect();
    const db = client.db("would-you-rather");
    pollsCollection = db.collection("polls");
    console.log("✅ Connected to MongoDB");
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err);
  }
}
connectDB();

// === Express app ===
const app = express();
app.use(express.json());

// === CORS ===
const allowedOrigins = [
  "https://www.wouldyou.io",
  "http://localhost:3000" // for local dev
];
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

// === HTTP Server ===
const server = http.createServer(app);

// === Socket.io setup ===
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  }
});

// === Socket.io logic ===
io.on("connection", (socket) => {
  console.log(`✅ Client connected: ${socket.id}`);

  // 🎲 Send multiple random polls
  socket.on("get-random-polls", async () => {
    try {
      const howMany = Math.floor(Math.random() * 4) + 2; // 2–5 polls
      const count = await pollsCollection.countDocuments({ approved: true });
      const randomIndex = Math.max(0, Math.floor(Math.random() * (count - howMany)));
      const randomPolls = await pollsCollection.find({ approved: true })
        .skip(randomIndex)
        .limit(howMany)
        .toArray();

      console.log(`🎲 Sending ${randomPolls.length} polls`);
      socket.emit("polls-data", randomPolls);
    } catch (err) {
      console.error("❌ Failed to fetch polls:", err);
      socket.emit("polls-data", []);
    }
  });

  // ✅ Handle vote
  socket.on("vote", async ({ pollId, optionIndex }) => {
    try {
      const result = await pollsCollection.findOneAndUpdate(
        { _id: new ObjectId(pollId) },
        { $inc: { [`options.${optionIndex}.votes`]: 1 } },
        { returnDocument: "after" }
      );

      console.log(`✅ Vote saved for Poll: ${pollId} Option: ${optionIndex}`);
      socket.emit("vote-result", result.value);
    } catch (err) {
      console.error("❌ Failed to update vote:", err);
      socket.emit("vote-result", { error: "Vote failed" });
    }
  });

  socket.on("disconnect", () => {
    console.log(`❌ Client disconnected: ${socket.id}`);
  });
});

// === Example REST route ===
app.get("/", (req, res) => {
  res.send("✅ WouldYou.IO backend is running!");
});

// === Start server ===
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 Server listening on port ${PORT}`);
});
