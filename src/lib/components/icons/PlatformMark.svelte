<script lang="ts">
  // PlatformMark — apple, four panes and a waddling tux
  let { os, size = 18 }: { os: "mac" | "windows" | "linux"; size?: number } = $props();
  const apple =
    "M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-1.333 2.335-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701";
</script>

{#if os === "mac"}
  <svg class="pm pm-apple" viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
    <path d={apple} fill="currentColor"></path>
  </svg>
{:else if os === "windows"}
  <svg class="pm pm-win" viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
    <g fill="currentColor">
      <rect class="wp" x="3" y="3" width="7.9" height="7.9" rx="1.2"></rect>
      <rect class="wp" x="13.1" y="3" width="7.9" height="7.9" rx="1.2"></rect>
      <rect class="wp" x="3" y="13.1" width="7.9" height="7.9" rx="1.2"></rect>
      <rect class="wp" x="13.1" y="13.1" width="7.9" height="7.9" rx="1.2"></rect>
    </g>
  </svg>
{:else}
  <svg class="pm pm-tux" viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
    <path
      d="M12 2.1c-3.4 0-5.7 2.7-5.7 6.6 0 1.6-.3 2.6-1 3.9-.8 1.6-1.5 2.9-1.5 4.7 0 2.6 3.4 4.5 8.2 4.5s8.2-1.9 8.2-4.5c0-1.8-.7-3.1-1.5-4.7-.7-1.3-1-2.3-1-3.9 0-3.9-2.3-6.6-5.7-6.6Z"
      fill="var(--fg)"
    ></path>
    <path
      d="M12 9.4c-2 0-3.3 1.8-3.3 4.2 0 2.4 1.4 5.5 3.3 5.5s3.3-3.1 3.3-5.5c0-2.4-1.3-4.2-3.3-4.2Z"
      fill="var(--bg)"
    ></path>
    <circle cx="10.1" cy="7" r="1.1" fill="var(--bg)"></circle>
    <circle cx="13.9" cy="7" r="1.1" fill="var(--bg)"></circle>
    <circle cx="10.35" cy="7.15" r="0.46" fill="var(--fg)"></circle>
    <circle cx="13.65" cy="7.15" r="0.46" fill="var(--fg)"></circle>
    <path d="M12 8.1 14 9.35 12 10.6 10 9.35Z" fill="var(--gold)"></path>
    <ellipse cx="9.1" cy="21.7" rx="2" ry="0.8" fill="var(--gold)"></ellipse>
    <ellipse cx="14.9" cy="21.7" rx="2" ry="0.8" fill="var(--gold)"></ellipse>
  </svg>
{/if}
