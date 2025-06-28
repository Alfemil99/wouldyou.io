import { io } from "https://cdn.socket.io/4.7.4/socket.io.esm.min.js";
const socket = io("https://v-r-backend.onrender.com");

let currentChoice = "";
let hasVoted = false;

// Første load: hent random question
socket.emit("get-random-question");

socket.on("question-data", (data) => {
  document.getElementById("red-label").innerText = data.question_red;
  document.getElementById("blue-label").innerText = data.question_blue;
});

document.getElementById("red").onclick = () => vote("red");
document.getElementById("blue").onclick = () => vote("blue");

function vote(choice) {
  if (hasVoted) return;
  hasVoted = true;
  currentChoice = choice;

  // For demo: sender dummy questionId (du kan ændre hvis du bruger specifikke)
  socket.emit("vote", { questionId: "q1", choice });
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

  // Play sound!
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

  document.getElementById("next-btn").style.display = "block";
});

document.getElementById("next-btn").onclick = () => {
  hasVoted = false;
  currentChoice = "";
  document.getElementById("next-btn").style.display = "none";

  // Reset panels
  document.getElementById("red").style.flex = 1;
  document.getElementById("blue").style.flex = 1;
  document.getElementById("red").innerHTML = "<div>Loading...</div>";
  document.getElementById("blue").innerHTML = "<div>Loading...</div>";

  socket.emit("get-random-question");
};
