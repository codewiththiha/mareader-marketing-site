<script lang="ts">
  // Logo — app icon
  let { size = 28 }: { size?: number } = $props();
  const book =
    "M512 452 C490 400 420 368 266 366 Q252 366 252 380 L258 598 Q258 584 272 584 C420 586 490 622 512 672 Z";
  const gilt =
    "M512 468 C490 416 420 384 260 382 Q246 382 246 396 L252 614 Q252 600 266 600 C420 602 490 638 512 688 Z";
</script>

<svg viewBox="0 0 1024 1024" width={size} height={size} aria-hidden="true">
  <defs>
    <linearGradient id="lg-tile" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#303036" />
      <stop offset=".5" stop-color="#161619" />
      <stop offset="1" stop-color="#060607" />
    </linearGradient>
    <linearGradient id="lg-gilt" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#8E6A2E" />
      <stop offset=".3" stop-color="#E8CD8C" />
      <stop offset=".55" stop-color="#B98F45" />
      <stop offset=".8" stop-color="#F2DDA6" />
      <stop offset="1" stop-color="#9A7535" />
    </linearGradient>
    <linearGradient id="lg-ivory" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#FBF7EE" />
      <stop offset=".6" stop-color="#F3ECDF" />
      <stop offset=".92" stop-color="#E4D9C4" />
      <stop offset="1" stop-color="#CDBFA4" />
    </linearGradient>
  </defs>
  <rect x="100" y="100" width="824" height="824" rx="190" fill="url(#lg-tile)" />
  <rect
    x="101"
    y="101"
    width="822"
    height="822"
    rx="189"
    fill="none"
    stroke="#fff"
    stroke-opacity=".16"
    stroke-width="3"
  />
  <g transform="translate(512 580) scale(0.92) translate(-512 -580)">
    <path d={gilt} fill="url(#lg-gilt)" />
    <path d={gilt} fill="url(#lg-gilt)" transform="translate(1024 0) scale(-1 1)" />
    <path d="M548 600 L588 600 L588 806 L568 784 L548 806 Z" fill="#D9B968" />
    <path d={book} fill="url(#lg-ivory)" />
    <path d={book} fill="url(#lg-ivory)" transform="translate(1024 0) scale(-1 1)" />
  </g>
</svg>
