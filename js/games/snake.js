import { bindPress } from "../engine.js";
import { completePhase, GAME_PHASE_COUNT, phaseBanner, phaseNarrationTip, phaseTotal } from "../lib/phases.js";

const COLS = 16;
const ROWS = 16;

/**
 * Regras de campanha: em cada fase, coma esta quantidade de quadradinhos para avançar.
 * Fase 1 = 3, fase 2 = 4, … fase 10 = 12.
 */
export const FOODS_PER_PHASE = Array.from({ length: GAME_PHASE_COUNT }, (_, i) => 3 + i);

/** Velocidade (ms entre passos) — diminui a cada fase. */
const STEP_MS = [360, 330, 300, 280, 260, 240, 220, 200, 185, 170];

const DIRS = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

const SNAKE_LABEL = "SNAKE";

function drawLabelInCell(g, px, py, cell, text = SNAKE_LABEL) {
  const pad = 3;
  const box = cell - pad * 2;
  g.fillStyle = "#ffe14a";
  g.strokeStyle = "#2b2a4a";
  g.lineWidth = 2;
  g.fillRect(px + pad, py + pad, box, box);
  g.strokeRect(px + pad + 1, py + pad + 1, box - 2, box - 2);
  g.fillStyle = "#2b2a4a";
  let fontSize = Math.floor(cell * 0.38);
  g.textAlign = "center";
  g.textBaseline = "middle";
  for (; fontSize >= 7; fontSize -= 1) {
    g.font = `700 ${fontSize}px Fredoka, "Segoe UI Rounded", sans-serif`;
    if (g.measureText(text).width <= box - 4) break;
  }
  g.fillText(text, px + cell / 2, py + cell / 2 + 1);
}

function drawTrailDot(g, px, py, cell) {
  g.fillStyle = "#f0c400";
  g.strokeStyle = "#2b2a4a";
  g.lineWidth = 1.5;
  g.beginPath();
  g.arc(px + cell / 2, py + cell / 2, cell * 0.22, 0, Math.PI * 2);
  g.fill();
  g.stroke();
}

function spawnFood(snake, random) {
  const occupied = new Set(snake.map((s) => `${s.x},${s.y}`));
  for (let attempt = 0; attempt < 200; attempt += 1) {
    const x = Math.floor(random() * COLS);
    const y = Math.floor(random() * ROWS);
    if (!occupied.has(`${x},${y}`)) return { x, y };
  }
  return { x: 0, y: 0 };
}

function initialSnake() {
  const cx = Math.floor(COLS / 2);
  const cy = Math.floor(ROWS / 2);
  return [
    { x: cx, y: cy },
    { x: cx - 1, y: cy },
    { x: cx - 2, y: cy },
  ];
}

export const snake = {
  id: "snake",
  title: "Snake",
  goal: "10 fases — coma os quadrados e cresça",
  mount(ctx) {
    const totalPhases = phaseTotal(ctx);

    const runPhase = (phaseIndex) => {
      const foodsGoal = ctx.e2e && !ctx.e2eFull ? 1 : FOODS_PER_PHASE[phaseIndex];
      const stepMs = ctx.e2e && !ctx.e2eFull ? 800 : STEP_MS[phaseIndex];
      phaseNarrationTip(
        ctx,
        `Coma ${foodsGoal} quadradinho${foodsGoal > 1 ? "s" : ""} nesta fase. Use as setas ou os botões.`,
      );
      const signal = ctx.beginPhase();

      let snakeBody = initialSnake();
      let dir = "right";
      let pendingDir = dir;
      let food = spawnFood(snakeBody, ctx.random);
      let eaten = 0;
      let alive = true;
      let tickTimer = null;

      ctx.mountPhase(`
        ${phaseBanner(phaseIndex, totalPhases)}
        <section class="snake-board">
          <p class="catch-line" data-snake-score>0 de ${foodsGoal} comidos</p>
          <canvas class="snake-canvas" width="${COLS * 20}" height="${ROWS * 20}" aria-label="Tabuleiro do jogo Snake"></canvas>
          <div class="snake-controls" role="group" aria-label="Direção">
            <button type="button" class="snake-dir" data-dir="up" aria-label="Subir">▲</button>
            <div class="snake-controls-row">
              <button type="button" class="snake-dir" data-dir="left" aria-label="Esquerda">◀</button>
              <button type="button" class="snake-dir" data-dir="down" aria-label="Descer">▼</button>
              <button type="button" class="snake-dir" data-dir="right" aria-label="Direita">▶</button>
            </div>
          </div>
        </section>
      `);

      const canvas = ctx.view.querySelector(".snake-canvas");
      const scoreEl = ctx.view.querySelector("[data-snake-score]");
      const g = canvas.getContext("2d");
      const cell = canvas.width / COLS;

      const draw = () => {
        g.fillStyle = "#fff8e7";
        g.fillRect(0, 0, canvas.width, canvas.height);
        g.strokeStyle = "rgb(43 42 74 / 12%)";
        for (let x = 0; x <= COLS; x += 1) {
          g.beginPath();
          g.moveTo(x * cell, 0);
          g.lineTo(x * cell, canvas.height);
          g.stroke();
        }
        for (let y = 0; y <= ROWS; y += 1) {
          g.beginPath();
          g.moveTo(0, y * cell);
          g.lineTo(canvas.width, y * cell);
          g.stroke();
        }
        g.fillStyle = "#ff5d73";
        g.fillRect(food.x * cell + 2, food.y * cell + 2, cell - 4, cell - 4);
        snakeBody.forEach((seg, index) => {
          const px = seg.x * cell;
          const py = seg.y * cell;
          if (index === 0) {
            drawLabelInCell(g, px, py, cell);
          } else {
            drawTrailDot(g, px, py, cell);
          }
        });
      };

      const resetRun = () => {
        snakeBody = initialSnake();
        dir = "right";
        pendingDir = dir;
        food = spawnFood(snakeBody, ctx.random);
        alive = true;
        ctx.feedback("Bateu! Tente de novo nesta fase.", "no");
        draw();
      };

      const setDir = (next) => {
        const opposite =
          (dir === "up" && next === "down") ||
          (dir === "down" && next === "up") ||
          (dir === "left" && next === "right") ||
          (dir === "right" && next === "left");
        if (opposite) return;
        pendingDir = next;
      };

      ctx.view.querySelectorAll("[data-dir]").forEach((btn) => {
        bindPress(btn, () => setDir(btn.dataset.dir), signal);
      });

      const onKey = (event) => {
        const map = { ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right" };
        const next = map[event.key];
        if (next) {
          event.preventDefault();
          setDir(next);
        }
      };
      window.addEventListener("keydown", onKey, { signal });
      ctx.phaseOwn(() => window.removeEventListener("keydown", onKey));

      const step = () => {
        if (!ctx.alive || ctx.won || !alive) return;
        dir = pendingDir;
        const head = snakeBody[0];
        const delta = DIRS[dir];
        const next = { x: head.x + delta.x, y: head.y + delta.y };
        if (next.x < 0 || next.y < 0 || next.x >= COLS || next.y >= ROWS) {
          alive = false;
          ctx.stats?.reset();
          ctx.updateStreak?.();
          resetRun();
          return;
        }
        if (snakeBody.some((s) => s.x === next.x && s.y === next.y)) {
          alive = false;
          ctx.stats?.reset();
          ctx.updateStreak?.();
          resetRun();
          return;
        }
        snakeBody.unshift(next);
        if (next.x === food.x && next.y === food.y) {
          eaten += 1;
          ctx.markSuccess(canvas);
          ctx.stats?.recordHit();
          ctx.updateStreak?.();
          if (scoreEl) scoreEl.textContent = `${eaten} de ${foodsGoal} comidos`;
          ctx.feedback(eaten >= foodsGoal ? "Fase completa!" : "Comeu!", "ok");
          if (eaten >= foodsGoal) {
            alive = false;
            if (tickTimer) clearInterval(tickTimer);
            ctx.later(
              () => completePhase(ctx, phaseIndex, totalPhases, runPhase, "Snake completou todas as fases!"),
              ctx.e2e ? 40 : 600,
            );
            return;
          }
          food = spawnFood(snakeBody, ctx.random);
        } else {
          snakeBody.pop();
        }
        draw();
      };

      draw();

      if (ctx.e2e) {
        ctx.later(() => {
          food = { x: snakeBody[0].x + 1, y: snakeBody[0].y };
          step();
        }, 100);
        return;
      }

      tickTimer = setInterval(() => step(), stepMs);
      ctx.phaseOwn(() => {
        if (tickTimer) clearInterval(tickTimer);
      });
    };

    runPhase(0);
  },
};
