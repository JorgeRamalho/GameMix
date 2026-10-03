import fs from "node:fs";
import http from "node:http";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const port = Number(process.env.PORT || 4173);
const host = process.env.HOST || "0.0.0.0";

const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".json": "application/json; charset=utf-8",
  ".webmanifest": "application/manifest+json",
  ".txt": "text/plain; charset=utf-8",
  ".woff2": "font/woff2",
  ".png": "image/png",
  ".ico": "image/x-icon",
};

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

const server = http.createServer((req, res) => {
  const url = new URL(req.url || "/", `http://127.0.0.1:${port}`);
  let pathname = decodeURIComponent(url.pathname);
  // Mesmo prefixo do GitHub Pages (jorgeramalho.github.io/GameKids/)
  const pagesPrefix = "/GameKids";
  if (pathname === pagesPrefix || pathname.startsWith(`${pagesPrefix}/`)) {
    pathname = pathname.slice(pagesPrefix.length) || "/";
  }
  if (pathname === "/favicon.ico") pathname = "/assets/icon.svg";
  if (pathname.endsWith("/")) pathname += "index.html";

  const file = path.normalize(path.join(root, pathname));
  if (!file.startsWith(root)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  fs.readFile(file, (error, data) => {
    if (error) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Not found");
      return;
    }
    const ext = path.extname(file).toLowerCase();
    res.writeHead(200, {
      "Content-Type": types[ext] || "application/octet-stream",
      "Cache-Control": "no-store",
    });
    res.end(data);
  });
});

server.listen(port, host, () => {
  console.log("");
  console.log("  GameKids — servidor ativo");
  console.log("");
  console.log(`  Neste computador:  http://127.0.0.1:${port}/`);
  const ips = lanAddresses();
  if (ips.length) {
    console.log("");
    console.log("  Outros aparelhos na mesma Wi‑Fi:");
    for (const ip of ips) {
      console.log(`    → http://${ip}:${port}/`);
    }
    console.log("");
    console.log("  Use o link acima no celular ou tablet (mesma rede).");
  } else {
    console.log("");
    console.log("  Não foi possível detectar o IP da rede. Verifique Wi‑Fi ou use npm run share.");
  }
  console.log("");
});
