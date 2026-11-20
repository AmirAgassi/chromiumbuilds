import { SITE, abs, esc, url } from "./site";

export const CSS = `
/* ---------- tokens ---------- */
*,*::before,*::after{box-sizing:border-box}
:root{
  color-scheme:light;
  --bg:#f8f9fb;--surface:#fff;--surface-2:#f2f4f7;--sunken:#eef1f5;
  --fg:#0f1623;--muted:#475163;--faint:#5f6b7c;
  --line:#e3e7ed;--line-strong:#cdd3dc;
  --accent:#1a5fd6;--accent-hover:#154fb5;--accent-fg:#fff;--accent-soft:#edf3fe;--accent-line:#bcd2fa;
  --ok:#0c6b36;--ok-bg:#e5f5eb;--ok-line:#bfe6cd;
  --warn:#7f4d00;--warn-bg:#fdf1db;--warn-line:#f3d7a1;
  --bad:#a61b1b;--bad-bg:#fdeaea;--bad-line:#f4c4c4;
  --code-bg:#f1f3f6;--pre-bg:#f6f7f9;
  --shadow-sm:0 1px 2px rgba(15,22,35,.05);
  --shadow:0 1px 2px rgba(15,22,35,.04),0 4px 14px -4px rgba(15,22,35,.08);
  --shadow-lg:0 1px 2px rgba(15,22,35,.05),0 12px 32px -12px rgba(15,22,35,.18);
  --r-sm:6px;--r:10px;--r-lg:16px;
  --w:min(100% - 2.5rem,72rem);
  --sans:ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,Cantarell,"Noto Sans",Arial,sans-serif;
  --mono:ui-monospace,SFMono-Regular,"SF Mono",Menlo,"Cascadia Mono","Segoe UI Mono",Consolas,"Liberation Mono",monospace;
  --ease:cubic-bezier(.2,.7,.3,1);
}
@media (prefers-color-scheme:dark){:root{
  color-scheme:dark;
  --bg:#0b0d11;--surface:#12151b;--surface-2:#171b22;--sunken:#0f1217;
  --fg:#e8ebf0;--muted:#a5aebc;--faint:#8a94a3;
  --line:#232933;--line-strong:#323a46;
  --accent:#7eaaff;--accent-hover:#9dbdff;--accent-fg:#0b0d11;--accent-soft:#16213a;--accent-line:#2a3f6b;
  --ok:#74d6a0;--ok-bg:#0f2619;--ok-line:#1d4730;
  --warn:#efbd6a;--warn-bg:#2a1f0e;--warn-line:#4d3a17;
  --bad:#f59a9a;--bad-bg:#2c1414;--bad-line:#542525;
  --code-bg:#1b2029;--pre-bg:#0f1217;
  --shadow-sm:0 1px 2px rgba(0,0,0,.4);
  --shadow:0 1px 2px rgba(0,0,0,.35),0 6px 18px -6px rgba(0,0,0,.5);
  --shadow-lg:0 1px 2px rgba(0,0,0,.4),0 16px 40px -14px rgba(0,0,0,.7);
}}

/* ---------- base ---------- */
html{-webkit-text-size-adjust:100%;scroll-padding-top:5rem}
body{
  margin:0;background:var(--bg);color:var(--fg);
  font:16px/1.65 var(--sans);
  font-feature-settings:"kern","liga";text-rendering:optimizeLegibility;-webkit-font-smoothing:antialiased;
  overflow-wrap:break-word;
}
[hidden]{display:none!important}
.sr-only{position:absolute!important;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;border:0}
.wrap{width:var(--w);margin-inline:auto}
a{color:var(--accent);text-decoration-line:underline;text-decoration-color:color-mix(in srgb,var(--accent) 35%,transparent);
  text-decoration-thickness:1px;text-underline-offset:3px;transition:color .15s,text-decoration-color .15s}
a:hover{color:var(--accent-hover);text-decoration-color:currentColor}
:focus-visible{outline:2px solid var(--accent);outline-offset:2px;border-radius:4px}
h1,h2,h3,h4{line-height:1.2;font-weight:680;letter-spacing:-.015em;margin:0 0 .6rem;color:var(--fg);text-wrap:balance}
h1{font-size:clamp(2rem,1.45rem + 2vw,2.85rem);letter-spacing:-.03em;font-weight:740;line-height:1.08}
h2{font-size:clamp(1.3rem,1.15rem + .5vw,1.55rem);margin-top:3.5rem;letter-spacing:-.022em}
h3{font-size:1.1rem;margin-top:2rem}
h4{font-size:.95rem}
p{margin:0 0 1rem}
b,strong{font-weight:650}
code,kbd,pre{font-family:var(--mono)}
code{font-size:.86em;background:var(--code-bg);padding:.12em .4em;border-radius:5px;border:1px solid var(--line)}
pre{background:var(--pre-bg);border:1px solid var(--line);border-radius:var(--r);padding:1rem 1.15rem;overflow-x:auto;margin:0 0 1.25rem;
  font-size:.84rem;line-height:1.6;tab-size:2}
pre code{background:none;border:0;padding:0;font-size:inherit}
hr{border:0;border-top:1px solid var(--line);margin:3rem 0}
::selection{background:color-mix(in srgb,var(--accent) 25%,transparent)}
.blurb{color:var(--muted);max-width:46rem}
.stamp{font-size:.84rem;color:var(--faint);margin:0}
p.stamp::before{content:"";display:inline-block;vertical-align:.08em;margin:0 .6rem 0 .15rem;width:.5rem;height:.5rem;border-radius:50%;background:var(--ok);
  box-shadow:0 0 0 3px color-mix(in srgb,var(--ok) 20%,transparent)}
.stamp a{color:inherit}

/* ---------- header ---------- */
.skip{position:absolute;left:-9999px;top:.5rem;z-index:50}
.skip:focus{left:.75rem;background:var(--surface);color:var(--fg);padding:.55rem .9rem;border:1px solid var(--accent);border-radius:var(--r-sm);box-shadow:var(--shadow)}
.top{position:sticky;top:0;z-index:20;background:color-mix(in srgb,var(--bg) 82%,transparent);
  -webkit-backdrop-filter:saturate(1.6) blur(14px);backdrop-filter:saturate(1.6) blur(14px);border-bottom:1px solid var(--line)}
.top .wrap{display:flex;align-items:center;gap:1.5rem;min-height:3.75rem}
.brand{display:inline-flex;align-items:center;gap:0;font-weight:720;color:var(--fg);text-decoration:none;letter-spacing:-.02em;font-size:1.05rem;white-space:nowrap}
.brand:hover{color:var(--fg)}
.brand span{color:var(--accent);margin-left:.28em}
.brand img{width:24px;height:24px;display:block;margin-right:.55rem}
.nav{display:flex;gap:.15rem;margin-left:auto}
.nav a{color:var(--muted);text-decoration:none;padding:.42rem .7rem;border-radius:999px;font-size:.9rem;font-weight:520;white-space:nowrap;transition:background .15s,color .15s}
.nav a:hover{background:var(--surface-2);color:var(--fg)}
.nav a[aria-current]{color:var(--fg);background:var(--surface);box-shadow:inset 0 0 0 1px var(--line),var(--shadow-sm);font-weight:620}

/* ---------- breadcrumbs ---------- */
.crumbs{display:flex;flex-wrap:wrap;align-items:center;gap:.4rem;font-size:.84rem;color:var(--faint);padding-top:1.5rem}
.crumbs a{color:var(--muted);text-decoration:none}
.crumbs a:hover{color:var(--accent);text-decoration:underline}
.crumbs [aria-hidden]{color:var(--line-strong)}
.crumbs [aria-current]{color:var(--fg);font-weight:550}

/* ---------- hero ---------- */
.hero{padding:2rem 0 .5rem}
.hero h1{margin-bottom:.85rem}
.hero .lede,.hero p.lede{font-size:clamp(1.03rem,.98rem + .25vw,1.16rem);line-height:1.6;color:var(--muted);max-width:46rem;margin-bottom:1.1rem}
.hero.home{position:relative;margin-top:1.75rem;padding:clamp(1.75rem,1.2rem + 3vw,3.25rem);border:1px solid var(--line);border-radius:var(--r-lg);
  background:radial-gradient(120% 140% at 100% 0%,var(--accent-soft) 0%,transparent 55%),var(--surface);box-shadow:var(--shadow);overflow:hidden}
.hero.home h1{font-size:clamp(2.2rem,1.5rem + 3vw,3.4rem)}
.eyebrow{display:inline-block;font-size:.76rem;font-weight:650;letter-spacing:.08em;text-transform:uppercase;color:var(--accent);margin-bottom:.75rem}
.platforms{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:.65rem;margin:1.75rem 0 0;padding:0;list-style:none}
.platforms a{display:flex;flex-direction:column;gap:.15rem;padding:.9rem 1rem;border:1px solid var(--line);border-radius:var(--r);background:var(--bg);
  color:var(--fg);text-decoration:none;font-weight:650;font-size:1rem;transition:border-color .15s,box-shadow .15s,transform .15s var(--ease)}
.platforms a::after{content:"Download \\2192";font-size:.8rem;font-weight:600;color:var(--accent);margin-top:.35rem}
.platforms a:hover{border-color:var(--accent-line);box-shadow:var(--shadow);transform:translateY(-1px)}
.platforms small{font-weight:450;font-size:.8rem;color:var(--faint);line-height:1.45}
.platforms small.v{font-family:var(--mono);font-size:.75rem;letter-spacing:-.02em;overflow-wrap:anywhere}
.hero-foot{margin-top:1.4rem}

/* ---------- section helpers ---------- */
.section-head{display:flex;align-items:baseline;justify-content:space-between;gap:1rem;flex-wrap:wrap}
.section-head h2{margin-bottom:.4rem}
.jump{display:flex;flex-wrap:wrap;gap:.4rem;margin:1.25rem 0 0;padding:0;list-style:none}
.jump a{display:inline-block;font-size:.84rem;font-weight:560;padding:.32rem .75rem;border:1px solid var(--line);border-radius:999px;
  background:var(--surface);color:var(--muted);text-decoration:none}
.jump a:hover{border-color:var(--accent-line);color:var(--accent)}
.detect{margin-top:2.5rem}
.detect > h2{margin-top:0}

/* ---------- badges ---------- */
.tags{display:flex;gap:.35rem;flex-wrap:wrap;margin:0 0 1rem}
.tag{display:inline-flex;align-items:center;gap:.35rem;font-size:.75rem;font-weight:600;line-height:1.3;padding:.2rem .55rem;border-radius:999px;
  border:1px solid var(--line);color:var(--muted);background:var(--surface-2);white-space:nowrap}
.tag.ok{color:var(--ok);background:var(--ok-bg);border-color:var(--ok-line)}
.tag.warn{color:var(--warn);background:var(--warn-bg);border-color:var(--warn-line)}
.tag.bad{color:var(--bad);background:var(--bad-bg);border-color:var(--bad-line)}
.tag.status::before{content:"";width:.42rem;height:.42rem;border-radius:50%;background:currentColor}
.tag.status{font-weight:650}

/* ---------- build cards ---------- */
.builds{display:grid;gap:1rem;margin:1.25rem 0 0;padding:0;list-style:none}
.build{position:relative;border:1px solid var(--line);border-radius:var(--r-lg);background:var(--surface);padding:1.25rem 1.4rem 1.15rem;box-shadow:var(--shadow-sm)}
.build.pick{border-color:var(--accent-line);box-shadow:0 0 0 1px var(--accent-line),var(--shadow)}
.pick-label{position:absolute;top:-.7rem;left:1.15rem;font-size:.7rem;font-weight:700;letter-spacing:.06em;text-transform:uppercase;
  background:var(--accent);color:var(--accent-fg);padding:.2rem .6rem;border-radius:999px}
.build-head{display:flex;align-items:flex-start;justify-content:space-between;gap:.4rem 1.25rem;flex-wrap:wrap;margin-bottom:.55rem}
.build-title{display:flex;align-items:baseline;flex-wrap:wrap;gap:.25rem .65rem;min-width:0}
.build-head h3{margin:0;font-size:1.15rem;letter-spacing:-.018em}
.build-head h3 a{color:var(--fg);text-decoration:none}
.build-head h3 a:hover{color:var(--accent)}
.ver{font-family:var(--mono);font-size:.82rem;color:var(--muted);letter-spacing:-.01em}
.ver.chip{background:var(--surface-2);border:1px solid var(--line);padding:.08rem .45rem;border-radius:6px;color:var(--fg)}
.arch{font-size:.8rem;font-weight:600;color:var(--faint)}
.by{font-size:.84rem;color:var(--faint);white-space:nowrap}
.by b{color:var(--muted);font-weight:560}
.blurb-card,.build .blurb{font-size:.93rem;color:var(--muted);margin:0 0 .85rem;max-width:54rem}
.build-actions{border-top:1px solid var(--line);margin:0 -1.4rem;padding:1rem 1.4rem 0}

/* ---------- buttons and downloads ---------- */
.dl{display:flex;flex-wrap:wrap;gap:.5rem;align-items:center}
.btn{display:inline-flex;align-items:center;gap:.5rem;background:var(--accent);color:var(--accent-fg);text-decoration:none;font-size:.9rem;font-weight:620;
  line-height:1.2;padding:.6rem 1rem;border-radius:var(--r-sm);border:1px solid transparent;box-shadow:var(--shadow-sm);
  transition:background .15s,border-color .15s,box-shadow .15s,transform .15s var(--ease)}
.btn:hover{background:var(--accent-hover);color:var(--accent-fg);transform:translateY(-1px);box-shadow:var(--shadow)}
.btn:active{transform:none}
.btn svg{width:1rem;height:1rem;flex:none}
.btn small{font-weight:500;font-size:.78rem;opacity:.8;font-family:var(--mono);letter-spacing:-.01em}
.btn.sec{background:var(--surface);color:var(--fg);border-color:var(--line-strong);box-shadow:none}
.btn.sec:hover{background:var(--surface-2);border-color:var(--faint);color:var(--fg)}
.btn.sec small{color:var(--faint);opacity:1}
.btn.big{font-size:1rem;padding:.75rem 1.25rem}
details.more{margin-top:.85rem}
details.more summary{display:inline-flex;align-items:center;gap:.45rem;font-size:.86rem;font-weight:550;color:var(--muted);cursor:pointer;user-select:none;list-style:none;border-radius:4px}
details.more summary::-webkit-details-marker{display:none}
details.more summary::before{content:"";width:.45rem;height:.45rem;border-right:1.5px solid currentColor;border-bottom:1.5px solid currentColor;
  transform:rotate(-45deg);transition:transform .15s;margin-right:.1rem}
details.more[open] > summary::before{transform:rotate(45deg) translate(-2px,-1px)}
details.more summary:hover{color:var(--fg)}
details.more[open] > summary{margin-bottom:.75rem}
.builds details.more > .builds{margin-top:0}
.hashes{display:grid;gap:.55rem;font-size:.78rem;color:var(--faint);line-height:1.45;background:var(--sunken);border:1px solid var(--line);border-radius:var(--r-sm);padding:.75rem .9rem}
.hashes div{min-width:0}
.hashes code{display:block;background:none;border:0;padding:0;color:var(--fg);font-size:.76rem;overflow-wrap:anywhere;word-break:break-all}
.notes{margin:.5rem 0 0;padding-left:1.15rem;font-size:.9rem;color:var(--muted)}
.notes li{margin:.3rem 0}
.notes li::marker{color:var(--faint)}

/* ---------- official snapshot cards ---------- */
.build h4{margin:1.5rem 0 .35rem;font-size:.95rem}
.facts{display:grid;grid-template-columns:max-content 1fr;gap:.4rem 1.25rem;margin:.25rem 0 1.15rem;font-size:.88rem;
  background:var(--sunken);border:1px solid var(--line);border-radius:var(--r);padding:.85rem 1rem}
.facts dt{color:var(--faint);font-weight:550}
.facts dd{margin:0;font-family:var(--mono);font-size:.84rem;overflow-wrap:anywhere;min-width:0}
.revs{border:1px solid var(--line);border-radius:var(--r);background:var(--surface);overflow:hidden}
.revs.scroll{max-height:18rem;overflow-y:auto}
.revs ol{margin:0;padding:0;list-style:none}
.revs li{display:flex;flex-wrap:wrap;gap:.25rem .9rem;align-items:baseline;padding:.5rem .9rem;font-size:.85rem;border-bottom:1px solid var(--line)}
.revs li:nth-child(even){background:var(--surface-2)}
.revs li:last-child{border-bottom:0}
.revs time{color:var(--faint);white-space:nowrap}
.revs .mst{font-weight:700;min-width:2.2rem;font-variant-numeric:tabular-nums}
.revs .rv{font-family:var(--mono);font-size:.8rem;color:var(--muted)}
.revs a{white-space:nowrap;font-size:.84rem}
.revs a:nth-last-of-type(2){margin-left:auto;font-family:var(--mono);font-size:.78rem;color:var(--faint)}
.revs a:last-of-type{font-weight:600}

/* ---------- tables ---------- */
.tw{overflow-x:auto;margin:1rem 0 1.5rem;border:1px solid var(--line);border-radius:var(--r);background:var(--surface);box-shadow:var(--shadow-sm);
  max-width:100%;-webkit-overflow-scrolling:touch}
table{border-collapse:collapse;width:100%;font-size:.9rem}
th,td{text-align:left;padding:.7rem 1rem;border-bottom:1px solid var(--line);white-space:nowrap;vertical-align:top}
thead th{background:var(--surface-2);font-size:.72rem;text-transform:uppercase;letter-spacing:.07em;color:var(--faint);font-weight:680;padding-block:.6rem}
tbody tr:last-child td{border-bottom:0}
tbody tr{transition:background .12s}
tbody tr:hover{background:color-mix(in srgb,var(--surface-2) 70%,transparent)}
td a{font-weight:560}
td code{font-size:.82rem}
td.wrap-cell{white-space:normal;min-width:16rem}
.tw table td:first-child{font-weight:560}

/* ---------- chooser ---------- */
.chooser{display:grid;gap:.85rem;grid-template-columns:repeat(auto-fill,minmax(min(100%,17.5rem),1fr));margin:1.5rem 0 0;padding:0;list-style:none}
.chooser li{position:relative;display:flex;flex-direction:column;border:1px solid var(--line);border-radius:var(--r-lg);padding:1.15rem 1.2rem 1.05rem;
  background:var(--surface);box-shadow:var(--shadow-sm);transition:border-color .15s,box-shadow .15s,transform .15s var(--ease)}
.chooser li:hover{border-color:var(--accent-line);box-shadow:var(--shadow);transform:translateY(-2px)}
.chooser li:focus-within{border-color:var(--accent)}
.chooser b{display:block;font-size:1rem;line-height:1.35;margin-bottom:.4rem;letter-spacing:-.01em}
.chooser p{font-size:.88rem;color:var(--muted);margin:0 0 1rem;flex:1}
.chooser a{font-size:.88rem;font-weight:650;text-decoration:none}
.chooser a::after{content:"";position:absolute;inset:0;border-radius:inherit}
.chooser a:focus-visible{outline:none}

/* ---------- link tiles ---------- */
.grid-links{display:grid;gap:.65rem;grid-template-columns:repeat(auto-fill,minmax(min(100%,14rem),1fr));padding:0;list-style:none;margin:1.25rem 0 0}
.grid-links a{display:flex;flex-direction:column;justify-content:center;gap:.2rem;height:100%;border:1px solid var(--line);border-radius:var(--r);padding:.85rem 1rem;
  text-decoration:none;color:var(--fg);font-size:.95rem;font-weight:620;background:var(--surface);box-shadow:var(--shadow-sm);
  transition:border-color .15s,box-shadow .15s,color .15s}
.grid-links a:hover{border-color:var(--accent-line);color:var(--accent);box-shadow:var(--shadow)}
.grid-links small{display:block;font-weight:430;color:var(--faint);font-size:.8rem;line-height:1.45}

/* ---------- callouts ---------- */
.note{border:1px solid var(--accent-line);background:var(--accent-soft);padding:.95rem 1.15rem;border-radius:var(--r);margin:1.5rem 0;font-size:.93rem;color:var(--fg)}
.note.warn{border-color:var(--warn-line);background:var(--warn-bg)}
.note p:last-child,.note ul:last-child{margin-bottom:0}
.note .notes{color:var(--fg)}

/* ---------- faq ---------- */
.faq{display:grid;gap:.6rem;margin-top:1.25rem}
.faq-item{border:1px solid var(--line);border-radius:var(--r);background:var(--surface);padding:1.05rem 1.2rem}
.faq-item h3{margin:0 0 .4rem;font-size:1rem}
.faq-item p{margin:0;font-size:.93rem;color:var(--muted)}
.more-link{margin-top:1.25rem;font-weight:600}
.more-link a{text-decoration:none}

/* ---------- prose ---------- */
.prose{max-width:46rem}
.prose > h2{padding-top:.25rem}
.prose h2 + p,.prose h3 + p{margin-top:0}
.prose p,.prose li{color:color-mix(in srgb,var(--fg) 88%,var(--muted))}
.prose ul,.prose ol{padding-left:1.35rem;margin:0 0 1.15rem}
.prose li{margin:.4rem 0}
.prose li::marker{color:var(--faint)}
.prose blockquote{margin:1.25rem 0;padding:.25rem 0 .25rem 1.1rem;border-left:3px solid var(--line-strong);color:var(--muted)}
.prose table{font-size:.88rem}
.prose .tw td{white-space:normal;min-width:8rem}
.prose img{max-width:100%;height:auto}
.toc{border:1px solid var(--line);border-radius:var(--r);padding:1rem 1.15rem;background:var(--surface);margin:0 0 2rem;font-size:.9rem}
.toc b{display:block;font-size:.72rem;text-transform:uppercase;letter-spacing:.08em;color:var(--faint);font-weight:680}
.toc ul{margin:.6rem 0 0;padding:0;list-style:none;border-left:1px solid var(--line)}
.toc li{margin:0}
.toc a{display:block;padding:.28rem 0 .28rem .85rem;margin-left:-1px;border-left:1px solid transparent;color:var(--muted);text-decoration:none;line-height:1.4}
.toc a:hover{color:var(--accent);border-left-color:var(--accent)}
.doc{display:block}
@media (min-width:1080px){
  .doc{display:grid;grid-template-columns:minmax(0,46rem) 15rem;gap:4rem;align-items:start}
  .doc .toc-wrap{grid-column:2;grid-row:1;position:sticky;top:5.25rem}
  .doc .prose{grid-column:1;grid-row:1}
  .doc .toc{background:none;border:0;padding:0;margin:0}
}

/* ---------- footer ---------- */
footer{border-top:1px solid var(--line);margin-top:5rem;padding:3rem 0 2.5rem;font-size:.88rem;color:var(--muted);background:var(--surface)}
footer .cols{display:grid;grid-template-columns:1.4fr repeat(3,1fr);gap:2rem;margin-bottom:2.25rem}
footer .about-col p{margin:.6rem 0 0;max-width:18rem;color:var(--faint);font-size:.86rem}
footer h4{font-size:.72rem;text-transform:uppercase;letter-spacing:.08em;color:var(--faint);margin:0 0 .75rem;font-weight:680}
footer ul{list-style:none;padding:0;margin:0}
footer li{margin:.4rem 0}
footer a{color:var(--muted);text-decoration:none}
footer a:hover{color:var(--accent);text-decoration:underline}
footer .legal{margin:0;padding-top:1.5rem;border-top:1px solid var(--line);font-size:.82rem;color:var(--faint)}

/* ---------- responsive ---------- */
@media (max-width:900px){
  .platforms{grid-template-columns:repeat(2,minmax(0,1fr))}
  footer .cols{grid-template-columns:repeat(3,1fr)}
  footer .about-col{grid-column:1/-1}
}
@media (max-width:760px){
  .top .wrap{flex-wrap:wrap;gap:0;min-height:0;padding-top:.6rem}
  .nav{order:2;width:calc(100% + 2.5rem);margin:0 -1.25rem;padding:.4rem 1.25rem .55rem;overflow-x:auto;scrollbar-width:none;
    -webkit-mask-image:linear-gradient(90deg,transparent 0,#000 1.25rem,#000 calc(100% - 1.75rem),transparent)}
  .nav::-webkit-scrollbar{display:none}
}
@media (max-width:640px){
  :root{--w:calc(100% - 2rem)}
  .nav{width:calc(100% + 2rem);margin:0 -1rem;padding-inline:1rem}
  h2{margin-top:2.75rem}
  .hero.home{margin-top:1rem;padding:1.5rem 1.25rem}
  .platforms{gap:.5rem}
  .platforms a{padding:.75rem .85rem}
  .build{padding:1.1rem 1rem 1rem}
  .build-actions{margin:0 -1rem;padding:.9rem 1rem 0}
  .build-head{flex-direction:column}
  .by{white-space:normal}
  .dl .btn{flex:1 1 auto;justify-content:center}
  .facts{grid-template-columns:1fr;gap:.1rem}
  .facts dd{margin-bottom:.45rem}
  footer .cols{grid-template-columns:1fr 1fr}
  th,td{padding:.6rem .8rem}
}
@media (prefers-reduced-motion:reduce){
  *,*::before,*::after{transition:none!important;animation:none!important;scroll-behavior:auto!important}
  .btn:hover,.chooser li:hover,.platforms a:hover{transform:none}
}
@media print{
  .top,footer,.skip,.jump{display:none}
  body{background:#fff;color:#000}
  .build,.tw,.note{box-shadow:none}
}
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
  { label: "Official", href: "/chromium/" },
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
<meta name="theme-color" content="#0b0d11" media="(prefers-color-scheme:dark)">
<meta name="theme-color" content="#f8f9fb" media="(prefers-color-scheme:light)">
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
    <a class="brand" href="${url("/")}"><img src="${url("/favicon.svg")}" alt="" width="24" height="24" decoding="async">Chromium<span>Builds</span></a>
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
      <div class="about-col">
        <a class="brand" href="${url("/")}"><img src="${url("/favicon.svg")}" alt="" width="24" height="24" decoding="async" loading="lazy">Chromium<span>Builds</span></a>
        <p>${esc(SITE.tagline)} Read automatically from each maintainer's own releases. Nothing re-hosted, nothing tracked.</p>
      </div>
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
    <p class="legal">
      Chromium is a project of The Chromium Authors; this site is not affiliated with Google.
    </p>
  </div>
</footer>
</body>
</html>`;
}
