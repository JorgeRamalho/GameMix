import { expect, test } from "@playwright/test";
import {
  answerMathPhases,
  fillAllBlockSlots,
  mixColorsInPot,
  openGame,
  paintRegions,
  winByCorrectChoices,
} from "./helpers.js";

test.beforeEach(({ }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile", "Fases completas no perfil mobile.");
});

test("matemática completa as três fases", async ({ page }) => {
  test.setTimeout(45000);
  await openGame(page, "Contar", { fullPhases: true });
  await expect(page.locator("[data-phase-bar]")).toContainText("Fase 1 de 3");
  await answerMathPhases(page, 3);
  await expect(page.locator("[data-result=win]")).toBeVisible();
});

test("animais completa as três fases", async ({ page }) => {
  test.setTimeout(60000);
  await openGame(page, "Animais", { fullPhases: true });
  await winByCorrectChoices(page, { maxSteps: 20 });
});

test("colorir completa as três fases (pintar e misturar)", async ({ page }) => {
  test.setTimeout(90000);
  await openGame(page, "^Colorir", { fullPhases: true });

  await page.getByRole("button", { name: "Vermelho" }).click();
  await paintRegions(page, ["asa-esquerda", "asa-direita"]);
  await expect(page.locator("[data-phase-bar]")).toContainText("Fase 2 de 3", { timeout: 8000 });

  await page.getByRole("button", { name: "Azul" }).click();
  await paintRegions(page, ["telhado", "parede", "porta"]);
  await expect(page.locator("[data-phase-bar]")).toContainText("Fase 3 de 3", { timeout: 8000 });

  await mixColorsInPot(page, "Amarelo", "Azul");
  await paintRegions(page, ["petala-n", "petala-s", "centro", "caule"]);
  await expect(page.locator("[data-result=win]")).toBeVisible();
});

test("blocos encaixa as três fases", async ({ page }) => {
  test.setTimeout(60000);
  await openGame(page, "^Blocos", { fullPhases: true });

  const slotCounts = [2, 3, 4];
  for (let phase = 0; phase < 3; phase += 1) {
    await expect(page.locator("[data-phase-bar]")).toContainText(`Fase ${phase + 1} de 3`);
    await expect(page.locator("[data-slot]")).toHaveCount(slotCounts[phase]);
    await fillAllBlockSlots(page);
    if (phase < 2) {
      await expect(page.locator("[data-phase-bar]")).toContainText(`Fase ${phase + 2} de 3`, { timeout: 8000 });
    }
  }
  await expect(page.locator("[data-result=win]")).toBeVisible();
});

test("ligar une os pares nas quatro fases", async ({ page }) => {
  test.setTimeout(60000);
  await openGame(page, "^Ligar", { fullPhases: true });

  for (let phase = 0; phase < 4; phase += 1) {
    await expect(page.locator("[data-phase-bar]")).toContainText(`Fase ${phase + 1} de 4`);
    const left = page.locator('[data-side="left"]');
    const total = await left.count();
    for (let index = 0; index < total; index += 1) {
      const key = await left.nth(index).getAttribute("data-key");
      await left.nth(index).click();
      await page.locator(`[data-side="right"][data-key="${key}"]`).click();
    }
    if (phase < 3) await page.waitForTimeout(80);
  }
  await expect(page.locator("[data-result=win]")).toBeVisible();
});
