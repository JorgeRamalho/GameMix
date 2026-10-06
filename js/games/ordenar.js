import { bindPress, shuffle } from "../engine.js";
import { completePhase, phaseBanner, phaseNarrationTip, phaseTotal } from "../lib/phases.js";

function itemCount(phaseIndex) {
  return Math.min(3 + Math.floor(phaseIndex / 2), 5);
}

function buildRound(phaseIndex, random) {
  const count = itemCount(phaseIndex);
  const descending = phaseIndex % 2 === 1;
  const values = Array.from({ length: count }, (_, i) => i + 1);
  const order = descending ? [...values].reverse() : values;
  const shuffled = shuffle(values, random);
  return { values: shuffled, order, descending, count };
}

export const ordenar = {
  id: "ordenar",
  title: "Ordenar",
  goal: "10 fases — do menor ao maior (ou ao contrário)",
  mount(ctx) {
    const totalPhases = phaseTotal(ctx);

    const runPhase = (phaseIndex) => {
      const round =
        ctx.e2e && !ctx.e2eFull
          ? { values: [3, 1, 2], order: [1, 2, 3], descending: false, count: 3 }
          : buildRound(phaseIndex, ctx.random);
      const prompt = round.descending
        ? "Toque do maior para o menor."
        : "Toque do menor para o maior.";
      phaseNarrationTip(ctx, prompt);
      const signal = ctx.beginPhase();
      let picked = 0;

      ctx.mountPhase(`
        ${phaseBanner(phaseIndex, totalPhases)}
        <section class="order-board">
          <p class="catch-line">${prompt}</p>
          <p class="catch-line" data-order-progress>0 de ${round.count}</p>
          <div class="order-grid cols-${round.count}" role="group" aria-label="Números para ordenar">
            ${round.values
              .map(
                (value) =>
                  `<button type="button" class="order-chip" data-value="${value}" aria-label="Número ${value}">${value}</button>`,
              )
              .join("")}
          </div>
        </section>
      `);

      const progress = ctx.view.querySelector("[data-order-progress]");

      ctx.view.querySelectorAll("[data-value]").forEach((button) => {
        bindPress(
          button,
          () => {
            if (ctx.won || button.classList.contains("is-picked")) return;
            const value = Number(button.dataset.value);
            const expected = round.order[picked];
            if (value !== expected) {
              ctx.stats?.reset();
              ctx.updateStreak?.();
              ctx.markError(button);
              ctx.feedback(round.descending ? "Precisa ser um número menor." : "Precisa ser um número maior.", "no");
              return;
            }
            picked += 1;
            button.classList.add("is-picked");
            ctx.markSuccess(button);
            ctx.stats?.recordHit();
            ctx.updateStreak?.();
            if (progress) progress.textContent = `${picked} de ${round.count}`;
            if (picked >= round.count) {
              ctx.feedback("Ordem certa!", "ok");
              ctx.later(
                () => completePhase(ctx, phaseIndex, totalPhases, runPhase, "Você ordenou tudo!"),
                ctx.e2e ? 30 : 480,
              );
            } else {
              ctx.feedback("Isso!", "ok");
            }
          },
          signal,
        );
      });
    };

    runPhase(0);
  },
};
