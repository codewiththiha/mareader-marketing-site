/** Lightweight OS detection and labels shared without loading the release archive. */
export type Os = "mac" | "windows" | "linux" | "unknown";
export type KnownOs = Exclude<Os, "unknown">;
export type Arch = "arm" | "x64";

export const GH = "https://github.com/codewiththiha/mareader";
export const LATEST_TAG = "v0.0.7";
export const releaseTagUrl = (tag = LATEST_TAG) => `${GH}/releases/tag/${tag}`;

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
  return /arm64|aarch64|apple silicon|armv8/i.test(ua + uaFull);
}
