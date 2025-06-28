import { io } from "https://cdn.socket.io/4.7.4/socket.io.esm.min.js";
const socket = io("https://v-r-backend.onrender.com");

let currentQuestionId = "";
let currentChoice = "";
let hasVoted = false;
let soundEnabled = true;
let voteCount = 0;
let tapHintTimeout = null;

const muteToggle = document.getElementById("mute-toggle");
const createBtn = document.getElementById("create-btn");
const createModal = document.getElementById("create-modal");
const closeModal = document.getElementById("closeModal");
const tapHint = document.getElementById("tapHint");

muteToggle.onclick = () => {
  soundEnabled = !soundEnabled;
  muteToggle.innerText = soundEnabled ? "🔊" : "🔇";
  stopSounds();
};

createBtn.onclick = () => {
  createModal.style.display = "block";
};

closeModal.onclick = () => {
  createModal.style.display = "none";
  resetCreateModal();
};

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

  const res = await fetch("https://v-r-backend.onrender.com/submit-question", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ optionA, optionB })
  });

  const msg = await res.text();
  document.getElementById("create-status").innerText = msg;

  // Close popup after short delay
  setTimeout(() => {
    createModal.style.display = "none";
    resetCreateModal();
  }, 1500);
};

function resetCreateModal() {
  document.getElementById("optionA").value = "";
  document.getElementById("optionB").value = "";
  document.getElementById("create-status").innerText = "";
}

socket.emit("get-random-question");

socket.on("question-data", (data) => {
  currentQuestionId = data._id || "fail";
  currentChoice = "";
  hasVoted = false;

  document.getElementById("red-label").innerText = data.question_red;
  document.getElementById("blue-label").innerText = data.question_blue;

  document.getElementById("red-votes").innerText = "";
  document.getElementById("red-percent").innerText = "";
  document.getElementById("blue-votes").innerText = "";
  document.getElementById("blue-percent").innerText = "";

  document.getElementById("red").style.flexGrow = 1;
  document.getElementById("blue").style.flexGrow = 1;

  hideTapHint();
});

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

  startTapHintTimer();
}

socket.on("vote-result", (data) => {
  const total = data.votes_red + data.votes_blue;
  const redPercent = total ? Math.round((data.votes_red / total) * 100) : 50;
  const bluePercent = 100 - redPercent;

  document.getElementById("red").style.flexGrow = redPercent;
  document.getElementById("blue").style.flexGrow = bluePercent;

  document.getElementById("red-votes").innerText = `${data.votes_red} votes`;
  document.getElementById("red-percent").innerText = `${redPercent}%`;
  document.getElementById("blue-votes").innerText = `${data.votes_blue} votes`;
  document.getElementById("blue-percent").innerText = `${bluePercent}%`;

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

  hideTapHint();
  clearTimeout(tapHintTimeout);

  socket.emit("get-random-question");
}

function stopSounds() {
  const cheer = document.getElementById("cheer-sound");
  const fart = document.getElementById("fart-sound");
  cheer.pause(); cheer.currentTime = 0;
  fart.pause(); fart.currentTime = 0;
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

  // Tilføj din manuelle AdSense-annoncekode her
  popup.innerHTML = `
    <h3>Advertisement 🤑</h3>
    <p>Thanks for playing!</p>
    <ins class="adsbygoogle"
         style="display:block"
         data-ad-client="ca-pub-5747384081350738"
         data-ad-slot="4958435717"
         data-ad-format="auto"
         data-full-width-responsive="true"></ins>
    <button id="closeAd">Continue</button>
  `;

  document.body.appendChild(popup);

  // Trigger annoncen så AdSense loader den dynamisk
  (adsbygoogle = window.adsbygoogle || []).push({});

  document.getElementById("closeAd").onclick = () => {
    popup.remove();
  };
}

function startTapHintTimer() {
  clearTimeout(tapHintTimeout);
  tapHintTimeout = setTimeout(() => {
    tapHint.style.display = "block";
  }, 4000); // 4 sekunder
}

function hideTapHint() {
  tapHint.style.display = "none";
}
