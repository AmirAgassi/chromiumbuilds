export type Platform = "windows" | "macos" | "linux" | "android" | "bsd" | "chromeos";
export type Arch = "x64" | "arm64" | "x86" | "arm32" | "universal";
export type Channel = "stable" | "beta" | "dev" | "snapshot" | "legacy";
export type GoogleMode = "sync" | "nosync" | "ungoogled" | "raw";
export type Simd = "sse3" | "sse4" | "avx" | "avx2" | "avx512";
export type Freshness = "current" | "behind" | "outdated" | "abandoned";

export type PkgKind =
  | "installer" | "portable" | "archive" | "deb" | "rpm"
  | "appimage" | "apk" | "dmg" | "pkg" | "flatpak" | "snap";

export interface Download {
  kind: PkgKind;
  label: string;
  filename: string;
  url: string;
  size?: number;
  sha256?: string;
  arch: Arch;
  simd?: Simd;
  recommended?: boolean;
}

export interface Build {
  id: string;
  project: string;
  projectName: string;
  maintainer: string;
  platform: Platform;
  arch: Arch[];
  channel: Channel;
  version: string;
  milestone: number;
  revision?: string;
  releasedAt: string;
  google: GoogleMode;
  proprietaryCodecs: boolean;
  hevc: boolean;
  widevine: boolean;
  simd?: Simd;
  downloads: Download[];
  releaseUrl: string;
  sourceUrl: string;
  freshness: Freshness;
  ageDays: number;
  notes: string[];
}

export interface Upstream {
  stable: { version: string; milestone: number; revision: string };
  beta: { version: string; milestone: number; revision: string };
  dev: { version: string; milestone: number; revision: string };
  canary: { version: string; milestone: number; revision: string };
  fetchedAt: string;
}

/** One official snapshot revision, as published by Google's build bots. */
export interface SnapshotRelease {
  revision: string;
  version: string;
  /** Major version. Present on every row; the history offers one build per milestone. */
  milestone?: number;
  commit: string;
  builtAt: string;
  size: number;
  url: string;
}

/** The snapshot history for one platform/arch target. */
export interface SnapshotTrack {
  id: string;
  slug: string;
  title: string;
  requirement: string;
  platform: Platform;
  arch: Arch;
  bucketPlatform: string;
  file: string;
  latest: SnapshotRelease;
  older: SnapshotRelease[];
}

export interface DistroPackage {
  repo: string;
  distro: string;
  version: string;
  status: string;
  package: string;
  project: "chromium" | "ungoogled-chromium";
}

export interface Manifest {
  generatedAt: string;
  upstream: Upstream;
  builds: Build[];
  snapshots: SnapshotTrack[];
  distros: DistroPackage[];
  errors: { source: string; message: string }[];
}
