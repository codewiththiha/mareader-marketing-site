/** Moves a node to <body> so fixed overlays escape animated route wrappers. */
export function portal(node: HTMLElement) {
  document.body.appendChild(node);
  return {
    destroy: () => {
      node.remove();
    },
  };
}
