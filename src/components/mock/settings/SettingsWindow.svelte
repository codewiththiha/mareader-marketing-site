<script lang="ts">
	import type { Snippet } from "svelte";
	import {
		BookA,
		ChartNoAxesColumnIncreasing,
		Columns2,
		Cpu,
		Highlighter,
		LayoutTemplate,
		Palette,
		Type,
		Volume2,
		Wind,
		X
	} from "lucide-svelte";
	import AiMark from "$lib/icons/AiMark.svelte";
	import type { IconComponent } from "$lib/icons/types";

	let {
		tab,
		title,
		width,
		height,
		dark,
		children
	}: {
		tab: string;
		title: string;
		width: number;
		height: number;
		dark: boolean;
		children?: Snippet;
	} = $props();

	const TABS: { group: string; items: { id: string; name: string; icon: IconComponent | "ai" }[] }[] = [
		{
			group: "Reading",
			items: [
				{ id: "layout", name: "Layout", icon: LayoutTemplate },
				{ id: "theme", name: "Theme", icon: Palette },
				{ id: "fonts", name: "Fonts", icon: Type },
				{ id: "read-aloud", name: "Read aloud", icon: Volume2 }
			]
		},
		{
			group: "Study",
			items: [
				{ id: "highlights", name: "Highlights", icon: Highlighter },
				{ id: "vocabulary", name: "Vocabulary", icon: ChartNoAxesColumnIncreasing },
				{ id: "dictionary", name: "Dictionary", icon: BookA },
				{ id: "ai", name: "AI", icon: "ai" }
			]
		},
		{
			group: "App",
			items: [
				{ id: "models", name: "AI models", icon: Cpu },
				{ id: "animations", name: "Animations", icon: Wind },
				{ id: "workspace", name: "Workspace", icon: Columns2 }
			]
		}
	];

	const w = $derived(Math.min(820, width - 48));
	const h = $derived(Math.min(560, height - 48));
</script>

<div
	class="absolute inset-0 z-50 flex items-center justify-center"
	style="background:{dark ? 'rgba(0,0,0,0.35)' : 'rgba(0,0,0,0.19)'};animation:fade-in 0.2s ease both"
>
	<div
		data-focus="settings"
		class="flex overflow-hidden"
		style="width:{w}px;height:{h}px;border-radius:12px;background:var(--surface);border:1px solid var(--line);box-shadow:0 8px 24px var(--shadow);animation:rise-in 0.22s var(--ease-out-quint) both"
	>
		<div class="flex shrink-0 flex-col" style="width:188px;padding:14px 8px;border-right:1px solid var(--line)">
			{#each TABS as g (g.group)}
				<div style="margin-bottom:10px">
					<div style="font-size:11px;font-weight:500;color:var(--muted);padding:0 10px 4px">{g.group}</div>
					{#each g.items as it (it.id)}
						{@const on = it.id === tab}
						<div
							class="flex items-center"
							style="height:30px;padding:0 10px;gap:9px;border-radius:8px;font-size:13px;background:{on
								? 'var(--accent-soft)'
								: 'transparent'};color:{on ? 'var(--accent)' : 'var(--ink)'}"
						>
							{#if it.icon === "ai"}
								<AiMark size={16} />
							{:else}
								{@const TabIcon = it.icon}
								<TabIcon size={16} strokeWidth={2} />
							{/if}
							<span>{it.name}</span>
						</div>
					{/each}
				</div>
			{/each}
		</div>
		<div class="relative flex min-w-0 flex-1 flex-col">
			<div class="flex items-center" style="height:52px;padding:0 20px;font-size:16px;font-weight:600">
				{title}
				<span class="ml-auto" style="color:var(--muted)"><X size={16} /></span>
			</div>
			<div class="min-h-0 flex-1 overflow-hidden" style="padding:0 20px 20px">
				{@render children?.()}
			</div>
		</div>
	</div>
</div>
