// mount helpers — svelte idiom for enter/leave
export function createMount(open: () => boolean, ms = 360) {
  let mounted = $state(false);
  let show = $state(false);
  let timer: ReturnType<typeof setTimeout> | undefined;

  $effect(() => {
    const isOpen = open();
    if (isOpen) {
      mounted = true;
      clearTimeout(timer);
      requestAnimationFrame(() => requestAnimationFrame(() => (show = true)));
    } else {
      show = false;
      timer = setTimeout(() => (mounted = false), ms);
    }
    return () => clearTimeout(timer);
  });

  return {
    get mounted() { return mounted; },
    get show() { return show; }
  };
}
