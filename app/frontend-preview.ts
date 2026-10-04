// SPDX-License-Identifier: AGPL-3.0-only
import catalog from "../data/catalogo-v1.json";

export const previewEnabled =
  process.env.NEXT_PUBLIC_FRONTEND_PREVIEW === "true";
export const previewEmotions = catalog.emociones;
export const previewFactors = catalog.factores_vida;
