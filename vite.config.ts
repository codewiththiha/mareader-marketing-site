import path from "node:path";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";

export default defineConfig({
	plugins: [svelte(), tailwindcss(), viteSingleFile()],
	resolve: {
		alias: {
			$lib: path.resolve(import.meta.dirname, "src/lib"),
			$components: path.resolve(import.meta.dirname, "src/components")
		}
	}
});
