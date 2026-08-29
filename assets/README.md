# assets

`chromium-logo.svg` is the Chromium product logo, copied unmodified from the chromium source tree:

    chrome/app/theme/chromium/product_logo.svg

that is the *chromium* branding directory, which ships under the chromium bsd licence, as opposed to
`chrome/app/theme/google_chrome/`, which holds google chrome's proprietary marks and is not used here.

refresh it with:

    curl -s "https://chromium.googlesource.com/chromium/src/+/main/chrome/app/theme/chromium/product_logo.svg?format=TEXT" | base64 -d > assets/chromium-logo.svg
