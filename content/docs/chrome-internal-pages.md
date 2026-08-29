---
title: Chromium internal pages
description: The chrome:// pages that are genuinely useful for diagnosing problems, checking what your build includes, and understanding what the browser is doing.
group: Advanced
order: 31
---

Chromium exposes a large set of internal pages under the `chrome://` scheme. They cannot be linked to from a
web page by design, so you have to type them into the address bar.

`chrome://about` lists every one your build has.

## The ones that matter

**`chrome://version`** is the most useful page in the browser. Full version, the revision it was built from,
the complete command line it is running with, and the profile path. Nearly every diagnosis starts here, and
it is where you check whether your build is [out of date](/docs/chromium-version-numbers/).

**`chrome://components`** lists the updatable components, including **Widevine Content Decryption Module**.
If Widevine is absent here, [DRM video will not play](/docs/widevine-drm/).

**`chrome://gpu`** shows what is hardware accelerated and what has been blocklisted, and lists supported
video decode profiles near the bottom. First stop for rendering problems and for confirming
[codec support](/docs/video-codecs/).

**`chrome://media-internals`** logs media playback in detail. Open it, play the video that fails, and it will
name the codec and the reason.

**`chrome://net-export`** captures a network log for diagnosing connection failures. Note that the capture
contains your browsing during the session, so treat the file as sensitive.

**`chrome://policy`** shows enterprise policies in effect. Worth checking on a work machine when a setting is
greyed out or an extension cannot be removed.

**`chrome://system`** dumps a broad set of system diagnostics, useful when reporting a bug.

## Everyday ones

`chrome://settings`, `chrome://extensions`, `chrome://history`, `chrome://downloads`, `chrome://bookmarks`
and `chrome://newtab` all do what they say. `chrome://flags` is covered in
[command-line flags](/docs/command-line-flags/).

`chrome://password-manager` and `chrome://settings/clearBrowserData` are worth knowing as direct links, since
both are otherwise several clicks deep.

## Performance and debugging

**`chrome://discards`** shows which tabs Chromium has frozen or discarded to save memory, and lets you force
it. Useful for understanding why a background tab reloaded.

**`chrome://tracing`** records extremely detailed performance traces. Powerful and quite hard to read, but it
is the tool if you are chasing a real performance problem.

**`chrome://histograms`** exposes the internal metrics counters.

**`chrome://crashes`** lists local crash reports. On most Chromium builds crash reporting is not configured,
so this is frequently empty even after a crash.

## The ones that will crash the browser

Chromium ships deliberate crash pages for testing its own error handling: `chrome://crash`,
`chrome://kill`, `chrome://hang`, `chrome://gpuclean` and a few others. They do exactly what the name says,
immediately and with no confirmation. They are not harmful, but you will lose the tab or the browser.

## Build-specific pages

Forks add their own. Thorium and other forks expose pages covering their own settings, and
`chrome://about` in your build is the authoritative list of what actually exists rather than what a guide
written against a different build claims.

<!--faq
Q: What is the most useful chrome:// page?
A: chrome://version. It shows the exact version, the revision it was built from, the full command line in use and the profile path, which is the starting point for almost any diagnosis.

Q: How do I check if Widevine is installed in Chromium?
A: Open chrome://components and look for Widevine Content Decryption Module. If it is listed with a version number, it is present.

Q: How do I see all chrome:// pages?
A: Open chrome://about, which lists every internal page available in your specific build.
-->
