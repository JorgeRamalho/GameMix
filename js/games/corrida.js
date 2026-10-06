import { art } from "../art.js";
import { bindLaneSteer, playSfx } from "../engine.js";
import { createSpaceFxCanvas } from "../lib/arcade/spaceFxCanvas.js";
import {
  boostSpeedOnStar,
  brakeSpeedOnObstacle,
  createRaceSim,
  displaySpeedKmh,
  stepRaceSim,
  tryMoveRaceLane,
} from "../lib/arcade/raceSimulation.js";
import { streakLabel } from "../lib/gameExperience.js";
import { completePhase, GAME_PHASE_COUNT, phaseBanner, phaseTotal } from "../lib/phases.js";

const PHASES = Array.from({ length: GAME_PHASE_COUNT }, (_, phaseIndex) => ({
  goal: 5 + phaseIndex * 2,
  speed: 1.05 + phaseIndex * 0.12,
  spawnMs: Math.max(820, 2050 - phaseIndex * 118),
  obstacleRate: Math.min(0.2 + phaseIndex * 0.036, 0.54),
  /** Metade dos obstáculos na pista é fogo, metade cone (desde a fase 1). */
  fireShare: 0.5,
}));

const E2E_SPEC = { goal: 3, speed: 1.4, spawnMs: 450, obstacleRate: 0 };

const SWIPE_MIN_PX = 34;
const SWIPE_MAX_VERTICAL_RATIO = 1.35;

function formatLives(n) {
  if (n <= 5) return "❤️".repeat(Math.max(0, n));
  return `❤️ × ${n}`;
}

function lanePos(lane) {
  return `calc((${lane} * 2 + 1) * 100% / 6)`;
}

function formatSpeedDigits(kmh) {
  return String(kmh).padStart(3, "0");
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
      const sim = createRaceSim(spec, { e2e: ctx.e2e, random: ctx.random });
      const entityEls = new Map();
      let lastTick = 0;
      let clockReady = false;
      let fx = null;
      let laneHints = [];

      ctx.mountPhase(`
        ${phaseBanner(phaseIndex, totalPhases)}
        <div class="race-hud space-hud corrida-hud">
          <p class="race-stat"><span aria-hidden="true">⭐</span> <strong data-score>0</strong> / ${spec.goal}</p>
          <p class="race-stat" data-lives aria-label="Vidas">${formatLives(sim.lives)}</p>
          <div class="corrida-speed-panel" role="status" aria-live="polite" data-speed-panel>
            <span class="corrida-speed-panel__label">VELO</span>
            <span class="corrida-speed-panel__digits" data-speed>${formatSpeedDigits(displaySpeedKmh(sim))}</span>
            <span class="corrida-speed-panel__unit">km/h</span>
          </div>
        </div>
        <div class="corrida-arena race-track race-road" data-track tabindex="0" aria-label="Pista de corrida" style="--corrida-dash-duration:${(0.92 / spec.speed).toFixed(2)}s">
          <div class="corrida-curbs" aria-hidden="true"></div>
          <div class="corrida-lane-stripes" aria-hidden="true"></div>
          <div class="race-lanes corrida-lanes" aria-hidden="true">
            <span data-lane-hint="0"></span><span data-lane-hint="1"></span><span data-lane-hint="2"></span>
          </div>
          <canvas class="corrida-fx" data-fx aria-hidden="true"></canvas>
          <div class="corrida-entities" data-entities></div>
          <div class="space-touch" aria-hidden="true">
            <button type="button" class="space-touch-btn" data-steer="left" tabindex="-1" aria-hidden="true"></button>
            <button type="button" class="space-touch-btn" data-steer="right" tabindex="-1" aria-hidden="true"></button>
          </div>
          <div class="race-car space-ship corrida-car" data-car data-lane="1" style="--lane:1">${art.car}</div>
        </div>
        <div class="space-controls space-controls--corrida" role="group" aria-label="Mudar de pista">
          <button type="button" class="btn race-steer space-steer" data-steer="left" aria-label="Esquerda">◀</button>
          <button type="button" class="btn race-steer space-steer" data-steer="right" aria-label="Direita">▶</button>
        </div>
        <p class="hint">Toque ◀ ▶, deslize na pista ou use as setas do teclado. Pegue estrelas e desvie dos cones e do fogo!</p>
      `);

      const track = ctx.view.querySelector("[data-track]");
      const layer = ctx.view.querySelector("[data-entities]");
      const car = ctx.view.querySelector("[data-car]");
      const scoreEl = ctx.view.querySelector("[data-score]");
      const livesEl = ctx.view.querySelector("[data-lives]");
      const speedEl = ctx.view.querySelector("[data-speed]");
      const speedPanel = ctx.view.querySelector("[data-speed-panel]");
      const fxCanvas = ctx.view.querySelector("[data-fx]");
      laneHints = [...ctx.view.querySelectorAll("[data-lane-hint]")];

      fx = createSpaceFxCanvas(fxCanvas);
      const onResize = () => fx.resize();
      window.addEventListener("resize", onResize, { signal });
      ctx.phaseOwn(() => window.removeEventListener("resize", onResize));

      const syncCar = () => {
        car.style.setProperty("--lane", String(sim.lane));
        car.style.left = lanePos(sim.lane);
        car.dataset.lane = String(sim.lane);
        laneHints.forEach((hint, index) => {
          hint.classList.toggle("is-active", index === sim.lane);
        });
      };

      const pulseSpeedPanel = (direction) => {
        if (!speedPanel) return;
        speedPanel.classList.remove("is-speed-up", "is-speed-down");
        speedPanel.classList.add(direction === "up" ? "is-speed-up" : "is-speed-down");
        ctx.later(() => {
          speedPanel.classList.remove("is-speed-up", "is-speed-down");
        }, 420);
      };

      const syncHud = () => {
        scoreEl.textContent = String(sim.score);
        livesEl.textContent = formatLives(sim.lives);
        livesEl.setAttribute("aria-label", `${sim.lives} vidas`);
        const kmh = displaySpeedKmh(sim);
        if (speedEl) speedEl.textContent = formatSpeedDigits(kmh);
        if (speedPanel) {
          speedPanel.setAttribute("aria-label", `Velocidade ${kmh} quilômetros por hora`);
          speedPanel.classList.toggle("is-boost", sim.speedMul > 1.08);
          speedPanel.classList.toggle("is-slow", sim.speedMul < 0.92);
        }
        const dashDuration = 0.92 / (spec.speed * sim.speedMul);
        track.style.setProperty("--corrida-dash-duration", `${dashDuration.toFixed(2)}s`);
        track.classList.toggle("is-rush", sim.speedMul > 1.12);
      };

      const flashArena = (className, ms = 180) => {
        track.classList.add(className);
        ctx.later(() => track.classList.remove(className), ms);
      };

      const obstacleMarkup = {
        cone: art.cone,
        fire: art.fire,
      };

      const mountEntity = (entity) => {
        const el = document.createElement("div");
        const kind = entity.kind ?? (entity.star ? "star" : "cone");
        const isObstacle = kind === "cone" || kind === "fire";
        el.className = [
          "race-entity",
          kind === "star" ? "is-star" : "is-obstacle",
          kind === "cone" ? "is-cone" : "",
          kind === "fire" ? "is-fire" : "",
        ]
          .filter(Boolean)
          .join(" ");
        el.style.left = lanePos(entity.lane);
        el.style.setProperty("--y", `${entity.y}%`);
        if (kind === "star") {
          el.innerHTML = art.star;
          el.dataset.raceStar = "1";
        } else if (isObstacle) {
          el.innerHTML = obstacleMarkup[kind] ?? art.cone;
          el.dataset.raceObstacle = kind;
        }
        layer.appendChild(el);
        entityEls.set(entity.id, el);
      };

      const removeEntityEl = (id) => {
        const el = entityEls.get(id);
        if (el) el.remove();
        entityEls.delete(id);
      };

      const pulseSteer = (side) => {
        const btn = ctx.view.querySelector(`[data-steer="${side}"]`);
        if (!btn) return;
        btn.classList.add("is-steer-active");
        ctx.later(() => btn.classList.remove("is-steer-active"), 120);
      };

      const moveLane = (delta, sideHint) => {
        if (ctx.won) return;
        if (tryMoveRaceLane(sim, delta)) {
          syncCar();
          ctx.haptic("light");
          if (sideHint) pulseSteer(sideHint);
        }
      };

      for (const button of ctx.view.querySelectorAll("[data-steer]")) {
        const role = button.dataset.steer;
        if (role === "left") bindLaneSteer(button, () => moveLane(-1, "left"), signal);
        else if (role === "right") bindLaneSteer(button, () => moveLane(1, "right"), signal);
      }

      const onKeyDown = (event) => {
        if (ctx.won || !ctx.alive) return;
        if (event.key === "ArrowLeft") {
          event.preventDefault();
          moveLane(-1, "left");
        } else if (event.key === "ArrowRight") {
          event.preventDefault();
          moveLane(1, "right");
        }
      };
      track.addEventListener("keydown", onKeyDown, { signal });
      window.addEventListener("keydown", onKeyDown, { signal });

      let swipeStartX = 0;
      let swipeStartY = 0;
      let swipePointerId = null;

      track.addEventListener(
        "pointerdown",
        (event) => {
          if (event.button !== 0) return;
          if (event.target.closest("[data-steer]")) return;
          swipePointerId = event.pointerId;
          swipeStartX = event.clientX;
          swipeStartY = event.clientY;
          try {
            track.setPointerCapture(event.pointerId);
          } catch {
            /* opcional */
          }
        },
        { signal, passive: true },
      );

      track.addEventListener(
        "pointerup",
        (event) => {
          if (event.pointerId !== swipePointerId) return;
          swipePointerId = null;
          const dx = event.clientX - swipeStartX;
          const dy = event.clientY - swipeStartY;
          const absX = Math.abs(dx);
          const absY = Math.abs(dy);
          if (absX < SWIPE_MIN_PX) return;
          if (absY > absX * SWIPE_MAX_VERTICAL_RATIO) return;
          if (dx < 0) moveLane(-1, "left");
          else moveLane(1, "right");
        },
        { signal, passive: true },
      );

      track.addEventListener(
        "pointercancel",
        () => {
          swipePointerId = null;
        },
        { signal },
      );

      const loseLife = (obstacleKind = "cone") => {
        if (sim.invuln > 0 || ctx.won) return;
        brakeSpeedOnObstacle(sim, obstacleKind);
        pulseSpeedPanel("down");
        sim.lives -= 1;
        sim.invuln = ctx.e2e ? 200 : 850;
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
        if (sim.lives <= 0) {
          sim.lives = 3;
          sim.score = Math.max(0, sim.score - 2);
          for (const id of [...entityEls.keys()]) removeEntityEl(id);
          sim.entities = [];
          ctx.feedback("Ops! Vamos tentar de novo nesta fase.", "no");
        } else {
          ctx.feedback(
            obstacleKind === "fire" ? "Cuidado com o fogo!" : "Cuidado com o cone!",
            "no",
          );
        }
        syncHud();
      };

      const collectStar = (entity) => {
        if (ctx.won) return;
        boostSpeedOnStar(sim);
        pulseSpeedPanel("up");
        sim.score += 1;
        const streak = ctx.stats.recordHit();
        ctx.updateStreak();
        playSfx("ok");
        flashArena("is-flash-ok");
        const rect = track.getBoundingClientRect();
        const x = ((entity.lane * 2 + 1) / 6) * rect.width;
        const y = (entity.y / 100) * rect.height;
        fx.burst(x, y, "#ffe14a", 12);
        const msg =
          sim.score >= spec.goal
            ? "Meta da fase!"
            : streak >= 3
              ? `Estrela! ${streakLabel(streak)}`
              : "Estrela!";
        ctx.feedback(msg, "ok");
        syncHud();
        if (sim.score >= spec.goal) {
          completePhase(ctx, phaseIndex, totalPhases, runPhase, "Você pilotou em todas as pistas!");
        }
      };

      const handleEvents = (events) => {
        for (const event of events) {
          switch (event.type) {
            case "entity_spawn":
              mountEntity(event.entity);
              break;
            case "entity_removed":
              removeEntityEl(event.id);
              break;
            case "star_hit":
              collectStar(event.entity);
              break;
            case "obstacle_hit":
              loseLife(event.entity?.kind === "fire" ? "fire" : "cone");
              break;
            default:
              break;
          }
        }
      };

      ctx.onTick((time) => {
        if (!ctx.alive || ctx.won) return;
        if (!clockReady) {
          sim.lastSpawn = time - spec.spawnMs * 0.82;
          lastTick = time;
          clockReady = true;
        }
        const dtMs = lastTick ? Math.min(32, time - lastTick) : 16;
        lastTick = time;

        handleEvents(stepRaceSim(sim, time, dtMs));

        for (const entity of sim.entities) {
          const el = entityEls.get(entity.id);
          if (!el) continue;
          el.style.setProperty("--y", `${entity.y}%`);
        }

        fx.engineTrail(sim.lane, time);
        fx.render(dtMs);
        syncHud();
      });

      syncHud();
      syncCar();
    };

    runPhase(0);
  },
};
