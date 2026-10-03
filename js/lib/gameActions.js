/**
 * Ações de jogo reutilizáveis — acerto, erro e conclusão com feedback consistente.
 */

export function onChoice(ctx, button, isCorrect, { onCorrect, onWrong, okText, noText } = {}) {
  if (!ctx.alive || ctx.won) return;
  if (isCorrect) {
    ctx.markSuccess(button);
    button.classList.add("is-right");
    const streak = ctx.stats?.recordHit() ?? 0;
    ctx.updateStreak?.();
    if (onCorrect) onCorrect(streak);
    else {
      const msg =
        okText ?? (streak >= 3 ? `Muito bem! ${streak} seguidos!` : streak >= 2 ? "Dois seguidos!" : "Isso mesmo!");
      ctx.feedback(msg, "ok");
    }
    return;
  }
  ctx.stats?.reset();
  ctx.updateStreak?.();
  ctx.markError(button);
  if (onWrong) onWrong();
  else ctx.feedback(noText ?? "Tenta de novo!", "no");
}
