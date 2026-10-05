/** Motor Tetris — grade, peças, spawn seguro, sombra e linhas. */

export const COLS = 10;
export const ROWS = 18;

/** Cor fixa por tipo de peça (tabuleiro e prévia “Próxima”). */
export const PIECE_COLORS = {
  I: "#3de8ff", /* reta — ciano */
  O: "#ffe14a", /* quadrado — amarelo */
  T: "#9b6bff", /* T — roxo */
  S: "#3cce6e", /* S — verde */
  Z: "#ff4d4d", /* Z — vermelho */
  J: "#3d8bfd", /* J — azul */
  L: "#ff8a1e", /* L — laranja */
  DOT: "#f8f9fa",
};

const SHAPES = {
  I: [[0, 0], [1, 0], [2, 0], [3, 0]],
  O: [[0, 0], [1, 0], [0, 1], [1, 1]],
  T: [[1, 0], [0, 1], [1, 1], [2, 1]],
  S: [[1, 0], [2, 0], [0, 1], [1, 1]],
  Z: [[0, 0], [1, 0], [1, 1], [2, 1]],
  J: [[0, 0], [0, 1], [1, 1], [2, 1]],
  L: [[2, 0], [0, 1], [1, 1], [2, 1]],
  DOT: [[0, 0]],
};

const PIECE_TYPES = ["I", "O", "T", "S", "Z", "J", "L"];

function rotateCells(cells) {
  const maxX = Math.max(...cells.map(([x]) => x));
  const maxY = Math.max(...cells.map(([, y]) => y));
  const size = Math.max(maxX, maxY) + 1;
  const rotated = cells.map(([x, y]) => [size - 1 - y, x]);
  const minX = Math.min(...rotated.map(([x]) => x));
  const minY = Math.min(...rotated.map(([, y]) => y));
  return rotated.map(([x, y]) => [x - minX, y - minY]);
}

function rotationSet(type) {
  const base = SHAPES[type];
  if (type === "O" || type === "DOT") return [base.map(([x, y]) => [x, y])];
  const set = [];
  let cells = base.map(([x, y]) => [x, y]);
  for (let i = 0; i < 4; i += 1) {
    const key = cells.map(([x, y]) => `${x},${y}`).sort().join("|");
    if (!set.some((s) => s.map(([x, y]) => `${x},${y}`).sort().join("|") === key)) {
      set.push(cells.map(([x, y]) => [x, y]));
    }
    cells = rotateCells(cells);
  }
  return set;
}

const ROTATIONS = Object.fromEntries(PIECE_TYPES.map((t) => [t, rotationSet(t)]));
ROTATIONS.DOT = rotationSet("DOT");

export function createEmptyBoard() {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(null));
}

export function createPiece(type, rotationIndex = 0) {
  const rotations = ROTATIONS[type] ?? ROTATIONS.I;
  const ri = ((rotationIndex % rotations.length) + rotations.length) % rotations.length;
  return {
    type,
    rotationIndex: ri,
    cells: rotations[ri].map(([x, y]) => [x, y]),
    color: PIECE_COLORS[type] ?? PIECE_COLORS.I,
  };
}

export function pieceCells(piece, px, py) {
  return piece.cells.map(([x, y]) => [px + x, py + y]);
}

export function canPlace(board, piece, px, py) {
  for (const [x, y] of pieceCells(piece, px, py)) {
    if (x < 0 || x >= COLS || y >= ROWS) return false;
    if (y >= 0 && board[y][x]) return false;
  }
  return true;
}

export function lockPiece(board, piece, px, py) {
  const next = board.map((row) => [...row]);
  for (const [x, y] of pieceCells(piece, px, py)) {
    if (y >= 0 && y < ROWS && x >= 0 && x < COLS) next[y][x] = piece.type;
  }
  return next;
}

export function clearFullLines(board) {
  const kept = board.filter((row) => row.some((cell) => cell === null));
  const cleared = ROWS - kept.length;
  while (kept.length < ROWS) kept.unshift(Array(COLS).fill(null));
  return { board: kept, cleared };
}

export function ghostRow(board, piece, px, py) {
  let y = py;
  while (canPlace(board, piece, px, y + 1)) y += 1;
  return y;
}

export function hardDropRow(board, piece, px, py) {
  return ghostRow(board, piece, px, py);
}

export function rotatePiece(piece, direction = 1) {
  const rotations = ROTATIONS[piece.type] ?? ROTATIONS.I;
  const nextIndex = (piece.rotationIndex + direction + rotations.length) % rotations.length;
  return createPiece(piece.type, nextIndex);
}

export function shuffleBag(random) {
  const bag = [...PIECE_TYPES];
  for (let i = bag.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [bag[i], bag[j]] = [bag[j], bag[i]];
  }
  return bag;
}

/** Fila 7-bag com prévia da próxima e da seguinte. */
export function createPieceQueue(random) {
  const upcoming = [];
  const refill = () => {
    upcoming.push(...shuffleBag(random));
  };
  const ensure = (count) => {
    while (upcoming.length < count) refill();
  };
  return {
    peek(index = 0) {
      ensure(index + 1);
      return upcoming[index];
    },
    take() {
      ensure(1);
      return upcoming.shift();
    },
  };
}

export function pieceBounds(piece) {
  const xs = piece.cells.map(([x]) => x);
  const ys = piece.cells.map(([, y]) => y);
  return {
    width: Math.max(...xs) + 1,
    height: Math.max(...ys) + 1,
  };
}

export function findSpawnSlot(board, piece) {
  const { width } = pieceBounds(piece);
  const center = Math.floor((COLS - width) / 2);
  const xCandidates = [];
  for (let dx = 0; dx < COLS; dx += 1) {
    const left = center - dx;
    const right = center + dx;
    if (left >= 0 && left + width <= COLS) xCandidates.push(left);
    if (dx > 0 && right >= 0 && right + width <= COLS) xCandidates.push(right);
  }
  for (let py = -4; py <= 0; py += 1) {
    for (const px of xCandidates) {
      if (canPlace(board, piece, px, py)) return { px, py };
    }
  }
  return null;
}

export function countLockedCells(board) {
  let n = 0;
  for (let y = 0; y < ROWS; y += 1) {
    for (let x = 0; x < COLS; x += 1) {
      if (board[y][x]) n += 1;
    }
  }
  return n;
}

export function fillRowExcept(board, row, skipX, fillType = "J") {
  const next = board.map((r) => [...r]);
  for (let x = 0; x < COLS; x += 1) {
    if (x === skipX) next[row][x] = null;
    else next[row][x] = fillType;
  }
  return next;
}
