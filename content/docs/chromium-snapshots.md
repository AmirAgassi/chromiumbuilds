---
title: Official Chromium snapshots, and why they are not for daily use
description: What Google's automated Chromium builds are, how to download a specific revision, and why the project tells you not to browse with them.
group: How Chromium works
order: 24
---

Google publishes automated Chromium builds continuously, for essentially every commit to the main branch.
These are the closest thing to an official download, and the Chromium project is explicit that they are not
intended for general use.

## What they are

Every commit triggers a build, and the output is uploaded to public storage indexed by **revision number**,
a monotonically increasing counter of commits, rather than by version.

No testing has happened. The commit compiled; that is the entire guarantee. It might crash on startup, break
a core feature, or be perfectly fine, and nobody has checked which.

## What they lack

Everything discretionary, because these are raw build output:

- No proprietary codecs, so H.264 and AAC media will not play
- No Widevine, so no paid streaming
- No Google API keys, so no sign-in or sync
- No auto-update
- No installer; you get a zip you extract and run

## What they are genuinely good for

**Checking whether a bug is already fixed.** A bug is reported fixed upstream and you want to know if it
really is, before waiting weeks for it to reach stable.

**Bisecting a regression.** Something broke between two versions. Because snapshots exist per revision, you
can binary-search the exact commit that did it, which is the single most valuable thing they offer and why
the infrastructure exists.

**Testing against a future engine.** Web developers checking a change against Chromium before it ships.

## Downloading a specific revision

The current revision for a platform:

```
https://storage.googleapis.com/chromium-browser-snapshots/Win_x64/LAST_CHANGE
```

Then the build itself:

```
https://storage.googleapis.com/chromium-browser-snapshots/Win_x64/<revision>/chrome-win.zip
```

Platform paths are `Win_x64`, `Win_Arm64`, `Win`, `Mac`, `Mac_Arm`, `Linux_x64` and `Android`. This site
tracks all of them; the current snapshot for each appears on its platform page, and the
[JSON API](/api/) exposes the revision.

Note that not every revision exists for every platform. If a build failed or was skipped, step to a nearby
revision.

## Revisions and versions

Snapshot revisions are commit positions, not version numbers, so revision 1688399 tells you nothing about
whether that is Chromium 153 or 154. `chrome://version` in the running build will tell you, and
[how Chromium version numbers work](/docs/chromium-version-numbers/) explains the relationship.

## What to use instead

For daily browsing, any of the maintained builds on this site. They are compiled from tested release
branches, include the codecs, and come from people who check the result works before publishing.

Use a snapshot when you have a specific question about a specific revision. That is what it is for.

<!--faq
Q: Where can I download official Chromium?
A: Google publishes automated snapshot builds to its Chromium snapshot storage for every commit. They are untested and lack codecs, DRM and auto-update, so the project does not recommend them for general use.

Q: What is a Chromium revision number?
A: A revision is a commit position in Chromium's main branch, incrementing with each commit. Snapshots are indexed by revision rather than version, which is what makes bisecting a regression to a specific commit possible.

Q: Are Chromium snapshots safe?
A: They come directly from Google's build infrastructure, so their origin is trustworthy. They are simply untested, so an individual snapshot may be unstable or broken.
-->
