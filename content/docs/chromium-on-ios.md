---
title: Chromium on iPhone and iPad
description: Why no real Chromium build exists for iOS, what Chrome for iOS actually is, and what changed with the EU's alternative engine rules.
group: Installing and updating
order: 14
---

There is no genuine Chromium build for iPhone or iPad, and the reason is Apple's rules rather than any
technical limitation.

## What Chrome for iOS actually is

Apple's App Store guidelines have long required that browsers on iOS use WebKit, the engine behind Safari.
Chrome for iOS therefore uses WebKit, not Blink. It carries Chrome's interface, sync and account integration,
but the part that actually renders pages is Safari's.

That is why every iOS browser scores identically on rendering tests, and why a site that breaks in Safari on
iOS breaks in Chrome for iOS too. Underneath, they are the same engine.

Since Chromium is essentially Blink plus a browser around it, a WebKit-based build is not really Chromium in
any meaningful sense.

## What changed in the EU

The Digital Markets Act forced Apple to allow alternative browser engines on iOS in the European Union, and
iOS 17.4 added the technical mechanism for it.

Uptake has been slow. The entitlement carries substantial conditions, an EU-only build is a separate product
to develop and support, and the commercial case for maintaining a whole second engine port for one region has
been weak. As of this writing there is no shipping Blink-based iOS browser in general availability, and
certainly no community Chromium build.

If that changes it will come from Google rather than a volunteer maintainer, because the entitlement process
is not something an individual can realistically satisfy.

## What you can actually do

**Use Chrome for iOS** if you want Chrome's sync, account integration and interface. You will get WebKit
rendering, which for ordinary browsing is perfectly good.

**Use Safari** if the interface does not matter to you. It is the same engine with better system integration
and better battery behaviour.

**Use a content blocker** if ad blocking is the goal. iOS content blockers work at the WebKit level and apply
across every browser on the device, which is a genuinely better arrangement than per-browser extensions.

If you specifically want Chromium, that means a desktop or Android device. See
[Chromium for Android](/android/), where real Chromium builds do exist and can be sideloaded freely.

<!--faq
Q: Is there a Chromium browser for iPhone?
A: No. Apple requires iOS browsers to use its WebKit engine, so no genuine Blink-based Chromium build exists for iPhone or iPad. Chrome for iOS uses WebKit underneath.

Q: Is Chrome for iOS the same as Chrome on desktop?
A: Only in interface, sync and account features. The rendering engine is WebKit rather than Blink, so pages render exactly as they do in Safari.

Q: Did the EU rules change this?
A: The Digital Markets Act requires Apple to permit alternative browser engines in the EU, and iOS 17.4 added the mechanism. No Blink-based iOS browser has shipped broadly as a result, and no community Chromium build exists.
-->
