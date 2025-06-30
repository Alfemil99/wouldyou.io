// === index.js ===

import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

// === MongoDB setup ===
const uri = process.env.MONGODB_URI || "YOUR_MONGODB_URI";
const client = new MongoClient(uri);
let pollsCollection;

async function connectDB() {
  try {
    await client.connect();
    const db = client.db("would-you-rather");
    pollsCollection = db.collection("polls");

    console.log("✅ Connected to DB:", db.databaseName);
    console.log("✅ pollsCollection namespace:", pollsCollection.namespace);

    const collections = await db.listCollections().toArray();
    console.log("📂 Collections:", collections.map(col => col.name));
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err);
  }
}

// === Express setup ===
const app = express();
app.use(express.json());

const allowedOrigins = [
  "https://www.wouldyou.io",
  "http://localhost:3000",
  "http://127.0.0.1:3000"
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

// === HTTP & Socket.IO server ===
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  }
});

// === Socket.IO connection ===
io.on("connection", (socket) => {
  console.log(`✅ Client connected: ${socket.id}`);

  // === Get random poll ===
  socket.on("get-random-poll", async ({ category }) => {
    console.log("🔍 get-random-poll:", category);

    if (!pollsCollection) {
      console.error("❌ pollsCollection not initialized");
      socket.emit("poll-data", null);
      return;
    }

    const count = await pollsCollection.countDocuments({ category, approved: true });
    console.log("🔢 Matching polls:", count);

    if (count === 0) {
      console.warn(`⚠️ No polls found in category: ${category}`);
      socket.emit("poll-data", null);
      return;
    }

    const polls = await pollsCollection.aggregate([
      { $match: { category, approved: true } },
      { $sample: { size: 1 } }
    ]).toArray();

    const poll = polls[0];
    console.log("✅ Sending poll:", poll?._id);
    socket.emit("poll-data", poll);
  });

  // === Vote ===
  socket.on("vote", async ({ pollId, optionIndex }) => {
    console.log("🗳️ === Incoming vote ===");
    console.log("pollId:", pollId, "| typeof:", typeof pollId);
    console.log("optionIndex:", optionIndex);
    console.log("namespace:", pollsCollection?.namespace);

    if (!pollsCollection) {
      console.error("❌ pollsCollection not initialized");
      socket.emit("vote-result", { error: "pollsCollection not initialized" });
      return;
    }

    const trimmedPollId = pollId.trim();
    const query = { _id: trimmedPollId };

    const poll = await pollsCollection.findOne(query);
    console.log("🔍 findOne poll:", poll);

    if (!poll) {
      console.warn("⚠️ Poll not found");
      socket.emit("vote-result", { error: "Poll not found" });
      return;
    }

    if (optionIndex < 0 || optionIndex >= poll.options.length) {
      console.warn("⚠️ Invalid optionIndex");
      socket.emit("vote-result", { error: "Invalid optionIndex" });
      return;
    }

    // Use updateOne + findOne to avoid findOneAndUpdate issues
    const updateResult = await pollsCollection.updateOne(
      query,
      { $inc: { [`options.${optionIndex}.votes`]: 1 } }
    );
    console.log("✅ updateOne result:", updateResult);

    const updatedPoll = await pollsCollection.findOne(query);
    console.log("✅ Updated poll:", updatedPoll);

    if (!updatedPoll) {
      console.warn("⚠️ Could not fetch updated poll");
      socket.emit("vote-result", { error: "Could not fetch updated poll" });
      return;
    }

    io.emit("vote-result", updatedPoll);
  });

  socket.on("disconnect", () => {
    console.log(`❌ Client disconnected: ${socket.id}`);
  });
});

// === Health check ===
app.get("/", (req, res) => {
  res.send("✅ WouldYou.IO backend running!");
});

// === Start server ===
async function startServer() {
  await connectDB();
  const PORT = process.env.PORT || 10000;
  server.listen(PORT, () => {
    console.log(`🚀 Server listening on port ${PORT}`);
  });
}

startServer();
