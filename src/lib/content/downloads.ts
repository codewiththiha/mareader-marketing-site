/**
 * Every file the current release publishes, and how each one installs.
 * Names match `docs/releases/v0.0.5.md` in the app repository. Bump VERSION and
 * this table together; docs/donations.md is unrelated, docs/releases.md says how.
 */

import type { Arch, Os } from '../platform';

export const VERSION = '0.0.5';
const ASSETS = `https://github.com/codewiththiha/mareader2/releases/download/v${VERSION}`;

export interface DownloadFile {
  os: Exclude<Os, 'unknown'>;
  /** `null` when the system has a single build. */
  arch: Arch | null;
  file: string;
  /** One line, in the reader's terms. */
  note: string;
  /** The command or gesture that installs it, when there is one. */
  install: string;
}

export const files: DownloadFile[] = [
  {
    os: 'macos',
    arch: 'arm64',
    file: `Mareader_${VERSION}_aarch64.dmg`,
    note: 'Apple silicon — M1 and later',
    install: 'Open the disk image, then drag Mareader to Applications.',
  },
  {
    os: 'macos',
    arch: 'x64',
    file: `Mareader_${VERSION}_x64.dmg`,
    note: 'Intel Macs',
    install: 'Open the disk image, then drag Mareader to Applications.',
  },
  {
    os: 'windows',
    arch: 'x64',
    file: `mareader_${VERSION}_x64-setup.exe`,
    note: 'Windows 10 and 11',
    install: 'Run it. It installs for your account alone, with no administrator needed.',
  },
  {
    os: 'windows',
    arch: 'x64',
    file: `mareader_${VERSION}_x64_en-US.msi`,
    note: 'Windows, managed machines',
    install: 'msiexec /i the file, or deploy it the way your network does.',
  },
  {
    os: 'linux',
    arch: 'x64',
    file: `mareader_${VERSION}_amd64.deb`,
    note: 'Debian, Ubuntu, Mint, Pop!_OS',
    install: 'sudo apt install ./mareader_' + VERSION + '_amd64.deb',
  },
  {
    os: 'linux',
    arch: 'x64',
    file: `mareader_${VERSION}_x86_64.AppImage`,
    note: 'Any other Linux, glibc 2.35 or newer',
    install: 'chmod +x the file, then run it.',
  },
  {
    os: 'linux',
    arch: 'x64',
    file: `mareader_${VERSION}_x86_64.tar.gz`,
    note: 'Arch and its family, with the PKGBUILD',
    install: 'Put both files in one folder, then makepkg -si.',
  },
];

export function assetUrl(file: string): string {
  return `${ASSETS}/${file}`;
}

/** Where a compact "Download" button should go: the file, or the list. */
export function downloadHref(os: Os, arch: Arch): string {
  const { primary } = pick(os, arch);
  return primary ? assetUrl(primary.file) : latestRelease;
}

/** The single file to lead with, plus the rest for that system. */
export function pick(os: Os, arch: Arch): { primary: DownloadFile | null; others: DownloadFile[] } {
  const forOs = files.filter((entry) => entry.os === os);
  if (forOs.length === 0) return { primary: null, others: [] };
  const exact = forOs.find((entry) => entry.arch === arch) ?? forOs[0];
  return { primary: exact, others: forOs.filter((entry) => entry !== exact) };
}

export const releasesPage = 'https://github.com/codewiththiha/mareader2/releases';
export const latestRelease = `${releasesPage}/latest`;

export const sourceRepo = 'https://github.com/codewiththiha/mareader2';
