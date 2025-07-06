// === index.js ===

import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import { MongoClient, ObjectId } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

// === MongoDB setup ===
const uri = process.env.MONGODB_URI || "YOUR_MONGODB_URI";
const client = new MongoClient(uri);

let pollsCollection;
let pendingCollection;
let quickpollsCollection;
let spinwheelsCollection;

async function connectDB() {
  try {
    await client.connect();
    const db = client.db("would-you-rather");

    pollsCollection = db.collection("polls");
    pendingCollection = db.collection("pending_polls");
    quickpollsCollection = db.collection("quickpolls");
    spinwheelsCollection = db.collection("spinwheels");

    console.log("✅ Connected to DB:", db.databaseName);
    console.log("📂 Collections:", (await db.listCollections().toArray()).map(col => col.name));

    // Create TTL indexes if not exists
    await quickpollsCollection.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
    await spinwheelsCollection.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });

    console.log("⏰ TTL indexes for QuickPolls and SpinWheels ensured.");

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

// === Daily Poll logic ===
let dailyPoll = null;
let lastPickedDate = null;

async function pickDailyPoll() {
  const today = new Date().toISOString().slice(0, 10);
  if (lastPickedDate === today && dailyPoll) return dailyPoll;

  const polls = await pollsCollection.aggregate([
    { $match: { approved: true } },
    { $sample: { size: 1 } }
  ]).toArray();

  dailyPoll = polls[0] || null;
  lastPickedDate = today;

  console.log(`🌞 Picked new daily poll for ${today}: ${dailyPoll?._id}`);
  return dailyPoll;
}

// === HTTP & Socket.IO ===
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  }
});

io.on("connection", (socket) => {
  console.log(`✅ Client connected: ${socket.id}`);

  // === Normal Poll ===
  socket.on("get-random-poll", async ({ category }) => {
    if (!pollsCollection) return;

    const query = { approved: true };
    if (category) query.category = category;

    const count = await pollsCollection.countDocuments(query);
    if (count === 0) {
      console.warn(`⚠️ No polls found in: ${category || "any"}`);
      socket.emit("poll-data", null);
      return;
    }

    const polls = await pollsCollection.aggregate([
      { $match: query },
      { $sample: { size: 1 } }
    ]).toArray();

    const poll = polls[0];
    console.log("✅ Sending random poll:", poll._id);
    socket.emit("poll-data", poll);
  });

  socket.on("get-daily-poll", async () => {
    if (!pollsCollection) return;
    const poll = await pickDailyPoll();
    socket.emit("daily-poll", poll);
  });

  socket.on("get-poll-by-id", async ({ pollId }) => {
    if (!pollsCollection) return;
    let objectId;
    try {
      objectId = new ObjectId(pollId.trim());
    } catch (e) {
      console.warn(`⚠️ Invalid ObjectId format: ${pollId}`);
      socket.emit("poll-data", null);
      return;
    }
    const poll = await pollsCollection.findOne({ _id: objectId });
    socket.emit("poll-data", poll || null);
  });

  socket.on("get-trending-polls", async () => {
    if (!pollsCollection) return;

    const trending = await pollsCollection.aggregate([
      { $match: { approved: true } },
      { $addFields: { totalVotes: { $sum: "$options.votes" } } },
      { $sort: { totalVotes: -1, created_at: -1 } },
      { $limit: 5 }
    ]).toArray();

    console.log(`🔥 Sending trending polls: ${trending.length}`);
    socket.emit("trending-polls", trending);
  });

  socket.on("submit-poll", async (pollData) => {
    if (!pendingCollection) return;

    const newPoll = {
      category: pollData.category,
      question_text: pollData.question_text,
      options: pollData.options.map(text => ({ text, votes: 0 })),
      approved: false,
      created_at: new Date()
    };

    const result = await pendingCollection.insertOne(newPoll);
    console.log(`✅ Poll submitted for review: ${result.insertedId}`);
  });

  socket.on("vote", async ({ pollId, optionIndex }) => {
    if (!pollsCollection && !quickpollsCollection) return;

    let objectId;
    try {
      objectId = new ObjectId(pollId.trim());
    } catch (e) {
      socket.emit("vote-result", { error: "Invalid poll ID" });
      return;
    }

    // Try normal polls first
    let poll = await pollsCollection.findOne({ _id: objectId });
    let collection = pollsCollection;

    // If not found, try quickpolls
    if (!poll) {
      poll = await quickpollsCollection.findOne({ _id: objectId });
      collection = quickpollsCollection;
    }

    if (!poll) {
      socket.emit("vote-result", { error: "Poll not found" });
      return;
    }

    if (optionIndex < 0 || optionIndex >= poll.options.length) {
      socket.emit("vote-result", { error: "Invalid optionIndex" });
      return;
    }

    await collection.updateOne(
      { _id: objectId },
      { $inc: { [`options.${optionIndex}.votes`]: 1 } }
    );

    const updatedPoll = await collection.findOne({ _id: objectId });
    socket.emit("vote-result", updatedPoll);
  });

  // === QuickPoll ===
  socket.on("submit-quickpoll", async (data) => {
    if (!quickpollsCollection) return;

    const { question_text, options, ttlMinutes } = data;
    if (options.length < 2) return;

    const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000);

    const newQuickPoll = {
      question_text,
      options: options.map(text => ({ text, votes: 0 })),
      createdAt: new Date(),
      expiresAt
    };

    const result = await quickpollsCollection.insertOne(newQuickPoll);
    console.log(`⚡ QuickPoll created: ${result.insertedId}`);
    socket.emit("quickpoll-created", { id: result.insertedId });
  });

  socket.on("get-quickpoll-by-id", async ({ pollId }) => {
    if (!quickpollsCollection) return;

    let objectId;
    try {
      objectId = new ObjectId(pollId.trim());
    } catch (e) {
      console.warn(`⚠️ Invalid ObjectId format: ${pollId}`);
      socket.emit("quickpoll-data", null);
      return;
    }

    const poll = await quickpollsCollection.findOne({ _id: objectId });
    socket.emit("quickpoll-data", poll || null);
  });

  // === Spin The Wheel ===
  socket.on("submit-spinwheel", async ({ items }) => {
    if (!spinwheelsCollection) return;

    if (!Array.isArray(items) || items.length < 2 || items.length > 12) {
      console.warn(`⚠️ Invalid spinwheel items:`, items);
      return;
    }

    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h TTL

    const newWheel = {
      items,
      createdAt: new Date(),
      expiresAt
    };

    const result = await spinwheelsCollection.insertOne(newWheel);
    console.log(`🎡 SpinWheel created: ${result.insertedId}`);
    socket.emit("spinwheel-created", { id: result.insertedId });
  });

  socket.on("get-spin-by-id", async ({ spinId }) => {
    if (!spinwheelsCollection) return;

    let objectId;
    try {
      objectId = new ObjectId(spinId.trim());
    } catch (e) {
      console.warn(`⚠️ Invalid ObjectId format: ${spinId}`);
      socket.emit("spinwheel-data", null);
      return;
    }

    const wheel = await spinwheelsCollection.findOne({ _id: objectId });
    socket.emit("spinwheel-data", wheel || null);
  });

  socket.on("disconnect", () => {
    console.log(`❌ Client disconnected: ${socket.id}`);
  });
});

// === Health check ===
app.get("/", (req, res) => {
  res.send("✅ WouldYou.IO backend running!");
});

// === Start ===
async function startServer() {
  await connectDB();
  const PORT = process.env.PORT || 10000;
  server.listen(PORT, () => {
    console.log(`🚀 Server listening on port ${PORT}`);
  });
}

startServer();
