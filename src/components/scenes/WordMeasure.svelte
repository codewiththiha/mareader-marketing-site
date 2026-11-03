<script lang="ts" module>
	export interface Box {
		x: number;
		y: number;
		w: number;
		h: number;
	}
</script>

<script lang="ts">
	let { width, step, onchange }: { width: number; step: number; onchange: (b: Box | null) => void } = $props();

	let marker = $state<HTMLSpanElement | undefined>(undefined);
	let prev: Box | null = null;

	$effect(() => {
		const m = marker;
		const w = width;
		const s = step;
		const root = m?.closest<HTMLElement>(".mw");
		const el = root?.querySelector<HTMLElement>('[data-focus="dict-word"]');
		if (!root || !el) return;
		const measure = (): void => {
			void s;
			const rr = root.getBoundingClientRect();
			const scale = rr.width / w || 1;
			const er = el.getBoundingClientRect();
			const next: Box = {
				x: (er.left - rr.left) / scale,
				y: (er.top - rr.top) / scale,
				w: er.width / scale,
				h: er.height / scale
			};
			if (prev && Math.abs(prev.x - next.x) < 0.5 && Math.abs(prev.y - next.y) < 0.5 && Math.abs(prev.w - next.w) < 0.5)
				return;
			prev = next;
			onchange(next);
		};
		measure();
		const id = window.setInterval(measure, 250);
		return () => window.clearInterval(id);
	});
</script>

<span bind:this={marker} style="display:none"></span>
