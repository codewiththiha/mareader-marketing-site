/** A highlight that slides between the buttons of a group as you move across them. */
export interface SlideRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export function slideGroup() {
  let rect = $state<SlideRect | null>(null);
  let shown = $state(false);
  return {
    get rect() {
      return rect;
    },
    get shown() {
      return shown;
    },
    move(el: HTMLElement | null) {
      if (!el) {
        shown = false;
        return;
      }
      rect = { x: el.offsetLeft, y: el.offsetTop, w: el.offsetWidth, h: el.offsetHeight };
      shown = true;
    },
    rest() {
      shown = rect !== null;
    },
  };
}

export type SlideGroup = ReturnType<typeof slideGroup>;
