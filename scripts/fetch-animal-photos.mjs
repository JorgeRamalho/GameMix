/**
 * Baixa fotos reais (Wikimedia Commons) para assets/animals/.
 * Uso: node scripts/fetch-animal-photos.mjs
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(root, "assets", "animals");

/** Imagens redimensionadas via Wikimedia Special:FilePath (estável para download). */
const PHOTOS = {
  cao: "https://commons.wikimedia.org/wiki/Special:FilePath/YellowLabradorLooking_new.jpg?width=640",
  gato: "https://commons.wikimedia.org/wiki/Special:FilePath/Cat03.jpg?width=640",
  pato: "https://commons.wikimedia.org/wiki/Special:FilePath/Bucephala-albeola-010.jpg?width=640",
  galinha: "https://commons.wikimedia.org/wiki/Special:FilePath/Rhode_Island_Red_rooster.jpg?width=640",
  vaca: "https://commons.wikimedia.org/wiki/Special:FilePath/Cow_female_black_white.jpg?width=640",
  porco: "https://commons.wikimedia.org/wiki/Special:FilePath/Pig_in_a_bucket.jpg?width=640",
  ovelha: "https://commons.wikimedia.org/wiki/Special:FilePath/Flock_of_sheep.jpg?width=640",
  coelho: "https://commons.wikimedia.org/wiki/Special:FilePath/Oryctolagus_cuniculus_Rcdo.jpg?width=640",
  cavalo: "https://commons.wikimedia.org/wiki/Special:FilePath/Nokota_Horses_cropped.jpg?width=640",
  passaro: "https://commons.wikimedia.org/wiki/Special:FilePath/Turdus-migratorius-002.jpg?width=640",
  peixe: "https://commons.wikimedia.org/wiki/Special:FilePath/Georgia_Aquarium_-_Giant_Grouper_edit.jpg?width=640",
  elefante: "https://commons.wikimedia.org/wiki/Special:FilePath/African_Bush_Elephant.jpg?width=640",
  leao: "https://commons.wikimedia.org/wiki/Special:FilePath/Lion_waiting_in_Namibia.jpg?width=640",
  macaco: "https://commons.wikimedia.org/wiki/Special:FilePath/Bonobo_009.jpg?width=640",
};

await mkdir(outDir, { recursive: true });

for (const [id, url] of Object.entries(PHOTOS)) {
  const res = await fetch(url, { headers: { "User-Agent": "GameKids/1.0 (educational)" } });
  if (!res.ok) {
    console.error(`Falha ${id}: ${res.status} ${url}`);
    process.exitCode = 1;
    continue;
  }
  const buf = Buffer.from(await res.arrayBuffer());
  const file = path.join(outDir, `${id}.jpg`);
  await writeFile(file, buf);
  console.log(`OK ${id} (${buf.length} bytes)`);
}
