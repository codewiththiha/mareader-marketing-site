// reveal action — fade in on scroll
export function reveal(node: HTMLElement) {
  const io = new IntersectionObserver(
    ([e]) => {
      if (e.isIntersecting) {
        node.classList.add("in");
        io.disconnect();
      }
    },
    { threshold: 0.15 }
  );
  io.observe(node);
  return {
    destroy() {
      io.disconnect();
    }
  };
}
