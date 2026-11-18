import path from "node:path";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, type Plugin } from "vite";

function preloadHeroFonts(): Plugin {
  return {
    name: "preload-hero-fonts",
    enforce: "post",
    transformIndexHtml(html, ctx) {
      if (!ctx.bundle) return html;
      const tags = Object.keys(ctx.bundle)
        .filter((name) => /(Literata-|Inter-Regular-).*\.woff2$/.test(name))
        .map((href) => ({
          tag: "link",
          attrs: { rel: "preload", as: "font", type: "font/woff2", href: `./${href}`, crossorigin: "" },
          injectTo: "head" as const,
        }));
      return tags;
    },
  };
}

export default defineConfig({
  base: "./",
  plugins: [svelte(), tailwindcss(), preloadHeroFonts()],
  resolve: {
    alias: {
      $lib: path.resolve("src/lib"),
    },
  },
  build: {
    target: "es2022",
    assetsInlineLimit: 2048,
    cssCodeSplit: true,
  },
  server: {
    host: true,
    allowedHosts: true,
  },
  preview: {
    host: true,
    allowedHosts: true,
  },
});
