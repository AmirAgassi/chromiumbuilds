---
title: Which Chromium build should I use?
description: Chromium has no official download for end users. Here is what actually differs between the volunteer builds, and how to pick one in about a minute.
group: Start here
order: 1
---

Google publishes Chromium's source code, not a finished browser. There is no official "download Chromium"
button for ordinary users, and the closest thing, the automated snapshot, is explicitly not meant for daily use.

So people compile it themselves and share the result. Those builds are all genuinely Chromium, but the people
making them answer four questions differently, and those four answers are the entire decision.

## The four things that actually differ

**Does browser sign-in work?** Chromium needs Google API keys to talk to Google's sync servers. Builds that
ship keys let you sign in and sync bookmarks and passwords. Builds without them cannot, and ungoogled builds
remove the capability deliberately.

**Does ordinary web video play?** H.264 and AAC are patent-encumbered, so Google does not license them for
Chromium the way it does for Chrome. A build compiled without them will silently fail on a lot of video,
which people usually experience as "this site is broken" rather than "I am missing a codec".

**Does paid streaming work?** Netflix, Spotify, Amazon Prime and Disney+ need Widevine, Google's DRM module.
It is closed source, so a build either bundles it or it does not.

**Which CPU does it need?** Some maintainers compile for newer instruction sets like AVX2 to gain speed. The
result is faster on a modern processor and refuses to start on an older one.

## Pick by what you want

**You want Chrome without Google's branding, and everything to just work.**
Use [Hibbiki's build](/builds/hibbiki/). Sign-in works, video works, streaming works, and it tracks the Chrome
stable release closely. It is the least surprising option.

**You want nothing contacting Google, at all.**
Use [ungoogled-chromium](/builds/ungoogled-chromium/). Google service integration is stripped at the source
level rather than merely switched off. The trade is real: no sign-in, no bundled Widevine, and open codecs
only, so expect some video not to play.

**You want the privacy but you also want video to work.**
Use [Marmaduke's builds](/builds/marmaduke-windows/). Same ungoogled patches, but the proprietary codecs and
Widevine are kept. This is the usual answer for people who tried ungoogled-chromium and gave up on it.

**You want it as fast as your hardware allows.**
Use [Thorium](/builds/thorium/) or [RobRich's builds](/builds/robrich/). Both compile with aggressive
optimisation for specific CPU generations. Check what your processor supports first; pick AVX2 if your CPU is
newer than roughly 2013.

**You are on Windows 7, Vista or XP.**
Use [Supermium](/builds/supermium/). It backports a modern engine to Windows versions every other project
dropped years ago, and nothing else current will even install.

**You are checking whether a bug is already fixed upstream.**
Use an [official snapshot](/docs/chromium-snapshots/). It is the raw build-bot output for a single commit:
untested, no auto-update, no codecs, no DRM. Correct for bisecting a bug, wrong for browsing.

## Compare them directly

| Build | Sign-in and sync | H.264 / AAC | Widevine DRM | Notes |
| --- | --- | --- | --- | --- |
| Hibbiki | Yes | Yes, plus H.265 | Yes | Closest to Chrome |
| ungoogled-chromium | Removed | No | No | Strictest privacy |
| Marmaduke | Removed | Yes | Yes | Privacy with working media |
| Thorium | No | Yes, plus H.265 | Yes | Speed, needs a modern CPU |
| RobRich | No | Yes, plus H.265 | Yes | Development channel, very fast |
| Supermium | Yes | Yes | No | Runs on Windows XP and up |
| Official snapshot | No | No | No | Testing only |

## The one thing every build shares

**None of them update themselves.** Chrome's silent updater is a Chrome feature, not a Chromium one. Chromium
ships security fixes roughly every two weeks, so a build you installed and forgot about is the actual risk
here, far more than which maintainer you picked.

Decide now how you will keep it current: subscribe to the [release feed](/feed.xml), install through a package
manager that handles it for you, or put a recurring reminder somewhere. See
[updating Chromium](/docs/updating-chromium/).

<!--faq
Q: Which Chromium build is the safest to download?
A: Any build whose checksum you verify against the maintainer's own release page. Every build listed on this site links directly to the maintainer's GitHub release and shows the SHA-256 published there, so you can confirm the file is exactly what they built.

Q: What is the best Chromium build for privacy?
A: ungoogled-chromium removes Google web service integration at the source level, which is the strictest option. If you also need streaming video and sign-in to work, Marmaduke's builds apply the same patches but keep the proprietary codecs and Widevine.

Q: Do Chromium builds update automatically?
A: No. Automatic updating is part of Google Chrome, not Chromium. Almost every Chromium build requires you to download and install new versions yourself, which is why an old Chromium is a genuine security risk.
-->
