<script lang="ts">
  import { onMount, tick } from "svelte";
  import { ArrowRight, ArrowUpRight, Terminal, X } from "@lucide/svelte";
  import CopyButton from "@/lib/components/CopyButton.svelte";
  import PlatformMark from "@/lib/components/icons/PlatformMark.svelte";
  import { go, href } from "@/lib/router.svelte";

  type GuideOS = "mac" | "windows";
  type GuideMarker = { id: string; os: GuideOS };

  const HISTORY_KEY = "__mareaderDownloadGuide";
  const COMMAND = "xattr -d com.apple.quarantine /Applications/Mareader.app";
  let system = $state<GuideOS>("mac");
  let dialog: HTMLDialogElement;
  let opener: HTMLElement | null = null;
  let activeId: string | null = null;
  let originalOverflow: string | null = null;
  let afterClose: (() => void) | null = null;
  let closing = false;
  let sequence = 0;
  let presentation = 0;

  function readMarker(state: unknown): GuideMarker | null {
    if (!state || typeof state !== "object") return null;
    const value = (state as Record<string, unknown>)[HISTORY_KEY];
    if (!value || typeof value !== "object") return null;
    const marker = value as Record<string, unknown>;
    if (typeof marker.id !== "string" || (marker.os !== "mac" && marker.os !== "windows")) {
      return null;
    }
    return { id: marker.id, os: marker.os };
  }

  async function present(marker: GuideMarker, from: HTMLElement | null) {
    const request = ++presentation;
    activeId = marker.id;
    system = marker.os;
    opener = from;
    await tick();
    if (request !== presentation || dialog.open) return;
    originalOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    dialog.showModal();
  }

  function finishClose() {
    presentation += 1;
    if (dialog.open) dialog.close();
    if (originalOverflow !== null) {
      document.documentElement.style.overflow = originalOverflow;
      originalOverflow = null;
    }
    if (opener?.isConnected) opener.focus({ preventScroll: true });
    opener = null;
    activeId = null;
    closing = false;
    const next = afterClose;
    afterClose = null;
    next?.();
  }

  function requestClose(next?: () => void) {
    if (closing) return;
    closing = true;
    afterClose = next ?? null;
    if (readMarker(history.state)?.id === activeId) {
      history.back();
    } else {
      finishClose();
    }
  }

  function onDownload(event: MouseEvent) {
    if (event.defaultPrevented || event.button !== 0 || activeId !== null) return;
    const target = event.target;
    if (!(target instanceof Element)) return;
    const link = target.closest<HTMLAnchorElement>("a[data-download-guide]");
    const os = link?.dataset.downloadGuide;
    if (!link || (os !== "mac" && os !== "windows")) return;
    const marker: GuideMarker = { id: `${Date.now()}-${++sequence}`, os };
    try {
      const current = history.state;
      const previous = current && typeof current === "object" ? current : {};
      history.pushState({ ...previous, [HISTORY_KEY]: marker }, "", location.href);
    } catch {
      // The guide still opens when browser history is unavailable.
    }
    void present(marker, link);
  }

  function onPop(event: PopStateEvent) {
    const marker = readMarker(event.state);
    if (marker) void present(marker, null);
    else if (activeId !== null || dialog.open) finishClose();
  }

  function backdrop(event: MouseEvent) {
    if (event.target !== dialog) return;
    const box = dialog.getBoundingClientRect();
    if (
      event.clientX < box.left ||
      event.clientX > box.right ||
      event.clientY < box.top ||
      event.clientY > box.bottom
    ) {
      requestClose();
    }
  }

  function supportClick(event: MouseEvent) {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
      return;
    }
    event.preventDefault();
    requestClose(() => go("support"));
  }

  function trapFocus(event: KeyboardEvent) {
    if (event.key !== "Tab") return;
    const elements = Array.from(
      dialog.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    ).filter((element) => element.getClientRects().length > 0);
    const first = elements[0];
    const last = elements[elements.length - 1];
    if (!first || !last) return;
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  onMount(() => {
    document.addEventListener("click", onDownload);
    window.addEventListener("popstate", onPop);
    dialog.addEventListener("click", backdrop);
    dialog.addEventListener("keydown", trapFocus);
    const marker = readMarker(history.state);
    if (marker) void present(marker, null);
    return () => {
      document.removeEventListener("click", onDownload);
      window.removeEventListener("popstate", onPop);
      dialog.removeEventListener("click", backdrop);
      dialog.removeEventListener("keydown", trapFocus);
      if (dialog.open) dialog.close();
      if (originalOverflow !== null) document.documentElement.style.overflow = originalOverflow;
    };
  });
</script>

<dialog
  class="download-guide"
  bind:this={dialog}
  aria-modal="true"
  aria-labelledby="download-guide-title"
  aria-describedby="download-guide-description"
  oncancel={(event) => {
    event.preventDefault();
    requestClose();
  }}
>
  <div class="guide-bar">
    <div class="guide-platform">
      <span class="guide-platform-mark"><PlatformMark os={system} size={17} /></span>
      <span>{system === "mac" ? "macOS" : "Windows"} <i></i> First launch</span>
    </div>
    <button
      class="guide-close"
      type="button"
      aria-label="Close first-launch guide"
      onclick={() => requestClose()}
    >
      <X size={19} strokeWidth={1.7} aria-hidden="true" />
    </button>
  </div>

  <div class="guide-scroll">
    <div class="guide-intro">
      <p class="guide-kicker">Your download is starting</p>
      <h2 id="download-guide-title">
        A little {system === "mac" ? "Mac" : "Windows"} <span>heads-up.</span>
      </h2>
      <p id="download-guide-description">
        Thanks for giving Mareader a try. There’s just a little first-launch step to know about.
      </p>
    </div>

    {#if system === "mac"}
      <ol class="guide-steps">
        <li>
          <span class="guide-step-number" aria-hidden="true">01</span>
          <div>
            <h3>Install Mareader.</h3>
            <p>
              Open the download and drag Mareader into your Applications folder, or follow the
              installer prompts for a package.
            </p>
          </div>
        </li>
        <li>
          <span class="guide-step-number" aria-hidden="true">02</span>
          <div>
            <h3>If macOS raises a fuss.</h3>
            <p>
              If Apple can’t verify the app, try opening it, then choose <strong>Open Anyway</strong
              >
              in System Settings › Privacy &amp; Security, if offered.
            </p>
            <p>
              If macOS says it’s “damaged,” an unverified app can trigger that warning too. For a
              download you trust, open Terminal, paste this and press Return:
            </p>
            <div class="guide-command">
              <div class="guide-command-head">
                <span><Terminal size={14} aria-hidden="true" /> Terminal</span>
                <CopyButton text={COMMAND} item="command" />
              </div>
              <code>{COMMAND}</code>
            </div>
            <p class="guide-small">
              Open Mareader again. This clears its quarantine flag, not Gatekeeper for your whole
              Mac. The warning can also mean real damage, so only do this for a download you trust.
            </p>
          </div>
        </li>
      </ol>
    {:else}
      <ol class="guide-steps">
        <li>
          <span class="guide-step-number" aria-hidden="true">01</span>
          <div>
            <h3>Open the installer.</h3>
            <p>When the download finishes, open it and follow the setup prompts.</p>
          </div>
        </li>
        <li>
          <span class="guide-step-number" aria-hidden="true">02</span>
          <div>
            <h3>If Windows checks in.</h3>
            <p>
              SmartScreen may say “Windows protected your PC” because Mareader isn’t signed yet. If
              you trust the download, choose <strong>More info</strong>, then
              <strong>Run anyway</strong>. An unknown-publisher prompt may also ask you to confirm.
            </p>
          </div>
        </li>
      </ol>
    {/if}

    <div class="guide-maker">
      <p class="guide-maker-label">A note from the maker</p>
      {#if system === "mac"}
        <p>
          I’m making Mareader on my own and can’t afford Apple’s Developer ID yet, so Apple hasn’t
          notarized the app. If you’d like to help me get there,
          <a href={href("support")} onclick={supportClick}
            >a donation would mean a lot <ArrowUpRight size={13} aria-hidden="true" /></a
          >. No pressure, and thank you for being here.
        </p>
      {:else}
        <p>
          I’m making Mareader on my own, and the app isn’t signed yet. Support helps me keep it free
          and work toward signing. If you’d like to help,
          <a href={href("support")} onclick={supportClick}
            >a donation would mean a lot <ArrowUpRight size={13} aria-hidden="true" /></a
          >. No pressure, and thank you for being here.
        </p>
      {/if}
    </div>

    <div class="guide-actions">
      <button class="btn-primary guide-done" type="button" onclick={() => requestClose()}>
        Got it, thanks <ArrowRight size={16} aria-hidden="true" />
      </button>
      <span>You can close this anytime.</span>
    </div>
  </div>
</dialog>
