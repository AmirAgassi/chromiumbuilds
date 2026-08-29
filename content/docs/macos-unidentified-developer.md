---
title: Opening Chromium on macOS when it says it cannot be opened
description: Why macOS blocks third-party Chromium builds on first launch, and the correct way to open one without disabling Gatekeeper entirely.
group: Installing and updating
order: 15
---

You download a Chromium build, double-click it, and macOS refuses:

> "Chromium" cannot be opened because Apple cannot check it for malicious software.

Or, on a build that is not signed at all:

> "Chromium" is damaged and can't be opened. You should move it to the Bin.

Nothing is damaged. This is Gatekeeper, and it is doing what it is supposed to do.

## Why it happens

Apple notarisation requires a paid Apple Developer account and a submission process for every build. Volunteer
Chromium maintainers publishing free builds generally do not do this, so their applications arrive
un-notarised and macOS blocks them by default.

The "damaged" wording is misleading and has confused people for years. It usually just means the quarantine
attribute is set on an application with no valid signature.

## The correct way to open it

**Right-click the application and choose Open,** then click Open in the dialog that appears.

That is the entire fix. Right-clicking uses a different code path from double-clicking: it offers you an
override, where double-clicking simply refuses. You only need to do it once per application.

If Open does not appear in the dialog, go to **System Settings, Privacy & Security**, scroll down, and there
will be a message about the blocked application with an **Open Anyway** button.

## If it still refuses

On recent macOS versions, particularly for downloaded `.dmg` and `.zip` files, you may need to clear the
quarantine attribute directly:

```bash
xattr -dr com.apple.quarantine /Applications/Chromium.app
```

That removes the flag macOS attaches to downloaded files. Run it on the application you actually intend to
open, and understand what you are doing: you are telling macOS you vouch for this specific application.

**Verify the checksum first.** This step removes a protection, so it should only ever follow confirming the
file matches what the maintainer published. See [verify your download](/docs/verify-your-download/).

## What not to do

Do not disable Gatekeeper globally with `spctl --master-disable`. It turns the protection off for everything
you will ever download, to solve a problem that has a per-application answer. Older guides still recommend it;
they are wrong.

## Which builds have this problem

All the third-party ones, to some degree. [Thorium](/builds/thorium/),
[ungoogled-chromium](/builds/ungoogled-chromium-macos/) and [Marmaduke's builds](/builds/marmaduke-macos/) are
all published un-notarised.

The official Chromium snapshots from Google's own build servers are not notarised either, and behave the same
way.

<!--faq
Q: Why does macOS say Chromium is damaged and cannot be opened?
A: The message is misleading. It normally means the application is not signed or notarised by Apple and carries the quarantine attribute from being downloaded. Right-click the application and choose Open, or clear the attribute with xattr -dr com.apple.quarantine.

Q: How do I open an unsigned app on macOS?
A: Right-click it and choose Open rather than double-clicking, then confirm in the dialog. You only need to do this once per application. Do not disable Gatekeeper system-wide.

Q: Are unsigned Chromium builds safe?
A: Signing is about verifying who published a file, not whether the contents are safe. Volunteer maintainers often skip notarisation because it requires a paid Apple account. Verify the SHA-256 checksum against the maintainer's release page before overriding Gatekeeper.
-->
