<script lang="ts">
  // SettingsWindow — providers and voices
  import {
    Ban,
    ChevronDown,
    ChevronRight,
    Columns2,
    Cpu,
    Download,
    Highlighter,
    LayoutTemplate,
    Palette,
    Sparkles,
    SpellCheck,
    BookA,
    Trash2,
    Volume2,
    X,
    Zap
  } from "@lucide/svelte";
  import { LOGOS } from "@/lib/logos";

  let { open, tab, step }: { open: boolean; tab: "models" | "voices"; step: number } = $props();
  let mounted = $state(false);
  let show = $state(false);
  let timer: ReturnType<typeof setTimeout> | undefined;
  $effect(() => {
    if (open) {
      mounted = true;
      requestAnimationFrame(() => requestAnimationFrame(() => (show = true)));
    } else {
      show = false;
      timer = setTimeout(() => (mounted = false), 360);
    }
    return () => clearTimeout(timer);
  });

  let provRef: HTMLDivElement | undefined = $state();
  let offset = $state(0);
  $effect(() => {
    if (!mounted) return;
    const el = provRef;
    offset = step >= 1 && el ? Math.max(0, el.offsetTop - 14) : 0;
  });

  const TABS = [
    { label: "Appearance", icon: Palette },
    { label: "Layout", icon: LayoutTemplate },
    { label: "Read aloud", icon: Volume2 },
    { label: "Highlights", icon: Highlighter },
    { label: "Vocabulary", icon: SpellCheck },
    { label: "Dictionary", icon: BookA },
    { label: "AI", icon: Sparkles },
    { label: "AI models", icon: Cpu },
    { label: "Panes", icon: Columns2 },
    { label: "Motion", icon: Zap }
  ];
  let title = $derived(tab === "models" ? "AI models" : "Read aloud");
  let keys = $derived(
    step >= 2
      ? [
          ["sk-proj-••••a3f9", "resting"] as const,
          ["sk-proj-••••7c21", "ready"] as const,
          ["sk-proj-••••e0b4", "banned"] as const
        ]
      : [
          ["sk-proj-••••a3f9", "ready"] as const,
          ["sk-proj-••••7c21", "ready"] as const,
          ["sk-proj-••••e0b4", "banned"] as const
        ]
  );
  let litKey = $derived(step >= 2 ? 1 : 0);

  // Voices progress
  let pct = $state(18);
  $effect(() => {
    if (tab !== "voices" || !show) {
      pct = 18;
      return;
    }
    const id = setInterval(() => (pct = pct >= 94 ? 94 : pct + 3), 260);
    return () => clearInterval(id);
  });
</script>

{#if mounted}
  <div class="mk-settings {show ? 'on' : ''}" data-focus="settings">
    <nav class="mk-set-nav">
      {#each TABS as { label, icon: I } (label)}
        <span class={label === title ? "on" : ""}><I size={16} strokeWidth={1.75} />{label}</span>
      {/each}
    </nav>
    <section class="mk-set-main">
      <header><b>{title}</b><span class="mk-sbtn"><X size={16} strokeWidth={1.75} /></span></header>
      <div class="mk-set-body">
        {#if tab === "models"}
          <div class="mk-set-scroll" style="transform: translateY({-offset}px)">
            <div class="mk-section">Models</div>
            <div class="mk-group lit-group">
              <div class="mk-row tall">
                <span class="mk-logo"
                  ><svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"
                    ><path d={LOGOS["apple"]} /></svg
                  ></span
                >
                <div class="mk-row-text">
                  <b>Apple Intelligence</b><small>On this Mac, private and offline</small>
                </div>
                <ChevronRight size={16} strokeWidth={1.75} class="mk-chev" />
              </div>
              <div class="mk-row tall">
                <span class="mk-logo"
                  ><svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"
                    ><path d={LOGOS["ollama"]} /></svg
                  ></span
                >
                <div class="mk-row-text">
                  <b>Ollama · gemma3</b><small>A model running on this computer</small>
                </div>
                <ChevronRight size={16} strokeWidth={1.75} class="mk-chev" />
              </div>
              <div class="mk-row tall">
                <span class="mk-logo"
                  ><svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"
                    ><path d={LOGOS["openai"]} /></svg
                  ></span
                >
                <div class="mk-row-text">
                  <b>OpenAI · gpt-4.1-mini</b><small>2 keys ready</small>
                </div>
                <ChevronRight size={16} strokeWidth={1.75} class="mk-chev" />
              </div>
              <div class="mk-row tall">
                <span class="mk-logo"
                  ><svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"
                    ><path d={LOGOS["gemini"]} /></svg
                  ></span
                >
                <div class="mk-row-text">
                  <b>Google Gemini · gemini-2.5-flash</b><small>1 key ready</small>
                </div>
              </div>
            </div>
            <div bind:this={provRef} class="mk-section">Providers</div>
            <div class="mk-group" data-focus="keys">
              <div class="mk-row tall head">
                <span class="mk-logo"
                  ><svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"
                    ><path d={LOGOS["openai"]} /></svg
                  ></span
                >
                <div class="mk-row-text"><b>OpenAI</b><small>2 keys ready</small></div>
                {#if step >= 1}<ChevronDown
                    size={16}
                    strokeWidth={1.75}
                    class="mk-chev"
                  />{:else}<ChevronRight size={16} strokeWidth={1.75} class="mk-chev" />{/if}
              </div>
              {#if step >= 1}
                <div class="mk-keys">
                  <i class="mk-div"></i>
                  <div class="mk-row">
                    <div class="mk-row-text"><b>Address</b></div>
                    <span class="mk-field">https://api.openai.com/v1/</span>
                  </div>
                  <i class="mk-div"></i>
                  <div class="mk-row">
                    <div class="mk-row-text"><b>API keys</b></div>
                    <small class="mk-muted">Encrypted on this computer</small>
                  </div>
                  {#each keys as [mask, state], i (i)}
                    <div class="mk-row {i === litKey ? 'lit' : ''}">
                      <div class="mk-row-text"><b class="mono">{mask}</b></div>
                      <span class="mk-key-state {state}"
                        >{state === "ready"
                          ? "Ready"
                          : state === "resting"
                            ? "Resting, 28 s"
                            : "Set aside: key rejected"}</span
                      ><span class="mk-sbtn"><Ban size={15} strokeWidth={1.75} /></span><span
                        class="mk-sbtn"><Trash2 size={15} strokeWidth={1.75} /></span
                      >
                    </div>
                  {/each}
                  <div class="mk-row"><span class="mk-field wide">Paste an API key</span></div>
                </div>
              {/if}
            </div>
            <div class="mk-group" style="margin-top:10px">
              <div class="mk-row tall">
                <span class="mk-logo"
                  ><svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"
                    ><path d={LOGOS["gemini"]} /></svg
                  ></span
                >
                <div class="mk-row-text"><b>Google Gemini</b><small>1 key ready</small></div>
                <ChevronRight size={16} strokeWidth={1.75} class="mk-chev" />
              </div>
              <div class="mk-row tall">
                <span class="mk-logo"
                  ><svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"
                    ><path d={LOGOS["ollama"]} /></svg
                  ></span
                >
                <div class="mk-row-text">
                  <b>Ollama</b><small>A model running on this computer</small>
                </div>
              </div>
            </div>
          </div>
        {:else}
          <div class="mk-set-scroll">
            <div class="mk-section">Engine</div>
            <div class="mk-group" data-focus="engines">
              <div class="mk-row tall">
                <div class="mk-row-text">
                  <b>System voices</b><small>Built into your system · 24 voices</small>
                </div>
              </div>
              <i class="mk-div"></i>
              <div class="mk-row tall lit">
                <div class="mk-row-text">
                  <b>Kokoro</b><small>Natural voices in 7 languages, 82M parameters</small>
                </div>
                <div class="mk-dl">
                  <div class="mk-dl-bar"><i style="width:{pct}%"></i></div>
                  <small>{pct}%</small>
                </div>
              </div>
              <i class="mk-div"></i>
              <div class="mk-row tall">
                <div class="mk-row-text">
                  <b>Piper</b><small>Quick, clear English voices</small>
                </div>
                <span class="mk-btn"><Download size={13} strokeWidth={1.75} /> Download</span>
              </div>
              <i class="mk-div"></i>
              <div class="mk-row tall">
                <div class="mk-row-text">
                  <b>Kitten</b><small>Light English voices from tiny models</small>
                </div>
                <span class="mk-btn"><Download size={13} strokeWidth={1.75} /> Download</span>
              </div>
              <i class="mk-div"></i>
              <div class="mk-row tall">
                <div class="mk-row-text">
                  <b>Phonon</b><small>Natural English voices, 31M parameters</small>
                </div>
                <span class="mk-btn"><Download size={13} strokeWidth={1.75} /> Download</span>
              </div>
            </div>
            <div class="mk-section">Voice</div>
            <div class="mk-group">
              <div class="mk-row">
                <div class="mk-row-text"><b>Voice</b></div>
                <span class="mk-field sel"
                  >Heart · en-US <ChevronDown size={14} strokeWidth={1.75} /></span
                >
              </div>
            </div>
          </div>
        {/if}
        <i class="mk-fade"></i>
      </div>
    </section>
  </div>
{/if}
