const INK = "#2b2a4a";

export function icon(body) {
  return `<svg viewBox="0 0 64 64" aria-hidden="true" focusable="false">${body}</svg>`;
}

export const art = {
  star: icon(
    `<polygon points="32,6 39,24 58,25 43,37 48,55 32,45 16,55 21,37 6,25 25,24" fill="#ffe14a" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>`,
  ),
  fish: icon(
    `<ellipse cx="28" cy="34" rx="16" ry="11" fill="#4dabf7" stroke="${INK}" stroke-width="3"/>
     <polygon points="42,34 58,22 58,46" fill="#4dabf7" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
     <circle cx="22" cy="32" r="2.2" fill="${INK}"/>`,
  ),
  apple: icon(
    `<circle cx="32" cy="36" r="16" fill="#ff4d4d" stroke="${INK}" stroke-width="3"/>
     <path d="M32 22 C32 14 40 12 44 16" fill="none" stroke="${INK}" stroke-width="3"/>
     <path d="M32 22 C38 14 48 20 42 26" fill="#37b24d" stroke="${INK}" stroke-width="2"/>`,
  ),
  appleGreen: icon(
    `<circle cx="32" cy="36" r="16" fill="#37b24d" stroke="${INK}" stroke-width="3"/>
     <path d="M32 22 C32 14 40 12 44 16" fill="none" stroke="${INK}" stroke-width="3"/>
     <path d="M32 22 C38 14 48 20 42 26" fill="#2f9e44" stroke="${INK}" stroke-width="2"/>`,
  ),
  sun: icon(
    `<circle cx="32" cy="32" r="12" fill="#ffe14a" stroke="${INK}" stroke-width="3"/>
     <path d="M32 8 V16 M32 48 V56 M8 32 H16 M48 32 H56 M15 15 L20 20 M44 44 L49 49 M49 15 L44 20 M20 44 L15 49" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>`,
  ),
  sunOrange: icon(
    `<circle cx="32" cy="32" r="12" fill="#ff922b" stroke="${INK}" stroke-width="3"/>
     <path d="M32 8 V16 M32 48 V56 M8 32 H16 M48 32 H56 M15 15 L20 20 M44 44 L49 49 M49 15 L44 20 M20 44 L15 49" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>`,
  ),
  cloud: icon(
    `<path d="M14 42 H50 A10 10 0 0 0 48 26 A12 12 0 0 0 26 22 A11 11 0 0 0 14 36 Z" fill="#ffffff" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>`,
  ),
  ball: icon(
    `<circle cx="32" cy="32" r="16" fill="#4dabf7" stroke="${INK}" stroke-width="3"/>
     <path d="M16 32 H48 M32 16 C24 24 24 40 32 48 M32 16 C40 24 40 40 32 48" fill="none" stroke="#ffffff" stroke-width="2"/>`,
  ),
  block: icon(
    `<rect x="14" y="14" width="36" height="36" rx="6" fill="#ff6b6b" stroke="${INK}" stroke-width="3"/>`,
  ),
  bird: icon(
    `<ellipse cx="28" cy="36" rx="14" ry="10" fill="#4dabf7" stroke="${INK}" stroke-width="3"/>
     <circle cx="40" cy="30" r="7" fill="#74c0fc" stroke="${INK}" stroke-width="3"/>
     <polygon points="46,30 58,24 48,36" fill="#ff922b" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>`,
  ),
  butterfly: icon(
    `<ellipse cx="20" cy="34" rx="12" ry="16" fill="#9775fa" stroke="${INK}" stroke-width="3"/>
     <ellipse cx="44" cy="34" rx="12" ry="16" fill="#9775fa" stroke="${INK}" stroke-width="3"/>
     <rect x="30" y="20" width="4" height="28" rx="2" fill="${INK}"/>`,
  ),
  flowerRed: flower("#ff5d73"),
  flowerBlue: flower("#4dabf7"),
  catBlue: cat("#4dabf7"),
  catRed: cat("#ff5d73"),
  dog: icon(
    `<ellipse cx="16" cy="34" rx="8" ry="12" fill="#f4a259" stroke="${INK}" stroke-width="3"/>
     <ellipse cx="48" cy="34" rx="8" ry="12" fill="#f4a259" stroke="${INK}" stroke-width="3"/>
     <circle cx="32" cy="34" r="16" fill="#ffd8a8" stroke="${INK}" stroke-width="3"/>
     <ellipse cx="32" cy="40" rx="7" ry="5" fill="#fff" stroke="${INK}" stroke-width="2"/>
     <circle cx="26" cy="32" r="2.2" fill="${INK}"/>
     <circle cx="38" cy="32" r="2.2" fill="${INK}"/>
     <circle cx="32" cy="40" r="2" fill="${INK}"/>`,
  ),
  cat: icon(
    `<polygon points="16,30 22,12 30,28" fill="#fff3bf" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
     <polygon points="48,30 42,12 34,28" fill="#fff3bf" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
     <circle cx="32" cy="36" r="16" fill="#fff3bf" stroke="${INK}" stroke-width="3"/>
     <circle cx="26" cy="34" r="2.2" fill="${INK}"/>
     <circle cx="38" cy="34" r="2.2" fill="${INK}"/>
     <path d="M28 42 Q32 46 36 42" fill="none" stroke="${INK}" stroke-width="3"/>`,
  ),
  drop: icon(
    `<path d="M32 8 C32 8 14 30 14 40 A18 18 0 0 0 50 40 C50 30 32 8 32 8 Z" fill="#4dabf7" stroke="${INK}" stroke-width="3"/>`,
  ),
  vase: icon(
    `<path d="M24 22 H40 L46 54 H18 Z" fill="#74c0fc" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
     <rect x="22" y="14" width="20" height="10" rx="3" fill="#4dabf7" stroke="${INK}" stroke-width="3"/>`,
  ),
  shoe: icon(
    `<path d="M10 30 H32 L40 38 H54 V48 H10 Z" fill="#9775fa" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>`,
  ),
  sock: icon(
    `<path d="M22 8 H40 V32 L52 44 V54 H20 V38 Z" fill="#ff8fab" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>`,
  ),
  umbrella: icon(
    `<path d="M8 32 Q32 8 56 32 Z" fill="#ff6b6b" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
     <path d="M32 32 V52" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>
     <path d="M32 52 Q42 52 40 44" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>`,
  ),
  palm: icon(
    `<rect x="29" y="30" width="6" height="26" rx="2" fill="#8d5a32" stroke="${INK}" stroke-width="2"/>
     <circle cx="22" cy="28" r="10" fill="#2f9e44" stroke="${INK}" stroke-width="3"/>
     <circle cx="42" cy="26" r="10" fill="#37b24d" stroke="${INK}" stroke-width="3"/>
     <circle cx="32" cy="16" r="8" fill="#69db7c" stroke="${INK}" stroke-width="3"/>`,
  ),
  rock: icon(
    `<ellipse cx="32" cy="38" rx="20" ry="14" fill="#ced4da" stroke="${INK}" stroke-width="3"/>`,
  ),
  chest: icon(
    `<rect x="8" y="28" width="48" height="24" rx="4" fill="#e0893a" stroke="${INK}" stroke-width="3"/>
     <path d="M8 28 H56 V22 A8 8 0 0 0 8 22 Z" fill="#f4a259" stroke="${INK}" stroke-width="3"/>
     <circle cx="32" cy="38" r="4" fill="#ffe14a" stroke="${INK}" stroke-width="2"/>`,
  ),
  wave: icon(
    `<path d="M6 26 Q16 16 26 26 T46 26 T62 26" fill="none" stroke="#4dabf7" stroke-width="4" stroke-linecap="round"/>
     <path d="M6 42 Q16 32 26 42 T46 42 T62 42" fill="none" stroke="#1c7ed6" stroke-width="4" stroke-linecap="round"/>`,
  ),
  sand: icon(
    `<ellipse cx="32" cy="40" rx="22" ry="12" fill="#ffe14a" stroke="${INK}" stroke-width="3"/>
     <circle cx="20" cy="40" r="2" fill="${INK}"/>
     <circle cx="32" cy="44" r="2" fill="${INK}"/>
     <circle cx="44" cy="38" r="2" fill="${INK}"/>`,
  ),
  coin: icon(
    `<circle cx="32" cy="32" r="16" fill="#ffe14a" stroke="${INK}" stroke-width="3"/>
     <text x="32" y="38" text-anchor="middle" font-size="16" font-family="Nunito, sans-serif" fill="${INK}">★</text>`,
  ),
  shell: icon(
    `<path d="M12 40 Q32 8 52 40 Z" fill="#ffd8a8" stroke="${INK}" stroke-width="3"/>
     <path d="M32 16 V40 M22 22 L32 40 L42 22" fill="none" stroke="${INK}" stroke-width="2"/>`,
  ),
  duck: icon(
    `<ellipse cx="30" cy="38" rx="18" ry="12" fill="#ffe14a" stroke="${INK}" stroke-width="3"/>
     <circle cx="44" cy="28" r="10" fill="#ffe14a" stroke="${INK}" stroke-width="3"/>
     <circle cx="48" cy="26" r="2.2" fill="${INK}"/>
     <path d="M52 28 L60 26 L52 32 Z" fill="#ff922b" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>
     <ellipse cx="22" cy="44" rx="6" ry="3" fill="#ff922b" stroke="${INK}" stroke-width="2"/>`,
  ),
  cow: icon(
    `<ellipse cx="32" cy="38" rx="20" ry="14" fill="#f8f9fa" stroke="${INK}" stroke-width="3"/>
     <circle cx="22" cy="34" r="4" fill="${INK}" opacity=".35"/>
     <circle cx="42" cy="36" r="5" fill="${INK}" opacity=".35"/>
     <circle cx="26" cy="32" r="2" fill="${INK}"/>
     <circle cx="38" cy="32" r="2" fill="${INK}"/>
     <ellipse cx="32" cy="40" rx="5" ry="3" fill="#ffd8a8" stroke="${INK}" stroke-width="2"/>
     <ellipse cx="14" cy="30" rx="5" ry="3" fill="#f8f9fa" stroke="${INK}" stroke-width="2"/>
     <ellipse cx="50" cy="30" rx="5" ry="3" fill="#f8f9fa" stroke="${INK}" stroke-width="2"/>`,
  ),
  pig: icon(
    `<ellipse cx="32" cy="36" rx="18" ry="14" fill="#ffb3c1" stroke="${INK}" stroke-width="3"/>
     <circle cx="24" cy="32" r="2" fill="${INK}"/>
     <circle cx="40" cy="32" r="2" fill="${INK}"/>
     <ellipse cx="32" cy="40" rx="8" ry="6" fill="#ff8fab" stroke="${INK}" stroke-width="2"/>
     <circle cx="28" cy="40" r="1.5" fill="${INK}"/>
     <circle cx="36" cy="40" r="1.5" fill="${INK}"/>
     <ellipse cx="14" cy="34" rx="4" ry="7" fill="#ffb3c1" stroke="${INK}" stroke-width="2"/>
     <ellipse cx="50" cy="34" rx="4" ry="7" fill="#ffb3c1" stroke="${INK}" stroke-width="2"/>`,
  ),
  car: icon(
    `<rect x="10" y="28" width="44" height="18" rx="6" fill="#4dabf7" stroke="${INK}" stroke-width="3"/>
     <path d="M18 28 L26 16 H38 L46 28" fill="#74c0fc" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
     <circle cx="20" cy="48" r="6" fill="#343a40" stroke="${INK}" stroke-width="2"/>
     <circle cx="44" cy="48" r="6" fill="#343a40" stroke="${INK}" stroke-width="2"/>
     <circle cx="20" cy="48" r="2" fill="#ced4da"/>
     <circle cx="44" cy="48" r="2" fill="#ced4da"/>`,
  ),
  cone: icon(
    `<polygon points="32,10 48,50 16,50" fill="#ff922b" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
     <rect x="14" y="50" width="36" height="6" rx="2" fill="${INK}"/>`,
  ),
  /** Obstáculo na pista (mesmo papel do cone). */
  fire: icon(
    `<path d="M32 6 C40 18 42 30 38 40 C44 34 46 46 40 54 C42 48 38 46 32 52 C26 46 22 48 24 54 C18 46 20 34 26 40 C22 30 24 18 32 6 Z" fill="#ff6b6b" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
     <path d="M32 20 C36 26 35 34 32 42 C29 34 28 26 32 20 Z" fill="#ffe14a" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>
     <ellipse cx="32" cy="54" rx="16" ry="4" fill="#868e96" opacity="0.45"/>`,
  ),
  rocket: icon(
    `<path d="M32 8 C32 8 20 24 20 40 L26 54 H38 L44 40 C44 24 32 8 32 8 Z" fill="#e7f5ff" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
     <circle cx="32" cy="28" r="6" fill="#74c0fc" stroke="${INK}" stroke-width="2"/>
     <path d="M20 38 L10 48 L20 44 Z" fill="#ff6b6b" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>
     <path d="M44 38 L54 48 L44 44 Z" fill="#ff6b6b" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>
     <path d="M28 54 L32 62 L36 54 Z" fill="#ff922b" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>`,
  ),
  meteor: icon(
    `<ellipse cx="28" cy="36" rx="16" ry="12" fill="#868e96" stroke="${INK}" stroke-width="3"/>
     <circle cx="20" cy="32" r="3" fill="#adb5bd" stroke="${INK}" stroke-width="2"/>
     <circle cx="34" cy="40" r="2.5" fill="#adb5bd" stroke="${INK}" stroke-width="2"/>
     <path d="M44 28 L58 18 M44 36 L60 36 M44 44 L58 54" fill="none" stroke="#ff922b" stroke-width="3" stroke-linecap="round"/>`,
  ),
  person: icon(
    `<circle cx="32" cy="16" r="9" fill="#ffd8a8" stroke="${INK}" stroke-width="3"/>
     <rect x="22" y="26" width="20" height="26" rx="5" fill="#4dabf7" stroke="${INK}" stroke-width="3"/>
     <rect x="18" y="28" width="6" height="18" rx="3" fill="#ffd8a8" stroke="${INK}" stroke-width="2"/>
     <rect x="42" y="28" width="6" height="18" rx="3" fill="#ffd8a8" stroke="${INK}" stroke-width="2"/>
     <rect x="24" y="50" width="7" height="12" rx="3" fill="#495057" stroke="${INK}" stroke-width="2"/>
     <rect x="33" y="50" width="7" height="12" rx="3" fill="#495057" stroke="${INK}" stroke-width="2"/>`,
  ),
  personRed: icon(
    `<circle cx="32" cy="16" r="9" fill="#ffd8a8" stroke="${INK}" stroke-width="3"/>
     <rect x="22" y="26" width="20" height="26" rx="5" fill="#ff6b6b" stroke="${INK}" stroke-width="3"/>
     <rect x="18" y="28" width="6" height="18" rx="3" fill="#ffd8a8" stroke="${INK}" stroke-width="2"/>
     <rect x="42" y="28" width="6" height="18" rx="3" fill="#ffd8a8" stroke="${INK}" stroke-width="2"/>
     <rect x="24" y="50" width="7" height="12" rx="3" fill="#495057" stroke="${INK}" stroke-width="2"/>
     <rect x="33" y="50" width="7" height="12" rx="3" fill="#495057" stroke="${INK}" stroke-width="2"/>`,
  ),
  personChild: icon(
    `<circle cx="32" cy="20" r="8" fill="#ffd8a8" stroke="${INK}" stroke-width="3"/>
     <rect x="24" y="28" width="16" height="20" rx="4" fill="#9775fa" stroke="${INK}" stroke-width="3"/>
     <line x1="32" y1="8" x2="32" y2="2" stroke="${INK}" stroke-width="2"/>
     <circle cx="32" cy="2" r="5" fill="#ff6b9d" stroke="${INK}" stroke-width="2"/>`,
  ),
  personBalloon: icon(
    `<circle cx="32" cy="20" r="8" fill="#ffd8a8" stroke="${INK}" stroke-width="3"/>
     <rect x="24" y="28" width="16" height="20" rx="4" fill="#9775fa" stroke="${INK}" stroke-width="3"/>
     <line x1="32" y1="8" x2="32" y2="2" stroke="${INK}" stroke-width="2"/>
     <circle cx="32" cy="2" r="5" fill="#51cf66" stroke="${INK}" stroke-width="2"/>`,
  ),
  bench: icon(
    `<rect x="12" y="36" width="40" height="8" rx="2" fill="#8d5a32" stroke="${INK}" stroke-width="3"/>
     <rect x="16" y="44" width="6" height="14" fill="#6c757d" stroke="${INK}" stroke-width="2"/>
     <rect x="42" y="44" width="6" height="14" fill="#6c757d" stroke="${INK}" stroke-width="2"/>`,
  ),
  benchBook: icon(
    `<rect x="12" y="36" width="40" height="8" rx="2" fill="#8d5a32" stroke="${INK}" stroke-width="3"/>
     <rect x="16" y="44" width="6" height="14" fill="#6c757d" stroke="${INK}" stroke-width="2"/>
     <rect x="42" y="44" width="6" height="14" fill="#6c757d" stroke="${INK}" stroke-width="2"/>
     <rect x="26" y="30" width="12" height="8" rx="1" fill="#ffe14a" stroke="${INK}" stroke-width="2"/>`,
  ),
  keeper: icon(
    `<circle cx="32" cy="18" r="10" fill="#ffd8a8" stroke="${INK}" stroke-width="3"/>
     <rect x="18" y="28" width="28" height="26" rx="6" fill="#37b24d" stroke="${INK}" stroke-width="3"/>
     <ellipse cx="14" cy="38" rx="6" ry="10" fill="#37b24d" stroke="${INK}" stroke-width="2"/>
     <ellipse cx="50" cy="38" rx="6" ry="10" fill="#37b24d" stroke="${INK}" stroke-width="2"/>`,
  ),
};

function flower(petal) {
  return icon(
    `<circle cx="32" cy="26" r="7" fill="${petal}" stroke="${INK}" stroke-width="3"/>
     <circle cx="20" cy="34" r="7" fill="${petal}" stroke="${INK}" stroke-width="3"/>
     <circle cx="44" cy="34" r="7" fill="${petal}" stroke="${INK}" stroke-width="3"/>
     <circle cx="32" cy="42" r="7" fill="${petal}" stroke="${INK}" stroke-width="3"/>
     <circle cx="32" cy="34" r="5" fill="#ffe14a" stroke="${INK}" stroke-width="2"/>
     <rect x="30" y="48" width="4" height="10" rx="2" fill="#2f9e44"/>`,
  );
}

function cat(bow) {
  return icon(
    `<polygon points="14,30 22,12 30,28" fill="#fff3bf" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
     <polygon points="50,30 42,12 34,28" fill="#fff3bf" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
     <circle cx="32" cy="36" r="15" fill="#fff3bf" stroke="${INK}" stroke-width="3"/>
     <circle cx="26" cy="34" r="2" fill="${INK}"/>
     <circle cx="38" cy="34" r="2" fill="${INK}"/>
     <path d="M28 42 Q32 46 36 42" fill="none" stroke="${INK}" stroke-width="2"/>
     <path d="M16 48 H48 L32 58 Z" fill="${bow}" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>`,
  );
}
