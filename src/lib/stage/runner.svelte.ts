// Encapsulates a scene's clock, viewport tracking and focus zoom maths.
import { Clock } from "$lib/clock.svelte";
import { COMPACT, COMPACT_AT, DESKTOP, type Design } from "$lib/design";
import { playhead, type Playhead, type Step } from "$lib/timeline";

export interface Box {
	x: number;
	y: number;
	w: number;
	h: number;
	r: number;
}

export interface StageView {
	width: number;
	visible: boolean;
	stageEl: HTMLDivElement | undefined;
	zoomerEl: HTMLDivElement | undefined;
	box: Box | null;
	clock: Clock;
	view: { threshold: number; onchange: (v: boolean) => void };
	compact: boolean;
	design: Design;
	fit: number;
	ph: Playhead<unknown>;
	focus: string | null;
	zoom: number;
	transform: string;
	ringStyle: string;
}

export class StageRunner<S> implements StageView {
	#steps: Step<S>[];
	#initial: S;
	width = $state(0);
	visible = $state(false);
	stageEl = $state<HTMLDivElement | undefined>(undefined);
	zoomerEl = $state<HTMLDivElement | undefined>(undefined);
	box = $state<Box | null>(null);
	readonly compact = $derived(this.width > 0 && this.width < COMPACT_AT);
	readonly design = $derived<Design>(this.compact ? COMPACT : DESKTOP);
	readonly fit = $derived(this.width > 0 ? this.width / this.design.w : 1);
	readonly clock: Clock;
	readonly ph: Playhead<S>;
	readonly focus: string | null;
	readonly zoom: number;
	readonly transform: string;
	readonly ringStyle: string;
	readonly view = { threshold: 0.3, onchange: (v: boolean) => (this.visible = v) };

	constructor(steps: Step<S>[], initial: S, duration: number) {
		this.#steps = steps;
		this.#initial = initial;
		this.clock = new Clock(duration);
		this.ph = $derived(playhead(this.#steps, this.#initial, this.clock.t));
		this.focus = $derived(this.ph.focus);
		this.zoom = $derived(this.focus ? this.ph.zoom * (this.compact ? 1.25 : 1) : 1);
		this.transform = $derived.by(() => {
			const b = this.box;
			if (!b || this.zoom <= 1) return "translate(0px, 0px) scale(1)";
			const cx = b.x + b.w / 2;
			const cy = b.y + b.h / 2;
			const s = this.zoom;
			let tx = this.design.w / 2 - cx * s;
			let ty = this.design.h / 2 - cy * s;
			tx = Math.min(0, Math.max(this.design.w - this.design.w * s, tx));
			ty = Math.min(0, Math.max(this.design.h - this.design.h * s, ty));
			return `translate(${tx.toFixed(2)}px, ${ty.toFixed(2)}px) scale(${s})`;
		});
		this.ringStyle = $derived.by(() => {
			const b = this.box;
			const x = (b?.x ?? this.design.w / 2) - 5;
			const y = (b?.y ?? this.design.h / 2) - 5;
			const w = (b?.w ?? 0) + 10;
			const h = (b?.h ?? 0) + 10;
			const r = (b?.r ?? 8) + 5;
			const on = b && this.focus;
			const move =
				"left 0.6s var(--ease-out-quint), top 0.6s var(--ease-out-quint), width 0.6s var(--ease-out-quint), height 0.6s var(--ease-out-quint), opacity 0.35s ease";
			return `left:${x}px;top:${y}px;width:${w}px;height:${h}px;border-radius:${r}px;opacity:${on ? 1 : 0};box-shadow:0 0 0 1.5px var(--accent), 0 0 0 6px color-mix(in srgb, var(--accent) 16%, transparent), 0 0 24px color-mix(in srgb, var(--accent) 25%, transparent);transition:${on ? move : "opacity 0.3s ease"}`;
		});
		$effect(() => {
			if (this.visible) this.clock.start();
			return () => this.clock.stop();
		});
		$effect(() => {
			const zoomer = this.zoomerEl;
			const wanted = this.focus;
			const designW = this.design.w;
			const step = this.ph.index;
			if (!zoomer || !wanted) {
				this.box = null;
				return;
			}
			const measure = (): void => {
				void step;
				const el = zoomer.querySelector<HTMLElement>(`[data-focus="${wanted}"]`);
				if (!el) {
					this.box = null;
					return;
				}
				const zr = zoomer.getBoundingClientRect();
				const s = zr.width / designW || 1;
				const er = el.getBoundingClientRect();
				const next: Box = {
					x: (er.left - zr.left) / s,
					y: (er.top - zr.top) / s,
					w: er.width / s,
					h: er.height / s,
					r: parseFloat(getComputedStyle(el).borderTopLeftRadius) || 0
				};
				const b = this.box;
				if (
					b &&
					Math.abs(b.x - next.x) < 1.5 &&
					Math.abs(b.y - next.y) < 1.5 &&
					Math.abs(b.w - next.w) < 1.5 &&
					Math.abs(b.h - next.h) < 1.5
				)
					return;
				this.box = next;
			};
			const id = window.setInterval(measure, 140);
			return () => window.clearInterval(id);
		});
	}
}
