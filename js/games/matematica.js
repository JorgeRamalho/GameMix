import { bindPress } from "../engine.js";

import { E2E_MATH_ROUND, generateMathRound } from "../lib/mathRounds.js";

import { onChoice } from "../lib/gameActions.js";
import { completePhase, phaseBanner, phaseNarrationTip, phaseTotal } from "../lib/phases.js";



export const matematica = {

  id: "matematica",

  title: "Matemática",

  goal: "Contar e somar até 5",

  mount(ctx) {

    const totalPhases = phaseTotal(ctx);



    const pickRound = (phaseIndex) => {

      if (ctx.e2e && !ctx.e2eFull && phaseIndex === 0) return E2E_MATH_ROUND;

      return generateMathRound(ctx.random);

    };



    const runPhase = (phaseIndex) => {

      const round = pickRound(phaseIndex);

      phaseNarrationTip(ctx, `${round.prompt} Conte em voz alta antes de tocar a resposta.`);

      const signal = ctx.beginPhase();



      ctx.mountPhase( `

        ${phaseBanner(phaseIndex, totalPhases)}

        <section class="math-board" data-answer="${round.answer}">

          <h3 class="prompt" data-prompt>${round.prompt}</h3>

          ${round.markup}

          <div class="answer-row">

            ${round.options

              .map((option) => `<button type="button" class="answer" data-option="${option}">${option}</button>`)

              .join("")}

          </div>

        </section>

      `);



      ctx.later(() => {

        if (!ctx.alive || ctx.won) return;

        ctx.narrate(round.prompt);

      }, ctx.e2e ? 20 : 1200);



      ctx.view.querySelectorAll("[data-option]").forEach((button) => {

        bindPress(

          button,

          () => {
            const value = Number(button.dataset.option);
            onChoice(ctx, button, value === round.answer, {
              okText: "Isso!",
              noText: "Conta de novo com o dedo.",
              onCorrect: () => {
                ctx.feedback("Isso!", "ok");
                ctx.later(
                  () => completePhase(ctx, phaseIndex, totalPhases, runPhase, "Você contou tudo!"),
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


