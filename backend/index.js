// index.js (backend)

require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const { MongoClient, ObjectId } = require("mongodb");

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
  "wouldyou.io",
  "localhost:3000" // for local dev
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

  // Send a random poll when a client connects
  socket.on("getPoll", async () => {
    try {
      const polls = await pollsCollection.aggregate([{ $sample: { size: 1 } }]).toArray();
      socket.emit("pollData", polls[0]);
    } catch (err) {
      console.error("❌ Failed to fetch poll:", err);
    }
  });

  // Handle vote
  socket.on("vote", async ({ pollId, optionIndex }) => {
    try {
      const result = await pollsCollection.findOneAndUpdate(
        { _id: new ObjectId(pollId) },
        { $inc: { [`votes.${optionIndex}`]: 1 } },
        { returnDocument: "after" }
      );
      io.emit("pollData", result.value); // broadcast updated poll
    } catch (err) {
      console.error("❌ Failed to update vote:", err);
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
