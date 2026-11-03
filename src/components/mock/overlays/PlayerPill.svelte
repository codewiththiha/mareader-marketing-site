<script lang="ts">
	import PlayerControls from "./PlayerControls.svelte";

	let {
		x,
		y,
		playing,
		at,
		left,
		speed
	}: {
		x: number;
		y: number;
		playing: boolean;
		at: number;
		left: string;
		speed: string;
	} = $props();
</script>

<div
	data-focus="player"
	class="absolute z-40 flex items-center"
	style="left:{x}px;top:{y}px;transform:translateX(-50%);height:44px;padding:0 6px;border-radius:22px;background:var(--surface);border:1px solid var(--line);box-shadow:0 8px 24px var(--shadow);animation:rise-in 0.25s var(--ease-out-quint) both"
>
	<PlayerControls {playing} {at} {left} {speed} track={168} />
</div>
