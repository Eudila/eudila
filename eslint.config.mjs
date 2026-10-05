// SPDX-License-Identifier: AGPL-3.0-only
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier/flat";

export default defineConfig([
  ...nextVitals,
  ...nextTypescript,
  prettier,
  globalIgnores([
    ".next/**",
    ".agents/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "prototype/**",
  ]),
]);
