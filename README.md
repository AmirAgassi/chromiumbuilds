# chromiumbuilds

an automatically maintained index of trusted chromium builds, built to replace
[chromium.woolyss.com](https://chromium.woolyss.com/) - which shuts down permanently on 31 august 2026
after nineteen years.

the builds themselves are fine, they all live on github. what the community loses is the one page that made
them findable, comparable and verifiable. this rebuilds that, with nothing hand-maintained.

## what it does

- reads every maintainer's release feed directly and normalises the result into one schema
- derives current/outdated status by comparing each build against upstream chromium stable, so nothing is
  labelled by hand and nothing silently rots
- publishes sha-256 checksums read from the release host itself, not computed here
- generates a static site, an atom feed, and a free json api
- never re-hosts a binary. every download link points at the maintainer's own release page

## sources

all read automatically, no scraping:

| source | what it provides |
| --- | --- |
| github releases api | hibbiki, macchrome (win/mac/linux/android), robrich999, ungoogled-software (win/mac/linux), gz83/thorium, win32ss/supermium |
| `storage.googleapis.com/chromium-browser-snapshots` | official per-commit snapshots for win/win-arm64/win32/mac/mac-arm/linux/android, plus the recent revision history behind `/chromium/` |
| `chromium.googlesource.com` | `chrome/VERSION` at a commit, the only place a snapshot's version string exists |
| chrome for testing version feed | current upstream stable, beta, dev and canary, with revisions |
| repology api | chromium and ungoogled-chromium versions across ~40 distributions |

the snapshot history bisects rather than polling: `chrome/VERSION` only increases along main, so the
version of every listed revision is found from a handful of boundary lookups instead of one request each.
asking per revision throttles and silently drops builds.

github's release api now returns a `digest` field per asset, which is where the checksums come from. that
removed the only part of this that would otherwise have needed downloading gigabytes of binaries.

## running it

```bash
bun install
bun run fetch      # hit every source, write data/manifest.json
bun run build      # generate dist/
bun run verify     # structural checks + HEAD every download url
bun run all        # fetch + build
```

`bun run verify --no-network` skips the download-url checks, which is what CI gates deploys on.

set `GITHUB_TOKEN` when fetching to avoid the unauthenticated rate limit.

## deployment

github actions rebuilds every three hours and deploys to github pages at
[chromiumbuilds.org](https://chromiumbuilds.org). `SITE_URL` and `BASE_PATH` are set in
[the workflow](.github/workflows/deploy.yml); the generator emits `CNAME` itself, so the custom domain
survives every rebuild.

a separate daily workflow runs the full verification including live download urls, so a maintainer moving
their assets surfaces as a failed check rather than a dead button.

## adding a build

everything about a project lives in one entry in [`src/sources.ts`](src/sources.ts): the repo, its traits
(sync, codecs, widevine), and regexes mapping release asset names to platform, architecture and package type.
add the entry and the site picks it up on the next run - pages, feed, api and sitemap included.

the traits are the only hand-written knowledge in the system, because no api exposes whether a build was
compiled with widevine. they change roughly never.

## structure

```
src/sources.ts   the source registry: repos, traits, asset classification rules
src/fetch.ts     hits every api, normalises, derives freshness, writes data/manifest.json
src/build.ts     generates every page, feed, sitemap and api endpoint
src/render.ts    build cards, badges, structured data
src/layout.ts    html shell, css, seo head
content/docs/    the reference guides, markdown with frontmatter
scripts/verify.ts post-build checks
```

## licence

MIT for this code. the builds it indexes belong to their respective maintainers, who do the actual work of
compiling, patching and publishing chromium for free. if one of their builds is useful to you, go star their
repository.
