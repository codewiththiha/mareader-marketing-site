<script lang="ts">
  let { size = 18 }: { size?: number } = $props();
</script>

<svg
  width={size}
  height={size}
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <rect x="2.5" y="4.5" width="19" height="15" rx="4" />
  <path d="M6.5 16 9.25 8 12 16" />
  <path d="M7.6 13.2h3.3" />
  <path d="M16.5 8v8" />
  <path d="M15 8h3" />
  <path d="M15 16h3" />
</svg>
