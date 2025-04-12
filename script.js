import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getDatabase, ref, onValue, set, get, update } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyDun0DzdCoYnWvNNQLn8KBPisU7U8ruXcE",
  authDomain: "chon-so.firebaseapp.com",
  projectId: "chon-so",
  storageBucket: "chon-so.firebasestorage.app",
  messagingSenderId: "121525743258",
  appId: "1:121525743258:web:740f1852ea0d6ec5593923",
  measurementId: "G-DPQZHPMMXF"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const grid = document.getElementById("grid");
const currentNumberEl = document.getElementById("current-number");
const score1El = document.getElementById("score1");
const score2El = document.getElementById("score2");
const winnerEl = document.getElementById("winner");

let currentNumber = 1;
let scores = [0, 0];
let playerId = Math.random() > 0.5 ? 0 : 1; // Random player ID (0 or 1)

// Tạo danh sách số ngẫu nhiên nếu chưa có
const gameRef = ref(db, "game");
get(gameRef).then(snapshot => {
  if (!snapshot.exists()) {
    const numbers = Array.from({ length: 100 }, (_, i) => i + 1)
      .sort(() => Math.random() - 0.5);
    const positions = {};
    numbers.forEach((n, i) => positions[n] = false);
    set(gameRef, {
      numbers,
      chosen: positions,
      currentNumber: 1,
      scores: [0, 0]
    });
  }
});

// Lắng nghe dữ liệu thay đổi
onValue(gameRef, (snapshot) => {
  const data = snapshot.val();
  if (!data) return;

  currentNumber = data.currentNumber;
  scores = data.scores;
  currentNumberEl.textContent = currentNumber;
  score1El.textContent = scores[0];
  score2El.textContent = scores[1];

  grid.innerHTML = "";
  data.numbers.forEach((num) => {
    const cell = document.createElement("div");
    cell.className = "cell";
    cell.textContent = num;
    if (data.chosen[num]) {
      cell.classList.add("correct");
      cell.style.pointerEvents = "none";
    }
    cell.addEventListener("click", () => {
      if (num === currentNumber && !data.chosen[num]) {
        const updates = {};
        updates["/game/chosen/" + num] = true;
        updates["/game/currentNumber"] = currentNumber + 1;
        updates["/game/scores/" + playerId] = scores[playerId] + 1;
        update(ref(db), updates);
      } else {
        cell.classList.add("wrong");
        setTimeout(() => cell.classList.remove("wrong"), 500);
      }
    });
    grid.appendChild(cell);
  });

  if (currentNumber > 100) {
    winnerEl.classList.remove("hidden");
    if (scores[0] > scores[1]) {
      winnerEl.textContent = "🎉 Người chơi 1 thắng!";
    } else if (scores[1] > scores[0]) {
      winnerEl.textContent = "🎉 Người chơi 2 thắng!";
    } else {
      winnerEl.textContent = "🤝 Hòa!";
    }
  }
});
