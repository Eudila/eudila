// SPDX-License-Identifier: AGPL-3.0-only
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const config = {
  output: process.env.EUDILA_STANDALONE === "true" ? "standalone" : undefined,
  outputFileTracingRoot: root,
  turbopack: { root },
};

export default config;
