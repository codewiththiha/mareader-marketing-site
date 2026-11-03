<script lang="ts">
	let {
		value,
		hint,
		password = false,
		style = "",
		focus
	}: {
		value: string;
		hint?: string;
		password?: boolean;
		style?: string;
		focus?: string;
	} = $props();
</script>

<span
	data-focus={focus}
	class="inline-flex items-center truncate"
	style="height:26px;padding:0 8px;font-size:12px;border-radius:7px;background:var(--paper);border:1px solid var(--line);color:{value
		? 'var(--ink)'
		: 'var(--muted)'};letter-spacing:{password && value ? '0.12em' : 'normal'};{style}"
>
	{value ? (password ? "•".repeat(Math.min(28, value.length)) : value) : hint}
</span>
