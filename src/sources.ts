import type { Arch, Channel, GoogleMode, Platform, PkgKind, Simd } from "./types";

export interface AssetRule {
  re: RegExp;
  platform: Platform;
  arch: Arch;
  kind: PkgKind;
  simd?: Simd;
  label?: string;
  recommended?: boolean;
}

export interface GithubSource {
  id: string;
  name: string;
  maintainer: string;
  maintainerUrl: string;
  repo: string;
  homepage?: string;
  blurb: string;
  channel: Channel;
  google: GoogleMode;
  proprietaryCodecs: boolean;
  hevc: boolean;
  widevine: boolean;
  /** Walk this many releases; sources that split variants across tags need more. */
  releases?: number;
  /** Group releases by version instead of taking only the newest tag. */
  multiTag?: boolean;
  /** Reject tags that do not match (e.g. beta channels sharing a repo). */
  tagFilter?: RegExp;
  assets: AssetRule[];
  notes?: string[];
}

const skipNothing: AssetRule[] = [];

export const GITHUB_SOURCES: GithubSource[] = [
  {
    id: "hibbiki",
    name: "Hibbiki Chromium",
    maintainer: "Hibbiki",
    maintainerUrl: "https://github.com/Hibbiki",
    repo: "Hibbiki/chromium-win64",
    blurb:
      "Chromium for 64-bit Windows built to match the current Chrome stable release, with Google sync enabled and the proprietary media codecs compiled in. The closest thing to Chrome without Chrome.",
    channel: "stable",
    google: "sync",
    proprietaryCodecs: true,
    hevc: true,
    widevine: true,
    assets: [
      { re: /^mini_installer\.exe$/i, platform: "windows", arch: "x64", kind: "installer", label: "Installer", recommended: true },
      { re: /^chrome\.7z$/i, platform: "windows", arch: "x64", kind: "portable", label: "Portable (7z)" },
    ],
    notes: ["Ships Google API keys, so browser sign-in and sync work.", "Widevine is bundled, so Netflix and Spotify play."],
  },
  {
    id: "ungoogled-chromium",
    name: "ungoogled-chromium",
    maintainer: "ungoogled-software",
    maintainerUrl: "https://github.com/ungoogled-software",
    repo: "ungoogled-software/ungoogled-chromium-windows",
    homepage: "https://ungoogled-software.github.io/ungoogled-chromium-binaries/",
    blurb:
      "Chromium with every Google web service dependency removed or disabled at the source level. No background requests to Google, no sign-in, no Safe Browsing callbacks.",
    channel: "stable",
    google: "ungoogled",
    proprietaryCodecs: false,
    hevc: false,
    widevine: false,
    assets: [
      { re: /installer_x64\.exe$/i, platform: "windows", arch: "x64", kind: "installer", label: "Installer", recommended: true },
      { re: /windows_x64\.zip$/i, platform: "windows", arch: "x64", kind: "portable", label: "Portable (zip)" },
      { re: /installer_arm64\.exe$/i, platform: "windows", arch: "arm64", kind: "installer", label: "Installer", recommended: true },
      { re: /windows_arm64\.zip$/i, platform: "windows", arch: "arm64", kind: "portable", label: "Portable (zip)" },
      { re: /installer_x86\.exe$/i, platform: "windows", arch: "x86", kind: "installer", label: "Installer", recommended: true },
      { re: /windows_x86\.zip$/i, platform: "windows", arch: "x86", kind: "portable", label: "Portable (zip)" },
    ],
    notes: [
      "No Google API keys, so sign-in and sync are absent by design.",
      "No Widevine, so most paid streaming services will not play.",
      "Open codecs only. H.264 and AAC content may not play everywhere.",
    ],
  },
  {
    id: "ungoogled-chromium-macos",
    name: "ungoogled-chromium",
    maintainer: "ungoogled-software",
    maintainerUrl: "https://github.com/ungoogled-software",
    repo: "ungoogled-software/ungoogled-chromium-macos",
    homepage: "https://ungoogled-software.github.io/ungoogled-chromium-binaries/",
    blurb: "The official macOS build of ungoogled-chromium, shipped as a signed-adjacent disk image for Intel and Apple silicon.",
    channel: "stable",
    google: "ungoogled",
    proprietaryCodecs: false,
    hevc: false,
    widevine: false,
    assets: [
      { re: /arm64-macos\.dmg$/i, platform: "macos", arch: "arm64", kind: "dmg", label: "Disk image", recommended: true },
      { re: /x86_64-macos\.dmg$/i, platform: "macos", arch: "x64", kind: "dmg", label: "Disk image", recommended: true },
    ],
    notes: ["Not notarised by Apple. You must right-click and choose Open the first time."],
  },
  {
    id: "ungoogled-chromium-linux",
    name: "ungoogled-chromium",
    maintainer: "ungoogled-software",
    maintainerUrl: "https://github.com/ungoogled-software",
    repo: "ungoogled-software/ungoogled-chromium-portablelinux",
    homepage: "https://ungoogled-software.github.io/ungoogled-chromium-binaries/",
    blurb: "Portable Linux builds of ungoogled-chromium that run from any directory without a package manager.",
    channel: "stable",
    google: "ungoogled",
    proprietaryCodecs: false,
    hevc: false,
    widevine: false,
    assets: [
      { re: /x86_64\.AppImage$/i, platform: "linux", arch: "x64", kind: "appimage", label: "AppImage", recommended: true },
      { re: /x86_64_linux\.tar\.xz$/i, platform: "linux", arch: "x64", kind: "archive", label: "Portable (tar.xz)" },
      { re: /arm64\.AppImage$/i, platform: "linux", arch: "arm64", kind: "appimage", label: "AppImage", recommended: true },
      { re: /arm64_linux\.tar\.xz$/i, platform: "linux", arch: "arm64", kind: "archive", label: "Portable (tar.xz)" },
    ],
    notes: ["AppImage needs the executable bit: chmod +x the file before running it."],
  },
  {
    id: "marmaduke-windows",
    name: "Marmaduke ungoogled (Windows)",
    maintainer: "Marmaduke",
    maintainerUrl: "https://github.com/macchrome",
    repo: "macchrome/winchrome",
    blurb:
      "An ungoogled Windows build that keeps the proprietary media codecs and Widevine, which the official ungoogled-chromium builds leave out. The usual pick for people who want privacy and working video.",
    channel: "stable",
    google: "ungoogled",
    proprietaryCodecs: true,
    hevc: true,
    widevine: true,
    assets: [
      { re: /mini_installer\.exe$/i, platform: "windows", arch: "x64", kind: "installer", label: "Installer", recommended: true },
      { re: /_Win64\.7z$/i, platform: "windows", arch: "x64", kind: "portable", label: "Portable (7z)" },
    ],
    notes: ["Ungoogled patches applied, but Widevine and H.264/H.265/AAC are kept."],
  },
  {
    id: "marmaduke-macos",
    name: "Marmaduke ungoogled (macOS)",
    maintainer: "Marmaduke",
    maintainerUrl: "https://github.com/macchrome",
    repo: "macchrome/macstable",
    blurb: "Ungoogled Chromium for macOS with proprietary codecs retained, distributed as a plain application archive.",
    channel: "stable",
    google: "ungoogled",
    proprietaryCodecs: true,
    hevc: false,
    widevine: true,
    assets: [{ re: /\.tar\.xz$/i, platform: "macos", arch: "x64", kind: "archive", label: "Application (tar.xz)", recommended: true }],
    notes: ["Intel build. It runs on Apple silicon through Rosetta 2."],
  },
  {
    id: "marmaduke-linux",
    name: "Marmaduke ungoogled (Linux)",
    maintainer: "Marmaduke",
    maintainerUrl: "https://github.com/macchrome",
    repo: "macchrome/linchrome",
    blurb: "Portable ungoogled Chromium for 64-bit Linux, built with VA-API hardware video acceleration enabled.",
    channel: "stable",
    google: "ungoogled",
    proprietaryCodecs: true,
    hevc: false,
    widevine: true,
    assets: [{ re: /linux\.tar\.xz$/i, platform: "linux", arch: "x64", kind: "archive", label: "Portable (tar.xz)", recommended: true }],
    notes: ["Built with VA-API enabled for hardware video decoding.", "Tested on Ubuntu 18.04 and newer."],
  },
  {
    id: "marmaduke-android",
    name: "Marmaduke ungoogled (Android)",
    maintainer: "Marmaduke",
    maintainerUrl: "https://github.com/macchrome",
    repo: "macchrome/droidchrome",
    blurb: "An ungoogled Chromium APK for 64-bit Android carrying the Bromite privacy patches and HEVC support.",
    channel: "stable",
    google: "ungoogled",
    proprietaryCodecs: true,
    hevc: true,
    widevine: false,
    assets: [{ re: /\.apk$/i, platform: "android", arch: "arm64", kind: "apk", label: "APK", recommended: true }],
    notes: ["Carries Bromite patches. Bromite itself is discontinued.", "Sideloading requires allowing installs from unknown sources."],
  },
  {
    id: "robrich",
    name: "RobRich Chromium (Clang/LLVM)",
    maintainer: "RobRich999",
    maintainerUrl: "https://github.com/RobRich999",
    repo: "RobRich999/Chromium_Clang",
    blurb:
      "Development-channel Chromium compiled with aggressive LLVM optimisation and CPU instruction sets newer than the baseline. Faster on modern hardware, and it will not start on older CPUs.",
    channel: "dev",
    google: "nosync",
    proprietaryCodecs: true,
    hevc: true,
    widevine: true,
    releases: 30,
    multiTag: true,
    assets: [
      { re: /^mini_installer\.exe$/i, platform: "windows", arch: "x64", kind: "installer", label: "Installer", recommended: true },
      { re: /^chrome\.zip$/i, platform: "windows", arch: "x64", kind: "portable", label: "Portable (zip)" },
      { re: /\.deb$/i, platform: "linux", arch: "x64", kind: "deb", label: "Debian package", recommended: true },
      { re: /\.rpm$/i, platform: "linux", arch: "x64", kind: "rpm", label: "RPM package", recommended: true },
    ],
    notes: [
      "Development channel. Expect the occasional regression.",
      "Check which instruction set your CPU supports before downloading.",
    ],
  },
  {
    id: "thorium",
    name: "Thorium",
    maintainer: "Alex313031 and gz83",
    maintainerUrl: "https://github.com/Alex313031/thorium",
    repo: "gz83/thorium",
    homepage: "https://thorium.rocks/",
    blurb:
      "A Chromium fork tuned for raw speed: compiler optimisations, SSE/AVX targets, and a set of patches that restore features Chrome removed. Ships for every desktop platform and Android.",
    channel: "stable",
    google: "nosync",
    proprietaryCodecs: true,
    hevc: true,
    widevine: true,
    assets: [
      { re: /^thorium_AVX2_mini_installer\.exe$/i, platform: "windows", arch: "x64", kind: "installer", simd: "avx2", label: "Installer (AVX2)", recommended: true },
      { re: /^Thorium_AVX2_[\d.]+\.zip$/i, platform: "windows", arch: "x64", kind: "portable", simd: "avx2", label: "Portable (AVX2)" },
      { re: /^thorium_AVX_mini_installer\.exe$/i, platform: "windows", arch: "x64", kind: "installer", simd: "avx", label: "Installer (AVX)" },
      { re: /^Thorium_AVX_[\d.]+\.zip$/i, platform: "windows", arch: "x64", kind: "portable", simd: "avx", label: "Portable (AVX)" },
      { re: /^thorium_AVX512_mini_installer\.exe$/i, platform: "windows", arch: "x64", kind: "installer", simd: "avx512", label: "Installer (AVX-512)" },
      { re: /^Thorium_AVX512_[\d.]+\.zip$/i, platform: "windows", arch: "x64", kind: "portable", simd: "avx512", label: "Portable (AVX-512)" },
      { re: /^thorium_SSE3_mini_installer\.exe$/i, platform: "windows", arch: "x64", kind: "installer", simd: "sse3", label: "Installer (SSE3)" },
      { re: /^Thorium_SSE3_[\d.]+\.zip$/i, platform: "windows", arch: "x64", kind: "portable", simd: "sse3", label: "Portable (SSE3)" },
      { re: /^thorium_SSE4_mini_installer\.exe$/i, platform: "windows", arch: "x64", kind: "installer", simd: "sse4", label: "Installer (SSE4)" },
      { re: /^Thorium_SSE4_[\d.]+\.zip$/i, platform: "windows", arch: "x64", kind: "portable", simd: "sse4", label: "Portable (SSE4)" },
      { re: /^thorium_ARM64_installer\.exe$/i, platform: "windows", arch: "arm64", kind: "installer", label: "Installer", recommended: true },
      { re: /^Thorium_ARM64_[\d.]+\.zip$/i, platform: "windows", arch: "arm64", kind: "portable", label: "Portable (zip)" },
      { re: /^thorium_WIN32_SSE2_mini_installer\.exe$/i, platform: "windows", arch: "x86", kind: "installer", label: "Installer (32-bit, SSE2)", recommended: true },
      { re: /^Thorium_WIN32_SSE2_[\d.]+\.zip$/i, platform: "windows", arch: "x86", kind: "portable", label: "Portable (32-bit, SSE2)" },
      { re: /^Thorium_MacOS_ARM64\.dmg$/i, platform: "macos", arch: "arm64", kind: "dmg", label: "Disk image", recommended: true },
      { re: /^Thorium_MacOS_x64\.dmg$/i, platform: "macos", arch: "x64", kind: "dmg", label: "Disk image", recommended: true },
      { re: /_AVX2\.AppImage$/i, platform: "linux", arch: "x64", kind: "appimage", simd: "avx2", label: "AppImage (AVX2)", recommended: true },
      { re: /_AVX2\.deb$/i, platform: "linux", arch: "x64", kind: "deb", simd: "avx2", label: "Debian package (AVX2)" },
      { re: /_AVX2\.rpm$/i, platform: "linux", arch: "x64", kind: "rpm", simd: "avx2", label: "RPM package (AVX2)" },
      { re: /_AVX\.AppImage$/i, platform: "linux", arch: "x64", kind: "appimage", simd: "avx", label: "AppImage (AVX)" },
      { re: /_AVX\.deb$/i, platform: "linux", arch: "x64", kind: "deb", simd: "avx", label: "Debian package (AVX)" },
      { re: /_AVX\.rpm$/i, platform: "linux", arch: "x64", kind: "rpm", simd: "avx", label: "RPM package (AVX)" },
      { re: /_AVX512\.AppImage$/i, platform: "linux", arch: "x64", kind: "appimage", simd: "avx512", label: "AppImage (AVX-512)" },
      { re: /_SSE3\.AppImage$/i, platform: "linux", arch: "x64", kind: "appimage", simd: "sse3", label: "AppImage (SSE3)" },
      { re: /_SSE4\.AppImage$/i, platform: "linux", arch: "x64", kind: "appimage", simd: "sse4", label: "AppImage (SSE4)" },
      { re: /_SSE3\.deb$/i, platform: "linux", arch: "x64", kind: "deb", simd: "sse3", label: "Debian package (SSE3)" },
      { re: /_SSE4\.deb$/i, platform: "linux", arch: "x64", kind: "deb", simd: "sse4", label: "Debian package (SSE4)" },
      { re: /_arm64\.AppImage$/i, platform: "linux", arch: "arm64", kind: "appimage", label: "AppImage", recommended: true },
      { re: /_arm64\.deb$/i, platform: "linux", arch: "arm64", kind: "deb", label: "Debian package" },
      { re: /_arm64\.rpm$/i, platform: "linux", arch: "arm64", kind: "rpm", label: "RPM package" },
      { re: /_i386\.deb$/i, platform: "linux", arch: "x86", kind: "deb", label: "Debian package (32-bit)", recommended: true },
      { re: /_i386\.rpm$/i, platform: "linux", arch: "x86", kind: "rpm", label: "RPM package (32-bit)" },
      { re: /^Thorium_Public_arm64\.apk$/i, platform: "android", arch: "arm64", kind: "apk", label: "APK", recommended: true },
      { re: /^Thorium_Public_arm32\.apk$/i, platform: "android", arch: "arm32", kind: "apk", label: "APK (32-bit)", recommended: true },
    ],
    notes: [
      "Alex313031 stepped back from the project. gz83 is publishing current builds.",
      "Pick AVX2 unless your CPU predates roughly 2013.",
    ],
  },
  {
    id: "supermium",
    name: "Supermium",
    maintainer: "win32ss",
    maintainerUrl: "https://github.com/win32ss",
    repo: "win32ss/supermium",
    homepage: "https://win32subsystem.live/supermium/",
    blurb:
      "A Chromium fork backported to run on Windows XP, Vista, 7, 8 and 8.1, while staying close to a modern rendering engine. The only maintained option for genuinely old Windows.",
    channel: "stable",
    google: "sync",
    proprietaryCodecs: true,
    hevc: false,
    widevine: false,
    assets: [
      { re: /_64_setup_win10_11\.exe$/i, platform: "windows", arch: "x64", kind: "installer", label: "Installer (Windows 10/11)" },
      { re: /_64_setup\.exe$/i, platform: "windows", arch: "x64", kind: "installer", label: "Installer (64-bit)", recommended: true },
      { re: /_64_nonsetup\.zip$/i, platform: "windows", arch: "x64", kind: "portable", label: "Portable (64-bit)" },
      { re: /_32_setup\.exe$/i, platform: "windows", arch: "x86", kind: "installer", label: "Installer (32-bit)", recommended: true },
      { re: /_32_nonsetup\.zip$/i, platform: "windows", arch: "x86", kind: "portable", label: "Portable (32-bit)" },
    ],
    notes: [
      "Runs on Windows XP and later. Nothing else current does.",
      "Supports Google sign-in and sync.",
    ],
  },
];

/** Official automated builds straight from the Chromium build bots. */
export interface SnapshotSource {
  id: string;
  /** URL segment under /chromium/, and the anchor the platform detector reveals. */
  slug: string;
  /** Heading shown above the download, naming the oldest OS the build still runs on. */
  title: string;
  /** One sentence a non-expert can check themselves before downloading. */
  requirement: string;
  bucketPlatform: string;
  platform: Platform;
  arch: Arch;
  file: string;
  kind: PkgKind;
  label: string;
}

export const SNAPSHOT_SOURCES: SnapshotSource[] = [
  { id: "snapshot-win-x64", slug: "windows", title: "Windows 64-bit", requirement: "Windows 11 or Windows 10 on a 64-bit Intel or AMD processor. This is the right choice for almost every Windows PC.", bucketPlatform: "Win_x64", platform: "windows", arch: "x64", file: "chrome-win.zip", kind: "archive", label: "Archive (zip)" },
  { id: "snapshot-win-arm64", slug: "windows-arm", title: "Windows on ARM", requirement: "Windows 11 on an ARM processor, such as a Snapdragon-based Copilot+ PC. Choose the 64-bit build instead if you are unsure.", bucketPlatform: "Win_Arm64", platform: "windows", arch: "arm64", file: "chrome-win.zip", kind: "archive", label: "Archive (zip)" },
  { id: "snapshot-win-x86", slug: "windows-32-bit", title: "Windows 32-bit", requirement: "A 32-bit installation of Windows. Almost no current PC needs this, so choose the 64-bit build unless you know yours is 32-bit.", bucketPlatform: "Win", platform: "windows", arch: "x86", file: "chrome-win.zip", kind: "archive", label: "Archive (zip)" },
  { id: "snapshot-mac-x64", slug: "mac", title: "macOS on Intel", requirement: "A Mac with an Intel processor. If your Mac has Apple silicon, use the Apple silicon build instead.", bucketPlatform: "Mac", platform: "macos", arch: "x64", file: "chrome-mac.zip", kind: "archive", label: "Archive (zip)" },
  { id: "snapshot-mac-arm64", slug: "mac-arm", title: "macOS on Apple silicon", requirement: "A Mac with an M1 processor or newer. This is the right choice for every Mac sold since late 2020.", bucketPlatform: "Mac_Arm", platform: "macos", arch: "arm64", file: "chrome-mac.zip", kind: "archive", label: "Archive (zip)" },
  { id: "snapshot-linux-x64", slug: "linux", title: "Linux 64-bit", requirement: "A 64-bit Linux distribution with a desktop environment. Your package manager may already offer a more convenient Chromium.", bucketPlatform: "Linux_x64", platform: "linux", arch: "x64", file: "chrome-linux.zip", kind: "archive", label: "Archive (zip)" },
  { id: "snapshot-android", slug: "android", title: "Android", requirement: "Android 10 or newer. The file is an APK you install yourself, which Android asks you to allow the first time.", bucketPlatform: "Android", platform: "android", arch: "arm32", file: "chrome-android.zip", kind: "archive", label: "Archive (zip)" },
];

export const SNAPSHOT_META = {
  name: "Official Chromium snapshot",
  maintainer: "The Chromium Authors",
  maintainerUrl: "https://www.chromium.org/",
  blurb:
    "The raw output of Google's own build bots, published for every commit to the Chromium main branch. Completely untested, no auto-update, no proprietary codecs, no Widevine, and no installer. Use it to check whether a bug is already fixed upstream, not as your everyday browser.",
  notes: [
    "Built from an arbitrary commit. No release testing of any kind has happened.",
    "No auto-update. You are responsible for replacing it yourself.",
    "Open codecs only, and no Widevine, so most streaming video will not play.",
  ],
};

/** Distro packages resolved through the Repology API. */
export const REPOLOGY_PROJECTS = ["chromium", "ungoogled-chromium"] as const;

/** Repology repo id -> human name. Anything unlisted is skipped rather than guessed at. */
export const DISTRO_NAMES: Record<string, string> = {
  arch: "Arch Linux",
  aur: "Arch User Repository",
  debian_13: "Debian 13 (trixie)",
  debian_12: "Debian 12 (bookworm)",
  debian_unstable: "Debian unstable (sid)",
  ubuntu_24_04: "Ubuntu 24.04 LTS",
  ubuntu_26_04: "Ubuntu 26.04 LTS",
  ubuntu_25_10: "Ubuntu 25.10",
  fedora_41: "Fedora 41",
  fedora_42: "Fedora 42",
  fedora_43: "Fedora 43",
  fedora_rawhide: "Fedora Rawhide",
  opensuse_tumbleweed: "openSUSE Tumbleweed",
  opensuse_leap_15_6: "openSUSE Leap 15.6",
  gentoo: "Gentoo",
  alpine_edge: "Alpine Edge",
  alpine_3_24: "Alpine 3.24",
  freebsd: "FreeBSD Ports",
  openbsd: "OpenBSD Ports",
  netbsd_pkgsrc_current: "NetBSD pkgsrc",
  manjaro_stable: "Manjaro (stable)",
  void_x86_64: "Void Linux",
  nix_unstable: "nixpkgs unstable",
  nix_stable_25_05: "nixpkgs stable",
  flathub: "Flathub",
  homebrew_casks: "Homebrew Cask",
  chocolatey: "Chocolatey",
  winget: "winget",
  scoop: "Scoop",
  mageia_cauldron: "Mageia Cauldron",
  slackbuilds: "SlackBuilds",
  solus: "Solus",
  gnuguix: "GNU Guix",
  pclinuxos: "PCLinuxOS",
  openmandriva_rolling: "OpenMandriva Rolling",
  raspbian_stable: "Raspberry Pi OS",
  termux: "Termux",
  macports: "MacPorts",
};

/** Install commands, keyed by the Repology repo id they correspond to. */
export const INSTALL_COMMANDS: Record<string, { chromium?: string; ungoogled?: string }> = {
  arch: { chromium: "sudo pacman -S chromium" },
  aur: { ungoogled: "yay -S ungoogled-chromium-bin" },
  debian_13: { chromium: "sudo apt install chromium" },
  debian_12: { chromium: "sudo apt install chromium" },
  debian_unstable: { chromium: "sudo apt install chromium" },
  ubuntu_24_04: { chromium: "sudo snap install chromium" },
  ubuntu_26_04: { chromium: "sudo snap install chromium" },
  fedora_42: { chromium: "sudo dnf install chromium" },
  fedora_43: { chromium: "sudo dnf install chromium" },
  fedora_41: { chromium: "sudo dnf install chromium" },
  opensuse_tumbleweed: { chromium: "sudo zypper install chromium" },
  opensuse_leap_15_6: { chromium: "sudo zypper install chromium" },
  gentoo: { chromium: "sudo emerge www-client/chromium" },
  alpine_edge: { chromium: "sudo apk add chromium" },
  alpine_3_24: { chromium: "sudo apk add chromium" },
  freebsd: { chromium: "sudo pkg install chromium", ungoogled: "sudo pkg install ungoogled-chromium" },
  openbsd: { chromium: "doas pkg_add chromium" },
  netbsd_pkgsrc_current: { chromium: "pkgin install chromium" },
  manjaro_stable: { chromium: "sudo pacman -S chromium" },
  void_x86_64: { chromium: "sudo xbps-install -S chromium" },
  nix_unstable: { chromium: "nix-env -iA nixpkgs.chromium", ungoogled: "nix-env -iA nixpkgs.ungoogled-chromium" },
  nix_stable_25_05: { chromium: "nix-env -iA nixpkgs.chromium" },
  flathub: {
    chromium: "flatpak install flathub org.chromium.Chromium",
    ungoogled: "flatpak install flathub io.github.ungoogled_software.ungoogled_chromium",
  },
  homebrew_casks: { chromium: "brew install --cask chromium", ungoogled: "brew install --cask eloston-chromium" },
  chocolatey: { chromium: "choco install chromium", ungoogled: "choco install ungoogled-chromium" },
  winget: { chromium: "winget install Hibbiki.Chromium", ungoogled: "winget install eloston.ungoogled-chromium" },
  scoop: { chromium: "scoop install chromium" },
  solus: { chromium: "sudo eopkg install chromium" },
  gnuguix: { chromium: "guix install ungoogled-chromium" },
  macports: { chromium: "sudo port install chromium" },
  termux: { chromium: "pkg install chromium" },
};

export const _unused = skipNothing;
