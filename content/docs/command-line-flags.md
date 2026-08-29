---
title: Chromium command-line flags
description: The command-line switches actually worth knowing, how to set them permanently on each platform, and the ones you should not use.
group: Advanced
order: 30
---

Chromium takes a large number of command-line switches. Most exist for developers and build bots, but a
handful genuinely solve problems, and a few are actively dangerous.

## Setting them

**Windows.** Right-click your Chromium shortcut, choose Properties, and append the flag to the Target field
after the closing quote:

```
"C:\Chromium\chrome.exe" --user-data-dir="D:\ChromiumProfile"
```

**macOS.** From Terminal:

```bash
/Applications/Chromium.app/Contents/MacOS/Chromium --user-data-dir=/tmp/test
```

**Linux.** Either run it from a terminal, or edit the `.desktop` file's `Exec=` line. For packaged builds,
`~/.config/chromium-flags.conf` is read by many distribution packages, one flag per line.

## The ones worth knowing

**`--user-data-dir=PATH`** is the most useful flag in the list. It puts the whole profile somewhere you
choose, which is how you run [portable builds](/docs/portable-chromium/) self-contained, keep several versions
side by side, and create a genuinely separate throwaway profile.

```
chrome.exe --user-data-dir="C:\ChromiumTest"
```

**`--incognito`** starts directly in a private window.

**`--app=https://example.com`** opens a site as a bare window with no tabs, address bar or interface. The
simplest way to make a web application feel like a desktop one.

**`--proxy-server="socks5://127.0.0.1:1080"`** routes through a proxy without touching system settings.

**`--disable-extensions`** starts with extensions off, the fastest way to find out whether an extension is
causing a problem.

**`--enable-features=X`** and **`--disable-features=X`** toggle features by name, including some that have no
entry in `chrome://flags`.

**`--force-dark-mode`** turns on Chromium's automatic dark rendering for pages that lack their own.

**`--disable-gpu`** falls back to software rendering. Worth trying when you get visual corruption or blank
pages on a machine with awkward graphics drivers.

## Flags you should not use

**`--no-sandbox`** disables the process sandbox. The sandbox is the single most important security boundary in
the browser: it is what stops a compromised web page reaching the rest of your machine. Guides suggest this
flag to work around startup problems, and following that advice turns an ordinary browser exploit into a full
compromise of your account. Fix the underlying problem instead.

**`--disable-web-security`** turns off the same-origin policy. It exists for local development against an API
and nothing else. Never browse with it.

**`--ignore-certificate-errors`** makes HTTPS meaningless by accepting any certificate, valid or forged.

**`--allow-running-insecure-content`** re-enables mixed content that browsers block for good reason.

The pattern is worth internalising: if a flag's name describes switching off a protection, the protection is
almost certainly the thing standing between you and a bad day.

## chrome://flags

`chrome://flags` is a separate mechanism: experimental features with a UI, stored in your profile and
persisting across restarts.

They are experiments. They ship broken, they get removed without notice, and a flag that solved something in
one version may not exist in the next. If the browser starts misbehaving after you have been in there,
**Reset all** at the top of the page is the first thing to try.

## Seeing what is already set

`chrome://version` lists the full command line the browser is running with, including flags inherited from a
shortcut or a config file you have forgotten about. Always check there first when behaviour makes no sense.

<!--faq
Q: How do I add command-line flags to Chromium on Windows?
A: Right-click the shortcut, open Properties, and append the flag to the end of the Target field after the closing quotation mark.

Q: What does --user-data-dir do?
A: It tells Chromium where to store the entire profile, including bookmarks, extensions and history. It is how you run portable builds self-contained and run multiple Chromium versions side by side.

Q: Is --no-sandbox safe to use?
A: No. It disables the process sandbox, which is the main barrier preventing a compromised web page from reaching the rest of your system. It should never be used for normal browsing.
-->
