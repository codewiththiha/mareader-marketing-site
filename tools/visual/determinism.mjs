// Freezes time, rAF and CSS motion so both apps tick frame-for-frame on the same clock.
export const INIT = ({ theme }) => {
  if (typeof localStorage !== "undefined") localStorage.setItem("mareader-site-theme", theme);
  let virtual = 0;
  const original = performance.now.bind(performance);
  performance.now = () => virtual;
  original();
  const pending = new Map();
  let handle = 0;
  window.requestAnimationFrame = (cb) => {
    handle += 1;
    pending.set(handle, cb);
    return handle;
  };
  window.cancelAnimationFrame = (id) => {
    pending.delete(id);
  };
  window.__advance = (step) => {
    const due = [...pending.entries()];
    pending.clear();
    virtual += step;
    for (const [, cb] of due) cb(virtual);
    return due.length;
  };
  window.__settle = () => new Promise((resolve) => setTimeout(resolve, 900));
};

export const SNAP = () => {
  window.scrollTo(0, Math.round(window.scrollY));
  for (const el of document.querySelectorAll("*")) {
    if (el === document.scrollingElement || el === document.body) continue;
    if (el.scrollTop !== 0) el.scrollTop = 0;
    if (el.scrollLeft !== 0) el.scrollLeft = 0;
  }
};

export const FREEZE = () => {
  const css = "*,*::before,*::after{transition:none !important;animation:none !important}html{overflow-anchor:none}";
  const style = document.createElement("style");
  style.textContent = css;
  document.head.appendChild(style);
  const root = document.documentElement;
  root.style.setProperty("scroll-behavior", "auto");
  const snapped = Math.round(window.scrollY);
  if (Math.abs(window.scrollY - snapped) > 0.01) window.scrollTo(0, snapped);
};
