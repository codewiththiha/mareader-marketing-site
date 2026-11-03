<script lang="ts">
	import { Moon, Sun } from "lucide-svelte";
	import { NAV_LINKS } from "$lib/content";
	import { Glide } from "$lib/glide.svelte";
	import { href, route, type Route } from "$lib/router.svelte";
	import { REPO } from "$lib/links";
	import GitHubMark from "$lib/icons/GitHubMark.svelte";
	import Wordmark from "./Wordmark.svelte";

	const ROUTES: [string, Route][] = [
		["Releases", "/releases"],
		["Donate", "/donate"]
	];
	const navGlide = new Glide(route.path === "/" ? null : route.path);

	$effect(() => {
		navGlide.pin(route.path === "/" ? null : route.path);
	});

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
		<nav class="relative hidden items-center gap-1 md:flex" onpointerleave={() => navGlide.leave()}>
			<div
				class="pointer-events-none absolute z-0 rounded-lg bg-line/60 transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
				style={navGlide.style}
			></div>
			{#each ROUTES as [label, path] (path)}
				<a
					use:navGlide.item={path}
					href={href(path)}
					onpointerenter={() => navGlide.enter(path)}
					class="relative z-10 flex h-9 items-center rounded-lg px-3 text-[14px] transition-colors"
					class:text-ink={route.path === path}
					class:text-muted={route.path !== path}
				>
					{label}
				</a>
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
	<nav class="flex gap-5 px-5 pb-2.5 text-[13px] text-muted md:hidden">
		{#each ROUTES as [label, path] (path)}
			<a href={href(path)} class="transition-colors" class:text-ink={route.path === path}>{label}</a>
		{/each}
	</nav>
</header>
