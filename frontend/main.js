import { io } from "https://cdn.socket.io/4.7.4/socket.io.esm.min.js";
const socket = io("https://v-r-backend.onrender.com");

let currentQuestionId = "";
let currentChoice = "";
let hasVoted = false;

// Første gang: hent random spørgsmål
socket.emit("get-random-question");

// Modtag spørgsmål
socket.on("question-data", (data) => {
  currentQuestionId = data._id || "fail";

  document.getElementById("red-label").innerText = data.question_red;
  document.getElementById("blue-label").innerText = data.question_blue;

  // Reset flex til 50/50
  document.getElementById("red").style.flex = 1;
  document.getElementById("blue").style.flex = 1;

  hasVoted = false;
  currentChoice = "";
});

// Klik paneler
document.getElementById("red").onclick = () => handleClick("red");
document.getElementById("blue").onclick = () => handleClick("blue");

function handleClick(choice) {
  if (!hasVoted) {
    vote(choice);
  } else {
    // Hvis du allerede har stemt, så hopper du videre!
    loadNextQuestion();
  }
}

function vote(choice) {
  hasVoted = true;
  currentChoice = choice;
  socket.emit("vote", { questionId: currentQuestionId, choice });
}

socket.on("vote-result", (data) => {
  const total = data.votes_red + data.votes_blue;
  const redPercent = Math.round((data.votes_red / total) * 100);
  const bluePercent = 100 - redPercent;

  // Animate panels
  document.getElementById("red").style.flex = redPercent;
  document.getElementById("blue").style.flex = bluePercent;

  document.getElementById("red").innerHTML = `
    <div>${data.question_red}</div>
    <div>${data.votes_red} votes</div>
    <div>${redPercent}%</div>
  `;
  document.getElementById("blue").innerHTML = `
    <div>${data.question_blue}</div>
    <div>${data.votes_blue} votes</div>
    <div>${bluePercent}%</div>
  `;

  // Lyd
  const cheer = document.getElementById("cheer-sound");
  const fart = document.getElementById("fart-sound");

  let votedForMajority = false;
  if (currentChoice === "red") {
    votedForMajority = redPercent >= bluePercent;
  } else {
    votedForMajority = bluePercent >= redPercent;
  }

  if (votedForMajority) {
    cheer.currentTime = 0;
    cheer.play().catch(() => {});
  } else {
    fart.currentTime = 0;
    fart.play().catch(() => {});
  }
});

// Loader næste spørgsmål
function loadNextQuestion() {
  hasVoted = false;
  currentChoice = "";
  currentQuestionId = "";

  // Reset panels
  document.getElementById("red").style.flex = 1;
  document.getElementById("blue").style.flex = 1;

  document.getElementById("red").innerHTML = "<div id='red-label'>Loading...</div>";
  document.getElementById("blue").innerHTML = "<div id='blue-label'>Loading...</div>";

  socket.emit("get-random-question");
}
