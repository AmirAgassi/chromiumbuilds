import { GITHUB_SOURCES, SNAPSHOT_META } from "./sources";
import type { Arch, Build, Download, Freshness, Platform } from "./types";
import { abs, bytes, esc, relDate, shortDate, url } from "./site";

export const PLATFORM_LABEL: Record<Platform, string> = {
  windows: "Windows",
  macos: "macOS",
  linux: "Linux",
  android: "Android",
  bsd: "BSD",
  chromeos: "ChromeOS",
};

export const ARCH_LABEL: Record<Arch, string> = {
  x64: "64-bit (x86-64)",
  arm64: "ARM64",
  x86: "32-bit (x86)",
  arm32: "ARM 32-bit",
  universal: "Universal",
};

export const ARCH_SHORT: Record<Arch, string> = {
  x64: "x64",
  arm64: "ARM64",
  x86: "32-bit",
  arm32: "ARM32",
  universal: "Universal",
};

const FRESHNESS: Record<Freshness, { label: string; cls: string; title: string }> = {
  current: { label: "Current", cls: "ok", title: "Level with the latest Chromium stable release." },
  behind: {
    label: "One version behind",
    cls: "warn",
    title: "One milestone behind stable. Usually fine, but it is missing the newest security fixes.",
  },
  outdated: {
    label: "Outdated",
    cls: "bad",
    title: "Two or more milestones behind stable. It is missing known security fixes.",
  },
  abandoned: {
    label: "No longer updated",
    cls: "bad",
    title: "Nothing has been published for over a year.",
  },
};

export function blurbFor(build: Build): string {
  if (build.project === "chromium-snapshot") return SNAPSHOT_META.blurb;
  return GITHUB_SOURCES.find((s) => s.id === build.project)?.blurb ?? "";
}

export function homepageFor(build: Build): string | undefined {
  return GITHUB_SOURCES.find((s) => s.id === build.project)?.homepage;
}

/** Human-readable summary of what a build does and does not include. */
export function traitTags(build: Build, opts: { omitLimitations?: boolean } = {}): string {
  const t: string[] = [];
  const f = FRESHNESS[build.freshness];
  t.push(`<span class="tag ${f.cls}" title="${esc(f.title)}">${f.label}</span>`);

  if (build.google === "ungoogled")
    t.push('<span class="tag ok" title="Google web service integration removed at the source level.">Ungoogled</span>');
  else if (build.google === "sync")
    t.push('<span class="tag" title="Ships Google API keys, so browser sign-in and sync work.">Sync works</span>');
  else if (build.google === "nosync")
    t.push('<span class="tag" title="No Google API keys, so browser sign-in and sync are unavailable.">No sync</span>');
  else t.push('<span class="tag" title="Unmodified upstream build with no API keys.">Unmodified</span>');

  if (build.proprietaryCodecs)
    t.push(
      `<span class="tag ok" title="H.264 and AAC are compiled in, so ordinary web video plays.">Codecs${build.hevc ? " + H.265" : ""}</span>`,
    );
  else if (!opts.omitLimitations)
    t.push('<span class="tag warn" title="Open codecs only. Some H.264 and AAC media will not play.">Open codecs only</span>');

  if (build.widevine)
    t.push('<span class="tag ok" title="Widevine DRM is available, so paid streaming services play.">Widevine</span>');
  else if (!opts.omitLimitations)
    t.push('<span class="tag warn" title="No Widevine DRM, so most paid streaming video will not play.">No DRM</span>');

  if (build.simd)
    t.push(
      `<span class="tag" title="Requires a CPU supporting ${build.simd.toUpperCase()}.">${build.simd.toUpperCase()} required</span>`,
    );

  if (build.channel !== "stable" && !opts.omitLimitations)
    t.push(`<span class="tag warn">${build.channel === "snapshot" ? "Untested snapshot" : `${build.channel} channel`}</span>`);

  return `<div class="tags">${t.join("")}</div>`;
}

function downloadButton(d: Download, primary: boolean): string {
  const size = d.size ? ` <small>${bytes(d.size)}</small>` : "";
  return `<a class="btn${primary ? "" : " sec"}" href="${esc(d.url)}" rel="noopener nofollow"${
    d.filename ? ` download` : ""
  } title="${esc(d.filename)}">${esc(d.label)}${size}</a>`;
}

function checksums(downloads: Download[]): string {
  const withHash = downloads.filter((d) => d.sha256);
  if (withHash.length === 0) return "";
  return `<details class="more"><summary>Checksums (SHA-256)</summary><div class="hashes">${withHash
    .map((d) => `<div><code>${esc(d.sha256)}</code><br>${esc(d.filename)}</div>`)
    .join("")}</div></details>`;
}

export function buildCard(
  build: Build,
  opts: { pick?: boolean; showPlatform?: boolean; omitLimitations?: boolean; extra?: string } = {},
): string {
  const primary = build.downloads.filter((d) => d.recommended);
  const secondary = build.downloads.filter((d) => !d.recommended);
  const shown = primary.length ? primary : build.downloads.slice(0, 2);
  const rest = primary.length ? secondary : build.downloads.slice(2);

  const platformNote = opts.showPlatform
    ? `<span class="ver">${PLATFORM_LABEL[build.platform]} · ${ARCH_SHORT[build.arch[0]]}</span>`
    : `<span class="ver">${ARCH_SHORT[build.arch[0]]}</span>`;

  return `<li class="build${opts.pick ? " pick" : ""}" id="${esc(build.id)}">
  <div class="build-head">
    <h3><a href="${url(`/builds/${build.project}/`)}">${esc(build.projectName)}</a></h3>
    <span class="ver">${esc(build.version)}</span>
    ${platformNote}
    <span class="by">by ${esc(build.maintainer)} · ${build.channel === "snapshot" ? "rebuilt continuously" : relDate(build.releasedAt)}</span>
  </div>
  <p class="blurb">${esc(blurbFor(build))}</p>
  ${traitTags(build, { omitLimitations: opts.omitLimitations })}
  <div class="dl">${shown.map((d) => downloadButton(d, true)).join("")}</div>
  ${
    rest.length
      ? `<details class="more"><summary>${rest.length} more download${rest.length > 1 ? "s" : ""} (other packages and CPU variants)</summary><div class="dl">${rest
          .map((d) => downloadButton(d, false))
          .join("")}</div></details>`
      : ""
  }
  ${opts.extra ?? ""}
  ${checksums(build.downloads)}
</li>`;
}

export function buildList(
  builds: Build[],
  opts: { pickId?: string; showPlatform?: boolean; omitLimitations?: boolean; extra?: string } = {},
): string {
  if (builds.length === 0) return '<p class="blurb">No builds are currently published for this target.</p>';
  return `<ul class="builds">${builds
    .map((b) =>
      buildCard(b, {
        pick: b.id === opts.pickId,
        showPlatform: opts.showPlatform,
        omitLimitations: opts.omitLimitations,
        extra: opts.extra,
      }),
    )
    .join("")}</ul>`;
}

/** schema.org SoftwareApplication for a build, so search engines can show version and platform. */
export function buildSchema(build: Build): Record<string, unknown> {
  const osMap: Record<Platform, string> = {
    windows: "Windows",
    macos: "macOS",
    linux: "Linux",
    android: "Android",
    bsd: "BSD",
    chromeos: "ChromeOS",
  };
  return {
    "@type": "SoftwareApplication",
    name: `${build.projectName} ${build.version} for ${PLATFORM_LABEL[build.platform]} ${ARCH_SHORT[build.arch[0]]}`,
    applicationCategory: "BrowserApplication",
    operatingSystem: osMap[build.platform],
    softwareVersion: build.version,
    datePublished: build.releasedAt.slice(0, 10),
    downloadUrl: build.downloads[0]?.url,
    installUrl: abs(`/builds/${build.project}/`),
    author: { "@type": "Person", name: build.maintainer },
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    isAccessibleForFree: true,
    license: "https://chromium.googlesource.com/chromium/src/+/main/LICENSE",
  };
}

export function faqSchema(items: { q: string; a: string }[]): Record<string, unknown> {
  return {
    "@type": "FAQPage",
    mainEntity: items.map((i) => ({
      "@type": "Question",
      name: i.q,
      acceptedAnswer: { "@type": "Answer", text: i.a },
    })),
  };
}

export function stamp(generatedAt: string, stableVersion: string): string {
  return `<p class="stamp">Checked automatically ${shortDate(generatedAt)}. Latest Chromium stable is ${esc(
    stableVersion,
  )}.</p>`;
}
