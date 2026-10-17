// shadcn lint — the official @shadcn/lint plugin, run through ESLint over src/**.
// 2026-10-17 (FAANG audit A-10): tools had no lint gate at all. Rule set and parser wiring
// follow the OIYO family (blog/eslint.config.mjs) and Codex's in-flight
// codex/labor-accuracy-20261017 draft of this file (credited; that branch is not merged).
//
//   npm run lint:shadcn        check (also part of `npm run lint` and CI)
//   npm run lint:shadcn:prune  drop baseline entries for findings you fixed
//
// Findings that existed when the gate was added (2026-10-17) are recorded per file and rule in
// eslint-suppressions.json, so CI fails only on NEW violations. Fix new findings;
// never re-baseline with --suppress-all / --suppress-rule to make the gate pass.
import { plugin as shadcn } from "@shadcn/lint";
import tsParser from "@typescript-eslint/parser";
import * as astroParser from "astro-eslint-parser";
import { defineConfig } from "eslint/config";

const shadcnRules = {
  "shadcn/no-restyle": ["error", { allow: ["layout"] }],
  "shadcn/no-raw-colors": "error",
  "shadcn/no-arbitrary-values": "error",
  "shadcn/no-inline-styles": "error",
  "shadcn/no-unknown-classes": "error",
  "shadcn/require-static-classes": "error",
};

export default defineConfig([
  { ignores: ["dist/**", ".astro/**", "node_modules/**", "public/**"] },
  {
    files: ["src/**/*.{js,mjs,jsx,ts,tsx}"],
    languageOptions: { parser: tsParser },
    plugins: { shadcn },
    rules: shadcnRules,
  },
  {
    files: ["src/**/*.astro"],
    languageOptions: {
      parser: astroParser,
      parserOptions: { parser: tsParser, extraFileExtensions: [".astro"] },
    },
    plugins: { shadcn },
    rules: shadcnRules,
  },
]);
