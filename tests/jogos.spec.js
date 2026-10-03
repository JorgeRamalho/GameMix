import { expect, test } from "@playwright/test";
import { openGame } from "./helpers.js";

test.beforeEach(({ }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile", "A rodada completa dos jogos roda no perfil de celular.");
});

test("colorir mistura vermelho e amarelo e pinta a borboleta", async ({ page }) => {
  await openGame(page, "^Colorir");
  await page.getByRole("button", { name: "Vermelho" }).click();
  await page.getByRole("button", { name: "Primeiro potinho" }).click();
  await expect(page.getByRole("button", { name: /Vermelho no potinho 1/i })).toBeVisible();
  await page.getByRole("button", { name: "Amarelo" }).click();
  await page.getByRole("button", { name: "Segundo potinho" }).click();
  await expect(page.getByRole("button", { name: /Amarelo no potinho 2/i })).toBeVisible();
  await expect(page.locator("[data-mix-result]")).toContainText(/laranja/i);
  const spoken = await page.locator("html").getAttribute("data-spoken");
  expect(spoken?.toLowerCase()).toContain("laranja");
  await expect(page.locator("html")).toHaveAttribute("data-spoken-lang", "pt-BR");
  for (const region of ["asa-esquerda", "asa-direita", "corpo"]) {
    await page.locator(`[data-region="${region}"]`).click();
  }
  const fill = await page.locator('[data-region="corpo"]').evaluate((element) => getComputedStyle(element).fill);
  expect(fill.replaceAll(" ", "")).toBe("rgb(255,138,30)");
  await expect(page.locator("[data-result=win]")).toBeVisible();
  await expect(page.locator("[data-result=win]")).toContainText("Muito bem!");
});

test("caça ao tesouro encontra os tesouros da fase", async ({ page }) => {
  await openGame(page, "Tesouro");
  const spots = page.locator('[data-treasure="1"]');
  await expect(spots).toHaveCount(2);
  const total = await spots.count();
  for (let index = 0; index < total; index += 1) {
    await spots.nth(index).click();
  }
  await expect(page.locator("[data-result=win]")).toBeVisible();
});

test("pescaria pega os peixes da fase", async ({ page }) => {
  await openGame(page, "Pescaria");
  const fishes = page.locator("[data-fish]");
  await expect(fishes).toHaveCount(3);
  const total = await fishes.count();
  for (let index = 0; index < total; index += 1) {
    await fishes.nth(index).click();
  }
  await expect(page.locator("[data-result=win]")).toBeVisible();
});

test("tiro ao alvo acerta as estrelas da fase", async ({ page }) => {
  await openGame(page, "^Alvo");
  for (let index = 0; index < 2; index += 1) {
    await page.locator("[data-shot]").click();
  }
  await expect(page.locator("[data-result=win]")).toBeVisible();
});

test("quebra-cabeça troca as partes até completar", async ({ page }) => {
  await openGame(page, "^Quebra");
  for (let guard = 0; guard < 8; guard += 1) {
    const pieces = await page.locator("[data-piece]").evaluateAll((nodes) => nodes.map((node) => Number(node.dataset.piece)));
    if (pieces.every((piece, index) => piece === index)) break;
    const slot = pieces.findIndex((piece, index) => piece !== index);
    const holder = pieces.indexOf(slot);
    await page.locator(`[data-slot="${slot}"]`).click();
    await page.locator(`[data-slot="${holder}"]`).click();
  }
  await expect(page.locator("[data-result=win]")).toBeVisible();
});

test("memória forma os pares e guarda estrelas", async ({ page }) => {
  await openGame(page, "Memória");
  const cards = page.locator("[data-card]");
  const pairs = await cards.evaluateAll((nodes) => nodes.map((node) => node.dataset.pair));
  const used = new Set();
  for (let index = 0; index < pairs.length; index += 1) {
    if (used.has(index)) continue;
    const match = pairs.findIndex((pair, pairIndex) => pairIndex !== index && pair === pairs[index] && !used.has(pairIndex));
    used.add(index);
    used.add(match);
    await cards.nth(index).click();
    await cards.nth(match).click();
  }
  await expect(page.locator("[data-result=win]")).toBeVisible();
  await expect(page.locator("[data-stars]")).toHaveText("3");
  await page.reload();
  await expect(page.locator("[data-stars]")).toHaveText("3");
});

test("sete erros marca as diferenças da fase", async ({ page }) => {
  await openGame(page, "^Erros");
  const diffs = page.locator("[data-diff]");
  await expect(diffs).toHaveCount(2);
  const total = await diffs.count();
  for (let index = 0; index < total; index += 1) {
    await diffs.nth(index).click();
  }
  await expect(page.locator("[data-found]")).toHaveText("2 de 2");
  await expect(page.locator("[data-result=win]")).toBeVisible();
});

test("matemática conta e soma", async ({ page }) => {
  await openGame(page, "Contar");
  const board = page.locator("[data-answer]");
  const answer = await board.getAttribute("data-answer");
  await page.getByRole("button", { name: answer, exact: true }).click();
  await expect(page.locator("[data-result=win]")).toBeVisible();
});

test("inglês explica em português antes da escolha", async ({ page }) => {
  await openGame(page, "Inglês");
  const [english, portuguese] = [/apple/i, /maçã/];
  await expect(page.locator(".en-word")).toHaveAttribute("lang", "en");
  await page.getByRole("button", { name: "Ouvir em português" }).click();
  await expect(page.locator("[data-caption]")).toContainText(portuguese);
  const spoken = await page.locator("html").getAttribute("data-spoken");
  expect(spoken).toMatch(english);
  expect(spoken).toMatch(portuguese);
  expect(spoken?.toLowerCase()).toContain("inglês");
  await expect(page.locator("html")).toHaveAttribute("data-spoken-lang", "pt-BR");
  await page.locator('[data-correct="true"]').click();
  await expect(page.locator("[data-result=win]")).toBeVisible();
});

test("ligar une cada objeto ao par", async ({ page }) => {
  await openGame(page, "^Ligar");
  const left = page.locator('[data-side="left"]');
  const total = await left.count();
  expect(total).toBe(4);
  for (let index = 0; index < total; index += 1) {
    const key = await left.nth(index).getAttribute("data-key");
    await left.nth(index).click();
    await page.locator(`[data-side="right"][data-key="${key}"]`).click();
  }
  await expect(page.locator(".wires line")).toHaveCount(4);
  await expect(page.locator("[data-result=win]")).toBeVisible();
});

test("animais escolhe o bichinho certo", async ({ page }) => {
  await openGame(page, "Animais");
  await page.locator('[data-correct="true"]').click();
  await expect(page.locator("[data-result=win]")).toBeVisible();
});

test("corrida move para a direita", async ({ page }) => {
  await openGame(page, "Corrida");
  const car = page.locator("[data-car]");
  await expect(car).toHaveAttribute("data-lane", "1");
  await page.getByRole("button", { name: "Direita" }).click();
  await expect(car).toHaveAttribute("data-lane", "2");
  await page.getByRole("button", { name: "Esquerda" }).click();
  await expect(car).toHaveAttribute("data-lane", "1");
});

test("corrida coleta estrelas e completa a fase", async ({ page }) => {
  await openGame(page, "Corrida");
  await expect(page.locator("[data-score]")).toBeVisible();
  await expect(page.locator("[data-result=win]")).toBeVisible({ timeout: 15000 });
});

test("guerra espacial move para a direita", async ({ page }) => {
  await openGame(page, "Guerra espacial");
  const ship = page.locator("[data-ship]");
  await expect(ship).toHaveAttribute("data-lane", "1");
  await page.getByRole("button", { name: "Direita" }).click();
  await expect(ship).toHaveAttribute("data-lane", "2");
  await page.getByRole("button", { name: "Direita" }).click();
  await expect(ship).toHaveAttribute("data-lane", "2");
  await page.getByRole("button", { name: "Esquerda" }).click();
  await expect(ship).toHaveAttribute("data-lane", "1");
});

test("guerra espacial destrói meteoros", async ({ page }) => {
  await openGame(page, "Guerra espacial");
  const fire = page.getByRole("button", { name: "Atirar" });
  for (let i = 0; i < 6; i += 1) {
    await fire.click();
    await page.waitForTimeout(400);
    if (await page.locator("[data-result=win]").isVisible()) break;
  }
  await expect(page.locator("[data-result=win]")).toBeVisible({ timeout: 20000 });
});

test("blocos encaixa as peças da fase", async ({ page }) => {
  await openGame(page, "^Blocos");
  const slots = page.locator("[data-slot]");
  const count = await slots.count();
  for (let s = 0; s < count; s += 1) {
    const want = await slots.nth(s).getAttribute("data-want");
    await page.locator(`.block-piece[data-color="${want}"]:not(.is-used)`).click();
    await slots.nth(s).click();
    await expect(slots.nth(s)).toHaveClass(/is-filled/);
  }
  await expect(page.locator("[data-result=win]")).toBeVisible();
});

test("pênalti marca gol", async ({ page }) => {
  await openGame(page, "Pênalti");
  await page.getByRole("button", { name: "Chutar Direita" }).click();
  await page.waitForTimeout(200);
  await page.getByRole("button", { name: "Chutar Direita" }).click();
  await expect(page.locator("[data-result=win]")).toBeVisible({ timeout: 15000 });
});
