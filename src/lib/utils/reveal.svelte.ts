/** Fades a section in the first time it reaches the reader. */
export function reveal(el: HTMLElement) {
  el.classList.add("rv");
  let io: IntersectionObserver | null = null;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    el.classList.add("rv-in");
  } else {
    io = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;
        el.classList.add("rv-in");
        io?.disconnect();
      },
      { threshold: 0.1, rootMargin: "0px 0px -6% 0px" },
    );
    io.observe(el);
  }
  return {
    destroy() {
      io?.disconnect();
    },
  };
}
