<script lang="ts">
	import CopyCheck from "$lib/icons/CopyCheck.svelte";
	import HeartAlive from "$lib/icons/HeartAlive.svelte";
	import QrSvg from "$components/ui/QrSvg.svelte";
	import { Glide } from "$lib/glide.svelte";
	import { REPO } from "$lib/links";
	import { EVM_CHAINS, LOCAL_METHODS, METHODS, MODE_KEY, guessLocal } from "$lib/donate";

	function initialMode(): "crypto" | "local" {
		try {
			const saved = localStorage.getItem(MODE_KEY);
			if (saved === "crypto" || saved === "local") return saved;
		} catch {}
		return guessLocal() ? "local" : "crypto";
	}

	const start = initialMode();
	let mode = $state<"crypto" | "local">(start);
	const modeGlide = new Glide(start);
	const chainGlide = new Glide(EVM_CHAINS[0].id);
	const chain = $derived(EVM_CHAINS.find((c) => c.id === (chainGlide.hovered ?? chainGlide.pinned)) ?? EVM_CHAINS[0]);
	let copied = $state<string | null>(null);
	let copiedTimer = 0;

	$effect(() => {
		try {
			localStorage.setItem(MODE_KEY, mode);
		} catch {}
	});

	function setMode(next: "crypto" | "local"): void {
		mode = next;
		modeGlide.pin(next);
	}

	async function copy(id: string, address: string): Promise<void> {
		try {
			await navigator.clipboard.writeText(address);
		} catch {
			return;
		}
		copied = id;
		window.clearTimeout(copiedTimer);
		copiedTimer = window.setTimeout(() => (copied = null), 1600);
	}

	const evm = METHODS[0];
	const singles = METHODS.slice(1);
</script>

<div class="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-24">
	<div class="flex flex-wrap items-end justify-between gap-6">
		<div class="max-w-[60ch]">
			<p class="group flex items-center gap-2 text-[13px] tracking-[0.14em] text-muted uppercase">
				<HeartAlive size={14} always /> Donate
			</p>
			<h1 class="mt-3 font-serif text-[36px] leading-[1.08] font-medium tracking-[-0.015em] sm:text-[52px]">
				Keep it free, forever.
			</h1>
			<p class="mt-5 text-[16px] leading-[1.55] text-muted sm:text-[18px]">
				Mareader costs nothing, shows nothing and sells nothing. If it earned a place in your reading life, support
				travels straight to the maker — no middlemen, no accounts, no cut.
			</p>
			<div
				role="presentation"
				class="mt-8 relative inline-flex rounded-full border border-line bg-surface/60 p-1"
				onpointerleave={() => modeGlide.leave()}
			>
				<div
					class="pointer-events-none absolute z-0 rounded-full bg-line/70 transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
					style={modeGlide.style}
				></div>
				<button
					use:modeGlide.item={"crypto"}
					onpointerenter={() => modeGlide.enter("crypto")}
					onclick={() => setMode("crypto")}
					class="relative z-10 h-9 rounded-full px-4 text-[13.5px] font-medium transition-colors"
					class:text-ink={mode === "crypto"}
					class:text-muted={mode !== "crypto"}
				>
					{mode === "crypto" ? "Crypto addresses" : "International? Use crypto"}
				</button>
				<button
					use:modeGlide.item={"local"}
					onpointerenter={() => modeGlide.enter("local")}
					onclick={() => setMode("local")}
					class="relative z-10 h-9 rounded-full px-4 text-[13.5px] font-medium transition-colors"
					class:text-ink={mode === "local"}
					class:text-muted={mode !== "local"}
				>
					{mode === "local" ? "Myanmar local" : "Are you from Myanmar?"}
				</button>
			</div>
		</div>
	</div>

	{#if mode === "crypto"}
		<div class="anim-rise mt-12 space-y-5">
			<div class="grid gap-8 rounded-[20px] border border-line bg-surface/60 p-6 sm:p-8 lg:grid-cols-[1fr_auto]">
				<div class="min-w-0">
					<div class="flex items-center gap-2.5">
						<span class="rounded-md bg-ink px-2 py-0.5 font-mono text-[11px] text-paper">{evm.standard}</span>
						<h2 class="text-[17px] font-medium">{evm.name}</h2>
					</div>
					<div
						role="presentation"
						class="relative mt-4 flex flex-wrap gap-1.5"
						onpointerleave={() => chainGlide.leave()}
					>
						<div
							class="pointer-events-none absolute z-0 rounded-full bg-ink transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
							style={chainGlide.style}
						></div>
						{#each EVM_CHAINS as item (item.id)}
							<button
								use:chainGlide.item={item.id}
								onpointerenter={() => chainGlide.enter(item.id)}
								onclick={() => chainGlide.pin(item.id)}
								class="relative z-10 h-8 rounded-full px-3 text-[12.5px] font-medium transition-colors duration-200"
								class:text-paper={(chainGlide.hovered ?? chainGlide.pinned) === item.id}
								class:text-muted={(chainGlide.hovered ?? chainGlide.pinned) !== item.id}
							>
								{item.name}
							</button>
						{/each}
					</div>
					<p class="mt-3 text-[13.5px] text-muted">
						Send on <span class="text-ink">{chain.name}</span> — one address, all nine networks.
					</p>
					<p class="mt-4 text-[13px] text-muted">
						No memo or tag on any network. Double-check the first and last six characters before sending.
					</p>
					<div class="mt-4 flex items-stretch gap-3">
						<code
							class="min-w-0 flex-1 break-all rounded-xl border border-line bg-paper p-3.5 font-mono text-[12.5px] leading-[1.5]"
							>{evm.address}</code
						>
						<button
							onclick={() => copy(evm.id, evm.address)}
							class="group inline-flex h-11 shrink-0 items-center gap-2 rounded-[10px] border border-line px-4 text-[14px] font-medium transition-colors hover:bg-line/50"
						>
							<CopyCheck copied={copied === evm.id} />
							{copied === evm.id ? "Copied" : "Copy"}
						</button>
					</div>
				</div>
				<figure class="justify-self-start lg:justify-self-end">
					<div class="rounded-2xl border border-line bg-paper p-3.5">
						<QrSvg value={evm.address} size={172} title="EVM address QR code" />
					</div>
					<figcaption class="mt-2 text-center text-[12.5px] text-muted">Scan on {chain.name}</figcaption>
				</figure>
			</div>

			<div class="grid gap-5 sm:grid-cols-2">
				{#each singles as method (method.id)}
					<div class="anim-rise flex gap-5 rounded-[20px] border border-line bg-surface/60 p-5">
						<div class="min-w-0 flex-1">
							<div class="flex items-center gap-2.5">
								<span class="rounded-md border border-line bg-paper px-2 py-0.5 font-mono text-[11px] text-muted"
									>{method.standard}</span
								>
								<h3 class="text-[15.5px] font-medium">{method.name}</h3>
							</div>
							<code class="mt-3 block break-all font-mono text-[12px] leading-[1.5] text-muted">{method.address}</code>
							<button
								onclick={() => copy(method.id, method.address)}
								class="group mt-4 inline-flex h-9 items-center gap-2 rounded-[9px] border border-line px-3.5 text-[13px] font-medium transition-colors hover:bg-line/50"
							>
								<CopyCheck copied={copied === method.id} size={14} />
								{copied === method.id ? "Copied" : "Copy"}
							</button>
						</div>
						<div class="shrink-0 rounded-xl border border-line bg-paper p-2.5">
							<QrSvg value={method.address} size={104} title="{method.name} address QR code" />
						</div>
					</div>
				{/each}
			</div>
			<p class="text-[13px] text-muted">
				Prefer to read before giving? The whole source is open —
				<a
					href={REPO}
					target="_blank"
					rel="noreferrer"
					class="underline decoration-line underline-offset-4 hover:text-ink">audit anything on GitHub</a
				>.
			</p>
		</div>
	{:else}
		<div class="anim-rise mt-12">
			<p class="max-w-[52ch] text-[15px] leading-[1.55] text-muted">
				Local rails for Myanmar — KBZPay, WavePay and AYA Pay — are being set up. For now they are placeholders; the
				crypto side works today, and international supporters can peek at this page any time.
			</p>
			<div class="mt-8 grid gap-5 sm:grid-cols-3">
				{#each LOCAL_METHODS as local (local.id)}
					<div class="group rounded-[20px] border border-line bg-surface/60 p-5 transition-colors hover:border-ink/25">
						<h3 class="text-[16px] font-medium">{local.name}</h3>
						<div
							class="mt-4 flex h-36 items-center justify-center rounded-xl border border-dashed border-line/90 bg-paper/60"
						>
							<HeartAlive size={22} />
						</div>
						<p class="mt-3 text-[12.5px] leading-[1.5] text-muted">{local.hint}</p>
						<span class="mt-3 inline-block rounded-full border border-line px-2.5 py-0.5 text-[11.5px] text-muted"
							>soon</span
						>
					</div>
				{/each}
			</div>
		</div>
	{/if}
</div>
