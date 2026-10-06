import { games } from "./games/index.js";
import { addStars, BehaviorEngine, loadProgress, setSound, speakPortuguese, unlockAudio } from "./engine.js";
import { HOME_LINE } from "./lib/narrator.js";

const home = document.querySelector("#home");
const root = document.querySelector("#game-root");
const stars = document.querySelector("[data-stars]");
const soundButton = document.querySelector("[data-sound]");
const coach = document.querySelector("#coach");

const engine = new BehaviorEngine({
  root,
  onStars(amount) {
    const total = addStars(amount);
    if (stars) stars.textContent = String(total);
  },
});

for (const game of games) engine.register(game);
if (stars) stars.textContent = String(loadProgress().stars);

function showHome() {
  const wasGame = document.body.dataset.screen === "game";
  engine.stop();
  if (root) root.hidden = true;
  if (home) home.hidden = false;
  document.body.dataset.screen = "home";
  if (wasGame) speakPortuguese(HOME_LINE);
}

function syncRoute() {
  const id = location.hash.replace(/^#\//, "");
  if (id && engine.games.has(id)) {
    if (home) home.hidden = true;
    if (root) root.hidden = false;
    document.body.dataset.screen = "game";
    engine.start(id);
    return;
  }
  showHome();
}

engine.onExit = () => {
  if (location.hash && location.hash !== "#/") {
    location.hash = "";
    return;
  }
  syncRoute();
};

window.addEventListener("hashchange", syncRoute);

if (soundButton) {
  soundButton.addEventListener("click", () => {
    const enabled = soundButton.getAttribute("aria-pressed") !== "true";
    soundButton.setAttribute("aria-pressed", String(enabled));
    soundButton.setAttribute("aria-label", enabled ? "Som ligado" : "Som desligado");
    setSound(enabled);
  });
}

const canonical = document.querySelector('link[rel="canonical"]');
if (canonical) canonical.href = new URL("./", location.href).href;

document.addEventListener("pointerdown", () => unlockAudio(), { passive: true });

const coachSeen = "gamemix-coach";
if (coach && !document.documentElement.dataset.e2e && !localStorage.getItem(coachSeen)) {
  coach.hidden = false;
  coach.querySelector("button")?.focus();
}
coach?.querySelector("button")?.addEventListener("click", () => {
  try {
    localStorage.setItem(coachSeen, "1");
  } catch {
    /* segue sem gravar */
  }
  coach.hidden = true;
});

syncRoute();
