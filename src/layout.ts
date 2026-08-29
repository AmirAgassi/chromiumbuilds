import { SITE, abs, esc, url } from "./site";

export const CSS = `
*,*::before,*::after{box-sizing:border-box}
:root{
  --bg:#fff;--fg:#16181d;--muted:#5c6370;--faint:#8a909b;
  --line:#e3e6ea;--card:#fbfcfd;--raise:#fff;
  --accent:#1a56c4;--accent-fg:#fff;
  --ok:#0d7a3e;--ok-bg:#e6f5ec;--warn:#8a5a00;--warn-bg:#fdf3e0;
  --bad:#a32222;--bad-bg:#fbeaea;--code:#f3f4f6;
  --radius:8px;--w:min(100% - 2.5rem, 68rem);
}
@media (prefers-color-scheme:dark){:root{
  --bg:#0e1013;--fg:#e6e8ec;--muted:#9aa2b1;--faint:#6f7784;
  --line:#252932;--card:#15181d;--raise:#1a1e24;
  --accent:#6b9dff;--accent-fg:#0e1013;
  --ok:#5fd18d;--ok-bg:#12291d;--warn:#e0b062;--warn-bg:#2b2213;
  --bad:#f08a8a;--bad-bg:#2c1717;--code:#1c2027;
}}
html{-webkit-text-size-adjust:100%}
body{
  margin:0;background:var(--bg);color:var(--fg);
  font:16px/1.6 system-ui,-apple-system,"Segoe UI",Roboto,Ubuntu,Cantarell,"Helvetica Neue",sans-serif;
  font-feature-settings:"kern","liga";text-rendering:optimizeLegibility;
}
.wrap{width:var(--w);margin-inline:auto}
a{color:var(--accent);text-decoration-thickness:1px;text-underline-offset:2px}
a:hover{text-decoration-thickness:2px}
h1,h2,h3,h4{line-height:1.25;font-weight:650;letter-spacing:-.011em;margin:0 0 .5rem}
h1{font-size:1.95rem;letter-spacing:-.021em}
h2{font-size:1.35rem;margin-top:2.5rem}
h3{font-size:1.08rem;margin-top:1.75rem}
p{margin:0 0 1rem}
code,kbd{font-family:ui-monospace,SFMono-Regular,"SF Mono",Menlo,Consolas,monospace;font-size:.88em}
code{background:var(--code);padding:.14em .38em;border-radius:4px}
pre{background:var(--code);padding:.85rem 1rem;border-radius:var(--radius);overflow-x:auto;margin:0 0 1rem;border:1px solid var(--line)}
pre code{background:none;padding:0;font-size:.85rem}
hr{border:0;border-top:1px solid var(--line);margin:2.5rem 0}

/* header */
.top{border-bottom:1px solid var(--line);background:var(--bg);position:sticky;top:0;z-index:10}
.top .wrap{display:flex;align-items:center;gap:1.25rem;height:3.5rem}
.brand{font-weight:670;color:var(--fg);text-decoration:none;letter-spacing:-.02em;font-size:1.02rem;white-space:nowrap}
.brand span{color:var(--accent)}
.nav{display:flex;gap:.1rem;margin-left:auto;flex-wrap:wrap}
.nav a{color:var(--muted);text-decoration:none;padding:.35rem .6rem;border-radius:6px;font-size:.9rem}
.nav a:hover{background:var(--card);color:var(--fg)}
.nav a[aria-current]{color:var(--fg);font-weight:600}

/* hero */
.hero{padding:3rem 0 1rem}
.hero p.lede{font-size:1.12rem;color:var(--muted);max-width:44rem;margin-bottom:.5rem}
.stamp{font-size:.83rem;color:var(--faint)}

/* build cards */
.builds{display:grid;gap:.85rem;margin:1.25rem 0 0;padding:0;list-style:none}
.build{border:1px solid var(--line);border-radius:var(--radius);background:var(--card);padding:1rem 1.15rem}
.build.pick{border-color:var(--accent);background:var(--raise);box-shadow:0 0 0 1px var(--accent)}
.build-head{display:flex;align-items:baseline;gap:.6rem;flex-wrap:wrap;margin-bottom:.15rem}
.build-head h3{margin:0;font-size:1.06rem}
.build-head h3 a{color:var(--fg);text-decoration:none}
.build-head h3 a:hover{color:var(--accent)}
.ver{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:.85rem;color:var(--muted)}
.by{font-size:.85rem;color:var(--faint);margin-left:auto}
.blurb{font-size:.92rem;color:var(--muted);margin:.35rem 0 .7rem;max-width:52rem}
.tags{display:flex;gap:.35rem;flex-wrap:wrap;margin-bottom:.75rem}
.tag{font-size:.74rem;font-weight:600;padding:.16rem .48rem;border-radius:99px;border:1px solid var(--line);color:var(--muted);background:var(--bg);white-space:nowrap}
.tag.ok{color:var(--ok);background:var(--ok-bg);border-color:transparent}
.tag.warn{color:var(--warn);background:var(--warn-bg);border-color:transparent}
.tag.bad{color:var(--bad);background:var(--bad-bg);border-color:transparent}

/* downloads */
.dl{display:flex;flex-wrap:wrap;gap:.45rem;align-items:center}
.btn{display:inline-flex;align-items:center;gap:.45rem;background:var(--accent);color:var(--accent-fg);
  text-decoration:none;font-size:.88rem;font-weight:600;padding:.44rem .85rem;border-radius:6px;border:1px solid transparent}
.btn:hover{filter:brightness(1.08)}
.btn.sec{background:transparent;color:var(--fg);border-color:var(--line)}
.btn.sec:hover{background:var(--card);filter:none;border-color:var(--muted)}
.btn small{font-weight:450;opacity:.75}
details.more{margin-top:.6rem}
details.more summary{font-size:.85rem;color:var(--muted);cursor:pointer;user-select:none}
details.more summary:hover{color:var(--fg)}
details.more[open] summary{margin-bottom:.6rem}
.hashes{margin-top:.7rem;font-size:.78rem;color:var(--faint);overflow-wrap:anywhere;line-height:1.5}
.hashes code{background:none;padding:0;color:var(--muted)}
.notes{margin:.7rem 0 0;padding-left:1.05rem;font-size:.86rem;color:var(--muted)}
.notes li{margin:.15rem 0}

/* tables */
.tw{overflow-x:auto;margin:0 0 1.25rem;border:1px solid var(--line);border-radius:var(--radius)}
table{border-collapse:collapse;width:100%;font-size:.9rem}
th,td{text-align:left;padding:.55rem .8rem;border-bottom:1px solid var(--line);white-space:nowrap}
thead th{background:var(--card);font-size:.78rem;text-transform:uppercase;letter-spacing:.04em;color:var(--muted);font-weight:650}
tbody tr:last-child td{border-bottom:0}
td.wrap-cell{white-space:normal;min-width:16rem}

/* chooser */
.chooser{display:grid;gap:.6rem;grid-template-columns:repeat(auto-fit,minmax(15.5rem,1fr));margin:1.25rem 0 0;padding:0;list-style:none}
.chooser li{border:1px solid var(--line);border-radius:var(--radius);padding:.85rem 1rem;background:var(--card)}
.chooser b{display:block;font-size:.93rem;margin-bottom:.2rem}
.chooser p{font-size:.87rem;color:var(--muted);margin:0 0 .5rem}
.chooser a{font-size:.88rem;font-weight:600}

/* callouts */
.note{border-left:3px solid var(--accent);background:var(--card);padding:.8rem 1rem;border-radius:0 var(--radius) var(--radius) 0;margin:0 0 1.25rem;font-size:.92rem}
.note.warn{border-color:var(--warn)}
.note p:last-child{margin-bottom:0}

/* prose */
.prose{max-width:44rem}
.prose ul,.prose ol{padding-left:1.3rem;margin:0 0 1rem}
.prose li{margin:.3rem 0}
.prose table{font-size:.88rem}
.toc{border:1px solid var(--line);border-radius:var(--radius);padding:.9rem 1.1rem;background:var(--card);margin:0 0 2rem}
.toc b{font-size:.8rem;text-transform:uppercase;letter-spacing:.04em;color:var(--muted)}
.toc ul{margin:.45rem 0 0;padding-left:1.1rem}
.toc li{margin:.2rem 0;font-size:.92rem}

/* misc */
.crumbs{font-size:.85rem;color:var(--faint);padding:1.1rem 0 0}
.crumbs a{color:var(--muted)}
.grid-links{display:grid;gap:.5rem;grid-template-columns:repeat(auto-fit,minmax(13rem,1fr));padding:0;list-style:none;margin:1rem 0 0}
.grid-links a{display:block;border:1px solid var(--line);border-radius:var(--radius);padding:.6rem .85rem;
  text-decoration:none;color:var(--fg);font-size:.92rem;font-weight:550;background:var(--card)}
.grid-links a:hover{border-color:var(--accent);color:var(--accent)}
.grid-links small{display:block;font-weight:400;color:var(--faint);font-size:.8rem;margin-top:.1rem}
footer{border-top:1px solid var(--line);margin-top:4rem;padding:1.75rem 0 2.5rem;font-size:.87rem;color:var(--muted)}
footer .cols{display:flex;gap:2.5rem;flex-wrap:wrap;margin-bottom:1.25rem}
footer h4{font-size:.78rem;text-transform:uppercase;letter-spacing:.04em;color:var(--faint);margin:0 0 .4rem}
footer ul{list-style:none;padding:0;margin:0}
footer li{margin:.22rem 0}
footer a{color:var(--muted)}
.skip{position:absolute;left:-9999px}
.skip:focus{left:.5rem;top:.5rem;background:var(--bg);padding:.5rem .8rem;border:1px solid var(--accent);border-radius:6px;z-index:20}
@media(max-width:640px){
  .hero{padding:2rem 0 .5rem}h1{font-size:1.6rem}
  .top .wrap{height:auto;padding:.6rem 0;flex-wrap:wrap;gap:.5rem}
  .nav{margin-left:0;width:100%}
  .by{margin-left:0;width:100%}
}
@media print{.top,footer,.btn{}}
`.trim();

export interface PageMeta {
  title: string;
  description: string;
  path: string;
  /** Extra JSON-LD graph nodes. */
  schema?: Record<string, unknown>[];
  crumbs?: { label: string; href?: string }[];
  /** Rendered into <head>; used for prev/next and feed links. */
  head?: string;
}

const NAV = [
  { label: "Windows", href: "/windows/" },
  { label: "macOS", href: "/macos/" },
  { label: "Linux", href: "/linux/" },
  { label: "Android", href: "/android/" },
  { label: "Builds", href: "/builds/" },
  { label: "Guides", href: "/docs/" },
];

function crumbSchema(crumbs: { label: string; href?: string }[]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.label,
      ...(c.href ? { item: abs(c.href) } : {}),
    })),
  };
}

export function layout(meta: PageMeta, body: string): string {
  const canonical = abs(meta.path);
  const graph: Record<string, unknown>[] = [
    {
      "@type": "WebSite",
      "@id": `${SITE.origin}/#website`,
      name: SITE.name,
      url: SITE.origin,
      description: SITE.description,
    },
    ...(meta.crumbs && meta.crumbs.length > 1 ? [crumbSchema(meta.crumbs)] : []),
    ...(meta.schema ?? []),
  ];

  const crumbsHtml =
    meta.crumbs && meta.crumbs.length > 1
      ? `<nav class="crumbs wrap" aria-label="Breadcrumb">${meta.crumbs
          .map((c, i) =>
            i === meta.crumbs!.length - 1
              ? `<span aria-current="page">${esc(c.label)}</span>`
              : `<a href="${url(c.href!)}">${esc(c.label)}</a> <span aria-hidden="true">/</span> `,
          )
          .join("")}</nav>`
      : "";

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(meta.title)}</title>
<meta name="description" content="${esc(meta.description)}">
<link rel="canonical" href="${canonical}">
<meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1">
<meta property="og:type" content="website">
<meta property="og:site_name" content="${esc(SITE.name)}">
<meta property="og:title" content="${esc(meta.title)}">
<meta property="og:description" content="${esc(meta.description)}">
<meta property="og:url" content="${canonical}">
<meta name="twitter:card" content="summary">
<meta name="twitter:title" content="${esc(meta.title)}">
<meta name="twitter:description" content="${esc(meta.description)}">
<meta name="theme-color" content="#0e1013" media="(prefers-color-scheme:dark)">
<meta name="theme-color" content="#ffffff" media="(prefers-color-scheme:light)">
<link rel="icon" href="${url("/favicon.svg")}" type="image/svg+xml">
<link rel="alternate" type="application/atom+xml" title="${esc(SITE.name)} release feed" href="${url("/feed.xml")}">
${meta.head ?? ""}
<style>${CSS}</style>
<script type="application/ld+json">${JSON.stringify({ "@context": "https://schema.org", "@graph": graph })}</script>
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
<header class="top">
  <div class="wrap">
    <a class="brand" href="${url("/")}">Chromium<span>Builds</span></a>
    <nav class="nav" aria-label="Primary">
      ${NAV.map(
        (n) =>
          `<a href="${url(n.href)}"${meta.path === n.href || (n.href !== "/" && meta.path.startsWith(n.href)) ? ' aria-current="page"' : ""}>${esc(n.label)}</a>`,
      ).join("")}
    </nav>
  </div>
</header>
${crumbsHtml}
<main id="main" class="wrap">
${body}
</main>
<footer>
  <div class="wrap">
    <div class="cols">
      <div>
        <h4>Platforms</h4>
        <ul>
          <li><a href="${url("/windows/")}">Chromium for Windows</a></li>
          <li><a href="${url("/macos/")}">Chromium for macOS</a></li>
          <li><a href="${url("/linux/")}">Chromium for Linux</a></li>
          <li><a href="${url("/android/")}">Chromium for Android</a></li>
          <li><a href="${url("/bsd/")}">Chromium for BSD</a></li>
        </ul>
      </div>
      <div>
        <h4>Start here</h4>
        <ul>
          <li><a href="${url("/docs/which-chromium-build/")}">Which build should I use?</a></li>
          <li><a href="${url("/docs/chromium-vs-chrome/")}">Chromium vs Chrome</a></li>
          <li><a href="${url("/docs/verify-your-download/")}">Verify a download</a></li>
          <li><a href="${url("/my-version/")}">What version am I on?</a></li>
          <li><a href="${url("/docs/")}">All guides</a></li>
        </ul>
      </div>
      <div>
        <h4>Project</h4>
        <ul>
          <li><a href="${url("/api/")}">JSON API</a></li>
          <li><a href="${url("/docs/chrlauncher/")}">chrlauncher setup</a></li>
          <li><a href="${url("/feed.xml")}">Release feed</a></li>
          <li><a href="${url("/about/")}">About this site</a></li>
          <li><a href="${SITE.repo}" rel="noopener">Source on GitHub</a></li>
        </ul>
      </div>
    </div>
    <p style="margin:0">
      Every download links straight to the maintainer's own release page. Nothing is mirrored or
      re-hosted here, and this site has no analytics, no cookies and no trackers.
      Chromium is a project of The Chromium Authors; this site is not affiliated with Google.
    </p>
  </div>
</footer>
</body>
</html>`;
}
