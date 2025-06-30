// === index.js ===

import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

// === MongoDB setup ===
const uri = process.env.MONGODB_URI || "your_mongodb_connection_string";
const client = new MongoClient(uri);
let pollsCollection;

async function connectDB() {
  try {
    await client.connect();
    const db = client.db("would-you-rather"); // 🎯 Sørg for dette matcher din cluster!
    pollsCollection = db.collection("polls");  // 🎯 Vigtig! Må IKKE være 'questions' el.lign.

    console.log("✅ Connected to DB:", db.databaseName);
    console.log("✅ pollsCollection namespace:", pollsCollection.namespace);

    // BONUS: Vis ALLE collections i DB
    const collections = await db.listCollections().toArray();
    console.log("📂 Collections in DB:", collections.map(col => col.name));
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err);
  }
}

// === Express setup ===
const app = express();
app.use(express.json());

const allowedOrigins = [
  "https://www.wouldyou.io",
  "http://localhost:3000"
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true
  })
);

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

  // === Get random poll in category ===
  socket.on("vote", async ({ pollId, optionIndex }) => {
    console.log("🗳️ === Incoming vote ===");
    console.log("pollId raw:", pollId, "| typeof:", typeof pollId);

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

    // Bruger updateOne
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
