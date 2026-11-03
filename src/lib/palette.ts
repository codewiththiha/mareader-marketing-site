// Port of crates/appearance: sRGB ⇄ OKLCH, the seven UI tokens per base mode, tints and page palettes.
export type Base = "light" | "dark" | "dim" | "black";
export type Texture = "none" | "paper" | "lined" | "grid" | "dotted" | "cross";
export type Noise = "off" | "static" | "animated";

export interface Appearance {
	base: Base;
	hue: number;
	strength: number;
	texture: Texture;
	textureOpacity: number;
	textureScale: number;
	noise: Noise;
	noiseIntensity: number;
}

export const DEFAULT_LOOK: Appearance = {
	base: "light",
	hue: 34,
	strength: 0,
	texture: "none",
	textureOpacity: 90,
	textureScale: 100,
	noise: "off",
	noiseIntensity: 25
};

export const PRESETS: { id: string; name: string; look: Appearance }[] = [
	{ id: "sepia", name: "Sepia", look: { ...DEFAULT_LOOK, hue: 34, strength: 23 } },
	{ id: "green", name: "Green", look: { ...DEFAULT_LOOK, hue: 104, strength: 20 } },
	{ id: "night", name: "Night", look: { ...DEFAULT_LOOK, base: "dark", hue: 110, strength: 18 } },
	{
		id: "parchment",
		name: "Parchment",
		look: {
			...DEFAULT_LOOK,
			hue: 40,
			strength: 28,
			texture: "paper",
			textureOpacity: 85,
			textureScale: 110,
			noise: "static",
			noiseIntensity: 18
		}
	},
	{
		id: "cinema",
		name: "Cinema",
		look: { ...DEFAULT_LOOK, base: "dim", hue: 220, strength: 15, noise: "animated", noiseIntensity: 30 }
	}
];

export const HUES: [number, string][] = [
	[34, "Sepia"],
	[14, "Rose"],
	[104, "Green"],
	[160, "Mint"],
	[200, "Sky"],
	[240, "Blue"],
	[290, "Violet"]
];

export type Rgb = [number, number, number];
interface Oklch {
	l: number;
	c: number;
	h: number;
}

const FULL_TINT = 50;
const MAX_DARKEN = 0.06;
const SURFACE_GAP = 0.035;
const LINE_GAP = 0.05;

const s2l = (c: number) => (c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
const l2s = (c: number) => (c <= 0.0031308 ? c * 12.92 : 1.055 * Math.pow(c, 1 / 2.4) - 0.055);
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const toByte = (v: number) => Math.round(clamp01(v) * 255);

export function hex(rgb: Rgb): string {
	return "#" + rgb.map((v) => v.toString(16).padStart(2, "0")).join("");
}
function fromHex(h: string): Rgb {
	const s = h.replace("#", "");
	return [parseInt(s.slice(0, 2), 16), parseInt(s.slice(2, 4), 16), parseInt(s.slice(4, 6), 16)];
}

function toOklch([r8, g8, b8]: Rgb): Oklch {
	const [r, g, b] = [r8, g8, b8].map((c) => s2l(c / 255));
	const l = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b;
	const m = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b;
	const s = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b;
	const l_ = Math.cbrt(l),
		m_ = Math.cbrt(m),
		s_ = Math.cbrt(s);
	const L = 0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_;
	const A = 1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_;
	const B = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_;
	const hue = (Math.atan2(B, A) * 180) / Math.PI;
	return { l: L, c: Math.sqrt(A * A + B * B), h: ((hue % 360) + 360) % 360 };
}

function linearSrgb({ l, c, h }: Oklch): [number, number, number] {
	const L = clamp01(l);
	const C = Math.max(0, c);
	const rad = (h * Math.PI) / 180;
	const a = C * Math.cos(rad),
		b = C * Math.sin(rad);
	const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
	const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
	const s_ = L - 0.0894841775 * a - 1.291485548 * b;
	const lc = l_ ** 3,
		mc = m_ ** 3,
		sc = s_ ** 3;
	return [
		4.0767416621 * lc - 3.3077115913 * mc + 0.2309699292 * sc,
		-1.2684380046 * lc + 2.6097574011 * mc - 0.3413193965 * sc,
		-0.0041960863 * lc - 0.7034186147 * mc + 1.707614701 * sc
	];
}
function inGamut(o: Oklch): boolean {
	const eps = 1e-4;
	return linearSrgb(o).every((v) => v >= -eps && v <= 1 + eps);
}
function toRgb(o: Oklch): Rgb {
	return linearSrgb(o).map((v) => toByte(l2s(v))) as Rgb;
}
function toRgbInGamut(o: Oklch): Rgb {
	if (inGamut(o)) return toRgb(o);
	let lo = 0,
		hi = Math.max(0, o.c);
	for (let i = 0; i < 20; i++) {
		const mid = (lo + hi) / 2;
		if (inGamut({ ...o, c: mid })) lo = mid;
		else hi = mid;
	}
	return toRgb({ ...o, c: lo });
}
function maxChroma(o: Oklch): number {
	let lo = 0,
		hi = 0.4;
	for (let i = 0; i < 24; i++) {
		const mid = (lo + hi) / 2;
		if (inGamut({ ...o, c: mid })) lo = mid;
		else hi = mid;
	}
	return lo;
}

function uiHueOklch(srgbHue: number): number {
	const h = (((srgbHue % 360) + 360) % 360) / 60;
	const f = h - Math.floor(h);
	let rgb: [number, number, number];
	switch (Math.floor(h)) {
		case 0:
			rgb = [1, f, 0];
			break;
		case 1:
			rgb = [1 - f, 1, 0];
			break;
		case 2:
			rgb = [0, 1, f];
			break;
		case 3:
			rgb = [0, 1 - f, 1];
			break;
		case 4:
			rgb = [f, 0, 1];
			break;
		default:
			rgb = [1, 0, 1 - f];
	}
	return toOklch(rgb.map((v) => Math.round(v * 255)) as Rgb).h;
}

function dimmed(want: Oklch): Rgb {
	if (inGamut(want)) return toRgb(want);
	for (let i = 1; i <= 12; i++) {
		const o = { ...want, l: want.l - (MAX_DARKEN * i) / 12 };
		if (inGamut(o)) return toRgbInGamut(o);
	}
	return toRgbInGamut({ ...want, l: want.l - MAX_DARKEN });
}

function tinted(token: Rgb, h: number, t: number, maxC: number): Rgb {
	const { l, c } = toOklch(token);
	return dimmed({ l, c: c + (maxC - c) * t, h });
}

function apart(token: Rgb, from: Rgb, gap: number): Rgb {
	const lch = toOklch(token);
	const ground = toOklch(from).l;
	const up = lch.l >= ground;
	const target = up ? ground + gap : ground - gap;
	if ((up && lch.l >= target) || (!up && lch.l <= target)) return token;
	return toRgbInGamut({ ...lch, l: clamp01(target) });
}
function below(token: Rgb, from: Rgb, gap: number): Rgb {
	const lch = toOklch(token);
	const target = toOklch(from).l - gap;
	if (lch.l <= target) return token;
	return toRgbInGamut({ ...lch, l: Math.max(0, target) });
}

function luminance([r, g, b]: Rgb): number {
	const [R, G, B] = [r, g, b].map((c) => s2l(c / 255));
	return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}
function contrast(a: Rgb, b: Rgb): number {
	const x = luminance(a),
		y = luminance(b);
	return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}
function legible(ink: Rgb, grounds: Rgb[]): Rgb {
	const worst = (c: Rgb) => Math.min(...grounds.map((g) => contrast(c, g)));
	const light = grounds.reduce((s, g) => s + luminance(g), 0) / Math.max(1, grounds.length);
	const step = light > 0.18 ? -0.005 : 0.005;
	const lch = toOklch(ink);
	let out = ink;
	for (let i = 0; i < 80 && worst(out) < 4.5; i++) {
		lch.l = clamp01(lch.l + step);
		out = toRgbInGamut(lch);
	}
	return out;
}
function mix(a: Rgb, b: Rgb, k: number): Rgb {
	return a.map((v, i) => Math.round(v + (b[i] - v) * k)) as Rgb;
}

export interface Tokens {
	paper: Rgb;
	ink: Rgb;
	muted: Rgb;
	surface: Rgb;
	line: Rgb;
	accent: Rgb;
	accentSoft: Rgb;
	pagePaper: Rgb;
	pageInk: Rgb;
	card: Rgb;
	hover: Rgb;
	dark: boolean;
}

const BASES: Record<Base, Omit<Tokens, "pagePaper" | "pageInk" | "card" | "hover" | "dark">> = {
	light: {
		paper: fromHex("#ffffff"),
		ink: fromHex("#1f2937"),
		muted: fromHex("#6b7280"),
		surface: fromHex("#ebedef"),
		line: fromHex("#dadce1"),
		accent: fromHex("#2563eb"),
		accentSoft: fromHex("#dbeafe")
	},
	dark: {
		paper: fromHex("#131316"),
		ink: fromHex("#e5e7eb"),
		muted: fromHex("#9ca3af"),
		surface: fromHex("#16161a"),
		line: fromHex("#2b2b31"),
		accent: fromHex("#60a5fa"),
		accentSoft: fromHex("#1d2b3a")
	},
	dim: {
		paper: fromHex("#1a1c1f"),
		ink: fromHex("#c3c6cb"),
		muted: fromHex("#8b8f96"),
		surface: fromHex("#202328"),
		line: fromHex("#2e3238"),
		accent: fromHex("#7a9bd4"),
		accentSoft: fromHex("#232b36")
	},
	black: {
		paper: fromHex("#000000"),
		ink: fromHex("#d4d4d8"),
		muted: fromHex("#8a8a93"),
		surface: fromHex("#000000"),
		line: fromHex("#27272a"),
		accent: fromHex("#60a5fa"),
		accentSoft: fromHex("#0c1e33")
	}
};

export const isDark = (b: Base) => b !== "light";

function tintAmount(a: Appearance) {
	return Math.min(1, a.strength / FULL_TINT);
}

export function textPalette(a: Appearance): { paper: Rgb; ink: Rgb } {
	const t = tintAmount(a);
	const h = uiHueOklch(a.hue);
	const [[pl, pc], [il, ic]] = {
		light: [
			[0.98, 0.08],
			[0.15, 0.03]
		],
		dark: [
			[0.24, 0.1],
			[0.92, 0.04]
		],
		dim: [
			[0.22, 0.08],
			[0.12, 0.03]
		],
		black: [
			[0.0, 0.0],
			[0.86, 0.07]
		]
	}[a.base] as [[number, number], [number, number]];
	const room = (l: number) => maxChroma({ l, c: 0, h });
	const darkest = Math.max(0, pl - MAX_DARKEN);
	const cap = Math.min(pc, Math.max(room(pl), room(darkest)));
	const paper = dimmed({ l: pl, c: cap * t, h });
	const ink = toRgbInGamut({ l: il, c: ic * t, h });
	return { paper, ink };
}

const cache = new Map<string, Tokens>();

export function tokensOf(a: Appearance): Tokens {
	const key = `${a.base}|${Math.round(a.hue)}|${Math.round(a.strength)}`;
	const hit = cache.get(key);
	if (hit) return hit;
	const base = BASES[a.base];
	const dark = isDark(a.base);
	const page = textPalette(a);
	let raw = { ...base };
	if (a.strength > 0) {
		const t = tintAmount(a);
		const h = uiHueOklch(a.hue);
		const black = a.base === "black";
		const ground = (tok: Rgb, maxC: number) => (black ? tok : tinted(tok, h, t, maxC));
		const surface = black ? base.surface : apart(ground(base.surface, 0.07), page.paper, SURFACE_GAP);
		let line = tinted(base.line, h, t, 0.09);
		line = dark ? apart(line, surface, LINE_GAP) : below(line, surface, LINE_GAP);
		raw = {
			paper: ground(base.paper, 0.055),
			ink: tinted(base.ink, h, t, 0.02),
			muted: tinted(base.muted, h, t, 0.045),
			surface,
			line,
			accent: tinted(base.accent, h, t, 0.15),
			accentSoft: tinted(base.accentSoft, h, t, 0.11)
		};
	}
	const card = dark ? mix(mix(raw.surface, raw.line, 0.5), raw.accentSoft, 0.25) : mix(raw.paper, raw.accentSoft, 0.18);
	const hover = dark ? raw.line : mix(raw.surface, raw.line, 0.55);
	const grounds = [raw.paper, raw.surface, raw.accentSoft];
	const out: Tokens = {
		...raw,
		muted: legible(raw.muted, grounds),
		accent: legible(raw.accent, grounds),
		pagePaper: page.paper,
		pageInk: page.ink,
		card,
		hover,
		dark
	};
	cache.set(key, out);
	return out;
}

export function cssVars(t: Tokens): Record<string, string> {
	return {
		"--paper": hex(t.paper),
		"--ink": hex(t.ink),
		"--muted": hex(t.muted),
		"--surface": hex(t.surface),
		"--line": hex(t.line),
		"--accent": hex(t.accent),
		"--accent-soft": hex(t.accentSoft),
		"--page-paper": hex(t.pagePaper),
		"--page-ink": hex(t.pageInk),
		"--card": hex(t.card),
		"--hover": hex(t.hover),
		"--shadow": t.dark ? "rgba(0,0,0,0.47)" : "rgba(0,0,0,0.24)",
		"--glass": hex(t.surface) + "96",
		"--ink-on-accent": t.dark ? "#000000" : "#ffffff"
	};
}

export function cssVarsStyle(t: Tokens): string {
	return Object.entries(cssVars(t))
		.map(([k, v]) => `${k}:${v}`)
		.join(";");
}

export function hueSwatch(h: number, dark: boolean): string {
	return hex(toRgbInGamut({ l: dark ? 0.72 : 0.78, c: 0.12, h: uiHueOklch(h) }));
}

export function distinctHue(taken: number[], random = 0.5): number {
	const hues = [...new Set(taken.map((h) => ((h % 360) + 360) % 360))].sort((a, b) => a - b);
	if (hues.length === 0) return Math.floor(random * 360) % 360;
	const first = hues[0],
		last = hues[hues.length - 1];
	let start = last,
		gap = first + 360 - last;
	for (let i = 1; i < hues.length; i++) {
		const g = hues[i] - hues[i - 1];
		if (g > gap) {
			gap = g;
			start = hues[i - 1];
		}
	}
	const at = start + gap * (0.25 + 0.5 * random);
	return Math.round(at) % 360;
}

export const lerp = (a: number, b: number, p: number) => a + (b - a) * p;
export const ease = (p: number) => 1 - Math.pow(1 - Math.min(1, Math.max(0, p)), 3);
