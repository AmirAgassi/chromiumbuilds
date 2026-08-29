---
title: Verify your download
description: How to check a Chromium download against its published SHA-256 checksum on Windows, macOS and Linux, and what to do when it does not match.
group: Start here
order: 4
---

A checksum is a fingerprint of a file. If the one you compute matches the one the maintainer published, you
have byte-for-byte exactly what they built. If it does not, something changed in between: a corrupted
download, a proxy, a mirror, or tampering.

It takes about fifteen seconds and it is the only step in the whole process that proves anything.

Every build listed on this site shows its SHA-256 under **Checksums** on the build card. Those values are read
from the release host's own API, not computed here, so verifying against them does not require trusting this
site.

## Windows

In PowerShell:

```powershell
Get-FileHash -Algorithm SHA256 "$HOME\Downloads\mini_installer.exe"
```

Or in Command Prompt:

```
certutil -hashfile "%USERPROFILE%\Downloads\mini_installer.exe" SHA256
```

Compare the output to the published value. Case does not matter; the digits do.

## macOS

```bash
shasum -a 256 ~/Downloads/Thorium_MacOS_ARM64.dmg
```

## Linux

```bash
sha256sum ~/Downloads/ungoogled-chromium_151.0.7922.173-1_x86_64.AppImage
```

## Comparing without reading 64 characters

Reading hex by eye is where mistakes happen. Have the machine do it.

PowerShell:

```powershell
$expected = "paste-the-published-hash-here"
(Get-FileHash -Algorithm SHA256 .\mini_installer.exe).Hash -eq $expected
```

macOS and Linux:

```bash
echo "paste-the-published-hash-here  mini_installer.exe" | shasum -a 256 --check
```

Both print a plain yes or no.

## If it does not match

Do not run the file.

Download it again first, ideally on a different network. A truncated or corrupted transfer is by far the most
common cause, and a second attempt usually resolves it.

If the second download also mismatches, check you are comparing against the right file. Maintainers publish
several variants per release, and the installer, the portable archive and each CPU variant all have different
hashes.

If it still mismatches, stop and report it on the maintainer's repository. Do not run it in the meantime.

## Optional: a second opinion

Pasting the SHA-256 into [VirusTotal](https://www.virustotal.com/gui/home/search) shows whether that exact
file has been scanned before and what the engines said. Searching by hash rather than uploading is faster and
tells you about the same file everyone else downloaded.

Bear in mind that a handful of detections on an unsigned browser installer is normal. See
[is Chromium safe to download](/docs/is-chromium-safe/) for why.

## What a checksum does not tell you

It proves the file is what the maintainer published. It does not prove the maintainer is trustworthy. Those
are separate questions, and the second one is answered by a project's history, its public source, and its
reputation rather than by any command you can run.

<!--faq
Q: How do I check a SHA-256 checksum on Windows?
A: Run Get-FileHash -Algorithm SHA256 followed by the path to the file in PowerShell, then compare the output with the checksum published on the build's release page.

Q: What should I do if the checksum does not match?
A: Do not run the file. Download it again, ideally on a different network, since a corrupted transfer is the usual cause. If it still does not match, confirm you are comparing against the correct file variant, and if it does, report it to the maintainer.
-->
