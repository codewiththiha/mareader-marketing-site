<script lang="ts">
	import apple from "$lib/assets/logos/apple.svg?raw";
	import gemini from "$lib/assets/logos/gemini.svg?raw";
	import lmstudio from "$lib/assets/logos/lm-studio.svg?raw";
	import ollama from "$lib/assets/logos/ollama.svg?raw";
	import openai from "$lib/assets/logos/openai.svg?raw";
	import openrouter from "$lib/assets/logos/openrouter.svg?raw";
	import { Server } from "lucide-svelte";
	import type { ProviderId } from "$lib/mock/providers";

	const LOGOS: Record<string, string> = { apple, openai, gemini, openrouter, ollama, lmstudio };

	let { id, size = 18, style = "" }: { id: ProviderId; size?: number; style?: string } = $props();

	const svg = $derived(
		LOGOS[id]
			.replace('fill="white"', 'fill="currentColor"')
			.replace(/width="24" height="24"/, `width="${size}" height="${size}"`)
	);
</script>

{#if id === "custom"}
	<Server {size} strokeWidth={2} {style} />
{:else}
	<span class="inline-flex shrink-0" style="width:{size}px;height:{size}px;{style}">{@html svg}</span>
{/if}
