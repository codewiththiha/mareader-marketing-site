import js from "@eslint/js";
import globals from "globals";
import svelte from "eslint-plugin-svelte";
import svelteParser from "svelte-eslint-parser";
import * as tsParser from "@typescript-eslint/parser";
import tseslint from "typescript-eslint";

export default tseslint.config(
	{ ignores: ["dist/**", "node_modules/**", "tools/visual/baseline/**", "shots/**", "*.png"] },
	js.configs.recommended,
	tseslint.configs.strict,
	svelte.configs["flat/recommended"],
	svelte.configs["flat/prettier"],
	{
		files: ["**/*.svelte"],
		languageOptions: {
			parser: svelteParser,
			parserOptions: {
				parser: tsParser,
				extraFileExtensions: [".svelte"]
			}
		}
	},
	{
		languageOptions: {
			globals: {
				...globals.browser,
				...globals.node
			}
		}
	},
	{
		files: ["**/*.svelte.ts"],
		languageOptions: {
			parser: tsParser
		}
	},
	{
		rules: {
			"@typescript-eslint/consistent-type-imports": "error",
			"@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
			"svelte/prefer-svelte-reactivity": "error",
			"no-console": "error",
			"no-empty": ["error", { allowEmptyCatch: true }]
		}
	},
	{
		files: ["tools/**/*.mjs"],
		rules: {
			"no-console": "off"
		}
	},
	{
		files: ["src/components/mock/settings/ProviderLogo.svelte"],
		rules: {
			"svelte/no-at-html-tags": "off"
		}
	},
	{
		files: ["src/components/scenes/ReadAloudScene.svelte"],
		rules: {
			"svelte/no-useless-mustaches": "off",
			"svelte/no-useless-children-snippet": "off"
		}
	}
);
