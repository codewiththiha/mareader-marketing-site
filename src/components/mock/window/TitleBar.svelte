<script lang="ts">
	import { BookA, LibraryBig, Palette, PanelLeft, Search, Settings } from "lucide-svelte";
	import IconButton from "./IconButton.svelte";
	import TrafficLights from "./TrafficLights.svelte";
	import { BAR_H } from "$lib/mock/geometry";

	let {
		title,
		left = 0,
		lights = true,
		appearanceOpen = false,
		settingsOpen = false,
		sidebarOn = false
	}: {
		title: string;
		left?: number;
		lights?: boolean;
		appearanceOpen?: boolean;
		settingsOpen?: boolean;
		sidebarOn?: boolean;
	} = $props();
</script>

<div
	class="geo absolute top-0 right-0 z-30 flex items-center"
	style="left:{left}px;height:{BAR_H}px;background:color-mix(in srgb, var(--surface) 59%, transparent);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border-bottom:1px solid color-mix(in srgb, var(--line) 70%, transparent);padding-left:8px;padding-right:8px"
>
	{#if lights}<TrafficLights style="margin-left:12px;margin-right:16px" />{/if}
	<div class="flex items-center gap-1">
		<IconButton icon={PanelLeft} pressed={sidebarOn} label="Toggle sidebar" />
		<IconButton icon={LibraryBig} label="Library" />
	</div>
	<div
		class="pointer-events-none absolute inset-x-0 truncate text-center"
		style="font-size:13px;font-weight:500;color:var(--ink);padding-inline:200px"
	>
		{title}
	</div>
	<div class="ml-auto flex items-center gap-1">
		<IconButton icon={Search} label="Search" />
		<IconButton icon={BookA} label="Dictionary" />
		<IconButton icon={Palette} pressed={appearanceOpen} focus="appearance-button" label="Appearance" />
		<IconButton icon={Settings} pressed={settingsOpen} label="Settings" />
	</div>
</div>
