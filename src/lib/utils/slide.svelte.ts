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
      el = node?.isConnected ? node : null;
      shown = el !== null;
    },
    rest() {
      shown = el !== null;
    },
  };
}

export type SlideGroup = ReturnType<typeof slideGroup>;
