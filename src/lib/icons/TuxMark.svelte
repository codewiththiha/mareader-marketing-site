<script lang="ts">
	let { size = 16, class: cls = "" }: { size?: number | string; class?: string } = $props();
</script>

<svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" class={cls}>
	<path
		fill-rule="evenodd"
		d="M12 2.4c-2.2 0-3.6 1.6-3.6 3.7 0 1.2-.3 2.2-1 3.2-1.1 1.7-2.2 3.6-2.2 5.8 0 3.4 3.1 5.5 6.8 5.5s6.8-2.1 6.8-5.5c0-2.2-1.1-4.1-2.2-5.8-.7-1-1-2-1-3.2 0-2.1-1.4-3.7-3.6-3.7Zm0 8.8c-2.2 0-3.7 2-3.7 4.5 0 2.4 1.5 4 3.7 4s3.7-1.6 3.7-4c0-2.5-1.5-4.5-3.7-4.5Zm-1.6-4.1a1 1 0 1 1 0-2 1 1 0 0 1 0 2Zm3.2 0a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z"
	/>
</svg>
