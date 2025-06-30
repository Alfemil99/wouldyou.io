// === main.js ===

import { io } from "https://cdn.socket.io/4.7.4/socket.io.esm.min.js";

// ✅ Socket.IO connection
const socket = io("https://v-r-backend.onrender.com");

let activeCategory = null;
let activePollId = null;

// === Parse URL på load ===
window.addEventListener("DOMContentLoaded", () => {
  const path = window.location.pathname;

  // Check for /poll/:id
  if (path.startsWith("/poll/")) {
    const pollId = path.split("/poll/")[1];
    console.log(`🔗 Opening specific poll by ID: ${pollId}`);
    loadPollById(pollId);
  }

  // Load trending on homepage
  loadTrending();
});

// === Go Home ===
window.goHome = function() {
  document.getElementById("categories").style.display = "grid";
  document.getElementById("poll").style.display = "none";
  document.getElementById("poll").innerHTML = "";
  document.body.classList.remove('voted');
  window.history.pushState(null, "", `/`);
  activeCategory = null;
  activePollId = null;
  console.log("🏠 Back to home");
  loadTrending();
};

// === Select category & get random poll ===
window.selectCategory = function(category) {
  console.log("🔄 Loading poll for category:", category);

  activeCategory = category;

  document.getElementById("categories").style.display = "none";
  document.getElementById("poll").style.display = "flex";

  socket.emit("get-random-poll", { category: category });
};

// === Load random poll from Random Poll CTA ===
window.loadRandomPoll = function() {
  console.log("🎲 Loading Random Poll of the Day");
  activeCategory = null;

  document.getElementById("categories").style.display = "none";
  document.getElementById("poll").style.display = "flex";

  socket.emit("get-random-poll", {}); // No category, just any poll
};

// === Load specific poll by ID (for share link or trending) ===
window.loadPollById = function(pollId) {
  console.log(`📌 Loading poll by ID: ${pollId}`);
  document.getElementById("categories").style.display = "none";
  document.getElementById("poll").style.display = "flex";

  socket.emit("get-poll-by-id", { pollId });
};

// === Receive poll ===
socket.on("poll-data", (poll) => {
  const pollDiv = document.getElementById("poll");

  if (!poll) {
    pollDiv.innerHTML = `
      <p>No polls found.</p>
      <button class="poll-button" onclick='goHome()'>Back</button>
    `;
    return;
  }

  console.log("📥 Loaded poll-data:", poll);
  activePollId = poll._id;

  // Opdater URL til delbart link
  window.history.pushState(null, "", `/poll/${activePollId}`);

  pollDiv.innerHTML = `
    <h2>${poll.question_text}</h2>
    ${poll.options.map((opt, idx) => `
      <button class="poll-option" id="option-${idx}" onclick="vote(${idx})">
        <div class="progress-fill"></div>
        <span>${opt.text}</span>
      </button>
    `).join("")}

    <div class="poll-actions">
      <button class="poll-button" onclick="copyLink()">🔗 Share Poll</button>
      <button class="poll-button" onclick="nextPoll()">Next</button>
      <button class="poll-button" onclick="goHome()">Back</button>
    </div>
  `;

  document.body.classList.remove('voted');
});

// === Vote ===
window.vote = function(optionIndex) {
  if (!activePollId) return;

  if (document.body.classList.contains('voted')) {
    console.log("⚠️ Already voted, ignoring click");
    return;
  }

  console.log(`🗳️ Voting: ${activePollId} | option ${optionIndex}`);
  socket.emit("vote", { pollId: activePollId, optionIndex });
};

// === Receive vote result ===
socket.on("vote-result", (result) => {
  if (result.error) {
    console.error("❌ Vote error:", result.error);
    return;
  }

  console.log("📊 Vote-result:", result);

  const totalVotes = result.options.reduce((sum, opt) => sum + opt.votes, 0);

  result.options.forEach((opt, idx) => {
    const percent = totalVotes ? Math.round((opt.votes / totalVotes) * 100) : 0;
    const fill = document.querySelector(`#option-${idx} .progress-fill`);
    const label = document.querySelector(`#option-${idx} span`);

    if (fill) fill.style.width = percent + "%";
    if (label) label.innerText = `${opt.text}: ${percent}% (${opt.votes} votes)`;
  });

  document.body.classList.add('voted');

  document.querySelectorAll('.poll-option').forEach(btn => {
    btn.disabled = true;
    btn.style.cursor = "default";
  });
});

// === Next Poll ===
window.nextPoll = function() {
  if (activeCategory) {
    socket.emit("get-random-poll", { category: activeCategory });
  } else {
    socket.emit("get-random-poll", {});
  }

  document.body.classList.remove('voted');
  window.history.pushState(null, "", `/`);
};

// === Copy Share Link ===
window.copyLink = function() {
  const url = window.location.href;
  navigator.clipboard.writeText(url).then(() => {
    alert("✅ Poll link copied to clipboard!");
  }).catch(err => {
    console.error("Clipboard copy failed:", err);
  });
};

// === Load Trending Polls ===
function loadTrending() {
  console.log("🔥 Loading trending polls");
  socket.emit("get-trending-polls");
}

// === Receive Trending Data ===
socket.on("trending-polls", (polls) => {
  console.log("📊 Trending polls:", polls);
  const carousel = document.getElementById("trending-carousel");
  carousel.innerHTML = ""; // Clear old

  if (!polls || polls.length === 0) {
    carousel.innerHTML = "<p>No trending polls yet.</p>";
    return;
  }

  polls.forEach(poll => {
    const card = document.createElement("div");
    card.className = "trend-card";
    card.onclick = () => loadPollById(poll._id);

    // You could add a preview image per poll if you store one
    card.innerHTML = `
      <img src="images/sample.png" alt="Trending Poll">
      <p>${poll.question_text}</p>
    `;
    carousel.appendChild(card);
  });
});
