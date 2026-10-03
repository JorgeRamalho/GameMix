import { phaseTransitionOut } from "./gameExperience.js";
import { levelName, LEVEL_NAMES } from "./levels.js";
import { phaseStartLine } from "./narrator.js";

export { LEVEL_NAMES, levelName };

/** Número padrão de fases na campanha de cada jogo. */
export const GAME_PHASE_COUNT = 10;

export function phaseTotal(ctx, normal = GAME_PHASE_COUNT) {
  if (ctx.e2e && !ctx.e2eFull) return 1;
  return normal;
}

export function phaseBanner(phaseIndex, total) {
  const name = levelName(phaseIndex);
  const pct = Math.round(((phaseIndex + 1) / total) * 100);
  return `
    <header class="gx-phase-head" data-phase-bar>
      <p class="phase-line">
        <span class="phase-badge">Fase ${phaseIndex + 1} de ${total}</span>
        <span class="phase-level">${name}</span>
      </p>
      <div class="gx-progress" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${pct}" aria-label="Progresso no jogo">
        <span class="gx-progress-fill" style="width:${pct}%"></span>
      </div>
      <p class="gx-streak" data-streak aria-live="polite">⭐ Vamos!</p>
    </header>`;
}

/**
 * Encerra a fase atual e avança ou finaliza o jogo.
 */
export function completePhase(ctx, phaseIndex, total, runPhase, winMessage) {
  if (phaseIndex >= total - 1) {
    ctx.win(winMessage);
    return;
  }
  const next = levelName(phaseIndex + 1);
  ctx.feedback(`Fase ${phaseIndex + 1} feita! Agora: ${next}.`, "ok");
  ctx.later(() => {
    if (!ctx.alive || ctx.won) return;
    ctx.narrate?.(phaseStartLine(phaseIndex + 1, total, ctx._phaseNarrationTip));
    ctx._phaseNarrationTip = "";
    phaseTransitionOut(ctx, () => runPhase(phaseIndex + 1));
  }, ctx.e2e ? 40 : 900);
}

/** Dica falada ao começar a fase (chamar no início de runPhase). */
export function phaseNarrationTip(ctx, tip) {
  ctx._phaseNarrationTip = tip ?? "";
}
