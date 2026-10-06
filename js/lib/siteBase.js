/**
 * Pasta do app na URL (ex.: "/GameMix/" no GitHub Pages, "/" no dev local).
 */
export function siteBasePath() {
  let path = location.pathname;
  const parts = path.split("/").filter(Boolean);
  const last = parts[parts.length - 1] ?? "";
  if (last.includes(".")) {
    path = path.slice(0, -(last.length + 1));
  }
  if (!path.endsWith("/")) {
    path += "/";
  }
  return path;
}

/** Caminho absoluto a partir da raiz do site (respeita subpasta do GitHub Pages). */
export function siteUrl(relativePath) {
  const rel = relativePath.replace(/^\//, "");
  const base = siteBasePath();
  if (base === "/") {
    return `/${rel}`;
  }
  return `${base}${rel}`;
}
