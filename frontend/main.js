import { io } from "https://cdn.socket.io/4.7.4/socket.io.esm.min.js";
const socket = io("https://v-r-backend.onrender.com");

let soundEnabled = true;

const muteToggle = document.getElementById("mute-toggle");
const createBtn = document.getElementById("create-btn");
const createModal = document.getElementById("create-modal");
const closeModal = document.getElementById("closeModal");
const submitPoll = document.getElementById("submitPoll");

// 🔊 Toggle sound
muteToggle.onclick = () => {
  soundEnabled = !soundEnabled;
  muteToggle.innerText = soundEnabled ? "🔊" : "🔇";
  stopSounds();
};

// 📝 Open create modal
createBtn.onclick = () => {
  createModal.style.display = "block";
};

// ❌ Close create modal
closeModal.onclick = () => {
  createModal.style.display = "none";
  resetCreateModal();
};

// ✅ Submit custom poll
submitPoll.onclick = async () => {
  const questionText = document.getElementById("questionText").value.trim();
  const option1 = document.getElementById("option1").value.trim();
  const option2 = document.getElementById("option2").value.trim();

  if (!questionText || !option1 || !option2) {
    document.getElementById("create-status").innerText = "Fill out question & at least 2 options.";
    return;
  }

  const res = await fetch("https://v-r-backend.onrender.com/submit-poll", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      question_text: questionText,
      options: [
        { text: option1 },
        { text: option2 }
      ]
    })
  });

  const msg = await res.text();
  document.getElementById("create-status").innerText = msg;

  setTimeout(() => {
    createModal.style.display = "none";
    resetCreateModal();
  }, 1500);
};

function resetCreateModal() {
  document.getElementById("questionText").value = "";
  document.getElementById("option1").value = "";
  document.getElementById("option2").value = "";
  document.getElementById("create-status").innerText = "";
}

function stopSounds() {
  const cheer = document.getElementById("cheer-sound");
  const fart = document.getElementById("fart-sound");
  if (cheer) { cheer.pause(); cheer.currentTime = 0; }
  if (fart) { fart.pause(); fart.currentTime = 0; }
}

// 🎲 Load polls
socket.emit("get-random-polls");

socket.on("polls-data", (polls) => {
  const container = document.getElementById("poll-container");
  container.innerHTML = "";

  polls.forEach((poll) => {
    const pollCard = document.createElement("div");
    pollCard.classList.add("poll-card");

    const q = document.createElement("div");
    q.classList.add("poll-question");
    q.innerText = poll.question_text;
    pollCard.appendChild(q);

    poll.options.forEach((option, index) => {
      const optionDiv = document.createElement("div");
      optionDiv.classList.add("poll-option");
      optionDiv.innerText = option.text;

      optionDiv.onclick = () => {
        socket.emit("vote", { pollId: poll._id, optionIndex: index });
      };

      pollCard.appendChild(optionDiv);
    });

    container.appendChild(pollCard);
  });

  // ➕ Ad Slot last
  const adSlot = document.createElement("div");
  adSlot.classList.add("ad-slot");
  adSlot.innerHTML = `
    <ins class="adsbygoogle"
      style="display:block"
      data-ad-client="ca-pub-5747384081350738"
      data-ad-slot="4958435717"
      data-ad-format="auto"
      data-full-width-responsive="true"></ins>
  `;
  container.appendChild(adSlot);
  if (window.adsbygoogle) (adsbygoogle = window.adsbygoogle || []).push({});
});

// ✅ Show live result
socket.on("vote-result", (poll) => {
  const pollCards = document.querySelectorAll(".poll-card");
  pollCards.forEach(card => {
    const question = card.querySelector(".poll-question").innerText;
    if (question === poll.question_text) {
      const options = card.querySelectorAll(".poll-option");
      const totalVotes = poll.options.reduce((sum, opt) => sum + opt.votes, 0);

      poll.options.forEach((opt, i) => {
        const percent = totalVotes > 0 ? Math.round((opt.votes / totalVotes) * 100) : 0;
        options[i].innerText = `${opt.text} — ${percent}%`;
        options[i].style.background = `linear-gradient(90deg, #3b53db ${percent}%, #444 ${percent}%)`;
      });

      if (soundEnabled) {
        stopSounds();
        const topVote = Math.max(...poll.options.map(o => o.votes));
        const votedForTop = poll.options.some(opt => opt.votes === topVote);
        if (votedForTop) {
          document.getElementById("cheer-sound").play().catch(() => {});
        } else {
          document.getElementById("fart-sound").play().catch(() => {});
        }
      }
    }
  });
});
