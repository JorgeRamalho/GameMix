import { art } from "../art.js";
import { bindPress } from "../engine.js";
import { completePhase, phaseBanner, phaseTotal } from "../lib/phases.js";

const ZONES = [
  { id: 0, label: "Esquerda", emoji: "⬅️", kickX: "16.666%" },
  { id: 1, label: "Meio", emoji: "🎯", kickX: "50%" },
  { id: 2, label: "Direita", emoji: "➡️", kickX: "83.333%" },
];

const PHASES = [
  { goals: 2 },
  { goals: 3 },
  { goals: 4 },
];

const KICK_MS = 580;
const RESET_MS = 1100;

function zoneKickX(zoneId) {
  return ZONES.find((z) => z.id === zoneId)?.kickX ?? "50%";
}

export const futebol = {
  id: "futebol",
  title: "Pênalti",
  goal: "Chutar e furar o goleiro",
  mount(ctx) {
    const totalPhases = phaseTotal(ctx);
    const specs = PHASES.slice(0, totalPhases);

    const runPhase = (phaseIndex) => {
      const signal = ctx.beginPhase();
      const spec = specs[phaseIndex];
      let scored = 0;
      let tries = 0;
      let streak = 0;
      let roundOpen = true;

      const pickKeeper = () => {
        if (ctx.e2e) return 0;
        return Math.floor(ctx.random() * 3);
      };

      const renderHud = () => {
        const hud = ctx.view.querySelector("[data-hud]");
        const streakEl = ctx.view.querySelector("[data-streak]");
        if (hud) {
          hud.innerHTML = `⚽ Gols: <strong>${scored}</strong> de ${spec.goals} · Chutes: ${tries}`;
        }
        if (streakEl) {
          streakEl.textContent = streak > 0 ? `🔥 ${streak} seguidos` : "🥅 Mire no gol!";
          streakEl.classList.toggle("is-hot", streak >= 2);
        }
      };

      ctx.mountPhase(`
        ${phaseBanner(phaseIndex, totalPhases)}
        <section class="penalty-game" data-penalty>
          <div class="penalty-hud">
            <p class="catch-line" data-hud>⚽ Gols: <strong>0</strong> de ${spec.goals} · Chutes: 0</p>
            <span class="penalty-streak" data-streak>🥅 Mire no gol!</span>
          </div>
          <div class="penalty-pitch is-charging" data-pitch>
            <div class="penalty-crowd" aria-hidden="true">
              <span>📣</span><span>⚽</span><span>🙌</span><span>🏟️</span>
            </div>
            <div class="penalty-arena">
              <div class="penalty-goal-frame">
                <div class="penalty-goal-posts" aria-hidden="true"></div>
                <div class="penalty-goal" role="group" aria-label="Onde chutar">
                  ${ZONES.map(
                    (z) =>
                      `<button type="button" class="penalty-zone" data-zone="${z.id}" data-emoji="${z.emoji}" aria-label="Chutar ${z.label}"></button>`,
                  ).join("")}
                  <div class="penalty-keeper" data-keeper data-zone="1" style="--zone:1">${art.keeper}</div>
                </div>
              </div>
              <div class="penalty-spot" aria-hidden="true"></div>
              <div class="penalty-ball-wrap" data-ball>${art.ball}</div>
              <div class="penalty-flash" aria-hidden="true"></div>
              <div class="penalty-burst" data-burst aria-hidden="true">🎉⚽</div>
            </div>
          </div>
          <p class="penalty-hint">Toque em <strong>⬅️ meio ➡️</strong> para chutar — quantas vezes quiser!</p>
        </section>
      `);

      const pitch = ctx.view.querySelector("[data-pitch]");
      const keeper = ctx.view.querySelector("[data-keeper]");
      const burst = ctx.view.querySelector("[data-burst]");

      const resetKickVisuals = () => {
        pitch?.classList.remove("is-kick", "is-goal", "is-save");
        pitch?.classList.add("is-charging");
        pitch?.style.removeProperty("--kick-x");
        keeper?.classList.remove("is-diving");
        keeper?.style.setProperty("--zone", "1");
        keeper?.setAttribute("data-zone", "1");
        ctx.view.querySelectorAll(".penalty-zone").forEach((btn) => btn.classList.remove("is-aim"));
      };

      const finishTry = (goal, shotZone, keeperZone) => {
        roundOpen = false;
        tries += 1;
        const kickX = zoneKickX(shotZone);

        pitch?.classList.remove("is-charging");
        pitch?.style.setProperty("--kick-x", kickX);
        if (burst) burst.style.setProperty("--kick-x", kickX);

        ctx.view.querySelectorAll(".penalty-zone").forEach((btn) => {
          btn.classList.toggle("is-aim", Number(btn.dataset.zone) === shotZone);
        });

        keeper?.style.setProperty("--zone", String(keeperZone));
        keeper?.setAttribute("data-zone", String(keeperZone));
        keeper?.classList.add("is-diving");

        pitch?.classList.add("is-kick");
        pitch?.classList.add(goal ? "is-goal" : "is-save");

        if (goal) {
          scored += 1;
          streak += 1;
          ctx.feedback(streak >= 2 ? `Gol! ${streak} seguidos!` : "Gol!", "ok");
        } else {
          streak = 0;
          ctx.feedback("O goleiro pegou!", "no");
        }
        renderHud();

        const resetDelay = ctx.e2e ? 120 : RESET_MS;
        ctx.later(() => {
          if (!ctx.alive || ctx.won) return;
          resetKickVisuals();
          roundOpen = true;
          if (scored >= spec.goals) {
            completePhase(ctx, phaseIndex, totalPhases, runPhase, "Você virou artilheiro em todas as fases!");
          }
        }, ctx.e2e ? resetDelay : Math.max(resetDelay, KICK_MS + 80));
      };

      ZONES.forEach((z) => {
        const btn = ctx.view.querySelector(`[data-zone="${z.id}"]`);
        bindPress(
          btn,
          () => {
            if (!roundOpen || ctx.won) return;
            const keeperZone = pickKeeper();
            const goal = keeperZone !== z.id;
            finishTry(goal, z.id, keeperZone);
          },
          signal,
        );
      });

      renderHud();
    };

    runPhase(0);
  },
};
