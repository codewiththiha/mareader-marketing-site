// downloads — the best file for one system, in one place
import { assetOf, sizeLabel, type AssetKind } from "./releases/assets";
import { releases } from "./releases/refresh.svelte";
import type { ReleaseAsset } from "./releases/data";
import type { OS } from "./platform";

export interface Best {
  kind: AssetKind;
  asset: ReleaseAsset;
  os: "mac" | "windows" | "linux";
  meta: string;
}

const META: Record<string, string> = {
  "mac-arm": "Apple Silicon · DMG",
  "mac-intel": "Intel · DMG",
  "win-exe": "Windows 10/11 · installer",
  "win-msi": "MSI · managed machines",
  "linux-deb": "Debian/Ubuntu · .deb"
};

export function bestFor(os: OS, arch: "arm64" | "x64" | "", altKind?: AssetKind): Best | null {
  if (os !== "mac" && os !== "windows" && os !== "linux") return null;
  const rel = releases.latest;
  if (!rel) return null;
  const kind: AssetKind =
    altKind ??
    (os === "mac"
      ? arch === "x64"
        ? "mac-intel"
        : "mac-arm"
      : os === "windows"
        ? "win-exe"
        : "linux-deb");
  const asset = assetOf(rel, kind);
  if (!asset) return null;
  return {
    kind,
    asset,
    os,
    meta: `${META[kind] ?? kind} · ${sizeLabel(asset.size)} · ${rel.tag}`
  };
}

export const OS_LABEL: Record<string, string> = {
  mac: "macOS",
  windows: "Windows",
  linux: "Linux"
};

export const KIND_LABEL: Record<string, string> = {
  "mac-arm": "macOS · Apple Silicon",
  "mac-intel": "macOS · Intel",
  "win-exe": "Windows · installer",
  "win-msi": "Windows · MSI",
  "linux-deb": "Debian / Ubuntu",
  "linux-appimage": "AppImage · any Linux",
  "linux-arch": "Arch · tar.gz",
  "linux-pkgbuild": "Arch · PKGBUILD",
  checksums: "Checksums"
};

export const FIRST_LAUNCH: Record<string, string> = {
  mac: "Not signed by Apple yet: if macOS hesitates, open System Settings › Privacy & Security and choose Open Anyway. Once is enough.",
  windows:
    "Not signed by Microsoft yet: if SmartScreen asks, choose More info, then Run anyway. Once is enough.",
  linux: "Nothing to approve. The AppImage only needs chmod +x; the .deb installs as usual."
};
