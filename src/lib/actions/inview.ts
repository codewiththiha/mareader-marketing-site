import type { Action } from "svelte/action";

export interface InViewParams {
	threshold: number;
	onchange: (visible: boolean) => void;
}

export const inView: Action<HTMLElement, InViewParams> = (node, params) => {
	let current = params;
	const io = new IntersectionObserver(([entry]) => current.onchange(entry.isIntersecting), {
		threshold: current.threshold
	});
	io.observe(node);
	return {
		update(next: InViewParams) {
			current = next;
		},
		destroy() {
			io.disconnect();
		}
	};
};
