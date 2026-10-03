/**
 * Simulação arcade Guerra Espacial — lógica pura (testável, sem DOM).
 */

export const LANE_COUNT = 3;

export const SHIELD_DURATION_MS = 5000;
export const SHIELD_USES_PER_PHASE = 5;

/** speed = multiplicador de queda (maior = mais rápido) */
const METEOR_KINDS = {
  boulder: { hp: 2, speed: 0.06, weight: 4, minPhase: 1 },
  ice: { hp: 1, speed: 0.08, weight: 4, minPhase: 2 },
  rock: { hp: 1, speed: 0.14, weight: 6, minPhase: 0 },
  planet: { hp: 2, speed: 0.1, weight: 3, minPhase: 3 },
  comet: { hp: 1, speed: 0.22, weight: 5, minPhase: 1 },
  debris: { hp: 1, speed: 0.26, weight: 4, minPhase: 4 },
  streak: { hp: 1, speed: 0.32, weight: 3, minPhase: 5 },
};

let nextId = 1;
function uid() {
  nextId += 1;
  return nextId;
}

export function createSpaceSim(spec, { e2e, random, phaseIndex = 0, lives = 10 } = {}) {
  return {
    lane: 1,
    lives,
    destroyed: 0,
    goal: spec.goal,
    invuln: 0,
    shield: 0,
    shieldCharges: SHIELD_USES_PER_PHASE,
    fireCooldown: 0,
    lastSpawn: 0,
    meteors: [],
    bullets: [],
    pickups: [],
    shake: 0,
    parallax: 0,
    phaseIndex,
    e2e,
    random,
    spec,
  };
}

function availableKinds(sim) {
  if (sim.e2e) return [{ kind: "rock", w: 1 }];
  const difficulty = sim.spec.difficulty ?? sim.phaseIndex + 1;
  return Object.entries(METEOR_KINDS)
    .filter(([, def]) => def.minPhase <= sim.phaseIndex)
    .map(([kind, def]) => ({ kind, w: def.weight + (difficulty > def.minPhase + 1 ? 1 : 0) }));
}

function pickMeteorKind(sim) {
  const pool = availableKinds(sim);
  if (!pool.length) return "rock";
  let total = 0;
  for (const item of pool) total += item.w;
  let roll = sim.random() * total;
  for (const { kind, w } of pool) {
    roll -= w;
    if (roll <= 0) return kind;
  }
  return pool[0].kind;
}

export function spawnMeteor(sim) {
  const lane = sim.e2e ? 1 : Math.floor(sim.random() * LANE_COUNT);
  const kind = pickMeteorKind(sim);
  const def = METEOR_KINDS[kind] ?? METEOR_KINDS.rock;
  sim.meteors.push({
    id: uid(),
    lane,
    y: -10,
    kind,
    hp: def.hp,
    spin: sim.random() * 360,
  });
}

export function tryFire(sim) {
  const events = [];
  if (sim.fireCooldown > 0) return events;
  sim.fireCooldown = sim.e2e ? 70 : 130;
  events.push({ type: "bullet_fired", lane: sim.lane });

  const bullet = { id: uid(), lane: sim.lane, y: 78 };
  sim.bullets.push(bullet);
  events.push({ type: "bullet_spawn", bullet });

  if (sim.e2e) {
    const hit = sim.meteors.find((m) => m.lane === sim.lane);
    if (hit) {
      events.push(...damageMeteor(sim, hit, bullet));
    }
  }
  return events;
}

/** Renova os 5 usos de escudo (nova fase ou morte na fase). */
export function renewPhaseShield(sim) {
  sim.shieldCharges = SHIELD_USES_PER_PHASE;
  sim.shield = 0;
}

export function tryActivateShield(sim) {
  const events = [];
  if (sim.shield > 0) {
    events.push({ type: "shield_denied", reason: "active" });
    return events;
  }
  if (sim.shieldCharges <= 0) {
    events.push({ type: "shield_denied", reason: "empty" });
    return events;
  }
  sim.shieldCharges -= 1;
  sim.shield = SHIELD_DURATION_MS;
  events.push({
    type: "shield_activated",
    chargesLeft: sim.shieldCharges,
  });
  return events;
}

function damageMeteor(sim, meteor, bullet) {
  const events = [];
  const bulletIndex = sim.bullets.indexOf(bullet);
  if (bulletIndex >= 0) sim.bullets.splice(bulletIndex, 1);
  events.push({ type: "bullet_removed", id: bullet.id });

  meteor.hp -= 1;
  if (meteor.hp > 0) {
    events.push({ type: "meteor_hit", meteor, lane: meteor.lane, y: meteor.y, kind: meteor.kind });
    return events;
  }

  const idx = sim.meteors.indexOf(meteor);
  if (idx >= 0) sim.meteors.splice(idx, 1);
  sim.destroyed += 1;
  events.push({
    type: "meteor_destroyed",
    id: meteor.id,
    lane: meteor.lane,
    y: meteor.y,
    kind: meteor.kind,
  });

  if (!sim.e2e && sim.random() < 0.04 && sim.pickups.length < 1) {
    const pickup = { id: uid(), lane: meteor.lane, y: meteor.y, kind: "shield" };
    sim.pickups.push(pickup);
    events.push({ type: "pickup_spawn", pickup });
  }
  return events;
}

function collideBullets(sim) {
  const events = [];
  for (const bullet of [...sim.bullets]) {
    bullet.y -= sim.spec.speed * (sim.e2e ? 0.32 : 0.38);
    if (bullet.y < 4) {
      sim.bullets = sim.bullets.filter((b) => b.id !== bullet.id);
      events.push({ type: "bullet_removed", id: bullet.id });
      continue;
    }
    for (const meteor of [...sim.meteors]) {
      if (meteor.lane !== bullet.lane) continue;
      const hitbox = meteor.kind === "boulder" || meteor.kind === "planet" ? 12 : 10;
      if (bullet.y > meteor.y + hitbox || bullet.y < meteor.y - hitbox) continue;
      events.push(...damageMeteor(sim, meteor, bullet));
      break;
    }
  }
  return events;
}

function collidePlayer(sim) {
  const events = [];
  for (const meteor of [...sim.meteors]) {
    const def = METEOR_KINDS[meteor.kind] ?? METEOR_KINDS.rock;
    meteor.y += sim.spec.speed * def.speed;
    meteor.spin += def.speed * 40;

    if (meteor.y > 95) {
      sim.meteors = sim.meteors.filter((m) => m.id !== meteor.id);
      events.push({ type: "meteor_escaped", id: meteor.id });
      continue;
    }

    if (meteor.y < 68 || meteor.y > 86) continue;
    if (meteor.lane !== sim.lane) continue;
    if (sim.invuln > 0) continue;

    sim.meteors = sim.meteors.filter((m) => m.id !== meteor.id);
    events.push({ type: "meteor_escaped", id: meteor.id });

    if (sim.shield > 0) {
      sim.shield = 0;
      sim.invuln = sim.e2e ? 400 : 1000;
      sim.shake = 8;
      events.push({ type: "shield_break" });
      continue;
    }

    events.push({ type: "player_hit" });
  }
  return events;
}

function movePickups(sim) {
  const events = [];
  for (const pickup of [...sim.pickups]) {
    pickup.y += sim.spec.speed * 0.09;
    if (pickup.y > 92) {
      sim.pickups = sim.pickups.filter((p) => p.id !== pickup.id);
      events.push({ type: "pickup_removed", id: pickup.id });
      continue;
    }
    if (pickup.y < 72 || pickup.y > 88) continue;
    if (pickup.lane !== sim.lane) continue;
    sim.pickups = sim.pickups.filter((p) => p.id !== pickup.id);
    events.push({ type: "pickup_removed", id: pickup.id });
    if (pickup.kind === "shield" && sim.shieldCharges < SHIELD_USES_PER_PHASE) {
      sim.shieldCharges += 1;
      events.push({ type: "shield_charge_gain", charges: sim.shieldCharges });
    }
  }
  return events;
}

export function stepSpaceSim(sim, time, dtMs = 16) {
  const events = [];
  if (sim.fireCooldown > 0) sim.fireCooldown = Math.max(0, sim.fireCooldown - dtMs);
  if (sim.invuln > 0) sim.invuln = Math.max(0, sim.invuln - dtMs);
  if (sim.shield > 0) {
    sim.shield = Math.max(0, sim.shield - dtMs);
  }
  if (sim.shake > 0) sim.shake = Math.max(0, sim.shake - dtMs * 0.08);

  sim.parallax = (sim.parallax + dtMs * 0.02 * sim.spec.speed) % 1000;

  if (time - sim.lastSpawn > sim.spec.spawnMs) {
    sim.lastSpawn = time;
    spawnMeteor(sim);
    const meteor = sim.meteors[sim.meteors.length - 1];
    if (meteor) events.push({ type: "meteor_spawn", meteor });
  }

  events.push(...collideBullets(sim));
  events.push(...collidePlayer(sim));
  events.push(...movePickups(sim));

  return events;
}

export function setSimLane(sim, lane) {
  sim.lane = Math.max(0, Math.min(LANE_COUNT - 1, lane));
}

export function meteorKindDef(kind) {
  return METEOR_KINDS[kind] ?? METEOR_KINDS.rock;
}
