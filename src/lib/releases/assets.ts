// assets — map release asset names to what a downloader needs
import type { Release, ReleaseAsset } from "./data";

export type AssetKind =
  | "mac-arm"
  | "mac-intel"
  | "win-exe"
  | "win-msi"
  | "linux-deb"
  | "linux-appimage"
  | "linux-arch"
  | "linux-pkgbuild"
  | "checksums";

const PATTERNS: [RegExp, AssetKind][] = [
  [/aarch64\.dmg$/i, "mac-arm"],
  [/x64\.dmg$/i, "mac-intel"],
  [/-setup\.exe$/i, "win-exe"],
  [/\.msi$/i, "win-msi"],
  [/amd64\.deb$/i, "linux-deb"],
  [/\.appimage$/i, "linux-appimage"],
  [/x86_64\.tar\.gz$/i, "linux-arch"],
  [/^pkgbuild$/i, "linux-pkgbuild"],
  [/^sha256sums$/i, "checksums"]
];

export function kindOf(name: string): AssetKind | null {
  for (const [re, kind] of PATTERNS) if (re.test(name)) return kind;
  return null;
}

export function assetOf(release: Release, kind: AssetKind): ReleaseAsset | undefined {
  return release.assets.find((a) => kindOf(a.name) === kind);
}

export function sizeLabel(bytes: number): string {
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

export function summaryOf(body: string): string {
  const para = body.split(/\n\s*\n/)[0] ?? "";
  return para.replace(/\s*\n\s*/g, " ").trim();
}
