/**
 * Camada de experiência: fluxo de fase, feedback tátil, animações acessíveis.
 * Inspirado em padrões de jogos casuais mobile (toque, ritmo, recompensa imediata).
 */

export function prefersReducedMotion() {
  if (typeof matchMedia === "undefined") return false;
  return matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Vibração leve (Android); ignorada em desktop e e2e. */
export function haptic(kind = "light") {
  if (typeof navigator === "undefined" || typeof navigator.vibrate !== "function") return;
  const patterns = {
    light: 10,
    ok: [12, 36, 14],
    no: [22, 28, 22],
    win: [10, 24, 10, 24, 16],
    phase: [8, 20, 8],
  };
  const pattern = patterns[kind] ?? patterns.light;
  try {
    navigator.vibrate(pattern);
  } catch {
    /* sem permissão */
  }
}

export function afterPhaseRender(ctx) {
  if (!ctx?.view || !ctx.alive || ctx.won) return;
  ctx.view.classList.remove("gx-phase-out");
  if (ctx.e2e || prefersReducedMotion()) return;
  ctx.view.classList.add("gx-phase-in");
  ctx.later(() => {
    if (ctx.alive) ctx.view.classList.remove("gx-phase-in");
  }, 420);
}

export function phaseTransitionOut(ctx, next) {
  if (!ctx.alive || ctx.won) return;
  if (ctx.e2e || prefersReducedMotion()) {
    next();
    return;
  }
  haptic("phase");
  ctx.view.classList.add("gx-phase-out");
  ctx.later(() => {
    if (!ctx.alive || ctx.won) return;
    next();
  }, 280);
}

export function markSuccess(element) {
  if (!element) return;
  element.classList.add("gx-hit-ok");
  window.setTimeout(() => element.classList.remove("gx-hit-ok"), 450);
}

export function markError(element) {
  if (!element) return;
  element.classList.add("is-shake", "gx-hit-no");
  window.setTimeout(() => {
    element.classList.remove("is-shake", "gx-hit-no");
  }, 380);
}

export function mountPhase(ctx, html) {
  ctx.view.innerHTML = html;
  afterPhaseRender(ctx);
}

export function streakLabel(streak, idle = "⭐ Vamos!") {
  if (streak >= 4) return `🔥 ${streak} seguidos — incrível!`;
  if (streak >= 2) return `🔥 ${streak} seguidos`;
  if (streak === 1) return "⭐ Primeiro acerto!";
  return idle;
}

export function createRunStats() {
  return {
    streak: 0,
    best: 0,
    recordHit() {
      this.streak += 1;
      if (this.streak > this.best) this.best = this.streak;
      return this.streak;
    },
    reset() {
      this.streak = 0;
    },
  };
}

export function updateStreakDisplay(ctx, idle) {
  const el = ctx.view?.querySelector("[data-streak]");
  if (!el || !ctx.stats) return;
  el.textContent = streakLabel(ctx.stats.streak, idle);
  el.classList.toggle("is-hot", ctx.stats.streak >= 2);
}
