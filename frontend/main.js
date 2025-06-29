// === main.js ===

// Import Socket.IO ESM client
import { io } from "https://cdn.socket.io/4.7.4/socket.io.esm.min.js";

// === Socket.IO connection ===
const socket = io("https://v-r-backend.onrender.com");

let activePollId = null;

// === Handle category clicks ===
document.querySelectorAll(".category").forEach(btn => {
  btn.addEventListener("click", () => {
    const category = btn.dataset.category;
    console.log("🔄 Loading poll for category:", category);

    // Vis hvilken knap der er aktiv
    document.querySelectorAll(".category").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    socket.emit("get-random-poll", { category });
  });
});

// === Receive poll ===
socket.on("poll-data", (poll) => {
  if (!poll) {
    console.warn("⚠️ No poll found for this category.");
    return;
  }

  console.log("📥 Received poll-data:", poll);

  // ✅ Store pollId as plain string
  activePollId = poll._id;
  console.log("✅ activePollId:", activePollId, "| typeof:", typeof activePollId);

  renderPoll(poll);
});

// === Receive vote result ===
socket.on("vote-result", (result) => {
  console.log("📊 Received vote-result:", result);
  if (result.error) {
    console.error("❌ Vote error:", result.error);
    return;
  }
  renderPollResult(result);
});

// === Render poll ===
function renderPoll(poll) {
  const pollContainer = document.getElementById("poll");
  pollContainer.innerHTML = `
    <h2>${poll.question_text}</h2>
    <div id="options"></div>
  `;

  const optionsContainer = document.getElementById("options");
  poll.options.forEach((opt, index) => {
    const btn = document.createElement("button");
    btn.textContent = opt.text;
    btn.addEventListener("click", () => {
      console.log(`🗳️ Emitting vote with pollId: ${activePollId} | optionIndex: ${index}`);
      socket.emit("vote", { pollId: activePollId, optionIndex: index });
    });
    optionsContainer.appendChild(btn);
  });
}

// === Render poll result with percentages ===
function renderPollResult(poll) {
  const totalVotes = poll.options.reduce((sum, opt) => sum + opt.votes, 0);
  const pollContainer = document.getElementById("poll");
  pollContainer.innerHTML = `
    <h2>${poll.question_text}</h2>
    <div id="results"></div>
    <button id="nextPoll">Next Poll</button>
  `;

  const resultsContainer = document.getElementById("results");
  poll.options.forEach(opt => {
    const percent = totalVotes > 0 ? ((opt.votes / totalVotes) * 100).toFixed(1) : 0;
    const div = document.createElement("div");
    div.innerHTML = `
      <strong>${opt.text}:</strong> ${opt.votes} votes (${percent}%)
    `;
    resultsContainer.appendChild(div);
  });

  // Load next poll in same category
  document.getElementById("nextPoll").addEventListener("click", () => {
    const activeBtn = document.querySelector(".category.active");
    const category = activeBtn ? activeBtn.dataset.category : "Anime";
    console.log("🔄 Loading next poll for category:", category);
    socket.emit("get-random-poll", { category });
  });

  // Optional: Refresh Google Ads if you have inline slots
  if (window.adsbygoogle) {
    try {
      (adsbygoogle = window.adsbygoogle || []).push({});
      console.log("✅ AdSense slot refreshed");
    } catch (e) {
      console.warn("⚠️ AdSense push failed:", e);
    }
  }
}

// === Home redirect handler ===
// Matches: <header onclick="goHome()">WOULDYOU.IO</header>
function goHome() {
  console.log("🏠 Returning to home page");
  window.location.href = "/";
}
