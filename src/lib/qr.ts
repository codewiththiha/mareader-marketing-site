/**
 * QR codes drawn as SVG we own, so they take the page's ink and paper colours
 * instead of arriving as a black PNG. Modules are dots and the three finder
 * patterns keep their exact 7-1-3 proportions, which is what scanners read;
 * error correction is high, since these codes sit in a card that a phone may
 * photograph at an angle. docs/donations.md § Codes.
 */

import QRCode from 'qrcode';

export interface QrDrawing {
  /** Size of the drawing in modules, quiet zone included. */
  extent: number;
  /** One path holding every data dot. */
  dots: string;
  /** The three finder patterns, at their module coordinates. */
  finders: { x: number; y: number }[];
}

const QUIET = 3;
const FINDER = 7;

function rounded(x: number, y: number, side: number, radius: number): string {
  const r = Math.min(radius, side / 2).toFixed(2);
  const straight = (side - 2 * Math.min(radius, side / 2)).toFixed(2);
  const px = x.toFixed(2);
  const py = y.toFixed(2);
  return (
    `M${px} ${py}m${r} 0h${straight}a${r} ${r} 0 0 1 ${r} ${r}v${straight}` +
    `a${r} ${r} 0 0 1 ${-r} ${r}h${-straight}a${r} ${r} 0 0 1 ${-r} ${-r}` +
    `v${-straight}a${r} ${r} 0 0 1 ${r} ${-r}z`
  );
}

function inFinder(x: number, y: number, size: number): boolean {
  return (
    (x < FINDER && y < FINDER) ||
    (x >= size - FINDER && y < FINDER) ||
    (x < FINDER && y >= size - FINDER)
  );
}

export function buildQr(value: string): QrDrawing {
  const symbol = QRCode.create(value, { errorCorrectionLevel: 'H' });
  const size = symbol.modules.size;
  const parts: string[] = [];

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      if (!symbol.modules.get(y, x) || inFinder(x, y, size)) continue;
      parts.push(rounded(QUIET + x + 0.075, QUIET + y + 0.075, 0.85, 0.33));
    }
  }

  return {
    extent: size + QUIET * 2,
    dots: parts.join(''),
    finders: [
      { x: QUIET, y: QUIET },
      { x: QUIET + size - FINDER, y: QUIET },
      { x: QUIET, y: QUIET + size - FINDER },
    ],
  };
}
