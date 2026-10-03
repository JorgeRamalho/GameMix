/**
 * Catálogo de animais com fotos reais (Wikimedia Commons) em /assets/animals/.
 */

export const ANIMALS = [
  { id: "cao", label: "Cachorro", hint: "Faz au au!", photo: "assets/animals/cao.jpg" },
  { id: "gato", label: "Gato", hint: "Faz miau!", photo: "assets/animals/gato.jpg" },
  { id: "pato", label: "Pato", hint: "Nada no lago!", photo: "assets/animals/pato.jpg" },
  { id: "galinha", label: "Galinha", hint: "Bota ovo!", photo: "assets/animals/galinha.jpg" },
  { id: "vaca", label: "Vaca", hint: "Dá leite!", photo: "assets/animals/vaca.jpg" },
  { id: "porco", label: "Porco", hint: "Faz oink oink!", photo: "assets/animals/porco.jpg" },
  { id: "ovelha", label: "Ovelha", hint: "Tem lã fofinha!", photo: "assets/animals/ovelha.jpg" },
  { id: "coelho", label: "Coelho", hint: "Pula e come cenoura!", photo: "assets/animals/coelho.jpg" },
  { id: "cavalo", label: "Cavalo", hint: "Corre bem rápido!", photo: "assets/animals/cavalo.jpg" },
  { id: "passaro", label: "Pássaro", hint: "Voa no céu!", photo: "assets/animals/passaro.jpg" },
  { id: "peixe", label: "Peixe", hint: "Mora na água!", photo: "assets/animals/peixe.jpg" },
  { id: "elefante", label: "Elefante", hint: "Tem tromba grande!", photo: "assets/animals/elefante.jpg" },
  { id: "leao", label: "Leão", hint: "É o rei da selva!", photo: "assets/animals/leao.jpg" },
  { id: "macaco", label: "Macaco", hint: "Gosta de subir em árvore!", photo: "assets/animals/macaco.jpg" },
];

const byId = new Map(ANIMALS.map((animal) => [animal.id, animal]));

export function getAnimal(id) {
  return byId.get(id);
}

export function animalsForPhase(ids) {
  return ids.map((id) => byId.get(id)).filter(Boolean);
}

/** Fases com conjuntos alternados de bichos (fazenda → campo → mistura). */
export const ANIMAL_PHASES = [
  {
    rounds: 2,
    options: 2,
    ids: ["cao", "gato", "pato", "galinha"],
  },
  {
    rounds: 3,
    options: 3,
    ids: ["vaca", "porco", "ovelha", "coelho", "cavalo", "passaro"],
  },
  {
    rounds: 4,
    options: 3,
    ids: [
      "cao",
      "gato",
      "elefante",
      "leao",
      "macaco",
      "peixe",
      "pato",
      "vaca",
      "porco",
      "galinha",
      "coelho",
      "passaro",
    ],
  },
];

export const E2E_ANIMAL_PHASE = {
  rounds: 1,
  options: 2,
  ids: ["cao", "gato", "pato", "galinha"],
};
