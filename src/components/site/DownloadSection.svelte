<script lang="ts">
	import { ArrowUpRight } from "lucide-svelte";
	import AppleMark from "$lib/icons/AppleMark.svelte";
	import TuxMark from "$lib/icons/TuxMark.svelte";
	import DownloadAlive from "$lib/icons/DownloadAlive.svelte";
	import WindowsMark from "$lib/icons/WindowsMark.svelte";
	import { Glide } from "$lib/glide.svelte";
	import { REPO } from "$lib/links";
	import { clientName, type Client } from "$lib/os";
	import type { Component } from "svelte";
	import { CURRENT, assetUrl, sumsUrl } from "$lib/releases";

	const OS_ICON: Record<Client, Component<{ size?: number | string; class?: string }>> = {
		macOS: AppleMark,
		Windows: WindowsMark,
		Linux: TuxMark
	};
	const OS_LIST: Client[] = ["macOS", "Windows", "Linux"];
	const detected = clientName();
	const glide = new Glide(detected);
	const assets = $derived(CURRENT.assets.filter((a) => a.os === glide.pinned));
</script>

<section id="download" class="mx-auto max-w-6xl scroll-mt-20 px-5 py-16 sm:px-8 sm:py-24">
	<div class="rounded-[20px] border border-line bg-surface/60 p-7 sm:p-12">
		<div class="grid gap-10 lg:grid-cols-[1.1fr_1fr]">
			<div>
				<h2 class="font-serif text-[30px] leading-[1.12] font-medium tracking-[-0.01em] sm:text-[40px]">
					Free, open source, yours.
				</h2>
				<p class="mt-4 max-w-[48ch] text-[16px] leading-[1.55] text-muted sm:text-[18px]">
					Version {CURRENT.version.slice(1)}. Installing over an older version keeps your library, settings and
					highlights. Your books stay on this computer.
				</p>
				<div class="mt-7 flex flex-wrap gap-3">
					<a
						href="#/releases"
						class="inline-flex h-11 items-center gap-2 rounded-[10px] bg-ink px-5 text-[15px] font-medium text-paper transition-opacity hover:opacity-90"
					>
						<DownloadAlive size={16} /> Release notes
					</a>
					<a
						href={REPO}
						target="_blank"
						rel="noreferrer"
						class="inline-flex h-11 items-center gap-1.5 rounded-[10px] border border-line px-4 text-[15px] text-ink transition-colors hover:bg-line/50"
					>
						Source <ArrowUpRight size={15} class="text-muted" />
					</a>
				</div>
				<p class="mt-6 text-[13px] text-muted">
					Seeing <span class="text-ink">{detected}</span> above? That is your system, detected in the browser — switch any
					time.
				</p>
			</div>
			<div class="self-center">
				<div
					role="presentation"
					class="relative flex flex-col gap-1 rounded-[16px] border border-line bg-paper/50 p-1.5"
					onpointerleave={() => glide.leave()}
				>
					<div
						class="pointer-events-none absolute z-0 rounded-[12px] bg-line/60 transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
						style={glide.style}
					></div>
					{#each OS_LIST as id (id)}
						{@const Icon = OS_ICON[id]}
						<button
							use:glide.item={id}
							onpointerenter={() => glide.enter(id)}
							onclick={() => glide.pin(id)}
							class="group relative z-10 flex h-12 items-center gap-3 rounded-[12px] px-4 text-left text-[15px] font-medium transition-colors"
						>
							<Icon size={16} class="text-muted" />
							{id}
							{#if id === detected}
								<span
									class="rounded-full border border-line bg-surface/70 px-2 py-0.5 text-[11.5px] font-normal text-muted"
									>detected</span
								>
							{/if}
							<span class="ml-auto text-[12.5px] font-normal text-muted"
								>{CURRENT.assets.filter((a) => a.os === id).length} files</span
							>
						</button>
					{/each}
				</div>
				{#key glide.pinned}
					<ul class="anim-rise mt-3 space-y-2">
						{#each assets as asset (asset.file)}
							<li>
								<a
									href={assetUrl(CURRENT, asset)}
									target="_blank"
									rel="noreferrer"
									class="group flex h-10 items-center gap-2.5 rounded-[10px] border border-line px-3.5 text-[13.5px] transition-colors hover:border-ink/30 hover:bg-line/40"
								>
									<DownloadAlive size={15} />
									<span class="text-muted">{asset.arch}</span>
									<span class="ml-auto font-mono text-[11.5px] text-muted">{asset.kind}</span>
								</a>
							</li>
						{/each}
						<li>
							<a
								href={sumsUrl(CURRENT)}
								target="_blank"
								rel="noreferrer"
								class="flex h-8 items-center px-3.5 text-[12.5px] text-muted underline decoration-line underline-offset-4 hover:text-ink"
							>
								SHA256SUMS
							</a>
						</li>
					</ul>
				{/key}
			</div>
		</div>
	</div>
</section>
