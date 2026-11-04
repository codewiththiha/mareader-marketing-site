/** Platform download matrix, resolved from the embedded release snapshot. */
import { RELEASES } from "./releases";
import type { ReleaseAsset } from "./releases-type";

export type Os = "mac" | "windows" | "linux" | "unknown";
export type KnownOs = Exclude<Os, "unknown">;

export const OS_LABEL: Record<Os, string> = {
  mac: "macOS",
  windows: "Windows",
  linux: "Linux",
  unknown: "your system",
};

export function parseOs(ua: string, uadPlatform = ""): Os {
  const p = uadPlatform.toLowerCase();
  if (p.includes("mac") || /macintosh|mac os x/i.test(ua)) return "mac";
  if (p.includes("windows") || /windows/i.test(ua)) return "windows";
  if (p.includes("linux") || /linux|android/i.test(ua)) return "linux";
  return "unknown";
}

export function parseArm(ua: string, uaFull = ""): boolean {
  return /arm64|aarch64|apple silicon/i.test(ua + uaFull);
}

export interface DlOption {
  id: string;
  label: string;
  hint: string;
  size: string;
  url: string;
}

export interface DlGroup {
  os: KnownOs;
  requires: string;
  note: string;
  options: DlOption[];
}

const latest = RELEASES[0];
const FALLBACK = "https://github.com/codewiththiha/mareader2/releases/latest";
const find = (test: (n: string) => boolean) => latest.assets.find((a) => test(a.name));
const mb = (n?: number) => (n ? `${(n / 1048576).toFixed(1)} MB` : "");

function opt(a: ReleaseAsset | undefined, id: string, label: string, hint: string): DlOption {
  return { id, label, hint, size: mb(a?.size), url: a?.url ?? FALLBACK };
}

export const GROUPS: DlGroup[] = [
  {
    os: "mac",
    requires: "macOS 11 or later",
    note: "Not notarized yet: if macOS stops it, choose Open Anyway in System Settings › Privacy & Security.",
    options: [
      opt(
        find((n) => n.endsWith("_aarch64.dmg")),
        "mac-arm",
        "Apple silicon",
        "Macs from late 2020 on",
      ),
      opt(
        find((n) => n.endsWith("_x64.dmg")),
        "mac-x64",
        "Intel",
        "Older Macs",
      ),
    ],
  },
  {
    os: "windows",
    requires: "Windows 10 or 11",
    note: "If SmartScreen asks, choose More info, then Run anyway. The installer needs no administrator.",
    options: [
      opt(
        find((n) => n.endsWith("-setup.exe")),
        "win-exe",
        "Installer",
        "For you alone, no admin needed",
      ),
      opt(
        find((n) => n.endsWith(".msi")),
        "win-msi",
        "MSI",
        "For managed machines",
      ),
    ],
  },
  {
    os: "linux",
    requires: "glibc 2.35 or newer",
    note: "The AppImage only needs chmod +x. Arch builds live in the release as a PKGBUILD.",
    options: [
      opt(
        find((n) => n.endsWith(".AppImage")),
        "linux-app",
        "AppImage",
        "Almost every distro",
      ),
      opt(
        find((n) => n.endsWith("_amd64.deb")),
        "linux-deb",
        "Debian package",
        "Debian, Ubuntu, Mint, Pop!_OS",
      ),
      opt(
        find((n) => n.endsWith(".tar.gz")),
        "linux-tar",
        "Portable",
        "Arch and its family",
      ),
    ],
  },
];

export function groupFor(os: Os): DlGroup {
  return GROUPS.find((g) => g.os === os) ?? GROUPS[0];
}

export function primaryFor(os: Os, arm: boolean): DlOption {
  const g = groupFor(os);
  if (os === "mac" && !arm) return g.options[1] ?? g.options[0];
  return g.options[0];
}

export const latestTag = latest.tag;
export const latestDate = latest.published;
export const checksumsUrl = find((n) => n === "SHA256SUMS")?.url ?? FALLBACK;
export const releaseUrl = (tag = latestTag) => `https://github.com/codewiththiha/mareader2/releases/tag/${tag}`;
