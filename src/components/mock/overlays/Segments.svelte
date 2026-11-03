<script lang="ts">
	import type { IconComponent } from "$lib/icons/types";

	let {
		value,
		options,
		focus,
		height = 28
	}: {
		value: string;
		options: { id: string; label: string; icon?: IconComponent }[];
		focus?: string;
		height?: number;
	} = $props();
</script>

<div
	data-focus={focus}
	class="flex w-full"
	style="height:{height}px;border-radius:8px;padding:2px;background:color-mix(in srgb, var(--line) 55%, transparent)"
>
	{#each options as o (o.id)}
		{@const on = o.id === value}
		<div
			class="flex flex-1 items-center justify-center gap-1.5 truncate"
			style="border-radius:6px;font-size:12px;font-weight:{on ? 500 : 400};color:{on
				? 'var(--accent)'
				: 'var(--ink)'};background:{on ? 'var(--accent-soft)' : 'transparent'}"
		>
			{#if o.icon}
				{@const OIcon = o.icon}
				<OIcon size={13} strokeWidth={2} />
			{/if}
			<span class="truncate">{o.label}</span>
		</div>
	{/each}
</div>
