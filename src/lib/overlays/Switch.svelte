<script lang="ts">
  import { styles } from "@/lib/style";

  let { on, focus }: { on: boolean; focus?: string } = $props();
</script>

<span
  data-focus={focus}
  class="relative inline-block shrink-0"
  style={styles({
    width: 32,
    height: 18,
    borderRadius: 9,
    background: on ? "var(--accent)" : "color-mix(in srgb, var(--line) 78%, var(--ink))",
  })}
>
  <span
    class="absolute top-[2px] block rounded-full"
    style={styles({
      width: 14,
      height: 14,
      left: on ? 16 : 2,
      background: on ? "var(--ink-on-accent)" : "var(--paper)",
      boxShadow: "0 1px 2px rgba(0,0,0,.25)",
      transition: "left 0.22s var(--ease-out-quint), background-color 0.3s",
    })}
  ></span>
</span>
