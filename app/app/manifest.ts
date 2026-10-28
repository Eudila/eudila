// SPDX-License-Identifier: AGPL-3.0-only
import type { MetadataRoute } from "next";

// Icons: mascot Muy agradable at 64% on the Aurora canvas (mascota README, VIS-17).
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "eudila",
    short_name: "eudila",
    description: "Un momento para registrar lo que sentís, a tu manera.",
    lang: "es",
    start_url: "/",
    display: "standalone",
    background_color: "#F6F4FA",
    theme_color: "#F6F4FA",
    icons: [
      {
        src: "/brand/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/brand/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/brand/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
