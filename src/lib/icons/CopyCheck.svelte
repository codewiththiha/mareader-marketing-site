<script lang="ts">
	let { copied = false, size = 15 }: { copied?: boolean; size?: number } = $props();
</script>

<span class="relative inline-flex" style="width:{size}px;height:{size}px">
	<svg
		width={size}
		height={size}
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		stroke-width="2"
		stroke-linecap="round"
		stroke-linejoin="round"
		class="absolute inset-0 transition-all duration-300"
		class:opacity-0={copied}
		class:scale-50={copied}
		class:-rotate-12={copied}
		aria-hidden="true"
	>
		<rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
		<path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
	</svg>
	<svg
		width={size}
		height={size}
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		stroke-width="2.4"
		stroke-linecap="round"
		stroke-linejoin="round"
		class="absolute inset-0 transition-all duration-300"
		class:opacity-0={!copied}
		class:scale-50={!copied}
		aria-hidden="true"
	>
		<path d="M20 6 9 17l-5-5" />
	</svg>
</span>
