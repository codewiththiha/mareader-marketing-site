import type { Appearance } from "$lib/palette";
import type { Book } from "$lib/content";

export const BAR_H = 48;
export const SIDEBAR_W = 288;

export type Tree = string | { axis: "h" | "v"; ratio: number; a: Tree; b: Tree };
export interface Rect {
	x: number;
	y: number;
	w: number;
	h: number;
}
export interface Divider {
	axis: "h" | "v";
	at: number;
	parent: Rect;
}
export interface PaneSpec {
	id: string;
	book?: Book;
	look?: Appearance;
}

export function layout(tree: Tree, r: Rect, out: Map<string, Rect> = new Map(), divs: Divider[] = []) {
	if (typeof tree === "string") {
		out.set(tree, r);
		return { rects: out, dividers: divs };
	}
	if (tree.axis === "h") {
		const w = r.w * tree.ratio;
		divs.push({ axis: "h", at: r.x + w, parent: r });
		layout(tree.a, { x: r.x, y: r.y, w, h: r.h }, out, divs);
		layout(tree.b, { x: r.x + w, y: r.y, w: r.w - w, h: r.h }, out, divs);
	} else {
		const h = r.h * tree.ratio;
		divs.push({ axis: "v", at: r.y + h, parent: r });
		layout(tree.a, { x: r.x, y: r.y, w: r.w, h }, out, divs);
		layout(tree.b, { x: r.x, y: r.y + h, w: r.w, h: r.h - h }, out, divs);
	}
	return { rects: out, dividers: divs };
}

export function count(tree: Tree): number {
	return typeof tree === "string" ? 1 : count(tree.a) + count(tree.b);
}

export function contentArea(width: number, height: number, sidebar: boolean): Rect {
	return { x: sidebar ? SIDEBAR_W : 0, y: 0, w: width - (sidebar ? SIDEBAR_W : 0), h: height };
}
