// theme store — single source for dark mode
let dark = $state(false);
let initialized = $state(false);

export function useTheme() {
  function init() {
    if (initialized) return;
    try {
      const saved = localStorage.getItem("mareader-theme");
      if (saved) dark = saved === "dark";
      else dark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    } catch {
      // storage refused: the media query stands
    }
    initialized = true;
  }

  function toggle() {
    dark = !dark;
  }

  return {
    get dark() {
      return dark;
    },
    get initialized() {
      return initialized;
    },
    init,
    toggle,
    set(v: boolean) {
      dark = v;
    }
  };
}

export function applyThemeClass(isDark: boolean) {
  document.documentElement.classList.toggle("dark", isDark);
  try {
    localStorage.setItem("mareader-theme", isDark ? "dark" : "light");
  } catch {
    // storage refused: the theme lives for this page only
  }
}
