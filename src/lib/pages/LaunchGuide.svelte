<script lang="ts">
  import AppleMark from "$lib/icons/AppleMark.svelte";
  import WindowsMark from "$lib/icons/WindowsMark.svelte";
  import Icon from "$lib/icons/Icon.svelte";
  import { X } from "$lib/icons/nodes";
  import { router } from "$lib/site/router.svelte";
  import { portal } from "$lib/utils/portal";
  import type { Os } from "$lib/site/downloads";

  let { os, open, onClose }: { os: Os; open: boolean; onClose: () => void } = $props();

  const CMD = "xattr -d com.apple.quarantine /Applications/Mareader.app";
  let copied = $state(false);
  let card = $state<HTMLDivElement>();
  let last = null as HTMLElement | null;
  let pushed = false;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(CMD);
      copied = true;
      window.setTimeout(() => (copied = false), 1600);
    } catch {
      /* clipboard refused: the command is selectable */
    }
  };

  const onKey = (event: KeyboardEvent) => {
    if (!open) return;
    if (event.key === "Escape") {
      event.preventDefault();
      onClose();
      return;
    }
    if (event.key !== "Tab" || !card) return;
    const focusable = Array.from(card.querySelectorAll<HTMLElement>("a[href], button:not([disabled])"));
    if (focusable.length === 0) return;
    const first = focusable[0];
    const lastEl = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      lastEl.focus();
    } else if (!event.shiftKey && document.activeElement === lastEl) {
      event.preventDefault();
      first.focus();
    }
  };

  $effect(() => {
    if (!open) return;
    last = document.activeElement as HTMLElement | null;
    document.body.style.overflow = "hidden";
    history.pushState({ guide: os }, "");
    pushed = true;
    const back = () => {
      if (!pushed) return;
      pushed = false;
      onClose();
    };
    window.addEventListener("popstate", back);
    const t = window.setTimeout(() => card?.querySelector<HTMLElement>("button")?.focus(), 40);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("popstate", back);
      document.body.style.overflow = "";
      if (pushed) {
        pushed = false;
        history.back();
      }
      last?.focus();
    };
  });
</script>

<svelte:window onkeydown={onKey} />

{#if os === "mac" || os === "windows"}
  <div
    class="lg-back"
    class:on={open}
    use:portal
    role="presentation"
    onclick={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}
  >
    <div
      bind:this={card}
      class="lg"
      role="dialog"
      aria-modal="true"
      aria-labelledby="lg-title"
      aria-describedby="lg-sub"
      aria-hidden={!open}
      tabindex="-1"
    >
      <button type="button" class="lg-x" aria-label="Close this note" onclick={onClose}>
        <Icon node={X} size={16} strokeWidth={2} ariaHidden />
      </button>

      <div class="lg-mark">
        {#if os === "mac"}<AppleMark size={26} />{:else}<WindowsMark size={24} />{/if}
      </div>

      {#if os === "mac"}
        <h2 id="lg-title" class="lg-title">macOS will call Mareader “damaged”. It isn’t.</h2>
        <p id="lg-sub" class="lg-sub">
          No Apple Developer ID here — that costs $99 a year, and Mareader is free. So the first launch needs a nudge from you, and then it
          never asks again.
        </p>

        <ol class="lg-steps">
          <li>Open the <code>.dmg</code> and drag <strong>Mareader</strong> into <strong>Applications</strong>.</li>
          <li>
            Open <strong>Terminal</strong> and run this one line — it clears the “downloaded from the internet” flag Apple left on the app.
            <span class="lg-cmd">
              <code>{CMD}</code>
              <button type="button" class="lg-copy" class:done={copied} onclick={copy}>
                {copied ? "Copied" : "Copy"}
              </button>
            </span>
          </li>
          <li>Open Mareader. If it still holds back, right-click it → <strong>Open</strong> → <strong>Open</strong>.</li>
        </ol>

        <p class="lg-note">
          Nothing is sent anywhere and nothing is bypassed but Apple's gatekeeping of an unverified app. Prefer not to use the terminal?
          System Settings → Privacy &amp; Security → <strong>Open Anyway</strong> does the same thing.
        </p>
      {:else}
        <h2 id="lg-title" class="lg-title">Windows will warn you once. That’s expected.</h2>
        <p id="lg-sub" class="lg-sub">
          Mareader isn’t signed with a paid Microsoft certificate, so SmartScreen treats every fresh build as unknown. Two clicks and it’s
          done.
        </p>

        <ol class="lg-steps">
          <li>Run the installer. When “Windows protected your PC” appears, choose <strong>More info</strong>.</li>
          <li>Choose <strong>Run anyway</strong> — the installer places Mareader for your account alone, no administrator needed.</li>
          <li>
            Open it from the Start menu. If Defender scans it first, let it finish; the same file is on every machine that installs this
            release.
          </li>
        </ol>

        <p class="lg-note">
          On a managed or work machine, the MSI is the friendlier route, and your IT team can approve it once for everyone.
        </p>
      {/if}

      <div class="lg-foot">
        <a
          class="btn btn-accent btn-sm"
          href={router.href("donate")}
          onclick={() => {
            onClose();
          }}
        >
          Chip in if you can
        </a>
        <button type="button" class="lg-done" onclick={onClose}>Got it — happy reading</button>
      </div>
    </div>
  </div>
{/if}
