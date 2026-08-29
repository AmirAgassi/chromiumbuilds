---
title: Chromium vs Chrome
description: What Google actually adds when it turns Chromium into Chrome, feature by feature, and which of those pieces you can get back in a third-party build.
group: Start here
order: 2
---

Chromium is the open-source browser project. Chrome is Google's product built from it. Roughly 95 per cent of
the code is shared, so nearly everything you notice about using the browser is identical. The differences sit
around the edges, and most of them exist for licensing or business reasons rather than technical ones.

## What Chrome adds

**An automatic updater.** Chrome installs security fixes silently in the background. Chromium has no updater
at all. This is the single most consequential difference and the one people most often overlook.

**Widevine DRM.** Netflix, Spotify, Amazon Prime and Disney+ all require it. It is proprietary and closed
source, so official Chromium builds cannot ship it. Some third-party builds bundle it anyway.

**Proprietary media codecs.** H.264 and AAC are patent-encumbered. Google licenses them for Chrome, but that
licence does not extend to anyone compiling Chromium. Open Chromium builds therefore ship only the free
codecs, which is why some video appears broken.

**Google API keys.** Sign-in, sync, Safe Browsing lookups and translation all authenticate against Google
services with keys baked into the binary. Chromium builds without keys cannot use those services.

**Crash and usage reporting.** Chrome sends crash dumps and, if enabled, usage statistics to Google.

**A stable release process.** Chrome releases move through canary, dev, beta and stable with real testing at
each stage. Chromium's own automated builds get none of that.

## What Chromium keeps

Everything that makes the browser what it is: the Blink rendering engine, the V8 JavaScript engine, the
sandbox and site isolation, the extensions system and the Chrome Web Store, PDF viewing through PDFium, and
DevTools. A Chromium build feels like Chrome because architecturally it is Chrome.

## What third-party builds put back

This is the part that confuses people. "Chromium" is not one thing in practice, because the maintainers
listed on this site each restore a different subset:

- Codecs and Widevine are commonly compiled back in. Hibbiki, Marmaduke, Thorium and RobRich all do it.
- API keys are sometimes included, so sign-in works. Hibbiki and Supermium do this.
- Nobody adds an updater. That remains the real gap.

So "does Chromium play Netflix" has no single answer. It depends entirely on which build you downloaded, which
is why [picking the right one](/docs/which-chromium-build/) matters more than the Chromium-versus-Chrome
question itself.

## Which should you use?

Use Chrome if you want something that maintains itself and you do not mind Google's integrations.

Use a Chromium build if you want the same engine without Google's services attached, you want a portable
install that touches nothing on the system, or you specifically want an ungoogled variant. Accept in exchange
that keeping it updated is now your job.

<!--faq
Q: Is Chromium the same as Chrome?
A: They share the great majority of their code and the same rendering engine, so browsing feels identical. Chrome adds an automatic updater, Widevine DRM, the proprietary H.264 and AAC codecs, Google account integration and crash reporting on top of Chromium.

Q: Can Chromium play Netflix?
A: Only if the specific build includes Widevine DRM. Official Chromium builds do not, so Netflix will not play. Third-party builds from Hibbiki, Marmaduke and Thorium bundle Widevine and do work.

Q: Is Chromium faster than Chrome?
A: Not inherently, since they share an engine. Builds compiled for newer CPU instruction sets, such as Thorium or RobRich's, can be measurably faster than stock Chrome on hardware that supports them.
-->
