// assets — map release asset names to what a downloader needs
import type { Release, ReleaseAsset } from "./data";

export type AssetKind =
  | "mac-arm"
  | "mac-intel"
  | "win-exe"
  | "win-arm-exe"
  | "win-msi"
  | "linux-deb"
  | "linux-arm-deb"
  | "linux-appimage"
  | "linux-arm-appimage"
  | "linux-arch"
  | "linux-arm-arch"
  | "linux-pkgbuild"
  | "checksums";

const PATTERNS: [RegExp, AssetKind][] = [
  [/aarch64\.dmg$/i, "mac-arm"],
  [/x64\.dmg$/i, "mac-intel"],
  [/(?:x64|x86_64)-setup\.exe$/i, "win-exe"],
  [/(?:arm64|aarch64)-setup\.exe$/i, "win-arm-exe"],
  [/(?:^|[_-])(?:x64|x86_64|amd64)(?:[_-][^/]*)?\.msi$/i, "win-msi"],
  [/amd64\.deb$/i, "linux-deb"],
  [/(?:arm64|aarch64)\.deb$/i, "linux-arm-deb"],
  [/x86_64\.appimage$/i, "linux-appimage"],
  [/(?:arm64|aarch64)\.appimage$/i, "linux-arm-appimage"],
  [/x86_64\.tar\.gz$/i, "linux-arch"],
  [/(?:arm64|aarch64)\.tar\.gz$/i, "linux-arm-arch"],
  [/^pkgbuild$/i, "linux-pkgbuild"],
  [/^sha256sums$/i, "checksums"]
];

export function kindOf(name: string): AssetKind | null {
  for (const [re, kind] of PATTERNS) if (re.test(name)) return kind;
  return null;
}

export function guideForFile(name: string): "mac" | "windows" | undefined {
  const kind = kindOf(name);
  if (kind === "mac-arm" || kind === "mac-intel") return "mac";
  if (kind === "win-exe" || kind === "win-arm-exe" || kind === "win-msi") return "windows";
  if (!/^mareader(?:[._-]|$)/i.test(name)) return undefined;
  if (/\.(dmg|pkg)$/i.test(name)) return "mac";
  if (/\.(exe|msi)$/i.test(name)) return "windows";
  return undefined;
}

export function assetOf(release: Release, kind: AssetKind): ReleaseAsset | undefined {
  return release.assets.find((a) => kindOf(a.name) === kind);
}

export function sizeLabel(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  const mb = bytes / (1024 * 1024);
  return `${mb >= 10 ? Math.round(mb) : mb.toFixed(1)} MB`;
}

export function dateLabel(iso: string): string {
  const d = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export function versionOf(tag: string): string {
  return tag.replace(/^v/, "");
}
