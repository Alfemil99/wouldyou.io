// === main.js ===

import { io } from "https://cdn.socket.io/4.7.4/socket.io.esm.min.js";

// ✅ Socket.IO connection
const socket = io("https://v-r-backend.onrender.com"); // Tilpas din backend URL!

let activeCategory = null;
let activePollId = null;

// === Go back to landing page ===
window.goHome = function() {
  document.querySelectorAll(".category").forEach(btn => btn.classList.remove("active"));
  document.getElementById("poll").innerHTML = "";
  activeCategory = null;
  activePollId = null;
};

// === Select category & get random poll ===
window.selectCategory = function(element, category) {
  console.log("🔄 Loading poll for category:", category);
  document.querySelectorAll(".category").forEach(btn => btn.classList.remove("active"));
  element.classList.add("active");
  activeCategory = category;

  socket.emit("get-random-poll", { category });
};

// === Receive poll ===
socket.on("poll-data", (poll) => {
  if (!poll) {
    document.getElementById("poll").innerHTML = "<p>No polls found for this category.</p>";
    return;
  }

  console.log("📥 Received poll-data:", poll);
  activePollId = poll._id;
  console.log("✅ activePollId:", activePollId, "| typeof:", typeof activePollId);

  const pollDiv = document.getElementById("poll");
  pollDiv.innerHTML = `
    <h2>${poll.question_text}</h2>
    ${poll.options.map((opt, idx) => `
      <button class="option" onclick="vote(${idx})">${opt.text}</button>
      <div class="result-bar"><div class="result-fill" id="fill-${idx}"></div></div>
      <div class="result-text" id="text-${idx}"></div>
    `).join("")}
    <button onclick="nextPoll()">Next</button>
  `;

  // Hide result bars initially
  poll.options.forEach((_, idx) => {
    document.getElementById(`fill-${idx}`).style.width = "0%";
    document.getElementById(`text-${idx}`).innerText = "";
  });
});

// === Vote ===
window.vote = function(optionIndex) {
  if (!activePollId) return;
  console.log(`🗳️ Emitting vote with pollId: ${activePollId} | optionIndex: ${optionIndex}`);
  socket.emit("vote", { pollId: activePollId, optionIndex });
};

// === Receive vote result ===
socket.on("vote-result", (result) => {
  if (result.error) {
    console.error("❌ Vote error:", result.error);
    return;
  }

  console.log("📊 Received vote-result:", result);

  const totalVotes = result.options.reduce((sum, opt) => sum + opt.votes, 0);

  result.options.forEach((opt, idx) => {
    const percent = totalVotes ? Math.round((opt.votes / totalVotes) * 100) : 0;
    document.getElementById(`fill-${idx}`).style.width = percent + "%";
    document.getElementById(`text-${idx}`).innerText = `${opt.text}: ${percent}% (${opt.votes} votes)`;
  });
});

// === Next Poll ===
window.nextPoll = function() {
  if (!activeCategory) return;
  socket.emit("get-random-poll", { category: activeCategory });
};
