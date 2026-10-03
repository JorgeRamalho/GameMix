/** Campanha Guerra Espacial — 7 fases com dificuldade crescente. */

export const SPACE_PHASE_COUNT = 7;
export const SPACE_START_LIVES = 10;

export const SPACE_LEVEL_NAMES = [
  "Órbita calma",
  "Campo de rochas",
  "Cometas rápidos",
  "Gigantes lentos",
  "Rajada veloz",
  "Tempestade",
  "Coroa estelar",
];

export function spaceLevelName(phaseIndex) {
  return SPACE_LEVEL_NAMES[phaseIndex] ?? `Fase ${phaseIndex + 1}`;
}

/**
 * @param {number} phaseIndex 0..6
 */
export function buildSpacePhaseSpec(phaseIndex) {
  const level = phaseIndex + 1;
  return {
    goal: 3 + Math.min(phaseIndex, 4) + Math.floor(phaseIndex / 3),
    speed: 1.08 + phaseIndex * 0.11,
    spawnMs: Math.max(620, 1750 - phaseIndex * 155),
    difficulty: level,
    phaseIndex,
  };
}

export function spacePhaseBanner(phaseIndex, total) {
  const name = spaceLevelName(phaseIndex);
  const level = phaseIndex + 1;
  const pct = Math.round(((phaseIndex + 1) / total) * 100);
  return `
    <header class="gx-phase-head" data-phase-bar>
      <p class="phase-line">
        <span class="phase-badge">Fase ${phaseIndex + 1} de ${total}</span>
        <span class="phase-level">${name}</span>
        <span class="space-diff-badge" aria-label="Dificuldade ${level}">Nv ${level}</span>
      </p>
      <div class="gx-progress" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${pct}" aria-label="Progresso no jogo">
        <span class="gx-progress-fill" style="width:${pct}%"></span>
      </div>
      <p class="gx-streak" data-streak aria-live="polite">⭐ Vamos!</p>
    </header>`;
}
