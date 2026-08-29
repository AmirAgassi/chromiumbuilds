import { mkdir, rm, readdir } from "node:fs/promises";
import { marked } from "marked";
import { GITHUB_SOURCES, INSTALL_COMMANDS, SNAPSHOT_META } from "./sources";
import { layout } from "./layout";
import type { PageMeta } from "./layout";
import { abs, bytes, esc, relDate, shortDate, url, SITE } from "./site";
import {
  ARCH_LABEL,
  ARCH_SHORT,
  PLATFORM_LABEL,
  blurbFor,
  buildList,
  buildSchema,
  faqSchema,
  homepageFor,
  stamp,
  traitTags,
} from "./render";
import type { Arch, Build, Manifest, Platform, SnapshotRelease, SnapshotTrack } from "./types";

const OUT = "dist";
const manifest: Manifest = await Bun.file("data/manifest.json").json();
const { builds, distros, snapshots, upstream, generatedAt } = manifest;
const written: { path: string; changefreq: string; priority: string }[] = [];
const warnings: string[] = [];
const note = (source: string, message: string) => warnings.push(`${source}: ${message}`);

async function page(path: string, meta: Omit<PageMeta, "path">, body: string, seo = { changefreq: "weekly", priority: "0.6" }) {
  const full = path.endsWith("/") ? `${path}index.html` : path;
  const file = `${OUT}${full}`;
  await mkdir(file.slice(0, file.lastIndexOf("/")), { recursive: true });
  await Bun.write(file, layout({ ...meta, path }, body));
  written.push({ path, ...seo });
}

const byPlatform = (p: Platform) => builds.filter((b) => b.platform === p);
const rank = (b: Build) => {
  // Order a platform page the way a person decides: real releases first, snapshots last,
  // then freshest, then most complete.
  const channelWeight = b.channel === "snapshot" ? 2 : b.channel === "dev" ? 1 : 0;
  const freshWeight = { current: 0, behind: 1, outdated: 2, abandoned: 3 }[b.freshness];
  return channelWeight * 10 + freshWeight;
};
const sorted = (list: Build[]) =>
  [...list].sort((a, b) => rank(a) - rank(b) || b.version.localeCompare(a.version, undefined, { numeric: true }));

/** The build we point a first-time visitor at for a given platform and architecture. */
function recommended(platform: Platform, arch: Arch): Build | undefined {
  const cands = builds.filter((b) => b.platform === platform && b.arch.includes(arch));
  const score = (b: Build) => {
    let s = 0;
    if (b.channel === "snapshot") s += 100;
    if (b.channel === "dev") s += 30;
    if (b.freshness === "behind") s += 8;
    if (b.freshness === "outdated") s += 40;
    if (b.freshness === "abandoned") s += 200;
    if (!b.proprietaryCodecs) s += 12;
    if (!b.widevine) s += 6;
    if (b.simd) s += 4;
    return s;
  };
  return [...cands].sort((a, b) => score(a) - score(b))[0];
}

const archesFor = (p: Platform): Arch[] => {
  const order: Arch[] = ["x64", "arm64", "x86", "arm32", "universal"];
  const present = new Set(byPlatform(p).flatMap((b) => b.arch));
  return order.filter((a) => present.has(a));
};

// ============================================================ home

const CHOOSER = [
  {
    b: "You want Chrome, without Google's branding",
    p: "Sign-in and sync work, video plays everywhere, and it tracks the Chrome stable release closely.",
    href: "/builds/hibbiki/",
    cta: "Hibbiki Chromium",
  },
  {
    b: "You want nothing talking to Google",
    p: "Every Google web service dependency is stripped out at the source level. No sign-in, no background calls.",
    href: "/builds/ungoogled-chromium/",
    cta: "ungoogled-chromium",
  },
  {
    b: "You want privacy and working video",
    p: "Ungoogled patches, but the proprietary codecs and Widevine are kept so streaming still works.",
    href: "/builds/marmaduke-windows/",
    cta: "Marmaduke builds",
  },
  {
    b: "You want it as fast as possible",
    p: "Compiled for modern CPU instruction sets with aggressive optimisation. Check your CPU first.",
    href: "/builds/thorium/",
    cta: "Thorium",
  },
  {
    b: "You are on Windows 7, XP or Vista",
    p: "A modern engine backported to Windows versions nothing else supports any more.",
    href: "/builds/supermium/",
    cta: "Supermium",
  },
  {
    b: "You want the build Google itself produces",
    p: "The raw output of Google's build bots for a single commit. Untested, no auto-update, no video codecs.",
    href: "/chromium/",
    cta: "Official Chromium",
  },
];

/** The hub renders the chooser too, minus the row that would point at the hub. */
const CHOOSER_OTHERS = CHOOSER.filter((c) => c.href !== "/chromium/");

/**
 * Every candidate card is rendered server-side and hidden; this only unhides the matching one.
 * Nothing is built from strings at runtime, so there is no markup path for API data to reach.
 */
const DETECT_SCRIPT = `
(function(){
  var d=document.getElementById("detect");if(!d)return;
  var ua=navigator.userAgent,p=navigator.platform||"",plat=null,arch=null;
  if(/Android/i.test(ua)){plat="android";arch=/arm64|aarch64/i.test(ua)?"arm64":"arm32";}
  else if(/iPhone|iPad|iPod/i.test(ua)){plat="ios";}
  else if(/Win/i.test(p)||/Windows/i.test(ua)){plat="windows";arch=/ARM64/i.test(ua)?"arm64":(/WOW64|Win64|x64|x86_64/i.test(ua)?"x64":"x86");}
  else if(/Mac/i.test(p)||/Mac OS X/i.test(ua)){plat="macos";arch="x64";
    try{var c=document.createElement("canvas"),g=c.getContext("webgl"),r=g&&g.getExtension("WEBGL_debug_renderer_info");
      if(r&&/Apple/.test(g.getParameter(r.UNMASKED_RENDERER_WEBGL)))arch="arm64";}catch(e){}}
  else if(/Linux|X11/i.test(p)||/Linux/i.test(ua)){plat="linux";arch=/aarch64|arm64/i.test(ua)?"arm64":"x64";}
  if(navigator.userAgentData&&navigator.userAgentData.getHighEntropyValues){
    navigator.userAgentData.getHighEntropyValues(["architecture","bitness"]).then(function(v){
      if(v.architecture==="arm")arch=v.bitness==="64"?"arm64":"arm32";
      else if(v.architecture==="x86")arch=v.bitness==="64"?"x64":"x86";
      show(plat,arch);}).catch(function(){show(plat,arch);});
  } else show(plat,arch);
  function show(plat,arch){
    if(!plat)return;
    if(plat==="ios"){reveal(document.getElementById("pick-ios"));return;}
    var el=document.getElementById("pick-"+plat+"-"+arch)
      ||document.getElementById("pick-"+plat+"-x64")
      ||document.getElementById("pick-"+plat+"-arm32")
      ||document.getElementById("pick-"+plat);
    if(!el)return;
    reveal(el);
  }
  function reveal(el){if(!el)return;el.hidden=false;d.hidden=false;}
})();`.trim();

/** Server-rendered, hidden recommendation cards, one per platform and architecture. */
function pickCards(): string {
  const blocks: string[] = [];
  for (const p of ["windows", "macos", "linux", "android"] as Platform[]) {
    for (const a of archesFor(p)) {
      const b = recommended(p, a);
      if (!b) continue;
      blocks.push(`<div hidden id="pick-${p}-${a}">
<p class="blurb" style="margin-top:-.25rem">Detected ${PLATFORM_LABEL[p]} on ${esc(ARCH_LABEL[a])}.
<a href="${url(`/${p}/`)}">See every ${PLATFORM_LABEL[p]} build</a>, or
<a href="${url("/docs/which-chromium-build/")}">compare them first</a>.</p>
${buildList([b], { pickId: b.id })}</div>`);
    }
  }
  blocks.push(`<div hidden id="pick-ios"><div class="note"><p><b>You are on iOS.</b> Apple requires every iOS browser
to use Apple's own WebKit engine, so a genuine Chromium build for iPhone or iPad does not exist.
<a href="${url("/docs/chromium-on-ios/")}">Why that is, and what your options are</a>.</p></div></div>`);
  return blocks.join("");
}

async function home() {
  const platformCards = (["windows", "macos", "linux", "android"] as Platform[])
    .map((p) => {
      const rec = recommended(p, archesFor(p)[0]);
      const n = byPlatform(p).length;
      return `<a href="${url(`/${p}/`)}">${PLATFORM_LABEL[p]}<small>${n} builds${rec ? ` · latest ${esc(rec.version)}` : ""}</small></a>`;
    })
    .join("");

  const faq = [
    {
      q: "Is Chromium safe to download?",
      a: "Chromium itself is Google's open-source browser project and is safe. The risk is where you download a compiled build from. Every build listed on this site links directly to the maintainer's own release page on GitHub or Google's storage, and each download is published with a SHA-256 checksum you can verify before running it.",
    },
    {
      q: "What is the difference between Chromium and Chrome?",
      a: "Chrome is Google's product built on top of Chromium. Chrome adds automatic updates, Widevine DRM, the proprietary H.264 and AAC codecs, crash reporting, and Google account integration. Chromium is the open-source core without those pieces, though many third-party builds add the codecs and Widevine back.",
    },
    {
      q: "Which Chromium build should I download?",
      a: "If you want something that behaves like Chrome with working sign-in and video, use Hibbiki's build. If you want no contact with Google at all, use ungoogled-chromium. If you want privacy but still need streaming video to work, use Marmaduke's ungoogled builds. If you want maximum speed on a modern CPU, use Thorium.",
    },
    {
      q: "Does Chromium update itself?",
      a: "No. Almost every Chromium build has no auto-updater, so you have to download and install new versions yourself. That is the single biggest practical difference from Chrome and the reason an outdated Chromium is a real security risk.",
    },
  ];

  const body = `
<div class="hero">
  <h1>Download Chromium</h1>
  <p class="lede">${esc(SITE.description)}</p>
  ${stamp(generatedAt, upstream.stable.version)}
</div>

<div id="detect" hidden><h2 style="margin-top:1.5rem">Recommended for your system</h2>${pickCards()}</div>

<h2>Which build should I use?</h2>
<p class="blurb">Chromium has no single official download for end users. Volunteers compile it, and they make different
choices about Google integration, video codecs and CPU requirements. Pick the row that describes you.</p>
<ul class="chooser">
${CHOOSER.map(
  (c) => `<li><b>${esc(c.b)}</b><p>${esc(c.p)}</p><a href="${url(c.href)}">${esc(c.cta)} &rarr;</a></li>`,
).join("")}
</ul>

<h2>Browse by platform</h2>
<ul class="grid-links">${platformCards}
<a href="${url("/chromium/")}">Official Chromium<small>Google's own per-commit builds</small></a>
<a href="${url("/bsd/")}">BSD<small>FreeBSD and OpenBSD ports</small></a>
<a href="${url("/linux/packages/")}">Linux packages<small>${distros.length} distributions tracked</small></a>
<a href="${url("/chromeos/")}">ChromeOS<small>Open-source builds</small></a>
</ul>

<h2>Newest releases</h2>
<div class="tw"><table>
<thead><tr><th>Build</th><th>Version</th><th>Platform</th><th>Released</th><th>Status</th></tr></thead>
<tbody>
${sorted(builds.filter((b) => b.channel !== "snapshot"))
  .slice()
  .sort((a, b) => new Date(b.releasedAt).getTime() - new Date(a.releasedAt).getTime())
  .slice(0, 12)
  .map(
    (b) => `<tr>
  <td><a href="${url(`/builds/${b.project}/`)}">${esc(b.projectName)}</a></td>
  <td><code>${esc(b.version)}</code></td>
  <td>${PLATFORM_LABEL[b.platform]} ${ARCH_SHORT[b.arch[0]]}</td>
  <td>${shortDate(b.releasedAt)}</td>
  <td>${b.freshness === "current" ? "Current" : b.freshness === "behind" ? "One behind" : "Outdated"}</td>
</tr>`,
  )
  .join("")}
</tbody></table></div>
<p class="stamp"><a href="${url("/feed.xml")}">Subscribe to the release feed</a> to be told when any of these update.</p>

<h2>Common questions</h2>
${faq.map((f) => `<h3>${esc(f.q)}</h3><p class="blurb">${esc(f.a)}</p>`).join("")}
<p><a href="${url("/docs/")}">Read all guides &rarr;</a></p>
<script>var B=${JSON.stringify(SITE.base)};${DETECT_SCRIPT}</script>
`;

  await page(
    "/",
    {
      title: "Download Chromium - Windows, macOS, Linux and Android builds",
      description: SITE.description,
      schema: [faqSchema(faq)],
    },
    body,
    { changefreq: "daily", priority: "1.0" },
  );
}

// ============================================================ platform pages

const PLATFORM_INTRO: Record<string, string> = {
  windows:
    "Chromium for Windows comes from several independent maintainers, and they differ in ways that matter: whether browser sign-in works, whether ordinary web video plays, and which CPU generation is required. All of them are portable or installer packages you update by hand.",
  macos:
    "Chromium for macOS is distributed as a disk image or a plain application archive. None of these builds are notarised by Apple, so the first launch needs a right-click and Open rather than a double-click.",
  linux:
    "On Linux your distribution almost certainly packages Chromium already, and that copy updates with the rest of your system. The portable builds below are for cases where you want a newer version, an ungoogled build, or CPU-specific optimisation.",
  android:
    "Chromium for Android is distributed as an APK you sideload. There is no Play Store listing for these builds, so you have to allow installation from unknown sources.",
};

async function platformPage(p: Platform) {
  const list = sorted(byPlatform(p));
  const arches = archesFor(p);
  const rec = recommended(p, arches[0]);

  const sections = arches
    .map((a) => {
      const forArch = sorted(list.filter((b) => b.arch.includes(a)));
      if (!forArch.length) return "";
      const recArch = recommended(p, a);
      return `<h2 id="${a}">${PLATFORM_LABEL[p]} ${ARCH_LABEL[a]}</h2>
${a === arches[0] ? "" : `<p class="blurb">${archNote(p, a)}</p>`}
${buildList(forArch, { pickId: recArch?.id })}`;
    })
    .join("");

  const body = `
<div class="hero">
  <h1>Chromium for ${PLATFORM_LABEL[p]}</h1>
  <p class="lede">${esc(PLATFORM_INTRO[p] ?? "")}</p>
  ${stamp(generatedAt, upstream.stable.version)}
</div>
${
  rec
    ? `<div class="note"><p><b>Not sure?</b> ${esc(rec.projectName)} ${esc(rec.version)} is the safest default for most
${PLATFORM_LABEL[p]} users. <a href="#${esc(rec.id)}">Jump to it</a>, or read
<a href="${url("/docs/which-chromium-build/")}">how the builds differ</a>.</p></div>`
    : ""
}
${sections}
${
  p === "linux"
    ? `<h2>Install from your distribution instead</h2>
<p class="blurb">A packaged Chromium updates automatically with your system, which is the single best reason to prefer it.
See <a href="${url("/linux/packages/")}">Chromium versions across ${distros.length} distributions</a>.</p>`
    : ""
}
<h2>Keeping it updated</h2>
<p class="blurb">None of these builds update themselves. Chromium ships security fixes roughly every two weeks, so
a build more than a month old is genuinely worth replacing. See
<a href="${url("/docs/updating-chromium/")}">how to update Chromium</a>, or
<a href="${url("/feed.xml")}">subscribe to the release feed</a>.</p>
`;

  await page(
    `/${p}/`,
    {
      title: `Download Chromium for ${PLATFORM_LABEL[p]} - all builds compared`,
      description: `Every trusted Chromium build for ${PLATFORM_LABEL[p]}, with version, release date, SHA-256 checksums and direct download links. Updated automatically.`,
      crumbs: [{ label: "Home", href: "/" }, { label: PLATFORM_LABEL[p] }],
      schema: list.slice(0, 10).map(buildSchema),
    },
    body,
    { changefreq: "daily", priority: "0.9" },
  );
}

function archNote(p: Platform, a: Arch): string {
  if (a === "arm64" && p === "windows")
    return "For Windows on ARM devices such as the Surface Pro X and Snapdragon X laptops. An x64 build will run under emulation, but a native ARM64 build is considerably faster.";
  if (a === "arm64" && p === "macos")
    return "For Apple silicon (M1 and later). An Intel build runs under Rosetta 2, but the native build is faster and uses less battery.";
  if (a === "arm64" && p === "linux") return "For 64-bit ARM machines such as the Raspberry Pi 4 and 5 running a 64-bit OS.";
  if (a === "x86" && p === "windows")
    return "32-bit builds. You only need these on genuinely old hardware; any Windows installation from the last decade should use the 64-bit build.";
  if (a === "x86") return "32-bit builds, for older hardware only.";
  if (a === "arm32") return "For older 32-bit ARM devices.";
  if (a === "x64" && p === "macos") return "For Intel Macs. These also run on Apple silicon through Rosetta 2.";
  return "";
}

/** Long-tail pages for the specific queries people actually type. */
async function archPage(p: Platform, a: Arch, slug: string, title: string, desc: string) {
  const list = sorted(byPlatform(p).filter((b) => b.arch.includes(a)));
  if (!list.length) return;
  const body = `
<div class="hero">
  <h1>${esc(title)}</h1>
  <p class="lede">${esc(desc)}</p>
  ${stamp(generatedAt, upstream.stable.version)}
</div>
<p class="blurb">${esc(archNote(p, a))}</p>
${buildList(list, { pickId: recommended(p, a)?.id })}
<h2>Other ${PLATFORM_LABEL[p]} builds</h2>
<p class="blurb">See <a href="${url(`/${p}/`)}">every Chromium build for ${PLATFORM_LABEL[p]}</a>, including other architectures.</p>`;

  await page(
    `/${p}/${slug}/`,
    {
      title: `${title} - download`,
      description: desc,
      crumbs: [{ label: "Home", href: "/" }, { label: PLATFORM_LABEL[p], href: `/${p}/` }, { label: ARCH_SHORT[a] }],
      schema: list.slice(0, 6).map(buildSchema),
    },
    body,
    { changefreq: "daily", priority: "0.7" },
  );
}

// ============================================================ project pages

async function projectPages() {
  const groups = new Map<string, Build[]>();
  for (const b of builds) {
    const g = groups.get(b.project) ?? [];
    g.push(b);
    groups.set(b.project, g);
  }

  const cards = [...groups.entries()]
    .sort((a, b) => a[1][0].projectName.localeCompare(b[1][0].projectName))
    .map(([id, list]) => {
      const platforms = [...new Set(list.map((b) => PLATFORM_LABEL[b.platform]))].join(", ");
      return `<a href="${url(`/builds/${id}/`)}">${esc(list[0].projectName)}<small>${esc(platforms)} · ${esc(
        list[0].version,
      )}</small></a>`;
    })
    .join("");

  await page(
    "/builds/",
    {
      title: "Every Chromium build and fork, compared",
      description:
        "The maintained Chromium builds and forks worth knowing about: who makes each one, what they change, and which platforms they cover.",
      crumbs: [{ label: "Home", href: "/" }, { label: "Builds" }],
    },
    `<div class="hero"><h1>Chromium builds and forks</h1>
<p class="lede">Chromium has no official end-user download, so these are the people who compile it. Each one makes
different choices about Google integration, codecs and optimisation.</p>${stamp(generatedAt, upstream.stable.version)}</div>
<ul class="grid-links">${cards}</ul>
<h2>How they differ</h2>
${comparisonTable()}
<p class="blurb">A fuller explanation of each column is in
<a href="${url("/docs/which-chromium-build/")}">which Chromium build should I use</a>.</p>`,
    { changefreq: "weekly", priority: "0.8" },
  );

  for (const [id, list] of groups) {
    const first = list[0];
    const src = GITHUB_SOURCES.find((s) => s.id === id);
    const home = homepageFor(first);
    const platforms = [...new Set(list.map((b) => b.platform))];

    const body = `
<div class="hero">
  <h1>${esc(first.projectName)}</h1>
  <p class="lede">${esc(blurbFor(first))}</p>
  <p class="stamp">Maintained by ${esc(first.maintainer)} · latest ${esc(first.version)} · released ${relDate(
    first.releasedAt,
  )}</p>
</div>
${
  first.notes.length
    ? `<div class="note"><p><b>Worth knowing</b></p><ul class="notes">${first.notes
        .map((n) => `<li>${esc(n)}</li>`)
        .join("")}</ul></div>`
    : ""
}
<h2>Downloads</h2>
${buildList(sorted(list), { showPlatform: true })}
<h2>Where this comes from</h2>
<ul class="notes">
  <li>Source repository: <a href="${esc(first.sourceUrl)}" rel="noopener">${esc(first.sourceUrl.replace("https://", ""))}</a></li>
  ${home ? `<li>Project homepage: <a href="${esc(home)}" rel="noopener">${esc(home.replace("https://", ""))}</a></li>` : ""}
  <li>Latest release: <a href="${esc(first.releaseUrl)}" rel="noopener">release notes and full asset list</a></li>
  <li>Covers: ${platforms.map((p) => `<a href="${url(`/${p}/`)}">${PLATFORM_LABEL[p]}</a>`).join(", ")}</li>
</ul>
<p class="blurb">Downloads on this page point straight at that repository. Nothing is re-hosted here, and the
SHA-256 checksums shown come from the release itself so you can
<a href="${url("/docs/verify-your-download/")}">verify what you downloaded</a>.</p>`;

    await page(
      `/builds/${id}/`,
      {
        title: `${first.projectName} - download and what it changes`,
        description: `${first.projectName} ${first.version}: ${blurbFor(first).slice(0, 120)}`,
        crumbs: [{ label: "Home", href: "/" }, { label: "Builds", href: "/builds/" }, { label: first.projectName }],
        schema: list.slice(0, 8).map(buildSchema),
      },
      body,
      { changefreq: "daily", priority: "0.8" },
    );
    void src;
  }
}

function comparisonTable(): string {
  const seen = new Map<string, Build>();
  for (const b of builds) if (!seen.has(b.project)) seen.set(b.project, b);
  return `<div class="tw"><table>
<thead><tr><th>Build</th><th>Google sync</th><th>H.264 / AAC</th><th>Widevine DRM</th><th>Auto-update</th><th>Latest</th></tr></thead>
<tbody>${[...seen.values()]
    .sort((a, b) => a.projectName.localeCompare(b.projectName))
    .map(
      (b) => `<tr>
  <td><a href="${url(`/builds/${b.project}/`)}">${esc(b.projectName)}</a></td>
  <td>${b.google === "ungoogled" ? "Removed" : b.google === "sync" ? "Yes" : "No"}</td>
  <td>${b.proprietaryCodecs ? (b.hevc ? "Yes, with H.265" : "Yes") : "No"}</td>
  <td>${b.widevine ? "Yes" : "No"}</td>
  <td>No</td>
  <td><code>${esc(b.version)}</code></td>
</tr>`,
    )
    .join("")}</tbody></table></div>`;
}

// ============================================================ packages, bsd, chromeos

async function packagesPage() {
  const rows = (project: string) =>
    distros
      .filter((d) => d.project === project)
      .sort((a, b) => a.distro.localeCompare(b.distro))
      .map((d) => {
        const cmd = INSTALL_COMMANDS[d.repo]?.[project === "chromium" ? "chromium" : "ungoogled"];
        return `<tr><td>${esc(d.distro)}</td><td><code>${esc(d.version)}</code></td><td class="wrap-cell">${
          cmd ? `<code>${esc(cmd)}</code>` : "Not packaged"
        }</td></tr>`;
      })
      .join("");

  const body = `
<div class="hero">
  <h1>Chromium in Linux distributions and package managers</h1>
  <p class="lede">Which Chromium version each distribution currently ships, and the one command that installs it.
  A packaged build updates with the rest of your system, which is why it is the right default on Linux.</p>
  ${stamp(generatedAt, upstream.stable.version)}
</div>
<div class="note"><p>Versions here are read automatically from
<a href="https://repology.org/project/chromium/versions" rel="noopener">Repology</a>, which tracks package
repositories directly. A distribution well behind the current release is normal for a stable release line, but
it does mean you are waiting on backported security fixes.</p></div>
<h2>Chromium</h2>
<div class="tw"><table><thead><tr><th>Distribution</th><th>Version</th><th>Install</th></tr></thead><tbody>${rows(
    "chromium",
  )}</tbody></table></div>
<h2>ungoogled-chromium</h2>
<p class="blurb">Fewer distributions package it, and it is more often community-maintained.
See <a href="${url("/builds/ungoogled-chromium/")}">the portable builds</a> if yours is missing or old.</p>
<div class="tw"><table><thead><tr><th>Distribution</th><th>Version</th><th>Install</th></tr></thead><tbody>${rows(
    "ungoogled-chromium",
  )}</tbody></table></div>`;

  await page(
    "/linux/packages/",
    {
      title: "Chromium version in every Linux distribution",
      description:
        "Which version of Chromium and ungoogled-chromium each Linux distribution ships right now, with the install command for each. Updated automatically from Repology.",
      crumbs: [{ label: "Home", href: "/" }, { label: "Linux", href: "/linux/" }, { label: "Packages" }],
    },
    body,
    { changefreq: "daily", priority: "0.7" },
  );
}

async function bsdPage() {
  const bsd = distros.filter((d) => ["freebsd", "openbsd", "netbsd_pkgsrc_current"].includes(d.repo));
  await page(
    "/bsd/",
    {
      title: "Chromium for FreeBSD, OpenBSD and NetBSD",
      description:
        "How to install Chromium and ungoogled-chromium on FreeBSD, OpenBSD and NetBSD, with the version each ports tree currently carries.",
      crumbs: [{ label: "Home", href: "/" }, { label: "BSD" }],
    },
    `<div class="hero"><h1>Chromium for BSD</h1>
<p class="lede">There are no prebuilt third-party Chromium binaries for the BSDs. Every BSD gets Chromium through its
own ports tree or package system, which is the supported route and the one you should use.</p>
${stamp(generatedAt, upstream.stable.version)}</div>
<div class="tw"><table><thead><tr><th>System</th><th>Package</th><th>Version</th><th>Install</th></tr></thead><tbody>
${
  bsd.length
    ? bsd
        .map(
          (d) =>
            `<tr><td>${esc(d.distro)}</td><td><code>${esc(d.package)}</code></td><td><code>${esc(
              d.version,
            )}</code></td><td class="wrap-cell"><code>${esc(
              INSTALL_COMMANDS[d.repo]?.[d.project === "chromium" ? "chromium" : "ungoogled"] ?? "",
            )}</code></td></tr>`,
        )
        .join("")
    : '<tr><td colspan="4">Version data is temporarily unavailable.</td></tr>'
}
</tbody></table></div>
<h2>Notes</h2>
<ul class="notes">
<li>FreeBSD carries both <code>chromium</code> and <code>ungoogled-chromium</code> in ports.</li>
<li>OpenBSD applies its own security hardening to the port, so it can lag upstream by design.</li>
<li>Building from ports takes hours on modest hardware. Prefer the binary package where one exists.</li>
</ul>`,
    { changefreq: "weekly", priority: "0.5" },
  );
}

async function chromeosPage() {
  await page(
    "/chromeos/",
    {
      title: "Open-source ChromeOS builds",
      description:
        "Where to get open-source ChromeOS and ChromiumOS builds for ordinary PC hardware, and what each project actually gives you.",
      crumbs: [{ label: "Home", href: "/" }, { label: "ChromeOS" }],
    },
    `<div class="hero"><h1>ChromeOS and ChromiumOS builds</h1>
<p class="lede">ChromiumOS is the open-source operating system Google's ChromeOS is built from. Unlike the browser,
there is no continuously published binary you can simply download, so these projects fill the gap.</p></div>
<div class="note warn"><p>These are whole operating systems, not browsers. If you only want the browser, you want
<a href="${url("/linux/")}">Chromium for Linux</a> instead.</p></div>
<h2>Projects worth knowing</h2>
<ul class="grid-links">
<a href="https://chromiumosbuilds.arnoldthebat.co.uk/" rel="noopener nofollow">ArnoldTheBat builds<small>Long-running special builds for generic PC hardware</small></a>
<a href="https://github.com/Alex313031/ChromeOS-Linux" rel="noopener nofollow">Alex313031 ChromeOS-Linux<small>ChromiumOS images with extra hardware support</small></a>
<a href="https://fydeos.io/" rel="noopener nofollow">FydeOS<small>A polished ChromiumOS derivative, partly commercial</small></a>
<a href="https://github.com/sebanc/brunch" rel="noopener nofollow">Brunch<small>Runs official ChromeOS recovery images on ordinary PCs</small></a>
<a href="https://www.google.com/chromebook/chromeos/flex/" rel="noopener nofollow">ChromeOS Flex<small>Google's own supported build for old PCs and Macs</small></a>
</ul>
<h2>Which one</h2>
<p class="blurb">If you want something supported that simply works, use ChromeOS Flex, which is Google's own product
and gets real updates. Choose Brunch if you specifically need the Play Store and Android app support, since it runs
genuine ChromeOS images. The community ChromiumOS builds are the right pick when you want the fully open-source
system and are comfortable troubleshooting hardware support yourself.</p>
<p class="stamp">These projects publish on their own schedules rather than through an API, so this page links to each
project rather than tracking individual image versions.</p>`,
    { changefreq: "monthly", priority: "0.4" },
  );
}

// ============================================================ docs

interface Doc {
  slug: string;
  title: string;
  description: string;
  order: number;
  group: string;
  html: string;
  faq?: { q: string; a: string }[];
}

async function loadDocs(): Promise<Doc[]> {
  const files = (await readdir("content/docs")).filter((f) => f.endsWith(".md"));
  const docs: Doc[] = [];
  for (const f of files) {
    const raw = await Bun.file(`content/docs/${f}`).text();
    const m = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
    if (!m) throw new Error(`${f}: missing frontmatter`);
    const meta: Record<string, string> = {};
    for (const line of m[1].split("\n")) {
      const i = line.indexOf(":");
      if (i > 0) meta[line.slice(0, i).trim()] = line.slice(i + 1).trim().replace(/^["']|["']$/g, "");
    }
    const bodyMd = m[2];
    const faqMatch = bodyMd.match(/<!--faq\n([\s\S]*?)\n-->/);
    const faq = faqMatch
      ? faqMatch[1]
          .split("\n\n")
          .map((block) => {
            const [q, ...a] = block.split("\n");
            return { q: q.replace(/^Q:\s*/, ""), a: a.join(" ").replace(/^A:\s*/, "") };
          })
          .filter((x) => x.q && x.a)
      : undefined;
    docs.push({
      slug: f.replace(/\.md$/, ""),
      title: meta.title ?? f,
      description: meta.description ?? "",
      order: Number(meta.order ?? 99),
      group: meta.group ?? "Reference",
      html: await marked.parse(bodyMd.replace(/<!--faq\n[\s\S]*?\n-->/, "")),
      faq,
    });
  }
  return docs.sort((a, b) => a.order - b.order);
}

function rewriteLinks(html: string): string {
  // Docs are authored with site-root links; add the deploy base path and mark external links.
  return html
    .replace(/href="\/(?!\/)/g, `href="${SITE.base}/`)
    .replace(/<a href="(https?:\/\/[^"]+)"/g, '<a href="$1" rel="noopener"');
}

function headings(html: string): { id: string; text: string }[] {
  const out: { id: string; text: string }[] = [];
  for (const m of html.matchAll(/<h2[^>]*>(.*?)<\/h2>/g)) {
    const text = m[1].replace(/<[^>]+>/g, "");
    out.push({ id: text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""), text });
  }
  return out;
}

async function docsPages(docs: Doc[]) {
  const groups = new Map<string, Doc[]>();
  for (const d of docs) {
    const g = groups.get(d.group) ?? [];
    g.push(d);
    groups.set(d.group, g);
  }

  await page(
    "/docs/",
    {
      title: "Chromium guides - codecs, sync, flags and troubleshooting",
      description:
        "Plain explanations of how Chromium differs from Chrome: Google sync, Widevine DRM, video codecs, command-line flags, the profile directory, and how to keep a build updated.",
      crumbs: [{ label: "Home", href: "/" }, { label: "Guides" }],
    },
    `<div class="hero"><h1>Chromium guides</h1>
<p class="lede">Everything that is confusing about downloading and running Chromium, explained once and properly.</p></div>
${[...groups.entries()]
  .map(
    ([g, list]) =>
      `<h2>${esc(g)}</h2><ul class="grid-links">${list
        .map((d) => `<a href="${url(`/docs/${d.slug}/`)}">${esc(d.title)}<small>${esc(d.description.slice(0, 90))}</small></a>`)
        .join("")}</ul>`,
  )
  .join("")}`,
    { changefreq: "weekly", priority: "0.7" },
  );

  for (const d of docs) {
    const hs = headings(d.html);
    let html = rewriteLinks(d.html);
    for (const h of hs) html = html.replace(`<h2>${h.text}</h2>`, `<h2 id="${h.id}">${h.text}</h2>`);

    const related = docs.filter((x) => x.slug !== d.slug && x.group === d.group).slice(0, 4);
    const body = `
<div class="hero"><h1>${esc(d.title)}</h1><p class="lede">${esc(d.description)}</p></div>
<div class="prose">
${hs.length > 2 ? `<nav class="toc"><b>On this page</b><ul>${hs.map((h) => `<li><a href="#${h.id}">${esc(h.text)}</a></li>`).join("")}</ul></nav>` : ""}
${html}
${
  related.length
    ? `<h2 id="related">Related guides</h2><ul>${related
        .map((r) => `<li><a href="${url(`/docs/${r.slug}/`)}">${esc(r.title)}</a></li>`)
        .join("")}</ul>`
    : ""
}
</div>`;

    await page(
      `/docs/${d.slug}/`,
      {
        title: `${d.title} - Chromium`,
        description: d.description,
        crumbs: [{ label: "Home", href: "/" }, { label: "Guides", href: "/docs/" }, { label: d.title }],
        schema: [
          {
            "@type": "Article",
            headline: d.title,
            description: d.description,
            author: { "@type": "Organization", name: SITE.name },
            publisher: { "@type": "Organization", name: SITE.name },
            mainEntityOfPage: abs(`/docs/${d.slug}/`),
          },
          ...(d.faq ? [faqSchema(d.faq)] : []),
        ],
      },
      body,
      { changefreq: "monthly", priority: "0.6" },
    );
  }
}

// ============================================================ api, about, feeds

async function apiPages() {
  await mkdir(`${OUT}/api/v1`, { recursive: true });
  const compact = builds.map((b) => ({
    id: b.id,
    project: b.project,
    name: b.projectName,
    maintainer: b.maintainer,
    platform: b.platform,
    arch: b.arch,
    channel: b.channel,
    version: b.version,
    revision: b.revision,
    released: b.releasedAt,
    freshness: b.freshness,
    google: b.google,
    proprietary_codecs: b.proprietaryCodecs,
    hevc: b.hevc,
    widevine: b.widevine,
    simd: b.simd,
    page: abs(`/builds/${b.project}/`),
    release_notes: b.releaseUrl,
    downloads: b.downloads.map((d) => ({
      kind: d.kind,
      label: d.label,
      filename: d.filename,
      url: d.url,
      size: d.size,
      sha256: d.sha256,
      arch: d.arch,
      simd: d.simd,
    })),
  }));

  const write = (p: string, data: unknown) => Bun.write(`${OUT}${p}`, `${JSON.stringify(data, null, 2)}\n`);
  await write("/api/v1/builds.json", { generated_at: generatedAt, upstream, count: compact.length, builds: compact });
  await write("/api/v1/upstream.json", upstream);
  await write("/api/v1/distros.json", { generated_at: generatedAt, distros });
  for (const p of ["windows", "macos", "linux", "android"] as Platform[]) {
    await write(`/api/v1/${p}.json`, {
      generated_at: generatedAt,
      platform: p,
      builds: compact.filter((b) => b.platform === p),
    });
  }
  // Flat "newest per project+platform+arch" view, which is what an updater actually wants.
  await write("/api/v1/latest.json", {
    generated_at: generatedAt,
    stable: upstream.stable,
    latest: compact.map((b) => ({
      id: b.id,
      version: b.version,
      revision: b.revision,
      platform: b.platform,
      arch: b.arch[0],
      url: b.downloads.find((d) => d.kind === "installer")?.url ?? b.downloads[0]?.url,
      sha256: b.downloads.find((d) => d.kind === "installer")?.sha256 ?? b.downloads[0]?.sha256,
    })),
  });

  const ep = (p: string, what: string) =>
    `<tr><td><a href="${url(p)}"><code>${esc(p)}</code></a></td><td class="wrap-cell">${esc(what)}</td></tr>`;

  await page(
    "/api/",
    {
      title: "Chromium builds JSON API",
      description:
        "A free, no-key JSON API listing current Chromium builds for every platform, with versions, direct download URLs and SHA-256 checksums. Regenerated automatically.",
      crumbs: [{ label: "Home", href: "/" }, { label: "API" }],
    },
    `<div class="hero"><h1>JSON API</h1>
<p class="lede">Static JSON, no key, no rate limit, CORS-open. Regenerated on the same schedule as the site, so an
updater script can poll it directly.</p>${stamp(generatedAt, upstream.stable.version)}</div>
<h2>Endpoints</h2>
<div class="tw"><table><thead><tr><th>Endpoint</th><th>Returns</th></tr></thead><tbody>
${ep("/api/v1/builds.json", "Every tracked build with all downloads, checksums and metadata.")}
${ep("/api/v1/latest.json", "One flat row per build with the preferred download URL. The best endpoint for an updater.")}
${ep("/api/v1/upstream.json", "Current upstream Chromium stable, beta, dev and canary versions with revisions.")}
${ep("/api/v1/windows.json", "Windows builds only.")}
${ep("/api/v1/macos.json", "macOS builds only.")}
${ep("/api/v1/linux.json", "Linux builds only.")}
${ep("/api/v1/android.json", "Android builds only.")}
${ep("/api/v1/distros.json", "Chromium version currently packaged by each Linux distribution.")}
</tbody></table></div>
<h2>Example</h2>
<pre><code># newest Windows x64 build that is level with upstream stable
curl -s ${esc(abs("/api/v1/windows.json"))} \\
  | jq -r '.builds[] | select(.arch[0]=="x64" and .freshness=="current")
           | "\\(.name) \\(.version) \\(.downloads[0].url)"'</code></pre>
<h2>Field notes</h2>
<ul class="notes">
<li><code>freshness</code> is derived by comparing the build's milestone against upstream stable:
<code>current</code>, <code>behind</code> (one milestone), <code>outdated</code> (two or more), or
<code>abandoned</code> (nothing published in a year).</li>
<li><code>sha256</code> comes from the release host itself, not computed here.</li>
<li><code>google</code> is one of <code>sync</code>, <code>nosync</code>, <code>ungoogled</code> or <code>raw</code>.</li>
<li>Download URLs point at the maintainer's release host. Nothing is proxied through this site.</li>
</ul>
<h2>Using it</h2>
<p class="blurb">Please poll no more than hourly; the data only changes when a maintainer publishes. If you are
replacing a dead update endpoint in an existing tool, <code>latest.json</code> is the closest shape.
The generator is <a href="${SITE.repo}" rel="noopener">open source</a>, so you can also just run it yourself.</p>`,
    { changefreq: "weekly", priority: "0.6" },
  );
}

/**
 * chrlauncher fetches ChromiumUpdateUrl and parses the body as `key=value` pairs split on `;`,
 * reading `download`, `version` and `timestamp` (see henrypp/chrlauncher src/main.c). Its default
 * URL is a format string taking architecture then build type, so serving
 * `/api/chrlauncher/windows-%d-%s.txt` keeps arch and type switching working on a static host.
 *
 * The download must be an archive, not an installer: chrlauncher extracts it itself.
 */
const CHRLAUNCHER_TYPES: Record<string, { x64: string[]; x86: string[] }> = {
  "dev-official": { x64: ["snapshot-win-x64"], x86: ["snapshot-win-x86"] },
  "stable-codecs-sync": { x64: ["hibbiki-windows-x64"], x86: ["thorium-windows-x86", "snapshot-win-x86"] },
  "dev-nosync": { x64: ["robrich-windows-x64-avx2", "robrich-windows-x64-avx"], x86: ["snapshot-win-x86"] },
  "dev-codecs-sync": { x64: ["hibbiki-windows-x64"], x86: ["thorium-windows-x86"] },
  "dev-codecs-nosync": { x64: ["marmaduke-windows-x64", "thorium-windows-x64"], x86: ["thorium-windows-x86"] },
  "ungoogled-chromium": {
    x64: ["marmaduke-windows-x64", "ungoogled-chromium-windows-x64"],
    x86: ["ungoogled-chromium-windows-x86"],
  },
  // Convenience aliases for people setting this up fresh.
  stable: { x64: ["hibbiki-windows-x64"], x86: ["thorium-windows-x86"] },
  thorium: { x64: ["thorium-windows-x64"], x86: ["thorium-windows-x86"] },
};

async function chrlauncherEndpoints() {
  await mkdir(`${OUT}/api/chrlauncher`, { recursive: true });
  const rows: string[] = [];

  for (const [type, arches] of Object.entries(CHRLAUNCHER_TYPES)) {
    for (const [archKey, bits] of [
      ["x64", 64],
      ["x86", 32],
    ] as const) {
      const candidates = arches[archKey];
      let chosen: Build | undefined;
      let dl: Build["downloads"][number] | undefined;
      for (const id of candidates) {
        const b = builds.find((x) => x.id === id);
        if (!b) continue;
        // chrlauncher unpacks the archive itself, so never hand it an installer.
        const archive = b.downloads.find((d) => d.kind === "portable" || d.kind === "archive");
        if (!archive) continue;
        chosen = b;
        dl = archive;
        break;
      }
      const file = `windows-${bits}-${type}.txt`;
      if (!chosen || !dl) {
        note(`chrlauncher ${file}`, "no suitable archive build");
        continue;
      }
      const body =
        [
          `version=${chosen.version}`,
          `download=${dl.url}`,
          `timestamp=${Math.floor(new Date(chosen.releasedAt).getTime() / 1000)}`,
          ...(chosen.revision ? [`revision=${chosen.revision}`] : []),
          ...(dl.sha256 ? [`sha256=${dl.sha256}`] : []),
          `size=${dl.size ?? 0}`,
        ].join(";") + "\n";
      await Bun.write(`${OUT}/api/chrlauncher/${file}`, body);
      rows.push(
        `<tr><td><code>${esc(type)}</code></td><td>${bits}-bit</td><td>${esc(chosen.projectName)}</td><td><code>${esc(
          chosen.version,
        )}</code></td></tr>`,
      );
    }
  }

  await page(
    "/docs/chrlauncher/",
    {
      title: "chrlauncher after woolyss: repointing the update URL",
      description:
        "chrlauncher's default update URL stops working when chromium.woolyss.com shuts down. Here is the one line to change to keep automatic Chromium updates working.",
      crumbs: [{ label: "Home", href: "/" }, { label: "Guides", href: "/docs/" }, { label: "chrlauncher" }],
    },
    `<div class="hero"><h1>Keeping chrlauncher working</h1>
<p class="lede">chrlauncher checks for Chromium updates against chromium.woolyss.com, which shuts down on
31 August 2026. When it goes, chrlauncher stops finding updates. One line in its config fixes that.</p></div>
<div class="prose">
<h2>The fix</h2>
<p>Open <code>chrlauncher.ini</code> next to <code>chrlauncher.exe</code> and set:</p>
<pre><code>ChromiumUpdateUrl=${esc(abs("/api/chrlauncher/windows-%d-%s.txt"))}</code></pre>
<p>Make sure the line is not commented out; the default ships with a <code>#</code> in front of it.
That is the whole change. chrlauncher substitutes your architecture and build type into the URL exactly as it
did before, so switching <code>ChromiumType</code> keeps working.</p>

<h2>Why this works on a static site</h2>
<p>chrlauncher's update URL is a format string: it fills in the architecture and the configured build type,
then parses the response as <code>key=value</code> pairs separated by semicolons. Because those values land in
the path rather than a query string, every combination can be served as a plain file. Nothing dynamic is
involved, which is also why it cannot go down the way a single API endpoint can.</p>

<h2>Build types available</h2>
<p>Set <code>ChromiumType</code> in the same file. The original woolyss names all still work and point at
sensible current equivalents:</p>
<div class="tw"><table><thead><tr><th>ChromiumType</th><th>Architecture</th><th>Now serves</th><th>Version</th></tr></thead>
<tbody>${rows.join("")}</tbody></table></div>

<h2>What the response looks like</h2>
<pre><code>$ curl ${esc(abs("/api/chrlauncher/windows-64-stable-codecs-sync.txt"))}
version=${esc(builds.find((b) => b.id === "hibbiki-windows-x64")?.version ?? "")};download=https://github.com/...;timestamp=...</code></pre>
<p>The <code>download</code> value always points at a portable archive rather than an installer, because
chrlauncher extracts the archive itself. <code>sha256</code> and <code>size</code> are extra fields older
clients ignore harmlessly.</p>

<h2>A note on trust</h2>
<p>This endpoint tells chrlauncher where to download from, and chrlauncher will install what it finds there.
Every URL served points at the maintainer's own GitHub release, and the files are regenerated automatically
from those releases several times a day. If you would rather not point an auto-updater at someone else's
server, the alternative is to check the <a href="/feed.xml">release feed</a> and update by hand.</p>

<h2>Other updaters</h2>
<p><a href="https://github.com/mkorthof/chrupd" rel="noopener">chrupd</a> reads GitHub release APIs directly
and never depended on woolyss, so it keeps working untouched. On Windows,
<a href="/docs/updating-chromium/">winget or Chocolatey</a> will also keep a Chromium build current without
any of this.</p>
</div>`,
    { changefreq: "weekly", priority: "0.7" },
  );
}

async function versionCheckerPage() {
  const script = `
(function(){
  var out=document.getElementById("ver-result");if(!out)return;
  var m=navigator.userAgent.match(/Chrom(?:e|ium)\\/(\\d+)\\.(\\d+)\\.(\\d+)\\.(\\d+)/);
  var stable=${JSON.stringify(upstream.stable.milestone)};
  var stableVer=${JSON.stringify(upstream.stable.version)};
  var box=document.createElement("div");
  if(!m){
    box.className="note warn";
    box.appendChild(el("p","This browser does not identify itself as Chrome or Chromium, so there is no version to compare."));
  } else {
    var mine=parseInt(m[1],10),gap=stable-mine;
    box.className="note"+(gap<=0?"":gap===1?" warn":" warn");
    var p1=el("p","");
    var b=document.createElement("b");b.textContent="You are running version "+m[0].split("/")[1]+".";
    p1.appendChild(b);
    p1.appendChild(document.createTextNode(" The current Chromium stable release is "+stableVer+"."));
    box.appendChild(p1);
    var verdict=gap<=0
      ?"You are up to date. Nothing to do."
      :gap===1
      ?"You are one milestone behind. That is common for volunteer builds and usually acceptable, but you are missing the newest security fixes."
      :"You are "+gap+" milestones behind and missing published security fixes. You should update this build.";
    box.appendChild(el("p",verdict));
  }
  out.replaceChildren(box);
  function el(t,txt){var e=document.createElement(t);e.textContent=txt;return e;}
})();`.trim();

  await page(
    "/my-version/",
    {
      title: "What version of Chromium am I running?",
      description:
        "Check which Chromium version this browser is running, compare it against the current upstream stable release, and find out whether you are missing security fixes.",
      crumbs: [{ label: "Home", href: "/" }, { label: "My version" }],
    },
    `<div class="hero"><h1>What Chromium version am I running?</h1>
<p class="lede">Read from your browser locally and compared against the current upstream release. Nothing is
sent anywhere.</p></div>
<div id="ver-result"><div class="note"><p>Checking requires JavaScript. You can also open
<code>chrome://version</code> in your browser, which shows the same thing plus the revision it was built
from.</p></div></div>
<div class="prose">
<h2>What the comparison means</h2>
<p>Only the first number of a Chromium version, the milestone, matters for judging whether a build is current.
Chromium ships a new milestone roughly every four weeks and security fixes roughly every two.</p>
<ul>
<li><b>Same milestone as stable.</b> Current, with this cycle's security fixes.</li>
<li><b>One behind.</b> Normal for volunteer builds, which need patches rebased onto new source. Usually fine.</li>
<li><b>Two or more behind.</b> Missing at least a full cycle of published security fixes, in the program that
runs the most untrusted code on your machine.</li>
</ul>
<p>See <a href="${url("/docs/chromium-version-numbers/")}">how Chromium version numbers work</a> for the full
explanation, and <a href="${url("/docs/updating-chromium/")}">updating Chromium</a> for what to do about it.</p>
<h2>Finding out more about your build</h2>
<p>Open <code>chrome://version</code>. It shows the full version, the revision it was built from, the exact
command line the browser is running with, and your profile path. If you are not sure which build you have
installed, that page is the place to look.</p>
<h2>Current upstream versions</h2>
<div class="tw"><table><thead><tr><th>Channel</th><th>Version</th><th>Revision</th></tr></thead><tbody>
<tr><td>Stable</td><td><code>${esc(upstream.stable.version)}</code></td><td><code>${esc(upstream.stable.revision)}</code></td></tr>
<tr><td>Beta</td><td><code>${esc(upstream.beta.version)}</code></td><td><code>${esc(upstream.beta.revision)}</code></td></tr>
<tr><td>Dev</td><td><code>${esc(upstream.dev.version)}</code></td><td><code>${esc(upstream.dev.revision)}</code></td></tr>
<tr><td>Canary</td><td><code>${esc(upstream.canary.version)}</code></td><td><code>${esc(upstream.canary.revision)}</code></td></tr>
</tbody></table></div>
<p class="stamp">Read automatically from Google's own version feed, ${shortDate(generatedAt)}. Also available as
<a href="${url("/api/v1/upstream.json")}">JSON</a>.</p>
</div>
<script>${script}</script>`,
    { changefreq: "daily", priority: "0.7" },
  );
}

async function aboutPage() {
  const sourceRows = [...new Set(builds.map((b) => b.sourceUrl))]
    .sort()
    .map((s) => `<li><a href="${esc(s)}" rel="noopener">${esc(s.replace("https://", ""))}</a></li>`)
    .join("");

  await page(
    "/about/",
    {
      title: "About this site",
      description:
        "What this site is, where its data comes from, and why it exists: an automatically updated index of trusted Chromium builds, with no tracking and nothing re-hosted.",
      crumbs: [{ label: "Home", href: "/" }, { label: "About" }],
    },
    `<div class="hero"><h1>About</h1>
<p class="lede">An automatically maintained index of trusted Chromium builds, built to replace a resource the
community is about to lose.</p></div>
<div class="prose">
<h2>Why this exists</h2>
<p>For nearly two decades <a href="https://chromium.woolyss.com/" rel="noopener">chromium.woolyss.com</a> was where
people went to find a Chromium build they could trust. Its maintainer announced it will shut down permanently on
31 August 2026. The builds themselves are fine, they all live on GitHub, but the thing that made them findable
was that one page. This site exists so that going away costs people less.</p>

<h2>How it works</h2>
<p>Nothing here is hand-maintained. A scheduled job reads each maintainer's release feed directly, along with
Google's own build and version services, and regenerates the whole site. That means the versions on this page were
not typed by anyone, and cannot quietly go stale the way a hand-curated list does.</p>
<p>Freshness badges are computed, not assigned. A build's milestone is compared against the current upstream
Chromium stable release, so "outdated" means measurably behind rather than somebody's opinion.</p>

<h2>What it does not do</h2>
<ul>
<li><b>Nothing is re-hosted.</b> Every download button points at the maintainer's own release host. This site never
sits between you and the binary, so it cannot tamper with one.</li>
<li><b>No analytics, no cookies, no trackers.</b> No third-party scripts of any kind. Nothing about your visit is
recorded here.</li>
<li><b>No ads and no sponsorships.</b> There is no ranking to buy.</li>
</ul>

<h2>Verifying what you download</h2>
<p>Every checksum shown comes from the release host's own API rather than being computed here, so you can check a
file against its publisher without trusting this site. The
<a href="/docs/verify-your-download/">verification guide</a> walks through it on each platform.</p>

<h2>Sources</h2>
<p>Builds are read from these repositories and services:</p>
<ul>${sourceRows}
<li><a href="https://storage.googleapis.com/chromium-browser-snapshots/" rel="noopener">Chromium snapshot storage</a></li>
<li><a href="https://googlechromelabs.github.io/chrome-for-testing/" rel="noopener">Chrome for Testing version feed</a></li>
<li><a href="https://repology.org/" rel="noopener">Repology, for distribution package versions</a></li>
</ul>

<h2>Credit</h2>
<p>The maintainers listed here do the actual work: compiling, patching and publishing Chromium for free, on their
own time. This site only points at what they publish. If one of their builds is useful to you, the projects are
worth starring, reporting bugs to, and supporting.</p>
<p>Thanks are also owed to Jerry, who ran woolyss for nineteen years and set the standard this is trying to meet.</p>

<h2>Corrections</h2>
<p>If a build is mislabelled, missing, or a maintainer would rather not be listed, open an issue on
<a href="${SITE.repo}" rel="noopener">the repository</a> and it will be fixed.</p>
</div>`,
    { changefreq: "monthly", priority: "0.4" },
  );
}

// ========================================================= official chromium

const SNAPSHOT_WARNING =
  "These are the raw output of Google's build bots, published for every commit and tested by nobody. " +
  "They do not update themselves, they cannot play H.264 or AAC video, and they have no Widevine, so most " +
  "streaming services will not work.";

function crrev(revision: string): string {
  return `https://crrev.com/${revision}`;
}

/** Facts a person needs to tell one snapshot from another, in the order they matter. */
function snapshotFacts(t: SnapshotTrack, r: SnapshotRelease): string {
  return `<dl class="facts">
<dt>Version</dt><dd>${esc(r.version)}</dd>
<dt>Built</dt><dd>${shortDate(r.builtAt)} <span class="ver">(${relDate(r.builtAt)})</span></dd>
<dt>Revision</dt><dd><a href="${crrev(r.revision)}" rel="nofollow noopener">${esc(r.revision)}</a></dd>
<dt>Commit</dt><dd><a href="https://chromium.googlesource.com/chromium/src/+/${esc(r.commit)}" rel="nofollow noopener">${esc(r.commit.slice(0, 12))}</a></dd>
<dt>Size</dt><dd>${bytes(r.size)}</dd>
</dl>`;
}

function olderList(t: SnapshotTrack, opts: { scroll?: boolean; heading?: string } = {}): string {
  if (!t.older.length) return "";
  return `${opts.heading ?? "<h3>Older revisions</h3>"}
<p class="blurb">Every revision Google still has for this platform. Pick an older one only when you are
bisecting a bug and need the build from just before it appeared.</p>
<div class="revs${opts.scroll ? " scroll" : ""}"><ol>
${t.older
  .map(
    (r) => `<li><time datetime="${esc(r.builtAt)}">${shortDate(r.builtAt)}</time>
<span class="rv">${esc(r.version)}</span>
<a href="${crrev(r.revision)}" rel="nofollow noopener">r${esc(r.revision)}</a>
<a href="${esc(r.url)}" rel="nofollow noopener">Download</a></li>`,
  )
  .join("")}
</ol></div>`;
}

/** The download block for one target. Rendered hidden on the hub, open on the platform page. */
function snapshotCard(t: SnapshotTrack, opts: { hidden?: boolean } = {}): string {
  const r = t.latest;
  return `<div class="build pick"${opts.hidden ? ` hidden id="pick-${t.platform}-${t.arch}"` : ""}>
<div class="build-head"><h3>${esc(t.title)}</h3><span class="ver">${esc(r.version)}</span></div>
<p class="blurb">${esc(t.requirement)}</p>
${snapshotFacts(t, r)}
<div class="dl"><a class="btn big" href="${esc(r.url)}" rel="nofollow noopener">Download Chromium ${esc(r.version)}
<small>${esc(t.file.endsWith(".zip") ? "zip" : "archive")}, ${bytes(r.size)}</small></a>
<a class="btn sec" href="${url(`/chromium/${t.slug}/`)}">About this build</a></div>
${opts.hidden ? olderList(t, { scroll: true, heading: "<h4>Older revisions</h4>" }) : ""}
</div>`;
}

async function chromiumHub(tracks: SnapshotTrack[]) {
  const faq = [
    {
      q: "Is there an official Chromium download?",
      a: "There is no official Chromium installer for end users, and Google does not distribute one. What does exist is a per-commit build produced by Google's own build bots and published to their public storage bucket. That is what this page links to. It is genuinely from Google, but it is a developer artefact rather than a product: nothing about it has been release-tested.",
    },
    {
      q: "Why does video not play in the official Chromium build?",
      a: "H.264 and AAC are patent-encumbered, so Google does not compile them into the open-source build. Widevine, which streaming services require, is proprietary and is also absent. The practical result is that YouTube mostly works and Netflix does not. Third-party maintainers add these pieces back, which is the main reason their builds exist.",
    },
    {
      q: "Does the official Chromium build update itself?",
      a: "No. There is no updater of any kind, so the copy you download stays at the version you downloaded and keeps its security holes. You have to come back and replace it yourself. Because a new revision appears every few minutes, an official snapshot goes stale faster than any other build listed on this site.",
    },
    {
      q: "What is a Chromium revision number?",
      a: "It is the position of a commit in the Chromium main branch, counting from the first commit. Revision 1688518 is the 1,688,518th commit. Google names each snapshot folder after it, so a revision number identifies exactly one build, whereas a version number like 154.0.8031.0 covers hundreds of them.",
    },
  ];

  const body = `
<div class="hero">
  <h1>Official Chromium builds</h1>
  <p class="lede">The Chromium build Google's own bots produce, straight from Google's storage. One for every
  commit, for every platform they build.</p>
  ${stamp(generatedAt, upstream.stable.version)}
</div>

<div id="detect" hidden><h2>Your system</h2>
${tracks.map((t) => snapshotCard(t, { hidden: true })).join("")}
</div>

<h2>Every platform</h2>
<p class="blurb">Google builds each of these separately, so their revision numbers differ. Pick the one that
matches the machine you are going to run it on.</p>
<ul class="grid-links">
${tracks
  .map(
    (t) => `<a href="${url(`/chromium/${t.slug}/`)}">${esc(t.title)}<small>${esc(t.latest.version)} &middot; r${esc(t.latest.revision)} &middot; ${shortDate(t.latest.builtAt)}</small></a>`,
  )
  .join("")}
</ul>

<h2>How this differs from Chrome</h2>
<p class="blurb">Chrome is built from this same source, then has the pieces added that make it a product:
automatic updates, the licensed H.264 and AAC codecs, Widevine for streaming DRM, crash reporting and
Google account integration. Strip those out and you have what is on this page.
<a href="${url("/docs/chromium-vs-chrome/")}">The full comparison</a> goes through each one.</p>

<h2>Keeping it up to date</h2>
<p class="blurb">Nothing here updates itself, and a build a month old is a build with a month of published
security fixes missing. Either check back and replace it by hand, or use a build that has an updater.
<a href="${url("/docs/updating-chromium/")}">How to update Chromium</a> covers both.</p>

<h2>Other kinds of Chromium build</h2>
<p class="blurb">Most people are better served by one of the maintained builds. They are compiled by
volunteers from the same source, with the missing pieces added back.</p>
<ul class="chooser">
${CHOOSER_OTHERS.map(
  (c) => `<li><b>${esc(c.b)}</b><p>${esc(c.p)}</p><a href="${url(c.href)}">${esc(c.cta)} &rarr;</a></li>`,
).join("")}
</ul>

<h2>Common questions</h2>
${faq.map((f) => `<h3>${esc(f.q)}</h3><p class="blurb">${esc(f.a)}</p>`).join("")}
<p><a href="${url("/builds/chromium-snapshot/")}">More about the snapshot build &rarr;</a></p>
<script>var B=${JSON.stringify(SITE.base)};${DETECT_SCRIPT}</script>
`;

  await page(
    "/chromium/",
    {
      title: "Official Chromium Builds - direct from Google's build bots",
      description:
        "Download the official Chromium build for Windows, macOS, Linux and Android, straight from Google's own storage. Latest revision plus the full recent history, updated automatically.",
      crumbs: [{ label: "Home", href: "/" }, { label: "Official Chromium" }],
      schema: [faqSchema(faq)],
    },
    body,
    { changefreq: "hourly", priority: "0.9" },
  );
}

async function chromiumPlatformPage(t: SnapshotTrack, tracks: SnapshotTrack[]) {
  const others = tracks.filter((x) => x.slug !== t.slug);
  const r = t.latest;
  const body = `
<div class="hero">
  <h1>Official Chromium for ${esc(t.title)}</h1>
  <p class="lede">Revision ${esc(r.revision)}, built ${shortDate(r.builtAt)} by Google's build bots and
  published unmodified.</p>
</div>

<div class="note"><p><b>Untested developer build.</b> ${esc(SNAPSHOT_WARNING)}
<a href="${url(`/${t.platform}/`)}">See the maintained ${PLATFORM_LABEL[t.platform]} builds</a> if you want one
that plays video and updates itself.</p></div>

${snapshotCard(t)}

<h2>Installing it</h2>
<p class="blurb">${esc(INSTALL_NOTE[t.platform])}</p>

${olderList(t, { heading: "<h2>Older revisions</h2>" })}

<h2>Other platforms</h2>
<ul class="grid-links">
${others
  .map(
    (o) => `<a href="${url(`/chromium/${o.slug}/`)}">${esc(o.title)}<small>${esc(o.latest.version)} &middot; ${shortDate(o.latest.builtAt)}</small></a>`,
  )
  .join("")}
</ul>
<p><a href="${url("/chromium/")}">&larr; All official Chromium builds</a></p>
`;

  await page(
    `/chromium/${t.slug}/`,
    {
      title: `Official Chromium for ${t.title} - ${r.version}`,
      description:
        `Download the official Chromium build for ${t.title}, version ${r.version}, revision ${r.revision}. ` +
        `Direct from Google's storage, with the ${t.older.length} previous revisions.`,
      crumbs: [
        { label: "Home", href: "/" },
        { label: "Official Chromium", href: "/chromium/" },
        { label: t.title },
      ],
      schema: [
        {
          "@type": "SoftwareApplication",
          name: `Chromium for ${t.title}`,
          applicationCategory: "BrowserApplication",
          operatingSystem: PLATFORM_LABEL[t.platform],
          softwareVersion: r.version,
          datePublished: r.builtAt,
          downloadUrl: r.url,
          fileSize: String(r.size),
          author: { "@type": "Organization", name: "The Chromium Authors" },
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        },
      ],
    },
    body,
    { changefreq: "hourly", priority: "0.8" },
  );
}

const INSTALL_NOTE: Record<string, string> = {
  windows:
    "Unzip the archive anywhere you like and run chrome.exe from inside it. There is no installer and nothing is written to the registry, so deleting the folder removes it completely. Windows SmartScreen will warn you the first time because these builds are not code-signed.",
  macos:
    "Unzip the archive and drag Chromium out of it. The build is not notarised by Apple, so a double-click is refused: right-click the app and choose Open, then confirm once. After that it launches normally.",
  linux:
    "Unzip the archive and run the chrome binary inside it. If it refuses to start, you are usually missing a shared library your distribution ships separately, and the error names it. Your package manager's own chromium package is the easier option unless you specifically need this revision.",
  android:
    "The download is an APK. Android blocks installing one from a browser until you allow it for that browser, which it prompts you to do the first time. This build does not go through the Play Store, so it never updates on its own.",
};

async function feeds() {
  const recent = [...builds]
    .filter((b) => b.channel !== "snapshot")
    .sort((a, b) => new Date(b.releasedAt).getTime() - new Date(a.releasedAt).getTime())
    .slice(0, 40);

  const atom = `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>${esc(SITE.name)} - new Chromium releases</title>
  <subtitle>New builds as maintainers publish them.</subtitle>
  <link href="${abs("/feed.xml")}" rel="self"/>
  <link href="${SITE.origin}${url("/")}"/>
  <id>${SITE.origin}${url("/")}</id>
  <updated>${new Date(generatedAt).toISOString()}</updated>
${recent
  .map(
    (b) => `  <entry>
    <title>${esc(`${b.projectName} ${b.version} for ${PLATFORM_LABEL[b.platform]} ${ARCH_SHORT[b.arch[0]]}`)}</title>
    <link href="${abs(`/builds/${b.project}/`)}"/>
    <id>tag:${SITE.origin.replace(/^https?:\/\//, "")},2026:${esc(b.id)}:${esc(b.version)}</id>
    <updated>${new Date(b.releasedAt).toISOString()}</updated>
    <summary>${esc(`${b.projectName} ${b.version} by ${b.maintainer}. ${blurbFor(b)}`)}</summary>
  </entry>`,
  )
  .join("\n")}
</feed>`;
  await Bun.write(`${OUT}/feed.xml`, atom);

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.w3.org/1999/sitemap/0.9" xmlns:x="http://www.sitemaps.org/schemas/sitemap/0.9">
${written
  .map(
    (w) => `  <url><loc>${abs(w.path)}</loc><lastmod>${generatedAt.slice(0, 10)}</lastmod><changefreq>${
      w.changefreq
    }</changefreq><priority>${w.priority}</priority></url>`,
  )
  .join("\n")}
</urlset>`.replace('xmlns="http://www.w3.org/1999/sitemap/0.9" xmlns:x="http://www.sitemaps.org/schemas/sitemap/0.9"', 'xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"');
  await Bun.write(`${OUT}/sitemap.xml`, sitemap);

  await Bun.write(
    `${OUT}/robots.txt`,
    `User-agent: *
Allow: /

Sitemap: ${abs("/sitemap.xml")}
`,
  );

  // llms.txt: a plain-text map for AI search crawlers, which increasingly answer these queries.
  await Bun.write(
    `${OUT}/llms.txt`,
    `# ${SITE.name}

> ${SITE.description}

An automatically generated index of trusted Chromium browser builds. Nothing is re-hosted: every
download link points at the maintainer's own release page. Versions and checksums are read directly
from each publisher's API and regenerated several times a day.

## Downloads
${(["windows", "macos", "linux", "android"] as Platform[])
  .map((p) => `- [Chromium for ${PLATFORM_LABEL[p]}](${abs(`/${p}/`)}): every tracked build, with checksums.`)
  .join("\n")}
- [BSD](${abs("/bsd/")}): FreeBSD, OpenBSD and NetBSD ports.
- [Linux distribution packages](${abs("/linux/packages/")}): the Chromium version each distro ships.

## Builds and forks
${[...new Set(builds.map((b) => b.project))]
  .map((id) => {
    const b = builds.find((x) => x.project === id)!;
    return `- [${b.projectName}](${abs(`/builds/${id}/`)}): ${blurbFor(b).split(".")[0]}.`;
  })
  .join("\n")}

## Guides
- [Which Chromium build should I use?](${abs("/docs/which-chromium-build/")})
- [Chromium vs Chrome](${abs("/docs/chromium-vs-chrome/")})
- [Verify your download](${abs("/docs/verify-your-download/")})
- [All guides](${abs("/docs/")})

## Data
- [JSON API](${abs("/api/")}): free, no key, CORS-open.
- [builds.json](${abs("/api/v1/builds.json")}): every build with checksums and download URLs.
- [Atom feed](${abs("/feed.xml")}): new releases.
`,
  );

  await Bun.write(
    `${OUT}/favicon.svg`,
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#1a56c4"/><path d="M32 14a18 18 0 0 1 15.6 9H33.4a9 9 0 0 0-8.2 5.2L18.6 18A18 18 0 0 1 32 14Zm-16 6.4 7.1 12.3a9 9 0 0 0 6.6 10.1l-6.6 11.4A18 18 0 0 1 16 20.4Zm34.9 6.2A18 18 0 0 1 34.4 50l7.1-12.3a9 9 0 0 0 1.6-11.1ZM32 25.5a6.5 6.5 0 1 1 0 13 6.5 6.5 0 0 1 0-13Z" fill="#fff"/></svg>`,
  );

  await Bun.write(
    `${OUT}/404.html`,
    layout(
      {
        title: "Page not found",
        description:
          "That page does not exist on Chromium Builds. Jump to the Windows, macOS, Linux or Android download pages, or the guides.",
        path: "/404.html",
      },
      `<div class="hero"><h1>Page not found</h1>
<p class="lede">That page does not exist. It may have been renamed when the site regenerated.</p></div>
<ul class="grid-links">
<a href="${url("/")}">Home<small>Start here</small></a>
<a href="${url("/windows/")}">Windows<small>All Windows builds</small></a>
<a href="${url("/macos/")}">macOS<small>All macOS builds</small></a>
<a href="${url("/linux/")}">Linux<small>All Linux builds</small></a>
<a href="${url("/docs/")}">Guides<small>How the builds differ</small></a>
</ul>`,
    ),
  );

  // Keep GitHub Pages from running the output through Jekyll.
  await Bun.write(`${OUT}/.nojekyll`, "");

  // Pages reads the custom domain from this file on every deploy, so the generator owns it.
  const host = new URL(SITE.origin).hostname;
  if (!host.endsWith("github.io") && !SITE.base) await Bun.write(`${OUT}/CNAME`, `${host}\n`);
}

// ============================================================ run

await rm(OUT, { recursive: true, force: true });
await mkdir(OUT, { recursive: true });

const docs = await loadDocs();
await home();
for (const p of ["windows", "macos", "linux", "android"] as Platform[]) await platformPage(p);
await archPage("windows", "arm64", "arm64", "Chromium for Windows on ARM (ARM64)", "Native ARM64 Chromium builds for Windows on ARM devices, including Snapdragon X laptops and the Surface Pro X.");
await archPage("windows", "x86", "32-bit", "Chromium for 32-bit Windows", "32-bit Chromium builds for older Windows PCs, including the last releases that supported 32-bit systems.");
await archPage("macos", "arm64", "apple-silicon", "Chromium for Apple Silicon Macs", "Native ARM64 Chromium builds for M1, M2, M3 and M4 Macs, plus what to do about Apple's unidentified developer warning.");
await archPage("macos", "x64", "intel", "Chromium for Intel Macs", "Chromium builds for Intel-based Macs, which also run on Apple silicon through Rosetta 2.");
await archPage("linux", "arm64", "arm64", "Chromium for ARM64 Linux", "Chromium builds for 64-bit ARM Linux machines, including the Raspberry Pi 4 and 5.");
if (snapshots.length) {
  await chromiumHub(snapshots);
  for (const t of snapshots) await chromiumPlatformPage(t, snapshots);
} else note("chromium pages", "no snapshot history in the manifest, skipped /chromium/");
await projectPages();
await packagesPage();
await bsdPage();
await chromeosPage();
await docsPages(docs);
await apiPages();
await chrlauncherEndpoints();
await versionCheckerPage();
await aboutPage();
await feeds();

if (warnings.length) {
  console.warn(`\n${warnings.length} warning(s):`);
  for (const w of warnings) console.warn(`  ! ${w}`);
}
console.log(`built ${written.length} pages into ${OUT}/`);
console.log(`  ${builds.length} builds, ${distros.length} distro packages, ${docs.length} guides`);
