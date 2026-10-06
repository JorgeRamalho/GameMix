import { expect, test } from "@playwright/test";
import { expectNoHorizontalOverflow, openGame, openHome } from "./helpers.js";

test.describe("SEO e conteúdo", () => {
  test("título, descrição, idioma e dados estruturados", async ({ page }) => {
    test.info().annotations.push({ type: "eixo", description: "SEO" });
    await openHome(page);
    await expect(page).toHaveTitle("GameMix — jogos infantis");
    const description = page.locator('meta[name="description"]');
    await expect(description).toHaveAttribute("content", /GameMix/);
    await expect(description).toHaveAttribute("content", /português/);
    await expect(page.locator("html")).toHaveAttribute("lang", "pt-BR");
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /index/);
    const canonical = await page.locator('link[rel="canonical"]').getAttribute("href");
    expect(canonical).toMatch(/^https?:\/\//);
    const data = JSON.parse(await page.locator('script[type="application/ld+json"]').textContent());
    expect(data.name).toBe("GameMix");
    expect(data.applicationCategory).toBe("EducationalApplication");
    expect(data.audience).toBeUndefined();
    expect(data.inLanguage).toBe("pt-BR");
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator("main")).toHaveCount(1);
    await expect(page.locator("[data-game]")).toHaveCount(19);
    const robots = await page.request.get("/robots.txt");
    expect(await robots.text()).toContain("Allow");
  });
});

test.describe("Usabilidade e UX", () => {
  test("alvos de toque, volta para casa e contraste do botão", async ({ page }) => {
    test.info().annotations.push({ type: "eixo", description: "Usabilidade e UX" });
    await openHome(page);
    const cards = page.locator(".game-card");
    const count = await cards.count();
    for (let index = 0; index < count; index += 1) {
      const box = await cards.nth(index).boundingBox();
      expect(box.height).toBeGreaterThanOrEqual(64);
      expect(box.width).toBeGreaterThanOrEqual(64);
    }
    await expectNoHorizontalOverflow(page);
    await openGame(page, "Colorir");
    const back = page.getByRole("button", { name: "Voltar", exact: true });
    const backBox = await back.boundingBox();
    expect(backBox.height).toBeGreaterThanOrEqual(64);
    const color = await back.evaluate((element) => getComputedStyle(element).color);
    expect(color).toBe("rgb(43, 42, 74)");
    const background = await back.evaluate((element) => getComputedStyle(element).backgroundColor);
    expect(background).toBe("rgb(255, 225, 74)");
    await back.click();
    await expect(page.getByRole("heading", { level: 1, name: "GameMix" })).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });

  test("boas-vindas ao toque na tela", async ({ page }) => {
    await page.goto("/");
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText(/toque/i);
    await page.getByRole("button", { name: "Vamos brincar" }).click();
    await expect(dialog).toBeHidden();
    await page.reload();
    await expect(dialog).toBeHidden();
  });

  test("conceito lúdico visível para a família", async ({ page }) => {
    test.info().annotations.push({ type: "eixo", description: "Conceito" });
    await openHome(page);
    await expect(page.getByRole("heading", { name: "Como brincar" })).toBeVisible();
    await expect(page.locator("body")).toContainText(/toque num jogo/i);
    await expect(page.locator("body")).toContainText("português");
  });
});

test.describe("Identidade visual, tipografia e responsivo", () => {
  test("sem cursor de pincel — só toque nativo", async ({ page }) => {
    test.info().annotations.push({ type: "eixo", description: "Identidade visual e touchscreen" });
    await openHome(page);
    await expect(page.locator("html")).toHaveAttribute("data-visual-identity", "touchscreen");
    await expect(page.locator("#brush")).toHaveCount(0);
    await expect(page.locator(".atomic-brush")).toHaveCount(0);
    await page.mouse.move(180, 220);
    const cursor = await page.evaluate(() => getComputedStyle(document.body).cursor);
    expect(cursor).toBe("default");
    const touchAction = await page.locator(".game-card").first().evaluate((el) => getComputedStyle(el).touchAction);
    expect(touchAction).toBe("manipulation");
  });

  test("tipografia infantil e CSS3 de alta definição", async ({ page }) => {
    test.info().annotations.push({ type: "eixo", description: "Tipografia e CSS3" });
    await openHome(page);
    const fontSize = await page.locator("h1").evaluate((element) => Number.parseFloat(getComputedStyle(element).fontSize));
    expect(fontSize).toBeGreaterThanOrEqual(32);
    const family = await page.locator("h1").evaluate((element) => getComputedStyle(element).fontFamily);
    expect(family.toLowerCase()).toMatch(/fredoka|segoe|trebuchet|nunito|arial/);
    const css = await (await page.request.get("/css/gamemix.css")).text();
    for (const token of [
      "Fredoka",
      "Nunito",
      "--marker",
      "#ffe14a",
      "@keyframes",
      "prefers-reduced-motion",
      "grid-template-columns",
      "clamp(",
      "color-mix",
      "aspect-ratio",
      "@container",
      "100dvh",
      "focus-visible",
    ]) {
      expect(css).toContain(token);
    }
  });

  test("sem rolagem horizontal e objetivo do jogo legível", async ({ page }) => {
    test.info().annotations.push({ type: "eixo", description: "Responsividade e layout" });
    await openHome(page);
    await expectNoHorizontalOverflow(page);
    await page.getByRole("link", { name: /Quebra/i }).click();
    await expect(page.locator("[data-goal]")).toContainText(/montar/i);
    await expectNoHorizontalOverflow(page);
    await page.getByRole("button", { name: "Voltar", exact: true }).click();
    await expectNoHorizontalOverflow(page);
  });
});

test.describe("Estratégia de desenvolvimento", () => {
  test("motor de comportamento em JavaScript e módulos", async ({ page }) => {
    test.info().annotations.push({
      type: "eixo",
      description: "Estrutura: HTML semântico, CSS3 e motor de comportamento",
    });
    await openHome(page);
    await expect(page.locator("html")).toHaveAttribute("data-engine", "javascript-behavior");
    const engine = await (await page.request.get("/js/engine.js")).text();
    expect(engine).toContain("class BehaviorEngine");
    expect(engine).toContain("requestAnimationFrame");
    expect(engine).toContain("pointer");
    expect(engine).toContain("pt-BR");
    const html = await (await page.request.get("/")).text();
    expect(html).toContain('type="module"');
    expect(html).toContain('lang="pt-BR"');
  });
});
