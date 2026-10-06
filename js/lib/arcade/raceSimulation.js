/**
 * Simulação arcade Corrida — lógica pura (sem DOM).
 */

export const LANE_COUNT = 3;

/** Obstáculos que caem na pista (mesma colisão que o cone). */
export const RACE_OBSTACLES = ["cone", "fire"];

/** Faixa vertical alinhada ao carro (parte inferior da pista). */
export const HIT_Y_MIN = 74;
export const HIT_Y_MAX = 92;

const FALL_RATE = 0.12;

let nextId = 1;
function uid() {
  nextId += 1;
  return nextId;
}

/** Multiplicador mínimo/máximo de velocidade (painel + queda dos objetos). */
export const SPEED_MUL_MIN = 0.62;
export const SPEED_MUL_MAX = 1.48;

export function createRaceSim(spec, { e2e, random } = {}) {
  return {
    lane: 1,
    lives: 3,
    score: 0,
    goal: spec.goal,
    invuln: 0,
    lastSpawn: 0,
    entities: [],
    speedMul: 1,
    e2e: Boolean(e2e),
    random: random ?? Math.random,
    spec,
  };
}

export function baseSpeedKmh(spec) {
  return 36 + spec.speed * 34;
}

export function displaySpeedKmh(sim) {
  return Math.min(199, Math.max(24, Math.round(baseSpeedKmh(sim.spec) * sim.speedMul)));
}

export function boostSpeedOnStar(sim) {
  sim.speedMul = Math.min(SPEED_MUL_MAX, sim.speedMul + 0.085);
}

export function brakeSpeedOnObstacle(sim, kind = "cone") {
  const cut = kind === "fire" ? 0.14 : 0.12;
  sim.speedMul = Math.max(SPEED_MUL_MIN, sim.speedMul - cut);
}

/** @deprecated use brakeSpeedOnObstacle */
export function brakeSpeedOnCone(sim) {
  brakeSpeedOnObstacle(sim, "cone");
}

/** Volta suavemente para a velocidade base entre contatos. */
export function easeSpeedTowardBase(sim, dtMs) {
  const target = 1;
  const t = Math.min(1, (dtMs / 1000) * 0.55);
  sim.speedMul += (target - sim.speedMul) * t;
}

export function setRaceLane(sim, lane) {
  sim.lane = Math.max(0, Math.min(LANE_COUNT - 1, lane));
}

export function tryMoveRaceLane(sim, delta) {
  const before = sim.lane;
  setRaceLane(sim, before + delta);
  return sim.lane !== before;
}

function pickSpawnLane(sim) {
  if (sim.e2e) return sim.lane;
  return Math.floor(sim.random() * LANE_COUNT);
}

/** @returns {'star' | 'cone' | 'fire'} */
function pickEntityKind(sim) {
  if (sim.e2e) return "star";
  if (sim.random() > sim.spec.obstacleRate) return "star";
  /* Entre obstáculos: cone ou fogo — os dois descem na pista igual ao cone. */
  const fireShare = sim.spec.fireShare ?? 0.5;
  return sim.random() < fireShare ? "fire" : "cone";
}

export function isRaceObstacle(kind) {
  return kind === "cone" || kind === "fire";
}

export function spawnRaceEntity(sim) {
  const lane = pickSpawnLane(sim);
  const kind = pickEntityKind(sim);
  const entity = {
    id: uid(),
    lane,
    y: -12,
    kind,
    star: kind === "star",
  };
  sim.entities.push(entity);
  return entity;
}

/**
 * @returns {{ type: string, entity?: object, id?: number }[]}
 */
export function stepRaceSim(sim, time, dtMs = 16) {
  const events = [];
  const spec = sim.spec;
  easeSpeedTowardBase(sim, dtMs);

  const dt = spec.speed * sim.speedMul * (sim.e2e ? 1.2 : 1);

  if (sim.invuln > 0) {
    sim.invuln = Math.max(0, sim.invuln - dtMs);
  }

  if (time - sim.lastSpawn > spec.spawnMs) {
    sim.lastSpawn = time;
    const entity = spawnRaceEntity(sim);
    events.push({ type: "entity_spawn", entity });
  }

  for (const entity of [...sim.entities]) {
    entity.y += dt * FALL_RATE;

    if (entity.y > 96) {
      sim.entities = sim.entities.filter((e) => e.id !== entity.id);
      events.push({ type: "entity_removed", id: entity.id });
      continue;
    }

    if (entity.y < HIT_Y_MIN || entity.y > HIT_Y_MAX) continue;
    if (entity.lane !== sim.lane) continue;

    sim.entities = sim.entities.filter((e) => e.id !== entity.id);
    events.push({ type: "entity_removed", id: entity.id });

    const kind = entity.kind ?? (entity.star ? "star" : "cone");
    if (kind === "star") {
      events.push({ type: "star_hit", entity });
    } else if (sim.invuln <= 0) {
      events.push({ type: "obstacle_hit", entity });
    }
  }

  return events;
}
