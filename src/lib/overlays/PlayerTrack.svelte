<script lang="ts">
  import { styles } from "@/lib/style";

  let { at, left, width }: { at: number; left: string; width: number } = $props();
</script>

<div class="flex items-center" style={styles({ gap: 8, width })}>
  <div class="relative flex-1" style={styles({ height: 4, borderRadius: 2, background: "var(--line)" })}>
    <div
      class="absolute inset-y-0 left-0"
      style={styles({ width: `${at * 100}%`, borderRadius: 2, background: "var(--accent)", transition: "width 0.3s linear" })}
    ></div>
  </div>
  <span class="tabular-nums" style={styles({ width: 66, fontSize: 12, color: "var(--muted)", textAlign: "right" })}>{left}</span>
</div>
