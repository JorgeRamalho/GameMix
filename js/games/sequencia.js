import { bindPress } from "../engine.js";
import { onChoice } from "../lib/gameActions.js";
import { completePhase, phaseBanner, phaseNarrationTip, phaseTotal } from "../lib/phases.js";

const PAD = [
  { id: "a", emoji: "🔴", label: "vermelho" },
  { id: "b", emoji: "🔵", label: "azul" },
  { id: "c", emoji: "🟡", label: "amarelo" },
  { id: "d", emoji: "🟢", label: "verde" },
];

function sequenceLength(phaseIndex) {
  return Math.min(2 + Math.floor(phaseIndex / 2), 6);
}

function buildSequence(length, random) {
  const seq = [];
  for (let i = 0; i < length; i += 1) {
    let pick = PAD[Math.floor(random() * PAD.length)];
    if (seq.length && seq[seq.length - 1] === pick.id) {
      const idx = PAD.findIndex((p) => p.id === pick.id);
      pick = PAD[(idx + 1) % PAD.length];
    }
    seq.push(pick.id);
  }
  return seq;
}

export const sequencia = {
  id: "sequencia",
  title: "Sequência",
  goal: "10 fases — repita a ordem certa",
  mount(ctx) {
    const totalPhases = phaseTotal(ctx);

    const runPhase = (phaseIndex) => {
      const len = ctx.e2e && !ctx.e2eFull ? 2 : sequenceLength(phaseIndex);
      const sequence = ctx.e2e && !ctx.e2eFull ? ["a", "b"] : buildSequence(len, ctx.random);
      phaseNarrationTip(ctx, "Olhe a ordem das cores e repita tocando nos botões.");
      const signal = ctx.beginPhase();
      let step = 0;
      let inputLocked = true;

      ctx.mountPhase(`
        ${phaseBanner(phaseIndex, totalPhases)}
        <section class="seq-board" data-seq-board>
          <p class="catch-line" data-seq-status>Preste atenção…</p>
          <div class="seq-pad" role="group" aria-label="Cores da sequência">
            ${PAD.map(
              (item) =>
                `<button type="button" class="seq-btn" data-seq="${item.id}" aria-label="${item.label}"><span aria-hidden="true">${item.emoji}</span></button>`,
            ).join("")}
          </div>
        </section>
      `);

      const status = ctx.view.querySelector("[data-seq-status]");
      const buttons = new Map(
        [...ctx.view.querySelectorAll("[data-seq]")].map((el) => [el.dataset.seq, el]),
      );

      const flash = (id, on) => {
        const btn = buttons.get(id);
        if (btn) btn.classList.toggle("is-lit", on);
      };

      const playSequence = (index = 0) => {
        if (!ctx.alive || ctx.won) return;
        if (index >= sequence.length) {
          inputLocked = false;
          step = 0;
          if (status) status.textContent = "Sua vez! Repita a ordem.";
          ctx.feedback("Agora você!", "ok");
          return;
        }
        inputLocked = true;
        if (status) status.textContent = `Memorize… ${index + 1} de ${sequence.length}`;
        const id = sequence[index];
        flash(id, true);
        ctx.later(
          () => {
            flash(id, false);
            ctx.later(() => playSequence(index + 1), ctx.e2e ? 40 : 280);
          },
          ctx.e2e ? 120 : 520,
        );
      };

      PAD.forEach((item) => {
        bindPress(
          buttons.get(item.id),
          () => {
            if (inputLocked || ctx.won) return;
            const expected = sequence[step];
            const btn = buttons.get(item.id);
            onChoice(ctx, btn, item.id === expected, {
              okText: "Certo!",
              noText: "Ordem errada. Veja de novo.",
              onCorrect: () => {
                step += 1;
                if (step >= sequence.length) {
                  ctx.feedback("Sequência completa!", "ok");
                  ctx.later(
                    () => completePhase(ctx, phaseIndex, totalPhases, runPhase, "Você memorizou todas as fases!"),
                    ctx.e2e ? 30 : 480,
                  );
                  return;
                }
                if (status) status.textContent = `${step} de ${sequence.length} — continue!`;
              },
              onWrong: () => {
                inputLocked = true;
                step = 0;
                ctx.later(() => playSequence(0), ctx.e2e ? 40 : 700);
              },
            });
          },
          signal,
        );
      });

      ctx.later(() => playSequence(0), ctx.e2e ? 30 : 600);
    };

    runPhase(0);
  },
};
