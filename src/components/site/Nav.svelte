<script lang="ts">
	import { Moon, Sun } from "lucide-svelte";
	import { NAV_LINKS } from "$lib/content";
	import { REPO } from "$lib/links";
	import GitHubMark from "$lib/icons/GitHubMark.svelte";
	import Wordmark from "./Wordmark.svelte";

	let dark = $state(document.documentElement.classList.contains("dark"));

	$effect(() => {
		document.documentElement.classList.toggle("dark", dark);
		try {
			localStorage.setItem("mareader-site-theme", dark ? "dark" : "light");
		} catch {}
	});
</script>

<header class="sticky top-0 z-50 border-b border-line/70 bg-paper/75 backdrop-blur-xl">
	<div class="mx-auto flex h-14 max-w-6xl items-center gap-6 px-5 sm:px-8">
		<Wordmark />
		<nav class="ml-auto hidden items-center gap-6 text-[14px] text-muted md:flex">
			{#each NAV_LINKS as [l, h] (h)}
				<a href={h} class="transition-colors hover:text-ink">{l}</a>
			{/each}
		</nav>
		<div class="ml-auto flex items-center gap-1 md:ml-0">
			<button
				onclick={() => (dark = !dark)}
				aria-label={dark ? "Switch to light" : "Switch to dark"}
				class="flex h-9 w-9 items-center justify-center rounded-lg text-ink transition-colors hover:bg-line/60"
			>
				{#if dark}
					<Sun size={17} />
				{:else}
					<Moon size={17} />
				{/if}
			</button>
			<a
				href={REPO}
				target="_blank"
				rel="noreferrer"
				aria-label="GitHub"
				class="flex h-9 w-9 items-center justify-center rounded-lg text-ink transition-colors hover:bg-line/60"
			>
				<GitHubMark />
			</a>
		</div>
	</div>
</header>
