<script lang="ts">
	let { size = 16, class: cls = "" }: { size?: number | string; class?: string } = $props();
</script>

<svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" class={cls}>
	<rect
		x="3"
		y="3"
		width="8.4"
		height="8.4"
		rx="1"
		class="origin-center transition-transform duration-300 motion-reduce:group-hover:transform-none group-hover:-translate-x-[0.7px] group-hover:-translate-y-[0.7px]"
	/>
	<rect
		x="12.6"
		y="3"
		width="8.4"
		height="8.4"
		rx="1"
		class="origin-center transition-transform duration-300 motion-reduce:group-hover:transform-none group-hover:translate-x-[0.7px] group-hover:-translate-y-[0.7px]"
	/>
	<rect
		x="3"
		y="12.6"
		width="8.4"
		height="8.4"
		rx="1"
		class="origin-center transition-transform duration-300 motion-reduce:group-hover:transform-none group-hover:-translate-x-[0.7px] group-hover:translate-y-[0.7px]"
	/>
	<rect
		x="12.6"
		y="12.6"
		width="8.4"
		height="8.4"
		rx="1"
		class="origin-center transition-transform duration-300 motion-reduce:group-hover:transform-none group-hover:translate-x-[0.7px] group-hover:translate-y-[0.7px]"
	/>
</svg>
