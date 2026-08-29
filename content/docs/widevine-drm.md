---
title: Widevine DRM in Chromium
description: Why Netflix, Spotify and Prime Video fail in some Chromium builds, what Widevine is, and which builds include it.
group: How Chromium works
order: 21
---

You install Chromium, open Netflix, and get an error about your browser not being supported. Nothing is
broken. The build simply does not include Widevine.

## What it is

Widevine is Google's DRM system. Paid streaming services require it before they will send you video, and it
implements the Encrypted Media Extensions the web standard defines for exactly this purpose.

It is closed source. Google distributes it as a compiled binary module, and the licence does not allow it to
be redistributed freely. That is why an open-source browser project cannot simply bundle it.

## Which services need it

Netflix, Spotify's web player, Amazon Prime Video, Disney+, HBO Max, and most other paid streaming. YouTube
does not, nor does most ordinary web video, which is why the problem seems to appear out of nowhere on one
specific site.

## Which builds include it

| Build | Widevine |
| --- | --- |
| [Hibbiki](/builds/hibbiki/) | Yes |
| [Marmaduke](/builds/marmaduke-windows/) | Yes |
| [Thorium](/builds/thorium/) | Yes |
| [RobRich](/builds/robrich/) | Yes |
| [ungoogled-chromium](/builds/ungoogled-chromium/) | No, can be added manually |
| [Supermium](/builds/supermium/) | No |
| [Official snapshots](/docs/chromium-snapshots/) | No |

Every build card on this site shows a Widevine tag, so you can check before downloading rather than after.

## Levels, and why quality is capped

Widevine defines three security levels. **L1** performs decryption in hardware and is required for HD and 4K.
**L3** does it in software. Desktop Chromium and Chrome are generally L3, which is why Netflix caps browser
playback at 720p on most desktops while a smart TV or phone plays 4K.

This is not a Chromium limitation and switching builds will not change it. If you want 4K Netflix on a
desktop, that is a Microsoft Edge and Windows-specific arrangement, not something Chromium can offer.

## Adding it to a build that lacks it

It is possible, by copying the Widevine module out of an installed Chrome or a build that has it. The
ungoogled-chromium project documents the process, and on Linux it also needs the `--enable-widevine` flag.

Two caveats worth taking seriously. The Widevine module and the browser want to be on matching major versions,
so this breaks every time you update either one. And you are copying a proprietary component out of one
product into another, which the licence does not contemplate.

For most people the better answer is to use a build that ships it. [Marmaduke's builds](/builds/marmaduke-windows/)
exist precisely for this case: ungoogled patches, but Widevine and the codecs kept.

## Checking whether you have it

Open `chrome://components` and look for **Widevine Content Decryption Module**. If it is listed with a version
number, you have it. If it is absent, you do not.

`chrome://media-internals` will show the specific failure when a protected stream refuses to play.

<!--faq
Q: Why does Netflix not work in Chromium?
A: Netflix requires Widevine DRM, which is proprietary and cannot be bundled with open-source Chromium builds. Use a build that includes it, such as Hibbiki, Marmaduke or Thorium.

Q: How do I know if my Chromium has Widevine?
A: Open chrome://components and look for Widevine Content Decryption Module. If it appears with a version number, the module is present.

Q: Why is Netflix limited to 720p in Chromium?
A: Desktop browsers generally implement Widevine security level L3, and streaming services reserve HD and 4K for the hardware-backed L1 level. This affects Chrome as well and is not specific to Chromium.
-->
