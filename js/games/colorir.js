import { bindPress, speakPortuguese } from "../engine.js";
import { onChoice } from "../lib/gameActions.js";
import { completePhase, phaseBanner, phaseTotal } from "../lib/phases.js";
import { rotateList } from "../lib/playVariety.js";
import { SCENES, SCENE_EMOJI } from "./colorir-scenes.js";

/** Paleta completa — uma fileira, toque para pintar e para o potinho. */
const PALETTE = [
  { id: "vermelho", hex: "#ff4d4d", label: "Vermelho" },
  { id: "laranja", hex: "#ff8a1e", label: "Laranja" },
  { id: "amarelo", hex: "#ffe14a", label: "Amarelo" },
  { id: "verde", hex: "#3cce6e", label: "Verde" },
  { id: "azul", hex: "#3d8bfd", label: "Azul" },
  { id: "roxo", hex: "#9b6bff", label: "Roxo" },
  { id: "rosa", hex: "#ff9db5", label: "Rosa" },
  { id: "marrom", hex: "#c4885a", label: "Marrom" },
  { id: "preto", hex: "#2b2a4a", label: "Preto" },
  { id: "branco", hex: "#ffffff", label: "Branco" },
];

const MIXES = {
  "amarelo+vermelho": { name: "laranja", hex: "#ff8a1e", label: "Laranja" },
  "amarelo+azul": { name: "verde", hex: "#3cce6e", label: "Verde" },
  "azul+vermelho": { name: "roxo", hex: "#9b6bff", label: "Roxo" },
  "branco+vermelho": { name: "rosa", hex: "#ff9db5", label: "Rosa" },
  "amarelo+branco": { name: "amarelo clarinho", hex: "#fff3a1", label: "Amarelo clarinho" },
  "azul+branco": { name: "azul clarinho", hex: "#a9d4ff", label: "Azul clarinho" },
};

const INK = "#2b2a4a";

const ERASER_ICON = `<svg class="eraser-icon" viewBox="0 0 64 64" aria-hidden="true" focusable="false">
  <path d="M12 44 L28 18 L52 32 L36 58 Z" fill="#ff9db5" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
  <path d="M28 18 L36 10 L52 24 L44 32 Z" fill="#fff3bf" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/>
  <rect x="8" y="46" width="48" height="8" rx="3" fill="#dee2e6" stroke="${INK}" stroke-width="2"/>
</svg>`;

const PHASES = [
  { scene: "borboleta", regions: ["asa-esquerda", "asa-direita"], requireMix: false },
  { scene: "casa", regions: ["telhado", "parede", "porta"], requireMix: false },
  { scene: "flor", regions: ["petala-n", "petala-s", "centro", "caule"], requireMix: true },
];

const E2E_PHASE = { scene: "borboleta", regions: ["asa-esquerda", "asa-direita", "corpo"], requireMix: true };

function mixKey(first, second) {
  return [first, second].sort().join("+");
}

function paletteColor(colorId) {
  return PALETTE.find((item) => item.id === colorId) ?? null;
}

function blendHex(hexA, hexB) {
  const channel = (hex, start) => Number.parseInt(hex.slice(start, start + 2), 16);
  const mix = (a, b) => Math.round((a + b) / 2);
  const r = mix(channel(hexA, 1), channel(hexB, 1));
  const g = mix(channel(hexA, 3), channel(hexB, 3));
  const b = mix(channel(hexA, 5), channel(hexB, 5));
  return `#${[r, g, b].map((value) => value.toString(16).padStart(2, "0")).join("")}`;
}

function resolveMix(first, second) {
  const known = MIXES[mixKey(first.id, second.id)];
  if (known) return known;
  return {
    label: `${first.label} com ${second.label}`,
    hex: blendHex(first.hex, second.hex),
  };
}

function sceneSvg(scene) {
  return `<svg class="coloring color-scene" viewBox="${scene.viewBox}" role="group" aria-label="${scene.aria}">${scene.markup}</svg>`;
}

export const colorir = {
  id: "colorir",
  title: "Colorir",
  goal: "Misturar cores e pintar",
  mount(ctx) {
    const totalPhases = phaseTotal(ctx);
    const specs =
      ctx.e2e && !ctx.e2eFull
        ? [E2E_PHASE]
        : rotateList(PHASES, ctx.runIndex).slice(0, totalPhases);

    const runPhase = (phaseIndex) => {
      const signal = ctx.beginPhase();
      const spec = specs[phaseIndex];
      let activeSceneId = spec.scene;
      let selected = null;
      const slots = [null, null];
      let usedMix = false;

      const mountScene = () => {
        const scene = SCENES[activeSceneId];
        const stage = ctx.view.querySelector("[data-color-stage]");
        if (stage) {
          stage.dataset.scene = activeSceneId;
          stage.innerHTML = sceneSvg(scene);
        }
        ctx.view.querySelectorAll("[data-scene-pick]").forEach((btn) => {
          btn.setAttribute("aria-pressed", String(btn.dataset.scenePick === activeSceneId));
        });
        bindRegions();
      };

      const potButton = () => ctx.view.querySelector("[data-pot]");

      const bindRegions = () => {
        ctx.view.querySelectorAll("[data-region]").forEach((region) => {
          bindPress(
            region,
            () => {
              if (ctx.won) return;
              const regionId = region.dataset.region;
              const isMeta = activeSceneId === spec.scene && spec.regions.includes(regionId);
              if (!selected) {
                onChoice(ctx, region, false, { noText: "Escolhe uma cor na paleta." });
                return;
              }
              if (isMeta && spec.requireMix && selected.id !== "mistura") {
                onChoice(ctx, region, false, { noText: "Mistura duas cores no potinho primeiro." });
                return;
              }
              const paintTargets = [...ctx.view.querySelectorAll(`[data-region="${regionId}"]`)];
              for (const target of paintTargets) {
                target.setAttribute("fill", selected.hex);
                target.style.fill = selected.hex;
                target.dataset.painted = "1";
                target.classList.add("is-painted");
              }
              onChoice(ctx, region, true, {
                okText: "Que cor bonita!",
                onCorrect: () => {
                  if (isMeta) checkDone();
                },
              });
            },
            signal,
          );
        });
      };

      ctx.mountPhase(`
        <div class="colorir-layout">
          ${phaseBanner(phaseIndex, totalPhases)}
          <p class="hint" data-hint>${spec.requireMix ? "Misture no potinho e pinte o desenho da meta." : `Pinte ${spec.regions.length} partes do desenho da meta.`}</p>
          <div class="scene-picker" role="group" aria-label="Escolher desenho">
            ${Object.keys(SCENES)
              .map(
                (id) =>
                  `<button type="button" class="scene-pick" data-scene-pick="${id}" aria-pressed="${id === activeSceneId}" aria-label="${SCENES[id].label}"><span aria-hidden="true">${SCENE_EMOJI[id]}</span></button>`,
              )
              .join("")}
          </div>
          <p class="catch-line">Meta da fase: ${SCENES[spec.scene].label} ${SCENE_EMOJI[spec.scene]}</p>
          <div class="color-stage" data-color-stage data-scene="${activeSceneId}">${sceneSvg(SCENES[activeSceneId])}</div>
          <p class="current-paint">Cor na ponta <i data-current-color></i></p>
          <div class="palette palette-row" role="group" aria-label="Paleta de cores">
            ${PALETTE.map(
              (color) =>
                `<button type="button" class="swatch-chip" data-ink="${color.id}" style="--swatch:${color.hex};background-color:${color.hex}" aria-label="${color.label}" aria-pressed="false"></button>`,
            ).join("")}
          </div>
          <div class="pot-block">
            <div class="pot pot-compact" role="group" aria-label="Potinho para misturar">
              <button type="button" class="pot-slot" data-pot-slot="0" aria-label="Primeiro potinho">?</button>
              <span class="pot-sign" aria-hidden="true">+</span>
              <button type="button" class="pot-slot" data-pot-slot="1" aria-label="Segundo potinho">?</button>
            </div>
            <p class="mix-line" data-mix-result>Escolha duas cores no potinho</p>
            <div class="pot-actions">
              <button type="button" class="btn pot-btn pot-btn-compact" data-pot>Por no potinho</button>
              <button type="button" class="eraser-chip eraser-pot" data-clear-pot aria-label="Borracha, limpar potinho">${ERASER_ICON}</button>
            </div>
          </div>
        </div>
      `);

      const result = ctx.view.querySelector("[data-mix-result]");
      const current = ctx.view.querySelector("[data-current-color]");
      const paintTip = (hex) => {
        if (current) current.style.background = hex;
      };

      const renderSlots = () => {
        slots.forEach((slot, index) => {
          const element = ctx.view.querySelector(`[data-pot-slot="${index}"]`);
          if (!element) return;
          const filled = Boolean(slot);
          element.textContent = filled ? slot.label : "?";
          element.style.setProperty("--pot-fill", filled ? slot.hex : "#ffffff");
          element.style.backgroundColor = filled ? slot.hex : "#ffffff";
          element.style.color = INK;
          element.dataset.filled = filled ? "1" : "0";
          element.setAttribute(
            "aria-label",
            filled
              ? `${slot.label} no potinho ${index + 1}`
              : index === 0
                ? "Primeiro potinho"
                : "Segundo potinho",
          );
        });
      };

      const resolveFillIndex = (targetIndex) => {
        const wantsSlot =
          targetIndex === 0 || targetIndex === 1 ? targetIndex : null;
        if (wantsSlot === 1 && !slots[0]) {
          return { error: "need-first" };
        }
        if (wantsSlot !== null) {
          if (slots[wantsSlot]) {
            return { error: "slot-full", slot: wantsSlot };
          }
          return { index: wantsSlot };
        }
        if (!slots[0]) return { index: 0 };
        if (!slots[1]) return { index: 1 };
        return { error: "both-full" };
      };

      const finalizeMix = () => {
        if (!slots[0] || !slots[1]) return;
        const mixed = resolveMix(slots[0], slots[1]);
        const phrase = `${slots[0].label} com ${slots[1].label} faz ${mixed.label}`;
        result.textContent = phrase;
        result.style.background = mixed.hex;
        result.style.color = INK;
        selected = { id: "mistura", hex: mixed.hex, label: mixed.label };
        usedMix = true;
        paintTip(mixed.hex);
        speakPortuguese(phrase);
        ctx.feedback(phrase, "ok");
        slots[0] = null;
        slots[1] = null;
        renderSlots();
        ctx.view.querySelectorAll(".swatch-chip").forEach((swatch) => {
          swatch.setAttribute("aria-pressed", "false");
        });
      };

      const pourIntoPot = (targetIndex = null, originButton = null) => {
        if (ctx.won) return;
        const feedbackBtn = originButton ?? potButton();
        if (!selected || selected.id === "mistura") {
          onChoice(ctx, feedbackBtn, false, { noText: "Escolhe uma cor na paleta para o potinho." });
          return;
        }
        const fromPalette = paletteColor(selected.id);
        if (!fromPalette) {
          onChoice(ctx, feedbackBtn, false, { noText: "Escolhe uma cor na paleta." });
          return;
        }
        const color = { ...fromPalette };
        const slotPick = resolveFillIndex(targetIndex);

        if (slotPick.error === "need-first") {
          onChoice(ctx, feedbackBtn, false, { noText: "Primeiro potinho primeiro!" });
          return;
        }
        if (slotPick.error === "slot-full") {
          const which = slotPick.slot === 0 ? "primeiro" : "segundo";
          onChoice(ctx, feedbackBtn, false, {
            noText: `O ${which} potinho já tem cor. Toca no outro.`,
          });
          return;
        }
        if (slotPick.error === "both-full") {
          finalizeMix();
          return;
        }

        const fillIndex = slotPick.index;

        slots[fillIndex] = color;
        renderSlots();
        onChoice(ctx, feedbackBtn, true, { okText: `${color.label} no potinho ${fillIndex + 1}.` });

        if (result && slots[0] && !slots[1]) {
          result.textContent = "Agora a segunda cor no segundo potinho";
        }

        if (slots[0] && slots[1]) {
          ctx.later(() => {
            if (!ctx.alive || ctx.won) return;
            finalizeMix();
          }, ctx.e2e ? 600 : 450);
        }
      };

      const checkDone = () => {
        if (activeSceneId !== spec.scene) {
          ctx.feedback(`Toque em ${SCENE_EMOJI[spec.scene]} para pintar a meta da fase.`, "no");
          return;
        }
        const needed = spec.regions.every((id) => {
          const parts = ctx.view.querySelectorAll(`[data-region="${id}"]`);
          return parts.length > 0 && [...parts].every((part) => part.dataset.painted === "1");
        });
        if (!needed) return;
        if (spec.requireMix && !usedMix) {
          ctx.feedback("Misture duas cores no potinho!", "no");
          return;
        }
        completePhase(ctx, phaseIndex, totalPhases, runPhase, "Seus desenhos ficaram lindos!");
      };

      const clearPot = () => {
        if (ctx.won) return;
        const hadColor = slots[0] || slots[1];
        const hadMixBrush = selected?.id === "mistura";
        slots[0] = null;
        slots[1] = null;
        renderSlots();
        if (result) {
          result.textContent = "Escolha duas cores no potinho";
          result.style.background = "#fff";
          result.style.color = INK;
        }
        if (hadMixBrush) {
          selected = null;
          paintTip("#ffffff");
          ctx.view.querySelectorAll(".swatch-chip").forEach((swatch) => {
            swatch.setAttribute("aria-pressed", "false");
          });
          if (spec.requireMix) usedMix = false;
        }
        ctx.feedback(hadColor ? "Potinho limpo!" : "O potinho já está vazio.", hadColor ? "ok" : "no");
      };

      const selectColor = (color, button) => {
        onChoice(ctx, button, true, {
          okText: `${color.label} na ponta.`,
          onCorrect: () => {
            selected = { ...color };
            paintTip(color.hex);
            ctx.view.querySelectorAll(".swatch-chip").forEach((swatch) => {
              swatch.setAttribute("aria-pressed", String(swatch === button));
            });
          },
        });
      };

      bindPress(ctx.view.querySelector("[data-clear-pot]"), () => clearPot(), signal);

      for (const color of PALETTE) {
        const button = ctx.view.querySelector(`[data-ink="${color.id}"]`);
        bindPress(
          button,
          () => {
            if (ctx.won) return;
            selectColor(color, button);
          },
          signal,
        );
      }

      const mainPot = ctx.view.querySelector("[data-pot]");
      bindPress(mainPot, () => pourIntoPot(null, mainPot), signal);

      ctx.view.querySelectorAll("[data-pot-slot]").forEach((slotButton) => {
        bindPress(
          slotButton,
          () => pourIntoPot(Number(slotButton.dataset.potSlot), slotButton),
          signal,
        );
      });

      ctx.view.querySelectorAll("[data-scene-pick]").forEach((button) => {
        bindPress(
          button,
          () => {
            if (ctx.won) return;
            activeSceneId = button.dataset.scenePick;
            mountScene();
          },
          signal,
        );
      });

      bindRegions();
      renderSlots();
    };

    runPhase(0);
  },
};
