<script lang="ts">
	import { ChevronRight, Download, Play } from "lucide-svelte";
	import type { VoiceModel } from "$lib/mock/voices";
	import Radio from "./Radio.svelte";
	import Segments from "../overlays/Segments.svelte";
	import SettingsButton from "./SettingsButton.svelte";
	import SettingsPill from "./SettingsPill.svelte";
	import SettingsRow from "./SettingsRow.svelte";
	import SettingsSection from "./SettingsSection.svelte";
	import Switch from "../overlays/Switch.svelte";

	let {
		models,
		engine,
		highlight
	}: {
		models: VoiceModel[];
		engine: string;
		highlight: "word" | "few" | "phrase";
	} = $props();
</script>

<div class="flex h-full flex-col overflow-hidden">
	<div style="font-size:12px;color:var(--muted);margin-bottom:10px">
		Start or pause reading with ⌘⇧R, or right-click a page to read from there.
	</div>
	<SettingsSection title="Engine">
		<SettingsRow style="border-top:none">
			<Radio on={engine === "system"} />
			<div class="flex-1">
				<div>System voices</div>
				<div style="font-size:11px;color:var(--muted)">Built into your system · 74 voices</div>
			</div>
		</SettingsRow>
		{#each models as m (m.id)}
			<SettingsRow focus="voice-{m.id}">
				<Radio on={engine === m.id} />
				<div class="min-w-0 flex-1">
					<div class="flex items-center" style="gap:8px">
						<span>{m.name}</span>
						{#if m.state === "ready"}<SettingsPill>{m.voices}</SettingsPill>{/if}
					</div>
					<div class="truncate" style="font-size:11px;color:var(--muted)">{m.about}</div>
					{#if m.state === "downloading"}
						<div class="mt-1.5 flex items-center" style="gap:8px">
							<div class="relative flex-1" style="height:4px;border-radius:2px;background:var(--line);max-width:260px">
								<div
									class="absolute inset-y-0 left-0"
									style="width:{(m.progress ?? 0) *
										100}%;border-radius:2px;background:var(--accent);transition:width 0.25s linear"
								></div>
							</div>
							<span class="tabular-nums" style="font-size:11px;color:var(--muted)">
								{Math.round((m.progress ?? 0) * 92)} of 92 MB
							</span>
						</div>
					{/if}
				</div>
				{#if m.state === "offer"}
					<span style="font-size:11px;color:var(--muted)">{m.size}</span>
					<SettingsButton small><Download size={12} /> Download</SettingsButton>
				{/if}
				{#if m.state === "ready"}
					<span style="font-size:11px;color:var(--muted)">{m.size} on disk</span>
					<SettingsButton small>Manage <ChevronRight size={12} /></SettingsButton>
				{/if}
			</SettingsRow>
		{/each}
	</SettingsSection>
	<SettingsSection title="Voice">
		<SettingsRow style="border-top:none">
			<div class="flex-1">
				<div>Voice</div>
				<div style="font-size:11px;color:var(--muted)">Heart · American English, female</div>
			</div>
			<SettingsButton small><Play size={11} fill="currentColor" strokeWidth={0} /> Preview</SettingsButton>
		</SettingsRow>
		<SettingsRow>
			<div class="flex-1">
				<div>Read along</div>
				<div style="font-size:11px;color:var(--muted)">Light one word, a few, or a whole phrase as it's heard</div>
			</div>
			<div style="width:220px">
				<Segments
					value={highlight}
					options={[
						{ id: "word", label: "Word" },
						{ id: "few", label: "A few words" },
						{ id: "phrase", label: "Phrase" }
					]}
					height={26}
					focus="read-along"
				/>
			</div>
		</SettingsRow>
		<SettingsRow>
			<div class="flex-1">
				<div>Keep a model loaded</div>
				<div style="font-size:11px;color:var(--muted)">For 5 minutes after reading pauses</div>
			</div>
			<Switch on />
		</SettingsRow>
	</SettingsSection>
</div>
