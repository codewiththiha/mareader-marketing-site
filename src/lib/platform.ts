/**
 * Which system is asking, so the hero offers one file instead of seven.
 * Rules and the honest limits of browser sniffing: docs/platform.md.
 */

export type Os = 'macos' | 'windows' | 'linux' | 'unknown';
export type Arch = 'arm64' | 'x64' | 'unknown';

export interface Platform {
  os: Os;
  arch: Arch;
  /** True when the browser told us the architecture rather than us guessing. */
  archConfirmed: boolean;
  /** Phones and tablets get every download; the app is a desktop one. */
  mobile: boolean;
  /** What to show beside the button, e.g. "macOS · Apple silicon". */
  label: string;
}

interface UaData {
  platform?: string;
  mobile?: boolean;
  getHighEntropyValues?: (hints: string[]) => Promise<{ architecture?: string; bitness?: string }>;
}

function userAgentData(): UaData | undefined {
  return (navigator as Navigator & { userAgentData?: UaData }).userAgentData;
}

function detectOs(ua: UaData | undefined, platform: string, agent: string): Os {
  const hint = (ua?.platform ?? platform).toLowerCase();
  if (hint.includes('mac')) return 'macos';
  if (hint.includes('win')) return 'windows';
  if (/linux|x11|cros/.test(hint) || /linux/.test(agent.toLowerCase())) {
    return /android/.test(agent.toLowerCase()) ? 'unknown' : 'linux';
  }
  return 'unknown';
}

function isMobile(ua: UaData | undefined, agent: string): boolean {
  if (typeof ua?.mobile === 'boolean') return ua.mobile;
  return /android|iphone|ipad|ipod|mobile/i.test(agent);
}

export function detectPlatform(): Platform {
  const ua = userAgentData();
  const agent = navigator.userAgent;
  const os = detectOs(ua, navigator.platform ?? '', agent);
  const mobile = isMobile(ua, agent);

  // ARM is the common Mac; Intel is offered one line below (docs/platform.md).
  const arch: Arch =
    os === 'macos' ? 'arm64' : os === 'linux' || os === 'windows' ? 'x64' : 'unknown';

  return { os, arch, archConfirmed: false, mobile, label: '' };
}

/** Refines the guess where the browser allows it (Chromium's UA-CH today). */
export async function refinePlatform(base: Platform): Promise<Platform> {
  const hints = userAgentData()?.getHighEntropyValues;
  if (!hints || base.os !== 'macos') return base;
  try {
    const values = await hints(['architecture', 'bitness']);
    const arm = values.architecture === 'arm';
    const next: Platform = {
      ...base,
      arch: arm ? 'arm64' : 'x64',
      archConfirmed: true,
    };
    return { ...next, label: platformLabel(next) };
  } catch {
    return base;
  }
}

export function platformLabel(platform: Platform): string {
  const names: Record<Os, string> = {
    macos: 'macOS',
    windows: 'Windows',
    linux: 'Linux',
    unknown: 'your system',
  };
  if (platform.os === 'macos' && platform.arch !== 'unknown') {
    return `${names.macos} · ${platform.arch === 'arm64' ? 'Apple silicon' : 'Intel'}`;
  }
  return names[platform.os];
}
