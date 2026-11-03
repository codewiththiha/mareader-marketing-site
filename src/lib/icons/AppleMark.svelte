<script lang="ts">
	import { Apple } from "lucide-svelte";

	let { size = 16, class: cls = "" }: { size?: number | string; class?: string } = $props();
</script>

<Apple {size} class={cls} />
