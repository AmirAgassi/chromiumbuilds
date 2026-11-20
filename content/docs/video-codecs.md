---
title: Video codecs in Chromium
description: Why some video plays and some does not, what H.264, AAC and H.265 have to do with patents, and how to tell what your build supports.
group: How Chromium works
order: 22
---

A page loads, the video player appears, and nothing plays. No useful error, just a black rectangle. Almost
always this is a missing codec, and the reason is patent licensing rather than anything technical.

## Free and encumbered codecs

Chromium always includes the royalty-free codecs: **VP8**, **VP9**, **AV1**, **Theora**, **Opus** and
**Vorbis**. YouTube uses these, which is why YouTube works in every build.

**H.264**, **AAC** and **H.265** are covered by patent pools that require licensing. Google licenses them for
Chrome as a product, but that licence does not extend to anyone else compiling Chromium. A maintainer
compiling with the proprietary codecs enabled is making a decision about their own exposure.

The result is that H.264 and AAC, still enormously common across the web, are present in some Chromium builds
and absent from others.

## What breaks without them

Video on many news sites and embedded players. Most MP4 files. AAC audio, which includes a good deal of
podcast and web radio. Some video calling. And frequently the video plays while the audio does not, or the
reverse, which is a confusing symptom pointing at exactly this cause.

## H.265 / HEVC

Newer, more efficient, more aggressively licensed. Chromium decodes it through the operating system or GPU
rather than in software, so it plays only where your hardware and OS support it. Any build compiled with the
proprietary codecs gets this automatically, including [Hibbiki](/builds/hibbiki/),
[Thorium](/builds/thorium/), [RobRich's](/builds/robrich/) and official
[ungoogled-chromium](/builds/ungoogled-chromium/). Builds carrying it are tagged **Codecs + H.265** on this
site.

Mostly relevant for local files and specialised streaming rather than everyday browsing.

## Which builds have what

Every build card shows either **Codecs** or **Open codecs only**. In summary: Hibbiki, Marmaduke, Thorium,
RobRich and official ungoogled-chromium compile the proprietary codecs in. Google's own snapshots ship open
codecs only.

If video fails in ungoogled-chromium, codecs are not the cause, since it has them. The usual culprit is a
DRM-protected stream, which needs Widevine: see [Widevine DRM](/docs/widevine-drm/).

## Checking what you have

Open:

```
chrome://media-internals
```

then play the failing video. The log names the codec it tried to use and why it failed.

For a direct answer, `chrome://gpu` lists hardware-accelerated decode support near the bottom.

## The libffmpeg swap

Some builds ship a codec-limited `libffmpeg` that can be replaced with a full one, and a few maintainers
publish the file separately. It sometimes works.

It is also a fragile arrangement: the library has to match the build's Chromium version, it breaks on every
update, and downloading a core media library from a third party is a meaningful trust decision. Installing a
build that already includes the codecs is better in essentially every respect.

<!--faq
Q: Why does video not play in Chromium?
A: The build is most likely compiled without the proprietary H.264 and AAC codecs, which are patent-encumbered and cannot be freely redistributed. Builds from Hibbiki, Marmaduke, Thorium, RobRich and official ungoogled-chromium include them.

Q: Why does YouTube work but other video sites do not?
A: YouTube serves the royalty-free VP9 and AV1 codecs that every Chromium build includes. Sites using H.264 need a build compiled with the proprietary codecs.

Q: Does Chromium support H.265 / HEVC?
A: In builds compiled with the proprietary codecs, and only where the operating system or GPU can decode it. Hibbiki, Thorium, RobRich and official ungoogled-chromium carry it and are tagged accordingly on this site.
-->
