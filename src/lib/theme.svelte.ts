const STORAGE_KEY = "mareader-site-theme";

let dark = $state(document.documentElement.classList.contains("dark"));

export const theme = {
  get dark(): boolean {
    return dark;
  },
  toggle(): void {
    dark = !dark;
    document.documentElement.classList.toggle("dark", dark);
    try {
      localStorage.setItem(STORAGE_KEY, dark ? "dark" : "light");
    } catch {}
  },
};
