---
title: How Chromium version numbers work
description: What each part of 152.0.7977.65 means, how revisions relate to versions, and how to tell whether your build is genuinely out of date.
group: How Chromium works
order: 25
---

A Chromium version looks like `152.0.7977.65`. Four numbers, and only two of them carry much meaning.

## The four parts

**Major (152).** The milestone. Increments every four weeks or so with a new release cycle. This is the number
that matters for judging whether a build is current.

**Minor (0).** Effectively always zero. A historical artefact.

**Build (7977).** The branch point, incrementing across the whole project. Every release from a given
milestone shares it, so `152.0.7977.65` and `152.0.7977.120` come from the same branch.

**Patch (65).** Increments with each fix released from that branch. Security updates move this number and
nothing else.

## What a version gap means

Comparing your build's major version against the current stable release tells you what you need to know:

- **Same major.** Current. You have this milestone's security fixes.
- **One behind.** Common for volunteer builds, since patches need rebasing. Usually acceptable, but you are
  missing the newest fixes.
- **Two or more behind.** You are missing at least a full cycle of published security fixes, on a browser that
  runs untrusted code constantly.

This site computes exactly that comparison, which is where the **Current**, **One version behind** and
**Outdated** labels come from. Nobody assigns them by hand.

## Revisions are a different thing

A revision, like `r1669021`, is a commit position in the main branch. It counts commits, not releases.

Versions describe releases from tested branches; revisions describe individual commits. They advance
independently, and a higher revision does not necessarily mean a newer release. [Snapshots](/docs/chromium-snapshots/)
are indexed by revision, which is what makes bisecting possible.

## Channels

Chromium flows through four channels: **canary** (daily, untested), **dev** (roughly weekly),
**beta** (next milestone, about four weeks ahead of stable) and **stable**.

Most builds on this site follow stable. [RobRich's](/builds/robrich/) follow the development channel, which
is why they carry a higher version than everything else and why they are labelled accordingly.

## Chromium and Chrome versions

They track together. Chrome 152 and Chromium 152 are the same milestone from the same source, and Chrome's
patch number may differ slightly because Google ships fixes on its own schedule.

So the current Chrome version is a reliable reference for what Chromium stable should be. This site reads it
from Google's own version feed rather than inferring it.

## Checking your version

`chrome://version` shows the full version, the revision it was built from, the command line and the profile
path. It is the single most useful diagnostic page in the browser.

The current upstream stable version is shown at the top of the [home page](/), and available in
[`upstream.json`](/api/v1/upstream.json) if you want to compare programmatically.

<!--faq
Q: What do the numbers in a Chromium version mean?
A: The first is the milestone, which increments roughly every four weeks. The second is always zero. The third identifies the release branch, and the fourth increments with each patch released from that branch, which is what security updates move.

Q: What is the difference between a Chromium version and a revision?
A: A version identifies a release from a tested branch. A revision is a commit position in the main branch, counting commits rather than releases. Snapshots are indexed by revision.

Q: How far behind is too far behind?
A: One milestone behind is common for volunteer builds and usually acceptable. Two or more means you are missing a full cycle of published security fixes and the build should be replaced.
-->
