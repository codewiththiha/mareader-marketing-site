<script lang="ts">
	import type { Snippet } from "svelte";

	let { id, title, lead, children }: { id: string; title: string; lead: string; children: Snippet } = $props();
</script>

<section {id} class="mx-auto max-w-6xl scroll-mt-20 px-5 py-16 sm:px-8 sm:py-24">
	<div class="mb-8 max-w-2xl sm:mb-10">
		<h2 class="font-serif text-[30px] leading-[1.12] font-medium tracking-[-0.01em] text-balance sm:text-[40px]">
			{title}
		</h2>
		<p class="mt-4 text-[16px] leading-[1.55] text-muted sm:text-[18px]">{lead}</p>
	</div>
	{@render children()}
</section>
