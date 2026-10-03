/** Ilustrações do Colorir — traço grosso, formas reconhecíveis (livro de colorir infantil). */
const INK = "#2b2a4a";
const PAPER = "#fffaf0";

function scene(label, aria, markup) {
  return { label, aria, viewBox: "0 0 280 200", markup };
}

export const SCENES = {
  borboleta: scene(
    "Borboleta",
    "Borboleta no jardim",
    `
    <g class="color-bg" pointer-events="none">
      <rect width="280" height="200" fill="#dff4ff"/>
      <ellipse cx="140" cy="182" rx="122" ry="20" fill="#8ce99a" opacity=".6"/>
      <circle cx="236" cy="42" r="22" fill="#ffe14a" opacity=".4"/>
    </g>
    <g class="color-shade" pointer-events="none" opacity=".12">
      <ellipse cx="90" cy="118" rx="40" ry="28" fill="${INK}"/><ellipse cx="190" cy="118" rx="40" ry="28" fill="${INK}"/>
    </g>
    <path data-region="asa-esquerda" role="button" tabindex="0" aria-label="Asa esquerda" fill="${PAPER}" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"
      d="M136 112 C118 98 108 72 88 52 C62 32 34 44 26 72 C20 100 34 132 62 148 C88 158 112 148 124 128 C132 118 134 112 136 112 Z
         M98 88 C88 78 78 68 72 58 C68 72 74 96 92 108 C100 100 98 92 98 88 Z"/>
    <path data-region="asa-direita" role="button" tabindex="0" aria-label="Asa direita" fill="${PAPER}" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"
      d="M144 112 C162 98 172 72 192 52 C218 32 246 44 254 72 C260 100 246 132 218 148 C192 158 168 148 156 128 C148 118 146 112 144 112 Z
         M182 88 C192 78 202 68 208 58 C212 72 206 96 188 108 C180 100 182 92 182 88 Z"/>
    <path data-region="corpo" role="button" tabindex="0" aria-label="Corpo da borboleta" fill="${PAPER}" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"
      d="M140 68 C132 68 128 82 128 100 C128 118 132 132 140 136 C148 132 152 118 152 100 C152 82 148 68 140 68 Z"/>
    <g class="color-decor" pointer-events="none">
      <path d="M128 64 C120 44 112 28 102 16" fill="none" stroke="${INK}" stroke-width="2.5" stroke-linecap="round"/><circle cx="100" cy="14" r="4" fill="#ff6b9d"/>
      <path d="M152 64 C160 44 168 28 178 16" fill="none" stroke="${INK}" stroke-width="2.5" stroke-linecap="round"/><circle cx="180" cy="14" r="4" fill="#ff6b9d"/>
      <circle cx="134" cy="96" r="3" fill="${INK}"/><circle cx="146" cy="96" r="3" fill="${INK}"/>
      <path d="M136 106 Q140 112 144 106" fill="none" stroke="${INK}" stroke-width="2" stroke-linecap="round"/>
      <circle cx="48" cy="162" r="5" fill="#ff6b9d"/><circle cx="232" cy="158" r="4" fill="#9775fa"/>
      <path d="M32 138 L36 118 M248 136 L252 116" stroke="#37b24d" stroke-width="3" stroke-linecap="round"/>
    </g>
  `,
  ),
  casa: scene(
    "Casinha",
    "Casinha no campo",
    `
    <g class="color-bg" pointer-events="none">
      <rect width="280" height="200" fill="#fff9db"/>
      <circle cx="248" cy="40" r="28" fill="#ffe14a" opacity=".45"/>
      <ellipse cx="140" cy="192" rx="128" ry="14" fill="#94d82d" opacity=".55"/>
    </g>
    <rect x="60" y="172" width="160" height="12" rx="2" fill="#e9ecef" stroke="${INK}" stroke-width="2" pointer-events="none"/>
    <path data-region="telhado" role="button" tabindex="0" aria-label="Telhado" fill="${PAPER}" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"
      d="M140 24 L48 96 L232 96 Z M140 24 L140 96"/>
    <rect data-region="parede" role="button" tabindex="0" aria-label="Parede esquerda" fill="${PAPER}" stroke="${INK}" stroke-width="2.5" x="64" y="96" width="50" height="76" rx="4"/>
    <rect data-region="parede" role="button" tabindex="0" aria-label="Parede direita" fill="${PAPER}" stroke="${INK}" stroke-width="2.5" x="166" y="96" width="50" height="76" rx="4"/>
    <rect data-region="porta" role="button" tabindex="0" aria-label="Porta" fill="${PAPER}" stroke="${INK}" stroke-width="2.5" x="118" y="118" width="44" height="54" rx="6"/>
    <g class="color-decor" pointer-events="none">
      <rect x="114" y="48" width="18" height="32" rx="2" fill="#868e96" stroke="${INK}" stroke-width="2"/>
      <ellipse cx="123" cy="44" rx="10" ry="6" fill="#dee2e6" stroke="${INK}" stroke-width="1.5"/>
      <rect x="78" y="108" width="28" height="28" rx="4" fill="#fff" stroke="${INK}" stroke-width="2"/>
      <path d="M85 115 H99 M92 108 V122" stroke="#74c0fc" stroke-width="2"/>
      <rect x="174" y="108" width="28" height="28" rx="4" fill="#fff" stroke="${INK}" stroke-width="2"/>
      <circle cx="188" cy="122" r="7" fill="#ffd43b" stroke="${INK}" stroke-width="1.5"/>
      <circle cx="156" cy="152" r="4" fill="${INK}"/>
      <path d="M88 172 H192" stroke="#c4885a" stroke-width="5" stroke-linecap="round"/>
      <path d="M52 168 Q56 148 60 168 M220 166 Q224 146 228 166" stroke="#37b24d" stroke-width="3" fill="none"/>
    </g>
  `,
  ),
  peixe: scene(
    "Peixe",
    "Peixe no oceano",
    `
    <g class="color-bg" pointer-events="none">
      <rect width="280" height="200" fill="#d0ebff"/>
      <path d="M0 140 Q70 120 140 135 T280 130 V200 H0 Z" fill="#4dabf7" opacity=".35"/>
    </g>
    <g class="color-decor" pointer-events="none">
      <circle cx="40" cy="36" r="6" fill="#fff" opacity=".7"/><circle cx="88" cy="24" r="4" fill="#fff" opacity=".5"/>
      <path d="M28 152 Q36 128 44 152" stroke="#37b24d" stroke-width="4" fill="none"/>
      <path d="M248 148 Q256 124 264 148" stroke="#37b24d" stroke-width="4" fill="none"/>
    </g>
    <path data-region="corpo" role="button" tabindex="0" aria-label="Corpo do peixe" fill="${PAPER}" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"
      d="M48 108 C68 78 108 68 148 72 C168 74 178 82 178 108 C178 134 168 142 148 144 C108 148 68 138 48 108 Z"/>
    <path data-region="cauda" role="button" tabindex="0" aria-label="Cauda" fill="${PAPER}" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"
      d="M176 108 L248 72 L248 144 L176 108 M176 108 L248 108 Z"/>
    <path data-region="barbatana" role="button" tabindex="0" aria-label="Barbatana dorsal" fill="${PAPER}" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"
      d="M108 68 L128 52 L148 68 L128 78 Z"/>
    <g class="color-decor" pointer-events="none">
      <circle cx="72" cy="100" r="11" fill="#fff" stroke="${INK}" stroke-width="2"/><circle cx="69" cy="98" r="4" fill="${INK}"/>
      <path d="M62 118 Q78 128 94 118" fill="none" stroke="${INK}" stroke-width="2.5" stroke-linecap="round"/>
      <path d="M100 108 H160" stroke="${INK}" stroke-width="1.5" opacity=".25" stroke-dasharray="6 4"/>
    </g>
  `,
  ),
  flor: scene(
    "Flor",
    "Flor no vaso",
    `
    <g class="color-bg" pointer-events="none">
      <rect width="280" height="200" fill="#e7f5ff"/>
      <ellipse cx="140" cy="188" rx="104" ry="12" fill="#b2f2bb" opacity=".65"/>
    </g>
    <ellipse data-region="petala-n" role="button" tabindex="0" aria-label="Pétala de cima" fill="${PAPER}" stroke="${INK}" stroke-width="2.5"
      cx="140" cy="62" rx="22" ry="28"/>
    <ellipse data-region="petala-s" role="button" tabindex="0" aria-label="Pétala de baixo" fill="${PAPER}" stroke="${INK}" stroke-width="2.5"
      cx="140" cy="110" rx="22" ry="28"/>
    <ellipse data-region="petala-w" role="button" tabindex="0" aria-label="Pétala da esquerda" fill="${PAPER}" stroke="${INK}" stroke-width="2.5"
      cx="98" cy="86" rx="28" ry="22" transform="rotate(-8 98 86)"/>
    <ellipse data-region="petala-e" role="button" tabindex="0" aria-label="Pétala da direita" fill="${PAPER}" stroke="${INK}" stroke-width="2.5"
      cx="182" cy="86" rx="28" ry="22" transform="rotate(8 182 86)"/>
    <circle data-region="centro" role="button" tabindex="0" aria-label="Centro da flor" fill="${PAPER}" stroke="${INK}" stroke-width="2.5" cx="140" cy="86" r="17"/>
    <path data-region="caule" role="button" tabindex="0" aria-label="Caule e vaso" fill="${PAPER}" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"
      d="M136 118 L136 152 L144 152 L144 118 Z M108 168 H172 Q164 188 140 188 Q116 188 108 168 Z"/>
    <g class="color-decor" pointer-events="none">
      <ellipse cx="204" cy="148" rx="15" ry="11" fill="#ff6b6b" stroke="${INK}" stroke-width="2"/>
      <circle cx="198" cy="144" r="2" fill="${INK}"/><circle cx="210" cy="144" r="2" fill="${INK}"/>
      <path d="M108 132 Q86 118 76 134" fill="none" stroke="#37b24d" stroke-width="3"/>
      <path d="M172 132 Q194 118 204 134" fill="none" stroke="#37b24d" stroke-width="3"/>
      <circle cx="140" cy="86" r="3" fill="${INK}" opacity=".3"/><circle cx="132" cy="82" r="2" fill="${INK}" opacity=".25"/>
    </g>
  `,
  ),
  balao: scene(
    "Balão",
    "Balão no céu",
    `
    <g class="color-bg" pointer-events="none">
      <rect width="280" height="200" fill="#d8f3ff"/>
      <path d="M24 52 Q80 32 136 48 T248 44" fill="none" stroke="#fff" stroke-width="10" opacity=".65" stroke-linecap="round"/>
    </g>
    <ellipse data-region="balao" role="button" tabindex="0" aria-label="Balão" fill="${PAPER}" stroke="${INK}" stroke-width="2.5" cx="140" cy="76" rx="48" ry="56"/>
    <path data-region="cesta" role="button" tabindex="0" aria-label="Cesta" fill="${PAPER}" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"
      d="M104 140 H176 L166 168 H114 Z M110 148 H170" />
    <g class="color-decor" pointer-events="none">
      <path d="M140 132 L140 168" stroke="${INK}" stroke-width="2"/>
      <path d="M140 132 Q108 104 88 84" fill="none" stroke="${INK}" stroke-width="2"/>
      <path d="M140 132 Q172 104 192 84" fill="none" stroke="${INK}" stroke-width="2"/>
      <path d="M116 56 Q140 40 164 56" fill="none" stroke="${INK}" stroke-width="1.5" opacity=".35"/>
      <circle cx="124" cy="72" r="5" fill="#fff" opacity=".45"/><circle cx="158" cy="64" r="4" fill="#fff" opacity=".4"/>
      <circle cx="128" cy="88" r="4" fill="${INK}"/><circle cx="152" cy="88" r="4" fill="${INK}"/>
      <path d="M130 98 Q140 106 150 98" fill="none" stroke="${INK}" stroke-width="2.5" stroke-linecap="round"/>
    </g>
  `,
  ),
  sol: scene(
    "Sol",
    "Sol e nuvem no campo",
    `
    <g class="color-bg" pointer-events="none">
      <rect width="280" height="200" fill="#fff4e6"/>
      <path d="M0 148 Q90 118 140 142 T280 138 V200 H0 Z" fill="#b2f2bb" opacity=".5"/>
    </g>
    <circle data-region="sol" role="button" tabindex="0" aria-label="Sol" fill="${PAPER}" stroke="${INK}" stroke-width="2.5" cx="82" cy="78" r="34"/>
    <path data-region="nuvem" role="button" tabindex="0" aria-label="Nuvem" fill="${PAPER}" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"
      d="M142 108 H252 A24 24 0 0 0 248 74 A30 30 0 0 0 186 70 A34 34 0 0 0 142 98 Z"/>
    <g class="color-decor" pointer-events="none">
      <path d="M82 38 V50 M82 106 V118 M38 78 H50 M114 78 H126 M48 48 L56 56 M108 100 L116 108 M116 48 L108 56 M56 100 L48 108" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>
      <circle cx="72" cy="74" r="4" fill="${INK}"/><circle cx="92" cy="74" r="4" fill="${INK}"/>
      <path d="M74 88 Q82 96 90 88" fill="none" stroke="${INK}" stroke-width="2.5" stroke-linecap="round"/>
      <circle cx="186" cy="88" r="3" fill="${INK}"/><circle cx="206" cy="88" r="3" fill="${INK}"/>
      <path d="M190 98 Q198 104 206 98" fill="none" stroke="${INK}" stroke-width="2" stroke-linecap="round"/>
      <path d="M198 44 Q218 52 238 44" fill="none" stroke="#9775fa" stroke-width="3" stroke-linecap="round" opacity=".55"/>
    </g>
  `,
  ),
  lua: scene(
    "Lua",
    "Lua na noite estrelada",
    `
    <g class="color-bg" pointer-events="none">
      <rect width="280" height="200" fill="#141b38"/>
      <circle cx="52" cy="48" r="2" fill="#fff"/><circle cx="228" cy="36" r="2" fill="#fff"/><circle cx="196" cy="72" r="1.5" fill="#fff"/>
      <circle cx="88" cy="28" r="1.5" fill="#fff"/><circle cx="248" cy="88" r="2" fill="#fff"/>
    </g>
    <rect data-region="ceu" role="button" tabindex="0" aria-label="Céu" fill="#243363" stroke="${INK}" stroke-width="2" x="16" y="24" width="248" height="152" rx="18"/>
    <path data-region="lua" role="button" tabindex="0" aria-label="Lua" fill="${PAPER}" stroke="${INK}" stroke-width="2.5"
      d="M168 92 A44 44 0 1 1 168 44 A32 32 0 1 0 168 92 Z"/>
    <g class="color-decor" pointer-events="none">
      <circle cx="148" cy="78" r="5" fill="${INK}" opacity=".15"/><circle cx="162" cy="98" r="4" fill="${INK}" opacity=".12"/>
      <circle cx="154" cy="72" r="3" fill="${INK}"/><circle cx="170" cy="72" r="3" fill="${INK}"/>
      <path d="M156 84 Q162 90 168 84" fill="none" stroke="${INK}" stroke-width="2" stroke-linecap="round"/>
    </g>
  `,
  ),
  carro: scene(
    "Carro",
    "Carro na estrada",
    `
    <g class="color-bg" pointer-events="none">
      <rect width="280" height="200" fill="#e7f5ff"/>
      <rect y="150" width="280" height="50" fill="#ced4da"/>
      <path d="M0 150 H280" stroke="${INK}" stroke-width="3"/>
      <path d="M40 150 H80 M120 150 H160 M200 150 H240" stroke="#fff" stroke-width="4" stroke-dasharray="16 20" opacity=".8"/>
    </g>
    <path data-region="carroceria" role="button" tabindex="0" aria-label="Carroceria" fill="${PAPER}" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"
      d="M64 92 H216 V136 H64 Z M72 136 H88 V148 H192 V136 H208"/>
    <path data-region="capota" role="button" tabindex="0" aria-label="Capota" fill="${PAPER}" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"
      d="M88 92 L112 58 H168 L192 92 Z"/>
    <path data-region="janela" role="button" tabindex="0" aria-label="Vidros" fill="${PAPER}" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"
      d="M100 66 H124 V88 H100 Z M156 66 H180 V88 H156 Z"/>
    <g class="color-decor" pointer-events="none">
      <circle cx="96" cy="148" r="18" fill="#343a40" stroke="${INK}" stroke-width="2.5"/><circle cx="184" cy="148" r="18" fill="#343a40" stroke="${INK}" stroke-width="2.5"/>
      <circle cx="96" cy="148" r="7" fill="#ced4da"/><circle cx="184" cy="148" r="7" fill="#ced4da"/>
      <rect x="68" y="108" width="12" height="8" rx="2" fill="#ffe14a" stroke="${INK}" stroke-width="1.5"/>
      <rect x="200" y="108" width="12" height="8" rx="2" fill="#ff6b6b" stroke="${INK}" stroke-width="1.5"/>
      <circle cx="128" cy="108" r="3" fill="${INK}"/><circle cx="152" cy="108" r="3" fill="${INK}"/>
      <path d="M132 118 Q140 124 148 118" fill="none" stroke="${INK}" stroke-width="2" stroke-linecap="round"/>
    </g>
  `,
  ),
  barco: scene(
    "Barco",
    "Barco à vela",
    `
    <g class="color-bg" pointer-events="none">
      <rect width="280" height="96" fill="#a5d8ff"/>
      <rect y="96" width="280" height="104" fill="#4dabf7" opacity=".5"/>
      <path d="M0 96 C40 88 80 100 140 94 S220 88 280 96" fill="none" stroke="#fff" stroke-width="3" opacity=".4"/>
    </g>
    <path data-region="casco" role="button" tabindex="0" aria-label="Casco" fill="${PAPER}" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"
      d="M72 124 C100 108 180 108 208 124 L192 162 H88 Z"/>
    <path data-region="vela" role="button" tabindex="0" aria-label="Vela principal" fill="${PAPER}" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"
      d="M142 40 L142 124 L204 100 Z M142 124 L204 100 L204 108 L142 124"/>
    <rect data-region="mastro" role="button" tabindex="0" aria-label="Mastro" fill="${PAPER}" stroke="${INK}" stroke-width="2.5" x="136" y="36" width="12" height="92" rx="2"/>
    <g class="color-decor" pointer-events="none">
      <path d="M36 118 Q44 106 52 118" stroke="#fff" stroke-width="4" fill="none" opacity=".55"/>
      <path d="M228 120 Q236 108 244 120" stroke="#fff" stroke-width="4" fill="none" opacity=".55"/>
      <path d="M204 44 L212 52 L204 60 L196 52 Z" fill="#ffe14a" stroke="${INK}" stroke-width="1.5"/>
      <circle cx="108" cy="142" r="3" fill="${INK}"/>
      <path d="M88 148 H192" stroke="${INK}" stroke-width="2" opacity=".3"/>
    </g>
  `,
  ),
  estrela: scene(
    "Estrela",
    "Estrela cadente",
    `
    <g class="color-bg" pointer-events="none">
      <rect width="280" height="200" fill="#fff9db"/>
      <circle cx="48" cy="40" r="7" fill="#ffd43b" opacity=".45"/><circle cx="232" cy="52" r="5" fill="#ff922b" opacity=".4"/>
    </g>
    <rect data-region="fundo" role="button" tabindex="0" aria-label="Céu" fill="#e7f5ff" stroke="${INK}" stroke-width="2.5" x="20" y="20" width="240" height="160" rx="16"/>
    <polygon data-region="estrela" role="button" tabindex="0" aria-label="Estrela" fill="${PAPER}" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"
      points="140,44 156,92 206,92 166,122 180,172 140,142 100,172 114,122 74,92 124,92"/>
    <g class="color-decor" pointer-events="none">
      <circle cx="126" cy="104" r="4" fill="${INK}"/><circle cx="154" cy="104" r="4" fill="${INK}"/>
      <path d="M126 118 Q140 128 154 118" fill="none" stroke="${INK}" stroke-width="2.5" stroke-linecap="round"/>
      <path d="M200 36 L248 52" stroke="#9775fa" stroke-width="3" stroke-linecap="round" opacity=".5"/>
    </g>
  `,
  ),
  pato: scene(
    "Pato",
    "Patinho na lagoa",
    `
    <g class="color-bg" pointer-events="none">
      <rect width="280" height="200" fill="#d0ebff"/>
      <ellipse cx="140" cy="172" rx="118" ry="22" fill="#74c0fc" opacity=".55"/>
      <path d="M0 172 Q70 162 140 172 T280 168" fill="none" stroke="#4dabf7" stroke-width="2" opacity=".4"/>
    </g>
    <path data-region="corpo" role="button" tabindex="0" aria-label="Corpo do pato" fill="${PAPER}" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"
      d="M56 118 C72 88 108 78 140 82 C168 86 188 100 188 122 C188 142 168 152 140 152 C100 152 64 142 56 118 Z"/>
    <path data-region="cabeca" role="button" tabindex="0" aria-label="Cabeça" fill="${PAPER}" stroke="${INK}" stroke-width="2.5"
      d="M168 72 A32 32 0 1 1 168 104 A28 28 0 1 0 168 72 Z"/>
    <path data-region="bico" role="button" tabindex="0" aria-label="Bico" fill="${PAPER}" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"
      d="M196 84 L248 78 L196 96 Z"/>
    <g class="color-decor" pointer-events="none">
      <ellipse cx="178" cy="84" rx="5" ry="6" fill="#fff" stroke="${INK}" stroke-width="1.5"/><circle cx="176" cy="82" r="2.5" fill="${INK}"/>
      <path d="M182 94 Q192 100 202 94" fill="none" stroke="${INK}" stroke-width="2" stroke-linecap="round"/>
      <ellipse cx="120" cy="108" rx="18" ry="10" fill="#fff" opacity=".35" stroke="${INK}" stroke-width="1" opacity=".5"/>
      <path d="M100 148 L88 158 M108 152 L96 162" stroke="#ff922b" stroke-width="3" stroke-linecap="round"/>
    </g>
  `,
  ),
  cachorro: scene(
    "Cachorro",
    "Cachorro brincando",
    `
    <g class="color-bg" pointer-events="none">
      <rect width="280" height="200" fill="#e7f5ff"/>
      <ellipse cx="140" cy="182" rx="108" ry="14" fill="#b2f2bb" opacity=".55"/>
    </g>
    <path data-region="corpo" role="button" tabindex="0" aria-label="Corpo" fill="${PAPER}" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"
      d="M88 128 C96 100 124 88 152 92 C176 96 192 112 192 132 C192 152 172 162 140 162 C108 162 84 152 88 128 Z"/>
    <path data-region="cabeca" role="button" tabindex="0" aria-label="Cabeça" fill="${PAPER}" stroke="${INK}" stroke-width="2.5"
      d="M108 88 A36 36 0 1 1 172 88 A32 32 0 1 0 108 88 Z"/>
    <path data-region="orelha-esq" role="button" tabindex="0" aria-label="Orelha esquerda" fill="${PAPER}" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"
      d="M104 72 C92 48 88 32 100 28 C112 24 118 44 112 64 Z"/>
    <path data-region="orelha-dir" role="button" tabindex="0" aria-label="Orelha direita" fill="${PAPER}" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"
      d="M176 72 C188 48 192 32 180 28 C168 24 162 44 168 64 Z"/>
    <g class="color-decor" pointer-events="none">
      <ellipse cx="128" cy="84" rx="8" ry="10" fill="#fff" stroke="${INK}" stroke-width="1.5"/><ellipse cx="152" cy="84" rx="8" ry="10" fill="#fff" stroke="${INK}" stroke-width="1.5"/>
      <circle cx="128" cy="82" r="3" fill="${INK}"/><circle cx="152" cy="82" r="3" fill="${INK}"/>
      <ellipse cx="140" cy="98" rx="12" ry="9" fill="#fff" stroke="${INK}" stroke-width="2"/>
      <path d="M132 104 Q140 112 148 104" fill="none" stroke="${INK}" stroke-width="2.5" stroke-linecap="round"/>
      <path d="M192 132 Q216 120 228 108" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>
      <path d="M108 158 L92 172 M172 158 L188 172" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>
    </g>
  `,
  ),
  gato: scene(
    "Gato",
    "Gatinho curioso",
    `
    <g class="color-bg" pointer-events="none">
      <rect width="280" height="200" fill="#f3f0ff"/>
      <ellipse cx="140" cy="184" rx="96" ry="12" fill="#d0bfff" opacity=".45"/>
    </g>
    <path data-region="corpo" role="button" tabindex="0" aria-label="Corpo" fill="${PAPER}" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"
      d="M96 132 C104 104 128 92 152 96 C176 100 188 118 184 140 C180 158 160 166 140 166 C116 166 92 154 96 132 Z"/>
    <circle data-region="cabeca" role="button" tabindex="0" aria-label="Cabeça" fill="${PAPER}" stroke="${INK}" stroke-width="2.5" cx="140" cy="78" r="34"/>
    <path data-region="orelha-esq" role="button" tabindex="0" aria-label="Orelha esquerda" fill="${PAPER}" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"
      d="M108 58 L118 24 L128 54 Z M112 52 L118 36 L124 50 Z" fill-rule="evenodd"/>
    <path data-region="orelha-dir" role="button" tabindex="0" aria-label="Orelha direita" fill="${PAPER}" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"
      d="M152 54 L162 24 L172 58 Z M156 50 L162 36 L168 52 Z" fill-rule="evenodd"/>
    <path data-region="laco" role="button" tabindex="0" aria-label="Laço" fill="${PAPER}" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"
      d="M112 108 C112 96 168 96 168 108 L140 128 Z M112 108 C100 108 96 116 104 120 M168 108 C180 108 184 116 176 120"/>
    <g class="color-decor" pointer-events="none">
      <circle cx="128" cy="74" r="4" fill="${INK}"/><circle cx="152" cy="74" r="4" fill="${INK}"/>
      <path d="M128 86 Q140 94 152 86" fill="none" stroke="${INK}" stroke-width="2.5" stroke-linecap="round"/>
      <path d="M118 78 L104 72 M162 78 L176 72" stroke="${INK}" stroke-width="2" stroke-linecap="round"/>
      <path d="M184 140 Q208 120 220 100" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>
      <path d="M124 158 Q140 168 156 158" fill="none" stroke="${INK}" stroke-width="2"/>
    </g>
  `,
  ),
  sapo: scene(
    "Sapo",
    "Sapo na vitória-régia",
    `
    <g class="color-bg" pointer-events="none">
      <rect width="280" height="200" fill="#d8f5e3"/>
      <ellipse cx="140" cy="178" rx="108" ry="18" fill="#51cf66" opacity=".35"/>
    </g>
    <path data-region="folha" role="button" tabindex="0" aria-label="Folha" fill="${PAPER}" stroke="${INK}" stroke-width="2.5"
      d="M32 158 C80 132 200 132 248 158 C200 178 80 178 32 158 Z"/>
    <path data-region="corpo" role="button" tabindex="0" aria-label="Corpo" fill="${PAPER}" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"
      d="M88 118 C104 92 176 92 192 118 C200 132 188 148 140 152 C92 148 80 132 88 118 Z"/>
    <path data-region="cabeca" role="button" tabindex="0" aria-label="Cabeça" fill="${PAPER}" stroke="${INK}" stroke-width="2.5"
      d="M108 72 C108 52 172 52 172 72 C172 92 152 100 140 100 C128 100 108 92 108 72 Z"/>
    <ellipse data-region="barriga" role="button" tabindex="0" aria-label="Barriga" fill="${PAPER}" stroke="${INK}" stroke-width="2.5" cx="140" cy="124" rx="32" ry="26"/>
    <g class="color-decor" pointer-events="none">
      <circle cx="120" cy="68" r="12" fill="#fff" stroke="${INK}" stroke-width="2"/><circle cx="160" cy="68" r="12" fill="#fff" stroke="${INK}" stroke-width="2"/>
      <circle cx="120" cy="66" r="4" fill="${INK}"/><circle cx="160" cy="66" r="4" fill="${INK}"/>
      <path d="M126 84 Q140 92 154 84" fill="none" stroke="${INK}" stroke-width="2.5" stroke-linecap="round"/>
      <ellipse cx="96" cy="112" rx="10" ry="14" fill="${PAPER}" stroke="${INK}" stroke-width="2"/><ellipse cx="184" cy="112" rx="10" ry="14" fill="${PAPER}" stroke="${INK}" stroke-width="2"/>
      <path d="M140 100 L140 108" stroke="${INK}" stroke-width="2"/>
    </g>
  `,
  ),
};

export const SCENE_EMOJI = {
  borboleta: "🦋",
  casa: "🏠",
  peixe: "🐟",
  flor: "🌸",
  balao: "🎈",
  sol: "☀️",
  lua: "🌙",
  carro: "🚗",
  barco: "⛵",
  estrela: "⭐",
  pato: "🦆",
  cachorro: "🐶",
  gato: "🐱",
  sapo: "🐸",
};
