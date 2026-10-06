import { art } from "../art.js";
import { bindPress, shuffle } from "../engine.js";
import { onChoice } from "../lib/gameActions.js";
import { completePhase, phaseBanner, phaseNarrationTip, phaseTotal } from "../lib/phases.js";
import { pickUnique } from "../lib/playVariety.js";

const POOL = [
  { key: "dog", label: "Cachorro", art: "dog" },
  { key: "cat", label: "Gato", art: "cat" },
  { key: "fish", label: "Peixe", art: "fish" },
  { key: "bird", label: "Pássaro", art: "bird" },
  { key: "duck", label: "Pato", art: "duck" },
  { key: "pig", label: "Porco", art: "pig" },
  { key: "cow", label: "Vaca", art: "cow" },
  { key: "butterfly", label: "Borboleta", art: "butterfly" },
  { key: "apple", label: "Maçã", art: "apple" },
  { key: "star", label: "Estrela", art: "star" },
];

function optionCount(phaseIndex) {
  return phaseIndex >= 6 ? 4 : 3;
}

export const sombras = {
  id: "sombras",
  title: "Sombras",
  goal: "10 fases — ache o desenho da sombra",
  mount(ctx) {
    const totalPhases = phaseTotal(ctx);

    const runPhase = (phaseIndex) => {
      const options = optionCount(phaseIndex);
      phaseNarrationTip(ctx, "Olhe a silhueta preta e escolha o desenho igual.");
      const signal = ctx.beginPhase();
      const pool =
        ctx.e2e && !ctx.e2eFull
          ? POOL.slice(0, 3)
          : pickUnique(POOL, Math.max(options, 4), ctx.random);
      const answer = pool[0];
      const wrong = shuffle(pool.slice(1), ctx.random).slice(0, options - 1);
      const choices = shuffle([answer, ...wrong], ctx.random);

      ctx.mountPhase(`
        ${phaseBanner(phaseIndex, totalPhases)}
        <section class="shadow-board">
          <p class="catch-line">Qual desenho combina com a sombra?</p>
          <figure class="shadow-hero" aria-hidden="true">
            <span class="shadow-silhouette">${art[answer.art]}</span>
          </figure>
          <div class="shadow-choices cols-${options}" role="group" aria-label="Escolhas">
            ${choices
              .map(
                (item) => `
              <button type="button" class="shadow-choice" data-key="${item.key}" data-correct="${item.key === answer.key}" aria-label="${item.label}">
                <span class="shadow-art">${art[item.art]}</span>
                <span>${item.label}</span>
              </button>
            `,
              )
              .join("")}
          </div>
        </section>
      `);

      ctx.view.querySelectorAll("[data-key]").forEach((button) => {
        bindPress(
          button,
          () => {
            onChoice(ctx, button, button.dataset.correct === "true", {
              noText: "Compare o formato com a sombra.",
              onCorrect: () => {
                ctx.feedback(`Isso! É ${answer.label}!`, "ok");
                ctx.later(
                  () => completePhase(ctx, phaseIndex, totalPhases, runPhase, "Você acertou todas as sombras!"),
                  ctx.e2e ? 30 : 480,
                );
              },
            });
          },
          signal,
        );
      });
    };

    runPhase(0);
  },
};
