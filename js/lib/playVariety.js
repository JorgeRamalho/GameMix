/** Semente estável por jogo + número da partida (0 = primeira, 1 = “Brincar de novo”, …). */
export function hashSeed(gameId, runIndex, base = 0) {
  let h = (base >>> 0) ^ 0x9e3779b9;
  const id = String(gameId ?? "game");
  for (let i = 0; i < id.length; i += 1) {
    h = Math.imul(h ^ id.charCodeAt(i), 0x01000193) >>> 0;
  }
  return (h + Math.imul(runIndex >>> 0, 0x85ebca6b)) >>> 0;
}

/** Gira a lista para a partida não começar sempre no mesmo item. */
export function rotateList(list, offset) {
  if (!list.length) return [];
  const n = ((offset % list.length) + list.length) % list.length;
  return [...list.slice(n), ...list.slice(0, n)];
}

function shuffleWith(list, random) {
  const next = [...list];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    const tmp = next[i];
    next[i] = next[j];
    next[j] = tmp;
  }
  return next;
}

/** Escolhe `count` itens diferentes do pool (baralho novo a cada partida/fase). */
export function pickUnique(pool, count, random) {
  return shuffleWith(pool, random).slice(0, Math.min(count, pool.length));
}
