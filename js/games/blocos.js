import { bindPress } from "../engine.js";
import { onChoice } from "../lib/gameActions.js";
import { completePhase, phaseBanner, phaseTotal } from "../lib/phases.js";
import { pickUnique } from "../lib/playVariety.js";



const COLORS = [

  { id: "vermelho", hex: "#ff4d4d", label: "vermelho" },

  { id: "amarelo", hex: "#ffe14a", label: "amarelo" },

  { id: "azul", hex: "#3d8bfd", label: "azul" },

  { id: "verde", hex: "#3cce6e", label: "verde" },

  { id: "roxo", hex: "#9b6bff", label: "roxo" },

  { id: "laranja", hex: "#ff8a1e", label: "laranja" },

];



const PHASES = [

  {

    layout: "row2",

    slots: ["vermelho", "azul"],

  },

  {

    layout: "tower3",

    slots: ["amarelo", "verde", "roxo"],

  },

  {

    layout: "grid4",

    slots: ["vermelho", "amarelo", "azul", "laranja"],

  },

];



function colorOf(id) {

  return COLORS.find((c) => c.id === id) ?? COLORS[0];

}



function shuffleBlocks(ctx, ids) {

  const list = [...ids];

  if (ctx.e2e) return [...list].reverse();

  for (let i = list.length - 1; i > 0; i -= 1) {

    const j = Math.floor(ctx.random() * (i + 1));

    [list[i], list[j]] = [list[j], list[i]];

  }

  if (list.every((id, index) => id === ids[index]) && list.length > 1) {

    [list[0], list[1]] = [list[1], list[0]];

  }

  return list;

}



export const blocos = {

  id: "blocos",

  title: "Blocos coloridos",

  goal: "Montar e encaixar as peças",

  mount(ctx) {

    const totalPhases = phaseTotal(ctx);

    const specs =
      ctx.e2e && !ctx.e2eFull
        ? PHASES.slice(0, totalPhases)
        : PHASES.slice(0, totalPhases).map((phase) => ({
            ...phase,
            slots: pickUnique(COLORS, phase.slots.length, ctx.random).map((color) => color.id),
          }));



    const runPhase = (phaseIndex) => {

      const signal = ctx.beginPhase();

      const spec = specs[phaseIndex];

      const placed = new Array(spec.slots.length).fill(null);

      const usedTray = new Set();

      let picked = null;

      const tray = shuffleBlocks(ctx, spec.slots);



      const slotMarkup = spec.slots

        .map((colorId, index) => {

          const c = colorOf(colorId);

          return `<button type="button" class="block-slot" data-slot="${index}" data-want="${colorId}" aria-label="Lugar para bloco ${c.label}" style="--hint:${c.hex}22"></button>`;

        })

        .join("");



      const trayMarkup = tray

        .map(

          (colorId, index) =>

            `<button type="button" class="block-piece" data-tray="${index}" data-color="${colorId}" aria-label="Bloco ${colorOf(colorId).label}" style="--block:${colorOf(colorId).hex}"></button>`,

        )

        .join("");



      ctx.mountPhase( `

        ${phaseBanner(phaseIndex, totalPhases)}

        <p class="hint">Toque num bloco e depois no lugar certo para encaixar.</p>

        <div class="block-board block-board--${spec.layout}" data-board>

          ${slotMarkup}

        </div>

        <div class="block-tray" data-tray>${trayMarkup}</div>

      `);



      const refresh = () => {

        spec.slots.forEach((colorId, index) => {

          const slot = ctx.view.querySelector(`[data-slot="${index}"]`);

          const filled = placed[index];

          slot.classList.toggle("is-filled", Boolean(filled));

          slot.classList.toggle("is-selected", picked === `slot-${index}`);

          if (filled) {

            slot.style.setProperty("--block", colorOf(filled).hex);

            slot.dataset.filled = filled;

          } else {

            slot.removeAttribute("data-filled");

          }

        });



        tray.forEach((colorId, index) => {

          const piece = ctx.view.querySelector(`[data-tray="${index}"]`);

          const used = usedTray.has(index);

          piece.classList.toggle("is-used", used);

          piece.classList.toggle("is-selected", picked === `tray-${index}`);

          piece.disabled = used;

          piece.setAttribute("aria-hidden", used ? "true" : "false");

        });



        if (placed.every((p, i) => p === spec.slots[i])) {

          completePhase(ctx, phaseIndex, totalPhases, runPhase, "Todas as torres de blocos ficaram certinhas!");

        }

      };



      const tryPlace = (slotIndex, trayIndex, colorId) => {
        if (placed[slotIndex]) return;
        const slot = ctx.view.querySelector(`[data-slot="${slotIndex}"]`);
        const fits = spec.slots[slotIndex] === colorId;
        onChoice(ctx, slot, fits, {
          noText: "Esse bloco não encaixa aqui. Tente outro lugar!",
          okText: "Encaixou!",
          onWrong: () => {
            picked = null;
            refresh();
          },
          onCorrect: () => {
            placed[slotIndex] = colorId;
            usedTray.add(trayIndex);
            picked = null;
            refresh();
          },
        });
      };



      ctx.view.querySelectorAll(".block-piece").forEach((piece) => {

        bindPress(

          piece,

          () => {

            if (piece.disabled || piece.classList.contains("is-used") || ctx.won) return;

            const trayIndex = Number(piece.dataset.tray);

            if (picked?.startsWith("slot-")) {

              const slotIndex = Number(picked.replace("slot-", ""));

              tryPlace(slotIndex, trayIndex, tray[trayIndex]);

              return;

            }

            picked = `tray-${trayIndex}`;

            refresh();

          },

          signal,

        );

      });



      ctx.view.querySelectorAll("[data-slot]").forEach((slot) => {

        bindPress(

          slot,

          () => {

            if (ctx.won) return;

            const index = Number(slot.dataset.slot);

            if (picked?.startsWith("tray-")) {

              const trayIndex = Number(picked.replace("tray-", ""));

              tryPlace(index, trayIndex, tray[trayIndex]);

            } else {

              picked = `slot-${index}`;

              refresh();

            }

          },

          signal,

        );

      });



      refresh();

    };



    runPhase(0);

  },

};


