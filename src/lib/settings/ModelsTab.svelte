<script lang="ts">
  import { Ban, ChevronDown, ChevronRight, KeyRound, Trash2 } from "@lucide/svelte";
  import { styles } from "@/lib/style";
  import Field from "@/lib/settings/Field.svelte";
  import Pill from "@/lib/settings/Pill.svelte";
  import ProviderLogo from "@/lib/settings/ProviderLogo.svelte";
  import Section from "@/lib/settings/Section.svelte";
  import SettingsRow from "@/lib/settings/SettingsRow.svelte";
  import SmallButton from "@/lib/settings/SmallButton.svelte";
  import { PROVIDERS, type ProviderId } from "@/lib/settings/providers";
  import type { KeyRow, ModelRow } from "@/lib/settings/types";

  let {
    models,
    keys,
    typing,
    showTiles,
    openProvider,
    ollamaModels,
  }: {
    models: ModelRow[];
    keys: KeyRow[];
    typing: string;
    showTiles: boolean;
    openProvider: ProviderId | null;
    ollamaModels: string[];
  } = $props();

  const ready = $derived(keys.filter((k) => k.state === "Ready").length);
  const openaiNote = $derived(
    keys.filter((k) => !k.banned).length === 0 ? "No API key yet" : `${ready} ${ready === 1 ? "key" : "keys"} ready`,
  );
</script>

<div class="flex h-full flex-col overflow-hidden">
  <Section title="Models">
    {#each models as m (m.name)}
      <SettingsRow focus={`model-${m.id}`} style={styles({ borderTop: "none" })}>
        <ProviderLogo id={m.id} size={18} />
        <div class="min-w-0 flex-1">
          <div class="truncate" style={styles({ fontSize: 13 })}>{m.name}</div>
          <div class="truncate" style={styles({ fontSize: 11, color: m.warn ? "#d9534f" : "var(--muted)" })}>{m.note}</div>
        </div>
        <span class="flex items-center" style={styles({ gap: 4 })}>
          {#each m.tasks as t (t)}
            <Pill>{t}</Pill>
          {/each}
        </span>
        <ChevronRight size={14} style="color:var(--muted)" />
      </SettingsRow>
    {/each}
    <SettingsRow style={styles({ justifyContent: "flex-start" })}>
      <SmallButton focus="add-model" primary={!showTiles}>Add a model</SmallButton>
      {#if showTiles}
        <span style={styles({ fontSize: 12, color: "var(--muted)" })}>Pick a provider for your first model</span>
      {/if}
    </SettingsRow>
    {#if showTiles}
      <div
        data-focus="tiles"
        class="grid"
        style={styles({
          gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
          gap: 8,
          padding: "0 12px 12px",
          animation: "rise-in 0.25s var(--ease-out-quint) both",
        })}
      >
        {#each PROVIDERS as p (p.id)}
          <div
            class="flex flex-col"
            style={styles({
              padding: "10px 10px 8px",
              gap: 6,
              borderRadius: 10,
              background: "var(--paper)",
              border: "1px solid var(--line)",
            })}
          >
            <ProviderLogo id={p.id} size={18} />
            <div style={styles({ fontSize: 12, fontWeight: 500, lineHeight: 1.2 })}>{p.name}</div>
            <div style={styles({ fontSize: 11, color: "var(--muted)", lineHeight: 1.2 })}>{p.tile}</div>
          </div>
        {/each}
      </div>
    {/if}
  </Section>
  <Section title="Providers">
    <SettingsRow focus="provider-openai" open={openProvider === "openai"} style={styles({ borderTop: "none" })}>
      <ProviderLogo id="openai" size={18} />
      <div class="flex-1">
        <div>OpenAI</div>
        <div style={styles({ fontSize: 11, color: "var(--muted)" })}>{openaiNote}</div>
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
        style={styles({
          padding: "4px 12px 10px 40px",
          borderTop: "1px solid var(--line)",
          animation: "rise-in 0.25s var(--ease-out-quint) both",
        })}
      >
        <div class="flex items-center" style={styles({ height: 32, gap: 10, fontSize: 13 })}>
          <span style={styles({ width: 70, color: "var(--muted)", fontSize: 12 })}>Address</span>
          <Field value="https://api.openai.com/v1/" style={styles({ flex: 1 })} />
        </div>
        <div class="flex items-start" style={styles({ gap: 10, fontSize: 13, marginTop: 4 })}>
          <span style={styles({ width: 70, color: "var(--muted)", fontSize: 12, paddingTop: 6 })}>API keys</span>
          <div class="flex flex-1 flex-col">
            {#each keys as k, i (i)}
              <div
                data-focus={`key-${i}`}
                class="flex items-center"
                style={styles({ height: 28, gap: 8, animation: "rise-in 0.25s var(--ease-out-quint) both" })}
              >
                <KeyRound size={14} style="color:var(--muted)" />
                <span class="font-mono tabular-nums" style={styles({ fontSize: 12 })}>{k.shown}</span>
                <span class="ml-auto" style={styles({ fontSize: 11, color: k.banned ? "#d9534f" : "var(--muted)" })}>{k.state}</span>
                <Ban size={13} style="color:var(--muted)" />
                <Trash2 size={13} style="color:var(--muted)" />
              </div>
            {/each}
            <div class="flex items-center" style={styles({ height: 30, gap: 8 })}>
              <KeyRound size={14} style="color:var(--muted)" />
              <Field value={typing} hint="Paste an API key" password style={styles({ flex: 1 })} focus="key-field" />
              <SmallButton small primary={!!typing}>Add</SmallButton>
            </div>
          </div>
        </div>
      </div>
    {/if}
    <SettingsRow focus="provider-ollama" open={openProvider === "ollama"}>
      <ProviderLogo id="ollama" size={18} />
      <div class="flex-1">
        <div>Ollama</div>
        <div style={styles({ fontSize: 11, color: "var(--muted)" })}>{ollamaModels.length} models on this computer</div>
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
        style={styles({
          padding: "4px 12px 10px 40px",
          borderTop: "1px solid var(--line)",
          animation: "rise-in 0.25s var(--ease-out-quint) both",
        })}
      >
        <div class="flex items-center" style={styles({ height: 32, gap: 10, fontSize: 13 })}>
          <span style={styles({ width: 70, color: "var(--muted)", fontSize: 12 })}>Address</span>
          <Field value="http://localhost:11434/v1/" style={styles({ flex: 1 })} />
        </div>
        <div class="flex items-center" style={styles({ height: 32, gap: 10, fontSize: 13 })}>
          <span style={styles({ width: 70, color: "var(--muted)", fontSize: 12 })}>Models</span>
          <span class="flex flex-wrap" style={styles({ gap: 6 })}>
            {#each ollamaModels as m (m)}
              <Pill>{m}</Pill>
            {/each}
          </span>
          <span style={styles({ fontSize: 11, color: "var(--muted)", marginLeft: "auto" })}>No key</span>
        </div>
      </div>
    {/if}
    <SettingsRow focus="provider-apple">
      <ProviderLogo id="apple" size={18} />
      <div class="flex-1">
        <div>Apple Intelligence</div>
        <div style={styles({ fontSize: 11, color: "var(--muted)" })}>On this Mac, private and offline</div>
      </div>
      <ChevronRight size={14} style="color:var(--muted)" />
    </SettingsRow>
  </Section>
</div>
