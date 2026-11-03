import { fileURLToPath } from "node:url";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";

const src = fileURLToPath(new URL("./src/", import.meta.url));

export default defineConfig({
  plugins: [svelte(), tailwindcss(), viteSingleFile()],
  resolve: {
    alias: { "@": src },
  },
  build: {
    assetsInlineLimit: 1024 * 1024,
    cssMinify: true,
    target: "es2022",
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
