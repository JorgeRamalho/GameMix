import { bindPress } from "../engine.js";
import { completePhase, GAME_PHASE_COUNT, phaseBanner, phaseNarrationTip, phaseTotal } from "../lib/phases.js";

const GREEN_NEEDED = Array.from({ length: GAME_PHASE_COUNT }, (_, i) => 4 + i);

/** ms por estado: vermelho, amarelo, verde */
function timings(phaseIndex) {
  const t = 900 - phaseIndex * 35;
  return { red: t + 200, yellow: 380, green: Math.max(520 - phaseIndex * 25, 320) };
}

export const semaforo = {
  id: "semaforo",
  title: "Semáforo",
  goal: "10 fases — toque só no verde",
  mount(ctx) {
    const totalPhases = phaseTotal(ctx);

    const runPhase = (phaseIndex) => {
      const need = ctx.e2e && !ctx.e2eFull ? 2 : GREEN_NEEDED[phaseIndex];
      const times = timings(phaseIndex);
      phaseNarrationTip(ctx, "Toque no círculo grande somente quando ficar verde.");
      const signal = ctx.beginPhase();
      let hits = 0;
      let state = "red";
      let elapsed = 0;
      let phaseElapsed = 0;

      ctx.mountPhase(`
        ${phaseBanner(phaseIndex, totalPhases)}
        <section class="light-board">
          <p class="catch-line" data-light-score>0 de ${need} no verde</p>
          <button type="button" class="light-disc" data-light aria-label="Semáforo">
            <span class="light-glow" data-light-face aria-hidden="true"></span>
          </button>
          <p class="light-hint">Vermelho: espere. Verde: toque!</p>
        </section>
      `);

      const disc = ctx.view.querySelector("[data-light]");
      const face = ctx.view.querySelector("[data-light-face]");
      const score = ctx.view.querySelector("[data-light-score]");

      const paint = () => {
        if (face) {
          face.dataset.state = state;
        }
        disc?.setAttribute("aria-label", state === "green" ? "Verde — pode tocar" : "Espere — não toque agora");
      };

      paint();

      bindPress(
        disc,
        () => {
          if (ctx.won) return;
          if (state === "green") {
            hits += 1;
            ctx.markSuccess(disc);
            ctx.stats?.recordHit();
            ctx.updateStreak?.();
            if (score) score.textContent = `${hits} de ${need} no verde`;
            ctx.feedback(hits >= need ? "Fase quase pronta!" : "Boa! Só no verde.", "ok");
            if (hits >= need) {
              completePhase(ctx, phaseIndex, totalPhases, runPhase, "Você respeitou o semáforo em todas as fases!");
            }
            return;
          }
          ctx.stats?.reset();
          ctx.updateStreak?.();
          ctx.markError(disc);
          ctx.feedback("No vermelho ou amarelo não toque!", "no");
        },
        signal,
      );

      ctx.onTick((time) => {
        if (!ctx.alive || ctx.won || ctx.e2e) return;
        if (!phaseElapsed) {
          phaseElapsed = time;
          return;
        }
        const dt = time - phaseElapsed;
        phaseElapsed = time;
        elapsed += dt;
        const cycle = times.red + times.yellow + times.green;
        const mod = elapsed % cycle;
        if (mod < times.red) state = "red";
        else if (mod < times.red + times.yellow) state = "yellow";
        else state = "green";
        paint();
      });

      if (ctx.e2e) {
        state = "green";
        paint();
      }
    };

    runPhase(0);
  },
};
