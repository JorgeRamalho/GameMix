import { shuffle } from "../engine.js";
import { completePhase, phaseBanner, phaseTotal } from "../lib/phases.js";
import { pickUnique, rotateList } from "../lib/playVariety.js";
import { PUZZLE_LABELS, PUZZLE_ORDER, PUZZLE_SCENES } from "./quebra-scenes.js";

const QUEBRA_PHASE_COUNT = 10;

function puzzleSpecs(ctx, totalPhases) {
  if (ctx.e2e && !ctx.e2eFull) {
    return [{ sceneId: "campo" }];
  }
  const pool = rotateList(PUZZLE_ORDER, ctx.runIndex);
  const picked = pickUnique(pool, totalPhases, ctx.random);
  return picked.map((sceneId) => ({ sceneId }));
}

function initialSlots(ctx, phaseIndex) {
  if (ctx.e2e && !ctx.e2eFull && phaseIndex === 0) return [1, 3, 0, 2];
  let slots = shuffle([0, 1, 2, 3], ctx.random);
  if (slots.every((piece, index) => piece === index)) slots = [2, 0, 3, 1];
  return slots;
}

export const quebra = {
  id: "quebra",
  title: "Quebra-cabeça",
  goal: "Montar 10 desenhos diferentes",
  mount(ctx) {
    const totalPhases = phaseTotal(ctx, QUEBRA_PHASE_COUNT);
    const specs = puzzleSpecs(ctx, totalPhases);

    const runPhase = (phaseIndex) => {
      const signal = ctx.beginPhase();
      const spec = specs[phaseIndex];
      let slots = initialSlots(ctx, phaseIndex);
      let selected = null;
      const sceneSvg = PUZZLE_SCENES[spec.sceneId] ?? PUZZLE_SCENES.campo;
      const sceneLabel = PUZZLE_LABELS[spec.sceneId] ?? "Desenho";
      const background = `url("data:image/svg+xml,${encodeURIComponent(sceneSvg)}")`;

      ctx.mountPhase(`
        ${phaseBanner(phaseIndex, totalPhases)}
        <p class="catch-line">Desenho: ${sceneLabel}</p>
        <p class="hint">Toque duas partes para trocar de lugar.</p>
        <div class="puzzle puzzle-board" data-puzzle>
          ${[0, 1, 2, 3]
            .map(
              (slot) =>
                `<button type="button" class="piece" data-slot="${slot}" data-piece="${slots[slot]}" aria-label="Parte do desenho ${sceneLabel}"></button>`,
            )
            .join("")}
        </div>
      `);

      ctx.view.querySelectorAll(".piece").forEach((piece) => {
        piece.style.backgroundImage = background;
      });

      const render = (check) => {
        slots.forEach((piece, index) => {
          const element = ctx.view.querySelector(`[data-slot="${index}"]`);
          element.dataset.piece = String(piece);
          element.classList.toggle("is-selected", selected === index);
        });
        if (check && slots.every((piece, index) => piece === index)) {
          completePhase(
            ctx,
            phaseIndex,
            totalPhases,
            runPhase,
            "Você montou os 10 quebra-cabeças! Que artista!",
          );
        }
      };

      const swap = (from, to) => {
        const nextFrom = slots[to];
        const nextTo = slots[from];
        slots[from] = nextFrom;
        slots[to] = nextTo;
        selected = null;
        render(true);
      };

      const tap = (slot) => {
        if (!ctx.alive || ctx.won) return;
        if (selected === null) {
          selected = slot;
          render(false);
          return;
        }
        if (selected === slot) {
          selected = null;
          render(false);
          return;
        }
        swap(selected, slot);
        ctx.feedback("Peças trocadas!", "ok");
      };

      ctx.view.querySelectorAll(".piece").forEach((element) => {
        element.addEventListener(
          "pointerdown",
          (event) => {
            if (ctx.won || event.button !== 0) return;
            const slot = Number(element.dataset.slot);
            const startX = event.clientX;
            const startY = event.clientY;
            let moved = false;
            try {
              element.setPointerCapture(event.pointerId);
            } catch {
              /* o toque segue sem captura */
            }
            const move = (ev) => {
              if (Math.hypot(ev.clientX - startX, ev.clientY - startY) > 14) moved = true;
            };
            const up = (ev) => {
              element.removeEventListener("pointermove", move);
              element.removeEventListener("pointerup", up);
              if (!ctx.alive || ctx.won) return;
              if (moved) {
                const hit = document.elementFromPoint(ev.clientX, ev.clientY);
                const target = hit?.closest?.("[data-slot]");
                if (target && target !== element) {
                  swap(slot, Number(target.dataset.slot));
                  ctx.feedback("Peças trocadas!", "ok");
                  return;
                }
              }
              tap(slot);
            };
            element.addEventListener("pointermove", move);
            element.addEventListener("pointerup", up);
          },
          { signal },
        );

        element.addEventListener(
          "keydown",
          (event) => {
            if (event.key !== "Enter" && event.key !== " ") return;
            event.preventDefault();
            tap(Number(element.dataset.slot));
          },
          { signal },
        );
      });

      render(false);
    };

    runPhase(0);
  },
};
