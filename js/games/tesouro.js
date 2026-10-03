import { art } from "../art.js";
import { bindPress, shuffle } from "../engine.js";
import { completePhase, GAME_PHASE_COUNT, phaseBanner, phaseTotal } from "../lib/phases.js";
import { pickUnique } from "../lib/playVariety.js";

const PLACES = [
  { id: "palmeira", name: "Palmeira", art: "palm" },
  { id: "pedra", name: "Pedra", art: "rock" },
  { id: "bau", name: "Baú", art: "chest" },
  { id: "areia", name: "Areia", art: "sand" },
  { id: "onda", name: "Onda", art: "wave" },
  { id: "flor", name: "Flor", art: "flowerRed" },
];

const PHASES = Array.from({ length: GAME_PHASE_COUNT }, (_, phaseIndex) => ({
  spots: Math.min(4 + Math.floor(phaseIndex / 2), PLACES.length),
  treasures: Math.min(2 + Math.floor(phaseIndex / 2), 5),
}));

function buildFlags(treasures, spots, random, e2e) {
  if (e2e) return [true, false, true, false];
  const flags = Array.from({ length: spots }, () => false);
  const indices = shuffle([...Array(spots).keys()], random);
  for (let index = 0; index < treasures; index += 1) {
    flags[indices[index]] = true;
  }
  return flags;
}

export const tesouro = {
  id: "tesouro",
  title: "Caça ao tesouro",
  goal: "Observar e encontrar",
  mount(ctx) {
    const totalPhases = phaseTotal(ctx);
    const specs = PHASES.slice(0, totalPhases);

    const runPhase = (phaseIndex) => {
      const signal = ctx.beginPhase();
      const spec = specs[phaseIndex];
      const places = ctx.e2e
        ? PLACES.slice(0, spec.spots)
        : pickUnique(PLACES, spec.spots, ctx.random);
      const flags = buildFlags(spec.treasures, spec.spots, ctx.random, ctx.e2e && phaseIndex === 0);
      let found = 0;

      ctx.mountPhase( `
        ${phaseBanner(phaseIndex, totalPhases)}
        <div class="island-map">
          <p class="catch-line" data-caught>0 de ${spec.treasures} tesouros</p>
          <div class="island ${spec.spots > 4 ? "island-dense" : ""}">
            ${places
              .map(
                (place, index) => `
              <button type="button" class="spot" data-spot="${place.id}" data-treasure="${flags[index] ? "1" : "0"}">
                <span class="spot-art">${art[place.art]}</span>
                <span class="spot-name">${place.name}</span>
              </button>
            `,
              )
              .join("")}
          </div>
        </div>
      `);

      const counter = ctx.view.querySelector("[data-caught]");

      ctx.view.querySelectorAll("[data-spot]").forEach((button) => {
        bindPress(
          button,
          () => {
            if (ctx.won || button.dataset.open === "1") return;
            button.dataset.open = "1";
            button.classList.add("is-open");
            const treasure = button.dataset.treasure === "1";
            const artSlot = button.querySelector(".spot-art");
            const name = button.querySelector(".spot-name");
            if (treasure) {
              found += 1;
              if (artSlot) artSlot.innerHTML = art.coin;
              if (name) name.textContent = "Tesouro!";
              counter.textContent = `${found} de ${spec.treasures} tesouros`;
              ctx.markSuccess(button);
              const streak = ctx.stats.recordHit();
              ctx.updateStreak();
              ctx.feedback(streak >= 2 ? `Tesouro! ${streak} seguidos!` : "Achou um tesouro!", "ok");
              if (found === spec.treasures) {
                completePhase(ctx, phaseIndex, totalPhases, runPhase, "A ilha revelou todos os tesouros!");
              }
              return;
            }
            if (artSlot) artSlot.innerHTML = art.shell;
            if (name) name.textContent = "Vazio";
            ctx.stats.reset();
            ctx.updateStreak();
            ctx.markError(button);
            ctx.feedback("Hmm, aqui não tem. Continua procurando!", "no");
          },
          signal,
        );
      });
    };

    runPhase(0);
  },
};
