import { expect, test } from "@playwright/test";
import {
  answerMathPhases,
  CAMPAIGN_PHASES,
  completeColorirPhase,
  fillAllBlockSlots,
  openGame,
  winAlvoPhases,
  winByCorrectChoices,
  winEspacoCampaign,
  winFutebolPhases,
  winInglesPhases,
  winLigarPhases,
  winMemoriaPhases,
  winPescariaPhases,
  winQuebraPhases,
  waitNextPhase,
  winTesouroPhases,
  winTetrisPhases,
} from "./helpers.js";

test.beforeEach(({ }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile", "Fases completas no perfil mobile.");
});

test("matemática completa as dez fases", async ({ page }) => {
  test.setTimeout(120000);
  await openGame(page, "Contar", { fullPhases: true });
  await expect(page.locator("[data-phase-bar]")).toContainText(`Fase 1 de ${CAMPAIGN_PHASES}`);
  await answerMathPhases(page, CAMPAIGN_PHASES);
  await expect(page.locator("[data-result=win]")).toBeVisible();
});

test("animais completa as dez fases", async ({ page }) => {
  test.setTimeout(180000);
  await openGame(page, "Animais", { fullPhases: true });
  await winByCorrectChoices(page, { maxSteps: 80 });
});

test("inglês completa as dez fases", async ({ page }) => {
  test.setTimeout(120000);
  await openGame(page, "Inglês", { fullPhases: true });
  await winInglesPhases(page, CAMPAIGN_PHASES);
  await expect(page.locator("[data-result=win]")).toBeVisible();
});

test("memória completa as dez fases", async ({ page }) => {
  test.setTimeout(300000);
  await openGame(page, "Memória", { fullPhases: true });
  await winMemoriaPhases(page, CAMPAIGN_PHASES);
  await expect(page.locator("[data-result=win]")).toBeVisible();
});

test("pescaria completa as dez fases", async ({ page }) => {
  test.setTimeout(120000);
  await openGame(page, "Pescaria", { fullPhases: true });
  await winPescariaPhases(page, CAMPAIGN_PHASES);
  await expect(page.locator("[data-result=win]")).toBeVisible();
});

test("tetris completa as dez fases", async ({ page }) => {
  test.setTimeout(240000);
  await openGame(page, "^Tetris", { fullPhases: true });
  await winTetrisPhases(page, CAMPAIGN_PHASES);
  await expect(page.locator("[data-result=win]")).toBeVisible();
});

test("caça ao tesouro completa as dez fases", async ({ page }) => {
  test.setTimeout(180000);
  await openGame(page, "Tesouro", { fullPhases: true });
  await winTesouroPhases(page, CAMPAIGN_PHASES);
  await expect(page.locator("[data-result=win]")).toBeVisible();
});

test("tiro ao alvo completa as dez fases", async ({ page }) => {
  test.setTimeout(120000);
  await openGame(page, "^Alvo", { fullPhases: true });
  await winAlvoPhases(page, CAMPAIGN_PHASES);
  await expect(page.locator("[data-result=win]")).toBeVisible();
});

test("quebra-cabeça completa as dez fases", async ({ page }) => {
  test.setTimeout(240000);
  await openGame(page, "^Quebra", { fullPhases: true });
  await winQuebraPhases(page, CAMPAIGN_PHASES);
  await expect(page.locator("[data-result=win]")).toBeVisible();
});

test("colorir completa as dez fases", async ({ page }) => {
  test.setTimeout(420000);
  await openGame(page, "^Colorir", { fullPhases: true });

  for (let phase = 0; phase < CAMPAIGN_PHASES; phase += 1) {
    await expect(page.locator("[data-phase-bar]")).toContainText(`Fase ${phase + 1} de ${CAMPAIGN_PHASES}`);
    await completeColorirPhase(page);
    await waitNextPhase(page, phase, CAMPAIGN_PHASES);
  }
  await expect(page.locator("[data-result=win]")).toBeVisible();
});

test("blocos encaixa as dez fases", async ({ page }) => {
  test.setTimeout(180000);
  await openGame(page, "^Blocos", { fullPhases: true });

  const slotPattern = [2, 3, 4];
  for (let phase = 0; phase < CAMPAIGN_PHASES; phase += 1) {
    await expect(page.locator("[data-phase-bar]")).toContainText(`Fase ${phase + 1} de ${CAMPAIGN_PHASES}`);
    await expect(page.locator("[data-slot]")).toHaveCount(slotPattern[phase % slotPattern.length]);
    await fillAllBlockSlots(page);
    if (phase < CAMPAIGN_PHASES - 1) {
      await expect(page.locator("[data-phase-bar]")).toContainText(`Fase ${phase + 2} de ${CAMPAIGN_PHASES}`, {
        timeout: 8000,
      });
    }
  }
  await expect(page.locator("[data-result=win]")).toBeVisible();
});

test("ligar une os pares nas dez fases", async ({ page }) => {
  test.setTimeout(180000);
  await openGame(page, "^Ligar", { fullPhases: true });
  await winLigarPhases(page, CAMPAIGN_PHASES);
  await expect(page.locator("[data-result=win]")).toBeVisible();
});

test("corrida completa as dez fases", async ({ page }) => {
  test.setTimeout(420000);
  await openGame(page, "Corrida", { fullPhases: true });
  await expect(page.locator("[data-phase-bar]")).toContainText(`Fase 1 de ${CAMPAIGN_PHASES}`);
  await expect(page.locator("[data-result=win]")).toBeVisible({ timeout: 390000 });
});

test("guerra espacial completa as dez fases", async ({ page }) => {
  test.setTimeout(360000);
  await openGame(page, "Guerra espacial", { fullPhases: true });
  await expect(page.locator("[data-phase-bar]")).toContainText(`Fase 1 de ${CAMPAIGN_PHASES}`);
  await winEspacoCampaign(page);
  await expect(page.locator("[data-result=win]")).toBeVisible();
});

test("pênalti completa as dez fases", async ({ page }) => {
  test.setTimeout(180000);
  await openGame(page, "Pênalti", { fullPhases: true });
  await winFutebolPhases(page, CAMPAIGN_PHASES);
  await expect(page.locator("[data-result=win]")).toBeVisible();
});
