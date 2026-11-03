<script lang="ts">
	let { size = 16 }: { size?: number } = $props();
</script>

<svg
	width={size}
	height={size}
	viewBox="0 0 24 24"
	fill="none"
	stroke="currentColor"
	stroke-width="2"
	stroke-linecap="round"
	stroke-linejoin="round"
	aria-hidden="true"
>
	<g class="motion-reduce:group-hover:[animation:none] group-hover:[animation:drop_1.1s_ease-in-out_infinite]">
		<path d="M12 3v12" />
		<path d="m7 10 5 5 5-5" />
	</g>
	<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
</svg>
