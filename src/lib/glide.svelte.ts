// One highlight rectangle that travels between registered items.
import { SvelteMap } from "svelte/reactivity";
export class Glide {
	#els = new SvelteMap<string, HTMLElement>();
	pinned = $state<string | null>(null);
	hovered = $state<string | null>(null);

	constructor(pinned: string | null = null) {
		this.pinned = pinned;
	}

	style = $derived.by(() => {
		const id = this.hovered ?? this.pinned;
		const el = id ? this.#els.get(id) : undefined;
		if (!el) return "opacity:0";
		return `left:${el.offsetLeft}px;top:${el.offsetTop}px;width:${el.offsetWidth}px;height:${el.offsetHeight}px;opacity:1`;
	});

	item(el: HTMLElement, id: string) {
		this.#els.set(id, el);
		return {
			destroy: () => {
				this.#els.delete(id);
			}
		};
	}

	enter(id: string): void {
		this.hovered = id;
	}

	leave(): void {
		this.hovered = null;
	}

	pin(id: string | null): void {
		this.pinned = id;
	}
}
