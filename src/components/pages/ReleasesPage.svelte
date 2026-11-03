<script lang="ts">
	import AppleMark from "$lib/icons/AppleMark.svelte";
	import TuxMark from "$lib/icons/TuxMark.svelte";
	import DownloadAlive from "$lib/icons/DownloadAlive.svelte";
	import WindowsMark from "$lib/icons/WindowsMark.svelte";
	import { Glide } from "$lib/glide.svelte";
	import { CURRENT, RELEASES, assetUrl, sumsUrl, type Asset } from "$lib/releases";
	import type { Client } from "$lib/os";
	import type { Component } from "svelte";

	const glide = new Glide(CURRENT.version);
	const selected = $derived(RELEASES.find((r) => r.version === glide.pinned) ?? CURRENT);
	const groups = $derived.by(() => {
		const by: Partial<Record<Client, Asset[]>> = {};
		for (const asset of selected.assets) by[asset.os] = [...(by[asset.os] ?? []), asset];
		return Object.entries(by) as [Client, Asset[]][];
	});
	const OS_ICON: Record<Client, Component<{ size?: number | string; class?: string }>> = {
		macOS: AppleMark,
		Windows: WindowsMark,
		Linux: TuxMark
	};
	const fmt = (iso: string) =>
		new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
</script>

<div class="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-24">
	<p class="text-[13px] tracking-[0.14em] text-muted uppercase">Release notes</p>
	<h1 class="mt-3 font-serif text-[36px] leading-[1.08] font-medium tracking-[-0.015em] sm:text-[52px]">
		Every build, on the record.
	</h1>
	<p class="mt-5 max-w-[58ch] text-[16px] leading-[1.55] text-muted sm:text-[18px]">
		What changed, what arrived, and the exact file for your system — each release keeps its own notes and checksums.
	</p>

	<div class="mt-12 grid gap-10 lg:grid-cols-[218px_1fr]">
		<div
			role="presentation"
			class="relative flex gap-1 overflow-x-auto rounded-[14px] border border-line bg-surface/60 p-1.5 self-start lg:flex-col lg:overflow-visible"
			onpointerleave={() => glide.leave()}
		>
			<div
				class="pointer-events-none absolute z-0 rounded-[10px] bg-line/70 transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
				style={glide.style}
			></div>
			{#each RELEASES as release (release.version)}
				<button
					use:glide.item={release.version}
					onpointerenter={() => glide.enter(release.version)}
					onclick={() => glide.pin(release.version)}
					class="relative z-10 flex h-10 shrink-0 items-center gap-2 rounded-[10px] px-3.5 text-[14px] font-medium transition-colors lg:shrink"
					class:text-ink={glide.pinned === release.version}
					class:text-muted={glide.pinned !== release.version}
				>
					{release.version}
					{#if release.version === CURRENT.version}
						<span class="ml-auto hidden h-1.5 w-1.5 rounded-full bg-[var(--accent)] lg:block"></span>
					{/if}
				</button>
			{/each}
		</div>

		{#key selected.version}
			<div class="anim-rise min-w-0">
				<div class="flex flex-wrap items-baseline gap-x-4 gap-y-1">
					<h2 class="font-serif text-[26px] font-medium tracking-[-0.01em] sm:text-[32px]">{selected.version}</h2>
					<span class="text-[13.5px] text-muted">{fmt(selected.date)}</span>
					{#if selected.version === CURRENT.version}
						<span class="rounded-full border border-line bg-surface/70 px-2.5 py-0.5 text-[12px] text-muted"
							>current</span
						>
					{/if}
				</div>
				<p class="mt-2 font-serif text-[19px] text-ink/90 italic sm:text-[22px]">{selected.tagline}</p>

				<ul class="mt-6 space-y-3">
					{#each selected.highlights as line, i (line)}
						<li
							class="anim-rise flex gap-3 text-[15px] leading-[1.5] text-ink/85 sm:text-[16px]"
							style="animation-delay:{60 + i * 70}ms"
						>
							<span class="mt-[9px] h-[5px] w-[5px] shrink-0 rounded-full bg-[var(--accent)]"></span>
							{line}
						</li>
					{/each}
				</ul>

				<div class="mt-9 grid gap-6 sm:grid-cols-3">
					{#each groups as [os, list] (os)}
						{@const Icon = OS_ICON[os]}
						<div class="rounded-[16px] border border-line bg-surface/50 p-4">
							<div class="group flex items-center gap-2 text-[14px] font-medium">
								<Icon size={15} class="text-muted" />
								{os}
							</div>
							<ul class="mt-3 space-y-2">
								{#each list as asset (asset.file)}
									<li>
										<a
											href={assetUrl(selected, asset)}
											target="_blank"
											rel="noreferrer"
											class="group flex h-9 items-center gap-2 rounded-[9px] border border-line px-3 text-[13px] transition-colors hover:border-ink/30 hover:bg-line/40"
										>
											<DownloadAlive size={14} />
											<span class="text-muted">{asset.arch}</span>
											<span class="ml-auto font-mono text-[11.5px] text-muted">{asset.kind}</span>
										</a>
									</li>
								{/each}
							</ul>
						</div>
					{/each}
				</div>
				<a
					href={sumsUrl(selected)}
					target="_blank"
					rel="noreferrer"
					class="mt-4 inline-block text-[13px] text-muted underline decoration-line underline-offset-4 hover:text-ink"
				>
					SHA256SUMS for {selected.version}
				</a>
			</div>
		{/key}
	</div>
</div>
