// === main.js ===

import { io } from "https://cdn.socket.io/4.7.4/socket.io.esm.min.js";

const socket = io("https://v-r-backend.onrender.com");

let activeCategory = null;
let activePollId = null;

// === Farver til block poll style ===
const colors = ["#B71C1C", "#8D6E63", "#616161", "#4CAF50", "#2196F3", "#FFC107", "#FF5722"];

function showToast(message) {
  const toast = document.getElementById("toast");
  toast.innerText = message;
  toast.style.display = "block";
  toast.style.opacity = "1";

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translate(-50%, 20px)";
  }, 1500);

  setTimeout(() => {
    toast.style.display = "none";
    toast.style.transform = "translate(-50%, 0)";
  }, 2000);
}


// === On Load: Direct Poll Link or Home (query param version) ===
window.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const pollId = params.get("poll");

  if (pollId) {
    console.log(`🔗 Opening shared poll: ${pollId}`);
    showPoll();
    socket.emit("get-poll-by-id", { pollId });
  } else {
    showHome();
    socket.emit("get-trending-polls");
    socket.emit("get-random-poll-preview");
  }
});

// === Helpers ===
function hideAll() {
  document.querySelector(".trending").style.display = "none";
  document.querySelector(".random-poll").style.display = "none";
  document.getElementById("categories").style.display = "none";
  document.getElementById("poll").style.display = "none";
  document.getElementById("submit-form").style.display = "none";
}

function showPoll() {
  hideAll();
  document.getElementById("poll").style.display = "block";
}

function showHome() {
  hideAll();
  document.querySelector(".trending").style.display = "block";
  document.querySelector(".random-poll").style.display = "block";
  document.getElementById("categories").style.display = "grid";
}

function showSubmit() {
  hideAll();
  document.getElementById("submit-form").style.display = "block";
}

window.goHome = function () {
  showHome();
  document.body.classList.remove("voted");
  window.history.pushState(null, "", `/`);
  activeCategory = null;
  activePollId = null;

  // 🔥 NYT: hent trending og random preview igen!
  socket.emit("get-trending-polls");
  socket.emit("get-random-poll-preview");
};


// === Select Category ===
window.selectCategory = function (category) {
  console.log(`🔄 Loading poll for category: ${category}`);
  activeCategory = category;

  showPoll();
  socket.emit("get-random-poll", { category });
};

// === Load Poll by ID ===
window.loadPollById = function (pollId) {
  console.log(`🔗 loadPollById(${pollId})`);
  showPoll();
  socket.emit("get-poll-by-id", { pollId });
};

// === Load Random Poll ===
window.loadRandomPoll = function () {
  console.log("🎲 Loading random poll");
  showPoll();
  socket.emit("get-random-poll", { category: null });
};

// === Open Submit Form ===
window.openSubmitPoll = function () {
  showSubmit();
};

// === Receive Poll ===
socket.on("poll-data", (poll) => {
  const pollDiv = document.getElementById("poll");

  if (!poll) {
    pollDiv.innerHTML = `
      <p>Poll not found.</p>
      <button onclick="goHome()" class="poll-button">Back</button>
    `;
    return;
  }

  console.log("📥 Loaded poll-data:", poll);
  activePollId = poll._id;

  // ✅ Query param version
  window.history.pushState(null, "", `/?poll=${activePollId}`);

  pollDiv.innerHTML = `
    <h2>${poll.question_text}</h2>
    <div class="poll-options">
      ${poll.options.map((opt, idx) => `
        <button 
          class="poll-option" 
          id="option-${idx}" 
          onclick="vote(${idx})"
          style="background-color: ${colors[idx % colors.length]}"
        >
          <div class="progress-fill"></div>
          <span>${opt.text}</span>
        </button>
      `).join("")}
    </div>
    <div class="poll-actions">
      <button class="poll-button" onclick="copyLink()">🔗 Share Poll</button>
      <button class="poll-button" onclick="nextPoll()">Next</button>
      <button class="poll-button" onclick="goHome()">Back</button>
    </div>
  `;

  document.body.classList.remove("voted");
});

// === Vote ===
window.vote = function (optionIndex) {
  if (!activePollId) return;

  if (document.body.classList.contains("voted")) {
    console.log("⚠️ Already voted");
    return;
  }

  console.log(`🗳️ Voting on ${activePollId} | option ${optionIndex}`);
  socket.emit("vote", { pollId: activePollId, optionIndex });
};

// === Receive Vote Result ===
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

  document.body.classList.add("voted");
  document.querySelectorAll(".poll-option").forEach(btn => {
    btn.disabled = true;
    btn.style.cursor = "default";
  });
});

// === Next Poll ===
window.nextPoll = function () {
  document.body.classList.remove("voted");
  window.history.pushState(null, "", `/`);

  if (activeCategory) {
    socket.emit("get-random-poll", { category: activeCategory });
  } else {
    loadRandomPoll();
  }
};

window.copyLink = function () {
  if (!activePollId) {
    showToast("⚠️ No poll loaded!");
    return;
  }

  const url = `${window.location.origin}/?poll=${activePollId}`;

  if (navigator.share) {
    navigator.share({
      title: "WouldYou.IO",
      text: "Check out this poll!",
      url: url
    }).then(() => {
      showToast("✅ Shared!");
    }).catch((err) => {
      console.warn("Share failed:", err);
      // Fallback hvis bruger annullerer
    });
  } else {
    navigator.clipboard.writeText(url).then(() => {
      showToast("✅ Link copied!");
    }).catch(err => {
      console.error(err);
      showToast("❌ Failed to copy");
    });
  }
};



// === Trending Polls ===
socket.on("trending-polls", (polls) => {
  const carousel = document.getElementById("trending-carousel");
  carousel.innerHTML = "";

  if (!polls.length) {
    carousel.innerHTML = "<p>No trending polls right now.</p>";
    return;
  }

  polls.forEach(poll => {
    const card = document.createElement("div");
    card.className = "trend-card";
    card.onclick = () => loadPollById(poll._id);
    card.innerHTML = `
      <h3>${poll.question_text}</h3>
      <p>${poll.totalVotes || 0} votes</p>
    `;
    carousel.appendChild(card);
  });
});

// === Random Poll Preview ===
socket.on("random-poll-preview", (poll) => {
  document.getElementById("random-question").innerText = poll.question_text;
  const randomLink = document.getElementById("random-link");
  randomLink.onclick = () => loadPollById(poll._id);
});

// === Submit Poll ===
window.submitPoll = function (e) {
  e.preventDefault();

  const category = document.getElementById("submit-category").value.trim();
  const question = document.getElementById("submit-question").value.trim();
  const optionsRaw = document.getElementById("submit-options").value.trim();

  if (!category || !question || !optionsRaw) {
    alert("Please fill out all fields!");
    return;
  }

  const options = optionsRaw.split("\n").map(line => line.trim()).filter(line => line);

  if (options.length < 2) {
    alert("At least 2 options required!");
    return;
  }

  socket.emit("submit-poll", {
    category,
    question_text: question,
    options: options
  });

  alert("✅ Your poll has been submitted for review!");
  goHome();
};
