<script lang="ts">
  // CopyButton — copies, then a drawn check confirms
  let {
    text,
    label = "Copy",
    compact = false
  }: { text: string; label?: string; compact?: boolean } = $props();

  let done = $state(false);
  let timer: ReturnType<typeof setTimeout> | undefined;

  function legacy(value: string): boolean {
    try {
      const ta = document.createElement("textarea");
      ta.value = value;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.append(ta);
      ta.select();
      const ok = document.execCommand("copy");
      ta.remove();
      return ok;
    } catch {
      return false;
    }
  }

  async function copy() {
    let ok: boolean;
    try {
      await navigator.clipboard.writeText(text);
      ok = true;
    } catch {
      ok = legacy(text);
    }
    if (!ok) return;
    done = true;
    clearTimeout(timer);
    timer = setTimeout(() => (done = false), 1800);
  }
</script>

<button
  type="button"
  class="copy {compact ? 'compact' : ''} {done ? 'done' : ''}"
  onclick={copy}
  aria-label={done ? "Copied" : `Copy ${label === "Copy" ? "address" : label}`}
>
  <span class="copy-ico" aria-hidden="true">
    <svg viewBox="0 0 24 24" class="c-clip">
      <path
        d="M9 9h9.2a1.8 1.8 0 0 1 1.8 1.8v8.4a1.8 1.8 0 0 1-1.8 1.8H9a1.8 1.8 0 0 1-1.8-1.8v-8.4A1.8 1.8 0 0 1 9 9Z"
        fill="none"
        stroke="currentColor"
        stroke-width="1.8"
      ></path>
      <path
        d="M5.4 15H4.8A1.8 1.8 0 0 1 3 13.2V4.8A1.8 1.8 0 0 1 4.8 3h8.4A1.8 1.8 0 0 1 15 4.8v.6"
        fill="none"
        stroke="currentColor"
        stroke-width="1.8"
        stroke-linecap="round"
      ></path>
    </svg>
    <svg viewBox="0 0 24 24" class="c-check">
      <path
        d="M4.5 12.5 9.5 17.5 19.5 6.5"
        fill="none"
        stroke="currentColor"
        stroke-width="2.2"
        stroke-linecap="round"
        stroke-linejoin="round"
      ></path>
    </svg>
  </span>
  {#if !compact}
    <span class="copy-label">{done ? "Copied" : label}</span>
  {/if}
  <span class="sr-only" aria-live="polite">{done ? "Address copied to clipboard" : ""}</span>
</button>
