<script lang="ts">
	import icon from "$lib/assets/icon.png";
	import { REPO } from "$lib/links";
</script>

<footer
	class="mx-auto flex max-w-6xl flex-col gap-3 px-5 pt-4 pb-12 text-[13px] text-muted sm:flex-row sm:items-center sm:px-8"
>
	<div class="flex items-center gap-2">
		<img src={icon} alt="" width={18} height={18} class="rounded-[5px]" />
		<span>Mareader</span>
	</div>
	<span class="sm:ml-auto">
		MIT licence ·
		<a href={REPO} class="hover:text-ink" target="_blank" rel="noreferrer">github.com/codewiththiha/mareader2</a>
	</span>
</footer>
