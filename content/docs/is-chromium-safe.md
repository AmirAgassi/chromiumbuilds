---
title: Is Chromium safe to download?
description: Chromium itself is safe. The risk is entirely about where you download a compiled build from, and how to tell a trustworthy source from a repackaged one.
group: Start here
order: 3
---

Chromium is Google's own open-source browser project, and the source code is safe by any reasonable measure.
It is one of the most heavily audited codebases in existence.

The risk is somewhere else: **Chromium's source is public, so anyone can compile it, add whatever they like,
and call the result Chromium.** Because there is no official download page for end users, people search the
web and install whatever the first result offers. That is genuinely how adware gets distributed.

## What a bad Chromium build looks like

Repackaged Chromium has been a malware delivery method for years. The usual signs:

- A download site that hosts the installer itself rather than linking to the developer's own release page.
- A "download manager" or "installer helper" wrapping the actual file.
- Bundled extras: a changed default search engine, a new-tab page you did not choose, a toolbar, a
  "PC optimiser".
- No checksum published, or one that does not match what you downloaded.
- A version number that does not correspond to any real Chromium release.

## What a good source looks like

- The download link points at the developer's own release host, normally a GitHub releases page.
- A SHA-256 checksum is published alongside the file.
- The build has a public source repository and a visible history of releases.
- The maintainer is identifiable and has been publishing for a long time.

Every build on this site meets all four. Downloads here link straight to the maintainer's GitHub release, and
the checksums shown are read from that release rather than generated here, so you can verify a file against
its publisher without having to trust this page.

## Verify before you run it

Checking a checksum takes about fifteen seconds and is the only step that actually proves anything. The
[download verification guide](/docs/verify-your-download/) has the exact command for Windows, macOS and Linux.

If a checksum does not match, do not run the file. It is far more likely you got a corrupted or intercepted
download than that the maintainer made a mistake.

## About antivirus warnings

Chromium builds trigger false positives fairly often, especially fresh ones from smaller maintainers. Two
unrelated causes:

**Code signing.** Signing certificates cost money, so volunteer builds are frequently unsigned. Windows
SmartScreen shows a warning for any unsigned installer regardless of content.

**Heuristics.** A browser legitimately does things malware also does: it injects into processes, spawns
sandboxed children, and writes executables. Heuristic engines flag that.

A single vendor flagging a file that matches its published checksum is almost always noise. Many vendors
flagging it, on a file whose checksum does not match, is not. Pasting the SHA-256 into VirusTotal will show
you which case you are in.

## The risk that actually matters

For most people it will not be a malicious build. It will be an old one.

Chromium ships security fixes roughly every two weeks, patching vulnerabilities that are public and, often,
already being exploited. A Chromium you installed eight months ago and never updated is carrying every one of
those. That is a far more realistic threat than a trojaned installer, and it is the reason this site marks
outdated builds instead of just listing them. See [updating Chromium](/docs/updating-chromium/).

<!--faq
Q: Is Chromium a virus?
A: No. Chromium is Google's legitimate open-source browser project. However, because anyone can compile and redistribute it, malicious repackaged versions do exist, so it matters that you download from the maintainer's own release page and verify the checksum.

Q: Why does my antivirus flag a Chromium build?
A: Usually because the installer is unsigned, since code signing certificates cost money that volunteer maintainers often do not spend, and because browsers perform actions that heuristic scanners associate with malware. If the file matches the published SHA-256 checksum, a single vendor flagging it is almost certainly a false positive.

Q: Is ungoogled-chromium safe?
A: Yes. It is a well-established open-source project with public source and a long release history. It removes Google service integration rather than adding anything, and its builds are published with checksums.
-->
