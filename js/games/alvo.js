import { art } from "../art.js";
import { bindPress } from "../engine.js";
import { completePhase, GAME_PHASE_COUNT, phaseBanner, phaseTotal } from "../lib/phases.js";

const PHASES = Array.from({ length: GAME_PHASE_COUNT }, (_, phaseIndex) => ({
  hits: Math.min(2 + phaseIndex, 8),
  wobble: 3 + phaseIndex,
  drift: Math.min(Math.floor(phaseIndex / 2) * 2, 8),
}));

export const alvo = {
  id: "alvo",
  title: "Tiro ao alvo",
  goal: "Mirar e tocar com calma",
  mount(ctx) {
    const totalPhases = phaseTotal(ctx);
    const specs = PHASES.slice(0, totalPhases);

    const runPhase = (phaseIndex) => {
      const signal = ctx.beginPhase();
      const spec = specs[phaseIndex];
      const spots = ctx.e2e
        ? Array.from({ length: spec.hits }, (_, index) => [40 + index * 4, 42 + index * 2])
        : Array.from({ length: spec.hits }, () => [28 + ctx.random() * 44, 28 + ctx.random() * 44]);
      let index = 0;

      ctx.mountPhase( `
        ${phaseBanner(phaseIndex, totalPhases)}
        <p class="catch-line" data-hits>0 de ${spec.hits} estrelas</p>
        <div class="target-wrap">
          <div class="target" aria-hidden="true"></div>
          <button type="button" class="shot" data-shot aria-label="Estrela">${art.star}</button>
        </div>
      `);

      const button = ctx.view.querySelector("[data-shot]");
      const counter = ctx.view.querySelector("[data-hits]");

      const place = () => {
        const spot = spots[index];
        button.style.left = `${spot[0]}%`;
        button.style.top = `${spot[1]}%`;
      };

      place();

      bindPress(
        button,
        () => {
          if (ctx.won) return;
          index += 1;
          counter.textContent = `${index} de ${spec.hits} estrelas`;
          const streak = ctx.stats.recordHit();
          ctx.updateStreak();
          ctx.markSuccess(button);
          ctx.feedback(
            index === spec.hits ? "No alvo!" : streak >= 3 ? `Acertou! ${ctx.streakLabel(streak)}` : "Acertou!",
            "ok",
          );
          if (index >= spec.hits) {
            completePhase(ctx, phaseIndex, totalPhases, runPhase, "Todas as estrelas foram ao centro!");
            return;
          }
          place();
        },
        signal,
      );

      ctx.onTick((time) => {
        if (!ctx.alive || ctx.e2e || ctx.won) return;
        const bob = Math.sin(time / 280) * spec.wobble;
        const sway = Math.cos(time / 420) * spec.drift;
        button.style.marginTop = `${bob}px`;
        button.style.marginLeft = `${sway}px`;
      });
    };

    runPhase(0);
  },
};
