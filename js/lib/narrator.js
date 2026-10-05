import { levelName } from "./levels.js";

export const UNDERSTOOD_QUESTION = "Você entendeu, amiguinho ou amiguinha?";

const GAME_INTROS = {
  colorir: `Este é o jogo de colorir. Você mistura cores no potinho e pinta o desenho com o dedo. ${UNDERSTOOD_QUESTION}`,
  tesouro: `Este é o jogo da caça ao tesouro. Procure na tela e toque onde está escondido o tesouro. ${UNDERSTOOD_QUESTION}`,
  pescaria: `Este é o jogo da pescaria. Toque nos peixes para pescar, com calma e atenção. ${UNDERSTOOD_QUESTION}`,
  alvo: `Este é o tiro ao alvo. Toque na estrela quando ela aparecer, mirando com calma. ${UNDERSTOOD_QUESTION}`,
  quebra: `Este é o quebra-cabeça. Toque duas peças para trocar de lugar e montar o desenho. ${UNDERSTOOD_QUESTION}`,
  memoria: `Este é o jogo da memória. Abra as cartinhas e ache os pares iguais. ${UNDERSTOOD_QUESTION}`,
  tetris: `Este é o Tetris. Use esquerda, direita e girar para encaixar as peças. Olhe a próxima peça ao lado e complete as linhas da fase! ${UNDERSTOOD_QUESTION}`,
  matematica: `Este é o jogo de contar de matemática. Nele você tem que adivinhar os números e falar eles em voz alta. ${UNDERSTOOD_QUESTION}`,
  ingles: `Este é o jogo de inglês. Ouça a palavra, aprenda o significado em português e escolha a figura certa. ${UNDERSTOOD_QUESTION}`,
  ligar: `Este é o jogo de ligar os pares. Toque de um lado e depois no desenho que combina. ${UNDERSTOOD_QUESTION}`,
  animais: `Este é o jogo dos animais. Olhe o bichinho e escolha o nome certo. ${UNDERSTOOD_QUESTION}`,
  corrida: `Este é o jogo da corrida. Mude de pista, pegue estrelas e desvie dos cones. ${UNDERSTOOD_QUESTION}`,
  espaco: `Este é o jogo da guerra espacial. Mova a nave, atire nos meteoros e desvie dos que caem. ${UNDERSTOOD_QUESTION}`,
  blocos: `Este é o jogo dos blocos coloridos. Toque num bloco e encaixe no lugar da mesma cor. ${UNDERSTOOD_QUESTION}`,
  futebol: `Este é o jogo do pênalti. Escolha um canto do gol para chutar e furar o goleiro. ${UNDERSTOOD_QUESTION}`,
};

export function gameEntryLines(game, { replay = false } = {}) {
  const intro =
    GAME_INTROS[game.id] ?? `${game.title}. ${game.goal}. ${UNDERSTOOD_QUESTION}`;
  if (replay) {
    return [`Vamos brincar de novo! ${intro}`, "Vamos começar pela fase fácil!"];
  }
  return [intro, "Vamos começar pela fase fácil!"];
}

export function phaseStartLine(phaseIndex, total, tip = "") {
  const name = levelName(phaseIndex);
  const base = `Fase ${phaseIndex + 1} de ${total}: ${name}.`;
  return tip ? `${base} ${tip}` : base;
}

export const HOME_LINE = "Voltamos para a lista de jogos. Escolha outro para brincar!";

export function feedbackLine(text, type) {
  if (!text?.trim()) return null;
  if (type === "ok" || type === "no") return text;
  return null;
}

export function winLine(message) {
  return `Muito bem! ${message}`;
}
