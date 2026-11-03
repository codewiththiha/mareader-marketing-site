import js from "@eslint/js";
import prettier from "eslint-config-prettier";
import svelte from "eslint-plugin-svelte";
import globals from "globals";
import * as tseslint from "typescript-eslint";

const parserOptions = {
  projectService: true,
  tsconfigRootDir: import.meta.dirname,
  extraFileExtensions: [".svelte"],
  parser: tseslint.parser,
};

export default tseslint.config(
  {
    ignores: ["dist/", "coverage/", "node_modules/", "evidence/", "tools/reference/", "shots/", ".svelte-kit/"],
  },
  js.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  ...svelte.configs["flat/recommended"],
  ...svelte.configs["flat/prettier"],
  prettier,
  {
    files: ["**/*.{ts,svelte}"],
    languageOptions: {
      globals: { ...globals.browser },
      parserOptions,
    },
    rules: {
      "@typescript-eslint/consistent-type-imports": ["error", { prefer: "type-imports", fixStyle: "inline-type-imports" }],
      "@typescript-eslint/restrict-template-expressions": ["error", { allowNumber: true, allowNullish: false }],
      "@typescript-eslint/no-unnecessary-condition": "off",
      "@typescript-eslint/no-deprecated": "off",
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_", varsIgnorePattern: "^_", caughtErrorsIgnorePattern: "^_" }],
      "no-empty": ["error", { allowEmptyCatch: true }],
    },
  },
  {
    files: ["**/*.svelte"],
    rules: {
      "svelte/no-at-html-tags": "off",
      "svelte/require-each-key": "error",
      "svelte/valid-each-key": "error",
    },
  },
  {
    files: ["tools/**/*.mjs", "**/*.js"],
    extends: [tseslint.configs.disableTypeChecked],
    languageOptions: { globals: { ...globals.node, ...globals.browser } },
    rules: {
      "no-console": "off",
    },
  },
);
