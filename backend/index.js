// === index.js — Backend ===

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
  "http://localhost:3000"
];
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

// === HTTP Server ===
const server = http.createServer(app);

// === Socket.IO setup ===
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  }
});

// === Socket.IO logic ===
io.on("connection", (socket) => {
  console.log(`✅ Client connected: ${socket.id}`);

  // === Get a single random poll in category ===
  socket.on("get-random-poll", async ({ category }) => {
    try {
      const query = { approved: true, category };
      const count = await pollsCollection.countDocuments(query);

      if (count === 0) {
        console.log(`⚠️ No polls in category: ${category}`);
        socket.emit("poll-data", null);
        return;
      }

      const randomIndex = Math.floor(Math.random() * count);
      const randomPoll = await pollsCollection.find(query)
        .skip(randomIndex)
        .limit(1)
        .next();

      console.log(`🎲 Sent poll in category: ${category}`);
      socket.emit("poll-data", randomPoll);
    } catch (err) {
      console.error("❌ Failed to fetch random poll:", err);
      socket.emit("poll-data", null);
    }
  });

  // === Handle vote ===
  socket.on("vote", async ({ pollId, optionIndex }) => {
    console.log("🗳️ === Incoming vote ===");
    console.log("pollId raw:", pollId);
    console.log("typeof pollId:", typeof pollId);

    try {
      const objId = new ObjectId(pollId);
      console.log("Converted ObjectId:", objId);

      const result = await pollsCollection.findOneAndUpdate(
        { _id: objId },
        { $inc: { [`options.${optionIndex}.votes`]: 1 } },
        { returnDocument: "after" }
      );

      if (!result.value) {
        console.warn("⚠️ No poll found for that ID — check if pollId is correct and matches your DB");
        socket.emit("vote-result", { error: "Poll not found" });
        return;
      }

      console.log(`✅ Vote recorded for poll ${pollId}, option ${optionIndex}`);
      socket.emit("vote-result", result.value);
    } catch (err) {
      console.error("❌ Failed to record vote:", err);
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
