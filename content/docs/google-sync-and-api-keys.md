---
title: Google sync and API keys in Chromium
description: Why browser sign-in is missing from most Chromium builds, what API keys have to do with it, and why you should not add your own.
group: How Chromium works
order: 20
---

Open a Chromium build and there is often no way to sign in to a Google account. It is not hidden, it is
genuinely absent, and the reason is a build-time decision.

## What the keys are

Chromium reaches Google services, sync, Safe Browsing lookups, translation, geolocation, through APIs that
require credentials. Those credentials are compiled into the binary at build time as `GOOGLE_API_KEY`,
`GOOGLE_DEFAULT_CLIENT_ID` and `GOOGLE_DEFAULT_CLIENT_SECRET`.

Google's own Chrome builds contain Google's keys. Anyone else compiling Chromium has to supply their own, or
build without any, in which case the features that depend on them are simply not there.

## Why most builds ship without them

Google's terms for these APIs do not permit redistributing keys inside a binary handed to the public, and the
quotas are sized for personal or development use rather than for a browser thousands of people run. A
maintainer who shipped their own keys would be violating the terms and would exhaust the quota quickly.

So most maintainers build without keys. A few, notably [Hibbiki](/builds/hibbiki/) and
[Supermium](/builds/supermium/), do include working keys, which is why sign-in works in those builds.

For [ungoogled-chromium](/builds/ungoogled-chromium/) the absence is the entire point rather than a side
effect: the integration is removed from the source, not merely left unconfigured.

## What you lose without them

- Signing in to a Google account in the browser
- Syncing bookmarks, passwords, history, tabs and extensions
- Safe Browsing's lookup service, which warns about known malicious sites
- Built-in page translation
- Network-based geolocation

Extensions still work, the Chrome Web Store still works on most builds, and every website works normally.
This affects Google's own service integration and nothing else.

## Should you add your own keys?

You can, and you should not.

It is technically possible to obtain API credentials from the Google Cloud console and pass them to Chromium
through environment variables. But personal credentials have quotas intended for one developer, sync will
behave unpredictably as you hit them, and you are enabling exactly the Google integration that most people
choosing a Chromium build were trying to avoid.

If you want browser sync, the honest answer is to use a build that ships keys legitimately, or use Chrome. If
you want sync without Google, use a password manager and a bookmark service that are not tied to the browser
at all, which is a better arrangement regardless.

## Checking what your build has

Open `chrome://version`. If the API keys are missing, Chromium says so directly near the bottom of the page.
The presence of a "Sign in" option in settings is the other quick tell.

<!--faq
Q: Why can I not sign in to Google in Chromium?
A: Browser sign-in requires Google API keys compiled into the build. Google's terms do not allow redistributing keys in a public binary, so most Chromium maintainers build without them and the sign-in feature is absent.

Q: Which Chromium builds support sync?
A: Hibbiki's Windows build and Supermium both ship with working API keys, so browser sign-in and sync function normally. ungoogled-chromium removes the capability deliberately.

Q: Can I add my own Google API keys to Chromium?
A: Technically yes, through the Google Cloud console and environment variables, but personal quotas are not sized for browser sync and it reinstates the Google integration most Chromium users are avoiding.
-->
