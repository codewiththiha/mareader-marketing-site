<script lang="ts">
	import qrcode from "qrcode-generator";

	let { value, size = 168, title = "Address QR code" }: { value: string; size?: number; title?: string } = $props();

	const quiet = 4;
	const model = $derived.by(() => {
		const qr = qrcode(0, "M");
		qr.addData(value);
		qr.make();
		return qr;
	});
	const count = $derived(model.getModuleCount());
	const total = $derived(count + quiet * 2);
	const eyes = $derived([
		[quiet, quiet],
		[quiet + count - 7, quiet],
		[quiet, quiet + count - 7]
	]);
	const inEye = (r: number, c: number): boolean =>
		(r < 7 && c < 7) || (r < 7 && c >= count - 7) || (r >= count - 7 && c < 7);
</script>

<svg
	width={size}
	height={size}
	viewBox="0 0 {total} {total}"
	role="img"
	aria-label={title}
	class="text-ink"
	style="shape-rendering:geometricPrecision"
>
	{#each { length: count } as _, r (r)}
		{#each { length: count } as _, c (c)}
			{#if model.isDark(r, c) && !inEye(r, c)}
				<rect x={c + quiet} y={r + quiet} width="1.06" height="1.06" rx="0.34" fill="currentColor" />
			{/if}
		{/each}
	{/each}
	{#each eyes as [x, y] (`${x}-${y}`)}
		<rect
			x={x + 0.4}
			y={y + 0.4}
			width="6.2"
			height="6.2"
			rx="1.9"
			fill="none"
			stroke="currentColor"
			stroke-width="1.05"
		/>
		<rect x={x + 2} y={y + 2} width="3" height="3" rx="0.95" fill="currentColor" />
	{/each}
</svg>
