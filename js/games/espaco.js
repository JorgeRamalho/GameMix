import { art } from "../art.js";
import { bindInstantPress, playSfx } from "../engine.js";
import {
  buildSpacePhaseSpec,
  SPACE_PHASE_COUNT,
  SPACE_START_LIVES,
  spacePhaseBanner,
} from "../lib/arcade/spacePhases.js";
import { createSpaceFxCanvas } from "../lib/arcade/spaceFxCanvas.js";
import {
  createSpaceSim,
  renewPhaseShield,
  setSimLane,
  SHIELD_USES_PER_PHASE,
  stepSpaceSim,
  tryActivateShield,
  tryFire,
} from "../lib/arcade/spaceSimulation.js";
import { streakLabel } from "../lib/gameExperience.js";
import { completePhase, phaseNarrationTip, phaseTotal } from "../lib/phases.js";

const E2E_SPEC = { goal: 2, speed: 1.35, spawnMs: 480, difficulty: 1, phaseIndex: 0 };

const METEOR_BURST_COLORS = {
  boulder: "#adb5bd",
  ice: "#74c0fc",
  rock: "#ffe14a",
  planet: "#cc5de8",
  comet: "#ff6b6b",
  debris: "#ffa94d",
  streak: "#ff8787",
};

function formatLives(n) {
  if (n <= 5) return "❤️".repeat(Math.max(0, n));
  return `❤️ × ${n}`;
}

export const espaco = {
  id: "espaco",
  title: "Guerra espacial",
  goal: "7 fases, 10 vidas — atire, desvie e use o escudo",
  mount(ctx) {
    const totalPhases = phaseTotal(ctx, SPACE_PHASE_COUNT);
    let campaignLives = SPACE_START_LIVES;

    const runPhase = (phaseIndex) => {
      const signal = ctx.beginPhase();
      const spec =
        ctx.e2e && !ctx.e2eFull ? E2E_SPEC : buildSpacePhaseSpec(phaseIndex);
      const sim = createSpaceSim(spec, {
        e2e: ctx.e2e,
        random: ctx.random,
        phaseIndex,
        lives: campaignLives,
      });
      sim.lastSpawn = 0;

      const meteorEls = new Map();
      const bulletEls = new Map();
      const pickupEls = new Map();
      let lastTick = 0;
      let fx = null;
      let laneHints = [];

      ctx.mountPhase(`
        ${spacePhaseBanner(phaseIndex, totalPhases)}
        <div class="race-hud space-hud">
          <p class="race-stat"><span aria-hidden="true">💥</span> <strong data-score>0</strong> / ${spec.goal}</p>
          <p class="race-stat" data-lives aria-label="Vidas">${formatLives(sim.lives)}</p>
          <p class="race-stat space-shield-badge" data-shield-state aria-live="polite">🛡️ —</p>
        </div>
        <div class="space-arena race-track" data-track>
          <div class="space-nebula" aria-hidden="true"></div>
          <div class="space-parallax space-parallax--far" aria-hidden="true"></div>
          <div class="space-parallax space-parallax--mid" aria-hidden="true"></div>
          <div class="space-lanes-glow" aria-hidden="true"><span data-lane-hint="0"></span><span data-lane-hint="1"></span><span data-lane-hint="2"></span></div>
          <canvas class="space-fx" data-fx aria-hidden="true"></canvas>
          <div class="space-layer" data-entities></div>
          <div class="space-touch" aria-hidden="true">
            <button type="button" class="space-touch-btn" data-steer="left" tabindex="-1"></button>
            <button type="button" class="space-touch-btn" data-steer="right" tabindex="-1"></button>
          </div>
          <div class="race-car space-ship" data-ship data-lane="1" style="--lane:1">${art.rocket}</div>
        </div>
        <div class="space-controls">
          <button type="button" class="btn race-steer space-steer" data-steer="left" aria-label="Esquerda">◀</button>
          <button type="button" class="btn space-fire" data-steer="fire" aria-label="Atirar">🔫 Atirar</button>
          <button type="button" class="btn race-steer space-steer" data-steer="right" aria-label="Direita">▶</button>
          <button type="button" class="btn space-shield-btn" data-steer="shield" aria-label="Ativar escudo">🛡️ Escudo (${SHIELD_USES_PER_PHASE}×)</button>
        </div>
        <p class="hint">Escudo: 5 segundos, 5 usos por fase (renova ao passar de fase ou se perder todas as vidas).</p>
      `);

      phaseNarrationTip(
        ctx,
        `Fase ${phaseIndex + 1}. Use o escudo quando vier um meteoro na sua pista!`,
      );

      const track = ctx.view.querySelector("[data-track]");
      const layer = ctx.view.querySelector("[data-entities]");
      const ship = ctx.view.querySelector("[data-ship]");
      const scoreEl = ctx.view.querySelector("[data-score]");
      const livesEl = ctx.view.querySelector("[data-lives]");
      const shieldStateEl = ctx.view.querySelector("[data-shield-state]");
      const fireBtn = ctx.view.querySelector('[data-steer="fire"]');
      const shieldBtn = ctx.view.querySelector('[data-steer="shield"]');
      const fxCanvas = ctx.view.querySelector("[data-fx]");
      laneHints = [...ctx.view.querySelectorAll("[data-lane-hint]")];

      fx = createSpaceFxCanvas(fxCanvas);
      const onResize = () => fx.resize();
      window.addEventListener("resize", onResize, { signal });
      ctx.phaseOwn(() => window.removeEventListener("resize", onResize));

      const lanePos = (lane) => `calc((${lane} * 2 + 1) * 100% / 6)`;

      const syncShieldHud = () => {
        const shieldOn = sim.shield > 0;
        const charges = sim.shieldCharges;
        ship.classList.toggle("has-shield", shieldOn);
        shieldBtn.classList.toggle("is-active", shieldOn);
        shieldBtn.classList.toggle("is-cooldown", charges <= 0 && !shieldOn);
        shieldBtn.disabled = shieldOn || charges <= 0;
        shieldBtn.textContent = `🛡️ ${charges}/${SHIELD_USES_PER_PHASE}`;

        if (shieldOn) {
          const sec = Math.ceil(sim.shield / 1000);
          shieldStateEl.textContent = `🛡️ ${sec}s · ${charges} restantes`;
          shieldStateEl.classList.add("is-on");
        } else if (charges <= 0) {
          shieldStateEl.textContent = "🛡️ Sem usos";
          shieldStateEl.classList.remove("is-on");
        } else {
          shieldStateEl.textContent = `🛡️ ${charges}/${SHIELD_USES_PER_PHASE} usos`;
          shieldStateEl.classList.remove("is-on");
        }
      };

      const syncHud = () => {
        scoreEl.textContent = String(sim.destroyed);
        livesEl.textContent = formatLives(sim.lives);
        livesEl.setAttribute("aria-label", `${sim.lives} vidas`);
        campaignLives = sim.lives;
        fireBtn.classList.toggle("is-cooldown", sim.fireCooldown > 0);
        track.classList.toggle("is-rush", ctx.stats.streak >= 2);
        syncShieldHud();
      };

      const syncShip = () => {
        ship.style.setProperty("--lane", String(sim.lane));
        ship.style.left = lanePos(sim.lane);
        ship.dataset.lane = String(sim.lane);
        laneHints.forEach((hint, index) => {
          hint.classList.toggle("is-active", index === sim.lane);
        });
      };

      const mountMeteor = (meteor) => {
        const el = document.createElement("div");
        el.className = `race-entity space-meteor space-meteor--${meteor.kind}`;
        el.dataset.meteorId = String(meteor.id);
        el.style.left = lanePos(meteor.lane);
        el.style.setProperty("--y", `${meteor.y}%`);
        el.setAttribute("aria-hidden", "true");
        el.innerHTML = art.meteor;
        layer.appendChild(el);
        meteorEls.set(meteor.id, el);
      };

      const mountBullet = (bullet) => {
        const el = document.createElement("div");
        el.className = "space-bullet";
        el.dataset.bulletId = String(bullet.id);
        el.style.left = lanePos(bullet.lane);
        el.style.setProperty("--y", `${bullet.y}%`);
        el.setAttribute("aria-hidden", "true");
        layer.appendChild(el);
        bulletEls.set(bullet.id, el);
      };

      const mountPickup = (pickup) => {
        const el = document.createElement("div");
        el.className = "space-pickup";
        el.dataset.pickupId = String(pickup.id);
        el.style.left = lanePos(pickup.lane);
        el.style.setProperty("--y", `${pickup.y}%`);
        el.textContent = "🛡️";
        el.setAttribute("aria-label", "Escudo espacial");
        layer.appendChild(el);
        pickupEls.set(pickup.id, el);
      };

      const removeMeteorEl = (id) => {
        meteorEls.get(id)?.remove();
        meteorEls.delete(id);
      };

      const removeBulletEl = (id) => {
        bulletEls.get(id)?.remove();
        bulletEls.delete(id);
      };

      const removePickupEl = (id) => {
        pickupEls.get(id)?.remove();
        pickupEls.delete(id);
      };

      const fxAtLane = (lane, yPercent) => {
        const rect = track.getBoundingClientRect();
        const x = ((lane * 2 + 1) / 6) * rect.width;
        const y = (yPercent / 100) * rect.height;
        return { x, y };
      };

      const flashArena = (className, ms = 180) => {
        track.classList.add(className);
        ctx.later(() => track.classList.remove(className), ms);
      };

      const onDestroy = () => {
        if (ctx.won) return;
        const streak = ctx.stats.recordHit();
        ctx.updateStreak();
        playSfx("boom");
        flashArena("is-flash-ok");
        const msg =
          sim.destroyed >= sim.goal
            ? "Fase limpa! Uau!"
            : streak >= 2
              ? `Boom! ${streakLabel(streak)}`
              : "Boom! Meteoro fora!";
        ctx.feedback(msg, "ok");
        if (sim.destroyed >= sim.goal) {
          completePhase(
            ctx,
            phaseIndex,
            totalPhases,
            runPhase,
            "Você venceu as 7 fases e salvou a galáxia!",
          );
        }
        syncHud();
      };

      const loseLife = () => {
        if (sim.invuln > 0 || ctx.won) return;
        sim.lives -= 1;
        sim.invuln = ctx.e2e ? 200 : 850;
        sim.shake = 14;
        ctx.stats.reset();
        ctx.updateStreak();
        ship.classList.add("is-hit");
        track.classList.add("is-shake", "is-flash-hit");
        playSfx("no");
        ctx.later(() => {
          ship.classList.remove("is-hit");
          track.classList.remove("is-shake", "is-flash-hit");
        }, 400);
        if (sim.lives <= 0) {
          sim.lives = SPACE_START_LIVES;
          sim.destroyed = Math.max(0, sim.destroyed - 2);
          renewPhaseShield(sim);
          for (const m of sim.meteors) removeMeteorEl(m.id);
          sim.meteors.length = 0;
          for (const b of sim.bullets) removeBulletEl(b.id);
          sim.bullets.length = 0;
          ctx.feedback("Sem vidas! 10 corações e 5 escudos de novo nesta fase.", "no");
        } else {
          ctx.feedback("Desvie! Rápido!", "no");
        }
        syncHud();
        syncShip();
      };

      const handleEvents = (events) => {
        for (const event of events) {
          switch (event.type) {
            case "meteor_spawn":
              mountMeteor(event.meteor);
              break;
            case "bullet_spawn":
              mountBullet(event.bullet);
              break;
            case "bullet_fired":
              fx.muzzle(sim.lane);
              playSfx("laser");
              ship.classList.add("is-thrust");
              ctx.later(() => ship.classList.remove("is-thrust"), 100);
              break;
            case "bullet_removed":
              removeBulletEl(event.id);
              break;
            case "meteor_hit": {
              const el = meteorEls.get(event.meteor.id);
              el?.classList.add("is-hit");
              ctx.later(() => el?.classList.remove("is-hit"), 200);
              break;
            }
            case "meteor_destroyed": {
              removeMeteorEl(event.id);
              const pos = fxAtLane(event.lane, event.y);
              const big = event.kind === "planet" || event.kind === "boulder";
              fx.burst(pos.x, pos.y, METEOR_BURST_COLORS[event.kind] ?? "#ffe14a", big ? 26 : 18);
              onDestroy();
              break;
            }
            case "meteor_escaped":
              removeMeteorEl(event.id);
              break;
            case "player_hit":
              loseLife();
              break;
            case "shield_break":
              ctx.feedback("Escudo aguentou o impacto!", "ok");
              syncHud();
              break;
            case "shield_charge_gain":
              ctx.feedback(`Escudo extra! Agora ${event.charges} usos.`, "ok");
              syncHud();
              break;
            case "shield_activated":
              playSfx("ok");
              ctx.feedback(
                `Escudo por 5 segundos! Restam ${event.chargesLeft} usos nesta fase.`,
                "ok",
              );
              syncHud();
              break;
            case "shield_denied":
              if (event.reason === "empty") {
                ctx.feedback("Você já usou os 5 escudos desta fase!", "no");
              } else if (event.reason === "active") {
                ctx.feedback("O escudo já está ligado!", "no");
              }
              break;
            case "pickup_spawn":
              mountPickup(event.pickup);
              break;
            case "pickup_removed":
              removePickupEl(event.id);
              break;
            default:
              break;
          }
        }
      };

      const moveLane = (delta) => {
        const before = sim.lane;
        setSimLane(sim, before + delta);
        if (sim.lane !== before) {
          syncShip();
          ctx.haptic("light");
        }
      };

      const doFire = () => {
        if (ctx.won) return;
        handleEvents(tryFire(sim));
        syncHud();
      };

      const doShield = () => {
        if (ctx.won) return;
        handleEvents(tryActivateShield(sim));
        syncHud();
      };

      for (const button of ctx.view.querySelectorAll("[data-steer]")) {
        const role = button.dataset.steer;
        if (role === "left") bindInstantPress(button, () => moveLane(-1), signal);
        else if (role === "right") bindInstantPress(button, () => moveLane(1), signal);
        else if (role === "fire") bindInstantPress(button, doFire, signal);
        else if (role === "shield") bindInstantPress(button, doShield, signal);
      }

      ctx.onTick((time) => {
        if (!ctx.alive || ctx.won) return;
        const dt = lastTick ? Math.min(32, time - lastTick) : 16;
        lastTick = time;

        handleEvents(stepSpaceSim(sim, time, dt));

        for (const meteor of sim.meteors) {
          const el = meteorEls.get(meteor.id);
          if (!el) continue;
          el.style.setProperty("--y", `${meteor.y}%`);
          el.style.transform = `translateY(-50%) rotate(${meteor.spin}deg)`;
        }
        for (const bullet of sim.bullets) {
          const el = bulletEls.get(bullet.id);
          if (!el) continue;
          el.style.setProperty("--y", `${bullet.y}%`);
        }
        for (const pickup of sim.pickups) {
          const el = pickupEls.get(pickup.id);
          if (!el) continue;
          el.style.setProperty("--y", `${pickup.y}%`);
        }

        if (sim.shake > 0 && sim.shake < 2) track.classList.remove("is-shake");

        fx.engineTrail(sim.lane, time);
        fx.render(dt);
        syncHud();
      });

      if (!ctx.e2e) {
        sim.lastSpawn = performance.now() - spec.spawnMs * 0.5;
      }

      syncHud();
      syncShip();
    };

    runPhase(0);
  },
};
