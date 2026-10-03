export const LEVEL_NAMES = ["Fácil", "Médio", "Difícil"];

export function levelName(phaseIndex) {
  return LEVEL_NAMES[phaseIndex] ?? `Nível ${phaseIndex + 1}`;
}
