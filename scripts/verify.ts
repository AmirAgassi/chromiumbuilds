/**
 * Post-build checks. Fails the build on anything that would ship a broken page:
 * dead internal links, missing pages, malformed feeds, or download URLs that no longer resolve.
 */
import { readdir } from "node:fs/promises";
import type { Manifest } from "../src/types";

const OUT = "dist";
const SKIP_NETWORK = process.argv.includes("--no-network");
let failures = 0;
let checks = 0;

function ok(label: string) {
  checks++;
  console.log(`  ok   ${label}`);
}
function bad(label: string, detail: string) {
  checks++;
  failures++;
  console.error(`  FAIL ${label}: ${detail}`);
}

async function walk(dir: string): Promise<string[]> {
  const out: string[] = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = `${dir}/${e.name}`;
    if (e.isDirectory()) out.push(...(await walk(p)));
    else out.push(p);
  }
  return out;
}

const files = await walk(OUT);
const html = files.filter((f) => f.endsWith(".html"));
const manifest: Manifest = await Bun.file("data/manifest.json").json();

console.log(`\n== structure (${html.length} pages) ==`);
const required = [
  "index.html",
  "windows/index.html",
  "macos/index.html",
  "linux/index.html",
  "android/index.html",
  "bsd/index.html",
  "chromeos/index.html",
  "builds/index.html",
  "chromium/index.html",
  "chromium/windows/index.html",
  "chromium/mac-arm/index.html",
  "chromium/linux/index.html",
  "chromium/android/index.html",
  "docs/index.html",
  "api/index.html",
  "about/index.html",
  "404.html",
  "sitemap.xml",
  "robots.txt",
  "llms.txt",
  "feed.xml",
  "favicon.svg",
  ".nojekyll",
  "api/v1/builds.json",
  "api/v1/latest.json",
  "api/v1/upstream.json",
];
for (const r of required) {
  if (files.includes(`${OUT}/${r}`)) ok(r);
  else bad(r, "missing");
}

console.log("\n== internal links ==");
const pageSet = new Set(html.map((f) => f.replace(`${OUT}`, "").replace(/\/index\.html$/, "/")));
for (const f of files.filter((x) => /\.(xml|txt|json|svg)$/.test(x))) pageSet.add(f.replace(OUT, ""));

const base = process.env.BASE_PATH ?? "";
const broken = new Map<string, string[]>();
for (const f of html) {
  const body = await Bun.file(f).text();
  for (const m of body.matchAll(/(?:href|src)="([^"]+)"/g)) {
    const href = m[1];
    if (/^(https?:|mailto:|#|data:)/.test(href)) continue;
    const clean = (base && href.startsWith(base) ? href.slice(base.length) : href).split("#")[0];
    if (!clean) continue;
    if (!pageSet.has(clean)) {
      const list = broken.get(f) ?? [];
      list.push(href);
      broken.set(f, list);
    }
  }
}
if (broken.size === 0) ok(`every internal link across ${html.length} pages resolves`);
else for (const [f, list] of broken) bad(f.replace(OUT, ""), `dead links -> ${[...new Set(list)].join(", ")}`);

console.log("\n== seo essentials ==");
for (const f of html) {
  const body = await Bun.file(f).text();
  const p = f.replace(OUT, "");
  const problems: string[] = [];
  if (!/<title>[^<]{10,}<\/title>/.test(body)) problems.push("title missing or too short");
  const desc = body.match(/<meta name="description" content="([^"]*)"/)?.[1] ?? "";
  if (desc.length < 50) problems.push(`description too short (${desc.length})`);
  if (desc.length > 200) problems.push(`description too long (${desc.length})`);
  if (!/rel="canonical"/.test(body)) problems.push("no canonical");
  const h1 = body.match(/<h1[^>]*>/g)?.length ?? 0;
  if (h1 !== 1 && !p.endsWith("404.html")) problems.push(`${h1} h1 tags`);
  if (!/application\/ld\+json/.test(body)) problems.push("no structured data");
  if (problems.length) bad(p, problems.join("; "));
}
if (failures === 0) ok(`title, description, canonical, single h1 and JSON-LD on all ${html.length} pages`);

console.log("\n== structured data parses ==");
let ldCount = 0;
for (const f of html) {
  const body = await Bun.file(f).text();
  for (const m of body.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try {
      JSON.parse(m[1]);
      ldCount++;
    } catch (e) {
      bad(f.replace(OUT, ""), `invalid JSON-LD: ${(e as Error).message}`);
    }
  }
}
ok(`${ldCount} JSON-LD blocks parse`);

console.log("\n== feeds and data ==");
const feed = await Bun.file(`${OUT}/feed.xml`).text();
if (feed.includes("<feed") && feed.includes("</feed>") && (feed.match(/<entry>/g) ?? []).length > 5)
  ok(`atom feed has ${(feed.match(/<entry>/g) ?? []).length} entries`);
else bad("feed.xml", "malformed or too few entries");

const sitemap = await Bun.file(`${OUT}/sitemap.xml`).text();
const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
if (locs.length >= html.length - 1) ok(`sitemap lists ${locs.length} urls`);
else bad("sitemap.xml", `only ${locs.length} urls for ${html.length} pages`);
if (locs.every((l) => l.startsWith("http"))) ok("sitemap urls are absolute");
else bad("sitemap.xml", "relative urls present");

const api: { builds: { downloads: { url: string; sha256?: string }[] }[] } = await Bun.file(
  `${OUT}/api/v1/builds.json`,
).json();
if (api.builds.length === manifest.builds.length) ok(`builds.json carries all ${api.builds.length} builds`);
else bad("builds.json", `${api.builds.length} builds vs ${manifest.builds.length} in manifest`);

console.log("\n== data integrity ==");
const allDl = manifest.builds.flatMap((b) => b.downloads);
const noUrl = allDl.filter((d) => !/^https:\/\//.test(d.url));
if (noUrl.length === 0) ok(`all ${allDl.length} download urls are https`);
else bad("downloads", `${noUrl.length} non-https urls`);

const badHash = allDl.filter((d) => d.sha256 && !/^[a-f0-9]{64}$/.test(d.sha256));
if (badHash.length === 0) ok(`all ${allDl.filter((d) => d.sha256).length} checksums are well-formed sha256`);
else bad("checksums", `${badHash.length} malformed`);

const platforms = new Set(manifest.builds.map((b) => b.platform));
for (const p of ["windows", "macos", "linux", "android"]) {
  if (platforms.has(p as never)) ok(`${p} has builds`);
  else bad(p, "no builds at all");
}

const stale = manifest.builds.filter((b) => b.freshness === "current").length;
if (stale >= 8) ok(`${stale} builds are level with upstream stable`);
else bad("freshness", `only ${stale} current builds, sources may be failing`);

console.log("\n== snapshot history ==");
if (manifest.snapshots.length >= 6) ok(`${manifest.snapshots.length} snapshot targets carry a history`);
else bad("snapshots", `only ${manifest.snapshots.length} targets, the bucket listing may have changed shape`);
const thin = manifest.snapshots.filter((t) => t.older.length < 3);
if (thin.length === 0) ok("every snapshot target offers older versions");
else bad("snapshots", `${thin.map((t) => t.bucketPlatform).join(", ")} have almost no history`);
const badVer = manifest.snapshots.filter((t) => !/^\d+\.\d+\.\d+\.\d+$/.test(t.latest.version));
if (badVer.length === 0) ok("every snapshot version resolved from chrome/VERSION");
else bad("snapshots", `${badVer.length} targets have an unparsable version`);

// The list offers one build per MAJOR version. A repeat means two milestones resolved to the
// same build, which is how the window would look if a branch point stopped being honoured.
const dupes = manifest.snapshots.filter((t) => {
  const m = [t.latest, ...t.older].map((r) => r.milestone);
  return new Set(m).size !== m.length;
});
if (dupes.length === 0) ok("every snapshot target lists each major version once");
else bad("snapshots", `${dupes.map((t) => t.bucketPlatform).join(", ")} repeat a major version`);

const unordered = manifest.snapshots.filter((t) =>
  t.older.some((r, i) => i > 0 && (r.milestone ?? 0) >= (t.older[i - 1].milestone ?? 0)),
);
if (unordered.length === 0) ok("older versions descend by major version on every target");
else bad("snapshots", `${unordered.map((t) => t.bucketPlatform).join(", ")} are out of order`);

// A milestone row's version is asserted from the branch point rather than read per build, so a
// mismatch between the two would ship a mislabelled download.
const mislabelled = manifest.snapshots.flatMap((t) =>
  [t.latest, ...t.older]
    .filter((r) => String(r.milestone) !== r.version.split(".")[0])
    .map((r) => `${t.bucketPlatform}/${r.version}`),
);
if (mislabelled.length === 0) ok("every listed version matches the major version it is filed under");
else bad("snapshots", `mislabelled: ${mislabelled.slice(0, 4).join(", ")}`);

// The point of the rewrite: a person wanting a specific major release can get it.
const shallow = manifest.snapshots.filter((t) => t.older.length < 12);
if (shallow.length === 0) ok(`history reaches back ${Math.min(...manifest.snapshots.map((t) => t.older.length))}+ major versions on every target`);
else bad("snapshots", `${shallow.map((t) => `${t.bucketPlatform} (${t.older.length})`).join(", ")} offer too few major versions`);

// A short revision is a 2013 build that slipped through the text-compared bucket window.
const ancient = manifest.snapshots.flatMap((t) =>
  [t.latest, ...t.older].filter((r) => r.revision.length < 7).map((r) => `${t.bucketPlatform}/${r.revision}`),
);
if (ancient.length === 0) ok("no pre-2014 revisions leaked into the history");
else bad("snapshots", `ancient revisions offered: ${ancient.slice(0, 4).join(", ")}`);

console.log("\n== chrlauncher endpoints ==");
const clFiles = files.filter((f) => f.includes("/api/chrlauncher/"));
if (clFiles.length >= 12) ok(`${clFiles.length} chrlauncher endpoints generated`);
else bad("chrlauncher", `only ${clFiles.length} endpoints`);

for (const f of clFiles) {
  const body = (await Bun.file(f).text()).trim();
  // Parse exactly as chrlauncher does: split on ';', then on '='.
  const kv = Object.fromEntries(
    body.split(";").map((pair) => {
      const i = pair.indexOf("=");
      return [pair.slice(0, i), pair.slice(i + 1)];
    }),
  );
  const problems: string[] = [];
  if (!/^\d+\.\d+\.\d+\.\d+$/.test(kv.version ?? "")) problems.push(`bad version "${kv.version}"`);
  if (!/^https:\/\//.test(kv.download ?? "")) problems.push("download is not an https url");
  // chrlauncher extracts the archive itself, so an installer here would break the install.
  if (/mini_installer\.exe$|installer.*\.exe$/i.test(kv.download ?? "")) problems.push("download is an installer, not an archive");
  if (!/\.(7z|zip)$/i.test(kv.download ?? "")) problems.push(`download is not a 7z/zip archive: ${kv.download}`);
  if (!/^\d{10}$/.test(kv.timestamp ?? "")) problems.push(`bad timestamp "${kv.timestamp}"`);
  if (problems.length) bad(f.replace(OUT, ""), problems.join("; "));
}
if (failures === 0) ok("every chrlauncher endpoint parses and points at an extractable archive");

if (!SKIP_NETWORK) {
  console.log("\n== download urls resolve (HEAD) ==");
  // One representative download per build, so a maintainer moving assets is caught.
  const targets = manifest.builds.map((b) => ({
    id: b.id,
    url: (b.downloads.find((d) => d.recommended) ?? b.downloads[0]).url,
  }));
  const results = await Promise.all(
    targets.map(async (t) => {
      try {
        let res = await fetch(t.url, { method: "HEAD", redirect: "follow" });
        if (res.status === 405 || res.status === 403)
          res = await fetch(t.url, { method: "GET", headers: { Range: "bytes=0-0" }, redirect: "follow" });
        return { ...t, status: res.status };
      } catch (e) {
        return { ...t, status: 0, err: (e as Error).message };
      }
    }),
  );
  const dead = results.filter((r) => r.status >= 400 || r.status === 0);
  if (dead.length === 0) ok(`all ${results.length} download urls return 2xx`);
  else for (const d of dead) bad(d.id, `download url returned ${d.status} ${("err" in d && d.err) || ""}`);
}

console.log(`\n${failures === 0 ? "PASS" : "FAIL"}: ${checks - failures}/${checks} checks passed\n`);
process.exit(failures === 0 ? 0 : 1);
