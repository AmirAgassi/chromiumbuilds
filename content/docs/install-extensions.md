---
title: Installing extensions in Chromium
description: Chrome Web Store access works in most Chromium builds and is deliberately removed in ungoogled-chromium. Here is how to install extensions in either case.
group: Installing and updating
order: 12
---

Most Chromium builds can use the Chrome Web Store exactly as Chrome does. Visit the store, click Add to
Chrome, and the extension installs and auto-updates normally.

ungoogled-chromium is the exception, and it is a deliberate one: store access is a Google web service, so it
was removed along with the rest of them.

## In ungoogled-chromium

You have two workable routes.

**Use the Chromium Web Store extension.** The community maintains
[chromium-web-store](https://github.com/NeverDecaf/chromium-web-store), which restores browsing, installing and
updating from the store inside ungoogled-chromium. Install it once by the manual method below, and afterwards
extensions behave more or less normally. This is the option most people should take.

**Install a CRX by hand.** First allow it, by opening this flag and setting it to **Allow**:

```
chrome://flags/#extension-mime-request-handling
```

Then download the extension's `.crx` file and open it from a `file://` URL, or drag it onto
`chrome://extensions` with Developer mode switched on.

Extensions installed this way do not update themselves. That matters: an extension with access to every page
you visit is worth keeping current, which is a good reason to prefer the web store extension.

## Loading an unpacked extension

For an extension you have the source of, or one you are developing:

1. Open `chrome://extensions`.
2. Turn on **Developer mode**, top right.
3. Click **Load unpacked** and choose the folder containing the extension's `manifest.json`.

Unpacked extensions are removed when the browser restarts on some builds, and never auto-update.

## Manifest V3

Chrome finished phasing out Manifest V2 extensions, which is what broke the traditional full-strength content
blockers. Chromium follows upstream here, so a current build behaves the same way.

If ad blocking is your reason for being here, uBlock Origin Lite works under Manifest V3, and blockers that
filter at the DNS or proxy level sidestep the question entirely. Older builds that still allow Manifest V2 do
exist, but running an outdated browser to keep an extension is a bad trade. See
[updating Chromium](/docs/updating-chromium/) for why.

## Enterprise policy installs

On a managed machine you can force-install extensions through policy, which works on Chromium as it does on
Chrome. On Windows this is under `HKLM\Software\Policies\Chromium\ExtensionInstallForcelist`; on macOS and
Linux it is a managed preferences file. The full policy list is documented at
[chromeenterprise.google/policies](https://chromeenterprise.google/policies/).

<!--faq
Q: Can I use Chrome extensions in Chromium?
A: Yes. Chromium supports the same extensions as Chrome, and most builds can install them from the Chrome Web Store directly. ungoogled-chromium removes store access deliberately, so it needs either the chromium-web-store extension or a manual CRX install.

Q: How do I install extensions in ungoogled-chromium?
A: Either install the community chromium-web-store extension, which restores normal store access, or enable chrome://flags/#extension-mime-request-handling and open a downloaded CRX file directly.

Q: Do manually installed extensions update automatically?
A: No. An extension installed from a CRX file by hand will not update itself, which is why the chromium-web-store extension is the better long-term option.
-->
