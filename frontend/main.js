import { io } from "https://cdn.socket.io/4.7.4/socket.io.esm.min.js";
const socket = io("https://v-r-backend.onrender.com"); // din backend-URL

let currentQuestionId = "";
let currentChoice = "";
let hasVoted = false;
let soundEnabled = true;
let voteCount = 0; // tæller hvor mange stemmer brugeren har lavet

// 🔊 Mute toggle
const muteToggle = document.getElementById("mute-toggle");
muteToggle.onclick = () => {
  soundEnabled = !soundEnabled;
  muteToggle.innerText = soundEnabled ? "🔊" : "🔇";
  stopSounds();
};

// 📝 Create Dilemma modal open/close
const createBtn = document.getElementById("create-btn");
const createModal = document.getElementById("create-modal");
const closeModal = document.getElementById("closeModal");

createBtn.onclick = () => {
  createModal.style.display = "block";
};
closeModal.onclick = () => {
  createModal.style.display = "none";
};

// 📝 Submit dilemma
document.getElementById("submitDilemma").onclick = async () => {
  const optionA = document.getElementById("optionA").value.trim();
  const optionB = document.getElementById("optionB").value.trim();

  const badWords = ["fuck", "shit", "porn", "nazi"];
  const regex = new RegExp(`\\b(${badWords.join("|")})\\b`, "i");

  function isValid(option) {
    if (!option || option.length > 80) return false;
    if (/(https?:\/\/|www\.)/i.test(option)) return false;
    if (/\.(jpg|jpeg|png|gif|svg)/i.test(option)) return false;
    if (regex.test(option)) return false;
    return true;
  }

  if (!isValid(optionA) || !isValid(optionB)) {
    document.getElementById("create-status").innerText = "Invalid or inappropriate text!";
    return;
  }

  const res = await fetch("/submit-question", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ optionA, optionB })
  });

  const msg = await res.text();
  document.getElementById("create-status").innerText = msg;
};

// 🔗 Hent første spørgsmål
socket.emit("get-random-question");

socket.on("question-data", (data) => {
  currentQuestionId = data._id || "fail";
  currentChoice = "";
  hasVoted = false;

  // Sæt labels
  document.getElementById("red-label").innerText = data.question_red;
  document.getElementById("blue-label").innerText = data.question_blue;

  // Reset votes og procent
  document.getElementById("red-votes").innerText = "";
  document.getElementById("red-percent").innerText = "";
  document.getElementById("blue-votes").innerText = "";
  document.getElementById("blue-percent").innerText = "";

  // Reset panels til 50/50
  document.getElementById("red").style.flexGrow = 1;
  document.getElementById("blue").style.flexGrow = 1;
});

// Klik paneler
document.getElementById("red").onclick = () => handleClick("red");
document.getElementById("blue").onclick = () => handleClick("blue");

function handleClick(choice) {
  if (!hasVoted) {
    vote(choice);
  } else {
    loadNextQuestion();
  }
}

function vote(choice) {
  hasVoted = true;
  currentChoice = choice;
  voteCount++;

  socket.emit("vote", { questionId: currentQuestionId, choice });

  if (voteCount % 10 === 0) {
    showAdPopup();
  }
}

socket.on("vote-result", (data) => {
  const total = data.votes_red + data.votes_blue;
  const redPercent = total ? Math.round((data.votes_red / total) * 100) : 50;
  const bluePercent = 100 - redPercent;

  // Animate panels
  document.getElementById("red").style.flexGrow = redPercent;
  document.getElementById("blue").style.flexGrow = bluePercent;

  // Update tekst
  document.getElementById("red-votes").innerText = `${data.votes_red} votes`;
  document.getElementById("red-percent").innerText = `${redPercent}%`;

  document.getElementById("blue-votes").innerText = `${data.votes_blue} votes`;
  document.getElementById("blue-percent").innerText = `${bluePercent}%`;

  // Lyd
  if (soundEnabled) {
    stopSounds();
    const cheer = document.getElementById("cheer-sound");
    const fart = document.getElementById("fart-sound");
    const votedForMajority =
      (currentChoice === "red" && redPercent >= bluePercent) ||
      (currentChoice === "blue" && bluePercent >= redPercent);

    if (votedForMajority) {
      cheer.play().catch(() => {});
    } else {
      fart.play().catch(() => {});
    }
  }
});

function loadNextQuestion() {
  stopSounds();
  hasVoted = false;
  currentChoice = "";
  currentQuestionId = "";

  document.getElementById("red").style.flexGrow = 1;
  document.getElementById("blue").style.flexGrow = 1;

  document.getElementById("red-label").innerText = "Loading...";
  document.getElementById("blue-label").innerText = "Loading...";
  document.getElementById("red-votes").innerText = "";
  document.getElementById("red-percent").innerText = "";
  document.getElementById("blue-votes").innerText = "";
  document.getElementById("blue-percent").innerText = "";

  socket.emit("get-random-question");
}

function stopSounds() {
  const cheer = document.getElementById("cheer-sound");
  const fart = document.getElementById("fart-sound");
  cheer.pause();
  cheer.currentTime = 0;
  fart.pause();
  fart.currentTime = 0;
}

function showAdPopup() {
  const popup = document.createElement("div");
  popup.style.position = "fixed";
  popup.style.top = "50%";
  popup.style.left = "50%";
  popup.style.transform = "translate(-50%, -50%)";
  popup.style.background = "white";
  popup.style.padding = "2rem";
  popup.style.borderRadius = "8px";
  popup.style.boxShadow = "0 0 10px rgba(0,0,0,0.3)";
  popup.style.zIndex = "9999";
  popup.innerHTML = `
    <h3>Advertisement 🤑</h3>
    <p>Thanks for playing!</p>
    <button id="closeAd">Continue</button>
  `;
  document.body.appendChild(popup);

  document.getElementById("closeAd").onclick = () => {
    popup.remove();
  };
}
