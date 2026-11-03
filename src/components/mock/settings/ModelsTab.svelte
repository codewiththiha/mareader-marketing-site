<script lang="ts">
	import { Ban, ChevronDown, ChevronRight, KeyRound, Trash2 } from "lucide-svelte";
	import { PROVIDERS, type KeyRow, type ModelRow, type ProviderId } from "$lib/mock/providers";
	import ProviderLogo from "./ProviderLogo.svelte";
	import SettingsButton from "./SettingsButton.svelte";
	import SettingsField from "./SettingsField.svelte";
	import SettingsPill from "./SettingsPill.svelte";
	import SettingsRow from "./SettingsRow.svelte";
	import SettingsSection from "./SettingsSection.svelte";

	let {
		models,
		keys,
		typing,
		showTiles,
		openProvider,
		ollamaModels
	}: {
		models: ModelRow[];
		keys: KeyRow[];
		typing: string;
		showTiles: boolean;
		openProvider: ProviderId | null;
		ollamaModels: string[];
	} = $props();

	const ready = $derived(keys.filter((k) => k.state === "Ready").length);
	const anyKey = $derived(keys.filter((k) => !k.banned).length);
</script>

<div class="flex h-full flex-col overflow-hidden">
	<SettingsSection title="Models">
		{#each models as m, i (m.name)}
			<SettingsRow focus="model-{m.id}" style={i === 0 ? "border-top:none" : ""}>
				<ProviderLogo id={m.id} size={18} />
				<div class="min-w-0 flex-1">
					<div class="truncate" style="font-size:13px">{m.name}</div>
					<div class="truncate" style="font-size:11px;color:{m.warn ? '#d9534f' : 'var(--muted)'}">{m.note}</div>
				</div>
				<span class="flex items-center" style="gap:4px">
					{#each m.tasks as t (t)}
						<SettingsPill>{t}</SettingsPill>
					{/each}
				</span>
				<ChevronRight size={14} style="color:var(--muted)" />
			</SettingsRow>
		{/each}
		<SettingsRow style="justify-content:flex-start">
			<SettingsButton focus="add-model" primary={!showTiles}>Add a model</SettingsButton>
			{#if showTiles}
				<span style="font-size:12px;color:var(--muted)">Pick a provider for your first model</span>
			{/if}
		</SettingsRow>
		{#if showTiles}
			<div
				data-focus="tiles"
				class="grid"
				style="grid-template-columns:repeat(4, minmax(0, 1fr));gap:8px;padding:0 12px 12px;animation:rise-in 0.25s var(--ease-out-quint) both"
			>
				{#each PROVIDERS as p (p.id)}
					<div
						class="flex flex-col"
						style="padding:10px 10px 8px;gap:6px;border-radius:10px;background:var(--paper);border:1px solid var(--line)"
					>
						<ProviderLogo id={p.id} size={18} />
						<div style="font-size:12px;font-weight:500;line-height:1.2">{p.name}</div>
						<div style="font-size:11px;color:var(--muted);line-height:1.2">{p.tile}</div>
					</div>
				{/each}
			</div>
		{/if}
	</SettingsSection>
	<SettingsSection title="Providers">
		<SettingsRow focus="provider-openai" open={openProvider === "openai"} style="border-top:none">
			<ProviderLogo id="openai" size={18} />
			<div class="flex-1">
				<div>OpenAI</div>
				<div style="font-size:11px;color:var(--muted)">
					{anyKey === 0 ? "No API key yet" : `${ready} ${ready === 1 ? "key" : "keys"} ready`}
				</div>
			</div>
			{#if openProvider === "openai"}
				<ChevronDown size={14} style="color:var(--muted)" />
			{:else}
				<ChevronRight size={14} style="color:var(--muted)" />
			{/if}
		</SettingsRow>
		{#if openProvider === "openai"}
			<div
				data-focus="openai-keys"
				style="padding:4px 12px 10px 40px;border-top:1px solid var(--line);animation:rise-in 0.25s var(--ease-out-quint) both"
			>
				<div class="flex items-center" style="height:32px;gap:10px;font-size:13px">
					<span style="width:70px;color:var(--muted);font-size:12px">Address</span>
					<SettingsField value="https://api.openai.com/v1/" style="flex:1" />
				</div>
				<div class="flex items-start" style="gap:10px;font-size:13px;margin-top:4px">
					<span style="width:70px;color:var(--muted);font-size:12px;padding-top:6px">API keys</span>
					<div class="flex flex-1 flex-col">
						{#each keys as k, i (k.shown + i)}
							<div
								data-focus="key-{i}"
								class="flex items-center"
								style="height:28px;gap:8px;animation:rise-in 0.25s var(--ease-out-quint) both"
							>
								<KeyRound size={14} style="color:var(--muted)" />
								<span class="font-mono tabular-nums" style="font-size:12px">{k.shown}</span>
								<span class="ml-auto" style="font-size:11px;color:{k.banned ? '#d9534f' : 'var(--muted)'}"
									>{k.state}</span
								>
								<Ban size={13} style="color:var(--muted)" />
								<Trash2 size={13} style="color:var(--muted)" />
							</div>
						{/each}
						<div class="flex items-center" style="height:30px;gap:8px">
							<KeyRound size={14} style="color:var(--muted)" />
							<SettingsField value={typing} hint="Paste an API key" password style="flex:1" focus="key-field" />
							<SettingsButton small primary={!!typing}>Add</SettingsButton>
						</div>
					</div>
				</div>
			</div>
		{/if}
		<SettingsRow focus="provider-ollama" open={openProvider === "ollama"}>
			<ProviderLogo id="ollama" size={18} />
			<div class="flex-1">
				<div>Ollama</div>
				<div style="font-size:11px;color:var(--muted)">{ollamaModels.length} models on this computer</div>
			</div>
			{#if openProvider === "ollama"}
				<ChevronDown size={14} style="color:var(--muted)" />
			{:else}
				<ChevronRight size={14} style="color:var(--muted)" />
			{/if}
		</SettingsRow>
		{#if openProvider === "ollama"}
			<div
				data-focus="ollama-open"
				style="padding:4px 12px 10px 40px;border-top:1px solid var(--line);animation:rise-in 0.25s var(--ease-out-quint) both"
			>
				<div class="flex items-center" style="height:32px;gap:10px;font-size:13px">
					<span style="width:70px;color:var(--muted);font-size:12px">Address</span>
					<SettingsField value="http://localhost:11434/v1/" style="flex:1" />
				</div>
				<div class="flex items-center" style="height:32px;gap:10px;font-size:13px">
					<span style="width:70px;color:var(--muted);font-size:12px">Models</span>
					<span class="flex flex-wrap" style="gap:6px">
						{#each ollamaModels as m (m)}
							<SettingsPill>{m}</SettingsPill>
						{/each}
					</span>
					<span style="font-size:11px;color:var(--muted);margin-left:auto">No key</span>
				</div>
			</div>
		{/if}
		<SettingsRow focus="provider-apple">
			<ProviderLogo id="apple" size={18} />
			<div class="flex-1">
				<div>Apple Intelligence</div>
				<div style="font-size:11px;color:var(--muted)">On this Mac, private and offline</div>
			</div>
			<ChevronRight size={14} style="color:var(--muted)" />
		</SettingsRow>
	</SettingsSection>
</div>
