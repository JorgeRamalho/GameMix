/**
 * Cria um link público temporário (internet) para o GameKids.
 * O servidor local deve estar rodando: npm run dev
 */
import { spawn } from "node:child_process";
import os from "node:os";

const port = Number(process.env.PORT || 4173);

function lanAddresses() {
  const seen = new Set();
  const list = [];
  for (const iface of Object.values(os.networkInterfaces())) {
    if (!iface) continue;
    for (const addr of iface) {
      if (addr.family !== "IPv4" || addr.internal) continue;
      if (seen.has(addr.address)) continue;
      seen.add(addr.address);
      list.push(addr.address);
    }
  }
  return list;
}

console.log("");
console.log("  GameKids — compartilhar");
console.log("");
console.log(`  Certifique-se de que \"npm run dev\" está rodando na porta ${port}.`);
console.log("");
const ips = lanAddresses();
if (ips.length) {
  console.log("  Rede local (Wi‑Fi):");
  for (const ip of ips) {
    console.log(`    http://${ip}:${port}/`);
  }
  console.log("");
}
console.log("  Abrindo túnel público (link na internet)...");
console.log("");

const child = spawn(
  "npx",
  ["--yes", "localtunnel", "--port", String(port)],
  { stdio: "inherit", shell: true, env: process.env },
);

child.on("exit", (code) => process.exit(code ?? 0));
