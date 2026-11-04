<script lang="ts">
  let { size = 20 }: { size?: number } = $props();
</script>

<svg
  width={size}
  height={size}
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="1.7"
  stroke-linecap="round"
  stroke-linejoin="round"
  aria-hidden="true"
>
  <rect x="2.9" y="4.6" width="18.2" height="14.8" rx="2.6" />
  <path d="m6.9 9.7 2.8 2.5-2.8 2.5" />
  <path d="M12.6 14.7h4.3" />
</svg>
