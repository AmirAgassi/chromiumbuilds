---
title: The Chromium profile and user data directory
description: Where Chromium keeps bookmarks, passwords, extensions and history on each platform, how to back it up, move it, or reset a broken profile.
group: Advanced
order: 32
---

Everything personal about your browser lives in one folder: the user data directory. Bookmarks, history,
passwords, cookies, extensions, settings, open tabs.

It is entirely separate from the program itself, which is why
[updating Chromium](/docs/updating-chromium/) does not lose your data, and why backing up this one folder
backs up your whole browser.

## Where it is

**Windows**

```
%LOCALAPPDATA%\Chromium\User Data
```

which is normally `C:\Users\<you>\AppData\Local\Chromium\User Data`.

**macOS**

```
~/Library/Application Support/Chromium
```

**Linux**

```
~/.config/chromium
```

Forks use their own directory, so Thorium and Supermium each keep a separate folder under the same parent.
That is deliberate, and it means installing a fork will not pick up your existing profile.

Never guess: `chrome://version` shows the exact **Profile Path** your running browser is using.

## Inside it

The directory holds one folder per profile. `Default` is your first profile; additional ones are
`Profile 1`, `Profile 2` and so on. Files shared across profiles, like `Local State`, sit at the top level.

Within a profile folder, `Bookmarks` is readable JSON, `History` and `Cookies` are SQLite databases,
`Login Data` holds saved passwords, and `Extensions` contains the extensions themselves.

## Backing it up

Close the browser first. Chromium holds SQLite databases open, and copying them mid-write produces a backup
that restores into a corrupted profile.

Then copy the whole `User Data` folder. That is the entire backup, and restoring it is copying it back.

**Passwords do not travel.** They are encrypted against the OS keychain: DPAPI on Windows tied to your
Windows account, Keychain on macOS, and GNOME Keyring or KWallet on Linux. A profile copied to a different
machine or user account will restore everything except the passwords. Export those separately from the
password manager if you need them to move.

## Moving it somewhere else

Use `--user-data-dir` to point Chromium at a different location:

```
chrome.exe --user-data-dir="D:\ChromiumProfile"
```

Copy the existing folder there first if you want your data to come along. This is also how
[portable builds](/docs/portable-chromium/) keep everything in one directory, and how you run
several Chromium versions side by side without them fighting.

## Fixing a broken profile

Profile corruption shows up as a browser that will not start, starts with everything reset, or crashes on a
specific action.

**First, test whether it is the profile at all.** Start with a temporary one:

```
chrome.exe --user-data-dir="C:\Temp\ChromiumTest"
```

If the problem disappears, it is the profile. If it persists, it is the build or the system.

**Then repair rather than delete.** Close the browser, rename `Default` to `Default.old`, and start Chromium
so it creates a fresh profile. You can then copy individual pieces back: `Bookmarks` first, then
`Login Data`, testing after each. Recovering the parts that matter usually works, and it beats starting over.

`Bookmarks.bak` sits next to `Bookmarks` and holds the previous version, which is often exactly what you need
after bookmarks vanish.

## Size

A long-lived profile reaches several gigabytes, mostly cache. The cache is safe to delete with the browser
closed, and Chromium will rebuild it. `Service Worker` and `IndexedDB` can also be large, but those hold real
site data such as offline content and logged-in state, so clearing them logs you out of things.

<!--faq
Q: Where does Chromium store bookmarks and passwords?
A: In the user data directory: %LOCALAPPDATA%\Chromium\User Data on Windows, ~/Library/Application Support/Chromium on macOS, and ~/.config/chromium on Linux. The exact path is shown at chrome://version.

Q: How do I back up my Chromium profile?
A: Close the browser, then copy the entire User Data folder. Saved passwords are encrypted against the operating system keychain and will not work on a different machine or user account, so export those separately.

Q: How do I fix a corrupted Chromium profile?
A: Start Chromium with --user-data-dir pointing at a new folder to confirm the profile is the cause. If it is, rename the Default folder and let Chromium create a fresh one, then copy back Bookmarks and other individual files.
-->
