/**
 * The appearance controls the home page exposes, and the names the app uses for
 * them. A control here that the app cannot do is a claim, not a demo — keep the
 * two lists equal. docs/design.md § The appearance lab.
 */

export type Mode = 'light' | 'dark' | 'dim' | 'black';
export type Tint = 'none' | 'sepia' | 'green' | 'night' | 'parchment';
export type TextureKind = 'paper' | 'lined' | 'grid' | 'dots';

export const modes: { id: Mode; label: string }[] = [
  { id: 'light', label: 'Light' },
  { id: 'dark', label: 'Dark' },
  { id: 'dim', label: 'Dim' },
  { id: 'black', label: 'Black' },
];

export const tints: { id: Tint; label: string; swatch: string }[] = [
  { id: 'none', label: 'None', swatch: 'transparent' },
  { id: 'sepia', label: 'Sepia', swatch: '#c8a06a' },
  { id: 'green', label: 'Green', swatch: '#6f9273' },
  { id: 'night', label: 'Night', swatch: '#5a6f9e' },
  { id: 'parchment', label: 'Parchment', swatch: '#cba76a' },
];

export const textures: { id: TextureKind | 'none'; label: string }[] = [
  { id: 'none', label: 'Smooth' },
  { id: 'paper', label: 'Paper' },
  { id: 'lined', label: 'Lined' },
  { id: 'grid', label: 'Grid' },
  { id: 'dots', label: 'Dotted' },
];

/** The window's colours, sampled from the app; dim keeps black ink. */
export interface WindowPalette {
  chrome: string;
  chromeInk: string;
  chromeMuted: string;
  rail: string;
  line: string;
  row: string;
  page: string;
  ink: string;
  accent: string;
  rule: string;
}

const bases: Record<Mode, WindowPalette> = {
  light: {
    chrome: '#f3f4f6',
    chromeInk: '#1f2937',
    chromeMuted: '#595f6d',
    rail: '#ebedef',
    line: '#dadce1',
    row: '#e2e4e7',
    page: '#ffffff',
    ink: '#000000',
    accent: '#1754db',
    rule: '#d97333',
  },
  dark: {
    chrome: '#17181b',
    chromeInk: '#e6e7ea',
    chromeMuted: '#9aa0a8',
    rail: '#141518',
    line: '#2a2c31',
    row: '#26282d',
    page: '#131316',
    ink: '#e9eaec',
    accent: '#7ea6ff',
    rule: '#a8622f',
  },
  dim: {
    chrome: '#1d2126',
    chromeInk: '#c3c6cb',
    chromeMuted: '#8d939b',
    rail: '#202328',
    line: '#2b2f35',
    row: '#2a2e34',
    page: '#35383d',
    ink: '#050606',
    accent: '#7ea6ff',
    rule: '#3d2a1c',
  },
  black: {
    chrome: '#000000',
    chromeInk: '#d8dade',
    chromeMuted: '#8b8f96',
    rail: '#060607',
    line: '#232427',
    row: '#1a1b1e',
    page: '#000000',
    ink: '#e6e7e9',
    accent: '#7ea6ff',
    rule: '#6d4522',
  },
};

const tintHues: Record<Exclude<Tint, 'none'>, string> = {
  sepia: '#c8a06a',
  green: '#6f9273',
  night: '#5a6f9e',
  parchment: '#cba76a',
};

function mix(base: string, hue: string, share: number): string {
  return `color-mix(in oklab, ${base}, ${hue} ${share}%)`;
}

/** The window's colours for a mode, tinted the way the app tints them. */
export function windowPalette(mode: Mode, tint: Tint): WindowPalette {
  const base = bases[mode];
  if (tint === 'none') return base;
  const hue = tintHues[tint];
  const share = mode === 'light' ? 16 : 11;
  return {
    ...base,
    page: mix(base.page, hue, share),
    ink: mix(base.ink, hue, share),
    rail: mix(base.rail, hue, Math.round(share * 0.5)),
    rule: mix(base.rule, hue, Math.round(share * 0.6)),
  };
}
