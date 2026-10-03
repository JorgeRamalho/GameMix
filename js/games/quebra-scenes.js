/** Cenas do quebra-cabeça 2×2 (viewBox 200×200). */
export const PUZZLE_SCENES = {
  campo: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
  <rect width="200" height="110" fill="#8ecbff"/>
  <circle cx="48" cy="48" r="22" fill="#ffe14a" stroke="#2b2a4a" stroke-width="4"/>
  <ellipse cx="150" cy="46" rx="28" ry="16" fill="#ffffff" stroke="#2b2a4a" stroke-width="4"/>
  <rect y="104" width="200" height="96" fill="#7dde8a"/>
  <circle cx="48" cy="150" r="12" fill="#ff5d73" stroke="#2b2a4a" stroke-width="4"/>
  <rect x="42" y="160" width="4" height="16" fill="#2f9e44"/>
  <rect x="148" y="118" width="12" height="46" fill="#8d5a32" stroke="#2b2a4a" stroke-width="3"/>
  <circle cx="154" cy="112" r="20" fill="#37b24d" stroke="#2b2a4a" stroke-width="4"/>
</svg>`,
  praia: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
  <rect width="200" height="90" fill="#74c0fc"/>
  <circle cx="160" cy="36" r="18" fill="#ffe14a" stroke="#2b2a4a" stroke-width="3"/>
  <rect y="90" width="200" height="50" fill="#ffd43b"/>
  <rect y="140" width="200" height="60" fill="#4dabf7"/>
  <ellipse cx="70" cy="128" rx="34" ry="10" fill="#c4885a" stroke="#2b2a4a" stroke-width="3"/>
  <path d="M30 90 Q50 60 70 90" fill="none" stroke="#37b24d" stroke-width="6"/>
  <circle cx="130" cy="118" r="8" fill="#ff6b9d" stroke="#2b2a4a" stroke-width="2"/>
</svg>`,
  cidade: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
  <rect width="200" height="200" fill="#b2f2bb"/>
  <rect x="20" y="70" width="50" height="90" fill="#a5d8ff" stroke="#2b2a4a" stroke-width="3"/>
  <rect x="80" y="40" width="45" height="120" fill="#ffd8a8" stroke="#2b2a4a" stroke-width="3"/>
  <rect x="135" y="85" width="45" height="75" fill="#d0bfff" stroke="#2b2a4a" stroke-width="3"/>
  <rect x="0" y="160" width="200" height="40" fill="#868e96"/>
  <circle cx="45" cy="95" r="8" fill="#ffe14a" stroke="#2b2a4a" stroke-width="2"/>
  <circle cx="100" cy="65" r="8" fill="#ffe14a" stroke="#2b2a4a" stroke-width="2"/>
</svg>`,
  noite: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
  <rect width="200" height="200" fill="#243363"/>
  <circle cx="50" cy="50" r="16" fill="#ffe14a" stroke="#2b2a4a" stroke-width="3"/>
  <circle cx="150" cy="40" r="10" fill="#fff" opacity=".9"/>
  <circle cx="170" cy="70" r="6" fill="#fff" opacity=".7"/>
  <rect y="130" width="200" height="70" fill="#2f4f2f"/>
  <polygon points="100,50 70,120 130,120" fill="#495057" stroke="#2b2a4a" stroke-width="3"/>
  <rect x="88" y="120" width="24" height="40" fill="#6c757d" stroke="#2b2a4a" stroke-width="2"/>
</svg>`,
  bosque: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
  <rect width="200" height="200" fill="#a5d8ff"/>
  <rect y="120" width="200" height="80" fill="#5c940d"/>
  <polygon points="40,120 60,50 80,120" fill="#2b8a3e" stroke="#2b2a4a" stroke-width="3"/>
  <polygon points="100,120 125,35 150,120" fill="#37b24d" stroke="#2b2a4a" stroke-width="3"/>
  <polygon points="155,120 172,70 188,120" fill="#2f9e44" stroke="#2b2a4a" stroke-width="3"/>
  <circle cx="165" cy="45" r="14" fill="#ffe14a" stroke="#2b2a4a" stroke-width="3"/>
</svg>`,
  fazenda: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
  <rect width="200" height="200" fill="#8ecbff"/>
  <rect y="130" width="200" height="70" fill="#94d82d"/>
  <rect x="55" y="75" width="90" height="65" fill="#e03131" stroke="#2b2a4a" stroke-width="4"/>
  <polygon points="100,35 45,75 155,75" fill="#5c4033" stroke="#2b2a4a" stroke-width="3"/>
  <rect x="88" y="105" width="24" height="35" fill="#fff" stroke="#2b2a4a" stroke-width="3"/>
  <circle cx="35" cy="155" r="10" fill="#ffd43b" stroke="#2b2a4a" stroke-width="2"/>
</svg>`,
  arcoiris: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
  <rect width="200" height="200" fill="#8ecbff"/>
  <path d="M20 140 A80 80 0 0 1 180 140" fill="none" stroke="#ff6b6b" stroke-width="12"/>
  <path d="M35 140 A65 65 0 0 1 165 140" fill="none" stroke="#ff922b" stroke-width="12"/>
  <path d="M50 140 A50 50 0 0 1 150 140" fill="none" stroke="#ffe14a" stroke-width="12"/>
  <path d="M65 140 A35 35 0 0 1 135 140" fill="none" stroke="#51cf66" stroke-width="12"/>
  <rect y="150" width="200" height="50" fill="#69db7c"/>
  <circle cx="40" cy="50" r="18" fill="#ffe14a" stroke="#2b2a4a" stroke-width="3"/>
</svg>`,
  lago: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
  <rect width="200" height="200" fill="#a5d8ff"/>
  <ellipse cx="100" cy="145" rx="85" ry="40" fill="#4dabf7" stroke="#2b2a4a" stroke-width="3"/>
  <ellipse cx="70" cy="140" rx="20" ry="8" fill="#74c0fc"/>
  <rect x="30" y="60" width="8" height="50" fill="#8d5a32"/>
  <circle cx="34" cy="52" r="22" fill="#37b24d" stroke="#2b2a4a" stroke-width="3"/>
  <circle cx="150" cy="130" r="6" fill="#fff"/>
  <path d="M145 130 Q150 120 155 130" fill="#ff922b" stroke="#2b2a4a" stroke-width="2"/>
</svg>`,
  inverno: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
  <rect width="200" height="200" fill="#d0ebff"/>
  <rect y="140" width="200" height="60" fill="#fff"/>
  <polygon points="60,140 80,70 100,140" fill="#fff" stroke="#2b2a4a" stroke-width="3"/>
  <polygon points="110,140 135,55 160,140" fill="#f1f3f5" stroke="#2b2a4a" stroke-width="3"/>
  <circle cx="45" cy="45" r="12" fill="#ffe14a" stroke="#2b2a4a" stroke-width="2"/>
  <circle cx="150" cy="100" r="8" fill="#fff" stroke="#74c0fc" stroke-width="2"/>
  <circle cx="165" cy="115" r="6" fill="#fff" stroke="#74c0fc" stroke-width="2"/>
</svg>`,
  safari: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
  <rect width="200" height="200" fill="#ffe8cc"/>
  <rect y="130" width="200" height="70" fill="#fcc419"/>
  <circle cx="70" cy="115" r="28" fill="#ffd8a8" stroke="#2b2a4a" stroke-width="3"/>
  <circle cx="62" cy="108" r="4" fill="#2b2a4a"/>
  <circle cx="78" cy="108" r="4" fill="#2b2a4a"/>
  <ellipse cx="130" cy="120" rx="35" ry="22" fill="#8d5a32" stroke="#2b2a4a" stroke-width="3"/>
  <circle cx="155" cy="105" r="10" fill="#2b2a4a"/>
  <path d="M30 130 Q50 90 70 130" fill="#37b24d" stroke="#2b2a4a" stroke-width="2"/>
</svg>`,
  jardim: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
  <rect width="200" height="200" fill="#d3f9d8"/>
  <rect x="40" y="100" width="120" height="60" fill="#8d5a32" stroke="#2b2a4a" stroke-width="3"/>
  <circle cx="70" cy="85" r="18" fill="#ff6b9d" stroke="#2b2a4a" stroke-width="3"/>
  <circle cx="100" cy="75" r="20" fill="#ff922b" stroke="#2b2a4a" stroke-width="3"/>
  <circle cx="130" cy="88" r="16" fill="#cc5de8" stroke="#2b2a4a" stroke-width="3"/>
  <rect x="95" y="100" width="10" height="40" fill="#2f9e44"/>
</svg>`,
  oceano: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
  <rect width="200" height="200" fill="#1864ab"/>
  <path d="M0 120 Q50 100 100 120 T200 120 L200 200 L0 200 Z" fill="#4dabf7"/>
  <path d="M0 150 Q50 130 100 150 T200 150 L200 200 L0 200 Z" fill="#339af0"/>
  <circle cx="50" cy="70" r="14" fill="#ff922b" stroke="#2b2a4a" stroke-width="3"/>
  <path d="M120 90 L135 110 L105 110 Z" fill="#69db7c" stroke="#2b2a4a" stroke-width="2"/>
  <circle cx="160" cy="85" r="6" fill="#fff" opacity=".8"/>
</svg>`,
  montanha: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
  <rect width="200" height="200" fill="#a5d8ff"/>
  <polygon points="0,160 70,50 130,160" fill="#868e96" stroke="#2b2a4a" stroke-width="3"/>
  <polygon points="60,160 120,40 200,160" fill="#adb5bd" stroke="#2b2a4a" stroke-width="3"/>
  <polygon points="95,55 105,55 100,70" fill="#fff"/>
  <rect y="160" width="200" height="40" fill="#51cf66"/>
  <circle cx="165" cy="45" r="16" fill="#ffe14a" stroke="#2b2a4a" stroke-width="3"/>
</svg>`,
  espaco_puzzle: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
  <rect width="200" height="200" fill="#1a1b3a"/>
  <circle cx="40" cy="50" r="3" fill="#fff"/>
  <circle cx="120" cy="30" r="2" fill="#fff"/>
  <circle cx="170" cy="80" r="2" fill="#fff"/>
  <circle cx="100" cy="100" r="35" fill="#5c7cfa" stroke="#2b2a4a" stroke-width="3"/>
  <ellipse cx="100" cy="100" rx="50" ry="12" fill="none" stroke="#ffe14a" stroke-width="4" transform="rotate(-20 100 100)"/>
  <polygon points="100,55 95,75 105,75" fill="#ff6b6b"/>
</svg>`,
};

export const PUZZLE_LABELS = {
  campo: "Campo florido",
  praia: "Dia na praia",
  cidade: "Cidade colorida",
  noite: "Noite estrelada",
  bosque: "Bosque verde",
  fazenda: "Fazendinha",
  arcoiris: "Arco-íris",
  lago: "Lago tranquilo",
  inverno: "Dia de neve",
  safari: "Safari",
  jardim: "Jardim de flores",
  oceano: "Fundo do mar",
  montanha: "Montanhas",
  espaco_puzzle: "Planeta espacial",
};

/** Ordem padrão (referência); o jogo sorteia 10 cenas diferentes por partida. */
export const PUZZLE_ORDER = Object.keys(PUZZLE_SCENES);
