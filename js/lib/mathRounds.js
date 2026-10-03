import { art } from "../art.js";

const ICONS = [
  { key: "star", art: art.star, name: "estrelas" },
  { key: "apple", art: art.apple, name: "maçãs" },
  { key: "fish", art: art.fish, name: "peixinhos" },
  { key: "ball", art: art.ball, name: "bolinhas" },
];

function repeat(svg, n) {
  return Array.from({ length: n }, () => svg).join("");
}

function optionsAround(answer) {
  const set = new Set([answer]);
  for (let d = 1; set.size < 3 && d <= 4; d += 1) {
    if (answer - d >= 1) set.add(answer - d);
    if (set.size < 3 && answer + d <= 5) set.add(answer + d);
  }
  return [...set].sort((a, b) => a - b).slice(0, 3);
}

/** Gera uma pergunta de contar ou somar (até 5) para crianças de 3–5 anos. */
export function generateMathRound(random) {
  const kind = Math.floor(random() * 2);
  if (kind === 0) {
    const icon = ICONS[Math.floor(random() * ICONS.length)];
    const count = 1 + Math.floor(random() * 5);
    const answer = count;
    return {
      prompt: `Quantas ${icon.name}?`,
      answer,
      options: optionsAround(answer),
      markup: `<div class="count-row">${repeat(icon.art, count)}</div>`,
    };
  }

  const a = 1 + Math.floor(random() * 3);
  const b = 1 + Math.floor(random() * (5 - a));
  const answer = a + b;
  const icon = ICONS[Math.floor(random() * ICONS.length)];
  return {
    prompt: `Quanto é ${a} + ${b}?`,
    answer,
    options: optionsAround(answer),
    markup: `<div class="sum-row"><span class="count-row">${repeat(icon.art, a)}</span><span class="sum-sign">+</span><span class="count-row">${repeat(icon.art, b)}</span></div>`,
  };
}

/** Primeira fase fixa para testes e2e. */
export const E2E_MATH_ROUND = {
  prompt: "Quantas estrelas?",
  answer: 2,
  options: [1, 2, 3],
  markup: `<div class="count-row">${art.star}${art.star}</div>`,
};
