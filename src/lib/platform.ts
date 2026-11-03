// platform — pure detection helpers, no browser globals at import
export type OS = "mac" | "windows" | "linux" | "other";
export type Arch = "arm64" | "x64" | "";

export function osFromUA(ua: string): OS {
  if (/iphone|ipad|ipod|android/i.test(ua)) return "other";
  if (/mac os x|macintosh/i.test(ua)) return "mac";
  if (/windows nt/i.test(ua)) return "windows";
  if (/linux|x11/i.test(ua)) return "linux";
  return "other";
}

export function isMobileUA(ua: string): boolean {
  return /iphone|ipad|ipod|android|mobile/i.test(ua);
}

// every mac browser reports "Intel Mac OS X", even on Apple silicon
export function archFromGL(renderer: string): Arch {
  if (/apple m\d/i.test(renderer)) return "arm64";
  return "";
}

export function archFromUAData(platform: string, architecture: string): Arch {
  if (!architecture) return "";
  const arm = /^arm/i.test(architecture);
  if (platform === "macOS" || platform === "Windows") return arm ? "arm64" : "x64";
  return "";
}

// ?os=windows&arch=arm64 — every state reachable by name, for tests
export function overridesFromQuery(search: string): { os?: OS; arch?: Arch } {
  const p = new URLSearchParams(search);
  const os = p.get("os");
  const arch = p.get("arch");
  return {
    os: os && (KNOWN_OS as string[]).includes(os) ? (os as OS) : undefined,
    arch: arch === "arm64" || arch === "x64" ? arch : undefined
  };
}

const KNOWN_OS: OS[] = ["mac", "windows", "linux", "other"];
