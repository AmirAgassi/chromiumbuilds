import { GITHUB_SOURCES, REPOLOGY_PROJECTS, SNAPSHOT_META, SNAPSHOT_SOURCES, DISTRO_NAMES } from "./sources";
import type { GithubSource } from "./sources";
import type { Arch, Build, DistroPackage, Download, Freshness, Manifest, Simd, Upstream } from "./types";

const UA = "chromiumbuilds.org (+https://github.com/AmirAgassi/chromiumbuilds)";
const TOKEN = process.env.GITHUB_TOKEN || process.env.GH_TOKEN || "";
const errors: { source: string; message: string }[] = [];

function note(source: string, message: string) {
  errors.push({ source, message });
  console.warn(`  ! ${source}: ${message}`);
}

async function json<T>(url: string, headers: Record<string, string> = {}, tries = 3): Promise<T> {
  let last: unknown;
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(url, { headers: { "User-Agent": UA, ...headers } });
      if (res.status === 403 || res.status === 429) {
        const reset = res.headers.get("x-ratelimit-reset");
        throw new Error(`rate limited (reset ${reset ?? "unknown"})`);
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return (await res.json()) as T;
    } catch (e) {
      last = e;
      if (i < tries - 1) await Bun.sleep(600 * (i + 1));
    }
  }
  throw last;
}

async function text(url: string): Promise<string> {
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return (await res.text()).trim();
}

const gh = <T>(path: string) =>
  json<T>(`https://api.github.com${path}`, {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    ...(TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {}),
  });

// ---------------------------------------------------------------- upstream

async function fetchUpstream(): Promise<Upstream> {
  const cft = await json<{
    channels: Record<string, { version: string; revision: string }>;
  }>("https://googlechromelabs.github.io/chrome-for-testing/last-known-good-versions.json");

  const pick = (name: string) => {
    const c = cft.channels[name];
    return { version: c.version, milestone: Number(c.version.split(".")[0]), revision: c.revision };
  };
  return {
    stable: pick("Stable"),
    beta: pick("Beta"),
    dev: pick("Dev"),
    canary: pick("Canary"),
    fetchedAt: new Date().toISOString(),
  };
}

// ---------------------------------------------------------------- helpers

const VERSION_RE = /(\d+\.\d+\.\d+\.\d+)/;
const REVISION_RE = /[-_]r(\d{5,})/i;

function parseVersion(...candidates: (string | undefined | null)[]): string | null {
  for (const c of candidates) {
    const m = c?.match(VERSION_RE);
    if (m) return m[1];
  }
  return null;
}

function parseRevision(...candidates: (string | undefined | null)[]): string | undefined {
  for (const c of candidates) {
    const m = c?.match(REVISION_RE);
    if (m) return m[1];
  }
  return undefined;
}

function simdFromTag(tag: string): Simd | undefined {
  const t = tag.toLowerCase();
  if (t.includes("avx512")) return "avx512";
  if (t.includes("avx2")) return "avx2";
  if (t.includes("avx")) return "avx";
  if (t.includes("sse4")) return "sse4";
  if (t.includes("sse3")) return "sse3";
  return undefined;
}

function platformHintFromTag(tag: string): "windows" | "linux" | "macos" | "android" | null {
  const t = tag.toLowerCase();
  if (t.includes("win")) return "windows";
  if (t.includes("linux") || t.includes("lin64")) return "linux";
  if (t.includes("macos") || t.includes("mac")) return "macos";
  if (t.includes("android") || t.includes("and64")) return "android";
  return null;
}

function daysSince(iso: string): number {
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
}

/**
 * Freshness is derived, never hand-set. A build one milestone behind upstream stable is
 * normal for a volunteer rebuild; two or more behind means you are missing security fixes.
 */
function freshness(milestone: number, stableMilestone: number, ageDays: number): Freshness {
  if (ageDays > 365) return "abandoned";
  const gap = stableMilestone - milestone;
  if (gap <= 0) return "current";
  if (gap === 1) return "behind";
  return "outdated";
}

function shortSha(digest?: string | null): string | undefined {
  if (!digest) return undefined;
  return digest.startsWith("sha256:") ? digest.slice(7) : digest;
}

// ---------------------------------------------------------------- github

interface GhAsset {
  name: string;
  size: number;
  digest?: string | null;
  browser_download_url: string;
}
interface GhRelease {
  tag_name: string;
  name: string | null;
  body: string | null;
  draft: boolean;
  prerelease: boolean;
  published_at: string;
  html_url: string;
  assets: GhAsset[];
}

function buildsFromRelease(
  src: GithubSource,
  rel: GhRelease,
  upstream: Upstream,
  restrictPlatform: string | null,
  tagSimd: Simd | undefined,
): Build[] {
  const version = parseVersion(rel.tag_name, rel.name);
  if (!version) return [];
  const revision = parseRevision(rel.tag_name, rel.name, rel.body);
  const milestone = Number(version.split(".")[0]);
  const ageDays = daysSince(rel.published_at);

  // group matched assets by platform+arch, since one release spans many targets
  const groups = new Map<string, Download[]>();
  for (const asset of rel.assets) {
    const rule = src.assets.find((r) => r.re.test(asset.name));
    if (!rule) continue;
    if (restrictPlatform && rule.platform !== restrictPlatform) continue;
    const key = `${rule.platform}|${rule.arch}`;
    const dl: Download = {
      kind: rule.kind,
      label: rule.label ?? rule.kind,
      filename: asset.name,
      url: asset.browser_download_url,
      size: asset.size,
      sha256: shortSha(asset.digest),
      arch: rule.arch,
      simd: rule.simd ?? tagSimd,
      recommended: rule.recommended,
    };
    const list = groups.get(key) ?? [];
    list.push(dl);
    groups.set(key, list);
  }

  const out: Build[] = [];
  for (const [key, downloads] of groups) {
    const [platform, arch] = key.split("|") as [Build["platform"], Arch];
    // Only a variant-per-tag source pins a SIMD level on the build itself. Where one release
    // carries every variant, the choice belongs to the download list, not the card.
    const simd = tagSimd;
    const stem = src.id.endsWith(`-${platform}`) ? src.id : `${src.id}-${platform}`;
    out.push({
      id: `${stem}-${arch}${simd ? `-${simd}` : ""}`,
      project: src.id,
      projectName: src.name,
      maintainer: src.maintainer,
      platform,
      arch: [arch],
      channel: src.channel,
      version,
      milestone,
      revision,
      releasedAt: rel.published_at,
      google: src.google,
      proprietaryCodecs: src.proprietaryCodecs,
      hevc: src.hevc,
      widevine: src.widevine,
      simd,
      downloads: downloads.sort(
        (a, b) => Number(!!b.recommended) - Number(!!a.recommended) || a.label.localeCompare(b.label),
      ),
      releaseUrl: rel.html_url,
      sourceUrl: `https://github.com/${src.repo}`,
      freshness: freshness(milestone, upstream.stable.milestone, ageDays),
      ageDays,
      notes: src.notes ?? [],
    });
  }
  return out;
}

async function fetchGithubSource(src: GithubSource, upstream: Upstream): Promise<Build[]> {
  const count = src.releases ?? 5;
  let releases: GhRelease[];
  try {
    releases = await gh<GhRelease[]>(`/repos/${src.repo}/releases?per_page=${count}`);
  } catch (e) {
    note(src.repo, `could not list releases: ${(e as Error).message}`);
    return [];
  }

  const usable = releases.filter((r) => !r.draft && r.assets.length > 0 && (!src.tagFilter || src.tagFilter.test(r.tag_name)));
  if (usable.length === 0) {
    note(src.repo, "no releases carry downloadable assets");
    return [];
  }

  if (!src.multiTag) {
    const rel = usable.find((r) => !r.prerelease) ?? usable[0];
    return buildsFromRelease(src, rel, upstream, null, undefined);
  }

  // Variants split across sibling tags (RobRich publishes one tag per SIMD level and OS).
  // Take every tag that shares the newest version so all variants land together.
  const newestVersion = parseVersion(usable[0].tag_name, usable[0].name);
  const out: Build[] = [];
  for (const rel of usable) {
    if (parseVersion(rel.tag_name, rel.name) !== newestVersion) continue;
    out.push(
      ...buildsFromRelease(src, rel, upstream, platformHintFromTag(rel.tag_name), simdFromTag(rel.tag_name)),
    );
  }
  return out;
}

// ---------------------------------------------------------------- snapshots

async function fetchSnapshots(upstream: Upstream): Promise<Build[]> {
  const out: Build[] = [];
  await Promise.all(
    SNAPSHOT_SOURCES.map(async (s) => {
      try {
        const revision = await text(
          `https://storage.googleapis.com/chromium-browser-snapshots/${s.bucketPlatform}/LAST_CHANGE`,
        );
        if (!/^\d+$/.test(revision)) throw new Error(`unexpected LAST_CHANGE body: ${revision.slice(0, 40)}`);
        const url = `https://storage.googleapis.com/chromium-browser-snapshots/${s.bucketPlatform}/${revision}/${s.file}`;
        out.push({
          id: s.id,
          project: "chromium-snapshot",
          projectName: SNAPSHOT_META.name,
          maintainer: SNAPSHOT_META.maintainer,
          platform: s.platform,
          arch: [s.arch],
          channel: "snapshot",
          // Snapshots are identified by revision; the closest version label is the canary line.
          version: upstream.canary.version,
          milestone: upstream.canary.milestone,
          revision,
          releasedAt: new Date().toISOString(),
          google: "raw",
          proprietaryCodecs: false,
          hevc: false,
          widevine: false,
          downloads: [
            {
              kind: s.kind,
              label: s.label,
              filename: s.file,
              url,
              arch: s.arch,
              recommended: true,
            },
          ],
          releaseUrl: `https://storage.googleapis.com/chromium-browser-snapshots/index.html?prefix=${s.bucketPlatform}/${revision}/`,
          sourceUrl: "https://www.chromium.org/getting-involved/download-chromium/",
          freshness: "current",
          ageDays: 0,
          notes: SNAPSHOT_META.notes,
        });
      } catch (e) {
        note(`snapshot ${s.bucketPlatform}`, (e as Error).message);
      }
    }),
  );
  return out;
}

// ---------------------------------------------------------------- repology

interface RepologyPkg {
  repo: string;
  visiblename?: string;
  srcname?: string;
  binname?: string;
  version: string;
  status?: string;
}

async function fetchDistros(): Promise<DistroPackage[]> {
  const out: DistroPackage[] = [];
  for (const project of REPOLOGY_PROJECTS) {
    try {
      const pkgs = await json<RepologyPkg[]>(`https://repology.org/api/v1/project/${project}`);
      const best = new Map<string, RepologyPkg>();
      for (const p of pkgs) {
        if (!DISTRO_NAMES[p.repo]) continue;
        const prev = best.get(p.repo);
        if (!prev || compareVersions(p.version, prev.version) > 0) best.set(p.repo, p);
      }
      for (const [repo, p] of best) {
        out.push({
          repo,
          distro: DISTRO_NAMES[repo],
          version: p.version,
          status: p.status ?? "unknown",
          package: p.binname ?? p.srcname ?? project,
          project,
        });
      }
    } catch (e) {
      note(`repology/${project}`, (e as Error).message);
    }
    await Bun.sleep(1100); // Repology asks for one request per second
  }
  return out;
}

export function compareVersions(a: string, b: string): number {
  const pa = a.split(/[.\-+~]/).map((x) => Number.parseInt(x, 10) || 0);
  const pb = b.split(/[.\-+~]/).map((x) => Number.parseInt(x, 10) || 0);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const d = (pa[i] ?? 0) - (pb[i] ?? 0);
    if (d !== 0) return d;
  }
  return 0;
}

/**
 * One logical build can arrive from several sibling tags: RobRich publishes the .deb and the
 * .rpm of the same variant under separate tags, which land here as two records sharing an id.
 */
function mergeById(builds: Build[]): Build[] {
  const byId = new Map<string, Build>();
  for (const b of builds) {
    const existing = byId.get(b.id);
    if (!existing) {
      byId.set(b.id, b);
      continue;
    }
    const seen = new Set(existing.downloads.map((d) => d.url));
    existing.downloads.push(...b.downloads.filter((d) => !seen.has(d.url)));
    existing.downloads.sort(
      (x, y) => Number(!!y.recommended) - Number(!!x.recommended) || x.label.localeCompare(y.label),
    );
  }
  return [...byId.values()];
}

// ---------------------------------------------------------------- main

async function main() {
  console.log("fetching upstream version reference...");
  const upstream = await fetchUpstream();
  console.log(`  stable ${upstream.stable.version} / dev ${upstream.dev.version}`);

  console.log("fetching github release sources...");
  const ghBuilds = (
    await Promise.all(
      GITHUB_SOURCES.map(async (s) => {
        const b = await fetchGithubSource(s, upstream);
        console.log(`  ${s.repo.padEnd(52)} ${b.length} build(s)`);
        return b;
      }),
    )
  ).flat();

  console.log("fetching official snapshots...");
  const snapBuilds = await fetchSnapshots(upstream);
  console.log(`  ${snapBuilds.length} snapshot target(s)`);

  console.log("fetching distro packages...");
  const distros = await fetchDistros();
  console.log(`  ${distros.length} package(s) across distributions`);

  const builds = mergeById([...ghBuilds, ...snapBuilds]).sort(
    (a, b) =>
      a.platform.localeCompare(b.platform) ||
      compareVersions(b.version, a.version) ||
      a.projectName.localeCompare(b.projectName),
  );

  const manifest: Manifest = {
    generatedAt: new Date().toISOString(),
    upstream,
    builds,
    distros,
    errors,
  };

  await Bun.write("data/manifest.json", `${JSON.stringify(manifest, null, 2)}\n`);
  console.log(`\nwrote data/manifest.json: ${builds.length} builds, ${distros.length} distro packages, ${errors.length} error(s)`);

  if (builds.length < 20) {
    console.error("refusing to continue: implausibly few builds, upstream sources may be broken");
    process.exit(1);
  }
}

if (import.meta.main) await main();
