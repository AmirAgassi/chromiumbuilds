---
title: What ungoogled-chromium actually changes
description: A precise account of what ungoogled-chromium removes, what it does not, and the specific trade-offs before you install it.
group: How Chromium works
order: 23
---

ungoogled-chromium is Chromium with Google web service integration removed. Not disabled by a setting,
removed from the source and recompiled, so the code that would contact Google is not present in the binary.

It is the strictest option available, and it costs you real functionality. Both halves of that matter.

## What it removes

**Google web service connections.** Requests bound for Google domains are neutralised through a substitution
that rewrites them to an invalid domain, so code paths that would call home cannot resolve anywhere.

**Safe Browsing.** The lookup service that warns about known-malicious sites is disabled. This is a genuine
security feature you are giving up, and worth being deliberate about.

**Browser sign-in and sync.** No API keys, and the integration is stripped. See
[Google sync and API keys](/docs/google-sync-and-api-keys/).

**Chrome Web Store access.** Store browsing is a Google service, so it goes too. Extensions still work; see
[installing extensions](/docs/install-extensions/).

**The Google Speech API,** used for voice input, and network geolocation.

It also changes some defaults: WebRTC is restricted so it does not leak local IP addresses, and various
features that phone home are off.

## What it does not change

It is still Chromium. Same Blink engine, same V8, same sandbox and site isolation, same extension API, same
DevTools. Pages render identically and it is exactly as fast.

It is also not an anti-fingerprinting browser. It stops Chromium contacting Google; it does not stop websites
profiling you. If that is your goal, Tor Browser or a hardened Firefox is the tool for that job, and running
ungoogled-chromium under the impression it does this is a real misunderstanding worth clearing up.

## The trade-offs, stated plainly

| You give up | Consequence |
| --- | --- |
| Safe Browsing | No warning before a known phishing or malware site |
| Sign-in and sync | Bookmarks and passwords do not follow you between machines |
| Web Store access | Extensions need the store extension or manual CRX installs |
| Widevine | Netflix, Spotify and Prime do not play |
| Proprietary codecs | H.264 and AAC media may fail |
| Auto-update | Same as every Chromium build |

The last three surprise people most often. If they matter to you,
[Marmaduke's builds](/builds/marmaduke-windows/) apply the same ungoogled patches while keeping Widevine and
the codecs, which is the middle ground most people actually want.

## Who it is right for

Right for you if you want a Chromium engine with no Google service contact, you are comfortable installing
extensions manually, and you do not need paid streaming in this browser.

Wrong for you if you want a drop-in Chrome replacement. It is not one, deliberately, and the friction is the
product working as designed.

## Where to get it

The official builds are on the [ungoogled-chromium pages](/builds/ungoogled-chromium/) for Windows, macOS and
Linux. Many distributions package it too; see [Linux packages](/linux/packages/).

Note that the official builds are frequently a version or two behind upstream stable, because each release
needs the removal patches rebased onto new Chromium source. That work is done by volunteers and it is not
trivial.

<!--faq
Q: What is the difference between Chromium and ungoogled-chromium?
A: ungoogled-chromium removes Google web service integration at the source level: Safe Browsing, sign-in and sync, Chrome Web Store access, the Speech API and network geolocation. The rendering engine and extension support are unchanged.

Q: Does ungoogled-chromium stop websites tracking me?
A: No. It stops the browser contacting Google's services. It does not provide anti-fingerprinting or block third-party tracking, and it is not a substitute for Tor Browser.

Q: Why is ungoogled-chromium behind the latest Chromium version?
A: Each release requires the removal patches to be rebased onto new Chromium source, which is substantial volunteer work, so official builds usually trail upstream stable by one or two versions.
-->
