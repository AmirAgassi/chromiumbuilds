---
title: How to update Chromium
description: Chromium has no automatic updater. Here is what that actually means for your security, and the realistic ways to stay current on each platform.
group: Installing and updating
order: 10
---

Chrome updates itself silently. Chromium does not, and that single missing feature is the biggest practical
cost of running Chromium instead of Chrome.

## Why it matters more than it sounds

Chromium ships a security release roughly every two weeks. Those releases fix vulnerabilities that are
public by the time they land, and a meaningful share are already being exploited when the fix goes out.

Your browser is the program that executes the most untrusted code on your machine, by an enormous margin.
Every page you open is code from someone you have never met. An eight-month-old Chromium is carrying every
publicly documented hole found in those eight months.

This is why this site marks builds as **current**, **one version behind** or **outdated** rather than just
listing versions. Those labels are computed by comparing each build against the current upstream Chromium
release, so they mean something specific rather than being anyone's opinion.

## The genuinely automatic options

If updating by hand sounds like something you will stop doing after a month, be honest about that now and use
one of these instead.

**Linux, through your package manager.** Chromium from your distribution updates with everything else. This
is the single best answer on Linux and the reason the [distribution packages page](/linux/packages/) exists.

```bash
sudo apt install chromium        # Debian, Ubuntu
sudo dnf install chromium        # Fedora
sudo pacman -S chromium          # Arch
flatpak install flathub org.chromium.Chromium
```

**Windows, through a package manager.** Both winget and Chocolatey can update Chromium along with the rest of
your software.

```powershell
winget install Hibbiki.Chromium
winget upgrade --all

# or
choco install chromium
choco upgrade all
```

**macOS, through Homebrew.**

```bash
brew install --cask chromium
brew upgrade --cask
```

A packaged build may lag the newest release by a few days. That is a far smaller risk than a manual process
you abandon.

## Updating by hand

If you are running a build that is only distributed directly, the process is the same everywhere: download the
new version, install it over the old one, and keep your profile.

**Installer builds.** Run the new installer. It replaces the program and leaves your profile alone. Bookmarks,
passwords, extensions and history all survive, because they live in the
[user data directory](/docs/user-data-directory/), not in the program folder.

**Portable builds.** Extract the new archive over the old folder, replacing files. If your profile is inside
that folder, as it is with most portable layouts, back it up first or extract to a fresh folder and move the
`User Data` directory across.

Always take the profile seriously before overwriting anything. It is the only part that is not replaceable.

## Knowing when there is something to update to

**Subscribe to the [release feed](/feed.xml).** It is a standard Atom feed carrying every new release this
site tracks, so any feed reader will tell you when your build publishes.

**Check your version against upstream.** Open `chrome://version` in your browser and compare the first number
with the current Chromium stable release shown on this site's [home page](/). If your major version is two or
more behind, you are missing security fixes.

**Poll the [JSON API](/api/).** If you would rather script it, `latest.json` gives you the current version and
download URL for every tracked build, and a short shell script can compare that against what you have
installed.

<!--faq
Q: Does Chromium update automatically?
A: No. Automatic updating is a Google Chrome feature and is not part of Chromium. Unless you installed Chromium through a package manager such as apt, winget, Homebrew or Flatpak, you must download and install new versions yourself.

Q: How do I know if my Chromium is out of date?
A: Open chrome://version and compare the version number with the current Chromium stable release. If your major version number is two or more behind, your build is missing published security fixes.

Q: Will updating Chromium delete my bookmarks?
A: No. Bookmarks, passwords, extensions and history live in the user data directory, which is separate from the program files. Installing a newer version over an existing one keeps all of it. Portable builds that store the profile inside the program folder are the exception, so back that folder up first.
-->
