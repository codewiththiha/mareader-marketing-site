import { BOOKS, type Book } from "$lib/content";
import { DEFAULT_LOOK, PRESETS, type Appearance } from "$lib/palette";
import type { Tree } from "$lib/mock/geometry";
import type { Step } from "$lib/timeline";

export const preset = (id: string): Appearance =>
	required(
		PRESETS.find((p) => p.id === id),
		id
	).look;
export const book = (id: string): Book =>
	required(
		BOOKS.find((b) => b.id === id),
		id
	);

function required<T>(value: T | undefined, id: string): T {
	if (!value) throw new Error(`unknown id ${id}`);
	return value;
}

export interface Drag {
	book: string;
	from: { x: number; y: number };
	to: { x: number; y: number };
	pane: string;
	side: "right" | "bottom";
}

export interface PanesState {
	tree: Tree;
	look: Appearance;
	drag: Drag | null;
	dragP: number;
	popover: boolean;
	pressing: string | null;
}

export const ONE: Tree = "A";
export const TWO: Tree = { axis: "h", ratio: 0.5, a: "A", b: "B" };
export const THREE: Tree = { axis: "h", ratio: 0.5, a: { axis: "v", ratio: 0.5, a: "A", b: "C" }, b: "B" };
export const FOUR: Tree = {
	axis: "h",
	ratio: 0.5,
	a: { axis: "v", ratio: 0.5, a: "A", b: "C" },
	b: { axis: "v", ratio: 0.5, a: "B", b: "D" }
};

export function libraryRow(id: string) {
	const i = BOOKS.findIndex((b) => b.id === id);
	return { x: 8 + 8 + 11, y: 48 + 26 + 2 + i * 46 + 23 };
}

export const PANES_INITIAL: PanesState = {
	tree: ONE,
	look: DEFAULT_LOOK,
	drag: null,
	dragP: 0,
	popover: false,
	pressing: null
};

export const PANES_STEPS: Step<PanesState>[] = [
	{ at: 0, caption: "One book, the library docked beside it.", focus: null, zoom: 1 },
	{
		at: 1200,
		set: { drag: { book: "pride", from: libraryRow("pride"), to: { x: 0.78, y: 0.5 }, pane: "A", side: "right" } },
		caption: "Drag a book from the library onto a pane's edge to split.",
		tween: { dur: 1100, apply: (p) => ({ dragP: p }) }
	},
	{ at: 2600, set: { tree: TWO, drag: null, dragP: 0 } },
	{
		at: 4000,
		set: { drag: { book: "walden", from: libraryRow("walden"), to: { x: 0.25, y: 0.8 }, pane: "A", side: "bottom" } },
		tween: { dur: 1100, apply: (p) => ({ dragP: p }) }
	},
	{ at: 5400, set: { tree: THREE, drag: null, dragP: 0 } },
	{
		at: 6600,
		set: {
			drag: { book: "einstein", from: libraryRow("einstein"), to: { x: 0.75, y: 0.8 }, pane: "B", side: "bottom" }
		},
		tween: { dur: 1100, apply: (p) => ({ dragP: p }) },
		caption: "Up to four. Each pane scrolls, zooms and reads on its own."
	},
	{ at: 8000, set: { tree: FOUR, drag: null, dragP: 0 } },
	{
		at: 10000,
		set: { popover: true, pressing: "night" },
		focus: "preset-night",
		zoom: 2.2,
		caption: "Pick a look and every pane follows, the chrome with them."
	},
	{ at: 10700, set: { pressing: null, look: preset("night") }, focus: null, zoom: 1 },
	{
		at: 13400,
		set: { pressing: "parchment" },
		focus: "preset-parchment",
		zoom: 2.2,
		caption: "Four books, one paper."
	},
	{ at: 14100, set: { pressing: null, look: preset("parchment") }, focus: null, zoom: 1 }
];

export const PANES_DURATION = 16600;
