import type { Appearance } from "@/lib/palette";
import type { StyleObject } from "@/lib/style";

const NOISE_SVG =
  "<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='2' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>";

export const NOISE = `url("data:image/svg+xml;utf8,${encodeURIComponent(NOISE_SVG)}")`;

export function textureStyle(look: Appearance, dark: boolean): StyleObject | null {
  if (look.texture === "none") return null;
  const s = look.textureScale / 100 || 1;
  const op = look.textureOpacity / 100;
  const stroke = dark ? "rgba(255,255,255,0.16)" : "rgba(0,0,0,0.16)";
  if (look.texture === "paper") {
    return {
      backgroundImage: NOISE,
      backgroundSize: `${180 * s}px ${180 * s}px`,
      mixBlendMode: dark ? "screen" : "multiply",
      opacity: op * (dark ? 0.22 : 0.42),
    };
  }
  if (look.texture === "lined") {
    return {
      backgroundImage: `repeating-linear-gradient(180deg, transparent 0 ${26 * s - 1}px, ${stroke} ${26 * s - 1}px ${26 * s}px)`,
      opacity: op,
    };
  }
  if (look.texture === "grid") {
    return {
      backgroundImage: `repeating-linear-gradient(180deg, transparent 0 ${26 * s - 1}px, ${stroke} ${26 * s - 1}px ${26 * s}px), repeating-linear-gradient(90deg, transparent 0 ${26 * s - 1}px, ${stroke} ${26 * s - 1}px ${26 * s}px)`,
      opacity: op,
    };
  }
  if (look.texture === "dotted") {
    return {
      backgroundImage: `radial-gradient(${stroke} 0.6px, transparent 0.9px)`,
      backgroundSize: `${8 * s}px ${8 * s}px`,
      opacity: op,
    };
  }
  return {
    backgroundImage: `linear-gradient(${stroke}, ${stroke}), linear-gradient(${stroke}, ${stroke})`,
    backgroundSize: `${5 * s}px 1px, 1px ${5 * s}px`,
    backgroundPosition: `${10.5 * s}px ${13 * s}px, ${13 * s}px ${10.5 * s}px`,
    backgroundRepeat: "repeat",
    opacity: op,
    WebkitMaskImage: `radial-gradient(circle at ${13 * s}px ${13 * s}px, black ${4 * s}px, transparent ${4.2 * s}px)`,
    WebkitMaskSize: `${26 * s}px ${26 * s}px`,
    maskImage: `radial-gradient(circle at ${13 * s}px ${13 * s}px, black ${4 * s}px, transparent ${4.2 * s}px)`,
    maskSize: `${26 * s}px ${26 * s}px`,
  };
}

export function grainStyle(look: Appearance, dark: boolean): StyleObject | null {
  if (look.noise === "off") return null;
  return {
    backgroundImage: NOISE,
    backgroundSize: "180px 180px",
    mixBlendMode: dark ? "screen" : "multiply",
    opacity: (look.noiseIntensity / 100) * (dark ? 0.35 : 0.3),
    animation: look.noise === "animated" ? "grain-crawl 0.5s steps(6) infinite" : undefined,
  };
}
