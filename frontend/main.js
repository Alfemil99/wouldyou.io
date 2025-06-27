import { io } from "https://cdn.socket.io/4.7.4/socket.io.esm.min.js";
const socket = io("https://v-r-backend.onrender.com");

const questionId = "q1";
let hasVoted = false;

document.body.innerHTML = `
  <main style="font-family: sans-serif; text-align: center; padding: 2rem;">
    <h2 id="question">Loading...</h2>
    <div id="options" style="margin-top: 2rem;">
      <button id="btnRed" style="padding: 1rem 2rem; background-color: red; color: white; font-size: 1.2rem; margin-right: 1rem;">🔴</button>
      <button id="btnBlue" style="padding: 1rem 2rem; background-color: blue; color: white; font-size: 1.2rem;">🔵</button>
    </div>
    <div id="result" style="margin-top: 2rem; font-size: 1.2rem;"></div>
  </main>
`;

socket.emit("get-question", questionId);

socket.on("question-data", (data) => {
  document.getElementById("question").innerText = `${data.question_red} 🔴 eller 🔵 ${data.question_blue}?`;
});

document.getElementById("btnRed").onclick = () => vote("red");
document.getElementById("btnBlue").onclick = () => vote("blue");

function vote(choice) {
  if (hasVoted) return;
  hasVoted = true;
  socket.emit("vote", { questionId, choice });
}

socket.on("vote-result", (data) => {
  const total = data.votes_red + data.votes_blue;
  const redPercent = Math.round((data.votes_red / total) * 100);
  const bluePercent = 100 - redPercent;

  document.getElementById("options").style.display = "none";
  document.getElementById("result").innerHTML = `
    🔴 ${data.question_red}: ${redPercent}% (${data.votes_red} stemmer)<br>
    🔵 ${data.question_blue}: ${bluePercent}% (${data.votes_blue} stemmer)
  `;
});
