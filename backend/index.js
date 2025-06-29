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
  socket.on("get-random-poll", async ({ category }) => {
    if (!pollsCollection) {
      console.error("❌ pollsCollection not initialized");
      socket.emit("poll-data", null);
      return;
    }

    try {
      const count = await pollsCollection.countDocuments({ category, approved: true });
      if (count === 0) {
        console.warn(`⚠️ No polls found in category: ${category}`);
        socket.emit("poll-data", null);
        return;
      }

      const polls = await pollsCollection
        .aggregate([
          { $match: { category, approved: true } },
          { $sample: { size: 1 } }
        ])
        .toArray();

      const poll = polls[0];
      console.log(`🎲 Sent poll in category: ${category} | ID: ${poll._id}`);
      socket.emit("poll-data", poll);
    } catch (err) {
      console.error("❌ Failed to fetch random poll:", err);
      socket.emit("poll-data", null);
    }
  });

  // === Handle vote ===
  socket.on("vote", async ({ pollId, optionIndex }) => {
    console.log("🗳️ === Incoming vote ===");
    console.log("pollId raw:", pollId, "| typeof:", typeof pollId);

    console.log("✅ pollsCollection namespace:", pollsCollection.namespace);

    // TEST: Kør direkte findOne
    const test = await pollsCollection.findOne({ _id: pollId });
    console.log("🔍 Direct findOne result:", test);

    if (!test) {
      console.warn("⚠️ Poll not found at findOne stage");
      socket.emit("vote-result", { error: "Poll not found" });
      return;
    }

    const result = await pollsCollection.findOneAndUpdate(
      { _id: pollId },
      { $inc: { [`options.${optionIndex}.votes`]: 1 } },
      { returnDocument: "after" }
    );

    console.log("🔄 findOneAndUpdate result:", result);

    if (!result.value) {
      console.warn("⚠️ Poll not found at update stage");
      socket.emit("vote-result", { error: "Poll not found" });
      return;
    }

    io.emit("vote-result", result.value);
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
