// A looping millisecond clock driven by requestAnimationFrame.
export class Clock {
	t = $state(0);
	#raf = 0;
	#last = 0;
	#elapsed = 0;
	#duration: number;
	#hold: number;

	constructor(duration: number, hold = 900) {
		this.#duration = duration;
		this.#hold = hold;
	}

	start(): void {
		if (this.#raf) return;
		this.#last = performance.now();
		const tick = (now: number): void => {
			const dt = Math.min(64, now - this.#last);
			this.#last = now;
			this.#elapsed += dt;
			if (this.#elapsed > this.#duration + this.#hold) this.#elapsed = 0;
			this.t = this.#elapsed;
			this.#raf = requestAnimationFrame(tick);
		};
		this.#raf = requestAnimationFrame(tick);
	}

	stop(): void {
		if (!this.#raf) return;
		cancelAnimationFrame(this.#raf);
		this.#raf = 0;
	}
}
