import { expect, test } from "@playwright/test";

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

export async function answerMathPhases(page, phases = 3) {
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

export async function paintRegions(page, regionIds) {
  for (const region of regionIds) {
    await page.locator(`[data-region="${region}"]`).first().click();
  }
}

/** Encaixa todos os blocos da fase atual (para quando o jogo tem várias fases). */
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
