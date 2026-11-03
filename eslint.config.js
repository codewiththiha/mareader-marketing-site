// eslint flat config — svelte 5 + ts, formatting left to prettier
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import svelte from "eslint-plugin-svelte";
import globals from "globals";
import prettier from "eslint-config-prettier";

export default tseslint.config(
  {
    ignores: [
      "dist",
      "node_modules",
      "screenshots",
      "test-results",
      "playwright-report",
      "src/lib/releases/data.ts"
    ]
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...svelte.configs.recommended,
  {
    languageOptions: {
      globals: { ...globals.browser }
    }
  },
  {
    files: ["**/*.svelte", "**/*.svelte.ts"],
    languageOptions: {
      parserOptions: { parser: tseslint.parser },
      globals: { ...globals.browser }
    }
  },
  {
    files: ["vite.config.ts", "eslint.config.js", "playwright.config.ts", "tests/**", "scripts/**"],
    languageOptions: {
      globals: { ...globals.node }
    }
  },
  {
    // release notes are sanitised with dompurify before they reach @html
    files: ["src/lib/components/Markdown.svelte"],
    rules: { "svelte/no-at-html-tags": "off" }
  },
  {
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }
      ],
      "@typescript-eslint/no-explicit-any": "warn",
      "no-console": ["warn", { allow: ["warn", "error"] }]
    }
  },
  prettier
);
