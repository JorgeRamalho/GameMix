import assert from "node:assert/strict";
import {
  canPlace,
  clearFullLines,
  COLS,
  countLockedCells,
  createEmptyBoard,
  createPiece,
  createPieceQueue,
  fillRowExcept,
  findSpawnSlot,
  lockPiece,
  ROWS,
} from "../js/lib/arcade/tetrisEngine.js";

{
  const board = createEmptyBoard();
  for (let x = 0; x < COLS; x += 1) board[0][x] = "J";
  const piece = createPiece("O", 0);
  const center = Math.floor((COLS - 2) / 2);
  assert.equal(canPlace(board, piece, center, -1), false);
  assert.ok(findSpawnSlot(board, piece));
}

{
  const q = createPieceQueue(() => 0.5);
  const a = q.peek(0);
  const b = q.peek(1);
  assert.notEqual(a, undefined);
  assert.notEqual(b, undefined);
}

{
  let board = createEmptyBoard();
  const row = ROWS - 1;
  board[ROWS - 2][3] = "J";
  board[ROWS - 2][4] = "J";
  board = fillRowExcept(board, row, 4);
  board = lockPiece(board, createPiece("DOT", 0), 4, row);
  const { board: cleared, cleared: lines } = clearFullLines(board);
  assert.equal(lines, 1);
  assert.equal(countLockedCells(cleared), 2);
  assert.ok(findSpawnSlot(cleared, createPiece("T", 0)));
}

console.log("tetris-engine.mjs: ok");
