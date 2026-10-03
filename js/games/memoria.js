import { art } from "../art.js";

import { bindPress, shuffle } from "../engine.js";

import { completePhase, phaseBanner, phaseTotal } from "../lib/phases.js";
import { pickUnique } from "../lib/playVariety.js";



const FACES = [

  { pair: "estrela", label: "Estrela", art: "star" },

  { pair: "maca", label: "Maçã", art: "apple" },

  { pair: "peixe", label: "Peixe", art: "fish" },

  { pair: "sol", label: "Sol", art: "sun" },

  { pair: "pato", label: "Pato", art: "duck" },

  { pair: "vaca", label: "Vaca", art: "cow" },

  { pair: "porco", label: "Porco", art: "pig" },

  { pair: "bola", label: "Bola", art: "ball" },

  { pair: "flor", label: "Flor", art: "flowerRed" },

  { pair: "passaro", label: "Pássaro", art: "bird" },

];



const PHASES = [

  { pairs: 2, gridClass: "cols-2" },

  { pairs: 3, gridClass: "" },

  { pairs: 4, gridClass: "" },

  { pairs: 5, gridClass: "mem-dense" },

];



export const memoria = {

  id: "memoria",

  title: "Memória",

  goal: "Lembrar o que viu",

  mount(ctx) {

    const totalPhases = phaseTotal(ctx);

    const specs = PHASES.slice(0, totalPhases);



    const runPhase = (phaseIndex) => {

      const signal = ctx.beginPhase();

      const spec = specs[phaseIndex];

      const pool = ctx.e2e
        ? FACES.slice(0, spec.pairs)
        : pickUnique(FACES, spec.pairs, ctx.random);

      const base = pool.flatMap((face) => [face, face]);

      const deck = ctx.e2e

        ? ["estrela", "maca", "maca", "estrela"]

        : shuffle(

            base.map((face) => face.pair),

            ctx.random,

          );

      const cards = deck.map((pair) => {

        const face = FACES.find((item) => item.pair === pair);

        return { pair, label: face.label, art: face.art, up: false, matched: false };

      });

      let locked = false;



      ctx.mountPhase( `

        ${phaseBanner(phaseIndex, totalPhases)}

        <div class="mem-grid ${spec.gridClass}">

          ${cards

            .map(

              (card, index) => `

              <button type="button" class="mem-card" data-card data-index="${index}" data-pair="${card.pair}" aria-label="Carta virada">

                <span class="mem-inner">

                  <span class="mem-face mem-back" aria-hidden="true"></span>

                  <span class="mem-face mem-front">${art[card.art]}</span>

                </span>

              </button>

            `,

            )

            .join("")}

        </div>

      `);



      const paint = () => {

        cards.forEach((card, index) => {

          const button = ctx.view.querySelector(`[data-index="${index}"]`);

          const visible = card.up || card.matched;

          button.classList.toggle("is-up", visible);

          button.classList.toggle("is-matched", card.matched);

          button.disabled = card.matched;

          button.setAttribute("aria-label", visible ? card.label : "Carta virada");

        });

      };



      const flip = (index) => {

        if (!ctx.alive || ctx.won || locked) return;

        const card = cards[index];

        if (!card || card.up || card.matched) return;

        card.up = true;

        paint();

        const open = cards.filter((item) => item.up && !item.matched);

        if (open.length < 2) return;

        if (open[0].pair === open[1].pair) {

          for (const item of open) item.matched = true;

          paint();

          const idx0 = cards.indexOf(open[0]);
          const idx1 = cards.indexOf(open[1]);
          const b0 = ctx.view.querySelector(`[data-index="${idx0}"]`);
          const b1 = ctx.view.querySelector(`[data-index="${idx1}"]`);
          ctx.markSuccess(b0);
          ctx.markSuccess(b1);
          const streak = ctx.stats.recordHit();
          ctx.updateStreak();
          ctx.feedback(streak >= 2 ? `Par! ${streak} seguidos!` : "Achou o par!", "ok");

          if (cards.every((item) => item.matched)) {

            completePhase(ctx, phaseIndex, totalPhases, runPhase, "Você lembrou de todos os pares!");

          }

          return;

        }

        locked = true;

        ctx.stats.reset();
        ctx.updateStreak();
        ctx.feedback("Quase! Olha de novo.", "no");

        ctx.later(() => {

          for (const item of open) item.up = false;

          locked = false;

          paint();

        }, ctx.e2e ? 40 : 720);

      };



      ctx.view.querySelectorAll("[data-card]").forEach((button) => {

        bindPress(button, () => flip(Number(button.dataset.index)), signal);

      });

    };



    runPhase(0);

  },

};


