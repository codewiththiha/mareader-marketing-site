<script lang="ts">
  import { ChevronRight, Download, Play } from "@lucide/svelte";
  import { styles } from "@/lib/style";
  import Pill from "@/lib/settings/Pill.svelte";
  import Radio from "@/lib/settings/Radio.svelte";
  import Section from "@/lib/settings/Section.svelte";
  import SettingsRow from "@/lib/settings/SettingsRow.svelte";
  import SmallButton from "@/lib/settings/SmallButton.svelte";
  import Segments from "@/lib/overlays/Segments.svelte";
  import Switch from "@/lib/overlays/Switch.svelte";
  import type { VoiceModel } from "@/lib/settings/types";

  let { models, engine, highlight }: { models: VoiceModel[]; engine: string; highlight: "word" | "few" | "phrase" } = $props();
</script>

<div class="flex h-full flex-col overflow-hidden">
  <div style={styles({ fontSize: 12, color: "var(--muted)", marginBottom: 10 })}>
    Start or pause reading with ⌘⇧R, or right-click a page to read from there.
  </div>
  <Section title="Engine">
    <SettingsRow style={styles({ borderTop: "none" })}>
      <Radio on={engine === "system"} />
      <div class="flex-1">
        <div>System voices</div>
        <div style={styles({ fontSize: 11, color: "var(--muted)" })}>Built into your system · 74 voices</div>
      </div>
    </SettingsRow>
    {#each models as m (m.id)}
      <SettingsRow focus={`voice-${m.id}`}>
        <Radio on={engine === m.id} />
        <div class="min-w-0 flex-1">
          <div class="flex items-center" style={styles({ gap: 8 })}>
            <span>{m.name}</span>
            {#if m.state === "ready"}
              <Pill>{m.voices}</Pill>
            {/if}
          </div>
          <div class="truncate" style={styles({ fontSize: 11, color: "var(--muted)" })}>{m.about}</div>
          {#if m.state === "downloading"}
            <div class="mt-1.5 flex items-center" style={styles({ gap: 8 })}>
              <div class="relative flex-1" style={styles({ height: 4, borderRadius: 2, background: "var(--line)", maxWidth: 260 })}>
                <div
                  class="absolute inset-y-0 left-0"
                  style={styles({
                    width: `${(m.progress ?? 0) * 100}%`,
                    borderRadius: 2,
                    background: "var(--accent)",
                    transition: "width 0.25s linear",
                  })}
                ></div>
              </div>
              <span class="tabular-nums" style={styles({ fontSize: 11, color: "var(--muted)" })}
                >{Math.round((m.progress ?? 0) * 92)} of 92 MB</span
              >
            </div>
          {/if}
        </div>
        {#if m.state === "offer"}
          <span style={styles({ fontSize: 11, color: "var(--muted)" })}>{m.size}</span>
          <SmallButton small>
            <Download size={12} /> Download
          </SmallButton>
        {/if}
        {#if m.state === "ready"}
          <span style={styles({ fontSize: 11, color: "var(--muted)" })}>{m.size} on disk</span>
          <SmallButton small>Manage <ChevronRight size={12} /></SmallButton>
        {/if}
      </SettingsRow>
    {/each}
  </Section>
  <Section title="Voice">
    <SettingsRow style={styles({ borderTop: "none" })}>
      <div class="flex-1">
        <div>Voice</div>
        <div style={styles({ fontSize: 11, color: "var(--muted)" })}>Heart · American English, female</div>
      </div>
      <SmallButton small>
        <Play size={11} fill="currentColor" strokeWidth={0} /> Preview
      </SmallButton>
    </SettingsRow>
    <SettingsRow>
      <div class="flex-1">
        <div>Read along</div>
        <div style={styles({ fontSize: 11, color: "var(--muted)" })}>Light one word, a few, or a whole phrase as it's heard</div>
      </div>
      <div style={styles({ width: 220 })}>
        <Segments
          value={highlight}
          options={[
            { id: "word", label: "Word" },
            { id: "few", label: "A few words" },
            { id: "phrase", label: "Phrase" },
          ]}
          height={26}
          focus="read-along"
        />
      </div>
    </SettingsRow>
    <SettingsRow>
      <div class="flex-1">
        <div>Keep a model loaded</div>
        <div style={styles({ fontSize: 11, color: "var(--muted)" })}>For 5 minutes after reading pauses</div>
      </div>
      <Switch on={true} />
    </SettingsRow>
  </Section>
</div>
