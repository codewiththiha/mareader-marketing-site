/** Platform-aware download picks, resolved from the embedded release snapshot. */
import { RELEASES } from "./releases";

export type Os = "mac" | "windows" | "linux" | "unknown";

export interface Pick {
  id: string;
  label: string;
  sub: string;
  url: string;
}

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

const latest = RELEASES[0];
const asset = (test: (n: string) => boolean) => latest.assets.find((a) => test(a.name));

function picks(): Record<Exclude<Os, "unknown">, Pick[]> {
  const dmgArm = asset((n) => n.endsWith("_aarch64.dmg"));
  const dmgX64 = asset((n) => n.endsWith("_x64.dmg"));
  const exe = asset((n) => n.endsWith("-setup.exe"));
  const msi = asset((n) => n.endsWith(".msi"));
  const appimage = asset((n) => n.endsWith(".AppImage"));
  const deb = asset((n) => n.endsWith("_amd64.deb"));
  const tar = asset((n) => n.endsWith(".tar.gz"));
  const at = (a: typeof dmgArm, id: string, label: string, sub: string): Pick => ({
    id,
    label,
    sub,
    url: a?.url ?? `https://github.com/codewiththiha/mareader2/releases/latest`,
  });
  return {
    mac: [at(dmgArm, "mac-arm", "Apple silicon", ".dmg · arm64"), at(dmgX64, "mac-x64", "Intel", ".dmg · x64")],
    windows: [at(exe, "win-exe", "Installer", ".exe · x64"), at(msi, "win-msi", "MSI", ".msi · x64")],
    linux: [
      at(appimage, "linux-app", "AppImage", "x86_64"),
      at(deb, "linux-deb", "Debian package", ".deb · amd64"),
      at(tar, "linux-tar", "Portable", ".tar.gz"),
    ],
  };
}

const ALL = picks();

export function picksFor(os: Os): Pick[] {
  if (os === "unknown") return [ALL.windows[0], ALL.mac[0], ALL.linux[0]];
  return ALL[os];
}

export const latestTag = latest.tag;
export const releaseUrl = (tag = latest.tag) => `https://github.com/codewiththiha/mareader2/releases/tag/${tag}`;
