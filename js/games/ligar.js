import { art } from "../art.js";

import { bindPress, shuffle } from "../engine.js";

import { completePhase, GAME_PHASE_COUNT, phaseBanner, phaseTotal } from "../lib/phases.js";
import { rotateList } from "../lib/playVariety.js";



const ALL_PAIRS = [

  { key: "agua", left: "Peixe", right: "Água", leftArt: "fish", rightArt: "drop" },

  { key: "flor", left: "Flor", right: "Vaso", leftArt: "flowerRed", rightArt: "vase" },

  { key: "pe", left: "Sapato", right: "Meia", leftArt: "shoe", rightArt: "sock" },

  { key: "chuva", left: "Nuvem", right: "Guarda-chuva", leftArt: "cloud", rightArt: "umbrella" },

  { key: "cao", left: "Cachorro", right: "Osso…", leftArt: "dog", rightArt: "ball" },

  { key: "gato", left: "Gato", right: "Ratinho", leftArt: "cat", rightArt: "fish" },

  { key: "sol", left: "Sol", right: "Dia quente", leftArt: "sun", rightArt: "sunOrange" },

  { key: "praia", left: "Concha", right: "Areia", leftArt: "shell", rightArt: "sand" },

  { key: "fazenda", left: "Vaca", right: "Leite", leftArt: "cow", rightArt: "drop" },

  { key: "pato", left: "Pato", right: "Lago", leftArt: "duck", rightArt: "wave" },

];



const LIGAR_THEMES = [
  "Objetos",
  "Animais",
  "Natureza",
  "Casa",
  "Campo",
  "Praia",
  "Fazenda",
  "Amigos",
  "Desafio",
  "Campeão",
];

const PHASES = Array.from({ length: GAME_PHASE_COUNT }, (_, phaseIndex) => ({
  pairs: Math.min(2 + Math.floor(phaseIndex / 2), ALL_PAIRS.length),
  theme: LIGAR_THEMES[phaseIndex] ?? "Ligar",
}));



function item(side, pair) {

  const label = side === "left" ? pair.left : pair.right;

  const drawing = art[side === "left" ? pair.leftArt : pair.rightArt];

  return `

    <button type="button" class="match-item" data-side="${side}" data-key="${pair.key}">

      <span class="match-art">${drawing}</span>

      <span>${label}</span>

    </button>

  `;

}



export const ligar = {

  id: "ligar",

  title: "Ligar",

  goal: "10 fases ligando pares",

  mount(ctx) {

    const totalPhases = phaseTotal(ctx);

    const specs =
      ctx.e2e && !ctx.e2eFull
        ? [{ pairs: 4, theme: "Teste" }]
        : rotateList(PHASES, ctx.runIndex).slice(0, totalPhases);



    const runPhase = (phaseIndex) => {

      const signal = ctx.beginPhase();

      const spec = specs[phaseIndex];

      const pool =

        ctx.e2e && !ctx.e2eFull

          ? ALL_PAIRS.slice(0, spec.pairs)

          : shuffle([...ALL_PAIRS], ctx.random).slice(0, spec.pairs);

      const left = shuffle([...pool], ctx.random);

      const right = shuffle([...pool], ctx.random);

      const links = [];

      let selected = null;



      ctx.mountPhase( `

        ${phaseBanner(phaseIndex, totalPhases)}

        <p class="hint">Toque um desenho e depois o par dele. ${spec.theme ? `Tema: ${spec.theme}.` : ""}</p>

        <div class="match-board">

          <div class="match-cols">

            <div class="col">${left.map((pair) => item("left", pair)).join("")}</div>

            <div class="col">${right.map((pair) => item("right", pair)).join("")}</div>

          </div>

          <svg class="wires" aria-hidden="true"></svg>

        </div>

      `);



      const draw = () => {

        const board = ctx.view.querySelector(".match-board");

        const svg = ctx.view.querySelector(".wires");

        if (!board || !svg) return;

        const box = board.getBoundingClientRect();

        svg.innerHTML = links

          .map((link) => {

            const from = link.left.getBoundingClientRect();

            const to = link.right.getBoundingClientRect();

            const x1 = from.right - box.left;

            const y1 = from.top + from.height / 2 - box.top;

            const x2 = to.left - box.left;

            const y2 = to.top + to.height / 2 - box.top;

            return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"></line>`;

          })

          .join("");

      };



      const onResize = () => draw();

      window.addEventListener("resize", onResize, { signal });

      ctx.phaseOwn(() => window.removeEventListener("resize", onResize));



      const pick = (button) => {

        if (!ctx.alive || ctx.won || button.classList.contains("is-locked")) return;

        if (button.dataset.side === "left") {

          ctx.view.querySelectorAll('[data-side="left"]').forEach((element) => {

            element.classList.remove("is-selected");

          });

          selected = button;

          button.classList.add("is-selected");

          return;

        }

        if (!selected) {

          ctx.feedback("Primeiro toca num desenho da esquerda.", "no");

          return;

        }

        if (selected.dataset.key === button.dataset.key) {

          selected.classList.remove("is-selected");

          selected.classList.add("is-locked");

          button.classList.add("is-locked");

          links.push({ left: selected, right: button });

          selected = null;

          draw();

          ctx.markSuccess(selected);
          ctx.markSuccess(button);
          const streak = ctx.stats.recordHit();
          ctx.updateStreak();
          ctx.feedback(streak >= 2 ? `Ligou certinho! ${streak} seguidos!` : "Ligou certinho!", "ok");

          if (links.length === pool.length) {

            completePhase(ctx, phaseIndex, totalPhases, runPhase, "Você ligou todos os objetos!");

          }

          return;

        }

        const wrong = selected;

        selected = null;

        wrong.classList.remove("is-selected");

        ctx.stats.reset();
        ctx.updateStreak();
        ctx.markError(wrong);
        ctx.markError(button);

        ctx.feedback("Esses dois não combinam.", "no");

      };



      ctx.view.querySelectorAll(".match-item").forEach((button) => {

        bindPress(button, () => pick(button), signal);

      });

    };



    runPhase(0);

  },

};


