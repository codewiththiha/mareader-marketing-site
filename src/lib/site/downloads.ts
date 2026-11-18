/** Platform download matrix, resolved from the embedded release snapshot. */
import { GH, OS_LABEL, parseArm, parseOs, type Arch, type KnownOs, type Os } from "./os";
import { RELEASES } from "./releases";
import type { ReleaseAsset } from "./releases-type";

export { GH, OS_LABEL, parseArm, parseOs, type Arch, type KnownOs, type Os };

export interface DlOption {
  id: string;
  label: string;
  hint: string;
  size: string;
  url: string;
  arch: Arch;
}

export interface DlGroup {
  os: KnownOs;
  requires: string;
  note: string;
  options: DlOption[];
}

const latest = RELEASES[0];
const FALLBACK = `${GH}/releases/latest`;
const find = (test: (n: string) => boolean) => latest.assets.find((a) => test(a.name));
const mb = (n?: number) => (n ? `${(n / 1048576).toFixed(1)} MB` : "");

function opt(a: ReleaseAsset | undefined, id: string, label: string, hint: string, arch: Arch): DlOption {
  return { id, label, hint, size: mb(a?.size), url: a?.url ?? FALLBACK, arch };
}

const winX64 = find((n) => /_x64-setup\.exe$/i.test(n));
const winArm = find((n) => /_arm64-setup\.exe$/i.test(n));
const winMsi = find((n) => /_x64_en-US\.msi$/i.test(n) || /\.msi$/i.test(n));

export const GROUPS: DlGroup[] = [
  {
    os: "mac",
    requires: "macOS 11 or later · Apple silicon or Intel",
    note: "Not notarized yet, so the first launch needs one approval — the guide that opens after you click has it.",
    options: [
      opt(
        find((n) => /_aarch64\.dmg$/i.test(n)),
        "mac-arm",
        "Apple silicon",
        "Macs from late 2020 on",
        "arm",
      ),
      opt(
        find((n) => /_x64\.dmg$/i.test(n)),
        "mac-x64",
        "Intel",
        "Older Macs",
        "x64",
      ),
    ],
  },
  {
    os: "windows",
    requires: "Windows 10 or 11 · x64 or ARM64",
    note: "SmartScreen will ask once — More info, then Run anyway. Nothing needs an administrator.",
    options: [
      opt(winX64, "win-exe", "x64 installer", "Intel and AMD PCs", "x64"),
      opt(winArm, "win-arm-exe", "ARM64 installer", "Snapdragon and other ARM PCs", "arm"),
      opt(winMsi, "win-msi", "x64 MSI", "For managed machines", "x64"),
    ],
  },
  {
    os: "linux",
    requires: "glibc 2.35 or newer · x64 or ARM64",
    note: "Every build is x64 or ARM64. The AppImage only needs chmod +x; Arch builds run makepkg against the PKGBUILD.",
    options: [
      opt(
        find((n) => /_x86_64\.AppImage$/i.test(n)),
        "linux-app",
        "x64 AppImage",
        "Almost every distro",
        "x64",
      ),
      opt(
        find((n) => /_aarch64\.AppImage$/i.test(n)),
        "linux-arm-app",
        "ARM64 AppImage",
        "ARM laptops and boards",
        "arm",
      ),
      opt(
        find((n) => /_amd64\.deb$/i.test(n)),
        "linux-deb",
        "x64 .deb",
        "Debian, Ubuntu, Mint, Pop!_OS",
        "x64",
      ),
      opt(
        find((n) => /_arm64\.deb$/i.test(n)),
        "linux-arm-deb",
        "ARM64 .deb",
        "The same distros on ARM",
        "arm",
      ),
      opt(
        find((n) => /_x86_64\.tar\.gz$/i.test(n)),
        "linux-tar",
        "x64 tarball",
        "Arch and its family",
        "x64",
      ),
      opt(
        find((n) => /_aarch64\.tar\.gz$/i.test(n)),
        "linux-arm-tar",
        "ARM64 tarball",
        "Arch and its family",
        "arm",
      ),
    ],
  },
];

export function groupFor(os: Os): DlGroup {
  return GROUPS.find((g) => g.os === os) ?? GROUPS[0];
}

export function primaryFor(os: Os, arm: boolean): DlOption {
  const g = groupFor(os);
  return g.options.find((o) => o.arch === (arm ? "arm" : "x64")) ?? g.options[0];
}

export function archLabel(os: Os, arm: boolean): string {
  if (os === "mac") return arm ? "Apple silicon" : "Intel";
  return arm ? "ARM64" : "x64";
}

export const latestTag = latest.tag;
export const latestDate = latest.published;
export const checksumsUrl = find((n) => n === "SHA256SUMS")?.url ?? FALLBACK;
export const releaseUrl = (tag = latestTag) => `${GH}/releases/tag/${tag}`;
