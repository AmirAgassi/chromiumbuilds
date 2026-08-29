---
title: Chromium on Windows 7, 8 and XP
description: Which Chromium builds still run on Windows versions Google dropped, what the last supported release was, and the security reality of using them.
group: Installing and updating
order: 13
---

Google ended support for Windows 7, 8 and 8.1 with Chrome 109 in January 2023. Every Chromium release after
that assumes Windows 10 or later, and will not run on those systems.

That leaves two genuinely different options, and they are not equally good.

## Supermium, for anything older than Windows 10

[Supermium](/builds/supermium/) backports current Chromium to Windows XP, Vista, 7, 8 and 8.1. It is actively
maintained, tracks a far more recent Chromium than 109, and it is the only project doing this properly.

If you are on an old Windows and want a browser that is still receiving engine updates, this is the answer.
It also runs on Windows 10 and 11, though there is little reason to choose it there.

## Chromium 109, the frozen option

The last Chromium that officially supported Windows 7 and 8.1 was the 109 line, from January 2023. Builds of
it are still findable.

Understand what that means: **it has received no security fixes since January 2023.** Three years of publicly
documented, actively exploited browser vulnerabilities are all present. It renders old pages, and it is not a
browser to use on the open web.

Use it only for something specific and contained, like an internal application that refuses to work with
anything else, on a machine that does not browse the wider internet.

## 32-bit Windows

Chromium's own 32-bit Windows builds also stopped at the 109 line, and the same reasoning applies. Supermium
publishes a current 32-bit build, which is the better option. See
[32-bit Chromium for Windows](/windows/32-bit/).

## Very old processors

Chromium requires SSE3 as a baseline, and has for years. On a processor older than that, nothing current will
start, and there is no maintained build that removes the requirement. Some maintainers publish SSE2 or SSE3
targeted variants; [Thorium](/builds/thorium/) ships an SSE3 build, which is the lowest bar of anything
currently maintained.

## The honest advice

Every one of these paths is a compromise, and the size of the compromise varies enormously.

Supermium is a real solution and a genuinely impressive piece of work. Running a frozen Chromium 109 in 2026
is not a solution, it is a risk you are choosing to accept, and it should be confined to a machine where that
risk is contained.

If the hardware itself is still sound, a current Linux distribution will give you a fully supported, fully
updated Chromium on the same machine. That is very often the better answer for a computer that Windows has
left behind.

<!--faq
Q: Does Chromium still work on Windows 7?
A: Not the current official builds, which require Windows 10 or later. Supermium is an actively maintained Chromium fork that runs on Windows XP through 8.1 and tracks a much more recent engine than the last officially supported release.

Q: What was the last Chromium version for Windows 7?
A: The 109 line, released in January 2023. It has received no security updates since, so it should not be used for general browsing.

Q: Is there a 32-bit Chromium for Windows?
A: Official 32-bit Windows builds ended with the 109 line. Supermium publishes a current, maintained 32-bit build, which is the better choice.
-->
