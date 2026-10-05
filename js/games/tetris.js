import { playSfx } from "../engine.js";

import { phaseTransitionOut } from "../lib/gameExperience.js";

import {

  canPlace,

  clearFullLines,

  COLS,

  createEmptyBoard,

  createPiece,

  createPieceQueue,

  fillRowExcept,

  findSpawnSlot,

  ghostRow,

  hardDropRow,

  lockPiece,

  PIECE_COLORS,

  pieceBounds,

  pieceCells,

  ROWS,

  rotatePiece,

} from "../lib/arcade/tetrisEngine.js";

import { GAME_PHASE_COUNT, levelName, phaseBanner, phaseTotal } from "../lib/phases.js";

import { phaseStartLine } from "../lib/narrator.js";



/** Linhas completadas na fase atual para avançar (comportamento clássico de campanha). */

const LINES_PER_PHASE = 3;

/** Velocidade de queda automática — igual em todas as fases. */
const DROP_MS = 1000;

const PHASES = Array.from({ length: GAME_PHASE_COUNT }, () => ({

  linesGoal: LINES_PER_PHASE,

  dropMs: DROP_MS,

}));



const E2E_SPEC = { linesGoal: 1, dropMs: 60_000 };

/** Intervalo mínimo entre comandos no mesmo botão (ms). */
const TAP_GAP_MS = 165;
/** Ignora o click fantasma após pointerdown no toque (ms). */
const CLICK_DEDUPE_MS = 480;

/**
 * Um toque = um movimento. Evita duplo passo (pointerdown + click) e rajadas rápidas.
 */
function bindTetrisPress(element, action, signal) {
  if (!element) return;
  let lastFireAt = 0;
  let ignoreClickUntil = 0;

  const fire = (event) => {
    const now = performance.now();
    if (event?.type === "click" && now < ignoreClickUntil) {
      event.preventDefault();
      return;
    }
    if (now - lastFireAt < TAP_GAP_MS) {
      event?.preventDefault?.();
      return;
    }
    lastFireAt = now;
    if (event?.type === "pointerdown") {
      ignoreClickUntil = now + CLICK_DEDUPE_MS;
    }
    event?.preventDefault?.();
    action();
  };

  element.addEventListener(
    "pointerdown",
    (event) => {
      if (event.button !== 0) return;
      fire(event);
    },
    { signal, passive: false },
  );
  element.addEventListener(
    "click",
    (event) => {
      if (event.button !== 0) return;
      fire(event);
    },
    { signal },
  );
  element.addEventListener(
    "keydown",
    (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      fire(event);
    },
    { signal },
  );
}

function gridMarkup() {

  let html = "";

  for (let y = 0; y < ROWS; y += 1) {

    for (let x = 0; x < COLS; x += 1) {

      html += `<div class="tetris-cell" data-cell data-x="${x}" data-y="${y}"></div>`;

    }

  }

  return html;

}



function miniGridMarkup(prefix) {

  let html = "";

  for (let y = 0; y < 4; y += 1) {

    for (let x = 0; x < 4; x += 1) {

      html += `<div class="tetris-mini-cell" data-${prefix}-cell data-mx="${x}" data-my="${y}"></div>`;

    }

  }

  return html;

}



function paintMiniGrid(cells, type) {

  const piece = createPiece(type, 0);

  const { width, height } = pieceBounds(piece);

  const offsetX = Math.floor((4 - width) / 2);

  const offsetY = Math.floor((4 - height) / 2);

  const on = new Set(piece.cells.map(([x, y]) => `${offsetX + x},${offsetY + y}`));

  cells.forEach((cell) => {

    const mx = Number(cell.dataset.mx);

    const my = Number(cell.dataset.my);

    const lit = on.has(`${mx},${my}`);

    cell.className = "tetris-mini-cell";

    cell.removeAttribute("style");

    if (lit) {

      cell.classList.add("is-on");

      cell.dataset.piece = type;

      cell.style.setProperty("--cell", PIECE_COLORS[type] ?? piece.color);

    }

  });

}



export const tetris = {

  id: "tetris",

  title: "Tetris",

  goal: "Encaixar peças e limpar linhas",

  mount(ctx) {

    const signal = ctx.beginPhase();

    const totalPhases = phaseTotal(ctx);

    const baseSpecs = PHASES.slice(0, totalPhases);

    const specs =

      ctx.e2e && !ctx.e2eFull

        ? [E2E_SPEC]

        : baseSpecs.map((phase) => (ctx.e2e ? { ...phase, linesGoal: 1, dropMs: 60_000 } : phase));



    let phaseIndex = 0;

    let board = createEmptyBoard();

    const queue = createPieceQueue(ctx.random);

    let linesThisPhase = 0;

    let dropClock = 0;

    let lastTick = 0;

    let active = null;

    let px = 0;

    let py = 0;

    let gameOver = false;



    const currentSpec = () => specs[phaseIndex] ?? specs[specs.length - 1];



    const bootstrapE2e = () => {

      const row = ROWS - 1;

      const gapX = Math.floor(COLS / 2);

      board = fillRowExcept(board, row, gapX);

      spawnPiece("DOT");

      px = gapX;

      py = row - 1;

    };



    const spawnPiece = (typeOverride) => {

      if (gameOver || ctx.won) return false;

      const type = typeOverride ?? queue.take();

      const piece = createPiece(type, 0);

      const slot = findSpawnSlot(board, piece);

      if (!slot) {

        gameOver = true;

        active = null;

        ctx.feedback("Game over! Não há espaço para a próxima peça.", "no");

        playSfx("no");

        return false;

      }

      px = slot.px;

      py = slot.py;

      active = piece;

      return true;

    };



    ctx.mountPhase(`

      ${phaseBanner(phaseIndex, totalPhases)}

      <div class="tetris-hud">

        <p class="tetris-stat">

          <span aria-hidden="true">📏</span>

          Linhas nesta fase: <strong data-lines>0</strong> / <span data-lines-goal>${currentSpec().linesGoal}</span>

        </p>

      </div>

      <div class="tetris-stage">

        <aside class="tetris-queue" aria-label="Próxima peça">

          <p class="tetris-queue-label">Próxima</p>

          <div class="tetris-mini" data-next-preview>${miniGridMarkup("next")}</div>

        </aside>

        <div class="tetris-frame" data-tetris-frame>

          <div class="tetris-grid" data-grid role="img" aria-label="Campo de Tetris">

            ${gridMarkup()}

          </div>

        </div>

      </div>

      <div class="tetris-controls" role="group" aria-label="Controles">

        <button type="button" class="btn tetris-btn" data-move="left" aria-label="Seta esquerda">

          <span class="tetris-btn-icon" aria-hidden="true">◀</span>

          <span class="tetris-btn-text">Esquerda</span>

        </button>

        <button type="button" class="btn tetris-btn tetris-btn--rotate" data-move="rotate" aria-label="Girar peça">

          <span class="tetris-btn-icon" aria-hidden="true">↻</span>

          <span class="tetris-btn-text">Girar</span>

        </button>

        <button type="button" class="btn tetris-btn" data-move="right" aria-label="Seta direita">

          <span class="tetris-btn-icon" aria-hidden="true">▶</span>

          <span class="tetris-btn-text">Direita</span>

        </button>

      </div>

    `);



    const linesEl = ctx.view.querySelector("[data-lines]");

    const linesGoalEl = ctx.view.querySelector("[data-lines-goal]");

    const frame = ctx.view.querySelector("[data-tetris-frame]");

    const cells = [...ctx.view.querySelectorAll("[data-cell]")];

    const nextCells = [...ctx.view.querySelectorAll("[data-next-cell]")];



    const refreshPhaseHud = () => {

      const spec = currentSpec();

      if (linesGoalEl) linesGoalEl.textContent = String(spec.linesGoal);

      if (linesEl) linesEl.textContent = String(linesThisPhase);

      const badge = ctx.view.querySelector(".phase-badge");

      const level = ctx.view.querySelector(".phase-level");

      const fill = ctx.view.querySelector(".gx-progress-fill");

      const bar = ctx.view.querySelector(".gx-progress");

      if (badge) badge.textContent = `Fase ${phaseIndex + 1} de ${totalPhases}`;

      if (level) level.textContent = levelName(phaseIndex);

      const pct = Math.round(((phaseIndex + 1) / totalPhases) * 100);

      if (fill) fill.style.width = `${pct}%`;

      if (bar) bar.setAttribute("aria-valuenow", String(pct));

    };



    const paintPreviews = () => {

      paintMiniGrid(nextCells, queue.peek(0));

    };



    const paintBoard = () => {

      const live = new Set();

      const ghost = new Set();

      if (active) {

        for (const [x, y] of pieceCells(active, px, py)) {

          if (y >= 0) live.add(`${x},${y}`);

        }

        const gy = ghostRow(board, active, px, py);

        if (gy !== py) {

          for (const [x, y] of pieceCells(active, px, gy)) {

            if (y >= 0) ghost.add(`${x},${y}`);

          }

        }

      }

      cells.forEach((cell) => {

        const x = Number(cell.dataset.x);

        const y = Number(cell.dataset.y);

        const key = `${x},${y}`;

        const locked = board[y][x];

        cell.className = "tetris-cell";

        cell.removeAttribute("style");

        cell.removeAttribute("data-piece");

        if (live.has(key) && active) {

          cell.classList.add("is-live");

          cell.dataset.piece = active.type;

          cell.style.setProperty("--cell", PIECE_COLORS[active.type] ?? active.color);

        } else if (ghost.has(key) && active) {

          cell.classList.add("is-ghost");

          cell.dataset.piece = active.type;

          cell.style.setProperty("--cell", PIECE_COLORS[active.type] ?? active.color);

        } else if (locked) {

          cell.classList.add("is-locked");

          cell.dataset.piece = locked;

          cell.style.setProperty("--cell", PIECE_COLORS[locked] ?? "#888");

        }

      });

      if (linesEl) linesEl.textContent = String(linesThisPhase);

      paintPreviews();

    };



    const advancePhaseIfReady = () => {

      const spec = currentSpec();

      if (linesThisPhase < spec.linesGoal || ctx.won) return;



      if (phaseIndex >= totalPhases - 1) {

        ctx.win("Você venceu o Tetris em todas as fases!");

        return;

      }



      const done = phaseIndex;

      const next = phaseIndex + 1;

      ctx.feedback(`Fase ${done + 1} feita! Agora: ${levelName(next)}.`, "ok");



      phaseTransitionOut(ctx, () => {

        if (!ctx.alive || ctx.won) return;

        phaseIndex = next;

        linesThisPhase = 0;

        refreshPhaseHud();

        ctx.narrate?.(phaseStartLine(next, totalPhases, ""));

        if (ctx.e2e) {

          board = createEmptyBoard();

          bootstrapE2e();

        }

        paintBoard();

      });

    };



    const afterLock = (nextBoard) => {

      const { board: clearedBoard, cleared } = clearFullLines(nextBoard);

      board = clearedBoard;

      if (cleared > 0) {

        linesThisPhase += cleared;

        const streak = ctx.stats.recordHit();

        ctx.updateStreak();

        playSfx("ok");

        frame.classList.add("is-line-clear");

        ctx.later(() => frame.classList.remove("is-line-clear"), 340);

        const spec = currentSpec();

        const need = spec.linesGoal - linesThisPhase;

        const tail =

          need > 0 ? ` Falta${need > 1 ? "m" : ""} ${need} linha${need > 1 ? "s" : ""} nesta fase.` : "";

        ctx.feedback(

          (cleared > 1 ? `${cleared} linhas!` : streak >= 2 ? "Linha!" : "Linha completa!") + tail,

          "ok",

        );

        advancePhaseIfReady();

      }

      if (!ctx.won && !gameOver) {

        const spawned = spawnPiece();

        if (spawned) dropClock = 0;

      }

      paintBoard();

    };



    const commitLock = () => {

      if (!active) return;

      const next = lockPiece(board, active, px, py);

      active = null;

      afterLock(next);

    };



    const lockActive = () => {

      if (!active) return;

      py = hardDropRow(board, active, px, py);

      commitLock();

    };



    const move = (dir) => {

      if (!active || ctx.won || gameOver) return;

      if (dir === "rotate") {

        const rotated = rotatePiece(active, 1);

        for (const kick of [0, -1, 1, -2, 2]) {

          if (canPlace(board, rotated, px + kick, py)) {

            active = rotated;

            px += kick;

            ctx.haptic("light");

            break;

          }

        }

        paintBoard();

        return;

      }

      if (dir === "left" || dir === "right") {

        const dx = dir === "left" ? -1 : 1;

        if (canPlace(board, active, px + dx, py)) {

          px += dx;

          ctx.haptic("light");

        }

        paintBoard();

        return;

      }

      if (dir === "down") {

        if (canPlace(board, active, px, py + 1)) {

          py += 1;

          dropClock = 0;

          ctx.haptic("light");

          paintBoard();

        } else {

          commitLock();

        }

        return;

      }

      if (dir === "drop") lockActive();

    };



    ctx.view.querySelectorAll("[data-move]").forEach((btn) => {

      bindTetrisPress(btn, () => move(btn.dataset.move), signal);

    });



    let lastKeyAt = 0;

    const onKey = (event) => {

      if (!active || ctx.won || gameOver) return;

      const map = {

        ArrowLeft: "left",

        ArrowRight: "right",

        ArrowDown: "down",

        ArrowUp: "rotate",

        " ": "drop",

      };

      const dir = map[event.key];

      if (!dir) return;

      event.preventDefault();

      const now = performance.now();

      const gap = event.repeat ? 150 : TAP_GAP_MS;

      if (now - lastKeyAt < gap) return;

      lastKeyAt = now;

      move(dir);

    };

    window.addEventListener("keydown", onKey, { signal });



    ctx.onTick((time) => {

      if (!ctx.alive || ctx.won || gameOver || !active) return;

      const spec = currentSpec();

      const dt = lastTick ? time - lastTick : 0;

      lastTick = time;

      dropClock += dt;

      if (dropClock < spec.dropMs) return;

      dropClock = 0;

      if (canPlace(board, active, px, py + 1)) {

        py += 1;

        paintBoard();

        return;

      }

      commitLock();

    });



    if (ctx.e2e) bootstrapE2e();

    else spawnPiece();

    paintBoard();

  },

};


