<script lang="ts">
	let { on }: { on: boolean } = $props();
</script>

<span
	class="flex shrink-0 items-center justify-center rounded-full"
	style="width:16px;height:16px;border:{on ? 'none' : '1.5px solid var(--muted)'};background:{on
		? 'var(--accent)'
		: 'transparent'}"
>
	{#if on}<span class="rounded-full" style="width:6px;height:6px;background:var(--ink-on-accent)"></span>{/if}
</span>
