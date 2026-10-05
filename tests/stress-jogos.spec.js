import { expect, test } from "@playwright/test";
import { expectNoHorizontalOverflow, openHome } from "./helpers.js";

/** Mesma ordem de `js/games/index.js` / `data-game` na home. */
const GAME_IDS = [
  "colorir",
  "tesouro",
  "pescaria",
  "alvo",
  "quebra",
  "memoria",
  "tetris",
  "matematica",
  "ingles",
  "ligar",
  "animais",
  "corrida",
  "espaco",
  "blocos",
  "futebol",
];

function attachConsoleWatch(page) {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
  });
  return errors;
}

test.beforeEach(({ }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile", "Stress dos jogos no perfil mobile.");
});

test("cada rota #/id monta o jogo sem erros de console", async ({ page }) => {
  const errors = attachConsoleWatch(page);
  await openHome(page);

  for (const id of GAME_IDS) {
    await page.goto(`/?e2e=1#/${id}`);
    await expect(page.locator(".game-shell")).toBeVisible();
    await expect(page.locator("[data-goal]")).not.toHaveText("");
    await expectNoHorizontalOverflow(page);
  }

  expect(errors, `Erros de console: ${errors.join(" | ")}`).toEqual([]);
});

test("navegação hash casa ↔ todos os jogos e volta", async ({ page }) => {
  await openHome(page);

  for (const id of GAME_IDS) {
    await page.evaluate((gameId) => {
      location.hash = `#/${gameId}`;
    }, id);
    await expect(page.locator(".game-shell")).toBeVisible();
    await page.getByRole("button", { name: "Voltar", exact: true }).click();
    await expect(page.getByRole("heading", { level: 1, name: "GameKids" })).toBeVisible();
  }
});

test("vitória, jogar de novo e sair não deixam tela presa", async ({ page }) => {
  const errors = attachConsoleWatch(page);
  await openHome(page);
  await page.goto("/?e2e=1#/tesouro");

  const treasures = page.locator('[data-treasure="1"]');
  const total = await treasures.count();
  for (let index = 0; index < total; index += 1) {
    await treasures.nth(index).click();
  }
  await expect(page.locator("[data-result=win]")).toBeVisible();

  await page.locator("[data-again]").click();
  await expect(page.locator("[data-result=win]")).toBeHidden();
  await expect(page.locator('[data-treasure="1"]')).toHaveCount(2);

  await page.getByRole("button", { name: "Voltar", exact: true }).click();
  await expect(page.getByRole("heading", { level: 1, name: "GameKids" })).toBeVisible();
  expect(errors).toEqual([]);
});

test("colorir: borracha limpa potinho e paleta completa no potinho", async ({ page }) => {
  await openHome(page);
  await page.goto("/?e2e=1#/colorir");

  await page.getByRole("button", { name: "Verde" }).click();
  await page.getByRole("button", { name: "Primeiro potinho" }).click();
  await expect(page.getByRole("button", { name: /Verde no potinho 1/i })).toBeVisible();

  await page.getByRole("button", { name: "Borracha, limpar potinho" }).click();
  await expect(page.getByRole("button", { name: "Primeiro potinho" })).toBeVisible();

  await page.getByRole("button", { name: "Roxo" }).click();
  await page.getByRole("button", { name: "Primeiro potinho" }).click();
  await page.getByRole("button", { name: "Rosa" }).click();
  await page.getByRole("button", { name: "Segundo potinho" }).click();
  await expect(page.locator("[data-mix-result]")).toContainText(/roxo|rosa/i);

  await page.getByRole("button", { name: "Borracha, limpar potinho" }).click();
  await expect(page.locator("[data-mix-result]")).toContainText(/escolha duas cores/i);
});

test("caminhos de erro não travam animais e matemática", async ({ page }) => {
  await openHome(page);

  await page.goto("/?e2e=1#/animais");
  await page.locator('[data-correct="false"]').first().click();
  await expect(page.locator(".animal-choice.is-shake")).toBeVisible();
  await page.locator('[data-correct="true"]').click();
  await expect(page.locator("[data-result=win]")).toBeVisible();

  await page.goto("/?e2e=1#/matematica");
  const board = page.locator("[data-answer]");
  const answer = await board.getAttribute("data-answer");
  const wrong = board.locator("[data-option]").filter({ hasNotText: answer }).first();
  await wrong.click();
  await expect(page.locator("[data-result=win]")).toBeHidden();
  await page.getByRole("button", { name: answer, exact: true }).click();
  await expect(page.locator("[data-result=win]")).toBeVisible();
});
