/** A highlight that slides between the buttons of a group as you move across them. */
export function slideGroup() {
  let el = $state<HTMLElement | null>(null);
  let shown = $state(false);
  return {
    get el() {
      return el;
    },
    get shown() {
      return shown;
    },
    move(node: HTMLElement | null | undefined) {
      const next = node?.isConnected ? node : null;
      el = next;
      shown = next !== null;
    },
    rest() {
      shown = el !== null;
    },
  };
}

export type SlideGroup = ReturnType<typeof slideGroup>;
