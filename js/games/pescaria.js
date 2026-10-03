import { art } from "../art.js";
import { bindPress } from "../engine.js";
import { completePhase, GAME_PHASE_COUNT, phaseBanner, phaseTotal } from "../lib/phases.js";

const PHASES = Array.from({ length: GAME_PHASE_COUNT }, (_, phaseIndex) => ({
  fish: 3 + phaseIndex,
  speed: 0.75 + phaseIndex * 0.12,
  bob: Math.max(200, 420 - phaseIndex * 22),
}));

export const pescaria = {
  id: "pescaria",
  title: "Pescaria",
  goal: "Atenção e coordenação",
  mount(ctx) {
    const totalPhases = phaseTotal(ctx);
    const specs = PHASES.slice(0, totalPhases);

    const runPhase = (phaseIndex) => {
      const signal = ctx.beginPhase();
      const spec = specs[phaseIndex];
      let caught = 0;

      ctx.mountPhase( `
        ${phaseBanner(phaseIndex, totalPhases)}
        <p class="catch-line" data-caught>0 de ${spec.fish} peixes</p>
        <div class="pond" data-pond>
          ${Array.from({ length: spec.fish }, (_, index) => `
            <button type="button" class="fish" data-fish="${index + 1}" aria-label="Peixe ${index + 1}">
              ${art.fish}
            </button>
          `).join("")}
        </div>
      `);

      const pond = ctx.view.querySelector("[data-pond]");
      const counter = ctx.view.querySelector("[data-caught]");
      const fishes = [...ctx.view.querySelectorAll("[data-fish]")].map((element, index) => ({
        element,
        caught: false,
        x: -120 - index * 55,
        speed: spec.speed + index * 0.12,
        phase: index * 1.3,
        top: 6 + (index % 4) * 18,
      }));

      if (!ctx.e2e) {
        for (const fish of fishes) {
          fish.element.style.top = `${fish.top}%`;
        }
      }

      const catchFish = (fish) => {
        if (fish.caught || !ctx.alive || ctx.won) return;
        fish.caught = true;
        fish.element.classList.add("is-caught");
        fish.element.disabled = true;
        caught += 1;
        counter.textContent = `${caught} de ${spec.fish} peixes`;
        ctx.markSuccess(fish.element);
        const streak = ctx.stats.recordHit();
        ctx.updateStreak();
        ctx.feedback(
          caught === spec.fish ? "Cesto cheio!" : streak >= 2 ? `Pegou! ${streak} seguidos!` : "Pegou!",
          "ok",
        );
        if (caught === spec.fish) {
          completePhase(ctx, phaseIndex, totalPhases, runPhase, "Você pescou em todas as fases!");
        }
      };

      for (const fish of fishes) {
        bindPress(fish.element, () => catchFish(fish), signal);
      }

      ctx.onTick((time) => {
        if (!ctx.alive || ctx.e2e) return;
        const width = pond.clientWidth;
        if (!width) return;
        for (const fish of fishes) {
          if (fish.caught) continue;
          fish.x += fish.speed;
          if (fish.x > width + 30) fish.x = -110;
          const bob = Math.sin(time / spec.bob + fish.phase) * 7;
          fish.element.style.transform = `translate3d(${fish.x}px, ${bob}px, 0)`;
        }
      });
    };

    runPhase(0);
  },
};
