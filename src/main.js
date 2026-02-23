const boardElement = document.getElementById("board");

let currentPuzzle = [];
let solution = [];
let originalPuzzle = [];

/* ===================== PUZZLES ===================== */

const puzzles = {

  easy: {
    puzzle: [
      [5,3,0,0,7,0,0,0,0],
      [6,0,0,1,9,5,0,0,0],
      [0,9,8,0,0,0,0,6,0],
      [8,0,0,0,6,0,0,0,3],
      [4,0,0,8,0,3,0,0,1],
      [7,0,0,0,2,0,0,0,6],
      [0,6,0,0,0,0,2,8,0],
      [0,0,0,4,1,9,0,0,5],
      [0,0,0,0,8,0,0,7,9]
    ],
    solution: [
      [5,3,4,6,7,8,9,1,2],
      [6,7,2,1,9,5,3,4,8],
      [1,9,8,3,4,2,5,6,7],
      [8,5,9,7,6,1,4,2,3],
      [4,2,6,8,5,3,7,9,1],
      [7,1,3,9,2,4,8,5,6],
      [9,6,1,5,3,7,2,8,4],
      [2,8,7,4,1,9,6,3,5],
      [3,4,5,2,8,6,1,7,9]
    ]
  },

  medium: {
    puzzle: [
      [0,0,0,6,0,0,4,0,0],
      [7,0,0,0,0,3,6,0,0],
      [0,0,0,0,9,1,0,8,0],
      [0,0,0,0,0,0,0,0,0],
      [0,5,0,1,8,0,0,0,3],
      [0,0,0,3,0,6,0,4,5],
      [0,4,0,2,0,0,0,6,0],
      [9,0,3,0,0,0,0,0,0],
      [0,2,0,0,0,0,1,0,0]
    ],
    solution: [
      [5,8,1,6,7,2,4,3,9],
      [7,9,2,8,4,3,6,5,1],
      [3,6,4,5,9,1,7,8,2],
      [4,3,8,9,5,7,2,1,6],
      [2,5,6,1,8,4,9,7,3],
      [1,7,9,3,2,6,8,4,5],
      [8,4,5,2,1,9,3,6,7],
      [9,1,3,7,6,8,5,2,4],
      [6,2,7,4,3,5,1,9,8]
    ]
  },

  hard: {
    puzzle: [
      [0,0,0,0,0,0,0,1,2],
      [0,0,0,0,3,5,0,0,0],
      [0,0,0,7,0,0,0,0,0],
      [0,0,0,0,0,0,3,0,0],
      [0,0,1,0,8,0,0,0,0],
      [0,0,0,0,0,0,0,0,0],
      [5,0,0,0,0,0,0,0,0],
      [0,0,0,2,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0]
    ],
    solution: [
      [3,5,7,8,9,4,6,1,2],
      [1,2,8,6,3,5,4,9,7],
      [4,9,6,7,2,1,8,5,3],
      [8,6,5,1,4,9,3,2,7],
      [9,7,1,3,8,2,5,4,6],
      [2,4,3,5,6,7,1,8,9],
      [5,1,9,4,7,8,2,3,6],
      [7,8,4,2,1,3,9,6,5],
      [6,3,2,9,5,6,7,8,1] // corrected below
    ]
  }

};

/* Fix duplicate in hard solution */
puzzles.hard.solution[8] = [6,3,2,9,5,1,7,8,4];

/* ===================== BOARD ===================== */

function createBoard() {
  boardElement.innerHTML = "";

  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {

      const input = document.createElement("input");
      input.classList.add("cell");
      input.maxLength = 1;
      input.dataset.row = row;
      input.dataset.col = col;

      if (col % 3 === 0) input.style.borderLeft = "3px solid black";
      if (row % 3 === 0) input.style.borderTop = "3px solid black";
      if (col === 8) input.style.borderRight = "3px solid black";
      if (row === 8) input.style.borderBottom = "3px solid black";

      if (currentPuzzle[row][col] !== 0) {
        input.value = currentPuzzle[row][col];
        input.disabled = true;
        input.classList.add("prefilled");
      }

      input.addEventListener("input", () => {
        input.classList.remove("wrong");
      });

      boardElement.appendChild(input);
    }
  }
}

/* ===================== GAME LOGIC ===================== */

function getBoardState() {
  const board = Array.from({ length: 9 }, () => Array(9).fill(0));
  document.querySelectorAll(".cell").forEach(cell => {
    const r = cell.dataset.row;
    const c = cell.dataset.col;
    board[r][c] = cell.value === "" ? 0 : parseInt(cell.value);
  });
  return board;
}

function getCandidates(board, row, col) {
  const used = new Set();

  for (let i = 0; i < 9; i++) {
    if (board[row][i]) used.add(board[row][i]);
    if (board[i][col]) used.add(board[i][col]);
  }

  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;

  for (let r = boxRow; r < boxRow + 3; r++) {
    for (let c = boxCol; c < boxCol + 3; c++) {
      if (board[r][c]) used.add(board[r][c]);
    }
  }

  const candidates = [];
  for (let n = 1; n <= 9; n++) {
    if (!used.has(n)) candidates.push(n);
  }

  return candidates;
}

/* ===================== HINT ===================== */

window.giveHint = function () {

  const cells = document.querySelectorAll(".cell");
  let hasError = false;

  cells.forEach(cell => cell.classList.remove("wrong"));

  cells.forEach(cell => {
    if (!cell.disabled && cell.value !== "") {
      const r = cell.dataset.row;
      const c = cell.dataset.col;
      if (parseInt(cell.value) !== solution[r][c]) {
        cell.classList.add("wrong");
        hasError = true;
      }
    }
  });

  if (hasError) {
    alert("Fix highlighted cells first.");
    return;
  }

  const board = getBoardState();

  let bestCell = null;
  let minOptions = 10;

  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (board[r][c] === 0) {
        const candidates = getCandidates(board, r, c);
        if (candidates.length < minOptions) {
          minOptions = candidates.length;
          bestCell = { r, c };
        }
      }
    }
  }

  if (bestCell) {
    const cell = document.querySelector(
      `.cell[data-row='${bestCell.r}'][data-col='${bestCell.c}']`
    );
    cell.value = solution[bestCell.r][bestCell.c];
  }

  checkIfComplete();
};

/* ===================== COMPLETE CHECK ===================== */

function checkIfComplete() {
  const cells = document.querySelectorAll(".cell");
  let filled = true;
  let error = false;

  cells.forEach(cell => {
    if (cell.value === "") filled = false;
    else {
      const r = cell.dataset.row;
      const c = cell.dataset.col;
      if (parseInt(cell.value) !== solution[r][c]) error = true;
    }
  });

  if (filled) {
    if (!error) alert("🎉 Congratulations! You solved it!");
    else alert("❌ Completed but some answers are wrong.");
  }
}

/* ===================== LOAD & RESET ===================== */

window.loadPuzzle = function (difficulty) {
  const data = puzzles[difficulty];
  if (!data) return;
  currentPuzzle = JSON.parse(JSON.stringify(data.puzzle));
  originalPuzzle = JSON.parse(JSON.stringify(data.puzzle));
  solution = data.solution;
  createBoard();
};

window.resetBoard = function () {
  currentPuzzle = JSON.parse(JSON.stringify(originalPuzzle));
  createBoard();
};

loadPuzzle("easy");