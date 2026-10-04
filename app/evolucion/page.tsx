// SPDX-License-Identifier: AGPL-3.0-only
import { EvolutionView } from "../analisis/views";
import { normalizeRange } from "../analisis/data";

export const metadata = { title: "Evolución · eudila" };

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ rango?: string | string[] }>;
}) {
  return <EvolutionView range={normalizeRange((await searchParams).rango)} />;
}
