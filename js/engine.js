/**
 * Motor de comportamento do GameMix.
 * Une ponteiro, toque, ciclo de vida dos jogos e o laço de movimento.
 */

import {
  feedbackLine,
  gameEntryLines,
  HOME_LINE,
  phaseStartLine,
  winLine,
} from "./lib/narrator.js";
import {
  afterPhaseRender,
  createRunStats,
  haptic,
  markError,
  markSuccess,
  mountPhase,
  updateStreakDisplay,
} from "./lib/gameExperience.js";
import { hashSeed } from "./lib/playVariety.js";
import {
  installSpeechVoiceListener,
  pickSpeechVoice,
  refreshSpeechVoices,
  SPEAK_AFTER_CANCEL_MS,
  wakeSpeechSynthesis,
} from "./lib/speechPlatform.js";

installSpeechVoiceListener();

const STORE_KEY = "gamemix-progress-v1";
const HOME_TITLE = "GameMix — jogos infantis";

const searchParams = new URLSearchParams(location.search);
export const E2E = searchParams.has("e2e");
/** Testes longos: campanha completa (`?e2e=1&e2eFull=1`). */
export const E2E_FULL = E2E && searchParams.has("e2eFull");

let soundOn = true;
let audioCtx = null;
let speechQueue = [];
let speechBusy = false;

export function createSeededRandom(seed) {
  let state = seed >>> 0;
  return function next() {
    state = (Math.imul(1664525, state) + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

export function shuffle(list, random = Math.random) {
  const next = [...list];
  for (let index = next.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(random() * (index + 1));
    const current = next[index];
    next[index] = next[swap];
    next[swap] = current;
  }
  return next;
}

export function loadProgress() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return { stars: 0 };
    const data = JSON.parse(raw);
    return { stars: Number(data.stars) || 0 };
  } catch {
    return { stars: 0 };
  }
}

export function addStars(amount) {
  const progress = loadProgress();
  progress.stars += amount;
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(progress));
  } catch {
    /* o placar segue só nesta visita */
  }
  return progress.stars;
}

export function setSound(enabled) {
  soundOn = enabled;
  if (!enabled) silence();
}

export function silence() {
  speechQueue = [];
  speechBusy = false;
  if (typeof speechSynthesis === "undefined") return;
  try {
    speechSynthesis.cancel();
  } catch {
    /* sem voz neste aparelho */
  }
}

function drainSpeechQueue() {
  if (speechBusy || speechQueue.length === 0) return;
  if (!soundOn || E2E || typeof speechSynthesis === "undefined") {
    speechQueue = [];
    return;
  }
  const voices = refreshSpeechVoices();
  if (!voices.length) {
    const once = () => {
      speechSynthesis.removeEventListener("voiceschanged", once);
      drainSpeechQueue();
    };
    try {
      speechSynthesis.addEventListener("voiceschanged", once);
    } catch {
      /* segue sem voz */
    }
    window.setTimeout(() => {
      speechSynthesis.removeEventListener("voiceschanged", once);
      if (!speechBusy && speechQueue.length) drainSpeechQueue();
    }, 600);
    return;
  }
  const next = speechQueue.shift();
  if (!next) {
    drainSpeechQueue();
    return;
  }
  speechBusy = true;
  try {
    wakeSpeechSynthesis();
    const utter = new SpeechSynthesisUtterance(next.text);
    utter.lang = next.lang;
    utter.rate = next.lang.startsWith("en") ? 0.82 : 0.88;
    utter.pitch = 1.05;
    utter.volume = 1;
    const voice = pickSpeechVoice(next.lang);
    if (voice) utter.voice = voice;
    const done = () => {
      speechBusy = false;
      drainSpeechQueue();
    };
    utter.onend = done;
    utter.onerror = done;
    speechSynthesis.speak(utter);
    if (speechSynthesis.paused) {
      try {
        speechSynthesis.resume();
      } catch {
        /* ignorar */
      }
    }
  } catch {
    speechBusy = false;
    drainSpeechQueue();
  }
}

function enqueueSpeech(line, lang, { replace = false } = {}) {
  if (replace) {
    try {
      speechSynthesis.cancel();
    } catch {
      /* segue */
    }
    speechQueue = [];
    speechBusy = false;
  }
  speechQueue.push({ text: line, lang });
  if (replace && SPEAK_AFTER_CANCEL_MS > 0) {
    window.setTimeout(() => drainSpeechQueue(), SPEAK_AFTER_CANCEL_MS);
  } else {
    drainSpeechQueue();
  }
}

/** Fala com voz do sistema (respeita Som ligado; em e2e só grava data-spoken). */
export function speakAloud(text, lang = "pt-BR", { replace = false, trackDataset = true } = {}) {
  const line = String(text ?? "").trim();
  if (!line) return;
  if (trackDataset) {
    document.documentElement.dataset.spoken = line;
    document.documentElement.dataset.spokenLang = lang;
  }
  prepareSpeechForUserGesture();
  if (!soundOn || E2E || typeof speechSynthesis === "undefined") return;
  enqueueSpeech(line, lang, { replace });
}

/** Toque do usuário — prepara áudio e voz antes de falar (Safari / iOS). */
export function prepareSpeechForUserGesture() {
  unlockAudio();
  wakeSpeechSynthesis();
  refreshSpeechVoices();
}

export function speakPortuguese(text) {
  speakAloud(text, "pt-BR");
}

export function bindPress(element, action, signal) {
  if (!element) return;
  let locked = false;
  let lastRunAt = 0;
  const run = () => {
    const now = performance.now();
    if (locked || now - lastRunAt < 60) return;
    locked = true;
    lastRunAt = now;
    queueMicrotask(() => {
      locked = false;
    });
    action();
  };

  element.addEventListener(
    "pointerdown",
    (event) => {
      if (event.button !== 0) return;
      const pointerId = event.pointerId;
      let settled = false;
      const finish = (endEvent) => {
        if (settled || endEvent.pointerId !== pointerId) return;
        settled = true;
        run();
      };
      const cancel = (endEvent) => {
        if (endEvent.pointerId !== pointerId) return;
        settled = true;
      };
      try {
        element.setPointerCapture(pointerId);
      } catch {
        /* captura opcional; pointerup na janela cobre o resto */
      }
      window.addEventListener("pointerup", finish, { once: true, signal });
      window.addEventListener("pointercancel", cancel, { once: true, signal });
    },
    { signal },
  );

  element.addEventListener(
    "click",
    (event) => {
      if (event.button !== 0) return;
      run();
    },
    { signal },
  );

  element.addEventListener(
    "keydown",
    (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      run();
    },
    { signal },
  );
}

/**
 * Toque imediato no pointerdown — evita pointercancel em botões de movimento (Safari / scroll).
 */
export function bindInstantPress(element, action, signal) {
  if (!element) return;
  let lastRunAt = 0;
  const run = (event) => {
    const now = performance.now();
    if (now - lastRunAt < 70) return;
    lastRunAt = now;
    event?.preventDefault?.();
    action();
  };
  element.addEventListener(
    "pointerdown",
    (event) => {
      if (event.button !== 0) return;
      run(event);
    },
    { signal, passive: false },
  );
  element.addEventListener(
    "click",
    (event) => {
      if (event.button !== 0) return;
      run(event);
    },
    { signal },
  );
}

/** Um toque = um passo de pista; deduplica pointerdown + click fantasma no mobile. */
export function bindLaneSteer(element, action, signal, { tapGapMs = 88 } = {}) {
  if (!element) return;
  let lastFireAt = 0;
  let ignoreClickUntil = 0;

  const fire = (event) => {
    const now = performance.now();
    if (event?.type === "click" && now < ignoreClickUntil) {
      event.preventDefault();
      return;
    }
    if (now - lastFireAt < tapGapMs) {
      event?.preventDefault?.();
      return;
    }
    lastFireAt = now;
    if (event?.type === "pointerdown") {
      ignoreClickUntil = now + 420;
      try {
        element.setPointerCapture(event.pointerId);
      } catch {
        /* opcional */
      }
    }
    event?.preventDefault?.();
    action();
  };

  element.addEventListener(
    "pointerdown",
    (event) => {
      if (event.button !== 0) return;
      fire(event);
    },
    { signal, passive: false },
  );
  element.addEventListener(
    "click",
    (event) => {
      if (event.button !== 0) return;
      fire(event);
    },
    { signal },
  );
  element.addEventListener(
    "keydown",
    (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      fire(event);
    },
    { signal },
  );
}

function toneContext() {
  if (E2E || !soundOn || typeof AudioContext === "undefined") return null;
  if (!audioCtx) audioCtx = new AudioContext();
  if (audioCtx.state === "suspended") void audioCtx.resume();
  return audioCtx;
}

export function unlockAudio() {
  toneContext();
  wakeSpeechSynthesis();
}

function playTone(kind) {
  const context = toneContext();
  if (!context) return;
  const specs = {
    ok: { freq: 660, dur: 0.12, type: "sine" },
    no: { freq: 220, dur: 0.14, type: "sine" },
    win: { freq: 523, dur: 0.28, type: "triangle" },
    laser: { freq: 920, dur: 0.05, type: "square" },
    boom: { freq: 140, dur: 0.18, type: "sawtooth" },
  };
  const spec = specs[kind];
  if (!spec) return;
  const osc = context.createOscillator();
  const gain = context.createGain();
  osc.type = spec.type;
  osc.frequency.value = spec.freq;
  gain.gain.setValueAtTime(0.0001, context.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.07, context.currentTime + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + spec.dur);
  osc.connect(gain).connect(context.destination);
  osc.start();
  osc.stop(context.currentTime + spec.dur + 0.02);
  if (kind === "win") {
    const second = context.createOscillator();
    const secondGain = context.createGain();
    second.type = "sine";
    second.frequency.value = 784;
    secondGain.gain.setValueAtTime(0.0001, context.currentTime + 0.12);
    secondGain.gain.exponentialRampToValueAtTime(0.06, context.currentTime + 0.16);
    secondGain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.42);
    second.connect(secondGain).connect(context.destination);
    second.start(context.currentTime + 0.12);
    second.stop(context.currentTime + 0.46);
  }
}

export function playSfx(kind) {
  playTone(kind);
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (char) => {
    if (char === "&") return "&amp;";
    if (char === "<") return "&lt;";
    if (char === ">") return "&gt;";
    if (char === '"') return "&quot;";
    return "&#39;";
  });
}

function confettiMarkup() {
  const colors = ["#ffe14a", "#ff5d73", "#4dabf7", "#3dce8b", "#9775fa", "#ff8a1e"];
  return Array.from({ length: 14 }, (_, index) => {
    const color = colors[index % colors.length];
    return `<i style="--i:${index};--c:${color}"></i>`;
  }).join("");
}

export class BehaviorEngine {
  constructor({ root, onStars }) {
    this.root = root;
    this.onStars = onStars;
    this.onExit = null;
    this.games = new Map();
    this.current = null;
    this._tickers = new Set();
    this._loop = this._loop.bind(this);
    this._frame = 0;
  }

  register(game) {
    this.games.set(game.id, game);
  }

  start(id) {
    if (this.current?.id === id) return;
    this.stop();
    const game = this.games.get(id);
    if (!game) return;

    this.root.innerHTML = "";
    const shell = document.createElement("section");
    shell.className = "game-shell";
    shell.dataset.gameShell = id;
    shell.setAttribute("aria-labelledby", "game-title");
    shell.innerHTML = `
      <header class="game-top">
        <button type="button" class="btn btn-back" data-action="back" aria-label="Voltar"><span class="btn-back-arrow" aria-hidden="true">←</span></button>
        <div class="game-heading">
          <h2 id="game-title">${escapeHtml(game.title)}</h2>
          <p class="learn-goal" data-goal>${escapeHtml(game.goal)}</p>
        </div>
      </header>
      <div class="game-view" data-game-view></div>
      <p class="feedback" data-feedback role="status"></p>
    `;
    this.root.appendChild(shell);
    shell.querySelector("[data-action=back]").addEventListener("click", () => {
      this.onExit?.();
    });

    const ctx = this._makeCtx(shell, id, 0);
    shell.dataset.runIndex = "0";
    this.current = { id, game, ctx, shell, runIndex: 0 };
    game.mount(ctx);
    document.title = `${game.title} — GameMix`;
    unlockAudio();
    gameEntryLines(game).forEach((line) => speakPortuguese(line));
    this._ensureLoop();
    const title = shell.querySelector("#game-title");
    if (title instanceof HTMLElement) {
      title.tabIndex = -1;
    }
  }

  stop() {
    if (!this.current) return;
    this._disposeCtx(this.current.ctx);
    this.current = null;
    this.root.innerHTML = "";
    document.title = HOME_TITLE;
  }

  replay() {
    const current = this.current;
    if (!current) return;
    this._disposeCtx(current.ctx);
    const nextRun = (current.runIndex ?? 0) + 1;
    const ctx = this._makeCtx(current.shell, current.id, nextRun);
    current.runIndex = nextRun;
    current.ctx = ctx;
    current.shell.dataset.runIndex = String(nextRun);
    current.game.mount(ctx);
    gameEntryLines(current.game, { replay: true }).forEach((line) => speakPortuguese(line));
    if (nextRun > 0 && !E2E) {
      ctx.later(() => this.feedback("Novos desafios! Bora jogar.", "ok"), 120);
    }
  }

  feedback(text, type = "") {
    const element = this.current?.shell.querySelector("[data-feedback]");
    if (!element) return;
    element.textContent = text;
    if (type) element.dataset.type = type;
    else delete element.dataset.type;
    if (type === "ok") {
      playTone("ok");
      haptic("ok");
    }
    if (type === "no") {
      playTone("no");
      haptic("no");
    }
    const fb = feedbackLine(text, type);
    if (fb) speakPortuguese(fb);
  }

  win(message) {
    const ctx = this.current?.ctx;
    if (!ctx || ctx.won) return;
    ctx.won = true;
    this.onStars?.(3);
    playTone("win");
    haptic("win");
    speakPortuguese(winLine(message));
    ctx.view.classList.add("is-won");
    const layer = document.createElement("div");
    layer.className = "celebrate";
    layer.dataset.result = "win";
    layer.innerHTML = `
      <div class="confetti" aria-hidden="true">${confettiMarkup()}</div>
      <h3 tabindex="-1">Muito bem!</h3>
      <p>${escapeHtml(message)}</p>
      <div class="celebrate-actions">
        <button type="button" class="btn btn-again" data-again>Brincar de novo</button>
        <button type="button" class="btn btn-ink" data-home>Mais jogos</button>
      </div>
    `;
    ctx.view.appendChild(layer);
    layer.querySelector("[data-again]")?.addEventListener("click", () => this.replay());
    layer.querySelector("[data-home]")?.addEventListener("click", () => this.onExit?.());
    layer.querySelector("h3")?.focus();
  }

  _makeCtx(shell, gameId = "game", runIndex = 0) {
    const view = shell.querySelector("[data-game-view]");
    view.innerHTML = "";
    view.classList.remove("is-won");
    const controller = new AbortController();
    const seed = hashSeed(gameId, runIndex, E2E ? 42 : 0x6d2b79f5);
    view.dataset.gameId = gameId;
    const ctx = {
      view,
      shell,
      gameId,
      runIndex,
      stats: createRunStats(),
      e2e: E2E,
      e2eFull: E2E_FULL,
      random: createSeededRandom(seed),
      alive: true,
      won: false,
      signal: controller.signal,
      _clean: [],
      _phaseClean: [],
      _phaseAbort: null,
    };
    ctx.own = (fn) => ctx._clean.push(fn);
    ctx.own(() => controller.abort());
    ctx.phaseOwn = (fn) => ctx._phaseClean.push(fn);
    ctx.beginPhase = () => {
      for (const fn of ctx._phaseClean) {
        try {
          fn();
        } catch {
          /* segue limpando a fase */
        }
      }
      ctx._phaseClean = [];
      this._tickers.clear();
      ctx.view.innerHTML = "";
      ctx._phaseAbort?.abort();
      ctx._phaseAbort = new AbortController();
      return ctx._phaseAbort.signal;
    };
    ctx.own(() => ctx._phaseAbort?.abort());
    ctx.later = (fn, ms) => {
      const timer = setTimeout(() => {
        if (!ctx.alive) return;
        fn();
      }, ms);
      ctx.own(() => clearTimeout(timer));
    };
    ctx.feedback = (text, type) => this.feedback(text, type);
    ctx.win = (message) => this.win(message);
    ctx.narrate = (text) => speakPortuguese(text);
    ctx.onTick = (fn) => {
      this._tickers.add(fn);
      ctx.own(() => this._tickers.delete(fn));
    };
    ctx.mountPhase = (html) => mountPhase(ctx, html);
    ctx.afterPhaseRender = () => afterPhaseRender(ctx);
    ctx.markSuccess = markSuccess;
    ctx.markError = markError;
    ctx.haptic = haptic;
    ctx.updateStreak = (idle) => updateStreakDisplay(ctx, idle);
    return ctx;
  }

  _disposeCtx(ctx) {
    ctx.alive = false;
    ctx.won = true;
    for (const fn of ctx._clean) {
      try {
        fn();
      } catch {
        /* segue limpando o restante */
      }
    }
    this._tickers.clear();
    silence();
  }

  _ensureLoop() {
    if (this._frame) return;
    this._frame = requestAnimationFrame(this._loop);
  }

  _loop(time) {
    this._frame = 0;
    if (!this.current) return;
    for (const ticker of this._tickers) ticker(time);
    if (this.current) this._frame = requestAnimationFrame(this._loop);
  }
}
