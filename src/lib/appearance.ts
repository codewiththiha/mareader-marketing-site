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
