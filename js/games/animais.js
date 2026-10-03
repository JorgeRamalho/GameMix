import { bindPress, shuffle, speakPortuguese } from "../engine.js";
import { siteUrl } from "../lib/siteBase.js";
import { ANIMAL_PHASES, animalsForPhase, E2E_ANIMAL_PHASE } from "./animais-data.js";
import { onChoice } from "../lib/gameActions.js";
import { completePhase, phaseBanner, phaseNarrationTip, phaseTotal } from "../lib/phases.js";

function pickRound(pool, optionCount, random) {
  const bag = shuffle([...pool], random);
  const answer = bag[0];
  const wrong = shuffle(bag.slice(1), random).slice(0, optionCount - 1);
  const choices = shuffle([answer, ...wrong], random);
  return { answer, choices };
}

function photoImg(animal, className, sizes) {
  return `<img class="${className}" src="${siteUrl(animal.photo)}" alt="" width="320" height="240" loading="lazy" decoding="async" sizes="${sizes}" />`;
}

export const animais = {
  id: "animais",
  title: "Adivinhar animal",
  goal: "Reconhecer bichinhos",
  mount(ctx) {
    const totalPhases = phaseTotal(ctx);
    const specs =
      ctx.e2e && !ctx.e2eFull ? [E2E_ANIMAL_PHASE] : ANIMAL_PHASES.slice(0, totalPhases);

    const runPhase = (phaseIndex) => {
      const spec = specs[phaseIndex];
      const pool = animalsForPhase(spec.ids);
      phaseNarrationTip(ctx, "Olhe a foto grande e escolha o nome do bichinho.");
      const signal = ctx.beginPhase();
      let round = 0;

      const showRound = () => {
        const { answer, choices } = pickRound(pool, spec.options, ctx.random);
        round += 1;

        ctx.mountPhase(`
          ${phaseBanner(phaseIndex, totalPhases)}
          <section class="animal-stage" aria-labelledby="animal-prompt">
            <p class="catch-line" data-round>${round} de ${spec.rounds}</p>
            <figure class="animal-photo-hero">
              ${photoImg(answer, "animal-photo-hero__img", "min(92vw, 360px)")}
              <figcaption class="visually-hidden" id="animal-prompt">Foto de um bichinho para adivinhar</figcaption>
            </figure>
            <p class="animal-prompt">Quem é esse bichinho?</p>
            <button type="button" class="btn listen-btn" data-hint>Ouvir uma dica</button>
            <div class="animal-choices cols-${spec.options}" role="group" aria-label="Escolha o animal">
              ${choices
                .map(
                  (animal) => `
                <button type="button" class="animal-choice" data-animal="${animal.id}" data-correct="${animal.id === answer.id}" aria-label="${animal.label}">
                  ${photoImg(animal, "animal-choice-photo", "72px")}
                  <span class="animal-choice-name">${animal.label}</span>
                </button>
              `,
                )
                .join("")}
            </div>
          </section>
        `);

        bindPress(
          ctx.view.querySelector("[data-hint]"),
          () => {
            const phrase = `${answer.hint} É o ${answer.label}.`;
            speakPortuguese(phrase);
            ctx.feedback(answer.hint, "ok");
          },
          signal,
        );

        ctx.view.querySelectorAll("[data-animal]").forEach((button) => {
          bindPress(
            button,
            () => {
              onChoice(ctx, button, button.dataset.correct === "true", {
                onCorrect: () => {
                  const phrase = `Isso! É o ${answer.label}!`;
                  speakPortuguese(phrase);
                  ctx.feedback(phrase, "ok");
                  if (round >= spec.rounds) {
                    ctx.later(
                      () => completePhase(ctx, phaseIndex, totalPhases, runPhase, "Você conhece muitos bichinhos!"),
                      ctx.e2e ? 40 : 700,
                    );
                  } else {
                    ctx.later(() => showRound(), ctx.e2e ? 40 : 650);
                  }
                },
                noText: "Olha de novo a foto grande.",
              });
            },
            signal,
          );
        });
      };

      showRound();
    };

    runPhase(0);
  },
};
