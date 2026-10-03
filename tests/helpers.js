import { expect, test } from "@playwright/test";

/** Fases da campanha (espelha `GAME_PHASE_COUNT` no app). */
export const CAMPAIGN_PHASES = 10;

export async function openHome(page, { fullPhases = false } = {}) {
  const query = fullPhases ? "/?e2e=1&e2eFull=1" : "/?e2e=1";
  await page.goto(query);
  await expect(page.getByRole("heading", { level: 1, name: "GameKids" })).toBeVisible();
}

export async function openGame(page, name, { fullPhases = false } = {}) {
  await openHome(page, { fullPhases });
  await page.getByRole("link", { name: new RegExp(name, "i") }).click();
  await expect(page.locator(".game-shell")).toBeVisible();
}

/** Responde certo em cada rodada até aparecer a vitória (animais, etc.). */
export async function winByCorrectChoices(page, { maxSteps = 40 } = {}) {
  for (let step = 0; step < maxSteps; step += 1) {
    if (await page.locator("[data-result=win]").isVisible()) return;
    const correct = page.locator('[data-correct="true"]');
    if ((await correct.count()) === 0) break;
    await correct.first().click();
    await page.waitForTimeout(50);
  }
  await expect(page.locator("[data-result=win]")).toBeVisible();
}

export async function answerMathPhases(page, phases = CAMPAIGN_PHASES) {
  for (let phase = 0; phase < phases; phase += 1) {
    const board = page.locator("[data-answer]");
    const answer = await board.getAttribute("data-answer");
    await page.getByRole("button", { name: answer, exact: true }).click();
    await page.waitForTimeout(60);
  }
}

export async function mixColorsInPot(page, firstLabel, secondLabel) {
  await page.getByRole("button", { name: firstLabel }).click();
  await page.getByRole("button", { name: "Primeiro potinho" }).click();
  await page.getByRole("button", { name: secondLabel }).click();
  await page.getByRole("button", { name: "Segundo potinho" }).click();
  await page.waitForTimeout(650);
}

async function tapSvgRegion(locator) {
  await locator.evaluate((element) => {
    const pointerId = 42;
    element.dispatchEvent(
      new PointerEvent("pointerdown", { bubbles: true, cancelable: true, pointerId, button: 0 }),
    );
    element.dispatchEvent(
      new PointerEvent("pointerup", { bubbles: true, cancelable: true, pointerId, button: 0 }),
    );
  });
}

export async function paintRegions(page, regionIds) {
  for (const region of regionIds) {
    const parts = page.locator(`[data-color-stage] [data-region="${region}"]`);
    const count = await parts.count();
    for (let index = 0; index < count; index += 1) {
      await tapSvgRegion(parts.nth(index));
    }
  }
}

/** Regiões obrigatórias por desenho (espelha `COLORIR_CAMPAIGN` no jogo). */
const COLORIR_SCENE_REGIONS = {
  borboleta: ["asa-esquerda", "asa-direita"],
  casa: ["telhado", "parede", "porta"],
  peixe: ["corpo", "cauda", "barbatana"],
  balao: ["balao", "cesta"],
  sol: ["sol", "nuvem"],
  lua: ["ceu", "lua"],
  carro: ["carroceria", "capota", "janela"],
  barco: ["casco", "vela", "mastro"],
  estrela: ["fundo", "estrela"],
  flor: ["petala-n", "petala-s", "centro", "caule"],
};

/** Encaixa todos os blocos da fase atual (para quando o jogo tem várias fases). */
export async function completeColorirPhase(page) {
  const hint = await page.locator("[data-hint]").textContent();
  const needsMix = hint?.includes("Misture");
  const sceneId = await page.locator("[data-color-stage]").getAttribute("data-scene");
  if (needsMix) {
    await mixColorsInPot(page, "Amarelo", "Azul");
  } else {
    await page.locator('[data-ink="vermelho"]').click();
    await page.waitForTimeout(200);
  }
  const regionIds = COLORIR_SCENE_REGIONS[sceneId ?? ""] ?? [];
  await paintRegions(page, regionIds);
  await page.waitForTimeout(700);
}

export async function winMemoriaCurrentPhase(page) {
  const cards = page.locator("[data-card]");
  const pairs = await cards.evaluateAll((nodes) => nodes.map((node) => node.dataset.pair));
  const used = new Set();
  for (let index = 0; index < pairs.length; index += 1) {
    if (used.has(index)) continue;
    const match = pairs.findIndex(
      (pair, pairIndex) => pairIndex !== index && pair === pairs[index] && !used.has(pairIndex),
    );
    used.add(index);
    used.add(match);
    await cards.nth(index).click();
    await cards.nth(match).click();
    await page.waitForTimeout(40);
  }
}

export async function waitNextPhase(page, currentPhase, totalPhases) {
  if (currentPhase >= totalPhases - 1) return;
  await expect(page.locator("[data-phase-bar]")).toContainText(`Fase ${currentPhase + 2} de ${totalPhases}`, {
    timeout: 15000,
  });
}

export async function winMemoriaPhases(page, phases = CAMPAIGN_PHASES) {
  for (let phase = 0; phase < phases; phase += 1) {
    await expect(page.locator("[data-phase-bar]")).toContainText(`Fase ${phase + 1} de ${phases}`);
    await winMemoriaCurrentPhase(page);
    await waitNextPhase(page, phase, phases);
  }
}

export async function winPescariaPhases(page, phases = CAMPAIGN_PHASES) {
  for (let phase = 0; phase < phases; phase += 1) {
    await expect(page.locator("[data-phase-bar]")).toContainText(`Fase ${phase + 1} de ${phases}`);
    const fishes = page.locator("[data-fish]");
    const total = await fishes.count();
    for (let index = 0; index < total; index += 1) {
      await fishes.nth(index).click();
    }
    await waitNextPhase(page, phase, phases);
  }
}

export async function winErrosPhases(page, phases = CAMPAIGN_PHASES) {
  for (let phase = 0; phase < phases; phase += 1) {
    await expect(page.locator("[data-phase-bar]")).toContainText(`Fase ${phase + 1} de ${phases}`);
    const diffs = page.locator("[data-diff]");
    const total = await diffs.count();
    for (let index = 0; index < total; index += 1) {
      await diffs.nth(index).click();
    }
    await waitNextPhase(page, phase, phases);
  }
}

export async function winTesouroPhases(page, phases = CAMPAIGN_PHASES) {
  for (let phase = 0; phase < phases; phase += 1) {
    await expect(page.locator("[data-phase-bar]")).toContainText(`Fase ${phase + 1} de ${phases}`);
    const treasures = page.locator('[data-treasure="1"]');
    const total = await treasures.count();
    for (let index = 0; index < total; index += 1) {
      await treasures.nth(index).click();
    }
    await waitNextPhase(page, phase, phases);
  }
}

export async function winAlvoPhases(page, phases = CAMPAIGN_PHASES) {
  for (let phase = 0; phase < phases; phase += 1) {
    await expect(page.locator("[data-phase-bar]")).toContainText(`Fase ${phase + 1} de ${phases}`);
    const line = await page.locator("[data-hits]").textContent();
    const goal = Number(line?.match(/de (\d+)/)?.[1] ?? "2");
    for (let hit = 0; hit < goal; hit += 1) {
      await page.locator("[data-shot]").click();
      await page.waitForTimeout(40);
    }
    await waitNextPhase(page, phase, phases);
  }
}

export async function solveQuebraPuzzle(page) {
  const startedOn = await page.locator(".phase-badge").textContent();
  for (let guard = 0; guard < 12; guard += 1) {
    if ((await page.locator(".phase-badge").textContent()) !== startedOn) return;
    const pieces = await page
      .locator("[data-piece]")
      .evaluateAll((nodes) => nodes.map((node) => Number(node.dataset.piece)));
    if (pieces.every((piece, index) => piece === index)) return;
    const slot = pieces.findIndex((piece, index) => piece !== index);
    const holder = pieces.indexOf(slot);
    await page.locator(`[data-slot="${slot}"]`).click();
    await page.locator(`[data-slot="${holder}"]`).click();
    await page.waitForTimeout(60);
  }
}

export async function winQuebraPhases(page, phases = CAMPAIGN_PHASES) {
  for (let phase = 0; phase < phases; phase += 1) {
    await expect(page.locator("[data-phase-bar]")).toContainText(`Fase ${phase + 1} de ${phases}`);
    await solveQuebraPuzzle(page);
    await waitNextPhase(page, phase, phases);
  }
}

export async function winInglesPhases(page, phases = CAMPAIGN_PHASES) {
  for (let phase = 0; phase < phases; phase += 1) {
    await expect(page.locator("[data-phase-bar]")).toContainText(`Fase ${phase + 1} de ${phases}`);
    await page.locator('[data-correct="true"]').click();
    await waitNextPhase(page, phase, phases);
  }
}

export async function winFutebolPhases(page, phases = CAMPAIGN_PHASES) {
  for (let phase = 0; phase < phases; phase += 1) {
    await expect(page.locator("[data-phase-bar]")).toContainText(`Fase ${phase + 1} de ${phases}`);
    const hud = await page.locator("[data-hud]").textContent();
    const goals = Number(hud?.match(/de (\d+)/)?.[1] ?? "2");
    for (let goal = 0; goal < goals; goal += 1) {
      await page.getByRole("button", { name: "Chutar Direita" }).click();
      await page.waitForTimeout(160);
    }
    await waitNextPhase(page, phase, phases);
  }
}

export async function winEspacoCampaign(page) {
  const fire = page.getByRole("button", { name: "Atirar" });
  for (let attempt = 0; attempt < 500; attempt += 1) {
    await fire.click();
    await page.waitForTimeout(220);
    if (await page.locator("[data-result=win]").isVisible()) return;
  }
  await expect(page.locator("[data-result=win]")).toBeVisible();
}

export async function winLigarPhases(page, phases = CAMPAIGN_PHASES) {
  for (let phase = 0; phase < phases; phase += 1) {
    await expect(page.locator("[data-phase-bar]")).toContainText(`Fase ${phase + 1} de ${phases}`);
    const left = page.locator('[data-side="left"]');
    const total = await left.count();
    for (let index = 0; index < total; index += 1) {
      const key = await left.nth(index).getAttribute("data-key");
      await left.nth(index).click();
      await page.locator(`[data-side="right"][data-key="${key}"]`).click();
    }
    await waitNextPhase(page, phase, phases);
  }
}

export async function fillAllBlockSlots(page) {
  const slotsThisPhase = await page.locator("[data-slot]").count();
  let guard = 0;
  while (guard < 16) {
    guard += 1;
    if ((await page.locator("[data-slot]").count()) !== slotsThisPhase) break;
    const filled = await page.locator("[data-slot].is-filled").count();
    if (filled >= slotsThisPhase) break;
    const open = page.locator("[data-slot]:not(.is-filled)").first();
    const want = await open.getAttribute("data-want");
    if (!want) break;
    await page.locator(`.block-piece[data-color="${want}"]:not(.is-used)`).first().click();
    await page.waitForTimeout(120);
    await page.getByRole("button", { name: `Lugar para bloco ${want}` }).click();
    await page.waitForTimeout(200);
  }
  const slotsNow = await page.locator("[data-slot]").count();
  if (slotsNow === slotsThisPhase) {
    await expect(page.locator("[data-slot].is-filled")).toHaveCount(slotsThisPhase);
  }
}

export async function expectNoHorizontalOverflow(page) {
  const extra = await page.evaluate(() => {
    const doc = document.documentElement;
    return doc.scrollWidth - doc.clientWidth;
  });
  expect(extra).toBeLessThanOrEqual(1);
}
