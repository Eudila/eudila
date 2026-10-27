// SPDX-License-Identifier: AGPL-3.0-only
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier/flat";

export default defineConfig([
  ...nextVitals,
  ...nextTypescript,
  prettier,
  { settings: { next: { rootDir: "app/" } } },
  {
    // Los scripts de herramientas de la landing son CommonJS.
    files: ["**/*.cjs"],
    rules: { "@typescript-eslint/no-require-imports": "off" },
  },
  globalIgnores([
    "**/.next/**",
    ".agents/**",
    "out/**",
    "build/**",
    "**/next-env.d.ts",
    "docs/**",
    "landing/dist/**",
    "landing/outputs/**",
    // Copias generadas del motor de la mascota (landing/scripts/sync-mascota.mjs).
    "landing/mascota.js",
    "landing/moods.js",
  ]),
]);
