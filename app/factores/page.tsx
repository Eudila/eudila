// SPDX-License-Identifier: AGPL-3.0-only
import { FactorsView } from "../analisis/views";
import { normalizeRange } from "../analisis/data";

export const metadata = { title: "Factores de vida · eudila" };

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ rango?: string | string[] }>;
}) {
  return <FactorsView range={normalizeRange((await searchParams).rango)} />;
}
