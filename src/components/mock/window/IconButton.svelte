<script lang="ts">
	import type { IconComponent } from "$lib/icons/types";

	export interface IconProps {
		icon: IconComponent;
		pressed?: boolean;
		size?: number;
		iconSize?: number;
		focus?: string;
		label?: string;
	}

	let { icon: Icon, pressed = false, size = 36, iconSize = 18, focus, label }: IconProps = $props();
</script>

<div
	data-focus={focus}
	aria-label={label}
	class="flex shrink-0 items-center justify-center"
	style="width:{size}px;height:{size}px;border-radius:8px;background:{pressed
		? 'var(--accent-soft)'
		: 'transparent'};color:{pressed ? 'var(--accent)' : 'var(--ink)'}"
>
	<Icon size={iconSize} strokeWidth={2} />
</div>
