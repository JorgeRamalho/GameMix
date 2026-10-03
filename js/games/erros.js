import { art } from "../art.js";

import { bindPress } from "../engine.js";

import { completePhase, GAME_PHASE_COUNT, phaseBanner, phaseTotal } from "../lib/phases.js";
import { pickUnique } from "../lib/playVariety.js";



/** Diferenças em cena de parque — pessoas passeando, bancos, cachorro, etc. */

const DIFFS = [

  { id: "pessoa", label: "Camisa diferente", top: "38%", left: "8%", ref: "person", play: "personRed" },

  { id: "crianca", label: "Balão diferente", top: "36%", left: "38%", ref: "personChild", play: "personBalloon" },

  { id: "cachorro", label: "Bichinho diferente", top: "52%", left: "62%", ref: "dog", play: "cat" },

  { id: "banco", label: "Algo no banco", top: "58%", left: "18%", ref: "bench", play: "benchBook" },

  { id: "arvore", label: "Pássaro diferente", top: "12%", left: "68%", ref: "bird", play: "butterfly" },

  { id: "bola", label: "Bola diferente", top: "68%", left: "42%", ref: "ball", play: "block" },

  { id: "flor", label: "Flor diferente", top: "72%", left: "4%", ref: "flowerRed", play: "flowerBlue" },

];



const PHASES = Array.from({ length: GAME_PHASE_COUNT }, (_, phaseIndex) => ({
  count: Math.min(2 + phaseIndex, DIFFS.length),
}));



const PARK_DECOR = `

  <div class="park-path" aria-hidden="true"></div>

  <div class="park-tree park-tree-a" aria-hidden="true"></div>

  <div class="park-tree park-tree-b" aria-hidden="true"></div>

  <div class="park-bench-bg" aria-hidden="true"></div>
`;



function scene(mode, items) {

  return `${PARK_DECOR}${items

    .map((item) => {

      const picture = art[mode === "play" ? item.play : item.ref];

      const style = `top:${item.top};left:${item.left}`;

      if (mode === "play") {

        return `<button type="button" class="thing" data-diff="${item.id}" style="${style}" aria-label="${item.label}" aria-pressed="false">${picture}</button>`;

      }

      return `<div class="thing" style="${style}">${picture}</div>`;

    })

    .join("")}`;

}



export const erros = {

  id: "erros",

  title: "Sete erros",

  goal: "Comparar detalhes no parque",

  mount(ctx) {

    const totalPhases = phaseTotal(ctx);

    const specs = PHASES.slice(0, totalPhases);



    const runPhase = (phaseIndex) => {

      const signal = ctx.beginPhase();

      const spec = specs[phaseIndex];

      const items = ctx.e2e
        ? DIFFS.slice(0, spec.count)
        : pickUnique(DIFFS, spec.count, ctx.random);

      let found = 0;



      ctx.mountPhase( `

        ${phaseBanner(phaseIndex, totalPhases)}

        <p class="catch-line" data-found>0 de ${spec.count}</p>

        <p class="hint">Olhe as duas cenas do parque e toque no que mudou.</p>

        <div class="scenes">

          <figure class="scene">

            <figcaption class="scene-label">Parque — modelo</figcaption>

            <div class="park park-stroll">${scene("ref", items)}</div>

          </figure>

          <figure class="scene">

            <figcaption class="scene-label">Toque no que mudou</figcaption>

            <div class="park park-stroll park-play">${scene("play", items)}</div>

          </figure>

        </div>

      `);



      const counter = ctx.view.querySelector("[data-found]");

      ctx.view.querySelectorAll("[data-diff]").forEach((button) => {

        bindPress(

          button,

          () => {

            if (ctx.won || button.classList.contains("is-found")) return;

            button.classList.add("is-found");

            button.setAttribute("aria-pressed", "true");

            found += 1;

            counter.textContent = `${found} de ${spec.count}`;

            ctx.markSuccess(button);
            const streak = ctx.stats.recordHit();
            ctx.updateStreak();
            ctx.feedback(
              found === spec.count ? "Achou todas!" : streak >= 2 ? `Isso mudou! ${streak} seguidos!` : "Isso mudou!",
              "ok",
            );

            if (found === spec.count) {

              completePhase(ctx, phaseIndex, totalPhases, runPhase, "Você achou todos os erros!");

            }

          },

          signal,

        );

      });

    };



    runPhase(0);

  },

};


