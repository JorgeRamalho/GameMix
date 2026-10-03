/**
 * Compatibilidade de voz do sistema — especialmente iOS / Safari.
 */

const UA = typeof navigator !== "undefined" ? navigator.userAgent : "";

/** iPhone, iPad, iPod e iPadOS com user agent de Mac. */
export const IS_APPLE_TOUCH =
  /iPad|iPhone|iPod/.test(UA) ||
  (typeof navigator !== "undefined" && navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

export const IS_WEBKIT =
  typeof navigator !== "undefined" && /AppleWebKit/.test(UA) && !/Chrome|CriOS|FxiOS|EdgiOS/.test(UA);

let cachedVoices = [];

export function refreshSpeechVoices() {
  if (typeof speechSynthesis === "undefined") return [];
  try {
    const list = speechSynthesis.getVoices();
    if (list.length) cachedVoices = list;
    return cachedVoices.length ? cachedVoices : list;
  } catch {
    return cachedVoices;
  }
}

export function installSpeechVoiceListener() {
  if (typeof speechSynthesis === "undefined") return;
  refreshSpeechVoices();
  speechSynthesis.addEventListener("voiceschanged", () => {
    refreshSpeechVoices();
  });
}

/** Chamado no primeiro toque — “acorda” TTS no Safari antes de frases longas. */
export function wakeSpeechSynthesis() {
  if (typeof speechSynthesis === "undefined") return;
  try {
    speechSynthesis.resume();
  } catch {
    /* ignorar */
  }
  refreshSpeechVoices();
  if (!IS_APPLE_TOUCH && !IS_WEBKIT) return;
  if (cachedVoices.length === 0) return;
  try {
    const primer = new SpeechSynthesisUtterance("\u200b");
    primer.volume = 0.01;
    primer.rate = 1;
    speechSynthesis.speak(primer);
  } catch {
    /* ignorar */
  }
}

export function pickSpeechVoice(lang) {
  const voices = refreshSpeechVoices();
  if (!voices.length) return null;
  const exact = voices.find((v) => v.lang === lang);
  if (exact) return exact;
  const prefix = lang.split("-")[0];
  const byPrefix = voices.filter((v) => v.lang.startsWith(prefix));
  if (!byPrefix.length) return voices[0] ?? null;
  const local = byPrefix.find((v) => v.localService);
  return local ?? byPrefix[0];
}

/** Safari costuma falhar se speak() vier logo após cancel(). */
export const SPEAK_AFTER_CANCEL_MS = IS_APPLE_TOUCH || IS_WEBKIT ? 120 : 0;
