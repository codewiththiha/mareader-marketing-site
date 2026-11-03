<script lang="ts">
	import { ArrowUpRight } from "lucide-svelte";
	import DownloadAlive from "$lib/icons/DownloadAlive.svelte";
	import { clientName } from "$lib/os";
	import { REPO } from "$lib/links";
	import { CURRENT, assetUrl } from "$lib/releases";
	import HeroWindow from "./HeroWindow.svelte";

	const os = clientName();
	const primary = os === "macOS" ? CURRENT.assets[0] : os === "Windows" ? CURRENT.assets[2] : CURRENT.assets[4];
</script>

<section id="top" class="mx-auto max-w-6xl px-5 pt-16 pb-10 sm:px-8 sm:pt-24">
	<div class="max-w-3xl">
		<h1 class="font-serif text-[40px] leading-[1.06] font-medium tracking-[-0.015em] text-balance sm:text-[60px]">
			A calm reader for PDF and EPUB.
		</h1>
		<p class="mt-6 max-w-[56ch] text-[17px] leading-[1.55] text-muted sm:text-[19px]">
			Native, in Rust. No webview, no JavaScript, a fraction of the memory. Your look on every page, four books at once,
			your own AI, and voices that never leave your computer.
		</p>
		<div class="mt-8 flex flex-wrap items-center gap-3">
			<a
				href={assetUrl(CURRENT, primary)}
				class="group inline-flex h-11 items-center gap-2 rounded-[10px] bg-ink px-5 text-[15px] font-medium text-paper transition-opacity hover:opacity-90"
			>
				<DownloadAlive size={16} /> Download for {os}
			</a>
			<a
				href={REPO}
				target="_blank"
				rel="noreferrer"
				class="inline-flex h-11 items-center gap-1.5 rounded-[10px] border border-line px-4 text-[15px] text-ink transition-colors hover:bg-line/50"
			>
				View on GitHub <ArrowUpRight size={15} class="text-muted" />
			</a>
			<a
				href="#download"
				class="text-[13px] text-muted underline decoration-line underline-offset-4 transition-colors hover:text-ink"
			>
				All platforms
			</a>
			<span class="text-[13px] text-muted">v{CURRENT.version.slice(1)} · macOS, Windows, Linux · MIT</span>
		</div>
	</div>
	<div class="mt-14 sm:mt-20">
		<HeroWindow />
	</div>
</section>
