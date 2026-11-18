/* What a frame is allowed to build: only the pieces that step actually shows. */
export interface Reach {
  panes: 1 | 2 | 3 | 4;
  sidebar: boolean;
  titlebar: boolean;
  popover: boolean;
  player: boolean;
  settings: boolean;
  card: boolean;
}

export const EVERYTHING: Reach = {
  panes: 4,
  sidebar: true,
  titlebar: true,
  popover: true,
  player: true,
  settings: true,
  card: true,
};

export const empty = (): Reach => ({ ...EVERYTHING, panes: 1, popover: false, player: false, settings: false, card: false });
