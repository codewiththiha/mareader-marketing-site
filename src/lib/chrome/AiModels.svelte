<script lang="ts">
  import Icon from "$lib/icons/Icon.svelte";
  import Logo from "$lib/icons/Logo.svelte";
  import ModelRow from "./ModelRow.svelte";
  import { keyStates } from "./keystates";
  import { Ban, ChevronUp, KeyRound, Plus, Server, Trash2, Undo2, type IconNode } from "$lib/icons/nodes";
  import type { LogoName } from "$lib/icons/logos";

  let { local, lit, tick }: { local: boolean; lit: string | null; tick: number } = $props();

  const TILES: { logo: LogoName | null; name: string; sub: string; local?: boolean }[] = [
    { logo: "apple", name: "Apple Intelligence", sub: "On this Mac", local: true },
    { logo: "ollama", name: "Ollama", sub: "On this computer", local: true },
    { logo: "lmstudio", name: "LM Studio", sub: "On this computer", local: true },
    { logo: "openai", name: "OpenAI", sub: "API key" },
    { logo: "gemini", name: "Gemini", sub: "API key" },
    { logo: "openrouter", name: "OpenRouter", sub: "Many models" },
    { logo: null, name: "Custom", sub: "Any /v1 address" },
  ];

  const ks = $derived(keyStates(tick));
  const kbtn = (tone: string | undefined): IconNode => (tone === "bad" ? Undo2 : Ban);
</script>

<div>
  <div class="st-sec">Models</div>
  <div class="st-card">
    <ModelRow logo="apple" name="Apple Intelligence" sub="On this Mac · ready" pills={["AI Dictionary"]} />
    <ModelRow logo="ollama" name="Ollama · qwen3" sub="3 models on this computer" pills={["Library", "Summarize"]} />
    <ModelRow logo="openai" name="OpenAI" sub="gpt-4.1-mini · 1 at once" pills={["Translate", "+2"]} />
    <div class="st-add">
      <Icon node={Plus} size={16} strokeWidth={2} ariaHidden />
      <span>Add a model</span>
    </div>
    <div class="st-tiles-wrap" style:height={local ? "222px" : "0px"}>
      <div class="st-tiles">
        {#each TILES as t (t.name)}
          <div class="st-tile spot" class:lit={t.local === true && lit === "local"}>
            <span class="st-logo sm">
              {#if t.logo}
                <Logo name={t.logo} size={18} />
              {:else}
                <Icon node={Server} size={18} strokeWidth={1.8} ariaHidden />
              {/if}
            </span>
            <span class="st-mt">
              <b>{t.name}</b>
              <small>{t.sub}</small>
            </span>
          </div>
        {/each}
      </div>
    </div>
  </div>
  <p class="st-help">
    Each task asks the model chosen for it in the AI tab. Duplicate a model with another “At once” to give a task its own room.
  </p>
  <div class="st-sec">Providers</div>
  <div class="st-card">
    <div class="st-model">
      <span class="st-logo"><Logo name="openai" size={22} /></span>
      <span class="st-mt">
        <b>OpenAI</b>
        <small>{ks.rows[2].tone === "rest" ? "2 keys ready" : "3 keys ready"}</small>
      </span>
      <span class="st-chev"><Icon node={ChevronUp} size={18} strokeWidth={2} ariaHidden /></span>
    </div>
    <div class="st-indent">
      <div class="st-row">
        <span>Address</span>
        <span class="st-field">https://api.openai.com/v1/</span>
      </div>
      <div class="st-row">
        <span>API keys</span>
        <span class="st-quiet">With 3 keys, up to 3 at once.</span>
      </div>
      <div class="st-keys spot" class:lit={lit === "keys"}>
        {#each ks.rows as k, i (k.id)}
          <div class="st-key" class:use={i === ks.using} class:bad={k.tone === "bad"} class:rest={k.tone === "rest"}>
            <span class="st-kicon"><Icon node={KeyRound} size={16} strokeWidth={1.8} ariaHidden /></span>
            <span class="st-kid">{k.id}</span>
            <span class="st-kstat">{k.status}</span>
            <span class="st-kbtn"><Icon node={kbtn(k.tone)} size={16} strokeWidth={1.8} ariaHidden /></span>
            <span class="st-kbtn"><Icon node={Trash2} size={16} strokeWidth={1.8} ariaHidden /></span>
          </div>
        {/each}
      </div>
      <div class="st-row last">
        <span class="st-field ph">Paste an API key</span>
        <span class="st-btn">Add</span>
      </div>
    </div>
  </div>
  <p class="st-help">
    Keys are encrypted on this computer. With several, requests take turns, and a key the provider turns away is set aside.
  </p>
</div>
