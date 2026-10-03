import { art } from "../art.js";
import { bindInstantPress, playSfx } from "../engine.js";
import { createSpaceFxCanvas } from "../lib/arcade/spaceFxCanvas.js";
import { streakLabel } from "../lib/gameExperience.js";
import { completePhase, phaseBanner, phaseTotal } from "../lib/phases.js";

const PHASES = [
  { goal: 5, speed: 1.1, spawnMs: 2000, obstacleRate: 0.2 },
  { goal: 8, speed: 1.6, spawnMs: 1650, obstacleRate: 0.32 },
  { goal: 11, speed: 2.1, spawnMs: 1350, obstacleRate: 0.4 },
];

const E2E_SPEC = { goal: 3, speed: 1.4, spawnMs: 450, obstacleRate: 0 };

function formatLives(n) {
  if (n <= 5) return "❤️".repeat(Math.max(0, n));
  return `❤️ × ${n}`;
}

export const corrida = {
  id: "corrida",
  title: "Corrida",
  goal: "Desviar e pegar estrelas nas pistas",
  mount(ctx) {
    const totalPhases = phaseTotal(ctx);
    const specs = ctx.e2e && !ctx.e2eFull ? [E2E_SPEC] : PHASES.slice(0, totalPhases);

    const runPhase = (phaseIndex) => {
      const signal = ctx.beginPhase();
      const spec = specs[phaseIndex];
      let lane = 1;
      let lives = 3;
      let score = 0;
      let lastSpawn = 0;
      let invuln = 0;
      const entities = [];
      let lastTick = 0;
      let fx = null;
      let laneHints = [];

      ctx.mountPhase(`
        ${phaseBanner(phaseIndex, totalPhases)}
        <div class="race-hud space-hud">
          <p class="race-stat"><span aria-hidden="true">⭐</span> <strong data-score>0</strong> / ${spec.goal}</p>
          <p class="race-stat" data-lives aria-label="Vidas">${formatLives(lives)}</p>
        </div>
        <div class="space-arena race-track race-road" data-track>
          <div class="space-nebula space-nebula--road" aria-hidden="true"></div>
          <div class="space-parallax space-parallax--far" aria-hidden="true"></div>
          <div class="space-parallax space-parallax--mid" aria-hidden="true"></div>
          <div class="space-lanes-glow" aria-hidden="true"><span data-lane-hint="0"></span><span data-lane-hint="1"></span><span data-lane-hint="2"></span></div>
          <canvas class="space-fx" data-fx aria-hidden="true"></canvas>
          <div class="space-layer" data-entities></div>
          <div class="space-touch" aria-hidden="true">
            <button type="button" class="space-touch-btn" data-steer="left" tabindex="-1"></button>
            <button type="button" class="space-touch-btn" data-steer="right" tabindex="-1"></button>
          </div>
          <div class="race-car space-ship corrida-car" data-car data-lane="1" style="--lane:1">${art.car}</div>
        </div>
        <div class="space-controls space-controls--corrida" role="group" aria-label="Mudar de pista">
          <button type="button" class="btn race-steer space-steer" data-steer="left" aria-label="Esquerda">◀</button>
          <button type="button" class="btn race-steer space-steer" data-steer="right" aria-label="Direita">▶</button>
        </div>
        <p class="hint">Toque ◀ ▶ ou nas laterais da pista. Pegue estrelas e desvie dos cones!</p>
      `);

      const track = ctx.view.querySelector("[data-track]");
      const layer = ctx.view.querySelector("[data-entities]");
      const car = ctx.view.querySelector("[data-car]");
      const scoreEl = ctx.view.querySelector("[data-score]");
      const livesEl = ctx.view.querySelector("[data-lives]");
      const fxCanvas = ctx.view.querySelector("[data-fx]");
      laneHints = [...ctx.view.querySelectorAll("[data-lane-hint]")];

      fx = createSpaceFxCanvas(fxCanvas);
      const onResize = () => fx.resize();
      window.addEventListener("resize", onResize, { signal });
      ctx.phaseOwn(() => window.removeEventListener("resize", onResize));

      const lanePos = (l) => `calc((${l} * 2 + 1) * 100% / 6)`;

      const syncCar = () => {
        car.style.setProperty("--lane", String(lane));
        car.style.left = lanePos(lane);
        car.dataset.lane = String(lane);
        laneHints.forEach((hint, index) => {
          hint.classList.toggle("is-active", index === lane);
        });
      };

      const syncHud = () => {
        scoreEl.textContent = String(score);
        livesEl.textContent = formatLives(lives);
        livesEl.setAttribute("aria-label", `${lives} vidas`);
        track.classList.toggle("is-rush", ctx.stats.streak >= 2);
      };

      const moveLane = (delta) => {
        const before = lane;
        lane = Math.max(0, Math.min(2, before + delta));
        if (lane !== before) {
          syncCar();
          ctx.haptic("light");
        }
      };

      for (const button of ctx.view.querySelectorAll("[data-steer]")) {
        const role = button.dataset.steer;
        if (role === "left") bindInstantPress(button, () => moveLane(-1), signal);
        else if (role === "right") bindInstantPress(button, () => moveLane(1), signal);
      }

      const removeEntity = (entity) => {
        entity.el.remove();
        const index = entities.indexOf(entity);
        if (index >= 0) entities.splice(index, 1);
      };

      const flashArena = (className, ms = 180) => {
        track.classList.add(className);
        ctx.later(() => track.classList.remove(className), ms);
      };

      const loseLife = () => {
        if (invuln > 0 || ctx.won) return;
        lives -= 1;
        invuln = ctx.e2e ? 200 : 900;
        ctx.stats.reset();
        ctx.updateStreak();
        car.classList.add("is-hit");
        track.classList.add("is-shake", "is-flash-hit");
        playSfx("no");
        ctx.later(() => {
          car.classList.remove("is-hit");
          track.classList.remove("is-shake", "is-flash-hit");
        }, 400);
        syncHud();
        if (lives <= 0) {
          lives = 3;
          score = Math.max(0, score - 2);
          entities.forEach(removeEntity);
          ctx.feedback("Ops! Vamos tentar de novo nesta fase.", "no");
        } else {
          ctx.feedback("Cuidado com o cone!", "no");
        }
        syncHud();
      };

      const collectStar = () => {
        if (ctx.won) return;
        score += 1;
        const streak = ctx.stats.recordHit();
        ctx.updateStreak();
        playSfx("ok");
        flashArena("is-flash-ok");
        const msg =
          score >= spec.goal
            ? "Meta da fase!"
            : streak >= 3
              ? `Estrela! ${streakLabel(streak)}`
              : "Estrela!";
        ctx.feedback(msg, "ok");
        syncHud();
        if (score >= spec.goal) {
          completePhase(ctx, phaseIndex, totalPhases, runPhase, "Você pilotou em todas as pistas!");
        }
      };

      const spawn = () => {
        const entityLane = ctx.e2e ? lane : Math.floor(ctx.random() * 3);
        const star = ctx.e2e || ctx.random() > spec.obstacleRate;
        const el = document.createElement("div");
        el.className = `race-entity ${star ? "is-star" : "is-obstacle"}`;
        el.style.left = lanePos(entityLane);
        el.style.setProperty("--y", "-12%");
        el.innerHTML = star ? art.star : art.cone;
        if (star) el.dataset.raceStar = "1";
        layer.appendChild(el);
        entities.push({ lane: entityLane, y: -12, star, el });
      };

      ctx.onTick((time) => {
        if (!ctx.alive || ctx.won) return;
        const dtMs = lastTick ? Math.min(32, time - lastTick) : 16;
        lastTick = time;
        if (invuln > 0) invuln -= dtMs;

        const dt = spec.speed * (ctx.e2e ? 1.2 : 1);

        if (time - lastSpawn > spec.spawnMs) {
          lastSpawn = time;
          spawn();
        }

        for (const entity of [...entities]) {
          entity.y += dt * 0.12;
          entity.el.style.setProperty("--y", `${entity.y}%`);

          if (entity.y > 88) {
            removeEntity(entity);
            continue;
          }

          if (entity.y < 68 || entity.y > 86) continue;
          if (entity.lane !== lane) continue;

          if (entity.star) {
            const rect = track.getBoundingClientRect();
            const x = ((entity.lane * 2 + 1) / 6) * rect.width;
            const y = (entity.y / 100) * rect.height;
            fx.burst(x, y, "#ffe14a", 12);
            collectStar();
            removeEntity(entity);
          } else if (invuln <= 0) {
            loseLife();
            removeEntity(entity);
          }
        }

        fx.engineTrail(lane, time);
        fx.render(dtMs);
        syncHud();
      });

      if (!ctx.e2e) {
        lastSpawn = performance.now() - spec.spawnMs * 0.5;
      }

      syncHud();
      syncCar();
    };

    runPhase(0);
  },
};
