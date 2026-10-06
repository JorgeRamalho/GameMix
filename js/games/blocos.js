import { bindPress, playSfx } from "../engine.js";
import { onChoice } from "../lib/gameActions.js";
import { completePhase, GAME_PHASE_COUNT, phaseBanner, phaseTotal } from "../lib/phases.js";
import { pickUnique } from "../lib/playVariety.js";

const COLORS = [
  { id: "vermelho", hex: "#ff4d4d", label: "vermelho" },
  { id: "amarelo", hex: "#ffe14a", label: "amarelo" },
  { id: "azul", hex: "#3d8bfd", label: "azul" },
  { id: "verde", hex: "#3cce6e", label: "verde" },
  { id: "roxo", hex: "#9b6bff", label: "roxo" },
  { id: "laranja", hex: "#ff8a1e", label: "laranja" },
];

const LAYOUT_CYCLE = [
  { layout: "row2", slotCount: 2 },
  { layout: "tower3", slotCount: 3 },
  { layout: "grid4", slotCount: 4 },
];

const PHASES = Array.from({ length: GAME_PHASE_COUNT }, (_, phaseIndex) => {
  const { layout, slotCount } = LAYOUT_CYCLE[phaseIndex % LAYOUT_CYCLE.length];
  return {
    layout,
    slots: COLORS.slice(0, slotCount).map((color) => color.id),
  };
});

const TOWER_COUNT = 4;
const MAX_TOWER_FLOORS = 14;

function colorOf(id) {
  return COLORS.find((c) => c.id === id) ?? COLORS[0];
}

function shuffleBlocks(ctx, ids) {
  const list = [...ids];
  if (ctx.e2e) return [...list].reverse();
  for (let i = list.length - 1; i > 0; i -= 1) {
    const j = Math.floor(ctx.random() * (i + 1));
    [list[i], list[j]] = [list[j], list[i]];
  }
  if (list.every((id, index) => id === ids[index]) && list.length > 1) {
    [list[0], list[1]] = [list[1], list[0]];
  }
  return list;
}

const COLOR_EMOJI = {
  vermelho: "🟥",
  amarelo: "🟨",
  azul: "🟦",
  verde: "🟩",
  roxo: "🟪",
  laranja: "🟧",
};

function blocosModeNav(activeMode) {
  return `
    <nav class="blocos-modes" role="tablist" aria-label="Tipo de jogo">
      <button type="button" class="blocos-mode-tab blocos-mode-tab--encaixar" role="tab" data-blocos-mode="encaixar"
        aria-selected="${activeMode === "encaixar"}" ${activeMode === "encaixar" ? 'aria-current="page"' : ""}
        aria-label="Modo encaixar: bloco na cor certa">
        <span class="blocos-mode-tab__icon" aria-hidden="true">🧩</span>
        <span class="blocos-mode-tab__mini" aria-hidden="true">
          <span class="blocos-demo-block"></span><span class="blocos-demo-arrow">➜</span><span class="blocos-demo-slot"></span>
        </span>
      </button>
      <button type="button" class="blocos-mode-tab blocos-mode-tab--torres" role="tab" data-blocos-mode="torres"
        aria-selected="${activeMode === "torres"}" ${activeMode === "torres" ? 'aria-current="page"' : ""}
        aria-label="Modo torres: empilhar blocos">
        <span class="blocos-mode-tab__icon" aria-hidden="true">🏗️</span>
        <span class="blocos-mode-tab__mini blocos-mode-tab__mini--stack" aria-hidden="true">
          <span class="blocos-demo-stack"><i></i><i></i><i></i></span>
        </span>
      </button>
    </nav>`;
}

function blocosIntroMarkup() {
  return `
    <div class="blocos-mode-intro">
      <p class="blocos-mode-intro__hero" aria-hidden="true">🧱🎨</p>
      <p class="blocos-mode-intro__pick" aria-hidden="true">👇</p>
      <div class="blocos-mode-intro__actions">
        <button type="button" class="blocos-mode-card blocos-mode-card--encaixar" data-blocos-start="encaixar"
          aria-label="Encaixar: toque no bloco e no lugar da mesma cor">
          <span class="blocos-mode-card__badge" aria-hidden="true">🧩</span>
          <span class="blocos-mode-card__figure" aria-hidden="true">
            <span class="blocos-figure-fit">
              <span class="blocos-figure-fit__pieces">
                <span class="blocos-figure-fit__block blocos-figure-fit__block--a"></span>
                <span class="blocos-figure-fit__block blocos-figure-fit__block--b"></span>
              </span>
              <span class="blocos-figure-fit__arrow">➡️</span>
              <span class="blocos-figure-fit__targets">
                <span class="blocos-figure-fit__hole blocos-figure-fit__hole--a"></span>
                <span class="blocos-figure-fit__hole blocos-figure-fit__hole--b"></span>
              </span>
            </span>
          </span>
          <span class="blocos-mode-card__steps" aria-hidden="true">
            <span>1️⃣🟦</span><span>2️⃣⬜</span>
          </span>
        </button>
        <button type="button" class="blocos-mode-card blocos-mode-card--torres" data-blocos-start="torres"
          aria-label="Torres: escolha uma cor e empilhe">
          <span class="blocos-mode-card__badge" aria-hidden="true">🏗️</span>
          <span class="blocos-mode-card__figure" aria-hidden="true">
            <span class="blocos-figure-towers">
              <span class="blocos-figure-towers__col"><i></i><i></i></span>
              <span class="blocos-figure-towers__col blocos-figure-towers__col--tall"><i></i><i></i><i></i></span>
              <span class="blocos-figure-towers__col"><i></i></span>
            </span>
          </span>
          <span class="blocos-mode-card__steps" aria-hidden="true">
            <span>1️⃣🎨</span><span>2️⃣🗼</span>
          </span>
        </button>
      </div>
      <p class="hint blocos-hint-caregiver">Adulto: escolha o modo pelo desenho — 🧩 encaixar cores · 🏗️ empilhar torres.</p>
    </div>`;
}

function hintEncaixarVisual() {
  return `
    <div class="blocos-play-hint" aria-hidden="true">
      <span class="blocos-play-hint__chip">1️⃣ <span class="blocos-play-hint__emoji">🧱</span></span>
      <span class="blocos-play-hint__then">➡️</span>
      <span class="blocos-play-hint__chip">2️⃣ <span class="blocos-play-hint__emoji">🎯</span></span>
    </div>
    <p class="hint blocos-hint-caregiver">Mesma cor no bloco e no lugar tracejado.</p>`;
}

function hintTorresVisual() {
  return `
    <div class="blocos-play-hint" aria-hidden="true">
      <span class="blocos-play-hint__chip">1️⃣ <span class="blocos-play-hint__emoji">🎨</span></span>
      <span class="blocos-play-hint__then">➡️</span>
      <span class="blocos-play-hint__chip">2️⃣ <span class="blocos-play-hint__emoji">🗼</span></span>
    </div>
    <p class="hint blocos-hint-caregiver">Toque na cor, depois na base da torre. 🔻 tira um andar · 🗑️ limpa tudo.</p>`;
}

function bindModeSwitch(ctx, signal, activeMode) {
  ctx.view.querySelectorAll("[data-blocos-mode]").forEach((tab) => {
    bindPress(
      tab,
      () => {
        const mode = tab.dataset.blocosMode;
        if (mode === activeMode || ctx.won) return;
        if (mode === "torres") mountTorresMode(ctx);
        else runEncaixarCampaign(ctx);
      },
      signal,
    );
  });
}

function mountTorresMode(ctx) {
  const signal = ctx.beginPhase();
  const towers = Array.from({ length: TOWER_COUNT }, () => []);
  let pickedColor = null;

  const towerCols = Array.from({ length: TOWER_COUNT }, (_, index) => {
    const n = index + 1;
    return `
      <div class="block-tower-col">
        <button type="button" class="block-tower-pop" data-pop-tower="${index}"
          aria-label="Tirar bloco do topo da torre ${n}">
          <span aria-hidden="true">🔻</span>
        </button>
        <div class="block-tower-stack" data-tower-stack="${index}" role="group" aria-label="Torre ${n}"></div>
        <button type="button" class="block-tower-base" data-tower="${index}"
          aria-label="Empilhar na torre ${n}">
          <span class="block-tower-base__ico" aria-hidden="true">🗼</span>
        </button>
      </div>`;
  }).join("");

  const trayMarkup = COLORS.map(
    (c) =>
      `<button type="button" class="block-piece block-piece--free" data-pick-color="${c.id}"
        aria-label="Cor ${c.label}" style="--block:${c.hex}">
        <span class="block-piece__emoji" aria-hidden="true">${COLOR_EMOJI[c.id] ?? "🟫"}</span>
      </button>`,
  ).join("");

  ctx.mountPhase(`
    ${blocosModeNav("torres")}
    ${hintTorresVisual()}
    <p class="blocos-tray-label" aria-hidden="true">🎨</p>
    <div class="block-tower-yard" data-tower-yard>
      ${towerCols}
    </div>
    <div class="block-tray block-tray--free" data-tray>${trayMarkup}</div>
    <div class="blocos-tower-actions">
      <button type="button" class="btn blocos-clear-btn" data-clear-towers aria-label="Limpar todas as torres">
        <span aria-hidden="true">🗑️</span>
      </button>
    </div>
  `);

  bindModeSwitch(ctx, signal, "torres");

  const renderTowers = () => {
    for (let t = 0; t < TOWER_COUNT; t += 1) {
      const stackEl = ctx.view.querySelector(`[data-tower-stack="${t}"]`);
      const baseBtn = ctx.view.querySelector(`[data-tower="${t}"]`);
      const popBtn = ctx.view.querySelector(`[data-pop-tower="${t}"]`);
      if (!stackEl || !baseBtn) continue;

      stackEl.innerHTML = towers[t]
        .map(
          (colorId, floor) =>
            `<span class="block-stack-piece" style="--block:${colorOf(colorId).hex}" aria-hidden="true" data-floor="${floor}"></span>`,
        )
        .join("");

      const height = towers[t].length;
      baseBtn.classList.toggle("is-highlight", pickedColor !== null);
      baseBtn.disabled = pickedColor === null;
      baseBtn.setAttribute("aria-disabled", pickedColor === null ? "true" : "false");
      popBtn.disabled = height === 0;
      stackEl.setAttribute("aria-label", `Torre ${t + 1}, ${height} andar${height === 1 ? "" : "es"}`);
    }

    ctx.view.querySelectorAll("[data-pick-color]").forEach((piece) => {
      piece.classList.toggle("is-selected", pickedColor === piece.dataset.pickColor);
    });
  };

  const placeOnTower = (towerIndex) => {
    if (!pickedColor || ctx.won) return;
    if (towers[towerIndex].length >= MAX_TOWER_FLOORS) {
      ctx.feedback("Esta torre chegou no topo! Tente outra torre.", "no");
      return;
    }
    towers[towerIndex].push(pickedColor);
    playSfx("ok");
    ctx.haptic("light");
    renderTowers();
  };

  const popTower = (towerIndex) => {
    if (!towers[towerIndex].length || ctx.won) return;
    towers[towerIndex].pop();
    playSfx("ok");
    renderTowers();
  };

  ctx.view.querySelectorAll("[data-pick-color]").forEach((piece) => {
    bindPress(
      piece,
      () => {
        if (ctx.won) return;
        pickedColor = piece.dataset.pickColor;
        renderTowers();
      },
      signal,
    );
  });

  ctx.view.querySelectorAll("[data-tower]").forEach((base) => {
    bindPress(
      base,
      () => {
        placeOnTower(Number(base.dataset.tower));
      },
      signal,
    );
  });

  ctx.view.querySelectorAll("[data-pop-tower]").forEach((btn) => {
    bindPress(
      btn,
      () => {
        popTower(Number(btn.dataset.popTower));
      },
      signal,
    );
  });

  const clearBtn = ctx.view.querySelector("[data-clear-towers]");
  if (clearBtn) {
    bindPress(
      clearBtn,
      () => {
        for (let t = 0; t < TOWER_COUNT; t += 1) towers[t] = [];
        playSfx("ok");
        ctx.feedback("Torres limpas! Comece de novo.", "ok");
        renderTowers();
      },
      signal,
    );
  }

  renderTowers();
}

function runEncaixarCampaign(ctx) {
  const totalPhases = phaseTotal(ctx);
  const specs =
    ctx.e2e && !ctx.e2eFull
      ? PHASES.slice(0, totalPhases)
      : PHASES.slice(0, totalPhases).map((phase) => ({
          ...phase,
          slots: pickUnique(COLORS, phase.slots.length, ctx.random).map((color) => color.id),
        }));

  const runPhase = (phaseIndex) => {
    const signal = ctx.beginPhase();
    const spec = specs[phaseIndex];
    const placed = new Array(spec.slots.length).fill(null);
    const usedTray = new Set();
    let picked = null;
    const tray = shuffleBlocks(ctx, spec.slots);

    const slotMarkup = spec.slots
      .map((colorId, index) => {
        const c = colorOf(colorId);
        const emoji = COLOR_EMOJI[colorId] ?? "⬜";
        return `<button type="button" class="block-slot" data-slot="${index}" data-want="${colorId}" aria-label="Lugar para bloco ${c.label}" style="--hint:${c.hex}33;--want:${c.hex}">
          <span class="block-slot__want" aria-hidden="true">${emoji}</span>
          <span class="block-slot__swatch" aria-hidden="true"></span>
        </button>`;
      })
      .join("");

    const trayMarkup = tray
      .map(
        (colorId, index) =>
          `<button type="button" class="block-piece" data-tray="${index}" data-color="${colorId}" aria-label="Bloco ${colorOf(colorId).label}" style="--block:${colorOf(colorId).hex}">
            <span class="block-piece__emoji" aria-hidden="true">${COLOR_EMOJI[colorId] ?? "🟫"}</span>
          </button>`,
      )
      .join("");

    ctx.mountPhase(`
      ${blocosModeNav("encaixar")}
      ${phaseBanner(phaseIndex, totalPhases)}
      ${hintEncaixarVisual()}
      <p class="blocos-tray-label" aria-hidden="true">🧱</p>
      <div class="block-board block-board--${spec.layout}" data-board>
        ${slotMarkup}
      </div>
      <div class="block-tray" data-tray>${trayMarkup}</div>
    `);

    bindModeSwitch(ctx, signal, "encaixar");

    const refresh = () => {
      spec.slots.forEach((colorId, index) => {
        const slot = ctx.view.querySelector(`[data-slot="${index}"]`);
        const filled = placed[index];
        slot.classList.toggle("is-filled", Boolean(filled));
        slot.classList.toggle("is-selected", picked === `slot-${index}`);
        slot.classList.toggle("has-target-hint", !filled);
        if (filled) {
          slot.style.setProperty("--block", colorOf(filled).hex);
          slot.dataset.filled = filled;
        } else {
          slot.removeAttribute("data-filled");
        }
      });

      tray.forEach((colorId, index) => {
        const piece = ctx.view.querySelector(`[data-tray="${index}"]`);
        const used = usedTray.has(index);
        piece.classList.toggle("is-used", used);
        piece.classList.toggle("is-selected", picked === `tray-${index}`);
        piece.disabled = used;
        piece.setAttribute("aria-hidden", used ? "true" : "false");
      });

      if (placed.every((p, i) => p === spec.slots[i])) {
        completePhase(ctx, phaseIndex, totalPhases, runPhase, "Todas as torres de blocos ficaram certinhas!");
      }
    };

    const tryPlace = (slotIndex, trayIndex, colorId) => {
      if (placed[slotIndex]) return;
      const slot = ctx.view.querySelector(`[data-slot="${slotIndex}"]`);
      const fits = spec.slots[slotIndex] === colorId;
      onChoice(ctx, slot, fits, {
        noText: "Esse bloco não encaixa aqui. Tente outro lugar!",
        okText: "Encaixou!",
        onWrong: () => {
          picked = null;
          refresh();
        },
        onCorrect: () => {
          placed[slotIndex] = colorId;
          usedTray.add(trayIndex);
          picked = null;
          refresh();
        },
      });
    };

    ctx.view.querySelectorAll(".block-piece").forEach((piece) => {
      bindPress(
        piece,
        () => {
          if (piece.disabled || piece.classList.contains("is-used") || ctx.won) return;
          const trayIndex = Number(piece.dataset.tray);
          if (picked?.startsWith("slot-")) {
            const slotIndex = Number(picked.replace("slot-", ""));
            tryPlace(slotIndex, trayIndex, tray[trayIndex]);
            return;
          }
          picked = `tray-${trayIndex}`;
          refresh();
        },
        signal,
      );
    });

    ctx.view.querySelectorAll("[data-slot]").forEach((slot) => {
      bindPress(
        slot,
        () => {
          if (ctx.won) return;
          const index = Number(slot.dataset.slot);
          if (picked?.startsWith("tray-")) {
            const trayIndex = Number(picked.replace("tray-", ""));
            tryPlace(index, trayIndex, tray[trayIndex]);
          } else {
            picked = `slot-${index}`;
            refresh();
          }
        },
        signal,
      );
    });

    refresh();
  };

  runPhase(0);
}

export const blocos = {
  id: "blocos",
  title: "Blocos",
  goal: "Encaixar cores ou empilhar torres livres",
  mount(ctx) {
    if (ctx.e2e) {
      runEncaixarCampaign(ctx);
      return;
    }
    const signal = ctx.beginPhase();
    ctx.mountPhase(blocosIntroMarkup());

    ctx.view.querySelectorAll("[data-blocos-start]").forEach((btn) => {
      bindPress(
        btn,
        () => {
          const mode = btn.dataset.blocosStart;
          if (mode === "torres") mountTorresMode(ctx);
          else runEncaixarCampaign(ctx);
        },
        signal,
      );
    });
  },
};
