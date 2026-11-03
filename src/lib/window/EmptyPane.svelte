<script lang="ts">
  import { BookOpen } from "@lucide/svelte";
  import { styles } from "@/lib/style";
</script>

<div class="absolute inset-0 flex flex-col items-center justify-center" style={styles({ color: "var(--muted)" })}>
  <BookOpen size={28} strokeWidth={1.75} />
  <div style={styles({ marginTop: 10, fontSize: 14, fontWeight: 500, color: "var(--ink)" })}>Open a book</div>
  <div style={styles({ marginTop: 4, fontSize: 12 })}>Drop a PDF, EPUB, Markdown or text file here</div>
</div>
