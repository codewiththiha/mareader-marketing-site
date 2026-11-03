<script lang="ts">
  // Markdown — release notes, sanitised before they touch the DOM
  import { marked } from "marked";
  import DOMPurify from "dompurify";

  let { source, className = "" }: { source: string; className?: string } = $props();

  marked.use({ gfm: true, breaks: false });
  let html = $derived(DOMPurify.sanitize(marked.parse(source, { async: false }) as string));
</script>

<div class="notes {className}">{@html html}</div>
