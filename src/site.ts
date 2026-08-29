export const SITE = {
  name: "Chromium Builds",
  tagline: "Every trusted Chromium build, one page.",
  origin: (process.env.SITE_URL ?? "https://chromiumbuilds.org").replace(/\/$/, ""),
  base: (process.env.BASE_PATH ?? "").replace(/\/$/, ""),
  repo: "https://github.com/AmirAgassi/chromiumbuilds",
  description:
    "Download Chromium for Windows, macOS, Linux and Android. Current versions, SHA-256 checksums and direct links for every trusted build, updated automatically.",
};

/** Root-relative URL for an internal path, honouring a GitHub Pages project sub-path. */
export function url(path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${SITE.base}${p}`;
}

/** Absolute URL, for canonicals, sitemaps and structured data. */
export function abs(path: string): string {
  return `${SITE.origin}${url(path)}`;
}

export function esc(s: unknown): string {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function bytes(n?: number): string {
  if (!n) return "";
  const mb = n / 1_048_576;
  return mb >= 1024 ? `${(mb / 1024).toFixed(2)} GB` : `${mb.toFixed(1)} MB`;
}

export function shortDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-CA", { year: "numeric", month: "short", day: "numeric" });
}

export function relDate(iso: string): string {
  const d = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (d <= 0) return "today";
  if (d === 1) return "yesterday";
  if (d < 30) return `${d} days ago`;
  if (d < 365) return `${Math.floor(d / 30)} months ago`;
  const y = Math.floor(d / 365);
  return y === 1 ? "over a year ago" : `${y} years ago`;
}
