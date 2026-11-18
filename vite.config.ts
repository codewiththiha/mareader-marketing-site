import path from "node:path";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, type Plugin } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";

const criticalFont: Plugin = {
  name: "mareader-critical-font",
  transformIndexHtml: {
    order: "pre",
    handler: () => [
      {
        tag: "link",
        attrs: { rel: "preload", as: "font", type: "font/woff2", href: "/src/assets/fonts/Literata.woff2", crossorigin: true },
        injectTo: "head",
      },
    ],
  },
};

export default defineConfig(({ mode }) => ({
  base: "./",
  plugins: [svelte(), tailwindcss(), mode === "portable" ? viteSingleFile() : criticalFont],
  resolve: {
    alias: {
      $lib: path.resolve("src/lib"),
    },
  },
  build: {
    target: "es2022",
    assetsInlineLimit: mode === "portable" ? undefined : 4096,
  },
  server: {
    host: true,
    allowedHosts: true,
  },
  preview: {
    host: true,
    allowedHosts: true,
  },
}));
