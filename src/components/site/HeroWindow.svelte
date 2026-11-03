<script lang="ts">
	import { Clock } from "$lib/clock.svelte";
	import { BOOKS } from "$lib/content";
	import { inView } from "$lib/actions/inview";
	import { DEFAULT_LOOK, PRESETS, type Appearance } from "$lib/palette";
	import { contentArea, type PaneSpec } from "$lib/mock/geometry";
	import Panes from "$components/mock/window/Panes.svelte";
	import Window from "$components/mock/window/Window.svelte";

	const HERO_LOOKS: Appearance[] = [
		DEFAULT_LOOK,
		PRESETS[0].look,
		PRESETS[2].look,
		PRESETS[3].look,
		PRESETS[4].look,
		PRESETS[1].look
	];
	const STEP = 3800;

	let width = $state(0);
	let visible = $state(false);

	const clock = new Clock(HERO_LOOKS.length * STEP, 0);
	const compact = $derived(width > 0 && width < 640);
	const design = $derived(compact ? { w: 760, h: 560 } : { w: 1120, h: 620 });
	const fit = $derived(width > 0 ? width / design.w : 1);
	const look = $derived(HERO_LOOKS[Math.min(HERO_LOOKS.length - 1, Math.floor(clock.t / STEP))]);
	const area = $derived(contentArea(design.w, design.h, false));
	const panes: PaneSpec[] = [
		{ id: "A", book: BOOKS[0] },
		{ id: "B", book: BOOKS[3] }
	];
	const view = { threshold: 0.2, onchange: (v: boolean) => (visible = v) };

	$effect(() => {
		if (visible) clock.start();
		return () => clock.stop();
	});
</script>

<div
	bind:clientWidth={width}
	use:inView={view}
	class="relative w-full overflow-hidden rounded-[14px]"
	style="height:{design.h * fit}px;box-shadow:0 0 0 1px var(--line), 0 40px 80px -30px rgba(0,0,0,0.45)"
>
	<div
		class="absolute top-0 left-0"
		style="width:{design.w}px;height:{design.h}px;transform:scale({fit});transform-origin:0 0"
	>
		<Window {look} width={design.w} height={design.h} title="Moby-Dick; or, The Whale">
			<Panes tree={compact ? "A" : { axis: "h", ratio: 0.5, a: "A", b: "B" }} {area} {panes} windowLook={look} />
		</Window>
	</div>
</div>
