import { art } from "../art.js";
import { bindPress, prepareSpeechForUserGesture, shuffle, speakAloud } from "../engine.js";
import { onChoice } from "../lib/gameActions.js";
import { completePhase, phaseBanner, phaseTotal } from "../lib/phases.js";
import { pickUnique } from "../lib/playVariety.js";

const WORDS = {
  apple: { pt: "maçã", art: "apple" },
  dog: { pt: "cachorro", art: "dog" },
  cat: { pt: "gato", art: "cat" },
  sun: { pt: "sol", art: "sun" },
  fish: { pt: "peixe", art: "fish" },
  ball: { pt: "bola", art: "ball" },
  star: { pt: "estrela", art: "star" },
  bird: { pt: "pássaro", art: "bird" },
  duck: { pt: "pato", art: "duck" },
  pig: { pt: "porco", art: "pig" },
};

const E2E_ROUNDS = [
  { en: "apple", options: ["apple", "dog", "sun"] },
  { en: "dog", options: ["cat", "dog", "fish"] },
  { en: "cat", options: ["cat", "apple", "ball"] },
];

function buildRounds(ctx, totalPhases) {
  if (ctx.e2e && !ctx.e2eFull) return E2E_ROUNDS.slice(0, totalPhases);
  const keys = Object.keys(WORDS);
  const picked = pickUnique(keys, totalPhases, ctx.random);
  return picked.map((en) => {
    const wrong = pickUnique(keys.filter((key) => key !== en), 2, ctx.random);
    return { en, options: shuffle([en, ...wrong], ctx.random) };
  });
}

export const ingles = {
  id: "ingles",
  title: "Inglês",
  goal: "Ouvir o significado em português",
  mount(ctx) {
    const totalPhases = phaseTotal(ctx);
    const rounds = buildRounds(ctx, totalPhases);

    const runPhase = (phaseIndex) => {
      const signal = ctx.beginPhase();
      const round = rounds[phaseIndex];
      const word = WORDS[round.en];
      const options = shuffle([...round.options], ctx.random);

      ctx.mountPhase( `
        ${phaseBanner(phaseIndex, totalPhases)}
        <section class="english-board english-card" data-round="${round.en}">
          <p class="en-word" lang="en">${round.en}</p>
          <button type="button" class="btn listen-btn" data-listen>Ouvir em português</button>
          <p class="caption" data-caption></p>
          <div class="choice-grid">
            ${options
              .map((option) => {
                const item = WORDS[option];
                return `<button type="button" class="choice" data-choice="${option}" data-correct="${option === round.en}" aria-label="${item.pt}">${art[item.art]}</button>`;
              })
              .join("")}
          </div>
        </section>
      `);

      bindPress(
        ctx.view.querySelector("[data-listen]"),
        () => {
          prepareSpeechForUserGesture();
          const phrase = `Em inglês se fala ${round.en}. Significa ${word.pt}.`;
          const caption = ctx.view.querySelector("[data-caption]");
          if (caption) caption.textContent = phrase;
          speakAloud(phrase, "pt-BR", { replace: true });
          speakAloud(round.en, "en-US", { trackDataset: false });
        },
        signal,
      );

      ctx.view.querySelectorAll("[data-choice]").forEach((button) => {
        bindPress(
          button,
          () => {
            onChoice(ctx, button, button.dataset.correct === "true", {
              noText: "Ouve de novo e escolhe outra.",
              onCorrect: () => {
                ctx.feedback("Isso mesmo!", "ok");
                ctx.later(
                  () => completePhase(ctx, phaseIndex, totalPhases, runPhase, "Você entendeu as palavras!"),
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
