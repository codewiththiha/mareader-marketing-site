<script lang="ts">
	let { on, focus }: { on: boolean; focus?: string } = $props();
</script>

<span
	data-focus={focus}
	class="relative inline-block shrink-0"
	style="width:32px;height:18px;border-radius:9px;background:{on
		? 'var(--accent)'
		: 'color-mix(in srgb, var(--line) 78%, var(--ink))'}"
>
	<span
		class="absolute top-[2px] block rounded-full"
		style="width:14px;height:14px;left:{on ? 16 : 2}px;background:{on
			? 'var(--ink-on-accent)'
			: 'var(--paper)'};box-shadow:0 1px 2px rgba(0,0,0,.25);transition:left 0.22s var(--ease-out-quint), background-color 0.3s"
	></span>
</span>
