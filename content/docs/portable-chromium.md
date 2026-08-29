---
title: Portable Chromium
description: How to run Chromium from a folder or a USB stick without installing it, keep the profile alongside it, and what portable builds cannot do.
group: Installing and updating
order: 11
---

A portable build runs from any folder. It writes no registry keys, needs no administrator rights, and can live
on a USB stick. Most Chromium maintainers publish one alongside the installer, usually as a `.7z` or `.zip`.

Useful when you do not have administrator rights, when you want several Chromium versions side by side, or
when you want the browser to leave no trace on the machine.

## Running one

Extract the archive and run `chrome.exe` from inside it. That is the whole process on Windows.

By default Chromium still writes its profile to the system user data directory, which defeats the point. To
keep everything together, launch it with an explicit profile path:

```
chrome.exe --user-data-dir=".\User Data"
```

Make a shortcut with that argument, or a one-line batch file next to the executable:

```bat
@echo off
start "" "%~dp0chrome.exe" --user-data-dir="%~dp0User Data"
```

Now bookmarks, extensions, history and passwords all live inside the folder, and moving the folder moves the
browser complete with its state.

On macOS and Linux the same flag applies:

```bash
./chrome --user-data-dir="$(dirname "$0")/User Data"
```

## Running two versions side by side

Give each one its own `--user-data-dir`. Chromium keys almost all per-installation state on that directory, so
two builds with two profile paths will not interfere with each other and can run simultaneously.

This is the standard way to test whether a bug exists in a newer build without disturbing your working setup.

## AppImage on Linux

Linux portable builds are often AppImages, a single executable file. Mark it executable, then run it:

```bash
chmod +x ungoogled-chromium-*.AppImage
./ungoogled-chromium-*.AppImage
```

If it fails on a newer distribution with an error about FUSE, either install `libfuse2` or extract and run it
directly:

```bash
./ungoogled-chromium-*.AppImage --appimage-extract
./squashfs-root/AppRun
```

## What portable builds cannot do

**They cannot update themselves,** and neither can installed ones, but portable builds are worse in practice
because no package manager can help. Updating means extracting the new archive over the old folder. Back up
your `User Data` directory first.

**They cannot be your default browser** in the normal way, because that registration is exactly the kind of
system change portable software avoids.

**They are not sandboxed away from your files.** Portable means it does not install, not that it is isolated.
The browser has the same access to your documents as any program you run.

**Widevine may not work.** DRM sometimes depends on components resolved at install time. If paid streaming
matters to you, test it before committing to a portable setup. See [Widevine and DRM](/docs/widevine-drm/).

## On a USB stick

It works, with two caveats. USB flash storage is slow, and a browser profile is a busy little database, so
expect it to feel sluggish. And profiles do a lot of small writes, which wears cheap flash out faster than you
might expect. Fine for occasional use, poor as a daily driver.

<!--faq
Q: Can I run Chromium without installing it?
A: Yes. Most maintainers publish a portable archive alongside the installer. Extract it and run the executable directly, with no administrator rights and no registry changes.

Q: How do I keep a portable Chromium's profile in its own folder?
A: Launch it with the --user-data-dir flag pointing at a folder inside the portable directory. Without that flag, Chromium writes its profile to the normal system location instead.

Q: Can I run two versions of Chromium at the same time?
A: Yes, as long as each one is launched with a different --user-data-dir. Two builds sharing one profile directory will conflict.
-->
